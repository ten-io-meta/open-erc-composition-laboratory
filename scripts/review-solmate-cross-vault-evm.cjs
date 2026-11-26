"use strict";
/**
 * Independent archived-dossier reconciliation; does not import runtime's
 * transition oracle. Fresh runner compares full preregistration separately.
 * Cannot query an ephemeral Hardhat chain after the first job terminates.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const crypto=require("node:crypto");
const {verifyPlan}=require("../laboratory/scientific-open-source-worker/SolmateCrossVaultProtocol.cjs");
const {PROGRAM,bounds,emptyState}=require("../laboratory/scientific-open-source-worker/ReusableVaultOperationGrammar.cjs");
const low=x=>String(x).toLowerCase(),hex40=x=>/^0x[0-9a-f]{40}$/i.test(x),hex32=x=>/^0x[0-9a-f]{64}$/i.test(x);
const hash=x=>crypto.createHash("sha256").update(JSON.stringify(x)).digest("hex");
const ZERO="0x"+"0".repeat(40);
function semanticEvents(step,actors,preview){
 const {owner,vault}=actors;
 const transfer=(contract,from,to,amount)=>({contract,name:"Transfer",from,to,amount});
 const approval=amount=>({contract:"ASSET",name:"Approval",from:owner,to:vault,amount});
 switch(step.op){
  case "FUND_ASSET":return [transfer("ASSET",ZERO,owner,"100")];
  case "ALLOW":return [approval(step.id==="APPROVE_DEPOSIT"?"40":"101")];
  case "CUSTODY_IN":return [approval("0"),transfer("ASSET",owner,vault,"40"),
    transfer("VAULT",ZERO,owner,preview.shares),
    {contract:"VAULT",name:"Deposit",sender:owner,receiver:owner,assets:"40",shares:preview.shares}];
  case "CUSTODY_OUT":return [transfer("VAULT",owner,ZERO,preview.shares),
    transfer("ASSET",vault,owner,"15"),
    {contract:"VAULT",name:"Withdraw",sender:owner,receiver:owner,owner,
     assets:"15",shares:preview.shares}];
  case "REVERT":return [];
  default:throw Error("UNREVIEWED_SEMANTIC_EVENT");
 }
}
const comparable=events=>events.map(x=>JSON.stringify(x).toLowerCase()).sort();
function review(plan,w){
 assert(verifyPlan(plan));
 assert.equal(plan.status,"REVIEWED_CROSS_IMPLEMENTATION_PROGRAM");
 assert.equal(w?.schemaVersion,"OECL_SOLMATE_VAULT_COMPARISON_WITNESS_V1");
 assert.equal(w.planSha256,plan.planSha256);
 assert.equal(w.chainId,31337);assert.equal(w.providerScope,"EPHEMERAL_LOCAL_HARDHAT_RECHECKED");
 assert.equal(w.twoIndependentVaultCodebasesObserved,true);
 assert.equal(w.sameTypedGrammarProgramAcrossImplementations,true);
 assert.equal(w.arbitrarySolidityExecutionEnabled,false);
 assert.equal(w.testOnlyMintUsed,true);
 assert.equal(w.scientificVerdict,"INCONCLUSIVE");
 assert.equal(w.compatibilityVerdict,"NOT_EVALUATED");
 assert.equal(w.candidateAdmission,"NOT_ADMITTED");
 assert.equal(w.minedReceipts,14);assert.equal(w.unminedControls,8);
 assert(hex40(w.actors?.owner)&&hex40(w.actors?.attacker));
 assert.notEqual(low(w.actors.owner),low(w.actors.attacker));
 assert(Array.isArray(w.scenarios)&&w.scenarios.length===2);
 const seenTx=new Set(),seenAddress=new Set();
 let lastBlock=0,mined=0,unmined=0;
 function receipt(r,target,method){
  assert(r&&hex32(r.txHash)&&hex32(r.blockHash));
  assert(!seenTx.has(low(r.txHash)),"REPLAYED_LOCAL_TRANSACTION");
  seenTx.add(low(r.txHash));mined++;
  assert(Number.isSafeInteger(r.blockNumber)&&r.blockNumber>lastBlock,"BLOCK_ORDER_CHANGED");
  lastBlock=r.blockNumber;
  assert(r.transactionMined===true&&r.status===1);
  assert(BigInt(r.gasUsed)>0n&&BigInt(r.gasUsed)<=BigInt(bounds.maxGasPerTransaction));
  assert(low(r.from)===low(w.actors.owner));
  assert.equal(r.to===null?null:low(r.to),target===null?null:low(target));
  assert.equal(r.method,method);
  assert(method==="CONSTRUCTOR"?
   r.methodSelector==="CREATE":/^0x[0-9a-f]{8}$/i.test(r.methodSelector));
  assert(Array.isArray(r.events));
 }
 for(let i=0;i<2;i++){
  const scenario=w.scenarios[i],descriptor=plan.variants[i];
  assert.equal(scenario.id,descriptor.id);
  assert.equal(scenario.source,descriptor.source);
  assert.equal(scenario.minedReceipts,7);
  assert.equal(scenario.unminedControls,4);
  assert(Array.isArray(scenario.created)&&scenario.created.length===2);
  const [assetDep,vaultDep]=scenario.created;
  assert.equal(assetDep.role,"ASSET");assert.equal(vaultDep.role,"VAULT");
  for(const d of scenario.created){
   assert(hex40(d.address)&&hex32(d.runtimeKeccak256));
   assert(!seenAddress.has(low(d.address)),"SHARED_CONTRACT_ADDRESS");
   seenAddress.add(low(d.address));
   receipt(d.receipt,null,"CONSTRUCTOR");
   assert.deepEqual(d.receipt.events,[]);
  }
  const vault=vaultDep.address,owner=w.actors.owner;
  const actors={owner,vault};
  assert.deepEqual(scenario.initialState,emptyState());
  let ledger=emptyState(),locallyMined=0,locallyUnmined=0;
  assert(scenario.steps.length===PROGRAM.length);
  for(let j=0;j<PROGRAM.length;j++){
   const s=scenario.steps[j],spec=PROGRAM[j];
   for(const k of ["id","op","role","target","signature","execution"])
    assert.equal(s[k],spec[k],"REVIEWED_GRAMMAR_SUBSTITUTED");
   assert.deepEqual(s.args,spec.args);
   assert.deepEqual(s.before,ledger,"LEDGER_DISCONTINUITY");
   const after={...ledger};
   switch(spec.op){
    case "FUND_ASSET":
     after.assetOwner="100";after.assetSupply="100";break;
    case "ALLOW":
     after.allowanceOwnerVault=spec.id==="APPROVE_DEPOSIT"?"40":"101";break;
    case "CUSTODY_IN":
     after.assetOwner="60";after.assetVault="40";
     after.sharesOwner="40";after.sharesSupply="40";after.vaultTotalAssets="40";
     after.allowanceOwnerVault="0";break;
    case "CUSTODY_OUT":
     after.assetOwner="75";after.assetVault="25";
     after.sharesOwner="25";after.sharesSupply="25";after.vaultTotalAssets="25";break;
    case "REVERT":break;
    default:throw Error("UNKNOWN_REVIEW_OPCODE");
   }
   assert.deepEqual(s.after,after,"ASSET_SHARE_ACCOUNTING_MISMATCH");
   assert.equal(BigInt(s.after.assetOwner)+BigInt(s.after.assetVault)+
    BigInt(s.after.assetAttacker),BigInt(s.after.assetSupply),"TOKEN_SUPPLY_NOT_CONSERVED");
   assert.equal(s.after.assetVault,s.after.vaultTotalAssets);
   assert.equal(s.after.sharesSupply,s.after.sharesOwner);
   if(spec.preview){
    assert.deepEqual(s.preview,{method:spec.preview,
     assets:spec.op==="CUSTODY_IN"?"40":"15",
     shares:spec.op==="CUSTODY_IN"?"40":"15"});
   }else assert.equal(s.preview,null);
   if(spec.execution==="MINED"){
    locallyMined++;
    assert.equal(s.transactionMined,true);
    assert.equal(s.simulation,null);assert.equal(s.statePreserved,null);
    receipt(s.receipt,s.target==="ASSET"?assetDep.address:vaultDep.address,spec.signature);
    assert.deepEqual(comparable(s.receipt.events),comparable(semanticEvents(spec,actors,s.preview)),
     "FORGED_TYPED_VAULT_EVENTS");
   }else{
    locallyUnmined++;unmined++;
    assert.equal(s.transactionMined,false);
    assert.equal(s.receipt,null);
    assert.equal(s.simulation,"ETH_CALL_REVERT");
    assert.equal(s.statePreserved,true);
    assert.deepEqual(s.before,s.after);
   }
   ledger=after;
  }
  assert.equal(locallyMined,5);assert.equal(locallyUnmined,4);
  assert.deepEqual(scenario.finalState,ledger);
  assert.deepEqual(ledger,{...emptyState(),assetOwner:"75",assetVault:"25",
   assetSupply:"100",sharesOwner:"25",sharesSupply:"25",
   vaultTotalAssets:"25",allowanceOwnerVault:"101"});
  const withdraw=scenario.steps.find(x=>x.id==="WITHDRAW");
  assert.deepEqual(scenario.withdrawEventOrder,
   withdraw.receipt.events.map(e=>e.contract+":"+e.name));
  const semanticWithdrawOrder=i===0?
    ["VAULT:Transfer","ASSET:Transfer","VAULT:Withdraw"]:
    ["VAULT:Transfer","VAULT:Withdraw","ASSET:Transfer"];
  assert.deepEqual(scenario.withdrawEventOrder,semanticWithdrawOrder,
   "IMPLEMENTATION_LOG_ORDER_NOT_REPRODUCED");
 }
 assert.equal(mined,14);assert.equal(unmined,8);
 assert.equal(seenTx.size,14);assert.equal(seenAddress.size,4);
 return {schemaVersion:"OECL_SOLMATE_INDEPENDENT_COMPARISON_REVIEW_V1",
  planSha256:plan.planSha256,witnessSha256:hash(w),
  implementations:["OPENZEPPELIN_4_9_6","SOLMATE_89365b8"],
  minedLocalReceipts:14,unminedNegativeSimulations:8,
  sourceComparison:"TWO_PINNED_DIFFERENT_CODEBASES",
  verifiedLedgerAndTypedEvents:true,
  withdrawEventOrderDifferenceObserved:true,
  reusedIdenticalOperationProgram:true,
  scientificVerdict:"INCONCLUSIVE",compatibilityVerdict:"NOT_EVALUATED",
  candidateAdmission:"NOT_ADMITTED",
  limitations:["Independent review recompiles source and checks archived math but cannot requery terminated Hardhat blocks.",
    "Only one simple vault fixture of each implementation was tested; no universal compatibility claimed.",
    "AGPL licensed Solmate dependency remains external and pinned; legal distribution terms must be reviewed."]};
}
function reviewFiles(archived,independent){
 const read=(dir,file)=>JSON.parse(fs.readFileSync(path.join(dir,file),"utf8"));
 const a=read(archived,"solmate-grammar-plan.json");
 const b=read(independent,"solmate-grammar-plan.json");
 assert.deepEqual(a,b,"FRESH_SOURCE_COMPILATION_OR_PROGRAM_DIFFERS");
 const result=review(a,read(archived,"solmate-grammar-witness.json"));
 fs.writeFileSync(path.join(independent,"solmate-independent-review.json"),
  JSON.stringify(result,null,2)+"\n");
 return result;
}
if(require.main===module){
 const [archived,independent]=process.argv.slice(2);
 assert(archived&&independent);
 console.log("OECL_SOLMATE_INDEPENDENT_COMPARISON_PASS",
  JSON.stringify(reviewFiles(path.resolve(archived),path.resolve(independent))));
}
module.exports={review,reviewFiles};
