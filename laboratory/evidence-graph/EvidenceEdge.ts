export interface EvidenceEdge {

    edgeId: string;

    /*
     * Research conclusion from which this evidence edge
     * was constructed.
     *
     * This is provenance identity only and allows the
     * evidence graph to be traced back deterministically
     * to the exact scientific conclusion that produced it.
     */
    sourceConclusionId: string;

    from: string;

    relation: string;

    to: string;

    confidence: number;

    sources: string[];

}