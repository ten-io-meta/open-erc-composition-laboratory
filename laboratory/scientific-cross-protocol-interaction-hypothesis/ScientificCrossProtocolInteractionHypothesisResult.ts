import type {
    ScientificCrossProtocolInteractionHypothesis
} from "./ScientificCrossProtocolInteractionHypothesis.js";


export interface ScientificCrossProtocolInteractionHypothesisResult {

    hypotheses:
        ScientificCrossProtocolInteractionHypothesis[];

    candidateIdsWithoutHypotheses:
        string[];

    errors:
        string[];

}
