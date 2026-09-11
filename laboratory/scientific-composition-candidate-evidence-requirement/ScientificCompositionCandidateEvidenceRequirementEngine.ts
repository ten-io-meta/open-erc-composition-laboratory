import type {
    ScientificCompositionCandidateEvidenceGapResult
} from "../scientific-composition-candidate-evidence-gap/ScientificCompositionCandidateEvidenceGapResult.js";

import type {
    ScientificCompositionCandidateEvidenceRequirement,
    ScientificCompositionCandidateEvidenceRequirementPlan
} from "./ScientificCompositionCandidateEvidenceRequirement.js";

import type {
    ScientificCompositionCandidateEvidenceRequirementResult
} from "./ScientificCompositionCandidateEvidenceRequirementResult.js";


export interface ScientificCompositionCandidateEvidenceRequirementEngineInput {

    diagnosis:
        ScientificCompositionCandidateEvidenceGapResult;

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


function sortedUnique(
    values:
        string[]
): string[] {

    return [
        ...new Set(
            values
        )
    ].sort();

}


function sameStrings(
    left:
        string[],
    right:
        string[]
): boolean {

    return JSON.stringify(
        sortedUnique(
            left
        )
    ) ===
        JSON.stringify(
            sortedUnique(
                right
            )
        );

}


export class ScientificCompositionCandidateEvidenceRequirementEngine {

    derive(
        input:
            ScientificCompositionCandidateEvidenceRequirementEngineInput
    ): ScientificCompositionCandidateEvidenceRequirementResult {

        const errors:
            string[] = [];


        if (
            input.diagnosis.errors.length >
            0
        ) {

            errors.push(
                "Cannot derive evidence requirements from diagnosis containing errors."
            );

        }


        const diagnosticIds =
            new Set<string>();

        const candidateIds =
            new Set<string>();

        const globalGapIds =
            new Set<string>();


        for (
            const diagnostic
            of input.diagnosis.diagnostics
        ) {

            if (
                !diagnostic.diagnosticId.trim()
            ) {

                errors.push(
                    "Evidence requirement derivation received an empty diagnostic identity."
                );

            }


            if (
                diagnosticIds.has(
                    diagnostic.diagnosticId
                )
            ) {

                errors.push(
                    `Duplicate evidence diagnostic ${diagnostic.diagnosticId}.`
                );

            }


            diagnosticIds.add(
                diagnostic.diagnosticId
            );


            if (
                !diagnostic.candidateId.trim()
            ) {

                errors.push(
                    `Diagnostic ${diagnostic.diagnosticId} has an empty candidate identity.`
                );

            }


            if (
                candidateIds.has(
                    diagnostic.candidateId
                )
            ) {

                errors.push(
                    `Duplicate evidence diagnostic candidate ${diagnostic.candidateId}.`
                );

            }


            candidateIds.add(
                diagnostic.candidateId
            );


            if (
                !/^ERC-[1-9][0-9]*$/.test(
                    diagnostic.sourceParticipantId
                ) ||
                !/^ERC-[1-9][0-9]*$/.test(
                    diagnostic.targetParticipantId
                )
            ) {

                errors.push(
                    `Diagnostic ${diagnostic.diagnosticId} contains unsupported participant identity.`
                );

            }


            if (
                diagnostic.sourceParticipantId ===
                diagnostic.targetParticipantId
            ) {

                errors.push(
                    `Diagnostic ${diagnostic.diagnosticId} is not cross-protocol.`
                );

            }


            if (
                diagnostic.compatibilityPolarity ===
                    "INCONCLUSIVE" &&
                diagnostic.resolution !==
                    "REQUIRES_ADDITIONAL_EVIDENCE"
            ) {

                errors.push(
                    `Diagnostic ${diagnostic.diagnosticId} has inconsistent inconclusive resolution.`
                );

            }


            if (
                diagnostic.compatibilityPolarity ===
                    "SUPPORT" &&
                diagnostic.resolution !==
                    "KNOWN_BOUNDARY_PRESERVATION_SUPPORTED"
            ) {

                errors.push(
                    `Diagnostic ${diagnostic.diagnosticId} has inconsistent support resolution.`
                );

            }


            if (
                diagnostic.compatibilityPolarity ===
                    "CHALLENGE" &&
                diagnostic.resolution !==
                    "BOUNDARY_CHALLENGED"
            ) {

                errors.push(
                    `Diagnostic ${diagnostic.diagnosticId} has inconsistent challenge resolution.`
                );

            }


            if (
                diagnostic.resolution ===
                    "REQUIRES_ADDITIONAL_EVIDENCE" &&
                diagnostic.gaps.length ===
                    0
            ) {

                errors.push(
                    `Diagnostic ${diagnostic.diagnosticId} requires additional evidence but declares no gaps.`
                );

            }


            const knownBoundaryIds =
                sortedUnique(
                    diagnostic.knownBoundaryIds
                );

            const observedBoundaryIds =
                sortedUnique(
                    diagnostic.observedBoundaryIds
                );

            const unevaluatedBoundaryIds =
                sortedUnique(
                    diagnostic.unevaluatedBoundaryIds
                );


            if (
                knownBoundaryIds.length !==
                diagnostic.knownBoundaryIds.length
            ) {

                errors.push(
                    `Diagnostic ${diagnostic.diagnosticId} contains duplicate known boundary identities.`
                );

            }


            if (
                observedBoundaryIds.some(
                    boundaryId =>
                        !knownBoundaryIds.includes(
                            boundaryId
                        )
                )
            ) {

                errors.push(
                    `Diagnostic ${diagnostic.diagnosticId} contains observed boundaries outside known boundaries.`
                );

            }


            if (
                unevaluatedBoundaryIds.some(
                    boundaryId =>
                        !knownBoundaryIds.includes(
                            boundaryId
                        )
                )
            ) {

                errors.push(
                    `Diagnostic ${diagnostic.diagnosticId} contains unevaluated boundaries outside known boundaries.`
                );

            }


            const gapKinds =
                new Set<string>();


            for (
                const gap
                of diagnostic.gaps
            ) {

                if (
                    !gap.gapId.trim()
                ) {

                    errors.push(
                        `Diagnostic ${diagnostic.diagnosticId} contains an empty gap identity.`
                    );

                    continue;

                }


                if (
                    globalGapIds.has(
                        gap.gapId
                    )
                ) {

                    errors.push(
                        `Duplicate evidence gap ${gap.gapId}.`
                    );

                }


                globalGapIds.add(
                    gap.gapId
                );


                if (
                    gap.candidateId !==
                    diagnostic.candidateId
                ) {

                    errors.push(
                        `Evidence gap ${gap.gapId} candidate identity does not match diagnostic ${diagnostic.diagnosticId}.`
                    );

                }


                if (
                    gapKinds.has(
                        gap.kind
                    )
                ) {

                    errors.push(
                        `Diagnostic ${diagnostic.diagnosticId} contains duplicate gap kind ${gap.kind}.`
                    );

                }


                gapKinds.add(
                    gap.kind
                );


                if (
                    gap.kind ===
                        "NO_KNOWN_BOUNDARIES" &&
                    gap.boundaryIds.length !==
                        0
                ) {

                    errors.push(
                        `Evidence gap ${gap.gapId} cannot reference known boundaries.`
                    );

                }


                if (
                    gap.kind ===
                        "NO_CANDIDATE_COMPATIBILITY_OBSERVATIONS" &&
                    !sameStrings(
                        gap.boundaryIds,
                        knownBoundaryIds
                    )
                ) {

                    errors.push(
                        `Evidence gap ${gap.gapId} does not match diagnostic known boundaries.`
                    );

                }


                if (
                    gap.kind ===
                        "UNEVALUATED_KNOWN_BOUNDARIES" &&
                    !sameStrings(
                        gap.boundaryIds,
                        unevaluatedBoundaryIds
                    )
                ) {

                    errors.push(
                        `Evidence gap ${gap.gapId} does not match diagnostic unevaluated boundaries.`
                    );

                }

            }


            if (
                gapKinds.has(
                    "NO_KNOWN_BOUNDARIES"
                ) &&
                knownBoundaryIds.length !==
                    0
            ) {

                errors.push(
                    `Diagnostic ${diagnostic.diagnosticId} reports no known boundaries but contains known boundary identities.`
                );

            }

        }


        if (
            errors.length >
            0
        ) {

            return {

                plans:
                    [],

                errors:
                    errors.sort()

            };

        }


        const plans:
            ScientificCompositionCandidateEvidenceRequirementPlan[] =
            [];


        for (
            const diagnostic
            of [...input.diagnosis.diagnostics].sort(
                (a, b) =>
                    a.candidateId.localeCompare(
                        b.candidateId
                    )
            )
        ) {

            const requirements:
                ScientificCompositionCandidateEvidenceRequirement[] =
                [];


            if (
                diagnostic.resolution ===
                "REQUIRES_ADDITIONAL_EVIDENCE"
            ) {

                const noKnownBoundariesGap =
                    diagnostic.gaps.find(
                        gap =>
                            gap.kind ===
                            "NO_KNOWN_BOUNDARIES"
                    );


                const noObservationsGap =
                    diagnostic.gaps.find(
                        gap =>
                            gap.kind ===
                            "NO_CANDIDATE_COMPATIBILITY_OBSERVATIONS"
                    );


                const unevaluatedBoundariesGap =
                    diagnostic.gaps.find(
                        gap =>
                            gap.kind ===
                            "UNEVALUATED_KNOWN_BOUNDARIES"
                    );


                if (
                    noKnownBoundariesGap !==
                    undefined
                ) {

                    requirements.push({

                        requirementId:
                            encode([
                                "SCIENTIFIC-COMPOSITION-CANDIDATE-EVIDENCE-REQUIREMENT",
                                diagnostic.candidateId,
                                "ACQUIRE_ADDITIONAL_BOUNDARY_EVIDENCE"
                            ]),

                        candidateId:
                            diagnostic.candidateId,

                        kind:
                            "ACQUIRE_ADDITIONAL_BOUNDARY_EVIDENCE",

                        triggeringGapIds: [
                            noKnownBoundariesGap.gapId
                        ],

                        targetBoundaryIds:
                            [],

                        readiness:
                            "READY",

                        blockingGapIds:
                            []

                    });

                }


                const observationTriggeringGapIds =
                    sortedUnique(
                        [
                            ...(
                                noObservationsGap !==
                                    undefined
                                    ? [
                                        noObservationsGap.gapId
                                    ]
                                    : []
                            ),
                            ...(
                                unevaluatedBoundariesGap !==
                                    undefined
                                    ? [
                                        unevaluatedBoundariesGap.gapId
                                    ]
                                    : []
                            )
                        ]
                    );


                if (
                    observationTriggeringGapIds.length >
                    0
                ) {

                    const targetBoundaryIds =
                        sortedUnique(
                            [
                                ...(
                                    noObservationsGap
                                        ?.boundaryIds ??
                                    []
                                ),
                                ...(
                                    unevaluatedBoundariesGap
                                        ?.boundaryIds ??
                                    []
                                )
                            ]
                        );


                    const blocked =
                        noKnownBoundariesGap !==
                        undefined;


                    requirements.push({

                        requirementId:
                            encode([
                                "SCIENTIFIC-COMPOSITION-CANDIDATE-EVIDENCE-REQUIREMENT",
                                diagnostic.candidateId,
                                "COLLECT_CANDIDATE_BOUNDARY_OBSERVATIONS"
                            ]),

                        candidateId:
                            diagnostic.candidateId,

                        kind:
                            "COLLECT_CANDIDATE_BOUNDARY_OBSERVATIONS",

                        triggeringGapIds:
                            observationTriggeringGapIds,

                        targetBoundaryIds,

                        readiness:
                            blocked
                                ? "BLOCKED_BY_PREREQUISITE"
                                : "READY",

                        blockingGapIds:
                            blocked
                                ? [
                                    noKnownBoundariesGap.gapId
                                ]
                                : []

                    });

                }

            }


            requirements.sort(
                (a, b) =>
                    a.requirementId.localeCompare(
                        b.requirementId
                    )
            );


            plans.push({

                planId:
                    encode([
                        "SCIENTIFIC-COMPOSITION-CANDIDATE-EVIDENCE-REQUIREMENT-PLAN",
                        diagnostic.candidateId,
                        diagnostic.diagnosticId
                    ]),

                diagnosticId:
                    diagnostic.diagnosticId,

                candidateId:
                    diagnostic.candidateId,

                candidateKind:
                    diagnostic.candidateKind,

                sourceParticipantId:
                    diagnostic.sourceParticipantId,

                targetParticipantId:
                    diagnostic.targetParticipantId,

                evidenceResolution:
                    diagnostic.resolution,

                status:
                    diagnostic.resolution ===
                        "REQUIRES_ADDITIONAL_EVIDENCE"
                        ? "ADDITIONAL_EVIDENCE_REQUIRED"
                        : "BOUNDARY_EVIDENCE_RESOLVED",

                requirements

            });

        }


        return {

            plans,

            errors:
                []

        };

    }

}