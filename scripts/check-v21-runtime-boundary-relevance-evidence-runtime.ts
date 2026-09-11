import {
    ScientificCandidateBoundaryRelevanceEvidenceEngine
} from "../laboratory/scientific-candidate-boundary-relevance/ScientificCandidateBoundaryRelevanceEvidenceEngine.js";

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
    "CANDIDATE-8004-8060";


const boundaries = [
    {
        boundaryId:
            "BOUNDARY-OBSERVED",

        participantId:
            "ERC-8004",

        kind:
            "SOURCE_CONSTRAINT" as const,

        subject:
            "observed",

        evidenceIds: [
            "FACT-OBSERVED"
        ]
    },
    {
        boundaryId:
            "BOUNDARY-UNOBSERVED",

        participantId:
            "ERC-8004",

        kind:
            "SOURCE_CONSTRAINT" as const,

        subject:
            "unobserved",

        evidenceIds: [
            "FACT-UNOBSERVED"
        ]
    }
];


const evidenceEngine =
    new ScientificCandidateBoundaryRelevanceEvidenceEngine();


const derived =
    evidenceEngine.deriveFromRuntimeObservations(
        candidateId,
        boundaries,
        [
            {
                observationId:
                    "RUNTIME-OBS-1",

                candidateId,

                boundaryId:
                    "BOUNDARY-OBSERVED",

                verdict:
                    "PRESERVED",

                evidenceIds: [
                    "EXECUTION-EVIDENCE"
                ]
            }
        ]
    );


check(
    "VALID RUNTIME OBSERVATION DERIVES WITHOUT ERRORS",
    derived.errors.length === 0
);


check(
    "OBSERVED BOUNDARY PRODUCES REACHABILITY EVIDENCE",
    derived.evidence.length === 1 &&
    derived.evidence[0].kind ===
        "CANDIDATE_REACHABILITY"
);


check(
    "REACHABILITY PRESERVES CANDIDATE",
    derived.evidence[0].candidateId ===
        candidateId
);


check(
    "REACHABILITY PRESERVES EXACT BOUNDARY",
    derived.evidence[0].boundaryId ===
        "BOUNDARY-OBSERVED"
);


const relevance =
    new ScientificCandidateBoundaryRelevanceEngine()
        .evaluate({

            candidateId,

            participantIds: [
                "ERC-8004"
            ],

            boundaries,

            evidence:
                derived.evidence

        });


check(
    "OBSERVED BOUNDARY -> RELEVANT",
    relevance.assessments.find(
        assessment =>
            assessment.boundaryId ===
            "BOUNDARY-OBSERVED"
    )?.relevance ===
    "RELEVANT"
);


check(
    "UNOBSERVED BOUNDARY -> UNRESOLVED",
    relevance.assessments.find(
        assessment =>
            assessment.boundaryId ===
            "BOUNDARY-UNOBSERVED"
    )?.relevance ===
    "UNRESOLVED"
);


check(
    "ABSENCE NEVER MANUFACTURES OUT_OF_SCOPE",
    relevance.statistics.outOfScope === 0 &&
    relevance.statistics.relevant === 1 &&
    relevance.statistics.unresolved === 1
);


const violated =
    evidenceEngine.deriveFromRuntimeObservations(
        candidateId,
        boundaries,
        [
            {
                observationId:
                    "RUNTIME-VIOLATION",

                candidateId,

                boundaryId:
                    "BOUNDARY-OBSERVED",

                verdict:
                    "VIOLATED",

                evidenceIds: [
                    "VIOLATION-EVIDENCE"
                ]
            }
        ]
    );


check(
    "VIOLATED BOUNDARY ALSO PROVES RELEVANCE",
    violated.errors.length === 0 &&
    violated.evidence.length === 1 &&
    violated.evidence[0].kind ===
        "CANDIDATE_REACHABILITY"
);


const wrongCandidate =
    evidenceEngine.deriveFromRuntimeObservations(
        candidateId,
        boundaries,
        [
            {
                observationId:
                    "WRONG",

                candidateId:
                    "OTHER-CANDIDATE",

                boundaryId:
                    "BOUNDARY-OBSERVED",

                verdict:
                    "PRESERVED",

                evidenceIds: [
                    "EVIDENCE"
                ]
            }
        ]
    );


check(
    "CROSS-CANDIDATE OBSERVATION FAILS CLOSED",
    wrongCandidate.evidence.length === 0 &&
    wrongCandidate.errors.length > 0
);


const unknownBoundary =
    evidenceEngine.deriveFromRuntimeObservations(
        candidateId,
        boundaries,
        [
            {
                observationId:
                    "UNKNOWN",

                candidateId,

                boundaryId:
                    "NOT-A-BOUNDARY",

                verdict:
                    "PRESERVED",

                evidenceIds: [
                    "EVIDENCE"
                ]
            }
        ]
    );


check(
    "UNKNOWN BOUNDARY FAILS CLOSED",
    unknownBoundary.evidence.length === 0 &&
    unknownBoundary.errors.length > 0
);


const noEvidence =
    evidenceEngine.deriveFromRuntimeObservations(
        candidateId,
        boundaries,
        [
            {
                observationId:
                    "NO-EVIDENCE",

                candidateId,

                boundaryId:
                    "BOUNDARY-OBSERVED",

                verdict:
                    "PRESERVED",

                evidenceIds:
                    []
            }
        ]
    );


check(
    "OBSERVATION WITHOUT EVIDENCE FAILS CLOSED",
    noEvidence.evidence.length === 0 &&
    noEvidence.errors.length > 0
);


const serialized =
    JSON.stringify(
        derived
    );


check(
    "RELEVANCE EVIDENCE HAS NO COMPATIBILITY POLARITY",
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