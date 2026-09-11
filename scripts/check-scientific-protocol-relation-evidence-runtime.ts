import {
    ScientificDocumentationProtocolRelationEvidenceEngine
} from "../laboratory/scientific-protocol-relation-evidence/ScientificDocumentationProtocolRelationEvidenceEngine.js";

import type {
    ScientificSourceObservation
} from "../laboratory/scientific-source-observation/ScientificSourceObservation.js";


const sourceId =
    "CONTROLLED-DOCUMENTATION-SOURCE";

const sourceRevision =
    "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";


const realShapeObservation:
    ScientificSourceObservation = {

    observationId:
        "OBS-README",

    sourceId,

    sourceType:
        "GITHUB",

    sourceRevision,

    kind:
        "DOCUMENTATION",

    locator: {

        sourceLocation:
            "https://github.com/example/repository",

        filePath:
            "README.md",

        startLine:
            1,

        endLine:
            20

    },

    rawText:
`# IExampleExtension
[badge]

Minimal reservation accounting extension for ERC-321 value-bearing tokens.

The extension allows authorized actors to reserve value.

| Layer                              | Responsibility         |
| ---------------------------------- | ---------------------- |
| ERC-321                            | Value custody          |
| IExampleExtension                  | Reservation accounting |
| Reputation Systems (e.g. ERC-654) | Identity and trust     |

> extension for ERC-777

\`\`\`text
extension for ERC-888
\`\`\`
`

};


const noRelationObservation:
    ScientificSourceObservation = {

    observationId:
        "OBS-NO-RELATION",

    sourceId,

    sourceType:
        "GITHUB",

    sourceRevision,

    kind:
        "DOCUMENTATION",

    locator: {

        sourceLocation:
            "https://github.com/example/repository",

        filePath:
            "docs/no-relation.md",

        startLine:
            20,

        endLine:
            24

    },

    rawText:
`# IUnrelatedExtension

This document discusses ERC-999 without declaring an extension relation.
`

};


const descriptiveHeadingObservation:
    ScientificSourceObservation = {

    observationId:
        "OBS-DESCRIPTIVE-H1",

    sourceId,

    sourceType:
        "GITHUB",

    sourceRevision,

    kind:
        "DOCUMENTATION",

    locator: {

        sourceLocation:
            "https://github.com/example/repository",

        filePath:
            "docs/descriptive.md",

        startLine:
            40,

        endLine:
            44

    },

    rawText:
`# Example Extension Documentation

Minimal extension for ERC-222.
`

};


const inlineCodeSubjectObservation:
    ScientificSourceObservation = {

    observationId:
        "OBS-INLINE-CODE-H1",

    sourceId,

    sourceType:
        "GITHUB",

    sourceRevision,

    kind:
        "DOCUMENTATION",

    locator: {

        sourceLocation:
            "https://github.com/example/repository",

        filePath:
            "docs/inline.md",

        startLine:
            60,

        endLine:
            64

    },

    rawText:
`# \`IInlineExtension\`

Minimal extension for ERC-444.
`

};


const nonDocumentationObservation:
    ScientificSourceObservation = {

    observationId:
        "OBS-CONTRACT",

    sourceId,

    sourceType:
        "GITHUB",

    sourceRevision,

    kind:
        "CONTRACT_SOURCE",

    locator: {

        sourceLocation:
            "https://github.com/example/repository",

        filePath:
            "contracts/IContract.sol",

        startLine:
            1,

        endLine:
            3

    },

    rawText:
`# IContract
extension for ERC-555
`

};


const engine =
    new ScientificDocumentationProtocolRelationEvidenceEngine();


const result =
    engine.extract({

        sourceId,

        sourceRevision,

        observations: [
            nonDocumentationObservation,
            descriptiveHeadingObservation,
            realShapeObservation,
            inlineCodeSubjectObservation,
            noRelationObservation
        ]

    });


const secondRun =
    engine.extract({

        sourceId,

        sourceRevision,

        observations: [
            noRelationObservation,
            inlineCodeSubjectObservation,
            realShapeObservation,
            descriptiveHeadingObservation,
            nonDocumentationObservation
        ]

    });


const mainRelation =
    result.relations.find(
        relation =>
            relation.observationId ===
            "OBS-README"
    );


const inlineRelation =
    result.relations.find(
        relation =>
            relation.observationId ===
            "OBS-INLINE-CODE-H1"
    );


const revisionFailure =
    engine.extract({

        sourceId,

        sourceRevision,

        observations: [
            {
                ...realShapeObservation,

                sourceRevision:
                    "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"
            }
        ]

    });


const sourceFailure =
    engine.extract({

        sourceId,

        sourceRevision,

        observations: [
            {
                ...realShapeObservation,

                sourceId:
                    "OTHER-SOURCE"
            }
        ]

    });


const duplicateObservationFailure =
    engine.extract({

        sourceId,

        sourceRevision,

        observations: [
            realShapeObservation,
            {
                ...realShapeObservation
            }
        ]

    });


const checks: Array<{
    name: string;
    passed: boolean;
}> = [
    {
        name:
            "RUNTIME PRESERVES SOURCE ID",
        passed:
            result.sourceId ===
            sourceId
    },
    {
        name:
            "RUNTIME PRESERVES SOURCE REVISION",
        passed:
            result.sourceRevision ===
            sourceRevision
    },
    {
        name:
            "VALID DOCUMENTARY EXTRACTION HAS NO ERRORS",
        passed:
            result.errors.length ===
            0
    },
    {
        name:
            "REAL SHAPE DOCUMENT PRODUCES RELATION",
        passed:
            mainRelation !==
            undefined
    },
    {
        name:
            "REAL SHAPE SUBJECT COMES FROM H1",
        passed:
            mainRelation
                ?.subjectSymbol ===
            "IExampleExtension"
    },
    {
        name:
            "REAL SHAPE RELATION IS EXTENSION FOR",
        passed:
            mainRelation
                ?.relation ===
            "EXTENSION_FOR"
    },
    {
        name:
            "EXPLICIT ERC OBJECT IS CANONICALIZED",
        passed:
            mainRelation
                ?.objectProtocolId ===
            "ERC-321"
    },
    {
        name:
            "EVIDENCE BASIS IS EXPLICIT",
        passed:
            mainRelation
                ?.evidenceBasis ===
            "MARKDOWN_H1_EXPLICIT_EXTENSION_FOR_ERC"
    },
    {
        name:
            "SUBJECT RAW TEXT IS PRESERVED",
        passed:
            mainRelation
                ?.subjectRawText ===
            "# IExampleExtension"
    },
    {
        name:
            "SUBJECT LOCATION IS EXACT",
        passed:
            mainRelation
                ?.subjectLocator
                .startLine ===
                1 &&
            mainRelation
                ?.subjectLocator
                .endLine ===
                1
    },
    {
        name:
            "RELATION RAW TEXT IS PRESERVED",
        passed:
            mainRelation
                ?.rawText ===
            "Minimal reservation accounting extension for ERC-321 value-bearing tokens."
    },
    {
        name:
            "RELATION LOCATION IS EXACT",
        passed:
            mainRelation
                ?.locator
                .startLine ===
                4 &&
            mainRelation
                ?.locator
                .endLine ===
                4
    },
    {
        name:
            "RELATION PRESERVES FILE PATH",
        passed:
            mainRelation
                ?.locator
                .filePath ===
            "README.md"
    },
    {
        name:
            "TABLE ERC OBJECT DOES NOT CREATE EXTRA RELATION",
        passed:
            !result.relations.some(
                relation =>
                    relation.objectProtocolId ===
                    "ERC-654"
            )
    },
    {
        name:
            "TABLE CO-MENTION DOES NOT CREATE COMPOSITION EVIDENCE",
        passed:
            result.relations.filter(
                relation =>
                    relation.observationId ===
                    "OBS-README"
            ).length ===
            1
    },
    {
        name:
            "BLOCKQUOTE RELATION TEXT IS IGNORED",
        passed:
            !result.relations.some(
                relation =>
                    relation.objectProtocolId ===
                    "ERC-777"
            )
    },
    {
        name:
            "FENCED RELATION TEXT IS IGNORED",
        passed:
            !result.relations.some(
                relation =>
                    relation.objectProtocolId ===
                    "ERC-888"
            )
    },
    {
        name:
            "FREE ERC MENTION WITHOUT EXPLICIT RELATION IS UNRESOLVED",
        passed:
            result
                .unresolvedObservationIds
                .includes(
                    "OBS-NO-RELATION"
                )
    },
    {
        name:
            "DESCRIPTIVE H1 DOES NOT BECOME SUBJECT",
        passed:
            result
                .unresolvedObservationIds
                .includes(
                    "OBS-DESCRIPTIVE-H1"
                )
    },
    {
        name:
            "DESCRIPTIVE H1 PRODUCES NO RELATION",
        passed:
            !result.relations.some(
                relation =>
                    relation.observationId ===
                    "OBS-DESCRIPTIVE-H1"
            )
    },
    {
        name:
            "INLINE CODE SYMBOLIC H1 IS ACCEPTED",
        passed:
            inlineRelation
                ?.subjectSymbol ===
            "IInlineExtension"
    },
    {
        name:
            "INLINE CODE DOCUMENT RESOLVES EXPLICIT OBJECT",
        passed:
            inlineRelation
                ?.objectProtocolId ===
            "ERC-444"
    },
    {
        name:
            "NON DOCUMENTATION OBSERVATION IS IGNORED",
        passed:
            !result.relations.some(
                relation =>
                    relation.observationId ===
                    "OBS-CONTRACT"
            )
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
    },
    {
        name:
            "RELATION IDS ARE UNIQUE",
        passed:
            new Set(
                result.relations.map(
                    relation =>
                        relation.relationEvidenceId
                )
            ).size ===
            result.relations.length
    },
    {
        name:
            "RELATION IDS ARE DETERMINISTIC ACROSS INPUT ORDER",
        passed:
            JSON.stringify(
                result.relations.map(
                    relation =>
                        relation.relationEvidenceId
                )
            ) ===
            JSON.stringify(
                secondRun.relations.map(
                    relation =>
                        relation.relationEvidenceId
                )
            )
    },
    {
        name:
            "UNRESOLVED IDS ARE DETERMINISTICALLY SORTED",
        passed:
            JSON.stringify(
                result.unresolvedObservationIds
            ) ===
            JSON.stringify(
                [
                    ...result.unresolvedObservationIds
                ].sort()
            )
    },
    {
        name:
            "RELATION EVIDENCE CONTAINS NO CONFIDENCE FIELD",
        passed:
            !result.relations.some(
                relation =>
                    Object.prototype.hasOwnProperty.call(
                        relation,
                        "confidence"
                    )
            )
    },
    {
        name:
            "REVISION CONTAMINATION IS DETECTED",
        passed:
            revisionFailure.errors.some(
                error =>
                    error.includes(
                        "different source revision"
                    )
            )
    },
    {
        name:
            "REVISION CONTAMINATION FAILS CLOSED",
        passed:
            revisionFailure.relations.length ===
            0
    },
    {
        name:
            "SOURCE CONTAMINATION IS DETECTED",
        passed:
            sourceFailure.errors.some(
                error =>
                    error.includes(
                        "belongs to source"
                    )
            )
    },
    {
        name:
            "SOURCE CONTAMINATION FAILS CLOSED",
        passed:
            sourceFailure.relations.length ===
            0
    },
    {
        name:
            "DUPLICATE OBSERVATION ID IS DETECTED",
        passed:
            duplicateObservationFailure
                .errors
                .some(
                    error =>
                        error.includes(
                            "Duplicate observation identity OBS-README"
                        )
                )
    },
    {
        name:
            "DUPLICATE OBSERVATION ID FAILS CLOSED",
        passed:
            duplicateObservationFailure
                .relations
                .length ===
            0
    }
];


console.log("");
console.log(
    "SCIENTIFIC PROTOCOL RELATION EVIDENCE — RUNTIME"
);
console.log(
    "----------------------------------------------"
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
