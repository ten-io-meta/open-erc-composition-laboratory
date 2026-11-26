"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const crypto=require("node:crypto");
const hash=x=>crypto.createHash("sha256").update(JSON.stringify(x)).digest("hex");
const {review}=require("./review-source-backed-hypotheses.cjs");
const H="a".repeat(64),B="b".repeat(64),G="c".repeat(64);
function make(){
 const route={signature:"transfer(address,uint256)",kind:"STATE_WRITE",
   stateVariable:"_balances",path:"transfer#1 -> _transfer#2 @source.sol:4",
   unresolvedReferences:2,externalCallReferences:0,
   executionSafety:"SOURCE_ONLY_REVIEW_REQUIRED"};
 const core={signature:route.signature,sourceSha256:H,
   astSha256:hash({paths:[route]}),abiSha256:B,astPath:route.path,
   stateVariable:route.stateVariable,unresolvedReferences:route.unresolvedReferences,
   externalCallReferences:route.externalCallReferences,executionSafety:"SOURCE_ONLY_REVIEW_REQUIRED"};
 const h={id:hash(core),status:"HYPOTHESIS_ONLY",...core,
   evidenceStatus:"NOT_EXECUTED",scientificVerdict:"INCONCLUSIVE",
   compatibilityVerdict:"NOT_EVALUATED",candidateAdmission:"NOT_ADMITTED"};
 const p={id:"ERC-20",sourceUnit:"source.sol",sourceSha256:H,abiSha256:B,
   structuralPaths:[route],hypothesisCount:1,hypotheses:[h]};
 return {schemaVersion:"OECL_LOCKED_SOURCE_HYPOTHESES_V1",
  status:"COMPILER_RECONCILED_SOURCE_ONLY",registryScope:"REVIEWED_SOURCE_REGISTRY",
  compilerVersion:"0.8.26+commit.test",lockSha256:G,sourceGraphSha256:G,
  dependencyIntegrity:"sha512-research",evmExecuted:false,executionAuthorized:false,
  independentReviewStatus:"AWAITING_SEPARATE_RECONSTRUCTION",
  scientificVerdict:"INCONCLUSIVE",compatibilityVerdict:"NOT_EVALUATED",
  candidateAdmission:"NOT_ADMITTED",participants:[p,{...p,id:"ERC-20-BURNABLE"}]};
}
const ids=["ERC-20","ERC-20-BURNABLE"];
test("independent reviewer accepts scoped structural evidence only",()=>{
 const a=make();assert.equal(review(a,ids).hypotheses,2);
});
test("reject forged admission, receipts and AST digest tampering",()=>{
 for(const mutation of [
   x=>{x.evmExecuted=true;},x=>{x.executionAuthorized=true;},
   x=>{x.candidateAdmission="ADMITTED";},
   x=>{x.participants[0].hypotheses[0].id=G;},
   x=>{x.participants[0].hypotheses[0].astPath="fake";},
   x=>{x.participants[0].hypotheses[0].unresolvedReferences=0;},
   x=>{x.participants[0].structuralPaths[0].path="falsified";},
   x=>{x.participants[0].hypotheses[0].evidenceStatus="MINED";} ]){
    const altered=make();mutation(altered);
    assert.throws(()=>review(altered,ids));
 }
});
