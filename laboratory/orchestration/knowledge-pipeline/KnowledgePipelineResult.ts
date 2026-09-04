import type {
    CrossSourcePatternEngine
} from "../../cross-source-patterns/CrossSourcePatternEngine.js";

import type {
    ResearchConclusionEngine
} from "../../research-conclusions/ResearchConclusionEngine.js";

import type {
    ConfidenceEngine
} from "../../confidence-engine/ConfidenceEngine.js";

import type {
    ContradictionEngine
} from "../../contradiction-engine/ContradictionEngine.js";

import type {
    EvidenceGraphEngine
} from "../../evidence-graph/EvidenceGraphEngine.js";

import type {
    InferenceEngine
} from "../../inference-engine/InferenceEngine.js";

import type {
    TheoryEngine
} from "../../theory-engine/TheoryEngine.js";

import type {
    ScientificDiscoveryEngine
} from "../../scientific-discovery/ScientificDiscoveryEngine.js";

import type {
    ResearchQuestionsEngine
} from "../../research-questions/ResearchQuestionsEngine.js";

import type {
    HypothesisRefinementEngine
} from "../../hypothesis-refinement/HypothesisRefinementEngine.js";

import type {
    KnowledgeGapEngine
} from "../../knowledge-gap/KnowledgeGapEngine.js";

import type {
    ScientificConsensusEngine
} from "../../scientific-consensus/ScientificConsensusEngine.js";

export type CrossSourcePatternPipelineResult =
    ReturnType<
        CrossSourcePatternEngine["discover"]
    >;

export type ResearchConclusionPipelineResult =
    ReturnType<
        ResearchConclusionEngine["build"]
    >;

export type ConfidencePipelineResult =
    ReturnType<
        ConfidenceEngine["build"]
    >;

export type ContradictionPipelineResult =
    ReturnType<
        ContradictionEngine["build"]
    >;

export type EvidenceGraphPipelineResult =
    ReturnType<
        EvidenceGraphEngine["build"]
    >;

export type InferencePipelineResult =
    ReturnType<
        InferenceEngine["build"]
    >;

export type TheoryPipelineResult =
    ReturnType<
        TheoryEngine["build"]
    >;

export type ScientificDiscoveryPipelineResult =
    ReturnType<
        ScientificDiscoveryEngine["build"]
    >;

export type ResearchQuestionsPipelineResult =
    ReturnType<
        ResearchQuestionsEngine["build"]
    >;

export type HypothesisRefinementPipelineResult =
    ReturnType<
        HypothesisRefinementEngine["build"]
    >;

export type KnowledgeGapPipelineResult =
    ReturnType<
        KnowledgeGapEngine["build"]
    >;

export type ScientificConsensusPipelineResult =
    ReturnType<
        ScientificConsensusEngine["build"]
    >;

export interface KnowledgePipelineResult {

    crossSourcePatterns:
        CrossSourcePatternPipelineResult;

    researchConclusions:
        ResearchConclusionPipelineResult;

    confidence:
        ConfidencePipelineResult;

    contradictions:
        ContradictionPipelineResult;

    evidenceGraph:
        EvidenceGraphPipelineResult;

    inferences:
        InferencePipelineResult;

    theories:
        TheoryPipelineResult;

    scientificDiscoveries:
        ScientificDiscoveryPipelineResult;

    researchQuestions:
        ResearchQuestionsPipelineResult;

    refinedHypotheses:
        HypothesisRefinementPipelineResult;

    knowledgeGaps:
        KnowledgeGapPipelineResult;

    scientificConsensus:
        ScientificConsensusPipelineResult;

}
