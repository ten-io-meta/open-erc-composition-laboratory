import type { ValidationRule } from "./ValidationRule.js";
import type { ValidationResult } from "./ValidationResult.js";

export class ReservationSafetyRule implements ValidationRule {
    readonly id = "reservation-safety";

    validate(states: Record<string, unknown>): ValidationResult {
        const reservationState = states["ERC8060Reservable"] as
            | {
                  lockedValue?: number;
                  availableValue?: number;
                  totalValue?: number;
              }
            | undefined;

        if (!reservationState) {
            return {
                rule: this.id,
                passed: false,
                message: "ERC8060Reservable state not found"
            };
        }

        const lockedValue = reservationState.lockedValue ?? 0;
        const availableValue = reservationState.availableValue ?? 0;
        const totalValue = reservationState.totalValue ?? 0;

        const passed = lockedValue + availableValue === totalValue;

        return {
            rule: this.id,
            passed,
            message: passed
                ? "Reservation safety invariant holds"
                : "Reservation safety invariant failed"
        };
    }
}