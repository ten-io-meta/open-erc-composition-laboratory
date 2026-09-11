import type {
    ScientificCompositionCandidate
} from "./ScientificCompositionCandidate.js";


export interface ScientificCrossProtocolCompositionResult {

    /*
     * Structured composition candidates opened by scientific
     * evidence. They have not yet passed feasibility evaluation.
     */
    candidates:
        ScientificCompositionCandidate[];

    /*
     * Any upstream or boundary contamination causes discovery
     * to fail closed.
     */
    errors:
        string[];

}
