import type {
    KnowledgeConsolidationResult
} from "../knowledge-consolidation/KnowledgeConsolidationResult.js";

import type {
    ScientificValidationResult
} from "../scientific-validation/ScientificValidationResult.js";

import type {
    ScientificConsensusResult
} from "../scientific-consensus/ScientificConsensusResult.js";

import type {
    ScientificKnowledgeEvolution
} from "./ScientificKnowledgeEvolution.js";

import type {
    ScientificKnowledgeEvolutionResult
} from "./ScientificKnowledgeEvolutionResult.js";

import type {
    ScientificConfidenceTrend,
    ScientificEvolutionVelocity,
    ScientificKnowledgeMaturity,
    ScientificKnowledgeState,
    ScientificKnowledgeStatus
} from "./ScientificKnowledgeState.js";

interface ScientificKnowledgeProvenance {
    sourceConclusionId: string;
    sourcePatternId: string;
    sourcePatternRelation: string;
    originTargetId: string;
}

const LEGACY_SCIENTIFIC_KNOWLEDGE_PROVENANCE:
    Readonly<
        Record<
            string,
            ScientificKnowledgeProvenance
        >
    > = {

    "EMBEDDED-VALUE-APPEARS-TO-ENABLE-RESERVATION": {
        sourceConclusionId:
            "CONCLUSION-00001",

        sourcePatternId:
            "CROSS-PATTERN-00005",

        sourcePatternRelation:
            "EMBEDDEDVALUE:ENABLES:RESERVATION",

        originTargetId:
            "CONCLUSION:CONCLUSION-00001"
    },

    "DETERMINISTIC-EXECUTION-APPEARS-TO-REQUIRE-ACCOUNTING": {
        sourceConclusionId:
            "CONCLUSION-00004",

        sourcePatternId:
            "CROSS-PATTERN-00013",

        sourcePatternRelation:
            "DETERMINISTICEXECUTION:REQUIRES:ACCOUNTING",

        originTargetId:
            "CONCLUSION:CONCLUSION-00004"
    },

    "ERC8060-APPEARS-TO-ENABLE-IERC8060RESERVABLE": {
        sourceConclusionId:
            "CONCLUSION-00005",

        sourcePatternId:
            "CROSS-PATTERN-00014",

        sourcePatternRelation:
            "ERC8060:ENABLES:IERC8060RESERVABLE",

        originTargetId:
            "CONCLUSION:CONCLUSION-00005"
    }
};

export class ScientificKnowledgeEvolutionEngine {

    build(
    campaignId: string,
    consolidation: KnowledgeConsolidationResult,
    validations: ScientificValidationResult,
    consensus: ScientificConsensusResult,
    previousResult?: ScientificKnowledgeEvolutionResult | null,
    recentlyStrengthenedKnowledgeIds:
        ReadonlySet<string> = new Set()
): ScientificKnowledgeEvolutionResult {

        try {

            const generatedAt =
                new Date().toISOString();

            /*
             * Previous states are indexed both by their historic ID
             * and by a stable canonical representation of the statement.
             *
             * This prevents evidence-count changes in the wording from
             * creating a completely new scientific identity.
             */

            const previousStatesById =
                new Map<string, ScientificKnowledgeState>();

            const previousStatesByStatement =
                new Map<string, ScientificKnowledgeState>();

            for (
                const rawState
                of previousResult?.states ?? []
            ) {

                const state =
                    this.normalizePreviousState(
                        rawState,
                        generatedAt
                    );

                previousStatesById.set(
                    state.knowledgeId,
                    state
                );

                previousStatesByStatement.set(
                    this.canonicalStatement(
                        state.statement
                    ),
                    state
                );

            }

            const validationByTitle =
                new Map(
                    (validations.validations ?? []).map(
                        validation => [
                            this.normalize(
                                validation.theoryTitle
                            ),
                            validation
                        ]
                    )
                );
const validationByPatternRelation =
    new Map(
        (validations.validations ?? [])
            .filter(
                validation =>
                    Boolean(
                        validation.sourcePatternRelation
                    )
            )
            .map(
                validation => [
                    validation.sourcePatternRelation
                        .trim()
                        .toUpperCase(),
                    validation
                ]
            )
    );
            const consensusByStatement =
                new Map(
                    (consensus.consensus ?? []).map(
                        item => [
                            this.canonicalStatement(
                                item.statement
                            ),
                            item
                        ]
                    )
                );

            const currentStates:
                ScientificKnowledgeState[] = [];

            const evolutions:
                ScientificKnowledgeEvolution[] = [];

            const observedPreviousIds =
                new Set<string>();

            let evolutionCounter = 1;

            for (
                const item
                of consolidation.consolidations ?? []
            ) {

                /*
                 * Scientific identity must not depend on:
                 *
                 * - confidence values;
                 * - evidence counts;
                 * - number of independent sources;
                 * - campaign-specific wording.
                 */

                const canonicalStatement =
                    this.canonicalStatement(
                        item.statement
                    );

                const generatedKnowledgeId =
                    this.knowledgeIdFor(
                        canonicalStatement
                    );

                const previous =
                    previousStatesById.get(
                        generatedKnowledgeId
                    ) ??
                    previousStatesByStatement.get(
                        canonicalStatement
                    );

                if (previous) {

                    observedPreviousIds.add(
                        previous.knowledgeId
                    );

                }

                const matchingValidation =
    validationByPatternRelation.get(
        item.sourcePatternRelation
            .trim()
            .toUpperCase()
    ) ??
    this.findValidation(
        item.statement,
        validationByTitle
    );

                const matchingConsensus =
                    consensusByStatement.get(
                        canonicalStatement
                    ) ??
                    this.findConsensus(
                        item.statement,
                        consensusByStatement
                    );

                const validationStatus:
                    ScientificKnowledgeState["validationStatus"] =
                        matchingValidation?.status === "VALIDATED" ||
                        matchingValidation?.status === "CHALLENGED" ||
                        matchingValidation?.status === "REJECTED" ||
                        matchingValidation?.status === "INCONCLUSIVE"
                            ? matchingValidation.status
                            : "NOT_EVALUATED";

                const contradictionCount =
                    Math.max(
                        0,
                        Number(
                            matchingValidation
                                ?.contradictoryEvidence ??
                            0
                        )
                    );

                    const supportingEvidenceIds =
    this.uniqueIds([
        ...(previous?.supportingEvidenceIds ?? []),
        ...(matchingValidation?.supportingEvidenceIds ?? [])
    ]);

const contradictoryEvidenceIds =
    this.uniqueIds([
        ...(previous?.contradictoryEvidenceIds ?? []),
        ...(matchingValidation?.contradictoryEvidenceIds ?? [])
    ]);

                const confidence =
                    this.clamp(
                        Number(
                            item.confidenceAfter ?? 0
                        )
                    );

                /*
 * Scientific source independence must come from the
 * validation layer, where source identities are assessed
 * through explicit pairwise independence evidence.
 *
 * evidenceAfter represents evidence quantity, not source
 * independence, and must never be used as a proxy for it.
 *
 * If no matching validation exists, independence has not
 * been scientifically established for this state.
 */
/*
 * Source independence is propagated explicitly from
 * KnowledgeConsolidation, whose value originates in the
 * source-independence assessment used by ConfidenceEngine.
 *
 * Evidence quantity must never be used as a proxy for
 * scientific source independence.
 */
const independentSources =
    Math.max(
        0,
        Number(
            item.independentSources ??
            0
        )
    );

                const campaignsObserved =
                    previous
                        ? previous.campaignsObserved + 1
                        : 1;

                const currentStatus =
                    this.resolveStatus(
                        item.newStatus,
                        validationStatus,
                        matchingConsensus
                            ?.consensusLevel,
                        confidence,
                        independentSources,
                        campaignsObserved
                    );

                const confidenceHistory =
                    this.appendHistory(
                        previous?.confidenceHistory ??
                        (
                            previous
                                ? [previous.confidence]
                                : []
                        ),
                        confidence
                    );

                const sourceHistory =
                    this.appendHistory(
                        previous?.sourceHistory ??
                        (
                            previous
                                ? [
                                    previous
                                        .independentSources
                                ]
                                : []
                        ),
                        independentSources
                    );

                const statusHistory =
                    this.appendStatusHistory(
                        previous?.statusHistory ??
                        (
                            previous
                                ? [previous.status]
                                : []
                        ),
                        currentStatus
                    );

                const confidenceTrend =
                    this.confidenceTrendFor(
                        confidenceHistory
                    );

                const evolutionVelocity =
    this.velocityFor(
        previous,
        currentStatus,
        confidence,
        independentSources,
        supportingEvidenceIds.length,
       recentlyStrengthenedKnowledgeIds.has(
    generatedKnowledgeId
),
confidenceHistory,
sourceHistory
    );

                const maturityLevel =
                    this.maturityFor({
                        status:
                            currentStatus,

                        campaignsObserved,

                        consecutiveStableCampaigns:
                            this.stableCampaignsFor(
                                previous,
                                currentStatus,
                                confidence,
                                independentSources
                            ),

                        confidence,

                        independentSources,

                        contradictionCount,

                        validationStatus
                    });

                const consecutiveStableCampaigns =
                    this.stableCampaignsFor(
                        previous,
                        currentStatus,
                        confidence,
                        independentSources
                    );

                const statusChanged =
                    Boolean(
                        previous &&
                        previous.status !== currentStatus
                    );

                const previousRank =
                    previous
                        ? this.statusRank(
                            previous.status
                        )
                        : null;

                const currentRank =
                    this.statusRank(
                        currentStatus
                    );

                const promoted =
                    previousRank !== null &&
                    currentRank > previousRank;

                const degraded =
                    previousRank !== null &&
                    currentRank < previousRank;

                const trajectory =
                    this.buildTrajectory(
                        previous?.trajectory ?? [],
                        previous?.status,
                        currentStatus
                    );

                    const sourceConclusionId =
    item.sourceConclusionId ??
    previous?.sourceConclusionId;

const sourcePatternId =
    item.sourcePatternId ??
    previous?.sourcePatternId;

const sourcePatternRelation =
    item.sourcePatternRelation ??
    previous?.sourcePatternRelation;

if (
    !sourceConclusionId ||
    !sourcePatternId ||
    !sourcePatternRelation
) {
    throw new Error(
        [
            `Missing scientific provenance for ${generatedKnowledgeId}`,
            `sourceConclusionId=${sourceConclusionId ?? "missing"}`,
            `sourcePatternId=${sourcePatternId ?? "missing"}`,
            `sourcePatternRelation=${sourcePatternRelation ?? "missing"}`
        ].join(" | ")
    );
}

const state:
    ScientificKnowledgeState = {

    knowledgeId:
        generatedKnowledgeId,

    sourceConclusionId,

    sourcePatternId,

    sourcePatternRelation,

    originTargetId:
        `CONCLUSION:${sourceConclusionId}`,

    statement:
        item.statement,

    status:
        currentStatus,

    confidence,

    independentSources,

    campaignsObserved,

    consecutiveStableCampaigns,

    contradictionCount,

    supportingEvidenceIds,

    contradictoryEvidenceIds,

    supportingEvidenceIdentities:
    [
        ...(
            previous
                ?.supportingEvidenceIdentities ??
            []
        )
    ],

contradictoryEvidenceIdentities:
    [
        ...(
            previous
                ?.contradictoryEvidenceIdentities ??
            []
        )
    ],

supportingEvidenceRepositories:
    [
        ...(
            previous
                ?.supportingEvidenceRepositories ??
            []
        )
    ],

contradictoryEvidenceRepositories:
    [
        ...(
            previous
                ?.contradictoryEvidenceRepositories ??
            []
        )
    ],

    validationStatus,

    maturityLevel,

    confidenceTrend,

    evolutionVelocity,

    confidenceHistory,

    sourceHistory,

    statusHistory,

    trajectory,

    firstObservedAt:
        previous?.firstObservedAt ??
        generatedAt,

    lastObservedAt:
        generatedAt,

    lastStatusChangeAt:
        statusChanged
            ? generatedAt
            : previous?.lastStatusChangeAt ??
              null,

    lastPromotionAt:
        promoted
            ? generatedAt
            : previous?.lastPromotionAt ??
              null,

    lastDegradationAt:
        degraded
            ? generatedAt
            : previous?.lastDegradationAt ??
              null

};
                currentStates.push(
                    state
                );

                const evolutionType =
                    this.determineEvolutionType(
                        previous,
                        state
                    );

                evolutions.push({

                    evolutionId:
                        `SCI-KNOWLEDGE-EVOLUTION-${String(
                            evolutionCounter++
                        ).padStart(5, "0")}`,

                    knowledgeId:
                        state.knowledgeId,

                        sourceConclusionId:
    state.sourceConclusionId,

sourcePatternId:
    state.sourcePatternId,

sourcePatternRelation:
    state.sourcePatternRelation,

originTargetId:
    state.originTargetId,

                    statement:
                        state.statement,

                    evolutionType,

                    previousStatus:
                        previous?.status ?? null,

                    currentStatus:
                        state.status,

                    confidenceBefore:
                        previous?.confidence ?? 0,

                    confidenceAfter:
                        state.confidence,

                    confidenceDelta:
                        state.confidence -
                        (
                            previous?.confidence ??
                            0
                        ),

                    sourcesBefore:
                        previous
                            ?.independentSources ??
                        0,

                    sourcesAfter:
                        state.independentSources,

                    sourceDelta:
                        state.independentSources -
                        (
                            previous
                                ?.independentSources ??
                            0
                        ),

                    campaignsObserved:
                        state.campaignsObserved,

                    explanation:
                        this.explanationFor(
                            evolutionType,
                            previous,
                            state
                        )

                });

            }

            /*
             * Previous knowledge that is absent from the current
             * campaign is archived, but its scientific history is
             * preserved instead of being deleted.
             */

            for (
                const previous
                of previousStatesById.values()
            ) {

                if (
                    observedPreviousIds.has(
                        previous.knowledgeId
                    )
                ) {
                    continue;
                }

                const statusHistory =
                    this.appendStatusHistory(
                        previous.statusHistory,
                        "ARCHIVED"
                    );

                const archivedState:
                    ScientificKnowledgeState = {

                    ...previous,

                    status:
                        "ARCHIVED",

                    campaignsObserved:
                        previous.campaignsObserved + 1,

                    consecutiveStableCampaigns:
                        0,

                    maturityLevel:
                        previous.maturityLevel,

                    confidenceTrend:
                        previous.confidenceTrend,

                    evolutionVelocity:
                        "STALLED",

                    statusHistory,

                    trajectory:
                        this.buildTrajectory(
                            previous.trajectory,
                            previous.status,
                            "ARCHIVED"
                        ),

                    lastObservedAt:
                        generatedAt,

                    lastStatusChangeAt:
                        previous.status !== "ARCHIVED"
                            ? generatedAt
                            : previous
                                .lastStatusChangeAt,

                    lastDegradationAt:
                        previous.status !== "ARCHIVED"
                            ? generatedAt
                            : previous
                                .lastDegradationAt

                };

                currentStates.push(
                    archivedState
                );

                evolutions.push({

                    evolutionId:
                        `SCI-KNOWLEDGE-EVOLUTION-${String(
                            evolutionCounter++
                        ).padStart(5, "0")}`,

                  knowledgeId:
    archivedState.knowledgeId,

sourceConclusionId:
    archivedState.sourceConclusionId,

sourcePatternId:
    archivedState.sourcePatternId,

sourcePatternRelation:
    archivedState.sourcePatternRelation,

originTargetId:
    archivedState.originTargetId,

statement:
    archivedState.statement,

                    evolutionType:
                        "ARCHIVED",

                    previousStatus:
                        previous.status,

                    currentStatus:
                        "ARCHIVED",

                    confidenceBefore:
                        previous.confidence,

                    confidenceAfter:
    archivedState.confidence,

                    confidenceDelta:
                        0,

                    sourcesBefore:
                        previous.independentSources,

                    sourcesAfter:
    archivedState.independentSources,

                    sourceDelta:
                        0,

                    campaignsObserved:
                        archivedState
                            .campaignsObserved,

                    explanation:
                        "Knowledge was present in the previous campaign but was not observed in the current campaign. Its scientific history was preserved and its lifecycle status changed to ARCHIVED."

                });

            }

            currentStates.sort(
                (a, b) =>
                    this.statusRank(
                        b.status
                    ) -
                    this.statusRank(
                        a.status
                    ) ||
                    b.confidence -
                    a.confidence ||
                    b.independentSources -
                    a.independentSources
            );

            return {

                generatedAt,

                campaignId,

                evolutions,

                states:
                    currentStates,

                statistics:
                    this.statisticsFor(
                        evolutions,
                        currentStates
                    ),

                errors: []

            };

        } catch (error) {

            return {

                generatedAt:
                    new Date().toISOString(),

                campaignId,

                evolutions: [],

                states: [],

                statistics: {
                    totalKnowledge: 0,
                    evolutions: 0,
                    discovered: 0,
                    promoted: 0,
                    degraded: 0,
                    stabilized: 0,
                    challenged: 0,
                    refuted: 0,
                    recovered: 0,
                    unchanged: 0,
                    archived: 0,
                    averageConfidence: 0
                },

                errors: [
                    error instanceof Error
                        ? error.message
                        : "Unknown scientific knowledge evolution error"
                ]

            };

        }

    }

    private nonEmptyString(
    value: unknown
): string | undefined {

    if (
        typeof value !== "string"
    ) {
        return undefined;
    }

    const normalized =
        value.trim();

    return normalized.length > 0
        ? normalized
        : undefined;
}

private provenanceForPreviousState(
    state: ScientificKnowledgeState
): ScientificKnowledgeProvenance {

    const legacyProvenance =
        LEGACY_SCIENTIFIC_KNOWLEDGE_PROVENANCE[
            state.knowledgeId
        ];

    const sourceConclusionId =
        this.nonEmptyString(
            state.sourceConclusionId
        ) ??
        legacyProvenance
            ?.sourceConclusionId;

    const sourcePatternId =
        this.nonEmptyString(
            state.sourcePatternId
        ) ??
        legacyProvenance
            ?.sourcePatternId;

    const sourcePatternRelation =
        this.nonEmptyString(
            state.sourcePatternRelation
        ) ??
        legacyProvenance
            ?.sourcePatternRelation;

    const originTargetId =
        this.nonEmptyString(
            state.originTargetId
        ) ??
        legacyProvenance
            ?.originTargetId ??
        (
            sourceConclusionId
                ? `CONCLUSION:${sourceConclusionId}`
                : undefined
        );

    if (
        !sourceConclusionId ||
        !sourcePatternId ||
        !sourcePatternRelation ||
        !originTargetId
    ) {
        throw new Error(
            [
                "Missing scientific provenance for previous knowledge",
                state.knowledgeId,
                `sourceConclusionId=${sourceConclusionId ?? "missing"}`,
                `sourcePatternId=${sourcePatternId ?? "missing"}`,
                `sourcePatternRelation=${sourcePatternRelation ?? "missing"}`,
                `originTargetId=${originTargetId ?? "missing"}`
            ].join(" | ")
        );
    }

    return {
        sourceConclusionId,
        sourcePatternId,
        sourcePatternRelation,
        originTargetId
    };
}

private normalizePreviousState(
    state: ScientificKnowledgeState,
    generatedAt: string
): ScientificKnowledgeState {

    const provenance =
        this.provenanceForPreviousState(
            state
        );

    const confidenceHistory =
        Array.isArray(
            state.confidenceHistory
        ) &&
        state.confidenceHistory.length > 0
            ? state.confidenceHistory
            : [state.confidence];

    const sourceHistory =
        Array.isArray(
            state.sourceHistory
        ) &&
        state.sourceHistory.length > 0
            ? state.sourceHistory
            : [state.independentSources];

    const statusHistory =
        Array.isArray(
            state.statusHistory
        ) &&
        state.statusHistory.length > 0
            ? state.statusHistory
            : [state.status];

    const trajectory =
        Array.isArray(
            state.trajectory
        ) &&
        state.trajectory.length > 0
            ? state.trajectory
            : [state.status];

    return {

        ...state,

        sourceConclusionId:
            provenance.sourceConclusionId,

        sourcePatternId:
            provenance.sourcePatternId,

        sourcePatternRelation:
            provenance.sourcePatternRelation,

        originTargetId:
            provenance.originTargetId,

        supportingEvidenceIds:
            Array.isArray(
                state.supportingEvidenceIds
            )
                ? this.uniqueIds(
                    state.supportingEvidenceIds
                )
                : [],

        contradictoryEvidenceIds:
            Array.isArray(
                state.contradictoryEvidenceIds
            )
                ? this.uniqueIds(
                    state.contradictoryEvidenceIds
                )
                : [],

        knowledgeId:
            this.knowledgeIdFor(
                this.canonicalStatement(
                    state.statement
                )
            ),

        maturityLevel:
            state.maturityLevel ??
            this.maturityFor({
                status:
                    state.status,

                campaignsObserved:
                    state.campaignsObserved,

                consecutiveStableCampaigns:
                    state.consecutiveStableCampaigns,

                confidence:
                    state.confidence,

                independentSources:
                    state.independentSources,

                contradictionCount:
                    state.contradictionCount,

                validationStatus:
                    state.validationStatus
            }),

        confidenceTrend:
            state.confidenceTrend ??
            this.confidenceTrendFor(
                confidenceHistory
            ),

        evolutionVelocity:
            state.evolutionVelocity ??
            "INSUFFICIENT_DATA",

        confidenceHistory,

        sourceHistory,

        statusHistory,

        trajectory,

        firstObservedAt:
            state.firstObservedAt ??
            generatedAt,

        lastObservedAt:
            state.lastObservedAt ??
            generatedAt,

        lastStatusChangeAt:
            state.lastStatusChangeAt ??
            null,

        lastPromotionAt:
            state.lastPromotionAt ??
            null,

        lastDegradationAt:
            state.lastDegradationAt ??
            null
    };
}

    private resolveStatus(
        consolidationStatus: string,
        validationStatus: string,
        consensusLevel: string | undefined,
        confidence: number,
        independentSources: number,
        campaignsObserved: number
    ): ScientificKnowledgeStatus {

        if (
            validationStatus === "REJECTED"
        ) {
            return "REJECTED";
        }

        if (
            validationStatus === "CHALLENGED"
        ) {
            return "CHALLENGED";
        }

        if (
            validationStatus === "VALIDATED" &&
            consensusLevel === "STRONG" &&
            confidence >= 90 &&
            independentSources >= 3 &&
            campaignsObserved >= 3
        ) {
            return "CANONICAL";
        }

        if (
            validationStatus === "VALIDATED" &&
            confidence >= 80
        ) {
            return "ESTABLISHED";
        }

        switch (
            consolidationStatus
        ) {

            case "CANONICAL":

                return (
                    confidence >= 90 &&
                    independentSources >= 3 &&
                    campaignsObserved >= 3
                )
                    ? "CANONICAL"
                    : "ESTABLISHED";

            case "ESTABLISHED":

                return "ESTABLISHED";

            case "SUPPORTED":

                return "SUPPORTED";

            case "ARCHIVED":

                return "ARCHIVED";

            default:

                if (
                    confidence >= 75 &&
                    independentSources >= 2
                ) {
                    return "SUPPORTED";
                }

                return "EMERGING";

        }

    }

    private determineEvolutionType(
        previous:
            ScientificKnowledgeState | undefined,
        current:
            ScientificKnowledgeState
    ): ScientificKnowledgeEvolution["evolutionType"] {

        if (!previous) {
            return "DISCOVERED";
        }

        if (
            current.status === "ARCHIVED"
        ) {
            return "ARCHIVED";
        }

        if (
            current.status === "REJECTED" &&
            previous.status !== "REJECTED"
        ) {
            return "REFUTED";
        }

        if (
            current.status === "CHALLENGED" &&
            previous.status !== "CHALLENGED"
        ) {
            return "CHALLENGED";
        }

        if (
            (
                previous.status === "REJECTED" ||
                previous.status === "CHALLENGED" ||
                previous.status === "ARCHIVED"
            ) &&
            (
                current.status === "EMERGING" ||
                current.status === "SUPPORTED" ||
                current.status === "ESTABLISHED" ||
                current.status === "CANONICAL"
            )
        ) {
            return "RECOVERED";
        }

        const previousRank =
            this.statusRank(
                previous.status
            );

        const currentRank =
            this.statusRank(
                current.status
            );

        if (
            currentRank > previousRank
        ) {
            return "PROMOTED";
        }

        if (
            currentRank < previousRank
        ) {
            return "DEGRADED";
        }

        /*
         * Material evidence growth is also treated as promotion
         * even when the categorical status remains unchanged.
         */

        if (
            current.confidence -
            previous.confidence >= 8 ||
            current.independentSources -
            previous.independentSources >= 2
        ) {
            return "PROMOTED";
        }

        if (
            previous.confidence -
            current.confidence >= 8 ||
            previous.independentSources -
            current.independentSources >= 2
        ) {
            return "DEGRADED";
        }

        if (
            current.consecutiveStableCampaigns >= 3
        ) {
            return "STABILIZED";
        }

        return "UNCHANGED";

    }

    private stableCampaignsFor(
        previous:
            ScientificKnowledgeState | undefined,
        currentStatus:
            ScientificKnowledgeStatus,
        confidence: number,
        independentSources: number
    ): number {

        if (!previous) {
            return 1;
        }

        const sameStatus =
            previous.status ===
            currentStatus;

        const confidenceStable =
            Math.abs(
                previous.confidence -
                confidence
            ) < 5;

        const sourcesStable =
            Math.abs(
                previous.independentSources -
                independentSources
            ) <= 1;

        return (
            sameStatus &&
            confidenceStable &&
            sourcesStable
        )
            ? previous
                .consecutiveStableCampaigns + 1
            : 1;

    }

    private maturityFor(
        state: {
            status: ScientificKnowledgeStatus;
            campaignsObserved: number;
            consecutiveStableCampaigns: number;
            confidence: number;
            independentSources: number;
            contradictionCount: number;
            validationStatus:
                ScientificKnowledgeState["validationStatus"];
        }
    ): ScientificKnowledgeMaturity {

        if (
            state.status === "CANONICAL" &&
            state.campaignsObserved >= 5 &&
            state.consecutiveStableCampaigns >= 3 &&
            state.confidence >= 90 &&
            state.independentSources >= 4 &&
            state.contradictionCount === 0
        ) {
            return "FOUNDATIONAL";
        }

        if (
            (
                state.status === "ESTABLISHED" ||
                state.status === "CANONICAL"
            ) &&
            state.campaignsObserved >= 3 &&
            state.confidence >= 80 &&
            state.independentSources >= 3
        ) {
            return "MATURE";
        }

        if (
            state.campaignsObserved >= 2 &&
            (
                state.status === "SUPPORTED" ||
                state.status === "ESTABLISHED" ||
                state.status === "CANONICAL"
            ) &&
            state.confidence >= 70
        ) {
            return "GROWING";
        }

        if (
            state.campaignsObserved >= 2
        ) {
            return "EARLY";
        }

        return "NEW";

    }

    private confidenceTrendFor(
        history: number[]
    ): ScientificConfidenceTrend {

        if (
            history.length < 2
        ) {
            return "INSUFFICIENT_DATA";
        }

        const recent =
            history.slice(-5);

        const deltas =
            recent
                .slice(1)
                .map(
                    (value, index) =>
                        value -
                        recent[index]
                );

        const positive =
            deltas.filter(
                delta =>
                    delta >= 3
            ).length;

        const negative =
            deltas.filter(
                delta =>
                    delta <= -3
            ).length;

        const directionChanges =
            this.directionChanges(
                deltas
            );

        if (
            directionChanges >= 2 &&
            (
                positive > 0 ||
                negative > 0
            )
        ) {
            return "VOLATILE";
        }

        if (
            positive > 0 &&
            negative === 0
        ) {
            return "GROWING";
        }

        if (
            negative > 0 &&
            positive === 0
        ) {
            return "DECLINING";
        }

        return "STABLE";

    }

    private velocityFor(
    previous:
        ScientificKnowledgeState | undefined,
    currentStatus:
        ScientificKnowledgeStatus,
    confidence: number,
    independentSources: number,
    supportingEvidenceCount: number,
    recentlyStrengthened: boolean,
    confidenceHistory: number[],
    sourceHistory: number[]
): ScientificEvolutionVelocity {

        if (!previous) {
            return "INSUFFICIENT_DATA";
        }

        const statusDelta =
            this.statusRank(
                currentStatus
            ) -
            this.statusRank(
                previous.status
            );

        const confidenceDelta =
            confidence -
            previous.confidence;

        const sourceDelta =
            independentSources -
            previous.independentSources;

        const supportingEvidenceDelta =
    supportingEvidenceCount -
    (previous.supportingEvidenceIds ?? []).length;

        if (
            statusDelta >= 2 ||
            confidenceDelta >= 15 ||
            sourceDelta >= 3
        ) {
            return "RAPID";
        }

        if (
            statusDelta >= 1 ||
            confidenceDelta >= 5 ||
            sourceDelta >= 1
        ) {
            return "NORMAL";
        }

        if (
    recentlyStrengthened ||
    supportingEvidenceDelta > 0
) {
    return "SLOW";
}

        if (
            confidenceHistory.length >= 3 &&
            this.allRecentValuesStable(
                confidenceHistory,
                3
            ) &&
            this.allRecentValuesStable(
                sourceHistory,
                1
            )
        ) {
            return "STALLED";
        }

        return "SLOW";

    }

    private buildTrajectory(
        previousTrajectory: string[],
        previousStatus:
            ScientificKnowledgeStatus | undefined,
        currentStatus:
            ScientificKnowledgeStatus
    ): string[] {

        const trajectory =
            Array.isArray(
                previousTrajectory
            )
                ? [...previousTrajectory]
                : [];

        if (
            trajectory.length === 0 &&
            previousStatus
        ) {
            trajectory.push(
                previousStatus
            );
        }

        if (
            trajectory.at(-1) !==
            currentStatus
        ) {
            trajectory.push(
                currentStatus
            );
        }

        return trajectory.slice(-25);

    }

    private appendHistory(
        history: number[],
        value: number
    ): number[] {

        return [
            ...(history ?? []),
            value
        ].slice(-50);

    }

    private appendStatusHistory(
        history:
            ScientificKnowledgeStatus[],
        value:
            ScientificKnowledgeStatus
    ): ScientificKnowledgeStatus[] {

        return [
            ...(history ?? []),
            value
        ].slice(-50);

    }

    private explanationFor(
        evolutionType:
            ScientificKnowledgeEvolution["evolutionType"],
        previous:
            ScientificKnowledgeState | undefined,
        current:
            ScientificKnowledgeState
    ): string {

        const temporalContext =
            `Maturity: ${current.maturityLevel}. ` +
            `Confidence trend: ${current.confidenceTrend}. ` +
            `Evolution velocity: ${current.evolutionVelocity}.`;

        switch (evolutionType) {

            case "DISCOVERED":

                return (
                    `Knowledge was observed for the first time with ` +
                    `${current.independentSources} independent source(s) ` +
                    `and confidence ${current.confidence}. ` +
                    temporalContext
                );

            case "PROMOTED":

                return (
                    `Knowledge advanced from ${previous?.status} to ` +
                    `${current.status}, or received materially stronger evidence. ` +
                    `Confidence changed from ${previous?.confidence} to ` +
                    `${current.confidence}; independent sources changed from ` +
                    `${previous?.independentSources} to ` +
                    `${current.independentSources}. ` +
                    temporalContext
                );

            case "DEGRADED":

                return (
                    `Knowledge declined from ${previous?.status} to ` +
                    `${current.status}, or lost material confidence or independent evidence. ` +
                    temporalContext
                );

            case "STABILIZED":

                return (
                    `Knowledge remained ${current.status} for ` +
                    `${current.consecutiveStableCampaigns} consecutive campaigns. ` +
                    temporalContext
                );

            case "CHALLENGED":

                return (
                    `Knowledge is challenged by ` +
                    `${current.contradictionCount} contradictory finding(s). ` +
                    temporalContext
                );

            case "REFUTED":

                return (
                    `Scientific validation rejected this knowledge after evaluating ` +
                    `${current.independentSources} source(s). ` +
                    temporalContext
                );

            case "RECOVERED":

                return (
                    `Knowledge recovered from ${previous?.status} to ` +
                    `${current.status} after receiving stronger evidence. ` +
                    temporalContext
                );

            case "ARCHIVED":

                return (
                    "Knowledge was not observed in the current campaign and was archived while preserving its complete scientific history."
                );

            case "UNCHANGED":

                return (
                    `Knowledge remains ${current.status} with confidence ` +
                    `${current.confidence} across ` +
                    `${current.campaignsObserved} campaign(s). ` +
                    temporalContext
                );

        }

    }

    private findValidation(
        statement: string,
        validations:
           Map<string, {
    theoryTitle: string;
    status: string;
    contradictoryEvidence: number;
    supportingEvidenceIds: string[];
    contradictoryEvidenceIds: string[];
}>
    ) {

        const normalizedStatement =
            this.normalize(
                statement
            );

        for (
            const [
                title,
                validation
            ]
            of validations.entries()
        ) {

            if (
                normalizedStatement.includes(
                    title
                ) ||
                title.includes(
                    normalizedStatement
                )
            ) {
                return validation;
            }

        }

        return undefined;

    }

    private findConsensus(
        statement: string,
        consensus:
            Map<string, {
                statement: string;
                consensusLevel: string;
            }>
    ) {

        const canonical =
            this.canonicalStatement(
                statement
            );

        for (
            const [
                candidate,
                item
            ]
            of consensus.entries()
        ) {

            if (
                canonical.includes(
                    candidate
                ) ||
                candidate.includes(
                    canonical
                )
            ) {
                return item;
            }

        }

        return undefined;

    }

    private statisticsFor(
        evolutions:
            ScientificKnowledgeEvolution[],
        states:
            ScientificKnowledgeState[]
    ): ScientificKnowledgeEvolutionResult["statistics"] {

        return {

            totalKnowledge:
                states.length,

            evolutions:
                evolutions.length,

            discovered:
                this.countEvolution(
                    evolutions,
                    "DISCOVERED"
                ),

            promoted:
                this.countEvolution(
                    evolutions,
                    "PROMOTED"
                ),

            degraded:
                this.countEvolution(
                    evolutions,
                    "DEGRADED"
                ),

            stabilized:
                this.countEvolution(
                    evolutions,
                    "STABILIZED"
                ),

            challenged:
                this.countEvolution(
                    evolutions,
                    "CHALLENGED"
                ),

            refuted:
                this.countEvolution(
                    evolutions,
                    "REFUTED"
                ),

            recovered:
                this.countEvolution(
                    evolutions,
                    "RECOVERED"
                ),

            unchanged:
                this.countEvolution(
                    evolutions,
                    "UNCHANGED"
                ),

            archived:
                this.countEvolution(
                    evolutions,
                    "ARCHIVED"
                ),

            averageConfidence:
                this.average(
                    states
                        .filter(
                            state =>
                                state.status !==
                                "ARCHIVED"
                        )
                        .map(
                            state =>
                                state.confidence
                        )
                )

        };

    }

    private countEvolution(
        evolutions:
            ScientificKnowledgeEvolution[],
        type:
            ScientificKnowledgeEvolution["evolutionType"]
    ): number {

        return evolutions.filter(
            evolution =>
                evolution.evolutionType ===
                type
        ).length;

    }

    private statusRank(
        status:
            ScientificKnowledgeStatus
    ): number {

        switch (status) {

            case "ARCHIVED":
                return 0;

            case "REJECTED":
                return 1;

            case "CHALLENGED":
                return 2;

            case "EMERGING":
                return 3;

            case "SUPPORTED":
                return 4;

            case "ESTABLISHED":
                return 5;

            case "CANONICAL":
                return 6;

        }

    }

    private knowledgeIdFor(
        statement: string
    ): string {

        return this.canonicalStatement(
            statement
        )
            .replace(
                /[^a-z0-9]+/g,
                "-"
            )
            .replace(
                /^-|-$/g,
                ""
            )
            .toUpperCase();

    }

    private canonicalStatement(
        value: string
    ): string {

        return this.normalize(
            value
        )
            .replace(
                /\bacross \d+ independent sources?\b/g,
                ""
            )
            .replace(
                /\bwith \d+ independent sources?\b/g,
                ""
            )
            .replace(
                /\bsupported by \d+ sources?\b/g,
                ""
            )
            .replace(
                /\bconfidence \d+\b/g,
                ""
            )
            .replace(
                /\bconfidence score \d+\b/g,
                ""
            )
            .replace(
                /\bevidence count \d+\b/g,
                ""
            )
            .replace(
                /\s+/g,
                " "
            )
            .trim();

    }

    private normalize(
        value: string
    ): string {

        return String(
            value ?? ""
        )
            .replace(
                /([a-z])([A-Z])/g,
                "$1 $2"
            )
            .replace(
                /[^a-zA-Z0-9]+/g,
                " "
            )
            .toLowerCase()
            .trim();

    }

    private directionChanges(
        values: number[]
    ): number {

        const signs =
            values
                .map(
                    value =>
                        value > 0
                            ? 1
                            : value < 0
                                ? -1
                                : 0
                )
                .filter(
                    value =>
                        value !== 0
                );

        let changes = 0;

        for (
            let index = 1;
            index < signs.length;
            index++
        ) {

            if (
                signs[index] !==
                signs[index - 1]
            ) {
                changes++;
            }

        }

        return changes;

    }

    private allRecentValuesStable(
        values: number[],
        tolerance: number
    ): boolean {

        if (
            values.length < 3
        ) {
            return false;
        }

        const recent =
            values.slice(-3);

        return (
            Math.max(...recent) -
            Math.min(...recent)
        ) <= tolerance;

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

}