import {
    ScientificCompositionCandidateSetEngine
} from "../laboratory/scientific-composition-candidate-set/ScientificCompositionCandidateSetEngine.js";

import {
    ScientificCandidateScopedCompatibilityEngine
} from "../laboratory/scientific-candidate-boundary-relevance/ScientificCandidateScopedCompatibilityEngine.js";


let pass = 0;
let fail = 0;


function check(
    name: string,
    condition: boolean
): void {

    console.log(
        `${name}: ${condition ? "PASS" : "FAIL"}`
    );

    condition
        ? pass++
        : fail++;

}


const candidateSet =
    new ScientificCompositionCandidateSetEngine()
        .build({

            participantIds: [
                "ERC-8004",
                "ERC-8060"
            ],

            functionalMatches:
                [],

            documentaryCandidates: [
                {
                    candidateId:
                        "DOC-CANDIDATE",

                    subjectParticipantId:
                        "ERC-8004",

                    objectParticipantId:
                        "ERC-8060",

                    relation:
                        "COMPOSES_WITH",

                    evidenceIds: [
                        "DISCOVERY-EVIDENCE"
                    ],

                    evaluationStatus:
                        "UNEVALUATED"
                }
            ]

        });


if (
    candidateSet.errors.length > 0
) {
    throw new Error(
        candidateSet.errors.join("\n")
    );
}


const candidate =
    candidateSet.candidates[0];


const profiles = [
    {
        protocolId:
            "ERC-8004",

        boundaries: [
            {
                boundaryId:
                    "B-RELEVANT",

                participantId:
                    "ERC-8004"
            },
            {
                boundaryId:
                    "B-OUT",

                participantId:
                    "ERC-8004"
            }
        ]
    },
    {
        protocolId:
            "ERC-8060",

        boundaries: [
            {
                boundaryId:
                    "B-UNRESOLVED",

                participantId:
                    "ERC-8060"
            }
        ]
    }
];


const engine =
    new ScientificCandidateScopedCompatibilityEngine();


function relevance(
    unresolvedMode:
        "UNRESOLVED" | "OUT_OF_SCOPE"
) {

    return [
        {
            assessmentId:
                "REL-1",

            candidateId:
                candidate.candidateId,

            participantId:
                "ERC-8004",

            boundaryId:
                "B-RELEVANT",

            relevance:
                "RELEVANT" as const,

            reason:
                "EXPLICIT_CANDIDATE_REACHABILITY_EVIDENCE" as const,

            evidenceIds: [
                "REACH-1"
            ]
        },
        {
            assessmentId:
                "REL-2",

            candidateId:
                candidate.candidateId,

            participantId:
                "ERC-8004",

            boundaryId:
                "B-OUT",

            relevance:
                "OUT_OF_SCOPE" as const,

            reason:
                "EXPLICIT_CANDIDATE_EXCLUSION_EVIDENCE" as const,

            evidenceIds: [
                "EXCLUDE-1"
            ]
        },
        {
            assessmentId:
                "REL-3",

            candidateId:
                candidate.candidateId,

            participantId:
                "ERC-8060",

            boundaryId:
                "B-UNRESOLVED",

            relevance:
                unresolvedMode,

            reason:
                unresolvedMode ===
                    "UNRESOLVED"
                    ? "NO_RELEVANCE_EVIDENCE" as const
                    : "EXPLICIT_CANDIDATE_EXCLUSION_EVIDENCE" as const,

            evidenceIds:
                unresolvedMode ===
                    "UNRESOLVED"
                    ? []
                    : [
                        "EXCLUDE-2"
                    ]
        }
    ];

}


console.log("");
console.log(
    "V2.1 CANDIDATE-SCOPED COMPATIBILITY"
);
console.log(
    "==================================="
);


const unresolved =
    engine.evaluate({

        profiles,

        candidateSet,

        observations: [
            {
                observationId:
                    "OBS-PRESERVED",

                candidateId:
                    candidate.candidateId,

                boundaryId:
                    "B-RELEVANT",

                verdict:
                    "PRESERVED",

                evidenceIds: [
                    "RUNTIME-EVIDENCE"
                ]
            }
        ],

        relevanceAssessments:
            relevance(
                "UNRESOLVED"
            )

    });


check(
    "UNRESOLVED RELEVANCE EVALUATES WITHOUT ENGINE ERROR",
    unresolved.errors.length === 0
);


check(
    "UNRESOLVED RELEVANCE BLOCKS SUPPORT",
    unresolved.assessments[0]
        .compatibility
        .scientificPolarity ===
        "INCONCLUSIVE"
);


check(
    "OUT_OF_SCOPE DOES NOT COUNT AS RELEVANT BOUNDARY",
    unresolved.assessments[0]
        .relevanceStatistics
        .outOfScope === 1 &&
    unresolved.assessments[0]
        .compatibility
        .statistics
        .total === 1
);


check(
    "UNRESOLVED IS AUDITABLE",
    unresolved.assessments[0]
        .unresolvedBoundaryIds.includes(
            "B-UNRESOLVED"
        )
);


const resolved =
    engine.evaluate({

        profiles,

        candidateSet,

        observations: [
            {
                observationId:
                    "OBS-PRESERVED",

                candidateId:
                    candidate.candidateId,

                boundaryId:
                    "B-RELEVANT",

                verdict:
                    "PRESERVED",

                evidenceIds: [
                    "RUNTIME-EVIDENCE"
                ]
            }
        ],

        relevanceAssessments:
            relevance(
                "OUT_OF_SCOPE"
            )

    });


check(
    "ALL RELEVANCE RESOLVED EVALUATES WITHOUT ERROR",
    resolved.errors.length === 0
);


check(
    "PRESERVED RELEVANT BOUNDARIES + EXPLICIT EXCLUSIONS -> SUPPORT",
    resolved.assessments[0]
        .compatibility
        .scientificPolarity ===
        "SUPPORT"
);


check(
    "SUPPORT STILL EVALUATES ONLY RELEVANT BOUNDARIES",
    resolved.assessments[0]
        .compatibility
        .statistics
        .total === 1 &&
    resolved.assessments[0]
        .compatibility
        .statistics
        .preserved === 1
);


const challenged =
    engine.evaluate({

        profiles,

        candidateSet,

        observations: [
            {
                observationId:
                    "OBS-VIOLATED",

                candidateId:
                    candidate.candidateId,

                boundaryId:
                    "B-RELEVANT",

                verdict:
                    "VIOLATED",

                evidenceIds: [
                    "VIOLATION-EVIDENCE"
                ]
            }
        ],

        relevanceAssessments:
            relevance(
                "UNRESOLVED"
            )

    });


check(
    "OBSERVED RELEVANT VIOLATION -> CHALLENGE",
    challenged.errors.length === 0 &&
    challenged.assessments[0]
        .compatibility
        .scientificPolarity ===
        "CHALLENGE"
);


const missingRelevance =
    engine.evaluate({

        profiles,

        candidateSet,

        observations:
            [],

        relevanceAssessments:
            relevance(
                "UNRESOLVED"
            ).slice(
                0,
                2
            )

    });


check(
    "MISSING RELEVANCE ASSESSMENT FAILS CLOSED",
    missingRelevance.assessments.length === 0 &&
    missingRelevance.errors.length > 0
);


const observedOutOfScope =
    engine.evaluate({

        profiles,

        candidateSet,

        observations: [
            {
                observationId:
                    "OBS-CONTRADICTION",

                candidateId:
                    candidate.candidateId,

                boundaryId:
                    "B-OUT",

                verdict:
                    "PRESERVED",

                evidenceIds: [
                    "RUNTIME"
                ]
            }
        ],

        relevanceAssessments:
            relevance(
                "OUT_OF_SCOPE"
            )

    });


check(
    "OBSERVED OUT_OF_SCOPE BOUNDARY FAILS CLOSED",
    observedOutOfScope.assessments.length === 0 &&
    observedOutOfScope.errors.length > 0
);


const serialized =
    JSON.stringify(
        resolved
    );


check(
    "SCOPED COMPATIBILITY DOES NOT PROMOTE FUNCTIONAL COMPOSITION",
    !serialized.includes(
        "FUNCTIONAL_CONFIGURATION"
    ) &&
    !serialized.includes(
        "GLOBAL_COMPOSITION"
    )
);


console.log("");
console.log(`PASS: ${pass}`);
console.log(`FAIL: ${fail}`);
console.log(
    `RESULT: ${fail === 0 ? "PASS" : "FAIL"}`
);


if (fail > 0) {
    process.exitCode = 1;
}