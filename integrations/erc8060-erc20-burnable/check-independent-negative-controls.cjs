"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const {sourceGate,receiptGate}=require("./verify-independent-evidence.cjs");
const [sourceRoot,oeclRoot,sourceDir,receiptFile]=process.argv.slice(2);
if(!receiptFile)throw Error("Usage: check-evidence-negative-controls.cjs sourceRoot oeclRoot sourceDir receiptFile");
const source=sourceGate(sourceRoot,sourceDir);
const real=JSON.parse(fs.readFileSync(receiptFile,"utf8"));
const observed=receiptGate(real,sourceRoot,oeclRoot,source);
assert.equal(observed.scientificVerdict,"INCONCLUSIVE");
assert.equal(observed.candidateAdmission,"NOT_ADMITTED");
assert.equal(observed.admissionDecision,"WITHHELD_PENDING_NATIVE_SCOPED_EVALUATION");
const experiments=[
 ["promoted verdict",x=>{x.scientificVerdict="SUPPORTS";}],
 ["forged admitted candidate",x=>{x.candidateAdmission="ADMITTED";}],
 ["faked native admission",x=>{x.nativeScientificAdmissionPerformed=true;}],
 ["fake EVM receipt",x=>{x.cases[0].transactionHash="0x"+"0".repeat(64);x.cases[0].receiptStatus=0;}],
 ["mutated positive state",x=>{x.cases[0].observations.nftObligationDeltaWei="0";}],
 ["claim false rollback",x=>{x.cases[1].rollbackObserved=false;}],
 ["reverted state mismatch",x=>{x.cases[1].after.tokenTotalSupply="999";}],
 ["tampered source fixture",x=>{x.sourceChain.fixtures.coordinator="0".repeat(64);}],
 ["tampered AST participant revision",x=>{x.sourceChain.participants[0].revision="0".repeat(40);}],
 ["unexpected callback success",x=>{x.cases.find(c=>c.scenario==="REENTRANT_RECEIVER_REJECTED").nestedRejected=false;}],
 ["hide source case",x=>{x.cases.pop();}],
 ["duplicated source case",x=>{x.cases[3].scenario=x.cases[2].scenario;}],
 ["wrong source scope",x=>{x.cases[0].sourcePair=["ERC-8060","ERC-8098"];}],
 ["fake ERC20 burn log",x=>{x.cases[0].burnEvidence.sameTransaction=false;}],
 ["wrong bytecode hash format",x=>{x.cases[0].runtimeCodeHashes.coordinator="forged";}]
];
for(const [label,change] of experiments){
  const altered=structuredClone(real);change(altered);
  assert.throws(()=>receiptGate(altered,sourceRoot,oeclRoot,source),
    /OECL_EVM_PROVENANCE_REJECTED/,label);
}
const faulty=structuredClone(source);
faulty.report.selected[1].sourceSha256="0".repeat(64);
assert.throws(()=>receiptGate(real,sourceRoot,oeclRoot,faulty),
  /OECL_EVM_PROVENANCE_REJECTED/);
console.log("OECL_INDEPENDENT_EVM_NEGATIVES: PASS · "+(experiments.length+1)+" forged evidence controls · no scientific admission");
