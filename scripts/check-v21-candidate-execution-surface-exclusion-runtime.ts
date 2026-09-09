import {
    ScientificCandidateExecutionSurfaceExclusionEngine
} from "../laboratory/scientific-candidate-boundary-relevance/ScientificCandidateExecutionSurfaceExclusionEngine.js";

import {
    ScientificCandidateBoundaryRelevanceEngine
} from "../laboratory/scientific-candidate-boundary-relevance/ScientificCandidateBoundaryRelevanceEngine.js";


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


const candidateId =
    "CANDIDATE-X";


const boundaries = [
    {
        boundaryId:
            "IDENTITY-BOUNDARY",

        participantId:
            "ERC-TEST",

        containerSymbol:
            "IdentityRegistry"
    },
    {
        boundaryId:
            "REPUTATION-BOUNDARY",

        participantId:
            "ERC-TEST",

        containerSymbol:
            "ReputationRegistry"
    },
    {
        boundaryId:
            "VALIDATION-BOUNDARY",

        participantId:
            "ERC-TEST",

        containerSymbol:
            "ValidationRegistry"
    }
];


const engine =
    new ScientificCandidateExecutionSurfaceExclusionEngine();


console.log("");
console.log(
    "V2.1 COMPLETE EXECUTION SURFACE EXCLUSION"
);
console.log(
    "========================================="
);


const complete =
    engine.derive(
        {
            surfaceId:
                "SURFACE-1",

            candidateId,

            participantId:
                "ERC-TEST",

            completeness:
                "COMPLETE_FOR_CANDIDATE_EVALUATION",

            includedContainerSymbols: [
                "IdentityRegistry"
            ],

            evidenceIds: [
                "EXPLICIT-SURFACE-EVIDENCE"
            ]
        },
        boundaries
    );


check(
    "COMPLETE SURFACE DERIVES WITHOUT ERRORS",
    complete.errors.length === 0
);


check(
    "INCLUDED CONTAINER BOUNDARY IS RETAINED",
    complete.retainedBoundaryIds.length === 1 &&
    complete.retainedBoundaryIds[0] ===
        "IDENTITY-BOUNDARY"
);


check(
    "TWO NON-SURFACE BOUNDARIES RECEIVE EXCLUSION EVIDENCE",
    complete.excludedBoundaryIds.length === 2 &&
    complete.evidence.length === 2
);


check(
    "EXCLUSIONS ARE CANDIDATE-SCOPED",
    complete.evidence.every(
        evidence =>
            evidence.candidateId ===
                candidateId &&
            evidence.kind ===
                "CANDIDATE_EXCLUSION"
    )
);


const relevance =
    new ScientificCandidateBoundaryRelevanceEngine()
        .evaluate({

            candidateId,

            participantIds: [
                "ERC-TEST"
            ],

            boundaries: [
                {
                    boundaryId:
                        "IDENTITY-BOUNDARY",

                    participantId:
                        "ERC-TEST",

                    kind:
                        "SOURCE_CONSTRAINT",

                    subject:
                        "identity",

                    evidenceIds: [
                        "FACT-1"
                    ]
                },
                {
                    boundaryId:
                        "REPUTATION-BOUNDARY",

                    participantId:
                        "ERC-TEST",

                    kind:
                        "SOURCE_CONSTRAINT",

                    subject:
                        "reputation",

                    evidenceIds: [
                        "FACT-2"
                    ]
                },
                {
                    boundaryId:
                        "VALIDATION-BOUNDARY",

                    participantId:
                        "ERC-TEST",

                    kind:
                        "SOURCE_CONSTRAINT",

                    subject:
                        "validation",

                    evidenceIds: [
                        "FACT-3"
                    ]
                }
            ],

            evidence:
                complete.evidence

        });


check(
    "EXCLUDED BOUNDARIES BECOME OUT_OF_SCOPE",
    relevance.assessments.filter(
        assessment =>
            assessment.relevance ===
            "OUT_OF_SCOPE"
    ).length === 2
);


check(
    "INCLUDED BUT UNOBSERVED BOUNDARY REMAINS UNRESOLVED",
    relevance.assessments.find(
        assessment =>
            assessment.boundaryId ===
            "IDENTITY-BOUNDARY"
    )?.relevance ===
    "UNRESOLVED"
);


const partial =
    engine.derive(
        {
            surfaceId:
                "SURFACE-PARTIAL",

            candidateId,

            participantId:
                "ERC-TEST",

            completeness:
                "PARTIAL",

            includedContainerSymbols: [
                "IdentityRegistry"
            ],

            evidenceIds: [
                "PARTIAL-EVIDENCE"
            ]
        },
        boundaries
    );


check(
    "PARTIAL SURFACE FAILS CLOSED",
    partial.evidence.length === 0 &&
    partial.errors.length > 0
);


check(
    "PARTIAL SURFACE CANNOT MANUFACTURE OUT_OF_SCOPE",
    partial.excludedBoundaryIds.length === 0
);


const noEvidence =
    engine.derive(
        {
            surfaceId:
                "SURFACE-NO-EVIDENCE",

            candidateId,

            participantId:
                "ERC-TEST",

            completeness:
                "COMPLETE_FOR_CANDIDATE_EVALUATION",

            includedContainerSymbols: [
                "IdentityRegistry"
            ],

            evidenceIds:
                []
        },
        boundaries
    );


check(
    "COMPLETE CLAIM WITHOUT EVIDENCE FAILS CLOSED",
    noEvidence.evidence.length === 0 &&
    noEvidence.errors.length > 0
);


const foreignBoundary =
    engine.derive(
        {
            surfaceId:
                "SURFACE-FOREIGN",

            candidateId,

            participantId:
                "ERC-TEST",

            completeness:
                "COMPLETE_FOR_CANDIDATE_EVALUATION",

            includedContainerSymbols: [
                "IdentityRegistry"
            ],

            evidenceIds: [
                "EVIDENCE"
            ]
        },
        [
            {
                boundaryId:
                    "FOREIGN",

                participantId:
                    "OTHER-PROTOCOL",

                containerSymbol:
                    "Other"
            }
        ]
    );


check(
    "FOREIGN PARTICIPANT BOUNDARY FAILS CLOSED",
    foreignBoundary.evidence.length === 0 &&
    foreignBoundary.errors.length > 0
);


const serialized =
    JSON.stringify(
        complete
    );


check(
    "EXECUTION SURFACE EXCLUSION HAS NO COMPATIBILITY POLARITY",
    !serialized.includes('"SUPPORT"') &&
    !serialized.includes('"CHALLENGE"') &&
    !serialized.includes('"INCONCLUSIVE"') &&
    !serialized.includes('"PRESERVED"') &&
    !serialized.includes('"VIOLATED"')
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