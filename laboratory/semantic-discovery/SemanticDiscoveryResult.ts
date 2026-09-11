import type { SemanticModel } from "./SemanticModel.js";

export interface SemanticDiscoveryResult {

    graphId: string;

    discoveredAt: string;

    model: SemanticModel;

}