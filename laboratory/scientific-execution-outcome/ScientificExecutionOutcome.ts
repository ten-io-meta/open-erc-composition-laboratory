import type { ScientificRuntimeExecution } from "../scientific-execution-runtime/ScientificRuntimeExecution.js";
import type { ScientificCrossProtocolCompositionResult } from "../scientific-cross-protocol-composition/ScientificCrossProtocolCompositionResult.js";
import type { CrossProtocolCompositionInput } from "../scientific-cross-protocol-composition/CrossProtocolCompositionEngine.js";
import type { ScientificCompositionEvaluationSpecificationResult } from "../scientific-composition-evaluation-specification/ScientificCompositionEvaluationSpecificationResult.js";

import type {
    ScientificExecutableTargetIdentity
} from "../scientific-execution-target-resolution/ScientificExecutableTargetIdentity.js";


export type ScientificExecutionOutcomeStatus =
    | "NOT_EXECUTED"
    | "SUCCESS"
    | "FAILURE"
    | "INCONCLUSIVE"
    | "BLOCKED";


export type ScientificExecutionOutcomeScientificResult =
    | "SUPPORTS"
    | "CHALLENGES"
    | "INCONCLUSIVE"
    | "NOT_EVALUATED";


export interface ScientificExecutionOutcome {

    /** Must originate from the actual discovery and specification pipeline.
     * An absent or incorrect record fails closed at the final polarity gate.
     * This source is never reconstructed from successful EVM receipts.
     */
    discoveredCandidateEvidence?: {
        discoveryInput: CrossProtocolCompositionInput;
        discovery: ScientificCrossProtocolCompositionResult;
        specifications: ScientificCompositionEvaluationSpecificationResult;
    };

    outcomeId: string;

    /** Structured runtime provenance; never inferred from log strings. */
    jointCompositionEvidence?: Pick<ScientificRuntimeExecution,
        "compositionExecutionRequirement" | "compositionWorkspaceMaterialization" |
        "compositionRecipeSelection" | "jointContractHarnessExecution" |
        "compositionConstraintEvaluation" | "runtime"
    >;

    executionPlanId: string;

    executionTaskId: string;

    experimentId: string;

    targetType: string;

    targetId: string;

    sourceConclusionId?: string;

    sourceIds: string[];

    targetEvidenceIds: string[];

    successCriteria: string[];

    failureCriteria: string[];

    scientificCriteria?: {
        relation: string;

        support: {
            expectedPolarity: "SUPPORT";
            condition: string;
        };

        challenge: {
            expectedPolarity: "CHALLENGE";
            condition: string;
        };

        inconclusive: {
            whenNoScientificPolarity: true;
        };
    };

    stepId: string;

    stepType: string;

    repository:
        string | null;

    selectedExecutableTarget:
        ScientificExecutableTargetIdentity | null;

    status:
        ScientificExecutionOutcomeStatus;

    scientificResult:
        ScientificExecutionOutcomeScientificResult;

    executedAt:
        string | null;

    evidence: string[];

    observations: string[];

    errors: string[];

    explanation: string;

}