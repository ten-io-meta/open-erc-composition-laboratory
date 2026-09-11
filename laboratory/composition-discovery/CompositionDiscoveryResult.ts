import type { CompositionCandidate } from "./CompositionCandidate.js";

export interface CompositionDiscoveryResult {
    graphId: string;
    discoveredAt: string;
    candidates: CompositionCandidate[];
}