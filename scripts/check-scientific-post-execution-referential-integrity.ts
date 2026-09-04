import {
    ScientificPostExecutionReferentialIntegrityEngine
} from "../laboratory/scientific-post-execution-referential-integrity/ScientificPostExecutionReferentialIntegrityEngine.js";

import type {
    ScientificExecutionEvidenceResult
} from "../laboratory/scientific-execution-evidence/ScientificExecutionEvidenceResult.js";

import type {
    ScientificEvidenceFeedbackResult
} from "../laboratory/scientific-evidence-feedback/ScientificEvidenceFeedbackResult.js";

import type {
    ScientificKnowledgeEvidenceMatchResult
} from "../laboratory/scientific-knowledge-evidence-matcher/ScientificKnowledgeEvidenceMatchResult.js";

import type {
    ScientificEvidenceAssimilationResult
} from "../laboratory/scientific-evidence-assimilation/ScientificEvidenceAssimilationResult.js";

import type {
    ScientificKnowledgeEvolutionResult
} from "../laboratory/scientific-knowledge-evolution/ScientificKnowledgeEvolutionResult.js";

import type {
    ScientificBeliefRevisionResult
} from "../laboratory/scientific-belief-revision/ScientificBeliefRevisionResult.js";

import type {
    ScientificBeliefTransitionAuthorizationResult
} from "../laboratory/scientific-belief-transition-authorization/ScientificBeliefTransitionAuthorizationResult.js";

import type {
    ScientificBeliefStateTransitionResult
} from "../laboratory/scientific-belief-state-transition/ScientificBeliefStateTransitionResult.js";


const campaignId =
    "CONTROLLED-POST-EXECUTION-INTEGRITY";


function clone<T>(
    value: T
): T {

    return JSON.parse(
        JSON.stringify(
            value
        )
    ) as T;

}


function assert(
    condition: boolean,
    message: string
): void {

    if (!condition) {

        throw new Error(
            `FAIL - ${message}`
        );

    }

    console.log(
        `PASS - ${message}`
    );

}


const executionEvidence =
    {
        generatedAt:
            "2026-09-02T00:00:00.000Z",

        campaignId,

        evidence: [
            {
                evidenceId:
                    "EVIDENCE-00001",

                campaignId,

                observationId:
                    "OBSERVATION-00001",

                outcomeId:
                    "OUTCOME-00001",

                executionPlanId:
                    "PLAN-00001",

                executionTaskId:
                    "TASK-00001",

                experimentId:
                    "EXPERIMENT-00001",

                targetType:
                    "THEORY",

                targetId:
                    "KNOWLEDGE-00001",

                sourceConclusionId:
                    "CONCLUSION-00001",

                sourceIds: [
                    "SOURCE-00001"
                ],

                targetEvidenceIds: [
                    "EDGE-00001"
                ],

                stepId:
                    "STEP-00001",

                stepType:
                    "TEST_EXECUTION",

                repository:
                    "controlled/repository-a",

                status:
                    "SUPPORTING",

                statement:
                    "Controlled post-execution evidence.",

                sourceEvidence: [
                    "Controlled evidence."
                ],

                sourceObservations: [
                    "Controlled observation."
                ]
            }
        ],

        statistics: {},

        errors: []
    } as unknown as
        ScientificExecutionEvidenceResult;


const feedback =
    {
        generatedAt:
            "2026-09-02T00:01:00.000Z",

        campaignId,

        feedback: [
            {
                feedbackId:
                    "FEEDBACK-00001",

                campaignId,

                evidenceId:
                    "EVIDENCE-00001",

                observationId:
                    "OBSERVATION-00001",

                outcomeId:
                    "OUTCOME-00001",

                experimentId:
                    "EXPERIMENT-00001",

                targetType:
                    "THEORY",

                targetId:
                    "KNOWLEDGE-00001",

                sourceConclusionId:
                    "CONCLUSION-00001",

                sourceIds: [
                    "SOURCE-00001"
                ],

                targetEvidenceIds: [
                    "EDGE-00001"
                ],

                executionPlanId:
                    "PLAN-00001",

                executionTaskId:
                    "TASK-00001",

                stepId:
                    "STEP-00001",

                stepType:
                    "TEST_EXECUTION",

                repository:
                    "controlled/repository-a",

                action:
                    "STRENGTHEN",

                statement:
                    "Controlled post-execution evidence.",

                sourceEvidence: [
                    "Controlled evidence."
                ],

                sourceObservations: [
                    "Controlled observation."
                ],

                generatedAt:
                    "2026-09-02T00:01:00.000Z",

                explanation:
                    "Controlled feedback."
            }
        ],

        statistics: {
            total: 1,
            strengthen: 1,
            challenge: 0,
            hold: 0
        },

        errors: []
    } as
        ScientificEvidenceFeedbackResult;


const matches =
    {
        generatedAt:
            "2026-09-02T00:02:00.000Z",

        campaignId,

        matches: [
            {
                matchId:
                    "MATCH-00001",

                campaignId,

                feedbackId:
                    "FEEDBACK-00001",

                sourceConclusionId:
                    "CONCLUSION-00001",

                evidenceId:
                    "EVIDENCE-00001",

                experimentId:
                    "EXPERIMENT-00001",

                sourceIds: [
                    "SOURCE-00001"
                ],

                targetEvidenceIds: [
                    "EDGE-00001"
                ],

                executionPlanId:
                    "PLAN-00001",

                executionTaskId:
                    "TASK-00001",

                stepId:
                    "STEP-00001",

                repository:
                    "controlled/repository-a",

                feedbackAction:
                    "STRENGTHEN",

                matchStatus:
                    "MATCHED",

                knowledgeId:
                    "KNOWLEDGE-00001",

                candidateKnowledgeIds: [
                    "KNOWLEDGE-00001"
                ],

                matchMethod:
                    "EXPLICIT_KNOWLEDGE_ID",

                statement:
                    "Controlled post-execution evidence.",

                generatedAt:
                    "2026-09-02T00:02:00.000Z",

                explanation:
                    "Controlled match."
            }
        ],

        statistics: {
            total: 1,
            matched: 1,
            ambiguous: 0,
            unmatched: 0,
            strengthenMatched: 1,
            challengeMatched: 0,
            holdMatched: 0,
            sourceConclusionIdMatches: 0,
            explicitKnowledgeIdMatches: 1,
            exactCanonicalStatementMatches: 0
        },

        errors: []
    } as
        ScientificKnowledgeEvidenceMatchResult;


const assimilation =
    {
        generatedAt:
            "2026-09-02T00:03:00.000Z",

        campaignId,

        assimilations: [
            {
                assimilationId:
                    "ASSIMILATION-00001",

                knowledgeId:
                    "KNOWLEDGE-00001",

                evidenceId:
                    "EVIDENCE-00001",

                evidenceIdentity:
                    [
                        "EXPERIMENT-00001",
                        "PLAN-00001",
                        "TASK-00001",
                        "STEP-00001",
                        "STRENGTHEN"
                    ].join(":"),

                repository:
                    "controlled/repository-a",

                action:
                    "STRENGTHEN",

                replicationClassification:
                    "FIRST_REPOSITORY_OBSERVATION",

                assimilated:
                    true,

                explanation:
                    "Controlled assimilation."
            }
        ],

        states: [],

        statistics: {
            total: 1,
            assimilated: 1,
            unchanged: 0,
            supportingEvidenceAdded: 1,
            contradictoryEvidenceAdded: 0
        },

        errors: []
    } as
        ScientificEvidenceAssimilationResult;


const reconciliation =
    {
        generatedAt:
            "2026-09-02T00:04:00.000Z",

        campaignId,

        evolutions: [
            {
                evolutionId:
                    "EVOLUTION-00001",

                knowledgeId:
                    "KNOWLEDGE-00001",

                sourceConclusionId:
                    "CONCLUSION-00001",

                sourcePatternId:
                    "PATTERN-00001",

                sourcePatternRelation:
                    "A:SUPPORTS:B",

                originTargetId:
                    "KNOWLEDGE-00001",

                statement:
                    "Controlled post-execution evidence.",

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
                    1,

                scientificEvidencePressure: {
                    strengthened: 1,
                    challenged: 0,
                    held: 0,
                    newlyAssimilated: 1,
                    supportingEvidenceIds: [
                        "EVIDENCE-00001"
                    ],
                    contradictoryEvidenceIds: []
                },

                scientificEvidenceTransition:
                    "STRENGTHENED",

                scientificReplicationPressure: {
                    duplicates: 0,
                    firstRepositoryObservations: 1,
                    sameRepositoryReplications: 0,
                    crossRepositoryEvidence: 0,
                    sourceProvenanceUnknown: 0,
                    notApplicable: 0,
                    repositoriesObserved: [
                        "controlled/repository-a"
                    ]
                },

                explanation:
                    "Controlled reconciliation."
            }
        ],

        states: [],

        statistics: {
            totalKnowledge: 1,
            evolutions: 1,
            discovered: 0,
            promoted: 0,
            degraded: 0,
            stabilized: 0,
            challenged: 0,
            refuted: 0,
            recovered: 0,
            unchanged: 1,
            archived: 0,
            averageConfidence: 78
        },

        errors: []
    } as
        ScientificKnowledgeEvolutionResult;


const beliefRevision =
    {
        generatedAt:
            "2026-09-02T00:05:00.000Z",

        revisions: [
            {
                knowledgeId:
                    "KNOWLEDGE-00001",

                statement:
                    "Controlled post-execution evidence.",

                decision:
                    "REVIEW_SUPPORT",

                evidenceTransition:
                    "STRENGTHENED",

                newlyAssimilatedEvidence:
                    1,

                supportingEvidenceAdded:
                    1,

                contradictoryEvidenceAdded:
                    0,

                repositoryDiversityObserved:
                    false,

                repositoriesObserved: [
                    "controlled/repository-a"
                ],

                duplicateEvidenceObserved:
                    false,

                sameRepositoryReplicationObserved:
                    false,

                crossRepositoryEvidenceObserved:
                    false,

                sourceProvenanceUnknown:
                    false,

                sourceIndependenceEstablished:
                    false,

                automaticConfidenceChange:
                    false,

                automaticStatusChange:
                    false,

                requiresScientificReview:
                    true,

                requiresFurtherExperiment:
                    false,

                rationale: [
                    "Controlled revision."
                ]
            }
        ],

        statistics: {} as never,

        errors: []
    } as
        ScientificBeliefRevisionResult;


const authorization =
    {
        generatedAt:
            "2026-09-02T00:06:00.000Z",

        authorizations: [
            {
                knowledgeId:
                    "KNOWLEDGE-00001",

                statement:
                    "Controlled post-execution evidence.",

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

                rationale: [
                    "Controlled authorization."
                ]
            }
        ],

        statistics: {} as never,

        errors: []
    } as
        ScientificBeliefTransitionAuthorizationResult;


const stateTransition =
    {
        generatedAt:
            "2026-09-02T00:07:00.000Z",

        transitions: [
            {
                knowledgeId:
                    "KNOWLEDGE-00001",

                statement:
                    "Controlled post-execution evidence.",

                action:
                    "RECORD_STRENGTHENING",

                authorizationDecision:
                    "AUTHORIZED",

                authorizedDirection:
                    "STRENGTHEN",

                statusBefore:
                    "SUPPORTED",

                statusAfter:
                    "SUPPORTED",

                confidenceBefore:
                    78,

                confidenceAfter:
                    78,

                independentSourcesBefore:
                    2,

                independentSourcesAfter:
                    2,

                confidenceChanged:
                    false,

                independentSourcesChanged:
                    false,

                statusChanged:
                    false,

                lifecyclePromotionApplied:
                    false,

                rejectionApplied:
                    false,

                evidenceQualified:
                    true,

                confidenceMutationAuthorized:
                    false,

                statusMutationAuthorized:
                    false,

                sourceIndependenceEstablished:
                    false,

                requiresFurtherExperiment:
                    false,

                rationale: [
                    "Controlled transition."
                ]
            }
        ],

        states: [],

        statistics: {} as never,

        errors: []
    } as
        ScientificBeliefStateTransitionResult;


function run(
    executionEvidenceInput =
        executionEvidence,
    feedbackInput =
        feedback,
    matchesInput =
        matches,
    assimilationInput =
        assimilation,
    reconciliationInput =
        reconciliation,
    beliefRevisionInput =
        beliefRevision,
    authorizationInput =
        authorization,
    stateTransitionInput =
        stateTransition
) {

    return new ScientificPostExecutionReferentialIntegrityEngine()
        .build(
            campaignId,
            executionEvidenceInput,
            feedbackInput,
            matchesInput,
            assimilationInput,
            reconciliationInput,
            beliefRevisionInput,
            authorizationInput,
            stateTransitionInput
        );

}


console.log(
    "\nCONTROLLED SCIENTIFIC POST-EXECUTION REFERENTIAL INTEGRITY\n"
);


/*
 * Case 1.
 * Clean complete lineage.
 */

const clean =
    run();

assert(
    clean.valid === true &&
    clean.issues.length === 0,
    "clean post-execution lineage accepted"
);


/*
 * Case 2.
 * Broken Evidence -> Feedback.
 */

const brokenFeedback =
    clone(
        feedback
    );

brokenFeedback.feedback[0].evidenceId =
    "MISSING-EVIDENCE";

const brokenFeedbackResult =
    run(
        executionEvidence,
        brokenFeedback
    );

assert(
    brokenFeedbackResult.issues.some(
        issue =>
            issue.status ===
            "BROKEN_FEEDBACK_EVIDENCE_REFERENCE"
    ),
    "broken Evidence -> Feedback detected"
);


/*
 * Case 3.
 * Feedback -> Match carries a valid feedback reference
 * but corrupted execution provenance.
 */

const corruptedMatch =
    clone(
        matches
    );

corruptedMatch.matches[0].executionTaskId =
    "TASK-CORRUPTED";

const corruptedMatchResult =
    run(
        executionEvidence,
        feedback,
        corruptedMatch
    );

assert(
    corruptedMatchResult.issues.some(
        issue =>
            issue.status ===
            "MATCH_FEEDBACK_PROVENANCE_MISMATCH"
    ),
    "Feedback -> Match provenance mutation detected"
);


/*
 * Case 4.
 * Assimilation keeps evidence/knowledge IDs but
 * corrupts physical evidence identity.
 */

const corruptedAssimilation =
    clone(
        assimilation
    );

corruptedAssimilation
    .assimilations[0]
    .evidenceIdentity =
        "CORRUPTED:EVIDENCE:IDENTITY";

const corruptedAssimilationResult =
    run(
        executionEvidence,
        feedback,
        matches,
        corruptedAssimilation
    );

assert(
    corruptedAssimilationResult.issues.some(
        issue =>
            issue.status ===
            "ASSIMILATION_MATCH_PROVENANCE_MISMATCH"
    ),
    "Match -> Assimilation provenance mutation detected"
);


/*
 * Case 5.
 * Reconciliation drops the evidence that actually
 * produced supporting epistemic pressure.
 */

const corruptedReconciliation =
    clone(
        reconciliation
    );

corruptedReconciliation
    .evolutions[0]
    .scientificEvidencePressure!
    .supportingEvidenceIds =
        [];

const corruptedReconciliationResult =
    run(
        executionEvidence,
        feedback,
        matches,
        assimilation,
        corruptedReconciliation
    );

assert(
    corruptedReconciliationResult.issues.some(
        issue =>
            issue.status ===
            "RECONCILIATION_EVIDENCE_PRESSURE_MISMATCH"
    ),
    "Assimilation -> Reconciliation evidence drift detected"
);


/*
 * Case 6.
 * Revision references the correct knowledge item
 * but reports the wrong epistemic transition.
 */

const corruptedRevision =
    clone(
        beliefRevision
    );

corruptedRevision
    .revisions[0]
    .evidenceTransition =
        "CHALLENGED";

const corruptedRevisionResult =
    run(
        executionEvidence,
        feedback,
        matches,
        assimilation,
        reconciliation,
        corruptedRevision
    );

assert(
    corruptedRevisionResult.issues.some(
        issue =>
            issue.status ===
            "REVISION_RECONCILIATION_MISMATCH"
    ),
    "Reconciliation -> Revision semantic drift detected"
);


/*
 * Case 7.
 * Authorization keeps the knowledgeId but no longer
 * refers to the actual revision decision.
 */

const corruptedAuthorization =
    clone(
        authorization
    );

corruptedAuthorization
    .authorizations[0]
    .revisionDecision =
        "REVIEW_CHALLENGE";

const corruptedAuthorizationResult =
    run(
        executionEvidence,
        feedback,
        matches,
        assimilation,
        reconciliation,
        beliefRevision,
        corruptedAuthorization
    );

assert(
    corruptedAuthorizationResult.issues.some(
        issue =>
            issue.status ===
            "AUTHORIZATION_REVISION_MISMATCH"
    ),
    "Revision -> Authorization lineage drift detected"
);


/*
 * Case 8.
 * State transition keeps the same knowledgeId but
 * mutates the authorization decision.
 */

const corruptedTransition =
    clone(
        stateTransition
    );

corruptedTransition
    .transitions[0]
    .authorizationDecision =
        "NOT_AUTHORIZED";

const corruptedTransitionResult =
    run(
        executionEvidence,
        feedback,
        matches,
        assimilation,
        reconciliation,
        beliefRevision,
        authorization,
        corruptedTransition
    );

assert(
    corruptedTransitionResult.issues.some(
        issue =>
            issue.status ===
            "TRANSITION_AUTHORIZATION_MISMATCH"
    ),
    "Authorization -> StateTransition lineage drift detected"
);



/*
 * Case 9.
 * Additional Authorization exists without any
 * corresponding belief revision.
 */

const orphanAuthorization =
    clone(
        authorization
    );

const extraAuthorization =
    clone(
        orphanAuthorization.authorizations[0]
    );

extraAuthorization.knowledgeId =
    "KNOWLEDGE-ORPHAN-AUTHORIZATION";

orphanAuthorization.authorizations.push(
    extraAuthorization
);

const orphanAuthorizationResult =
    run(
        executionEvidence,
        feedback,
        matches,
        assimilation,
        reconciliation,
        beliefRevision,
        orphanAuthorization,
        stateTransition
    );

assert(
    orphanAuthorizationResult.issues.some(
        issue =>
            issue.status ===
                "BROKEN_AUTHORIZATION_REVISION_REFERENCE" &&
            issue.entityType ===
                "AUTHORIZATION" &&
            issue.entityId ===
                "KNOWLEDGE-ORPHAN-AUTHORIZATION"
    ),
    "orphan Authorization without Revision detected"
);


/*
 * Case 10.
 * Additional StateTransition exists without any
 * corresponding authorization.
 */

const orphanTransition =
    clone(
        stateTransition
    );

const extraTransition =
    clone(
        orphanTransition.transitions[0]
    );

extraTransition.knowledgeId =
    "KNOWLEDGE-ORPHAN-TRANSITION";

orphanTransition.transitions.push(
    extraTransition
);

const orphanTransitionResult =
    run(
        executionEvidence,
        feedback,
        matches,
        assimilation,
        reconciliation,
        beliefRevision,
        authorization,
        orphanTransition
    );

assert(
    orphanTransitionResult.issues.some(
        issue =>
            issue.status ===
                "BROKEN_TRANSITION_AUTHORIZATION_REFERENCE" &&
            issue.entityType ===
                "TRANSITION" &&
            issue.entityId ===
                "KNOWLEDGE-ORPHAN-TRANSITION"
    ),
    "orphan StateTransition without Authorization detected"
);

console.log(
    "\nPASS - scientific post-execution referential integrity regression\n"
);
