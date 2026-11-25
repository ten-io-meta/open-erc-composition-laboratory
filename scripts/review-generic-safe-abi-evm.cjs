"use strict";
/**
 * Separate CI job re-derives a source-and-ABI plan on a fresh checkout, then
 * checks the exact archived preregistration against raw EVM call responses.
 * This is independent artifact review, NOT mainnet receipt authentication.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {verifyProtocol,verifyWitness,TEST_VECTORS}=
  require("../laboratory/scientific-open-source-worker/GenericReadOnlyAbiEvmProtocol.cjs");
const original=path.resolve(process.argv[2]||"source-output/generic-readonly");
const replay=path.resolve(process.argv[3]||"independent-review");
const read=(dir,file)=>JSON.parse(fs.readFileSync(path.join(dir,file),"utf8"));
const committed=read(original,"generic-read-only-plan.json");
const recomputed=read(replay,"generic-read-only-plan.json");
assert.equal(verifyProtocol(committed),true,"INVALID_SOURCE_EXPERIMENT_PREREGISTRATION");
assert.equal(verifyProtocol(recomputed),true,"INVALID_FRESH_COMPILER_PLAN");
assert.deepEqual(committed,recomputed,
  "EXACT_PINNED_SOURCE_ABI_OR_EXECUTION_PROTOCOL_CHANGED_BETWEEN_INDEPENDENT_REPLAYS");
assert.equal(committed.workflowStatus,"PREREGISTERED_SAFE_READ_ONLY_PROTOCOL");
const witness=read(original,"generic-read-only-evm-witness.json");
assert.equal(verifyWitness(committed,witness),true,
  "READ_ONLY_EVM_EVIDENCE_OR_PREREGISTERED_FALSIFIER_FAILED");
assert.equal(witness.readOnlyProbes.length,TEST_VECTORS.length);
assert.equal(witness.readOnlyProbes[0].responses.every(x=>x.value===true),true);
assert.equal(witness.readOnlyProbes[1].responses.every(x=>x.value===false),true);
assert(witness.readOnlyProbes[2].responses[0].value!==
  witness.readOnlyProbes[2].responses[1].value,
  "DIFFERING_EXTENSION_NOT_OBSERVED_ON_PRECOMMITTED_INTERFACE_ID");
assert.equal(witness.deployments.length,2);
assert.equal(witness.readOnlyProbes.length*2,6);
assert(witness.deployments.every(x=>x.transactionMined===true));
assert(witness.readOnlyProbes.every(x=>x.transactionMined===false));
assert.equal(witness.compatibilityVerdict,"NOT_EVALUATED");
assert.equal(witness.scientificVerdict,"INCONCLUSIVE");
assert.equal(witness.candidateAdmission,"NOT_ADMITTED");
console.log("OECL_GENERIC_ABI_INDEPENDENT_SOURCE_AND_WITNESS_REPLAY_PASS",JSON.stringify({
  selected:witness.selected,protocolSha256:committed.planSha256,
  positives:1,negatives:1,differingChallenges:witness.differingVectorCount,
  minedDeployments:witness.deployments.length,readOnlyCalls:6,
  admission:witness.candidateAdmission,
  warning:"Evidence is local-Hardhat-provider scoped and not independently mainnet authenticated"
}));