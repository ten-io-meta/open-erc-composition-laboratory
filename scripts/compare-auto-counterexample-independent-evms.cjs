"use strict";
/**
 * Fail-closed cross-run scientific evidence comparator.
 * A matching SHA-256 is not proof: original and fresh replay are each
 * reconciled independently before matching typed economic observations.
 * Never executes EVM, never admits ERCs and never signs evidence.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const {digest}=require("../laboratory/scientific-open-source-worker/SolmateCrossVaultProtocol.cjs");
const {review:reviewArchive}=require("./review-auto-counterexample-proposal.cjs");

const roleName=(value,actor,vault)=>{
 if(typeof value!=="string")return value;
 const x=value.toLowerCase();
 if(x===String(actor).toLowerCase())return "ROLE:OWNER";
 if(x===String(vault).toLowerCase())return "ROLE:VAULT";
 if(x==="0x"+"0".repeat(40))return "ROLE:ZERO";
 throw Error("UNREVIEWED_REPLAY_EVENT_ACTOR:"+x.slice(0,40));
};
function normalizedEvents(receipt,actors,vault){
 assert(receipt&&Array.isArray(receipt.events));
 return receipt.events.map(e=>{
  assert(["ASSET","VAULT"].includes(e.contract));
  assert(["Transfer","Approval","Deposit","Withdraw"].includes(e.name));
  const out={contract:e.contract,name:e.name};
  if(e.name==="Transfer"||e.name==="Approval"){
   out.from=roleName(e.from,actors.owner,vault);
   out.to=roleName(e.to,actors.owner,vault);
   out.amount=e.amount;
  }else{
   out.sender=roleName(e.sender,actors.owner,vault);
   out.receiver=roleName(e.receiver,actors.owner,vault);
   if(e.name==="Withdraw")
    out.owner=roleName(e.owner,actors.owner,vault);
   out.assets=e.assets;out.shares=e.shares;
  }
  return out;
 });
}
function asOriginalSchema(replay){
 return {...replay,schemaVersion:"OECL_AUTOMATIC_PROPOSAL_LOCAL_WITNESS_V1",
  reviewGate:"REVIEWED_SOURCE_CI_GATE_V1_LOCAL_ONLY",
  generatedCaseSelected:true,sourceEconomicModelsManuallyReviewed:true};
}
const block=(message,notes)=>({status:"EVIDENCE_DISAGREEMENT_REQUIRES_INVESTIGATION",
 accepted:false,scientificVerdict:"INCONCLUSIVE",
 compatibilityVerdict:"NOT_EVALUATED",candidateAdmission:"NOT_ADMITTED",
 independentlyReproducedScopedCounterexample:false,
 evidenceReexecutedByComparator:false,independentEthereumConsensus:false,
 sourceOriginIndependentlyAuthenticated:false,
 findings:notes||[message],failure:message,
 nextAction:"INVESTIGATE_DISAGREEMENT_AND_PROPOSE_NEW_BOUNDED_CONTROL"});
function compareEvidence(plan,original,replay){
 try{
  assert(plan&&plan.schemaVersion==="OECL_AUTOMATIC_SCIENTIFIC_EXPERIMENT_PROPOSAL_V1");
  assert.equal(plan.status,"GENERATED_SOURCE_BOUND_CANDIDATE_NEEDS_REVIEW");
  assert.equal(plan.executionAuthorized,false);
  assert.equal(plan.evmExecuted,false);
  assert.equal(plan.candidateAdmission,"NOT_ADMITTED");
  assert.equal(plan.compatibilityVerdict,"NOT_EVALUATED");
  assert.equal(plan.scientificVerdict,"INCONCLUSIVE");
  assert.equal(plan.selection.donation,2);
  assert.equal(plan.selection.withdrawal,21);
  assert.equal(plan.experimentProgram.length,8);
  const originalReview=reviewArchive(plan,original);
  assert(originalReview.scopedCounterexampleValidated,"ARCHIVED_FIRST_EVM_INVALID");
  assert.equal(replay.schemaVersion,"OECL_INDEPENDENT_SECOND_LOCAL_EVM_WITNESS_V1");
  assert.equal(replay.reviewGate,"EXACT_SOURCE_CI_SECOND_JOB_LOCAL_ONLY");
  assert.equal(replay.ciJob,"independent-local-evm-replay");
  assert(/^[0-9]+$/.test(replay.ciRunId),"MISSING_EVIDENCE_RUN_ID");
  assert.equal(replay.independentRunnerImplementation,true);
  assert.equal(replay.independentEvmExecution,true);
  assert.equal(replay.independentEthereumConsensus,false);
  assert.equal(replay.independentSourceOriginAuthentication,false);
  assert.equal(replay.claimScope,
   "TWO_TEST_ONLY_ERC4626_IMPLEMENTATIONS_ONE_DONATION_RESEARCH_CASE");
  // The earlier independent accounting reviewer is reused as an extra audit
  // of the archived replay's receipts. The replay was executed by separate
  // source code, not this reviewer's EVM runtime.
  const secondReview=reviewArchive(plan,asOriginalSchema(replay));
  assert(secondReview.scopedCounterexampleValidated,"SECOND_EVM_ACCOUNTING_INVALID");
  assert.equal(original.proposalSha256,replay.proposalSha256);
  assert.equal(replay.proposalSha256,plan.proposalSha256);
  assert.equal(original.provenanceSha256,replay.provenanceSha256);
  assert.equal(replay.provenanceSha256,digest(plan.provenance));
  assert.equal(original.chainId,31337);assert.equal(replay.chainId,31337);
  assert.equal(original.minedReceipts,14);assert.equal(replay.minedReceipts,14);
  assert.equal(original.unminedControls,6);assert.equal(replay.unminedControls,6);
  assert.equal(original.unminedExpectedReverts,4);
  assert.equal(replay.unminedExpectedReverts,4);
  assert.equal(original.unminedExpectedSuccesses,2);
  assert.equal(replay.unminedExpectedSuccesses,2);
  assert.equal(original.overallScientificVerdict,"INCONCLUSIVE");
  assert.equal(replay.overallScientificVerdict,"INCONCLUSIVE");
  assert.equal(original.compatibilityVerdict,"NOT_EVALUATED");
  assert.equal(replay.compatibilityVerdict,"NOT_EVALUATED");
  assert.equal(original.candidateAdmission,"NOT_ADMITTED");
  assert.equal(replay.candidateAdmission,"NOT_ADMITTED");
  assert.deepEqual(replay.hypothesis,original.hypothesis);
  assert(Array.isArray(original.scenarios)&&original.scenarios.length===2);
  assert(Array.isArray(replay.scenarios)&&replay.scenarios.length===2);
  let compared=0,events=0,receipts=0,simulations=0;
  for(let i=0;i<2;i++){
   const a=original.scenarios[i],b=replay.scenarios[i];
   assert.equal(a.id,i===0?"OPENZEPPELIN":"SOLMATE");
   assert.equal(b.id,a.id);
   assert.equal(a.burnedShares,b.burnedShares,
    "TWO_REPLAYS_DISAGREE_ON_SHARE_BURN");
   assert.deepEqual(a.initialState,b.initialState,
    "TWO_REPLAYS_DISAGREE_ON_INITIAL_CUSTODY");
   assert.deepEqual(a.finalState,b.finalState,
    "TWO_REPLAYS_DISAGREE_ON_FINAL_CUSTODY");
   assert.deepEqual(a.withdrawalEventOrder,b.withdrawalEventOrder,
    "TWO_REPLAYS_DISAGREE_ON_WITHDRAW_EVENT_ORDER");
   assert.equal(a.created.length,2);assert.equal(b.created.length,2);
   const vaultA=a.created[1].address,vaultB=b.created[1].address;
   for(let j=0;j<2;j++){
    assert.equal(a.created[j].role,b.created[j].role);
    assert.equal(a.created[j].runtimeKeccak256,b.created[j].runtimeKeccak256,
     "REPLAY_DEPLOYED_RUNTIME_BYTECODE_CHANGED");
    assert.equal(a.created[j].receipt.status,b.created[j].receipt.status);
    assert.equal(a.created[j].receipt.method,b.created[j].receipt.method);
    receipts++;
   }
   assert.equal(a.steps.length,8);assert.equal(b.steps.length,8);
   for(let j=0;j<8;j++){
    const x=a.steps[j],y=b.steps[j],spec=plan.experimentProgram[j];
    for(const key of ["kind","method","quantity","execution",
      "simulation","transactionMined","statePreserved",
      "preview","maxAvailable","returnValue"]){
     assert.deepEqual(x[key],y[key],
      "INDEPENDENT_REPLAY_STEP_DISCREPANCY:"+a.id+":"+spec.kind+":"+key);
    }
    assert.equal(x.kind,spec.kind);
    assert.equal(y.kind,spec.kind);
    assert.deepEqual(x.before,y.before,
     "REPLAY_INPUT_BALANCES_DIFFER:"+a.id+":"+spec.kind);
    assert.deepEqual(x.after,y.after,
     "REPLAY_OUTPUT_BALANCES_DIFFER:"+a.id+":"+spec.kind);
    if(spec.review==="MINED_REVIEWED_FIXTURE_ONLY"){
     assert(x.receipt&&y.receipt);
     assert.equal(x.receipt.method,y.receipt.method);
     assert.equal(x.receipt.methodSelector,y.receipt.methodSelector);
     assert.equal(x.receipt.status,y.receipt.status);
     assert.equal(x.receipt.transactionMined,y.receipt.transactionMined);
     assert.deepEqual(normalizedEvents(x.receipt,original.actors,vaultA),
       normalizedEvents(y.receipt,replay.actors,vaultB),
       "INDEPENDENT_REPLAY_TYPED_EVENTS_DIFFER:"+a.id+":"+spec.kind);
     events+=x.receipt.events.length;receipts++;
    }else{
     assert.equal(x.receipt,null);assert.equal(y.receipt,null);
     assert.deepEqual(x.before,x.after);
     assert.deepEqual(y.before,y.after);
     simulations++;
    }
    compared++;
   }
  }
  assert.equal(compared,16);
  assert.equal(receipts,14);
  assert.equal(simulations,6);
  assert(events>=18);
  assert.equal(original.scenarios[0].burnedShares,"21");
  assert.equal(replay.scenarios[0].burnedShares,"21");
  assert.equal(original.scenarios[1].burnedShares,"20");
  assert.equal(replay.scenarios[1].burnedShares,"20");
  assert.equal(original.scenarios[0].finalState.assetVault,"21");
  assert.equal(replay.scenarios[1].finalState.assetVault,"21");
  const finding={
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
  };
  return {
   schemaVersion:"OECL_CROSS_RUN_EVM_SCIENTIFIC_RECONCILIATION_V1",
   status:"REPRODUCED_SCOPED_LOCAL_EVM",accepted:true,
   hypothesis:plan.falsifiableHypothesis.id,
   originalWitnessSha256:digest(original),secondWitnessSha256:digest(replay),
   proposalSha256:plan.proposalSha256,
   independentSecondExecutionGitHubRunId:replay.ciRunId,
   independentSecondExecutionJob:replay.ciJob,
   witnessComparisons:compared,minedReceiptsIndependentlyChecked:28,
   unminedControlsIndependentlyChecked:12,
   semanticReceiptsCompared:receipts,
   localExperimentExecutions:2,
   originalMinedReceipts:original.minedReceipts,
   replayMinedReceipts:replay.minedReceipts,
   originalUnminedControls:original.unminedControls,
   replayUnminedControls:replay.unminedControls,
   finding,
   scientificVerdict:"INCONCLUSIVE",
   compatibilityVerdict:"NOT_EVALUATED",candidateAdmission:"NOT_ADMITTED",
   independentlyReproducedScopedCounterexample:true,
   evidenceReexecutedByComparator:false,
   independentEthereumConsensus:false,
   sourceOriginIndependentlyAuthenticated:false,
   conclusionUpgradeAllowed:false,
   boundaries:[
    "Both jobs use the same reviewed pinned compiler, Solidity sources and Hardhat EVM engine, not independent Ethereum clients or independently authenticated remote origins.",
    "A separate CI runner actually mined a second set of fixture transactions; earlier independent review only compared archived JSON.",
    "Transaction addresses or hashes MAY coincide because Hardhat test keys, execution order and fixture setup are deterministic; do not require distinct hashes as a proxy for separate execution.",
    "The economic models and operation family were human reviewed, while donation and withdrawal parameter selection was automated within finite bounds.",
    "This falsifies only one equal-share-burn hypothesis under fixed local assumptions; general ERC compatibility, safety and economic utility remain unproven."
   ],
  };
 }catch(error){
  const message=error instanceof Error?error.message:String(error);
  return {
   schemaVersion:"OECL_CROSS_RUN_EVM_SCIENTIFIC_RECONCILIATION_V1",
   ...block(message,["Independent cross-run evidence or source scope could not be reconciled.",
    message]),
  };
 }
}
function compareFiles(inputDir,replayDir){
 const read=(dir,name)=>JSON.parse(fs.readFileSync(path.join(dir,name),"utf8"));
 const p=read(inputDir,"autogenerated-counterexample-proposal.json");
 const original=read(inputDir,"autogenerated-counterexample-witness.json");
 const replay=read(replayDir,"independent-second-evm-witness.json");
 return compareEvidence(p,original,replay);
}
if(require.main===module){
 const [archived,newEvidence,outputDir]=process.argv.slice(2);
 assert(archived&&newEvidence&&outputDir,
  "Usage: <archived-first-run-dir> <second-run-evidence-dir> <report-dir>");
 const reconciliation=compareFiles(path.resolve(archived),path.resolve(newEvidence));
 const directory=path.resolve(outputDir);fs.mkdirSync(directory,{recursive:true});
 fs.writeFileSync(path.join(directory,"cross-run-scientific-reconciliation.json"),
  JSON.stringify(reconciliation,null,2)+"\n");
 console.log(reconciliation.accepted?"OECL_INDEPENDENT_EVM_REPRODUCTION_PASS":
  "OECL_INDEPENDENT_EVM_DISCREPANCY_BLOCKED",JSON.stringify(reconciliation));
 if(!reconciliation.accepted)process.exitCode=1;
}
module.exports={compareEvidence,compareFiles};
