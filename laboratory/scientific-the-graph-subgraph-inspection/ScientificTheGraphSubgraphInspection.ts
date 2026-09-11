import type {
    ScientificTheGraphProviderMode
} from "../scientific-the-graph-evidence/ScientificTheGraphEvidence.js";


export interface ScientificTheGraphSubgraphInspectionRequest {

    requestId:
        string;

    subgraphId:
        string;

    /*
     * Exact deployment identity observed during discovery.
     */
    ipfsHash:
        string;

}


export interface ScientificTheGraphSubgraphSchemaObservation {

    observationId:
        string;

    requestId:
        string;

    provider:
        "THE_GRAPH";

    providerMode:
        ScientificTheGraphProviderMode;

    productKind:
        "SUBGRAPH";

    subgraphId:
        string;

    ipfsHash:
        string;

    toolName:
        "get_schema_by_ipfs_hash";

    schemaText:
        string;

    schemaHash:
        string;

    status:
        "SCHEMA_OBSERVED";

}


export type ScientificTheGraphQueryActivityStatus =
    | "ACTIVITY_OBSERVED"
    | "NO_RECENT_ACTIVITY_OBSERVED";


export interface ScientificTheGraphSubgraphQueryActivityObservation {

    observationId:
        string;

    requestId:
        string;

    provider:
        "THE_GRAPH";

    providerMode:
        ScientificTheGraphProviderMode;

    productKind:
        "SUBGRAPH";

    subgraphId:
        string;

    ipfsHash:
        string;

    toolName:
        "get_deployment_30day_query_counts";

    dataPointsCount:
        number;

    totalQueryCount:
        number;

    activityStatus:
        ScientificTheGraphQueryActivityStatus;

    rawFragment:
        string;

    fragmentHash:
        string;

}


export interface ScientificTheGraphSubgraphInspection {

    inspectionId:
        string;

    requestId:
        string;

    subgraphId:
        string;

    ipfsHash:
        string;

    providerMode:
        ScientificTheGraphProviderMode;

    schemaObservation:
        ScientificTheGraphSubgraphSchemaObservation;

    queryActivityObservation:
        ScientificTheGraphSubgraphQueryActivityObservation;

    /*
     * INSPECTED means provider metadata was acquired and
     * validated for this exact deployment.
     *
     * It does not establish protocol attribution,
     * scientific compatibility or composition.
     */
    status:
        "INSPECTED";

    nextAction:
        "ASSESS_PROTOCOL_ATTRIBUTION";

}


export interface ScientificTheGraphSubgraphInspectionResult {

    inspections:
        ScientificTheGraphSubgraphInspection[];

    errors:
        string[];

}