import type {
    ScientificExecutionTargetResolutionResult
} from "../../scientific-execution-target-resolution/ScientificExecutionTargetResolutionResult.js";

import type {
    ScientificExecutionSpecificationResult
} from "../../scientific-execution-specification/ScientificExecutionSpecificationResult.js";

import type {
    ScientificExecutionResultEvaluationResult
} from "../../scientific-execution-result-evaluator/ScientificExecutionResultEvaluationResult.js";

import type {
    ScientificRuntimeOutcomeAdapterResult
} from "../../scientific-runtime-outcome-adapter/ScientificRuntimeOutcomeAdapterResult.js";

import type {
    ScientificRuntimeExecutionResult
} from "../../scientific-execution-runtime/ScientificRuntimeExecutionResult.js";

import type {
    ScientificKnowledgeEvidenceMatchResult
} from "../../scientific-knowledge-evidence-matcher/ScientificKnowledgeEvidenceMatchResult.js";

import type {
    ScientificEvidenceAssimilationResult
} from "../../scientific-evidence-assimilation/ScientificEvidenceAssimilationResult.js";

import type {
    ScientificEvidenceFeedbackResult
} from "../../scientific-evidence-feedback/ScientificEvidenceFeedbackResult.js";

import type {
    ScientificExecutionEvidenceResult
} from "../../scientific-execution-evidence/ScientificExecutionEvidenceResult.js";

import type {
    ScientificExecutionReferentialIntegrityResult
} from "../../scientific-execution-referential-integrity/ScientificExecutionReferentialIntegrityResult.js";

import type {
    ScientificPostExecutionReferentialIntegrityResult
} from "../../scientific-post-execution-referential-integrity/ScientificPostExecutionReferentialIntegrityResult.js";

import type {
    ScientificExecutionObservationResult
} from "../../scientific-execution-observation/ScientificExecutionObservationResult.js";

import type {
    ScientificExecutionOutcomeResult
} from "../../scientific-execution-outcome/ScientificExecutionOutcomeResult.js";

import type {
    ScientificExecutionPlanResult
} from "../../scientific-execution-plan/ScientificExecutionPlanResult.js";

import type {
    ScientificExecutionCapabilityResult
} from "../../scientific-execution-capability/ScientificExecutionCapabilityResult.js";

import type {
    ScientificExperimentQueueResult
} from "../../scientific-experiment-queue/ScientificExperimentQueueResult.js";

import type {
    ScientificRetestPlannerResult
} from "../../scientific-retest-planner/ScientificRetestPlannerResult.js";

import type {
    ScientificExperimentExecutionResult
} from "../../scientific-experiment-execution/ScientificExperimentExecutionResult.js";

import type {
    ScientificRetestExperimentResult
} from "../../scientific-retest-experiment/ScientificRetestExperimentResult.js";

import type {
    KnowledgeConsolidationResult
} from "../../knowledge-consolidation/KnowledgeConsolidationResult.js";

import type {
    ScientificValidationResult
} from "../../scientific-validation/ScientificValidationResult.js";

import type {
    ScientificRevisionResult
} from "../../scientific-revision/ScientificRevisionResult.js";

import type {
    AutonomousExperimentResult
} from "../../autonomous-experiment-design/AutonomousExperimentResult.js";

import type {
    ScientificKnowledgeEvolutionResult
} from "../../scientific-knowledge-evolution/ScientificKnowledgeEvolutionResult.js";

import type {
    ScientificKnowledgeEvolutionResult as ScientificKnowledgeEvidenceReconciliationResult
} from "../../scientific-knowledge-evolution/ScientificKnowledgeEvolutionResult.js";

import type {
    ScientificBeliefRevisionResult
} from "../../scientific-belief-revision/ScientificBeliefRevisionResult.js";

import type {
    ScientificBeliefTransitionAuthorizationResult
} from "../../scientific-belief-transition-authorization/ScientificBeliefTransitionAuthorizationResult.js";

import type {
    ScientificBeliefStateTransitionResult
} from "../../scientific-belief-state-transition/ScientificBeliefStateTransitionResult.js";

import type {
    ScientificEvidenceAccumulatorResult
} from "../../scientific-evidence-accumulator/ScientificEvidenceAccumulatorResult.js";

import type {
    ScientificMemoryResult
} from "../../scientific-memory/ScientificMemoryResult.js";

import type {
    ScientificSelfCritiqueResult
} from "../../scientific-self-critique/ScientificSelfCritiqueResult.js";


export interface ScientificPipelineResult {

    knowledgeConsolidation:
        KnowledgeConsolidationResult;

    scientificValidation:
        ScientificValidationResult;

    autonomousExperiments:
        AutonomousExperimentResult;

    scientificKnowledgeEvolution:
        ScientificKnowledgeEvolutionResult;

    scientificKnowledgeEvidenceReconciliation:
        ScientificKnowledgeEvidenceReconciliationResult;

    scientificBeliefRevision:
        ScientificBeliefRevisionResult;

    scientificBeliefTransitionAuthorization:
        ScientificBeliefTransitionAuthorizationResult;

    scientificBeliefStateTransition:
        ScientificBeliefStateTransitionResult;

    scientificEvidenceAccumulator:
        ScientificEvidenceAccumulatorResult;

    scientificMemory:
        ScientificMemoryResult;

    scientificSelfCritique:
        ScientificSelfCritiqueResult;

    scientificRevision:
        ScientificRevisionResult;

    scientificRetestPlanner:
        ScientificRetestPlannerResult;

    scientificRetestExperiments:
        ScientificRetestExperimentResult;

    scientificExperimentQueue:
        ScientificExperimentQueueResult;

    scientificExperimentExecution:
        ScientificExperimentExecutionResult;

    scientificExecutionTargetResolution:
        ScientificExecutionTargetResolutionResult;

    scientificExecutionCapabilities:
        ScientificExecutionCapabilityResult;

    scientificExecutionPlans:
        ScientificExecutionPlanResult;

    scientificExecutionSpecifications:
        ScientificExecutionSpecificationResult;

    scientificExecutionOutcomes:
        ScientificExecutionOutcomeResult;

    scientificExecutionRuntime:
        ScientificRuntimeExecutionResult;

    scientificRuntimeOutcomeAdapter:
        ScientificRuntimeOutcomeAdapterResult;

    scientificExecutionResultEvaluation:
        ScientificExecutionResultEvaluationResult;

    scientificExecutionObservations:
        ScientificExecutionObservationResult;

    scientificExecutionEvidence:
        ScientificExecutionEvidenceResult;

    scientificExecutionReferentialIntegrity:
        ScientificExecutionReferentialIntegrityResult;

    scientificPostExecutionReferentialIntegrity:
        ScientificPostExecutionReferentialIntegrityResult;

    scientificEvidenceFeedback:
        ScientificEvidenceFeedbackResult;

    scientificKnowledgeEvidenceMatches:
        ScientificKnowledgeEvidenceMatchResult;

    scientificEvidenceAssimilation:
        ScientificEvidenceAssimilationResult;
}
