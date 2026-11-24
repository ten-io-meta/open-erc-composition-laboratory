"use strict";
const assert=require("node:assert/strict");
const crypto=require("node:crypto");
const fs=require("node:fs");
const path=require("node:path");
const sha256=x=>crypto.createHash("sha256").update(x).digest("hex");
const diamondPath=path.resolve(process.argv[2]||
  "source-output/erc2535/pinned-diamond-local-evm-witness.json");
const referencePath=path.resolve(process.argv[3]||
  "source-output/erc7201/namespace-formula-observations.json");
const out=path.resolve(process.argv[4]||
  "audit-output/erc2535-independent-diamond-review.json");
const witnessBytes=fs.readFileSync(diamondPath);
const oracleBytes=fs.readFileSync(referencePath);
const x=JSON.parse(witnessBytes.toString("utf8"));
const oracle=JSON.parse(oracleBytes.toString("utf8"));
assert.equal(x.schemaVersion,"OECL_ERC2535_PINNED_DIAMOND_ERC7201_NAMESPACE_LOCAL_EVM_V1");
assert.equal(x.source.revision,"e9c1adc6ad36faec8a6bc509cc8a14ec9b8f741d");
assert.equal(x.source.repository,"ethereum/ERCs");
assert.equal(x.source.diamondReferencePath,"assets/erc-2535/reference/Diamond.sol");
assert.match(x.source.diamondReferenceSourceSha256,/^[a-f0-9]{64}$/);
assert.match(x.source.erc2535DocumentSha256,/^[a-f0-9]{64}$/);
assert.match(x.source.controlledFacetSourceSha256,/^[a-f0-9]{64}$/);
assert.match(x.source.compilerVersion,/^0\.8\.26\+/);
assert.equal(x.source.offchainErc7201FormulaResultSha256,sha256(oracleBytes));
assert.equal(x.evmExecuted,true);
assert.equal(x.configuration.chainId,31337);
assert.equal(x.scientificStatus,"SCOPED_PINNED_REFERENCE_AND_SYNTHETIC_FACET_EXPERIMENT");
assert.equal(x.securityConclusion,"NO_EXPLOIT_IDENTIFIED_IN_TESTED_OWNER_ONLY_PATH");
assert.equal(x.globalCompatibilityVerdict,"NOT_EVALUATED");
assert.equal(x.candidateAdmission,"NOT_ADMITTED");
assert.equal(x.trust,"LIVE_LOCAL_HARDHAT_RECEIPTS_NOT_MAINNET_CONSENSUS");
assert.equal(x.initialConstructorDiamondCutEventObserved,true);
assert.equal(x.observedMinedSuccesses,5);
assert.equal(x.observedReadOnlyReverts,3);
const expectedNamespace=oracle.positiveCases.find(a=>a.namespaceId==="oecl.storage.ERC7201");
assert(expectedNamespace?.independentByteLevelMatch===true);
assert.equal(x.configuration.erc7201NamespaceId,expectedNamespace.namespaceId);
assert.equal(x.configuration.verifiedStorageRoot.toLowerCase(),
  expectedNamespace.computedRoot.toLowerCase());
assert.notEqual(x.configuration.diamondInternalStorageRoot.toLowerCase(),
  x.configuration.verifiedStorageRoot.toLowerCase());
assert.equal(x.measuredState.afterDelegatedV1Write,"7");
assert.equal(x.measuredState.afterFacetReplacement,"7");
assert.equal(x.measuredState.afterDelegatedV2Write,"20");
assert.equal(x.measuredState.afterSelectorRemoval,"20");
assert.equal(x.measuredState.directFacetV1State,"0");
const labels=[
 ["ADD_V1_THREE_SELECTORS",0],
 ["DELEGATED_STATE_SET_7",null],
 ["REPLACE_SET_VALUE_SELECTOR",1],
 ["DELEGATED_V2_SETS_20",null],
 ["REMOVE_SET_VALUE_SELECTOR",2]
];
const uniqueTx=new Set();
function validateReceipt(r,expected){
 assert.equal(r.label,expected[0]);
 assert.equal(r.expectedCutAction,expected[1]);
 assert.equal(r.diamondCutEvents,expected[1]===null?0:1);
 assert.equal(r.receiptStatus,1);
 assert.equal(r.checkedAgainst,"LIVE_LOCAL_HARDHAT_PROVIDER");
 assert.match(r.txHash,/^0x[0-9a-f]{64}$/i);
 assert.match(r.blockHash,/^0x[0-9a-f]{64}$/i);
 assert.match(r.contractCodeKeccak256,/^0x[0-9a-f]{64}$/i);
 assert(Number.isInteger(r.blockNumber)&&r.blockNumber>0);
}
assert.equal(x.positiveMinedReceipts.length,labels.length);
x.positiveMinedReceipts.forEach((r,i)=>{
 validateReceipt(r,labels[i]);
 const id=r.txHash.toLowerCase();
 assert(!uniqueTx.has(id),"Duplicate mined transaction");
 uniqueTx.add(id);
 assert.throws(()=>validateReceipt({...r,diamondCutEvents:2},labels[i]),
  "Fabricated event count passed review");
 assert.throws(()=>validateReceipt({...r,receiptStatus:0},labels[i]),
  "Fabricated failure receipt passed review");
});
const expectedNegatives=[
 "DUPLICATE_SELECTOR_ADDITION",
 "NON_OWNER_DIAMOND_CUT",
 "REMOVED_SELECTOR_NOT_DISPATCHABLE"
];
assert.deepEqual(x.simulatedNegativeControls.map(n=>n.label),expectedNegatives);
for(const r of x.simulatedNegativeControls){
 assert.equal(r.execution,"READ_ONLY_CALLSTATIC_REVERT");
 assert.equal(r.minedReceipt,false);
}
const review={
 schemaVersion:"OECL_ERC2535_7201_INDEPENDENT_ARTIFACT_REVIEW_V1",
 pinnedErc2535DocumentSha256:x.source.erc2535DocumentSha256,
 pinnedDiamondReferenceSourceSha256:x.source.diamondReferenceSourceSha256,
 preregisteredErc7201OracleFileSha256:sha256(oracleBytes),
 localDiamondWitnessFileSha256:sha256(witnessBytes),
 verifiedMinedReceiptClaims:uniqueTx.size,
 verifiedReadOnlyNegativeControls:expectedNegatives.length,
 rejectedEvidenceMutationControls:10,
 sourceScope:"PINNED_OFFICIAL_ERC2535_DIAMOND_AND_CONTROLLED_SYNTHETIC_FACETS",
 conclusion:"CONSISTENT_LOCAL_EVM_FACET_UPGRADES_AND_ERC7201_ROOT_FOR_TESTED_PATHS",
 independentProviderAttestation:"NOT_PERFORMED_BY_ARTIFACT_REVIEW",
 generalSecurityVerdict:"NOT_EVALUATED",
 globalCompatibilityVerdict:"NOT_EVALUATED",
 candidateAdmission:"NOT_ADMITTED",
 limitations:[
  "A downloaded evidence replay cannot authenticate Ethereum consensus or independently reproduce the live local provider.",
  "The fixture uses original pinned Diamond.sol but synthetic laboratory facets; not an audit of arbitrary upgradeable implementations.",
  "Read-only authorization and duplicate-selector reverts are not mined transaction receipts.",
  "A single namespace's non-overlap is a sampled result, not proof of collision freedom."
 ]
};
fs.mkdirSync(path.dirname(out),{recursive:true});
fs.writeFileSync(out,JSON.stringify(review,null,2)+"\n");
console.log("OECL_ERC2535_INDEPENDENT_DIAMOND_ARTIFACT_REVIEW_PASS",JSON.stringify({
 mined:review.verifiedMinedReceiptClaims,
 negative:review.verifiedReadOnlyNegativeControls,
 mutationControls:review.rejectedEvidenceMutationControls,
 globalCompatibility:review.globalCompatibilityVerdict
}));
