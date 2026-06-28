import type { ResearchMemory } from "./ResearchMemory.js";

export class ResearchMemoryEngine {

    build(campaigns: any[]): ResearchMemory {

        const protocolCoverage: Record<string, number> = {};

        let totalScenarios = 0;
        let totalPassed = 0;
        let totalFailed = 0;
        let hypothesisCoverage = 0;

        for (const campaign of campaigns) {

            totalScenarios += campaign.executedScenarios;
            totalPassed += campaign.passedScenarios;
            totalFailed += campaign.failedScenarios;

            hypothesisCoverage +=
                campaign.hypothesesValidated ?? 0;

            const protocolCounts =
                campaign.protocolCoverage ?? {};

            if (Object.keys(protocolCounts).length > 0) {

                for (const [protocol, count] of Object.entries(protocolCounts)) {

                    protocolCoverage[protocol] =
                        (protocolCoverage[protocol] ?? 0) +
                        Number(count);

                }

            } else {

                for (const protocol of campaign.protocols ?? []) {

                    protocolCoverage[protocol] =
                        (protocolCoverage[protocol] ?? 0) + 1;

                }

            }

        }

        return {
            campaigns,
            totalCampaigns: campaigns.length,
            totalScenarios,
            totalPassed,
            totalFailed,
            protocolCoverage,
            hypothesisCoverage
        };

    }

}
