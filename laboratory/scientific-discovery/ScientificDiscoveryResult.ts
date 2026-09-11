import type { ScientificDiscovery } from "./ScientificDiscovery.js";

export interface ScientificDiscoveryResult {

    generatedAt: string;

    discoveries: ScientificDiscovery[];

    statistics: {
        discoveries: number;
        centralCapabilities: number;
        bridgeNodes: number;
        evidenceClusters: number;
        compositionPaths: number;
    };

    errors: string[];

}