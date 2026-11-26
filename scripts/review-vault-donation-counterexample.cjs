"use strict";
/** Independent economic hypothesis reviewer, separate from the runtime reducer. */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const crypto=require("node:crypto");
const {verifyPlan,PROGRAM,BOUNDS,emptyState}=require(
 "../laboratory/scientific-open-source-worker/VaultDonationCounterexample.cjs");
const sha=x=>crypto.createHash("sha256").update(JSON.stringify(x)).digest("hex");
const ZERO="0x"+"0".repeat(40),lower=x=>String(x).toLowerCase();
const hex40=x=>typeof x==="string"&&/^0x[0-9a-f]{40}$/i.test(x);
const hex32=x=>typeof x==="string"&&/^0x[0-9a-f]{64}$/i.test(x);
const comparable=es=>es.map(e=>JSON.stringify(e).toLowerCase()).sort();
function independentEvents(step,actors,preview){
 const {owner,vault}=actors;
 const trans=(contract,from,to,amount)=>({contract,name:"Transfer",from,to,amount});
 const approve=amount=>({contract:"ASSET",name:"Approval",from:owner,to:vault,amount});
 switch(step.op){
  case "FUND_ASSET":return [trans("ASSET",ZERO,owner,"100")];
  case "ALLOW":return [approve(step.id==="APPROVE_DEPOSIT"?"40":"101")];
  case "CUSTODY_IN":return [approve("0"),trans("ASSET",owner,vault,"40"),
   trans("VAULT",ZERO,owner,"40"),{contract:"VAULT",name:"Deposit",
    sender:owner,receiver:owner,assets:"40",shares:"40"}];
  case "DONATE_ASSET":return [trans("ASSET",owner,vault,"20")];
  case "CUSTODY_OUT":return [
   trans("VAULT",owner,ZERO,preview.shares),
   trans("ASSET",vault,owner,"15"),
   {contract:"VAULT",name:"Withdraw",sender:owner,receiver:owner,
    owner,assets:"15",shares:preview.shares}];
  case "REVERT":
  case "EXPECT_SUCCESS":return [];
  default:throw Error("UNREVIEWED_INDEPENDENT_EVENT_OPCODE");
 }
}
function review(plan,w){
 assert(verifyPlan(plan),"PREREGISTERED_DONATION_PLAN_INVALID");
 assert.equal(plan.status,"PREREGISTERED_DONATION_COUNTEREXAMPLE");
 assert.equal(w?.schemaVersion,"OECL_VAULT_DONATION_COUNTEREXAMPLE_WITNESS_V1");
 assert.equal(w.planSha256,plan.planSha256);
 assert.equal(w.chainId,31337);
 assert.equal(w.providerScope,"EPHEMERAL_LOCAL_HARDHAT_RECHECKED");
 assert.equal(w.arbitrarySolidityExecutionEnabled,false);
 assert.equal(w.testOnlyMintUsed,true);
 assert.equal(w.twoIndependentVaultCodebasesObserved,true);
 assert.equal(w.sameTypedGrammarProgramAcrossImplementations,true);
 assert.equal(w.candidateAdmission,"NOT_ADMITTED");
 assert.equal(w.compatibilityVerdict,"NOT_EVALUATED");
 assert.equal(w.scientificVerdict,"INCONCLUSIVE");
 assert.equal(w.minedReceipts,16);
 assert.equal(w.unminedControls,10);
 assert.equal(w.unminedSuccesses,2);
 assert.equal(w.scopedHypothesis?.id,plan.hypothesis.id);
 assert.equal(w.scopedHypothesis?.verdict,"REFUTED_IN_LOCAL_TEST_FIXTURES");
 assert.equal(w.scopedHypothesis?.openzeppelinWithdrawBurn,"11");
 assert.equal(w.scopedHypothesis?.solmateWithdrawBurn,"10");
 assert.equal(w.scopedHypothesis?.claimScope,
  "EQUAL_SHARE_BURN_FOR_15_ASSETS_AFTER_20_ASSET_DONATION");
 assert(hex40(w.actors?.owner)&&hex40(w.actors?.attacker));
 assert.notEqual(lower(w.actors.owner),lower(w.actors.attacker));
 assert(Array.isArray(w.scenarios)&&w.scenarios.length===2);
 let prevBlock=0,receipts=0,reverts=0,successSims=0;
 const usedTx=new Set(),usedAddress=new Set();
 function receipt(r,to,method){
  assert(r&&hex32(r.txHash)&&hex32(r.blockHash));
  assert(!usedTx.has(lower(r.txHash)),"REUSED_TX_HASH");
  usedTx.add(lower(r.txHash));receipts++;
  assert(Number.isSafeInteger(r.blockNumber)&&r.blockNumber>prevBlock,"INVALID_BLOCK_ORDER");
  prevBlock=r.blockNumber;
  assert.equal(r.status,1);assert.equal(r.transactionMined,true);
  assert(BigInt(r.gasUsed)>0n&&BigInt(r.gasUsed)<=3000000n);
  assert.equal(lower(r.from),lower(w.actors.owner));
  assert.equal(r.to===null?null:lower(r.to),to===null?null:lower(to));
  assert.equal(r.method,method);
  if(method==="CONSTRUCTOR")assert.equal(r.methodSelector,"CREATE");
  else{
   assert(/^0x[0-9a-f]{8}$/i.test(r.methodSelector));
   const selectors={
    "transfer(address,uint256)":"0xa9059cbb",
    "approve(address,uint256)":"0x095ea7b3",
    "deposit(uint256,address)":"0x6e553f65",
    "withdraw(uint256,address,address)":"0xb460af94"
   };
   if(selectors[method])assert.equal(lower(r.methodSelector),selectors[method]);
  }
  assert(Array.isArray(r.events));
 }
 for(let i=0;i<2;i++){
  const variant=plan.variants[i],s=w.scenarios[i];
  assert.equal(s.id,variant.id);
  assert.equal(s.source,variant.source);
  assert.equal(s.minedReceipts,8);
  assert.equal(s.unminedControls,5);
  assert.equal(s.unminedSuccesses,1);
  assert(Array.isArray(s.created)&&s.created.length===2);
  const [ad,vd]=s.created;
  assert.equal(ad.role,"ASSET");assert.equal(vd.role,"VAULT");
  for(const d of s.created){
   assert(hex40(d.address)&&hex32(d.runtimeKeccak256));
   assert(!usedAddress.has(lower(d.address)),"REUSED_CONTRACT_ADDRESS");
   usedAddress.add(lower(d.address));
   receipt(d.receipt,null,"CONSTRUCTOR");
   assert.deepEqual(d.receipt.events,[]);
  }
  const actors={owner:w.actors.owner,vault:vd.address},asset=ad.address;
  assert.deepEqual(s.initialState,emptyState());
  assert(Array.isArray(s.steps)&&s.steps.length===PROGRAM.length);
  let state=emptyState();
  let localMined=0,localRevert=0,localSuccess=0;
  const burn=i===0?"11":"10", finalShares=i===0?"29":"30";
  const maxWithdraw=i===0?"59":"60";
  for(let j=0;j<PROGRAM.length;j++){
   const step=s.steps[j],spec=PROGRAM[j];
   for(const key of ["id","op","role","target","signature","execution"])
    assert.equal(step[key],spec[key],"CHANGED_PROGRAM_STEP");
   assert.deepEqual(step.args,spec.args,"CHANGED_PROGRAM_ARGUMENTS");
   assert.deepEqual(step.before,state,"LEDGER_DISCONTINUITY");
   const after={...state};
   switch(spec.op){
    case "FUND_ASSET":after.assetOwner="100";after.assetSupply="100";break;
    case "ALLOW":after.allowanceOwnerVault=
      spec.id==="APPROVE_DEPOSIT"?"40":"101";break;
    case "CUSTODY_IN":
     after.assetOwner="60";after.assetVault="40";
     after.vaultTotalAssets="40";after.allowanceOwnerVault="0";
     after.sharesOwner="40";after.sharesSupply="40";break;
    case "DONATE_ASSET":
     after.assetOwner="40";after.assetVault="60";
     after.vaultTotalAssets="60";break;
    case "CUSTODY_OUT":
     after.assetOwner="55";after.assetVault="45";
     after.vaultTotalAssets="45";
     after.sharesOwner=finalShares;after.sharesSupply=finalShares;break;
    case "REVERT":
    case "EXPECT_SUCCESS":break;
    default:throw Error("UNREVIEWED_ECONOMIC_REVIEW_OPCODE");
   }
   assert.deepEqual(step.after,after,"FORGED_ECONOMIC_BALANCE_TRANSITION");
   assert.equal(after.assetVault,after.vaultTotalAssets);
   assert.equal(after.sharesOwner,after.sharesSupply);
   assert.equal(BigInt(after.assetOwner)+BigInt(after.assetVault)+BigInt(after.assetAttacker),
    BigInt(after.assetSupply),"BROKEN_ASSET_CONSERVATION");
   const expectedPreview=spec.preview?
    {method:spec.preview,assets:spec.op==="CUSTODY_IN"?"40":
      spec.op==="CUSTODY_OUT"?"15":"41",
     shares:spec.op==="CUSTODY_IN"?"40":
      spec.op==="CUSTODY_OUT"?burn:"28"}:null;
   assert.deepEqual(step.preview,expectedPreview,"FORGED_ECONOMIC_PREVIEW");
   assert.equal(step.maxWithdraw,
    spec.id==="POST_DONATION_WITHDRAW41_POSSIBLE"?maxWithdraw:null);
   if(spec.execution==="MINED"){
    localMined++;
    assert.equal(step.transactionMined,true);
    assert.equal(step.simulation,null);assert.equal(step.statePreserved,null);
    receipt(step.receipt,spec.target==="ASSET"?asset:vd.address,spec.signature);
    assert.deepEqual(comparable(step.receipt.events),
      comparable(independentEvents(spec,actors,expectedPreview)),
      "FORGED_TRANSFER_APPROVAL_OR_VAULT_EVENT");
   }else{
    assert.equal(step.transactionMined,false);
    assert.equal(step.receipt,null);assert.equal(step.statePreserved,true);
    assert.deepEqual(step.before,step.after);
    if(spec.execution==="UNMINED_REVERT"){
     localRevert++;reverts++;assert.equal(step.simulation,"ETH_CALL_REVERT");
    }else if(spec.execution==="UNMINED_SUCCESS"){
     localSuccess++;successSims++;assert.equal(step.simulation,"ETH_CALL_SUCCESS");
    }else throw Error("UNREVIEWED_SIMULATION_TYPE");
   }
   state=after;
  }
  assert.equal(localMined,6);assert.equal(localRevert,5);assert.equal(localSuccess,1);
  assert.deepEqual(s.finalState,state);
  assert.deepEqual(state,{...emptyState(),assetOwner:"55",assetVault:"45",
   sharesOwner:finalShares,sharesSupply:finalShares,assetSupply:"100",
   vaultTotalAssets:"45",allowanceOwnerVault:"101"});
  const withdraw=s.steps.find(x=>x.id==="WITHDRAW");
  assert.deepEqual(s.withdrawEventOrder,
   withdraw.receipt.events.map(x=>x.contract+":"+x.name));
  assert.deepEqual(s.withdrawEventOrder,i===0?
   ["VAULT:Transfer","ASSET:Transfer","VAULT:Withdraw"]:
   ["VAULT:Transfer","VAULT:Withdraw","ASSET:Transfer"]);
 }
 assert.equal(receipts,16);assert.equal(reverts,10);assert.equal(successSims,2);
 assert.equal(usedAddress.size,4);assert.equal(usedTx.size,16);
 return {schemaVersion:"OECL_INDEPENDENT_DONATION_ECONOMICS_REVIEW_V1",
  planSha256:plan.planSha256,witnessSha256:sha(w),
  sourcePlanSha256:plan.basePlanSha256,
  minedReceipts:16,unminedReverts:10,unminedSuccessfulCalls:2,
  changeInWithdrawValidityAfterDonation:true,
  independentShareAccountingChecked:true,
  equalShareBurnHypothesis:"REFUTED_IN_LOCAL_TEST_FIXTURES",
  ozBurnedShares:"11",solmateBurnedShares:"10",
  scopedResult:"DIFFERENT_ROUNDING_FOR_IDENTICAL_WITHDRAW_ASSETS_AFTER_DONATION",
  scientificVerdict:"INCONCLUSIVE",compatibilityVerdict:"NOT_EVALUATED",
  candidateAdmission:"NOT_ADMITTED",
  limitations:[
   "A scoped falsification about share burn does not decide broad ERC compatibility.",
   "The success and failure controls are eth_call simulations, not mined transactions.",
   "Second-runner archives cannot independently access destroyed local EVM chain history."
  ]};
}
function reviewFiles(archive,repro){
 const read=(dir,file)=>JSON.parse(fs.readFileSync(path.join(dir,file),"utf8"));
 const a=read(archive,"vault-donation-plan.json"),b=read(repro,"vault-donation-plan.json");
 assert.deepEqual(a,b,"INDEPENDENT_COMPILER_OR_PLAN_DIFFERENCE");
 const result=review(a,read(archive,"vault-donation-witness.json"));
 fs.writeFileSync(path.join(repro,"vault-donation-independent-review.json"),
  JSON.stringify(result,null,2)+"\n");
 return result;
}
if(require.main===module){
 const [archive,repro]=process.argv.slice(2);assert(archive&&repro);
 console.log("OECL_DONATION_INDEPENDENT_REVIEW_PASS",
  JSON.stringify(reviewFiles(path.resolve(archive),path.resolve(repro))));
}
module.exports={review,reviewFiles};
