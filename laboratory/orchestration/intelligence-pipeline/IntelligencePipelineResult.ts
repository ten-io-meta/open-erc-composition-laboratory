import type {
    PredictionEngine
} from "../../prediction-engine/PredictionEngine.js";

import type {
    ResearchEvolutionEngine
} from "../../research-evolution/ResearchEvolutionEngine.js";

import type {
    KnowledgeGainEngine
} from "../../knowledge-gain/KnowledgeGainEngine.js";

import type {
    RepositoryIntelligenceEngine
} from "../../repository-intelligence/RepositoryIntelligenceEngine.js";

import type {
    ResearchStrategyEngine
} from "../../research-strategy/ResearchStrategyEngine.js";

export type PredictionPipelineResult =
    ReturnType<
        PredictionEngine["build"]
    >;

export type ResearchEvolutionPipelineResult =
    ReturnType<
        ResearchEvolutionEngine["build"]
    >;

export type KnowledgeGainPipelineResult =
    ReturnType<
        KnowledgeGainEngine["build"]
    >;

export type RepositoryIntelligencePipelineResult =
    ReturnType<
        RepositoryIntelligenceEngine["build"]
    >;

export type ResearchStrategyPipelineResult =
    ReturnType<
        ResearchStrategyEngine["build"]
    >;

export interface IntelligencePipelineResult {

    predictions:
        PredictionPipelineResult;

    researchEvolution:
        ResearchEvolutionPipelineResult;

    knowledgeGain:
        KnowledgeGainPipelineResult;

    repositoryIntelligence:
        RepositoryIntelligencePipelineResult;

    researchStrategy:
        ResearchStrategyPipelineResult;

}