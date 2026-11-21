"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const crypto=require("node:crypto");
const {execFileSync}=require("node:child_process");
const A="c7eed906835ab39fbc8439eb0493e5a5371b23a2";
const B="68a05289bd68d89db8453c49500e0a1ae6cd11ec";
const digest=b=>crypto.createHash("sha256").update(b).digest("hex");
const tx=x=>typeof x==="string"&&/^0x[a-f0-9]{64}$/i.test(x);
const address=x=>typeof x==="string"&&/^0x[a-f0-9]{40}$/i.test(x);
const value=(x,label)=>{
  assert.equal(typeof x,"string",label+" must be decimal");
  assert.match(x,/^(0|[1-9][0-9]*)$/,label+" malformed");
  return BigInt(x);
};
function verify(a,b,e) {
  const rev=x=>execFileSync("git",["-C",x,"rev-parse","HEAD"],{encoding:"utf8"}).trim();
  assert.equal(rev(a),A);assert.equal(rev(b),B);
  assert.equal(e.schemaVersion,"OECL_PINNED_INHERITED_ERC20_BURN_AUTH_V1");
  assert.equal(e.classification,"SCOPED_LOCAL_EVM_DIRECT_INHERITED_BURN_AUTHORIZATION");
  assert.equal(e.candidateAdmission,"NOT_ADMITTED");
  assert.equal(e.scientificPolarity,"INCONCLUSIVE");
  assert.equal(e.chainId,31337);
  assert.equal(e.source.repository,"ten-io-meta/erc8098-reference");
  assert.equal(e.source.revision,B);
  assert.equal(e.source.file,"contracts/ERC8098Reference.sol");
  const original=fs.readFileSync(path.join(b,e.source.file));
  assert.equal(e.source.sha256,digest(original));
  const test=fs.readFileSync(path.join(__dirname,"test/OECLInheritedBurnAuthorization.test.js"));
  assert.equal(e.testSourceSha256,digest(test));
  assert.equal(e.dependency?.package,"@openzeppelin/contracts");
  assert.equal(e.dependency.version,"4.9.6");
  assert.equal(e.dependency.contract,"ERC20Burnable");
  assert.deepEqual(e.dependency.methods,["burn(uint256)","burnFrom(address,uint256)"]);
  const lock=JSON.parse(fs.readFileSync(path.join(b,"package-lock.json"),"utf8"));
  const lockA=JSON.parse(fs.readFileSync(path.join(a,"package-lock.json"),"utf8"));
  const l=lock.packages?.["node_modules/@openzeppelin/contracts"];
  assert.equal(l?.version,"4.9.6");
  assert.equal(l?.integrity,lockA.packages?.["node_modules/@openzeppelin/contracts"]?.integrity);
  const burnable=fs.readFileSync(path.join(a,"node_modules/@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol"));
  assert.match(burnable.toString(),/function burn\(uint256 amount\) public virtual/);
  assert.match(burnable.toString(),/_burn\(_msgSender\(\), amount\);/);
  assert.match(burnable.toString(),/_spendAllowance\(account, _msgSender\(\), amount\);/);
  for(const id of ["tokenAddress","caller","spender"])assert.ok(address(e[id]),"Wrong address "+id);
  assert.notEqual(e.caller.toLowerCase(),e.spender.toLowerCase());
  const units=value(e.burnUnits,"burnUnits");
  assert.ok(units>0n);
  function state(x){
    assert.ok(x&&typeof x==="object");
    return Object.fromEntries(["supply","aliceBalance","attackerBalance","attackerAllowance"]
      .map(k=>[k,value(x[k],k)]));
  }
  function difference(before,after){
    const a=state(before),b=state(after);
    assert.equal(a.supply-b.supply,units);
    assert.equal(a.aliceBalance-b.aliceBalance,units);
    assert.equal(a.attackerBalance,0n);
    assert.equal(b.attackerBalance,0n);
    return {a,b};
  }
  for(const section of ["selfBurn","approvedDelegatedBurn"]){
    const event=e[section];
    assert.ok(event&&tx(event.transactionHash));
    assert.equal(event.receiptStatus,1);
    assert.ok(Number.isSafeInteger(event.zeroAddressBurnLogIndex)&&event.zeroAddressBurnLogIndex>=0);
    difference(event.before,event.after);
  }
  assert.notEqual(e.selfBurn.transactionHash,e.approvedDelegatedBurn.transactionHash);
  assert.ok(tx(e.approvalTransaction));
  assert.notEqual(e.approvalTransaction,e.selfBurn.transactionHash);
  assert.notEqual(e.approvalTransaction,e.approvedDelegatedBurn.transactionHash);
  const selfBefore=state(e.selfBurn.before),selfAfter=state(e.selfBurn.after);
  assert.equal(selfBefore.attackerAllowance,0n);
  assert.equal(selfAfter.attackerAllowance,0n);
  const insufficient=e.insufficientSelfBalance;
  const notApproved=e.unapprovedDelegatedBurn;
  for(const caseItem of [insufficient,notApproved]){
    assert.equal(caseItem.reverted,true);
    const a=state(caseItem.before),b=state(caseItem.after);
    assert.deepEqual(b,a,"Reverted unauthorized burn altered ERC20 storage");
    assert.equal(a.attackerBalance,0n);
    assert.equal(a.attackerAllowance,0n);
  }
  assert.deepEqual(state(insufficient.before),selfAfter);
  assert.deepEqual(state(notApproved.before),selfAfter);
  const delegatedBefore=state(e.approvedDelegatedBurn.before);
  const delegatedAfter=state(e.approvedDelegatedBurn.after);
  assert.equal(delegatedBefore.attackerAllowance,units);
  assert.equal(delegatedAfter.attackerAllowance,0n);
  assert.equal(delegatedBefore.supply,selfAfter.supply);
  assert.equal(delegatedBefore.aliceBalance,selfAfter.aliceBalance);
  assert.equal(delegatedAfter.attackerBalance,0n);
  return {
    schemaVersion:"OECL_INHERITED_ERC20_BURN_AUTH_VALIDATED_V1",
    sourceRevisionB:B,sourceSha256:e.source.sha256,
    inheritedBurnableSha256:digest(burnable),
    packageIntegrity:l.integrity,
    chainId:31337,
    selfBurnTransaction:e.selfBurn.transactionHash,
    approvedDelegatedTransaction:e.approvedDelegatedBurn.transactionHash,
    scopedObservations:{
      selfBurnSourceIsMsgSender:true,
      zeroBalanceExternalCallerRejected:true,
      burnFromWithoutAllowanceRejected:true,
      burnFromWithAllowanceObserved:true,
      eachExecutedBurnDecreasesSupplyByUnits:true
    },
    admission:"NOT_ADMITTED",scientificPolarity:"INCONCLUSIVE",
    limitation:"Local Hardhat observation of inherited ERC20Burnable, not a proof of all reachable authorization paths."
  };
}
function main(a,b,filepath){
  const raw=fs.readFileSync(filepath);
  const evidence=JSON.parse(raw);
  const validated=verify(a,b,evidence);
  const probes=[
    ["forged_source_hash",x=>{x.source.sha256="0".repeat(64);}],
    ["wrong_dependency_version",x=>{x.dependency.version="5.0.0";}],
    ["wrong_test_sha",x=>{x.testSourceSha256="f".repeat(64);}],
    ["forged_direct_burn_amount",x=>{x.selfBurn.after.supply="999";}],
    ["forged_direct_burn_receipt",x=>{x.selfBurn.receiptStatus=0;}],
    ["attacker_revert_state_changed",x=>{x.insufficientSelfBalance.after.aliceBalance="0";}],
    ["unauthorized_delegated_burn_falsely_accepted",x=>{x.unapprovedDelegatedBurn.reverted=false;}],
    ["fake_allowance_not_spent",x=>{x.approvedDelegatedBurn.after.attackerAllowance=x.burnUnits;}],
    ["fake_direct_caller",x=>{x.spender=x.caller;}]
  ];
  for(const [label,mutate] of probes){
    const altered=structuredClone(evidence);
    mutate(altered);
    assert.throws(()=>verify(a,b,altered),undefined,"False direct authorization evidence accepted: "+label);
  }
  validated.sourceReportSha256=digest(raw);
  validated.adversarialControls=probes.map(x=>x[0]);
  fs.writeFileSync(filepath.replace(/\.json$/,".validated.json"),JSON.stringify(validated,null,2)+"\n");
  console.log("OECL_INHERITED_BURN_AUTH_VALIDATED:"+JSON.stringify({
    selfBurn:true,unauthorizedSelfBurnRejected:true,unapprovedBurnFromRejected:true,
    approvedBurnFrom:true,negativeControls:probes.length,polarity:validated.scientificPolarity
  }));
}
if(require.main===module)main(...process.argv.slice(2));
module.exports={verify};
