import type {
    ScientificCompositionFrame
} from "./ScientificCompositionFrame.js";


export interface ScientificCompositionFrameResult {

    frame:
        ScientificCompositionFrame | null;

    errors:
        string[];

}
