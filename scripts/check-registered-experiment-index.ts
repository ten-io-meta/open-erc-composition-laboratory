import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  ERC8004_ERC8060_CONTROL_REGISTRATION_ID,
  buildErc8004Erc8060ControlRegistration
} from "../laboratory/scientific-joint-contract-harness/controls/ScientificErc8004Erc8060ControlRegistration.js";
import {
  ERC8004_CONTROL_REPOSITORY, ERC8004_CONTROL_REVISION,
  ERC8060_CONTROL_REPOSITORY, ERC8060_CONTROL_REVISION
} from "../laboratory/scientific-joint-contract-harness/controls/ScientificErc8004Erc8060ControlRecipe.js";

const data=JSON.parse(readFileSync("web/src/data/registeredExperimentIndex.json","utf8"));
assert.equal(data.schemaVersion,"OECL_PINNED_RUNTIME_RECIPE_INDEX_V1");
assert.equal(data.registrations.length,1);
const record=data.registrations[0];
const real=buildErc8004Erc8060ControlRegistration();
assert.equal(record.registrationId,ERC8004_ERC8060_CONTROL_REGISTRATION_ID);
assert.equal(real.registrationId,record.registrationId);
assert.equal(real.applicability.foundationProtocolId,record.foundationProtocolId);
assert.equal(real.applicability.participantA.participantId,record.participantIds[0]);
assert.equal(real.applicability.participantB.participantId,record.participantIds[1]);
for(const [actual,pin] of [
 [{repository:ERC8004_CONTROL_REPOSITORY,revision:ERC8004_CONTROL_REVISION},record.pinnedSources[0]],
 [{repository:ERC8060_CONTROL_REPOSITORY,revision:ERC8060_CONTROL_REVISION},record.pinnedSources[1]]
]){
 assert.equal(actual.repository,pin.repository);
 assert.equal(actual.revision,pin.revision);
 assert.match(pin.revision,/^[a-f0-9]{40}$/);
}
assert.equal(record.scientificPolarity,"NEUTRAL");
assert.equal(record.previousObservedResult,"BILATERAL_EXECUTION_OBSERVED_WITHOUT_COMPOSITION_POLARITY");
assert.equal(record.executor,"ScientificJointContractHarnessExecutor");
assert.equal(record.script,"scripts/check-real-erc8004-erc8060-joint-harness-runtime.ts");
console.log("OECL_RECIPE_INDEX_PASS "+JSON.stringify({
 registration:record.registrationId,pins:record.pinnedSources.map(x=>x.revision.slice(0,9)),
 status:"PINNED_OFFLINE_NOT_PROOF"
}));
