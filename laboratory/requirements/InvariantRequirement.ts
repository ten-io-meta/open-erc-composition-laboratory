import type {
    ProtocolRequirement,
    ProtocolRequirementContext,
    ProtocolRequirementResult
} from "./ProtocolRequirement.js";

export class InvariantRequirement implements ProtocolRequirement {
    check(context: ProtocolRequirementContext): ProtocolRequirementResult {
        const passed =
            Array.isArray(context.invariants) &&
            context.invariants.length > 0;

        return {
            requirement: "Invariant Declaration",
            passed,
            message: passed
                ? "Protocol declares at least one invariant."
                : "Protocol does not declare any invariant."
        };
    }
}