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
    | "INTERFACE_DECLARATION"
    | "CONTRACT_DECLARATION"
    | "OTHER";


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
     * Exact source location inherited from the observation.
     */
    locator: ScientificSourceObservationLocator;

    /*
     * Exact source fragment that established this fact.
     */
    rawText: string;

}