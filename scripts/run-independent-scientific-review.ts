import assert from "node:assert/strict";
import {readFileSync,mkdirSync,writeFileSync} from "node:fs";
import {dirname,resolve} from "node:path";
import {createHash} from "node:crypto";
import {ScientificIndependentReviewEngine} from
    "../laboratory/scientific-independent-review/ScientificIndependentReviewEngine.js";
import type {CrossSourcePatternResult} from
    "../laboratory/cross-source-patterns/CrossSourcePatternResult.js";
import type {ContradictionResult} from
    "../laboratory/contradiction-engine/ContradictionResult.js";

const inputs={
    patterns:"cross-source-pattern-results/OECL-V2-CROSS-SOURCE-PATTERNS.json",
    contradictions:"contradiction-results/OECL-V2-CONTRADICTIONS.json"
};
const patternBytes=readFileSync(inputs.patterns);
const contradictionBytes=readFileSync(inputs.contradictions);
const patterns=JSON.parse(patternBytes.toString("utf8")) as CrossSourcePatternResult;
const contradictions=JSON.parse(contradictionBytes.toString("utf8")) as ContradictionResult;

// Historical artifacts do NOT include an attested pair-independence matrix.
// Never infer it from two different-looking source names.
const review=new ScientificIndependentReviewEngine().review({
    patterns,independenceAssessments:[],contradictions
});
assert.equal(review.errors.length,0,"Original scientist source review invalid");
assert.ok(review.findings.length>0,"Original scientific corpus lacks research patterns");
assert.ok(review.findings.every(x=>
    x.evmExecuted===false && x.compatibilityVerdict==="NOT_EVALUATED" &&
    x.candidateAdmission==="NOT_ADMITTED"));
assert.ok(review.findings.every(x=>
    x.status!=="SOURCE_CORROBORATED_HYPOTHESIS"),
    "Source independence cannot be presumed from source-name differences");
const hash=(v:Buffer)=>createHash("sha256").update(v).digest("hex");
const output={
    schemaVersion:"OECL_ORIGINAL_SCIENTIST_SOURCE_ONLY_REVIEW_V1",
    researchInputSha256:{
        patterns:hash(patternBytes),contradictions:hash(contradictionBytes)
    },
    independentSourceAttestationsPresent:false,
    scientificScope:"ORIGINAL_RESEARCH_CORPUS_ONLY_NO_EVM",
    ...review
};
const dest=resolve(process.argv[2]||"audit-output/original-scientist-source-review.json");
mkdirSync(dirname(dest),{recursive:true});
writeFileSync(dest,JSON.stringify(output,null,2)+"\n","utf8");
console.log("OECL_ORIGINAL_SCIENTIST_SOURCE_REVIEW_PASS",JSON.stringify({
    patterns:review.findings.length,
    provisional:review.findings.filter(x=>x.status==="PROVISIONAL_HYPOTHESIS").length,
    challenged:review.findings.filter(x=>x.status==="CHALLENGED_HYPOTHESIS").length,
    evidenceGaps:review.findings.flatMap(x=>x.evidenceGaps).length,
    evmExecuted:false
}));
