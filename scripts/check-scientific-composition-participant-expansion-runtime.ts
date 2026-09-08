import {
    ScientificCompositionParticipantExpansionEngine
} from "../laboratory/scientific-composition-participant-expansion/ScientificCompositionParticipantExpansionEngine.js";

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

    console.log(
        `${label}: ${condition ? "PASS" : "FAIL"}`
    );


    if (!condition) {

        failures++;

    }

}


function relation(
    id:
        string,
    subject:
        string,
    object:
        string,
    sourceId:
        string,
    sourceRevision:
        string
): ScientificProtocolRelationEvidence {

    return {

        relationEvidenceId:
            id,

        sourceId,

        sourceRevision,

        observationId:
            `OBS-${id}`,

        subjectSymbol:
            subject,

        subjectProtocolId:
            subject,

        relation:
            "COMPOSES_WITH",

        objectProtocolId:
            object,

        evidenceBasis:
            "MARKDOWN_H1_EXPLICIT_COMPOSES_WITH_ERC",

        subjectLocator: {
            sourceLocation:
                "https://example.test",
            startLine:
                1,
            endLine:
                1
        },

        subjectRawText:
            `# ${subject}`,

        locator: {
            sourceLocation:
                "https://example.test",
            startLine:
                2,
            endLine:
                2
        },

        rawText:
            `${subject} composes with ${object}`

    };

}


const engine =
    new ScientificCompositionParticipantExpansionEngine();


const initial = [
    {
        protocolId:
            "ERC-8301",
        sourceId:
            "SOURCE-A",
        sourceRevision:
            "REV-A"
    }
];


const available = [

    ...initial,

    {
        protocolId:
            "ERC-8354",
        sourceId:
            "SOURCE-B",
        sourceRevision:
            "REV-B"
    },

    {
        protocolId:
            "ERC-9000",
        sourceId:
            "SOURCE-C",
        sourceRevision:
            "REV-C"
    }

];


const primary =
    engine.expand({

        initialParticipants:
            initial,

        availableProtocolSources:
            available,

        relations: [

            relation(
                "REL-2",
                "ERC-8301",
                "ERC-8354",
                "SOURCE-A",
                "REV-A"
            ),

            relation(
                "REL-1",
                "ERC-8301",
                "ERC-8354",
                "SOURCE-A",
                "REV-A"
            ),

            relation(
                "REL-3",
                "ERC-8354",
                "ERC-9000",
                "SOURCE-B",
                "REV-B"
            )

        ]

    });


console.log(
    "\nSCIENTIFIC COMPOSITION PARTICIPANT EXPANSION — RUNTIME"
);
console.log(
    "----------------------------------------------------"
);


check(
    "VALID EXPANSION HAS NO ERRORS",
    primary.errors.length ===
        0
);


check(
    "TRANSITIVE DOCUMENTARY EXPANSION DISCOVERS THREE PARTICIPANTS",
    primary.participants.length ===
        3
);


const expanded8354 =
    primary.participants.find(
        participant =>
            participant.protocolId ===
            "ERC-8354"
    );


check(
    "ERC-8354 IS DOCUMENTARILY EXPANDED",
    expanded8354?.expansionBasis ===
        "DOCUMENTARY_RELATION"
);


check(
    "ERC-8354 AGGREGATES BOTH DISCOVERY EVIDENCES",
    JSON.stringify(
        expanded8354?.evidenceIds
    ) ===
        JSON.stringify([
            "REL-1",
            "REL-2"
        ])
);


check(
    "TRANSITIVE ERC-9000 IS DISCOVERED",
    primary.participants.some(
        participant =>
            participant.protocolId ===
            "ERC-9000" &&
            participant.expansionBasis ===
                "DOCUMENTARY_RELATION"
    )
);


const missing =
    engine.expand({

        initialParticipants:
            initial,

        availableProtocolSources:
            initial,

        relations: [
            relation(
                "REL-MISSING",
                "ERC-8301",
                "ERC-8354",
                "SOURCE-A",
                "REV-A"
            )
        ]

    });


check(
    "ABSENT OBJECT SOURCE DOES NOT EXPAND",
    missing.participants.length ===
        1
);


check(
    "ABSENT OBJECT SOURCE IS UNRESOLVED",
    JSON.stringify(
        missing.unresolvedProtocolIds
    ) ===
        JSON.stringify([
            "ERC-8354"
        ])
);


const ambiguous =
    engine.expand({

        initialParticipants:
            initial,

        availableProtocolSources: [

            ...initial,

            {
                protocolId:
                    "ERC-8354",
                sourceId:
                    "SOURCE-B",
                sourceRevision:
                    "REV-B"
            },

            {
                protocolId:
                    "ERC-8354",
                sourceId:
                    "SOURCE-C",
                sourceRevision:
                    "REV-C"
            }

        ],

        relations: [
            relation(
                "REL-AMBIGUOUS",
                "ERC-8301",
                "ERC-8354",
                "SOURCE-A",
                "REV-A"
            )
        ]

    });


check(
    "AMBIGUOUS OBJECT SOURCE DOES NOT EXPAND",
    ambiguous.participants.length ===
        1
);


check(
    "AMBIGUOUS OBJECT SOURCE FAILS CLOSED",
    JSON.stringify(
        ambiguous.ambiguousProtocolIds
    ) ===
        JSON.stringify([
            "ERC-8354"
        ])
);


const foreign =
    engine.expand({

        initialParticipants:
            initial,

        availableProtocolSources:
            available,

        relations: [
            relation(
                "REL-FOREIGN",
                "ERC-8301",
                "ERC-8354",
                "FOREIGN",
                "REV-A"
            )
        ]

    });


check(
    "SUBJECT PROVENANCE CONTAMINATION IS DETECTED",
    foreign.errors.length >
        0
);


check(
    "SUBJECT PROVENANCE CONTAMINATION FAILS CLOSED",
    foreign.participants.length ===
        0
);


const unrelated =
    engine.expand({

        initialParticipants:
            initial,

        availableProtocolSources: [
            ...available,
            {
                protocolId:
                    "ERC-7777",
                sourceId:
                    "SOURCE-D",
                sourceRevision:
                    "REV-D"
            }
        ],

        relations: [
            relation(
                "REL-UNRELATED",
                "ERC-9999",
                "ERC-7777",
                "SOURCE-X",
                "REV-X"
            )
        ]

    });


check(
    "UNREACHABLE DOCUMENTARY RELATION DOES NOT EXPAND FRAME",
    unrelated.participants.length ===
        1
);


const reverse =
    engine.expand({

        initialParticipants:
            [...initial].reverse(),

        availableProtocolSources:
            [...available].reverse(),

        relations: [

            relation(
                "REL-3",
                "ERC-8354",
                "ERC-9000",
                "SOURCE-B",
                "REV-B"
            ),

            relation(
                "REL-1",
                "ERC-8301",
                "ERC-8354",
                "SOURCE-A",
                "REV-A"
            ),

            relation(
                "REL-2",
                "ERC-8301",
                "ERC-8354",
                "SOURCE-A",
                "REV-A"
            )

        ]

    });


check(
    "EXPANSION IS DETERMINISTIC ACROSS INPUT ORDER",
    JSON.stringify(primary) ===
        JSON.stringify(reverse)
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