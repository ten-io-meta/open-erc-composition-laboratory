export type ScientificCompositionConstraintObservationVerdict =
    | "PRESERVED"
    | "VIOLATED";

export interface ScientificCompositionConstraintObservation {
    observationId: string;
    candidateId: string;
    constraintId: string;
    participantSide: "A" | "B";
    verdict: ScientificCompositionConstraintObservationVerdict;
    evidence: string[];

    /**
     * Required for behavioral invariants. Decimal strings are evaluated
     * with BigInt; no truth value is accepted without measured operands.
     */
    numericMeasurements?: Record<string, string>;
    sourceRevision?: string;
    transactionHash?: string;
}
