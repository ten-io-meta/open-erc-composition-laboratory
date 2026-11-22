"use strict";
const fs=require("node:fs");
const crypto=require("node:crypto");
const digest=x=>crypto.createHash("sha256").update(x).digest("hex");
const [evmPath,nativePath,bridgePath,output]=process.argv.slice(2);
if(!output)throw Error("Provide EVM, native, bridge and output evidence files.");
const read=path=>JSON.parse(fs.readFileSync(path,"utf8"));
const evm=read(evmPath),native=read(nativePath),bridge=read(bridgePath);
if(evm.schemaVersion!=="OECL_8060_ERC20_BURNABLE_EVM_EVIDENCE_V1"||
   native.schemaVersion!=="OECL_8060_ERC20_BURNABLE_NATIVE_PROPERTIES_V1"||
   bridge.schemaVersion!=="OECL_INDEPENDENT_EVM_EVIDENCE_BRIDGE_V1"||
   evm.scientificVerdict!=="INCONCLUSIVE"||
   bridge.candidateAdmission!=="NOT_ADMITTED"||
   native.finalScientificVerdict!=="INCONCLUSIVE"||
   native.candidateAdmission!=="NOT_ADMITTED"||
   native.nativeDiscoveryReady!==false||
   native.nativeCandidateAdmissionPerformed!==false||
   native.nativePropertyEvaluation?.scientificPolarity!=="SUPPORT"||
   native.nativePropertyEvaluation?.statistics?.preserved!==4||
   evm.coverage?.positive!==3||evm.coverage?.negative!==7||
   bridge.evmReceiptSha256!==digest(JSON.stringify(evm))||
   native.provenance?.independentEvmReceiptSha256!==bridge.evmReceiptSha256)
   throw Error("OECL_EXPERIMENTAL_REPORT_SCOPE_MISMATCH");
const sourceIds=evm.sourceChain.participants.map(x=>x.id);
if(sourceIds.join("|")!=="ERC-8060|ERC-20-BURNABLE")throw Error("Unregistered pair");
const positive=evm.cases.find(c=>c.scenario==="AUTHORIZED_AND_FUNDED");
if(positive?.receiptStatus!==1||positive.burnEvidence?.sameTransaction!==true)
   throw Error("OECL_POSITIVE_EVM_NOT_VERIFIED");
const summary={
  schemaVersion:"OECL_INDEPENDENT_BURNABLE_WEB_V1",
  experimentRunId:Number(process.env.GITHUB_RUN_ID),
  workflowCommit:process.env.GITHUB_SHA,
  sourcePair:sourceIds,
  sourceRevisions:[
    evm.sourceChain.participants[0].revision,
    native.provenance.participantRevisions[1]
  ],
  sourceHashes:evm.sourceChain.participants.map(x=>x.sha256),
  fixtureCodeHashes:evm.sourceChain.fixtures,
  evidenceHashes:{
    evmReceiptSha256:digest(JSON.stringify(evm)),
    nativeEvaluationSha256:digest(JSON.stringify(native)),
    sourceReportSha256:bridge.sourceReportSha256,
    pathFeasibilitySha256:bridge.pathFeasibilitySha256,
    bridgeSha256:digest(JSON.stringify(bridge))
  },
  localEvm:{
    chainId:evm.chainId,
    version:"PINNED_SOURCE_INDEPENDENT_HARDHAT_EVM",
    positiveCases:evm.coverage.positive,
    negativeCases:evm.coverage.negative,
    negativeRollbacksVerified:evm.coverage.allNegativeRollbacksVerified,
    successfulRedemptionWei:positive.observations.nftObligationDeltaWei,
    successfulBurnBaseUnits:positive.observations.tokenSupplyDeltaBaseUnits,
    sameTransactionBurns:positive.burnEvidence.sameTransaction
  },
  nativeEvaluation:{
    observedConstraints:native.nativePropertyEvaluation.statistics.preserved,
    localPropertyPolarity:native.localPropertyPolarity,
    finalScientificVerdict:native.finalScientificVerdict,
    candidateAdmission:native.candidateAdmission,
    sourceCoverageComplete:native.sourceCoverageComplete,
    nativeDiscoveryReady:native.nativeDiscoveryReady,
    nativeCandidateAdmissionPerformed:native.nativeCandidateAdmissionPerformed,
    constraints:native.constraints.map(x=>({
      id:x.constraintId,participantSide:x.participantSide,
      predicate:x.behavioralPredicate,sourceRevision:x.sourceRevision,
      filePath:x.locator.filePath,line:x.locator.startLine
    })),
    limitations:native.unmodeledJointBehavior
  },
  cases:evm.cases.map(c=>({
    name:c.scenario,status:c.receiptStatus,transactionHash:c.transactionHash,
    gasUsed:c.gasUsed,
    nftObligationDecreaseWei:c.observations.nftObligationDeltaWei,
    fungibleSupplyDecreaseUnits:c.observations.tokenSupplyDeltaBaseUnits,
    rollbackObserved:c.rollbackObserved===true,
    sameTransactionBurns:c.burnEvidence?.sameTransaction===true,
    nestedRejected:c.nestedRejected===true
  })),
  scientificVerdict:"INCONCLUSIVE",candidateAdmission:"NOT_ADMITTED",
  universalCompatibilityEstablished:false,
  limitations:evm.limitations
};
if(!Number.isSafeInteger(summary.experimentRunId)||summary.experimentRunId<1||
   !/^[a-f0-9]{40}$/.test(summary.workflowCommit)||summary.cases.length!==10||
   summary.cases.filter(x=>x.status===1).length!==3||
   summary.cases.filter(x=>x.status===0&&x.rollbackObserved).length!==7)
  throw Error("OECL_EVM_SUMMARY_INCOMPLETE");
fs.writeFileSync(output,JSON.stringify(summary,null,2)+"\n");
const compact=JSON.stringify(summary);
console.log("OECL_INDEPENDENT_WEB_EVIDENCE: PASS · 10 real local EVM receipts, 4 native property constraints, global INCONCLUSIVE");
console.log("OECL_INDEPENDENT_WEB_SHA256:"+digest(compact));
for(let i=0;i<compact.length;i+=1500)
 console.log("OECL_INDEPENDENT_WEB_CHUNK:"+String(i/1500).padStart(4,"0")+":"+compact.slice(i,i+1500));
