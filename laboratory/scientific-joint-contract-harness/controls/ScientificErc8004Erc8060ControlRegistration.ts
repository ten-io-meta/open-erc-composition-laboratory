import type {
    ScientificJointContractHarnessRecipeRegistration
} from "../ScientificJointContractHarnessRecipeRegistration.js";

import {
    buildErc8004Erc8060ControlRecipe,
    ERC8004_CONTROL_REPOSITORY,
    ERC8004_CONTROL_REVISION,
    ERC8060_CONTROL_REPOSITORY,
    ERC8060_CONTROL_REVISION
} from "./ScientificErc8004Erc8060ControlRecipe.js";


export const
ERC8004_ERC8060_CONTROL_REGISTRATION_ID =
    "REGISTRATION-REAL-CONTROL-ERC8004-ERC8060-SHARED-ERC721";


export function
buildErc8004Erc8060ControlRegistration():
    ScientificJointContractHarnessRecipeRegistration {

    return {

        registrationId:
            ERC8004_ERC8060_CONTROL_REGISTRATION_ID,

        applicability: {

            mechanism:
                "SHARED_PROTOCOL_FOUNDATION",

            foundationProtocolId:
                "ERC-721",

            participantA: {

                participantKind:
                    "PROTOCOL",

                participantId:
                    "ERC-8004",

                repository:
                    ERC8004_CONTROL_REPOSITORY,

                sourceRevision:
                    ERC8004_CONTROL_REVISION

            },

            participantB: {

                participantKind:
                    "PROTOCOL",

                participantId:
                    "ERC-8060",

                repository:
                    ERC8060_CONTROL_REPOSITORY,

                sourceRevision:
                    ERC8060_CONTROL_REVISION

            }

        },

        /*
         * This declaration scopes only this exact registered
         * experiment. It does not state that other ERC-8004
         * modules are globally irrelevant.
         */
        evaluationSurface: {

            participantSurfaces: [
                {
                    participantSide:
                        "A",

                    participantKind:
                        "PROTOCOL",

                    participantId:
                        "ERC-8004",

                    completeness:
                        "COMPLETE_FOR_CANDIDATE_EVALUATION",

                    includedContainerSymbols: [
                        "IdentityRegistryUpgradeable"
                    ],

                    evidenceIds: [
                        "REGISTRATION-REAL-CONTROL-ERC8004-ERC8060-SHARED-ERC721:EVALUATION-SURFACE:A"
                    ]
                },
                {
                    participantSide:
                        "B",

                    participantKind:
                        "PROTOCOL",

                    participantId:
                        "ERC-8060",

                    completeness:
                        "COMPLETE_FOR_CANDIDATE_EVALUATION",

                    includedContainerSymbols: [
                        "ERC8060Reference"
                    ],

                    evidenceIds: [
                        "REGISTRATION-REAL-CONTROL-ERC8004-ERC8060-SHARED-ERC721:EVALUATION-SURFACE:B"
                    ]
                }
            ]

        },

        buildRecipe:
            buildErc8004Erc8060ControlRecipe

    };

}
