import assert from "node:assert/strict";
import {SourceIndependenceAssessmentEngine} from
    "../laboratory/source-independence/SourceIndependenceAssessmentEngine.js";
import {ResearchSourceType} from "../laboratory/research-source/ResearchSourceType.js";
import type {ResearchSource} from "../laboratory/research-source/ResearchSource.js";
import type {SourceIndependenceEvidence} from
    "../laboratory/source-independence/SourceIndependenceEvidence.js";

const engine=new SourceIndependenceAssessmentEngine();
const source=(id:string):ResearchSource=>({
    sourceId:id,title:id,type:ResearchSourceType.GITHUB,
    location:"https://example.com/"+id,
    keywords:[],referencedProtocols:[],referencedCapabilities:[],ingested:true
});
const evidence=(status:"INDEPENDENT"|"DEPENDENT",
    ids=["ATTESTED-ORIGIN-1"]):SourceIndependenceEvidence=>({
    sourceAId:"SRC-A",sourceBId:"SRC-B",
    status,basis:"Concrete source origin reviewed",evidenceIds:ids
});
const run=(items:SourceIndependenceEvidence[])=>
    engine.build([source("SRC-A"),source("SRC-B")],items).assessments[0];

const verified=run([evidence("INDEPENDENT")]);
assert.equal(verified.status,"INDEPENDENT");
assert.equal(verified.establishedIndependentSources,2);
const reversed=run([{...evidence("INDEPENDENT"),
    sourceAId:"SRC-B",sourceBId:"SRC-A"}]);
assert.equal(reversed.status,"INDEPENDENT");
const dependent=run([evidence("DEPENDENT")]);
assert.equal(dependent.status,"DEPENDENT");
for(const conflicting of [
    [evidence("INDEPENDENT"),evidence("DEPENDENT")],
    [evidence("DEPENDENT"),evidence("INDEPENDENT")]
]){
    const result=run(conflicting);
    assert.equal(result.status,"INCONCLUSIVE",
        "Contradiction must not be decided by input order");
    assert.equal(result.establishedIndependentSources,0);
}
const unanchored=run([evidence("INDEPENDENT",[])]);
assert.equal(unanchored.status,"INCONCLUSIVE");
assert.equal(unanchored.establishedIndependentSources,0);
const emptyBasis=run([{...evidence("INDEPENDENT"),basis:""}]);
assert.equal(emptyBasis.status,"INCONCLUSIVE");
const repeated=run([evidence("INDEPENDENT"),evidence("INDEPENDENT")]);
assert.equal(repeated.status,"INDEPENDENT");
console.log("OECL_SCIENTIST_INDEPENDENCE_ORIGIN_ATTESTATION_FAIL_CLOSED_PASS");
