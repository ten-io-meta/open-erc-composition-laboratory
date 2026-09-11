import type {
    ScientificSourceObservationLocator
} from "../scientific-source-observation/ScientificSourceObservationLocator.js";


export type ScientificNormativeStatementBasis =
    | "MARKDOWN_PROTOCOL_MUST"
    | "MARKDOWN_PROTOCOL_MUST_NOT";


export interface ScientificNormativeStatement {

    statementId: string;

    sourceId: string;

    sourceRevision?: string;

    observationId: string;

    protocolId: string;

    basis:
        ScientificNormativeStatementBasis;

    rawText: string;

    normalizedText: string;

    sourceLine: number;

    locator:
        ScientificSourceObservationLocator;

}
