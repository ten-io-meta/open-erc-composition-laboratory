import type {
    ScientificCompositionParticipantKind
} from "../scientific-cross-protocol-composition/ScientificCompositionCandidate.js";

import type {
    ScientificSourceFact
} from "../scientific-source-fact/ScientificSourceFact.js";


export type ScientificCompositionConstraintBasis =
    "SOLIDITY_REQUIRE_STATEMENT";


export interface ScientificCompositionConstraint {

    constraintId: string;

    candidateId: string;

    participantSide:
        | "A"
        | "B";

    participantKind:
        ScientificCompositionParticipantKind;

    participantId: string;

    sourceId: string;

    sourceRevision?: string;

    factId: string;

    basis:
        ScientificCompositionConstraintBasis;

    containerKind:
        | "INTERFACE"
        | "CONTRACT";

    containerSymbol: string;

    locator:
        ScientificSourceFact["locator"];

    rawText: string;

}
