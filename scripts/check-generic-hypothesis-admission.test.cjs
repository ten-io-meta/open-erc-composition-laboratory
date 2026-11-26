"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const {gate,LOCK_SHA256}=require("./check-generic-hypothesis-admission.cjs");
const crypto=require("node:crypto");
const hash=x=>crypto.createHash("sha256").update(JSON.stringify(x)).digest("hex");
const S="a".repeat(64),B="b".repeat(64),G="c".repeat(64);
function make(){
 const route={signature:"transfer(address,uint256)",kind:"STATE_WRITE",
   stateVariable:"_balances",path:"transfer#1 -> _transfer#2 @source.sol:4",
   unresolvedReferences:2,externalCallReferences:0,
   executionSafety:"SOURCE_ONLY_REVIEW_REQUIRED"};
 const core={signature:route.signature,sourceSha256:S,
   astSha256:hash({paths:[route]}),abiSha256:B,astPath:route.path,
   stateVariable:route.stateVariable,unresolvedReferences:route.unresolvedReferences,
   externalCallReferences:route.externalCallReferences,executionSafety:"SOURCE_ONLY_REVIEW_REQUIRED"};
 const h={id:hash(core),status:"HYPOTHESIS_ONLY",...core,
   hypothesis:"Might change _balances",prediction:"With the right conditions, balance changes",
   counterexample:"Mined outcome without predicted balance change",
   prerequisites:["independent witness reconciliation"],
   evidenceStatus:"NOT_EXECUTED",scientificVerdict:"INCONCLUSIVE",
   compatibilityVerdict:"NOT_EVALUATED",candidateAdmission:"NOT_ADMITTED"};
 const p={id:"ERC-20",revision:"4.9.6",contract:"ERC20",sourceUnit:"source.sol",sourceSha256:S,abiSha256:B,
   structuralPaths:[route],hypothesisCount:1,hypotheses:[h]};
 return {schemaVersion:"OECL_LOCKED_SOURCE_HYPOTHESES_V1",
  status:"COMPILER_RECONCILED_SOURCE_ONLY",registryScope:"REVIEWED_SOURCE_REGISTRY",
  compilerVersion:"0.8.26+commit.test",lockSha256:LOCK_SHA256,sourceGraphSha256:G,
  dependencyIntegrity:"sha512-research",evmExecuted:false,executionAuthorized:false,
  independentReviewStatus:"AWAITING_SEPARATE_RECONSTRUCTION",
  scientificVerdict:"INCONCLUSIVE",compatibilityVerdict:"NOT_EVALUATED",
  candidateAdmission:"NOT_ADMITTED",
  limitations:["structural", "source-only", "no EVM"],
  participants:[p,{...p,id:"ERC-20-BURNABLE",contract:"ERC20Burnable"}]};
}
test("source-only hypothesis dossier admitted for research, never EVM execution",()=>{
 const g=gate(make());
 assert.equal(g.status,"SOURCE_ONLY_RESEARCH_ADMISSIBLE");
 assert.equal(g.hypothesisCount,2);
 assert.equal(g.executionAuthorized,false);
 assert.equal(g.candidateAdmission,"NOT_ADMITTED");
 assert.equal(g.experimentalEvidence,"NONE_NEW");
});
test("reject forged admission, EVM proof fields and missing epistemic boundaries",()=>{
 for(const mutation of [
  x=>{x.candidateAdmission="ADMITTED";},
  x=>{x.evmExecuted=true;},
  x=>{x.executionAuthorized=true;},
  x=>{x.lockSha256=G;},
  x=>{x.receipt={status:1};},
  x=>{x.witness={status:1};},
  x=>{x.participants[0].minedReceiptCount=15;},
  x=>{x.participants[0].structuralPaths[0].receipt={status:1};},
  x=>{x.participants[0].hypotheses[0].txHash="0x"+"1".repeat(64);},
  x=>{x.participants[0].hypotheses[0].counterexample="";},
  x=>{x.participants[0].hypotheses[0].prerequisites=[];},
  x=>{x.participants[0].hypotheses[0].candidateAdmission="ADMITTED";},
  x=>{x.participants[0].hypotheses[0].astSha256=G;},
  x=>{x.participants[0].structuralPaths[0].path="forged path";},
 ]){
   const cloned=structuredClone(make());mutation(cloned);
   assert.throws(()=>gate(cloned));
 }
});
