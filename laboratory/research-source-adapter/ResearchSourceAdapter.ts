export interface AdaptedResearchSource {

    sourceId: string;

    protocols: string[];

    capabilities: string[];

    claims: string[];

}

export interface ResearchSourceAdapter {

    supports(source: any): boolean;

    adapt(source: any): AdaptedResearchSource;

}