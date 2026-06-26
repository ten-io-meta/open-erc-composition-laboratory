import type { ValidationResult } from "./ValidationResult.js";

export interface ValidationRule {
    readonly id: string;

    validate(
        states: Record<string, unknown>
    ): ValidationResult;
}