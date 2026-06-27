import type {
    ProtocolRequirement,
    ProtocolRequirementContext,
    ProtocolRequirementResult
} from "./ProtocolRequirement.js";

export class ProtocolRequirementEngine {
    private readonly requirements: ProtocolRequirement[] = [];

    register(requirement: ProtocolRequirement): void {
        this.requirements.push(requirement);
    }

    evaluate(
        context: ProtocolRequirementContext
    ): ProtocolRequirementResult[] {
        return this.requirements.map(requirement =>
            requirement.check(context)
        );
    }
}