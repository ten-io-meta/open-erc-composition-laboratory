import {
    ScientificBeliefRevisionEngine
} from "../laboratory/scientific-belief-revision/ScientificBeliefRevisionEngine.js";

import type {
    ScientificKnowledgeEvolution
} from "../laboratory/scientific-knowledge-evolution/ScientificKnowledgeEvolution.js";

import type {
    ScientificKnowledgeEvolutionResult
} from "../laboratory/scientific-knowledge-evolution/ScientificKnowledgeEvolutionResult.js";

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

function evolution(
    knowledgeId: string,
    transition:
        | "STRENGTHENED"
        | "CHALLENGED"
        | "CONFLICTED"
        | "HELD"
        | "UNCHANGED",
    options?: {
        strengthened?: number;
        challenged?: number;
        held?: number;
        newlyAssimilated?: number;
        duplicates?: number;
        sameRepositoryReplications?: number;
        crossRepositoryEvidence?: number;
        sourceProvenanceUnknown?: number;
        notApplicable?: number;
        repositoriesObserved?: string[];
    }
): ScientificKnowledgeEvolution {

    return {

        evolutionId:
            `EVOLUTION-${knowledgeId}`,

        knowledgeId,

        statement:
            `Controlled belief ${knowledgeId}`,

        evolutionType:
            "UNCHANGED",

        previousStatus:
            "SUPPORTED",

        currentStatus:
            "SUPPORTED",

        previousConfidence:
            78,

        currentConfidence:
            78,

        confidenceDelta:
            0,

        previousIndependentSources:
            2,

        currentIndependentSources:
            2,

        independentSourceDelta:
            0,

        scientificEvidenceTransition:
            transition,

        scientificEvidencePressure: {

            strengthened:
                options?.strengthened ?? 0,

            challenged:
                options?.challenged ?? 0,

            held:
                options?.held ?? 0,

            newlyAssimilated:
                options?.newlyAssimilated ?? 0,

            supportingEvidenceIds: [],

            contradictoryEvidenceIds: []
        },

        scientificReplicationPressure: {

            duplicates:
                options?.duplicates ?? 0,

            firstRepositoryObservations:
                0,

            sameRepositoryReplications:
                options
                    ?.sameRepositoryReplications ??
                0,

            crossRepositoryEvidence:
                options
                    ?.crossRepositoryEvidence ??
                0,

            sourceProvenanceUnknown:
                options
                    ?.sourceProvenanceUnknown ??
                0,

            notApplicable:
                options?.notApplicable ?? 0,

            repositoriesObserved:
                options?.repositoriesObserved ?? []
        },

        explanation:
            "Controlled Phase 9.6 regression fixture."

    } as ScientificKnowledgeEvolution;

}

const evolutions: ScientificKnowledgeEvolution[] = [

    evolution(
        "PRESERVE",
        "UNCHANGED",
        {
            duplicates: 1,
            repositoriesObserved: [
                "ten-io-meta/erc8060-reservable"
            ]
        }
    ),

    evolution(
        "DEFER",
        "HELD",
        {
            held: 1,
            notApplicable: 1,
            repositoriesObserved: [
                "ten-io-meta/erc8060-reservable"
            ]
        }
    ),

    evolution(
        "SUPPORT",
        "STRENGTHENED",
        {
            strengthened: 1,
            newlyAssimilated: 1,
            sameRepositoryReplications: 1,
            repositoriesObserved: [
                "ten-io-meta/erc8060-reservable"
            ]
        }
    ),

    evolution(
        "CHALLENGE",
        "CHALLENGED",
        {
            challenged: 1,
            newlyAssimilated: 1,
            sourceProvenanceUnknown: 1
        }
    ),

    evolution(
        "CONFLICT",
        "CONFLICTED",
        {
            strengthened: 1,
            challenged: 1,
            newlyAssimilated: 2,
            crossRepositoryEvidence: 1,
            repositoriesObserved: [
                "ten-io-meta/erc8060-reservable",
                "example-independent/repository"
            ]
        }
    )
];

const reconciliation = {

    generatedAt:
        new Date().toISOString(),

    campaignId:
        "CONTROLLED-PHASE-9-6",

    evolutions,

    states: [],

    statistics: {
        totalKnowledge: 0,
        evolutions: evolutions.length,
        discovered: 0,
        promoted: 0,
        degraded: 0,
        stabilized: 0,
        challenged: 0,
        refuted: 0,
        recovered: 0,
        unchanged: evolutions.length,
        archived: 0,
        averageConfidence: 78
    },

    errors: []

} as ScientificKnowledgeEvolutionResult;

const result =
    new ScientificBeliefRevisionEngine().build(
        reconciliation
    );

const byKnowledge =
    new Map(
        result.revisions.map(
            revision => [
                revision.knowledgeId,
                revision
            ]
        )
    );

console.log(
    "\nCONTROLLED SCIENTIFIC BELIEF REVISION\n"
);

assert(
    byKnowledge.get("PRESERVE")
        ?.decision === "PRESERVE",
    "UNCHANGED PRESERVES BELIEF"
);

assert(
    byKnowledge.get("DEFER")
        ?.decision === "DEFER",
    "HOLD DEFERS BELIEF REVISION"
);

assert(
    byKnowledge.get("SUPPORT")
        ?.decision === "REVIEW_SUPPORT",
    "SUPPORT REQUIRES REVIEW BEFORE PROMOTION"
);

assert(
    byKnowledge.get("CHALLENGE")
        ?.decision === "REVIEW_CHALLENGE",
    "CHALLENGE REQUIRES REVIEW WITHOUT AUTO-REJECTION"
);

assert(
    byKnowledge.get("CONFLICT")
        ?.decision === "REVIEW_CONFLICT",
    "CONFLICT REQUIRES SCIENTIFIC RESOLUTION"
);

assert(
    byKnowledge.get("SUPPORT")
        ?.sameRepositoryReplicationObserved ===
        true,
    "SAME REPOSITORY REPLICATION PRESERVED"
);

assert(
    byKnowledge.get("CONFLICT")
        ?.crossRepositoryEvidenceObserved ===
        true,
    "CROSS REPOSITORY EVIDENCE PRESERVED"
);

assert(
    byKnowledge.get("CONFLICT")
        ?.repositoryDiversityObserved ===
        true,
    "REPOSITORY DIVERSITY OBSERVED"
);

assert(
    result.revisions.every(
        revision =>
            revision
                .sourceIndependenceEstablished ===
            false
    ),
    "SOURCE INDEPENDENCE NOT INVENTED"
);

assert(
    result.revisions.every(
        revision =>
            revision
                .automaticConfidenceChange ===
            false
    ),
    "NO AUTOMATIC CONFIDENCE MUTATION"
);

assert(
    result.revisions.every(
        revision =>
            revision
                .automaticStatusChange ===
            false
    ),
    "NO AUTOMATIC STATUS MUTATION"
);

assert(
    result.statistics
        .sourceIndependenceEstablished === 0,
    "ZERO INVENTED INDEPENDENT SOURCES"
);

assert(
    result.statistics
        .automaticConfidenceChanges === 0,
    "ZERO AUTOMATIC CONFIDENCE CHANGES"
);

assert(
    result.statistics
        .automaticStatusChanges === 0,
    "ZERO AUTOMATIC STATUS CHANGES"
);

assert(
    result.statistics.reviewSupport === 1 &&
    result.statistics.reviewChallenge === 1 &&
    result.statistics.reviewConflict === 1 &&
    result.statistics.defer === 1 &&
    result.statistics.preserve === 1,
    "ALL BELIEF REVISION DECISIONS COVERED"
);

console.log(
    "\nPHASE 9.6 CONTROLLED REGRESSION PASSED\n"
);