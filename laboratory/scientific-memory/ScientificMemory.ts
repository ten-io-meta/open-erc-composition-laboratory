import type {
    ScientificMemoryEntry
} from "./ScientificMemoryEntry.js";

export interface ScientificMemory {

    generatedAt: string;

    campaignId: string;

    entries: ScientificMemoryEntry[];

}