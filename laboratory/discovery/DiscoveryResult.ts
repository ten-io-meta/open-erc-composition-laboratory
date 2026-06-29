import type { ResearchFinding } from "./ResearchFinding.js";

export interface DiscoveryResult {

    graphId: string;

    discoveredAt: string;

    findings: ResearchFinding[];

}