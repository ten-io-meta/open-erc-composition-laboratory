import type {
    ScientificKnowledgeEvolutionResult
} from "../scientific-knowledge-evolution/ScientificKnowledgeEvolutionResult.js";

import type {
    ScientificKnowledgeState
} from "../scientific-knowledge-evolution/ScientificKnowledgeState.js";

import type {
    ScientificKnowledgeEvidenceMatch
} from "../scientific-knowledge-evidence-matcher/ScientificKnowledgeEvidenceMatch.js";

import type {
    ScientificKnowledgeEvidenceMatchResult
} from "../scientific-knowledge-evidence-matcher/ScientificKnowledgeEvidenceMatchResult.js";

import type {
    ScientificEvidenceAssimilation
} from "./ScientificEvidenceAssimilation.js";

import type {
    ScientificEvidenceAssimilationResult
} from "./ScientificEvidenceAssimilationResult.js";

export class ScientificEvidenceAssimilationEngine {

    build(
        campaignId: string,
        evolution: ScientificKnowledgeEvolutionResult,
        matches: ScientificKnowledgeEvidenceMatchResult
    ): ScientificEvidenceAssimilationResult {

        try {

            const generatedAt =
                new Date().toISOString();

            const assimilations:
                ScientificEvidenceAssimilation[] = [];

            const matchesByKnowledgeId =
                this.indexMatchesByKnowledgeId(
                    matches.matches ?? []
                );

            let assimilationCounter = 1;

            let supportingEvidenceAdded = 0;

            let contradictoryEvidenceAdded = 0;

            const states:
                ScientificKnowledgeState[] =
                    (evolution.states ?? []).map(
                        state => {

                            const stateMatches =
                                matchesByKnowledgeId.get(
                                    state.knowledgeId
                                ) ?? [];

                            if (stateMatches.length === 0) {

                                return this.cloneState(
                                    state
                                );

                            }

                            const supportingEvidenceIds =
                                new Set(
                                    state.supportingEvidenceIds ?? []
                                );

                            const contradictoryEvidenceIds =
                                new Set(
                                    state.contradictoryEvidenceIds ?? []
                                );

                            const supportingEvidenceIdentities =
    new Set(
        state.supportingEvidenceIdentities ?? []
    );

const contradictoryEvidenceIdentities =
    new Set(
        state.contradictoryEvidenceIdentities ?? []
    );

const supportingEvidenceRepositories =
    new Set(
        state.supportingEvidenceRepositories ?? []
    );

const contradictoryEvidenceRepositories =
    new Set(
        state.contradictoryEvidenceRepositories ?? []
    );

let contradictionCount =
                                Math.max(
                                    0,
                                    Number(
                                        state.contradictionCount ?? 0
                                    )
                                );

                            for (
                                const match
                                of stateMatches
                            ) {

                                const assimilationId =
                                    `SCIENTIFIC-EVIDENCE-ASSIMILATION-${String(
                                        assimilationCounter++
                                    ).padStart(5, "0")}`;

                                const evidenceIdentity =
    [
        match.experimentId,
        match.executionPlanId,
        match.executionTaskId,
        match.stepId,
        match.feedbackAction
    ].join(":");


const alreadyRegistered =
    supportingEvidenceIds.has(
        match.evidenceId
    ) ||
    contradictoryEvidenceIds.has(
        match.evidenceId
    ) ||
    supportingEvidenceIdentities.has(
        evidenceIdentity
    ) ||
    contradictoryEvidenceIdentities.has(
        evidenceIdentity
    );


const previouslyObservedRepositories =
    new Set(
        [
            ...supportingEvidenceRepositories,
            ...contradictoryEvidenceRepositories
        ]
    );


const replicationClassification =
    match.feedbackAction === "HOLD"
        ? "NOT_APPLICABLE" as const
        : alreadyRegistered
            ? "DUPLICATE" as const
            : !match.repository
                ? "SOURCE_PROVENANCE_UNKNOWN" as const
                : previouslyObservedRepositories.size === 0
                    ? "FIRST_REPOSITORY_OBSERVATION" as const
                    : previouslyObservedRepositories.has(match.repository)
                        ? "SAME_REPOSITORY_REPLICATION" as const
                        : "CROSS_REPOSITORY_EVIDENCE" as const;


if (
    match.feedbackAction ===
    "HOLD"
) {

    assimilations.push({

        assimilationId,

        knowledgeId:
            state.knowledgeId,

        evidenceIdentity,

        evidenceId:
            match.evidenceId,

        repository:
            match.repository,

        action:
            match.feedbackAction,

        replicationClassification,

        assimilated:
            false,

        explanation:
            `Evidence ${match.evidenceId} was matched to ` +
            `scientific knowledge ${state.knowledgeId}, but ` +
            `the feedback action is HOLD. No scientific ` +
            `knowledge state was modified.`

    });

    continue;

}


                                if (alreadyRegistered) {
                                    assimilations.push({

                                        assimilationId,

                                        knowledgeId:
                                            state.knowledgeId,

                                        evidenceIdentity,

                                                                                evidenceId:
                                            match.evidenceId,

                                        repository:
    match.repository,

action:
    match.feedbackAction,

replicationClassification,

                                        assimilated:
                                            false,

                                        explanation:
                                            `Evidence ${match.evidenceId} was not assimilated ` +
                                            `because it was already registered in scientific ` +
                                            `knowledge ${state.knowledgeId}.`

                                    });

                                    continue;

                                }

                                if (
                                    match.feedbackAction ===
                                    "STRENGTHEN"
                                ) {

                                    supportingEvidenceIds.add(
                                        match.evidenceId
                                    );
                                    supportingEvidenceIdentities.add(
    evidenceIdentity
);

if (match.repository) {
    supportingEvidenceRepositories.add(
        match.repository
    );
}

supportingEvidenceAdded++;

                                    assimilations.push({

                                        assimilationId,

                                        knowledgeId:
                                            state.knowledgeId,

                                        evidenceIdentity,

                                                                                evidenceId:
                                            match.evidenceId,

                                        repository:
    match.repository,

action:
    match.feedbackAction,

replicationClassification,

                                        assimilated:
                                            true,

                                        explanation:
                                            `Supporting execution evidence ${match.evidenceId} ` +
                                            `was assimilated into scientific knowledge ` +
                                            `${state.knowledgeId}. Confidence, independent ` +
                                            `source count, maturity and status were not changed.`

                                    });

                                    continue;

                                }

                                contradictoryEvidenceIds.add(
                                    match.evidenceId
                                );

                                contradictoryEvidenceIdentities.add(
    evidenceIdentity
);

if (match.repository) {
    contradictoryEvidenceRepositories.add(
        match.repository
    );
}

contradictionCount++;

                                contradictoryEvidenceAdded++;

                                                                assimilations.push({

                                    assimilationId,

                                    knowledgeId:
                                        state.knowledgeId,

                                    evidenceIdentity,

                                    evidenceId:
                                        match.evidenceId,

                                    repository:
    match.repository,

action:
    match.feedbackAction,

replicationClassification,

                                    assimilated:
                                        true,

                                    explanation:
                                        `Challenging execution evidence ${match.evidenceId} ` +
                                        `was assimilated into scientific knowledge ` +
                                        `${state.knowledgeId}. Contradiction pressure was ` +
                                        `increased without recalculating confidence, ` +
                                        `maturity or scientific status.`

                                });

                            }

                            return {

                                ...this.cloneState(
                                    state
                                ),

                                supportingEvidenceIds:
                                    Array.from(
                                        supportingEvidenceIds
                                    ),

                                contradictoryEvidenceIds:
                                    Array.from(
                                        contradictoryEvidenceIds
                                    ),

                                supportingEvidenceIdentities:
    Array.from(
        supportingEvidenceIdentities
    ),

contradictoryEvidenceIdentities:
    Array.from(
        contradictoryEvidenceIdentities
    ),

supportingEvidenceRepositories:
    Array.from(
        supportingEvidenceRepositories
    ),

contradictoryEvidenceRepositories:
    Array.from(
        contradictoryEvidenceRepositories
    ),

contradictionCount

                            };

                        }
                    );

            const assimilated =
                assimilations.filter(
                    item =>
                        item.assimilated
                ).length;

            return {

                generatedAt,

                campaignId,

                assimilations,

                states,

                statistics: {

                    total:
                        assimilations.length,

                    assimilated,

                    unchanged:
                        assimilations.length -
                        assimilated,

                    supportingEvidenceAdded,

                    contradictoryEvidenceAdded

                },

                errors: []

            };

        } catch (error) {

            return {

                generatedAt:
                    new Date().toISOString(),

                campaignId,

                assimilations: [],

                states: [],

                statistics: {

                    total: 0,

                    assimilated: 0,

                    unchanged: 0,

                    supportingEvidenceAdded: 0,

                    contradictoryEvidenceAdded: 0

                },

                errors: [

                    error instanceof Error
                        ? error.message
                        : String(error)

                ]

            };

        }

    }

    private indexMatchesByKnowledgeId(
        matches:
            ScientificKnowledgeEvidenceMatch[]
    ): Map<
        string,
        ScientificKnowledgeEvidenceMatch[]
    > {

        const index =
            new Map<
                string,
                ScientificKnowledgeEvidenceMatch[]
            >();

        for (
            const match
            of matches
        ) {

            if (
                match.matchStatus !== "MATCHED" ||
                !match.knowledgeId
            ) {

                continue;

            }

            const current =
                index.get(
                    match.knowledgeId
                ) ?? [];

            current.push(
                match
            );

            index.set(
                match.knowledgeId,
                current
            );

        }

        return index;

    }

    private cloneState(
        state:
            ScientificKnowledgeState
    ): ScientificKnowledgeState {

        return {

            ...state,

            supportingEvidenceIds:
                [
                    ...(state.supportingEvidenceIds ?? [])
                ],

            contradictoryEvidenceIds:
                [
                    ...(state.contradictoryEvidenceIds ?? [])
                ],

            confidenceHistory:
                [
                    ...(state.confidenceHistory ?? [])
                ],

            sourceHistory:
                [
                    ...(state.sourceHistory ?? [])
                ],

            statusHistory:
                [
                    ...(state.statusHistory ?? [])
                ],

            trajectory:
                [
                    ...(state.trajectory ?? [])
                ]

        };

    }

}