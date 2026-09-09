import type {
    ScientificCompositionProvenance
} from "../scientific-cross-protocol-composition/ScientificCompositionCandidate.js";


/*
 * A shared protocol foundation is symmetric discovery evidence.
 *
 * participantAId / participantBId are stored in canonical lexical
 * order only for deterministic identity.
 *
 * They do NOT imply a directed consumer/provider relationship.
 */
export interface ScientificStructuralFoundationCompositionCandidate {

    candidateId:
        string;

    sourceCandidateId:
        string;

    participantAId:
        string;

    participantBId:
        string;

    directionality:
        "UNDIRECTED";

    mechanism:
        "SHARED_PROTOCOL_FOUNDATION";

    foundationProtocolId:
        string;

    evidenceIds:
        string[];

    provenance:
        ScientificCompositionProvenance[];

    /*
     * Discovery opens a scientific hypothesis only.
     *
     * No compatibility, runtime feasibility, SUPPORT or global
     * composition claim is introduced here.
     */
    evaluationStatus:
        "UNEVALUATED";

}


export interface ScientificStructuralFoundationCompositionCandidateResult {

    candidates:
        ScientificStructuralFoundationCompositionCandidate[];

    /*
     * Cross-protocol candidates produced by other mechanisms are
     * preserved as explicitly ignored by this narrow projector.
     *
     * They are not silently reclassified as structural-foundation
     * candidates.
     */
    ignoredCandidateIds:
        string[];

    errors:
        string[];

}