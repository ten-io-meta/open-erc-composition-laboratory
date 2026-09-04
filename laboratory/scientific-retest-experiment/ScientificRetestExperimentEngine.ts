import type {
    AutonomousExperiment
} from "../autonomous-experiment-design/AutonomousExperiment.js";

import type {
    ScientificRetestPlan
} from "../scientific-retest-planner/ScientificRetestPlan.js";

import type {
    ScientificRetestPlannerResult
} from "../scientific-retest-planner/ScientificRetestPlannerResult.js";

import type {
    ScientificRetestExperimentResult
} from "./ScientificRetestExperimentResult.js";

export class ScientificRetestExperimentEngine {

    build(
        campaignId: string,
        retestPlanner:
            ScientificRetestPlannerResult
    ): ScientificRetestExperimentResult {

        try {

            const experiments:
                AutonomousExperiment[] = [];

            for (
                const plan
                of retestPlanner.plans ?? []
            ) {

                if (
                    !plan.experimentRequired
                ) {
                    continue;
                }

                experiments.push(
                    this.buildExperiment(
                        plan
                    )
                );

            }

            const deduplicated =
                this.deduplicate(
                    experiments
                );

            const prioritized =
                deduplicated.sort(
                    (a, b) =>
                        this.priorityWeight(
                            b.priority
                        ) -
                        this.priorityWeight(
                            a.priority
                        ) ||
                        b.estimatedKnowledgeGain -
                        a.estimatedKnowledgeGain
                );

            return {

                generatedAt:
                    new Date().toISOString(),

                campaignId,

                experiments:
                    prioritized,

                statistics: {

                    experiments:
                        prioritized.length,

                    theoryExperiments:
                        this.countByPrefix(
                            prioritized,
                            "THEORY:"
                        ),

                    discoveryExperiments:
                        this.countByPrefix(
                            prioritized,
                            "DISCOVERY:"
                        ),

                    knowledgeExperiments:
                        this.countByPrefix(
                            prioritized,
                            "KNOWLEDGE:"
                        ),

                    evidenceHistoryExperiments:
                        this.countByPrefix(
                            prioritized,
                            "EVIDENCE_HISTORY:"
                        ),

                    highPriority:
                        prioritized.filter(
                            experiment =>
                                experiment.priority ===
                                "HIGH"
                        ).length,

                    mediumPriority:
                        prioritized.filter(
                            experiment =>
                                experiment.priority ===
                                "MEDIUM"
                        ).length,

                    lowPriority:
                        prioritized.filter(
                            experiment =>
                                experiment.priority ===
                                "LOW"
                        ).length,

                    averageExpectedKnowledgeGain:
                        this.average(
                            prioritized.map(
                                experiment =>
                                    experiment.estimatedKnowledgeGain
                            )
                        )

                },

                errors: []

            };

        } catch (error) {

            return {

                generatedAt:
                    new Date().toISOString(),

                campaignId,

                experiments: [],

                statistics: {

                    experiments: 0,

                    theoryExperiments: 0,

                    discoveryExperiments: 0,

                    knowledgeExperiments: 0,

                    evidenceHistoryExperiments: 0,

                    highPriority: 0,

                    mediumPriority: 0,

                    lowPriority: 0,

                    averageExpectedKnowledgeGain: 0

                },

                errors: [

                    error instanceof Error
                        ? error.message
                        : String(error)

                ]

            };

        }

    }

    private buildExperiment(
        plan:
            ScientificRetestPlan
    ): AutonomousExperiment {

        return {

            experimentId:
                `RETEST-EXPERIMENT-${plan.retestPlanId}`,

            title:
                this.titleFor(
                    plan
                ),

            objective:
                plan.objective,

            targetType:
                this.targetTypeFor(
                    plan
                ),

            /*
             * Prefix preserves the original scientific
             * target type without changing the existing
             * AutonomousExperiment interface.
             */

            targetId:
    `${plan.targetType}:${plan.targetId}`,

sourceIds:
    [],

targetEvidenceIds:
    [...(plan.targetEvidenceIds ?? [])],

hypothesis:
    plan.hypothesis,

supportCondition:
    "The retested scientific claim is supported when independent " +
    "executable evidence reproducibly confirms behavior consistent " +
    "with the hypothesis.",

challengeCondition:
    "The retested scientific claim is challenged when independent " +
    "executable evidence reproducibly demonstrates behavior " +
    "incompatible with the hypothesis.",

priority:
    this.priorityFor(
        plan.priority
    ),

requiredEvidence:
    [
        ...plan.requiredEvidence
    ],

            recommendedRepositories:
                this.repositoriesFor(
                    plan
                ),

            variables: {

                independent: [

                    "Independent implementation source",

                    "Adversarial evidence source",

                    "Protocol implementation variant",

                    "Repository under evaluation"

                ],

                dependent: [

                    "Scientific robustness score",

                    "Falsification outcome",

                    "Independent evidence count",

                    "Scientific revision decision"

                ],

                controlled: [

                    "OECL normalization rules",

                    "Evidence extraction rules",

                    "Confidence thresholds",

                    "Scientific critique criteria",

                    "Revision decision rules"

                ]

            },

            procedure: [

                "Select at least one independent source not responsible for the original evidence.",

                "Ingest and normalize the selected source through the OECL source pipeline.",

                ...plan.falsificationStrategy,

                "Regenerate relevant evidence and scientific assessments.",

                "Run scientific self-critique again for the target.",

                "Generate a new scientific revision decision.",

                "Compare the new revision with the revision that triggered this retest."

            ],

            successCriteria:
                [
                    ...plan.successCriteria
                ],

            failureCriteria:
                [
                    ...plan.failureCriteria
                ],

            expectedOutcome:
                this.expectedOutcomeFor(
                    plan
                ),

            estimatedKnowledgeGain:
                this.knowledgeGainFor(
                    plan
                )

        };

    }

    private targetTypeFor(
        plan:
            ScientificRetestPlan
    ): AutonomousExperiment[
        "targetType"
    ] {

        switch (
            plan.targetType
        ) {

            case "THEORY":

                return "THEORY_VALIDATION";

            case "DISCOVERY":

                return "CONFIDENCE_IMPROVEMENT";

            case "KNOWLEDGE":

                return "CONFIDENCE_IMPROVEMENT";

            case "EVIDENCE_HISTORY":

                return "CONFIDENCE_IMPROVEMENT";

        }

    }

    private titleFor(
        plan:
            ScientificRetestPlan
    ): string {

        switch (
            plan.targetType
        ) {

            case "THEORY":

                return (
                    `Adversarial retest of theory ${plan.targetId}`
                );

            case "DISCOVERY":

                return (
                    `Reproduce scientific discovery ${plan.targetId}`
                );

            case "KNOWLEDGE":

                return (
                    `Retest scientific knowledge ${plan.targetId}`
                );

            case "EVIDENCE_HISTORY":

                return (
                    `Retest evidence history ${plan.targetId}`
                );

        }

    }

    private expectedOutcomeFor(
        plan:
            ScientificRetestPlan
    ): string {

        if (
            plan.triggerAction ===
            "REFUTE_CANDIDATE"
        ) {

            return (
                "The experiment should determine whether the target can be " +
                "reproducibly falsified before any rejection decision is accepted."
            );

        }

        if (
            plan.triggerAction ===
            "CHALLENGE"
        ) {

            return (
                "The experiment should resolve or better characterize the " +
                "scientific challenge using independent adversarial evidence."
            );

        }

        return (
            "The experiment should determine whether the target survives " +
            "independent reproduction and explicit falsification attempts."
        );

    }

private repositoriesFor(
    plan: ScientificRetestPlan
): string[] {

    const normalized =
        (
            plan.statement +
            " " +
            plan.objective
        ).toLowerCase();

    const repositories =
        new Set<string>();

    /*
     * Reservation/accounting experiments should prioritize
     * the domain-specific ERC8060 implementation.
     */
    if (
        normalized.includes("reservation") ||
        normalized.includes("reserve") ||
        normalized.includes("accounting") ||
        normalized.includes("locked value") ||
        normalized.includes("available value") ||
        normalized.includes("settlement")
    ) {

        repositories.add(
            "ten-io-meta/erc8060-reservable"
        );

        repositories.add(
            "OpenZeppelin/openzeppelin-contracts"
        );

        repositories.add(
            "Vectorized/solady"
        );

        repositories.add(
            "transmissions11/solmate"
        );

    }

    if (
        normalized.includes("transfer") ||
        normalized.includes("mint") ||
        normalized.includes("burn")
    ) {

        repositories.add(
            "OpenZeppelin/openzeppelin-contracts"
        );

        repositories.add(
            "Vectorized/solady"
        );

        repositories.add(
            "transmissions11/solmate"
        );

    }

    if (
        normalized.includes("invariant") ||
        normalized.includes("safety") ||
        normalized.includes("validation") ||
        normalized.includes("testing")
    ) {

        /*
         * Keep the domain implementation first when the
         * scientific statement is also reservation/accounting
         * related.
         */
        if (
            normalized.includes("reservation") ||
            normalized.includes("accounting")
        ) {
            repositories.add(
                "ten-io-meta/erc8060-reservable"
            );
        }

        repositories.add(
            "OpenZeppelin/openzeppelin-contracts"
        );

        repositories.add(
            "Vectorized/solady"
        );

        repositories.add(
            "transmissions11/solmate"
        );

    }

    if (
        normalized.includes("standard") ||
        normalized.includes("composition") ||
        normalized.includes("interoperability")
    ) {

        repositories.add(
            "ethereum/EIPs"
        );

        repositories.add(
            "ethereum/ERCs"
        );

        repositories.add(
            "OpenZeppelin/openzeppelin-contracts"
        );

    }

    if (
        repositories.size === 0
    ) {

        repositories.add(
            "ten-io-meta/erc8060-reservable"
        );

        repositories.add(
            "OpenZeppelin/openzeppelin-contracts"
        );

        repositories.add(
            "Vectorized/solady"
        );

        repositories.add(
            "transmissions11/solmate"
        );

    }

    return [
        ...repositories
    ].slice(
        0,
        5
    );

}

    private priorityFor(
        priority:
            ScientificRetestPlan[
                "priority"
            ]
    ): AutonomousExperiment[
        "priority"
    ] {

        switch (
            priority
        ) {

            case "CRITICAL":
                return "HIGH";

            case "HIGH":
                return "HIGH";

            case "MEDIUM":
                return "MEDIUM";

            case "LOW":
                return "LOW";

        }

    }

    private knowledgeGainFor(
        plan:
            ScientificRetestPlan
    ): number {

        let score = 50;

        switch (
            plan.priority
        ) {

            case "CRITICAL":
                score += 35;
                break;

            case "HIGH":
                score += 25;
                break;

            case "MEDIUM":
                score += 15;
                break;

            case "LOW":
                score += 5;
                break;

        }

        switch (
            plan.triggerAction
        ) {

            case "REFUTE_CANDIDATE":
                score += 15;
                break;

            case "CHALLENGE":
                score += 10;
                break;

            case "RETEST":
                score += 5;
                break;

        }

        return Math.min(
            100,
            score
        );

    }

    private deduplicate(
        experiments:
            AutonomousExperiment[]
    ): AutonomousExperiment[] {

        const unique =
            new Map<
                string,
                AutonomousExperiment
            >();

        for (
            const experiment
            of experiments
        ) {

            const key =
                `${experiment.targetType}:${experiment.targetId}`;

            const existing =
                unique.get(
                    key
                );

            if (
                !existing ||
                experiment.estimatedKnowledgeGain >
                existing.estimatedKnowledgeGain
            ) {

                unique.set(
                    key,
                    experiment
                );

            }

        }

        return [
            ...unique.values()
        ];

    }

    private countByPrefix(
        experiments:
            AutonomousExperiment[],
        prefix:
            string
    ): number {

        return experiments.filter(
            experiment =>
                experiment.targetId.startsWith(
                    prefix
                )
        ).length;

    }

    private priorityWeight(
        priority:
            AutonomousExperiment[
                "priority"
            ]
    ): number {

        switch (
            priority
        ) {

            case "HIGH":
                return 3;

            case "MEDIUM":
                return 2;

            case "LOW":
                return 1;

        }

    }

    private average(
        values:
            number[]
    ): number {

        if (
            values.length === 0
        ) {
            return 0;
        }

        return Math.round(
            values.reduce(
                (
                    sum,
                    value
                ) =>
                    sum + value,
                0
            ) /
            values.length
        );

    }

}