export type ScientificTheGraphProductKind =
    | "SUBGRAPH"
    | "SUBGRAPH_MCP"
    | "SUBSTREAMS";


export type ScientificTheGraphProviderMode =
    | "LIVE"
    | "FIXTURE";


export type ScientificTheGraphObservationKind =
    | "ENTITY"
    | "EVENT"
    | "STATE"
    | "AGGREGATE"
    | "OTHER";


export interface ScientificTheGraphSource {

    /*
     * Deterministic OECL identity for the exact Graph evidence
     * provider scope.
     *
     * It must distinguish product, network, chain, deployment
     * and provider mode.
     */
    sourceId:
        string;

    provider:
        "THE_GRAPH";

    productKind:
        ScientificTheGraphProductKind;

    /*
     * Stable product identity.
     *
     * Examples:
     * Subgraph ID,
     * MCP-resolved product ID,
     * Substreams package/module identity.
     */
    productId:
        string;

    network:
        string;

    chainId:
        string;

    /*
     * Optional exact deployment identity when the provider exposes
     * one independently from the product ID.
     */
    deploymentId?:
        string;

    /*
     * Optional standardized/shared schema identity.
     */
    schemaId?:
        string;

    /*
     * LIVE and FIXTURE evidence must never share source identity.
     */
    providerMode:
        ScientificTheGraphProviderMode;

}


export interface ScientificTheGraphIndexedBlock {

    number:
        number;

    hash?:
        string;

}


export interface ScientificTheGraphQueryReceipt {

    queryReceiptId:
        string;

    sourceId:
        string;

    /*
     * Query text and variables are represented by deterministic
     * cryptographic hashes so credentials never need to be stored
     * in scientific provenance.
     */
    queryDocumentHash:
        string;

    variablesHash:
        string;

    responseHash:
        string;

    indexedBlock:
        ScientificTheGraphIndexedBlock;

    fetchedAt:
        string;

}


export interface ScientificTheGraphEvidence {

    evidenceId:
        string;

    sourceId:
        string;

    queryReceiptId:
        string;

    evidenceBasis:
        "THE_GRAPH_INDEXED_RESPONSE";

    observationKind:
        ScientificTheGraphObservationKind;

    entityType:
        string;

    entityId:
        string;

    /*
     * Exact canonical JSON fragment returned for this observation.
     */
    rawFragment:
        string;

    fragmentHash:
        string;

    /*
     * Optional onchain provenance exposed by the indexed product.
     */
    blockNumber?:
        number;

    blockHash?:
        string;

    transactionHash?:
        string;

    contractAddress?:
        string;

}


export interface ScientificTheGraphEvidenceResult {

    source:
        ScientificTheGraphSource | null;

    queryReceipt:
        ScientificTheGraphQueryReceipt | null;

    evidence:
        ScientificTheGraphEvidence[];

    errors:
        string[];

}