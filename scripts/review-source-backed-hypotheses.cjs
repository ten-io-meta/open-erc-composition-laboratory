"use strict";
/** Independent data-only verifier: re-hash hypotheses without importing generator code. */
const assert=require("node:assert/strict");
const crypto=require("node:crypto");
const fs=require("node:fs");
const sha=x=>crypto.createHash("sha256").update(JSON.stringify(x)).digest("hex");
const valid=x=>typeof x==="string"&&/^[0-9a-f]{64}$/.test(x);
function review(record,expectedIds){
  assert(record&&record.schemaVersion==="OECL_LOCKED_SOURCE_HYPOTHESES_V1");
  assert.equal(record.status,"COMPILER_RECONCILED_SOURCE_ONLY");
  assert.equal(record.registryScope,"REVIEWED_SOURCE_REGISTRY");
  assert(/^0\.8\.26\+/.test(record.compilerVersion));
  assert(valid(record.lockSha256)&&valid(record.sourceGraphSha256));
  assert.equal(typeof record.dependencyIntegrity,"string");
  assert(record.dependencyIntegrity.startsWith("sha512-"));
  assert.equal(record.evmExecuted,false);assert.equal(record.executionAuthorized,false);
  assert.equal(record.scientificVerdict,"INCONCLUSIVE");
  assert.equal(record.compatibilityVerdict,"NOT_EVALUATED");
  assert.equal(record.candidateAdmission,"NOT_ADMITTED");
  assert.equal(record.independentReviewStatus,"AWAITING_SEPARATE_RECONSTRUCTION");
  assert(Array.isArray(record.participants)&&record.participants.length===2);
  assert.deepEqual(record.participants.map(p=>p.id),expectedIds);
  let count=0;
  for(const p of record.participants){
    assert(valid(p.sourceSha256)&&valid(p.abiSha256));
    assert(typeof p.sourceUnit==="string"&&p.sourceUnit.length<250);
    assert(Array.isArray(p.structuralPaths)&&Array.isArray(p.hypotheses));
    assert.equal(p.hypothesisCount,p.hypotheses.length);
    assert(p.structuralPaths.length<=256&&p.hypotheses.length<=256);
    const astSha=sha({paths:p.structuralPaths});
    for(const h of p.hypotheses){
      assert.equal(h.status,"HYPOTHESIS_ONLY");
      assert.equal(h.evidenceStatus,"NOT_EXECUTED");
      assert.equal(h.scientificVerdict,"INCONCLUSIVE");
      assert.equal(h.compatibilityVerdict,"NOT_EVALUATED");
      assert.equal(h.candidateAdmission,"NOT_ADMITTED");
      assert.equal(h.executionSafety,"SOURCE_ONLY_REVIEW_REQUIRED");
      assert.equal(h.sourceSha256,p.sourceSha256);
      assert.equal(h.abiSha256,p.abiSha256);
      assert.equal(h.astSha256,astSha);
      assert(Number.isSafeInteger(h.unresolvedReferences)&&h.unresolvedReferences>=0);
      assert(Number.isSafeInteger(h.externalCallReferences)&&h.externalCallReferences>=0);
      const routes=p.structuralPaths.filter(x=>x.signature===h.signature&&
        x.path===h.astPath&&x.stateVariable===h.stateVariable&&
        x.unresolvedReferences===h.unresolvedReferences&&
        x.externalCallReferences===h.externalCallReferences);
      assert.equal(routes.length,1,"HYPOTHESIS_PATH_OR_FLAGS_NOT_FROM_COMPILER_PLAN");
      const core={signature:h.signature,sourceSha256:h.sourceSha256,
        astSha256:h.astSha256,abiSha256:h.abiSha256,
        astPath:h.astPath,stateVariable:h.stateVariable,
        unresolvedReferences:h.unresolvedReferences,
        externalCallReferences:h.externalCallReferences,
        executionSafety:"SOURCE_ONLY_REVIEW_REQUIRED"};
      assert.equal(h.id,sha(core),"HYPOTHESIS_CORE_DIGEST_CHANGED");
      count++;
    }
  }
  assert(count>0,"NO_STRUCTURAL_HYPOTHESES");
  return {status:"SOURCE_ONLY_DOSSIER_RECONCILED",hypotheses:count,
    compilationGraphSha256:record.sourceGraphSha256,
    evmExecuted:false,candidateAdmission:"NOT_ADMITTED"};
}
if(require.main===module){
  const [archived,independent]=process.argv.slice(2);
  assert(archived&&independent);
  const a=JSON.parse(fs.readFileSync(archived,"utf8"));
  const b=JSON.parse(fs.readFileSync(independent,"utf8"));
  assert.deepEqual(a,b,"INDEPENDENT_COMPILER_RECONSTRUCTION_DIFFERS");
  console.log("OECL_SOURCE_ONLY_INDEPENDENT_REVIEW",JSON.stringify(review(a,
    ["ERC-20","ERC-20-BURNABLE"])));
}
module.exports={review};
