import type {
    ScientificSourceExternalCall
} from "./ScientificSourceExternalCall.js";
import type {
    ScientificSourceObservationLocator
} from "../scientific-source-observation/ScientificSourceObservationLocator.js";


export type ScientificSourceFactKind =
    | "FUNCTION_DECLARATION"
    | "MODIFIER_DECLARATION"
    | "EVENT_DECLARATION"
    | "STATE_VARIABLE_DECLARATION"
    | "REQUIRE_STATEMENT"
    | "REVERT_STATEMENT"
    | "EXTERNAL_CALL_EXPRESSION"
    | "INTERFACE_DECLARATION"
    | "CONTRACT_DECLARATION"
    | "OTHER";


export type ScientificSourceFactContainerKind =
    | "INTERFACE"
    | "CONTRACT";


export interface ScientificSourceFact {

    /*
     * Deterministic identity of the structural fact.
     */
    factId: string;

    /*
     * Observation from which this fact was extracted.
     */
    observationId: string;

    /*
     * Research source that ultimately produced the fact.
     */
    sourceId: string;

    /*
     * Exact source revision when one exists.
     *
     * For GitHub this should preserve the commit SHA.
     */
    sourceRevision?: string;

    /*
     * Structural category of the observed fact.
     *
     * This describes what exists in the source.
     * It must not encode a semantic composition conclusion.
     */
    kind: ScientificSourceFactKind;

    /*
     * Concrete symbol when one is directly observable.
     *
     * Examples:
     * function name,
     * modifier name,
     * event name,
     * state variable name.
     */
    symbol?: string;

    /*
     * Immediate Solidity structural container when directly
     * observable from lexical source scope.
     *
     * This records syntax only. It does not establish protocol
     * identity, ownership semantics, or composition meaning.
     */
    containerKind?:
        ScientificSourceFactContainerKind;

    /*
     * Exact observed interface or contract symbol containing
     * this fact.
     */
    containerSymbol?:
        string;

    /*
     * Exact source location inherited from the observation.
     */
    /*
     * Structured Solidity external-call syntax is present only
     * for EXTERNAL_CALL_EXPRESSION facts.
     */
    externalCall?: ScientificSourceExternalCall;

    locator: ScientificSourceObservationLocator;

    /*
     * Exact source fragment that established this fact.
     */
    rawText: string;

}
