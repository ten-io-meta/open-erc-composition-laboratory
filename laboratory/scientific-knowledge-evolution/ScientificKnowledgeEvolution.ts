import type {
    ScientificKnowledgeStatus
} from "./ScientificKnowledgeState.js";

export interface ScientificKnowledgeEvolution {

    evolutionId: string;

    knowledgeId: string;

    sourceConclusionId: string;

    sourcePatternId: string;

    sourcePatternRelation: string;

    originTargetId: string;

    statement: string;

    evolutionType:
        | "DISCOVERED"
        | "PROMOTED"
        | "DEGRADED"
        | "STABILIZED"
        | "CHALLENGED"
        | "REFUTED"
        | "RECOVERED"
        | "UNCHANGED"
        | "ARCHIVED";

    previousStatus:
        | ScientificKnowledgeStatus
        | null;

    currentStatus:
        ScientificKnowledgeStatus;

    confidenceBefore: number;

    confidenceAfter: number;

    confidenceDelta: number;

    sourcesBefore: number;

    sourcesAfter: number;

       sourceDelta: number;

    campaignsObserved: number;

    /*
     * Scientific evidence pressure observed during this
     * knowledge transition.
     *
     * These fields describe evidence provenance and polarity.
     * They do not by themselves imply a confidence or status
     * change.
     */
    scientificEvidencePressure?: {

        strengthened: number;

        challenged: number;

        held: number;

        newlyAssimilated: number;

        supportingEvidenceIds: string[];

        contradictoryEvidenceIds: string[];

    };
/*
 * Epistemic transition produced by newly assimilated
 * execution evidence.
 *
 * This transition is deliberately separate from
 * evolutionType and ScientificKnowledgeStatus.
 *
 * A newly assimilated SUPPORT or CHALLENGE records
 * directional scientific pressure without inventing
 * confidence, source-independence or status changes.
 */
scientificEvidenceTransition?:
    | "STRENGTHENED"
    | "CHALLENGED"
    | "CONFLICTED"
    | "HELD"
    | "UNCHANGED";
    /*
 * Execution-evidence replication/provenance summary.
 *
 * This records observable repository-level provenance
 * only. Cross-repository evidence must not be interpreted
 * as scientific source independence and must not directly
 * change confidence, maturity or knowledge status.
 */
scientificReplicationPressure?: {
    duplicates: number;
    firstRepositoryObservations: number;
    sameRepositoryReplications: number;
    crossRepositoryEvidence: number;
    sourceProvenanceUnknown: number;
    notApplicable: number;
    repositoriesObserved: string[];
};
    explanation: string;

}