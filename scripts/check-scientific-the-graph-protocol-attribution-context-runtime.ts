import {
    createHash
} from "node:crypto";

import {
    ScientificTheGraphProtocolAttributionEngine
} from "../laboratory/scientific-the-graph-protocol-attribution/ScientificTheGraphProtocolAttributionEngine.js";


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


function sha256(
    value:
        string
): string {

    return createHash(
        "sha256"
    )
        .update(
            value,
            "utf8"
        )
        .digest(
            "hex"
        );

}


function profile():
    any {

    return {

        profileId:
            "PROFILE-ERC-8004",

        protocolId:
            "ERC-8004",

        sourceId:
            "SOURCE-ERC-8004",

        sourceRevision:
            "REV-ERC-8004",

        attributedContainerSymbols:
            [],

        contributions:
            [],

        boundaries:
            [],

        needs:
            []

    };

}


function inspection(
    id:
        string,
    schemaText:
        string
): any {

    const schemaHash =
        sha256(
            schemaText
        );


    const requestId =
        `REQUEST-${id}`;

    const subgraphId =
        `SUBGRAPH-${id}`;

    const ipfsHash =
        `Qm${id.padEnd(44, "0").slice(0, 44)}`;


    return {

        inspectionId:
            `INSPECTION-${id}`,

        requestId,

        subgraphId,

        ipfsHash,

        providerMode:
            "FIXTURE",

        schemaObservation: {

            observationId:
                `SCHEMA-${id}`,

            requestId,

            provider:
                "THE_GRAPH",

            providerMode:
                "FIXTURE",

            productKind:
                "SUBGRAPH",

            subgraphId,

            ipfsHash,

            toolName:
                "get_schema_by_ipfs_hash",

            schemaText,

            schemaHash,

            status:
                "SCHEMA_OBSERVED"

        },

        queryActivityObservation: {

            observationId:
                `ACTIVITY-${id}`,

            requestId,

            provider:
                "THE_GRAPH",

            providerMode:
                "FIXTURE",

            productKind:
                "SUBGRAPH",

            subgraphId,

            ipfsHash,

            toolName:
                "get_deployment_30day_query_counts",

            dataPointsCount:
                0,

            totalQueryCount:
                0,

            activityStatus:
                "NO_RECENT_ACTIVITY_OBSERVED",

            rawFragment:
                "{}",

            fragmentHash:
                sha256(
                    "{}"
                )

        },

        status:
            "INSPECTED",

        nextAction:
            "ASSESS_PROTOCOL_ATTRIBUTION"

    };

}


const engine =
    new ScientificTheGraphProtocolAttributionEngine();


function assess(
    id:
        string,
    schemaText:
        string
): any {

    const result =
        engine.assess([
            {
                profile:
                    profile(),

                inspection:
                    inspection(
                        id,
                        schemaText
                    )
            }
        ]);


    if (
        result.errors.length >
            0 ||
        result.assessments.length !==
            1
    ) {

        throw new Error(
            result.errors.join(
                "\n"
            ) ||
            `Expected one assessment for ${id}.`
        );

    }


    return result.assessments[0];

}


console.log("");
console.log(
    "SCIENTIFIC THE GRAPH ATTRIBUTION CONTEXT"
);
console.log(
    "========================================"
);


const negation =
    assess(
        "NEGATION",
        "# This deployment does not implement ERC-8004."
    );


check(
    "EXPLICIT NEGATION DOES NOT ATTRIBUTE",
    negation.status ===
        "UNATTRIBUTED"
);


check(
    "EXPLICIT NEGATION REMAINS AUDITABLE",
    negation.matchedIdentifiers.length ===
        0 &&
    negation.rejectedIdentifierOccurrences.length ===
        1 &&
    negation.rejectedIdentifierOccurrences[0]
        .identifier ===
        "ERC-8004" &&
    negation.rejectedIdentifierOccurrences[0]
        .occurrenceCount ===
        1 &&
    negation.rejectedIdentifierOccurrences[0]
        .reasons.includes(
            "EXPLICIT_NEGATION_CONTEXT"
        )
);


check(
    "NEGATED TOKEN HAS DISTINCT ATTRIBUTION BASIS",
    negation.attributionBasis ===
        "ONLY_REJECTED_SCHEMA_PROTOCOL_IDENTIFIER_CONTEXT"
);


const referenceOnly =
    assess(
        "REFERENCE",
        "# Documentation reference: ERC-8004; indexed protocol is ERC-9999."
    );


check(
    "DOCUMENTATION REFERENCE DOES NOT ATTRIBUTE",
    referenceOnly.status ===
        "UNATTRIBUTED"
);


check(
    "REFERENCE-ONLY TOKEN REMAINS AUDITABLE",
    referenceOnly.rejectedIdentifierOccurrences.length ===
        1 &&
    referenceOnly.rejectedIdentifierOccurrences[0]
        .reasons.includes(
            "REFERENCE_ONLY_CONTEXT"
        )
);


const positiveReferenceImplementation =
    assess(
        "REFERENCE-IMPLEMENTATION",
        "# Reference implementation of ERC-8004 indexed entities."
    );


check(
    "REFERENCE IMPLEMENTATION IS NOT OVER-REJECTED",
    positiveReferenceImplementation.status ===
        "ATTRIBUTED" &&
    positiveReferenceImplementation.matchedIdentifiers.length ===
        1 &&
    positiveReferenceImplementation.rejectedIdentifierOccurrences.length ===
        0
);


const positiveIndexed =
    assess(
        "INDEXED",
        '"""Indexed entities for ERC-8004."""'
    );


check(
    "ORDINARY EXACT PROTOCOL CONTEXT STILL ATTRIBUTES",
    positiveIndexed.status ===
        "ATTRIBUTED" &&
    positiveIndexed.attributionBasis ===
        "EXPLICIT_SCHEMA_PROTOCOL_IDENTIFIER"
);


const mixed =
    assess(
        "MIXED",
        [
            "# Documentation reference: ERC-8004.",
            "# This deployment indexes ERC-8004 protocol entities."
        ].join(
            "\n"
        )
    );


check(
    "POSITIVE EVIDENCE CAN COEXIST WITH REJECTED REFERENCE",
    mixed.status ===
        "ATTRIBUTED" &&
    mixed.matchedIdentifiers.length ===
        1 &&
    mixed.matchedIdentifiers[0]
        .occurrenceCount ===
        1 &&
    mixed.rejectedIdentifierOccurrences.length ===
        1 &&
    mixed.rejectedIdentifierOccurrences[0]
        .occurrenceCount ===
        1
);


const unrelated =
    assess(
        "UNRELATED",
        "# This schema is unrelated to ERC-8004."
    );


check(
    "EXPLICIT UNRELATED CONTEXT DOES NOT ATTRIBUTE",
    unrelated.status ===
        "UNATTRIBUTED" &&
    unrelated.rejectedIdentifierOccurrences[0]
        .reasons.includes(
            "EXPLICIT_NEGATION_CONTEXT"
        )
);


const lowercase =
    assess(
        "LOWERCASE",
        "# this schema indexes erc-8004"
    );


check(
    "CASE-SENSITIVE EXACTNESS IS PRESERVED",
    lowercase.status ===
        "UNATTRIBUTED" &&
    lowercase.matchedIdentifiers.length ===
        0 &&
    lowercase.rejectedIdentifierOccurrences.length ===
        0
);


const serialized =
    JSON.stringify([
        negation,
        referenceOnly,
        positiveReferenceImplementation,
        positiveIndexed,
        mixed,
        unrelated,
        lowercase
    ]);


check(
    "CONTEXT HARDENING CONTAINS NO SCIENTIFIC POLARITY",
    !serialized.includes(
        "scientificPolarity"
    ) &&
    !serialized.includes(
        "compatibilityPolarity"
    ) &&
    !serialized.includes(
        '"SUPPORT"'
    ) &&
    !serialized.includes(
        '"CHALLENGE"'
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