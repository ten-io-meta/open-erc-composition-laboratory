import { createHash } from "node:crypto";
import type { CrossSourcePatternResult } from "../cross-source-patterns/CrossSourcePatternResult.js";
import type { SourceIndependenceAssessment } from "../source-independence/SourceIndependenceAssessment.js";
import type { ContradictionResult } from "../contradiction-engine/ContradictionResult.js";
import { SourceIndependenceSetAssessmentEngine } from "../source-independence/SourceIndependenceSetAssessmentEngine.js";

export type IndependentResearchStatus =
    | "INSUFFICIENT_EVIDENCE"
    | "PROVISIONAL_HYPOTHESIS"
    | "SOURCE_CORROBORATED_HYPOTHESIS"
    | "CHALLENGED_HYPOTHESIS";

export interface IndependentResearchFinding {
    findingId: string;
    originatingPatternId: string;
    relation: string;
    protocolPair: string | null;
    statement: string;
    status: IndependentResearchStatus;
    researchConclusion: string;
    falsificationQuestion: string;
    alternativeExplanations: string[];
    sourceIds: string[];
    independentlyVerifiedSources: string[];
    claimedEvidenceIds: string[];
    contradictoryEvidenceIds: string[];
    evidenceGaps: string[];
    inputPatternConfidence: number;
    evidenceScope: "RESEARCH_SOURCE_PATTERNS_ONLY";
    compatibilityVerdict: "NOT_EVALUATED";
    candidateAdmission: "NOT_ADMITTED";
    evmExecuted: false;
}
export interface IndependentScientificReviewResult {
    status: "INDEPENDENT_SCIENTIFIC_REVIEW";
    findings: IndependentResearchFinding[];
    errors: string[];
    scientificBoundary: string;
}
export interface IndependentScientificReviewInput {
    patterns: CrossSourcePatternResult;
    independenceAssessments: SourceIndependenceAssessment[];
    contradictions: ContradictionResult;
}

/**
 * OECL's original scientist may generate TESTABLE interpretation without EVM.
 * This module does not execute, certify, or automatically admit any protocol.
 * Input pattern confidence is diagnostic; it is never used as proof of truth.
 */
export class ScientificIndependentReviewEngine {
    review(input: IndependentScientificReviewInput): IndependentScientificReviewResult {
        const fail = (error: string): IndependentScientificReviewResult => ({
            status:"INDEPENDENT_SCIENTIFIC_REVIEW",findings:[],errors:[error],
            scientificBoundary:"Source-only reasoning; execution and compatibility not evaluated."
        });
        if (!input?.patterns || !input.contradictions ||
            !Array.isArray(input.patterns.patterns) ||
            !Array.isArray(input.patterns.errors) ||
            !Array.isArray(input.contradictions.contradictions) ||
            !Array.isArray(input.contradictions.errors) ||
            !Array.isArray(input.independenceAssessments))
            return fail("INVALID_SCIENTIFIC_REVIEW_INPUT");
        if (input.patterns.errors.length || input.contradictions.errors.length)
            return fail("UPSTREAM_SCIENTIFIC_EVIDENCE_ERRORS");
        if (input.patterns.patterns.length>1000 ||
            input.contradictions.contradictions.length>2000 ||
            input.independenceAssessments.length>40000)
            return fail("REVIEW_INPUT_LIMIT");
        const assessor = new SourceIndependenceSetAssessmentEngine();
        const findings:IndependentResearchFinding[]=[];
        const used = new Set<string>();
        const errors:string[]=[];
        for (const pattern of [...input.patterns.patterns].sort(
            (a,b)=>String(a?.patternId??"").localeCompare(String(b?.patternId??"")))) {
            const sourceIds = Array.isArray(pattern.sources) ?
                [...new Set(pattern.sources)].sort() : [];
            const evidenceIds = Array.isArray(pattern.evidence) ?
                [...new Set(pattern.evidence)].sort() : [];
            if (typeof pattern.patternId!=="string" ||
                !pattern.patternId.trim() || pattern.patternId.length>128 ||
                used.has(pattern.patternId) ||
                typeof pattern.normalizedRelation!=="string" ||
                pattern.normalizedRelation.length>300 ||
                sourceIds.length>128 || evidenceIds.length>256 ||
                sourceIds.some(s=>typeof s!=="string"||!s.trim()||s.length>256) ||
                evidenceIds.some(s=>typeof s!=="string"||!s.trim()||s.length>512) ||
                !Number.isFinite(pattern.confidence) ||
                pattern.confidence<0 || pattern.confidence>100) {
                errors.push("INVALID_OR_DUPLICATE_RESEARCH_PATTERN");
                continue;
            }
            used.add(pattern.patternId);
            const normalized=pattern.normalizedRelation.replace(/->/g,":").trim();
            const atoms=normalized.split(":").map(x=>x.trim());
            if (atoms.length!==3 || atoms.some(x=>!x||x.length>100)) {
                errors.push("UNSTRUCTURED_RESEARCH_RELATION");
                continue;
            }
            const [subject,predicate,object]=atoms;
            const linked=input.contradictions.contradictions.filter(c=>
                String(c.subject).toUpperCase()===subject.toUpperCase() &&
                String(c.object).toUpperCase()===object.toUpperCase() &&
                [c.relationA,c.relationB].some(v=>
                    String(v).toUpperCase()===predicate.toUpperCase())
            );
            const contradictoryEvidenceIds=[...new Set(linked.map(x=>x.contradictionId))].sort();
            const independence=assessor.build(
                sourceIds,input.independenceAssessments);
            const gaps:string[]=[];
            if (!sourceIds.length)gaps.push("SOURCE_IDENTITIES_NOT_AVAILABLE");
            if (!evidenceIds.length)gaps.push("NO_TRACEABLE_PATTERN_EVIDENCE_IDS");
            if (independence.establishedIndependentSources<2)
                gaps.push("FEWER_THAN_TWO_MUTUALLY_VERIFIED_INDEPENDENT_SOURCES");
            if (independence.hasInconclusiveRelationships)
                gaps.push("SOURCE_INDEPENDENCE_NOT_FULLY_RESOLVED");
            if (contradictoryEvidenceIds.length)
                gaps.push("CONTRADICTORY_RESEARCH_EVIDENCE_REQUIRES_RESOLUTION");
            // This label describes the *research hypothesis*, never behavior
            // demonstrated on Ethereum or compatibility between contracts.
            const status:IndependentResearchStatus =
                contradictoryEvidenceIds.length?"CHALLENGED_HYPOTHESIS":
                !sourceIds.length||!evidenceIds.length?"INSUFFICIENT_EVIDENCE":
                independence.establishedIndependentSources>=2?
                    "SOURCE_CORROBORATED_HYPOTHESIS":"PROVISIONAL_HYPOTHESIS";
            const statement =
                "Hypothesis: under an explicitly defined scope, "+normalized+
                " may be a reproducible research relation.";
            const researchConclusion =
                status==="CHALLENGED_HYPOTHESIS"?
                    "An explicit counter-relation challenges this source-level hypothesis; the conflict is unresolved.":
                status==="SOURCE_CORROBORATED_HYPOTHESIS"?
                    "This relation recurs in mutually independent source identities, but its implementation semantics and EVM behavior remain untested.":
                status==="PROVISIONAL_HYPOTHESIS"?
                    "A source-level pattern suggests the relation; independent corroboration remains insufficient.":
                    "The source record does not yet justify an evidence-backed hypothesis.";
            const falsificationQuestion =
                "Can a pinned independent specification or implementation observation contradict "+
                normalized+" under the same stated assumptions and participant roles?";
            const findingId="SCI-REVIEW-"+createHash("sha256").update(JSON.stringify({
                relation:normalized,protocolPair:pattern.protocolPair??null,
                sourceIds,evidenceIds,contradictoryEvidenceIds
            })).digest("hex").slice(0,24);
            findings.push({
                findingId,originatingPatternId:pattern.patternId,
                relation:normalized,protocolPair:pattern.protocolPair??null,
                statement,status,researchConclusion,falsificationQuestion,
                alternativeExplanations:[
                    "The sources may share an upstream implementation or document despite distinct identifiers.",
                    "Similar terminology may refer to different units, permissions or transaction semantics.",
                    "The apparent relation may hold only under unobserved environmental conditions."
                ],
                sourceIds,
                independentlyVerifiedSources:
                    independence.establishedIndependentSourceIds,
                claimedEvidenceIds:evidenceIds,contradictoryEvidenceIds,
                evidenceGaps:gaps,inputPatternConfidence:pattern.confidence,
                evidenceScope:"RESEARCH_SOURCE_PATTERNS_ONLY",
                compatibilityVerdict:"NOT_EVALUATED",
                candidateAdmission:"NOT_ADMITTED",evmExecuted:false
            });
        }
        return {
            status:"INDEPENDENT_SCIENTIFIC_REVIEW",findings,errors,
            scientificBoundary:
                "Research hypotheses and provisional source conclusions are independent of EVM execution; neither source corroboration nor a missing EVM result establishes compatibility."
        };
    }
}
