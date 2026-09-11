import type {
    ScientificCompositionConstraint
} from "../scientific-composition-evaluation-specification/ScientificCompositionConstraint.js";


export type ScientificCompositionConstraintEvaluationStatus =
    | "PRESERVED"
    | "VIOLATED"
    | "UNEVALUATED";


export interface ScientificCompositionConstraintEvaluation {

    constraintId:
        string;

    candidateId:
        string;

    participantSide:
        ScientificCompositionConstraint["participantSide"];

    status:
        ScientificCompositionConstraintEvaluationStatus;

    observationIds:
        string[];

    evidence:
        string[];

}
