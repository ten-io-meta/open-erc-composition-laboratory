"use strict";
/**
 * Independent second runner validates archived evidence from first runner.
 * Does not import runtime executor or its share conversion oracle.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const crypto=require("node:crypto");
const {digest}=require("../laboratory/scientific-open-source-worker/SolmateCrossVaultProtocol.cjs");
const ZERO="0x"+"0".repeat(40);
const low=x=>String(x).toLowerCase();
const hex40=x=>typeof x==="string"&&/^0x[0-9a-f]{40}$/i.test(x);
const hex32=x=>typeof x==="string"&&/^0x[0-9a-f]{64}$/i.test(x);
const sorted=es=>es.map(e=>JSON.stringify(e).toLowerCase()).sort();
function review(plan,w){
 assert.equal(plan?.schemaVersion,"OECL_AUTOMATIC_SCIENTIFIC_EXPERIMENT_PROPOSAL_V1");
 assert.equal(plan.status,"GENERATED_SOURCE_BOUND_CANDIDATE_NEEDS_REVIEW");
 assert.equal(plan.executionGate,"SOURCE_ONLY_NO_DISPATCH");
 assert.equal(plan.executionAuthorized,false);
 assert.equal(plan.experimentDispatched,false);
 assert.equal(plan.evmExecuted,false);
 assert.equal(plan.candidateAdmission,"NOT_ADMITTED");
 assert.equal(plan.compatibilityVerdict,"NOT_EVALUATED");
 assert.equal(plan.scientificVerdict,"INCONCLUSIVE");
 assert(plan.requestedAuthorizations.length>0&&
  plan.requestedAuthorizations.every(a=>a.granted===false));
 assert.equal(plan.provenance.solmateRevision,
  "89365b880c4f3c786bdd453d4b8e8fe410344a69");
 const raw={...plan};delete raw.proposalSha256;
 assert.equal(digest(raw),plan.proposalSha256);
 assert.equal(plan.provenance.basePlanSha256,plan.baseline.planSha256);
 assert.equal(plan.exploration.selectionCriterion,
  "MINIMUM_DONATION_THEN_MINIMUM_WITHDRAWAL_WITH_DISTINCT_BURN_AND_SHARED_VALIDITY");
 assert.equal(plan.exploration.searched,480);
 assert.equal(plan.numericPolicy.initialDeposit,40);
 assert.equal(plan.numericPolicy.initialAssetBudget,100);
 const selected=plan.selection;assert(selected);
 assert.equal(selected.donation,2);
 assert.equal(selected.withdrawal,21);
 assert.equal(selected.ozBurnedShares,"21");
 assert.equal(selected.solmateBurnedShares,"20");
 assert.equal(selected.ozFinalShares,"19");
 assert.equal(selected.solmateFinalShares,"20");
 assert.equal(plan.experimentProgram.length,8);
 assert.deepEqual(plan.experimentProgram.map(x=>x.kind),[
  "MINT_TEST_ASSET","APPROVE_VAULT_ASSETS","DEPOSIT_UNDERLYING",
  "NEGATIVE_BEFORE","DIRECT_UNDERLYING_DONATION","POSITIVE_AFTER",
  "NEGATIVE_AFTER","WITHDRAW_TEST"]);
 assert.equal(w?.schemaVersion,"OECL_AUTOMATIC_PROPOSAL_LOCAL_WITNESS_V1");
 assert.equal(w.proposalSha256,plan.proposalSha256);
 assert.equal(w.provenanceSha256,digest(plan.provenance));
 assert.equal(w.chainId,31337);
 assert.equal(w.reviewGate,"REVIEWED_SOURCE_CI_GATE_V1_LOCAL_ONLY");
 assert.equal(w.generatedCaseSelected,true);
 assert.equal(w.sourceEconomicModelsManuallyReviewed,true);
 assert.equal(w.minedReceipts,14);
 assert.equal(w.unminedControls,6);
 assert.equal(w.unminedExpectedReverts,4);
 assert.equal(w.unminedExpectedSuccesses,2);
 assert.equal(w.hypothesis.id,plan.falsifiableHypothesis.id);
 assert.equal(w.hypothesis.verdict,"REFUTED_IN_THESE_LOCAL_EVM_FIXTURES");
 assert.equal(w.hypothesis.ozBurnedShares,selected.ozBurnedShares);
 assert.equal(w.hypothesis.solmateBurnedShares,selected.solmateBurnedShares);
 assert.equal(w.overallScientificVerdict,"INCONCLUSIVE");
 assert.equal(w.compatibilityVerdict,"NOT_EVALUATED");
 assert.equal(w.candidateAdmission,"NOT_ADMITTED");
 assert(hex40(w.actors?.owner)&&hex40(w.actors?.attacker)&&
  low(w.actors.owner)!==low(w.actors.attacker));
 assert(Array.isArray(w.scenarios)&&w.scenarios.length===2);
 const seenTx=new Set(),seenAddress=new Set();
 let lastBlock=0,mined=0,simulated=0,rejected=0,simulatedSuccess=0;
 const actor=w.actors.owner;
 function receipt(rc,to,signature){
  assert(rc&&hex32(rc.txHash)&&hex32(rc.blockHash));
  assert(!seenTx.has(low(rc.txHash)));
  seenTx.add(low(rc.txHash));mined++;
  assert(rc.status===1&&rc.transactionMined===true);
  assert(Number.isSafeInteger(rc.blockNumber)&&rc.blockNumber>lastBlock);
  lastBlock=rc.blockNumber;
  assert(BigInt(rc.gasUsed)>0n&&BigInt(rc.gasUsed)<=3000000n);
  assert.equal(low(rc.from),low(actor));
  assert.equal(rc.to===null?null:low(rc.to),to===null?null:low(to));
  assert.equal(rc.method,signature);
  if(signature==="CONSTRUCTOR")assert.equal(rc.methodSelector,"CREATE");
  else assert(/^0x[0-9a-f]{8}$/i.test(rc.methodSelector));
  assert(Array.isArray(rc.events));
 }
 function modelShares(id,amount,totalShares,totalAssets){
  const a=BigInt(amount),s=BigInt(totalShares),t=BigInt(totalAssets);
  const num=id==="OPENZEPPELIN"?a*(s+1n):a*s;
  const den=id==="OPENZEPPELIN"?t+1n:t;
  return ((num+den-1n)/den).toString();
 }
 function expectedEvents(kind,shareBurn,asset,vault){
  const transfer=(contract,from,to,amount)=>({contract,name:"Transfer",from,to,amount});
  const approval=n=>({contract:"ASSET",name:"Approval",from:actor,to:vault,amount:n});
  switch(kind){
   case "MINT_TEST_ASSET":return [transfer("ASSET",ZERO,actor,"100")];
   case "APPROVE_VAULT_ASSETS":return [approval("40")];
   case "DEPOSIT_UNDERLYING":return [approval("0"),
    transfer("ASSET",actor,vault,"40"),transfer("VAULT",ZERO,actor,"40"),
    {contract:"VAULT",name:"Deposit",sender:actor,receiver:actor,assets:"40",shares:"40"}];
   case "DIRECT_UNDERLYING_DONATION":return [transfer("ASSET",actor,vault,"2")];
   case "WITHDRAW_TEST":return [
    transfer("VAULT",actor,ZERO,shareBurn),
    transfer("ASSET",vault,actor,"21"),
    {contract:"VAULT",name:"Withdraw",sender:actor,receiver:actor,owner:actor,
      assets:"21",shares:shareBurn}];
   default:throw Error("UNREVIEWED_EVENT_STEP");
  }
 }
 const empty={assetOwner:"0",assetVault:"0",assetAttacker:"0",sharesOwner:"0",
  sharesAttacker:"0",assetSupply:"0",sharesSupply:"0",
  vaultTotalAssets:"0",allowanceOwnerVault:"0"};
 for(let i=0;i<2;i++){
  const s=w.scenarios[i],id=i===0?"OPENZEPPELIN":"SOLMATE";
  assert.equal(s.id,id);
  assert.equal(s.burnedShares,i===0?"21":"20");
  assert.equal(s.minedReceipts,7);
  assert.equal(s.unminedControls,3);
  assert(Array.isArray(s.created)&&s.created.length===2);
  assert.equal(s.created[0].role,"ASSET");
  assert.equal(s.created[1].role,"VAULT");
  const asset=s.created[0].address,vault=s.created[1].address;
  for(const d of s.created){
   assert(hex40(d.address)&&hex32(d.runtimeKeccak256));
   assert(!seenAddress.has(low(d.address)));
   seenAddress.add(low(d.address));
   receipt(d.receipt,null,"CONSTRUCTOR");
   assert.deepEqual(d.receipt.events,[]);
  }
  assert.deepEqual(s.initialState,empty);
  assert.equal(s.steps.length,plan.experimentProgram.length);
  let state={...empty};
  for(let j=0;j<plan.experimentProgram.length;j++){
   const spec=plan.experimentProgram[j],x=s.steps[j];
   assert.equal(x.kind,spec.kind);
   assert.equal(x.method,spec.signature);
   assert.equal(x.quantity,spec.quantity);
   assert.equal(x.execution,spec.review);
   assert.deepEqual(x.before,state,"INDEPENDENT_STATE_CONTINUITY");
   const after={...state},quantity=BigInt(spec.quantity);
   let expectPreview=null,maxAvailable=null,returnValue=null;
   if(spec.kind==="MINT_TEST_ASSET"){
    after.assetOwner="100";after.assetSupply="100";
   }else if(spec.kind==="APPROVE_VAULT_ASSETS"){
    after.allowanceOwnerVault="40";
   }else if(spec.kind==="DEPOSIT_UNDERLYING"){
    after.assetOwner="60";after.assetVault="40";after.vaultTotalAssets="40";
    after.sharesOwner="40";after.sharesSupply="40";after.allowanceOwnerVault="0";
    expectPreview="40";
   }else if(spec.kind==="DIRECT_UNDERLYING_DONATION"){
    after.assetOwner="58";after.assetVault="42";after.vaultTotalAssets="42";
   }else if(spec.kind==="WITHDRAW_TEST"){
    after.assetOwner="79";after.assetVault="21";after.vaultTotalAssets="21";
    after.sharesOwner=i===0?"19":"20";after.sharesSupply=after.sharesOwner;
    expectPreview=modelShares(id,"21","40","42");
   }else if(spec.kind==="POSITIVE_AFTER"){
    maxAvailable=id==="OPENZEPPELIN"?"41":"42";
    expectPreview=modelShares(id,"41","40","42");
    returnValue=expectPreview;
   }else assert(["NEGATIVE_BEFORE","NEGATIVE_AFTER"].includes(spec.kind));
   assert.deepEqual(x.after,after,"INDEPENDENT_ECONOMIC_ACCOUNTING_CHANGED");
   assert.equal(after.assetVault,after.vaultTotalAssets);
   assert.equal(after.sharesOwner,after.sharesSupply);
   assert.equal(BigInt(after.assetOwner)+BigInt(after.assetVault)+BigInt(after.assetAttacker),
    BigInt(after.assetSupply));
   assert.equal(x.preview,expectPreview);
   assert.equal(x.maxAvailable,maxAvailable);
   assert.equal(x.returnValue,returnValue);
   if(spec.review==="MINED_REVIEWED_FIXTURE_ONLY"){
    assert.equal(x.transactionMined,true);assert.equal(x.simulation,null);
    assert.equal(x.statePreserved,false);
    receipt(x.receipt,
      ["DEPOSIT_UNDERLYING","WITHDRAW_TEST"].includes(spec.kind)?vault:asset,
      spec.signature);
    assert.deepEqual(sorted(x.receipt.events),
     sorted(expectedEvents(spec.kind,expectPreview,asset,vault)));
   }else{
    simulated++;
    assert.equal(x.transactionMined,false);
    assert.equal(x.statePreserved,true);
    assert.equal(x.receipt,null);
    const simulation=spec.kind==="POSITIVE_AFTER"?"ETH_CALL_SUCCESS":"ETH_CALL_REVERT";
    assert.equal(x.simulation,simulation);
    if(simulation==="ETH_CALL_SUCCESS")simulatedSuccess++;else rejected++;
    assert.deepEqual(x.before,x.after);
   }
   state=after;
  }
  assert.deepEqual(s.finalState,state);
  assert.deepEqual(state,{...empty,assetOwner:"79",assetVault:"21",
   sharesOwner:i===0?"19":"20",sharesSupply:i===0?"19":"20",
   assetSupply:"100",vaultTotalAssets:"21",allowanceOwnerVault:"0"});
  const withdrew=s.steps.find(x=>x.kind==="WITHDRAW_TEST");
  assert.deepEqual(s.withdrawalEventOrder,withdrew.receipt.events.map(
   e=>e.contract+":"+e.name));
  assert.deepEqual(s.withdrawalEventOrder,i===0?[
   "VAULT:Transfer","ASSET:Transfer","VAULT:Withdraw"]:
   ["VAULT:Transfer","VAULT:Withdraw","ASSET:Transfer"]);
 }
 assert.equal(mined,14);assert.equal(simulated,6);
 assert.equal(rejected,4);assert.equal(simulatedSuccess,2);
 assert.equal(seenTx.size,14);assert.equal(seenAddress.size,4);
 return {schemaVersion:"OECL_AUTO_PROPOSAL_INDEPENDENT_REVIEW_V1",
  proposalSha256:plan.proposalSha256,witnessSha256:digest(w),
  sourceBoundPlannerProposalReconstructed:true,
  automaticallySelectedDonation:2,automaticallySelectedWithdrawal:21,
  confirmedOZBurn:21,confirmedSolmateBurn:20,
  archivedReceiptsReconciled:14,unminedRevertsReconciled:4,
  unminedSuccessesReconciled:2,scopedCounterexampleValidated:true,
  humanReviewedEconomicModelsRequired:true,
  autonomyLevel:"AUTOMATIC_BOUNDED_COUNTEREXAMPLE_PARAMETER_SEARCH_ONLY",
  scientificVerdict:"INCONCLUSIVE",compatibilityVerdict:"NOT_EVALUATED",
  candidateAdmission:"NOT_ADMITTED",
  limitations:["A second runner validates the archived witness but cannot requery terminated Hardhat blocks.",
   "Reviewed source-specific share models are not autonomously learned.",
   "There is no live network execution, autonomous signing, arbitrary contract interpretation or compatibility promotion."]};
}
function reviewFiles(archived,fresh){
 const read=(dir,f)=>JSON.parse(fs.readFileSync(path.join(dir,f),"utf8"));
 const oldPlan=read(archived,"autogenerated-counterexample-proposal.json"),
  newPlan=read(fresh,"autogenerated-counterexample-proposal.json");
 assert.deepEqual(oldPlan,newPlan,"INDEPENDENT_PROPOSAL_GENERATION_DIFFERED");
 const result=review(oldPlan,read(archived,"autogenerated-counterexample-witness.json"));
 fs.writeFileSync(path.join(fresh,"autogenerated-counterexample-independent-review.json"),
  JSON.stringify(result,null,2)+"\n");
 return result;
}
if(require.main===module){
 const [archived,fresh]=process.argv.slice(2);assert(archived&&fresh);
 console.log("OECL_AUTO_PROPOSAL_INDEPENDENT_REVIEW_PASS",
  JSON.stringify(reviewFiles(path.resolve(archived),path.resolve(fresh))));
}
module.exports={review,reviewFiles};
