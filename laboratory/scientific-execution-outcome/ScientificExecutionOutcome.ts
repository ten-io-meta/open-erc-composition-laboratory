import type { ScientificRuntimeExecution } from "../scientific-execution-runtime/ScientificRuntimeExecution.js";

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