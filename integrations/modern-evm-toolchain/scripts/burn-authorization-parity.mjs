import assert from "node:assert/strict";
import fs from "node:fs";
import { network } from "hardhat";
const { ethers }=await network.connect();
const [deployer,alice,attacker]=await ethers.getSigners();
const units=ethers.parseEther("1");
const token=await ethers.deployContract("ERC8098Reference",[
  "OECL 8098 Isolated Burn","OECLISO",ethers.parseEther("100"),deployer.address
]);
await token.waitForDeployment();
const tokenAddress=await token.getAddress();
await (await token.transfer(alice.address,units*3n)).wait();
const snap=async()=>({
  supply:String(await token.totalSupply()),
  aliceBalance:String(await token.balanceOf(alice.address)),
  attackerBalance:String(await token.balanceOf(attacker.address)),
  attackerAllowance:String(await token.allowance(alice.address,attacker.address))
});
const isBurn=receipt=>{
  assert.equal(receipt.status,1);
  const events=receipt.logs.filter(log=>{
    if(log.address.toLowerCase()!==tokenAddress.toLowerCase())return false;
    try {
      const item=token.interface.parseLog(log);
      return item?.name==="Transfer" && item.args.from.toLowerCase()===alice.address.toLowerCase() &&
        item.args.to===ethers.ZeroAddress && item.args.value===units;
    }catch{return false}
  });
  assert.equal(events.length,1);
  return events[0].index;
};
const beforeSelf=await snap();
assert.equal(beforeSelf.attackerBalance,"0");
const selfReceipt=await (await token.connect(alice).burn(units)).wait();
const selfLogIndex=isBurn(selfReceipt);
const afterSelf=await snap();
assert.equal(BigInt(beforeSelf.supply)-BigInt(afterSelf.supply),units);
assert.equal(BigInt(beforeSelf.aliceBalance)-BigInt(afterSelf.aliceBalance),units);
async function rejectWithUnchanged(action,label){
  const before=await snap();
  let failed=false,hash=null;
  try {
    const tx=await action();hash=tx.hash;
    await tx.wait();
  }catch(error){failed=true;hash ||=error.transactionHash||error.receipt?.hash||error.transaction?.hash||null}
  assert.equal(failed,true,label+" should revert");
  const receipt=hash?await ethers.provider.getTransactionReceipt(hash):null;
  if(receipt)assert.equal(receipt.status,0);
  assert.deepEqual(await snap(),before,label+" must not mutate balances");
  return {failed,hash,receiptStatus:receipt?.status??null,before,after:await snap()};
}
const insufficient=await rejectWithUnchanged(
  ()=>token.connect(attacker).burn(units,{gasLimit:5_000_000}),"Insufficient self balance");
const unapproved=await rejectWithUnchanged(
  ()=>token.connect(attacker).burnFrom(alice.address,units,{gasLimit:5_000_000}),"Missing delegated allowance");
const approval=await(await token.connect(alice).approve(attacker.address,units)).wait();
const beforeDelegated=await snap();
assert.equal(beforeDelegated.attackerAllowance,units.toString());
const delegatedReceipt=await(await token.connect(attacker).burnFrom(alice.address,units)).wait();
const delegatedLogIndex=isBurn(delegatedReceipt);
const afterDelegated=await snap();
assert.equal(afterDelegated.attackerAllowance,"0");
assert.equal(BigInt(beforeDelegated.supply)-BigInt(afterDelegated.supply),units);
assert.equal(BigInt(beforeDelegated.aliceBalance)-BigInt(afterDelegated.aliceBalance),units);
assert.equal(afterDelegated.attackerBalance,"0");
const report={
  schemaVersion:"OECL_MODERN_INHERITED_BURN_PARITY_V1",
  candidateAdmission:"NOT_ADMITTED",scientificPolarity:"INCONCLUSIVE",
  sourceRevision:"68a05289bd68d89db8453c49500e0a1ae6cd11ec",
  chainId:Number((await ethers.provider.getNetwork()).chainId),
  burnUnits:units.toString(),
  dependency:{package:"@openzeppelin/contracts",version:"4.9.6",contract:"ERC20Burnable"},
  selfBurn:{before:beforeSelf,after:afterSelf,receiptStatus:selfReceipt.status,txHash:selfReceipt.hash,burnEvents:1,logIndex:selfLogIndex},
  insufficientSelfBalance:{before:insufficient.before,after:insufficient.after,reverted:insufficient.failed,receiptStatus:insufficient.receiptStatus},
  unapprovedDelegatedBurn:{before:unapproved.before,after:unapproved.after,reverted:unapproved.failed,receiptStatus:unapproved.receiptStatus},
  approvedDelegatedBurn:{before:beforeDelegated,after:afterDelegated,receiptStatus:delegatedReceipt.status,txHash:delegatedReceipt.hash,burnEvents:1,logIndex:delegatedLogIndex},
  approvalTransaction:approval.hash,
  limitations:"Same pinned participant, isolated local EVM, no live-network or all-path authorization proof"
};
fs.mkdirSync("reports",{recursive:true});
fs.writeFileSync("reports/modern-burn-authorization.json",JSON.stringify(report,null,2)+"\n");
console.log("OECL_MODERN_BURN_AUTH_PARITY_PASS:"+JSON.stringify({
  selfBurn:true,attackerSelfBurnRejected:true,unapprovedDelegatedBurnRejected:true,
  approvedBurnFrom:true,scientificPolarity:report.scientificPolarity
}));
