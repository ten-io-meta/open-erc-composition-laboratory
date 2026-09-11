export type ScientificTheGraphInspectionPlanSelectionBasis =
    | "TRIAGE_PRIORITY"
    | "MOST_SELECTIVE_PROFILE_TERM_FALLBACK";


export interface ScientificTheGraphInspectionPlanItem {

    planItemId:
        string;

    protocolId:
        string;

    profileId:
        string;

    sourceId:
        string;

    sourceRevision?:
        string;

    triageCandidateId:
        string;

    subgraphId:
        string;

    ipfsHash:
        string;

    providerMode:
        "LIVE" | "FIXTURE";

    selectionBasis:
        ScientificTheGraphInspectionPlanSelectionBasis;

    supportingSearchId:
        string;

    supportingTermId:
        string;

    supportingTerm:
        string;

    /*
     * Provider result cardinality and rank are used only to
     * bound inspection cost when no stronger triage candidate
     * exists.
     *
     * They are not scientific confidence.
     */
    providerSearchTotal:
        number;

    providerRank:
        number;

    status:
        "PLANNED_FOR_EXACT_DEPLOYMENT_INSPECTION";

    nextAction:
        "INSPECT_EXACT_DEPLOYMENT";

}


export interface ScientificTheGraphInspectionPlanResult {

    items:
        ScientificTheGraphInspectionPlanItem[];

    errors:
        string[];

}