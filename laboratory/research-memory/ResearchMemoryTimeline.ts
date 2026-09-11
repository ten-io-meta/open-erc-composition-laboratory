import type { ResearchMemoryEvent } from "./ResearchMemoryEvent.js";

export interface ResearchMemoryTimeline {

    relation: string;

    protocolPair?: string;

    capabilityPair?: string;

    events: ResearchMemoryEvent[];

}