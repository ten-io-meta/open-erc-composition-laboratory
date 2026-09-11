import type {
    ScientificSourceObservationLocator
} from "./ScientificSourceObservationLocator.js";

export type ScientificSourceObservationKind =
    | "DOCUMENTATION"
    | "CONTRACT_SOURCE"
    | "TEST_SOURCE"
    | "CONFIGURATION"
    | "EXECUTABLE_TARGET"
    | "INVARIANT_CANDIDATE"
    | "OTHER";

export interface ScientificSourceObservation {

    /*
     * Deterministic identity assigned to this concrete observation.
     */
    observationId: string;

    /*
     * Research source that produced the observation.
     */
    sourceId: string;

    /*
     * Source family such as GitHub, Magicians, specification,
     * paper, audit, or another future adapter.
     *
     * This is provenance, not scientific independence.
     */
    sourceType: string;

    /*
     * Exact source revision when one exists.
     *
     * For GitHub this should carry the repository commit SHA.
     */
    sourceRevision?: string;

    /*
     * Structural classification of the observed material.
     *
     * This must not encode a cross-protocol semantic conclusion.
     */
    kind: ScientificSourceObservationKind;

    /*
     * Exact location from which the observation was obtained.
     */
    locator: ScientificSourceObservationLocator;

    /*
     * Source material preserved before semantic reasoning.
     *
     * No protocol-pair, capability-pair, composition relation,
     * or composition confidence is established at this layer.
     */
    rawText: string;

}