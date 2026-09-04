export interface NormalizedSource {

    sourceId: string;

    sourceType:
        | "GITHUB"
        | "EIP"
        | "ERC"
        | "PAPER"
        | "AUDIT"
        | "MAGICIANS"
        | "SPECIFICATION";

    title: string;

    description: string;

    author?: string;

    publishedAt?: string;

    version?: string;

    location: string;

    repository?: string;

    branch?: string;

    commit?: string;

    tags: string[];

    protocols: string[];

    capabilities: string[];

    claims: string[];

    evidence: {

        quality: "LOW" | "MEDIUM" | "HIGH";

        reproducible: boolean;

        implementation: boolean;

        tests: boolean;

        invariants: boolean;

        formalSpecification: boolean;

        citations: boolean;

        confidenceWeight: number;

    };

    metadata: Record<string, string>;

    importedAt: string;

}