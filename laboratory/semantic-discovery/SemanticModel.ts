import type { SemanticCapability } from "./SemanticCapability.js";
import type { SemanticRelationship } from "./SemanticRelationship.js";

export interface SemanticModel {

    modelId: string;

    generatedAt: string;

    capabilities: SemanticCapability[];

    relationships: SemanticRelationship[];

}