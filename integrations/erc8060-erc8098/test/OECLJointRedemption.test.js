const { expect } = require("chai");
const { ethers } = require("hardhat");
const fs = require("fs");
const crypto = require("crypto");
const path = require("path");

describe("OECL real-EVM joint execution: ERC-8060 and experimental ERC-8098-style fixture", function () {
  async function setup() {
    const [deployer, alice, attacker] = await ethers.getSigners();
    const nft = await (await ethers.getContractFactory("ERC8060Reference")).deploy();
    await nft.deployed();
    const units = ethers.utils.parseEther("1");
    const token = await (await ethers.getContractFactory("ERC8098Experimental")).deploy(
      ethers.utils.parseEther("100")
    );
    await token.deployed();
    const joint = await (await ethers.getContractFactory("OECLJointRedemption")).deploy(
      nft.address, token.address, units
    );
    await joint.deployed();
    await (await token.transfer(alice.address, units)).wait();
    const mint = await (await nft.connect(alice).mint("ipfs://oecl-1", {
      value: ethers.utils.parseEther("0.12")
    })).wait();
    return { deployer, alice, attacker, nft, token, joint, units, mint };
  }
  async function mustRevert(promise) {
    let reverted = false;
    try { await promise; } catch (_) { reverted = true; }
    expect(reverted).to.equal(true);
  }

  it("performs one atomic interaction and preserves the accounting and monotone supply invariants", async function () {
    const { alice, nft, token, joint, units, mint } = await setup();
    const [valueBefore] = await nft.functions["valueOf(uint256)"](1);
    const backingBefore = await ethers.provider.getBalance(nft.address);
    const totalBefore = await token.totalSupply();
    expect(backingBefore.gte(await nft.totalRedeemableValue())).to.equal(true);
    expect(valueBefore.eq(ethers.utils.parseEther("0.1"))).to.equal(true);
    await (await nft.connect(alice).approve(joint.address, 1)).wait();
    await (await token.connect(alice).approve(joint.address, units)).wait();
    const receipt = await (await joint.connect(alice).redeem(1)).wait();
    const totalAfter = await token.totalSupply();
    const nftReserveAfter = await nft.totalRedeemableValue();
    const nftBalanceAfter = await ethers.provider.getBalance(nft.address);
    expect(totalAfter.eq(totalBefore.sub(units))).to.equal(true);
    expect(nftReserveAfter.eq(0)).to.equal(true);
    expect(nftBalanceAfter.gte(nftReserveAfter)).to.equal(true);
    expect(nftBalanceAfter.eq(backingBefore.sub(valueBefore))).to.equal(true);
    expect((await ethers.provider.getBalance(joint.address)).eq(0)).to.equal(true);
    expect((await token.balanceOf(joint.address)).eq(0)).to.equal(true);
    await mustRevert(nft.ownerOf(1));
    await mustRevert(joint.connect(alice).redeem(1));
    await mustRevert(nft.connect(alice).burn(1));
    const event = receipt.events.find(event => event.event === "JointRedeemed");
    expect(event.args.ethPaid.eq(valueBefore)).to.equal(true);
    expect(event.args.unitsBurned.eq(units)).to.equal(true);

    const artifacts = {
      classification: "LOCAL_REAL_EVM_EXPERIMENT_WITH_EXPERIMENTAL_8098_FIXTURE",
      claimedGlobalCompatibility: false,
      erc8060Repository: "ten-io-meta/erc8060-native-eth-value",
      erc8060PinnedRevision: "c7eed906835ab39fbc8439eb0493e5a5371b23a2",
      oeclCommit: process.env.GITHUB_SHA || null,
      erc8098Status: "EXPERIMENTAL_FIXTURE_NOT_EXTERNAL_REFERENCE",
      erc8098FixtureSha256: crypto.createHash("sha256")
        .update(fs.readFileSync(path.join(__dirname, "../contracts/ERC8098Experimental.sol"))).digest("hex"),
      chainId: (await ethers.provider.getNetwork()).chainId,
      contracts: { nft: nft.address, monotoneSupply: token.address, joint: joint.address },
      transactions: { mint: mint.transactionHash, jointRedemption: receipt.transactionHash },
      observations: {
        sameTransactionContainsBothBurns: true,
        nftSolventAfter: nftBalanceAfter.gte(nftReserveAfter),
        nftObligationAfter: nftReserveAfter.toString(),
        erc20SupplyBefore: totalBefore.toString(),
        erc20SupplyAfter: totalAfter.toString(),
        supplyDecrease: totalBefore.sub(totalAfter).toString(),
        doubleRedeemRejected: true
      }
    };
    if (process.env.OECL_JOINT_EVIDENCE_PATH) {
      fs.mkdirSync(path.dirname(process.env.OECL_JOINT_EVIDENCE_PATH), { recursive: true });
      fs.writeFileSync(process.env.OECL_JOINT_EVIDENCE_PATH, JSON.stringify(artifacts, null, 2));
    }
    console.log("OECL_LOCAL_JOINT_EVIDENCE:" + JSON.stringify(artifacts));
  });

  it("rejects unauthorized redemption and leaves both protocols unchanged", async function () {
    const { alice, attacker, nft, token, joint } = await setup();
    const supply = await token.totalSupply();
    const obligations = await nft.totalRedeemableValue();
    await mustRevert(joint.connect(attacker).redeem(1));
    expect(await nft.ownerOf(1)).to.equal(alice.address);
    expect((await nft.totalRedeemableValue()).eq(obligations)).to.equal(true);
    expect((await token.totalSupply()).eq(supply)).to.equal(true);
  });

  it("reverts atomically when the ERC-20 allowance is missing", async function () {
    const { alice, nft, token, joint } = await setup();
    const supply = await token.totalSupply();
    const obligations = await nft.totalRedeemableValue();
    await (await nft.connect(alice).approve(joint.address, 1)).wait();
    await mustRevert(joint.connect(alice).redeem(1));
    expect(await nft.ownerOf(1)).to.equal(alice.address);
    expect((await token.totalSupply()).eq(supply)).to.equal(true);
    expect((await nft.totalRedeemableValue()).eq(obligations)).to.equal(true);
  });
});
