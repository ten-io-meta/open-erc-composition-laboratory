import {
    ScientificCompositionCandidateEvidenceSpecificationEngine
} from "../laboratory/scientific-composition-candidate-evidence-specification/ScientificCompositionCandidateEvidenceSpecificationEngine.js";

import type {
    ScientificCompositionCandidateEvidenceRequirementResult
} from "../laboratory/scientific-composition-candidate-evidence-requirement/ScientificCompositionCandidateEvidenceRequirementResult.js";


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


const requirements:
    ScientificCompositionCandidateEvidenceRequirementResult = {

        plans: [

            {
                planId:
                    "PLAN-DOCUMENTARY",

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

                evidenceResolution:
                    "REQUIRES_ADDITIONAL_EVIDENCE",

                status:
                    "ADDITIONAL_EVIDENCE_REQUIRED",

                requirements: [

                    {
                        requirementId:
                            "REQ-BOUNDARY-ACQUISITION",

                        candidateId:
                            "CANDIDATE-DOCUMENTARY",

                        kind:
                            "ACQUIRE_ADDITIONAL_BOUNDARY_EVIDENCE",

                        triggeringGapIds: [
                            "GAP-NO-BOUNDARIES"
                        ],

                        targetBoundaryIds:
                            [],

                        readiness:
                            "READY",

                        blockingGapIds:
                            []
                    },

                    {
                        requirementId:
                            "REQ-DOCUMENTARY-OBSERVATIONS",

                        candidateId:
                            "CANDIDATE-DOCUMENTARY",

                        kind:
                            "COLLECT_CANDIDATE_BOUNDARY_OBSERVATIONS",

                        triggeringGapIds: [
                            "GAP-NO-OBSERVATIONS"
                        ],

                        targetBoundaryIds:
                            [],

                        readiness:
                            "BLOCKED_BY_PREREQUISITE",

                        blockingGapIds: [
                            "GAP-NO-BOUNDARIES"
                        ]
                    }

                ]

            },

            {
                planId:
                    "PLAN-PARTIAL",

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

                evidenceResolution:
                    "REQUIRES_ADDITIONAL_EVIDENCE",

                status:
                    "ADDITIONAL_EVIDENCE_REQUIRED",

                requirements: [

                    {
                        requirementId:
                            "REQ-PARTIAL-OBSERVATION",

                        candidateId:
                            "CANDIDATE-PARTIAL",

                        kind:
                            "COLLECT_CANDIDATE_BOUNDARY_OBSERVATIONS",

                        triggeringGapIds: [
                            "GAP-UNEVALUATED-B"
                        ],

                        targetBoundaryIds: [
                            "BOUNDARY-B"
                        ],

                        readiness:
                            "READY",

                        blockingGapIds:
                            []
                    }

                ]

            },

            {
                planId:
                    "PLAN-SUPPORT",

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

                evidenceResolution:
                    "KNOWN_BOUNDARY_PRESERVATION_SUPPORTED",

                status:
                    "BOUNDARY_EVIDENCE_RESOLVED",

                requirements:
                    []

            },

            {
                planId:
                    "PLAN-CHALLENGE",

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

                evidenceResolution:
                    "BOUNDARY_CHALLENGED",

                status:
                    "BOUNDARY_EVIDENCE_RESOLVED",

                requirements:
                    []

            }

        ],

        errors:
            []

    };


const engine =
    new ScientificCompositionCandidateEvidenceSpecificationEngine();


const primary =
    engine.build({

        requirements

    });


console.log(
    "\nSCIENTIFIC COMPOSITION CANDIDATE EVIDENCE SPECIFICATION — RUNTIME"
);
console.log(
    "----------------------------------------------------------------"
);


check(
    "VALID SPECIFICATION BUILD HAS NO ERRORS",
    primary.errors.length ===
        0
);


check(
    "ONLY READY REQUIREMENTS BECOME SPECIFICATIONS",
    primary.specifications.length ===
        2
);


check(
    "BLOCKED REQUIREMENT DOES NOT BECOME SPECIFICATION",
    primary.specifications.every(
        specification =>
            specification.requirementId !==
            "REQ-DOCUMENTARY-OBSERVATIONS"
    )
);


check(
    "BLOCKED REQUIREMENT IS PRESERVED EXPLICITLY",
    primary.blockedRequirements.length ===
        1 &&
    primary.blockedRequirements[0].requirementId ===
        "REQ-DOCUMENTARY-OBSERVATIONS" &&
    primary.blockedRequirements[0].status ===
        "BLOCKED_BY_PREREQUISITE"
);


check(
    "BLOCKED REQUIREMENT PRESERVES PREREQUISITE GAP",
    JSON.stringify(
        primary.blockedRequirements[0]
            ?.blockingGapIds
    ) ===
        JSON.stringify([
            "GAP-NO-BOUNDARIES"
        ])
);


const boundaryAcquisition =
    primary.specifications.find(
        specification =>
            specification.requirementId ===
            "REQ-BOUNDARY-ACQUISITION"
    );


check(
    "BOUNDARY ACQUISITION REQUIREMENT BECOMES BOUNDARY EVIDENCE SPECIFICATION",
    boundaryAcquisition
        ?.specificationKind ===
        "BOUNDARY_EVIDENCE_ACQUISITION"
);


check(
    "BOUNDARY ACQUISITION DOES NOT INVENT TARGET BOUNDARIES",
    boundaryAcquisition
        ?.targetBoundaryIds.length ===
        0
);


const boundaryObservation =
    primary.specifications.find(
        specification =>
            specification.requirementId ===
            "REQ-PARTIAL-OBSERVATION"
    );


check(
    "READY OBSERVATION REQUIREMENT BECOMES OBSERVATION SPECIFICATION",
    boundaryObservation
        ?.specificationKind ===
        "CANDIDATE_BOUNDARY_OBSERVATION"
);


check(
    "OBSERVATION SPECIFICATION PRESERVES EXACT TARGET BOUNDARY",
    JSON.stringify(
        boundaryObservation
            ?.targetBoundaryIds
    ) ===
        JSON.stringify([
            "BOUNDARY-B"
        ])
);


check(
    "RESOLVED PLANS PRODUCE NO NEW SPECIFICATIONS",
    primary.specifications.every(
        specification =>
            specification.candidateId !==
                "CANDIDATE-SUPPORT" &&
            specification.candidateId !==
                "CANDIDATE-CHALLENGE"
    )
);


check(
    "STATISTICS DISTINGUISH SPECIFICATION TYPES AND BLOCKED REQUIREMENTS",
    primary.statistics.plans ===
        4 &&
    primary.statistics.specifications ===
        2 &&
    primary.statistics.blockedRequirements ===
        1 &&
    primary.statistics.boundaryEvidenceAcquisitionSpecifications ===
        1 &&
    primary.statistics.candidateBoundaryObservationSpecifications ===
        1
);


check(
    "SPECIFICATIONS MAKE NO EXECUTION OR SCIENTIFIC POLARITY CLAIM",
    primary.specifications.every(
        specification =>
            !(
                "repository" in
                specification
            ) &&
            !(
                "harness" in
                specification
            ) &&
            !(
                "opcode" in
                specification
            ) &&
            !(
                "selector" in
                specification
            ) &&
            !(
                "transaction" in
                specification
            ) &&
            !(
                "experiment" in
                specification
            ) &&
            !(
                "scientificPolarity" in
                specification
            )
    )
);


const readyWithBlocker =
    engine.build({

        requirements: {

            plans: [

                {
                    ...requirements.plans[1],

                    requirements: [

                        {
                            ...requirements.plans[1]
                                .requirements[0],

                            blockingGapIds: [
                                "IMPOSSIBLE-BLOCKER"
                            ]

                        }

                    ]

                }

            ],

            errors:
                []

        }

    });


check(
    "READY REQUIREMENT WITH BLOCKER IS DETECTED",
    readyWithBlocker.errors.length >
        0
);


check(
    "READY REQUIREMENT WITH BLOCKER FAILS CLOSED",
    readyWithBlocker.specifications.length ===
        0 &&
    readyWithBlocker.blockedRequirements.length ===
        0
);


const blockedWithoutBlocker =
    engine.build({

        requirements: {

            plans: [

                {
                    ...requirements.plans[0],

                    requirements: [

                        requirements.plans[0]
                            .requirements[0],

                        {
                            ...requirements.plans[0]
                                .requirements[1],

                            blockingGapIds:
                                []

                        }

                    ]

                }

            ],

            errors:
                []

        }

    });


check(
    "BLOCKED REQUIREMENT WITHOUT PREREQUISITE IS DETECTED",
    blockedWithoutBlocker.errors.length >
        0
);


check(
    "BLOCKED REQUIREMENT WITHOUT PREREQUISITE FAILS CLOSED",
    blockedWithoutBlocker.specifications.length ===
        0 &&
    blockedWithoutBlocker.blockedRequirements.length ===
        0
);


const readyObservationWithoutBoundary =
    engine.build({

        requirements: {

            plans: [

                {
                    ...requirements.plans[1],

                    requirements: [

                        {
                            ...requirements.plans[1]
                                .requirements[0],

                            targetBoundaryIds:
                                []

                        }

                    ]

                }

            ],

            errors:
                []

        }

    });


check(
    "READY OBSERVATION WITHOUT TARGET BOUNDARY IS DETECTED",
    readyObservationWithoutBoundary.errors.length >
        0
);


check(
    "READY OBSERVATION WITHOUT TARGET BOUNDARY FAILS CLOSED",
    readyObservationWithoutBoundary.specifications.length ===
        0
);


const duplicateRequirement =
    engine.build({

        requirements: {

            plans: [

                requirements.plans[0],

                {
                    ...requirements.plans[1],

                    requirements: [

                        {
                            ...requirements.plans[1]
                                .requirements[0],

                            requirementId:
                                "REQ-BOUNDARY-ACQUISITION"

                        }

                    ]

                }

            ],

            errors:
                []

        }

    });


check(
    "DUPLICATE REQUIREMENT IDENTITY IS DETECTED",
    duplicateRequirement.errors.length >
        0
);


check(
    "DUPLICATE REQUIREMENT IDENTITY FAILS CLOSED",
    duplicateRequirement.specifications.length ===
        0
);


const reverse =
    engine.build({

        requirements: {

            plans:
                [...requirements.plans]
                    .reverse()
                    .map(
                        plan => ({

                            ...plan,

                            requirements:
                                [...plan.requirements]
                                    .reverse()

                        })
                    ),

            errors:
                []

        }

    });


check(
    "EVIDENCE SPECIFICATION BUILD IS DETERMINISTIC",
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