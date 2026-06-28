export interface ResearchMemory {

    campaigns: any[];

    totalCampaigns: number;

    totalScenarios: number;

    totalPassed: number;

    totalFailed: number;

    protocolCoverage: Record<string, number>;

    hypothesisCoverage: number;

}
