import type {
    ScientificCompositionCandidate
} from "./ScientificCompositionCandidate.js";


export interface ScientificCompositionCandidateSetResult {

    candidates:
        ScientificCompositionCandidate[];

    errors:
        string[];

}