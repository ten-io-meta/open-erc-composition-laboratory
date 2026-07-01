import type { HypothesisValidation } from "./HypothesisValidation.js";

export interface HypothesisValidationResult {

    validatedAt: string;

    validations: HypothesisValidation[];

    errors: string[];

}