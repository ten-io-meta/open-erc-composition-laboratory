"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const {NUMERIC_POLICY,chooseCase,convertPreview,maxWithdraw,divUp,
 checkCompilerCapabilities,verifyProposal}=require(
 "../laboratory/scientific-open-source-worker/SourceBoundExperimentProposalPlanner.cjs");
test("deterministic bounded search discovers counterexample instead of fixed donation 20",()=>{
 const selection=chooseCase();
 assert.equal(selection.boundedSearch,true);
 assert.deepEqual(selection.selected,{
  donation:2,withdrawal:21,ozBurnedShares:"21",
  solmateBurnedShares:"20",ozFinalShares:"19",solmateFinalShares:"20"});
 assert.equal(selection.search.searched,480);
 assert(selection.search.distinct>0);
 assert(selection.search.admissible>selection.search.distinct);
 assert.equal(selection.search.selectionCriterion,
  "MINIMUM_DONATION_THEN_MINIMUM_WITHDRAWAL_WITH_DISTINCT_BURN_AND_SHARED_VALIDITY");
});
test("generated predictions are truly minimal under reviewed finite search bounds",()=>{
 const found=chooseCase().selected;
 let counterexamples=0;
 for(let donation=NUMERIC_POLICY.donationMin;donation<=NUMERIC_POLICY.donationMax;donation++){
  for(let withdrawal=NUMERIC_POLICY.withdrawalMin;withdrawal<=NUMERIC_POLICY.withdrawalMax;withdrawal++){
   const d=BigInt(donation),w=BigInt(withdrawal),total=40n+d;
   if(w>maxWithdraw("OPENZEPPELIN",40n,40n,total)||
      w>maxWithdraw("SOLMATE",40n,40n,total))continue;
   const oz=convertPreview("OPENZEPPELIN",w,40n,total);
   const sm=convertPreview("SOLMATE",w,40n,total);
   if(oz===sm)continue;
   counterexamples++;
   assert(donation>found.donation||
    (donation===found.donation&&withdrawal>=found.withdrawal));
  }
 }
 assert(counterexamples>0);
});
test("new source-derived candidate has state-sensitive controls, pre/post donation",()=>{
 const n=chooseCase().selected;
 assert.equal(maxWithdraw("OPENZEPPELIN",40n,40n,40n+BigInt(n.donation)),"41");
 assert.equal(maxWithdraw("SOLMATE",40n,40n,40n+BigInt(n.donation)),"42");
 assert.equal(convertPreview("OPENZEPPELIN",21n,40n,42n),"21");
 assert.equal(convertPreview("SOLMATE",21n,40n,42n),"20");
 assert.equal(convertPreview("OPENZEPPELIN",41n,40n,42n),"40");
 assert.equal(convertPreview("SOLMATE",41n,40n,42n),"40");
 assert.equal(divUp(9n,2n),5n);
});
test("unknown economic model and unverified source never allow proposals",()=>{
 assert.throws(()=>convertPreview("UNKNOWN",15n,40n,42n));
 assert.throws(()=>maxWithdraw("UNKNOWN",40n,40n,42n));
 assert.throws(()=>chooseCase({...NUMERIC_POLICY,donationMax:100}));
 assert.throws(()=>checkCompilerCapabilities({}));
 assert.equal(verifyProposal({
  status:"GENERATED_SOURCE_BOUND_CANDIDATE_NEEDS_REVIEW",
  executionAuthorized:true},{}),false);
});
