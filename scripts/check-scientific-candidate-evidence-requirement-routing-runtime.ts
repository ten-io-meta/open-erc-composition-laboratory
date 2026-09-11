import type {
    ScientificCompositionCandidateEvidenceDiagnostic,
    ScientificCompositionCandidateEvidenceGap
} from "../laboratory/scientific-composition-candidate-evidence-gap/ScientificCompositionCandidateEvidenceGap.js";

import type {
    ScientificCompositionCandidateEvidenceGapResult
} from "../laboratory/scientific-composition-candidate-evidence-gap/ScientificCompositionCandidateEvidenceGapResult.js";

import {
    ScientificCandidateEvidenceRequirementRoutingEngine
} from "../laboratory/scientific-candidate-boundary-relevance/ScientificCandidateEvidenceRequirementRoutingEngine.js";


function requireCondition(
    condition:
        boolean,
    message:
        string
): void {

    if (!condition) {
        throw new Error(message);
    }

}


function gap(
    candidateId:
        string,
    gapId:
        string,
    kind:
        ScientificCompositionCandidateEvidenceGap["kind"],
    boundaryIds:
        string[]
): ScientificCompositionCandidateEvidenceGap {

    return {

        gapId,
        kind,
        candidateId,
        boundaryIds:
            [...boundaryIds]

    };

}


function diagnostic(
    diagnosticId:
        string,
    candidateId:
        string,
    gaps:
        ScientificCompositionCandidateEvidenceGap[],
    resolution:
        ScientificCompositionCandidateEvidenceDiagnostic["resolution"] =
            "REQUIRES_ADDITIONAL_EVIDENCE"
): ScientificCompositionCandidateEvidenceDiagnostic {

    return {

        diagnosticId,
        candidateId,

        candidateKind:
            "DOCUMENTARY_COMPOSITION",

        sourceParticipantId:
            "ERC-8301",

        targetParticipantId:
            "ERC-8354",

        compatibilityAssessmentId:
            `COMPATIBILITY-${diagnosticId}`,

        compatibilityPolarity:
            resolution ===
                "KNOWN_BOUNDARY_PRESERVATION_SUPPORTED"
                ? "SUPPORT"
                : "INCONCLUSIVE",

        knownBoundaryIds:
            ["BOUNDARY-RELEVANT"],

        observedBoundaryIds:
            [],

        unevaluatedBoundaryIds:
            ["BOUNDARY-RELEVANT"],

        compatibilityObservationIds:
            [],

        compatibilityEvidenceIds:
            [],

        gaps:
            gaps.map(
                value => ({
                    ...value,
                    boundaryIds:
                        [...value.boundaryIds]
                })
            ),

        resolution

    };

}


const relevanceOnly =
    diagnostic(
        "DIAGNOSTIC-RELEVANCE-ONLY",
        "CANDIDATE-RELEVANCE-ONLY",
        [
            gap(
                "CANDIDATE-RELEVANCE-ONLY",
                "GAP-RELEVANCE-ONLY",
                "UNRESOLVED_CANDIDATE_BOUNDARY_RELEVANCE",
                [
                    "BOUNDARY-UNRESOLVED-A",
                    "BOUNDARY-UNRESOLVED-B"
                ]
            )
        ]
    );


const mixed =
    diagnostic(
        "DIAGNOSTIC-MIXED",
        "CANDIDATE-MIXED",
        [
            gap(
                "CANDIDATE-MIXED",
                "GAP-MIXED-RELEVANCE",
                "UNRESOLVED_CANDIDATE_BOUNDARY_RELEVANCE",
                ["BOUNDARY-UNRESOLVED"]
            ),

            gap(
                "CANDIDATE-MIXED",
                "GAP-MIXED-CLASSIC",
                "UNEVALUATED_KNOWN_BOUNDARIES",
                ["BOUNDARY-RELEVANT"]
            )
        ]
    );


const classic =
    diagnostic(
        "DIAGNOSTIC-CLASSIC",
        "CANDIDATE-CLASSIC",
        [
            gap(
                "CANDIDATE-CLASSIC",
                "GAP-CLASSIC",
                "NO_CANDIDATE_COMPATIBILITY_OBSERVATIONS",
                ["BOUNDARY-RELEVANT"]
            )
        ]
    );


const resolved =
    diagnostic(
        "DIAGNOSTIC-RESOLVED",
        "CANDIDATE-RESOLVED",
        [],
        "KNOWN_BOUNDARY_PRESERVATION_SUPPORTED"
    );


const diagnosis:
    ScientificCompositionCandidateEvidenceGapResult = {

        diagnostics: [
            relevanceOnly,
            mixed,
            classic,
            resolved
        ],

        errors:
            []

    };


const before =
    JSON.stringify(
        diagnosis
    );


const engine =
    new ScientificCandidateEvidenceRequirementRoutingEngine();


const result =
    engine.route({
        diagnosis
    });


requireCondition(
    result.errors.length ===
        0,
    `Unexpected routing errors: ${result.errors.join("; ")}`
);


requireCondition(
    result.legacyDiagnosis.diagnostics.length ===
        3,
    "Relevance-only diagnostic was not excluded from legacy requirement ingress."
);


requireCondition(
    result.relevanceOnlyDiagnosticIds.length ===
        1 &&
    result.relevanceOnlyDiagnosticIds[0] ===
        "DIAGNOSTIC-RELEVANCE-ONLY",
    "Relevance-only diagnostic identity was not recorded deterministically."
);


requireCondition(
    JSON.stringify(
        result.routedRelevanceGapIds
    ) ===
    JSON.stringify([
        "GAP-MIXED-RELEVANCE",
        "GAP-RELEVANCE-ONLY"
    ]),
    "Relevance gap routing identities are incorrect."
);


const routedMixed =
    result.legacyDiagnosis.diagnostics
        .find(
            value =>
                value.diagnosticId ===
                "DIAGNOSTIC-MIXED"
        );


requireCondition(
    routedMixed !==
        undefined,
    "Mixed diagnostic disappeared from legacy requirement ingress."
);


requireCondition(
    routedMixed!.gaps.length ===
        1 &&
    routedMixed!.gaps[0].kind ===
        "UNEVALUATED_KNOWN_BOUNDARIES",
    "Mixed diagnostic did not preserve exactly its classic evidence gap."
);


requireCondition(
    result.legacyDiagnosis.diagnostics
        .some(
            value =>
                value.diagnosticId ===
                "DIAGNOSTIC-CLASSIC"
        ),
    "Classic diagnostic was incorrectly routed away."
);


requireCondition(
    result.legacyDiagnosis.diagnostics
        .some(
            value =>
                value.diagnosticId ===
                "DIAGNOSTIC-RESOLVED"
        ),
    "Resolved no-gap diagnostic was incorrectly routed away."
);


requireCondition(
    JSON.stringify(
        diagnosis
    ) ===
        before,
    "Routing engine mutated the authoritative diagnosis."
);


const deterministic =
    engine.route({
        diagnosis
    });


requireCondition(
    JSON.stringify(result) ===
        JSON.stringify(deterministic),
    "Routing result is not deterministic."
);


console.log(
    "SCIENTIFIC CANDIDATE EVIDENCE REQUIREMENT ROUTING: PASS"
);

console.log(
    "RELEVANCE-ONLY DIAGNOSTIC EXCLUDED FROM LEGACY PIPELINE: PASS"
);

console.log(
    "MIXED DIAGNOSTIC PRESERVES CLASSIC GAPS: PASS"
);

console.log(
    "CLASSIC DIAGNOSTIC PRESERVED: PASS"
);

console.log(
    "RESOLVED DIAGNOSTIC PRESERVED: PASS"
);

console.log(
    "AUTHORITATIVE DIAGNOSIS NOT MUTATED: PASS"
);

console.log(
    "NO COMPATIBILITY CLAIM CREATED: PASS"
);

console.log(
    "ROUTING DETERMINISTIC: PASS"
);