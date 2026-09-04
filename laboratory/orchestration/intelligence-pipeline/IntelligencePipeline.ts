import {
    PredictionEngine
} from "../../prediction-engine/PredictionEngine.js";

import {
    ResearchEvolutionEngine
} from "../../research-evolution/ResearchEvolutionEngine.js";

import {
    KnowledgeGainEngine
} from "../../knowledge-gain/KnowledgeGainEngine.js";

import {
    RepositoryIntelligenceEngine
} from "../../repository-intelligence/RepositoryIntelligenceEngine.js";

import {
    ResearchStrategyEngine
} from "../../research-strategy/ResearchStrategyEngine.js";

import type {
    KnowledgeGapResult
} from "../../knowledge-gap/KnowledgeGapResult.js";

import type {
    ScientificDiscoveryResult
} from "../../scientific-discovery/ScientificDiscoveryResult.js";

import type {
    ResearchPlannerEvaluator
} from "../../research-planner/ResearchPlannerEvaluator.js";

import type {
    IntelligencePipelineResult
} from "./IntelligencePipelineResult.js";

type EvaluatedResearchPlan =
    ReturnType<
        ResearchPlannerEvaluator["evaluate"]
    >;

type ResearchEvolutionInput =
    Parameters<
        ResearchEvolutionEngine["build"]
    >[1];

export interface IntelligencePipelineInput {

    previousResearchState:
        Parameters<
            ResearchEvolutionEngine["build"]
        >[0];

    knowledge:
        ResearchEvolutionInput["knowledge"];

    patterns:
        ResearchEvolutionInput["patterns"];

    conclusions:
        ResearchEvolutionInput["conclusions"];

    knowledgeGaps:
        KnowledgeGapResult;

    scientificDiscoveries:
        ScientificDiscoveryResult;

    evaluatedResearchPlan:
        EvaluatedResearchPlan;

}

export class IntelligencePipeline {

    run(
        input: IntelligencePipelineInput
    ): IntelligencePipelineResult {

        /*
         * Predict likely research outcomes
         * from current gaps and discoveries.
         */

        const predictions =
            new PredictionEngine().build(
                input.knowledgeGaps,
                input.scientificDiscoveries
            );

        /*
         * Compare the current research state
         * with the previous persisted state.
         */

        const researchEvolution =
            new ResearchEvolutionEngine().build(
                input.previousResearchState ?? {},
                {
                    knowledge:
                        input.knowledge,

                    patterns:
                        input.patterns,

                    conclusions:
                        input.conclusions
                }
            );

        /*
         * Measure how much new knowledge
         * was produced by the latest evolution.
         */

        const knowledgeGain =
            new KnowledgeGainEngine().build(
                researchEvolution
            );

        /*
         * Evaluate the scientific contribution
         * of each repository.
         */

        const repositoryIntelligence =
            new RepositoryIntelligenceEngine().build(
                knowledgeGain
            );

        /*
         * Combine predictions, repository value
         * and the evaluated plan into a strategy.
         */

        const researchStrategy =
            new ResearchStrategyEngine().build(
                predictions,
                repositoryIntelligence,
                input.evaluatedResearchPlan
            );

        return {

            predictions,

            researchEvolution,

            knowledgeGain,

            repositoryIntelligence,

            researchStrategy

        };

    }

}