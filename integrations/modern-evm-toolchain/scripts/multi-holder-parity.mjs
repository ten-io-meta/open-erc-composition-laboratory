import assert from "node:assert/strict";
import fs from "node:fs";
import { network } from "hardhat";
const { ethers }=await network.connect();
const [deployer,alice,bob]=await ethers.getSigners();
const units=ethers.parseEther("1");
const redemption=ethers.parseEther("0.10");
const mintPrice=ethers.parseEther("0.12");
const nft=await ethers.deployContract("ERC8060Reference");
await nft.waitForDeployment();
const token=await ethers.deployContract("ERC8098Reference",[
  "OECL Multi-holder","OECLMH",ethers.parseEther("100"),deployer.address
]);
await token.waitForDeployment();
const joint=await ethers.deployContract("OECLJointRedemption",[
  await nft.getAddress(),await token.getAddress(),units
]);
await joint.waitForDeployment();
await(await nft.connect(alice).mint("ipfs://alice",{value:mintPrice})).wait();
await(await nft.connect(bob).mint("ipfs://bob",{value:mintPrice})).wait();
await(await token.transfer(alice.address,units)).wait();
await(await token.transfer(bob.address,units)).wait();
const state=async()=>({
  backingWei:String(await ethers.provider.getBalance(await nft.getAddress())),
  obligationsWei:String(await nft.totalRedeemableValue()),
  tokenSupply:String(await token.totalSupply()),
  nft1Owner:await nft.ownerOf(1n).catch(()=>null),
  nft2Owner:await nft.ownerOf(2n).catch(()=>null)
});
const before=await state();
assert.equal(before.backingWei,ethers.parseEther("0.24").toString());
assert.equal(before.obligationsWei,ethers.parseEther("0.20").toString());
const surplus=await nft.surplusValue();
assert.equal(surplus,ethers.parseEther("0.04"));
const surplusTx=await(await nft.withdrawSurplus(surplus)).wait();
const afterSurplus=await state();
assert.equal(afterSurplus.backingWei,afterSurplus.obligationsWei);
assert.equal(afterSurplus.obligationsWei,before.obligationsWei);
await(await nft.connect(alice).approve(await joint.getAddress(),1n)).wait();
await(await token.connect(alice).approve(await joint.getAddress(),units)).wait();
await(await nft.connect(bob).approve(await joint.getAddress(),2n)).wait();
await(await token.connect(bob).approve(await joint.getAddress(),units)).wait();
const first=await(await joint.connect(alice).redeem(1n)).wait();
const afterFirst=await state();
assert.equal(first.status,1);
assert.equal(afterFirst.nft1Owner,null);
assert.equal(afterFirst.nft2Owner,bob.address);
assert.equal(afterFirst.backingWei,redemption.toString());
assert.equal(afterFirst.obligationsWei,redemption.toString());
assert.equal(afterFirst.tokenSupply,ethers.parseEther("99").toString());
const second=await(await joint.connect(bob).redeem(2n)).wait();
const afterSecond=await state();
assert.equal(second.status,1);
assert.equal(afterSecond.nft1Owner,null);
assert.equal(afterSecond.nft2Owner,null);
assert.equal(afterSecond.backingWei,"0");
assert.equal(afterSecond.obligationsWei,"0");
assert.equal(afterSecond.tokenSupply,ethers.parseEther("98").toString());
assert.equal(await ethers.provider.getBalance(await joint.getAddress()),0n);
assert.equal(await token.balanceOf(await joint.getAddress()),0n);
const report={
  schemaVersion:"OECL_MODERN_MULTIHOLDER_PARITY_V1",
  scientificPolarity:"INCONCLUSIVE",candidateAdmission:"NOT_ADMITTED",
  sourceRevisions:{
    erc8060:"c7eed906835ab39fbc8439eb0493e5a5371b23a2",
    erc8098:"68a05289bd68d89db8453c49500e0a1ae6cd11ec"
  },
  chainId:Number((await ethers.provider.getNetwork()).chainId),
  surplusWithdrawnWei:surplus.toString(),
  holders:[alice.address,bob.address],
  tx:{maxSurplusWithdrawal:surplusTx.hash,aliceJointRedemption:first.hash,bobJointRedemption:second.hash},
  before,afterSurplus,afterFirst,afterSecond,
  outcome:"TWO_INDEPENDENT_JOINT_BURNS_AFTER_MAX_ALLOWED_SURPLUS",
  limitations:"Bounded two-holder local EVM test, not proof of all owners or adverse histories"
};
fs.mkdirSync("reports",{recursive:true});
fs.writeFileSync("reports/modern-multiholder.json",JSON.stringify(report,null,2)+"\n");
console.log("OECL_MODERN_MULTIHOLDER_PARITY_PASS:"+JSON.stringify({
  surplusWithdrawnWei:surplus.toString(),afterFirst,afterSecond,
  scientificPolarity:report.scientificPolarity
}));
