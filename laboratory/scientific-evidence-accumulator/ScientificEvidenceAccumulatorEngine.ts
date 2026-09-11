import type {
    ScientificKnowledgeEvolutionResult
} from "../scientific-knowledge-evolution/ScientificKnowledgeEvolutionResult.js";

import type {
    ScientificKnowledgeState
} from "../scientific-knowledge-evolution/ScientificKnowledgeState.js";

import type {
    ScientificEvidenceAccumulation
} from "./ScientificEvidenceAccumulation.js";

import type {
    ScientificEvidenceAccumulatorResult
} from "./ScientificEvidenceAccumulatorResult.js";

import type {
    ScientificEvidenceHistory,
    ScientificEvidenceMomentum,
    ScientificEvidenceSnapshot
} from "./ScientificEvidenceHistory.js";

export class ScientificEvidenceAccumulatorEngine {

    build(
        scientificEvolution:
            ScientificKnowledgeEvolutionResult,

        previousResult?:
            ScientificEvidenceAccumulatorResult | null
    ): ScientificEvidenceAccumulatorResult {

        try {

            const generatedAt =
                new Date().toISOString();

            const previousHistories =
                new Map<
                    string,
                    ScientificEvidenceHistory
                >(
                    (
                        previousResult?.histories ??
                        []
                    ).map(
                        history => [
                            history.knowledgeId,
                            history
                        ]
                    )
                );

            const histories:
                ScientificEvidenceHistory[] = [];

            const accumulations:
                ScientificEvidenceAccumulation[] = [];

            let counter = 1;

            for (
                const state
                of scientificEvolution.states ?? []
            ) {

                const previousHistory =
                    previousHistories.get(
                        state.knowledgeId
                    );

                const previousSnapshot =
                    previousHistory
                        ?.snapshots
                        ?.at(-1);

                const currentSnapshot =
                    this.snapshotFor(
                        scientificEvolution.campaignId,
                        generatedAt,
                        state
                    );

                const snapshots =
                    this.mergeSnapshots(
                        previousHistory?.snapshots ?? [],
                        currentSnapshot
                    );

                const evidenceTrend =
                    this.calculateTrend(
                        snapshots
                    );

                const stabilityScore =
                    this.calculateStabilityScore(
                        snapshots
                    );

                const longTermConfidenceGain =
                    this.longTermConfidenceGain(
                        snapshots
                    );

                const longTermSourceGain =
                    this.longTermSourceGain(
                        snapshots
                    );

                const longTermContradictionGrowth =
                    this.longTermContradictionGrowth(
                        snapshots
                    );

                const evidenceMomentum =
                    this.calculateMomentum(
                        snapshots,
                        evidenceTrend,
                        longTermConfidenceGain,
                        longTermSourceGain,
                        longTermContradictionGrowth
                    );

                const reliabilityScore =
                    this.calculateReliabilityScore(
                        snapshots,
                        stabilityScore,
                        evidenceTrend
                    );

                const predictionReady =
                    this.isPredictionReady(
                        snapshots,
                        reliabilityScore,
                        evidenceTrend,
                        evidenceMomentum
                    );

                const history:
                    ScientificEvidenceHistory = {

                    knowledgeId:
                        state.knowledgeId,

                    statement:
                        state.statement,

                    firstObservedAt:
                        previousHistory
                            ?.firstObservedAt ??
                        generatedAt,

                    lastObservedAt:
                        generatedAt,

                    snapshots,

                    totalCampaignsObserved:
                        snapshots.length,

                    highestConfidence:
                        Math.max(
                            ...snapshots.map(
                                snapshot =>
                                    snapshot.confidence
                            )
                        ),

                    lowestConfidence:
                        Math.min(
                            ...snapshots.map(
                                snapshot =>
                                    snapshot.confidence
                            )
                        ),

                    highestSourceCount:
                        Math.max(
                            ...snapshots.map(
                                snapshot =>
                                    snapshot
                                        .independentSources
                            )
                        ),

                    totalConfidenceGain:
                        snapshots.length > 1
                            ? snapshots.at(-1)!
                                .confidence -
                              snapshots[0]
                                .confidence
                            : 0,

                    totalSourceGain:
                        snapshots.length > 1
                            ? snapshots.at(-1)!
                                .independentSources -
                              snapshots[0]
                                .independentSources
                            : 0,

                    evidenceTrend,

                    stabilityScore,

                    longTermConfidenceGain,

                    longTermSourceGain,

                    longTermContradictionGrowth,

                    evidenceMomentum,

                    reliabilityScore,

                    predictionReady

                };

                histories.push(
                    history
                );

                const accumulationStatus =
                    this.accumulationStatusFor(
                        previousSnapshot,
                        currentSnapshot
                    );

                accumulations.push({

                    accumulationId:
                        `EVIDENCE-ACCUMULATION-${String(
                            counter++
                        ).padStart(5, "0")}`,

                    knowledgeId:
                        state.knowledgeId,

                    statement:
                        state.statement,

                    campaignId:
                        scientificEvolution
                            .campaignId,

                    previousConfidence:
                        previousSnapshot
                            ?.confidence ??
                        0,

                    currentConfidence:
                        currentSnapshot
                            .confidence,

                    confidenceDelta:
                        currentSnapshot
                            .confidence -
                        (
                            previousSnapshot
                                ?.confidence ??
                            0
                        ),

                    previousSources:
                        previousSnapshot
                            ?.independentSources ??
                        0,

                    currentSources:
                        currentSnapshot
                            .independentSources,

                    sourceDelta:
                        currentSnapshot
                            .independentSources -
                        (
                            previousSnapshot
                                ?.independentSources ??
                            0
                        ),

                    previousContradictions:
                        previousSnapshot
                            ?.contradictionCount ??
                        0,

                    currentContradictions:
                        currentSnapshot
                            .contradictionCount,

                    contradictionDelta:
                        currentSnapshot
                            .contradictionCount -
                        (
                            previousSnapshot
                                ?.contradictionCount ??
                            0
                        ),

                    evidenceTrend,

                    accumulationStatus,

                    explanation:
                        this.explanationFor(
                            accumulationStatus,
                            previousSnapshot,
                            currentSnapshot,
                            evidenceTrend,
                            evidenceMomentum,
                            reliabilityScore,
                            predictionReady
                        )

                });

            }

            histories.sort(
                (a, b) =>
                    b.reliabilityScore -
                    a.reliabilityScore ||
                    b.stabilityScore -
                    a.stabilityScore ||
                    b.highestConfidence -
                    a.highestConfidence
            );

            return {

                generatedAt,

                campaignId:
                    scientificEvolution
                        .campaignId,

                accumulations,

                histories,

                statistics: {

                    knowledgeTracked:
                        histories.length,

                    accumulations:
                        accumulations.length,

                    newEvidence:
                        this.countStatus(
                            accumulations,
                            "NEW_EVIDENCE"
                        ),

                    strengthened:
                        this.countStatus(
                            accumulations,
                            "EVIDENCE_STRENGTHENED"
                        ),

                    stable:
                        this.countStatus(
                            accumulations,
                            "EVIDENCE_STABLE"
                        ),

                    weakened:
                        this.countStatus(
                            accumulations,
                            "EVIDENCE_WEAKENED"
                        ),

                    conflicted:
                        this.countStatus(
                            accumulations,
                            "EVIDENCE_CONFLICTED"
                        ),

                    growingTrends:
                        histories.filter(
                            history =>
                                history.evidenceTrend ===
                                "GROWING"
                        ).length,

                    stableTrends:
                        histories.filter(
                            history =>
                                history.evidenceTrend ===
                                "STABLE"
                        ).length,

                    decliningTrends:
                        histories.filter(
                            history =>
                                history.evidenceTrend ===
                                "DECLINING"
                        ).length,

                    volatileTrends:
                        histories.filter(
                            history =>
                                history.evidenceTrend ===
                                "VOLATILE"
                        ).length,

                    averageStabilityScore:
                        this.average(
                            histories.map(
                                history =>
                                    history
                                        .stabilityScore
                            )
                        )

                },

                errors: []

            };

        } catch (error) {

            return {

                generatedAt:
                    new Date().toISOString(),

                campaignId:
                    scientificEvolution
                        .campaignId,

                accumulations: [],

                histories: [],

                statistics: {
                    knowledgeTracked: 0,
                    accumulations: 0,
                    newEvidence: 0,
                    strengthened: 0,
                    stable: 0,
                    weakened: 0,
                    conflicted: 0,
                    growingTrends: 0,
                    stableTrends: 0,
                    decliningTrends: 0,
                    volatileTrends: 0,
                    averageStabilityScore: 0
                },

                errors: [
                    error instanceof Error
                        ? error.message
                        : "Unknown scientific evidence accumulation error"
                ]

            };

        }

    }

    private snapshotFor(
        campaignId: string,
        observedAt: string,
        state:
            ScientificKnowledgeState
    ): ScientificEvidenceSnapshot {

        return {

            campaignId,

            observedAt,

            status:
                state.status,

            confidence:
                state.confidence,

            independentSources:
                state.independentSources,

            contradictionCount:
                state.contradictionCount,

            validationStatus:
                state.validationStatus

        };

    }

    private mergeSnapshots(
        previousSnapshots:
            ScientificEvidenceSnapshot[],

        currentSnapshot:
            ScientificEvidenceSnapshot
    ): ScientificEvidenceSnapshot[] {

        const withoutCurrentCampaign =
            previousSnapshots.filter(
                snapshot =>
                    snapshot.campaignId !==
                    currentSnapshot.campaignId
            );

        return [
            ...withoutCurrentCampaign,
            currentSnapshot
        ].slice(-100);

    }

    private accumulationStatusFor(
        previous:
            ScientificEvidenceSnapshot | undefined,

        current:
            ScientificEvidenceSnapshot
    ):
        ScientificEvidenceAccumulation[
            "accumulationStatus"
        ] {

        if (!previous) {
            return "NEW_EVIDENCE";
        }

        if (
            current.contradictionCount >
            previous.contradictionCount
        ) {
            return "EVIDENCE_CONFLICTED";
        }

        if (
            current.confidence >
            previous.confidence ||
            current.independentSources >
            previous.independentSources
        ) {
            return "EVIDENCE_STRENGTHENED";
        }

        if (
            current.confidence <
            previous.confidence ||
            current.independentSources <
            previous.independentSources
        ) {
            return "EVIDENCE_WEAKENED";
        }

        return "EVIDENCE_STABLE";

    }

    private calculateTrend(
        snapshots:
            ScientificEvidenceSnapshot[]
    ):
        ScientificEvidenceHistory[
            "evidenceTrend"
        ] {

        if (
            snapshots.length < 2
        ) {
            return "INSUFFICIENT_DATA";
        }

        const recent =
            snapshots.slice(-5);

        let increases = 0;
        let decreases = 0;
        let stable = 0;

        for (
            let index = 1;
            index < recent.length;
            index++
        ) {

            const previous =
                recent[index - 1];

            const current =
                recent[index];

            const confidenceDelta =
                current.confidence -
                previous.confidence;

            const sourceDelta =
                current.independentSources -
                previous.independentSources;

            const contradictionDelta =
                current.contradictionCount -
                previous.contradictionCount;

            if (
                contradictionDelta > 0
            ) {

                decreases++;
                continue;

            }

            if (
                confidenceDelta > 0 ||
                sourceDelta > 0
            ) {

                increases++;

            } else if (
                confidenceDelta < 0 ||
                sourceDelta < 0
            ) {

                decreases++;

            } else {

                stable++;

            }

        }

        if (
            increases > 0 &&
            decreases > 0
        ) {
            return "VOLATILE";
        }

        if (
            increases > decreases &&
            increases >= stable
        ) {
            return "GROWING";
        }

        if (
            decreases > increases &&
            decreases >= stable
        ) {
            return "DECLINING";
        }

        return "STABLE";

    }

    private calculateStabilityScore(
        snapshots:
            ScientificEvidenceSnapshot[]
    ): number {

        if (
            snapshots.length === 0
        ) {
            return 0;
        }

        if (
            snapshots.length === 1
        ) {
            return 25;
        }

        let score = 100;

        for (
            let index = 1;
            index < snapshots.length;
            index++
        ) {

            const previous =
                snapshots[index - 1];

            const current =
                snapshots[index];

            score -= Math.min(
                20,
                Math.abs(
                    current.confidence -
                    previous.confidence
                )
            );

            score -= Math.min(
                15,
                Math.abs(
                    current.independentSources -
                    previous.independentSources
                ) * 3
            );

            score -= Math.min(
                25,
                Math.abs(
                    current.contradictionCount -
                    previous.contradictionCount
                ) * 10
            );

            if (
                current.status !==
                previous.status
            ) {
                score -= 10;
            }

        }

        score += Math.min(
            20,
            snapshots.length * 2
        );

        return this.clamp(
            score
        );

    }

    private longTermConfidenceGain(
        snapshots:
            ScientificEvidenceSnapshot[]
    ): number {

        if (
            snapshots.length < 2
        ) {
            return 0;
        }

        return (
            snapshots.at(-1)!.confidence -
            snapshots[0].confidence
        );

    }

    private longTermSourceGain(
        snapshots:
            ScientificEvidenceSnapshot[]
    ): number {

        if (
            snapshots.length < 2
        ) {
            return 0;
        }

        return (
            snapshots.at(-1)!
                .independentSources -
            snapshots[0]
                .independentSources
        );

    }

    private longTermContradictionGrowth(
        snapshots:
            ScientificEvidenceSnapshot[]
    ): number {

        if (
            snapshots.length < 2
        ) {
            return 0;
        }

        return (
            snapshots.at(-1)!
                .contradictionCount -
            snapshots[0]
                .contradictionCount
        );

    }

    private calculateMomentum(
        snapshots:
            ScientificEvidenceSnapshot[],

        trend:
            ScientificEvidenceHistory[
                "evidenceTrend"
            ],

        confidenceGain:
            number,

        sourceGain:
            number,

        contradictionGrowth:
            number
    ): ScientificEvidenceMomentum {

        if (
            contradictionGrowth > 0 ||
            trend === "DECLINING"
        ) {
            return "DECLINING";
        }

        if (
            snapshots.length < 2
        ) {
            return "WEAK";
        }

        if (
            confidenceGain >= 15 ||
            sourceGain >= 3
        ) {
            return "VERY_STRONG";
        }

        if (
            confidenceGain >= 8 ||
            sourceGain >= 2 ||
            trend === "GROWING"
        ) {
            return "STRONG";
        }

        if (
            confidenceGain > 0 ||
            sourceGain > 0
        ) {
            return "NORMAL";
        }

        if (
            trend === "STABLE" &&
            snapshots.length >= 3
        ) {
            return "NORMAL";
        }

        return "WEAK";

    }

    private calculateReliabilityScore(
        snapshots:
            ScientificEvidenceSnapshot[],

        stabilityScore:
            number,

        trend:
            ScientificEvidenceHistory[
                "evidenceTrend"
            ]
    ): number {

        if (
            snapshots.length === 0
        ) {
            return 0;
        }

        const latest =
            snapshots.at(-1)!;

        let score = 0;

        score +=
            latest.confidence * 0.4;

        score +=
            stabilityScore * 0.25;

        score +=
            Math.min(
                20,
                latest.independentSources * 5
            );

        score +=
            Math.min(
                10,
                snapshots.length * 2
            );

        if (
            latest.validationStatus ===
            "VALIDATED"
        ) {
            score += 10;
        }

        if (
            trend === "GROWING"
        ) {
            score += 5;
        }

        if (
            trend === "DECLINING"
        ) {
            score -= 15;
        }

        if (
            trend === "VOLATILE"
        ) {
            score -= 10;
        }

        score -=
            Math.min(
                30,
                latest.contradictionCount * 10
            );

        return this.clamp(
            score
        );

    }

    private isPredictionReady(
        snapshots:
            ScientificEvidenceSnapshot[],

        reliabilityScore:
            number,

        trend:
            ScientificEvidenceHistory[
                "evidenceTrend"
            ],

        momentum:
            ScientificEvidenceMomentum
    ): boolean {

        if (
            snapshots.length < 3
        ) {
            return false;
        }

        const latest =
            snapshots.at(-1)!;

        if (
            reliabilityScore < 75
        ) {
            return false;
        }

        if (
            latest.confidence < 75
        ) {
            return false;
        }

        if (
            latest.independentSources < 2
        ) {
            return false;
        }

        if (
            latest.contradictionCount > 0
        ) {
            return false;
        }

        if (
            trend === "DECLINING" ||
            trend === "VOLATILE"
        ) {
            return false;
        }

        if (
            momentum === "DECLINING"
        ) {
            return false;
        }

        return true;

    }

    private explanationFor(
        status:
            ScientificEvidenceAccumulation[
                "accumulationStatus"
            ],

        previous:
            ScientificEvidenceSnapshot | undefined,

        current:
            ScientificEvidenceSnapshot,

        trend:
            ScientificEvidenceHistory[
                "evidenceTrend"
            ],

        momentum:
            ScientificEvidenceMomentum,

        reliabilityScore:
            number,

        predictionReady:
            boolean
    ): string {

        const scientificContext =
            `Trend: ${trend}. ` +
            `Momentum: ${momentum}. ` +
            `Reliability: ${reliabilityScore}. ` +
            `Prediction ready: ${predictionReady}.`;

        switch (status) {

            case "NEW_EVIDENCE":

                return (
                    `Evidence observed for the first time with ` +
                    `${current.independentSources} independent source(s) ` +
                    `and confidence ${current.confidence}. ` +
                    scientificContext
                );

            case "EVIDENCE_STRENGTHENED":

                return (
                    `Evidence strengthened from confidence ` +
                    `${previous?.confidence ?? 0} to ` +
                    `${current.confidence} and from ` +
                    `${previous?.independentSources ?? 0} to ` +
                    `${current.independentSources} independent source(s). ` +
                    scientificContext
                );

            case "EVIDENCE_WEAKENED":

                return (
                    `Evidence weakened from confidence ` +
                    `${previous?.confidence ?? 0} to ` +
                    `${current.confidence}, or lost independent source support. ` +
                    scientificContext
                );

            case "EVIDENCE_CONFLICTED":

                return (
                    `Contradictory evidence increased from ` +
                    `${previous?.contradictionCount ?? 0} to ` +
                    `${current.contradictionCount}. ` +
                    scientificContext
                );

            case "EVIDENCE_STABLE":

                return (
                    `Evidence remains stable at confidence ` +
                    `${current.confidence} with ` +
                    `${current.independentSources} independent source(s). ` +
                    scientificContext
                );

        }

    }

    private countStatus(
        accumulations:
            ScientificEvidenceAccumulation[],

        status:
            ScientificEvidenceAccumulation[
                "accumulationStatus"
            ]
    ): number {

        return accumulations.filter(
            accumulation =>
                accumulation
                    .accumulationStatus ===
                status
        ).length;

    }

    private clamp(
        value: number
    ): number {

        return Math.max(
            0,
            Math.min(
                100,
                Math.round(value)
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

}