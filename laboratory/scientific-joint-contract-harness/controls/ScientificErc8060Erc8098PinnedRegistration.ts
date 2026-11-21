import type { ScientificJointContractHarnessRecipeRegistration } from "../ScientificJointContractHarnessRecipeRegistration.js";
import {
    buildErc8060Erc8098PinnedRecipe,
    ERC8060_PINNED_REPOSITORY,
    ERC8098_PINNED_REPOSITORY,
    ERC8060_PINNED_REVISION,
    ERC8098_PINNED_REVISION
} from "./ScientificErc8060Erc8098PinnedRecipe.js";

export const ERC8060_ERC8098_PINNED_REGISTRATION_ID =
    "REGISTRATION-PINNED-ERC8060-ERC8098-ATOMIC-BURN";

export function buildErc8060Erc8098PinnedRegistration():
    ScientificJointContractHarnessRecipeRegistration {
    return {
        registrationId: ERC8060_ERC8098_PINNED_REGISTRATION_ID,
        applicability: {
            // Operational registration is post-discovery ONLY. It is not a
            // discovered hypothesis or a proof of shared composition semantics.
            mechanism: "SHARED_RECURRENT_CONCEPT",
            participantA: {
                participantKind: "PROTOCOL",
                participantId: "ERC-8060",
                repository: ERC8060_PINNED_REPOSITORY,
                sourceRevision: ERC8060_PINNED_REVISION
            },
            participantB: {
                participantKind: "PROTOCOL",
                participantId: "ERC-8098",
                repository: ERC8098_PINNED_REPOSITORY,
                sourceRevision: ERC8098_PINNED_REVISION
            }
        },
        evaluationSurface: {
            participantSurfaces: [
                {
                    participantSide:"A", participantKind:"PROTOCOL", participantId:"ERC-8060",
                    completeness:"PARTIAL",
                    includedContainerSymbols:["ERC8060Reference"],
                    evidenceIds:["PINNED-8060-8098:LOCAL-JOINT-TRANSACTION:A"]
                },
                {
                    participantSide:"B", participantKind:"PROTOCOL", participantId:"ERC-8098",
                    completeness:"PARTIAL",
                    includedContainerSymbols:["ERC8098Reference"],
                    evidenceIds:["PINNED-8060-8098:LOCAL-JOINT-TRANSACTION:B"]
                }
            ]
        },
        buildRecipe: buildErc8060Erc8098PinnedRecipe
    };
}
