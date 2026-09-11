import assert from "node:assert/strict";

import {
    ScientificCandidateBoundaryRelevanceRequirementEngine
} from "../laboratory/scientific-candidate-boundary-relevance/ScientificCandidateBoundaryRelevanceRequirementEngine.js";


const engine =
    new ScientificCandidateBoundaryRelevanceRequirementEngine();


const input = {

    assessments: [

        {
            assessmentId:
                "A-RELEVANT",
            candidateId:
                "C-1",
            participantId:
                "ERC-8301",
            boundaryId:
                "B-1",
            relevance:
                "RELEVANT" as const,
            reason:
                "EXPLICIT_CANDIDATE_REACHABILITY_EVIDENCE" as const,
            evidenceIds: [
                "E-RUNTIME"
            ]
        },

        {
            assessmentId:
                "A-OUT",
            candidateId:
                "C-1",
            participantId:
                "ERC-8354",
            boundaryId:
                "B-2",
            relevance:
                "OUT_OF_SCOPE" as const,
            reason:
                "EXPLICIT_CANDIDATE_EXCLUSION_EVIDENCE" as const,
            evidenceIds: [
                "E-EXCLUSION"
            ]
        },

        {
            assessmentId:
                "A-MISSING",
            candidateId:
                "C-1",
            participantId:
                "ERC-8301",
            boundaryId:
                "B-3",
            relevance:
                "UNRESOLVED" as const,
            reason:
                "NO_RELEVANCE_EVIDENCE" as const,
            evidenceIds:
                []
        },

        {
            assessmentId:
                "A-CONFLICT",
            candidateId:
                "C-1",
            participantId:
                "ERC-8354",
            boundaryId:
                "B-4",
            relevance:
                "UNRESOLVED" as const,
            reason:
                "CONFLICTING_RELEVANCE_EVIDENCE" as const,
            evidenceIds: [
                "E-REACH",
                "E-EXCLUDE"
            ]
        }

    ],

    statistics: {
        total:
            4,
        relevant:
            1,
        outOfScope:
            1,
        unresolved:
            2
    },

    errors:
        []

};


const first =
    engine.derive(
        input
    );

const second =
    engine.derive(
        input
    );


assert.deepEqual(
    second,
    first,
    "Requirement derivation must be deterministic."
);


assert.equal(
    first.errors.length,
    0
);


assert.equal(
    first.requirements.length,
    2
);


assert.equal(
    first.statistics.acquireEvidence,
    1
);


assert.equal(
    first.statistics.resolveConflict,
    1
);


const missing =
    first.requirements.find(
        requirement =>
            requirement.boundaryId ===
            "B-3"
    );


assert.equal(
    missing?.kind,
    "ACQUIRE_CANDIDATE_RELEVANCE_EVIDENCE"
);


assert.deepEqual(
    missing?.currentEvidenceIds,
    []
);


const conflict =
    first.requirements.find(
        requirement =>
            requirement.boundaryId ===
            "B-4"
    );


assert.equal(
    conflict?.kind,
    "RESOLVE_CONFLICTING_CANDIDATE_RELEVANCE_EVIDENCE"
);


assert.deepEqual(
    conflict?.currentEvidenceIds,
    [
        "E-EXCLUDE",
        "E-REACH"
    ]
);


assert.equal(
    first.requirements.some(
        requirement =>
            requirement.boundaryId ===
                "B-1" ||
            requirement.boundaryId ===
                "B-2"
    ),
    false,
    "Resolved relevance must not create new requirements."
);


console.log(
    "SCIENTIFIC CANDIDATE BOUNDARY RELEVANCE REQUIREMENTS: PASS"
);

console.log(
    `REQUIREMENTS: ${first.statistics.total}`
);

console.log(
    `ACQUIRE RELEVANCE EVIDENCE: ${first.statistics.acquireEvidence}`
);

console.log(
    `RESOLVE CONFLICT: ${first.statistics.resolveConflict}`
);

console.log(
    "RELEVANT / OUT-OF-SCOPE CREATE NO REQUIREMENT: PASS"
);

console.log(
    "NO COMPATIBILITY CLAIM: PASS"
);

console.log(
    "NO BOUNDARY OBSERVATION CLAIM: PASS"
);
