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

            const averageCompatibility = averageMeasured(
                rows.map((row: any) => row.compatibility)
            );

            const averageStability = averageMeasured(
                rows.map((row: any) => row.stabilityScore)
            );

            const averageSafety = averageMeasured(
                rows.map((row: any) => row.safetyScore)
            );

            const averageRiskScore = averageMeasured(
                rows.map((row: any) => riskScore(row.risk))
            );

            const measuredCompatibilityRows = rows.filter(
                (row: any) => isMeasuredNumber(row.compatibility)
            );

            const strongest = [...measuredCompatibilityRows].sort(
                (a: any, b: any) => b.compatibility - a.compatibility
            )[0];

            const weakest = [...measuredCompatibilityRows].sort(
                (a: any, b: any) => a.compatibility - b.compatibility
            )[0];

            const measuredRiskRows = rows.filter(
                (row: any) => riskScore(row.risk) !== null
            );

            const highRiskRows = rows.filter(
                (row: any) => row.risk === "High"
            );

            const lowCompatibilityRows = rows.filter(
                (row: any) =>
                    isMeasuredNumber(row.compatibility) &&
                    row.compatibility < 70
            );

            const lowSafetyRows = rows.filter(
                (row: any) =>
                    isMeasuredNumber(row.safetyScore) &&
                    row.safetyScore < 70
            );

            const supportingEvidence: string[] = [];

            for (const row of rows) {
                supportingEvidence.push(
                    `${otherProtocol(protocolId, row)}: ${row.successfulCompositions}/${row.occurrences} successful compositions, relationship confidence ${row.relationshipConfidence}%, compatibility ${formatMetric(row.compatibility)}, risk ${row.risk}`
                );
            }

            return {
                protocolId,
                observations,
                successfulCompositions: rows.reduce(
                    (total: number, row: any) =>
                        total + row.successfulCompositions,
                    0
                ),
                averageCompatibility,
                averageStability,
                averageSafety,
                averageRisk: riskLabel(averageRiskScore),
                eligibleRelationships: rows.filter(
                    (row: any) => row.eligibility === true
                ).length,
                strongestPartner: strongest
                    ? otherProtocol(protocolId, strongest)
                    : undefined,
                weakestPartner: weakest
                    ? otherProtocol(protocolId, weakest)
                    : undefined,
                dominantRiskReason: explainRisk(
                    highRiskRows.length,
                    lowCompatibilityRows.length,
                    lowSafetyRows.length,
                    observations,
                    measuredRiskRows.length
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

function isMeasuredNumber(value: unknown): value is number {
    return typeof value === "number" && Number.isFinite(value);
}

function averageMeasured(values: unknown[]): number | null {
    const measured = values.filter(isMeasuredNumber);

    if (measured.length === 0) {
        return null;
    }

    return Math.round(
        measured.reduce(
            (total, value) => total + value,
            0
        ) / measured.length
    );
}

function riskScore(risk: unknown): number | null {
    if (risk === "Low") {
        return 1;
    }

    if (risk === "Medium") {
        return 2;
    }

    if (risk === "High") {
        return 3;
    }

    return null;
}

function riskLabel(
    score: number | null
): "Low" | "Medium" | "High" | "Unknown" {
    if (score === null) {
        return "Unknown";
    }

    if (score <= 1.5) {
        return "Low";
    }

    if (score <= 2.3) {
        return "Medium";
    }

    return "High";
}

function formatMetric(value: unknown): string {
    return isMeasuredNumber(value)
        ? `${value}%`
        : "Not measured";
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
    observations: number,
    measuredRiskRows: number
): string {
    if (observations === 0) {
        return "No observations available.";
    }

    if (measuredRiskRows === 0) {
        return "Risk has not been evaluated for current observations.";
    }

    if (
        highRiskRows > 0 &&
        lowCompatibilityRows > 0 &&
        lowSafetyRows > 0
    ) {
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