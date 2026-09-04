export class ResearchQuestionsEngine {

    build(
        theories: any,
        contradictions: any,
        confidence: any
    ) {

        const questions: any[] = [];

        let counter = 1;

        for (const theory of theories.theories ?? []) {
            questions.push({
                questionId: `QUESTION-${String(counter++).padStart(5, "0")}`,
                question: `What additional independent evidence would strengthen "${theory.title}"?`,
                sourceType: "THEORY",
                relatedId: theory.theoryId,
                priority: theory.maturity === "ESTABLISHED" ? "LOW" : "MEDIUM",
                rationale: theory.description
            });
        }

        for (const contradiction of contradictions.contradictions ?? []) {
            questions.push({
                questionId: `QUESTION-${String(counter++).padStart(5, "0")}`,
                question: `How can the relation between ${contradiction.subject} and ${contradiction.object} be resolved when evidence suggests both ${contradiction.relationA} and ${contradiction.relationB}?`,
                sourceType: "CONTRADICTION",
                relatedId: contradiction.contradictionId,
                priority: contradiction.severity === "HIGH" ? "HIGH" : "MEDIUM",
                rationale: `Contradiction severity is ${contradiction.severity}.`
            });
        }

        for (const assessment of confidence.assessments ?? []) {
            if (assessment.maturity !== "PRELIMINARY") {
                continue;
            }

            questions.push({
                questionId: `QUESTION-${String(counter++).padStart(5, "0")}`,
                question: `What evidence is needed to move "${assessment.statement}" beyond preliminary confidence?`,
                sourceType: "LOW_CONFIDENCE",
                relatedId: assessment.assessmentId,
                priority: assessment.calculatedConfidence < 60 ? "HIGH" : "MEDIUM",
                rationale: `Calculated confidence is ${assessment.calculatedConfidence} with ${assessment.independentSources} independent sources.`
            });
        }

        return {
            generatedAt: new Date().toISOString(),
            questions,
            statistics: {
                questions: questions.length,
                high: questions.filter(q => q.priority === "HIGH").length,
                medium: questions.filter(q => q.priority === "MEDIUM").length,
                low: questions.filter(q => q.priority === "LOW").length
            },
            errors: []
        };

    }

}