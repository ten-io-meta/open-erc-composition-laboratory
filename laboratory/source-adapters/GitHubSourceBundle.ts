export interface GitHubSourceBundle {
    sourceId: string;
    repository: string;
    url: string;
    title: string;
    description: string;
    protocols: string[];
    capabilities: string[];
    claims: string[];
    evidence?: {
        quality: string;
        confidenceWeight: number;
        reproducible: boolean;
        hasImplementation: boolean;
        hasTests: boolean;
        hasInvariants: boolean;
        hasCoverage: boolean;
        hasCitation: boolean;
        observations: string[];
    };
}