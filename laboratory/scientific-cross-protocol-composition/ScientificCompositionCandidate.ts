export type ScientificCompositionParticipantKind =
    | "PROTOCOL"
    | "SYMBOLIC_SUBJECT";


export interface ScientificCompositionParticipant {

    kind:
        ScientificCompositionParticipantKind;

    id:
        string;

}


export type ScientificCompositionMechanism =
    | "EXPLICIT_EXTENSION_FOR"
    | "SHARED_RECURRENT_CONCEPT"
    | "SHARED_PROTOCOL_FOUNDATION";


export type ScientificCompositionProvenanceKind =
    | "PROTOCOL_CONCEPT"
    | "PROTOCOL_RELATION"
    | "STRUCTURAL_PROTOCOL_RELATION";


export interface ScientificCompositionProvenance {

    kind:
        ScientificCompositionProvenanceKind;

    sourceId:
        string;

    sourceRevision?:
        string;

    evidenceId:
        string;

}


export interface ScientificCompositionCandidate {

    /*
     * Deterministic semantic identity of the discovered
     * composition candidate.
     *
     * Evidence accumulation does not alter candidate identity.
     */
    candidateId:
        string;

    participantA:
        ScientificCompositionParticipant;

    participantB:
        ScientificCompositionParticipant;

    /*
     * Observable mechanism that justified opening this
     * candidate for later scientific evaluation.
     */
    mechanism:
        ScientificCompositionMechanism;

    /*
     * Present only when recurrent semantic structure is the
     * discovery mechanism.
     */
    conceptId?:
        string;

    /*
     * Present only when two distinct protocols have independently
     * observed structural dependency on the same ERC-family
     * protocol.
     *
     * This is evidence for opening a hypothesis. It is not a
     * feasibility or compatibility conclusion.
     */
    foundationProtocolId?:
        string;

    /*
     * Protocol-local lexical capabilities supporting each side.
     *
     * Explicit documentary extension evidence and structural
     * foundation evidence may legitimately produce a candidate
     * before direct capability support is joined.
     */
    supportingCapabilityIdsA:
        string[];

    supportingCapabilityIdsB:
        string[];

    /*
     * Exact structured evidence identities that opened or
     * strengthened the candidate.
     */
    provenance:
        ScientificCompositionProvenance[];

    /*
     * Discovery is not feasibility validation.
     */
    evaluationStatus:
        "UNEVALUATED";

}
