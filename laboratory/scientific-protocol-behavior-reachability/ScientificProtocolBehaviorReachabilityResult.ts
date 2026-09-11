import type {
    ScientificProtocolBehaviorReachability
} from "./ScientificProtocolBehaviorReachability.js";


export interface ScientificProtocolBehaviorReachabilityResult {

    reachableBehaviors:
        ScientificProtocolBehaviorReachability[];

    unresolvedProtocolCallAttributionIds:
        string[];

    errors:
        string[];

}
