export interface ScientificMemoryEntry {

    knowledgeId: string;

    firstCampaign: string;

    lastCampaign: string;

    campaignsObserved: number;

    firstObserved: string;

    lastObserved: string;

    confidenceHistory: number[];

    evidenceHistory: number[];

    statusHistory: string[];

}