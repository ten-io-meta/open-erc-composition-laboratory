import type {
    ResearchPlannerEngine
} from "../../research-planner/ResearchPlannerEngine.js";

import type {
    ResearchPlannerEvaluator
} from "../../research-planner/ResearchPlannerEvaluator.js";

export type GeneratedResearchPlan =
    ReturnType<
        ResearchPlannerEngine["build"]
    >;

export type EvaluatedResearchPlan =
    ReturnType<
        ResearchPlannerEvaluator["evaluate"]
    >;

export interface PlanningPipelineResult {

    researchPlan:
        GeneratedResearchPlan;

    evaluatedResearchPlan:
        EvaluatedResearchPlan;

    statistics: {

        tasks: number;

        highPriority: number;

        mediumPriority: number;

        lowPriority: number;

    };

}