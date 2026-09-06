import {
    CompositionRelationshipEngine
} from "../laboratory/relationships/CompositionRelationshipEngine.js";

function check(
    condition: boolean,
    label: string
): boolean {

    console.log(
        `${label}: ${condition ? "PASS" : "FAIL"}`
    );

    return condition;

}

/*
 * NEGATIVE CONTROL
 *
 * Both datasets pass scenario validation.
 *
 * They also contain legacy composability metadata.
 *
 * None of those fields constitutes explicit evidence
 * that the protocol pair itself composed successfully.
 *
 * The second dataset reverses protocol order to verify
 * canonical pair identity.
 */

const legacyDatasets = [
    {
        experimentId:
            "CONTROLLED-VALIDATION-A",

        resolvedProtocols: [
            "ERC1000",
            "ERC1001"
        ],

        validationPassed:
            true,

        propertyResults: [
            {
                property:
                    "Composability",

                passed:
                    true,

                score:
                    100,

                message:
                    "Multiple protocols composed successfully."
            }
        ],

        benchmark: {
            target:
                "ERC1000+ERC1001"
        }
    },
    {
        experimentId:
            "CONTROLLED-VALIDATION-B",

        resolvedProtocols: [
            "ERC1001",
            "ERC1000"
        ],

        validationPassed:
            true,

        propertyResults: [
            {
                property:
                    "Composability",

                passed:
                    true,

                score:
                    100,

                message:
                    "Multiple protocols composed successfully."
            }
        ],

        benchmark: {
            target:
                "ERC1001+ERC1000"
        }
    }
];

const legacyRelationships =
    new CompositionRelationshipEngine().discover(
        legacyDatasets
    );

const legacyRelationship =
    legacyRelationships[0];

console.log("");
console.log(
    "COMPOSITION RELATIONSHIP EVIDENCE BOUNDARY — NEGATIVE"
);
console.log(
    "-----------------------------------------------------"
);

const negativeChecks = [
    check(
        legacyRelationships.length === 1,
        "REVERSED PROTOCOL ORDER MAPS TO ONE RELATIONSHIP"
    ),

    check(
        legacyRelationship !== undefined &&
        legacyRelationship.from === "ERC1000" &&
        legacyRelationship.to === "ERC1001",
        "RELATIONSHIP PAIR HAS DETERMINISTIC CANONICAL ORDER"
    ),

    check(
        legacyRelationship?.occurrences === 2,
        "BOTH OBSERVATIONS CONTRIBUTE TO ONE PAIR"
    ),

    check(
        legacyRelationship?.successfulCompositions === 0,
        "VALIDATION PASSED DOES NOT COUNT AS SUCCESSFUL COMPOSITION"
    ),

    check(
        legacyRelationship?.confidence === 0,
        "VALIDATION PASSED DOES NOT CREATE COMPOSITION CONFIDENCE"
    )
];

/*
 * POSITIVE CONTROL
 *
 * Exactly two protocols plus an explicit
 * successfulComposition flag.
 *
 * This is sufficiently narrow to establish
 * pair-level composition success.
 */

const explicitPairRelationships =
    new CompositionRelationshipEngine().discover(
        [
            {
                experimentId:
                    "CONTROLLED-EXPLICIT-SUCCESS",

                resolvedProtocols: [
                    "ERC1000",
                    "ERC1001"
                ],

                successfulComposition:
                    true
            }
        ]
    );

const explicitPair =
    explicitPairRelationships[0];

console.log("");
console.log(
    "COMPOSITION RELATIONSHIP EVIDENCE BOUNDARY — POSITIVE"
);
console.log(
    "-----------------------------------------------------"
);

const positiveChecks = [
    check(
        explicitPairRelationships.length === 1,
        "EXPLICIT TWO-PROTOCOL COMPOSITION CREATES ONE RELATIONSHIP"
    ),

    check(
        explicitPair?.successfulCompositions === 1,
        "EXPLICIT TWO-PROTOCOL SUCCESS COUNTS AS SUCCESSFUL COMPOSITION"
    ),

    check(
        explicitPair?.confidence === 100,
        "EXPLICIT TWO-PROTOCOL SUCCESS CAN CREATE CONFIDENCE"
    )
];

/*
 * MULTI-PROTOCOL GUARD
 *
 * A dataset-level success flag for a composition
 * containing more than two protocols cannot be
 * projected onto every possible protocol pair.
 */

const multiProtocolRelationships =
    new CompositionRelationshipEngine().discover(
        [
            {
                experimentId:
                    "CONTROLLED-MULTI-PROTOCOL",

                resolvedProtocols: [
                    "ERC1000",
                    "ERC1001",
                    "ERC1002"
                ],

                successfulComposition:
                    true
            }
        ]
    );

console.log("");
console.log(
    "COMPOSITION RELATIONSHIP EVIDENCE BOUNDARY — MULTI-PROTOCOL"
);
console.log(
    "-----------------------------------------------------------"
);

const multiProtocolChecks = [
    check(
        multiProtocolRelationships.length === 3,
        "THREE PROTOCOLS PRODUCE THREE OBSERVED PAIRS"
    ),

    check(
        multiProtocolRelationships.every(
            relationship =>
                relationship.successfulCompositions === 0
        ),
        "GLOBAL MULTI-PROTOCOL SUCCESS DOES NOT BECOME PAIR SUCCESS"
    ),

    check(
        multiProtocolRelationships.every(
            relationship =>
                relationship.confidence === 0
        ),
        "GLOBAL MULTI-PROTOCOL SUCCESS DOES NOT CREATE PAIR CONFIDENCE"
    )
];

const pass =
    [
        ...negativeChecks,
        ...positiveChecks,
        ...multiProtocolChecks
    ].every(Boolean);

console.log("");
console.log(
    `RESULT: ${pass ? "PASS" : "FAIL"}`
);

if (!pass) {
    process.exitCode = 1;
}