"use strict";
/**
 * Release safety boundary for source-only generic hypotheses.
 * A passing source-only review cannot admit a candidate or authorize EVM.
 * It does not evaluate arbitrary witness authenticity or provide execution permissions.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const {review}=require("./review-source-backed-hypotheses.cjs");
const LOCK_SHA256="73a70b40bad9d064a244d1a36986b78be9adedc85d2043a6431add0c428b41b1";
const IDS=["ERC-20","ERC-20-BURNABLE"];
const forbidden=new Set(["evmWitness","receipt","receipts","transactionHash","txHash",
  "minedReceiptCount","executionPermit","signatureApproval","EVM_PROVEN"]);
function noWitnessFields(obj,label){
  assert(obj&&typeof obj==="object"&&!Array.isArray(obj),label+"_INVALID");
  for(const key of Object.keys(obj))
    assert(!forbidden.has(key),label+"_UNVERIFIED_WITNESS_FIELD:"+key);
}
function gate(report){
  review(report,IDS);
  assert.equal(report.lockSha256,LOCK_SHA256,"PINNED_LOCK_CHANGED");
  noWitnessFields(report,"REPORT");
  assert(report.limitations&&Array.isArray(report.limitations)&&report.limitations.length>=3,
    "SOURCE_ONLY_LIMITATIONS_REQUIRED");
  assert.equal(report.participants.length,2);
  let count=0;
  for(const p of report.participants){
    noWitnessFields(p,"PARTICIPANT");
    assert(p.hypotheses.length<=256,"TOO_MANY_HYPOTHESES");
    for(const h of p.hypotheses){
      noWitnessFields(h,"HYPOTHESIS");
      assert.equal(h.status,"HYPOTHESIS_ONLY");
      assert.equal(h.executionSafety,"SOURCE_ONLY_REVIEW_REQUIRED");
      assert.equal(h.evidenceStatus,"NOT_EXECUTED");
      assert.equal(h.candidateAdmission,"NOT_ADMITTED");
      assert.equal(h.compatibilityVerdict,"NOT_EVALUATED");
      assert.equal(h.scientificVerdict,"INCONCLUSIVE");
      assert(typeof h.hypothesis==="string"&&h.hypothesis.length>10);
      assert(typeof h.prediction==="string"&&h.prediction.length>10);
      assert(typeof h.counterexample==="string"&&h.counterexample.length>10);
      assert(Array.isArray(h.prerequisites)&&
        h.prerequisites.some(s=>typeof s==="string"&&s.includes("independent witness reconciliation")),
        "EVM_WITNESS_REVIEW_REQUIRED");
      count++;
    }
  }
  assert(count>0);
  return Object.freeze({status:"SOURCE_ONLY_RESEARCH_ADMISSIBLE",
    hypothesisCount:count,executionAuthorized:false,evmExecuted:false,
    compatibilityVerdict:"NOT_EVALUATED",candidateAdmission:"NOT_ADMITTED",
    experimentalEvidence:"NONE_NEW",scope:"LOCKED_COMPILER_AST_ABI_ONLY"});
}
if(require.main===module){
  const filename=process.argv[2];assert(filename,"USAGE: <source-backed-hypotheses.json>");
  const record=JSON.parse(fs.readFileSync(filename,"utf8"));
  console.log("OECL_SOURCE_ONLY_ADMISSION_GATE",JSON.stringify(gate(record)));
}
module.exports={gate,LOCK_SHA256};
