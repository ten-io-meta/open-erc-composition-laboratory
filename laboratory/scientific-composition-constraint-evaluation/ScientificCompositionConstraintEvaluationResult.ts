import type {
    ScientificCompositionConstraintEvaluation
} from "./ScientificCompositionConstraintEvaluation.js";


export type ScientificCompositionConstraintScientificPolarity =
    | "SUPPORT"
    | "CHALLENGE"
    | "INCONCLUSIVE";


export interface ScientificCompositionConstraintEvaluationResult {

    candidateId:
        string | null;

    evaluations:
        ScientificCompositionConstraintEvaluation[];

    scientificPolarity:
        ScientificCompositionConstraintScientificPolarity;

    statistics: {

        total:
            number;

        preserved:
            number;

        violated:
            number;

        unevaluated:
            number;

    };

    errors:
        string[];

}
