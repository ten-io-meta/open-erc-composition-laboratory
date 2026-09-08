import type {
    ScientificTheGraphProviderMode
} from "../scientific-the-graph-evidence/ScientificTheGraphEvidence.js";


export interface ScientificGitHubNormativeSourceIdentity {

    sourceType:
        "GITHUB";

    sourceId:
        string;

    sourceRevision:
        string;

}


export interface ScientificTheGraphProtocolAttribution {

    attributionId:
        string;

    adapterId:
        string;

    protocolId:
        string;

    attributionBasis:
        "EXPLICIT_PROVIDER_ADAPTER_PROTOCOL_ATTRIBUTION";

    graphProductId:
        string;

    network:
        string;

    chainId:
        string;

    requiredProviderMode:
        ScientificTheGraphProviderMode;

}


export interface ScientificGitHubTheGraphEvidenceBinding {

    bindingId:
        string;

    protocolId:
        string;

    profileId:
        string;

    normativeSourceType:
        "GITHUB";

    normativeSourceId:
        string;

    normativeSourceRevision:
        string;

    attributionId:
        string;

    adapterId:
        string;

    attributionBasis:
        "EXPLICIT_PROVIDER_ADAPTER_PROTOCOL_ATTRIBUTION";

    graphSourceId:
        string;

    graphProductKind:
        string;

    graphProductId:
        string;

    graphNetwork:
        string;

    graphChainId:
        string;

    graphDeploymentId?:
        string;

    graphSchemaId?:
        string;

    providerMode:
        ScientificTheGraphProviderMode;

    queryReceiptId:
        string;

    indexedBlockNumber:
        number;

    indexedBlockHash?:
        string;

    evidenceIds:
        string[];

    /*
     * BOUND means only that explicit protocol attribution,
     * normative source identity and indexed provider evidence
     * were structurally connected.
     *
     * It is not compatibility, support, composition or harmony.
     */
    status:
        "BOUND";

    bindingBasis:
        "EXPLICIT_PROTOCOL_ATTRIBUTION_WITH_INDEXED_PROVIDER_EVIDENCE";

}


export interface ScientificGitHubTheGraphEvidenceBindingResult {

    bindings:
        ScientificGitHubTheGraphEvidenceBinding[];

    errors:
        string[];

}