export interface ResearchCampaign {

    campaignId: string;

    timestamp: string;

    executedScenarios: number;

    passedScenarios: number;

    failedScenarios: number;

    protocols: string[];

    hypothesesGenerated: number;

    hypothesesValidated: number;

    emergentProperties: number;

    patterns: number;

    relationships: number;

}
