import type {
    ProtocolRequirement,
    ProtocolRequirementContext,
    ProtocolRequirementResult
} from "./ProtocolRequirement.js";

export class ManifestRequirement implements ProtocolRequirement {
    check(context: ProtocolRequirementContext): ProtocolRequirementResult {
        const passed = context.protocolId.length > 0;

        return {
            requirement: "Manifest",
            passed,
            message: passed
                ? "Protocol manifest is present."
                : "Protocol manifest is missing or invalid."
        };
    }
}
