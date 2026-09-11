import type {
    ScientificCompositionGlobalEvaluationResult
} from "../scientific-composition-global-evaluation/ScientificCompositionGlobalAssessment.js";


export interface ScientificNProtocolGlobalEvidenceBinding {

    bindingId:
        string;

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

    graphId:
        string;

    /*
     * Exact observations bound to this target graph.
     *
     * No observation from another graph is included.
     */
    observationIds:
        string[];

    /*
     * Runs are observed identities only.
     *
     * The binding layer never manufactures a runId.
     */
    runIds:
        string[];

    /*
     * Existing scientific global evaluator result.
     *
     * This layer does not independently determine SUPPORT,
     * CHALLENGE or INCONCLUSIVE.
     */
    evaluation:
        ScientificCompositionGlobalEvaluationResult;

    status:
        "EVALUATED";

}


export interface ScientificNProtocolGlobalEvidenceBindingResult {

    bindings:
        ScientificNProtocolGlobalEvidenceBinding[];

    errors:
        string[];

}