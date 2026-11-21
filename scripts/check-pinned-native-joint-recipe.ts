import assert from "node:assert/strict";
import { resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { ScientificJointContractHarnessRecipeSelector } from "../laboratory/scientific-joint-contract-harness/ScientificJointContractHarnessRecipeSelector.js";
import { ScientificJointContractHarnessExecutor } from "../laboratory/scientific-joint-contract-harness/ScientificJointContractHarnessExecutor.js";
import {
    buildErc8060Erc8098PinnedRegistration,
    ERC8060_ERC8098_PINNED_REGISTRATION_ID
} from "../laboratory/scientific-joint-contract-harness/controls/ScientificErc8060Erc8098PinnedRegistration.js";
import {
    ERC8060_PINNED_REPOSITORY, ERC8098_PINNED_REPOSITORY,
    ERC8060_PINNED_REVISION, ERC8098_PINNED_REVISION
} from "../laboratory/scientific-joint-contract-harness/controls/ScientificErc8060Erc8098PinnedRecipe.js";
import type { ScientificCompositionExecutionRequirement } from "../laboratory/scientific-composition-experiment/ScientificCompositionExecutionRequirement.js";
import type { ScientificCompositionWorkspaceMaterialization } from "../laboratory/scientific-composition-workspace-materialization/ScientificCompositionWorkspaceMaterialization.js";

const [a, b] = process.argv.slice(2);
assert.ok(a && b, "Pass two pinned source checkout directories");
const roots = [resolve(a), resolve(b)];
const rev = dir => execFileSync("git", ["-C",dir,"rev-parse","HEAD"],{encoding:"utf8"}).trim();
assert.equal(rev(roots[0]),ERC8060_PINNED_REVISION);
assert.equal(rev(roots[1]),ERC8098_PINNED_REVISION);

const bindings = [
    {participantSide:"A" as const,participantKind:"PROTOCOL" as const,participantId:"ERC-8060",sourceId:"SRC-8060",repository:ERC8060_PINNED_REPOSITORY,sourceRevision:ERC8060_PINNED_REVISION},
    {participantSide:"B" as const,participantKind:"PROTOCOL" as const,participantId:"ERC-8098",sourceId:"SRC-8098",repository:ERC8098_PINNED_REPOSITORY,sourceRevision:ERC8098_PINNED_REVISION}
];
// Synthetic discovery requirement ONLY for operational regression. Never
// pass as independently discovered candidate to the scientific conclusion gate.
const requirement = {
    requirementId:"TEST-ONLY-NATIVE-8060-8098-RECIPE",
    evaluationSpecificationId:"TEST-ONLY-NATIVE-SPEC",
    candidate:{
        candidateId:"TEST-ONLY-NOT-DISCOVERED",
        participantA:{kind:"PROTOCOL",id:"ERC-8060"},
        participantB:{kind:"PROTOCOL",id:"ERC-8098"},
        mechanism:"SHARED_RECURRENT_CONCEPT",
        supportingCapabilityIdsA:[],supportingCapabilityIdsB:[],
        provenance:[],evaluationStatus:"UNEVALUATED"
    },
    constraints:[],
    participantAConstraintIds:[],participantBConstraintIds:[],
    unresolvedGuardFactIds:[],
    participantSources:bindings
} as unknown as ScientificCompositionExecutionRequirement;
const registration = buildErc8060Erc8098PinnedRegistration();
const selected = new ScientificJointContractHarnessRecipeSelector().select(requirement,[registration]);
assert.equal(selected.status,"SELECTED");
assert.equal(selected.selectedRegistration?.registrationId,ERC8060_ERC8098_PINNED_REGISTRATION_ID);
assert.equal(registration.evaluationSurface?.participantSurfaces.every(x=>x.completeness==="PARTIAL"),true);
const badRequirement = structuredClone(requirement);
badRequirement.participantSources[1].sourceRevision = "0".repeat(40);
const denied = new ScientificJointContractHarnessRecipeSelector().select(badRequirement,[registration]);
assert.equal(denied.status,"NO_MATCH");

const sources = bindings.map((source,i)=>({
    ...source,
    requiredRevision:source.sourceRevision,
    observedRevision:source.sourceRevision,
    localPath:roots[i],
    worktreeClean:true as const
}));
const workspace = {
    requirementId:requirement.requirementId,
    candidateId:requirement.candidate.candidateId,
    workspacePath:resolve("."),
    sourceMaterializations:sources,
    status:"MATERIALIZED",
    errors:[]
} as ScientificCompositionWorkspaceMaterialization;
const outcome = await new ScientificJointContractHarnessExecutor()
    .execute({workspace,recipe:registration.buildRecipe(),requirement});
assert.equal(outcome.status,"EXECUTED",JSON.stringify(outcome.errors));
assert.equal(outcome.driverReport?.sharedRuntime,true);
assert.equal(outcome.driverReport?.scientificPolarity,"NEUTRAL");
assert.equal(outcome.driverReport?.constraintObservations?.length,0);
assert.equal(outcome.driverReport?.participantA.transactionHashes.length,1);
assert.deepEqual(outcome.driverReport?.participantA.transactionHashes,
    outcome.driverReport?.participantB.transactionHashes);
console.log("PASS: native joint harness selection and actual pinned EVM execution, scientifically NEUTRAL");
