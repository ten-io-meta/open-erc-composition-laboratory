export interface AdaptedResearchSource {

    sourceId: string;

    protocols: string[];

    capabilities: string[];

    claims: string[];

    compositionSignals?: {
        fromCapability: string;
        toCapability: string;
        relation: string;
        reason: string;
    }[];

}

export interface ResearchSourceAdapter {

    supports(source: any): boolean;

    adapt(source: any): AdaptedResearchSource;

}