import type {
    ScientificRevision
} from "../scientific-revision/ScientificRevision.js";

import type {
    ScientificRevisionResult
} from "../scientific-revision/ScientificRevisionResult.js";

import type {
    ScientificRetestPlan
} from "./ScientificRetestPlan.js";

import type {
    ScientificRetestPlannerResult
} from "./ScientificRetestPlannerResult.js";

export class ScientificRetestPlannerEngine {

    build(
        campaignId: string,
        revisions: ScientificRevisionResult
    ): ScientificRetestPlannerResult {

        try {

            const plans: ScientificRetestPlan[] = [];

            let counter = 1;

            const candidates =
                revisions.revisions.filter(
                    revision =>
                        revision.requiresExperiment &&
                        (
                            revision.action === "RETEST" ||
                            revision.action === "CHALLENGE" ||
                            revision.action === "REFUTE_CANDIDATE"
                        )
                );

            for (
                const revision
                of candidates
            ) {

                plans.push({

                    retestPlanId:
                        `SCIENTIFIC-RETEST-${String(
                            counter++
                        ).padStart(5, "0")}`,

                    targetId:
                        revision.targetId,

                        targetEvidenceIds:
    revision.targetEvidenceIds,

                    targetType:
                        revision.targetType,

                    statement:
                        revision.statement,

                    triggerAction:
                        revision.action,

                    priority:
                        revision.priority,

                    objective:
                        this.objectiveFor(
                            revision
                        ),

                    hypothesis:
                        this.hypothesisFor(
                            revision
                        ),

                    falsificationStrategy:
                        this.falsificationStrategyFor(
                            revision
                        ),

                    requiredEvidence:
                        this.requiredEvidenceFor(
                            revision
                        ),

                    successCriteria:
                        this.successCriteriaFor(
                            revision
                        ),

                    failureCriteria:
                        this.failureCriteriaFor(
                            revision
                        ),

                    sourceRevisionId:
                        revision.revisionId,

                    sourceCritiqueIds:
                        revision.sourceCritiqueIds,

                    experimentRequired:
                        true,

                    explanation:
                        `Retest plan generated from revision ` +
                        `${revision.revisionId} with action ` +
                        `${revision.action}, priority ` +
                        `${revision.priority}, average robustness ` +
                        `${revision.averageRobustnessScore}, and ` +
                        `falsification risk ` +
                        `${revision.highestFalsificationRisk}.`

                });

            }

            plans.sort(
                (a, b) =>
                    this.priorityRank(
                        b.priority
                    ) -
                    this.priorityRank(
                        a.priority
                    )
            );

            return {

                generatedAt:
                    new Date().toISOString(),

                campaignId,

                plans,

                statistics: {

                    plans:
                        plans.length,

                    criticalPriority:
                        this.countPriority(
                            plans,
                            "CRITICAL"
                        ),

                    highPriority:
                        this.countPriority(
                            plans,
                            "HIGH"
                        ),

                    mediumPriority:
                        this.countPriority(
                            plans,
                            "MEDIUM"
                        ),

                    lowPriority:
                        this.countPriority(
                            plans,
                            "LOW"
                        ),

                    theoryRetests:
                        this.countTarget(
                            plans,
                            "THEORY"
                        ),

                    discoveryRetests:
                        this.countTarget(
                            plans,
                            "DISCOVERY"
                        ),

                    knowledgeRetests:
                        this.countTarget(
                            plans,
                            "KNOWLEDGE"
                        ),

                    evidenceHistoryRetests:
                        this.countTarget(
                            plans,
                            "EVIDENCE_HISTORY"
                        ),

                    experimentRequired:
                        plans.filter(
                            plan =>
                                plan.experimentRequired
                        ).length

                },

                errors: []

            };

        } catch (error) {

            return {

                generatedAt:
                    new Date().toISOString(),

                campaignId,

                plans: [],

                statistics: {

                    plans: 0,

                    criticalPriority: 0,

                    highPriority: 0,

                    mediumPriority: 0,

                    lowPriority: 0,

                    theoryRetests: 0,

                    discoveryRetests: 0,

                    knowledgeRetests: 0,

                    evidenceHistoryRetests: 0,

                    experimentRequired: 0

                },

                errors: [
                    error instanceof Error
                        ? error.message
                        : String(error)
                ]

            };

        }

    }

    private objectiveFor(
        revision: ScientificRevision
    ): string {

        switch (
            revision.action
        ) {

            case "REFUTE_CANDIDATE":

                return (
                    `Attempt to falsify "${revision.statement}" ` +
                    `before any scientific rejection decision is accepted.`
                );

            case "CHALLENGE":

                return (
                    `Resolve the scientific challenge affecting ` +
                    `"${revision.statement}" through independent ` +
                    `and adversarial evidence.`
                );

            case "RETEST":

                return (
                    `Retest "${revision.statement}" using ` +
                    `independent evidence and adversarial validation.`
                );

            default:

                return (
                    `Re-evaluate "${revision.statement}" ` +
                    `with additional independent evidence.`
                );

        }

    }

    private hypothesisFor(
        revision: ScientificRevision
    ): string {

        return (
            `"${revision.statement}" should remain scientifically ` +
            `defensible when tested against independent implementations, ` +
            `counterexamples, and adversarial evidence.`
        );

    }

    private falsificationStrategyFor(
        revision: ScientificRevision
    ): string[] {

        const strategy = [

            "Search for independent implementations that do not exhibit the claimed relationship.",

            "Search for direct counterexamples in executable code, tests, or invariants.",

            "Compare supporting evidence against contradictory or alternative behavior.",

            "Recalculate scientific confidence after introducing adversarial evidence."

        ];

        if (
            revision.targetType === "DISCOVERY"
        ) {

            strategy.push(
                "Test whether the discovery can be reproduced from an independent source not involved in its original detection."
            );

        }

        if (
            revision.targetType === "THEORY"
        ) {

            strategy.push(
                "Attempt to construct a valid protocol composition in which the theory does not hold."
            );

        }

        return strategy;

    }

    private requiredEvidenceFor(
        revision: ScientificRevision
    ): string[] {

        const evidence = [

            "At least one independent implementation source.",

            "Direct implementation, executable test, or invariant evidence.",

            "Traceable evidence linked to the target statement.",

            "Explicit search for contradictory evidence."

        ];

        if (
            revision.targetType === "DISCOVERY"
        ) {

            evidence.push(
                "Independent reproduction of the discovered relationship."
            );

        }

        if (
            revision.targetType === "THEORY"
        ) {

            evidence.push(
                "At least one adversarial test designed specifically to falsify the theory."
            );

        }

        return evidence;

    }

    private successCriteriaFor(
        revision: ScientificRevision
    ): string[] {

        return [

            "At least one new independent evidence source is introduced.",

            "The target receives new directly relevant evidence.",

            "The scientific assessment changes or receives stronger reproducible justification.",

            revision.action === "REFUTE_CANDIDATE"
                ? "The target is either reproducibly falsified or survives explicit falsification attempts."
                : "The target survives or fails an explicit adversarial retest."

        ];

    }

    private failureCriteriaFor(
        revision: ScientificRevision
    ): string[] {

        return [

            "Only duplicate evidence is discovered.",

            "No independent implementation can be evaluated.",

            "The experiment produces no directly relevant evidence.",

            "The result cannot be reproduced or traced to source evidence."

        ];

    }

    private countPriority(
        plans: ScientificRetestPlan[],
        priority:
            ScientificRetestPlan[
                "priority"
            ]
    ): number {

        return plans.filter(
            plan =>
                plan.priority === priority
        ).length;

    }

    private countTarget(
        plans: ScientificRetestPlan[],
        targetType:
            ScientificRetestPlan[
                "targetType"
            ]
    ): number {

        return plans.filter(
            plan =>
                plan.targetType === targetType
        ).length;

    }

    private priorityRank(
        priority:
            ScientificRetestPlan[
                "priority"
            ]
    ): number {

        switch (
            priority
        ) {

            case "CRITICAL":
                return 4;

            case "HIGH":
                return 3;

            case "MEDIUM":
                return 2;

            case "LOW":
                return 1;

        }

    }

}