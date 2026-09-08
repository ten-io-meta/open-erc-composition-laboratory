import type {
    ScientificSourceFactContainerKind
} from "../scientific-source-fact/ScientificSourceFact.js";

import type {
    ScientificSourceObservationLocator
} from "../scientific-source-observation/ScientificSourceObservationLocator.js";


export interface ScientificSolidityInheritanceContainerOccurrence {

    containerOccurrenceId:
        string;

    declarationFactId:
        string;

    observationId:
        string;

    sourceId:
        string;

    sourceRevision?:
        string;

    containerKind:
        ScientificSourceFactContainerKind;

    containerSymbol:
        string;

}


export type ScientificSolidityInheritanceResolutionBasis =
    "UNIQUE_DECLARATION_SYMBOL_IN_INPUT";


export interface ScientificSolidityInheritanceEdge {

    inheritanceEdgeId:
        string;

    subjectDeclarationFactId:
        string;

    subjectObservationId:
        string;

    subjectSourceId:
        string;

    subjectSourceRevision?:
        string;

    subjectContainerKind:
        ScientificSourceFactContainerKind;

    subjectContainerSymbol:
        string;

    inheritedSymbol:
        string;

    objectDeclarationFactId:
        string;

    objectObservationId:
        string;

    objectSourceId:
        string;

    objectSourceRevision?:
        string;

    objectContainerKind:
        ScientificSourceFactContainerKind;

    objectContainerSymbol:
        string;

    resolutionBasis:
        ScientificSolidityInheritanceResolutionBasis;

    locator:
        ScientificSourceObservationLocator;

    rawText:
        string;

}


export type ScientificSolidityUnresolvedInheritanceReason =
    | "NO_DECLARATION_MATCH"
    | "AMBIGUOUS_DECLARATION_MATCH";


export interface ScientificSolidityUnresolvedInheritanceReference {

    inheritanceReferenceId:
        string;

    subjectDeclarationFactId:
        string;

    subjectContainerSymbol:
        string;

    inheritedSymbol:
        string;

    reason:
        ScientificSolidityUnresolvedInheritanceReason;

}
