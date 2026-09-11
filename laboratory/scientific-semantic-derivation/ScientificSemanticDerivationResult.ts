import type {
    SemanticModel
} from "../semantic-discovery/SemanticModel.js";


export interface ScientificSemanticDerivationResult {

    /*
     * Research source from which the local semantic model
     * was derived.
     */
    sourceId:
        string;

    /*
     * Exact source revision when available.
     */
    sourceRevision?:
        string;

    /*
     * Local semantic model derived only from observed facts.
     */
    model:
        SemanticModel;

    /*
     * Fail-closed provenance or derivation errors.
     */
    errors:
        string[];

}
