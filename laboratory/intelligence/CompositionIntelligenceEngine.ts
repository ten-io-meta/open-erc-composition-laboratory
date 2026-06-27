import type { ProtocolIntelligenceResult } from "./CompositionIntelligenceResult.js";

export class CompositionIntelligenceEngine {
    analyse(matrix: any[]): ProtocolIntelligenceResult[] {
        const protocolMap = new Map<string, any>();

        for (const row of matrix) {
            this.addObservation(protocolMap, row.protocolA, row);
            this.addObservation(protocolMap, row.protocolB, row);
        }

        return [...protocolMap.entries()].map(([protocolId, data]) => {
            const observations = data.rows.length;

            const averageCompatibility = average(
                data.rows.map((row: any) => row.compatibility)
            );

            const averageStability = average(
                data.rows.map((row: any) => row.stabilityScore)
            );

            const averageSafety = average(
                data.rows.map((row: any) => row.safetyScore)
            );

            const averageRiskScore = average(
                data.rows.map((row: any) => riskScore(row.risk))
            );

            return {
                protocolId,
                observations,
                successfulCompositions: data.rows.reduce(
                    (total: number, row: any) => total + row.successfulCompositions,
                    0
                ),
                averageCompatibility,
                averageStability,
                averageSafety,
                averageRisk: riskLabel(averageRiskScore),
                eligibleRelationships: data.rows.filter(
                    (row: any) => row.eligibility === true
                ).length
            };
        });
    }

    private addObservation(
        protocolMap: Map<string, any>,
        protocolId: string,
        row: any
    ): void {
        if (!protocolMap.has(protocolId)) {
            protocolMap.set(protocolId, {
                rows: []
            });
        }

        protocolMap.get(protocolId).rows.push(row);
    }
}

function average(values: number[]): number {
    if (values.length === 0) {
        return 0;
    }

    return Math.round(
        values.reduce((total, value) => total + value, 0) / values.length
    );
}

function riskScore(risk: "Low" | "Medium" | "High"): number {
    if (risk === "Low") {
        return 1;
    }

    if (risk === "Medium") {
        return 2;
    }

    return 3;
}

function riskLabel(score: number): "Low" | "Medium" | "High" {
    if (score <= 1.5) {
        return "Low";
    }

    if (score <= 2.3) {
        return "Medium";
    }

    return "High";
}