import type { ValidationRule } from "./ValidationRule.js";
import type { ValidationResult } from "./ValidationResult.js";

export class SettlementSafetyRule implements ValidationRule {
    readonly id = "settlement-safety";

    validate(states: Record<string, unknown>): ValidationResult {
        const settlementState = (
            states["ERC8275Settlement"] ??
            states["MockSettlement"]
        ) as
            | {
                  settled?: number;
                  reserved?: number;
              }
            | undefined;

        if (!settlementState) {
            return {
                rule: this.id,
                passed: false,
                message: "Settlement state not found"
            };
        }

        const settled = settlementState.settled ?? 0;
        const reserved = settlementState.reserved ?? 0;

        const passed = settled === reserved;

        return {
            rule: this.id,
            passed,
            message: passed
                ? "Settlement safety invariant holds"
                : "Settlement safety invariant failed"
        };
    }
}
