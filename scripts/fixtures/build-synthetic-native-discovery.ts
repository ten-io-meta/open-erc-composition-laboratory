import assert from "node:assert/strict";
import { CrossProtocolCompositionEngine } from "../../laboratory/scientific-cross-protocol-composition/CrossProtocolCompositionEngine.js";
import type { ScientificProtocolConceptAttributionResult } from "../../laboratory/scientific-protocol-concept-attribution/ScientificProtocolConceptAttributionResult.js";

/**
 * TEST ONLY. Artificial protocol capabilities and provenance deliberately
 * exercise the native discovery logic, but are not real source evidence.
 */
export function syntheticNativeDiscovery(
    sideA:{participantId:string;sourceId:string;sourceRevision:string},
    sideB:{participantId:string;sourceId:string;sourceRevision:string}
) {
    const inputs=[sideA,sideB].map((s,i)=>({
        sourceId:s.sourceId,
        sourceRevision:s.sourceRevision,
        sourceModelId:"SYNTHETIC-SCIENTIFIC-ONTOLOGY",
        protocolConcepts:[{
            protocolConceptId:"TEST-CONCEPT-"+String(i),
            conceptId:"TEST-RECURRENT-BURN",
            label:"test-only-recurrent-property",
            protocolId:s.participantId,
            lexicalCapabilityIds:["CAP-"+String(i)+"-1","CAP-"+String(i)+"-2"],
            protocolAttributionIds:["ATTR-"+String(i)+"-1","ATTR-"+String(i)+"-2"],
            evidence:["TEST-SOURCE-FACT-"+String(i)+"-1","TEST-SOURCE-FACT-"+String(i)+"-2"]
        }],
        unattributedConceptIds:[],
        errors:[]
    })) as ScientificProtocolConceptAttributionResult[];
    const discoveryInput={
        protocolConceptResults:inputs,
        protocolRelationEvidenceResults:[]
    };
    const discovery=new CrossProtocolCompositionEngine().discover(discoveryInput);
    assert.deepEqual(discovery.errors,[],"Synthetic native discovery input rejected");
    assert.equal(discovery.candidates.length,1,"Synthetic native discovery must create exactly one candidate");
    const candidate=discovery.candidates[0];
    assert.equal(candidate.mechanism,"SHARED_RECURRENT_CONCEPT");
    assert.equal(candidate.participantA.id,sideA.participantId);
    assert.equal(candidate.participantB.id,sideB.participantId);
    return {discoveryInput,discovery,candidate};
}
