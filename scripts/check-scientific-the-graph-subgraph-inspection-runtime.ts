import type {
    ScientificTheGraphSubgraphMcpToolCallResult,
    ScientificTheGraphSubgraphMcpToolClient
} from "../laboratory/scientific-the-graph-subgraph-mcp/ScientificTheGraphSubgraphMcpClient.js";

import {
    ScientificTheGraphSubgraphInspectionEngine
} from "../laboratory/scientific-the-graph-subgraph-inspection/ScientificTheGraphSubgraphInspectionEngine.js";


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


class FixtureClient
implements ScientificTheGraphSubgraphMcpToolClient {

    constructor(
        private readonly handler:
            (
                name:
                    string,
                args:
                    Record<string, unknown>
            ) =>
                ScientificTheGraphSubgraphMcpToolCallResult
    ) {}


    async callTool(
        name:
            string,
        args:
            Record<string, unknown>
    ): Promise<ScientificTheGraphSubgraphMcpToolCallResult> {

        return this.handler(
            name,
            args
        );

    }


    async close():
        Promise<void> {}

}


const requests =
    [

        {
            requestId:
                "INSPECT-A",

            subgraphId:
                "SUBGRAPH-A",

            ipfsHash:
                "Qm11111111111111111111111111111111111111111111"
        },

        {
            requestId:
                "INSPECT-B",

            subgraphId:
                "SUBGRAPH-B",

            ipfsHash:
                "Qm22222222222222222222222222222222222222222222"
        }

    ];


const fixture =
    new FixtureClient(
        (
            name,
            args
        ) => {

            if (
                name ===
                "get_schema_by_ipfs_hash"
            ) {

                const ipfsHash =
                    String(
                        args.ipfs_hash
                    );


                return {

                    isError:
                        false,

                    content: [

                        {
                            type:
                                "text",

                            text:
                                ipfsHash ===
                                requests[0].ipfsHash
                                    ? "type Alpha @entity { id: ID! }"
                                    : "type Beta @entity { id: ID! }"
                        }

                    ]

                };

            }


            if (
                name ===
                "get_deployment_30day_query_counts"
            ) {

                return {

                    isError:
                        false,

                    content: [

                        {
                            type:
                                "text",

                            text:
                                JSON.stringify({

                                    deployments: [

                                        {
                                            data_points_count:
                                                0,

                                            ipfs_hash:
                                                requests[0].ipfsHash,

                                            total_query_count:
                                                0
                                        },

                                        {
                                            data_points_count:
                                                7,

                                            ipfs_hash:
                                                requests[1].ipfsHash,

                                            total_query_count:
                                                42
                                        }

                                    ],

                                    total_deployments_processed:
                                        2

                                })
                        }

                    ]

                };

            }


            return {

                isError:
                    true,

                content:
                    []

            };

        }
    );


const result =
    await new ScientificTheGraphSubgraphInspectionEngine(
        fixture,
        "FIXTURE"
    )
        .inspect(
            requests
        );


console.log("");
console.log(
    "SCIENTIFIC THE GRAPH SUBGRAPH INSPECTION"
);
console.log(
    "========================================"
);


check(
    "INSPECTION HAS NO ERRORS",
    result.errors.length ===
        0
);


check(
    "TWO DEPLOYMENTS ARE INSPECTED",
    result.inspections.length ===
        2
);


const inspectionA =
    result.inspections.find(
        inspection =>
            inspection.requestId ===
            "INSPECT-A"
    )!;


const inspectionB =
    result.inspections.find(
        inspection =>
            inspection.requestId ===
            "INSPECT-B"
    )!;


check(
    "SCHEMA IS BOUND TO EXACT IPFS DEPLOYMENT",
    inspectionA.schemaObservation.ipfsHash ===
        requests[0].ipfsHash &&
    inspectionA.schemaObservation.toolName ===
        "get_schema_by_ipfs_hash"
);


check(
    "SCHEMA CONTENT IS HASHED",
    inspectionA.schemaObservation.schemaHash.length ===
        64 &&
    inspectionA.schemaObservation.schemaText.includes(
        "type Alpha"
    )
);


check(
    "ZERO QUERY VOLUME IS VALID EVIDENCE",
    inspectionA.queryActivityObservation.totalQueryCount ===
        0 &&
    inspectionA.queryActivityObservation.activityStatus ===
        "NO_RECENT_ACTIVITY_OBSERVED"
);


check(
    "POSITIVE QUERY VOLUME IS OBSERVED",
    inspectionB.queryActivityObservation.totalQueryCount ===
        42 &&
    inspectionB.queryActivityObservation.activityStatus ===
        "ACTIVITY_OBSERVED"
);


check(
    "QUERY ACTIVITY RAW FRAGMENT IS HASHED",
    inspectionB.queryActivityObservation.fragmentHash.length ===
        64 &&
    inspectionB.queryActivityObservation.rawFragment.length >
        0
);


check(
    "FIXTURE MODE IS PRESERVED",
    result.inspections.every(
        inspection =>
            inspection.providerMode ===
            "FIXTURE"
    )
);


check(
    "INSPECTED IS OPERATIONAL ONLY",
    result.inspections.every(
        inspection =>
            inspection.status ===
                "INSPECTED" &&
            inspection.nextAction ===
                "ASSESS_PROTOCOL_ATTRIBUTION"
    )
);


const repeated =
    await new ScientificTheGraphSubgraphInspectionEngine(
        fixture,
        "FIXTURE"
    )
        .inspect(
            JSON.parse(
                JSON.stringify(
                    requests
                )
            )
        );


check(
    "INSPECTION IS DETERMINISTIC",
    JSON.stringify(
        repeated
    ) ===
        JSON.stringify(
            result
        )
);


const duplicateResult =
    await new ScientificTheGraphSubgraphInspectionEngine(
        fixture,
        "FIXTURE"
    )
        .inspect(
            [
                requests[0],
                requests[0]
            ]
        );


check(
    "DUPLICATE REQUEST FAILS CLOSED",
    duplicateResult.errors.length >
        0 &&
    duplicateResult.inspections.length ===
        0
);


const malformedSchemaClient =
    new FixtureClient(
        (
            name,
            args
        ) => {

            if (
                name ===
                "get_schema_by_ipfs_hash"
            ) {

                return {
                    isError:
                        false,
                    content:
                        []
                };

            }


            return fixture.callTool(
                name,
                args
            ) as any;

        }
    );


const malformedSchemaResult =
    await new ScientificTheGraphSubgraphInspectionEngine(
        malformedSchemaClient,
        "FIXTURE"
    )
        .inspect(
            [
                requests[0]
            ]
        );


check(
    "MALFORMED SCHEMA RESPONSE FAILS CLOSED",
    malformedSchemaResult.errors.length >
        0
);


const missingActivityClient =
    new FixtureClient(
        (
            name,
            args
        ) => {

            if (
                name ===
                "get_schema_by_ipfs_hash"
            ) {

                return {
                    isError:
                        false,
                    content: [
                        {
                            type:
                                "text",
                            text:
                                "type Alpha @entity { id: ID! }"
                        }
                    ]
                };

            }


            if (
                name ===
                "get_deployment_30day_query_counts"
            ) {

                return {
                    isError:
                        false,
                    content: [
                        {
                            type:
                                "text",
                            text:
                                JSON.stringify({
                                    deployments:
                                        [],
                                    total_deployments_processed:
                                        0
                                })
                        }
                    ]
                };

            }


            return {
                isError:
                    true,
                content:
                    []
            };

        }
    );


const missingActivityResult =
    await new ScientificTheGraphSubgraphInspectionEngine(
        missingActivityClient,
        "FIXTURE"
    )
        .inspect(
            [
                requests[0]
            ]
        );


check(
    "MISSING REQUESTED ACTIVITY FAILS CLOSED",
    missingActivityResult.errors.length >
        0 &&
    missingActivityResult.inspections.length ===
        0
);


const serialized =
    JSON.stringify(
        result
    );


check(
    "INSPECTION CONTAINS NO SCIENTIFIC POLARITY",
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