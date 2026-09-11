import {
    ScientificDocumentaryCompositionCandidateEngine
} from "../laboratory/scientific-documentary-composition-candidate/ScientificDocumentaryCompositionCandidateEngine.js";

import type {
    ScientificProtocolRelationEvidence
} from "../laboratory/scientific-protocol-relation-evidence/ScientificProtocolRelationEvidence.js";


let failures =
    0;


function check(
    label:
        string,
    condition:
        boolean
): void {

    const result =
        condition
            ? "PASS"
            : "FAIL";


    console.log(
        `${label}: ${result}`
    );


    if (
        !condition
    ) {

        failures++;

    }

}


function relation(
    relationEvidenceId:
        string,
    subjectProtocolId:
        string | undefined,
    objectProtocolId:
        string,
    kind:
        "COMPOSES_WITH" | "EXTENSION_FOR" =
            "COMPOSES_WITH",
    sourceId:
        string =
            "SOURCE-A",
    sourceRevision:
        string | undefined =
            "REV-A"
): ScientificProtocolRelationEvidence {

    return {

        relationEvidenceId,

        sourceId,

        sourceRevision,

        observationId:
            `OBS-${relationEvidenceId}`,

        subjectSymbol:
            subjectProtocolId ??
            "UnknownSubject",

        ...(
            subjectProtocolId !==
                undefined
                ? {
                    subjectProtocolId
                }
                : {}
        ),

        relation:
            kind,

        objectProtocolId,

        evidenceBasis:
            kind ===
                "COMPOSES_WITH"
                ? "MARKDOWN_H1_EXPLICIT_COMPOSES_WITH_ERC"
                : "MARKDOWN_H1_EXPLICIT_EXTENSION_FOR_ERC",

        subjectLocator: {

            sourceLocation:
                "https://example.test/source",

            filePath:
                "contracts/example/README.md",

            startLine:
                1,

            endLine:
                1

        },

        subjectRawText:
            "# ERC example",

        locator: {

            sourceLocation:
                "https://example.test/source",

            filePath:
                "contracts/example/README.md",

            startLine:
                10,

            endLine:
                10

        },

        rawText:
            `${kind} ${objectProtocolId}`

    };

}


const engine =
    new ScientificDocumentaryCompositionCandidateEngine();


const profiles = [

    {
        protocolId:
            "ERC-8301",

        sourceId:
            "SOURCE-A",

        sourceRevision:
            "REV-A"
    },

    {
        protocolId:
            "ERC-8354",

        sourceId:
            "SOURCE-B",

        sourceRevision:
            "REV-B"
    }

];


const primary =
    engine.discover({

        profiles,

        relations: [

            relation(
                "REL-2",
                "ERC-8301",
                "ERC-8354"
            ),

            relation(
                "REL-1",
                "ERC-8301",
                "ERC-8354"
            )

        ]

    });


console.log(
    "\nSCIENTIFIC DOCUMENTARY COMPOSITION CANDIDATE — RUNTIME"
);

console.log(
    "-----------------------------------------------------"
);


check(
    "VALID DISCOVERY HAS NO ERRORS",
    primary.errors.length ===
        0
);


check(
    "DUPLICATE DOCUMENTARY OCCURRENCES AGGREGATE TO ONE CANDIDATE",
    primary.candidates.length ===
        1
);


const candidate =
    primary.candidates[0];


check(
    "CANDIDATE PRESERVES SUBJECT PARTICIPANT",
    candidate?.subjectParticipantId ===
        "ERC-8301"
);


check(
    "CANDIDATE PRESERVES OBJECT PARTICIPANT",
    candidate?.objectParticipantId ===
        "ERC-8354"
);


check(
    "CANDIDATE PRESERVES DOCUMENTARY RELATION KIND",
    candidate?.relation ===
        "COMPOSES_WITH"
);


check(
    "CANDIDATE AGGREGATES BOTH EVIDENCE OCCURRENCES",
    JSON.stringify(
        candidate?.evidenceIds
    ) ===
        JSON.stringify([
            "REL-1",
            "REL-2"
        ])
);


check(
    "DOCUMENTARY CANDIDATE REMAINS UNEVALUATED",
    candidate?.evaluationStatus ===
        "UNEVALUATED"
);


check(
    "DOCUMENTARY CANDIDATE DOES NOT CLAIM COMPATIBILITY",
    candidate !==
        undefined &&
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
);


const missingObject =
    engine.discover({

        profiles: [
            profiles[0]
        ],

        relations: [
            relation(
                "REL-MISSING",
                "ERC-8301",
                "ERC-8354"
            )
        ]

    });


check(
    "MISSING OBJECT PARTICIPANT CREATES NO CANDIDATE",
    missingObject.candidates.length ===
        0
);


check(
    "MISSING OBJECT PROTOCOL IS EXPOSED",
    JSON.stringify(
        missingObject.unresolvedObjectProtocolIds
    ) ===
        JSON.stringify([
            "ERC-8354"
        ])
);


check(
    "MISSING OBJECT RELATION REMAINS UNRESOLVED",
    JSON.stringify(
        missingObject.unresolvedRelationEvidenceIds
    ) ===
        JSON.stringify([
            "REL-MISSING"
        ])
);


const unresolvedSubject =
    engine.discover({

        profiles,

        relations: [
            relation(
                "REL-NO-SUBJECT-ID",
                undefined,
                "ERC-8354"
            )
        ]

    });


check(
    "NON CANONICAL DOCUMENT SUBJECT CREATES NO CANDIDATE",
    unresolvedSubject.candidates.length ===
        0
);


check(
    "NON CANONICAL DOCUMENT SUBJECT REMAINS UNRESOLVED",
    JSON.stringify(
        unresolvedSubject.unresolvedRelationEvidenceIds
    ) ===
        JSON.stringify([
            "REL-NO-SUBJECT-ID"
        ])
);


const contaminatedSource =
    engine.discover({

        profiles,

        relations: [
            relation(
                "REL-WRONG-SOURCE",
                "ERC-8301",
                "ERC-8354",
                "COMPOSES_WITH",
                "FOREIGN-SOURCE",
                "REV-A"
            )
        ]

    });


check(
    "SUBJECT SOURCE CONTAMINATION IS DETECTED",
    contaminatedSource.errors.length >
        0
);


check(
    "SUBJECT SOURCE CONTAMINATION FAILS CLOSED",
    contaminatedSource.candidates.length ===
        0
);


const contaminatedRevision =
    engine.discover({

        profiles,

        relations: [
            relation(
                "REL-WRONG-REVISION",
                "ERC-8301",
                "ERC-8354",
                "COMPOSES_WITH",
                "SOURCE-A",
                "FOREIGN-REVISION"
            )
        ]

    });


check(
    "SUBJECT REVISION CONTAMINATION IS DETECTED",
    contaminatedRevision.errors.length >
        0
);


check(
    "SUBJECT REVISION CONTAMINATION FAILS CLOSED",
    contaminatedRevision.candidates.length ===
        0
);


const forward =
    engine.discover({

        profiles,

        relations: [

            relation(
                "REL-2",
                "ERC-8301",
                "ERC-8354"
            ),

            relation(
                "REL-1",
                "ERC-8301",
                "ERC-8354"
            )

        ]

    });


const reverse =
    engine.discover({

        profiles:
            [
                ...profiles
            ].reverse(),

        relations: [

            relation(
                "REL-1",
                "ERC-8301",
                "ERC-8354"
            ),

            relation(
                "REL-2",
                "ERC-8301",
                "ERC-8354"
            )

        ]

    });


check(
    "DISCOVERY IS DETERMINISTIC ACROSS INPUT ORDER",
    JSON.stringify(
        forward
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