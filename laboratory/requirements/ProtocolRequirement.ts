export interface ProtocolRequirementResult {
    requirement: string;
    passed: boolean;
    message: string;
}
export interface ProtocolRequirementContext {
    protocolId: string;
    capabilities: string[];
    invariants?: string[];
    adapterAvailable: boolean;
    actions?: string[];
}

export interface ProtocolRequirement {
    check(context: ProtocolRequirementContext): ProtocolRequirementResult;
}
