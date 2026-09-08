import type {
    ScientificProtocolCompositionProfile
} from "./ScientificProtocolCompositionProfile.js";


export interface ScientificProtocolCompositionProfileResult {

    profile:
        ScientificProtocolCompositionProfile | null;

    errors:
        string[];

}
