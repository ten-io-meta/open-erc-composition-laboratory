import type {
    ScientificTheGraphProviderMode
} from "../scientific-the-graph-evidence/ScientificTheGraphEvidence.js";


export interface ScientificTheGraphSubgraphMcpKeywordHit {

    hitId:
        string;

    subgraphId:
        string;

    displayName:
        string;

    ipfsHash:
        string;

    providerRank:
        number;

    rawFragment:
        string;

    fragmentHash:
        string;

}


export interface ScientificTheGraphSubgraphMcpKeywordSearch {

    searchId:
        string;

    requestId:
        string;

    protocolId:
        string;

    searchTerm:
        string;

    provider:
        "THE_GRAPH";

    providerMode:
        ScientificTheGraphProviderMode;

    discoveryProductKind:
        "SUBGRAPH_MCP";

    toolName:
        "search_subgraphs_by_keyword";

    returned:
        number;

    total:
        number;

    hits:
        ScientificTheGraphSubgraphMcpKeywordHit[];

    /*
     * OBSERVED means only that this exact MCP search completed
     * and its response was normalized.
     *
     * It does not establish protocol equivalence, relevance,
     * compatibility or composition.
     */
    status:
        "OBSERVED";

}


export interface ScientificTheGraphSubgraphMcpKeywordDiscoveryResult {

    searches:
        ScientificTheGraphSubgraphMcpKeywordSearch[];

    errors:
        string[];

}