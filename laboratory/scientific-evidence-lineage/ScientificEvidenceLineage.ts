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


export interface ScientificEvidenceLineageTerminalEvidence {

    evidenceId:
        string;

    kind:
        ScientificEvidenceLineageTerminalKind;

    sourceId:
        string;

    sourceType:
        string;

    sourceRevision?:
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


export interface ScientificEvidenceLineageDerivedLink {

    evidenceId:
        string;

    kind:
        ScientificEvidenceLineageDerivedKind;

    sourceId:
        string;

    sourceRevision?:
        string;

    parentEvidenceIds:
        string[];

}


export interface ScientificEvidenceLineageResolution {

    evidenceId:
        string;

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