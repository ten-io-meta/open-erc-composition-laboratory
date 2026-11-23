"use strict";
const assert=require("node:assert/strict");
const {createHash}=require("node:crypto");
const {readFileSync,mkdirSync,writeFileSync}=require("node:fs");
const {resolve,dirname}=require("node:path");
const sha256=b=>createHash("sha256").update(b).digest("hex");
const source=resolve(process.argv[2]||
  "source-output/erc7201/namespace-formula-observations.json");
const witness=resolve(process.argv[3]||
  "source-output/erc7201/namespace-slot-evm-witness.json");
const target=resolve(process.argv[4]||
  "audit-output/erc7201-independent-evm-review.json");
const original=readFileSync(source),evmBytes=readFileSync(witness);
const plan=JSON.parse(original.toString("utf8"));
const report=JSON.parse(evmBytes.toString("utf8"));
assert.equal(plan.schemaVersion,"OECL_ERC7201_PINNED_FORMULA_TWO_ORACLE_VALIDATION_V1");
assert.equal(plan.officialSource.revision,"e9c1adc6ad36faec8a6bc509cc8a14ec9b8f741d");
assert.equal(plan.observedEvmReceipts,0);
assert.equal(plan.independentOnchainExecution,false);
assert.equal(plan.positiveCases.length,5);
assert.equal(report.schemaVersion,"OECL_ERC7201_SOLIDITY_LOCAL_EVM_SOURCE_SCOPED_WITNESS_V1");
assert.equal(report.originalOffchainPlanSha256,sha256(original));
assert.equal(report.sourceDocumentSha256,plan.officialSource.sourceSha256);
assert.equal(report.localChainId,31337);
assert.equal(report.fixtureKind,"CONTROLLED_TEST_PROBE_NOT_ERC7201_DEPLOYED_IMPLEMENTATION");
assert.match(report.fixtureSoliditySha256,/^[a-f0-9]{64}$/);
assert(/^0\.8\.26\+/.test(report.compilerVersion));
assert.equal(report.evmExecuted,true);
assert.equal(report.observedSuccesses,5);
assert.equal(report.receipts.length,5);
assert.equal(report.generalCompatibilityVerdict,"NOT_EVALUATED");
assert.equal(report.candidateAdmission,"NOT_ADMITTED");
assert.match(report.contractAddress,/^0x[a-fA-F0-9]{40}$/);
const uniqueReceipts=new Set(), uniqueBlockIds=new Set();
function assertEvidence(r,reference){
  assert.equal(r.namespaceId,reference.namespaceId);
  assert.equal(r.expectedOffchainRoot,reference.computedRoot);
  assert.equal(r.observedOnchainRoot.toLowerCase(),reference.computedRoot.toLowerCase());
  assert.equal(r.decodedEvent.slot.toLowerCase(),reference.computedRoot.toLowerCase());
  assert.match(r.decodedEvent.namespaceHash,/^0x[a-fA-F0-9]{64}$/);
  assert.equal(r.mutationMissingMinusOneRejected,true);
  assert.equal(r.minedReceiptStatus,1);
  assert.equal(r.receiptAndBlockCheckedAgainstLiveLocalProvider,true);
  assert.equal(r.trustScope,"LOCAL_HARDHAT_ONLY_NOT_MAINNET_CONSENSUS");
  assert.match(r.txHash,/^0x[a-fA-F0-9]{64}$/);
  assert.match(r.blockHash,/^0x[a-fA-F0-9]{64}$/);
  assert.equal(r.transactionTo.toLowerCase(),report.contractAddress.toLowerCase());
  assert.match(r.methodSelector,/^0x[a-fA-F0-9]{8}$/);
  assert.match(r.contractRuntimeCodeKeccak256,/^0x[a-fA-F0-9]{64}$/);
  assert(Number.isInteger(r.blockNumber)&&r.blockNumber>=0);
}
for(let i=0;i<5;i++){
  const p=plan.positiveCases[i],r=report.receipts[i];
  assert.equal(p.independentByteLevelMatch,true);
  assert.equal(p.alignedTo256ByteBoundary,true);
  assert.deepEqual(p.negativeControls,[
    "OMIT_MINUS_ONE_REJECTED","OMIT_OUTER_KECCAK_REJECTED",
    "SUBSTITUTE_SHA3_256_REJECTED"]);
  assertEvidence(r,p);
  assert(!uniqueReceipts.has(r.txHash.toLowerCase()),"Duplicate receipt identity");
  uniqueReceipts.add(r.txHash.toLowerCase());
  assert(!uniqueBlockIds.has(r.blockHash.toLowerCase()),"Duplicate block hash");
  uniqueBlockIds.add(r.blockHash.toLowerCase());
  assert(BigInt(p.computedRoot)%256n===0n);
  // A wrong scientific state claim must fail against the original archived
  // observations. These mutations are never written to the source artifact.
  const forged={...r,observedOnchainRoot:"0x"+"f".repeat(64)};
  assert.throws(()=>assertEvidence(forged,p));
  const forgedEvent={...r,decodedEvent:{...r.decodedEvent,slot:"0x"+"0".repeat(64)}};
  assert.throws(()=>assertEvidence(forgedEvent,p));
}
const result={
  schemaVersion:"OECL_ERC7201_INDEPENDENT_LOCAL_EVM_ARTIFACT_REVIEW_V1",
  offchainPlanSha256:sha256(original),
  localEvmWitnessArtifactSha256:sha256(evmBytes),
  observedLocalMinedTransactions:uniqueReceipts.size,
  comparedNamespaceIDs:plan.positiveCases.map(x=>x.namespaceId),
  directProviderRecheck:"NOT_PERFORMED_BY_SECOND_JOB",
  scope:"PINNED_ERC7201_FORMULA_CONTROLLED_SOLIDITY_FIXTURE_ONLY",
  epistemicConclusion:"FIVE_SCOPED_EVM_FIXTURE_RESULTS_AGREE_WITH_TWO_OFFCHAIN_KECCAK_ORACLES",
  globalCompatibilityVerdict:"NOT_EVALUATED",
  candidateAdmission:"NOT_ADMITTED",
  limitations:[
    "Second job recomputes consistency of downloaded artifacts, not consensus authentication of source transactions.",
    "Original job verifies receipts against local Hardhat provider; no mainnet, proxy storage write, or general namespace collision property tested.",
    "Two independent oracle outputs and five EVM samples do not constitute universal formal verification."
  ]
};
mkdirSync(dirname(target),{recursive:true});
writeFileSync(target,JSON.stringify(result,null,2)+"\n");
console.log("OECL_ERC7201_INDEPENDENT_EVM_ARTIFACT_REVIEW_PASS",JSON.stringify({
 transactions:result.observedLocalMinedTransactions,
 attemptedEvidenceMutationsRejected:10,globalCompatibility:result.globalCompatibilityVerdict
}));
