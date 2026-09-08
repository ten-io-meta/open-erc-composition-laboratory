export type ScientificEvidenceLineageTerminalKind =
    | "SOURCE_OBSERVATION"
    | "SOURCE_FACT"
    | "DOCUMENTARY_RELATION";


export type ScientificEvidenceLineageDerivedKind =
    | "SEMANTIC_CAPABILITY"
    | "CAPABILITY_ATTRIBUTION"
    | "PROTOCOL_ATTRIBUTION"
    | "PROTOCOL_CONCEPT"
    | "STRUCTURAL_PROTOCOL_RELATION"
    | "PROTOCOL_EXTERNAL_CALL_ATTRIBUTION";


export interface ScientificEvidenceLineageReference {

    evidenceId:
        string;

    sourceId:
        string;

    sourceRevision?:
        string;

}


export interface ScientificEvidenceLineageTerminalEvidence
    extends ScientificEvidenceLineageReference {

    kind:
        ScientificEvidenceLineageTerminalKind;

    sourceType:
        string;

    sourceLocation:
        string;

    filePath?:
        string;

    startLine?:
        number;

    endLine?:
        number;

    rawText:
        string;

}


export interface ScientificEvidenceLineageDerivedLink
    extends ScientificEvidenceLineageReference {

    kind:
        ScientificEvidenceLineageDerivedKind;

    /*
     * Parent identities are interpreted only inside this exact
     * sourceId/sourceRevision provenance scope.
     *
     * No textual parsing of evidenceId is permitted.
     */
    parentEvidenceIds:
        string[];

}


export interface ScientificEvidenceLineageResolution
    extends ScientificEvidenceLineageReference {

    status:
        "RESOLVED" | "UNRESOLVED";

    terminalEvidenceIds:
        string[];

    unresolvedLeafIds:
        string[];

}


export interface ScientificEvidenceLineageResult {

    terminalEvidenceCatalog:
        ScientificEvidenceLineageTerminalEvidence[];

    links:
        ScientificEvidenceLineageDerivedLink[];

    resolutions:
        ScientificEvidenceLineageResolution[];

    errors:
        string[];

}