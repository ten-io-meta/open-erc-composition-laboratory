import type {
    ScientificCandidateBoundaryRelevanceAssessment
} from "../scientific-candidate-boundary-relevance/ScientificCandidateBoundaryRelevanceAssessment.js";

import type {
    ScientificCompositionEnvelope
} from "../scientific-composition-envelope/ScientificCompositionEnvelope.js";

import type {
    ScientificCompositionHarmonyAssessment
} from "../scientific-composition-harmony/ScientificCompositionHarmonyAssessment.js";

import type {
    ScientificCompositionValueAssessment
} from "../scientific-composition-value/ScientificCompositionValueAssessment.js";

export interface ScientificPairProjection {

    projectionId: string;

    candidateId: string;

    sourceParticipantId: string;

    targetParticipantId: string;

    candidateKind: string;

    documentaryRelation: string | null;

    foundationProtocolId: string | null;

    structuralFoundationDirectionality:
        "UNDIRECTED" | null;

    discoveryEvidenceCount: number;

    compatibility: {

        assessmentId: string;

        polarity: string;

        evidenceCount: number;

        boundaryCoverage: unknown;

        evaluationStatus: "EVALUATED";

    };

    boundaries: {

        knownProtocolBoundaries: number;

        envelopeKnownBoundaries: number;

        relevant: number;

        outOfScope: number;

        unresolved: number;

        preservedRegions: number;

        violatedRegions: number;

        unevaluatedRegions: number;

    };

    envelope: {

        envelopeId: string;

        setId: string;

        objectiveId: string;

        participantIds: string[];

        assemblyStatus: "ASSEMBLED";

    };

    harmony: {

        status: string;

        globallySupportedFullConfigurations: number;

        globallySupportedSubsets: number;

    } | null;

    compositionValue: {

        status: string;

        findingCount: number;

        decisionAuthority:
            "UPSTREAM_HARMONY_AND_SOLVER_STATE_ONLY";

    } | null;

}

export interface ScientificPairProjectionCatalog {

    schemaVersion:
        "OECL_SCIENTIFIC_PAIR_CATALOG_V1";

    scientificScope:
        "MATERIALIZED_DETERMINISTIC_PAIR_EVALUATION";

    projections:
        ScientificPairProjection[];

}

export interface ScientificPairProjectionCatalogInput {

    relevanceAssessments:
        ScientificCandidateBoundaryRelevanceAssessment[];

    envelopes:
        ScientificCompositionEnvelope[];

    harmonyAssessments:
        ScientificCompositionHarmonyAssessment[];

    valueAssessments:
        ScientificCompositionValueAssessment[];

}

function uniqueBoundaryCount(
    assessments:
        ScientificCandidateBoundaryRelevanceAssessment[]
): number {

    return new Set(
        assessments.map(
            assessment =>
                assessment.boundaryId
        )
    ).size;

}

export function buildScientificPairProjectionCatalog(
    input:
        ScientificPairProjectionCatalogInput
): ScientificPairProjectionCatalog {

    const projections =
        input.envelopes.flatMap(
            envelope =>
                envelope.relations.map(
                    relation => {

                        const relevance =
                            input.relevanceAssessments.filter(
                                assessment =>
                                    assessment.candidateId ===
                                    relation.candidateId
                            );

                        const relevant =
                            relevance.filter(
                                assessment =>
                                    assessment.relevance ===
                                    "RELEVANT"
                            );

                        const outOfScope =
                            relevance.filter(
                                assessment =>
                                    assessment.relevance ===
                                    "OUT_OF_SCOPE"
                            );

                        const unresolved =
                            relevance.filter(
                                assessment =>
                                    assessment.relevance ===
                                    "UNRESOLVED"
                            );

                        const harmony =
                            input.harmonyAssessments.find(
                                assessment =>
                                    assessment.envelopeId ===
                                    envelope.envelopeId
                            ) ?? null;

                        const value =
                            input.valueAssessments.find(
                                assessment =>
                                    assessment.envelopeId ===
                                    envelope.envelopeId
                            ) ?? null;

                        return {

                            projectionId:
                                `${relation.candidateId}::${envelope.envelopeId}`,

                            candidateId:
                                relation.candidateId,

                            sourceParticipantId:
                                relation.sourceParticipantId,

                            targetParticipantId:
                                relation.targetParticipantId,

                            candidateKind:
                                relation.candidateKind,

                            documentaryRelation:
                                relation.documentaryRelation ?? null,

                            foundationProtocolId:
                                relation.foundationProtocolId ?? null,

                            structuralFoundationDirectionality:
                                relation.structuralFoundationDirectionality ?? null,

                            discoveryEvidenceCount:
                                relation.discoveryEvidenceIds.length,

                            compatibility: {

                                assessmentId:
                                    relation.compatibilityAssessmentId,

                                polarity:
                                    relation.compatibilityPolarity,

                                evidenceCount:
                                    relation.compatibilityEvidenceIds.length,

                                boundaryCoverage:
                                    relation.boundaryCoverage,

                                evaluationStatus:
                                    relation.evaluationStatus

                            },

                            boundaries: {

                                knownProtocolBoundaries:
                                    uniqueBoundaryCount(
                                        relevance
                                    ),

                                envelopeKnownBoundaries:
                                    envelope.statistics.knownBoundaries,

                                relevant:
                                    uniqueBoundaryCount(
                                        relevant
                                    ),

                                outOfScope:
                                    uniqueBoundaryCount(
                                        outOfScope
                                    ),

                                unresolved:
                                    uniqueBoundaryCount(
                                        unresolved
                                    ),

                                preservedRegions:
                                    envelope.statistics
                                        .preservedBoundaryRegions,

                                violatedRegions:
                                    envelope.statistics
                                        .violatedBoundaryRegions,

                                unevaluatedRegions:
                                    envelope.statistics
                                        .unevaluatedBoundaryRegions

                            },

                            envelope: {

                                envelopeId:
                                    envelope.envelopeId,

                                setId:
                                    envelope.setId,

                                objectiveId:
                                    envelope.objectiveId,

                                participantIds:
                                    envelope.participantIds,

                                assemblyStatus:
                                    envelope.assemblyStatus

                            },

                            harmony:
                                harmony === null
                                    ? null
                                    : {

                                        status:
                                            harmony.harmonyStatus,

                                        globallySupportedFullConfigurations:
                                            harmony
                                                .fullConfigurationEvidence
                                                .filter(
                                                    evidence =>
                                                        String(
                                                            evidence.scientificPolarity
                                                        ) === "SUPPORT"
                                                )
                                                .length,

                                        globallySupportedSubsets:
                                            harmony.supportedSubsets.length

                                    },

                            compositionValue:
                                value === null
                                    ? null
                                    : {

                                        status:
                                            value.valueEvaluationStatus,

                                        findingCount:
                                            value.findings.length,

                                        decisionAuthority:
                                            value.decisionAuthority

                                    }

                        } satisfies ScientificPairProjection;

                    }
                )
        );

    return {

        schemaVersion:
            "OECL_SCIENTIFIC_PAIR_CATALOG_V1",

        scientificScope:
            "MATERIALIZED_DETERMINISTIC_PAIR_EVALUATION",

        projections

    };

}
