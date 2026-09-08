import type {
    ScientificTheGraphProviderMode
} from "../scientific-the-graph-evidence/ScientificTheGraphEvidence.js";


export type ScientificTheGraphProtocolAttributionStatus =
    | "ATTRIBUTED"
    | "UNATTRIBUTED";


export interface ScientificTheGraphProtocolIdentifierMatch {

    identifier:
        string;

    occurrenceCount:
        number;

}


export interface ScientificTheGraphProtocolAttributionAssessment {

    assessmentId:
        string;

    protocolId:
        string;

    profileId:
        string;

    normativeSourceId:
        string;

    normativeSourceRevision?:
        string;

    subgraphId:
        string;

    ipfsHash:
        string;

    providerMode:
        ScientificTheGraphProviderMode;

    schemaObservationId:
        string;

    schemaHash:
        string;

    identifiersChecked:
        string[];

    matchedIdentifiers:
        ScientificTheGraphProtocolIdentifierMatch[];

    /*
     * ATTRIBUTED means the exact inspected schema contains at
     * least one exact protocol identifier token.
     *
     * It does not establish compatibility, composition,
     * scientific SUPPORT or semantic completeness.
     */
    status:
        ScientificTheGraphProtocolAttributionStatus;

    attributionBasis:
        | "EXPLICIT_SCHEMA_PROTOCOL_IDENTIFIER"
        | "NO_EXPLICIT_SCHEMA_PROTOCOL_IDENTIFIER";

    nextAction:
        | "ELIGIBLE_FOR_DATA_QUERY_DESIGN"
        | "REQUIRES_ADDITIONAL_ATTRIBUTION_EVIDENCE";

}


export interface ScientificTheGraphProtocolAttributionResult {

    assessments:
        ScientificTheGraphProtocolAttributionAssessment[];

    errors:
        string[];

}