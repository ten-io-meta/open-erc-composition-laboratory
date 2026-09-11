export interface SourceIndependenceSetAssessment {

    /**
     * All scientific source identities considered.
     */
    sourceIds:
        string[];

    /**
     * Source identities whose mutual independence has been
     * explicitly established.
     *
     * Every pair inside this set must have an INDEPENDENT
     * pair assessment.
     */
    establishedIndependentSourceIds:
        string[];

    /**
     * Number of mutually independent scientific sources
     * explicitly established.
     *
     * This value must never be derived from sourceIds.length,
     * repository count, evidence count, experiment count or
     * execution count.
     */
    establishedIndependentSources:
        number;

    /**
     * True when every distinct source in the input set has
     * mutually established independence.
     */
    fullyEstablished:
        boolean;

    /**
     * True when unresolved pair relationships prevent full
     * independence from being established.
     */
    hasInconclusiveRelationships:
        boolean;

}