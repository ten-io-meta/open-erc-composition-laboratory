import assert from "node:assert/strict";
import { ScientificIndependentReviewEngine } from
    "../laboratory/scientific-independent-review/ScientificIndependentReviewEngine.js";
import type { CrossSourcePatternResult } from
    "../laboratory/cross-source-patterns/CrossSourcePatternResult.js";
import type { ContradictionResult } from
    "../laboratory/contradiction-engine/ContradictionResult.js";
import type { SourceIndependenceAssessment } from
    "../laboratory/source-independence/SourceIndependenceAssessment.js";

const engine=new ScientificIndependentReviewEngine();
const patterns: CrossSourcePatternResult={
    generatedAt:"fixture",errors:[],
    statistics:{patterns:1,candidate:0,emerging:1,supported:0,sources:2},
    patterns:[{
        patternId:"P-1",relation:"RESERVATION:CONSTRAINS:ACCOUNTING",
        normalizedRelation:"RESERVATION:CONSTRAINS:ACCOUNTING",
        protocolPair:"ERC-8060|ERC-8098",
        sources:["SRC-B","SRC-A"],occurrences:2,confidence:88,
        status:"EMERGING",
        evidence:["EVIDENCE-1","EVIDENCE-2"]
    }]
};
const contradictions: ContradictionResult={
    generatedAt:"fixture",contradictions:[],errors:[],
    statistics:{total:0,high:0,medium:0,low:0}
};
const assessment=(status:"INDEPENDENT"|"DEPENDENT"):
    SourceIndependenceAssessment=>({
        sourceIds:["SRC-A","SRC-B"],status,
        reason:"DISTINCT_SOURCE_IDENTITY_WITHOUT_DEPENDENCY_EVIDENCE",
        establishedIndependentSources:status==="INDEPENDENT"?2:0,
        explanation:"Controlled independent-source evidence"
    });
const inspect=(p=patterns,a:SourceIndependenceAssessment[]=[],c=contradictions)=>
    engine.review({patterns:p,independenceAssessments:a,contradictions:c});
const provisional=inspect();
assert.equal(provisional.errors.length,0);
assert.equal(provisional.findings[0].status,"PROVISIONAL_HYPOTHESIS");
assert.equal(provisional.findings[0].evmExecuted,false);
assert.equal(provisional.findings[0].compatibilityVerdict,"NOT_EVALUATED");
assert.equal(provisional.findings[0].candidateAdmission,"NOT_ADMITTED");
assert.match(provisional.findings[0].falsificationQuestion,/contradict/);

const supported=inspect(patterns,[assessment("INDEPENDENT")]);
assert.equal(supported.findings[0].status,"SOURCE_CORROBORATED_HYPOTHESIS");
assert.deepEqual(supported.findings[0].independentlyVerifiedSources,[
    "SRC-A","SRC-B"
]);
assert.notEqual(supported.findings[0].researchConclusion,
    "These ERCs are compatible.");
const contradiction: ContradictionResult={
    ...contradictions,contradictions:[{
        contradictionId:"COUNTER-1",subject:"RESERVATION",
        relationA:"CONSTRAINS",relationB:"RELAXES",
        object:"ACCOUNTING",supportingSources:["SRC-C"],
        confidence:90,severity:"HIGH"
    }]
};
const challenged=inspect(patterns,[assessment("INDEPENDENT")],contradiction);
assert.equal(challenged.findings[0].status,"CHALLENGED_HYPOTHESIS");
assert.deepEqual(challenged.findings[0].contradictoryEvidenceIds,["COUNTER-1"]);
assert.equal(challenged.findings[0].compatibilityVerdict,"NOT_EVALUATED");

const forged=inspect(patterns,[assessment("INDEPENDENT"),assessment("DEPENDENT")]);
assert.equal(forged.findings[0].status,"PROVISIONAL_HYPOTHESIS");
const reordered=inspect({...patterns,patterns:[{...patterns.patterns[0],
    sources:["SRC-A","SRC-B"],evidence:["EVIDENCE-2","EVIDENCE-1"]}]},
    [assessment("INDEPENDENT")]);
assert.equal(reordered.findings[0].findingId,supported.findings[0].findingId);
const withoutEvidence=inspect({...patterns,patterns:[{
    ...patterns.patterns[0],evidence:[]
}]},[assessment("INDEPENDENT")]);
assert.equal(withoutEvidence.findings[0].status,"INSUFFICIENT_EVIDENCE");
const malformed=inspect({...patterns,patterns:[{
    ...patterns.patterns[0],confidence:NaN
}]});
assert.equal(malformed.findings.length,0);
assert.ok(malformed.errors.length);
const upstream=inspect({...patterns,errors:["MALFORMED_INPUT"]});
assert.equal(upstream.findings.length,0);
assert.ok(upstream.errors.length);
console.log("OECL_INDEPENDENT_SCIENTIST_REASONING_AND_FALSIFICATION_PASS");
