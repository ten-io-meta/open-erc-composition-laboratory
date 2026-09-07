import assert from "node:assert/strict";

import type {
    ScientificCompositionExecutionRequirement
} from "../laboratory/scientific-composition-experiment/ScientificCompositionExecutionRequirement.js";

import type {
    ScientificJointContractHarnessRecipeRegistration
} from "../laboratory/scientific-joint-contract-harness/ScientificJointContractHarnessRecipeRegistration.js";

import {
    ScientificJointContractHarnessRecipeSelector
} from "../laboratory/scientific-joint-contract-harness/ScientificJointContractHarnessRecipeSelector.js";


let pass = 0;
let fail = 0;


function check(
    name: string,
    fn: () => void
): void {

    try {

        fn();

        console.log(
            `${name}: PASS`
        );

        pass++;

    } catch (error) {

        console.log(
            `${name}: FAIL`
        );

        console.log(
            error instanceof Error
                ? error.message
                : String(error)
        );

        fail++;

    }

}


function requirement():
    ScientificCompositionExecutionRequirement {

    return {

        requirementId:
            "REQUIREMENT-101-202",

        evaluationSpecificationId:
            "SPEC-101-202",

        candidate: {

            candidateId:
                "CANDIDATE-101-202",

            participantA: {
                kind:
                    "PROTOCOL",
                id:
                    "ERC-101"
            },

            participantB: {
                kind:
                    "PROTOCOL",
                id:
                    "ERC-202"
            },

            mechanism:
                "SHARED_PROTOCOL_FOUNDATION",

            foundationProtocolId:
                "ERC-721",

            supportingCapabilityIdsA:
                [],

            supportingCapabilityIdsB:
                [],

            provenance:
                [],

            evaluationStatus:
                "UNEVALUATED"

        },

        constraints:
            [],

        participantAConstraintIds:
            [],

        participantBConstraintIds:
            [],

        unresolvedGuardFactIds:
            [],

        participantSources: [

            {
                participantSide:
                    "A",

                participantKind:
                    "PROTOCOL",

                participantId:
                    "ERC-101",

                sourceId:
                    "SOURCE-A",

                sourceRevision:
                    "1111111111111111111111111111111111111111",

                repository:
                    "fixture/repository-a"
            },

            {
                participantSide:
                    "B",

                participantKind:
                    "PROTOCOL",

                participantId:
                    "ERC-202",

                sourceId:
                    "SOURCE-B",

                sourceRevision:
                    "2222222222222222222222222222222222222222",

                repository:
                    "fixture/repository-b"
            }

        ]

    } as ScientificCompositionExecutionRequirement;

}


function registration(
    registrationId: string
): ScientificJointContractHarnessRecipeRegistration {

    return {

        registrationId,

        applicability: {

            mechanism:
                "SHARED_PROTOCOL_FOUNDATION",

            foundationProtocolId:
                "ERC-721",

            participantA: {

                participantKind:
                    "PROTOCOL",

                participantId:
                    "ERC-101",

                repository:
                    "fixture/repository-a",

                sourceRevision:
                    "1111111111111111111111111111111111111111"

            },

            participantB: {

                participantKind:
                    "PROTOCOL",

                participantId:
                    "ERC-202",

                repository:
                    "fixture/repository-b",

                sourceRevision:
                    "2222222222222222222222222222222222222222"

            }

        },

        buildRecipe: () => ({

            recipeId:
                `RECIPE-${registrationId}`,

            preparationSteps:
                [],

            driver: {

                participantSide:
                    "A",

                fileName:
                    "fixture.mjs",

                source:
                    "console.log('fixture');"

            }

        })

    };

}


console.log("");
console.log(
    "SCIENTIFIC JOINT CONTRACT HARNESS RECIPE SELECTOR"
);
console.log(
    "-------------------------------------------------"
);


const selector =
    new ScientificJointContractHarnessRecipeSelector();


const exact =
    selector.select(
        requirement(),
        [
            registration(
                "EXACT"
            )
        ]
    );


check(
    "EXACT POST-DISCOVERY REQUIREMENT SELECTS ONE RECIPE",
    () => {

        assert.equal(
            exact.status,
            "SELECTED"
        );

        assert.equal(
            exact.selectedRegistration
                ?.registrationId,
            "EXACT"
        );

    }
);


const wrongRevision =
    registration(
        "WRONG-REVISION"
    );

wrongRevision
    .applicability
    .participantB
    .sourceRevision =
    "3333333333333333333333333333333333333333";


const noMatch =
    selector.select(
        requirement(),
        [
            wrongRevision
        ]
    );


check(
    "REVISION DIVERGENCE CANNOT SELECT RECIPE",
    () => {

        assert.equal(
            noMatch.status,
            "NO_MATCH"
        );

        assert.equal(
            noMatch.selectedRegistration,
            null
        );

    }
);


const wrongFoundation =
    registration(
        "WRONG-FOUNDATION"
    );

wrongFoundation
    .applicability
    .foundationProtocolId =
    "ERC-1155";


const foundationNoMatch =
    selector.select(
        requirement(),
        [
            wrongFoundation
        ]
    );


check(
    "MECHANISM FOUNDATION DIVERGENCE CANNOT SELECT RECIPE",
    () => {

        assert.equal(
            foundationNoMatch.status,
            "NO_MATCH"
        );

    }
);


const ambiguous =
    selector.select(
        requirement(),
        [
            registration(
                "MATCH-A"
            ),
            registration(
                "MATCH-B"
            )
        ]
    );


check(
    "MULTIPLE EXACT RECIPES FAIL CLOSED AS AMBIGUOUS",
    () => {

        assert.equal(
            ambiguous.status,
            "AMBIGUOUS"
        );

        assert.equal(
            ambiguous.selectedRegistration,
            null
        );

        assert.deepEqual(
            ambiguous.matchingRegistrationIds,
            [
                "MATCH-A",
                "MATCH-B"
            ]
        );

    }
);


const swapped =
    requirement();

const sourceA =
    swapped.participantSources[0];

const sourceB =
    swapped.participantSources[1];

swapped.participantSources = [

    {
        ...sourceB,

        participantSide:
            "A"
    },

    {
        ...sourceA,

        participantSide:
            "B"
    }

];


const swappedResult =
    selector.select(
        swapped,
        [
            registration(
                "EXACT"
            )
        ]
    );


check(
    "PARTICIPANT ORIENTATION IS NOT SILENTLY REVERSED",
    () => {

        assert.equal(
            swappedResult.status,
            "NO_MATCH"
        );

    }
);


console.log("");
console.log(
    `PASS: ${pass}`
);

console.log(
    `FAIL: ${fail}`
);

console.log(
    `RESULT: ${
        fail === 0
            ? "PASS"
            : "FAIL"
    }`
);


if (
    fail > 0
) {

    process.exitCode =
        1;

}
