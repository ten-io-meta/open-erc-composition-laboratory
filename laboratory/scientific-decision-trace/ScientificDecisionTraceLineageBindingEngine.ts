import type {
    ScientificDecisionTraceResult
} from "./ScientificDecisionTrace.js";

import type {
    ScientificEvidenceLineageResult
} from "../scientific-evidence-lineage/ScientificEvidenceLineage.js";


export interface ScientificDecisionTraceLineageBindingResult {

    trace:
        ScientificDecisionTraceResult | null;

    lineage:
        ScientificEvidenceLineageResult;

    errors:
        string[];

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

                errors

            };

        }


        const resolutionById =
            new Map(
                lineage.resolutions.map(
                    resolution => [
                        resolution.evidenceId,
                        resolution
                    ]
                )
            );

        const directlyResolved =
            new Set(
                trace.evidenceCatalog.map(
                    evidence =>
                        evidence.evidenceId
                )
            );


        const resolved = (
            evidenceId:
                string
        ): boolean => {

            if (
                directlyResolved.has(
                    evidenceId
                )
            ) {

                return true;

            }


            return resolutionById
                .get(
                    evidenceId
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
                                                evidenceId
                                            )
                                    ),

                            unresolvedEvidenceIds:
                                evidenceIds
                                    .filter(
                                        evidenceId =>
                                            !resolved(
                                                evidenceId
                                            )
                                    )

                        };

                    }
                );


        const candidateTraces =
            trace.candidateTraces
                .map(
                    candidate => {

                        const evidenceIds =
                            unique([
                                ...candidate.discoveryEvidenceIds,
                                ...candidate.compatibilityEvidenceIds
                            ]);


                        return {

                            ...candidate,

                            resolvedEvidenceIds:
                                evidenceIds
                                    .filter(
                                        evidenceId =>
                                            resolved(
                                                evidenceId
                                            )
                                    ),

                            unresolvedEvidenceIds:
                                evidenceIds
                                    .filter(
                                        evidenceId =>
                                            !resolved(
                                                evidenceId
                                            )
                                    )

                        };

                    }
                );


        const unresolvedEvidenceIds =
            unique([
                ...trace.unresolvedEvidenceIds
                    .filter(
                        evidenceId =>
                            !resolved(
                                evidenceId
                            )
                    ),

                ...participantArtifacts
                    .flatMap(
                        artifact =>
                            artifact.unresolvedEvidenceIds
                    ),

                ...candidateTraces
                    .flatMap(
                        candidate =>
                            candidate.unresolvedEvidenceIds
                    )
            ]);


        return {

            trace: {

                ...trace,

                participantArtifacts,

                candidateTraces,

                unresolvedEvidenceIds

            },

            lineage,

            errors:
                []

        };

    }

}