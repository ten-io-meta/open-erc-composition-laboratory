import {
    ScientificCompositionCandidateEvidenceRequirementEngine
} from "../laboratory/scientific-composition-candidate-evidence-requirement/ScientificCompositionCandidateEvidenceRequirementEngine.js";

import type {
    ScientificCompositionCandidateEvidenceGapResult
} from "../laboratory/scientific-composition-candidate-evidence-gap/ScientificCompositionCandidateEvidenceGapResult.js";


let failures =
    0;


function check(
    label:
        string,
    condition:
        boolean
): void {

    console.log(
        `${label}: ${condition ? "PASS" : "FAIL"}`
    );


    if (
        !condition
    ) {

        failures++;

    }

}


const diagnosis:
    ScientificCompositionCandidateEvidenceGapResult = {

        diagnostics: [

            {
                diagnosticId:
                    "DIAGNOSTIC-DOCUMENTARY",

                candidateId:
                    "CANDIDATE-DOCUMENTARY",

                candidateKind:
                    "DOCUMENTARY_COMPOSITION",

                sourceParticipantId:
                    "ERC-8301",

                targetParticipantId:
                    "ERC-8354",

                compatibilityAssessmentId:
                    "ASSESSMENT-DOCUMENTARY",

                compatibilityPolarity:
                    "INCONCLUSIVE",

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
                            "NO_KNOWN_BOUNDARIES",

                        candidateId:
                            "CANDIDATE-DOCUMENTARY",

                        boundaryIds:
                            []
                    },

                    {
                        gapId:
                            "GAP-NO-OBSERVATIONS",

                        kind:
                            "NO_CANDIDATE_COMPATIBILITY_OBSERVATIONS",

                        candidateId:
                            "CANDIDATE-DOCUMENTARY",

                        boundaryIds:
                            []
                    }

                ],

                resolution:
                    "REQUIRES_ADDITIONAL_EVIDENCE"
            },

            {
                diagnosticId:
                    "DIAGNOSTIC-PARTIAL",

                candidateId:
                    "CANDIDATE-PARTIAL",

                candidateKind:
                    "FUNCTIONAL_COMPLEMENTARITY",

                sourceParticipantId:
                    "ERC-8004",

                targetParticipantId:
                    "ERC-9000",

                compatibilityAssessmentId:
                    "ASSESSMENT-PARTIAL",

                compatibilityPolarity:
                    "INCONCLUSIVE",

                knownBoundaryIds: [
                    "BOUNDARY-A",
                    "BOUNDARY-B"
                ],

                observedBoundaryIds: [
                    "BOUNDARY-A"
                ],

                unevaluatedBoundaryIds: [
                    "BOUNDARY-B"
                ],

                compatibilityObservationIds: [
                    "OBS-A"
                ],

                compatibilityEvidenceIds: [
                    "EVIDENCE-A"
                ],

                gaps: [

                    {
                        gapId:
                            "GAP-UNEVALUATED-B",

                        kind:
                            "UNEVALUATED_KNOWN_BOUNDARIES",

                        candidateId:
                            "CANDIDATE-PARTIAL",

                        boundaryIds: [
                            "BOUNDARY-B"
                        ]
                    }

                ],

                resolution:
                    "REQUIRES_ADDITIONAL_EVIDENCE"
            },

            {
                diagnosticId:
                    "DIAGNOSTIC-SUPPORT",

                candidateId:
                    "CANDIDATE-SUPPORT",

                candidateKind:
                    "FUNCTIONAL_COMPLEMENTARITY",

                sourceParticipantId:
                    "ERC-7000",

                targetParticipantId:
                    "ERC-7001",

                compatibilityAssessmentId:
                    "ASSESSMENT-SUPPORT",

                compatibilityPolarity:
                    "SUPPORT",

                knownBoundaryIds: [
                    "BOUNDARY-SUPPORT"
                ],

                observedBoundaryIds: [
                    "BOUNDARY-SUPPORT"
                ],

                unevaluatedBoundaryIds:
                    [],

                compatibilityObservationIds: [
                    "OBS-SUPPORT"
                ],

                compatibilityEvidenceIds: [
                    "EVIDENCE-SUPPORT"
                ],

                gaps:
                    [],

                resolution:
                    "KNOWN_BOUNDARY_PRESERVATION_SUPPORTED"
            },

            {
                diagnosticId:
                    "DIAGNOSTIC-CHALLENGE",

                candidateId:
                    "CANDIDATE-CHALLENGE",

                candidateKind:
                    "DOCUMENTARY_COMPOSITION",

                sourceParticipantId:
                    "ERC-7100",

                targetParticipantId:
                    "ERC-7101",

                compatibilityAssessmentId:
                    "ASSESSMENT-CHALLENGE",

                compatibilityPolarity:
                    "CHALLENGE",

                knownBoundaryIds: [
                    "BOUNDARY-CHALLENGE"
                ],

                observedBoundaryIds: [
                    "BOUNDARY-CHALLENGE"
                ],

                unevaluatedBoundaryIds:
                    [],

                compatibilityObservationIds: [
                    "OBS-CHALLENGE"
                ],

                compatibilityEvidenceIds: [
                    "EVIDENCE-CHALLENGE"
                ],

                gaps:
                    [],

                resolution:
                    "BOUNDARY_CHALLENGED"
            }

        ],

        errors:
            []

    };


const engine =
    new ScientificCompositionCandidateEvidenceRequirementEngine();


const primary =
    engine.derive({

        diagnosis

    });


console.log(
    "\nSCIENTIFIC COMPOSITION CANDIDATE EVIDENCE REQUIREMENT — RUNTIME"
);
console.log(
    "--------------------------------------------------------------"
);


check(
    "VALID REQUIREMENT DERIVATION HAS NO ERRORS",
    primary.errors.length ===
        0
);


check(
    "EVERY DIAGNOSTIC RECEIVES A REQUIREMENT PLAN",
    primary.plans.length ===
        4
);


const documentary =
    primary.plans.find(
        plan =>
            plan.candidateId ===
            "CANDIDATE-DOCUMENTARY"
    );


const partial =
    primary.plans.find(
        plan =>
            plan.candidateId ===
            "CANDIDATE-PARTIAL"
    );


const supported =
    primary.plans.find(
        plan =>
            plan.candidateId ===
            "CANDIDATE-SUPPORT"
    );


const challenged =
    primary.plans.find(
        plan =>
            plan.candidateId ===
            "CANDIDATE-CHALLENGE"
    );


check(
    "ZERO-BOUNDARY CANDIDATE REQUIRES BOUNDARY EVIDENCE ACQUISITION",
    documentary
        ?.requirements
        .some(
            requirement =>
                requirement.kind ===
                    "ACQUIRE_ADDITIONAL_BOUNDARY_EVIDENCE" &&
                requirement.readiness ===
                    "READY"
        ) ===
        true
);


const documentaryObservationRequirement =
    documentary
        ?.requirements
        .find(
            requirement =>
                requirement.kind ===
                "COLLECT_CANDIDATE_BOUNDARY_OBSERVATIONS"
        );


check(
    "ZERO-BOUNDARY OBSERVATION REQUIREMENT IS BLOCKED",
    documentaryObservationRequirement
        ?.readiness ===
        "BLOCKED_BY_PREREQUISITE"
);


check(
    "ZERO-BOUNDARY OBSERVATION REQUIREMENT PRESERVES PREREQUISITE",
    JSON.stringify(
        documentaryObservationRequirement
            ?.blockingGapIds
    ) ===
        JSON.stringify([
            "GAP-NO-BOUNDARIES"
        ])
);


check(
    "BLOCKED OBSERVATION REQUIREMENT DOES NOT INVENT BOUNDARY TARGETS",
    documentaryObservationRequirement
        ?.targetBoundaryIds.length ===
        0
);


const partialRequirement =
    partial
        ?.requirements
        .find(
            requirement =>
                requirement.kind ===
                "COLLECT_CANDIDATE_BOUNDARY_OBSERVATIONS"
        );


check(
    "KNOWN UNEVALUATED BOUNDARY PRODUCES READY OBSERVATION REQUIREMENT",
    partialRequirement
        ?.readiness ===
        "READY"
);


check(
    "KNOWN UNEVALUATED BOUNDARY IS THE EXACT OBSERVATION TARGET",
    JSON.stringify(
        partialRequirement
            ?.targetBoundaryIds
    ) ===
        JSON.stringify([
            "BOUNDARY-B"
        ])
);


check(
    "SUPPORTED BOUNDARY RESULT REQUIRES NO ADDITIONAL EVIDENCE",
    supported?.status ===
        "BOUNDARY_EVIDENCE_RESOLVED" &&
    supported.requirements.length ===
        0
);


check(
    "CHALLENGED BOUNDARY RESULT REQUIRES NO ADDITIONAL EVIDENCE TO ESTABLISH CHALLENGE",
    challenged?.status ===
        "BOUNDARY_EVIDENCE_RESOLVED" &&
    challenged.requirements.length ===
        0
);


check(
    "REQUIREMENTS DO NOT CLAIM AN EXECUTION METHOD",
    primary.plans.every(
        plan =>
            plan.requirements.every(
                requirement =>
                    !(
                        "repository" in
                        requirement
                    ) &&
                    !(
                        "harness" in
                        requirement
                    ) &&
                    !(
                        "opcode" in
                        requirement
                    ) &&
                    !(
                        "experiment" in
                        requirement
                    )
            )
    )
);


const mismatchedGap =
    engine.derive({

        diagnosis: {

            diagnostics: [

                {
                    ...diagnosis.diagnostics[0],

                    gaps: [

                        {
                            ...diagnosis.diagnostics[0]
                                .gaps[0],

                            candidateId:
                                "CANDIDATE-WRONG"
                        },

                        diagnosis.diagnostics[0]
                            .gaps[1]

                    ]

                }

            ],

            errors:
                []

        }

    });


check(
    "GAP CANDIDATE MISMATCH IS DETECTED",
    mismatchedGap.errors.length >
        0
);


check(
    "GAP CANDIDATE MISMATCH FAILS CLOSED",
    mismatchedGap.plans.length ===
        0
);


const missingGap =
    engine.derive({

        diagnosis: {

            diagnostics: [

                {
                    ...diagnosis.diagnostics[1],

                    gaps:
                        []

                }

            ],

            errors:
                []

        }

    });


check(
    "ADDITIONAL-EVIDENCE RESOLUTION WITHOUT GAP IS DETECTED",
    missingGap.errors.length >
        0
);


check(
    "ADDITIONAL-EVIDENCE RESOLUTION WITHOUT GAP FAILS CLOSED",
    missingGap.plans.length ===
        0
);


const duplicateDiagnostic =
    engine.derive({

        diagnosis: {

            diagnostics: [
                diagnosis.diagnostics[0],
                diagnosis.diagnostics[0]
            ],

            errors:
                []

        }

    });


check(
    "DUPLICATE DIAGNOSTIC IS DETECTED",
    duplicateDiagnostic.errors.length >
        0
);


check(
    "DUPLICATE DIAGNOSTIC FAILS CLOSED",
    duplicateDiagnostic.plans.length ===
        0
);


const reverse =
    engine.derive({

        diagnosis: {

            diagnostics:
                [...diagnosis.diagnostics]
                    .reverse(),

            errors:
                []

        }

    });


check(
    "EVIDENCE REQUIREMENT DERIVATION IS DETERMINISTIC",
    JSON.stringify(
        primary
    ) ===
        JSON.stringify(
            reverse
        )
);


if (
    failures >
    0
) {

    console.log(
        `\nRESULT: FAIL (${failures})`
    );

    process.exitCode =
        1;

}
else {

    console.log(
        "\nRESULT: PASS"
    );

}