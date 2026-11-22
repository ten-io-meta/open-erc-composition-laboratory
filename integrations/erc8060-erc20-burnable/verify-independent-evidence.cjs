"use strict";
const fs=require("node:fs");
const path=require("node:path");
const crypto=require("node:crypto");
const assert=require("node:assert/strict");
const digest=x=>crypto.createHash("sha256").update(x).digest("hex");
const isHash=x=>typeof x==="string"&&/^[a-f0-9]{64}$/.test(x);
const isTransaction=x=>typeof x==="string"&&/^0x[a-f0-9]{64}$/.test(x);
const repoRevision="c7eed906835ab39fbc8439eb0493e5a5371b23a2";
const ozVersion="4.9.6";
const sourcePath="contracts/ERC8060Reference.sol";
const tokenPath="node_modules/@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
const order=["AUTHORIZED_AND_FUNDED","UNAUTHORIZED_NFT_OWNER","NO_NFT_APPROVAL",
 "NO_ERC20_ALLOWANCE","INSUFFICIENT_TOKEN_BALANCE",
 "INJECTED_SECOND_LEG_BURN_FAILURE","PAYOUT_RECEIVER_REJECTS",
 "REENTRANT_RECEIVER_REJECTED","SINGLE_BURN_BEFORE_REPLAY","DOUBLE_REDEMPTION_REJECTED"];
const success=new Set(["AUTHORIZED_AND_FUNDED","REENTRANT_RECEIVER_REJECTED","SINGLE_BURN_BEFORE_REPLAY"]);
const positiveExpected=new Map([
 ["AUTHORIZED_AND_FUNDED","BOTH_BURNS_AND_ETH_SETTLEMENT"],
 ["REENTRANT_RECEIVER_REJECTED","NESTED_REDEMPTION_FAILED_OUTER_SINGLE_REDEMPTION"],
 ["SINGLE_BURN_BEFORE_REPLAY","SINGLE_VALID_REDEMPTION"]
]);
const failedExpected=new Map([
 ["UNAUTHORIZED_NFT_OWNER","NFT_OWNER_REQUIRED"],
 ["NO_NFT_APPROVAL","NFT_APPROVAL_REQUIRED"],
 ["NO_ERC20_ALLOWANCE","TOKEN_ALLOWANCE_REQUIRED"],
 ["INSUFFICIENT_TOKEN_BALANCE","BALANCE_REQUIRED"],
 ["INJECTED_SECOND_LEG_BURN_FAILURE","SECOND_LEG_ATOMIC_ROLLBACK"],
 ["PAYOUT_RECEIVER_REJECTS","ETH_CALLBACK_ROLLBACK"],
 ["DOUBLE_REDEMPTION_REJECTED","NO_DOUBLE_REDEMPTION"]
]);
const bad=message=>{throw Error("OECL_EVM_PROVENANCE_REJECTED:"+message)};
function sourceGate(sourceRoot,dir){
  const read=name=>JSON.parse(fs.readFileSync(path.join(dir,name+".json"),"utf8"));
  const graph=read("structural-ast-graph");
  const discovery=read("generic-source-hypotheses");
  const feasibility=read("path-feasibility");
  const report=read("source-scientific-report");
  if(report.schemaVersion!=="OECL_OPEN_GENERIC_AST_RESULT_V1"||
     report.scientificVerdict!=="INCONCLUSIVE"||
     report.candidateAdmission!=="NOT_ADMITTED"||
     report.sourceOnly!==true||report.evmExecuted!==false||
     graph.schemaVersion!=="OECL_SOLIDITY_COMPILER_AST_GRAPH_V1"||
     discovery.schemaVersion!=="OECL_GENERIC_AST_HYPOTHESES_V1"||
     feasibility.schemaVersion!=="OECL_AST_PATH_FEASIBILITY_V1"||
     feasibility.scientificVerdict!=="INCONCLUSIVE"||
     feasibility.candidateAdmission!=="NOT_ADMITTED"||
     feasibility.evmExecuted!==false)bad("SCIENCE_SCOPE_INVALID");
  const ids=report.selected?.map(x=>x.id);
  if(JSON.stringify(ids)!==JSON.stringify(["ERC-8060","ERC-20-BURNABLE"]))bad("PAIR_MISMATCH");
  const a=report.selected[0],b=report.selected[1];
  if(a.repository!=="ten-io-meta/erc8060-native-eth-value"||
     a.revision!==repoRevision||
     b.repository!=="@openzeppelin/contracts"&&b.repository!=="@openzeppelin/contracts"||
     b.revision!==ozVersion)bad("SOURCE_REVISIONS_INVALID");
  if(a.sourceSha256!==digest(fs.readFileSync(path.join(sourceRoot,sourcePath)))||
     b.sourceSha256!==digest(fs.readFileSync(path.join(sourceRoot,tokenPath)))||
     !isHash(a.sourceSha256)||!isHash(b.sourceSha256))bad("SOURCE_BYTE_IDENTITY_CHANGED");
  if(report.graphSha256!==digest(JSON.stringify(graph))||
     report.hypothesisArtifactSha256!==digest(JSON.stringify(discovery))||
     report.pathFeasibilityArtifactSha256!==digest(JSON.stringify(feasibility))||
     feasibility.sourceGraphSha256!==report.graphSha256||
     feasibility.discoverySha256!==report.hypothesisArtifactSha256||
     discovery.sourceGraphSha256!==report.graphSha256)bad("AST_EVIDENCE_DIGEST_MISMATCH");
  if(discovery.hypotheses?.length!==1||
     discovery.hypotheses[0].kind!=="POTENTIAL_COUPLED_STATE_DECREASE"||
     discovery.hypotheses[0].status!=="SOURCE_ONLY_UNEVALUATED"||
     feasibility.hypotheses?.length!==1||
     feasibility.hypotheses[0].hypothesisId!==discovery.hypotheses[0].hypothesisId||
     feasibility.hypotheses[0].pathScreen!=="NOT_PROVEN_EXECUTABLE"||
     feasibility.hypotheses[0].participants?.length!==2||
     feasibility.hypotheses[0].participants.some(p=>
       p.pathScreen!=="NOT_PROVEN_EXECUTABLE"||p.blockers?.length!==0)||
     feasibility.hypotheses[0].evmPlan?.status!=="DESIGN_ONLY_NOT_EXECUTED")
    bad("HYPOTHESIS_NOT_ELIGIBLE_FOR_EXPERIMENT");
  return {report,graph,discovery,feasibility};
}
function receiptGate(data,sourceRoot,oeclRoot,source){
  if(!data||data.schemaVersion!=="OECL_8060_ERC20_BURNABLE_EVM_EVIDENCE_V1"||
    data.localScope!=="PINNED_SOURCE_INDEPENDENT_HARDHAT_EVM"||
    data.scientificVerdict!=="INCONCLUSIVE"||
    data.candidateAdmission!=="NOT_ADMITTED"||
    data.nativeScientificAdmissionPerformed!==false||
    data.universalCompatibilityEstablished!==false||
    data.chainId!==31337||!Array.isArray(data.cases)||data.cases.length!==order.length)
    bad("EVM_SCIENTIFIC_SCOPE_INVALID");
  const refs=data.sourceChain?.participants;
  if(refs?.length!==2||
     refs[0].id!=="ERC-8060"||refs[0].revision!==repoRevision||
     refs[1].id!=="ERC-20-BURNABLE"||refs[1].version!==ozVersion||
     refs[0].sha256!==source.report.selected[0].sourceSha256||
     refs[1].sha256!==source.report.selected[1].sourceSha256)
    bad("SOURCE_REPORT_AND_EVM_MISMATCH");
  const files={
    fixture:"OECLBurnableFixture.sol",
    coordinator:"OECL8060BurnableCoordinator.sol",
    caller:"OECLAdversarialBurnableCaller.sol"
  };
  for(const [id,file] of Object.entries(files)){
    const canonical=path.join(oeclRoot,"integrations/erc8060-erc20-burnable/solidity",file);
    if(data.sourceChain.fixtures?.[id]!==digest(fs.readFileSync(canonical))||
       data.sourceChain.fixtures[id]!==digest(fs.readFileSync(path.join(sourceRoot,"contracts",file))))
      bad("FIXTURE_SOURCE_CHANGED:"+id);
  }
  if(data.sourceChain.scenarioScriptSha256!==digest(fs.readFileSync(
       path.join(oeclRoot,"integrations/erc8060-erc20-burnable/test/OECLIndependentBurnableEVM.test.js")))||
     data.sourceChain.scenarioScriptSha256!==digest(fs.readFileSync(
       path.join(sourceRoot,"test/OECLIndependentBurnableEVM.test.js")))||
     data.sourceChain.lockfileSha256!==digest(fs.readFileSync(path.join(sourceRoot,"package-lock.json")))||
     data.sourceChain.hardhatConfigSha256!==digest(fs.readFileSync(path.join(sourceRoot,"hardhat.config.js")))||
     !Array.isArray(data.sourceChain.compilerVersions)||
     data.sourceChain.compilerVersions.length<1||
     data.sourceChain.compilerVersions.some(v=>!/^0\.8\.[0-9]+$/.test(v)))
    bad("TEST_TOOLCHAIN_IDENTITY_UNBOUND");
  const observed=new Set();
  for(const c of data.cases){
    if(!order.includes(c.scenario)||observed.has(c.scenario))bad("EVM_CASE_NOT_REGISTERED");
    observed.add(c.scenario);
    const pass=success.has(c.scenario);
    if(c.receiptStatus!==(pass?1:0)||
       c.expected!==(pass?positiveExpected:failedExpected).get(c.scenario)||
       !isTransaction(c.transactionHash)||
       !Number.isSafeInteger(c.blockNumber)||c.blockNumber<1||
       !/^[0-9]+$/.test(c.gasUsed)||
       c.chainId!==31337||
       c.observations?.experimentLocalEvm!==true||
       c.observations.sourceOnly!==false||
       c.sourcePair?.join("|")!=="ERC-8060|ERC-20-BURNABLE"||
       !c.before||!c.after||
       Object.values(c.runtimeCodeHashes||{}).length!==3||
       Object.values(c.runtimeCodeHashes||{}).some(v=>!isTransaction(v))||
       Object.values(c.contractAddresses||{}).length!==3)
      bad("EVM_RECEIPT_INVALID:"+c.scenario);
    const change=c.observations;
    if(pass){
      if(change.nftObligationDeltaWei!=="100000000000000000"||
         change.tokenSupplyDeltaBaseUnits!=="1000000000000000000"||
         change.nftBackingDeltaWei!=="100000000000000000")
         bad("EVM_POSITIVE_STATE_UNEXPECTED:"+c.scenario);
    }else{
      if(c.rollbackObserved!==true||
         JSON.stringify(c.before)!==JSON.stringify(c.after)||
         change.nftObligationDeltaWei!=="0"||
         change.tokenSupplyDeltaBaseUnits!=="0"||
         change.nftBackingDeltaWei!=="0")
        bad("EVM_FAILED_TX_STATE_NOT_ATOMIC:"+c.scenario);
    }
    if(c.scenario==="REENTRANT_RECEIVER_REJECTED"&&c.nestedRejected!==true)
      bad("REENTRANCY_CONTROL_NOT_VERIFIED");
    if(["AUTHORIZED_AND_FUNDED","SINGLE_BURN_BEFORE_REPLAY"].includes(c.scenario)&&
      (c.burnEvidence?.sameTransaction!==true||
       !Number.isInteger(c.burnEvidence.erc721BurnLogIndex)||
       !Number.isInteger(c.burnEvidence.erc20BurnLogIndex)||
       c.observations.ownerReceivedWeiAfterGas!=="100000000000000000"))
      bad("EVM_POSITIVE_LOGS_MISSING");
  }
  if(observed.size!==order.length||data.coverage?.positive!==3||
     data.coverage?.negative!==7||
     data.coverage?.allNegativeRollbacksVerified!==true)
    bad("EVM_COVERAGE_INCOMPLETE");
  // The scientific evaluator cannot admit a candidate just because tests pass.
  return {
    schemaVersion:"OECL_INDEPENDENT_EVM_EVIDENCE_BRIDGE_V1",
    sourcePair:["ERC-8060","ERC-20-BURNABLE"],
    sourceReportSha256:digest(JSON.stringify(source.report)),
    pathFeasibilitySha256:digest(JSON.stringify(source.feasibility)),
    evmReceiptSha256:digest(JSON.stringify(data)),
    sourceHypothesisId:source.discovery.hypotheses[0].hypothesisId,
    evidenceScope:"SOURCE_BOUND_LOCAL_EVM_EXPERIMENT",
    scientificVerdict:"INCONCLUSIVE",candidateAdmission:"NOT_ADMITTED",
    admissionDecision:"WITHHELD_PENDING_NATIVE_SCOPED_EVALUATION",
    sourceConstraintsResult:"UNKNOWN",runtimeExperimentResult:"OBSERVED_IN_LOCAL_EVM",
    coverage:{positive:3,negative:7},
    limitations:[
      "Positive observations only hold for the exact pinned ERC-8060 and OpenZeppelin Burnable fixture.",
      "Native scientific candidate admission has not run for this independent pair.",
      "This is not an ERC compliance certificate or a public-chain execution receipt."
    ]
  };
}
function main(){
  const [mode,sourceRoot,oeclRoot,sourceDir,receiptFile,outputFile]=process.argv.slice(2);
  if(mode!=="gate"&&mode!=="verify")bad("UNKNOWN_VERIFICATION_MODE");
  const source=sourceGate(sourceRoot,sourceDir);
  if(mode==="gate"){
    console.log("OECL_EVM_SOURCE_GATE: PASS · exact AST, immutable source bytes, no proven blocked path");
    return;
  }
  const data=JSON.parse(fs.readFileSync(receiptFile,"utf8"));
  const bridge=receiptGate(data,sourceRoot,oeclRoot,source);
  fs.writeFileSync(outputFile,JSON.stringify(bridge,null,2)+"\n");
  console.log("OECL_INDEPENDENT_EVM_RECEIPTS: PASS · 3 positive / 7 negative; no candidate admitted");
}
if(require.main===module)main();
module.exports={sourceGate,receiptGate};
