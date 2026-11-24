"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {buildPlan}=require("../laboratory/scientific-open-source-worker/CapabilityGatedScienceCycle.cjs");
const {concludeVaultAsset}=require("../laboratory/scientific-open-source-worker/VaultAssetCapabilityAdapter.cjs");
const dir=path.resolve(process.argv[2]||"source-output/pair-4626-20");
const data=n=>{const bytes=fs.readFileSync(path.join(dir,n+".json"));
  return {bytes,value:JSON.parse(bytes)};};
const [graph,discovery,feasibility,report,prepared,evm]=[
  "structural-ast-graph","generic-source-hypotheses",
  "path-feasibility","source-scientific-report",
  "capability-gated-scientific-cycle","independent-local-evm"
].map(data);
const sourcePlan=buildPlan({
  graph:graph.value,discovery:discovery.value,feasibility:feasibility.value,
  report:report.value,reportBytes:report.bytes,discoveryBytes:discovery.bytes
});
const base={plan:prepared.value,planBytes:prepared.bytes,
  sourcePlan,evm:evm.value,evmBytes:evm.bytes};
const observed=concludeVaultAsset(base);
assert.equal(observed.status,"SCOPED_BEHAVIORAL_DIFFERENCE_OBSERVED");
assert.equal(observed.evmEvidenceAdmitted,true);
assert.equal(observed.compatibilityVerdict,"NOT_EVALUATED");
assert.equal(observed.candidateAdmission,"NOT_ADMITTED");
assert.equal(observed.scopedConclusions.length,3);
assert.equal(observed.scopedConclusions[2].evidence,
  "UNMINED_PROVIDER_READONLY_CALL_WITH_ABI_DECODE_AND_STATE_CHECK");
const miss=concludeVaultAsset({...base,evm:null,evmBytes:null});
assert.equal(miss.status,"UNRESOLVED_MISSING_EVM_EVIDENCE");
assert.equal(miss.evmEvidenceAdmitted,false);
const mutated=(edit)=>{
  const changed=JSON.parse(JSON.stringify(evm.value));
  edit(changed);
  assert.throws(()=>concludeVaultAsset({...base,evm:changed}));
};
mutated(x=>{x.sourcePlanSha256="0".repeat(64)});
mutated(x=>{x.sourceSha256="0".repeat(64)});
mutated(x=>{x.originHypothesisId="AST-HYP-unregistered"});
mutated(x=>{x.localChainId=1});
mutated(x=>{x.compatibilityVerdict="COMPATIBLE"});
mutated(x=>{x.candidateAdmission="ADMITTED"});
mutated(x=>{x.observations.afterDeposit.vaultShareSupply="0"});
mutated(x=>{x.observations.afterRedeem.assetsInVault="100000000000000000000"});
mutated(x=>{x.minedReceipts[1].txHash=x.minedReceipts[0].txHash});
mutated(x=>{x.minedReceipts[2].witness.blockHash="0xbroken"});
mutated(x=>{x.minedReceipts[2].witness.proofScope="UNVERIFIED"});
mutated(x=>{x.minedReceipts[2].witness.event.assets="10"});
mutated(x=>{x.readOnlyNegativeControls[0].transactionMined=true});
mutated(x=>{x.capabilityProbe.assetHasDepositAbi=true});
mutated(x=>{x.capabilityProbe.assetReturnDecodableAsVaultDeposit=true});
mutated(x=>{x.capabilityProbe.transactionMined=true});
assert.throws(()=>concludeVaultAsset({...base,
  planBytes:Buffer.from("modified-plan")}));
assert.throws(()=>concludeVaultAsset({...base,
  sourcePlan:{...sourcePlan,compatibilityVerdict:"COMPATIBLE"}}));
assert.throws(()=>buildPlan({...base,
  graph:graph.value,discovery:{...discovery.value,sourceGraphSha256:"0".repeat(64)},
  feasibility:feasibility.value,report:report.value,
  reportBytes:report.bytes,discoveryBytes:discovery.bytes}));
console.log("OECL_4626_20_CAPABILITY_CYCLE_FALSIFICATION_PASS",JSON.stringify({
  input:"EXACT_SAME_RUN_AST_AND_LOCAL_PROVIDER_EVM_REPORT",
  scopedConclusions:observed.scopedConclusions.map(x=>x.conclusion),
  tamperedDataRejected:true,
  localMinedReceipts:evm.value.minedReceipts.length,
  readOnlyControls:evm.value.readOnlyNegativeControls.length,
  independentMainnetReceiptAuthentication:false,
  compatibilityVerdict:observed.compatibilityVerdict
}));
