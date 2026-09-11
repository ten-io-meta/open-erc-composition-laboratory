import type {
    ScientificCompositionGlobalPolarity
} from "../scientific-composition-global-evaluation/ScientificCompositionGlobalAssessment.js";


export type ScientificCompositionHarmonyStatus =
    | "FULL"
    | "PARTIAL"
    | "INCONCLUSIVE"
    | "CHALLENGED";


export interface ScientificCompositionHarmonyConfigurationEvidence {

    configurationId:
        string;

    bindingId:
        string;

    targetId:
        string;

    graphId:
        string;

    globalAssessmentId:
        string;

    participantIds:
        string[];

    scientificPolarity:
        ScientificCompositionGlobalPolarity;

    observationIds:
        string[];

    runIds:
        string[];

    supportingRunId?:
        string;

}


export interface ScientificCompositionHarmonySupportedSubset {

    configurationId:
        string;

    bindingId:
        string;

    targetId:
        string;

    graphId:
        string;

    globalAssessmentId:
        string;

    participantIds:
        string[];

    observationIds:
        string[];

    runIds:
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
     * at least one exact FULL_SET solver configuration has
     * GLOBAL SUPPORT from its exact global evidence binding.
     *
     * PARTIAL:
     * no full configuration is globally supported, but at least
     * one STRICT_SUBSET solver configuration has GLOBAL SUPPORT.
     *
     * CHALLENGED:
     * full solver configurations exist, every one is globally
     * evaluable, and every exact full configuration is CHALLENGE.
     *
     * A blocked/unresolved full alternative prevents CHALLENGED
     * from being claimed because that alternative is not disproved.
     *
     * INCONCLUSIVE:
     * none of the above can currently be established.
     */
    harmonyStatus:
        ScientificCompositionHarmonyStatus;

    /*
     * Every exact ready FULL_SET configuration evaluation.
     *
     * Different solver configurations remain independent, so a
     * challenged alternative cannot poison a supported full route.
     */
    fullConfigurationEvidence:
        ScientificCompositionHarmonyConfigurationEvidence[];

    /*
     * Strict solver subsets with actual GLOBAL SUPPORT.
     */
    supportedSubsets:
        ScientificCompositionHarmonySupportedSubset[];

    /*
     * Configurations blocked before global evaluation remain visible.
     */
    blockedFullConfigurationIds:
        string[];

    blockedSubsetConfigurationIds:
        string[];

    /*
     * Local envelope state remains visualization context only.
     * It never directly establishes FULL/PARTIAL/CHALLENGED.
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
        "EXACT_SOLVER_CONFIGURATION_GLOBAL_EVIDENCE";

}


export interface ScientificCompositionHarmonyResult {

    assessments:
        ScientificCompositionHarmonyAssessment[];

    errors:
        string[];

}