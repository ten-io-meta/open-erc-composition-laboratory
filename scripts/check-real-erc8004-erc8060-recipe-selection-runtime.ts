import assert from "node:assert/strict";

import type {
    ScientificCompositionExecutionRequirement
} from "../laboratory/scientific-composition-experiment/ScientificCompositionExecutionRequirement.js";

import {
    ScientificJointContractHarnessRecipeSelector
} from "../laboratory/scientific-joint-contract-harness/ScientificJointContractHarnessRecipeSelector.js";

import {
    buildErc8004Erc8060ControlRegistration,
    ERC8004_ERC8060_CONTROL_REGISTRATION_ID
} from "../laboratory/scientific-joint-contract-harness/controls/ScientificErc8004Erc8060ControlRegistration.js";

import {
    ERC8004_CONTROL_REPOSITORY,
    ERC8004_CONTROL_REVISION,
    ERC8060_CONTROL_REPOSITORY,
    ERC8060_CONTROL_REVISION
} from "../laboratory/scientific-joint-contract-harness/controls/ScientificErc8004Erc8060ControlRecipe.js";


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
            "REAL-REQUIREMENT-ERC8004-ERC8060",

        evaluationSpecificationId:
            "REAL-SPECIFICATION-ERC8004-ERC8060",

        candidate: {

            candidateId:
                "REAL-CANDIDATE-ERC8004-ERC8060",

            participantA: {

                kind:
                    "PROTOCOL",

                id:
                    "ERC-8004"

            },

            participantB: {

                kind:
                    "PROTOCOL",

                id:
                    "ERC-8060"

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
                    "ERC-8004",

                sourceId:
                    "GITHUB-ERC-8004-ERC-8004-CONTRACTS",

                sourceRevision:
                    ERC8004_CONTROL_REVISION,

                repository:
                    ERC8004_CONTROL_REPOSITORY

            },

            {
                participantSide:
                    "B",

                participantKind:
                    "PROTOCOL",

                participantId:
                    "ERC-8060",

                sourceId:
                    "GITHUB-TEN-IO-META-ERC8060-NATIVE-ETH-VALUE",

                sourceRevision:
                    ERC8060_CONTROL_REVISION,

                repository:
                    ERC8060_CONTROL_REPOSITORY

            }

        ]

    } as ScientificCompositionExecutionRequirement;

}


console.log("");
console.log(
    "REAL ERC-8004 x ERC-8060 RECIPE SELECTION"
);
console.log(
    "-----------------------------------------"
);


const selector =
    new ScientificJointContractHarnessRecipeSelector();

const registration =
    buildErc8004Erc8060ControlRegistration();


const selected =
    selector.select(
        requirement(),
        [
            registration
        ]
    );


check(
    "EXACT REAL ERC-8004 x ERC-8060 REQUIREMENT SELECTS CONTROL",
    () => {

        assert.equal(
            selected.status,
            "SELECTED"
        );

        assert.equal(
            selected.selectedRegistration
                ?.registrationId,
            ERC8004_ERC8060_CONTROL_REGISTRATION_ID
        );

    }
);


check(
    "SELECTED REGISTRATION BUILDS THE REPRODUCIBLE REAL CONTROL RECIPE",
    () => {

        const recipe =
            selected
                .selectedRegistration
                ?.buildRecipe();


        assert.ok(
            recipe
        );

        assert.equal(
            recipe.recipeId,
            "REAL-CONTROL-ERC8004-ERC8060-SHARED-ERC721"
        );

    }
);


const revisionDrift =
    requirement();

revisionDrift
    .participantSources
    .find(
        source =>
            source.participantSide ===
            "B"
    )!
    .sourceRevision =
    "3333333333333333333333333333333333333333";


const revisionDriftResult =
    selector.select(
        revisionDrift,
        [
            registration
        ]
    );


check(
    "REAL CONTROL IS NOT SELECTED AFTER PINNED REVISION DRIFT",
    () => {

        assert.equal(
            revisionDriftResult.status,
            "NO_MATCH"
        );

    }
);


const foundationDrift =
    requirement();

foundationDrift
    .candidate
    .foundationProtocolId =
    "ERC-1155";


const foundationDriftResult =
    selector.select(
        foundationDrift,
        [
            registration
        ]
    );


check(
    "REAL CONTROL IS NOT SELECTED FOR A DIFFERENT FOUNDATION",
    () => {

        assert.equal(
            foundationDriftResult.status,
            "NO_MATCH"
        );

    }
);


const reversed =
    requirement();


reversed.candidate = {

    ...reversed.candidate,

    participantA: {

        kind:
            "PROTOCOL",

        id:
            "ERC-8060"

    },

    participantB: {

        kind:
            "PROTOCOL",

        id:
            "ERC-8004"

    }

};


reversed.participantSources =
    reversed
        .participantSources
        .map(
            source => ({

                ...source,

                participantSide:
                    source.participantSide ===
                    "A"
                        ? "B"
                        : "A"

            })
        );


const reversedResult =
    selector.select(
        reversed,
        [
            registration
        ]
    );


check(
    "REAL CONTROL DOES NOT SILENTLY REVERSE PARTICIPANT ORIENTATION",
    () => {

        assert.equal(
            reversedResult.status,
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
