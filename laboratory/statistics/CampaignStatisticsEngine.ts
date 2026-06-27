import { CampaignStatistics } from "./CampaignStatistics.js";

export class CampaignStatisticsEngine {

    build(): CampaignStatistics {

        return {

            experimentsExecuted: 0,

            protocolsDiscovered: 0,

            protocolsUsed: 0,

            capabilitiesResolved: 0,

            validationRulesChecked: 0,

            validationPassed: 0,

            validationFailed: 0,

            compatibilityScore: 0,

            composabilityScore: 0,

            datasetsGenerated: 0,

            reportsGenerated: 0

        };

    }

}