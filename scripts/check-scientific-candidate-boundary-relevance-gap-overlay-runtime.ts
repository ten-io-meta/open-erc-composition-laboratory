import assert from "node:assert/strict";

import {
    ScientificCandidateBoundaryRelevanceGapOverlayEngine
} from "../laboratory/scientific-candidate-boundary-relevance/ScientificCandidateBoundaryRelevanceGapOverlayEngine.js";


const engine =
    new ScientificCandidateBoundaryRelevanceGapOverlayEngine();


const unresolvedOnlyDiagnosis = {

    diagnostics: [

        {
            diagnosticId:
                "DIAGNOSTIC-1",

            candidateId:
                "CANDIDATE-1",

            candidateKind:
                "DOCUMENTARY_COMPOSITION" as const,

            sourceParticipantId:
                "ERC-8301",

            targetParticipantId:
                "ERC-8354",

            compatibilityAssessmentId:
                "ASSESSMENT-1",

            compatibilityPolarity:
                "INCONCLUSIVE" as const,

            knownBoundaryIds:
                [],

            observedBoundaryIds:
                [],

            unevaluatedBoundaryIds:
                [],

            compatibilityObservationIds:
                [],

            compatibilityEvidenceIds:
                [],

            gaps: [

                {
                    gapId:
                        "GAP-NO-BOUNDARIES",

                    kind:
                        "NO_KNOWN_BOUNDARIES" as const,

                    candidateId:
                        "CANDIDATE-1",

                    boundaryIds:
                        []
                },

                {
                    gapId:
                        "GAP-NO-OBSERVATIONS",

                    kind:
                        "NO_CANDIDATE_COMPATIBILITY_OBSERVATIONS" as const,

                    candidateId:
                        "CANDIDATE-1",

                    boundaryIds:
                        []
                }

            ],

            resolution:
                "REQUIRES_ADDITIONAL_EVIDENCE" as const
        }

    ],

    errors:
        []

};


const unresolvedAssessments = [

    {
        assessmentId:
            "REL-8301",

        candidateId:
            "CANDIDATE-1",

        participantId:
            "ERC-8301",

        boundaryId:
            "BOUNDARY-8301",

        relevance:
            "UNRESOLVED" as const,

        reason:
            "NO_RELEVANCE_EVIDENCE" as const,

        evidenceIds:
            []
    },

    {
        assessmentId:
            "REL-8354",

        candidateId:
            "CANDIDATE-1",

        participantId:
            "ERC-8354",

        boundaryId:
            "BOUNDARY-8354",

        relevance:
            "UNRESOLVED" as const,

        reason:
            "NO_RELEVANCE_EVIDENCE" as const,

        evidenceIds:
            []
    }

];


const first =
    engine.apply({

        diagnosis:
            unresolvedOnlyDiagnosis,

        relevanceAssessments:
            unresolvedAssessments

    });


const second =
    engine.apply({

        diagnosis:
            unresolvedOnlyDiagnosis,

        relevanceAssessments:
            unresolvedAssessments

    });


assert.deepEqual(
    second,
    first,
    "Relevance-gap overlay must be deterministic."
);


assert.equal(
    first.errors.length,
    0
);


const unresolvedDiagnostic =
    first.diagnostics[0];


assert.equal(
    unresolvedDiagnostic.gaps.length,
    1,
    "Only the unresolved-relevance gap should remain."
);


assert.equal(
    unresolvedDiagnostic.gaps[0].kind,
    "UNRESOLVED_CANDIDATE_BOUNDARY_RELEVANCE"
);


assert.deepEqual(
    unresolvedDiagnostic.gaps[0].boundaryIds,
    [
        "BOUNDARY-8301",
        "BOUNDARY-8354"
    ]
);


assert.equal(
    unresolvedDiagnostic.gaps.some(
        gap =>
            gap.kind ===
            "NO_KNOWN_BOUNDARIES"
    ),
    false,
    "Known protocol boundaries with unresolved relevance must not be reported as absent."
);


assert.equal(
    unresolvedDiagnostic.gaps.some(
        gap =>
            gap.kind ===
            "NO_CANDIDATE_COMPATIBILITY_OBSERVATIONS"
    ),
    false,
    "Compatibility observation collection must wait until at least one boundary is RELEVANT."
);


/*
 * Mixed case:
 *
 * one boundary is already candidate-relevant while another remains
 * unresolved. Existing compatibility evidence gaps for the relevant
 * boundary must remain, while relevance resolution proceeds in parallel.
 */
const mixedDiagnosis = {

    diagnostics: [

        {
            diagnosticId:
                "DIAGNOSTIC-2",

            candidateId:
                "CANDIDATE-2",

            candidateKind:
                "DOCUMENTARY_COMPOSITION" as const,

            sourceParticipantId:
                "ERC-A",

            targetParticipantId:
                "ERC-B",

            compatibilityAssessmentId:
                "ASSESSMENT-2",

            compatibilityPolarity:
                "INCONCLUSIVE" as const,

            knownBoundaryIds: [
                "BOUNDARY-RELEVANT"
            ],

            observedBoundaryIds:
                [],

            unevaluatedBoundaryIds: [
                "BOUNDARY-RELEVANT"
            ],

            compatibilityObservationIds:
                [],

            compatibilityEvidenceIds:
                [],

            gaps: [

                {
                    gapId:
                        "GAP-NO-OBS-2",

                    kind:
                        "NO_CANDIDATE_COMPATIBILITY_OBSERVATIONS" as const,

                    candidateId:
                        "CANDIDATE-2",

                    boundaryIds: [
                        "BOUNDARY-RELEVANT"
                    ]
                },

                {
                    gapId:
                        "GAP-UNEVALUATED-2",

                    kind:
                        "UNEVALUATED_KNOWN_BOUNDARIES" as const,

                    candidateId:
                        "CANDIDATE-2",

                    boundaryIds: [
                        "BOUNDARY-RELEVANT"
                    ]
                }

            ],

            resolution:
                "REQUIRES_ADDITIONAL_EVIDENCE" as const
        }

    ],

    errors:
        []

};


const mixed =
    engine.apply({

        diagnosis:
            mixedDiagnosis,

        relevanceAssessments: [

            {
                assessmentId:
                    "REL-RELEVANT",

                candidateId:
                    "CANDIDATE-2",

                participantId:
                    "ERC-A",

                boundaryId:
                    "BOUNDARY-RELEVANT",

                relevance:
                    "RELEVANT" as const,

                reason:
                    "EXPLICIT_CANDIDATE_REACHABILITY_EVIDENCE" as const,

                evidenceIds: [
                    "EVIDENCE-REACH"
                ]
            },

            {
                assessmentId:
                    "REL-UNRESOLVED",

                candidateId:
                    "CANDIDATE-2",

                participantId:
                    "ERC-B",

                boundaryId:
                    "BOUNDARY-UNRESOLVED",

                relevance:
                    "UNRESOLVED" as const,

                reason:
                    "NO_RELEVANCE_EVIDENCE" as const,

                evidenceIds:
                    []
            }

        ]

    });


assert.equal(
    mixed.errors.length,
    0
);


assert.equal(
    mixed.diagnostics[0].gaps.some(
        gap =>
            gap.kind ===
            "NO_CANDIDATE_COMPATIBILITY_OBSERVATIONS"
    ),
    true,
    "Known relevant boundaries may continue collecting compatibility observations."
);


assert.equal(
    mixed.diagnostics[0].gaps.some(
        gap =>
            gap.kind ===
            "UNEVALUATED_KNOWN_BOUNDARIES"
    ),
    true
);


assert.equal(
    mixed.diagnostics[0].gaps.some(
        gap =>
            gap.kind ===
            "UNRESOLVED_CANDIDATE_BOUNDARY_RELEVANCE"
    ),
    true
);


const legacyPassthrough =
    engine.apply({

        diagnosis:
            unresolvedOnlyDiagnosis,

        relevanceAssessments:
            []

    });


assert.deepEqual(
    legacyPassthrough,
    unresolvedOnlyDiagnosis,
    "Without relevance ingress the legacy diagnosis must remain unchanged."
);


console.log(
    "SCIENTIFIC CANDIDATE RELEVANCE GAP OVERLAY: PASS"
);

console.log(
    "UNRESOLVED RELEVANCE REPLACES FALSE NO_KNOWN_BOUNDARIES: PASS"
);

console.log(
    "PREMATURE COMPATIBILITY OBSERVATION GAP SUPPRESSED: PASS"
);

console.log(
    "MIXED RELEVANT + UNRESOLVED STATE PRESERVED: PASS"
);

console.log(
    "LEGACY NO-RELEVANCE INGRESS PASSTHROUGH: PASS"
);

console.log(
    "NO COMPATIBILITY CLAIM CREATED: PASS"
);
