export interface ResearchMemoryEvent {

    eventId: string;

    sourceId: string;

    relation: string;

    protocolPair: string;

    confidence: number;

    status: string;

    observedAt: string;

    evidence: string[];

}