import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

/**
 * Portable witness-level verification for the reviewed ERC4626 donation case.
 * Reconstructs the program's economic ledger and control outcomes from four
 * independently supplied JSON documents. No OECL runtime/executor imports.
 * This reads historical local EVM RECEIPT ARCHIVES, not Ethereum consensus.
 */
const hash=x=>createHash("sha256").update(JSON.stringify(x)).digest("hex");
const is64=x=>typeof x==="string"&&/^[a-f0-9]{64}$/.test(x);
const tx32=x=>typeof x==="string"&&/^0x[a-f0-9]{64}$/i.test(x);
const addr=x=>typeof x==="string"&&/^0x[a-f0-9]{40}$/i.test(x);
const low=x=>String(x).toLowerCase();
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const ZERO="0x"+"0".repeat(40);
const origProposalSha="bc7c0474f659057b1e3854d25f90ff47141805655c827c74837b032143532e74";
const historicDigests={
 proposal:"22f8ea9d0c1ce5da9ee03786acd36788d25d4e6a44d1e06f861134a84e87941a",
 first:"eab4261ed3c206460b2b48c8f838035f8032107b914bc2dee8cbd8d408e53271",
 second:"4b92ed5d276786d4b54b93f9554fb4797746844bc36ce3ebe7730caffc2c694f",
 comparison:"13b5ae18135a56ecf66a0b5b849eb634561669b7e123ee6bcc67d951721ba809",
};
const reviewers=["OPENZEPPELIN","SOLMATE"];
const stepNames=["MINT_TEST_ASSET","APPROVE_VAULT_ASSETS","DEPOSIT_UNDERLYING",
 "NEGATIVE_BEFORE","DIRECT_UNDERLYING_DONATION","POSITIVE_AFTER",
 "NEGATIVE_AFTER","WITHDRAW_TEST"];
const stepAmounts=["100","40","40","41","2","41","43","21"];
const stepSignatures=["oeclResearchMint(address,uint256)","approve(address,uint256)",
 "deposit(uint256,address)","withdraw(uint256,address,address)",
 "transfer(address,uint256)","withdraw(uint256,address,address)",
 "withdraw(uint256,address,address)","withdraw(uint256,address,address)"];
const selectors={
 "approve(address,uint256)":"0x095ea7b3",
 "deposit(uint256,address)":"0x6e553f65",
 "transfer(address,uint256)":"0xa9059cbb",
 "withdraw(uint256,address,address)":"0xb460af94",
};
const encoded=(x,key)=>{assert(/^[0-9]+$/.test(x),key+":NEGATIVE_OR_INVALID_QUANTITY");return BigInt(x);};
function stateTransition(s,kind,quantity,shareAmount){
 const state={...s},n=encoded(quantity,"instruction");
 const apply=(key,delta)=>{
  const v=encoded(state[key],key)+delta;
  assert(v>=0n,"TOKEN_ACCOUNTING_UNDERFLOW");state[key]=v.toString();
 };
 switch(kind){
  case "MINT_TEST_ASSET":apply("assetOwner",n);apply("assetSupply",n);break;
  case "APPROVE_VAULT_ASSETS":state.allowanceOwnerVault=quantity;break;
  case "DEPOSIT_UNDERLYING":
   apply("assetOwner",-n);apply("assetVault",n);apply("vaultTotalAssets",n);
   apply("sharesOwner",BigInt(shareAmount));apply("sharesSupply",BigInt(shareAmount));
   state.allowanceOwnerVault="0";break;
  case "DIRECT_UNDERLYING_DONATION":
   apply("assetOwner",-n);apply("assetVault",n);apply("vaultTotalAssets",n);break;
  case "WITHDRAW_TEST":
   apply("assetOwner",n);apply("assetVault",-n);apply("vaultTotalAssets",-n);
   apply("sharesOwner",-BigInt(shareAmount));apply("sharesSupply",-BigInt(shareAmount));break;
  case "NEGATIVE_BEFORE":case "POSITIVE_AFTER":case "NEGATIVE_AFTER":break;
  default:throw Error("UNREVIEWED_OPERATION_KIND");
 }
 assert.equal(state.assetVault,state.vaultTotalAssets);
 assert.equal(state.sharesOwner,state.sharesSupply);
 assert.equal(encoded(state.assetOwner,"assetOwner")+
  encoded(state.assetVault,"assetVault")+encoded(state.assetAttacker,"assetAttacker"),
  encoded(state.assetSupply,"assetSupply"));
 return state;
}
const zero=()=>({assetOwner:"0",assetVault:"0",assetAttacker:"0",
 sharesOwner:"0",sharesAttacker:"0",assetSupply:"0",sharesSupply:"0",
 vaultTotalAssets:"0",allowanceOwnerVault:"0"});
const events=(kind,owner,vault,q,burn)=>{
 const tr=(contract,from,to,amount)=>({contract,name:"Transfer",from,to,amount});
 if(kind==="MINT_TEST_ASSET")return [tr("ASSET",ZERO,owner,q)];
 if(kind==="APPROVE_VAULT_ASSETS")
  return [{contract:"ASSET",name:"Approval",from:owner,to:vault,amount:q}];
 if(kind==="DEPOSIT_UNDERLYING")return [
  {contract:"ASSET",name:"Approval",from:owner,to:vault,amount:"0"},
  tr("ASSET",owner,vault,"40"),tr("VAULT",ZERO,owner,"40"),
  {contract:"VAULT",name:"Deposit",sender:owner,receiver:owner,assets:"40",shares:"40"},
 ];
 if(kind==="DIRECT_UNDERLYING_DONATION")return [tr("ASSET",owner,vault,q)];
 if(kind==="WITHDRAW_TEST")return [
  tr("VAULT",owner,ZERO,burn),tr("ASSET",vault,owner,q),
  {contract:"VAULT",name:"Withdraw",sender:owner,receiver:owner,owner,
   assets:q,shares:burn},
 ];
 throw Error("UNEXPECTED_MINED_EVENT");
};
const role=(s,owner,vault)=>{
 const k=low(s);
 if(k===low(owner))return "OWNER";
 if(k===low(vault))return "VAULT";
 if(k===ZERO)return "ZERO";
 throw Error("UNREVIEWED_EVM_EVENT_ACTOR");
};
const semanticEvents=(receipt,owner,vault)=>receipt.events.map(e=>{
 assert(["Transfer","Approval","Deposit","Withdraw"].includes(e.name));
 assert(["ASSET","VAULT"].includes(e.contract));
 const o={contract:e.contract,name:e.name};
 if(["Transfer","Approval"].includes(e.name)){
  o.from=role(e.from,owner,vault);o.to=role(e.to,owner,vault);o.amount=e.amount;
 }else{
  o.sender=role(e.sender,owner,vault);o.receiver=role(e.receiver,owner,vault);
  if(e.name==="Withdraw")o.owner=role(e.owner,owner,vault);
  o.assets=e.assets;o.shares=e.shares;
 }
 return o;
});
function auditWitness(plan,witness,second,runId){
 assert.equal(witness.schemaVersion,second?
  "OECL_INDEPENDENT_SECOND_LOCAL_EVM_WITNESS_V1":
  "OECL_AUTOMATIC_PROPOSAL_LOCAL_WITNESS_V1");
 assert.equal(witness.reviewGate,second?
  "EXACT_SOURCE_CI_SECOND_JOB_LOCAL_ONLY":"REVIEWED_SOURCE_CI_GATE_V1_LOCAL_ONLY");
 if(second){
  assert.equal(witness.ciJob,"independent-local-evm-replay");
  assert.equal(witness.ciRunId,runId);
  assert.equal(witness.independentRunnerImplementation,true);
  assert.equal(witness.independentEvmExecution,true);
  assert.equal(witness.independentEthereumConsensus,false);
  assert.equal(witness.independentSourceOriginAuthentication,false);
 }else{
  assert.equal(witness.generatedCaseSelected,true);
  assert.equal(witness.sourceEconomicModelsManuallyReviewed,true);
 }
 assert.equal(witness.chainId,31337);
 assert.equal(witness.proposalSha256,plan.proposalSha256);
 assert.equal(witness.provenanceSha256,hash(plan.provenance));
 assert.equal(witness.minedReceipts,14);
 assert.equal(witness.unminedControls,6);
 assert.equal(witness.unminedExpectedReverts,4);
 assert.equal(witness.unminedExpectedSuccesses,2);
 assert.equal(witness.hypothesis.id,plan.falsifiableHypothesis.id);
 assert.equal(witness.hypothesis.verdict,"REFUTED_IN_THESE_LOCAL_EVM_FIXTURES");
 assert.equal(witness.hypothesis.ozBurnedShares,"21");
 assert.equal(witness.hypothesis.solmateBurnedShares,"20");
 assert.equal(witness.overallScientificVerdict,"INCONCLUSIVE");
 assert.equal(witness.compatibilityVerdict,"NOT_EVALUATED");
 assert.equal(witness.candidateAdmission,"NOT_ADMITTED");
 const actors=witness.actors;
 assert(addr(actors.owner)&&addr(actors.attacker)&&low(actors.owner)!==low(actors.attacker));
 assert(Array.isArray(witness.scenarios)&&witness.scenarios.length===2);
 const seenTx=new Set(),seenDeployment=new Set();
 let lastBlock=0,receipts=0,controls=0;
 function receipt(r,target,method){
  assert(r&&tx32(r.txHash)&&tx32(r.blockHash));
  assert(!seenTx.has(low(r.txHash)));seenTx.add(low(r.txHash));
  assert(r.transactionMined===true&&r.status===1);
  assert(Number.isSafeInteger(r.blockNumber)&&r.blockNumber>lastBlock);
  lastBlock=r.blockNumber;
  const gas=encoded(r.gasUsed,"gasUsed");assert(gas>0n&&gas<=3000000n);
  assert.equal(low(r.from),low(actors.owner));
  assert.equal(r.to===null?null:low(r.to),target===null?null:low(target));
  assert.equal(r.method,method);
  assert.equal(low(r.methodSelector),method==="CONSTRUCTOR"?"create":
   selectors[method]??r.methodSelector.toLowerCase());
  assert(Array.isArray(r.events));receipts++;
 }
 const normalized=[];
 for(let i=0;i<2;i++){
  const sc=witness.scenarios[i],implementation=reviewers[i];
  assert.equal(sc.id,implementation);
  assert.equal(sc.burnedShares,i===0?"21":"20");
  assert.equal(sc.minedReceipts,7);assert.equal(sc.unminedControls,3);
  assert(Array.isArray(sc.created)&&sc.created.length===2);
  const asset=sc.created[0],vault=sc.created[1];
  assert.equal(asset.role,"ASSET");assert.equal(vault.role,"VAULT");
  for(const item of sc.created){
   assert(addr(item.address)&&tx32(item.runtimeKeccak256));
   assert(!seenDeployment.has(low(item.address)));
   seenDeployment.add(low(item.address));
   receipt(item.receipt,null,"CONSTRUCTOR");
   assert.deepEqual(item.receipt.events,[]);
  }
  assert.deepEqual(sc.initialState,zero());
  assert(Array.isArray(sc.steps)&&sc.steps.length===8);
  let state=zero();
  const fingerprint=[];
  for(let j=0;j<8;j++){
   const step=sc.steps[j],name=stepNames[j],q=stepAmounts[j],
    method=stepSignatures[j],spec=plan.experimentProgram[j];
   assert.equal(step.kind,name);assert.equal(step.quantity,q);
   assert.equal(step.method,method);assert.equal(spec.kind,name);
   assert.equal(spec.quantity,q);assert.equal(spec.signature,method);
   assert.equal(step.execution,spec.review);
   assert.deepEqual(step.before,state);
   let expectedPreview=null,expectedMax=null,expectedReturn=null;
   if(name==="DEPOSIT_UNDERLYING")expectedPreview="40";
   if(name==="WITHDRAW_TEST")expectedPreview=i===0?"21":"20";
   if(name==="POSITIVE_AFTER"){
    expectedPreview="40";expectedMax=i===0?"41":"42";expectedReturn="40";
   }
   assert.equal(step.preview,expectedPreview);
   assert.equal(step.maxAvailable,expectedMax);
   assert.equal(step.returnValue,expectedReturn);
   const expected=stateTransition(state,name,q,expectedPreview);
   assert.deepEqual(step.after,expected);
   const mined=spec.review==="MINED_REVIEWED_FIXTURE_ONLY";
   assert.equal(step.transactionMined,mined);
   assert.equal(step.statePreserved,!mined);
   if(mined){
    assert.equal(step.simulation,null);
    const target=["DEPOSIT_UNDERLYING","WITHDRAW_TEST"].includes(name)?
     vault.address:asset.address;
    receipt(step.receipt,target,method);
    const expectedTyped=events(name,actors.owner,vault.address,q,expectedPreview);
    assert.deepEqual(step.receipt.events.map(x=>JSON.stringify(x).toLowerCase()).sort(),
     expectedTyped.map(x=>JSON.stringify(x).toLowerCase()).sort());
    fingerprint.push({step:name,events:semanticEvents(step.receipt,actors.owner,vault.address)});
   }else{
    controls++;
    assert.equal(step.receipt,null);
    assert.equal(step.simulation,name==="POSITIVE_AFTER"?
      "ETH_CALL_SUCCESS":"ETH_CALL_REVERT");
    assert.deepEqual(step.before,step.after);
    fingerprint.push({step:name,simulation:step.simulation});
   }
   fingerprint[j].state=expected;
   fingerprint[j].preview=step.preview;
   fingerprint[j].maxAvailable=step.maxAvailable;
   fingerprint[j].returnValue=step.returnValue;
   state=expected;
  }
  assert.deepEqual(sc.finalState,state);
  assert.equal(state.assetOwner,"79");assert.equal(state.assetVault,"21");
  assert.equal(state.sharesOwner,i===0?"19":"20");
  assert.equal(state.assetSupply,"100");
  const withdraw=sc.steps[7].receipt;
  assert.deepEqual(sc.withdrawalEventOrder,
   withdraw.events.map(e=>e.contract+":"+e.name));
  normalized.push({implementation,assetRuntime:asset.runtimeKeccak256,
   vaultRuntime:vault.runtimeKeccak256,burnedShares:sc.burnedShares,
   initialState:sc.initialState,finalState:state,fingerprint});
 }
 assert.equal(receipts,14);assert.equal(controls,6);
 assert.equal(seenTx.size,14);assert.equal(seenDeployment.size,4);
 return normalized;
}
export function verifyVaultReproductionArchive(plan,first,second,comparison,
 {historical=false}={}){
 const result={schemaVersion:"OECL_PORTABLE_REPRODUCTION_WITNESS_REVIEW_V1",
  accepted:false,status:"REJECTED",archiveWitnessBytesReconciled:false,
  localEvmExecutedByThisVerifier:false,ethereumConsensusVerified:false,
  sourceOriginAuthenticated:false,scientificVerdict:"INCONCLUSIVE",
  compatibilityVerdict:"NOT_EVALUATED",candidateAdmission:"NOT_ADMITTED",
  rejection:"NOT_REVIEWED"};
 try{
  const pd=hash(plan),fd=hash(first),sd=hash(second),cd=hash(comparison);
  assert([pd,fd,sd,cd].every(is64));
  if(historical){
   assert.equal(pd,historicDigests.proposal);
   assert.equal(fd,historicDigests.first);
   assert.equal(sd,historicDigests.second);
   assert.equal(cd,historicDigests.comparison);
   assert.equal(second.ciRunId,"45901609187");
  }
  const raw={...plan};delete raw.proposalSha256;
  assert.equal(plan.schemaVersion,"OECL_AUTOMATIC_SCIENTIFIC_EXPERIMENT_PROPOSAL_V1");
  assert.equal(hash(raw),plan.proposalSha256);
  assert.equal(plan.proposalSha256,origProposalSha);
  assert.equal(plan.status,"GENERATED_SOURCE_BOUND_CANDIDATE_NEEDS_REVIEW");
  assert.equal(plan.executionGate,"SOURCE_ONLY_NO_DISPATCH");
  assert.equal(plan.executionAuthorized,false);
  assert.equal(plan.experimentDispatched,false);
  assert.equal(plan.evmExecuted,false);
  assert.equal(plan.candidateAdmission,"NOT_ADMITTED");
  assert.equal(plan.compatibilityVerdict,"NOT_EVALUATED");
  assert.equal(plan.scientificVerdict,"INCONCLUSIVE");
  assert(plan.requestedAuthorizations.every(x=>x.granted===false));
  assert.equal(plan.sourceInferenceClaim,"TYPED_ABI_AST_CAPABILITIES_ONLY");
  assert.equal(plan.economicPrior,"TWO_MANUALLY_REVIEWED_FORMULA_ADAPTERS_BOUND_TO_SOURCE_HASHES");
  assert.equal(plan.provenance.solmateRevision,
   "89365b880c4f3c786bdd453d4b8e8fe410344a69");
  assert.equal(plan.provenance.compilerVersion,
   "0.8.26+commit.8a97fa7a.Emscripten.clang");
  assert.equal(plan.exploration.searched,480);
  assert.equal(plan.exploration.distinct,39);
  assert.equal(plan.selection.donation,2);assert.equal(plan.selection.withdrawal,21);
  assert.equal(plan.selection.ozBurnedShares,"21");
  assert.equal(plan.selection.solmateBurnedShares,"20");
  assert.equal(plan.experimentProgram.length,8);
  const n=plan.provenance.twoCodebases;
  assert.equal(n.length,2);assert.equal(n[0].id,"OPENZEPPELIN");
  assert.equal(n[1].id,"SOLMATE");
  for(const o of n){
   assert(is64(o.vaultAbiSha256)&&is64(o.vaultBytecodeSha256));
   assert(is64(o.assetAbiSha256)&&is64(o.assetBytecodeSha256));
  }
  const f=auditWitness(plan,first,false,null);
  const s=auditWitness(plan,second,true,second.ciRunId);
  assert.deepEqual(f,s,"INDEPENDENT_EVM_SEMANTIC_WITNESS_DISAGREEMENT");
  assert.equal(comparison.schemaVersion,
   "OECL_CROSS_RUN_EVM_SCIENTIFIC_RECONCILIATION_V1");
  assert.equal(comparison.status,"REPRODUCED_SCOPED_LOCAL_EVM");
  assert.equal(comparison.accepted,true);
  assert.equal(comparison.independentlyReproducedScopedCounterexample,true);
  assert.equal(comparison.conclusionUpgradeAllowed,false);
  assert.equal(comparison.scientificVerdict,"INCONCLUSIVE");
  assert.equal(comparison.compatibilityVerdict,"NOT_EVALUATED");
  assert.equal(comparison.candidateAdmission,"NOT_ADMITTED");
  assert.equal(comparison.independentEthereumConsensus,false);
  assert.equal(comparison.sourceOriginIndependentlyAuthenticated,false);
  assert.equal(comparison.evidenceReexecutedByComparator,false);
  assert.equal(comparison.independentSecondExecutionGitHubRunId,second.ciRunId);
  assert.equal(comparison.independentSecondExecutionJob,second.ciJob);
  assert.equal(comparison.proposalSha256,plan.proposalSha256);
  assert.equal(comparison.originalWitnessSha256,fd);
  assert.equal(comparison.secondWitnessSha256,sd);
  assert.equal(comparison.localExperimentExecutions,2);
  assert.equal(comparison.minedReceiptsIndependentlyChecked,28);
  assert.equal(comparison.unminedControlsIndependentlyChecked,12);
  assert.equal(comparison.witnessComparisons,16);
  assert.deepEqual(comparison.finding,{
   id:"DONATION_REVIEWED_SHARE_BURN_COUNTEREXAMPLE",
   claimType:"SCOPED_REPRODUCED_LOCAL_EVM_OBSERVATION",
   hypothesisId:plan.falsifiableHypothesis.id,
   scopedHypothesisVerdict:"REFUTED_IN_TWO_CI_LOCAL_EVM_EXECUTIONS",
   case:{depositAssets:40,donationAssets:2,withdrawalAssets:21},
   observations:[
    {implementation:"OPENZEPPELIN",sharesBurned:21,sharesRemaining:19,
     assetsRemainingInVault:21},
    {implementation:"SOLMATE",sharesBurned:20,sharesRemaining:20,
     assetsRemainingInVault:21},
   ],
   preconditionControls:"TWO_REVERTS_AND_ONE_SUCCESSFUL_ETH_CALL_PER_IMPLEMENTATION",
   hasIndependentSecondLocalEvmExecution:true,
   externallyAuthenticatedSources:false,
   independentEthereumConsensus:false,
   universalERCCompatibilityProven:false,
  },"NO_SCOPED_COMPARISON_CAN_MASQUERADE_AS_UNIVERSAL_COMPATIBILITY");
  return {...result,accepted:true,status:"TWO_LOCAL_EVM_ARCHIVED_WITNESSES_RECONCILED",
   archiveWitnessBytesReconciled:true,
   rejection:null,sourceCommit:"c7fb535fba976488f3a0c24dba2b700b5938dbfd",
   evidence:{proposalJsonSha256:pd,firstWitnessJsonSha256:fd,
    secondWitnessJsonSha256:sd,comparisonJsonSha256:cd},
   runId:second.ciRunId,originalReceipts:14,secondReceipts:14,
   totalControls:12,sourceModelHumanReviewed:true};
 }catch(error){
  return {...result,rejection:error instanceof Error?error.message:String(error)};
 }
}
const read=file=>{
 const bytes=readFileSync(file);
 if(bytes.byteLength>200000)throw Error("ARCHIVE_JSON_FILE_TOO_LARGE");
 return JSON.parse(bytes.toString("utf8"));
};
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const [p,w1,w2,comparison,mode]=process.argv.slice(2);
 if(!p||!w1||!w2||!comparison||!["fresh","historical"].includes(mode)){
  process.stderr.write("Usage: verify-vault-reproduction.mjs proposal.json original.json second.json comparison.json fresh|historical\n");
  process.exitCode=2;
 }else{
  const result=verifyVaultReproductionArchive(read(p),read(w1),read(w2),
   read(comparison),{historical:mode==="historical"});
  console.log("OECL_PORTABLE_VAULT_REPRODUCTION_AUDIT",JSON.stringify(result));
  if(!result.accepted)process.exitCode=1;
 }
}
