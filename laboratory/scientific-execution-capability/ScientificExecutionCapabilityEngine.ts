import type {
    ScientificExperimentExecutionResult
} from "../scientific-experiment-execution/ScientificExperimentExecutionResult.js";

import type {
    ScientificExperimentExecutionTask
} from "../scientific-experiment-execution/ScientificExperimentExecutionTask.js";

import type {
    ScientificExecutionCapability,
    ScientificExecutionCapabilityType
} from "./ScientificExecutionCapability.js";

import type {
    ScientificExecutionCapabilityResult
} from "./ScientificExecutionCapabilityResult.js";

export class ScientificExecutionCapabilityEngine {

    build(
        campaignId: string,
        execution:
            ScientificExperimentExecutionResult
    ): ScientificExecutionCapabilityResult {

        try {

            const capabilities:
                ScientificExecutionCapability[] = [];

            let counter = 1;

            for (
                const task
                of execution.tasks ?? []
            ) {

                if (
                    task.executionStatus !==
                    "READY"
                ) {
                    continue;
                }

                const classification =
                    this.classify(
                        task
                    );

                capabilities.push({

                    capabilityId:
                        `SCIENTIFIC-EXECUTION-CAPABILITY-${String(
                            counter++
                        ).padStart(5, "0")}`,

                    executionTaskId:
                        task.executionTaskId,

                    experimentId:
                        task.experimentId,

                    targetId:
                        task.targetId,

                        targetEvidenceIds:
    task.targetEvidenceIds,

                    capability:
                        classification.capability,

                    confidence:
                        classification.confidence,

                    reasons:
                        classification.reasons,

                    recommendedTools:
                        this.toolsFor(
                            classification.capability
                        )

                });

            }

            return {

                generatedAt:
                    new Date().toISOString(),

                campaignId,

                capabilities,

                statistics: {

                    total:
                        capabilities.length,

                    staticAnalysis:
                        this.countCapability(
                            capabilities,
                            "STATIC_ANALYSIS"
                        ),

                    testExecution:
                        this.countCapability(
                            capabilities,
                            "TEST_EXECUTION"
                        ),

                    invariantValidation:
                        this.countCapability(
                            capabilities,
                            "INVARIANT_VALIDATION"
                        ),

                    sourceReingestion:
                        this.countCapability(
                            capabilities,
                            "SOURCE_REINGESTION"
                        ),

                    manualReview:
                        this.countCapability(
                            capabilities,
                            "MANUAL_REVIEW"
                        ),

                    averageConfidence:
                        this.average(
                            capabilities.map(
                                item =>
                                    item.confidence
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

                capabilities: [],

                statistics: {

                    total: 0,

                    staticAnalysis: 0,

                    testExecution: 0,

                    invariantValidation: 0,

                    sourceReingestion: 0,

                    manualReview: 0,

                    averageConfidence: 0

                },

                errors: [

                    error instanceof Error
                        ? error.message
                        : String(error)

                ]

            };

        }

    }

    private classify(
        task:
            ScientificExperimentExecutionTask
    ): {

        capability:
            ScientificExecutionCapabilityType;

        confidence:
            number;

        reasons:
            string[];

    } {

        const text =
            [
                task.title,
                task.targetType,
                task.targetId,
                ...task.procedure,
                ...task.requiredEvidence,
                ...task.successCriteria,
                ...task.failureCriteria
            ]
                .join(" ")
                .toLowerCase();

        const scores:
            Record<
                ScientificExecutionCapabilityType,
                number
            > = {

                STATIC_ANALYSIS: 0,

                TEST_EXECUTION: 0,

                INVARIANT_VALIDATION: 0,

                SOURCE_REINGESTION: 0,

                MANUAL_REVIEW: 0

            };

        const reasons:
            Record<
                ScientificExecutionCapabilityType,
                string[]
            > = {

                STATIC_ANALYSIS: [],

                TEST_EXECUTION: [],

                INVARIANT_VALIDATION: [],

                SOURCE_REINGESTION: [],

                MANUAL_REVIEW: []

            };

        this.scoreIfPresent(
            text,
            [
                "slither",
                "static analysis",
                "code-level evidence",
                "inspect behavior"
            ],
            scores,
            reasons,
            "STATIC_ANALYSIS",
            "The task references code inspection or static-analysis-oriented evidence."
        );

        this.scoreIfPresent(
            text,
            [
                "test",
                "tests",
                "execute",
                "execution",
                "reproduce",
                "reproducible"
            ],
            scores,
            reasons,
            "TEST_EXECUTION",
            "The task requires executable or reproducible test behavior."
        );

        this.scoreIfPresent(
            text,
            [
                "invariant",
                "invariants",
                "safety",
                "accounting invariant"
            ],
            scores,
            reasons,
            "INVARIANT_VALIDATION",
            "The task explicitly depends on invariant or safety validation."
        );

        this.scoreIfPresent(
            text,
            [
                "ingest",
                "ingestion",
                "repository",
                "source",
                "independent source",
                "normalize"
            ],
            scores,
            reasons,
            "SOURCE_REINGESTION",
            "The task requires ingestion or re-ingestion of independent sources."
        );

        this.scoreIfPresent(
            text,
            [
                "manual",
                "human review",
                "context-dependent",
                "interpretation"
            ],
            scores,
            reasons,
            "MANUAL_REVIEW",
            "The task contains evidence that may require contextual or manual interpretation."
        );

        const ordered =
            (
                Object.entries(
                    scores
                ) as Array<
                    [
                        ScientificExecutionCapabilityType,
                        number
                    ]
                >
            )
                .sort(
                    (a, b) =>
                        b[1] -
                        a[1]
                );

        const [
            rankedCapability
        ] =
            ordered[0];

        const toolingRepositories =
            new Set([
                "foundry-rs/foundry",
                "crytic/slither",
                "crytic/echidna"
            ]);

        const hasExecutableTargetRepository =
            (
                task.recommendedRepositories ??
                []
            ).some(
                repository =>
                    !toolingRepositories.has(
                        repository
                    )
            );

    const preferredAutonomousCapability:
    ScientificExecutionCapabilityType | null =
        task.origin === "AUTONOMOUS"
            ? (
                task.targetType === "KNOWLEDGE_GAP" &&
                scores.SOURCE_REINGESTION > 0
                    ? "SOURCE_REINGESTION"

                    : hasExecutableTargetRepository &&
                      scores.INVARIANT_VALIDATION > 0
                        ? "INVARIANT_VALIDATION"

                        : hasExecutableTargetRepository &&
                          scores.STATIC_ANALYSIS > 0
                            ? "STATIC_ANALYSIS"

                            : hasExecutableTargetRepository &&
                              scores.TEST_EXECUTION > 0
                                ? "TEST_EXECUTION"

                                : scores.SOURCE_REINGESTION > 0
                                    ? "SOURCE_REINGESTION"

                                    : null
            )
            : null;

        const capability:
            ScientificExecutionCapabilityType =
                preferredAutonomousCapability ??
                rankedCapability;

        const topScore =
            scores[
                capability
            ];

        const totalScore =
            ordered.reduce(
                (
                    sum,
                    item
                ) =>
                    sum + item[1],
                0
            );

        if (
            topScore === 0
        ) {

            return {

                capability:
                    "MANUAL_REVIEW",

                confidence:
                    40,

                reasons: [
                    "No specific automated execution capability could be inferred from the task metadata."
                ]

            };

        }

        const confidence =
            Math.max(
                50,
                Math.min(
                    100,
                    Math.round(
                        (
                            topScore /
                            Math.max(
                                1,
                                totalScore
                            )
                        ) *
                        100
                    )
                )
            );

        return {

            capability,

            confidence,

            reasons:
                reasons[
                    capability
                ]

        };

    }

    private scoreIfPresent(
        text:
            string,
        keywords:
            string[],
        scores:
            Record<
                ScientificExecutionCapabilityType,
                number
            >,
        reasons:
            Record<
                ScientificExecutionCapabilityType,
                string[]
            >,
        capability:
            ScientificExecutionCapabilityType,
        reason:
            string
    ): void {

        let matches = 0;

        for (
            const keyword
            of keywords
        ) {

            if (
                text.includes(
                    keyword
                )
            ) {

                matches++;

            }

        }

        if (
            matches === 0
        ) {
            return;
        }

        scores[
            capability
        ] += matches;

        reasons[
            capability
        ].push(
            reason
        );

    }

    private toolsFor(
        capability:
            ScientificExecutionCapabilityType
    ): string[] {

        switch (
            capability
        ) {

            case "STATIC_ANALYSIS":

                return [
                    "Slither",
                    "repository source inspection"
                ];

            case "TEST_EXECUTION":

                return [
                    "Foundry",
                    "Hardhat"
                ];

            case "INVARIANT_VALIDATION":

                return [
                    "Foundry invariant testing",
                    "Echidna"
                ];

            case "SOURCE_REINGESTION":

                return [
                    "OECL SourcePipeline",
                    "GitHub ingestion"
                ];

            case "MANUAL_REVIEW":

                return [
                    "Human scientific review"
                ];

        }

    }

    private countCapability(
        capabilities:
            ScientificExecutionCapability[],
        capability:
            ScientificExecutionCapabilityType
    ): number {

        return capabilities.filter(
            item =>
                item.capability ===
                capability
        ).length;

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