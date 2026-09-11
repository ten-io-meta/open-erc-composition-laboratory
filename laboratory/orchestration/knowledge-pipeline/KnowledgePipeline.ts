import {
    CrossSourcePatternEngine
} from "../../cross-source-patterns/CrossSourcePatternEngine.js";

import type {
    SourceIndependenceAssessment
} from "../../source-independence/SourceIndependenceAssessment.js";

import {
    ResearchConclusionEngine
} from "../../research-conclusions/ResearchConclusionEngine.js";

import {
    ConfidenceEngine
} from "../../confidence-engine/ConfidenceEngine.js";

import {
    ContradictionEngine
} from "../../contradiction-engine/ContradictionEngine.js";

import {
    EvidenceGraphEngine
} from "../../evidence-graph/EvidenceGraphEngine.js";

import {
    InferenceEngine
} from "../../inference-engine/InferenceEngine.js";

import {
    TheoryEngine
} from "../../theory-engine/TheoryEngine.js";

import {
    ScientificDiscoveryEngine
} from "../../scientific-discovery/ScientificDiscoveryEngine.js";

import {
    ResearchQuestionsEngine
} from "../../research-questions/ResearchQuestionsEngine.js";

import {
    HypothesisRefinementEngine
} from "../../hypothesis-refinement/HypothesisRefinementEngine.js";

import {
    KnowledgeGapEngine
} from "../../knowledge-gap/KnowledgeGapEngine.js";

import {
    ScientificConsensusEngine
} from "../../scientific-consensus/ScientificConsensusEngine.js";

import type {
    KnowledgePipelineResult
} from "./KnowledgePipelineResult.js";

export type KnowledgePipelineInput =
    Parameters<
        CrossSourcePatternEngine["discover"]
    >[0];

export class KnowledgePipeline {

    run(
    mergedKnowledge:
        KnowledgePipelineInput,
    sourceIndependenceAssessments:
        SourceIndependenceAssessment[] = []
): KnowledgePipelineResult {

        /*
         * Cross-source pattern discovery
         */

        const crossSourcePatterns =
    new CrossSourcePatternEngine().discover(
        mergedKnowledge,
        sourceIndependenceAssessments
    );

        /*
         * Research conclusions
         */

        const researchConclusions =
            new ResearchConclusionEngine().build(
                crossSourcePatterns
            );

        /*
         * Confidence assessment
         */

        const confidence =
    new ConfidenceEngine().build(
        researchConclusions,
        sourceIndependenceAssessments
    );

        /*
         * Contradiction detection
         */

        const contradictions =
            new ContradictionEngine().build(
                researchConclusions
            );

        /*
         * Evidence graph
         */

        const evidenceGraph =
            new EvidenceGraphEngine().build(
                researchConclusions
            );

        /*
         * Machine inference
         */

        const inferences =
            new InferenceEngine().build(
                evidenceGraph
            );

        /*
         * Theory construction
         */

        const theories =
            new TheoryEngine().build(
                evidenceGraph
            );

        /*
         * Scientific discoveries
         */

        const scientificDiscoveries =
            new ScientificDiscoveryEngine().build(
                evidenceGraph
            );

        /*
         * Research question generation
         */

        const researchQuestions =
            new ResearchQuestionsEngine().build(
                theories,
                contradictions,
                confidence
            );

        /*
         * Hypothesis refinement
         */

        const refinedHypotheses =
            new HypothesisRefinementEngine().build(
                researchQuestions
            );

        /*
         * Knowledge-gap analysis
         */

        const knowledgeGaps =
            new KnowledgeGapEngine().build(
                evidenceGraph,
                confidence,
                inferences
            );

        /*
         * Scientific consensus
         */

        const scientificConsensus =
            new ScientificConsensusEngine().build(
                confidence
            );

        return {

            crossSourcePatterns,

            researchConclusions,

            confidence,

            contradictions,

            evidenceGraph,

            inferences,

            theories,

            scientificDiscoveries,

            researchQuestions,

            refinedHypotheses,

            knowledgeGaps,

            scientificConsensus

        };

    }

}