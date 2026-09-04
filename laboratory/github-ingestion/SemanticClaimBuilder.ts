export interface SemanticClaimInput {
    readme: string;
    docs: string[];
    contracts: string[];
    tests: string[];
    configs: string[];
    protocols: string[];
    capabilities: string[];
}

export class SemanticClaimBuilder {

    build(input: SemanticClaimInput): string[] {

        const allText = [
            input.readme,
            ...input.docs,
            ...input.contracts,
            ...input.tests,
            ...input.configs
        ].join("\n");

        const contractsText = input.contracts.join("\n");
        const testsText = input.tests.join("\n");

        const claims: string[] = [];

        claims.push(...this.fromCapabilities(input.capabilities));
        claims.push(...this.fromProtocols(input.protocols));
        claims.push(...this.fromSolidityStructure(contractsText));
        claims.push(...this.fromTests(testsText));
        claims.push(...this.fromDocumentation(allText));

        return [...new Set(claims)];

    }

    private fromCapabilities(capabilities: string[]): string[] {

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

        if (capabilities.includes("AccessControl") && capabilities.includes("Authority")) {
            claims.push("AccessControl IMPLEMENTS Authority.");
        }

        if (capabilities.includes("Upgradeability") && capabilities.includes("Ownership")) {
            claims.push("Ownership CONSTRAINS Upgradeability.");
        }

        return claims;

    }

    private fromProtocols(protocols: string[]): string[] {

        return protocols
            .slice(0, 20)
            .map(protocol => `${protocol} SUPPORTS Standardization.`);

    }

    private fromSolidityStructure(contractsText: string): string[] {

        const claims: string[] = [];

        if (/contract\s+\w+\s+is\s+.*ERC20/i.test(contractsText)) {
            claims.push("ERC20 ENABLES FungibleAccounting.");
            claims.push("ERC20 SUPPORTS Transfer.");
        }

        if (/contract\s+\w+\s+is\s+.*ERC721/i.test(contractsText)) {
            claims.push("ERC721 ENABLES Ownership.");
            claims.push("ERC721 SUPPORTS Transfer.");
        }

        if (/contract\s+\w+\s+is\s+.*ERC1155/i.test(contractsText)) {
            claims.push("ERC1155 ENABLES MultiAssetAccounting.");
            claims.push("ERC1155 SUPPORTS Transfer.");
        }

        if (/import\s+.*AccessControl/i.test(contractsText) || /AccessControl/i.test(contractsText)) {
            claims.push("AccessControl IMPLEMENTS Authority.");
            claims.push("Authority CONSTRAINS Transfer.");
        }

        if (/Ownable/i.test(contractsText)) {
            claims.push("Ownership CONSTRAINS Authority.");
        }

        if (/Pausable/i.test(contractsText)) {
            claims.push("EmergencyControl CONSTRAINS Transfer.");
        }

        if (/ReentrancyGuard/i.test(contractsText)) {
            claims.push("ReentrancyGuard CONSTRAINS Settlement.");
        }

        if (/function\s+burn/i.test(contractsText) || /\._burn\s*\(/i.test(contractsText)) {
            claims.push("Burn CONSTRAINS Supply.");
        }

        if (/function\s+mint/i.test(contractsText) || /\._mint\s*\(/i.test(contractsText)) {
            claims.push("Mint ENABLES Supply.");
        }

        if (/permit|EIP712/i.test(contractsText)) {
            claims.push("SignatureAuthorization ENABLES Authority.");
            claims.push("EIP712 SUPPORTS SignatureAuthorization.");
        }

        return claims;

    }

    private fromTests(testsText: string): string[] {

        const claims: string[] = [];

        if (/invariant|property|fuzz/i.test(testsText)) {
            claims.push("Testing SUPPORTS InvariantValidation.");
        }

        if (/revert|expectRevert|to\.be\.reverted/i.test(testsText)) {
            claims.push("NegativeTesting SUPPORTS SafetyConstraint.");
        }

        if (/transfer/i.test(testsText) && /balance/i.test(testsText)) {
            claims.push("Transfer PRESERVES Accounting.");
        }

        if (/mint/i.test(testsText) && /totalSupply/i.test(testsText)) {
            claims.push("Mint UPDATES Accounting.");
        }

        if (/burn/i.test(testsText) && /totalSupply/i.test(testsText)) {
            claims.push("Burn UPDATES Accounting.");
        }

        return claims;

    }

    private fromDocumentation(text: string): string[] {

        const claims: string[] = [];

        if (/composable|composability|interoperable|interoperability/i.test(text)) {
            claims.push("Interoperability SUPPORTS Composition.");
        }

        if (/standard|specification|interface/i.test(text)) {
            claims.push("Specification ENABLES Standardization.");
        }

        if (/security|risk|threat|attack/i.test(text)) {
            claims.push("SecurityConsiderations CONSTRAINS Standardization.");
        }

        if (/audit|audited/i.test(text)) {
            claims.push("AuditEvidence SUPPORTS SafetyConstraint.");
        }

        return claims;

    }

}