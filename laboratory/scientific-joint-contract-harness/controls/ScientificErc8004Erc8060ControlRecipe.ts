import type {
    ScientificJointContractHarnessRecipe
} from "../ScientificJointContractHarness.js";


export const ERC8004_CONTROL_REPOSITORY =
    "erc-8004/erc-8004-contracts";

export const ERC8060_CONTROL_REPOSITORY =
    "ten-io-meta/erc8060-native-eth-value";


export const ERC8004_CONTROL_REVISION =
    "b9e466c250744a7e06b13dff9d3c2844ed64f825";

export const ERC8060_CONTROL_REVISION =
    "c7eed906835ab39fbc8439eb0493e5a5371b23a2";


const DRIVER_SOURCE = String.raw`
import {
    readFile
} from "node:fs/promises";

import {
    join
} from "node:path";

import {
    network
} from "hardhat";

import {
    encodeAbiParameters,
    getContract,
    keccak256,
    toHex
} from "viem";


const participantARoot =
    process.env.OECL_PARTICIPANT_A_ROOT;

const participantBRoot =
    process.env.OECL_PARTICIPANT_B_ROOT;


if (
    !participantARoot ||
    !participantBRoot
) {

    throw new Error(
        "OECL bilateral participant roots are required."
    );

}


const requirementPath =
    process.env.OECL_COMPOSITION_EXECUTION_REQUIREMENT_PATH;


const requirement =
    requirementPath
        ? JSON.parse(
            await readFile(
                requirementPath,
                "utf8"
            )
        )
        : null;


const artifact8060Path =
    join(
        participantBRoot,
        "artifacts",
        "contracts",
        "ERC8060Reference.sol",
        "ERC8060Reference.json"
    );


const artifact8060 =
    JSON.parse(
        await readFile(
            artifact8060Path,
            "utf8"
        )
    );


const {
    viem
} =
    await network.connect();


const publicClient =
    await viem.getPublicClient();


const [
    owner,
    nonOwner
] =
    await viem.getWalletClients();


if (
    !owner ||
    !nonOwner
) {

    throw new Error(
        "OECL real ERC-8060 owner/non-owner wallets are required."
    );

}


if (
    owner.account.address.toLowerCase() ===
    nonOwner.account.address.toLowerCase()
) {

    throw new Error(
        "OECL real ERC-8060 owner and non-owner wallets must be distinct."
    );

}


const chainId =
    await publicClient.getChainId();


const zeroAddress =
    "0x0000000000000000000000000000000000000000";


function resolveUniqueRequirementConstraint(
    participantSide,
    requiredFragments,
    label
) {

    if (
        requirement ===
        null
    ) {

        return null;

    }


    const matches =
        requirement.constraints.filter(
            constraint =>
                constraint.participantSide ===
                    participantSide &&
                constraint.basis ===
                    "SOLIDITY_REQUIRE_STATEMENT" &&
                typeof constraint.rawText ===
                    "string" &&
                requiredFragments.every(
                    fragment =>
                        constraint.rawText.includes(
                            fragment
                        )
                )
        );


    if (
        matches.length !==
        1
    ) {

        throw new Error(
            "Expected exactly one discovered constraint for " +
            label +
            "."
        );

    }


    return matches[0];

}


async function requireObservedRevertReason(
    operation,
    expectedReason,
    label
) {

    try {

        await operation();

    } catch (error) {

        const errorText =
            [
                String(error),

                String(
                    error?.shortMessage ??
                    ""
                ),

                String(
                    error?.details ??
                    ""
                ),

                String(
                    error?.cause ??
                    ""
                ),

                String(
                    error?.cause?.shortMessage ??
                    ""
                ),

                String(
                    error?.cause?.details ??
                    ""
                ),

                String(
                    error?.cause?.reason ??
                    ""
                )
            ].join(
                "\n"
            );


        if (
            errorText.includes(
                expectedReason
            )
        ) {

            return;

        }


        throw error;

    }


    throw new Error(
        label +
        " did not revert with observed reason " +
        expectedReason +
        "."
    );

}


function encodeInitializeWithAddress(
    identityRegistry
) {

    const params =
        encodeAbiParameters(
            [
                {
                    type:
                        "address"
                }
            ],
            [
                identityRegistry
            ]
        );


    return (
        "0xc4d66de8" +
        params.slice(2)
    );

}


/*
 * Participant A:
 *
 * Preserve the exact deployment shape already exercised by the
 * ERC-8004 repository:
 *
 * HardhatMinimalUUPS
 * ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¾Ãƒâ€šÃ‚Â¢ ERC1967Proxy
 * ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¾Ãƒâ€šÃ‚Â¢ IdentityRegistryUpgradeable
 * ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¾Ãƒâ€šÃ‚Â¢ upgradeToAndCall(initialize())
 */

const minimalImpl =
    await viem.deployContract(
        "HardhatMinimalUUPS"
    );


const proxy =
    await viem.deployContract(
        "ERC1967Proxy",
        [
            minimalImpl.address,
            encodeInitializeWithAddress(
                zeroAddress
            )
        ]
    );


const realImpl =
    await viem.deployContract(
        "IdentityRegistryUpgradeable"
    );


const minimalProxy =
    await viem.getContractAt(
        "HardhatMinimalUUPS",
        proxy.address
    );


await minimalProxy
    .write
    .upgradeToAndCall(
        [
            realImpl.address,
            "0x8129fc1c"
        ]
    );


const identityRegistry =
    await viem.getContractAt(
        "IdentityRegistryUpgradeable",
        proxy.address
    );


const badWalletConstraint =
    resolveUniqueRequirementConstraint(
        "A",
        [
            "newWallet != address(0)",
            "bad wallet"
        ],
        "ERC-8004 nonzero agent wallet"
    );


const expiredDeadlineConstraint =
    resolveUniqueRequirementConstraint(
        "A",
        [
            "block.timestamp <= deadline",
            "expired"
        ],
        "ERC-8004 wallet deadline not expired"
    );


const maximumDeadlineConstraint =
    resolveUniqueRequirementConstraint(
        "A",
        [
            "MAX_DEADLINE_DELAY",
            "deadline too far"
        ],
        "ERC-8004 maximum wallet deadline"
    );


const walletSignatureConstraint =
    resolveUniqueRequirementConstraint(
        "A",
        [
            "ERC1271_MAGICVALUE",
            "invalid wallet sig"
        ],
        "ERC-8004 wallet signature validation"
    );


const registrationReservedKeyConstraint =
    resolveUniqueRequirementConstraint(
        "A",
        [
            "metadata[i].metadataKey",
            "RESERVED_AGENT_WALLET_KEY_HASH",
            "reserved key"
        ],
        "ERC-8004 registration reserved metadata key"
    );


const setMetadataReservedKeyConstraint =
    resolveUniqueRequirementConstraint(
        "A",
        [
            "bytes(metadataKey)",
            "RESERVED_AGENT_WALLET_KEY_HASH",
            "reserved key"
        ],
        "ERC-8004 setMetadata reserved key"
    );


const uriA =
    "ipfs://oecl/control/erc8004-agent";


const txA =
    await identityRegistry
        .write
        .register(
            [
                uriA
            ]
        );


const receiptA =
    await publicClient
        .waitForTransactionReceipt(
            {
                hash:
                    txA
            }
        );


const registeredEventSignature =
    keccak256(
        toHex(
            "Registered(uint256,string,address)"
        )
    );


const registeredLog =
    receiptA.logs.find(
        log =>
            log.topics[0] ===
            registeredEventSignature
    );


if (
    !registeredLog ||
    !registeredLog.topics[1]
) {

    throw new Error(
        "ERC-8004 Registered event was not observed."
    );

}


const agentId =
    BigInt(
        registeredLog.topics[1]
    );


const walletGuardBlock =
    await publicClient.getBlock();


const validWalletDeadline =
    walletGuardBlock.timestamp +
    240n;


const expiredWalletDeadline =
    walletGuardBlock.timestamp -
    1n;


const excessiveWalletDeadline =
    walletGuardBlock.timestamp +
    600n;


const validWalletSignature =
    await nonOwner.signTypedData(
        {
            account:
                nonOwner.account,

            domain: {
                name:
                    "ERC8004IdentityRegistry",

                version:
                    "1",

                chainId,

                verifyingContract:
                    proxy.address
            },

            types: {
                AgentWalletSet: [

                    {
                        name:
                            "agentId",

                        type:
                            "uint256"
                    },

                    {
                        name:
                            "newWallet",

                        type:
                            "address"
                    },

                    {
                        name:
                            "owner",

                        type:
                            "address"
                    },

                    {
                        name:
                            "deadline",

                        type:
                            "uint256"
                    }

                ]
            },

            primaryType:
                "AgentWalletSet",

            message: {
                agentId,

                newWallet:
                    nonOwner.account.address,

                owner:
                    owner.account.address,

                deadline:
                    validWalletDeadline
            }
        }
    );


if (
    badWalletConstraint !==
        null ||
    expiredDeadlineConstraint !==
        null ||
    maximumDeadlineConstraint !==
        null ||
    walletSignatureConstraint !==
        null
) {

    await identityRegistry
        .simulate
        .setAgentWallet(
            [
                agentId,
                nonOwner.account.address,
                validWalletDeadline,
                validWalletSignature
            ],
            {
                account:
                    owner.account
            }
        );

}


if (
    badWalletConstraint !==
    null
) {

    await requireObservedRevertReason(
        () =>
            identityRegistry
                .simulate
                .setAgentWallet(
                    [
                        agentId,
                        zeroAddress,
                        validWalletDeadline,
                        "0x"
                    ],
                    {
                        account:
                            owner.account
                    }
                ),
        "bad wallet",
        "ERC-8004 zero-wallet counterfactual"
    );

}


if (
    expiredDeadlineConstraint !==
    null
) {

    await requireObservedRevertReason(
        () =>
            identityRegistry
                .simulate
                .setAgentWallet(
                    [
                        agentId,
                        nonOwner.account.address,
                        expiredWalletDeadline,
                        "0x"
                    ],
                    {
                        account:
                            owner.account
                    }
                ),
        "expired",
        "ERC-8004 expired-deadline counterfactual"
    );

}


if (
    maximumDeadlineConstraint !==
    null
) {

    await requireObservedRevertReason(
        () =>
            identityRegistry
                .simulate
                .setAgentWallet(
                    [
                        agentId,
                        nonOwner.account.address,
                        excessiveWalletDeadline,
                        "0x"
                    ],
                    {
                        account:
                            owner.account
                    }
                ),
        "deadline too far",
        "ERC-8004 excessive-deadline counterfactual"
    );

}


if (
    walletSignatureConstraint !==
    null
) {

    await requireObservedRevertReason(
        () =>
            identityRegistry
                .simulate
                .setAgentWallet(
                    [
                        agentId,
                        nonOwner.account.address,
                        validWalletDeadline,
                        "0x"
                    ],
                    {
                        account:
                            owner.account
                    }
                ),
        "invalid wallet sig",
        "ERC-8004 invalid-wallet-signature counterfactual"
    );

}


if (
    registrationReservedKeyConstraint !==
    null
) {

    await identityRegistry
        .simulate
        .register(
            [
                "ipfs://oecl/control/erc8004-safe-metadata",

                [
                    {
                        metadataKey:
                            "oecl.safe",

                        metadataValue:
                            "0x01"
                    }
                ]
            ],
            {
                account:
                    owner.account
            }
        );


    await requireObservedRevertReason(
        () =>
            identityRegistry
                .simulate
                .register(
                    [
                        "ipfs://oecl/control/erc8004-reserved-metadata",

                        [
                            {
                                metadataKey:
                                    "agentWallet",

                                metadataValue:
                                    "0x01"
                            }
                        ]
                    ],
                    {
                        account:
                            owner.account
                    }
                ),
        "reserved key",
        "ERC-8004 registration reserved-key counterfactual"
    );

}


if (
    setMetadataReservedKeyConstraint !==
    null
) {

    await identityRegistry
        .simulate
        .setMetadata(
            [
                agentId,
                "oecl.safe",
                "0x01"
            ],
            {
                account:
                    owner.account
            }
        );


    await requireObservedRevertReason(
        () =>
            identityRegistry
                .simulate
                .setMetadata(
                    [
                        agentId,
                        "agentWallet",
                        "0x01"
                    ],
                    {
                        account:
                            owner.account
                    }
                ),
        "reserved key",
        "ERC-8004 setMetadata reserved-key counterfactual"
    );

}


/*
 * Participant B:
 *
 * Use ABI + bytecode generated by participant B's own pinned
 * toolchain, but deploy into the SAME runtime used above.
 */

const deploy8060Hash =
    await owner.deployContract(
        {
            abi:
                artifact8060.abi,

            bytecode:
                artifact8060.bytecode
        }
    );


const deploy8060Receipt =
    await publicClient
        .waitForTransactionReceipt(
            {
                hash:
                    deploy8060Hash
            }
        );


if (
    !deploy8060Receipt.contractAddress
) {

    throw new Error(
        "ERC-8060 deployment produced no contract address."
    );

}


const erc8060 =
    getContract(
        {
            address:
                deploy8060Receipt.contractAddress,

            abi:
                artifact8060.abi,

            client: {
                public:
                    publicClient,

                wallet:
                    owner
            }
        }
    );


const mintPrice =
    await erc8060
        .read
        .MINT_PRICE();


const redeemValue =
    await erc8060
        .read
        .REDEEM_VALUE();


const mintPriceConstraint =
    requirement ===
        null
        ? null
        : (() => {

            const matches =
                requirement.constraints.filter(
                    constraint =>
                        constraint.participantSide ===
                            "B" &&
                        constraint.basis ===
                            "SOLIDITY_REQUIRE_STATEMENT" &&
                        typeof constraint.rawText ===
                            "string" &&
                        constraint.rawText.includes(
                            "msg.value"
                        ) &&
                        constraint.rawText.includes(
                            "MINT_PRICE"
                        )
                );


            if (
                matches.length !==
                1
            ) {

                throw new Error(
                    "Expected exactly one discovered ERC-8060 exact mint-price constraint."
                );

            }


            return matches[0];

        })();


const nonexistentTokenConstraint =
    requirement ===
        null
        ? null
        : (() => {

            const matches =
                requirement.constraints.filter(
                    constraint =>
                        constraint.participantSide ===
                            "B" &&
                        constraint.basis ===
                            "SOLIDITY_REQUIRE_STATEMENT" &&
                        typeof constraint.rawText ===
                            "string" &&
                        constraint.rawText.includes(
                            "_exists(tokenId)"
                        ) &&
                        constraint.rawText.includes(
                            "Nonexistent token"
                        )
                );


            if (
                matches.length !==
                1
            ) {

                throw new Error(
                    "Expected exactly one discovered ERC-8060 nonexistent-token constraint."
                );

            }


            return matches[0];

        })();


const nonOwnerBurnConstraint =
    requirement ===
        null
        ? null
        : (() => {

            const matches =
                requirement.constraints.filter(
                    constraint =>
                        constraint.participantSide ===
                            "B" &&
                        constraint.basis ===
                            "SOLIDITY_REQUIRE_STATEMENT" &&
                        typeof constraint.rawText ===
                            "string" &&
                        constraint.rawText.includes(
                            "ownerOf(tokenId)"
                        ) &&
                        constraint.rawText.includes(
                            "msg.sender"
                        ) &&
                        constraint.rawText.includes(
                            "Not token owner"
                        )
                );


            if (
                matches.length !==
                1
            ) {

                throw new Error(
                    "Expected exactly one discovered ERC-8060 owner-only burn constraint."
                );

            }


            return matches[0];

        })();


const uriB =
    "ipfs://oecl/control/erc8060-value";


const txB =
    await erc8060
        .write
        .mint(
            [
                uriB
            ],
            {
                value:
                    mintPrice
            }
        );


const receiptB =
    await publicClient
        .waitForTransactionReceipt(
            {
                hash:
                    txB
            }
        );


let incorrectMintPriceRevertReasonConfirmed =
    false;


if (
    mintPriceConstraint !==
    null
) {

    const incorrectMintPrice =
        mintPrice +
        1n;


    try {

        await publicClient
            .simulateContract(
                {
                    address:
                        deploy8060Receipt.contractAddress,

                    abi:
                        artifact8060.abi,

                    functionName:
                        "mint",

                    args: [
                        "ipfs://oecl/control/erc8060-invalid-price"
                    ],

                    account:
                        owner.account,

                    value:
                        incorrectMintPrice
                }
            );

    } catch (error) {

        const errorText =
            [
                String(error),

                String(
                    error?.shortMessage ??
                    ""
                ),

                String(
                    error?.details ??
                    ""
                ),

                String(
                    error?.cause ??
                    ""
                ),

                String(
                    error?.cause?.shortMessage ??
                    ""
                ),

                String(
                    error?.cause?.details ??
                    ""
                ),

                String(
                    error?.cause?.reason ??
                    ""
                )
            ].join(
                "\n"
            );


        incorrectMintPriceRevertReasonConfirmed =
            errorText.includes(
                "Incorrect ETH amount"
            );


        if (
            !incorrectMintPriceRevertReasonConfirmed
        ) {

            throw error;

        }

    }


    if (
        !incorrectMintPriceRevertReasonConfirmed
    ) {

        throw new Error(
            "ERC-8060 incorrect mint-price counterfactual did not revert with the observed guard reason."
        );

    }

}


let nonexistentTokenRevertReasonConfirmed =
    false;


if (
    nonexistentTokenConstraint !==
    null
) {

    const nonexistentTokenId =
        2n;


    try {

        await erc8060
            .read
            .valueOf(
                [
                    nonexistentTokenId
                ]
            );

    } catch (error) {

        const errorText =
            [
                String(error),

                String(
                    error?.shortMessage ??
                    ""
                ),

                String(
                    error?.details ??
                    ""
                ),

                String(
                    error?.cause ??
                    ""
                ),

                String(
                    error?.cause?.shortMessage ??
                    ""
                ),

                String(
                    error?.cause?.details ??
                    ""
                ),

                String(
                    error?.cause?.reason ??
                    ""
                )
            ].join(
                "\n"
            );


        nonexistentTokenRevertReasonConfirmed =
            errorText.includes(
                "Nonexistent token"
            );


        if (
            !nonexistentTokenRevertReasonConfirmed
        ) {

            throw error;

        }

    }


    if (
        !nonexistentTokenRevertReasonConfirmed
    ) {

        throw new Error(
            "ERC-8060 nonexistent-token counterfactual did not revert with the observed guard reason."
        );

    }

}


let nonOwnerBurnRevertReasonConfirmed =
    false;


if (
    nonOwnerBurnConstraint !==
    null
) {

    try {

        await publicClient
            .simulateContract(
                {
                    address:
                        deploy8060Receipt.contractAddress,

                    abi:
                        artifact8060.abi,

                    functionName:
                        "burn",

                    args: [
                        1n
                    ],

                    account:
                        nonOwner.account
                }
            );

    } catch (error) {

        const errorText =
            [
                String(error),

                String(
                    error?.shortMessage ??
                    ""
                ),

                String(
                    error?.details ??
                    ""
                ),

                String(
                    error?.cause ??
                    ""
                ),

                String(
                    error?.cause?.shortMessage ??
                    ""
                ),

                String(
                    error?.cause?.details ??
                    ""
                ),

                String(
                    error?.cause?.reason ??
                    ""
                )
            ].join(
                "\n"
            );


        nonOwnerBurnRevertReasonConfirmed =
            errorText.includes(
                "Not token owner"
            );


        if (
            !nonOwnerBurnRevertReasonConfirmed
        ) {

            throw error;

        }

    }


    if (
        !nonOwnerBurnRevertReasonConfirmed
    ) {

        throw new Error(
            "ERC-8060 non-owner burn counterfactual did not revert with the observed guard reason."
        );

    }

}


/*
 * Shared-foundation probe.
 *
 * This ABI deliberately knows only the ERC-721 surface.
 */

const erc721ProbeAbi = [

    {
        type:
            "function",

        name:
            "ownerOf",

        stateMutability:
            "view",

        inputs: [
            {
                name:
                    "tokenId",

                type:
                    "uint256"
            }
        ],

        outputs: [
            {
                name:
                    "",

                type:
                    "address"
            }
        ]
    },

    {
        type:
            "function",

        name:
            "tokenURI",

        stateMutability:
            "view",

        inputs: [
            {
                name:
                    "tokenId",

                type:
                    "uint256"
            }
        ],

        outputs: [
            {
                name:
                    "",

                type:
                    "string"
            }
        ]
    },

    {
        type:
            "function",

        name:
            "supportsInterface",

        stateMutability:
            "view",

        inputs: [
            {
                name:
                    "interfaceId",

                type:
                    "bytes4"
            }
        ],

        outputs: [
            {
                name:
                    "",

                type:
                    "bool"
            }
        ]
    }

];


const erc721A =
    getContract(
        {
            address:
                proxy.address,

            abi:
                erc721ProbeAbi,

            client:
                publicClient
        }
    );


const erc721B =
    getContract(
        {
            address:
                deploy8060Receipt.contractAddress,

            abi:
                erc721ProbeAbi,

            client:
                publicClient
        }
    );


const [
    ownerA,
    ownerB,
    tokenUriA,
    tokenUriB,
    supports721A,
    supports721B,
    valueB
] =
    await Promise.all(
        [
            erc721A.read.ownerOf(
                [
                    agentId
                ]
            ),

            erc721B.read.ownerOf(
                [
                    1n
                ]
            ),

            erc721A.read.tokenURI(
                [
                    agentId
                ]
            ),

            erc721B.read.tokenURI(
                [
                    1n
                ]
            ),

            erc721A.read.supportsInterface(
                [
                    "0x80ac58cd"
                ]
            ),

            erc721B.read.supportsInterface(
                [
                    "0x80ac58cd"
                ]
            ),

            erc8060.read.valueOf(
                [
                    1n
                ]
            )
        ]
    );


const ownerAddress =
    owner.account.address
        .toLowerCase();


const assertions = {

    participantATransactionMined:
        receiptA.status ===
        "success",

    participantBTransactionMined:
        receiptB.status ===
        "success",

    participantAOwnerPreserved:
        ownerA.toLowerCase() ===
        ownerAddress,

    participantBOwnerPreserved:
        ownerB.toLowerCase() ===
        ownerAddress,

    participantATokenUriPreserved:
        tokenUriA ===
        uriA,

    participantBTokenUriPreserved:
        tokenUriB ===
        uriB,

    participantAExposesERC721:
        supports721A ===
        true,

    participantBExposesERC721:
        supports721B ===
        true,

    participantBValuePreserved:
        valueB ===
        redeemValue

};


const passed =
    Object.values(
        assertions
    ).every(
        value =>
            value ===
            true
    );


if (
    !passed
) {

    throw new Error(
        "Shared ERC-721 foundation probe failed: " +
        JSON.stringify(
            assertions
        )
    );

}


const constraintObservations = [

    ...(
        mintPriceConstraint ===
            null
            ? []
            : [

                {
                    observationId:
                        (
                            "REAL-CONTROL-MINT-PRICE-" +
                            mintPriceConstraint.constraintId
                        ),

                    candidateId:
                        mintPriceConstraint.candidateId,

                    constraintId:
                        mintPriceConstraint.constraintId,

                    participantSide:
                        mintPriceConstraint.participantSide,

                    verdict:
                        "PRESERVED",

                    evidence: [
                        (
                            "ERC8060_EXACT_MINT_PRICE_ACCEPTED_TX:" +
                            txB
                        ),
                        "ERC8060_INCORRECT_MINT_PRICE_REVERT_REASON_CONFIRMED:Incorrect ETH amount"
                    ]
                }

            ]
    ),

    ...(
        nonexistentTokenConstraint ===
            null
            ? []
            : [

                {
                    observationId:
                        (
                            "REAL-CONTROL-NONEXISTENT-TOKEN-" +
                            nonexistentTokenConstraint.constraintId
                        ),

                    candidateId:
                        nonexistentTokenConstraint.candidateId,

                    constraintId:
                        nonexistentTokenConstraint.constraintId,

                    participantSide:
                        nonexistentTokenConstraint.participantSide,

                    verdict:
                        "PRESERVED",

                    evidence: [
                        "ERC8060_EXISTING_TOKEN_VALUE_CONFIRMED:1",
                        "ERC8060_NONEXISTENT_TOKEN_REVERT_REASON_CONFIRMED:Nonexistent token"
                    ]
                }

            ]
    ),

    ...(
        nonOwnerBurnConstraint ===
            null
            ? []
            : [

                {
                    observationId:
                        (
                            "REAL-CONTROL-NONOWNER-BURN-" +
                            nonOwnerBurnConstraint.constraintId
                        ),

                    candidateId:
                        nonOwnerBurnConstraint.candidateId,

                    constraintId:
                        nonOwnerBurnConstraint.constraintId,

                    participantSide:
                        nonOwnerBurnConstraint.participantSide,

                    verdict:
                        "PRESERVED",

                    evidence: [
                        "ERC8060_TOKEN_OWNER_CONFIRMED:1",
                        "ERC8060_NONOWNER_BURN_REVERT_REASON_CONFIRMED:Not token owner"
                    ]
                }

            ]
    )
,

    ...(
        badWalletConstraint ===
            null
            ? []
            : [
                {
                    observationId:
                        (
                            "REAL-CONTROL-ERC8004-BAD-WALLET-" +
                            badWalletConstraint.constraintId
                        ),

                    candidateId:
                        badWalletConstraint.candidateId,

                    constraintId:
                        badWalletConstraint.constraintId,

                    participantSide:
                        "A",

                    verdict:
                        "PRESERVED",

                    evidence: [
                        "ERC8004_VALID_WALLET_SET_SIMULATION_CONFIRMED",
                        "ERC8004_ZERO_WALLET_REVERT_REASON_CONFIRMED:bad wallet"
                    ]
                }
            ]
    ),

    ...(
        expiredDeadlineConstraint ===
            null
            ? []
            : [
                {
                    observationId:
                        (
                            "REAL-CONTROL-ERC8004-EXPIRED-DEADLINE-" +
                            expiredDeadlineConstraint.constraintId
                        ),

                    candidateId:
                        expiredDeadlineConstraint.candidateId,

                    constraintId:
                        expiredDeadlineConstraint.constraintId,

                    participantSide:
                        "A",

                    verdict:
                        "PRESERVED",

                    evidence: [
                        "ERC8004_VALID_WALLET_SET_SIMULATION_CONFIRMED",
                        "ERC8004_EXPIRED_DEADLINE_REVERT_REASON_CONFIRMED:expired"
                    ]
                }
            ]
    ),

    ...(
        maximumDeadlineConstraint ===
            null
            ? []
            : [
                {
                    observationId:
                        (
                            "REAL-CONTROL-ERC8004-MAX-DEADLINE-" +
                            maximumDeadlineConstraint.constraintId
                        ),

                    candidateId:
                        maximumDeadlineConstraint.candidateId,

                    constraintId:
                        maximumDeadlineConstraint.constraintId,

                    participantSide:
                        "A",

                    verdict:
                        "PRESERVED",

                    evidence: [
                        "ERC8004_VALID_WALLET_SET_SIMULATION_CONFIRMED",
                        "ERC8004_EXCESSIVE_DEADLINE_REVERT_REASON_CONFIRMED:deadline too far"
                    ]
                }
            ]
    ),

    ...(
        walletSignatureConstraint ===
            null
            ? []
            : [
                {
                    observationId:
                        (
                            "REAL-CONTROL-ERC8004-WALLET-SIGNATURE-" +
                            walletSignatureConstraint.constraintId
                        ),

                    candidateId:
                        walletSignatureConstraint.candidateId,

                    constraintId:
                        walletSignatureConstraint.constraintId,

                    participantSide:
                        "A",

                    verdict:
                        "PRESERVED",

                    evidence: [
                        "ERC8004_VALID_WALLET_SIGNATURE_SIMULATION_CONFIRMED",
                        "ERC8004_INVALID_WALLET_SIGNATURE_REVERT_REASON_CONFIRMED:invalid wallet sig"
                    ]
                }
            ]
    ),

    ...(
        registrationReservedKeyConstraint ===
            null
            ? []
            : [
                {
                    observationId:
                        (
                            "REAL-CONTROL-ERC8004-REGISTER-RESERVED-KEY-" +
                            registrationReservedKeyConstraint.constraintId
                        ),

                    candidateId:
                        registrationReservedKeyConstraint.candidateId,

                    constraintId:
                        registrationReservedKeyConstraint.constraintId,

                    participantSide:
                        "A",

                    verdict:
                        "PRESERVED",

                    evidence: [
                        "ERC8004_SAFE_REGISTRATION_METADATA_SIMULATION_CONFIRMED",
                        "ERC8004_RESERVED_REGISTRATION_METADATA_REVERT_REASON_CONFIRMED:reserved key"
                    ]
                }
            ]
    ),

    ...(
        setMetadataReservedKeyConstraint ===
            null
            ? []
            : [
                {
                    observationId:
                        (
                            "REAL-CONTROL-ERC8004-SETMETADATA-RESERVED-KEY-" +
                            setMetadataReservedKeyConstraint.constraintId
                        ),

                    candidateId:
                        setMetadataReservedKeyConstraint.candidateId,

                    constraintId:
                        setMetadataReservedKeyConstraint.constraintId,

                    participantSide:
                        "A",

                    verdict:
                        "PRESERVED",

                    evidence: [
                        "ERC8004_SAFE_SETMETADATA_SIMULATION_CONFIRMED",
                        "ERC8004_RESERVED_SETMETADATA_REVERT_REASON_CONFIRMED:reserved key"
                    ]
                }
            ]
    )
];


const report = {

    executionKind:
        "OECL_REAL_ERC8004_ERC8060_BILATERAL_CONTROL",

    chainId,

    sharedRuntime:
        true,

    participantA: {

        executed:
            true,

        contractAddresses: [
            proxy.address,
            realImpl.address
        ],

        transactionHashes: [
            txA
        ]

    },

    participantB: {

        executed:
            true,

        contractAddresses: [
            deploy8060Receipt.contractAddress
        ],

        transactionHashes: [
            deploy8060Hash,
            txB
        ]

    },

    observations: [
        "REAL_ERC8004_TRANSACTION_OBSERVED",
        "REAL_ERC8060_TRANSACTION_OBSERVED",
        "SAME_EVM_BILATERAL_EXECUTION_OBSERVED",
        "ERC721_SHARED_FOUNDATION_PROBE_PASSED",
        "ERC8060_REDEEMABLE_VALUE_PRESERVED"
    ],

    constraintObservations,

    scientificPolarity:
        "NEUTRAL",

    conclusion:
        "BILATERAL_EXECUTION_OBSERVED_WITHOUT_COMPOSITION_POLARITY"

};


console.log(
    "OECL_JOINT_EXECUTION_RESULT=" +
    JSON.stringify(
        report
    )
);
`;


export function
buildErc8004Erc8060ControlRecipe():
    ScientificJointContractHarnessRecipe {

    const npmCommand =
        process.platform ===
        "win32"
            ? "npm.cmd"
            : "npm";


    const hardhatCommand =
        process.platform ===
        "win32"
            ? ".\\node_modules\\.bin\\hardhat.cmd"
            : "./node_modules/.bin/hardhat";


    return {

        recipeId:
            "REAL-CONTROL-ERC8004-ERC8060-SHARED-ERC721",

        preparationSteps: [

            {
                stepId:
                    "ERC8004-INSTALL-PINNED-DEPENDENCIES",

                participantSide:
                    "A",

                command:
                    npmCommand,

                args: [
                    "ci",
                    "--legacy-peer-deps"
                ]
            },

            {
                stepId:
                    "ERC8004-COMPILE-PINNED-SOURCES",

                participantSide:
                    "A",

                command:
                    hardhatCommand,

                args: [
                    "compile"
                ],

                env: {

                    SEPOLIA_RPC_URL:
                        "http://127.0.0.1:8545",

                    MAINNET_RPC_URL:
                        "http://127.0.0.1:8545"

                }
            },

            {
                stepId:
                    "ERC8060-INSTALL-PINNED-DEPENDENCIES",

                participantSide:
                    "B",

                command:
                    npmCommand,

                args: [
                    "ci"
                ]
            },

            {
                stepId:
                    "ERC8060-COMPILE-PINNED-SOURCES",

                participantSide:
                    "B",

                command:
                    npmCommand,

                args: [
                    "run",
                    "compile"
                ]
            }

        ],

        driver: {

            participantSide:
                "A",

            fileName:
                "erc8004-erc8060-real-control.mjs",

            source:
                DRIVER_SOURCE,

            /*
             * Importing Hardhat inside the real driver causes the
             * participant A configuration to be validated again.
             *
             * These ephemeral local URLs satisfy configuration
             * validation only. The joint driver executes against the
             * in-process Hardhat simulated network and does not use
             * these endpoints as scientific evidence.
             */
            env: {

                SEPOLIA_RPC_URL:
                    "http://127.0.0.1:8545",

                MAINNET_RPC_URL:
                    "http://127.0.0.1:8545"

            }

        }

    };

}
