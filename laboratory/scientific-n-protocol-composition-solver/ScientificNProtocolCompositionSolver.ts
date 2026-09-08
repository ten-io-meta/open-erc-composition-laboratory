export type ScientificNProtocolCompositionConfigurationKind =
    | "FULL_SET"
    | "STRICT_SUBSET";


export type ScientificNProtocolCompositionConfigurationBlocker =
    | "UNRESOLVED_NEEDS"
    | "UNRESOLVED_OBJECTIVE_SUBJECTS";


export type ScientificNProtocolCompositionConfigurationReadiness =
    | "READY_FOR_GLOBAL_EVALUATION"
    | "BLOCKED";


export interface ScientificNProtocolCompositionSolverRelation {

    candidateId:
        string;

    candidateEvaluationEdgeId:
        string;

    functionalMatchId:
        string;

    sourceParticipantId:
        string;

    targetParticipantId:
        string;

    needId:
        string;

    contributionId:
        string;

    compatibilityAssessmentId:
        string;

    boundaryIds:
        string[];

    discoveryEvidenceIds:
        string[];

    compatibilityEvidenceIds:
        string[];

    /*
     * Solver configurations contain only functional candidate
     * relations whose candidate-boundary assessment is SUPPORT.
     *
     * SUPPORT remains candidate-scoped evidence only.
     */
    compatibilityPolarity:
        "SUPPORT";

}


export interface ScientificNProtocolCompositionSolverObjectiveCoverage {

    requiredSubject:
        string;

    status:
        | "COVERED"
        | "UNRESOLVED";

    providerParticipantIds:
        string[];

    contributionIds:
        string[];

}


export interface ScientificNProtocolCompositionConfiguration {

    configurationId:
        string;

    envelopeId:
        string;

    setId:
        string;

    objectiveId:
        string;

    kind:
        ScientificNProtocolCompositionConfigurationKind;

    participantIds:
        string[];

    relations:
        ScientificNProtocolCompositionSolverRelation[];

    selectedFunctionalCandidateIds:
        string[];

    fulfilledNeedIds:
        string[];

    unresolvedNeedIds:
        string[];

    objectiveCoverage:
        ScientificNProtocolCompositionSolverObjectiveCoverage[];

    unresolvedObjectiveSubjects:
        string[];

    knownBoundaryIds:
        string[];

    blockers:
        ScientificNProtocolCompositionConfigurationBlocker[];

    /*
     * READY means only that this candidate configuration can
     * proceed to the global-evidence layer.
     *
     * It does NOT mean global SUPPORT, compatibility, harmony,
     * runtime success, or demonstrated composition.
     */
    readiness:
        ScientificNProtocolCompositionConfigurationReadiness;

    globalEvaluationStatus:
        "UNEVALUATED";

}


export type ScientificNProtocolCompositionSolverResolutionStatus =
    | "READY_FULL_CONFIGURATION"
    | "FULL_CONFIGURATION_BLOCKED"
    | "PARTIAL_CONFIGURATION_ONLY"
    | "UNRESOLVED_CANDIDATE_TOPOLOGY";


export interface ScientificNProtocolCompositionSolutionStatistics {

    participants:
        number;

    supportedFunctionalCandidates:
        number;

    documentaryCandidates:
        number;

    challengedCandidates:
        number;

    inconclusiveCandidates:
        number;

    fullConfigurations:
        number;

    subsetConfigurations:
        number;

    readyConfigurations:
        number;

    blockedConfigurations:
        number;

}


export interface ScientificNProtocolCompositionSolution {

    solutionId:
        string;

    envelopeId:
        string;

    setId:
        string;

    objectiveId:
        string;

    participantIds:
        string[];

    fullConfigurations:
        ScientificNProtocolCompositionConfiguration[];

    subsetConfigurations:
        ScientificNProtocolCompositionConfiguration[];

    supportedFunctionalCandidateIds:
        string[];

    documentaryCandidateIds:
        string[];

    challengedCandidateIds:
        string[];

    inconclusiveCandidateIds:
        string[];

    statistics:
        ScientificNProtocolCompositionSolutionStatistics;

    resolutionStatus:
        ScientificNProtocolCompositionSolverResolutionStatus;

}


export interface ScientificNProtocolCompositionSolverResult {

    solutions:
        ScientificNProtocolCompositionSolution[];

    errors:
        string[];

}