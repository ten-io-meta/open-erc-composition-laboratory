import type {
    ScientificTheGraphProductDiscoveryRequest
} from "../scientific-the-graph-product-discovery/ScientificTheGraphProductDiscovery.js";


export type ScientificTheGraphProfileDiscoveryTermOriginKind =
    | "PROTOCOL_IDENTITY"
    | "CONTRIBUTION_SUBJECT"
    | "NEED_SUBJECT";


export interface ScientificTheGraphProfileDiscoveryTerm {

    termId:
        string;

    protocolId:
        string;

    profileId:
        string;

    term:
        string;

    originKinds:
        ScientificTheGraphProfileDiscoveryTermOriginKind[];

    sourceArtifactIds:
        string[];

    evidenceIds:
        string[];

    sourceSubjects:
        string[];

    /*
     * This is deterministic discovery priority only.
     * It is not scientific confidence.
     */
    discoveryScore:
        number;

}


export interface ScientificTheGraphExpandedDiscoveryRequest
extends ScientificTheGraphProductDiscoveryRequest {

    searchBasis:
        "PROTOCOL_IDENTITY_AND_PROFILE_TERMS";

    termIds:
        string[];

}


export interface ScientificTheGraphProfileDiscoveryExpansionResult {

    requests:
        ScientificTheGraphExpandedDiscoveryRequest[];

    terms:
        ScientificTheGraphProfileDiscoveryTerm[];

    errors:
        string[];

}