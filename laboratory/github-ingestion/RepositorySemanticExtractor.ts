import { SemanticClaimBuilder } from "./SemanticClaimBuilder.js";
import type { NormalizedSource } from "../normalized-source/NormalizedSource.js";
import type { RepositoryScanResult } from "./RepositoryScanner.js";

export class RepositorySemanticExtractor {

    extract(
        repository: string,
        scan: RepositoryScanResult
    ): NormalizedSource {

        const text = [
            scan.readme,
            ...scan.docs,
            ...scan.configs
        ].join("\n");

        const contractsText = scan.contracts.join("\n");
        const testsText = scan.tests.join("\n");

        const protocols = this.extractProtocols(text + "\n" + contractsText);
        const capabilities = this.extractCapabilities(text + "\n" + contractsText);
        const claimBuilder = new SemanticClaimBuilder();

const claims = claimBuilder.build({
    readme: scan.readme,
    docs: scan.docs,
    contracts: scan.contracts,
    tests: scan.tests,
    configs: scan.configs,
    protocols,
    capabilities
});

        const hasTests = scan.tests.length > 0;
        const hasContracts = scan.contracts.length > 0;
        const hasInvariants = /invariant|invariants|property|properties/i.test(
            text + "\n" + testsText
        );

        const sourceId = `GITHUB-${repository
            .replace(/^https:\/\/github\.com\//, "")
            .replace(/\.git$/, "")
            .replace(/[\/\\]/g, "-")
            .toUpperCase()}`;

        return {
            sourceId,
            sourceType: "GITHUB",
            title: repository,
            description: this.extractDescription(scan.readme),
            location: repository.startsWith("https://")
                ? repository
                : `https://github.com/${repository}`,
            repository: repository
                .replace(/^https:\/\/github\.com\//, "")
                .replace(/\.git$/, ""),
            branch: "main",
            tags: [
                "Ethereum",
                "GitHub",
                "repository"
            ],
            protocols,
            capabilities,
            claims,
            evidence: {
                quality: hasContracts && hasTests ? "HIGH" : hasContracts ? "MEDIUM" : "LOW",
                reproducible: true,
                implementation: hasContracts,
                tests: hasTests,
                invariants: hasInvariants,
                formalSpecification: false,
                citations: false,
                confidenceWeight: hasContracts && hasTests ? 1.0 : hasContracts ? 0.85 : 0.65
            },
            metadata: {
                ingestion: "automatic",
                contracts: String(scan.contracts.length),
                tests: String(scan.tests.length),
                docs: String(scan.docs.length)
            },
            importedAt: new Date().toISOString()
        };

    }

    private extractProtocols(text: string): string[] {

        const matches = text.match(/\b(?:ERC|EIP)-?\d{3,5}\b/gi) ?? [];

        const protocols = matches.map(match =>
            match.toUpperCase().replace("ERC-", "ERC").replace("EIP-", "EIP")
        );

        if (/ERC20|ERC-20/i.test(text)) protocols.push("ERC20");
        if (/ERC721|ERC-721/i.test(text)) protocols.push("ERC721");
        if (/ERC1155|ERC-1155/i.test(text)) protocols.push("ERC1155");

        return [...new Set(protocols)];

    }

    private extractCapabilities(text: string): string[] {

        const capabilities: string[] = [];

        const dictionary: Record<string, RegExp> = {
            Accounting: /accounting|balance|supply|ledger/i,
            Settlement: /settlement|settle|payment/i,
            Reservation: /reservation|reserve|locked|escrow/i,
            Authority: /authority|permission|allowance|approval|role/i,
            Transfer: /transfer|safeTransfer|transferFrom/i,
            Burn: /burn|redemption|redeem/i,
            Mint: /mint|issuance/i,
            Ownership: /owner|ownership|Ownable/i,
            Upgradeability: /upgradeable|proxy|upgrade/i,
            AccessControl: /access control|AccessControl|role/i,
            Verification: /verify|verification|proof|attestation/i,
            InvariantValidation: /invariant|property test|fuzz/i,
            Standardization: /standard|interface|specification/i,
            Interoperability: /interoperability|compatible|composable/i
        };

        for (const [capability, pattern] of Object.entries(dictionary)) {
            if (pattern.test(text)) {
                capabilities.push(capability);
            }
        }

        return [...new Set(capabilities)];

    }

    private extractClaims(
        protocols: string[],
        capabilities: string[]
    ): string[] {

        const claims: string[] = [];

        if (capabilities.includes("Standardization") && capabilities.includes("Interoperability")) {
            claims.push("Standardization ENABLES Interoperability.");
        }

        if (capabilities.includes("Authority") && capabilities.includes("Transfer")) {
            claims.push("Authority CONSTRAINS Transfer.");
        }

        if (capabilities.includes("Reservation") && capabilities.includes("Accounting")) {
            claims.push("Reservation CONSTRAINS Accounting.");
        }

        if (capabilities.includes("Reservation") && capabilities.includes("Settlement")) {
            claims.push("Reservation BOUNDS Settlement.");
        }

        if (capabilities.includes("InvariantValidation") && capabilities.includes("Accounting")) {
            claims.push("InvariantValidation VALIDATES Accounting.");
        }

        if (capabilities.includes("Burn") && capabilities.includes("Settlement")) {
            claims.push("Burn ENABLES Settlement.");
        }

        for (const protocol of protocols.slice(0, 10)) {
            claims.push(`${protocol} SUPPORTS Standardization.`);
        }

        return [...new Set(claims)];

    }

    private extractDescription(readme: string): string {
        const line = readme
            .split("\n")
            .map(item => item.trim())
            .find(item => item.length > 40 && !item.startsWith("#"));

        return line ?? "Automatically ingested GitHub repository.";
    }

}