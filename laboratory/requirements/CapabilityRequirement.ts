import type {
    ProtocolRequirement,
    ProtocolRequirementContext,
    ProtocolRequirementResult
} from "./ProtocolRequirement.js";

export class CapabilityRequirement implements ProtocolRequirement {
    check(context: ProtocolRequirementContext): ProtocolRequirementResult {
        const passed = context.capabilities.length > 0;

        return {
            requirement: "Capability Declaration",
            passed,
            message: passed
                ? "Protocol declares at least one capability."
                : "Protocol does not declare any capability."
        };
    }
}
