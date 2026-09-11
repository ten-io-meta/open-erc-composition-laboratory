import {
    ScientificDocumentationProtocolRelationEvidenceEngine
} from "../laboratory/scientific-protocol-relation-evidence/ScientificDocumentationProtocolRelationEvidenceEngine.js";

import type {
    ScientificSourceObservation
} from "../laboratory/scientific-source-observation/ScientificSourceObservation.js";


const sourceId =
    "CONTROLLED-SOURCE";

const sourceRevision =
    "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";


const documentation:
    ScientificSourceObservation = {

    observationId:
        "OBS-DOC",

    sourceId,

    sourceType:
        "GITHUB",

    sourceRevision,

    kind:
        "DOCUMENTATION",

    locator: {

        sourceLocation:
            "CONTROLLED",

        filePath:
            "README.md",

        startLine:
            1,

        endLine:
            3

    },

    rawText:
`# IExampleExtension

Minimal extension for ERC-321.
`

};


const irrelevantContractObservation:
    ScientificSourceObservation = {

    observationId:
        "OBS-CONTRACT",

    /*
     * Deliberately contaminated.
     *
     * CONTRACT_SOURCE is outside this engine's documentary
     * evidence boundary and must not affect the result.
     */
    sourceId:
        "OTHER-SOURCE",

    sourceType:
        "GITHUB",

    sourceRevision:
        "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",

    kind:
        "CONTRACT_SOURCE",

    locator: {

        sourceLocation:
            ""

    },

    rawText:
        ""

};


const engine =
    new ScientificDocumentationProtocolRelationEvidenceEngine();


const result =
    engine.extract({

        sourceId,

        sourceRevision,

        observations: [
            irrelevantContractObservation,
            documentation
        ]

    });


const relation =
    result.relations[0];


const checks = [
    {
        name:
            "NON DOCUMENTATION PROVENANCE CONTAMINATION IS IGNORED",
        passed:
            result.errors.length ===
            0
    },
    {
        name:
            "VALID DOCUMENTATION STILL PRODUCES RELATION",
        passed:
            result.relations.length ===
                1 &&
            relation?.subjectSymbol ===
                "IExampleExtension" &&
            relation?.objectProtocolId ===
                "ERC-321"
    },
    {
        name:
            "NON DOCUMENTATION OBSERVATION IS NOT MARKED UNRESOLVED",
        passed:
            !result
                .unresolvedObservationIds
                .includes(
                    "OBS-CONTRACT"
                )
    }
];


console.log("");
console.log(
    "SCIENTIFIC PROTOCOL RELATION EVIDENCE — NON-DOCUMENTATION ISOLATION"
);
console.log(
    "-----------------------------------------------------------------"
);


for (
    const check
    of checks
) {

    console.log(
        `${check.name}: ${
            check.passed
                ? "PASS"
                : "FAIL"
        }`
    );

}


const failures =
    checks.filter(
        check =>
            !check.passed
    );


console.log("");


if (
    failures.length ===
    0
) {

    console.log(
        "RESULT: PASS"
    );

} else {

    console.log(
        `RESULT: FAIL (${failures.length}/${checks.length})`
    );

    process.exitCode =
        1;

}
