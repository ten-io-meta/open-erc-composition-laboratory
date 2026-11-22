import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {readFileSync} from "node:fs";

const raw=readFileSync(new URL("../src/data/oeclIndependentBurnableEvm.json",import.meta.url),"utf8");
const report=JSON.parse(raw);
const expected="e0ca78bf9fa95925f62a5f100b60c9ed551c26a67c7e5553986e10b006428e66";
const hash=x=>createHash("sha256").update(JSON.stringify(x)).digest("hex");
const good=x=>hash(x)===expected&&
  x.schemaVersion==="OECL_INDEPENDENT_BURNABLE_WEB_V1"&&
  x.experimentRunId===45032636392&&
  x.workflowCommit==="51d19072b2e6f2a5e3b08dd1facd77b0ced225b9"&&
  x.sourcePair.join("|")==="ERC-8060|ERC-20-BURNABLE"&&
  x.scientificVerdict==="INCONCLUSIVE"&&
  x.candidateAdmission==="NOT_ADMITTED"&&
  x.universalCompatibilityEstablished===false&&
  x.localEvm.chainId===31337&&
  x.localEvm.positiveCases===3&&x.localEvm.negativeCases===7&&
  x.localEvm.negativeRollbacksVerified===true&&
  x.localEvm.sameTransactionBurns===true&&
  x.nativeEvaluation.localPropertyPolarity==="SUPPORT"&&
  x.nativeEvaluation.finalScientificVerdict==="INCONCLUSIVE"&&
  x.nativeEvaluation.nativeDiscoveryReady===false&&
  x.nativeEvaluation.nativeCandidateAdmissionPerformed===false&&
  x.nativeEvaluation.sourceCoverageComplete===false&&
  x.nativeEvaluation.constraints.length===4&&
  x.cases.length===10&&
  x.cases.filter(c=>c.status===1).length===3&&
  x.cases.filter(c=>c.status===0&&c.rollbackObserved).length===7;
assert.equal(good(report),true);
const attacks=[
 ["claim global compatibility",x=>{x.universalCompatibilityEstablished=true;}],
 ["promote native verdict",x=>{x.nativeEvaluation.finalScientificVerdict="SUPPORTS";}],
 ["claim admitted candidate",x=>{x.candidateAdmission="ADMITTED";}],
 ["forge transaction",x=>{x.cases[0].transactionHash="0x"+"0".repeat(64);}],
 ["remove negative case",x=>{x.cases.pop();}],
 ["alter source revision",x=>{x.sourceRevisions[0]="0".repeat(40);}],
 ["forge native measure",x=>{x.nativeEvaluation.observedConstraints=99;}],
 ["hide negative rollback",x=>{x.cases.find(c=>c.status===0).rollbackObserved=false;}]
];
for(const [label,modify] of attacks){
  const clone=structuredClone(report);
  modify(clone);
  assert.equal(good(clone),false,label);
}
assert.equal(report.cases.some(c=>c.name==="INJECTED_SECOND_LEG_BURN_FAILURE"&&c.status===0&&c.rollbackObserved===true),true);
assert.equal(report.cases.some(c=>c.name==="REENTRANT_RECEIVER_REJECTED"&&c.status===1&&c.nestedRejected===true),true);
assert.equal(report.nativeEvaluation.constraints.every(c=>
  /^[a-f0-9]{40}$/.test(c.sourceRevision)&&c.line>0),true);
console.log("OECL_WEB_INDEPENDENT_EVM: PASS · 10 pinned receipts, four native properties, eight falsification controls");
