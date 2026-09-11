import {
    GitHubSemanticExtractor
} from "../laboratory/github-adapter/GitHubSemanticExtractor.js";

import type {
    GitHubScannedFile
} from "../laboratory/github-adapter/GitHubFileScanner.js";

function main(): void {

    const extractor =
        new GitHubSemanticExtractor();

    /*
     * ERC-8004-like lexical context.
     *
     * "reserved" refers to a reserved metadata key.
     * "account" refers to wallet/client account access.
     *
     * Neither is evidence of Reservation or Accounting
     * as protocol capabilities.
     */
    const lexicalNoiseFiles: GitHubScannedFile[] = [
        {
            path:
                "/contracts/ERC8004IdentityRegistry.sol",

            content: `
                bytes32 private constant
                    RESERVED_AGENT_WALLET_KEY_HASH =
                        keccak256("agentWallet");

                require(
                    keccak256(bytes(metadataKey))
                        != RESERVED_AGENT_WALLET_KEY_HASH,
                    "reserved key"
                );
            `
        },
        {
            path:
                "/test/core.ts",

            content: `
                const [owner, attacker] =
                    await viem.getWalletClients();

                const ownerAddress =
                    owner.account.address;

                const attackerAddress =
                    attacker.account.address;
            `
        }
    ];

    /*
     * Explicit capability context.
     *
     * These phrases are intended to remain valid
     * evidence for the existing capability vocabulary.
     */
    const explicitCapabilityFiles: GitHubScannedFile[] = [
        {
            path:
                "/docs/reservable-accounting.md",

            content: `
                The reservation accounting layer
                separates locked value from available value.
            `
        }
    ];

    const lexicalNoiseCapabilities =
        extractor.extractCapabilities(
            lexicalNoiseFiles
        );

    const explicitCapabilities =
        extractor.extractCapabilities(
            explicitCapabilityFiles
        );

    const falseReservation =
        lexicalNoiseCapabilities.includes(
            "Reservation"
        );

    const falseAccounting =
        lexicalNoiseCapabilities.includes(
            "Accounting"
        );

    const explicitReservation =
        explicitCapabilities.includes(
            "Reservation"
        );

    const explicitAccounting =
        explicitCapabilities.includes(
            "Accounting"
        );

    const pass =
        !falseReservation &&
        !falseAccounting &&
        explicitReservation &&
        explicitAccounting;

    console.log("");
    console.log(
        "GITHUB SEMANTIC CAPABILITY BOUNDARIES"
    );
    console.log(
        "-------------------------------------"
    );

    console.log(
        `FALSE RESERVATION: ${falseReservation}`
    );

    console.log(
        `FALSE ACCOUNTING: ${falseAccounting}`
    );

    console.log(
        `EXPLICIT RESERVATION: ${explicitReservation}`
    );

    console.log(
        `EXPLICIT ACCOUNTING: ${explicitAccounting}`
    );

    console.log(
        `RESULT: ${pass ? "PASS" : "FAIL"}`
    );

    if (!pass) {
        process.exitCode = 1;
    }
}

main();