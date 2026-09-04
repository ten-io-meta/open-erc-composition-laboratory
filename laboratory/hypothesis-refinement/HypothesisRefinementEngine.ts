import type { RefinedHypothesis } from "./RefinedHypothesis.js";
import type { HypothesisRefinementResult } from "./HypothesisRefinementResult.js";

export class HypothesisRefinementEngine {

    build(
        questions: any
    ): HypothesisRefinementResult {

        const refinedHypotheses: RefinedHypothesis[] = [];

        let counter = 1;

        for (const question of questions.questions ?? []) {

            const text = String(question.question ?? "");
            const rationale = String(question.rationale ?? "");

            const action = this.actionFor(
                question.sourceType,
                text,
                rationale
            );

            refinedHypotheses.push({
                refinedHypothesisId:
                    `REFINED-HYP-${String(counter++).padStart(5, "0")}`,

                sourceQuestionId:
                    question.questionId,

                sourceType:
                    question.sourceType,

                originalQuestion:
                    text,

                refinedStatement:
                    this.refineStatement(text),

                action,

                priority:
                    question.priority,

                rationale:
                    `Generated from research question ${question.questionId}: ${rationale}`
            });

        }

        return {
            generatedAt: new Date().toISOString(),
            refinedHypotheses,
            statistics: {
                total: refinedHypotheses.length,
                refine: refinedHypotheses.filter(item => item.action === "REFINE").length,
                split: refinedHypotheses.filter(item => item.action === "SPLIT").length,
                strengthen: refinedHypotheses.filter(item => item.action === "STRENGTHEN").length,
                investigate: refinedHypotheses.filter(item => item.action === "INVESTIGATE").length
            },
            errors: []
        };

    }

    private actionFor(
        sourceType: string,
        question: string,
        rationale: string
    ): RefinedHypothesis["action"] {

        const text =
            `${sourceType} ${question} ${rationale}`.toLowerCase();

        if (text.includes("contradiction")) {
            return "SPLIT";
        }

        if (
            text.includes("preliminary") ||
            text.includes("beyond preliminary") ||
            text.includes("low_confidence")
        ) {
            return "INVESTIGATE";
        }

        if (
            text.includes("strengthen") ||
            text.includes("additional independent evidence")
        ) {
            return "STRENGTHEN";
        }

        return "REFINE";

    }

    private refineStatement(
        question: string
    ): string {

        return question
            .replace(/^What additional independent evidence would strengthen/i, "Hypothesis requires stronger independent evidence for")
            .replace(/^What evidence is needed to move/i, "Hypothesis requires additional evidence to move")
            .replace(/\?$/, ".")
            .trim();

    }

}