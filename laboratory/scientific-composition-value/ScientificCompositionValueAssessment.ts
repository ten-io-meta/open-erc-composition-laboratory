import type {
    ScientificCompositionHarmonyStatus
} from "../scientific-composition-harmony/ScientificCompositionHarmonyAssessment.js";

import type {
    ScientificCompositionValueFinding
} from "./ScientificCompositionValueFinding.js";


export type ScientificCompositionValueEvaluationStatus =
    | "ASSESSED"
    | "PARTIALLY_ASSESSED"
    | "NOT_ESTABLISHED";


export interface ScientificCompositionValueAssessment {

    assessmentId:
        string;

    envelopeId:
        string;

    solutionId:
        string;

    harmonyAssessmentId:
        string;

    objectiveId:
        string;

    participantIds:
        string[];

    harmonyStatus:
        ScientificCompositionHarmonyStatus;

    findings:
        ScientificCompositionValueFinding[];

    /*
     * ASSESSED:
     * value findings are derived only from exact globally supported
     * FULL_SET configurations.
     *
     * PARTIALLY_ASSESSED:
     * value findings are restricted to exact globally supported
     * STRICT_SUBSET configurations.
     *
     * NOT_ESTABLISHED:
     * upstream Harmony does not establish a supported composition
     * surface from which positive value may be derived.
     */
    valueEvaluationStatus:
        ScientificCompositionValueEvaluationStatus;

    /*
     * This layer never manufactures compatibility, SUPPORT,
     * CHALLENGE or Harmony.
     */
    decisionAuthority:
        "UPSTREAM_HARMONY_AND_SOLVER_STATE_ONLY";

}


export interface ScientificCompositionValueAssessmentResult {

    assessments:
        ScientificCompositionValueAssessment[];

    errors:
        string[];

}