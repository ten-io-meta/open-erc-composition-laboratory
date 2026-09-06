import {
    CompositionRelationshipEngine
} from "../laboratory/relationships/CompositionRelationshipEngine.js";

import {
    CompositionMatrixEngine
} from "../laboratory/matrix/CompositionMatrixEngine.js";

function check(
    condition: boolean,
    label: string
): boolean {

    console.log(
        `${label}: ${condition ? "PASS" : "FAIL"}`
    );

    return condition;

}

const datasets = [
    {
        experimentId:
            "EXPERIMENT-ALPHA",

        resolvedProtocols: [
            "ERC1000",
            "ERC1001"
        ]
    },
    {
        experimentId:
            "EXPERIMENT-BETA",

        resolvedProtocols: [
            "ERC1001",
            "ERC1000"
        ]
    }
];

const relationships =
    new CompositionRelationshipEngine().discover(
        datasets
    );

const relationship: any =
    relationships[0];

const matrix =
    new CompositionMatrixEngine().build(
        relationships,
        [
            {
                protocolId:
                    "ERC1000",

                eligibility:
                    "Eligible"
            },
            {
                protocolId:
                    "ERC1001",

                eligibility:
                    "Eligible"
            }
        ]
    );

const matrixEntry: any =
    matrix[0];

console.log("");
console.log(
    "COMPOSITION RELATIONSHIP PROVENANCE"
);
console.log(
    "-----------------------------------"
);

const checks = [
    check(
        relationships.length === 1,
        "ONE CANONICAL RELATIONSHIP CREATED"
    ),

    check(
        Array.isArray(
            relationship?.experimentIds
        ),
        "RELATIONSHIP EXPOSES EXPERIMENT PROVENANCE"
    ),

    check(
        relationship?.experimentIds?.length === 2,
        "RELATIONSHIP PRESERVES BOTH EXPERIMENT IDS"
    ),

    check(
        relationship?.experimentIds?.includes(
            "EXPERIMENT-ALPHA"
        ) === true,
        "FIRST EXPERIMENT ID PRESERVED"
    ),

    check(
        relationship?.experimentIds?.includes(
            "EXPERIMENT-BETA"
        ) === true,
        "SECOND EXPERIMENT ID PRESERVED"
    ),

    check(
        Array.isArray(
            matrixEntry?.experimentIds
        ),
        "MATRIX EXPOSES EXPERIMENT PROVENANCE"
    ),

    check(
        matrixEntry?.experimentIds?.length === 2,
        "MATRIX PRESERVES BOTH EXPERIMENT IDS"
    ),

    check(
        matrixEntry?.experimentIds?.includes(
            "EXPERIMENT-ALPHA"
        ) === true &&
        matrixEntry?.experimentIds?.includes(
            "EXPERIMENT-BETA"
        ) === true,
        "EXPERIMENT PROVENANCE SURVIVES RELATIONSHIP TO MATRIX"
    )
];

const pass =
    checks.every(Boolean);

console.log("");
console.log(
    `RESULT: ${pass ? "PASS" : "FAIL"}`
);

if (!pass) {
    process.exitCode = 1;
}