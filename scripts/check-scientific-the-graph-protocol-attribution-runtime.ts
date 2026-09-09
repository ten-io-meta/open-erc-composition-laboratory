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


function hash(
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


function makeProfile(
    protocolId:
        string
): any {

    return {

        profileId:
            `PROFILE-${protocolId}`,

        protocolId,

        sourceId:
            `GITHUB-${protocolId}`,

        sourceRevision:
            `REV-${protocolId}`,

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


function makeInspection(
    schemaText:
        string,
    totalQueryCount:
        number =
        0
): any {

    const schemaHash =
        hash(
            schemaText
        );


    return {

        inspectionId:
            `INSPECTION-${schemaHash}`,

        requestId:
            "REQUEST-A",

        subgraphId:
            "SUBGRAPH-A",

        ipfsHash:
            "Qm11111111111111111111111111111111111111111111",

        providerMode:
            "FIXTURE",

        schemaObservation: {

            observationId:
                `SCHEMA-${schemaHash}`,

            requestId:
                "REQUEST-A",

            provider:
                "THE_GRAPH",

            providerMode:
                "FIXTURE",

            productKind:
                "SUBGRAPH",

            subgraphId:
                "SUBGRAPH-A",

            ipfsHash:
                "Qm11111111111111111111111111111111111111111111",

            toolName:
                "get_schema_by_ipfs_hash",

            schemaText,

            schemaHash,

            status:
                "SCHEMA_OBSERVED"

        },

        queryActivityObservation: {

            observationId:
                `ACTIVITY-${totalQueryCount}`,

            requestId:
                "REQUEST-A",

            provider:
                "THE_GRAPH",

            providerMode:
                "FIXTURE",

            productKind:
                "SUBGRAPH",

            subgraphId:
                "SUBGRAPH-A",

            ipfsHash:
                "Qm11111111111111111111111111111111111111111111",

            toolName:
                "get_deployment_30day_query_counts",

            dataPointsCount:
                0,

            totalQueryCount,

            activityStatus:
                totalQueryCount > 0
                    ? "ACTIVITY_OBSERVED"
                    : "NO_RECENT_ACTIVITY_OBSERVED",

            rawFragment:
                "{}",

            fragmentHash:
                hash(
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


const exactResult =
    engine.assess([
        {
            profile:
                makeProfile(
                    "ERC-8004"
                ),

            inspection:
                makeInspection(
                    "# Indexing for ERC-8004 Agent Discovery"
                )
        }
    ]);


console.log("");
console.log(
    "SCIENTIFIC THE GRAPH PROTOCOL ATTRIBUTION"
);
console.log(
    "========================================="
);


check(
    "EXACT ATTRIBUTION HAS NO ERRORS",
    exactResult.errors.length ===
        0
);


check(
    "EXACT ERC IDENTIFIER ATTRIBUTES SUBGRAPH",
    exactResult.assessments.length ===
        1 &&
    exactResult.assessments[0].status ===
        "ATTRIBUTED"
);


check(
    "ATTRIBUTION BASIS IS EXPLICIT SCHEMA IDENTIFIER",
    exactResult.assessments[0].attributionBasis ===
        "EXPLICIT_SCHEMA_PROTOCOL_IDENTIFIER"
);


check(
    "EXACT MATCH REMAINS AUDITABLE",
    exactResult.assessments[0]
        .matchedIdentifiers
        .some(
            match =>
                match.identifier ===
                    "ERC-8004" &&
                match.occurrenceCount ===
                    1
        )
);


const compactResult =
    engine.assess([
        {
            profile:
                makeProfile(
                    "ERC-8301"
                ),

            inspection:
                makeInspection(
                    "# protocol ERC8301 execution data"
                )
        }
    ]);


check(
    "COMPACT CANONICAL IDENTIFIER IS ACCEPTED",
    compactResult.errors.length ===
        0 &&
    compactResult.assessments[0].status ===
        "ATTRIBUTED" &&
    compactResult.assessments[0]
        .matchedIdentifiers
        .some(
            match =>
                match.identifier ===
                "ERC8301"
        )
);


const embeddedResult =
    engine.assess([
        {
            profile:
                makeProfile(
                    "ERC-8004"
                ),

            inspection:
                makeInspection(
                    "# XERC-8004Y is not an exact protocol token"
                )
        }
    ]);


check(
    "EMBEDDED SUBSTRING DOES NOT ATTRIBUTE",
    embeddedResult.errors.length ===
        0 &&
    embeddedResult.assessments[0].status ===
        "UNATTRIBUTED"
);


const lowercaseResult =
    engine.assess([
        {
            profile:
                makeProfile(
                    "ERC-8004"
                ),

            inspection:
                makeInspection(
                    "# erc-8004 lowercase text"
                )
        }
    ]);


check(
    "LOWERCASE FUZZY VARIANT DOES NOT ATTRIBUTE",
    lowercaseResult.assessments[0].status ===
        "UNATTRIBUTED"
);


const absentResult =
    engine.assess([
        {
            profile:
                makeProfile(
                    "ERC-8354"
                ),

            inspection:
                makeInspection(
                    "type ConfidentialStep @entity { id: ID! }"
                )
        }
    ]);


check(
    "NO EXPLICIT IDENTIFIER REMAINS UNATTRIBUTED",
    absentResult.errors.length ===
        0 &&
    absentResult.assessments[0].status ===
        "UNATTRIBUTED" &&
    absentResult.assessments[0].nextAction ===
        "REQUIRES_ADDITIONAL_ATTRIBUTION_EVIDENCE"
);


const zeroActivity =
    engine.assess([
        {
            profile:
                makeProfile(
                    "ERC-8004"
                ),

            inspection:
                makeInspection(
                    "# This deployment indexes ERC-8004 protocol entities.",
                    0
                )
        }
    ]);


const positiveActivity =
    engine.assess([
        {
            profile:
                makeProfile(
                    "ERC-8004"
                ),

            inspection:
                makeInspection(
                    "# This deployment indexes ERC-8004 protocol entities.",
                    999
                )
        }
    ]);


check(
    "QUERY VOLUME DOES NOT CONTROL ATTRIBUTION",
    zeroActivity.assessments[0].status ===
        "ATTRIBUTED" &&
    positiveActivity.assessments[0].status ===
        "ATTRIBUTED" &&
    zeroActivity.assessments[0]
        .matchedIdentifiers[0]
        .identifier ===
    positiveActivity.assessments[0]
        .matchedIdentifiers[0]
        .identifier
);


check(
    "NORMATIVE SOURCE REVISION IS PRESERVED",
    exactResult.assessments[0]
        .normativeSourceRevision ===
        "REV-ERC-8004"
);


check(
    "EXACT DEPLOYMENT PROVENANCE IS PRESERVED",
    exactResult.assessments[0]
        .subgraphId ===
        "SUBGRAPH-A" &&
    exactResult.assessments[0]
        .ipfsHash ===
        "Qm11111111111111111111111111111111111111111111"
);


const repeated =
    engine.assess(
        JSON.parse(
            JSON.stringify([
                {
                    profile:
                        makeProfile(
                            "ERC-8004"
                        ),

                    inspection:
                        makeInspection(
                            "# Indexing for ERC-8004 Agent Discovery"
                        )
                }
            ])
        )
    );


check(
    "ATTRIBUTION IS DETERMINISTIC",
    JSON.stringify(
        repeated
    ) ===
        JSON.stringify(
            exactResult
        )
);


const duplicateInput = {

    profile:
        makeProfile(
            "ERC-8004"
        ),

    inspection:
        makeInspection(
            "# ERC-8004"
        )

};


const duplicateResult =
    engine.assess([
        duplicateInput,
        duplicateInput
    ]);


check(
    "DUPLICATE ATTRIBUTION SCOPE FAILS CLOSED",
    duplicateResult.errors.length >
        0 &&
    duplicateResult.assessments.length ===
        0
);


const brokenInspection =
    makeInspection(
        "# ERC-8004"
    );


brokenInspection.schemaObservation.ipfsHash =
    "Qm99999999999999999999999999999999999999999999";


const brokenResult =
    engine.assess([
        {
            profile:
                makeProfile(
                    "ERC-8004"
                ),

            inspection:
                brokenInspection
        }
    ]);


check(
    "BROKEN SCHEMA PROVENANCE FAILS CLOSED",
    brokenResult.errors.length >
        0 &&
    brokenResult.assessments.length ===
        0
);


const serialized =
    JSON.stringify(
        exactResult
    );


check(
    "ATTRIBUTION CONTAINS NO SCIENTIFIC POLARITY",
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


if (fail > 0) {
    process.exitCode = 1;
}