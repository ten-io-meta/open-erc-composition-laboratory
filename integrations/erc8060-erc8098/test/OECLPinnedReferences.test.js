const { expect } = require("chai");
const { ethers } = require("hardhat");
const fs = require("fs");
const crypto = require("crypto");
const path = require("path");

describe("OECL real-EVM joint execution: ERC-8060 and pinned external ERC-8098 reference", function () {
  async function setup() {
    const [deployer, alice, attacker] = await ethers.getSigners();
    const nft = await (await ethers.getContractFactory("ERC8060Reference")).deploy();
    await nft.deployed();
    const units = ethers.utils.parseEther("1");
    const token = await (await ethers.getContractFactory("ERC8098Reference")).deploy(
      "OECL ERC8098 Reference", "OECL8098", ethers.utils.parseEther("100"), deployer.address
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
    const jointBalanceBefore = await ethers.provider.getBalance(joint.address);
    const totalBefore = await token.totalSupply();
    expect(backingBefore.gte(await nft.totalRedeemableValue())).to.equal(true);
    expect(valueBefore.eq(ethers.utils.parseEther("0.1"))).to.equal(true);
    await (await nft.connect(alice).approve(joint.address, 1)).wait();
    await (await token.connect(alice).approve(joint.address, units)).wait();
    const aliceBalanceBefore = await ethers.provider.getBalance(alice.address);
    const receipt = await (await joint.connect(alice).redeem(1)).wait();
    const executionTx = await ethers.provider.getTransaction(receipt.transactionHash);
    const paidGas = receipt.gasUsed.mul(receipt.effectiveGasPrice || executionTx.gasPrice);
    const aliceBalanceAfter = await ethers.provider.getBalance(alice.address);
    expect(aliceBalanceAfter.add(paidGas).sub(aliceBalanceBefore).eq(valueBefore)).to.equal(true);
    const totalAfter = await token.totalSupply();
    const nftReserveAfter = await nft.totalRedeemableValue();
    const nftBalanceAfter = await ethers.provider.getBalance(nft.address);
    expect(totalAfter.eq(totalBefore.sub(units))).to.equal(true);
    expect(nftReserveAfter.eq(0)).to.equal(true);
    expect(nftBalanceAfter.gte(nftReserveAfter)).to.equal(true);
    expect(nftBalanceAfter.eq(backingBefore.sub(valueBefore))).to.equal(true);
    expect((await ethers.provider.getBalance(joint.address)).eq(jointBalanceBefore)).to.equal(true);
    expect((await token.balanceOf(joint.address)).eq(0)).to.equal(true);
    await mustRevert(nft.ownerOf(1));
    await mustRevert(joint.connect(alice).redeem(1));
    await mustRevert(nft.connect(alice).burn(1));
    // Observe both independent burn events in the exact same transaction receipt.
    const nftBurnTopic = nft.interface.getEventTopic("Burned");
    const tokenTransferTopic = token.interface.getEventTopic("Transfer");
    const nftBurnLogs = receipt.logs.filter(log =>
      log.address.toLowerCase() === nft.address.toLowerCase() &&
      log.topics[0] === nftBurnTopic
    );
    const erc20BurnLogs = receipt.logs.filter(log => {
      if (log.address.toLowerCase() !== token.address.toLowerCase() ||
          log.topics[0] !== tokenTransferTopic) return false;
      const parsed = token.interface.parseLog(log);
      return parsed.args.from.toLowerCase() === joint.address.toLowerCase() &&
        parsed.args.to === ethers.constants.AddressZero &&
        parsed.args.value.eq(units);
    });
    expect(receipt.status).to.equal(1);
    expect(nftBurnLogs.length).to.equal(1);
    expect(erc20BurnLogs.length).to.equal(1);
    const event = receipt.events.find(event => event.event === "JointRedeemed");
    expect(event.args.ethPaid.eq(valueBefore)).to.equal(true);
    expect(event.args.unitsBurned.eq(units)).to.equal(true);

    const artifacts = {
      classification: "LOCAL_REAL_EVM_TWO_PINNED_REFERENCE_REPOSITORIES",
      claimedGlobalCompatibility: false,
      erc8060Repository: "ten-io-meta/erc8060-native-eth-value",
      erc8060PinnedRevision: "c7eed906835ab39fbc8439eb0493e5a5371b23a2",
      oeclCommit: process.env.GITHUB_SHA || null,
      erc8098Status: "AUTHOR_MAINTAINED_PINNED_REFERENCE_CANDIDATE",
      erc8098Repository: "ten-io-meta/erc8098-reference",
      erc8098PinnedRevision: "68a05289bd68d89db8453c49500e0a1ae6cd11ec",
      erc8098SourceSha256: crypto.createHash("sha256")
        .update(fs.readFileSync(path.join(__dirname, "../contracts/ERC8098Reference.sol"))).digest("hex"),
      chainId: (await ethers.provider.getNetwork()).chainId,
      contracts: { nft: nft.address, monotoneSupply: token.address, joint: joint.address },
      transactions: { mint: mint.transactionHash, jointRedemption: receipt.transactionHash },
      observations: {
        sameTransactionContainsBothBurns: nftBurnLogs.length === 1 && erc20BurnLogs.length === 1,
        nftBurnLogIndex: nftBurnLogs[0].logIndex,
        erc20BurnLogIndex: erc20BurnLogs[0].logIndex,
        jointReceiptBlockNumber: receipt.blockNumber,
        nftSolventAfter: nftBalanceAfter.gte(nftReserveAfter),
        nftObligationAfter: nftReserveAfter.toString(),
        nftBackingBefore: backingBefore.toString(),
        nftBackingAfter: nftBalanceAfter.toString(),
        ethRedeemed: valueBefore.toString(),
        alicePayoutNetOfGas: aliceBalanceAfter.add(paidGas).sub(aliceBalanceBefore).toString(),
        erc20SupplyBefore: totalBefore.toString(),
        erc20InitialSupply: ethers.utils.parseEther("100").toString(),
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
    const nftBackingBefore = await ethers.provider.getBalance(nft.address);
    const supply = await token.totalSupply();
    const obligations = await nft.totalRedeemableValue();
    await mustRevert(joint.connect(attacker).redeem(1));
    expect(await nft.ownerOf(1)).to.equal(alice.address);
    expect((await nft.totalRedeemableValue()).eq(obligations)).to.equal(true);
    expect((await ethers.provider.getBalance(nft.address)).eq(nftBackingBefore)).to.equal(true);
    expect((await token.totalSupply()).eq(supply)).to.equal(true);
  });

  it("reverts atomically when the ERC-20 allowance is missing", async function () {
    const { alice, nft, token, joint } = await setup();
    const nftBackingBefore = await ethers.provider.getBalance(nft.address);
    const supply = await token.totalSupply();
    const obligations = await nft.totalRedeemableValue();
    await (await nft.connect(alice).approve(joint.address, 1)).wait();
    await mustRevert(joint.connect(alice).redeem(1));
    expect(await nft.ownerOf(1)).to.equal(alice.address);
    expect((await token.totalSupply()).eq(supply)).to.equal(true);
    expect((await nft.totalRedeemableValue()).eq(obligations)).to.equal(true);
    expect((await ethers.provider.getBalance(nft.address)).eq(nftBackingBefore)).to.equal(true);
  });
});
