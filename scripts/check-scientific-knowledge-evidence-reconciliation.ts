import {
    ScientificKnowledgeEvidenceReconciliationEngine
} from "../laboratory/scientific-knowledge-evidence-reconciliation/ScientificKnowledgeEvidenceReconciliationEngine.js";

import type {
    ScientificKnowledgeEvolution
} from "../laboratory/scientific-knowledge-evolution/ScientificKnowledgeEvolution.js";

import type {
    ScientificKnowledgeEvolutionResult
} from "../laboratory/scientific-knowledge-evolution/ScientificKnowledgeEvolutionResult.js";

import type {
    ScientificKnowledgeState
} from "../laboratory/scientific-knowledge-evolution/ScientificKnowledgeState.js";

import type {
    ScientificEvidenceAssimilation
} from "../laboratory/scientific-evidence-assimilation/ScientificEvidenceAssimilation.js";

import type {
    ScientificEvidenceAssimilationResult
} from "../laboratory/scientific-evidence-assimilation/ScientificEvidenceAssimilationResult.js";


const campaignId =
    "CONTROLLED-KNOWLEDGE-EVIDENCE-RECONCILIATION";


const knowledgeIds = {

    strengthened:
        "KNOWLEDGE-STRENGTHENED",

    challenged:
        "KNOWLEDGE-CHALLENGED",

    conflicted:
        "KNOWLEDGE-CONFLICTED",

    held:
        "KNOWLEDGE-HELD",

    unchanged:
        "KNOWLEDGE-UNCHANGED"

};


function buildState(
    knowledgeId: string
): ScientificKnowledgeState {

    return {

        knowledgeId,

        sourceConclusionId:
            `CONCLUSION-${knowledgeId}`,

        sourcePatternId:
            `PATTERN-${knowledgeId}`,

        sourcePatternRelation:
            "RESERVATION:CONSTRAINS:ACCOUNTING",

        originTargetId:
            "THEORY-00001",

        statement:
            `Controlled statement for ${knowledgeId}.`,

        status:
            "SUPPORTED",

        confidence:
            78,

        independentSources:
            2,

        campaignsObserved:
            2,

        consecutiveStableCampaigns:
            1,

        contradictionCount:
            0,

        supportingEvidenceIds: [],

        contradictoryEvidenceIds: [],

        supportingEvidenceIdentities: [],

contradictoryEvidenceIdentities: [],

supportingEvidenceRepositories: [],

contradictoryEvidenceRepositories: [],

validationStatus:
    "VALIDATED",

        maturityLevel:
            "GROWING",

        confidenceTrend:
            "STABLE",

        evolutionVelocity:
            "NORMAL",

        confidenceHistory: [
            72,
            78
        ],

        sourceHistory: [
            1,
            2
        ],

        statusHistory: [
            "EMERGING",
            "SUPPORTED"
        ],

        trajectory: [
            "EMERGING",
            "SUPPORTED"
        ],

        firstObservedAt:
            "2026-09-01T00:00:00.000Z",

        lastObservedAt:
            "2026-09-01T01:00:00.000Z",

        lastStatusChangeAt:
            "2026-09-01T01:00:00.000Z",

        lastPromotionAt:
            "2026-09-01T01:00:00.000Z",

        lastDegradationAt:
            null

    };

}


function buildEvolution(
    state: ScientificKnowledgeState,
    index: number
): ScientificKnowledgeEvolution {

    return {

        evolutionId:
            `SCI-KNOWLEDGE-EVOLUTION-${String(
                index
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

        evolutionType:
            "UNCHANGED",

        previousStatus:
            "SUPPORTED",

        currentStatus:
            "SUPPORTED",

        confidenceBefore:
            78,

        confidenceAfter:
            78,

        confidenceDelta:
            0,

        sourcesBefore:
            2,

        sourcesAfter:
            2,

        sourceDelta:
            0,

        campaignsObserved:
            2,

        explanation:
            "Controlled base evolution."

    };

}


const baseStates = [

    buildState(
        knowledgeIds.strengthened
    ),

    buildState(
        knowledgeIds.challenged
    ),

    buildState(
        knowledgeIds.conflicted
    ),

    buildState(
        knowledgeIds.held
    ),

    buildState(
        knowledgeIds.unchanged
    )

];


const evolution:
    ScientificKnowledgeEvolutionResult = {

        generatedAt:
            "2026-09-01T01:00:00.000Z",

        campaignId,

        evolutions:
            baseStates.map(
                (state, index) =>
                    buildEvolution(
                        state,
                        index + 1
                    )
            ),

        states:
            baseStates,

        statistics: {

            totalKnowledge:
                5,

            evolutions:
                5,

            discovered:
                0,

            promoted:
                0,

            degraded:
                0,

            stabilized:
                0,

            challenged:
                0,

            refuted:
                0,

            recovered:
                0,

            unchanged:
                5,

            archived:
                0,

            averageConfidence:
                78

        },

        errors: []

    };


const assimilations:
    ScientificEvidenceAssimilation[] = [

        /*
         * STRENGTHENED:
         * one newly assimilated SUPPORT.
         */
        {
            assimilationId:
                "ASSIMILATION-00001",

            knowledgeId:
                knowledgeIds.strengthened,

            evidenceId:
                "EVIDENCE-SUPPORT-NEW",

            evidenceIdentity:
                "EXECUTION:SUPPORT:NEW",

            repository:
                "ten-io-meta/erc8060-reservable",

            replicationClassification:
                "SAME_REPOSITORY_REPLICATION",

            action:
                "STRENGTHEN",

            assimilated:
                true,

            explanation:
                "Controlled new supporting evidence."
        },


        /*
         * CHALLENGED:
         * one newly assimilated CHALLENGE.
         */
        {
            assimilationId:
                "ASSIMILATION-00002",

            knowledgeId:
                knowledgeIds.challenged,

            evidenceId:
                "EVIDENCE-CHALLENGE-NEW",

            evidenceIdentity:
                "EXECUTION:CHALLENGE:NEW",

            repository:
    "example/first-observed-repository",

replicationClassification:
    "FIRST_REPOSITORY_OBSERVATION",

            action:
                "CHALLENGE",

            assimilated:
                true,

            explanation:
                "Controlled new contradictory evidence."
        },


        /*
         * CONFLICTED:
         * newly assimilated SUPPORT and CHALLENGE
         * during the same reconciliation.
         */
        {
            assimilationId:
                "ASSIMILATION-00003",

            knowledgeId:
                knowledgeIds.conflicted,

            evidenceId:
                "EVIDENCE-CONFLICT-SUPPORT",

            evidenceIdentity:
                "EXECUTION:CONFLICT:SUPPORT",

            repository:
                null,

            replicationClassification:
                "SOURCE_PROVENANCE_UNKNOWN",

            action:
                "STRENGTHEN",

            assimilated:
                true,

            explanation:
                "Controlled conflicting support."
        },

        {
            assimilationId:
                "ASSIMILATION-00004",

            knowledgeId:
                knowledgeIds.conflicted,

            evidenceId:
                "EVIDENCE-CONFLICT-CHALLENGE",

            evidenceIdentity:
                "EXECUTION:CONFLICT:CHALLENGE",

            repository:
                "example/conflicting-repository",

            replicationClassification:
                "CROSS_REPOSITORY_EVIDENCE",

            action:
                "CHALLENGE",

            assimilated:
                true,

            explanation:
                "Controlled conflicting challenge."
        },


        /*
         * HELD:
         * observed inconclusive evidence that is
         * deliberately not assimilated.
         */
        {
            assimilationId:
                "ASSIMILATION-00005",

            knowledgeId:
                knowledgeIds.held,

            evidenceId:
                "EVIDENCE-HOLD",

            evidenceIdentity:
                "EXECUTION:HOLD",

            repository:
                "ten-io-meta/erc8060-reservable",

            replicationClassification:
                "NOT_APPLICABLE",

            action:
                "HOLD",

            assimilated:
                false,

            explanation:
                "Controlled inconclusive evidence."
        },


        /*
         * UNCHANGED:
         * duplicate SUPPORT observation.
         *
         * It is visible as scientific pressure but is not
         * newly assimilated and therefore must not produce
         * STRENGTHENED.
         */
        {
            assimilationId:
                "ASSIMILATION-00006",

            knowledgeId:
                knowledgeIds.unchanged,

            evidenceId:
                "EVIDENCE-SUPPORT-DUPLICATE",

            evidenceIdentity:
                "EXECUTION:SUPPORT:DUPLICATE",

            repository:
                "ten-io-meta/erc8060-reservable",

            replicationClassification:
                "DUPLICATE",

            action:
                "STRENGTHEN",

            assimilated:
                false,

            explanation:
                "Controlled duplicate supporting evidence."
        }

    ];


/*
 * Assimilation owns the resulting evidence state.
 *
 * Confidence, knowledge status and independent source count
 * deliberately remain unchanged.
 */
const assimilatedStates =
    baseStates.map(
        state => {

            if (
                state.knowledgeId ===
                knowledgeIds.strengthened
            ) {

                return {

                    ...state,

                    supportingEvidenceIds: [
                        "EVIDENCE-SUPPORT-NEW"
                    ],

                    supportingEvidenceIdentities: [
                        "EXECUTION:SUPPORT:NEW"
                    ]

                };

            }


            if (
                state.knowledgeId ===
                knowledgeIds.challenged
            ) {

                return {

                    ...state,

                    contradictionCount:
                        1,

                    contradictoryEvidenceIds: [
                        "EVIDENCE-CHALLENGE-NEW"
                    ],

                    contradictoryEvidenceIdentities: [
                        "EXECUTION:CHALLENGE:NEW"
                    ]

                };

            }


            if (
                state.knowledgeId ===
                knowledgeIds.conflicted
            ) {

                return {

                    ...state,

                    contradictionCount:
                        1,

                    supportingEvidenceIds: [
                        "EVIDENCE-CONFLICT-SUPPORT"
                    ],

                    contradictoryEvidenceIds: [
                        "EVIDENCE-CONFLICT-CHALLENGE"
                    ],

                    supportingEvidenceIdentities: [
                        "EXECUTION:CONFLICT:SUPPORT"
                    ],

                    contradictoryEvidenceIdentities: [
                        "EXECUTION:CONFLICT:CHALLENGE"
                    ]

                };

            }


            return {
                ...state
            };

        }
    );


const assimilation:
    ScientificEvidenceAssimilationResult = {

        generatedAt:
            "2026-09-01T02:00:00.000Z",

        campaignId,

        assimilations,

        states:
            assimilatedStates,

        statistics: {

            total:
                6,

            assimilated:
                4,

            unchanged:
                2,

            supportingEvidenceAdded:
                2,

            contradictoryEvidenceAdded:
                2

        },

        errors: []

    };


const result =
    new ScientificKnowledgeEvidenceReconciliationEngine()
        .build(
            evolution,
            assimilation
        );


function evolutionFor(
    knowledgeId: string
) {

    return result.evolutions.find(
        item =>
            item.knowledgeId ===
            knowledgeId
    );

}


function stateFor(
    knowledgeId: string
) {

    return result.states.find(
        item =>
            item.knowledgeId ===
            knowledgeId
    );

}


const strengthenedEvolution =
    evolutionFor(
        knowledgeIds.strengthened
    );

const challengedEvolution =
    evolutionFor(
        knowledgeIds.challenged
    );

const conflictedEvolution =
    evolutionFor(
        knowledgeIds.conflicted
    );

const heldEvolution =
    evolutionFor(
        knowledgeIds.held
    );

const unchangedEvolution =
    evolutionFor(
        knowledgeIds.unchanged
    );


const checks = {

    strengthenedTransition:
        strengthenedEvolution
            ?.scientificEvidenceTransition ===
        "STRENGTHENED",

    challengedTransition:
        challengedEvolution
            ?.scientificEvidenceTransition ===
        "CHALLENGED",

    conflictedTransition:
        conflictedEvolution
            ?.scientificEvidenceTransition ===
        "CONFLICTED",

    heldTransition:
        heldEvolution
            ?.scientificEvidenceTransition ===
        "HELD",

    unchangedTransition:
        unchangedEvolution
            ?.scientificEvidenceTransition ===
        "UNCHANGED",


    strengthenedPressure:
        strengthenedEvolution
            ?.scientificEvidencePressure
            ?.strengthened === 1 &&
        strengthenedEvolution
            ?.scientificEvidencePressure
            ?.newlyAssimilated === 1,

    challengedPressure:
        challengedEvolution
            ?.scientificEvidencePressure
            ?.challenged === 1 &&
        challengedEvolution
            ?.scientificEvidencePressure
            ?.newlyAssimilated === 1,

    conflictedPressure:
        conflictedEvolution
            ?.scientificEvidencePressure
            ?.strengthened === 1 &&
        conflictedEvolution
            ?.scientificEvidencePressure
            ?.challenged === 1 &&
        conflictedEvolution
            ?.scientificEvidencePressure
            ?.newlyAssimilated === 2,

    heldPressure:
        heldEvolution
            ?.scientificEvidencePressure
            ?.held === 1 &&
        heldEvolution
            ?.scientificEvidencePressure
            ?.newlyAssimilated === 0,

    duplicateObservedButUnchanged:
        unchangedEvolution
            ?.scientificEvidencePressure
            ?.strengthened === 1 &&
        unchangedEvolution
            ?.scientificEvidencePressure
            ?.newlyAssimilated === 0 &&
        unchangedEvolution
            ?.scientificEvidencePressure
            ?.supportingEvidenceIds
            .length === 0,

    strengthenedReplicationPressure:
    strengthenedEvolution
        ?.scientificReplicationPressure
        ?.sameRepositoryReplications === 1 &&
    strengthenedEvolution
        ?.scientificReplicationPressure
        ?.crossRepositoryEvidence === 0 &&
    strengthenedEvolution
        ?.scientificReplicationPressure
        ?.duplicates === 0 &&
    strengthenedEvolution
        ?.scientificReplicationPressure
        ?.repositoriesObserved.includes(
            "ten-io-meta/erc8060-reservable"
        ) === true,

challengedReplicationPressure:
    challengedEvolution
        ?.scientificReplicationPressure
        ?.firstRepositoryObservations === 1 &&
    challengedEvolution
        ?.scientificReplicationPressure
        ?.crossRepositoryEvidence === 0 &&
    challengedEvolution
        ?.scientificReplicationPressure
        ?.sameRepositoryReplications === 0 &&
    challengedEvolution
        ?.scientificReplicationPressure
        ?.repositoriesObserved.includes(
            "example/first-observed-repository"
        ) === true,

conflictedReplicationPressure:
    conflictedEvolution
        ?.scientificReplicationPressure
        ?.sourceProvenanceUnknown === 1 &&
    conflictedEvolution
        ?.scientificReplicationPressure
        ?.crossRepositoryEvidence === 1 &&
    conflictedEvolution
        ?.scientificReplicationPressure
        ?.repositoriesObserved.length === 1 &&
    conflictedEvolution
        ?.scientificReplicationPressure
        ?.repositoriesObserved.includes(
            "example/conflicting-repository"
        ) === true,

heldReplicationPressure:
    heldEvolution
        ?.scientificReplicationPressure
        ?.notApplicable === 1 &&
    heldEvolution
        ?.scientificReplicationPressure
        ?.repositoriesObserved.includes(
            "ten-io-meta/erc8060-reservable"
        ) === true,

duplicateReplicationPressure:
    unchangedEvolution
        ?.scientificReplicationPressure
        ?.duplicates === 1 &&
    unchangedEvolution
        ?.scientificReplicationPressure
        ?.sameRepositoryReplications === 0 &&
    unchangedEvolution
        ?.scientificReplicationPressure
        ?.crossRepositoryEvidence === 0 &&
    unchangedEvolution
        ?.scientificReplicationPressure
        ?.repositoriesObserved.includes(
            "ten-io-meta/erc8060-reservable"
        ) === true,


    confidencePreserved:
        result.states.every(
            state =>
                state.confidence === 78
        ) &&
        result.evolutions.every(
            item =>
                item.confidenceAfter === 78 &&
                item.confidenceDelta === 0
        ),

    statusPreserved:
        result.states.every(
            state =>
                state.status ===
                "SUPPORTED"
        ) &&
        result.evolutions.every(
            item =>
                item.currentStatus ===
                "SUPPORTED"
        ),

    independentSourcesPreserved:
        result.states.every(
            state =>
                state.independentSources === 2
        ) &&
        result.evolutions.every(
            item =>
                item.sourcesAfter === 2 &&
                item.sourceDelta === 0
        ),

    challengeCountRegisteredOnce:
        stateFor(
            knowledgeIds.challenged
        )?.contradictionCount === 1,

    conflictChallengeRegisteredOnce:
        stateFor(
            knowledgeIds.conflicted
        )?.contradictionCount === 1,

    holdDidNotAlterEvidenceState:
        stateFor(
            knowledgeIds.held
        )?.supportingEvidenceIds.length === 0 &&
        stateFor(
            knowledgeIds.held
        )?.contradictoryEvidenceIds.length === 0,

    duplicateDidNotAlterEvidenceState:
        stateFor(
            knowledgeIds.unchanged
        )?.supportingEvidenceIds.length === 0 &&
        stateFor(
            knowledgeIds.unchanged
        )?.contradictoryEvidenceIds.length === 0

};


const pass =
    Object.values(
        checks
    ).every(Boolean);


console.log(
    "\nCONTROLLED SCIENTIFIC KNOWLEDGE EVIDENCE RECONCILIATION:",
    pass
        ? "PASS"
        : "FAIL"
);

console.log(
    "STRENGTHENED TRANSITION:",
    checks.strengthenedTransition
        ? "PASS"
        : "FAIL"
);

console.log(
    "CHALLENGED TRANSITION:",
    checks.challengedTransition
        ? "PASS"
        : "FAIL"
);

console.log(
    "CONFLICTED TRANSITION:",
    checks.conflictedTransition
        ? "PASS"
        : "FAIL"
);

console.log(
    "HELD TRANSITION:",
    checks.heldTransition
        ? "PASS"
        : "FAIL"
);

console.log(
    "UNCHANGED TRANSITION:",
    checks.unchangedTransition
        ? "PASS"
        : "FAIL"
);

console.log(
    "SCIENTIFIC PRESSURE SEMANTICS:",
    (
        checks.strengthenedPressure &&
        checks.challengedPressure &&
        checks.conflictedPressure &&
        checks.heldPressure &&
        checks.duplicateObservedButUnchanged
    )
        ? "PASS"
        : "FAIL"
);
console.log(
    "SCIENTIFIC REPLICATION PRESSURE SEMANTICS:",
    (
        checks.strengthenedReplicationPressure &&
        checks.challengedReplicationPressure &&
        checks.conflictedReplicationPressure &&
        checks.heldReplicationPressure &&
        checks.duplicateReplicationPressure
    )
        ? "PASS"
        : "FAIL"
);
console.log(
    "CONFIDENCE PRESERVED:",
    checks.confidencePreserved
        ? "PASS"
        : "FAIL"
);

console.log(
    "STATUS PRESERVED:",
    checks.statusPreserved
        ? "PASS"
        : "FAIL"
);

console.log(
    "INDEPENDENT SOURCES PRESERVED:",
    checks.independentSourcesPreserved
        ? "PASS"
        : "FAIL"
);

console.log(
    "CONTRADICTIONS NOT DOUBLE COUNTED:",
    (
        checks.challengeCountRegisteredOnce &&
        checks.conflictChallengeRegisteredOnce
    )
        ? "PASS"
        : "FAIL"
);

console.log(
    "HOLD DOES NOT ALTER EVIDENCE STATE:",
    checks.holdDidNotAlterEvidenceState
        ? "PASS"
        : "FAIL"
);

console.log(
    "DUPLICATE DOES NOT ALTER EVIDENCE STATE:",
    checks.duplicateDidNotAlterEvidenceState
        ? "PASS"
        : "FAIL"
);


if (
    !pass
) {

    console.error(
        "\nCONTROLLED RECONCILIATION REGRESSION FAILED."
    );

    console.error(
        JSON.stringify(
            {
                checks,
                evolutions:
                    result.evolutions,
                states:
                    result.states
            },
            null,
            2
        )
    );

    process.exitCode =
        1;

}