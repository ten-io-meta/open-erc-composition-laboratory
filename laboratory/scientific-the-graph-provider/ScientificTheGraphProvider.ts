import type {
    ScientificTheGraphProviderMode
} from "../scientific-the-graph-evidence/ScientificTheGraphEvidence.js";


export interface ScientificTheGraphHttpRequest {

    url:
        string;

    headers:
        Record<string, string>;

    body:
        string;

    timeoutMs:
        number;

}


export interface ScientificTheGraphHttpResponse {

    status:
        number;

    body:
        string;

}


export interface ScientificTheGraphTransport {

    post(
        request:
            ScientificTheGraphHttpRequest
    ): Promise<ScientificTheGraphHttpResponse>;

}


export interface ScientificTheGraphSubgraphQueryRequest {

    subgraphId:
        string;

    network:
        string;

    chainId:
        string;

    apiKey:
        string;

    document:
        string;

    variables:
        unknown;

    deploymentId?:
        string;

    schemaId?:
        string;

    gatewayBaseUrl?:
        string;

    timeoutMs?:
        number;

}


export interface ScientificTheGraphSubgraphQueryResult {

    provider:
        "THE_GRAPH";

    providerMode:
        ScientificTheGraphProviderMode;

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

    endpoint:
        string;

    httpStatus:
        number | null;

    query: {

        document:
            string;

        variables:
            unknown;

        response:
            unknown;

        fetchedAt:
            string;

        indexedBlock: {

            number:
                number;

            hash?:
                string;

        };

    } | null;

    errors:
        string[];

}