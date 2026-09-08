import type {
    ScientificCompositionGlobalPolarity
} from "../scientific-composition-global-evaluation/ScientificCompositionGlobalAssessment.js";


export type ScientificCompositionHarmonyStatus =
    | "FULL"
    | "PARTIAL"
    | "INCONCLUSIVE"
    | "CHALLENGED";


export interface ScientificCompositionHarmonyConfigurationEvidence {

    graphId:
        string;

    globalAssessmentId:
        string;

    participantIds:
        string[];

    scientificPolarity:
        ScientificCompositionGlobalPolarity;

    supportingRunId?:
        string;

}


export interface ScientificCompositionHarmonySupportedSubset {

    graphId:
        string;

    globalAssessmentId:
        string;

    participantIds:
        string[];

    supportingRunId:
        string;

}


export interface ScientificCompositionHarmonyAssessment {

    harmonyAssessmentId:
        string;

    envelopeId:
        string;

    setId:
        string;

    objectiveId:
        string;

    participantIds:
        string[];

    /*
     * FULL:
     * at least one exact full-participant configuration has
     * GLOBAL SUPPORT from one complete scientific run.
     *
     * PARTIAL:
     * no full configuration is globally supported, but at least
     * one strict participant subset is globally supported.
     *
     * CHALLENGED:
     * exact full configurations exist and every one of them is
     * globally CHALLENGED.
     *
     * INCONCLUSIVE:
     * none of the above can currently be established.
     */
    harmonyStatus:
        ScientificCompositionHarmonyStatus;

    /*
     * Every available exact full-participant global evaluation.
     * Multiple configurations are preserved independently so a
     * challenged alternative cannot poison a supported route.
     */
    fullConfigurationEvidence:
        ScientificCompositionHarmonyConfigurationEvidence[];

    /*
     * Proper participant subsets which have actual GLOBAL SUPPORT.
     */
    supportedSubsets:
        ScientificCompositionHarmonySupportedSubset[];

    /*
     * Local envelope state is preserved for visualization only.
     * It does not directly determine FULL.
     */
    supportedCandidateIds:
        string[];

    challengedCandidateIds:
        string[];

    inconclusiveCandidateIds:
        string[];

    preservedBoundaryRegionIds:
        string[];

    violatedBoundaryRegionIds:
        string[];

    unevaluatedBoundaryRegionIds:
        string[];

    evidenceBasis:
        "EXACT_GLOBAL_CONFIGURATION_EVIDENCE";

}


export interface ScientificCompositionHarmonyResult {

    assessments:
        ScientificCompositionHarmonyAssessment[];

    errors:
        string[];

}