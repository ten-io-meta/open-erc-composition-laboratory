import type {
    ScientificSelfCritiqueResult
} from "../scientific-self-critique/ScientificSelfCritiqueResult.js";

import type {
    ScientificCritique
} from "../scientific-self-critique/ScientificCritique.js";

import type {
    ScientificKnowledgeEvolutionResult
} from "../scientific-knowledge-evolution/ScientificKnowledgeEvolutionResult.js";

import type {
    ScientificRevision,
    ScientificRevisionAction
} from "./ScientificRevision.js";

import type {
    ScientificRevisionResult
} from "./ScientificRevisionResult.js";

export class ScientificRevisionEngine {

    build(
        campaignId: string,
        selfCritique: ScientificSelfCritiqueResult,
        knowledgeEvolution: ScientificKnowledgeEvolutionResult
    ): ScientificRevisionResult {

        try {

            const revisions: ScientificRevision[] = [];

            const grouped =
                this.groupCritiques(
                    selfCritique.critiques ?? []
                );

            let counter = 1;

            for (
                const critiques
                of grouped.values()
            ) {

                if (
                    critiques.length === 0
                ) {
                    continue;
                }

                const first =
                    critiques[0];

                const averageRobustnessScore =
                    this.average(
                        critiques.map(
                            critique =>
                                critique.robustnessScore
                        )
                    );

                const highestFalsificationRisk =
                    this.highestRisk(
                        critiques
                    );

                const action =
                    this.determineAction(
                        critiques,
                        averageRobustnessScore,
                        highestFalsificationRisk
                    );

                const reasons =
                    this.buildReasons(
                        critiques
                    );

                const requiresExperiment =
                    action === "RETEST" ||
                    action === "CHALLENGE" ||
                    action === "REFUTE_CANDIDATE";

                const requiresHumanReview =
                    action === "REFUTE_CANDIDATE";

                revisions.push({

                    revisionId:
                        `SCIENTIFIC-REVISION-${String(
                            counter++
                        ).padStart(5, "0")}`,

                    targetId:
                        first.targetId,

                        targetEvidenceIds:
    this.uniqueIds(
        critiques.flatMap(
            critique =>
                critique.targetEvidenceIds ?? []
        )
    ),

                    targetType:
                        first.targetType,

                    statement:
                        first.statement,

                    action,

                    priority:
                        this.priorityFor(
                            action,
                            critiques
                        ),

                    critiqueCount:
                        critiques.length,

                    averageRobustnessScore,

                    highestFalsificationRisk,

                    reasons,

                    sourceCritiqueIds:
                        critiques.map(
                            critique =>
                                critique.critiqueId
                        ),

                    requiresExperiment,

                    requiresHumanReview,

                    explanation:
                        `Revision decision ${action} was generated from ` +
                        `${critiques.length} scientific critique(s) with ` +
                        `average robustness ${averageRobustnessScore} and ` +
                        `highest falsification risk ${highestFalsificationRisk}.`

                });

            }

            /*
             * Knowledge without an active critique should remain visible
             * as an explicit KEEP decision.
             */

            const revisedKnowledgeIds =
                new Set(
                    revisions
                        .filter(
                            revision =>
                                revision.targetType ===
                                "KNOWLEDGE"
                        )
                        .map(
                            revision =>
                                revision.targetId
                        )
                );

            for (
                const state
                of knowledgeEvolution.states ?? []
            ) {

                if (
                    revisedKnowledgeIds.has(
                        state.knowledgeId
                    )
                ) {
                    continue;
                }

                revisions.push({

                    revisionId:
                        `SCIENTIFIC-REVISION-${String(
                            counter++
                        ).padStart(5, "0")}`,

                    targetId:
                        state.knowledgeId,

                        targetEvidenceIds:
    this.uniqueIds([
        ...(state.supportingEvidenceIds ?? []),
        ...(state.contradictoryEvidenceIds ?? [])
    ]),

targetType:
    "KNOWLEDGE",
                    statement:
                        state.statement,

                    action:
                        "KEEP",

                    priority:
                        "LOW",

                    critiqueCount:
                        0,

                    averageRobustnessScore:
                        100,

                    highestFalsificationRisk:
                        "LOW",

                    reasons: [
                        "No active scientific critique requires revision in the current campaign."
                    ],

                    sourceCritiqueIds: [],

                    requiresExperiment:
                        false,

                    requiresHumanReview:
                        false,

                    explanation:
                        "The knowledge state is retained because no active critique currently requires revision."

                });

            }

            revisions.sort(
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

                revisions,

                statistics: {

                    total:
                        revisions.length,

                    keep:
                        this.countAction(
                            revisions,
                            "KEEP"
                        ),

                    review:
                        this.countAction(
                            revisions,
                            "REVIEW"
                        ),

                    weaken:
                        this.countAction(
                            revisions,
                            "WEAKEN"
                        ),

                    challenge:
                        this.countAction(
                            revisions,
                            "CHALLENGE"
                        ),

                    retest:
                        this.countAction(
                            revisions,
                            "RETEST"
                        ),

                    refuteCandidate:
                        this.countAction(
                            revisions,
                            "REFUTE_CANDIDATE"
                        ),

                    requiringExperiment:
                        revisions.filter(
                            revision =>
                                revision.requiresExperiment
                        ).length,

                    requiringHumanReview:
                        revisions.filter(
                            revision =>
                                revision.requiresHumanReview
                        ).length

                },

                errors: []

            };

        } catch (error) {

            return {

                generatedAt:
                    new Date().toISOString(),

                campaignId,

                revisions: [],

                statistics: {

                    total: 0,

                    keep: 0,

                    review: 0,

                    weaken: 0,

                    challenge: 0,

                    retest: 0,

                    refuteCandidate: 0,

                    requiringExperiment: 0,

                    requiringHumanReview: 0

                },

                errors: [

                    error instanceof Error
                        ? error.message
                        : String(error)

                ]

            };

        }

    }

    private groupCritiques(
        critiques: ScientificCritique[]
    ): Map<string, ScientificCritique[]> {

        const grouped =
            new Map<
                string,
                ScientificCritique[]
            >();

        for (
            const critique
            of critiques
        ) {

            const key =
                `${critique.targetType}:${critique.targetId}`;

            const existing =
                grouped.get(
                    key
                ) ?? [];

            existing.push(
                critique
            );

            grouped.set(
                key,
                existing
            );

        }

        return grouped;

    }

    private determineAction(
        critiques: ScientificCritique[],
        robustness: number,
        risk:
            ScientificRevision[
                "highestFalsificationRisk"
            ]
    ): ScientificRevisionAction {

        if (
            critiques.some(
                critique =>
                    critique.severity ===
                    "CRITICAL"
            ) &&
            risk === "VERY_HIGH"
        ) {
            return "REFUTE_CANDIDATE";
        }

        if (
            critiques.some(
                critique =>
                    critique.critiqueType ===
                    "CONTRADICTORY_EVIDENCE"
            )
        ) {
            return "CHALLENGE";
        }

        if (
            critiques.some(
                critique =>
                    critique.critiqueType ===
                    "DISCOVERY_FALSE_POSITIVE_RISK" ||
                    critique.critiqueType ===
                    "INSUFFICIENT_DISCOVERY_EVIDENCE" ||
                    critique.critiqueType ===
                    "NO_ADVERSARIAL_VALIDATION"
            )
        ) {
            return "RETEST";
        }

        if (
            critiques.some(
                critique =>
                    critique.critiqueType ===
                    "DECLINING_EVIDENCE" ||
                    critique.critiqueType ===
                    "VOLATILE_EVIDENCE" ||
                    critique.critiqueType ===
                    "STATUS_CONFIDENCE_MISMATCH"
            )
        ) {
            return "WEAKEN";
        }

        if (
            robustness < 60 ||
            risk === "HIGH" ||
            risk === "VERY_HIGH"
        ) {
            return "CHALLENGE";
        }

        if (
            critiques.some(
                critique =>
                    critique.severity ===
                    "MEDIUM" ||
                    critique.severity ===
                    "HIGH"
            )
        ) {
            return "REVIEW";
        }

        return "KEEP";

    }

    private buildReasons(
        critiques: ScientificCritique[]
    ): string[] {

        return Array.from(
            new Set(
                critiques.flatMap(
                    critique => [
                        ...critique.evidence,
                        critique.recommendation
                    ]
                )
            )
        );

    }

    private highestRisk(
        critiques: ScientificCritique[]
    ): ScientificRevision[
        "highestFalsificationRisk"
    ] {

        const rank = {
            LOW: 1,
            MODERATE: 2,
            HIGH: 3,
            VERY_HIGH: 4
        };

        return critiques
            .map(
                critique =>
                    critique.falsificationRisk
            )
            .sort(
                (a, b) =>
                    rank[b] -
                    rank[a]
            )[0] ?? "LOW";

    }

    private priorityFor(
        action: ScientificRevisionAction,
        critiques: ScientificCritique[]
    ): ScientificRevision[
        "priority"
    ] {

        if (
            action === "REFUTE_CANDIDATE"
        ) {
            return "CRITICAL";
        }

        if (
            action === "CHALLENGE"
        ) {
            return "HIGH";
        }

        if (
            action === "RETEST" ||
            action === "WEAKEN"
        ) {
            return "MEDIUM";
        }

        if (
            critiques.some(
                critique =>
                    critique.severity ===
                    "HIGH"
            )
        ) {
            return "HIGH";
        }

        return "LOW";

    }

    private countAction(
        revisions: ScientificRevision[],
        action: ScientificRevisionAction
    ): number {

        return revisions.filter(
            revision =>
                revision.action === action
        ).length;

    }
    private uniqueIds(
    values: string[]
): string[] {

    return Array.from(
        new Set(
            values
                .filter(
                    value =>
                        typeof value === "string"
                )
                .map(
                    value =>
                        value.trim()
                )
                .filter(
                    value =>
                        value.length > 0
                )
        )
    );

}

    private average(
        values: number[]
    ): number {

        if (
            values.length === 0
        ) {
            return 0;
        }

        return Math.round(
            values.reduce(
                (sum, value) =>
                    sum + value,
                0
            ) /
            values.length
        );

    }

    private priorityRank(
        priority:
            ScientificRevision[
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