import {
    ScientificCompositionCandidateSetEngine
} from "../laboratory/scientific-composition-candidate-set/ScientificCompositionCandidateSetEngine.js";

import type {
    ScientificStructuralFoundationCompositionCandidate
} from "../laboratory/scientific-structural-foundation-candidate/ScientificStructuralFoundationCompositionCandidate.js";


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


function structural():
    ScientificStructuralFoundationCompositionCandidate {

    return {

        candidateId:
            "STRUCTURAL-8004-8060",

        sourceCandidateId:
            "CROSS-PROTOCOL-8004-8060",

        participantAId:
            "ERC-8004",

        participantBId:
            "ERC-8060",

        directionality:
            "UNDIRECTED",

        mechanism:
            "SHARED_PROTOCOL_FOUNDATION",

        foundationProtocolId:
            "ERC-721",

        evidenceIds: [
            "EVIDENCE-8004",
            "EVIDENCE-8060"
        ],

        provenance: [
            {
                kind:
                    "STRUCTURAL_PROTOCOL_RELATION",

                sourceId:
                    "SOURCE-8004",

                sourceRevision:
                    "REV-8004",

                evidenceId:
                    "EVIDENCE-8004"
            },
            {
                kind:
                    "STRUCTURAL_PROTOCOL_RELATION",

                sourceId:
                    "SOURCE-8060",

                sourceRevision:
                    "REV-8060",

                evidenceId:
                    "EVIDENCE-8060"
            }
        ],

        evaluationStatus:
            "UNEVALUATED"

    };

}


console.log("");
console.log(
    "V2.1 MAIN CANDIDATE SET STRUCTURAL FOUNDATION"
);
console.log(
    "=============================================="
);


const engine =
    new ScientificCompositionCandidateSetEngine();


const result =
    engine.build({

        participantIds: [
            "ERC-8004",
            "ERC-8060"
        ],

        functionalMatches:
            [],

        documentaryCandidates:
            [],

        structuralFoundationCandidates: [
            structural()
        ]

    });


check(
    "STRUCTURAL FOUNDATION ENTERS MAIN CANDIDATE SET",
    result.errors.length === 0 &&
    result.candidates.length === 1
);


const candidate =
    result.candidates[0];


check(
    "MAIN CANDIDATE KIND IS STRUCTURAL_FOUNDATION",
    candidate?.kind ===
    "STRUCTURAL_FOUNDATION"
);


check(
    "CANONICAL PARTICIPANTS ARE PRESERVED",
    candidate?.sourceParticipantId ===
        "ERC-8004" &&
    candidate?.targetParticipantId ===
        "ERC-8060"
);


check(
    "UNDIRECTED SEMANTICS ARE PRESERVED",
    candidate?.kind ===
        "STRUCTURAL_FOUNDATION" &&
    candidate.directionality ===
        "UNDIRECTED"
);


check(
    "ERC-721 FOUNDATION IS PRESERVED",
    candidate?.kind ===
        "STRUCTURAL_FOUNDATION" &&
    candidate.foundationProtocolId ===
        "ERC-721"
);


check(
    "DISCOVERY EVIDENCE IS PRESERVED",
    candidate?.evidenceIds.length ===
        2
);


check(
    "STRUCTURAL PROVENANCE IS PRESERVED",
    candidate?.kind ===
        "STRUCTURAL_FOUNDATION" &&
    candidate.provenance.length ===
        2
);


check(
    "CANDIDATE REMAINS UNEVALUATED",
    candidate?.evaluationStatus ===
        "UNEVALUATED"
);


const unknownParticipant =
    engine.build({

        participantIds: [
            "ERC-8004"
        ],

        functionalMatches:
            [],

        documentaryCandidates:
            [],

        structuralFoundationCandidates: [
            structural()
        ]

    });


check(
    "UNKNOWN STRUCTURAL PARTICIPANT FAILS CLOSED",
    unknownParticipant.candidates.length ===
        0 &&
    unknownParticipant.errors.length >
        0
);


const noStructural =
    engine.build({

        participantIds: [
            "ERC-8004",
            "ERC-8060"
        ],

        functionalMatches:
            [],

        documentaryCandidates:
            []

    });


check(
    "EXISTING CALLERS REMAIN BACKWARD COMPATIBLE",
    noStructural.errors.length ===
        0 &&
    noStructural.candidates.length ===
        0
);


const serialized =
    JSON.stringify(
        result
    );


check(
    "CANDIDATE SET DOES NOT MANUFACTURE SCIENTIFIC POLARITY",
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