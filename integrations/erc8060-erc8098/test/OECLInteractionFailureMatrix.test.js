const { expect } = require("chai");
const { ethers } = require("hardhat");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

/**
 * Distinct, bounded adversarial experiments. Each case takes a full state
 * snapshot immediately before a failing transaction and re-reads state after
 * the revert. No external wallet or production contract is touched.
 */
describe("OECL 8060 x 8098: atomic failure matrix", function () {
  const outcomes = [];
  let last;

  async function setup() {
    const [deployer, alice, attacker] = await ethers.getSigners();
    const nft = await (await ethers.getContractFactory("ERC8060Reference")).deploy();
    await nft.deployed();
    const token = await (await ethers.getContractFactory("ERC8098Reference")).deploy(
      "OECL Reference", "OECL", ethers.utils.parseEther("100"), deployer.address
    );
    await token.deployed();
    const units = ethers.utils.parseEther("1");
    const joint = await (await ethers.getContractFactory("OECLJointRedemption")).deploy(nft.address, token.address, units);
    await joint.deployed();
    await (await token.connect(deployer).transfer(alice.address, units)).wait();
    await (await nft.connect(alice).mint("ipfs://atomicity", {
      value: ethers.utils.parseEther("0.12")
    })).wait();
    return { deployer, alice, attacker, nft, token, joint, units };
  }

  async function snapshot(ctx) {
    const { alice, nft, token, joint } = ctx;
    return {
      owner: await nft.ownerOf(1),
      nftBackingWei: (await ethers.provider.getBalance(nft.address)).toString(),
      redeemableWei: (await nft.totalRedeemableValue()).toString(),
      nftValueWei: (await nft.valueOf(1)).toString(),
      nftApproval: await nft.getApproved(1),
      tokenSupply: (await token.totalSupply()).toString(),
      aliceTokenBalance: (await token.balanceOf(alice.address)).toString(),
      jointTokenBalance: (await token.balanceOf(joint.address)).toString(),
      jointEthWei: (await ethers.provider.getBalance(joint.address)).toString(),
      tokenAllowance: (await token.allowance(alice.address, joint.address)).toString()
    };
  }

  async function check(label, ctx, signer, expectedControl) {
    const before = await snapshot(ctx);
    let rejected = null;
    let hash = null;
    try {
      const response = await ctx.joint.connect(signer).redeem(1, { gasLimit: 5000000 });
      hash = response.hash;
      await response.wait();
    } catch (error) {
      rejected = error;
      hash = hash || error.transactionHash || error.receipt?.transactionHash || error.transaction?.hash || null;
    }
    expect(rejected, "expected the full joint operation to revert").not.to.equal(null);
    const after = await snapshot(ctx);
    expect(after, label + " must preserve all NFT, ERC20, coordinator and allowance state").to.deep.equal(before);
    let onChainStatus = null;
    if (hash) {
      const receipt = await ethers.provider.getTransactionReceipt(hash);
      if (receipt) {
        onChainStatus = receipt.status;
        expect(receipt.status, "failed EVM transaction receipt").to.equal(0);
      }
    }
    const record = {
      experimentId: label,
      expectedFailure: expectedControl,
      sourceProvenance: {
        participantA: "ten-io-meta/erc8060-native-eth-value@c7eed906835ab39fbc8439eb0493e5a5371b23a2",
        participantB: "ten-io-meta/erc8098-reference@68a05289bd68d89db8453c49500e0a1ae6cd11ec"
      },
      contractAddresses: { nft: ctx.nft.address, token: ctx.token.address, coordinator: ctx.joint.address },
      attemptedTransactionHash: hash,
      revertedReceiptStatus: onChainStatus,
      measuredStateBefore: before,
      measuredStateAfter: after,
      unchanged: true,
      classification: "OBSERVED_LOCAL_EVM_REVERT_AND_STATE_ROLLBACK"
    };
    outcomes.push(record);
    console.log("OECL_FAILURE_EXPERIMENT:" + JSON.stringify({
      experimentId: label, unchanged: true, hash, revertedReceiptStatus: onChainStatus
    }));
  }

  after(function () {
    const target = process.env.OECL_FAILURE_MATRIX_PATH;
    if (!target) return;
    fs.mkdirSync(path.dirname(target), { recursive: true });
    const report = {
      schemaVersion: "OECL_PINNED_FAILURE_EXPERIMENTS_V1",
      scientificPolarity: "INCONCLUSIVE",
      candidateAdmission: "NOT_ADMITTED",
      chainId: 31337,
      cases: outcomes,
      sourceTestSha256: crypto.createHash("sha256").update(fs.readFileSync(__filename)).digest("hex"),
      caveat: "Local Hardhat EVM observations. No independent public-chain receipt replay and no general semantic compatibility claim."
    };
    fs.writeFileSync(target, JSON.stringify(report, null, 2) + "\n");
  });

  it("blocks unauthorized NFT ownership", async function () {
    const ctx = await setup();
    await (await ctx.nft.connect(ctx.alice).approve(ctx.joint.address, 1)).wait();
    await (await ctx.token.connect(ctx.alice).approve(ctx.joint.address, ctx.units)).wait();
    await check("REVERT-NONOWNER", ctx, ctx.attacker, "NFT_OWNER_REQUIRED");
  });

  it("blocks missing ERC721 approval", async function () {
    const ctx = await setup();
    await (await ctx.token.connect(ctx.alice).approve(ctx.joint.address, ctx.units)).wait();
    await check("REVERT-NFT-APPROVAL", ctx, ctx.alice, "NFT_ALLOWANCE_REQUIRED");
  });

  it("rolls back NFT transfer if ERC20 approval is absent", async function () {
    const ctx = await setup();
    await (await ctx.nft.connect(ctx.alice).approve(ctx.joint.address, 1)).wait();
    await check("REVERT-ERC20-APPROVAL", ctx, ctx.alice, "TOKEN_ALLOWANCE_REQUIRED");
  });

  it("rolls back NFT transfer when ERC20 balance is insufficient", async function () {
    const ctx = await setup();
    await (await ctx.nft.connect(ctx.alice).approve(ctx.joint.address, 1)).wait();
    await (await ctx.token.connect(ctx.alice).approve(ctx.joint.address, ctx.units)).wait();
    await (await ctx.token.connect(ctx.alice).transfer(ctx.attacker.address, ctx.units)).wait();
    await check("REVERT-ERC20-BALANCE", ctx, ctx.alice, "TOKEN_BALANCE_REQUIRED");
  });
});
