import {
    ScientificEvidenceAssimilationEngine
} from "../laboratory/scientific-evidence-assimilation/ScientificEvidenceAssimilationEngine.js";

import type {
    ScientificKnowledgeState
} from "../laboratory/scientific-knowledge-evolution/ScientificKnowledgeState.js";

import type {
    ScientificKnowledgeEvolutionResult
} from "../laboratory/scientific-knowledge-evolution/ScientificKnowledgeEvolutionResult.js";

import type {
    ScientificKnowledgeEvidenceMatch
} from "../laboratory/scientific-knowledge-evidence-matcher/ScientificKnowledgeEvidenceMatch.js";

import type {
    ScientificKnowledgeEvidenceMatchResult
} from "../laboratory/scientific-knowledge-evidence-matcher/ScientificKnowledgeEvidenceMatchResult.js";


const campaignId =
    "CONTROLLED-REPLICATION-CAMPAIGN";


const repositoryA =
    "ten-io-meta/erc8060-reservable";


const repositoryB =
    "example-independent/repository";


const knowledgeId =
    "CONTROLLED-KNOWLEDGE-00001";


const existingEvidenceIdentity =
    [
        "EXPERIMENT-00001",
        "PLAN-00001",
        "TASK-00001",
        "STEP-00001",
        "STRENGTHEN"
    ].join(":");


const baseState: ScientificKnowledgeState = {

    knowledgeId,

    sourceConclusionId:
        "CONCLUSION-00001",

    sourcePatternId:
        "PATTERN-00001",

    sourcePatternRelation:
        "RESERVATION:CONSTRAINS:ACCOUNTING",

    originTargetId:
        "THEORY:THEORY-00001",

    statement:
        "Reservation constrains accounting.",

    status:
        "SUPPORTED",

    confidence:
        78,

    independentSources:
        2,

    campaignsObserved:
        3,

    consecutiveStableCampaigns:
        2,

    contradictionCount:
        0,

    supportingEvidenceIds:
        [
            "EVIDENCE-EXISTING"
        ],

    contradictoryEvidenceIds:
        [],

    supportingEvidenceIdentities:
        [
            existingEvidenceIdentity
        ],

    contradictoryEvidenceIdentities:
        [],

    supportingEvidenceRepositories:
        [
            repositoryA
        ],

    contradictoryEvidenceRepositories:
        [],

    validationStatus:
        "VALIDATED",

    maturityLevel:
        "GROWING",

    confidenceTrend:
        "STABLE",

    evolutionVelocity:
        "NORMAL",

    confidenceHistory:
        [
            78,
            78
        ],

    sourceHistory:
        [
            2,
            2
        ],

    statusHistory:
        [
            "SUPPORTED",
            "SUPPORTED"
        ],

    trajectory:
        [
            "CONTROLLED INITIAL STATE"
        ],

    firstObservedAt:
        "2026-09-01T00:00:00.000Z",

    lastObservedAt:
        "2026-09-01T00:00:00.000Z",

    lastStatusChangeAt:
        null,

    lastPromotionAt:
        null,

    lastDegradationAt:
        null

};


const duplicateMatch =
    matchFor({

        evidenceId:
            "EVIDENCE-DUPLICATE",

        experimentId:
            "EXPERIMENT-00001",

        executionPlanId:
            "PLAN-00001",

        executionTaskId:
            "TASK-00001",

        stepId:
            "STEP-00001",

        repository:
            repositoryA

    });


const sameRepositoryReplication =
    matchFor({

        evidenceId:
            "EVIDENCE-SAME-REPOSITORY",

        experimentId:
            "EXPERIMENT-00002",

        executionPlanId:
            "PLAN-00002",

        executionTaskId:
            "TASK-00002",

        stepId:
            "STEP-00002",

        repository:
            repositoryA

    });


const crossRepositoryEvidence =
    matchFor({

        evidenceId:
            "EVIDENCE-CROSS-REPOSITORY",

        experimentId:
            "EXPERIMENT-00003",

        executionPlanId:
            "PLAN-00003",

        executionTaskId:
            "TASK-00003",

        stepId:
            "STEP-00003",

        repository:
            repositoryB

    });


const unknownRepositoryEvidence =
    matchFor({

        evidenceId:
            "EVIDENCE-UNKNOWN-REPOSITORY",

        experimentId:
            "EXPERIMENT-00004",

        executionPlanId:
            "PLAN-00004",

        executionTaskId:
            "TASK-00004",

        stepId:
            "STEP-00004",

        repository:
            null

    });
const holdEvidence =
    matchFor({

        evidenceId:
            "EVIDENCE-HOLD",

        experimentId:
            "EXPERIMENT-00005",

        executionPlanId:
            "PLAN-00005",

        executionTaskId:
            "TASK-00005",

        stepId:
            "STEP-00005",

        repository:
            repositoryA,

        feedbackAction:
            "HOLD"

    });

const evolution =
    {

        generatedAt:
            "2026-09-01T00:00:00.000Z",

        campaignId,

        states:
            [
                baseState
            ]

    } as ScientificKnowledgeEvolutionResult;


const matches =
    {

        generatedAt:
            "2026-09-01T00:00:00.000Z",

        campaignId,

        matches:
    [
        duplicateMatch,
        sameRepositoryReplication,
        crossRepositoryEvidence,
        unknownRepositoryEvidence,
        holdEvidence
    ],

        errors:
            []

    } as ScientificKnowledgeEvidenceMatchResult;


const result =
    new ScientificEvidenceAssimilationEngine().build(
        campaignId,
        evolution,
        matches
    );


const state =
    result.states.find(
        item =>
            item.knowledgeId ===
            knowledgeId
    );


if (!state) {

    throw new Error(
        "Controlled knowledge state was not returned."
    );

}


const duplicateAssimilation =
    result.assimilations.find(
        item =>
            item.evidenceId ===
            "EVIDENCE-DUPLICATE"
    );


const sameRepositoryAssimilation =
    result.assimilations.find(
        item =>
            item.evidenceId ===
            "EVIDENCE-SAME-REPOSITORY"
    );


const crossRepositoryAssimilation =
    result.assimilations.find(
        item =>
            item.evidenceId ===
            "EVIDENCE-CROSS-REPOSITORY"
    );


const unknownRepositoryAssimilation =
    result.assimilations.find(
        item =>
            item.evidenceId ===
            "EVIDENCE-UNKNOWN-REPOSITORY"
    );
const holdAssimilation =
    result.assimilations.find(
        item =>
            item.evidenceId ===
            "EVIDENCE-HOLD"
    );

assert(
    duplicateAssimilation?.assimilated === false,
    "Exact evidence identity must remain a duplicate."
);

assert(
    duplicateAssimilation?.replicationClassification ===
        "DUPLICATE",
    "Exact duplicate evidence must be classified as DUPLICATE."
);
assert(
    sameRepositoryAssimilation?.assimilated === true,
    "New execution evidence from the same repository must remain assimilable."
);
assert(
    sameRepositoryAssimilation?.replicationClassification ===
        "SAME_REPOSITORY_REPLICATION",
    "New evidence from an already observed repository must be classified as SAME_REPOSITORY_REPLICATION."
);

assert(
    sameRepositoryAssimilation?.repository ===
        repositoryA,
    "Same-repository execution provenance must be preserved."
);


assert(
    crossRepositoryAssimilation?.assimilated === true,
    "New execution evidence from another repository must remain assimilable."
);
assert(
    crossRepositoryAssimilation?.replicationClassification ===
        "CROSS_REPOSITORY_EVIDENCE",
    "New evidence from a previously unobserved repository must be classified as CROSS_REPOSITORY_EVIDENCE."
);

assert(
    crossRepositoryAssimilation?.repository ===
        repositoryB,
    "Cross-repository execution provenance must be preserved."
);


assert(
    unknownRepositoryAssimilation?.assimilated === true,
    "Evidence with unknown repository provenance must remain assimilable."
);

assert(
    unknownRepositoryAssimilation?.replicationClassification ===
        "SOURCE_PROVENANCE_UNKNOWN",
    "Evidence without repository provenance must be classified as SOURCE_PROVENANCE_UNKNOWN."
);

assert(
    unknownRepositoryAssimilation?.repository === null,
    "Unknown repository provenance must remain null."
);

assert(
    holdAssimilation?.assimilated === false,
    "HOLD evidence must not be assimilated."
);


assert(
    holdAssimilation?.replicationClassification ===
        "NOT_APPLICABLE",
    "HOLD evidence must be classified as NOT_APPLICABLE."
);

assert(
    state.independentSources === 2,
    "Execution evidence must not automatically change independentSources."
);


assert(
    state.confidence === 78,
    "Execution evidence must not automatically change confidence."
);


assert(
    state.status === "SUPPORTED",
    "Execution evidence must not automatically change scientific status."
);


assert(
    state.supportingEvidenceRepositories.includes(
        repositoryA
    ),
    "Existing repository provenance must be preserved."
);


assert(
    state.supportingEvidenceRepositories.includes(
        repositoryB
    ),
    "New cross-repository provenance must be recorded."
);


assert(
    state.supportingEvidenceRepositories.length === 2,
    "Repeated evidence from the same repository must not duplicate repository provenance."
);


assert(
    !state.supportingEvidenceRepositories.includes(
        ""
    ),
    "Unknown repository provenance must not fabricate an empty repository identity."
);


console.log(
    "CONTROLLED SCIENTIFIC EVIDENCE REPLICATION SEMANTICS: PASS"
);

console.log(
    "EXACT DUPLICATE NOT REASSIMILATED: PASS"
);

console.log(
    "SAME REPOSITORY NEW EXECUTION ASSIMILATED: PASS"
);

console.log(
    "CROSS REPOSITORY EVIDENCE ASSIMILATED: PASS"
);

console.log(
    "UNKNOWN REPOSITORY PROVENANCE PRESERVED: PASS"
);

console.log(
    "REPOSITORY HISTORY PRESERVED: PASS"
);

console.log(
    "REPOSITORY HISTORY DEDUPLICATED: PASS"
);

console.log(
    "INDEPENDENT SOURCES NOT INCREMENTED: PASS"
);

console.log(
    "CONFIDENCE PRESERVED: PASS"
);

console.log(
    "STATUS PRESERVED: PASS"
);

console.log(
    "HOLD REPLICATION CLASSIFICATION NOT APPLICABLE: PASS"
);
/*
 * FIRST REPOSITORY OBSERVATION
 *
 * A knowledge state with no previously observed repository
 * receives new scientific evidence with repository provenance.
 *
 * This must be recorded as the first repository observation,
 * not as cross-repository evidence and not as an independent
 * scientific source.
 */
const firstRepositoryKnowledgeId =
    "CONTROLLED-KNOWLEDGE-FIRST-REPOSITORY";


const firstRepositoryState:
    ScientificKnowledgeState = {

        ...baseState,

        knowledgeId:
            firstRepositoryKnowledgeId,

        sourceConclusionId:
            "CONCLUSION-FIRST-REPOSITORY",

        sourcePatternId:
            "PATTERN-FIRST-REPOSITORY",

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
            []

    };


const firstRepositoryEvolution =
    {

        generatedAt:
            "2026-09-01T00:00:00.000Z",

        campaignId,

        states:
            [
                firstRepositoryState
            ]

    } as ScientificKnowledgeEvolutionResult;


const firstRepositoryMatch:
    ScientificKnowledgeEvidenceMatch = {

        matchId:
            "MATCH-EVIDENCE-FIRST-REPOSITORY",

        campaignId,

        feedbackId:
            "FEEDBACK-EVIDENCE-FIRST-REPOSITORY",

        evidenceId:
            "EVIDENCE-FIRST-REPOSITORY",

        experimentId:
            "EXPERIMENT-FIRST-REPOSITORY",

        targetEvidenceIds:
            [],

        executionPlanId:
            "PLAN-FIRST-REPOSITORY",

        executionTaskId:
            "TASK-FIRST-REPOSITORY",

        stepId:
            "STEP-FIRST-REPOSITORY",

        repository:
            repositoryA,

        feedbackAction:
            "STRENGTHEN",

        matchStatus:
            "MATCHED",

        knowledgeId:
            firstRepositoryKnowledgeId,

        candidateKnowledgeIds:
            [
                firstRepositoryKnowledgeId
            ],

        matchMethod:
            "EXPLICIT_KNOWLEDGE_ID",

        statement:
            "Controlled first repository observation.",

        generatedAt:
            "2026-09-01T00:00:00.000Z",

        explanation:
            "Controlled Phase 9.5 first repository observation fixture."

    };


const firstRepositoryMatches =
    {

        generatedAt:
            "2026-09-01T00:00:00.000Z",

        campaignId,

        matches:
            [
                firstRepositoryMatch
            ],

        errors:
            []

    } as ScientificKnowledgeEvidenceMatchResult;


const firstRepositoryResult =
    new ScientificEvidenceAssimilationEngine().build(
        campaignId,
        firstRepositoryEvolution,
        firstRepositoryMatches
    );


const firstRepositoryAssimilation =
    firstRepositoryResult.assimilations.find(
        item =>
            item.evidenceId ===
            "EVIDENCE-FIRST-REPOSITORY"
    );


const firstRepositoryResultState =
    firstRepositoryResult.states.find(
        item =>
            item.knowledgeId ===
            firstRepositoryKnowledgeId
    );


assert(
    firstRepositoryAssimilation?.assimilated === true,
    "First repository evidence must remain assimilable."
);


assert(
    firstRepositoryAssimilation?.replicationClassification ===
        "FIRST_REPOSITORY_OBSERVATION",
    "First repository evidence must be classified as FIRST_REPOSITORY_OBSERVATION."
);


assert(
    firstRepositoryAssimilation?.repository ===
        repositoryA,
    "First repository provenance must be preserved."
);


assert(
    firstRepositoryResultState
        ?.supportingEvidenceRepositories
        .includes(
            repositoryA
        ) === true,
    "First repository observation must be registered in repository provenance."
);


assert(
    firstRepositoryResultState
        ?.supportingEvidenceRepositories
        .length === 1,
    "First repository observation must register exactly one repository."
);


assert(
    firstRepositoryResultState
        ?.independentSources === 2,
    "First repository observation must not increment independentSources."
);


assert(
    firstRepositoryResultState
        ?.confidence === 78,
    "First repository observation must not change confidence."
);


assert(
    firstRepositoryResultState
        ?.status === "SUPPORTED",
    "First repository observation must not change scientific status."
);


console.log(
    "FIRST REPOSITORY OBSERVATION CLASSIFIED: PASS"
);

console.log(
    "FIRST REPOSITORY PROVENANCE REGISTERED: PASS"
);

console.log(
    "FIRST REPOSITORY DOES NOT INCREMENT INDEPENDENT SOURCES: PASS"
);

console.log(
    "FIRST REPOSITORY PRESERVES CONFIDENCE AND STATUS: PASS"
);
function matchFor(
    input: {
        evidenceId: string;
        experimentId: string;
        executionPlanId: string;
        executionTaskId: string;
        stepId: string;
        repository: string | null;
        feedbackAction?:
            "STRENGTHEN" |
            "CHALLENGE" |
            "HOLD";
    }
): ScientificKnowledgeEvidenceMatch {

    return {

        matchId:
            `MATCH-${input.evidenceId}`,

        campaignId,

        feedbackId:
            `FEEDBACK-${input.evidenceId}`,

        evidenceId:
            input.evidenceId,

        experimentId:
            input.experimentId,

        targetEvidenceIds:
            [],

        executionPlanId:
            input.executionPlanId,

        executionTaskId:
            input.executionTaskId,

        stepId:
            input.stepId,

        repository:
            input.repository,

        feedbackAction:
    input.feedbackAction ??
    "STRENGTHEN",

        matchStatus:
            "MATCHED",

        knowledgeId,

        candidateKnowledgeIds:
            [
                knowledgeId
            ],

        matchMethod:
            "EXPLICIT_KNOWLEDGE_ID",

        statement:
            "Controlled replication evidence.",

        generatedAt:
            "2026-09-01T00:00:00.000Z",

        explanation:
            "Controlled Phase 9.5 replication fixture."

    };

}


function assert(
    condition: boolean,
    message: string
): void {

    if (!condition) {

        throw new Error(
            message
        );

    }

}