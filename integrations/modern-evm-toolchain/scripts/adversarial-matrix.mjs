import assert from "node:assert/strict";
import fs from "node:fs";
import { network } from "hardhat";

const { ethers } = await network.connect();
const MINT = ethers.parseEther("0.12");
const REDEEM = ethers.parseEther("0.10");
const UNITS = ethers.parseEther("1");
const START = ethers.parseEther("100");
const checks = [];

async function deployed(contract) {
  await contract.waitForDeployment();
  return contract;
}

async function setup() {
  const [deployer, alice, attacker] = await ethers.getSigners();
  const nft = await deployed(await ethers.deployContract("ERC8060Reference"));
  const token = await deployed(await ethers.deployContract("ERC8098Reference", [
    "OECL independent reference", "OECL8098", START, deployer.address
  ]));
  const joint = await deployed(await ethers.deployContract("OECLJointRedemption", [
    await nft.getAddress(), await token.getAddress(), UNITS
  ]));
  await (await token.transfer(alice.address, UNITS)).wait();
  await (await nft.connect(alice).mint("ipfs://oecl-modern-negative", { value: MINT })).wait();
  return { deployer, alice, attacker, nft, token, joint };
}
async function fullSnapshot({alice,nft,token,joint}, owner) {
  return {
    owner: await nft.ownerOf(1n),
    obligations: String(await nft.totalRedeemableValue()),
    nftWei: String(await ethers.provider.getBalance(await nft.getAddress())),
    tokenSupply: String(await token.totalSupply()),
    holderUnits: String(await token.balanceOf(owner||alice.address)),
    jointWei: String(await ethers.provider.getBalance(await joint.getAddress())),
    jointUnits: String(await token.balanceOf(await joint.getAddress())),
  };
}
async function rejected(label, action, before, after) {
  let failure = null;
  try { const response = await action(); if(response?.wait) await response.wait(); }
  catch (error) { failure = error; }
  assert.ok(failure, label + ": expected revert");
  assert.deepEqual(await after(), before, label + ": rollback snapshot must remain unchanged");
  checks.push({ label, status: "REJECTED_WITH_STATE_UNCHANGED" });
}
async function approvals(ctx, nft=true, token=true) {
  if (nft) await (await ctx.nft.connect(ctx.alice).approve(await ctx.joint.getAddress(), 1n)).wait();
  if (token) await (await ctx.token.connect(ctx.alice).approve(await ctx.joint.getAddress(), UNITS)).wait();
}

{
  const ctx = await setup();
  const before = await fullSnapshot(ctx);
  await rejected("UNAUTHORIZED_OWNER_REDEEM_REJECTED",
    () => ctx.joint.connect(ctx.attacker).redeem(1n, {gasLimit:5_000_000}),
    before, () => fullSnapshot(ctx));
}
{
  const ctx = await setup();
  await approvals(ctx, false, true);
  const before = await fullSnapshot(ctx);
  await rejected("MISSING_NFT_APPROVAL_ROLLBACK",
    () => ctx.joint.connect(ctx.alice).redeem(1n, {gasLimit:5_000_000}),
    before, () => fullSnapshot(ctx));
}
{
  const ctx = await setup();
  await approvals(ctx, true, false);
  const before = await fullSnapshot(ctx);
  await rejected("MISSING_TOKEN_ALLOWANCE_ROLLBACK",
    () => ctx.joint.connect(ctx.alice).redeem(1n, {gasLimit:5_000_000}),
    before, () => fullSnapshot(ctx));
}
{
  const ctx = await setup();
  await approvals(ctx);
  await (await ctx.token.connect(ctx.alice).transfer(ctx.attacker.address, UNITS)).wait();
  const before = await fullSnapshot(ctx);
  await rejected("INSUFFICIENT_TOKEN_BALANCE_ROLLBACK",
    () => ctx.joint.connect(ctx.alice).redeem(1n, {gasLimit:5_000_000}),
    before, () => fullSnapshot(ctx));
}
async function receiverSetup(mode) {
  const [deployer] = await ethers.getSigners();
  const nft = await deployed(await ethers.deployContract("ERC8060Reference"));
  const token = await deployed(await ethers.deployContract("ERC8098Reference", [
    "OECL reentrancy control", "OECL8098", START, deployer.address
  ]));
  const joint = await deployed(await ethers.deployContract("OECLJointRedemption", [
    await nft.getAddress(), await token.getAddress(), UNITS
  ]));
  const receiver = await deployed(await ethers.deployContract("OECLAdversarialEthReceiver", [
    await nft.getAddress(), await token.getAddress(), await joint.getAddress(), UNITS
  ]));
  await (await token.transfer(await receiver.getAddress(), UNITS)).wait();
  await (await receiver.mintToSelf({ value: MINT })).wait();
  await (await receiver.configure(1n, mode)).wait();
  return { nft, token, joint, receiver };
}
async function receiverSnapshot(ctx) {
  return {
    owner: await ctx.nft.ownerOf(1n),
    obligations: String(await ctx.nft.totalRedeemableValue()),
    backing: String(await ethers.provider.getBalance(await ctx.nft.getAddress())),
    supply: String(await ctx.token.totalSupply()),
    receiverBalance: String(await ctx.token.balanceOf(await ctx.receiver.getAddress())),
    receiverWei: String(await ethers.provider.getBalance(await ctx.receiver.getAddress())),
    jointWei: String(await ethers.provider.getBalance(await ctx.joint.getAddress())),
    jointUnits: String(await ctx.token.balanceOf(await ctx.joint.getAddress())),
    callbacks: String(await ctx.receiver.callbackCount()),
    reentryAttempt: await ctx.receiver.attemptedReentry(),
    reentrySuccess: await ctx.receiver.reentrySucceeded(),
  };
}
{
  const ctx = await receiverSetup(1);
  const before = await receiverSnapshot(ctx);
  await rejected("REJECTED_ETH_RECEIVER_FULL_ROLLBACK",
    () => ctx.receiver.execute(1n,{gasLimit:5_000_000}),
    before, () => receiverSnapshot(ctx));
}
{
  const ctx = await receiverSetup(2);
  const tx = await ctx.receiver.execute(1n,{gasLimit:5_000_000});
  const receipt = await tx.wait();
  assert.equal(receipt.status, 1, "outer redemption succeeds");
  assert.equal(await ctx.receiver.attemptedReentry(), true);
  assert.equal(await ctx.receiver.reentrySucceeded(), false);
  assert.equal(await ctx.receiver.callbackCount(), 1n);
  assert.equal(await ethers.provider.getBalance(await ctx.receiver.getAddress()), REDEEM);
  assert.equal(await ctx.nft.totalRedeemableValue(), 0n);
  assert.equal(await ctx.token.totalSupply(), START-UNITS);
  assert.equal(await ethers.provider.getBalance(await ctx.joint.getAddress()), 0n);
  assert.equal(await ctx.token.balanceOf(await ctx.joint.getAddress()), 0n);
  const encoded = await ctx.receiver.reentryFailure();
  assert.equal(encoded.slice(0,10),"0x08c379a0");
  const [reason] = ethers.AbiCoder.defaultAbiCoder().decode(["string"], "0x"+encoded.slice(10));
  assert.equal(reason, "ReentrancyGuard: reentrant call");
  const nftBurnEvent = ctx.nft.interface.getEvent("Burned").topicHash;
  const tokenTransfer = ctx.token.interface.getEvent("Transfer").topicHash;
  const nftAddress = (await ctx.nft.getAddress()).toLowerCase();
  const tokenAddress = (await ctx.token.getAddress()).toLowerCase();
  const nftBurns = receipt.logs.filter(x =>
    x.address.toLowerCase()===nftAddress && x.topics[0]===nftBurnEvent
  );
  const tokenBurns = receipt.logs.filter(x =>
    x.address.toLowerCase()===tokenAddress && x.topics[0]===tokenTransfer &&
    ctx.token.interface.parseLog(x).args.to===ethers.ZeroAddress
  );
  assert.equal(nftBurns.length,1);
  assert.equal(tokenBurns.length,1);
  checks.push({label:"REENTRANCY_BLOCKED_SINGLE_OUTER_PAYOUT",status:"OBSERVED",receipt:receipt.hash});
}
const report={
  schemaVersion:"OECL_MODERN_LOCAL_ADVERSARIAL_MATRIX_V1",
  context:"Hardhat 3 + Ethers 6; one newly executed local EVM experiment, not historic evidence replay",
  scientificVerdict:"INCONCLUSIVE",candidateAdmission:"NOT_ADMITTED",
  sourceA:"ten-io-meta/erc8060-native-eth-value@c7eed906835ab39fbc8439eb0493e5a5371b23a2",
  sourceB:"ten-io-meta/erc8098-reference@68a05289bd68d89db8453c49500e0a1ae6cd11ec",
  checks,
  limitations:"Fixture-only, local 31337 EVM, not independent scientific admission or complete security proof"
};
fs.mkdirSync("reports",{recursive:true});
fs.writeFileSync("reports/modern-adversarial.json",JSON.stringify(report,null,2)+"\n");
console.log("OECL_MODERN_ADVERSARIAL_PASS:"+JSON.stringify({count:checks.length,labels:checks.map(x=>x.label),verdict:report.scientificVerdict}));
