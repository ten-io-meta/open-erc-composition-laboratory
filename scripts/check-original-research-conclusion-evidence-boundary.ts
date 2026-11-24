import assert from "node:assert/strict";
import {ResearchConclusionEngine} from
    "../laboratory/research-conclusions/ResearchConclusionEngine.js";
import type {SourceIndependenceAssessment} from
    "../laboratory/source-independence/SourceIndependenceAssessment.js";

const engine=new ResearchConclusionEngine();
const pattern={
    patternId:"P-CONTROLLED",normalizedRelation:"RESERVATION:CONSTRAINS:ACCOUNTING",
    relation:"RESERVATION:CONSTRAINS:ACCOUNTING",
    sources:["SRC-A","SRC-B","SRC-C"],
    confidence:95,status:"SUPPORTED",evidence:["CLAIM-1"]
};
const payload={patterns:[pattern],errors:[]};
const pair=(a:string,b:string):SourceIndependenceAssessment=>({
    sourceIds:[a,b],status:"INDEPENDENT",
    establishedIndependentSources:2,
    reason:"DISTINCT_SOURCE_IDENTITY_WITHOUT_DEPENDENCY_EVIDENCE",
    explanation:"controlled independent-source attestation"
});
const ab=pair("SRC-A","SRC-B"),ac=pair("SRC-A","SRC-C"),bc=pair("SRC-B","SRC-C");
const read=(source:any,assessments:SourceIndependenceAssessment[]=[])=>{
    const result=engine.build(source,assessments);
    assert.deepEqual(result.errors,[]);
    assert.equal(result.conclusions.length,1);
    return result.conclusions[0];
};
const claimed=read(payload);
assert.equal(claimed.status,"PRELIMINARY",
    "Pattern STATUS+confidence alone cannot establish independent science");
const partial=read(payload,[ab]);
assert.equal(partial.status,"SUPPORTED");
const full=read(payload,[ab,ac,bc]);
assert.equal(full.status,"ESTABLISHED",
    "Three independently assessed sources may establish a scoped research pattern");
assert.equal(full.supportedBy.length,3);
assert.equal(full.evidence[0],"CLAIM-1");
const contradictory=read(payload,[ab,ac,bc,{
    ...ab,status:"DEPENDENT",establishedIndependentSources:0
}]);
assert.notEqual(contradictory.status,"ESTABLISHED");
const noEvidence=read({patterns:[{...pattern,evidence:[]}],errors:[]},[ab,ac,bc]);
assert.equal(noEvidence.status,"PRELIMINARY");
const onlyNames=read({patterns:[{...pattern,sources:["SRC-A","SRC-A","SRC-B"]}],errors:[]});
assert.equal(onlyNames.status,"PRELIMINARY");
const scoreOutOfRange=read({patterns:[{...pattern,confidence:999}],errors:[]},[ab,ac,bc]);
assert.notEqual(scoreOutOfRange.status,"ESTABLISHED");
assert.equal(scoreOutOfRange.confidence,0);
const upstream=engine.build({patterns:[pattern],errors:["CORRUPTED_UPSTREAM_GRAPH"]},
    [ab,ac,bc]);
assert.equal(upstream.conclusions.length,0);
assert.ok(upstream.errors.length);
console.log("OECL_ORIGINAL_RESEARCH_CONCLUSION_EVIDENCE_GATE_PASS");
