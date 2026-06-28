import type { ProtocolIntelligenceResult } from "./CompositionIntelligenceResult.js";

export class CompositionIntelligenceEngine {
    analyse(matrix: any[]): ProtocolIntelligenceResult[] {
        const protocolMap = new Map<string, any>();

        for (const row of matrix) {
            this.addObservation(protocolMap, row.protocolA, row);
            this.addObservation(protocolMap, row.protocolB, row);
        }

        return [...protocolMap.entries()].map(([protocolId, data]) => {
            const rows = data.rows;
            const observations = rows.length;

            const averageCompatibility = average(rows.map((row: any) => row.compatibility));
            const averageStability = average(rows.map((row: any) => row.stabilityScore));
            const averageSafety = average(rows.map((row: any) => row.safetyScore));
            const averageRiskScore = average(rows.map((row: any) => riskScore(row.risk)));

            const strongest = [...rows].sort((a, b) => b.compatibility - a.compatibility)[0];
            const weakest = [...rows].sort((a, b) => a.compatibility - b.compatibility)[0];

            const highRiskRows = rows.filter((row: any) => row.risk === "High");
            const lowCompatibilityRows = rows.filter((row: any) => row.compatibility < 70);
            const lowSafetyRows = rows.filter((row: any) => row.safetyScore < 70);

            const supportingEvidence: string[] = [];

            for (const row of rows) {
                supportingEvidence.push(
                    `${otherProtocol(protocolId, row)}: ${row.successfulCompositions}/${row.occurrences} successful compositions, compatibility ${row.compatibility}%, risk ${row.risk}`
                );
            }

            return {
                protocolId,
                observations,
                successfulCompositions: rows.reduce(
                    (total: number, row: any) => total + row.successfulCompositions,
                    0
                ),
                averageCompatibility,
                averageStability,
                averageSafety,
                averageRisk: riskLabel(averageRiskScore),
                eligibleRelationships: rows.filter((row: any) => row.eligibility === true).length,
                strongestPartner: strongest ? otherProtocol(protocolId, strongest) : undefined,
                weakestPartner: weakest ? otherProtocol(protocolId, weakest) : undefined,
                dominantRiskReason: explainRisk(
                    highRiskRows.length,
                    lowCompatibilityRows.length,
                    lowSafetyRows.length,
                    observations
                ),
                supportingEvidence
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

function otherProtocol(protocolId: string, row: any): string {
    return row.protocolA === protocolId
        ? row.protocolB
        : row.protocolA;
}

function explainRisk(
    highRiskRows: number,
    lowCompatibilityRows: number,
    lowSafetyRows: number,
    observations: number
): string {
    if (observations === 0) {
        return "No observations available.";
    }

    if (highRiskRows > 0 && lowCompatibilityRows > 0 && lowSafetyRows > 0) {
        return "Risk is driven by high-risk relationships with low compatibility and low safety scores.";
    }

    if (highRiskRows > 0 && lowCompatibilityRows > 0) {
        return "Risk is driven by high-risk relationships with limited observed compatibility.";
    }

    if (highRiskRows > 0 && lowSafetyRows > 0) {
        return "Risk is driven by high-risk relationships with reduced safety scores.";
    }

    if (highRiskRows > 0) {
        return "Risk is driven by one or more high-risk observed relationships.";
    }

    return "No dominant high-risk pattern detected in current observations.";
}
