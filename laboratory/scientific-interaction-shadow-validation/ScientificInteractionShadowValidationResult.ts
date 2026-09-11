import type {
    ScientificInteractionShadowValidation
} from "./ScientificInteractionShadowValidation.js";


export interface ScientificInteractionShadowValidationResult {

    validations:
        ScientificInteractionShadowValidation[];

    unmatchedHypothesisIds:
        string[];

    unmatchedObservationIds:
        string[];

    /*
     * Candidate + direction groups are intentionally left
     * unresolved when more than one hypothesis or more than one
     * runtime observation occupies the same group.
     */
    ambiguousDirectionKeys:
        string[];

    errors:
        string[];

}
