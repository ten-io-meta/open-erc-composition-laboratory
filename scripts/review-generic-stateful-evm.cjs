"use strict";
/**
 * Separate CI job: independently recompile pinned AST, ABI, harness and
 * bytecode to rebuild the preregistered stateful scientific plan.
 * Check all archived ledger arithmetic and controls without trusting a
 * claimed verdict. In-memory local Hardhat chain cannot be re-queried here.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {verifyStatefulPlan,verifyStatefulWitness,digest}=
  require("../laboratory/scientific-open-source-worker/GenericStatefulEvmProtocol.cjs");
const source=path.resolve(process.argv[2]||"source-output/stateful");
const independent=path.resolve(process.argv[3]||"independent-stateful-review");
const read=(dir,name)=>JSON.parse(fs.readFileSync(path.join(dir,name),"utf8"));
const planned=read(source,"stateful-scientific-plan.json");
const recomputed=read(independent,"stateful-scientific-plan.json");
assert(verifyStatefulPlan(planned),"ARCHIVED_PROTOCOL_NOT_VERIFIABLE");
assert(verifyStatefulPlan(recomputed),"INDEPENDENT_COMPILER_PROTOCOL_NOT_VERIFIABLE");
assert.deepEqual(planned,recomputed,
  "COMPILER_AST_ABI_HARNESS_BYTECODE_OR_FALSIFIERS_NOT_REPRODUCIBLE");
assert.equal(planned.workflowStatus,"REVIEWED_STATEFUL_PROTOCOL_PREREGISTERED");
const receipt=read(source,"stateful-local-evm-witness.json");
assert(verifyStatefulWitness(planned,receipt),
  "INDEPENDENT_LEDGER_RECOMPUTATION_OR_EVM_RECEIPT_SHAPE_FAILED");
// A second, deliberately separate numerical oracle. Do not call the first
// job's expectedOutcome() arithmetic from here; recompute ledger deltas.
for(const group of receipt.participants){
  const cases=Object.fromEntries(group.cases.map(c=>[c.id,c]));
  const diff=(id,column)=>BigInt(cases[id].after[column])-
    BigInt(cases[id].before[column]);
  assert.equal(diff("MINT_INITIAL","owner"),100n);
  assert.equal(diff("MINT_INITIAL","supply"),100n);
  assert.equal(diff("APPROVE_SPENDER","allowance"),50n);
  assert.equal(diff("AUTHORIZED_TRANSFER","owner"),-25n);
  assert.equal(diff("AUTHORIZED_TRANSFER","recipient"),25n);
  assert.equal(diff("AUTHORIZED_TRANSFER","allowance"),-25n);
  assert.equal(diff("AUTHORIZED_TRANSFER","supply"),0n);
  assert.deepEqual(cases.ZERO_TRANSFER_BOUNDARY.before,
    cases.ZERO_TRANSFER_BOUNDARY.after);
  for(const name of ["NO_ALLOWANCE_ATTACKER","OVER_ALLOWANCE_SPENDER",
    ...(group.role==="BURNABLE"?
      ["NO_ALLOWANCE_BURN_ATTACKER","OVER_BALANCE_DIRECT_BURN"]:[])]){
    assert.deepEqual(cases[name].before,cases[name].after);
    assert.equal(cases[name].transactionMined,false);
    assert.equal(cases[name].receipt,null);
  }
  if(group.role==="BURNABLE"){
    assert.equal(diff("AUTHORIZED_BURN_FROM","owner"),-10n);
    assert.equal(diff("AUTHORIZED_BURN_FROM","supply"),-10n);
    assert.equal(diff("AUTHORIZED_BURN_FROM","allowance"),-10n);
    assert.equal(diff("AUTHORIZED_BURN_FROM","recipient"),0n);
    assert.deepEqual(cases.ZERO_BURN_BOUNDARY.before,
      cases.ZERO_BURN_BOUNDARY.after);
  }else assert.equal(cases.AUTHORIZED_BURN_FROM,undefined);
  assert.equal(group.finalState.owner,group.role==="BURNABLE"?"65":"75");
  assert.equal(group.finalState.recipient,"25");
  assert.equal(group.finalState.supply,group.role==="BURNABLE"?"90":"100");
  assert.equal(group.finalState.allowance,group.role==="BURNABLE"?"15":"25");
}
assert.equal(receipt.fixtureHasUnsafeTestMint,true);
assert.equal(receipt.minedReceiptCount,12);
assert.equal(receipt.unminedNegativeCount,6);
assert.equal(receipt.participants[0].finalState.supply,"100");
assert.equal(receipt.participants[1].finalState.supply,"90");
assert.equal(receipt.participants[0].finalState.allowance,"25");
assert.equal(receipt.participants[1].finalState.allowance,"15");
assert.equal(receipt.outcome,"SCOPED_TRANSFER_AND_BURN_BEHAVIOR_OBSERVED");
assert.equal(receipt.compatibilityVerdict,"NOT_EVALUATED");
assert.equal(receipt.candidateAdmission,"NOT_ADMITTED");
const summary={
  schemaVersion:"OECL_GENERIC_STATEFUL_INDEPENDENT_REVIEW_V1",
  sourcePlanSha256:planned.planSha256,
  witnessSha256:digest(receipt),
  sourceSha256:planned.selected.map(s=>s.sourceSha256),
  compilerVersion:planned.compilerVersion,
  selected:receipt.selected,
  independentRecompile:true,
  recheckedArchivedLedgerInvariants:true,
  localReceiptsRequeriedInFirstJobOnly:true,
  crossContractAtomicityProven:false,
  compatibilityVerdict:"NOT_EVALUATED",
  candidateAdmission:"NOT_ADMITTED",
  outcome:"SCOPED_TRANSFER_AND_BURN_BEHAVIOR_OBSERVED",
  audit:{
    localMinedReceipts:12,negativeCallStaticRevertsUnmined:6,
    baselineSourceSupply:"100",burnableSourceSupplyAfterBurn:"90"
  },
  limitations:[
    "This recheck independently compiles and recomputes but cannot independently requery a terminated local Hardhat EVM chain.",
    "All experiments use test-only minting fixture wrappers, not the unchanged production implementation.",
    "The result is separate token accounting only; no ERC-wide compatibility or cross-contract atomicity proof."
  ]
};
fs.mkdirSync(independent,{recursive:true});
fs.writeFileSync(path.join(independent,"independent-review.json"),
  JSON.stringify(summary,null,2)+"\n");
console.log("OECL_STATEFUL_INDEPENDENT_COMPILER_AND_LEDGER_REVIEW_PASS",JSON.stringify({
  planSha256:summary.sourcePlanSha256,localMinedReceipts:12,
  negativeUnmined:6,burnableFinalSupply:"90",notAdmitted:true
}));