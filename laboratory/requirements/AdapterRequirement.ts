import type {
    ProtocolRequirement,
    ProtocolRequirementContext,
    ProtocolRequirementResult
} from "./ProtocolRequirement.js";

export class AdapterRequirement implements ProtocolRequirement {
    check(context: ProtocolRequirementContext): ProtocolRequirementResult {
        return {
            requirement: "Adapter",
            passed: context.adapterAvailable,
            message: context.adapterAvailable
                ? "Protocol adapter available."
                : "Protocol adapter missing."
        };
    }
}