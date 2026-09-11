import type {
    ScientificCompositionContribution
} from "../scientific-composition-frame/ScientificCompositionContribution.js";

import type {
    ScientificCompositionBoundary
} from "../scientific-composition-frame/ScientificCompositionBoundary.js";

import type {
    ScientificCompositionNeed
} from "../scientific-composition-frame/ScientificCompositionNeed.js";


export interface ScientificProtocolCompositionProfile {

    profileId: string;

    protocolId: string;

    sourceId: string;

    sourceRevision?: string;

    attributedContainerSymbols: string[];

    contributions:
        ScientificCompositionContribution[];

    boundaries:
        ScientificCompositionBoundary[];

    needs:
        ScientificCompositionNeed[];

}
