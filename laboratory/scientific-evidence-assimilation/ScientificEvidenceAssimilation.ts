export type ScientificEvidenceAssimilationAction =
    | "STRENGTHEN"
    | "CHALLENGE"
    | "HOLD";

export type ScientificEvidenceReplicationClassification =
    | "DUPLICATE"
    | "FIRST_REPOSITORY_OBSERVATION"
    | "SAME_REPOSITORY_REPLICATION"
    | "CROSS_REPOSITORY_EVIDENCE"
    | "SOURCE_PROVENANCE_UNKNOWN"
    | "NOT_APPLICABLE";

export interface ScientificEvidenceAssimilation {

    assimilationId: string;

    knowledgeId: string;

    evidenceId: string;

       evidenceIdentity: string;

    /*
     * Concrete repository associated with the execution
     * evidence being assimilated, when one repository was
     * operationally resolved.
     *
     * This is execution provenance only. Repeated evidence
     * from the same repository may represent replication,
     * but repository identity must not by itself change
     * independentSources or confidence.
     */
    repository:
        string | null;

       action: ScientificEvidenceAssimilationAction;

    /*
     * Replication/provenance classification of this
     * evidence relative to the knowledge state as it
     * existed before this assimilation decision.
     *
     * CROSS_REPOSITORY_EVIDENCE records repository
     * diversity only. It does not establish scientific
     * source independence.
     */
    replicationClassification:
        ScientificEvidenceReplicationClassification;

    assimilated: boolean;

    explanation: string;

}