import {
    ScientificCompositionCandidateSetEngine
} from "../laboratory/scientific-composition-candidate-set/ScientificCompositionCandidateSetEngine.js";

import type {
    ScientificCompositionComplementarityMatch
} from "../laboratory/scientific-composition-complementarity/ScientificCompositionComplementarityMatch.js";

import type {
    ScientificDocumentaryCompositionCandidate
} from "../laboratory/scientific-documentary-composition-candidate/ScientificDocumentaryCompositionCandidate.js";


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


const functionalMatch:
    ScientificCompositionComplementarityMatch = {

        matchId:
            "MATCH-1",

        consumerParticipantId:
            "ERC-8004",

        providerParticipantId:
            "ERC-9000",

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
            "EVIDENCE-FUNCTIONAL-1",
            "EVIDENCE-FUNCTIONAL-2"
        ],

        evaluationStatus:
            "UNEVALUATED"

    };


const documentaryCandidate:
    ScientificDocumentaryCompositionCandidate = {

        candidateId:
            "DOCUMENTARY-1",

        subjectParticipantId:
            "ERC-8301",

        objectParticipantId:
            "ERC-8354",

        relation:
            "COMPOSES_WITH",

        evidenceIds: [
            "EVIDENCE-DOC-2",
            "EVIDENCE-DOC-1"
        ],

        evaluationStatus:
            "UNEVALUATED"

    };


const engine =
    new ScientificCompositionCandidateSetEngine();


const primary =
    engine.build({

        participantIds: [
            "ERC-8004",
            "ERC-8301",
            "ERC-8354",
            "ERC-9000"
        ],

        functionalMatches: [
            functionalMatch
        ],

        documentaryCandidates: [
            documentaryCandidate
        ]

    });


console.log(
    "\nSCIENTIFIC COMPOSITION CANDIDATE SET — RUNTIME"
);
console.log(
    "---------------------------------------------"
);


check(
    "VALID CANDIDATE SET HAS NO ERRORS",
    primary.errors.length ===
        0
);


check(
    "BOTH DISCOVERY PATHS ARE PRESERVED",
    primary.candidates.length ===
        2
);


const functional =
    primary.candidates.find(
        candidate =>
            candidate.kind ===
                "FUNCTIONAL_COMPLEMENTARITY"
    );


const documentary =
    primary.candidates.find(
        candidate =>
            candidate.kind ===
                "DOCUMENTARY_COMPOSITION"
    );


check(
    "FUNCTIONAL CANDIDATE PRESERVES DIRECTION",
    functional?.sourceParticipantId ===
        "ERC-8004" &&
    functional.targetParticipantId ===
        "ERC-9000"
);


check(
    "FUNCTIONAL CANDIDATE PRESERVES MATCH IDENTITY",
    functional?.kind ===
        "FUNCTIONAL_COMPLEMENTARITY" &&
    functional.functionalMatchId ===
        "MATCH-1"
);


check(
    "FUNCTIONAL CANDIDATE PRESERVES NEED",
    functional?.kind ===
        "FUNCTIONAL_COMPLEMENTARITY" &&
    functional.needId ===
        "NEED-1"
);


check(
    "DOCUMENTARY CANDIDATE PRESERVES DIRECTION",
    documentary?.sourceParticipantId ===
        "ERC-8301" &&
    documentary.targetParticipantId ===
        "ERC-8354"
);


check(
    "DOCUMENTARY CANDIDATE PRESERVES RELATION",
    documentary?.kind ===
        "DOCUMENTARY_COMPOSITION" &&
    documentary.relation ===
        "COMPOSES_WITH"
);


check(
    "DOCUMENTARY EVIDENCE IS DETERMINISTICALLY SORTED",
    documentary?.kind ===
        "DOCUMENTARY_COMPOSITION" &&
    JSON.stringify(
        documentary.evidenceIds
    ) ===
        JSON.stringify([
            "EVIDENCE-DOC-1",
            "EVIDENCE-DOC-2"
        ])
);


check(
    "ALL CANDIDATES REMAIN UNEVALUATED",
    primary.candidates.every(
        candidate =>
            candidate.evaluationStatus ===
                "UNEVALUATED"
    )
);


check(
    "CANDIDATE SET CLAIMS NO COMPATIBILITY OR CONFIDENCE",
    primary.candidates.every(
        candidate =>
            !(
                "scientificPolarity" in
                candidate
            ) &&
            !(
                "compatibility" in
                candidate
            ) &&
            !(
                "confidence" in
                candidate
            )
    )
);


const foreignFunctional =
    engine.build({

        participantIds: [
            "ERC-8004"
        ],

        functionalMatches: [
            functionalMatch
        ],

        documentaryCandidates:
            []

    });


check(
    "FOREIGN FUNCTIONAL PARTICIPANT IS DETECTED",
    foreignFunctional.errors.length >
        0
);


check(
    "FOREIGN FUNCTIONAL PARTICIPANT FAILS CLOSED",
    foreignFunctional.candidates.length ===
        0
);


const foreignDocumentary =
    engine.build({

        participantIds: [
            "ERC-8301"
        ],

        functionalMatches:
            [],

        documentaryCandidates: [
            documentaryCandidate
        ]

    });


check(
    "FOREIGN DOCUMENTARY PARTICIPANT IS DETECTED",
    foreignDocumentary.errors.length >
        0
);


check(
    "FOREIGN DOCUMENTARY PARTICIPANT FAILS CLOSED",
    foreignDocumentary.candidates.length ===
        0
);


const duplicateFunctional =
    engine.build({

        participantIds: [
            "ERC-8004",
            "ERC-9000"
        ],

        functionalMatches: [
            functionalMatch,
            functionalMatch
        ],

        documentaryCandidates:
            []

    });


check(
    "DUPLICATE FUNCTIONAL MATCH IS DETECTED",
    duplicateFunctional.errors.length >
        0
);


check(
    "DUPLICATE FUNCTIONAL MATCH FAILS CLOSED",
    duplicateFunctional.candidates.length ===
        0
);


const duplicateDocumentary =
    engine.build({

        participantIds: [
            "ERC-8301",
            "ERC-8354"
        ],

        functionalMatches:
            [],

        documentaryCandidates: [
            documentaryCandidate,
            documentaryCandidate
        ]

    });


check(
    "DUPLICATE DOCUMENTARY CANDIDATE IS DETECTED",
    duplicateDocumentary.errors.length >
        0
);


check(
    "DUPLICATE DOCUMENTARY CANDIDATE FAILS CLOSED",
    duplicateDocumentary.candidates.length ===
        0
);


const reverse =
    engine.build({

        participantIds: [
            "ERC-9000",
            "ERC-8354",
            "ERC-8301",
            "ERC-8004"
        ],

        functionalMatches: [
            functionalMatch
        ].reverse(),

        documentaryCandidates: [
            documentaryCandidate
        ].reverse()

    });


check(
    "CANDIDATE SET IS DETERMINISTIC ACROSS INPUT ORDER",
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