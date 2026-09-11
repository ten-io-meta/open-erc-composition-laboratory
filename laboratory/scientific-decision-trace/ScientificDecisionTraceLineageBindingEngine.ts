import type {
    ScientificDecisionTraceResult
} from "./ScientificDecisionTrace.js";

import type {
    ScientificEvidenceLineageReference,
    ScientificEvidenceLineageResult
} from "../scientific-evidence-lineage/ScientificEvidenceLineage.js";


export interface ScientificDecisionTraceLineageBindingResult {

    trace:
        ScientificDecisionTraceResult | null;

    lineage:
        ScientificEvidenceLineageResult;

    unresolvedEvidenceRefs:
        ScientificEvidenceLineageReference[];

    errors:
        string[];

}


function encode(
    parts:
        string[]
): string {

    return parts
        .map(
            part =>
                `${part.length}:${part}`
        )
        .join("|");

}


function key(
    sourceId:
        string,
    sourceRevision:
        string | undefined,
    evidenceId:
        string
): string {

    return encode([
        sourceId,
        sourceRevision ?? "UNVERSIONED",
        evidenceId
    ]);

}


function unique(
    values:
        string[]
): string[] {

    return [
        ...new Set(
            values
        )
    ].sort();

}


export class ScientificDecisionTraceLineageBindingEngine {

    bind(
        trace:
            ScientificDecisionTraceResult,
        lineage:
            ScientificEvidenceLineageResult
    ): ScientificDecisionTraceLineageBindingResult {

        const errors:
            string[] =
            [];


        if (
            trace.errors.length >
            0
        ) {

            errors.push(
                "Cannot bind lineage to a Decision Trace containing errors."
            );

        }


        if (
            lineage.errors.length >
            0
        ) {

            errors.push(
                "Cannot bind an evidence lineage containing errors."
            );

        }


        if (
            errors.length >
            0
        ) {

            return {

                trace:
                    null,

                lineage,

                unresolvedEvidenceRefs:
                    [],

                errors

            };

        }


        const resolutionByKey =
            new Map(
                lineage.resolutions.map(
                    resolution => [
                        key(
                            resolution.sourceId,
                            resolution.sourceRevision,
                            resolution.evidenceId
                        ),
                        resolution
                    ]
                )
            );


        const directlyResolvedByKey =
            new Set(
                trace.evidenceCatalog
                    .map(
                        evidence =>
                            key(
                                evidence.sourceId,
                                evidence.sourceRevision,
                                evidence.evidenceId
                            )
                    )
            );


        const resolved = (
            sourceId:
                string,
            sourceRevision:
                string | undefined,
            evidenceId:
                string
        ): boolean => {

            const scopedKey =
                key(
                    sourceId,
                    sourceRevision,
                    evidenceId
                );


            if (
                directlyResolvedByKey.has(
                    scopedKey
                )
            ) {

                return true;

            }


            return resolutionByKey
                .get(
                    scopedKey
                )
                ?.status ===
                "RESOLVED";

        };


        const participantArtifacts =
            trace.participantArtifacts
                .map(
                    artifact => {

                        const evidenceIds =
                            unique(
                                artifact.evidenceIds
                            );


                        return {

                            ...artifact,

                            evidenceIds,

                            resolvedEvidenceIds:
                                evidenceIds
                                    .filter(
                                        evidenceId =>
                                            resolved(
                                                artifact.sourceId,
                                                artifact.sourceRevision,
                                                evidenceId
                                            )
                                    ),

                            unresolvedEvidenceIds:
                                evidenceIds
                                    .filter(
                                        evidenceId =>
                                            !resolved(
                                                artifact.sourceId,
                                                artifact.sourceRevision,
                                                evidenceId
                                            )
                                    )

                        };

                    }
                );


        const participantEvidenceIds =
            new Set(
                trace.participantArtifacts
                    .flatMap(
                        artifact =>
                            artifact.evidenceIds
                    )
            );


        const nonParticipantUnresolvedIds =
            trace.unresolvedEvidenceIds
                .filter(
                    evidenceId =>
                        !participantEvidenceIds.has(
                            evidenceId
                        )
                );


        const candidateUnresolvedIds =
            trace.candidateTraces
                .flatMap(
                    candidate =>
                        candidate.unresolvedEvidenceIds
                );


        const unresolvedEvidenceRefs:
            ScientificEvidenceLineageReference[] =
            participantArtifacts
                .flatMap(
                    artifact =>
                        artifact.unresolvedEvidenceIds
                            .map(
                                evidenceId => ({

                                    evidenceId,

                                    sourceId:
                                        artifact.sourceId,

                                    ...(
                                        artifact.sourceRevision !==
                                        undefined
                                            ? {
                                                sourceRevision:
                                                    artifact.sourceRevision
                                            }
                                            : {}
                                    )

                                })
                            )
                );


        return {

            trace: {

                ...trace,

                participantArtifacts,

                unresolvedEvidenceIds:
                    unique([
                        ...nonParticipantUnresolvedIds,
                        ...candidateUnresolvedIds,
                        ...unresolvedEvidenceRefs
                            .map(
                                reference =>
                                    reference.evidenceId
                            )
                    ])

            },

            lineage,

            unresolvedEvidenceRefs,

            errors:
                []

        };

    }

}