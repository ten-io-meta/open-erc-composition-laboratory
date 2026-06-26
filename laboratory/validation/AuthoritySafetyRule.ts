import type { ValidationRule } from "./ValidationRule.js";
import type { ValidationResult } from "./ValidationResult.js";

export class AuthoritySafetyRule implements ValidationRule {
    readonly id = "authority-safety";

    validate(states: Record<string, unknown>): ValidationResult {
        const authorityState = (
            states["ERC8001Authority"] ??
            states["MockAuthority"]
        ) as
            | {
                  authorityLimit?: number;
                  consumed?: number;
              }
            | undefined;

        if (!authorityState) {
            return {
                rule: this.id,
                passed: false,
                message: "Authority state not found"
            };
        }

        const authorityLimit = authorityState.authorityLimit ?? 0;
        const consumed = authorityState.consumed ?? 0;

        const passed = consumed <= authorityLimit;

        return {
            rule: this.id,
            passed,
            message: passed
                ? "Authority safety invariant holds"
                : "Authority safety invariant failed"
        };
    }
}