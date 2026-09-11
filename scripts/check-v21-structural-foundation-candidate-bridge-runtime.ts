import type {
    ScientificCrossProtocolCompositionResult
} from "../laboratory/scientific-cross-protocol-composition/ScientificCrossProtocolCompositionResult.js";

import {
    ScientificStructuralFoundationCompositionCandidateEngine
} from "../laboratory/scientific-structural-foundation-candidate/ScientificStructuralFoundationCompositionCandidateEngine.js";


let pass =
    0;

let fail =
    0;


function check(
    name:
        string,
    condition:
        boolean
): void {

    console.log(
        `${name}: ${condition ? "PASS" : "FAIL"}`
    );

    if (condition) {
        pass++;
    }
    else {
        fail++;
    }

}


function validStructuralInput():
    ScientificCrossProtocolCompositionResult {

    return {

        candidates: [
            {

                candidateId:
                    "SOURCE-FOUNDATION-8004-8060",

                participantA: {

                    kind:
                        "PROTOCOL",

                    id:
                        "ERC-8060"

                },

                participantB: {

                    kind:
                        "PROTOCOL",

                    id:
                        "ERC-8004"

                },

                mechanism:
                    "SHARED_PROTOCOL_FOUNDATION",

                foundationProtocolId:
                    "ERC-721",

                supportingCapabilityIdsA:
                    [],

                supportingCapabilityIdsB:
                    [],

                provenance: [
                    {

                        kind:
                            "STRUCTURAL_PROTOCOL_RELATION",

                        sourceId:
                            "SOURCE-8060",

                        sourceRevision:
                            "REV-8060",

                        evidenceId:
                            "EVIDENCE-8060-ERC721"

                    },
                    {

                        kind:
                            "STRUCTURAL_PROTOCOL_RELATION",

                        sourceId:
                            "SOURCE-8004",

                        sourceRevision:
                            "REV-8004",

                        evidenceId:
                            "EVIDENCE-8004-ERC721"

                    }

                ],

                evaluationStatus:
                    "UNEVALUATED"

            }
        ],

        errors:
            []

    };

}


console.log("");
console.log(
    "V2.1 STRUCTURAL FOUNDATION CANDIDATE BRIDGE"
);

console.log(
    "==========================================="
);


const engine =
    new ScientificStructuralFoundationCompositionCandidateEngine();


const result =
    engine.normalize(
        validStructuralInput()
    );


check(
    "VALID STRUCTURAL FOUNDATION NORMALIZES WITHOUT ERRORS",
    result.errors.length ===
        0
);


check(
    "EXACTLY ONE STRUCTURAL FOUNDATION CANDIDATE IS PRODUCED",
    result.candidates.length ===
        1
);


const candidate =
    result.candidates[0];


check(
    "PARTICIPANTS USE CANONICAL DETERMINISTIC ORDER",
    candidate?.participantAId ===
        "ERC-8004" &&
    candidate?.participantBId ===
        "ERC-8060"
);


check(
    "CANONICAL ORDER IS EXPLICITLY UNDIRECTED",
    candidate?.directionality ===
        "UNDIRECTED"
);


check(
    "ERC-721 FOUNDATION IS PRESERVED",
    candidate?.foundationProtocolId ===
        "ERC-721" &&
    candidate?.mechanism ===
        "SHARED_PROTOCOL_FOUNDATION"
);


check(
    "SOURCE CROSS-PROTOCOL CANDIDATE IDENTITY IS PRESERVED",
    candidate?.sourceCandidateId ===
        "SOURCE-FOUNDATION-8004-8060"
);


check(
    "EXACT DISCOVERY EVIDENCE IS PRESERVED",
    JSON.stringify(
        candidate?.evidenceIds
    ) ===
    JSON.stringify([
        "EVIDENCE-8004-ERC721",
        "EVIDENCE-8060-ERC721"
    ])
);


check(
    "FULL SOURCE PROVENANCE IS PRESERVED",
    candidate?.provenance.length ===
        2 &&
    candidate.provenance.every(
        provenance =>
            provenance.kind ===
            "STRUCTURAL_PROTOCOL_RELATION"
    )
);


check(
    "NORMALIZED CANDIDATE REMAINS UNEVALUATED",
    candidate?.evaluationStatus ===
        "UNEVALUATED"
);


const reversedInput =
    validStructuralInput();


const reversedCandidate =
    reversedInput.candidates[0];


const originalParticipantA =
    reversedCandidate.participantA;


reversedCandidate.participantA =
    reversedCandidate.participantB;

reversedCandidate.participantB =
    originalParticipantA;


const reversed =
    engine.normalize(
        reversedInput
    );


check(
    "REVERSED SOURCE PARTICIPANT ORDER PRESERVES SEMANTIC IDENTITY",
    reversed.errors.length ===
        0 &&
    reversed.candidates[0]?.candidateId ===
        candidate?.candidateId
);


const withOtherMechanism:
    ScientificCrossProtocolCompositionResult = {

        candidates: [
            ...validStructuralInput().candidates,
            {

                candidateId:
                    "OTHER-CANDIDATE",

                participantA: {

                    kind:
                        "PROTOCOL",

                    id:
                        "ERC-8004"

                },

                participantB: {

                    kind:
                        "PROTOCOL",

                    id:
                        "ERC-8312"

                },

                mechanism:
                    "SHARED_RECURRENT_CONCEPT",

                conceptId:
                    "CONCEPT-X",

                supportingCapabilityIdsA:
                    [
                        "CAP-A"
                    ],

                supportingCapabilityIdsB:
                    [
                        "CAP-B"
                    ],

                provenance: [
                    {

                        kind:
                            "PROTOCOL_CONCEPT",

                        sourceId:
                            "SOURCE-X",

                        sourceRevision:
                            "REV-X",

                        evidenceId:
                            "EVIDENCE-X"

                    }
                ],

                evaluationStatus:
                    "UNEVALUATED"

            }
        ],

        errors:
            []

    };


const filtered =
    engine.normalize(
        withOtherMechanism
    );


check(
    "OTHER DISCOVERY MECHANISMS ARE NOT RECLASSIFIED",
    filtered.errors.length ===
        0 &&
    filtered.candidates.length ===
        1 &&
    filtered.ignoredCandidateIds.length ===
        1 &&
    filtered.ignoredCandidateIds[0] ===
        "OTHER-CANDIDATE"
);


const symbolicInput =
    validStructuralInput();


symbolicInput.candidates[0].participantA = {

    kind:
        "SYMBOLIC_SUBJECT",

    id:
        "ERC-8060"

};


const symbolic =
    engine.normalize(
        symbolicInput
    );


check(
    "NON-PROTOCOL STRUCTURAL PARTICIPANT FAILS CLOSED",
    symbolic.candidates.length ===
        0 &&
    symbolic.errors.length >
        0
);


const wrongProvenanceInput =
    validStructuralInput();


wrongProvenanceInput.candidates[0].provenance[0] = {

    kind:
        "PROTOCOL_RELATION",

    sourceId:
        "SOURCE-8060",

    sourceRevision:
        "REV-8060",

    evidenceId:
        "EVIDENCE-8060-ERC721"

};


const wrongProvenance =
    engine.normalize(
        wrongProvenanceInput
    );


check(
    "NON-STRUCTURAL FOUNDATION PROVENANCE FAILS CLOSED",
    wrongProvenance.candidates.length ===
        0 &&
    wrongProvenance.errors.length >
        0
);


const noProvenanceInput =
    validStructuralInput();


noProvenanceInput.candidates[0].provenance =
    [];


const noProvenance =
    engine.normalize(
        noProvenanceInput
    );


check(
    "STRUCTURAL FOUNDATION WITHOUT PROVENANCE FAILS CLOSED",
    noProvenance.candidates.length ===
        0 &&
    noProvenance.errors.length >
        0
);


const upstreamFailure =
    engine.normalize({

        candidates:
            [],

        errors:
            [
                "UPSTREAM_DISCOVERY_FAILURE"
            ]

    });


check(
    "UPSTREAM DISCOVERY ERROR FAILS CLOSED",
    upstreamFailure.candidates.length ===
        0 &&
    upstreamFailure.errors.length >
        0
);


const repeated =
    engine.normalize(
        validStructuralInput()
    );


check(
    "STRUCTURAL FOUNDATION NORMALIZATION IS DETERMINISTIC",
    JSON.stringify(
        result
    ) ===
    JSON.stringify(
        repeated
    )
);


const serialized =
    JSON.stringify(
        result
    );


check(
    "NORMALIZATION CONTAINS NO SCIENTIFIC POLARITY",
    !serialized.includes(
        '"SUPPORT"'
    ) &&
    !serialized.includes(
        '"CHALLENGE"'
    ) &&
    !serialized.includes(
        '"INCONCLUSIVE"'
    ) &&
    !serialized.includes(
        '"FULL"'
    ) &&
    !serialized.includes(
        '"PARTIAL"'
    )
);


console.log("");
console.log(
    "NORMALIZED CONTROL"
);

console.log(
    "------------------"
);


if (
    candidate !==
    undefined
) {

    console.log(
        `candidate:    ${candidate.candidateId}`
    );

    console.log(
        `participantA: ${candidate.participantAId}`
    );

    console.log(
        `participantB: ${candidate.participantBId}`
    );

    console.log(
        `direction:    ${candidate.directionality}`
    );

    console.log(
        `foundation:   ${candidate.foundationProtocolId}`
    );

    console.log(
        `evidence:     ${candidate.evidenceIds.length}`
    );

    console.log(
        `evaluation:   ${candidate.evaluationStatus}`
    );

}


console.log("");
console.log(
    `PASS: ${pass}`
);

console.log(
    `FAIL: ${fail}`
);

console.log(
    `RESULT: ${fail === 0 ? "PASS" : "FAIL"}`
);


if (
    fail >
    0
) {

    process.exitCode =
        1;

}