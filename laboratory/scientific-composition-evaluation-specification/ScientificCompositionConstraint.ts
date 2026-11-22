import type {
    ScientificCompositionParticipantKind
} from "../scientific-cross-protocol-composition/ScientificCompositionCandidate.js";

import type {
    ScientificSourceFact
} from "../scientific-source-fact/ScientificSourceFact.js";

/**
 * Behavioral constraints represent a testable relation between two measured
 * unsigned integers. A source fact by itself is never runtime evidence.
 */
export interface ScientificBehavioralInvariantPredicate {
    kind: "UNSIGNED_INTEGER_RELATION";
    leftMetric: string;
    operator: "EQ" | "LTE" | "GTE";
    rightMetric: string;
}

export type ScientificCompositionConstraintBasis =
    | "SOLIDITY_REQUIRE_STATEMENT"
    | "SOURCE_DERIVED_BEHAVIORAL_INVARIANT";

export interface ScientificCompositionConstraint {

    constraintId: string;
    candidateId: string;

    participantSide: "A" | "B";
    participantKind: ScientificCompositionParticipantKind;
    participantId: string;
    sourceId: string;
    sourceRevision?: string;
    factId: string;
    basis: ScientificCompositionConstraintBasis;
    containerKind: "INTERFACE" | "CONTRACT";
    containerSymbol: string;
    locator: ScientificSourceFact["locator"];
    rawText: string;

    /**
     * Only for SOURCE_DERIVED_BEHAVIORAL_INVARIANT.
     * The declaration is immutable experiment design; the observation must
     * provide concrete values, source revision and shared EVM tx identity.
     */
    behavioralPredicate?: ScientificBehavioralInvariantPredicate;
    /**
     * Optional supporting inherited dependency identities. This is source
     * lineage, not a claim that dependency behavior was formally proven.
     */
    dependencySources?: {
        repository: string;
        revision: string;
        filePath: string;
        sourceSha256: string;
    }[];
}
