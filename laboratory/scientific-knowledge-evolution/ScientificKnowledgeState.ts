export type ScientificKnowledgeStatus =
    | "EMERGING"
    | "SUPPORTED"
    | "ESTABLISHED"
    | "CANONICAL"
    | "CHALLENGED"
    | "REJECTED"
    | "ARCHIVED";

export type ScientificKnowledgeMaturity =
    | "NEW"
    | "EARLY"
    | "GROWING"
    | "MATURE"
    | "FOUNDATIONAL";

export type ScientificConfidenceTrend =
    | "INSUFFICIENT_DATA"
    | "GROWING"
    | "DECLINING"
    | "STABLE"
    | "VOLATILE";

export type ScientificEvolutionVelocity =
    | "INSUFFICIENT_DATA"
    | "RAPID"
    | "NORMAL"
    | "SLOW"
    | "STALLED";

export interface ScientificKnowledgeState {

    knowledgeId: string;

    sourceConclusionId: string;

    sourcePatternId: string;

    sourcePatternRelation: string;



        /*
     * Original scientific object that originated this
     * knowledge state.
     *
     * Examples:
     *
     * DISCOVERY:DISCOVERY-00003
     * GAP:GAP-00021
     * THEORY:THEORY-00004
     */
    originTargetId: string;

    statement: string;

    status:
        ScientificKnowledgeStatus;

    confidence: number;

    independentSources: number;

    campaignsObserved: number;

    consecutiveStableCampaigns: number;

    contradictionCount: number;

        /*
     * Evidence supporting the current knowledge state.
     * These identifiers preserve scientific traceability
     * across campaigns.
     */

    supportingEvidenceIds:
        string[];

    contradictoryEvidenceIds:
        string[];

        supportingEvidenceIdentities:
        string[];

    contradictoryEvidenceIdentities:
        string[];

    /*
     * Repository provenance of execution evidence that has
     * already been assimilated into this knowledge state.
     *
     * These collections record where supporting and
     * challenging execution evidence originated.
     *
     * Repository diversity is observable provenance only.
     * It must not by itself increment independentSources,
     * confidence, maturity or scientific status.
     */
    supportingEvidenceRepositories:
        string[];

    contradictoryEvidenceRepositories:
        string[];

    validationStatus:
        | "VALIDATED"
        | "CHALLENGED"
        | "REJECTED"
        | "INCONCLUSIVE"
        | "NOT_EVALUATED";

    /*
     * Temporal scientific state
     */

    maturityLevel:
        ScientificKnowledgeMaturity;

    confidenceTrend:
        ScientificConfidenceTrend;

    evolutionVelocity:
        ScientificEvolutionVelocity;

    confidenceHistory:
        number[];

    sourceHistory:
        number[];

    statusHistory:
        ScientificKnowledgeStatus[];

    trajectory:
        string[];

    /*
     * Scientific lifecycle timestamps
     */

    firstObservedAt: string;

    lastObservedAt: string;

    lastStatusChangeAt:
        string | null;

    lastPromotionAt:
        string | null;

    lastDegradationAt:
        string | null;

}