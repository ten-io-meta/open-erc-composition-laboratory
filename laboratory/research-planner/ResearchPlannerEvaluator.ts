import type { ResearchPlan } from "./ResearchPlan.js";
import type { ResearchTask } from "./ResearchTask.js";

export class ResearchPlannerEvaluator {

    evaluate(
        plan: ResearchPlan
    ): ResearchPlan {

        const tasks = [...plan.tasks];

        tasks.sort(
            (a, b) => this.score(b) - this.score(a)
        );

        return {
            ...plan,
            tasks
        };

    }

    private score(
        task: ResearchTask
    ): number {

        let score = 0;

        // Prioridad base

        switch (task.priority) {

            case "HIGH":
                score += 100;
                break;

            case "MEDIUM":
                score += 60;
                break;

            default:
                score += 20;

        }

        const reason =
            task.reason.toLowerCase();

        // Relaciones importantes

        if (reason.includes("accounting"))
            score += 25;

        if (reason.includes("reservation"))
            score += 25;

        if (reason.includes("settlement"))
            score += 25;

        if (reason.includes("authority"))
            score += 20;

        if (reason.includes("interoperability"))
            score += 20;

        if (reason.includes("standardization"))
            score += 15;

        if (reason.includes("signature"))
            score += 10;

        // Cuantos más repositorios recomendados,
        // más posibilidades de reforzar la evidencia.

        score +=
            task.recommendedRepositories.length * 5;

        return score;

    }

}