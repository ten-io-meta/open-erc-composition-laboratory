import type { ValidationRule } from "./ValidationRule.js";
import type { ValidationResult } from "./ValidationResult.js";

export class CursorSafetyRule implements ValidationRule {
    readonly id = "cursor-safety";

    validate(states: Record<string, unknown>): ValidationResult {
        const cursorState = states["ERC8312Cursor"] as
            | {
                  cursor?: number;
                  consumedAuthority?: number;
              }
            | undefined;

        if (!cursorState) {
            return {
                rule: this.id,
                passed: true,
                message: "Cursor safety skipped: ERC8312Cursor not present"
            };
        }

        const cursor = cursorState.cursor ?? 0;
        const consumed = cursorState.consumedAuthority ?? 0;

        const passed = cursor <= consumed;

        return {
            rule: this.id,
            passed,
            message: passed
                ? "Cursor safety invariant holds"
                : "Cursor exceeded consumed authority"
        };
    }
}