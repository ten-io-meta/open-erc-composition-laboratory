import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { writeFile } from "node:fs/promises";
import { ScientificJointContractHarnessRecipeSelector } from "../laboratory/scientific-joint-contract-harness/ScientificJointContractHarnessRecipeSelector.js";
import { ScientificJointContractHarnessExecutor } from "../laboratory/scientific-joint-contract-harness/ScientificJointContractHarnessExecutor.js";
import { buildErc8060Erc8098PinnedRegistration } from "../laboratory/scientific-joint-contract-harness/controls/ScientificErc8060Erc8098PinnedRegistration.js";
import { buildErc8060Erc8098ModernPinnedRecipe } from "../laboratory/scientific-joint-contract-harness/controls/ScientificErc8060Erc8098ModernPinnedRecipe.js";
import {
    ERC8060_PINNED_REPOSITORY,ERC8098_PINNED_REPOSITORY,
    ERC8060_PINNED_REVISION,ERC8098_PINNED_REVISION
} from "../laboratory/scientific-joint-contract-harness/controls/ScientificErc8060Erc8098PinnedRecipe.js";
import type { ScientificCompositionExecutionRequirement } from "../laboratory/scientific-composition-experiment/ScientificCompositionExecutionRequirement.js";
import type { ScientificCompositionWorkspaceMaterialization } from "../laboratory/scientific-composition-workspace-materialization/ScientificCompositionWorkspaceMaterialization.js";

const [a,b,modernRoot,outfile]=process.argv.slice(2);
assert.ok(a&&b&&modernRoot&&outfile,"Usage: <pinned 8060> <pinned 8098> <isolated modern runtime> <receipt outfile>");
const paths=[resolve(a),resolve(b)];
const rev=(dir:string)=>execFileSync("git",["-C",dir,"rev-parse","HEAD"],{encoding:"utf8"}).trim();
assert.equal(rev(paths[0]),ERC8060_PINNED_REVISION);
assert.equal(rev(paths[1]),ERC8098_PINNED_REVISION);
const bindings=[
    {participantSide:"A" as const,participantKind:"PROTOCOL" as const,participantId:"ERC-8060",sourceId:"SRC-8060",repository:ERC8060_PINNED_REPOSITORY,sourceRevision:ERC8060_PINNED_REVISION},
    {participantSide:"B" as const,participantKind:"PROTOCOL" as const,participantId:"ERC-8098",sourceId:"SRC-8098",repository:ERC8098_PINNED_REPOSITORY,sourceRevision:ERC8098_PINNED_REVISION}
];
const requirement={
    requirementId:"MODERN-TEST-ONLY-NATIVE-JOINT-RECIPE",
    evaluationSpecificationId:"NO-SCIENTIFIC-CANDIDATE-ADMITTED",
    candidate:{
        candidateId:"NOT-DISCOVERED-TEST-ONLY",
        participantA:{kind:"PROTOCOL",id:"ERC-8060"},
        participantB:{kind:"PROTOCOL",id:"ERC-8098"},
        mechanism:"SHARED_RECURRENT_CONCEPT",
        supportingCapabilityIdsA:[],supportingCapabilityIdsB:[],
        provenance:[],evaluationStatus:"UNEVALUATED"
    },
    constraints:[],participantAConstraintIds:[],participantBConstraintIds:[],
    unresolvedGuardFactIds:[],participantSources:bindings
} as unknown as ScientificCompositionExecutionRequirement;
const registration=buildErc8060Erc8098PinnedRegistration();
const selector=new ScientificJointContractHarnessRecipeSelector();
const selected=selector.select(requirement,[registration]);
assert.equal(selected.status,"SELECTED");
const corrupted=structuredClone(requirement);
corrupted.participantSources[1].sourceRevision="f".repeat(40);
assert.equal(selector.select(corrupted,[registration]).status,"NO_MATCH");
const workspace={
    requirementId:requirement.requirementId,candidateId:requirement.candidate.candidateId,
    workspacePath:resolve("."),
    sourceMaterializations:bindings.map((src,i)=>({
        ...src,requiredRevision:src.sourceRevision,observedRevision:src.sourceRevision,
        localPath:paths[i],worktreeClean:true as const
    })),
    status:"MATERIALIZED",errors:[]
} as ScientificCompositionWorkspaceMaterialization;
const executor=new ScientificJointContractHarnessExecutor();
const historical=await executor.execute({
    workspace,recipe:registration.buildRecipe(),requirement
});
assert.equal(historical.status,"EXECUTED",JSON.stringify(historical.errors));
const modernRecipe=buildErc8060Erc8098ModernPinnedRecipe(modernRoot);
assert.notEqual(modernRecipe.recipeId,registration.buildRecipe().recipeId);
assert.equal(modernRecipe.preparationSteps.length,0);
const modern=await executor.execute({workspace,recipe:modernRecipe,requirement});
assert.equal(modern.status,"EXECUTED",JSON.stringify(modern.errors));
const results=[historical,modern];
for(const run of results){
    const r=run.driverReport;
    assert.ok(r);
    assert.equal(r.sharedRuntime,true);
    assert.equal(run.scientificPolarity,"NEUTRAL");
    assert.equal(r.scientificPolarity,"NEUTRAL");
    assert.equal(r.constraintObservations?.length,0);
    assert.equal(r.crossProtocolInteractionObservations?.length,0);
    assert.equal(r.participantA.executed,true);
    assert.equal(r.participantB.executed,true);
    assert.equal(r.participantA.transactionHashes.length,1);
    assert.equal(r.participantA.transactionHashes[0],r.participantB.transactionHashes[0]);
    assert.equal(Number(r.chainId),31337);
}
const get=(observations:string[],p:string)=>{
    const matches=observations.filter(s=>s.startsWith(p));
    assert.equal(matches.length,1);
    return matches[0].slice(p.length);
};
const h=historical.driverReport!,m=modern.driverReport!;
for(const field of ["ERC8060_ETH_PAYOUT_WEI:","ERC8098_SUPPLY_DELTA:"]){
    const valH=get(h.observations,field),valM=get(m.observations,field);
    assert.equal(valH,valM,"Native report economic mismatch: "+field);
}
const hTx=h.participantA.transactionHashes[0],mTx=m.participantA.transactionHashes[0];
assert.equal(get(h.observations,"ERC8060_NFT_BURN:"),hTx);
assert.equal(get(h.observations,"ERC8098_SUPPLY_BURN:"),hTx);
assert.equal(get(m.observations,"ERC8060_NFT_BURN:"),mTx);
assert.equal(get(m.observations,"ERC8098_SUPPLY_BURN:"),mTx);
assert.match(hTx,/^0x[a-f0-9]{64}$/i);
assert.match(mTx,/^0x[a-f0-9]{64}$/i);
const report={
    schemaVersion:"OECL_NATIVE_PINNED_MODERN_DRIVER_PARITY_V1",
    result:"BOUNDED_NATIVE_OPERATIONAL_PARITY",
    sourceRevisions:[ERC8060_PINNED_REVISION,ERC8098_PINNED_REVISION],
    historicalRecipeId:historical.recipeId,
    modernRecipeId:modern.recipeId,
    nativeExecutor:"ScientificJointContractHarnessExecutor",
    sharedRuntimePerExecution:true,
    independentHistoricalAndModernEvmRuns:true,
    observed:{ownerPayoutWei:get(h.observations,"ERC8060_ETH_PAYOUT_WEI:"),
      supplyDecrease:get(h.observations,"ERC8098_SUPPLY_DELTA:")},
    transactionHashes:{historical:hTx,modern:mTx},
    participantAddressCounts:{
       historical:[h.participantA.contractAddresses.length,h.participantB.contractAddresses.length],
       modern:[m.participantA.contractAddresses.length,m.participantB.contractAddresses.length]
    },
    originalSourceRevisionsPreserved:true,
    harnessScientificPolarity:"NEUTRAL",
    candidateScientificVerdict:"INCONCLUSIVE",candidateAdmission:"NOT_ADMITTED",
    limitations:[
      "The new modern driver is a test-only alternative, not a replacement for the currently registered historical recipe.",
      "Native harness EXECUTED only verifies jointly observed execution; it does not admit source-derived composition candidates.",
      "Hash, gas and bytecode parity between independent EVM instances is not claimed.",
      "Scientific status remains INCONCLUSIVE and NOT_ADMITTED."
    ]
};
report.transactionHashes.historical.length>0&&report.transactionHashes.modern.length>0;
await writeFile(outfile,JSON.stringify(report,null,2)+"\n");
console.log("OECL_MODERN_NATIVE_HARNESS_PARITY_PASS:"+JSON.stringify({
    result:report.result,payout:report.observed.ownerPayoutWei,
    supplyDecrease:report.observed.supplyDecrease,scientificPolarity:report.harnessScientificPolarity,
    candidateAdmission:report.candidateAdmission
}));
