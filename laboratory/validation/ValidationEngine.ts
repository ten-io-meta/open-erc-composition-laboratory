import type { ValidationRule } from "./ValidationRule.js";
import type { ValidationResult } from "./ValidationResult.js";

export class ValidationEngine {
    private readonly rules: ValidationRule[] = [];

    register(rule: ValidationRule): void {
        this.rules.push(rule);
    }

    validate(
        states: Record<string, unknown>
    ): ValidationResult[] {
        return this.rules.map(rule => rule.validate(states));
    }
}
