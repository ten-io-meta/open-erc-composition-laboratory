const { expect } = require("chai");
const { ethers } = require("hardhat");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

describe("OECL pinned ERC-8060 × ERC-8098 — payment rejection and callback reentrancy", function () {
  const cases = [];
  const initial = ethers.utils.parseEther("100");
  const units = ethers.utils.parseEther("1");
  const mintPrice = ethers.utils.parseEther("0.12");
  const redemption = ethers.utils.parseEther("0.10");

  async function setup(mode) {
    const [deployer] = await ethers.getSigners();
    const nft = await (await ethers.getContractFactory("ERC8060Reference")).deploy();
    await nft.deployed();
    const token = await (await ethers.getContractFactory("ERC8098Reference")).deploy(
      "OECL Pinned", "OECL", initial, deployer.address
    );
    await token.deployed();
    const joint = await (await ethers.getContractFactory("OECLJointRedemption")).deploy(
      nft.address, token.address, units
    );
    await joint.deployed();
    const receiver = await (await ethers.getContractFactory("OECLAdversarialEthReceiver")).deploy(
      nft.address, token.address, joint.address, units
    );
    await receiver.deployed();
    await (await token.transfer(receiver.address, units)).wait();
    await (await receiver.mintToSelf({value: mintPrice})).wait();
    await (await receiver.configure(1, mode)).wait();
    expect(await nft.ownerOf(1)).to.equal(receiver.address);
    expect((await nft.totalRedeemableValue()).eq(redemption)).to.equal(true);
    return { nft, token, joint, receiver };
  }

  async function snapshot({nft,token,joint,receiver}, afterBurn = false) {
    let nftOwner = null;
    let nftValue = null;
    let nftApproval = null;
    if (!afterBurn) {
      nftOwner = await nft.ownerOf(1);
      const [value] = await nft.functions["valueOf(uint256)"](1);
      nftValue = value.toString();
      nftApproval = await nft.getApproved(1);
    }
    return {
      nftOwner, nftValue, nftApproval,
      nftBalanceWei: (await ethers.provider.getBalance(nft.address)).toString(),
      nftObligationsWei: (await nft.totalRedeemableValue()).toString(),
      tokenSupply: (await token.totalSupply()).toString(),
      receiverTokenBalance: (await token.balanceOf(receiver.address)).toString(),
      jointTokenBalance: (await token.balanceOf(joint.address)).toString(),
      receiverEthWei: (await ethers.provider.getBalance(receiver.address)).toString(),
      jointEthWei: (await ethers.provider.getBalance(joint.address)).toString(),
      tokenAllowance: (await token.allowance(receiver.address,joint.address)).toString(),
      callbackCount: (await receiver.callbackCount()).toString(),
      attemptedReentry: await receiver.attemptedReentry(),
      reentrySucceeded: await receiver.reentrySucceeded()
    };
  }

  function provenance(ctx) {
    return {
      nft:ctx.nft.address,token:ctx.token.address,coordinator:ctx.joint.address,
      adversarialReceiver:ctx.receiver.address,
      sourceA:"ten-io-meta/erc8060-native-eth-value@c7eed906835ab39fbc8439eb0493e5a5371b23a2",
      sourceB:"ten-io-meta/erc8098-reference@68a05289bd68d89db8453c49500e0a1ae6cd11ec"
    };
  }

  it("rejecting the final ETH payment reverts BOTH prior burns and all intermediate transfers",async function () {
    const ctx=await setup(1); // Mode.REJECT_ETH
    const before=await snapshot(ctx);
    let hash=null;
    let caught=null;
    try {
      const tx=await ctx.receiver.execute(1,{gasLimit:5000000});
      hash=tx.hash;
      await tx.wait();
    } catch(error) {
      caught=error;
      hash=hash || error.transactionHash || error.receipt?.transactionHash || error.transaction?.hash || null;
    }
    expect(caught,"full call must fail when receiver rejects ETH").not.to.equal(null);
    expect(hash,"require an EVM transaction, not just a preflight failure").to.match(/^0x[a-fA-F0-9]{64}$/);
    const receipt=await ethers.provider.getTransactionReceipt(hash);
    expect(receipt,"must have a mined reverted receipt").not.to.equal(null);
    expect(receipt.status).to.equal(0);
    const after=await snapshot(ctx);
    expect(after).to.deep.equal(before);
    expect(after.nftOwner).to.equal(ctx.receiver.address);
    expect(after.tokenSupply).to.equal(initial.toString());
    expect(after.nftObligationsWei).to.equal(redemption.toString());
    cases.push({
      caseId:"REJECTED_ETH_CALLBACK_AT_END",
      expected:"FULL_TRANSACTION_REVERTS",
      transactionHash:hash,receiptStatus:receipt.status,
      before,after,unchanged:true,
      source:provenance(ctx)
    });
  });

  it("nested redemption during the ETH callback fails with ReentrancyGuard while outer payment succeeds once",async function () {
    const ctx=await setup(2); // Mode.TRY_REENTER
    const before=await snapshot(ctx);
    const receipt=await (await ctx.receiver.execute(1,{gasLimit:5000000})).wait();
    expect(receipt.status).to.equal(1);
    const after=await snapshot(ctx,true);
    expect(after.nftOwner).to.equal(null);
    expect(after.nftBalanceWei).to.equal(mintPrice.sub(redemption).toString());
    expect(after.nftObligationsWei).to.equal("0");
    expect(after.receiverEthWei).to.equal(redemption.toString());
    expect(after.receiverTokenBalance).to.equal("0");
    expect(after.jointTokenBalance).to.equal("0");
    expect(after.jointEthWei).to.equal("0");
    expect(after.tokenSupply).to.equal(initial.sub(units).toString());
    expect(after.callbackCount).to.equal("1");
    expect(after.attemptedReentry).to.equal(true);
    expect(after.reentrySucceeded).to.equal(false);
    const data=await ctx.receiver.reentryFailure();
    const decoded=ethers.utils.defaultAbiCoder.decode(["string"],"0x"+data.slice(10))[0];
    expect(data.slice(0,10)).to.equal("0x08c379a0"); // Error(string)
    expect(decoded).to.equal("ReentrancyGuard: reentrant call");
    const nftBurn=ctx.nft.interface.getEventTopic("Burned");
    const erc20Transfer=ctx.token.interface.getEventTopic("Transfer");
    const relevantNftLogs=receipt.logs.filter(x=>x.address.toLowerCase()===ctx.nft.address.toLowerCase() && x.topics[0]===nftBurn);
    const relevantErc20Burns=receipt.logs.filter(x=>
      x.address.toLowerCase()===ctx.token.address.toLowerCase() &&
      x.topics[0]===erc20Transfer &&
      ctx.token.interface.parseLog(x).args.to===ethers.constants.AddressZero
    );
    expect(relevantNftLogs.length).to.equal(1);
    expect(relevantErc20Burns.length).to.equal(1);
    cases.push({
      caseId:"REENTRANT_CALLBACK_ATTEMPT_BLOCKED",
      expected:"ONE_OUTER_REDEMPTION_AND_ZERO_NESTED_BURNS",
      transactionHash:receipt.transactionHash,receiptStatus:receipt.status,
      before,after,
      callbackAttempted:true,
      nestedCallSucceeded:false,
      nestedRevertReason:decoded,
      nftBurnEvents:relevantNftLogs.length,
      erc20BurnEvents:relevantErc20Burns.length,
      source:provenance(ctx)
    });
  });

  after(function() {
    if(!process.env.OECL_ETH_CALLBACK_EVIDENCE_PATH)return;
    const report={
      schemaVersion:"OECL_PINNED_ETH_CALLBACK_EXPERIMENTS_V1",
      chainId:31337,
      candidateAdmission:"NOT_ADMITTED",
      scientificPolarity:"INCONCLUSIVE",
      cases,
      sourceTestSha256:crypto.createHash("sha256").update(fs.readFileSync(__filename)).digest("hex"),
      limits:"Only two bounded local Hardhat receiver behaviors tested. No live-chain audit or general reentrancy proof."
    };
    fs.mkdirSync(path.dirname(process.env.OECL_ETH_CALLBACK_EVIDENCE_PATH),{recursive:true});
    fs.writeFileSync(process.env.OECL_ETH_CALLBACK_EVIDENCE_PATH,JSON.stringify(report,null,2)+"\n");
  });
});
