import type {
    GitHubRepositoryIntelligenceResult
} from "../../github-adapter/GitHubRepositoryIntelligence.js";

import {
    ScientificBeliefStateTransitionEngine
} from "../../scientific-belief-state-transition/ScientificBeliefStateTransitionEngine.js";

import {
    ScientificExecutionTargetResolverEngine
} from "../../scientific-execution-target-resolution/ScientificExecutionTargetResolverEngine.js";

import {
    ScientificExecutionSpecificationEngine
} from "../../scientific-execution-specification/ScientificExecutionSpecificationEngine.js";

import type {
    ScientificExecutionSpecificationResult
} from "../../scientific-execution-specification/ScientificExecutionSpecificationResult.js";

import {
    ScientificExecutionResultEvaluatorEngine
} from "../../scientific-execution-result-evaluator/ScientificExecutionResultEvaluatorEngine.js";

import type {
    ScientificExecutionResultEvaluationResult
} from "../../scientific-execution-result-evaluator/ScientificExecutionResultEvaluationResult.js";

import { readFile } from "fs/promises";

import {
    ScientificExperimentQueueEngine
} from "../../scientific-experiment-queue/ScientificExperimentQueueEngine.js";

import {
    ScientificKnowledgeEvidenceMatcherEngine
} from "../../scientific-knowledge-evidence-matcher/ScientificKnowledgeEvidenceMatcherEngine.js";
import type {
    ScientificEvidenceAssimilationResult
} from "../../scientific-evidence-assimilation/ScientificEvidenceAssimilationResult.js";

import {
    ScientificEvidenceAssimilationEngine
} from "../../scientific-evidence-assimilation/ScientificEvidenceAssimilationEngine.js";

import {
    ScientificEvidenceFeedbackEngine
} from "../../scientific-evidence-feedback/ScientificEvidenceFeedbackEngine.js";

import type {
    SourceIndependenceAssessment
} from "../../source-independence/SourceIndependenceAssessment.js";

import {
    ScientificExecutionEvidenceEngine
} from "../../scientific-execution-evidence/ScientificExecutionEvidenceEngine.js";

import {
    ScientificExecutionReferentialIntegrityEngine
} from "../../scientific-execution-referential-integrity/ScientificExecutionReferentialIntegrityEngine.js";

import {
    ScientificPostExecutionReferentialIntegrityEngine
} from "../../scientific-post-execution-referential-integrity/ScientificPostExecutionReferentialIntegrityEngine.js";

import {
    ScientificExperimentExecutionPlannerEngine
} from "../../scientific-experiment-execution/ScientificExperimentExecutionPlannerEngine.js";

import {
    ScientificExecutionCapabilityEngine
} from "../../scientific-execution-capability/ScientificExecutionCapabilityEngine.js";

import {
    ScientificExecutionPlanEngine
} from "../../scientific-execution-plan/ScientificExecutionPlanEngine.js";

import {
    ScientificExecutionOutcomeEngine
} from "../../scientific-execution-outcome/ScientificExecutionOutcomeEngine.js";

import {
    ScientificExecutionObservationEngine
} from "../../scientific-execution-observation/ScientificExecutionObservationEngine.js";

import {
    ScientificExecutionRuntimeEngine
} from "../../scientific-execution-runtime/ScientificExecutionRuntimeEngine.js";

import {
    ScientificRuntimeOutcomeAdapter
} from "../../scientific-runtime-outcome-adapter/ScientificRuntimeOutcomeAdapter.js";

import {
    KnowledgeConsolidationEngine
} from "../../knowledge-consolidation/KnowledgeConsolidationEngine.js";

import {
    ScientificValidationEngine
} from "../../scientific-validation/ScientificValidationEngine.js";

import {
    ScientificRetestPlannerEngine
} from "../../scientific-retest-planner/ScientificRetestPlannerEngine.js";

import {
    ScientificRetestExperimentEngine
} from "../../scientific-retest-experiment/ScientificRetestExperimentEngine.js";

import {
    ScientificRevisionEngine
} from "../../scientific-revision/ScientificRevisionEngine.js";

import {
    AutonomousExperimentDesignEngine
} from "../../autonomous-experiment-design/AutonomousExperimentDesignEngine.js";

import {
    ScientificKnowledgeEvolutionEngine
} from "../../scientific-knowledge-evolution/ScientificKnowledgeEvolutionEngine.js";

import {
    ScientificKnowledgeEvidenceReconciliationEngine
} from "../../scientific-knowledge-evidence-reconciliation/ScientificKnowledgeEvidenceReconciliationEngine.js";

import {
    ScientificBeliefRevisionEngine
} from "../../scientific-belief-revision/ScientificBeliefRevisionEngine.js";

import {
    ScientificBeliefTransitionAuthorizationEngine
} from "../../scientific-belief-transition-authorization/ScientificBeliefTransitionAuthorizationEngine.js";

import {
    ScientificEvidenceAccumulatorEngine
} from "../../scientific-evidence-accumulator/ScientificEvidenceAccumulatorEngine.js";

import {
    ScientificMemoryEngine
} from "../../scientific-memory/ScientificMemoryEngine.js";

import {
    ScientificSelfCritiqueEngine
} from "../../scientific-self-critique/ScientificSelfCritiqueEngine.js";

import type {
    ConfidenceAssessmentResult
} from "../../confidence-engine/ConfidenceAssessmentResult.js";

import type {
    ResearchTheoryResult
} from "../../theory-engine/ResearchTheoryResult.js";

import type {
    EvidenceGraphResult
} from "../../evidence-graph/EvidenceGraphResult.js";

import type {
    ContradictionResult
} from "../../contradiction-engine/ContradictionResult.js";

import type {
    KnowledgeGapResult
} from "../../knowledge-gap/KnowledgeGapResult.js";

import type {
    ScientificConsensusResult
} from "../../scientific-consensus/ScientificConsensusResult.js";

import type {
    ScientificKnowledgeEvolutionResult
} from "../../scientific-knowledge-evolution/ScientificKnowledgeEvolutionResult.js";

import type {
    ScientificEvidenceAccumulatorResult
} from "../../scientific-evidence-accumulator/ScientificEvidenceAccumulatorResult.js";

import type {
    ScientificPipelineResult
} from "./ScientificPipelineResult.js";

import type {
    ScientificDiscoveryResult
} from "../../scientific-discovery/ScientificDiscoveryResult.js";

import type {
    HypothesisRefinementResult
} from "../../hypothesis-refinement/HypothesisRefinementResult.js";

type ScientificRepositoryToolchain =
    | "FOUNDRY"
    | "HARDHAT"
    | "MIXED"
    | "UNKNOWN";

interface ScientificRepositorySourceMetadata {

    repository?: string;

    localPath?: string;

    toolchain?:
        ScientificRepositoryToolchain;

}

interface ScientificSourceManifest {

    sources: Array<{

        sourceId: string;

        path: string;

        enabled: boolean;

    }>;

}

export interface ScientificPipelineInput {

    campaignId: string;

    sourceIndependenceAssessments:
    SourceIndependenceAssessment[];

    confidence:
        ConfidenceAssessmentResult;

    theories:
        ResearchTheoryResult;

    evidenceGraph:
        EvidenceGraphResult;

    contradictions:
        ContradictionResult;

    knowledgeGaps:
        KnowledgeGapResult;

    consensus:
        ScientificConsensusResult;

    scientificDiscoveries:
        ScientificDiscoveryResult;

    refinedHypotheses:
        HypothesisRefinementResult;

}

export class ScientificPipeline {

    async run(
        input: ScientificPipelineInput
    ): Promise<ScientificPipelineResult> {

        /*
         * 1. Consolidate current knowledge.
         */

        const knowledgeConsolidation =
            new KnowledgeConsolidationEngine().build(
                input.confidence
            );

        /*
         * 2. Validate and challenge theories.
         */

        const scientificValidation =
    new ScientificValidationEngine().build(
        input.theories,
        input.evidenceGraph,
        input.contradictions,
        input.sourceIndependenceAssessments
    );

        /*
* 3. Design autonomous experiments.
 */

const sourceRepositories =
    await this.loadSourceRepositories();

const repositoryExecutionIntelligence =
    await this.loadRepositoryExecutionIntelligence();

const autonomousExperiments =
    new AutonomousExperimentDesignEngine().build(
        scientificValidation,
        input.knowledgeGaps,
        input.contradictions,
        input.confidence,
        input.evidenceGraph,
        sourceRepositories,
        repositoryExecutionIntelligence
    );
        /*
         * 4. Load previous scientific evolution.
         */

    const previousScientificEvolution =
    await this.loadOptionalJson<
        ScientificKnowledgeEvolutionResult
    >(
        "./scientific-knowledge-evolution-results/" +
        "OECL-V2-SCIENTIFIC-KNOWLEDGE-EVOLUTION.json"
    );

const previousScientificEvidenceAssimilation =
    await this.loadOptionalJson<
        ScientificEvidenceAssimilationResult
    >(
        "./scientific-evidence-assimilation-results/" +
        "OECL-V2-SCIENTIFIC-EVIDENCE-ASSIMILATION.json"
    );

const effectivePreviousScientificEvolution:
    ScientificKnowledgeEvolutionResult | null =
        previousScientificEvolution
            ? {
                ...previousScientificEvolution,

                states:
                    previousScientificEvidenceAssimilation
                        ?.campaignId ===
                    previousScientificEvolution.campaignId
                        ? previousScientificEvidenceAssimilation.states
                        : previousScientificEvolution.states
            }
            : null;
            const recentlyStrengthenedKnowledgeIds =
    new Set(
        (
            previousScientificEvidenceAssimilation
                ?.assimilations ??
            []
        )
            .filter(
                assimilation =>
                    assimilation.assimilated === true &&
                    assimilation.action === "STRENGTHEN"
            )
            .map(
                assimilation =>
                    assimilation.knowledgeId
            )
    );
        /*
         * 5. Build scientific knowledge evolution.
         */

        const scientificKnowledgeEvolution =
            new ScientificKnowledgeEvolutionEngine().build(
                input.campaignId,
                knowledgeConsolidation,
                scientificValidation,
                input.consensus,
                effectivePreviousScientificEvolution,
                recentlyStrengthenedKnowledgeIds
            );

        /*
         * 6. Load previous evidence accumulator.
         */

        const previousEvidenceAccumulator =
            await this.loadOptionalJson<
                ScientificEvidenceAccumulatorResult
            >(
                "./scientific-evidence-accumulator-results/" +
                "OECL-V2-SCIENTIFIC-EVIDENCE-ACCUMULATOR.json"
            );

        /*
         * 7. Accumulate scientific evidence.
         */

        const scientificEvidenceAccumulator =
            new ScientificEvidenceAccumulatorEngine().build(
                scientificKnowledgeEvolution,
                previousEvidenceAccumulator
            );

        /*
         * 8. Build persistent scientific memory.
         */

        const scientificMemory =
            await new ScientificMemoryEngine().build(
                input.campaignId,
                scientificKnowledgeEvolution
            );

        /*
         * 9. Critique current theories and knowledge.
         */

        const scientificSelfCritique =
            new ScientificSelfCritiqueEngine().build(
                input.campaignId,
                scientificValidation,
                input.contradictions,
                scientificEvidenceAccumulator,
                scientificMemory,
                input.scientificDiscoveries
            );

        /*
         * 10. Build scientific revision decisions.
         */

        const scientificRevision =
            new ScientificRevisionEngine().build(
                input.campaignId,
                scientificSelfCritique,
                scientificKnowledgeEvolution
            );

        /*
         * 11. Build scientific retest plans.
         */

        const scientificRetestPlanner =
            new ScientificRetestPlannerEngine().build(
                input.campaignId,
                scientificRevision
            );

        /*
         * 12. Build scientific retest experiments.
         */

        const scientificRetestExperiments =
            new ScientificRetestExperimentEngine().build(
                input.campaignId,
                scientificRetestPlanner
            );

        /*
         * 13. Build unified scientific experiment queue.
         */

        const scientificExperimentQueue =
            new ScientificExperimentQueueEngine().build(
                input.campaignId,
                autonomousExperiments,
                scientificRetestExperiments
            );

        /*
         * 14. Build scientific experiment execution tasks.
         */

        const scientificExperimentExecution =
            new ScientificExperimentExecutionPlannerEngine().build(
                input.campaignId,
                scientificExperimentQueue
            );

        /*
 * Resolve concrete executable targets
 * from repository execution intelligence.
 */

const scientificExecutionTargetResolution =
    new ScientificExecutionTargetResolverEngine().build(
        input.campaignId,
        scientificExperimentExecution,
        repositoryExecutionIntelligence
    );

        /*
         * 15. Build scientific execution capability classification.
         */

        const scientificExecutionCapabilities =
            new ScientificExecutionCapabilityEngine().build(
                input.campaignId,
                scientificExperimentExecution
            );

        /*
         * 16. Build operational scientific execution plans.
         */
const scientificExecutionPlans =
    new ScientificExecutionPlanEngine().build(
        input.campaignId,
        scientificExperimentExecution,
        scientificExecutionCapabilities
    );

/*
 * Build executable scientific specifications.
 */

const repositoryToolchains =
    await this.loadRepositoryToolchains();

const repositoryLocalPaths =
    await this.loadRepositoryLocalPaths();

const scientificExecutionSpecifications:
    ScientificExecutionSpecificationResult =
        new ScientificExecutionSpecificationEngine().build(
            input.campaignId,
            scientificExecutionPlans,
            scientificExecutionTargetResolution,
            repositoryToolchains,
            repositoryLocalPaths
        );

/*
        
 * 17. Build initial scientific execution outcomes.
 */

const scientificExecutionOutcomes =
    new ScientificExecutionOutcomeEngine().build(
        input.campaignId,
        scientificExecutionPlans
    );

/*
 * 18. Execute supported scientific runtime steps.
 */

const scientificExecutionRuntime =
    await new ScientificExecutionRuntimeEngine().build(
        input.campaignId,
        scientificExecutionPlans,
        scientificExecutionSpecifications
    );

/*
 * 19. Reconcile runtime executions with scientific outcomes.
 */

const scientificRuntimeOutcomeAdapter =
    new ScientificRuntimeOutcomeAdapter().build(
        input.campaignId,
        scientificExecutionOutcomes,
        scientificExecutionRuntime
    );

/*
 * 20. Evaluate scientific meaning of runtime outcomes.
 */

const scientificExecutionResultEvaluation:
    ScientificExecutionResultEvaluationResult =
        new ScientificExecutionResultEvaluatorEngine().build(
            input.campaignId,
            scientificRuntimeOutcomeAdapter.updatedOutcomes
        );

/*
 * 21. Build scientific observations from evaluated outcomes.
 */

const scientificExecutionObservations =
    new ScientificExecutionObservationEngine().build(
        input.campaignId,
        scientificExecutionResultEvaluation.updatedOutcomes
    );

/*
 * 20. Build scientific observations from updated outcomes.
 */

const scientificExecutionEvidence =
    new ScientificExecutionEvidenceEngine().build(
        input.campaignId,
        scientificExecutionObservations
    );

/*
 * 10.4G
 * Validate end-to-end execution referential integrity and
 * scientific / executable-target provenance continuity.
 */
const scientificExecutionReferentialIntegrity =
    new ScientificExecutionReferentialIntegrityEngine().build(
        input.campaignId,
        scientificExperimentQueue,
        scientificExperimentExecution,
        scientificExecutionPlans,
        scientificExecutionSpecifications,
        scientificExecutionRuntime,
        scientificExecutionResultEvaluation.updatedOutcomes,
        scientificExecutionObservations,
        scientificExecutionEvidence
    );
    /*
 * 22. Build scientific evidence feedback.
 */

const scientificEvidenceFeedback =
    new ScientificEvidenceFeedbackEngine().build(
        input.campaignId,
        scientificExecutionEvidence
    );
    /*
 * 23. Match scientific evidence feedback to knowledge states.
 */

const scientificKnowledgeEvidenceMatches =
    new ScientificKnowledgeEvidenceMatcherEngine().build(
        input.campaignId,
        scientificEvidenceFeedback,
        scientificKnowledgeEvolution,
        input.theories,
        input.evidenceGraph
    );
    /*
 * 24. Assimilate matched execution evidence into knowledge states.
 */

const scientificEvidenceAssimilation =
    new ScientificEvidenceAssimilationEngine().build(
        input.campaignId,
        scientificKnowledgeEvolution,
        scientificKnowledgeEvidenceMatches
    );
    /*
 * 25. Reconcile assimilated execution evidence with
 *     scientific knowledge evolution.
 */

const scientificKnowledgeEvidenceReconciliation =
    new ScientificKnowledgeEvidenceReconciliationEngine().build(
        scientificKnowledgeEvolution,
        scientificEvidenceAssimilation
    );
    /*
 * 26. Assess post-execution scientific belief revision.
 *
 * This stage interprets reconciled scientific evidence pressure
 * without automatically mutating confidence, status or
 * independent-source counts.
 */
const scientificBeliefRevision =
    new ScientificBeliefRevisionEngine().build(
        scientificKnowledgeEvidenceReconciliation
    );
    /*
 * 27. Authorize scientifically justified belief-transition direction.
 *
 * Authorization does not mutate confidence, lifecycle status
 * or independent-source counts.
 */
const scientificBeliefTransitionAuthorization =
    new ScientificBeliefTransitionAuthorizationEngine().build(
        scientificBeliefRevision
    );

    const scientificBeliefStateTransition =
    new ScientificBeliefStateTransitionEngine().build(
        scientificBeliefTransitionAuthorization,
        scientificEvidenceAssimilation
    );
    /*
     * 10.4H
     * Validate post-execution referential integrity from execution
     * evidence through epistemic reconciliation and belief transition.
     */
    const scientificPostExecutionReferentialIntegrity =
        new ScientificPostExecutionReferentialIntegrityEngine().build(
            input.campaignId,
            scientificExecutionEvidence,
            scientificEvidenceFeedback,
            scientificKnowledgeEvidenceMatches,
            scientificEvidenceAssimilation,
            scientificKnowledgeEvidenceReconciliation,
            scientificBeliefRevision,
            scientificBeliefTransitionAuthorization,
            scientificBeliefStateTransition
        );

      return {

    knowledgeConsolidation,

    scientificValidation,

    autonomousExperiments,

    scientificKnowledgeEvolution,

    scientificEvidenceAccumulator,

    scientificMemory,

    scientificSelfCritique,

    scientificRevision,

    scientificRetestPlanner,

    scientificRetestExperiments,

    scientificExperimentQueue,

    scientificExperimentExecution,

    scientificExecutionCapabilities,

    scientificExecutionSpecifications,

    scientificExecutionTargetResolution,

    scientificExecutionPlans,

    scientificExecutionOutcomes,

    scientificExecutionRuntime,

    scientificRuntimeOutcomeAdapter,

    scientificExecutionResultEvaluation,

    scientificExecutionObservations,

    scientificExecutionEvidence,


    scientificExecutionReferentialIntegrity,
    scientificPostExecutionReferentialIntegrity,
    scientificEvidenceFeedback,

    scientificKnowledgeEvidenceMatches,

    scientificEvidenceAssimilation,

scientificKnowledgeEvidenceReconciliation,

scientificBeliefRevision,

scientificBeliefTransitionAuthorization,
scientificBeliefStateTransition,


};

}

private async loadSourceRepositories(): Promise<
    Record<
        string,
        string
    >
> {

    const manifest =
        await this.loadOptionalJson<
            ScientificSourceManifest
        >(
            "./sources/manifest.json"
        );

    if (!manifest) {
        return {};
    }

    const repositories:
        Record<
            string,
            string
        > = {};

    for (
        const source
        of manifest.sources ?? []
    ) {

        const metadata =
            await this.loadOptionalJson<
                ScientificRepositorySourceMetadata & {
                    type?: string;
                    title?: string;
                    location?: string;
                }
            >(
                source.path
            );

        if (!metadata) {
            continue;
        }

        let repository =
            metadata.repository;

        if (
            !repository &&
            metadata.type === "GITHUB" &&
            metadata.location
        ) {

            const match =
                metadata.location.match(
                    /^https?:\/\/github\.com\/([^/]+\/[^/#?]+)/
                );

            if (match?.[1]) {
                repository =
                    match[1].replace(
                        /\.git$/,
                        ""
                    );
            }

        }

        if (
            !repository &&
            metadata.type === "GITHUB" &&
            metadata.title &&
            /^[^/\s]+\/[^/\s]+$/.test(
                metadata.title
            )
        ) {

            repository =
                metadata.title;

        }

        if (!repository) {
            continue;
        }

        repositories[
            source.sourceId
        ] =
            repository;

    }

    return repositories;

}

private async loadRepositoryToolchains(): Promise<
    Record<
        string,
        ScientificRepositoryToolchain
    >
> {

    const manifest =
        await this.loadOptionalJson<
            ScientificSourceManifest
        >(
            "./sources/manifest.json"
        );

    if (!manifest) {
        return {};
    }

    const toolchains:
        Record<
            string,
            ScientificRepositoryToolchain
        > = {};

    for (
        const source
        of manifest.sources ?? []
    ) {


        const metadata =
            await this.loadOptionalJson<
                ScientificRepositorySourceMetadata
            >(
                source.path
            );

        if (
            !metadata?.repository ||
            !metadata.toolchain
        ) {
            continue;
        }

        toolchains[
            metadata.repository
        ] =
            metadata.toolchain;

    }

    return toolchains;

}

private async loadRepositoryLocalPaths(): Promise<
    Record<
        string,
        string
    >
> {

    const manifest =
        await this.loadOptionalJson<
            ScientificSourceManifest
        >(
            "./sources/manifest.json"
        );

    if (!manifest) {
        return {};
    }

    const localPaths:
        Record<
            string,
            string
        > = {};

    for (
        const source
        of manifest.sources ?? []
    ) {


        const metadata =
            await this.loadOptionalJson<
                ScientificRepositorySourceMetadata
            >(
                source.path
            );

        if (
            !metadata?.repository ||
            !metadata.localPath
        ) {
            continue;
        }

        localPaths[
            metadata.repository
        ] =
            metadata.localPath;

    }

    return localPaths;

}
private async loadRepositoryExecutionIntelligence(): Promise<
    Record<
        string,
        GitHubRepositoryIntelligenceResult
    >
> {

    const manifest =
        await this.loadOptionalJson<
            ScientificSourceManifest
        >(
            "./sources/manifest.json"
        );

    if (!manifest) {
        return {};
    }

    const intelligence:
        Record<
            string,
            GitHubRepositoryIntelligenceResult
        > = {};

    for (
        const source
        of manifest.sources ?? []
    ) {

        const metadata =
            await this.loadOptionalJson<
                ScientificRepositorySourceMetadata & {

                    executableTargets?:
                        GitHubRepositoryIntelligenceResult[
                            "executableTargets"
                        ];

                }
            >(
                source.path
            );

        if (
            !metadata?.repository
        ) {
            continue;
        }

        const executableTargets =
            metadata.executableTargets ?? [];

        if (
            executableTargets.length === 0
        ) {
            continue;
        }

        const executableTests =
            executableTargets.filter(
                target =>
                    target.type ===
                    "TEST"
            );

        const executableInvariants =
            executableTargets.filter(
                target =>
                    target.type ===
                    "INVARIANT"
            );

        intelligence[
            metadata.repository
        ] = {

            structure: {

                readmes:
                    0,

                contracts:
                    0,

                tests:
                    executableTests.length,

                docs:
                    0,

                configs:
                    0,

                workflows:
                    0,

                totalFiles:
                    0

            },

            toolchain:
                metadata.toolchain ??
                "UNKNOWN",

            invariants:
                executableInvariants.map(
                    target =>
                        target.selector
                ),

            executableTargets,

            intelligenceSignals: [

                `Loaded ${executableTargets.length} persisted executable target(s).`,

                `Loaded ${executableTests.length} executable test target(s).`,

                `Loaded ${executableInvariants.length} executable invariant target(s).`

            ]

        };

    }

    return intelligence;

}

private async loadOptionalJson<T>(
    path: string
): Promise<T | null> {

    try {

        const content =
            await readFile(
                path,
                "utf8"
            );

        return JSON.parse(
            content
        ) as T;

    } catch (error) {

        if (
            error instanceof Error &&
            "code" in error &&
            error.code === "ENOENT"
        ) {
            return null;
        }

        throw error;

    }

}

}
