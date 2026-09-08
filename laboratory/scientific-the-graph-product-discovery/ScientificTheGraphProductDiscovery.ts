export type ScientificTheGraphProductDiscoveryMatchKind =
    | "KEYWORD"
    | "CONTRACT_ADDRESS";


export interface ScientificTheGraphProductDiscoveryRequest {

    requestId:
        string;

    protocolId:
        string;

    profileId:
        string;

    sourceId:
        string;

    sourceRevision?:
        string;

    /*
     * Search aliases are deterministic protocol identity aliases.
     *
     * They are discovery terms only.
     * They do not establish protocol equivalence with any
     * returned Graph product.
     */
    searchTerms:
        string[];

    searchBasis:
        "PROTOCOL_IDENTITY_ALIASES";

    targetProductKind:
        "SUBGRAPH";

}


export interface ScientificTheGraphProductDiscoveryObservation {

    observationId:
        string;

    requestId:
        string;

    provider:
        "THE_GRAPH";

    /*
     * The product used to discover the candidate.
     */
    discoveryProductKind:
        "SUBGRAPH_MCP";

    /*
     * The discovered product itself.
     */
    resultProductKind:
        "SUBGRAPH";

    productId:
        string;

    network:
        string;

    chainId:
        string;

    deploymentId?:
        string;

    schemaId?:
        string;

    matchKind:
        ScientificTheGraphProductDiscoveryMatchKind;

    matchedValue:
        string;

    /*
     * Rank is provider-supplied discovery ordering only.
     * OECL does not reinterpret it as scientific confidence.
     */
    providerRank?:
        number;

}


export interface ScientificTheGraphProductDiscoveryCandidate {

    candidateId:
        string;

    requestId:
        string;

    protocolId:
        string;

    profileId:
        string;

    sourceId:
        string;

    sourceRevision?:
        string;

    productKind:
        "SUBGRAPH";

    productId:
        string;

    network:
        string;

    chainId:
        string;

    deploymentId?:
        string;

    schemaId?:
        string;

    discoveryObservationIds:
        string[];

    matchedValues:
        string[];

    /*
     * DISCOVERED means only that The Graph discovery returned
     * this product for this exact source-scoped protocol request.
     *
     * It is not proof that the product indexes the normative
     * ERC, contains useful evidence, or participates in a
     * composition.
     */
    status:
        "DISCOVERED";

    nextAction:
        "INSPECT_SCHEMA_AND_METADATA";

}


export interface ScientificTheGraphProductDiscoveryPlanResult {

    requests:
        ScientificTheGraphProductDiscoveryRequest[];

    excludedProtocolIds:
        string[];

    errors:
        string[];

}


export interface ScientificTheGraphProductDiscoveryResult {

    candidates:
        ScientificTheGraphProductDiscoveryCandidate[];

    errors:
        string[];

}