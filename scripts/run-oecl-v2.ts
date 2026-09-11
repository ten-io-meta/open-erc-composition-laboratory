import {
    readFile
} from "fs/promises";

import {
    ResearchSourceLoader
} from "../laboratory/research-source/ResearchSourceLoader.js";

import {
    SourceIndependenceAssessmentEngine
} from "../laboratory/source-independence/SourceIndependenceAssessmentEngine.js";

import {
    KnowledgeMergeEngine
} from "../laboratory/research-knowledge/KnowledgeMergeEngine.js";

import {
    ResearchHistoryManager
} from "../laboratory/research-history/ResearchHistoryManager.js";

import {
    ResearchPlannerEngine
} from "../laboratory/research-planner/ResearchPlannerEngine.js";

import {
    ResearchPlannerEvaluator
} from "../laboratory/research-planner/ResearchPlannerEvaluator.js";

import {
    CandidateSourceAcquisitionEngine
} from "../laboratory/candidate-source-acquisition/CandidateSourceAcquisitionEngine.js";

import {
    GitHubCandidateRepositoryAcquirer
} from "../laboratory/candidate-source-acquisition/GitHubCandidateRepositoryAcquirer.js";

import {
    ResearchReportV2Engine
} from "../laboratory/research-report/ResearchReportV2Engine.js";

import {
    SourcePipeline
} from "../laboratory/orchestration/source-pipeline/SourcePipeline.js";

import {
    KnowledgePipeline
} from "../laboratory/orchestration/knowledge-pipeline/KnowledgePipeline.js";

import {
    ScientificPipeline
} from "../laboratory/orchestration/scientific-pipeline/ScientificPipeline.js";

import {
    ScientificReferentialIntegrityEngine
} from "../laboratory/scientific-referential-integrity/ScientificReferentialIntegrityEngine.js";

import {
    IntelligencePipeline
} from "../laboratory/orchestration/intelligence-pipeline/IntelligencePipeline.js";

import {
    ExportPipeline
} from "../laboratory/orchestration/export-pipeline/ExportPipeline.js";

import type {
    ExportDefinition
} from "../laboratory/orchestration/export-pipeline/ExportDefinition.js";

import {
    ScientificProvenanceClosureEngine
} from "../laboratory/scientific-provenance-closure/ScientificProvenanceClosureEngine.js";

async function main(): Promise<void> {

    const runStartedAt =
        new Date().toISOString();

    const campaignId =
        `OECL-V2-CAMPAIGN-${runStartedAt.replace(
            /[:.]/g,
            "-"
        )}`;

    console.log("");
    console.log("====================================");
    console.log("OECL V2 Pipeline");
    console.log("====================================");
    console.log(`Campaign: ${campaignId}`);

    /*
     * ==================================================
     * 1. SOURCE PIPELINE
     * ==================================================
     */

    const source =
        await new SourcePipeline().run({

            manifestPath:
                "./sources/manifest.json",

            printSourceSummary:
                true

        });

    if (source.errors.length > 0) {

        console.log("");
        console.warn(
            `Source pipeline completed with ` +
            `${source.errors.length} error(s).`
        );

        for (const error of source.errors) {

            console.warn(
                `- ${error}`
            );

        }

    }

    if (
        source.partialKnowledgeBases.length === 0
    ) {

        throw new Error(
            "No partial knowledge bases were produced by the enabled sources."
        );

    }

    /*
 * ==================================================
 * 2. KNOWLEDGE MERGE
 * ==================================================
 */
/*
 * ==================================================
 * 2.1 SOURCE INDEPENDENCE ASSESSMENT
 * ==================================================
 *
 * Source identity and scientific source independence
 * are deliberately separate concepts.
 *
 * The enabled source manifest entries provide paths
 * to the actual ResearchSource records. Those records
 * contain the provenance required by the source
 * independence assessment engine.
 *
 * No explicit independence evidence is supplied here.
 * Therefore distinct source identities remain
 * INCONCLUSIVE unless dependency can be established
 * structurally.
 */

const researchSourceLoader =
    new ResearchSourceLoader();

const researchSources =
    await researchSourceLoader.loadMany(
        source.sources.map(
            item =>
                item.path
        )
    );

const sourceIndependence =
    new SourceIndependenceAssessmentEngine().build(
        researchSources
    );

const mergedKnowledgeResult =
    new KnowledgeMergeEngine().merge(
        source.partialKnowledgeBases,
        sourceIndependence.assessments
    );

/*
 * ==================================================
 * 3. KNOWLEDGE PIPELINE
 * ==================================================
 */

const knowledge =
    new KnowledgePipeline().run(
        mergedKnowledgeResult,
        sourceIndependence.assessments
    );

    /*
     * ==================================================
     * 4. SCIENTIFIC PIPELINE
     * ==================================================
     */

    const scientific =
        await new ScientificPipeline().run({

            campaignId,

                    sourceIndependenceAssessments:
            sourceIndependence.assessments,

            confidence:
                knowledge.confidence,

            theories:
                knowledge.theories,

            evidenceGraph:
                knowledge.evidenceGraph,

            contradictions:
                knowledge.contradictions,

            knowledgeGaps:
                knowledge.knowledgeGaps,

            consensus:
    knowledge.scientificConsensus,

scientificDiscoveries:
    knowledge.scientificDiscoveries,

refinedHypotheses:
    knowledge.refinedHypotheses

        });
console.log("");
console.log("=== SCIENTIFIC POLARITY TRACE DIAGNOSTIC ===");

for (
    const resolution
    of scientific.scientificExecutionTargetResolution.resolutions
) {

    if (
        resolution.targetId ===
            "THEORY-00001" &&
        resolution.repository ===
            "ten-io-meta/erc8060-reservable"
    ) {

        console.log(
            JSON.stringify(
                {
                    experimentId:
                        resolution.experimentId,

                    executionTaskId:
                        resolution.executionTaskId,

                    targetId:
                        resolution.targetId,

                    repository:
                        resolution.repository,

                    testSelector:
                        resolution.testSelector,

                    resolutionStatus:
                        resolution.resolutionStatus,

                    scientificPolarity:
                        resolution.scientificPolarity,

                    polarityTrace:
                        resolution.polarityTrace
                },
                null,
                2
            )
        );

    }

}

console.log(
    "=== END SCIENTIFIC POLARITY TRACE DIAGNOSTIC ==="
);
console.log("");
        /*
 * Validate the referential integrity
 * of the scientific provenance graph.
 */

const scientificReferentialIntegrityResult =
    new ScientificReferentialIntegrityEngine().build(
        campaignId,
        scientific.scientificKnowledgeEvolution,
        knowledge.researchConclusions,
        knowledge.crossSourcePatterns
    );

/*
 * 10.4I
 * Certify campaign-wide scientific provenance closure
 * across knowledge, execution and post-execution domains.
 */

const scientificProvenanceClosure =
    new ScientificProvenanceClosureEngine().build(
        campaignId,
        scientificReferentialIntegrityResult,
        scientific.scientificExecutionReferentialIntegrity,
        scientific.scientificPostExecutionReferentialIntegrity
    );

    /*
     * ==================================================
     * 5. PREVIOUS RESEARCH STATE
     * ==================================================
     */

    const researchHistoryManager =
        new ResearchHistoryManager();

    const previousResearchState =
        await researchHistoryManager.load();

    /*
     * ==================================================
     * 6. RESEARCH PLANNING
     * ==================================================
     */

    const existingRepositories =
        source.sources.map(
            researchSource =>
                researchSource.sourceId
        );

    const researchPlan =
        new ResearchPlannerEngine().build(
            knowledge.crossSourcePatterns,
            existingRepositories,
            previousResearchState?.researchStrategy
        );

    const evaluatedResearchPlan =
        new ResearchPlannerEvaluator().evaluate(
            researchPlan
        );

    /*
     * ==================================================
     * 6.1 CANDIDATE SOURCE ACQUISITION
     * ==================================================
     *
     * Recommended repositories may be operationally
     * acquired here, but acquisition never constitutes
     * scientific source admission.
     *
     * The scientific corpus for this campaign was already
     * fixed by SourcePipeline. Newly acquired bundles remain
     * disabled and can only affect a later campaign after
     * an explicit admission decision.
     */

    const registeredRepositories: string[] = [];

    for (const entry of source.manifest.sources) {

        try {

            const registeredSource =
                await researchSourceLoader.load(
                    entry.path
                );

            if (
                typeof registeredSource.repository === "string" &&
                registeredSource.repository.trim().length > 0
            ) {
                registeredRepositories.push(
                    registeredSource.repository
                );
            }

        } catch {
            /*
             * A manifest entry whose source artifact cannot
             * be loaded cannot establish repository identity.
             * It is therefore excluded from acquisition dedupe
             * without altering the scientific source manifest.
             */
        }
    }

    const candidateSourceAcquisition =
        await new CandidateSourceAcquisitionEngine(
            new GitHubCandidateRepositoryAcquirer()
        ).acquire(
            evaluatedResearchPlan,
            registeredRepositories
        );

    /*
     * ==================================================
     * 7. INTELLIGENCE PIPELINE
     * ==================================================
     */

    const intelligence =
        new IntelligencePipeline().run({

            previousResearchState:
                previousResearchState ?? {},

            knowledge:
                mergedKnowledgeResult.knowledge,

            patterns:
                knowledge.crossSourcePatterns,

            conclusions:
                knowledge.researchConclusions,

            knowledgeGaps:
                knowledge.knowledgeGaps,

            scientificDiscoveries:
                knowledge.scientificDiscoveries,

            evaluatedResearchPlan

        });

    /*
     * ==================================================
     * 8. RESEARCH MEMORY
     * ==================================================
     */

    const researchMemoryContent =
        await readFile(
            "./research-memory-results/" +
            "OECL-V2-RESEARCH-MEMORY.json",
            "utf8"
        );

    const researchMemory =
        JSON.parse(
            researchMemoryContent
        );

    /*
     * ==================================================
     * 9. RESEARCH REPORT
     * ==================================================
     */

    const researchReport =
        new ResearchReportV2Engine().build(

            mergedKnowledgeResult.knowledge,

            knowledge.crossSourcePatterns,

            knowledge.researchConclusions,

            intelligence.researchEvolution,

            researchMemory

        );

    /*
     * ==================================================
     * 10. PRESERVE RESEARCH HISTORY
     * ==================================================
     */

    await researchHistoryManager.save({

    generatedAt:
        new Date().toISOString(),

    knowledge:
        mergedKnowledgeResult.knowledge,

    patterns:
        knowledge.crossSourcePatterns,

    conclusions:
        knowledge.researchConclusions,

    researchEvolution:
        intelligence.researchEvolution,

    researchStrategy:
        intelligence.researchStrategy

});

    /*
     * ==================================================
     * 11. PIPELINE ARTIFACT
     * ==================================================
     */

    const pipelineArtifact = {

        manifestId:
            source.manifest.manifestId,

        campaignId,

        generatedAt:
            new Date().toISOString(),

        sourceSummary: {

            configuredSources:
                source.statistics.configuredSources,

            enabledSources:
                source.statistics.enabledSources,

            executedSources:
                source.statistics.executedSources,

            successfulSources:
                source.statistics.successfulSources,

            failedSources:
                source.statistics.failedSources,

            partialKnowledgeBases:
                source.statistics.partialKnowledgeBases

        },

        results:
            source.sourceResults,

        knowledgeSummary: {

            mergedKnowledgeEntries:
                mergedKnowledgeResult.mergedEntries,

            mergedSources:
                mergedKnowledgeResult.mergedSources.length,

            crossSourcePatterns:
                knowledge.crossSourcePatterns
                    .statistics.patterns,

            supportedPatterns:
                knowledge.crossSourcePatterns
                    .statistics.supported,

            emergingPatterns:
                knowledge.crossSourcePatterns
                    .statistics.emerging,

            conclusions:
                knowledge.researchConclusions
                    .conclusions.length,

            discoveries:
                knowledge.scientificDiscoveries
                    .discoveries.length,

            knowledgeGaps:
                knowledge.knowledgeGaps
                    .gaps.length

        },

        scientificSummary: {

            knowledgeConsolidations:
                scientific
                    .knowledgeConsolidation
                    .consolidations
                    .length,

            scientificValidations:
                scientific
                    .scientificValidation
                    .validations
                    .length,

            validatedTheories:
                scientific
                    .scientificValidation
                    .statistics
                    .validated,

            challengedTheories:
                scientific
                    .scientificValidation
                    .statistics
                    .challenged,

            rejectedTheories:
                scientific
                    .scientificValidation
                    .statistics
                    .rejected,

            autonomousExperiments:
                scientific
                    .autonomousExperiments
                    .experiments
                    .length,

            scientificKnowledgeStates:
                scientific
                    .scientificKnowledgeEvolution
                    .states
                    .length,

            scientificKnowledgeEvolutions:
                scientific
                    .scientificKnowledgeEvolution
                    .evolutions
                    .length,

                    scientificReferentialIntegrityChecks:
    scientificReferentialIntegrityResult
        .statistics
        .totalKnowledge,

scientificReferentialIntegrityValid:
    scientificReferentialIntegrityResult
        .statistics
        .validKnowledge,

scientificReferentialIntegrityInvalid:
    scientificReferentialIntegrityResult
        .statistics
        .invalidKnowledge,

scientificReferentialIntegrityScore:
    scientificReferentialIntegrityResult
        .statistics
        .integrityScore,

            evidenceHistories:
                scientific
                    .scientificEvidenceAccumulator
                    .histories
                    .length,

            evidenceAccumulations:
                scientific
                    .scientificEvidenceAccumulator
                    .accumulations
                    .length,

            growingEvidenceTrends:
                scientific
                    .scientificEvidenceAccumulator
                    .statistics
                    .growingTrends,

            stableEvidenceTrends:
                scientific
                    .scientificEvidenceAccumulator
                    .statistics
                    .stableTrends,

            decliningEvidenceTrends:
                scientific
                    .scientificEvidenceAccumulator
                    .statistics
                    .decliningTrends,

            volatileEvidenceTrends:
                scientific
                    .scientificEvidenceAccumulator
                    .statistics
                    .volatileTrends,

            averageEvidenceStability:
                scientific
                    .scientificEvidenceAccumulator
                    .statistics
                    .averageStabilityScore,
    trackedScientificMemory:
    scientific
        .scientificMemory
        .statistics
        .trackedKnowledge,

newScientificKnowledge:
    scientific
        .scientificMemory
        .statistics
        .newKnowledge,

recurringScientificKnowledge:
    scientific
        .scientificMemory
        .statistics
        .recurringKnowledge,

scientificCritiques:
    scientific
        .scientificSelfCritique
        .statistics
        .critiques,

criticalScientificCritiques:
    scientific
        .scientificSelfCritique
        .statistics
        .critical,

averageRobustnessScore:
    scientific
        .scientificSelfCritique
        .statistics
        .averageRobustnessScore,

scientificRevisions:
    scientific
        .scientificRevision
        .statistics
        .total,

scientificRevisionsKeep:
    scientific
        .scientificRevision
        .statistics
        .keep,

scientificRevisionsReview:
    scientific
        .scientificRevision
        .statistics
        .review,

scientificRevisionsWeaken:
    scientific
        .scientificRevision
        .statistics
        .weaken,

scientificRevisionsChallenge:
    scientific
        .scientificRevision
        .statistics
        .challenge,

scientificRevisionsRetest:
    scientific
        .scientificRevision
        .statistics
        .retest,

scientificRevisionsRefuteCandidate:
    scientific
        .scientificRevision
        .statistics
        .refuteCandidate,

scientificRetestPlans:
    scientific
        .scientificRetestPlanner
        .statistics
        .plans,

scientificTheoryRetests:
    scientific
        .scientificRetestPlanner
        .statistics
        .theoryRetests,

scientificDiscoveryRetests:
    scientific
        .scientificRetestPlanner
        .statistics
        .discoveryRetests,

scientificKnowledgeRetests:
    scientific
        .scientificRetestPlanner
        .statistics
        .knowledgeRetests,

scientificEvidenceHistoryRetests:
    scientific
        .scientificRetestPlanner
        .statistics
        .evidenceHistoryRetests,

scientificRetestExperiments:
    scientific
        .scientificRetestExperiments
        .statistics
        .experiments,

scientificTheoryRetestExperiments:
    scientific
        .scientificRetestExperiments
        .statistics
        .theoryExperiments,

scientificDiscoveryRetestExperiments:
    scientific
        .scientificRetestExperiments
        .statistics
        .discoveryExperiments,

scientificKnowledgeRetestExperiments:
    scientific
        .scientificRetestExperiments
        .statistics
        .knowledgeExperiments,

scientificEvidenceHistoryRetestExperiments:
    scientific
        .scientificRetestExperiments
        .statistics
        .evidenceHistoryExperiments,
        scientificExperimentQueueTotal:
    scientific
        .scientificExperimentQueue
        .statistics
        .total,

scientificExperimentQueueAutonomous:
    scientific
        .scientificExperimentQueue
        .statistics
        .autonomous,

scientificExperimentQueueRetest:
    scientific
        .scientificExperimentQueue
        .statistics
        .retest,

scientificExperimentQueueDeduplicated:
    scientific
        .scientificExperimentQueue
        .statistics
        .deduplicated,

scientificExperimentQueueAverageScore:
    scientific
        .scientificExperimentQueue
        .statistics
        .averageQueueScore,
        scientificExecutionTasks:
    scientific
        .scientificExperimentExecution
        .statistics
        .total,

scientificExecutionReady:
    scientific
        .scientificExperimentExecution
        .statistics
        .ready,

scientificExecutionBlocked:
    scientific
        .scientificExperimentExecution
        .statistics
        .blocked,

scientificExecutionAutonomous:
    scientific
        .scientificExperimentExecution
        .statistics
        .autonomous,

scientificExecutionRetest:
    scientific
        .scientificExperimentExecution
        .statistics
        .retest,
        scientificExecutionCapabilities:
    scientific
        .scientificExecutionCapabilities
        .statistics
        .total,

scientificExecutionStaticAnalysis:
    scientific
        .scientificExecutionCapabilities
        .statistics
        .staticAnalysis,

scientificExecutionTestExecution:
    scientific
        .scientificExecutionCapabilities
        .statistics
        .testExecution,

scientificExecutionInvariantValidation:
    scientific
        .scientificExecutionCapabilities
        .statistics
        .invariantValidation,

scientificExecutionSourceReingestion:
    scientific
        .scientificExecutionCapabilities
        .statistics
        .sourceReingestion,

scientificExecutionManualReview:
    scientific
        .scientificExecutionCapabilities
        .statistics
        .manualReview,

scientificExecutionCapabilityAverageConfidence:
    scientific
        .scientificExecutionCapabilities
        .statistics
        .averageConfidence,

scientificExecutionPlans:
    scientific
        .scientificExecutionPlans
        .statistics
        .plans,

scientificExecutionSpecifications:
    scientific
        .scientificExecutionSpecifications
        .statistics
        .total,

scientificExecutionSpecificationsExecutable:
    scientific
        .scientificExecutionSpecifications
        .statistics
        .executable,

scientificExecutionSpecificationsUnresolved:
    scientific
        .scientificExecutionSpecifications
        .statistics
        .unresolved,

scientificExecutionSpecificationsTestExecution:
    scientific
        .scientificExecutionSpecifications
        .statistics
        .testExecution,

scientificExecutionSpecificationsInvariantValidation:
    scientific
        .scientificExecutionSpecifications
        .statistics
        .invariantValidation,

scientificExecutionSpecificationsStaticAnalysis:
    scientific
        .scientificExecutionSpecifications
        .statistics
        .staticAnalysis,

scientificExecutionPlanSteps:
    scientific
        .scientificExecutionPlans
        .statistics
        .totalSteps,

scientificExecutionReadyPlans:
    scientific
        .scientificExecutionPlans
        .statistics
        .readyPlans,

scientificExecutionBlockedPlans:
    scientific
        .scientificExecutionPlans
        .statistics
        .blockedPlans,

scientificExecutionSourceReingestionSteps:
    scientific
        .scientificExecutionPlans
        .statistics
        .sourceReingestionSteps,

scientificExecutionStaticAnalysisSteps:
    scientific
        .scientificExecutionPlans
        .statistics
        .staticAnalysisSteps,

scientificExecutionTestExecutionSteps:
    scientific
        .scientificExecutionPlans
        .statistics
        .testExecutionSteps,

scientificExecutionInvariantValidationSteps:
    scientific
        .scientificExecutionPlans
        .statistics
        .invariantValidationSteps,

scientificExecutionEvidenceCollectionSteps:
    scientific
        .scientificExecutionPlans
        .statistics
        .evidenceCollectionSteps,

scientificExecutionManualReviewSteps:
    scientific
        .scientificExecutionPlans
        .statistics
        .manualReviewSteps,
scientificExecutionOutcomes:
    scientific
        .scientificExecutionOutcomes
        .statistics
        .total,

scientificExecutionOutcomesNotExecuted:
    scientific
        .scientificExecutionOutcomes
        .statistics
        .notExecuted,

scientificExecutionOutcomesSuccess:
    scientific
        .scientificExecutionOutcomes
        .statistics
        .success,

scientificExecutionOutcomesFailure:
    scientific
        .scientificExecutionOutcomes
        .statistics
        .failure,

scientificExecutionOutcomesInconclusive:
    scientific
        .scientificExecutionOutcomes
        .statistics
        .inconclusive,

scientificExecutionOutcomesBlocked:
    scientific
        .scientificExecutionOutcomes
        .statistics
        .blocked,

scientificExecutionOutcomesExecuted:
    scientific
        .scientificExecutionOutcomes
        .statistics
        .executed,
scientificExecutionResultEvaluationTotal:
    scientific
        .scientificExecutionResultEvaluation
        .statistics
        .total,

scientificExecutionResultEvaluationSupports:
    scientific
        .scientificExecutionResultEvaluation
        .statistics
        .supports,

scientificExecutionResultEvaluationChallenges:
    scientific
        .scientificExecutionResultEvaluation
        .statistics
        .challenges,

scientificExecutionResultEvaluationInconclusive:
    scientific
        .scientificExecutionResultEvaluation
        .statistics
        .inconclusive,

scientificExecutionResultEvaluationNotEvaluated:
    scientific
        .scientificExecutionResultEvaluation
        .statistics
        .notEvaluated,

        scientificExecutionObservations:
    scientific
        .scientificExecutionObservations
        .statistics
        .total,

scientificExecutionObservationsSupported:
    scientific
        .scientificExecutionObservations
        .statistics
        .supported,

scientificExecutionObservationsChallenged:
    scientific
        .scientificExecutionObservations
        .statistics
        .challenged,

scientificExecutionObservationsInconclusive:
    scientific
        .scientificExecutionObservations
        .statistics
        .inconclusive,
        scientificExecutionRuntimeTotal:
    scientific
        .scientificExecutionRuntime
        .statistics
        .total,
        scientificExecutionEvidenceTotal:
    scientific
        .scientificExecutionEvidence
        .statistics
        .total,

scientificExecutionEvidenceSupporting:
    scientific
        .scientificExecutionEvidence
        .statistics
        .supporting,

scientificExecutionEvidenceChallenging:
    scientific
        .scientificExecutionEvidence
        .statistics
        .challenging,

scientificExecutionEvidenceInconclusive:
    scientific
        .scientificExecutionEvidence
        .statistics
        .inconclusive,
        scientificEvidenceFeedbackTotal:
    scientific
        .scientificEvidenceFeedback
        .statistics
        .total,
        scientificKnowledgeEvidenceMatchesTotal:
    scientific
        .scientificKnowledgeEvidenceMatches
        .statistics
        .total,

scientificKnowledgeEvidenceMatched:
    scientific
        .scientificKnowledgeEvidenceMatches
        .statistics
        .matched,

scientificKnowledgeEvidenceAmbiguous:
    scientific
        .scientificKnowledgeEvidenceMatches
        .statistics
        .ambiguous,

scientificKnowledgeEvidenceUnmatched:
    scientific
        .scientificKnowledgeEvidenceMatches
        .statistics
        .unmatched,

scientificKnowledgeEvidenceStrengthenMatched:
    scientific
        .scientificKnowledgeEvidenceMatches
        .statistics
        .strengthenMatched,

scientificKnowledgeEvidenceChallengeMatched:
    scientific
        .scientificKnowledgeEvidenceMatches
        .statistics
        .challengeMatched,

scientificKnowledgeEvidenceHoldMatched:
    scientific
        .scientificKnowledgeEvidenceMatches
        .statistics
        .holdMatched,
scientificKnowledgeEvidenceSourceConclusionMatches:
    scientific
        .scientificKnowledgeEvidenceMatches
        .statistics
        .sourceConclusionIdMatches,

scientificKnowledgeEvidenceExplicitIdMatches:
    scientific
        .scientificKnowledgeEvidenceMatches
        .statistics
        .explicitKnowledgeIdMatches,

scientificKnowledgeEvidenceExactStatementMatches:
    scientific
        .scientificKnowledgeEvidenceMatches
        .statistics
        .exactCanonicalStatementMatches,
scientificEvidenceAssimilationTotal:
    scientific
        .scientificEvidenceAssimilation
        .statistics
        .total,

scientificEvidenceAssimilated:
    scientific
        .scientificEvidenceAssimilation
        .statistics
        .assimilated,

scientificEvidenceAssimilationUnchanged:
    scientific
        .scientificEvidenceAssimilation
        .statistics
        .unchanged,

scientificEvidenceAssimilationSupportingAdded:
    scientific
        .scientificEvidenceAssimilation
        .statistics
        .supportingEvidenceAdded,

scientificEvidenceAssimilationContradictoryAdded:
    scientific
        .scientificEvidenceAssimilation
        .statistics
        .contradictoryEvidenceAdded,

scientificEvidenceFeedbackStrengthen:
    scientific
        .scientificEvidenceFeedback
        .statistics
        .strengthen,

scientificEvidenceFeedbackChallenge:
    scientific
        .scientificEvidenceFeedback
        .statistics
        .challenge,

scientificEvidenceFeedbackHold:
    scientific
        .scientificEvidenceFeedback
        .statistics
        .hold,

scientificExecutionRuntimeSuccess:
    scientific
        .scientificExecutionRuntime
        .statistics
        .success,

scientificExecutionRuntimeFailure:
    scientific
        .scientificExecutionRuntime
        .statistics
        .failure,

scientificExecutionRuntimeInconclusive:
    scientific
        .scientificExecutionRuntime
        .statistics
        .inconclusive,

scientificExecutionRuntimeUnsupported:
    scientific
        .scientificExecutionRuntime
        .statistics
        .unsupported,

scientificExecutionRuntimeSkipped:
    scientific
        .scientificExecutionRuntime
        .statistics
        .skipped,
        scientificRuntimeOutcomeAdapterTotal:
    scientific
        .scientificRuntimeOutcomeAdapter
        .statistics
        .total,

scientificRuntimeOutcomeAdapterUpdated:
    scientific
        .scientificRuntimeOutcomeAdapter
        .statistics
        .updated,

scientificRuntimeOutcomeAdapterUnchanged:
    scientific
        .scientificRuntimeOutcomeAdapter
        .statistics
        .unchanged,

scientificRuntimeOutcomeAdapterSuccessMapped:
    scientific
        .scientificRuntimeOutcomeAdapter
        .statistics
        .successMapped,

scientificRuntimeOutcomeAdapterFailureMapped:
    scientific
        .scientificRuntimeOutcomeAdapter
        .statistics
        .failureMapped,

scientificRuntimeOutcomeAdapterInconclusiveMapped:
    scientific
        .scientificRuntimeOutcomeAdapter
        .statistics
        .inconclusiveMapped,

scientificRuntimeOutcomeAdapterUnsupportedIgnored:
    scientific
        .scientificRuntimeOutcomeAdapter
        .statistics
        .unsupportedIgnored,

scientificRuntimeOutcomeAdapterSkippedIgnored:
    scientific
        .scientificRuntimeOutcomeAdapter
        .statistics
        .skippedIgnored,
},
        /*
         * 10.4G
         * Persist complete scientific execution referential
         * integrity result for campaign-level auditability.
         */
        scientificExecutionReferentialIntegrity:
            scientific.scientificExecutionReferentialIntegrity,

        /*
         * 10.4H
         * Persist complete post-execution referential integrity
         * result for campaign-level epistemic auditability.
         */
        scientificPostExecutionReferentialIntegrity:
            scientific.scientificPostExecutionReferentialIntegrity,

        candidateSourceAcquisition,

        intelligenceSummary: {

            knowledgeGain:
                intelligence
                    .knowledgeGain
                    .statistics
                    .totalKnowledgeGain,

            researchEvolutions:
                intelligence
                    .researchEvolution
                    .statistics
                    .evolutions,

            repositoriesEvaluated:
                intelligence
                    .repositoryIntelligence
                    .statistics
                    .repositories

        }

    };

    /*
     * ==================================================
     * 12. EXPORT DEFINITIONS
     * ==================================================
     */

    const outputs:
        ReadonlyArray<ExportDefinition> = [

        {
            directory:
                "./research-knowledge-results",

            filename:
                "OECL-V2-MERGED-KNOWLEDGE.json",

            data:
                mergedKnowledgeResult
        },

        {
    directory:
        "./scientific-execution-target-resolution-results",

    filename:
        "OECL-V2-SCIENTIFIC-EXECUTION-TARGET-RESOLUTIONS.json",

    data:
        scientific.scientificExecutionTargetResolution
},

        {
            directory:
                "./cross-source-pattern-results",

            filename:
                "OECL-V2-CROSS-SOURCE-PATTERNS.json",

            data:
                knowledge.crossSourcePatterns
        },

        {
            directory:
                "./research-conclusion-results",

            filename:
                "OECL-V2-RESEARCH-CONCLUSIONS.json",

            data:
                knowledge.researchConclusions
        },

        {
            directory:
                "./confidence-results",

            filename:
                "OECL-V2-CONFIDENCE-ASSESSMENTS.json",

            data:
                knowledge.confidence
        },

        {
            directory:
                "./contradiction-results",

            filename:
                "OECL-V2-CONTRADICTIONS.json",

            data:
                knowledge.contradictions
        },

        {
            directory:
                "./evidence-graph-results",

            filename:
                "OECL-V2-EVIDENCE-GRAPH.json",

            data:
                knowledge.evidenceGraph
        },

        {
            directory:
                "./inference-results",

            filename:
                "OECL-V2-INFERENCES.json",

            data:
                knowledge.inferences
        },

        {
            directory:
                "./theory-results",

            filename:
                "OECL-V2-THEORIES.json",

            data:
                knowledge.theories
        },

        {
            directory:
                "./scientific-discovery-results",

            filename:
                "OECL-V2-SCIENTIFIC-DISCOVERIES.json",

            data:
                knowledge.scientificDiscoveries
        },

        {
            directory:
                "./research-question-results",

            filename:
                "OECL-V2-RESEARCH-QUESTIONS.json",

            data:
                knowledge.researchQuestions
        },

        {
            directory:
                "./hypothesis-refinement-results",

            filename:
                "OECL-V2-REFINED-HYPOTHESES.json",

            data:
                knowledge.refinedHypotheses
        },

        {
            directory:
                "./knowledge-gap-results",

            filename:
                "OECL-V2-KNOWLEDGE-GAPS.json",

            data:
                knowledge.knowledgeGaps
        },

        {
            directory:
                "./scientific-consensus-results",

            filename:
                "OECL-V2-SCIENTIFIC-CONSENSUS.json",

            data:
                knowledge.scientificConsensus
        },

        {
            directory:
                "./knowledge-consolidation-results",

            filename:
                "OECL-V2-KNOWLEDGE-CONSOLIDATION.json",

            data:
                scientific.knowledgeConsolidation
        },

        {
            directory:
                "./scientific-validation-results",

            filename:
                "OECL-V2-SCIENTIFIC-VALIDATIONS.json",

            data:
                scientific.scientificValidation
        },

        {
            directory:
                "./autonomous-experiment-results",

            filename:
                "OECL-V2-AUTONOMOUS-EXPERIMENTS.json",

            data:
                scientific.autonomousExperiments
        },

        {
            directory:
                "./scientific-knowledge-evolution-results",

            filename:
                "OECL-V2-SCIENTIFIC-KNOWLEDGE-EVOLUTION.json",

            data:
                scientific.scientificKnowledgeEvolution
        },

        {
    directory:
        "./scientific-referential-integrity-results",

    filename:
        "OECL-V2-SCIENTIFIC-REFERENTIAL-INTEGRITY.json",

    data:
        scientificReferentialIntegrityResult
},

        {
            directory:
                "./scientific-provenance-closure-results",

            filename:
                "OECL-V2-SCIENTIFIC-PROVENANCE-CLOSURE.json",

            data:
                scientificProvenanceClosure
        },

        {
            directory:
                "./scientific-evidence-accumulator-results",

            filename:
                "OECL-V2-SCIENTIFIC-EVIDENCE-ACCUMULATOR.json",

            data:
                scientific.scientificEvidenceAccumulator
        },
{
    directory:
        "./scientific-memory-results",

    filename:
        "OECL-V2-SCIENTIFIC-MEMORY.json",

    data:
        scientific.scientificMemory
},

{
    directory:
        "./scientific-self-critique-results",

    filename:
        "OECL-V2-SCIENTIFIC-SELF-CRITIQUE.json",

    data:
        scientific.scientificSelfCritique
},

{
    directory:
        "./scientific-revision-results",

    filename:
        "OECL-V2-SCIENTIFIC-REVISION.json",

    data:
        scientific.scientificRevision
},

{
    directory:
        "./scientific-retest-planner-results",

    filename:
        "OECL-V2-SCIENTIFIC-RETEST-PLANS.json",

    data:
        scientific.scientificRetestPlanner
},
{
    directory:
        "./scientific-retest-experiment-results",

    filename:
        "OECL-V2-SCIENTIFIC-RETEST-EXPERIMENTS.json",

    data:
        scientific.scientificRetestExperiments
},
{
    directory:
        "./scientific-experiment-queue-results",

    filename:
        "OECL-V2-SCIENTIFIC-EXPERIMENT-QUEUE.json",

    data:
        scientific.scientificExperimentQueue
},
{
    directory:
        "./scientific-experiment-execution-results",

    filename:
        "OECL-V2-SCIENTIFIC-EXPERIMENT-EXECUTION.json",

    data:
        scientific.scientificExperimentExecution
},
{
    directory:
        "./scientific-execution-capability-results",

    filename:
        "OECL-V2-SCIENTIFIC-EXECUTION-CAPABILITIES.json",

    data:
        scientific.scientificExecutionCapabilities
},
{
    directory:
        "./scientific-execution-plan-results",

    filename:
        "OECL-V2-SCIENTIFIC-EXECUTION-PLANS.json",

    data:
        scientific.scientificExecutionPlans
},
{
    directory:
        "./scientific-execution-specification-results",

    filename:
        "OECL-V2-SCIENTIFIC-EXECUTION-SPECIFICATIONS.json",

    data:
        scientific.scientificExecutionSpecifications
},
{
    directory:
        "./scientific-execution-outcome-results",

    filename:
        "OECL-V2-SCIENTIFIC-EXECUTION-OUTCOMES.json",

    data:
        scientific.scientificExecutionOutcomes
},
{
    directory:
        "./scientific-execution-observation-results",

    filename:
        "OECL-V2-SCIENTIFIC-EXECUTION-OBSERVATIONS.json",

    data:
        scientific.scientificExecutionObservations
},
{
    directory:
        "./scientific-execution-evidence-results",

    filename:
        "OECL-V2-SCIENTIFIC-EXECUTION-EVIDENCE.json",

    data:
        scientific.scientificExecutionEvidence
},
{
    directory:
        "./scientific-evidence-feedback-results",

    filename:
        "OECL-V2-SCIENTIFIC-EVIDENCE-FEEDBACK.json",

    data:
        scientific.scientificEvidenceFeedback
},
{
    directory:
        "./scientific-knowledge-evidence-matcher-results",

    filename:
        "OECL-V2-SCIENTIFIC-KNOWLEDGE-EVIDENCE-MATCHES.json",

    data:
        scientific.scientificKnowledgeEvidenceMatches
},
{
    directory:
        "./scientific-evidence-assimilation-results",

    filename:
        "OECL-V2-SCIENTIFIC-EVIDENCE-ASSIMILATION.json",

    data:
        scientific.scientificEvidenceAssimilation
},
{
    directory:
        "./scientific-knowledge-evidence-reconciliation-results",

    filename:
        "OECL-V2-SCIENTIFIC-KNOWLEDGE-EVIDENCE-RECONCILIATION.json",

    data:
        scientific.scientificKnowledgeEvidenceReconciliation
},
{
    directory:
        "./scientific-belief-revision-results",

    filename:
        "OECL-V2-SCIENTIFIC-BELIEF-REVISION.json",

    data:
        scientific.scientificBeliefRevision
},
{
    directory:
        "./scientific-belief-transition-authorization-results",

    filename:
        "OECL-V2-SCIENTIFIC-BELIEF-TRANSITION-AUTHORIZATION.json",

    data:
        scientific.scientificBeliefTransitionAuthorization
},
{
    directory:
        "./scientific-belief-state-transition-results",

    filename:
        "OECL-V2-SCIENTIFIC-BELIEF-STATE-TRANSITION.json",

    data:
        scientific.scientificBeliefStateTransition
},
{
    directory:
        "./scientific-execution-runtime-results",

    filename:
        "OECL-V2-SCIENTIFIC-EXECUTION-RUNTIME.json",

    data:
        scientific.scientificExecutionRuntime
},
{
    directory:
        "./scientific-runtime-outcome-adapter-results",

    filename:
        "OECL-V2-SCIENTIFIC-RUNTIME-OUTCOME-ADAPTER.json",

    data:
        scientific.scientificRuntimeOutcomeAdapter
},
{
    directory:
        "./scientific-execution-result-evaluation-results",

    filename:
        "OECL-V2-SCIENTIFIC-EXECUTION-RESULT-EVALUATION.json",

    data:
        scientific.scientificExecutionResultEvaluation
},
{
    directory:
        "./prediction-results",

            filename:
                "OECL-V2-PREDICTIONS.json",

            data:
                intelligence.predictions
        },

        {
            directory:
                "./research-evolution-results",

            filename:
                "OECL-V2-RESEARCH-EVOLUTION.json",

            data:
                intelligence.researchEvolution
        },

        {
            directory:
                "./knowledge-gain-results",

            filename:
                "OECL-V2-KNOWLEDGE-GAIN.json",

            data:
                intelligence.knowledgeGain
        },

        {
            directory:
                "./repository-intelligence-results",

            filename:
                "OECL-V2-REPOSITORY-INTELLIGENCE.json",

            data:
                intelligence.repositoryIntelligence
        },

        {
            directory:
                "./research-planner-results",

            filename:
                "OECL-V2-RESEARCH-PLAN.json",

            data:
                evaluatedResearchPlan
        },

        {
            directory:
                "./research-strategy-results",

            filename:
                "OECL-V2-RESEARCH-STRATEGY.json",

            data:
                intelligence.researchStrategy
        },

        {
            directory:
                "./research-report-results",

            filename:
                "OECL-V2-RESEARCH-REPORT.json",

            data:
                researchReport
        },

        {
            directory:
                "./pipeline-results",

            filename:
                "OECL-V2-PIPELINE.json",

            data:
                pipelineArtifact
        }

    ];

    /*
     * ==================================================
     * 13. EXPORT PIPELINE
     * ==================================================
     */

    const exportResult =
        await new ExportPipeline().run(
            outputs
        );

    if (
        exportResult.errors.length > 0
    ) {

        console.error("");
        console.error(
            "Some artifacts could not be exported:"
        );

        for (
            const error
            of exportResult.errors
        ) {

            console.error(
                `- ${error}`
            );

        }

        throw new Error(
            `${exportResult.statistics.failed} artifact export(s) failed.`
        );

    }

    /*
     * ==================================================
     * 14. CONSOLE SUMMARY
     * ==================================================
     */

    console.log("");
    console.log("OECL V2 Pipeline Summary");
    console.log("------------------------------");

    console.log(
        `Manifest: ${source.manifest.manifestId}`
    );

    console.log(
        `Campaign: ${campaignId}`
    );

    console.log(
        `Configured sources: ` +
        `${source.statistics.configuredSources}`
    );

    console.log(
        `Enabled sources: ` +
        `${source.statistics.enabledSources}`
    );

    console.log(
        `Executed sources: ` +
        `${source.statistics.executedSources}`
    );

    console.log(
        `Successful sources: ` +
        `${source.statistics.successfulSources}`
    );

    console.log(
        `Failed sources: ` +
        `${source.statistics.failedSources}`
    );

    console.log(
        `Merged knowledge entries: ` +
        `${mergedKnowledgeResult.mergedEntries}`
    );

    console.log(
        `Merged sources: ` +
        `${mergedKnowledgeResult.mergedSources.length}`
    );

    console.log(
        `Cross-source patterns: ` +
        `${knowledge.crossSourcePatterns.statistics.patterns}`
    );

    console.log(
        `Supported cross-source patterns: ` +
        `${knowledge.crossSourcePatterns.statistics.supported}`
    );

    console.log(
        `Research conclusions: ` +
        `${knowledge.researchConclusions.conclusions.length}`
    );

    console.log(
        `Scientific discoveries: ` +
        `${knowledge.scientificDiscoveries.discoveries.length}`
    );

    console.log(
        `Knowledge gaps: ` +
        `${knowledge.knowledgeGaps.gaps.length}`
    );

    console.log(
        `Knowledge consolidations: ` +
        `${scientific.knowledgeConsolidation.consolidations.length}`
    );

    console.log(
        `Scientific validations: ` +
        `${scientific.scientificValidation.validations.length}`
    );

    console.log(
        `Validated theories: ` +
        `${scientific.scientificValidation.statistics.validated}`
    );

    console.log(
        `Challenged theories: ` +
        `${scientific.scientificValidation.statistics.challenged}`
    );

    console.log(
        `Rejected theories: ` +
        `${scientific.scientificValidation.statistics.rejected}`
    );

    console.log(
        `Autonomous experiments: ` +
        `${scientific.autonomousExperiments.experiments.length}`
    );

    console.log(
        `Scientific knowledge states: ` +
        `${scientific.scientificKnowledgeEvolution.statistics.totalKnowledge}`
    );

    console.log(
        `Scientific evolutions: ` +
        `${scientific.scientificKnowledgeEvolution.statistics.evolutions}`
    );
console.log(
    `Scientific referential integrity checks: ` +
    `${scientificReferentialIntegrityResult.statistics.totalKnowledge}`
);

console.log(
    `Referentially valid knowledge: ` +
    `${scientificReferentialIntegrityResult.statistics.validKnowledge}`
);

console.log(
    `Referentially invalid knowledge: ` +
    `${scientificReferentialIntegrityResult.statistics.invalidKnowledge}`
);

console.log(
    `Broken conclusion references: ` +
    `${scientificReferentialIntegrityResult.statistics.brokenConclusionReferences}`
);

console.log(
    `Broken pattern references: ` +
    `${scientificReferentialIntegrityResult.statistics.brokenPatternReferences}`
);

console.log(
    `Conclusion-pattern mismatches: ` +
    `${scientificReferentialIntegrityResult.statistics.conclusionPatternMismatches}`
);

console.log(
    `Relation mismatches: ` +
    `${scientificReferentialIntegrityResult.statistics.relationMismatches}`
);

console.log(
    `Origin target mismatches: ` +
    `${scientificReferentialIntegrityResult.statistics.originTargetMismatches}`
);

console.log(
    `Duplicated origins: ` +
    `${scientificReferentialIntegrityResult.statistics.duplicatedOrigins}`
);

console.log(
    `Scientific referential integrity score: ` +
    `${scientificReferentialIntegrityResult.statistics.integrityScore}`
);
    console.log(
        `Discovered knowledge: ` +
        `${scientific.scientificKnowledgeEvolution.statistics.discovered}`
    );

    console.log(
        `Promoted knowledge: ` +
        `${scientific.scientificKnowledgeEvolution.statistics.promoted}`
    );

    console.log(
        `Stabilized knowledge: ` +
        `${scientific.scientificKnowledgeEvolution.statistics.stabilized}`
    );

    console.log(
        `Refuted knowledge: ` +
        `${scientific.scientificKnowledgeEvolution.statistics.refuted}`
    );

    console.log(
        `Evidence histories: ` +
        `${scientific.scientificEvidenceAccumulator.statistics.knowledgeTracked}`
    );

    console.log(
        `Evidence strengthened: ` +
        `${scientific.scientificEvidenceAccumulator.statistics.strengthened}`
    );

    console.log(
        `Evidence stable: ` +
        `${scientific.scientificEvidenceAccumulator.statistics.stable}`
    );

    console.log(
        `Evidence weakened: ` +
        `${scientific.scientificEvidenceAccumulator.statistics.weakened}`
    );

    console.log(
        `Evidence conflicted: ` +
        `${scientific.scientificEvidenceAccumulator.statistics.conflicted}`
    );

    console.log(
        `Growing evidence trends: ` +
        `${scientific.scientificEvidenceAccumulator.statistics.growingTrends}`
    );

    console.log(
        `Stable evidence trends: ` +
        `${scientific.scientificEvidenceAccumulator.statistics.stableTrends}`
    );

    console.log(
        `Average evidence stability: ` +
        `${scientific.scientificEvidenceAccumulator.statistics.averageStabilityScore}`
    );
console.log(
    `Tracked scientific memory: ` +
    `${scientific.scientificMemory.statistics.trackedKnowledge}`
);

console.log(
    `New scientific knowledge: ` +
    `${scientific.scientificMemory.statistics.newKnowledge}`
);

console.log(
    `Recurring scientific knowledge: ` +
    `${scientific.scientificMemory.statistics.recurringKnowledge}`
);

console.log(
    `Scientific critiques: ` +
    `${scientific.scientificSelfCritique.statistics.critiques}`
);

console.log(
    `Critical critiques: ` +
    `${scientific.scientificSelfCritique.statistics.critical}`
);

console.log(
    `Average robustness score: ` +
    `${scientific.scientificSelfCritique.statistics.averageRobustnessScore}`
);
console.log(
    `Scientific revisions: ` +
    `${scientific.scientificRevision.statistics.total}`
);

console.log(
    `Revisions KEEP: ` +
    `${scientific.scientificRevision.statistics.keep}`
);

console.log(
    `Revisions REVIEW: ` +
    `${scientific.scientificRevision.statistics.review}`
);

console.log(
    `Revisions WEAKEN: ` +
    `${scientific.scientificRevision.statistics.weaken}`
);

console.log(
    `Revisions CHALLENGE: ` +
    `${scientific.scientificRevision.statistics.challenge}`
);

console.log(
    `Revisions RETEST: ` +
    `${scientific.scientificRevision.statistics.retest}`
);

console.log(
    `Revisions REFUTE_CANDIDATE: ` +
    `${scientific.scientificRevision.statistics.refuteCandidate}`
);
console.log(
    `Scientific retest plans: ` +
    `${scientific.scientificRetestPlanner.statistics.plans}`
);

console.log(
    `Theory retests: ` +
    `${scientific.scientificRetestPlanner.statistics.theoryRetests}`
);

console.log(
    `Discovery retests: ` +
    `${scientific.scientificRetestPlanner.statistics.discoveryRetests}`
);

console.log(
    `Knowledge retests: ` +
    `${scientific.scientificRetestPlanner.statistics.knowledgeRetests}`
);

console.log(
    `Evidence-history retests: ` +
    `${scientific.scientificRetestPlanner.statistics.evidenceHistoryRetests}`
);

console.log(
    `Scientific retest experiments: ` +
    `${scientific.scientificRetestExperiments.statistics.experiments}`
);

console.log(
    `Theory retest experiments: ` +
    `${scientific.scientificRetestExperiments.statistics.theoryExperiments}`
);

console.log(
    `Discovery retest experiments: ` +
    `${scientific.scientificRetestExperiments.statistics.discoveryExperiments}`
);

console.log(
    `Knowledge retest experiments: ` +
    `${scientific.scientificRetestExperiments.statistics.knowledgeExperiments}`
);

console.log(
    `Evidence-history retest experiments: ` +
    `${scientific.scientificRetestExperiments.statistics.evidenceHistoryExperiments}`
);
console.log(
    `Scientific experiment queue: ` +
    `${scientific.scientificExperimentQueue.statistics.total}`
);

console.log(
    `Queue autonomous experiments: ` +
    `${scientific.scientificExperimentQueue.statistics.autonomous}`
);

console.log(
    `Queue retest experiments: ` +
    `${scientific.scientificExperimentQueue.statistics.retest}`
);

console.log(
    `Queue deduplicated experiments: ` +
    `${scientific.scientificExperimentQueue.statistics.deduplicated}`
);

console.log(
    `Average experiment queue score: ` +
    `${scientific.scientificExperimentQueue.statistics.averageQueueScore}`
);

console.log(
    `Scientific execution tasks: ` +
    `${scientific.scientificExperimentExecution.statistics.total}`
);

console.log(
    `Execution tasks READY: ` +
    `${scientific.scientificExperimentExecution.statistics.ready}`
);

console.log(
    `Execution tasks BLOCKED: ` +
    `${scientific.scientificExperimentExecution.statistics.blocked}`
);

console.log(
    `Execution tasks autonomous: ` +
    `${scientific.scientificExperimentExecution.statistics.autonomous}`
);

console.log(
    `Execution tasks retest: ` +
    `${scientific.scientificExperimentExecution.statistics.retest}`
);

console.log(
    `Scientific execution capabilities: ` +
    `${scientific.scientificExecutionCapabilities.statistics.total}`
);

console.log(
    `Execution STATIC_ANALYSIS: ` +
    `${scientific.scientificExecutionCapabilities.statistics.staticAnalysis}`
);

console.log(
    `Execution TEST_EXECUTION: ` +
    `${scientific.scientificExecutionCapabilities.statistics.testExecution}`
);

console.log(
    `Execution INVARIANT_VALIDATION: ` +
    `${scientific.scientificExecutionCapabilities.statistics.invariantValidation}`
);

console.log(
    `Execution SOURCE_REINGESTION: ` +
    `${scientific.scientificExecutionCapabilities.statistics.sourceReingestion}`
);

console.log(
    `Execution MANUAL_REVIEW: ` +
    `${scientific.scientificExecutionCapabilities.statistics.manualReview}`
);

console.log(
    `Average execution capability confidence: ` +
    `${scientific.scientificExecutionCapabilities.statistics.averageConfidence}`
);
console.log(
    `Scientific execution plans: ` +
    `${scientific.scientificExecutionPlans.statistics.plans}`
);

console.log(
    `Execution plan steps: ` +
    `${scientific.scientificExecutionPlans.statistics.totalSteps}`
);

console.log(
    `Execution plans READY: ` +
    `${scientific.scientificExecutionPlans.statistics.readyPlans}`
);

console.log(
    `Execution plans BLOCKED: ` +
    `${scientific.scientificExecutionPlans.statistics.blockedPlans}`
);

console.log(
    `Execution SOURCE_REINGESTION steps: ` +
    `${scientific.scientificExecutionPlans.statistics.sourceReingestionSteps}`
);

console.log(
    `Execution STATIC_ANALYSIS steps: ` +
    `${scientific.scientificExecutionPlans.statistics.staticAnalysisSteps}`
);

console.log(
    `Execution TEST_EXECUTION steps: ` +
    `${scientific.scientificExecutionPlans.statistics.testExecutionSteps}`
);

console.log(
    `Execution INVARIANT_VALIDATION steps: ` +
    `${scientific.scientificExecutionPlans.statistics.invariantValidationSteps}`
);

console.log(
    `Execution EVIDENCE_COLLECTION steps: ` +
    `${scientific.scientificExecutionPlans.statistics.evidenceCollectionSteps}`
);

console.log(
    `Execution MANUAL_REVIEW steps: ` +
    `${scientific.scientificExecutionPlans.statistics.manualReviewSteps}`
);

console.log(
    `Scientific execution specifications: ` +
    `${scientific.scientificExecutionSpecifications.statistics.total}`
);

console.log(
    `Execution specifications EXECUTABLE: ` +
    `${scientific.scientificExecutionSpecifications.statistics.executable}`
);

console.log(
    `Execution specifications UNRESOLVED: ` +
    `${scientific.scientificExecutionSpecifications.statistics.unresolved}`
);

console.log(
    `Execution specifications TEST_EXECUTION: ` +
    `${scientific.scientificExecutionSpecifications.statistics.testExecution}`
);

console.log(
    `Execution specifications INVARIANT_VALIDATION: ` +
    `${scientific.scientificExecutionSpecifications.statistics.invariantValidation}`
);

console.log(
    `Execution specifications STATIC_ANALYSIS: ` +
    `${scientific.scientificExecutionSpecifications.statistics.staticAnalysis}`
);

console.log(
    `Scientific execution outcomes: ` +
    `${scientific.scientificExecutionOutcomes.statistics.total}`
);

console.log(
    `Execution outcomes NOT_EXECUTED: ` +
    `${scientific.scientificExecutionOutcomes.statistics.notExecuted}`
);

console.log(
    `Execution outcomes SUCCESS: ` +
    `${scientific.scientificExecutionOutcomes.statistics.success}`
);

console.log(
    `Execution outcomes FAILURE: ` +
    `${scientific.scientificExecutionOutcomes.statistics.failure}`
);

console.log(
    `Execution outcomes INCONCLUSIVE: ` +
    `${scientific.scientificExecutionOutcomes.statistics.inconclusive}`
);

console.log(
    `Execution outcomes BLOCKED: ` +
    `${scientific.scientificExecutionOutcomes.statistics.blocked}`
);

console.log(
    `Execution outcomes EXECUTED: ` +
    `${scientific.scientificExecutionOutcomes.statistics.executed}`
);
console.log(
    `Scientific execution result evaluations: ` +
    `${scientific.scientificExecutionResultEvaluation.statistics.total}`
);

console.log(
    `Scientific results SUPPORTS: ` +
    `${scientific.scientificExecutionResultEvaluation.statistics.supports}`
);

console.log(
    `Scientific results CHALLENGES: ` +
    `${scientific.scientificExecutionResultEvaluation.statistics.challenges}`
);

console.log(
    `Scientific results INCONCLUSIVE: ` +
    `${scientific.scientificExecutionResultEvaluation.statistics.inconclusive}`
);

console.log(
    `Scientific results NOT_EVALUATED: ` +
    `${scientific.scientificExecutionResultEvaluation.statistics.notEvaluated}`
);

console.log(
    `Scientific execution observations: ` +
    `${scientific.scientificExecutionObservations.statistics.total}`
);

console.log(
    `Execution observations SUPPORTED: ` +
    `${scientific.scientificExecutionObservations.statistics.supported}`
);

console.log(
    `Execution observations CHALLENGED: ` +
    `${scientific.scientificExecutionObservations.statistics.challenged}`
);

console.log(
    `Execution observations INCONCLUSIVE: ` +
    `${scientific.scientificExecutionObservations.statistics.inconclusive}`
);
console.log(
    `Scientific execution evidence: ` +
    `${scientific.scientificExecutionEvidence.statistics.total}`
);

console.log(
    `Execution evidence SUPPORTING: ` +
    `${scientific.scientificExecutionEvidence.statistics.supporting}`
);

console.log(
    `Execution evidence CHALLENGING: ` +
    `${scientific.scientificExecutionEvidence.statistics.challenging}`
);

console.log(
    `Execution evidence INCONCLUSIVE: ` +
    `${scientific.scientificExecutionEvidence.statistics.inconclusive}`
);
console.log(
    `Scientific evidence feedback: ` +
    `${scientific.scientificEvidenceFeedback.statistics.total}`
);

console.log(
    `Feedback STRENGTHEN: ` +
    `${scientific.scientificEvidenceFeedback.statistics.strengthen}`
);

console.log(
    `Feedback CHALLENGE: ` +
    `${scientific.scientificEvidenceFeedback.statistics.challenge}`
);

console.log(
    `Feedback HOLD: ` +
    `${scientific.scientificEvidenceFeedback.statistics.hold}`
);

console.log(
    `Scientific knowledge evidence matches: ` +
    `${scientific.scientificKnowledgeEvidenceMatches.statistics.total}`
);

console.log(
    `Knowledge evidence MATCHED: ` +
    `${scientific.scientificKnowledgeEvidenceMatches.statistics.matched}`
);

console.log(
    `Knowledge evidence AMBIGUOUS: ` +
    `${scientific.scientificKnowledgeEvidenceMatches.statistics.ambiguous}`
);

console.log(
    `Knowledge evidence UNMATCHED: ` +
    `${scientific.scientificKnowledgeEvidenceMatches.statistics.unmatched}`
);

console.log(
    `STRENGTHEN matched: ` +
    `${scientific.scientificKnowledgeEvidenceMatches.statistics.strengthenMatched}`
);

console.log(
    `CHALLENGE matched: ` +
    `${scientific.scientificKnowledgeEvidenceMatches.statistics.challengeMatched}`
);

console.log(
    `HOLD matched: ` +
    `${scientific.scientificKnowledgeEvidenceMatches.statistics.holdMatched}`
);

console.log(
    `Source conclusion ID matches: ` +
    `${scientific.scientificKnowledgeEvidenceMatches.statistics.sourceConclusionIdMatches}`
);

console.log(
    `Explicit knowledge ID matches: ` +
    `${scientific.scientificKnowledgeEvidenceMatches.statistics.explicitKnowledgeIdMatches}`
);

console.log(
    `Exact canonical statement matches: ` +
    `${scientific.scientificKnowledgeEvidenceMatches.statistics.exactCanonicalStatementMatches}`
);
console.log(
    `Scientific evidence assimilations: ` +
    `${scientific.scientificEvidenceAssimilation.statistics.total}`
);

console.log(
    `Assimilated evidence: ` +
    `${scientific.scientificEvidenceAssimilation.statistics.assimilated}`
);

console.log(
    `Unchanged evidence: ` +
    `${scientific.scientificEvidenceAssimilation.statistics.unchanged}`
);

console.log(
    `Supporting evidence added: ` +
    `${scientific.scientificEvidenceAssimilation.statistics.supportingEvidenceAdded}`
);

console.log(
    `Contradictory evidence added: ` +
    `${scientific.scientificEvidenceAssimilation.statistics.contradictoryEvidenceAdded}`
);

console.log(
    `Scientific runtime executions: ` +
    `${scientific.scientificExecutionRuntime.statistics.total}`
);

console.log(
    `Runtime SUCCESS: ` +
    `${scientific.scientificExecutionRuntime.statistics.success}`
);

console.log(
    `Runtime FAILURE: ` +
    `${scientific.scientificExecutionRuntime.statistics.failure}`
);

console.log(
    `Runtime INCONCLUSIVE: ` +
    `${scientific.scientificExecutionRuntime.statistics.inconclusive}`
);

console.log(
    `Runtime UNSUPPORTED: ` +
    
    `${scientific.scientificExecutionRuntime.statistics.unsupported}`
);

console.log(
    `Runtime SKIPPED: ` +
    `${scientific.scientificExecutionRuntime.statistics.skipped}`
);

console.log(
    `Runtime outcome adapter total: ` +
    `${scientific.scientificRuntimeOutcomeAdapter.statistics.total}`
);

console.log(
    `Runtime outcomes updated: ` +
    `${scientific.scientificRuntimeOutcomeAdapter.statistics.updated}`
);

console.log(
    `Runtime outcomes unchanged: ` +
    `${scientific.scientificRuntimeOutcomeAdapter.statistics.unchanged}`
);

console.log(
    `Runtime SUCCESS mapped: ` +
    `${scientific.scientificRuntimeOutcomeAdapter.statistics.successMapped}`
);

console.log(
    `Runtime FAILURE mapped: ` +
    `${scientific.scientificRuntimeOutcomeAdapter.statistics.failureMapped}`
);

console.log(
    `Runtime INCONCLUSIVE mapped: ` +
    `${scientific.scientificRuntimeOutcomeAdapter.statistics.inconclusiveMapped}`
);

console.log(
    `Runtime UNSUPPORTED ignored: ` +
    `${scientific.scientificRuntimeOutcomeAdapter.statistics.unsupportedIgnored}`
);

console.log(
    `Runtime SKIPPED ignored: ` +
    `${scientific.scientificRuntimeOutcomeAdapter.statistics.skippedIgnored}`
);

console.log(
    `Reconciled outcomes NOT_EXECUTED: ` +
    `${scientific.scientificRuntimeOutcomeAdapter.updatedOutcomes.statistics.notExecuted}`
);

console.log(
    `Reconciled outcomes SUCCESS: ` +
    `${scientific.scientificRuntimeOutcomeAdapter.updatedOutcomes.statistics.success}`
);

console.log(
    `Reconciled outcomes FAILURE: ` +
    `${scientific.scientificRuntimeOutcomeAdapter.updatedOutcomes.statistics.failure}`
);

console.log(
    `Reconciled outcomes INCONCLUSIVE: ` +
    `${scientific.scientificRuntimeOutcomeAdapter.updatedOutcomes.statistics.inconclusive}`
);

console.log(
    `Reconciled outcomes EXECUTED: ` +
    `${scientific.scientificRuntimeOutcomeAdapter.updatedOutcomes.statistics.executed}`
);

console.log(
    `Knowledge gain: ` +
    `${intelligence.knowledgeGain.statistics.totalKnowledgeGain}`
);

console.log(
    `Artifacts exported: ` +
    `${exportResult.statistics.exported}`
);

console.log("");
console.log("Pipeline exported:");

console.log(
    "./pipeline-results/OECL-V2-PIPELINE.json"
);

console.log("");
console.log("OECL V2 finished.");

}

main().catch(
    error => {

        console.error("");
        console.error(
            "OECL V2 Pipeline failed."
        );

        console.error(
            error instanceof Error
                ? error.stack ??
                  error.message
                : error
        );

        process.exit(1);

    }
);
