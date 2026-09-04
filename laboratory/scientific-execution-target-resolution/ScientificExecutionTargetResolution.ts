import {
    ScientificPolarityTrace
} from "./ScientificPolarityTrace.js";

import type {
    ScientificExecutableTargetIdentity
} from "./ScientificExecutableTargetIdentity.js";


export type ScientificExecutionTargetKind =
    | "TEST"
    | "INVARIANT"
    | "STATIC_ANALYSIS"
    | "UNRESOLVED";


export type ScientificExecutionTargetResolutionStatus =
    | "RESOLVED"
    | "UNRESOLVED";


export interface ScientificExecutionTargetResolution {

    experimentId: string;

    executionTaskId: string;

    targetType: string;

    targetId: string;

    repository: string | null;

    /*
     * Exact executable target selected by the scientific
     * target resolver.
     *
     * This is execution provenance. It preserves the
     * concrete repository/file/selector identity that the
     * resolver actually chose and must not be interpreted
     * as scientific source independence.
     */
    selectedExecutableTarget:
        ScientificExecutableTargetIdentity | null;

    executionKind:
        ScientificExecutionTargetKind;

    testSelector: string | null;

    invariantSelector: string | null;

    staticAnalysisSelector: string | null;

    confidence: number;

    resolutionStatus:
        ScientificExecutionTargetResolutionStatus;

    scientificPolarity:
        | "SUPPORT"
        | "CHALLENGE"
        | "NEUTRAL";

    polarityTrace:
        ScientificPolarityTrace | null;

    polarityConfidence:
        number | null;

    resolutionReasons: string[];

}