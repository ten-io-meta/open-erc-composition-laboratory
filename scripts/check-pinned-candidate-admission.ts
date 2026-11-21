import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { ScientificDiscoveredCandidateAdmissionEngine } from "../laboratory/scientific-candidate-admission/ScientificDiscoveredCandidateAdmissionEngine.js";
import type { ScientificCompositionExecutionRequirement } from "../laboratory/scientific-composition-experiment/ScientificCompositionExecutionRequirement.js";

/**
 * Operate on the REAL pinned local-EVM native-property report, but do NOT
 * invent a discovery candidate. The native discovery pipeline must provide
 * an actual output and READY specification before scientific admission.
 */
async function main() {
    const [path] = process.argv.slice(2);
    assert.ok(path,"Usage: check-pinned-candidate-admission <native-behavioral.json>");
    const record=JSON.parse(await readFile(path,"utf8"));
    assert.equal(record.schemaVersion,"OECL_NATIVE_BEHAVIORAL_PROPERTY_EVALUATION_V1");
    assert.equal(record.candidateDiscovery,"NOT_ADMITTED");
    assert.equal(record.finalScientificResult,"INCONCLUSIVE");
    assert.equal(record.evaluationSurfaceCompleteness,"PARTIAL");
    const candidateId=record.candidateId as string;
    const constraints=record.constraints;
    assert.equal(constraints.length,3);
    const sourceFor=(side:"A"|"B")=>{
        const first=constraints.find((x:{participantSide:string})=>x.participantSide===side);
        assert.ok(first);
        return {
            participantSide:side,participantKind:"PROTOCOL" as const,
            participantId:first.participantId,sourceId:first.sourceId,
            repository:side==="A"?"ten-io-meta/erc8060-native-eth-value":"ten-io-meta/erc8098-reference",
            sourceRevision:first.sourceRevision
        };
    };
    const sources=[sourceFor("A"),sourceFor("B")];
    const requirement={
        requirementId:"UNADMITTED-LOCAL-ONLY",
        evaluationSpecificationId:"NO-DISCOVERED-SPECIFICATION",
        candidate:{
            candidateId,participantA:{kind:"PROTOCOL",id:"ERC-8060"},
            participantB:{kind:"PROTOCOL",id:"ERC-8098"},
            mechanism:"SHARED_RECURRENT_CONCEPT",supportingCapabilityIdsA:[],supportingCapabilityIdsB:[],
            provenance:[],evaluationStatus:"UNEVALUATED"
        },
        constraints,participantAConstraintIds:constraints.filter((x:{participantSide:string})=>x.participantSide==="A").map((x:{constraintId:string})=>x.constraintId),
        participantBConstraintIds:constraints.filter((x:{participantSide:string})=>x.participantSide==="B").map((x:{constraintId:string})=>x.constraintId),
        unresolvedGuardFactIds:[],participantSources:sources
    } as unknown as ScientificCompositionExecutionRequirement;
    const admission=new ScientificDiscoveredCandidateAdmissionEngine().assess(
        candidateId,{candidates:[],errors:[]},{specifications:[],errors:[]},requirement
    );
    assert.equal(admission.status,"BLOCKED");
    assert.ok(admission.errors.some(x=>x.includes("genuinely discovered")));
    const result={
        schemaVersion:"OECL_PINNED_CANDIDATE_DISCOVERY_ADMISSION_V1",
        sourceArtifact:path,
        localPropertyEvaluation:record.result.scientificPolarity,
        candidateScientificResult:"INCONCLUSIVE",
        candidateDiscoveryStatus:admission.status,
        candidateAdmission:admission,
        /**
         * Missing outputs cannot be inferred from wallet transfers, Solidity
         * test success, or the manual choice of an ERC pair.
         */
        requiredNextEvidence:[
            "ACTUAL_CROSS_PROTOCOL_DISCOVERY_OUTPUT",
            "SOURCE_ATTESTED_DISCOVERY_PROVENANCE",
            "MATCHING_READY_EVALUATION_SPECIFICATION",
            "NATIVE_EXECUTION_REQUIREMENT_WITH_MATCHING_CONSTRAINT_IDS",
            "COMPLETE_DECLARED_A_AND_B_EVALUATION_SURFACES"
        ]
    };
    const target=path.replace(/\.json$/,".candidate-admission.json");
    await writeFile(target,JSON.stringify(result,null,2)+"\n");
    console.log("OECL_CANDIDATE_DISCOVERY:"+JSON.stringify({status:admission.status,reason:admission.errors,localPropertyPolarity:record.result.scientificPolarity}));
}
main().catch(e=>{console.error(e);process.exitCode=1;});
