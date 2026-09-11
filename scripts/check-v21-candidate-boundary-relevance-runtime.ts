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


const engine =
    new ScientificCandidateBoundaryRelevanceEngine();


const boundaries = [
    {
        boundaryId:
            "BOUNDARY-RELEVANT",

        participantId:
            "ERC-8004",

        kind:
            "SOURCE_CONSTRAINT" as const,

        subject:
            "relevant boundary",

        evidenceIds: [
            "FACT-RELEVANT"
        ]
    },
    {
        boundaryId:
            "BOUNDARY-OUT",

        participantId:
            "ERC-8004",

        kind:
            "SOURCE_CONSTRAINT" as const,

        subject:
            "out of scope boundary",

        evidenceIds: [
            "FACT-OUT"
        ]
    },
    {
        boundaryId:
            "BOUNDARY-UNKNOWN",

        participantId:
            "ERC-8060",

        kind:
            "SOURCE_CONSTRAINT" as const,

        subject:
            "unknown boundary",

        evidenceIds: [
            "FACT-UNKNOWN"
        ]
    },
    {
        boundaryId:
            "BOUNDARY-CONFLICT",

        participantId:
            "ERC-8060",

        kind:
            "SOURCE_CONSTRAINT" as const,

        subject:
            "conflicted boundary",

        evidenceIds: [
            "FACT-CONFLICT"
        ]
    }
];


const result =
    engine.evaluate({

        candidateId:
            "CANDIDATE-8004-8060",

        participantIds: [
            "ERC-8004",
            "ERC-8060"
        ],

        boundaries,

        evidence: [
            {
                evidenceId:
                    "REACH-1",

                candidateId:
                    "CANDIDATE-8004-8060",

                participantId:
                    "ERC-8004",

                boundaryId:
                    "BOUNDARY-RELEVANT",

                kind:
                    "CANDIDATE_REACHABILITY"
            },
            {
                evidenceId:
                    "EXCLUDE-1",

                candidateId:
                    "CANDIDATE-8004-8060",

                participantId:
                    "ERC-8004",

                boundaryId:
                    "BOUNDARY-OUT",

                kind:
                    "CANDIDATE_EXCLUSION"
            },
            {
                evidenceId:
                    "REACH-CONFLICT",

                candidateId:
                    "CANDIDATE-8004-8060",

                participantId:
                    "ERC-8060",

                boundaryId:
                    "BOUNDARY-CONFLICT",

                kind:
                    "CANDIDATE_REACHABILITY"
            },
            {
                evidenceId:
                    "EXCLUDE-CONFLICT",

                candidateId:
                    "CANDIDATE-8004-8060",

                participantId:
                    "ERC-8060",

                boundaryId:
                    "BOUNDARY-CONFLICT",

                kind:
                    "CANDIDATE_EXCLUSION"
            }
        ]

    });


check(
    "VALID RELEVANCE EVALUATION HAS NO ERRORS",
    result.errors.length === 0
);


check(
    "EXPLICIT REACHABILITY -> RELEVANT",
    result.assessments.find(
        item =>
            item.boundaryId ===
            "BOUNDARY-RELEVANT"
    )?.relevance ===
    "RELEVANT"
);


check(
    "EXPLICIT EXCLUSION -> OUT_OF_SCOPE",
    result.assessments.find(
        item =>
            item.boundaryId ===
            "BOUNDARY-OUT"
    )?.relevance ===
    "OUT_OF_SCOPE"
);


check(
    "NO EVIDENCE -> UNRESOLVED",
    result.assessments.find(
        item =>
            item.boundaryId ===
            "BOUNDARY-UNKNOWN"
    )?.relevance ===
    "UNRESOLVED"
);


check(
    "CONFLICTING EVIDENCE -> UNRESOLVED",
    result.assessments.find(
        item =>
            item.boundaryId ===
            "BOUNDARY-CONFLICT"
    )?.relevance ===
    "UNRESOLVED"
);


check(
    "CONFLICT REASON IS AUDITABLE",
    result.assessments.find(
        item =>
            item.boundaryId ===
            "BOUNDARY-CONFLICT"
    )?.reason ===
    "CONFLICTING_RELEVANCE_EVIDENCE"
);


check(
    "STATISTICS ARE EXACT",
    result.statistics.total === 4 &&
    result.statistics.relevant === 1 &&
    result.statistics.outOfScope === 1 &&
    result.statistics.unresolved === 2
);


const wrongCandidateEvidence =
    engine.evaluate({

        candidateId:
            "CANDIDATE-8004-8060",

        participantIds: [
            "ERC-8004"
        ],

        boundaries: [
            boundaries[0]
        ],

        evidence: [
            {
                evidenceId:
                    "WRONG",

                candidateId:
                    "OTHER-CANDIDATE",

                participantId:
                    "ERC-8004",

                boundaryId:
                    "BOUNDARY-RELEVANT",

                kind:
                    "CANDIDATE_REACHABILITY"
            }
        ]

    });


check(
    "CROSS-CANDIDATE EVIDENCE FAILS CLOSED",
    wrongCandidateEvidence.assessments.length === 0 &&
    wrongCandidateEvidence.errors.length > 0
);


const unknownBoundaryEvidence =
    engine.evaluate({

        candidateId:
            "CANDIDATE-8004-8060",

        participantIds: [
            "ERC-8004"
        ],

        boundaries: [
            boundaries[0]
        ],

        evidence: [
            {
                evidenceId:
                    "UNKNOWN-BOUNDARY",

                candidateId:
                    "CANDIDATE-8004-8060",

                participantId:
                    "ERC-8004",

                boundaryId:
                    "NOT-A-BOUNDARY",

                kind:
                    "CANDIDATE_REACHABILITY"
            }
        ]

    });


check(
    "UNKNOWN BOUNDARY EVIDENCE FAILS CLOSED",
    unknownBoundaryEvidence.assessments.length === 0 &&
    unknownBoundaryEvidence.errors.length > 0
);


const serialized =
    JSON.stringify(
        result
    );


check(
    "RELEVANCE LAYER CONTAINS NO COMPATIBILITY POLARITY",
    !serialized.includes('"SUPPORT"') &&
    !serialized.includes('"CHALLENGE"') &&
    !serialized.includes('"INCONCLUSIVE"')
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