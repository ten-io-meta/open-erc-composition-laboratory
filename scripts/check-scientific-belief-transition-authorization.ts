import {
    ScientificBeliefTransitionAuthorizationEngine
} from "../laboratory/scientific-belief-transition-authorization/ScientificBeliefTransitionAuthorizationEngine.js";

import type {
    ScientificBeliefRevision
} from "../laboratory/scientific-belief-revision/ScientificBeliefRevision.js";

import type {
    ScientificBeliefRevisionResult
} from "../laboratory/scientific-belief-revision/ScientificBeliefRevisionResult.js";

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

function revision(
    knowledgeId: string,
    decision:
        | "PRESERVE"
        | "REVIEW_SUPPORT"
        | "REVIEW_CHALLENGE"
        | "REVIEW_CONFLICT"
        | "DEFER",
    options?: {
        newlyAssimilatedEvidence?: number;
        supportingEvidenceAdded?: number;
        contradictoryEvidenceAdded?: number;
        sameRepositoryReplicationObserved?: boolean;
        crossRepositoryEvidenceObserved?: boolean;
        repositoryDiversityObserved?: boolean;
        sourceProvenanceUnknown?: boolean;
    }
): ScientificBeliefRevision {

    const evidenceTransition =
        decision === "REVIEW_SUPPORT"
            ? "STRENGTHENED"
            : decision === "REVIEW_CHALLENGE"
                ? "CHALLENGED"
                : decision === "REVIEW_CONFLICT"
                    ? "CONFLICTED"
                    : decision === "DEFER"
                        ? "HELD"
                        : "UNCHANGED";

    return {

        knowledgeId,

        statement:
            `Controlled belief ${knowledgeId}`,

        decision,

        evidenceTransition,

        newlyAssimilatedEvidence:
            options?.newlyAssimilatedEvidence ?? 0,

        supportingEvidenceAdded:
            options?.supportingEvidenceAdded ?? 0,

        contradictoryEvidenceAdded:
            options?.contradictoryEvidenceAdded ?? 0,

        repositoryDiversityObserved:
            options?.repositoryDiversityObserved ?? false,

        repositoriesObserved: [],

        duplicateEvidenceObserved:
            false,

        sameRepositoryReplicationObserved:
            options?.sameRepositoryReplicationObserved ?? false,

        crossRepositoryEvidenceObserved:
            options?.crossRepositoryEvidenceObserved ?? false,

        sourceProvenanceUnknown:
            options?.sourceProvenanceUnknown ?? false,

        sourceIndependenceEstablished:
            false,

        automaticConfidenceChange:
            false,

        automaticStatusChange:
            false,

        requiresScientificReview:
            decision === "REVIEW_SUPPORT" ||
            decision === "REVIEW_CHALLENGE" ||
            decision === "REVIEW_CONFLICT",

        requiresFurtherExperiment:
            decision === "REVIEW_CHALLENGE" ||
            decision === "REVIEW_CONFLICT" ||
            decision === "DEFER",

        rationale: [
            "Controlled Phase 9.7 regression fixture."
        ]

    };

}

const revisions: ScientificBeliefRevision[] = [

    revision(
        "PRESERVE",
        "PRESERVE"
    ),

    revision(
        "DEFER",
        "DEFER"
    ),

    revision(
        "SUPPORT",
        "REVIEW_SUPPORT",
        {
            newlyAssimilatedEvidence: 1,
            supportingEvidenceAdded: 1,
            sameRepositoryReplicationObserved: true
        }
    ),

    revision(
        "CHALLENGE",
        "REVIEW_CHALLENGE",
        {
            newlyAssimilatedEvidence: 1,
            contradictoryEvidenceAdded: 1,
            sourceProvenanceUnknown: true
        }
    ),

    revision(
        "CONFLICT",
        "REVIEW_CONFLICT",
        {
            newlyAssimilatedEvidence: 2,
            supportingEvidenceAdded: 1,
            contradictoryEvidenceAdded: 1,
            crossRepositoryEvidenceObserved: true,
            repositoryDiversityObserved: true
        }
    ),

    /*
     * Deliberately inconsistent fixtures.
     *
     * They prove that REVIEW_* alone cannot authorize
     * a scientific transition.
     */
    revision(
        "FALSE-SUPPORT",
        "REVIEW_SUPPORT",
        {
            newlyAssimilatedEvidence: 0,
            supportingEvidenceAdded: 0
        }
    ),

    revision(
        "FALSE-CHALLENGE",
        "REVIEW_CHALLENGE",
        {
            newlyAssimilatedEvidence: 0,
            contradictoryEvidenceAdded: 0
        }
    ),

    revision(
        "MIXED-SUPPORT",
        "REVIEW_SUPPORT",
        {
            newlyAssimilatedEvidence: 2,
            supportingEvidenceAdded: 1,
            contradictoryEvidenceAdded: 1
        }
    ),

    revision(
        "MIXED-CHALLENGE",
        "REVIEW_CHALLENGE",
        {
            newlyAssimilatedEvidence: 2,
            supportingEvidenceAdded: 1,
            contradictoryEvidenceAdded: 1
        }
    )
];

const input: ScientificBeliefRevisionResult = {

    generatedAt:
        new Date().toISOString(),

    revisions,

    statistics: {
        total: revisions.length,
        preserve: 1,
        reviewSupport: 3,
        reviewChallenge: 3,
        reviewConflict: 1,
        defer: 1,
        requiringScientificReview: 7,
        requiringFurtherExperiment: 4,
        repositoryDiversityObserved: 1,
        sourceIndependenceEstablished: 0,
        automaticConfidenceChanges: 0,
        automaticStatusChanges: 0
    },

    errors: []

};

const result =
    new ScientificBeliefTransitionAuthorizationEngine()
        .build(
            input
        );

const byKnowledge =
    new Map(
        result.authorizations.map(
            authorization => [
                authorization.knowledgeId,
                authorization
            ]
        )
    );

console.log(
    "\nCONTROLLED SCIENTIFIC BELIEF TRANSITION AUTHORIZATION\n"
);

assert(
    byKnowledge.get("PRESERVE")
        ?.decision ===
        "NO_CHANGE_REQUIRED",
    "PRESERVE REQUIRES NO CHANGE"
);

assert(
    byKnowledge.get("DEFER")
        ?.decision ===
        "NOT_AUTHORIZED",
    "HOLD DOES NOT AUTHORIZE TRANSITION"
);

assert(
    byKnowledge.get("SUPPORT")
        ?.decision ===
        "AUTHORIZED" &&
    byKnowledge.get("SUPPORT")
        ?.direction ===
        "STRENGTHEN",
    "UNAMBIGUOUS SUPPORT AUTHORIZES STRENGTHEN DIRECTION"
);

assert(
    byKnowledge.get("CHALLENGE")
        ?.decision ===
        "AUTHORIZED" &&
    byKnowledge.get("CHALLENGE")
        ?.direction ===
        "CHALLENGE",
    "UNAMBIGUOUS CONTRADICTION AUTHORIZES CHALLENGE DIRECTION"
);

assert(
    byKnowledge.get("CONFLICT")
        ?.decision ===
        "INCONCLUSIVE" &&
    byKnowledge.get("CONFLICT")
        ?.direction ===
        "UNRESOLVED",
    "CONFLICT DOES NOT AUTHORIZE A DIRECTION"
);

assert(
    byKnowledge.get("FALSE-SUPPORT")
        ?.decision ===
        "NOT_AUTHORIZED",
    "REVIEW SUPPORT WITHOUT NEW SUPPORT IS NOT AUTHORIZED"
);

assert(
    byKnowledge.get("FALSE-CHALLENGE")
        ?.decision ===
        "NOT_AUTHORIZED",
    "REVIEW CHALLENGE WITHOUT NEW CONTRADICTION IS NOT AUTHORIZED"
);

assert(
    byKnowledge.get("MIXED-SUPPORT")
        ?.decision ===
        "NOT_AUTHORIZED",
    "MIXED EVIDENCE CANNOT AUTHORIZE SUPPORT"
);

assert(
    byKnowledge.get("MIXED-CHALLENGE")
        ?.decision ===
        "NOT_AUTHORIZED",
    "MIXED EVIDENCE CANNOT AUTHORIZE CHALLENGE"
);

assert(
    byKnowledge.get("SUPPORT")
        ?.sameRepositoryReplicationObserved ===
        true &&
    byKnowledge.get("SUPPORT")
        ?.sourceIndependenceEstablished ===
        false,
    "SAME REPOSITORY REPLICATION DOES NOT CREATE SOURCE INDEPENDENCE"
);

assert(
    byKnowledge.get("CONFLICT")
        ?.repositoryDiversityObserved ===
        true &&
    byKnowledge.get("CONFLICT")
        ?.sourceIndependenceEstablished ===
        false,
    "REPOSITORY DIVERSITY DOES NOT CREATE SOURCE INDEPENDENCE"
);

assert(
    result.authorizations.every(
        authorization =>
            authorization
                .confidenceMutationAuthorized ===
            false
    ),
    "NO NUMERIC CONFIDENCE MUTATION AUTHORIZED"
);

assert(
    result.authorizations.every(
        authorization =>
            authorization
                .statusMutationAuthorized ===
            false
    ),
    "NO LIFECYCLE STATUS MUTATION AUTHORIZED"
);

assert(
    result.statistics
        .confidenceMutationAuthorized === 0,
    "ZERO CONFIDENCE MUTATIONS"
);

assert(
    result.statistics
        .statusMutationAuthorized === 0,
    "ZERO STATUS MUTATIONS"
);

console.log(
    "\nPHASE 9.7 CONTROLLED REGRESSION PASSED\n"
);