import type {
    ProtocolRequirement,
    ProtocolRequirementContext,
    ProtocolRequirementResult
} from "./ProtocolRequirement.js";

export class ActionRequirement implements ProtocolRequirement {
    check(context: ProtocolRequirementContext): ProtocolRequirementResult {
        const passed =
            Array.isArray(context.actions) &&
            context.actions.length > 0;

        return {
            requirement: "Actions",
            passed,
            message: passed
                ? "Protocol exposes executable actions."
                : "Protocol does not expose executable actions."
        };
    }
}