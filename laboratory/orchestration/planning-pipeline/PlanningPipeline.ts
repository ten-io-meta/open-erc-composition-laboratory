import {
    ResearchPlannerEngine
} from "../../research-planner/ResearchPlannerEngine.js";

import {
    ResearchPlannerEvaluator
} from "../../research-planner/ResearchPlannerEvaluator.js";

import type {
    PlanningPipelineResult
} from "./PlanningPipelineResult.js";

type ResearchPlannerInput =
    Parameters<
        ResearchPlannerEngine["build"]
    >[0];

type ExistingRepositoriesInput =
    Parameters<
        ResearchPlannerEngine["build"]
    >[1];

export interface PlanningPipelineInput {

    crossSourcePatterns:
        ResearchPlannerInput;

    existingRepositories:
        ExistingRepositoriesInput;

}

export class PlanningPipeline {

    run(
        input: PlanningPipelineInput
    ): PlanningPipelineResult {

        /*
         * Generate the research plan from
         * current cross-source patterns.
         */

        const researchPlan =
            new ResearchPlannerEngine().build(
                input.crossSourcePatterns,
                input.existingRepositories
            );

        /*
         * Evaluate and prioritize the plan.
         */

        const evaluatedResearchPlan =
            new ResearchPlannerEvaluator().evaluate(
                researchPlan
            );

        const tasks =
            evaluatedResearchPlan.tasks ?? [];

        return {

            researchPlan,

            evaluatedResearchPlan,

            statistics: {

                tasks:
                    tasks.length,

                highPriority:
                    tasks.filter(
                        task =>
                            task.priority === "HIGH"
                    ).length,

                mediumPriority:
                    tasks.filter(
                        task =>
                            task.priority === "MEDIUM"
                    ).length,

                lowPriority:
                    tasks.filter(
                        task =>
                            task.priority === "LOW"
                    ).length

            }

        };

    }

}