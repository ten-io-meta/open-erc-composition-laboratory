export type ScientificCompositionConstraintObservationVerdict =
    | "PRESERVED"
    | "VIOLATED";


export interface ScientificCompositionConstraintObservation {

    /*
     * Deterministic identity assigned by the execution producer.
     */
    observationId:
        string;

    /*
     * Exact composition candidate being evaluated.
     */
    candidateId:
        string;

    /*
     * Exact source constraint to which this runtime observation
     * is attributed.
     */
    constraintId:
        string;

    participantSide:
        | "A"
        | "B";

    /*
     * PRESERVED means the observed runtime behaviour is consistent
     * with the source constraint.
     *
     * VIOLATED means the observed runtime behaviour contradicts
     * the source constraint.
     *
     * Absence of a sufficient observation is represented by the
     * evaluator as UNEVALUATED rather than by an observation.
     */
    verdict:
        ScientificCompositionConstraintObservationVerdict;

    /*
     * Concrete execution evidence establishing this observation.
     *
     * Examples may include transaction hashes, runtime assertions,
     * revert observations, state reads, or other machine-produced
     * execution records.
     */
    evidence:
        string[];

}
