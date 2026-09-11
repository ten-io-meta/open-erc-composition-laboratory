export interface CompositionCandidate {
    candidateId: string;
    sourceGraphId: string;
    protocolA: string;
    protocolB: string;
    reason: string;
    supportingCapabilities: string[];
    evidence: string[];
    confidence: number;
}