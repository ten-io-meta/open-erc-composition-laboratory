import type { Contradiction } from "./Contradiction.js";
import type { ContradictionResult } from "./ContradictionResult.js";
import type {
    ResearchConclusionResult
} from "../research-conclusions/ResearchConclusionResult.js";

export class ContradictionEngine {

    build(
        conclusions: ResearchConclusionResult
    ): ContradictionResult {

        const contradictions: Contradiction[] = [];

        const list = conclusions.conclusions ?? [];

        let id = 1;

        for (let i = 0; i < list.length; i++) {

            for (let j = i + 1; j < list.length; j++) {

                const a = list[i];
                const b = list[j];

                if (
                    a.subject === b.subject &&
                    a.object === b.object &&
                    a.relation !== b.relation
                ) {

                    contradictions.push({

                        contradictionId:
                            `CONTRADICTION-${String(id++)
                                .padStart(5, "0")}`,

                        subject: a.subject,

                        relationA: a.relation,

                        relationB: b.relation,

                        object: a.object,

                        supportingSources: [

                            ...(a.supportedBy ?? []),

                            ...(b.supportedBy ?? [])

                        ],

                        confidence: Math.round(

                            (
                                (a.confidence ?? 0) +
                                (b.confidence ?? 0)

                            ) / 2

                        ),

                        severity:

                            Math.abs(

                                (a.confidence ?? 0) -

                                (b.confidence ?? 0)

                            ) > 30

                                ? "HIGH"

                                : "MEDIUM"

                    });

                }

            }

        }

        return {

            generatedAt:
                new Date().toISOString(),

            contradictions,

            statistics: {

                total: contradictions.length,

                high: contradictions.filter(
                    c => c.severity === "HIGH"
                ).length,

                medium: contradictions.filter(
                    c => c.severity === "MEDIUM"
                ).length,

                low: contradictions.filter(
                    c => c.severity === "LOW"
                ).length

            },

            errors: []

        };

    }

}