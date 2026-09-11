import type {
    ScientificTheGraphProviderMode
} from "../scientific-the-graph-evidence/ScientificTheGraphEvidence.js";

import type {
    ScientificTheGraphProfileDiscoveryTermOriginKind
} from "../scientific-the-graph-profile-discovery/ScientificTheGraphProfileDiscovery.js";


export type ScientificTheGraphDiscoveryTriageStatus =
    | "PRIORITIZED_FOR_INSPECTION"
    | "DEFERRED_LOW_SPECIFICITY";


export type ScientificTheGraphDiscoveryTriageBasis =
    | "EXPLICIT_PROTOCOL_IDENTITY_HIT"
    | "MULTIPLE_PROFILE_DERIVED_TERM_HITS"
    | "SINGLE_PROFILE_DERIVED_TERM_HIT";


export interface ScientificTheGraphDiscoveryTriageCandidate {

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

    displayNames:
        string[];

    matchedTerms:
        string[];

    matchedTermIds:
        string[];

    matchedOriginKinds:
        ScientificTheGraphProfileDiscoveryTermOriginKind[];

    sourceArtifactIds:
        string[];

    evidenceIds:
        string[];

    searchIds:
        string[];

    hitIds:
        string[];

    identityMatch:
        boolean;

    derivedTermCount:
        number;

    totalDistinctTermCount:
        number;

    /*
     * Triage is operational prioritization only.
     *
     * PRIORITIZED_FOR_INSPECTION means:
     *   - an exact protocol-identity search hit exists, OR
     *   - the same exact deployment was independently returned
     *     by at least two distinct profile-derived terms.
     *
     * It is not protocol attribution, compatibility,
     * composition or scientific confidence.
     */
    status:
        ScientificTheGraphDiscoveryTriageStatus;

    triageBasis:
        ScientificTheGraphDiscoveryTriageBasis;

    nextAction:
        | "INSPECT_EXACT_DEPLOYMENT"
        | "RETAIN_AS_DISCOVERY_ONLY";

}


export interface ScientificTheGraphDiscoveryTriageResult {

    candidates:
        ScientificTheGraphDiscoveryTriageCandidate[];

    prioritized:
        ScientificTheGraphDiscoveryTriageCandidate[];

    deferred:
        ScientificTheGraphDiscoveryTriageCandidate[];

    errors:
        string[];

}