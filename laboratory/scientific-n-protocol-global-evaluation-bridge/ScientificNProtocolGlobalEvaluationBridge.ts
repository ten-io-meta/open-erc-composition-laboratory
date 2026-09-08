import type {
    ScientificCompositionGraph
} from "../scientific-composition-graph/ScientificCompositionGraph.js";


export interface ScientificNProtocolGlobalEvaluationTarget {

    targetId:
        string;

    configurationId:
        string;

    envelopeId:
        string;

    setId:
        string;

    objectiveId:
        string;

    /*
     * Exact functional configuration translated into the graph
     * contract consumed by ScientificCompositionGlobalEvaluationEngine.
     *
     * The graph itself remains globally INCONCLUSIVE.
     */
    graph:
        ScientificCompositionGraph;

    status:
        "READY_FOR_GLOBAL_EVALUATION";

}


export interface ScientificNProtocolGlobalEvaluationBridgeResult {

    targets:
        ScientificNProtocolGlobalEvaluationTarget[];

    /*
     * Solver configurations which exist but are not ready for the
     * global-evidence layer are preserved explicitly.
     */
    blockedConfigurationIds:
        string[];

    errors:
        string[];

}