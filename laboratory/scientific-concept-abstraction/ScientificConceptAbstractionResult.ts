import type {
    ScientificConcept
} from "./ScientificConcept.js";


export interface ScientificConceptAbstractionResult {

    /*
     * Research source from which the lexical model originated.
     */
    sourceId:
        string;

    /*
     * Exact source revision when available.
     */
    sourceRevision?:
        string;

    /*
     * Identity of the local semantic model being abstracted.
     */
    sourceModelId:
        string;

    /*
     * Recurrent observed lexical concepts.
     */
    concepts:
        ScientificConcept[];

    /*
     * Fail-closed upstream or boundary errors.
     */
    errors:
        string[];

}
