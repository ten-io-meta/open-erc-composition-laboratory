import {
    ScientificCompositionCandidateCompatibilityEngine
} from "../laboratory/scientific-composition-candidate-compatibility/ScientificCompositionCandidateCompatibilityEngine.js";

import type {
    ScientificCompositionCandidateSetResult
} from "../laboratory/scientific-composition-candidate-set/ScientificCompositionCandidateSetResult.js";


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


const profiles = [

    {
        protocolId:
            "ERC-8004",

        boundaries: [
            {
                boundaryId:
                    "BOUNDARY-8004",

                participantId:
                    "ERC-8004"
            }
        ]
    },

    {
        protocolId:
            "ERC-9000",

        boundaries: [
            {
                boundaryId:
                    "BOUNDARY-9000",

                participantId:
                    "ERC-9000"
            }
        ]
    },

    {
        protocolId:
            "ERC-8301",

        boundaries: [
            {
                boundaryId:
                    "BOUNDARY-8301",

                participantId:
                    "ERC-8301"
            }
        ]
    },

    {
        protocolId:
            "ERC-8354",

        boundaries: [
            {
                boundaryId:
                    "BOUNDARY-8354",

                participantId:
                    "ERC-8354"
            }
        ]
    },

    {
        protocolId:
            "ERC-7000",

        boundaries:
            []
    },

    {
        protocolId:
            "ERC-7001",

        boundaries:
            []
    }

];


const candidateSet:
    ScientificCompositionCandidateSetResult = {

        candidates: [

            {
                candidateId:
                    "CANDIDATE-FUNCTIONAL",

                kind:
                    "FUNCTIONAL_COMPLEMENTARITY",

                sourceParticipantId:
                    "ERC-8004",

                targetParticipantId:
                    "ERC-9000",

                functionalMatchId:
                    "MATCH-1",

                needId:
                    "NEED-1",

                needSubject:
                    "INTERFACE_MEMBER:ITest.verify",

                contributionId:
                    "CONTRIBUTION-1",

                contributionKind:
                    "CAPABILITY",

                contributionSubject:
                    "INTERFACE_MEMBER:ITest.verify",

                evidenceBasis:
                    "EXACT_NORMALIZED_SUBJECT_MATCH",

                evidenceIds: [
                    "FUNCTIONAL-EVIDENCE"
                ],

                evaluationStatus:
                    "UNEVALUATED"
            },

            {
                candidateId:
                    "CANDIDATE-DOCUMENTARY",

                kind:
                    "DOCUMENTARY_COMPOSITION",

                sourceParticipantId:
                    "ERC-8301",

                targetParticipantId:
                    "ERC-8354",

                documentaryCandidateId:
                    "DOCUMENTARY-1",

                relation:
                    "COMPOSES_WITH",

                evidenceIds: [
                    "DOCUMENTARY-EVIDENCE"
                ],

                evaluationStatus:
                    "UNEVALUATED"
            },

            {
                candidateId:
                    "CANDIDATE-ZERO-BOUNDARIES",

                kind:
                    "DOCUMENTARY_COMPOSITION",

                sourceParticipantId:
                    "ERC-7000",

                targetParticipantId:
                    "ERC-7001",

                documentaryCandidateId:
                    "DOCUMENTARY-ZERO",

                relation:
                    "COMPOSES_WITH",

                evidenceIds: [
                    "DOCUMENTARY-ZERO-EVIDENCE"
                ],

                evaluationStatus:
                    "UNEVALUATED"
            }

        ],

        errors:
            []

    };


const engine =
    new ScientificCompositionCandidateCompatibilityEngine();


const primary =
    engine.evaluate({

        profiles,

        candidateSet,

        observations: [

            {
                observationId:
                    "OBS-FUNCTIONAL-A",

                candidateId:
                    "CANDIDATE-FUNCTIONAL",

                boundaryId:
                    "BOUNDARY-8004",

                verdict:
                    "PRESERVED",

                evidenceIds: [
                    "EVIDENCE-A"
                ]
            },

            {
                observationId:
                    "OBS-FUNCTIONAL-B",

                candidateId:
                    "CANDIDATE-FUNCTIONAL",

                boundaryId:
                    "BOUNDARY-9000",

                verdict:
                    "PRESERVED",

                evidenceIds: [
                    "EVIDENCE-B"
                ]
            }

        ]

    });


console.log(
    "\nSCIENTIFIC COMPOSITION CANDIDATE COMPATIBILITY — RUNTIME"
);
console.log(
    "-------------------------------------------------------"
);


check(
    "VALID CANDIDATE COMPATIBILITY HAS NO ERRORS",
    primary.errors.length ===
        0
);


check(
    "EVERY GENERIC CANDIDATE RECEIVES AN ASSESSMENT",
    primary.assessments.length ===
        3
);


const functional =
    primary.assessments.find(
        assessment =>
            assessment.candidateId ===
            "CANDIDATE-FUNCTIONAL"
    );


const documentary =
    primary.assessments.find(
        assessment =>
            assessment.candidateId ===
            "CANDIDATE-DOCUMENTARY"
    );


const zeroBoundaries =
    primary.assessments.find(
        assessment =>
            assessment.candidateId ===
            "CANDIDATE-ZERO-BOUNDARIES"
    );


check(
    "FUNCTIONAL CANDIDATE CAN SUPPORT KNOWN BOUNDARY PRESERVATION",
    functional?.scientificPolarity ===
        "SUPPORT" &&
    functional.statistics.preserved ===
        2 &&
    functional.statistics.unevaluated ===
        0
);


check(
    "DOCUMENTARY CANDIDATE IS EVALUATED BY CANDIDATE ID",
    documentary?.candidateKind ===
        "DOCUMENTARY_COMPOSITION" &&
    documentary.sourceParticipantId ===
        "ERC-8301" &&
    documentary.targetParticipantId ===
        "ERC-8354"
);


check(
    "UNOBSERVED DOCUMENTARY BOUNDARIES REMAIN INCONCLUSIVE",
    documentary?.scientificPolarity ===
        "INCONCLUSIVE" &&
    documentary.statistics.total ===
        2 &&
    documentary.statistics.unevaluated ===
        2
);


check(
    "ZERO KNOWN BOUNDARIES DO NOT PRODUCE SUPPORT",
    zeroBoundaries?.scientificPolarity ===
        "INCONCLUSIVE" &&
    zeroBoundaries.statistics.total ===
        0
);


check(
    "ASSESSMENT SCOPE IS EXPLICITLY LIMITED TO KNOWN BOUNDARIES",
    primary.assessments.every(
        assessment =>
            assessment.assessmentBasis ===
                "KNOWN_PARTICIPANT_BOUNDARY_OBSERVATIONS"
    )
);


check(
    "GENERIC ASSESSMENTS DO NOT REQUIRE FUNCTIONAL MATCH IDENTITY",
    documentary !==
        undefined &&
    !(
        "matchId" in
        documentary
    ) &&
    !(
        "needId" in
        documentary
    ) &&
    !(
        "contributionId" in
        documentary
    )
);


const challenged =
    engine.evaluate({

        profiles,

        candidateSet,

        observations: [

            {
                observationId:
                    "OBS-DOC-PRESERVED",

                candidateId:
                    "CANDIDATE-DOCUMENTARY",

                boundaryId:
                    "BOUNDARY-8301",

                verdict:
                    "PRESERVED",

                evidenceIds: [
                    "DOC-PRESERVED"
                ]
            },

            {
                observationId:
                    "OBS-DOC-VIOLATED",

                candidateId:
                    "CANDIDATE-DOCUMENTARY",

                boundaryId:
                    "BOUNDARY-8301",

                verdict:
                    "VIOLATED",

                evidenceIds: [
                    "DOC-VIOLATED"
                ]
            },

            {
                observationId:
                    "OBS-DOC-OTHER",

                candidateId:
                    "CANDIDATE-DOCUMENTARY",

                boundaryId:
                    "BOUNDARY-8354",

                verdict:
                    "PRESERVED",

                evidenceIds: [
                    "DOC-OTHER"
                ]
            }

        ]

    });


const challengedDocumentary =
    challenged.assessments.find(
        assessment =>
            assessment.candidateId ===
            "CANDIDATE-DOCUMENTARY"
    );


check(
    "VIOLATION DOMINATES PRESERVATION FOR SAME BOUNDARY",
    challengedDocumentary
        ?.boundaryEvaluations
        .find(
            evaluation =>
                evaluation.boundaryId ===
                "BOUNDARY-8301"
        )
        ?.status ===
        "VIOLATED"
);


check(
    "ANY OBSERVED VIOLATION CHALLENGES CANDIDATE BOUNDARY COMPATIBILITY",
    challengedDocumentary?.scientificPolarity ===
        "CHALLENGE"
);


const foreignBoundary =
    engine.evaluate({

        profiles,

        candidateSet,

        observations: [
            {
                observationId:
                    "OBS-FOREIGN-BOUNDARY",

                candidateId:
                    "CANDIDATE-DOCUMENTARY",

                boundaryId:
                    "BOUNDARY-8004",

                verdict:
                    "PRESERVED",

                evidenceIds: [
                    "FOREIGN"
                ]
            }
        ]

    });


check(
    "FOREIGN PARTICIPANT BOUNDARY IS DETECTED",
    foreignBoundary.errors.length >
        0
);


check(
    "FOREIGN PARTICIPANT BOUNDARY FAILS CLOSED",
    foreignBoundary.assessments.length ===
        0
);


const foreignCandidate =
    engine.evaluate({

        profiles,

        candidateSet,

        observations: [
            {
                observationId:
                    "OBS-UNKNOWN-CANDIDATE",

                candidateId:
                    "UNKNOWN-CANDIDATE",

                boundaryId:
                    "BOUNDARY-8004",

                verdict:
                    "PRESERVED",

                evidenceIds: [
                    "UNKNOWN"
                ]
            }
        ]

    });


check(
    "UNKNOWN CANDIDATE OBSERVATION IS DETECTED",
    foreignCandidate.errors.length >
        0
);


check(
    "UNKNOWN CANDIDATE OBSERVATION FAILS CLOSED",
    foreignCandidate.assessments.length ===
        0
);


const duplicateObservation =
    engine.evaluate({

        profiles,

        candidateSet,

        observations: [

            {
                observationId:
                    "OBS-DUPLICATE",

                candidateId:
                    "CANDIDATE-FUNCTIONAL",

                boundaryId:
                    "BOUNDARY-8004",

                verdict:
                    "PRESERVED",

                evidenceIds: [
                    "DUP-A"
                ]
            },

            {
                observationId:
                    "OBS-DUPLICATE",

                candidateId:
                    "CANDIDATE-FUNCTIONAL",

                boundaryId:
                    "BOUNDARY-9000",

                verdict:
                    "PRESERVED",

                evidenceIds: [
                    "DUP-B"
                ]
            }

        ]

    });


check(
    "DUPLICATE OBSERVATION IDENTITY IS DETECTED",
    duplicateObservation.errors.length >
        0
);


check(
    "DUPLICATE OBSERVATION IDENTITY FAILS CLOSED",
    duplicateObservation.assessments.length ===
        0
);


const reverse =
    engine.evaluate({

        profiles:
            [...profiles].reverse(),

        candidateSet: {

            candidates:
                [...candidateSet.candidates].reverse(),

            errors:
                []

        },

        observations: [

            {
                observationId:
                    "OBS-FUNCTIONAL-B",

                candidateId:
                    "CANDIDATE-FUNCTIONAL",

                boundaryId:
                    "BOUNDARY-9000",

                verdict:
                    "PRESERVED",

                evidenceIds: [
                    "EVIDENCE-B"
                ]
            },

            {
                observationId:
                    "OBS-FUNCTIONAL-A",

                candidateId:
                    "CANDIDATE-FUNCTIONAL",

                boundaryId:
                    "BOUNDARY-8004",

                verdict:
                    "PRESERVED",

                evidenceIds: [
                    "EVIDENCE-A"
                ]
            }

        ]

    });


check(
    "CANDIDATE COMPATIBILITY IS DETERMINISTIC ACROSS INPUT ORDER",
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