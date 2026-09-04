import {
    ScientificBeliefStateTransitionEngine
} from "../laboratory/scientific-belief-state-transition/ScientificBeliefStateTransitionEngine.js";

import type {
    ScientificBeliefTransitionAuthorizationResult
} from "../laboratory/scientific-belief-transition-authorization/ScientificBeliefTransitionAuthorizationResult.js";

import type {
    ScientificEvidenceAssimilationResult
} from "../laboratory/scientific-evidence-assimilation/ScientificEvidenceAssimilationResult.js";

import type {
    ScientificKnowledgeState
} from "../laboratory/scientific-knowledge-evolution/ScientificKnowledgeState.js";


function assert(
    condition: boolean,
    message: string
): void {

    if (!condition) {
        throw new Error(
            `FAIL: ${message}`
        );
    }

    console.log(
        `PASS: ${message}`
    );
}


function createState(
    knowledgeId: string,
    status:
        ScientificKnowledgeState["status"] =
            "SUPPORTED"
): ScientificKnowledgeState {

    const now =
        "2026-09-01T00:00:00.000Z";

    return {

        knowledgeId,

        sourceConclusionId:
            `CONCLUSION-${knowledgeId}`,

        sourcePatternId:
            `PATTERN-${knowledgeId}`,

        sourcePatternRelation:
            "RESERVATION:CONSTRAINS:ACCOUNTING",

        originTargetId:
            `TARGET-${knowledgeId}`,

        statement:
            `Statement ${knowledgeId}`,

        status,

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

        supportingEvidenceIds:
            [],

        contradictoryEvidenceIds:
            [],

        supportingEvidenceIdentities:
            [],

        contradictoryEvidenceIdentities:
            [],

        supportingEvidenceRepositories:
            [],

        contradictoryEvidenceRepositories:
            [],

        validationStatus:
            "NOT_EVALUATED",

        maturityLevel:
            "GROWING",

        confidenceTrend:
            "STABLE",

        evolutionVelocity:
            "STABLE",

        confidenceHistory:
            [78],

        sourceHistory:
            [2],

        statusHistory:
            [status],

        trajectory:
            [],

        firstObservedAt:
            now,

        lastObservedAt:
            now,

        lastStatusChangeAt:
            now,

        lastPromotionAt:
            null,

        lastDegradationAt:
            null
    };
}


const states: ScientificKnowledgeState[] = [

    createState(
        "PRESERVE"
    ),

    createState(
        "DEFER"
    ),

    createState(
        "SUPPORT"
    ),

    createState(
        "CHALLENGE"
    ),

    createState(
        "CONFLICT"
    ),

    createState(
        "REJECTION-GUARD",
        "ESTABLISHED"
    )
];


const assimilation = {

    generatedAt:
        "2026-09-01T00:00:00.000Z",

    campaignId:
        "CONTROLLED-PHASE-9-8",

    assimilations:
        [],

    states,

    statistics: {

        total:
            0,

        assimilated:
            0,

        unchanged:
            0,

        supportingEvidenceAdded:
            0,

        contradictoryEvidenceAdded:
            0
    },

    errors:
        []

} as ScientificEvidenceAssimilationResult;


const authorization = {

    generatedAt:
        "2026-09-01T00:00:00.000Z",

    authorizations: [

        {
            knowledgeId:
                "PRESERVE",

            statement:
                "Statement PRESERVE",

            revisionDecision:
                "PRESERVE",

            decision:
                "NO_CHANGE_REQUIRED",

            direction:
                "NONE",

            scientificEvidenceAssimilated:
                false,

            supportingEvidencePresent:
                false,

            contradictoryEvidencePresent:
                false,

            repositoryReplicationObserved:
                false,

            sameRepositoryReplicationObserved:
                false,

            crossRepositoryEvidenceObserved:
                false,

            repositoryDiversityObserved:
                false,

            sourceIndependenceEstablished:
                false,

            confidenceMutationAuthorized:
                false,

            statusMutationAuthorized:
                false,

            requiresFurtherExperiment:
                false,

            rationale:
                []
        },

        {
            knowledgeId:
                "DEFER",

            statement:
                "Statement DEFER",

            revisionDecision:
                "DEFER",

            decision:
                "NOT_AUTHORIZED",

            direction:
                "NONE",

            scientificEvidenceAssimilated:
                false,

            supportingEvidencePresent:
                false,

            contradictoryEvidencePresent:
                false,

            repositoryReplicationObserved:
                false,

            sameRepositoryReplicationObserved:
                false,

            crossRepositoryEvidenceObserved:
                false,

            repositoryDiversityObserved:
                false,

            sourceIndependenceEstablished:
                false,

            confidenceMutationAuthorized:
                false,

            statusMutationAuthorized:
                false,

            requiresFurtherExperiment:
                true,

            rationale:
                []
        },

        {
            knowledgeId:
                "SUPPORT",

            statement:
                "Statement SUPPORT",

            revisionDecision:
                "REVIEW_SUPPORT",

            decision:
                "AUTHORIZED",

            direction:
                "STRENGTHEN",

            scientificEvidenceAssimilated:
                true,

            supportingEvidencePresent:
                true,

            contradictoryEvidencePresent:
                false,

            repositoryReplicationObserved:
                true,

            sameRepositoryReplicationObserved:
                true,

            crossRepositoryEvidenceObserved:
                false,

            repositoryDiversityObserved:
                false,

            sourceIndependenceEstablished:
                false,

            confidenceMutationAuthorized:
                false,

            statusMutationAuthorized:
                false,

            requiresFurtherExperiment:
                false,

            rationale:
                []
        },

        {
            knowledgeId:
                "CHALLENGE",

            statement:
                "Statement CHALLENGE",

            revisionDecision:
                "REVIEW_CHALLENGE",

            decision:
                "AUTHORIZED",

            direction:
                "CHALLENGE",

            scientificEvidenceAssimilated:
                true,

            supportingEvidencePresent:
                false,

            contradictoryEvidencePresent:
                true,

            repositoryReplicationObserved:
                false,

            sameRepositoryReplicationObserved:
                false,

            crossRepositoryEvidenceObserved:
                false,

            repositoryDiversityObserved:
                false,

            sourceIndependenceEstablished:
                false,

            confidenceMutationAuthorized:
                false,

            statusMutationAuthorized:
                false,

            requiresFurtherExperiment:
                true,

            rationale:
                []
        },

        {
            knowledgeId:
                "CONFLICT",

            statement:
                "Statement CONFLICT",

            revisionDecision:
                "REVIEW_CONFLICT",

            decision:
                "INCONCLUSIVE",

            direction:
                "UNRESOLVED",

            scientificEvidenceAssimilated:
                true,

            supportingEvidencePresent:
                true,

            contradictoryEvidencePresent:
                true,

            repositoryReplicationObserved:
                true,

            sameRepositoryReplicationObserved:
                false,

            crossRepositoryEvidenceObserved:
                true,

            repositoryDiversityObserved:
                true,

            sourceIndependenceEstablished:
                false,

            confidenceMutationAuthorized:
                false,

            statusMutationAuthorized:
                false,

            requiresFurtherExperiment:
                true,

            rationale:
                []
        },

        {
            knowledgeId:
                "REJECTION-GUARD",

            statement:
                "Statement REJECTION-GUARD",

            revisionDecision:
                "REVIEW_CHALLENGE",

            decision:
                "AUTHORIZED",

            direction:
                "CHALLENGE",

            scientificEvidenceAssimilated:
                true,

            supportingEvidencePresent:
                false,

            contradictoryEvidencePresent:
                true,

            repositoryReplicationObserved:
                true,

            sameRepositoryReplicationObserved:
                false,

            crossRepositoryEvidenceObserved:
                true,

            repositoryDiversityObserved:
                true,

            sourceIndependenceEstablished:
                false,

            confidenceMutationAuthorized:
                false,

            statusMutationAuthorized:
                false,

            requiresFurtherExperiment:
                true,

            rationale:
                []
        }

    ],

    statistics: {

        total:
            6,

        authorized:
            3,

        notAuthorized:
            1,

        inconclusive:
            1,

        noChangeRequired:
            1,

        strengthenAuthorized:
            1,

        challengeAuthorized:
            2,

        confidenceMutationAuthorized:
            0,

        statusMutationAuthorized:
            0,

        requiringFurtherExperiment:
            4
    },

    errors:
        []

} as ScientificBeliefTransitionAuthorizationResult;


console.log(
    "\nCONTROLLED SCIENTIFIC BELIEF STATE TRANSITION\n"
);


const result =
    new ScientificBeliefStateTransitionEngine()
        .build(
            authorization,
            assimilation
        );


const transitionById =
    new Map(
        result.transitions.map(
            transition => [
                transition.knowledgeId,
                transition
            ]
        )
    );


const stateById =
    new Map(
        result.states.map(
            state => [
                state.knowledgeId,
                state
            ]
        )
    );


assert(
    transitionById.get("PRESERVE")
        ?.action ===
        "PRESERVE",
    "NO CHANGE REQUIRED PRESERVES STATE"
);


assert(
    transitionById.get("DEFER")
        ?.action ===
        "PRESERVE",
    "NOT AUTHORIZED PRESERVES STATE"
);


assert(
    transitionById.get("SUPPORT")
        ?.action ===
        "RECORD_STRENGTHENING",
    "AUTHORIZED SUPPORT RECORDS STRENGTHENING"
);


assert(
    transitionById.get("SUPPORT")
        ?.evidenceQualified ===
        true,
    "AUTHORIZED SUPPORT IS EVIDENCE QUALIFIED"
);


assert(
    transitionById.get("CHALLENGE")
        ?.action ===
        "RECORD_CHALLENGE",
    "AUTHORIZED CHALLENGE IS RECORDED"
);


assert(
    transitionById.get("CHALLENGE")
        ?.evidenceQualified ===
        true,
    "AUTHORIZED CHALLENGE IS EVIDENCE QUALIFIED"
);


assert(
    transitionById.get("CONFLICT")
        ?.action ===
        "RECORD_CONFLICT",
    "INCONCLUSIVE CONFLICT IS RECORDED"
);


assert(
    stateById.get("SUPPORT")
        ?.confidence ===
        78,
    "SUPPORT DOES NOT INVENT CONFIDENCE"
);


assert(
    stateById.get("SUPPORT")
        ?.independentSources ===
        2,
    "SUPPORT DOES NOT INVENT SOURCE INDEPENDENCE"
);


assert(
    stateById.get("SUPPORT")
        ?.status ===
        "SUPPORTED",
    "SUPPORT DOES NOT AUTO PROMOTE STATUS"
);


assert(
    stateById.get("CHALLENGE")
        ?.confidence ===
        78,
    "CHALLENGE DOES NOT INVENT CONFIDENCE CHANGE"
);


assert(
    stateById.get("CHALLENGE")
        ?.independentSources ===
        2,
    "CHALLENGE DOES NOT ALTER SOURCE COUNT"
);


assert(
    stateById.get("CHALLENGE")
        ?.status ===
        "SUPPORTED",
    "CHALLENGE DOES NOT BYPASS STATUS AUTHORIZATION"
);


assert(
    stateById.get("REJECTION-GUARD")
        ?.status ===
        "ESTABLISHED",
    "CHALLENGE DOES NOT AUTO REJECT KNOWLEDGE"
);


assert(
    result.statistics
        .confidenceChanges ===
        0,
    "ZERO NUMERIC CONFIDENCE CHANGES"
);


assert(
    result.statistics
        .independentSourceChanges ===
        0,
    "ZERO INDEPENDENT SOURCE CHANGES"
);


assert(
    result.statistics
        .statusChanges ===
        0,
    "ZERO LIFECYCLE STATUS CHANGES"
);


assert(
    result.statistics
        .lifecyclePromotions ===
        0,
    "ZERO LIFECYCLE PROMOTIONS"
);


assert(
    result.statistics
        .rejections ===
        0,
    "ZERO AUTOMATIC REJECTIONS"
);


assert(
    result.statistics
        .strengtheningRecorded ===
        1,
    "ONE STRENGTHENING EVENT RECORDED"
);


assert(
    result.statistics
        .challengesRecorded ===
        2,
    "TWO CHALLENGE EVENTS RECORDED"
);


assert(
    result.statistics
        .conflictsRecorded ===
        1,
    "ONE CONFLICT EVENT RECORDED"
);


console.log(
    "\nPHASE 9.8 CONTROLLED REGRESSION PASSED\n"
);