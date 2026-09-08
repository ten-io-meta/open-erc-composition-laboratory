import type {
    ScientificCompositionFrameParticipant
} from "./ScientificCompositionFrameParticipant.js";

import type {
    ScientificCompositionContribution
} from "./ScientificCompositionContribution.js";

import type {
    ScientificCompositionBoundary
} from "./ScientificCompositionBoundary.js";

import type {
    ScientificCompositionNeed
} from "./ScientificCompositionNeed.js";


export interface ScientificCompositionFrameObjective {

    objectiveId:
        string;

    description:
        string;

    requiredSubjects:
        string[];

}


export interface ScientificCompositionFrame {

    frameId:
        string;

    objective:
        ScientificCompositionFrameObjective;

    participants:
        ScientificCompositionFrameParticipant[];

    contributions:
        ScientificCompositionContribution[];

    boundaries:
        ScientificCompositionBoundary[];

    needs:
        ScientificCompositionNeed[];

    /*
     * No global compatibility claim is made merely because
     * participants coexist in the frame.
     */
    evaluationStatus:
        "UNEVALUATED";

}
