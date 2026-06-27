import type { CompositionQuery } from "./CompositionQuery.js";

export class CompositionQueryEngine {

    query(
        matrix: any[],
        query: CompositionQuery
    ): any[] {

        return matrix.filter(entry => {

            if (
                query.eligibleOnly === true &&
                entry.eligibility !== true
            ) {
                return false;
            }

            if (
                query.minEvidence !== undefined &&
                entry.evidence < query.minEvidence
            ) {
                return false;
            }

            if (
                query.minStabilityScore !== undefined &&
                entry.stabilityScore < query.minStabilityScore
            ) {
                return false;
            }

            if (
                query.maxRisk !== undefined &&
                riskRank(entry.risk) > riskRank(query.maxRisk)
            ) {
                return false;
            }

            return true;

        });

    }

}

function riskRank(risk: "Low" | "Medium" | "High"): number {

    if (risk === "Low") {
        return 1;
    }

    if (risk === "Medium") {
        return 2;
    }

    return 3;

}