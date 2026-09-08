import type {
    ScientificProtocolRelationKind
} from "../scientific-protocol-relation-evidence/ScientificProtocolRelationEvidence.js";


/*
 * Evidence-backed documentary composition candidate.
 *
 * This is not:
 *
 * - a functional Need -> Contribution match,
 * - a compatibility result,
 * - a runtime interaction,
 * - a composition proof.
 *
 * It records only that explicit documentary evidence associates
 * two participating protocols under a preserved relation kind.
 */
export interface ScientificDocumentaryCompositionCandidate {

    candidateId:
        string;

    subjectParticipantId:
        string;

    objectParticipantId:
        string;

    relation:
        ScientificProtocolRelationKind;

    /*
     * One candidate may aggregate multiple independent documentary
     * evidence occurrences supporting the exact same directional
     * relation.
     */
    evidenceIds:
        string[];

    evaluationStatus:
        "UNEVALUATED";

}