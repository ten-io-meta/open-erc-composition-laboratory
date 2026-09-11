export interface ResearchMemoryEvent {

    eventId: string;

    sourceId: string;

    relation: string;

    protocolPair?: string;

    capabilityPair?: string;

    confidence: number;

    status: string;

    observedAt: string;

    evidence: string[];

}