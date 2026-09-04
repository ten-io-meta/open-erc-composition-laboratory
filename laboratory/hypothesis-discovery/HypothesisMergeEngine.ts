import type { HypothesisResult } from "../hypothesis/HypothesisResult.js";
import type { ResearchHypothesis } from "../hypothesis/ResearchHypothesis.js";

export class HypothesisMergeEngine {

    private normalizeRelation(relation: string): string {
        return relation
            .replace(/->/g, ":")
            .trim()
            .toUpperCase();
    }

    merge(
        baseResult: HypothesisResult,
        derivedHypotheses: ResearchHypothesis[]
    ): HypothesisResult {

        const existingRelations = new Set(
            baseResult.hypotheses.map(hypothesis =>
                this.normalizeRelation(hypothesis.relation)
            )
        );

        const uniqueDerivedHypotheses = derivedHypotheses.filter(
            hypothesis => !existingRelations.has(
                this.normalizeRelation(hypothesis.relation)
            )
        );

        return {
            generatedAt: new Date().toISOString(),
            hypotheses: [
                ...baseResult.hypotheses,
                ...uniqueDerivedHypotheses
            ],
            errors: [
                ...baseResult.errors
            ]
        };

    }

}