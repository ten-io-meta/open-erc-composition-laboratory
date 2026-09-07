import type {
    ScientificExecutableTargetIdentity
} from "../scientific-execution-target-resolution/ScientificExecutableTargetIdentity.js";

import type {
    ScientificCompositionExecutionRequirement
} from "../scientific-composition-experiment/ScientificCompositionExecutionRequirement.js";


export type ScientificExecutionSpecificationType =
    | "TEST_EXECUTION"
    | "INVARIANT_VALIDATION"
    | "STATIC_ANALYSIS"
    | "COMPOSITION_EXECUTION";


export type ScientificExecutionSpecificationResolutionStatus =
    | "EXECUTABLE"
    | "UNRESOLVED";


export interface ScientificExecutionSpecification {

    specificationId: string;

    experimentId: string;

    executionTaskId: string;

    executionPlanId: string;

    stepId: string;

    specificationType:
        ScientificExecutionSpecificationType;

    /*
     * Joint scientific execution identity.
     *
     * Present only for composition execution specifications.
     * Individual executable identity must never substitute for it.
     */
    compositionExecutionRequirement?:
        ScientificCompositionExecutionRequirement;

    repository:
        string | null;

    /*
     * Exact executable target selected by target resolution.
     *
     * When present, its repository is authoritative for
     * execution. The scientific targetId remains a separate
     * research identity.
     *
     * COMPOSITION_EXECUTION deliberately leaves this null.
     */
    selectedExecutableTarget:
        ScientificExecutableTargetIdentity | null;

    workingDirectory:
        string | null;

    command:
        string | null;

    testSelector:
        string | null;

    invariantSelector:
        string | null;

    supportCondition:
        string | null;

    challengeCondition:
        string | null;

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

    scientificPolarity:
        | "SUPPORT"
        | "CHALLENGE"
        | "NEUTRAL";

    expectedExitCode:
        number | null;

    resolutionStatus:
        ScientificExecutionSpecificationResolutionStatus;

    unresolvedReasons:
        string[];

    successCriteria:
        string[];

    failureCriteria:
        string[];

    generatedAt:
        string;

}
