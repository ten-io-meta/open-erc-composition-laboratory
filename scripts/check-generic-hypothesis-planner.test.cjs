"use strict";
const assert=require("node:assert/strict");
const test=require("node:test");
const {discover,assess,hash}=require("../laboratory/scientific-open-source-worker/GenericHypothesisPlanner.cjs");
const H="a".repeat(64), A="b".repeat(64);
const abi=[{type:"function",name:"transfer",stateMutability:"nonpayable",
  inputs:[{type:"address"},{type:"uint256"}],outputs:[]}];
const ast={paths:[{signature:"transfer(address,uint256)",kind:"STATE_WRITE",
  path:"transfer -> _transfer",stateVariable:"balances"}]};
const source={sourceSha256:H,astSha256:A,abiSha256:hash(abi)};
test("produce a deterministic, bounded, data-only hypothesis",()=>{
  const plan=discover({abi,ast,source});
  assert.equal(plan.status,"SOURCE_IDENTITY_UNATTESTED");
  assert.equal(plan.executionAuthorized,false);
  assert.equal(plan.hypotheses.length,1);
  const h=plan.hypotheses[0];
  assert.match(h.hypothesis,/transfer/);
  assert.match(h.counterexample,/revert/);
  assert.equal(h.scientificVerdict,"INCONCLUSIVE");
  assert.equal(h.compatibilityVerdict,"NOT_EVALUATED");
  assert.deepEqual(plan,discover({abi,ast,source}));
  assert.equal(assess(h,{receipt:{status:1}}).verdict,"INCONCLUSIVE");
  assert.equal(assess(h,{receipt:{status:1}}).status,
    "EVIDENCE_AWAITING_INDEPENDENT_VERIFICATION");
});
test("reject missing/mismatched identity and ambiguous ABI",()=>{
  assert.equal(discover({abi,ast,source:{...source,abiSha256:H}}).hypotheses.length,0);
  assert.equal(discover({abi,ast,source:{...source,sourceSha256:"bad"}}).status,
    "BLOCKED_UNVERIFIED_INPUT_IDENTITY");
  const duplicate=[...abi,...abi];
  assert.equal(discover({abi:duplicate,ast,source:{...source,abiSha256:hash(duplicate)}}).status,
    "BLOCKED_AMBIGUOUS_ABI");
});
test("unknown AST or unsupported methods cannot cause execution",()=>{
  const missing=discover({abi,ast:{paths:[]},source});
  assert.equal(missing.hypotheses.length,0);
  const suspicious=[{...abi[0],inputs:[{type:"tuple"}]}];
  assert.equal(discover({abi:suspicious,ast,source:{...source,abiSha256:hash(suspicious)}}).hypotheses.length,0);
  assert.equal(assess(null,{receipt:{status:1}}).status,"REJECTED_MALFORMED_HYPOTHESIS");
});
