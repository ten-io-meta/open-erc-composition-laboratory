import type {
    ScientificCompositionCandidateEvidenceRequirementResult
} from "../scientific-composition-candidate-evidence-requirement/ScientificCompositionCandidateEvidenceRequirementResult.js";

import type {
    ScientificCompositionCandidateBlockedEvidenceRequirement,
    ScientificCompositionCandidateEvidenceSpecification,
    ScientificCompositionCandidateEvidenceSpecificationKind
} from "./ScientificCompositionCandidateEvidenceSpecification.js";

import type {
    ScientificCompositionCandidateEvidenceSpecificationResult
} from "./ScientificCompositionCandidateEvidenceSpecificationResult.js";


export interface ScientificCompositionCandidateEvidenceSpecificationEngineInput {

    requirements:
        ScientificCompositionCandidateEvidenceRequirementResult;

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


export class ScientificCompositionCandidateEvidenceSpecificationEngine {

    build(
        input:
            ScientificCompositionCandidateEvidenceSpecificationEngineInput
    ): ScientificCompositionCandidateEvidenceSpecificationResult {

        const errors:
            string[] = [];


        if (
            input.requirements.errors.length >
            0
        ) {

            errors.push(
                "Cannot build candidate evidence specifications from requirement plans containing errors."
            );

        }


        const planIds =
            new Set<string>();

        const candidateIds =
            new Set<string>();

        const requirementIds =
            new Set<string>();


        for (
            const plan
            of input.requirements.plans
        ) {

            if (
                !plan.planId.trim()
            ) {

                errors.push(
                    "Candidate evidence specification received an empty plan identity."
                );

            }


            if (
                planIds.has(
                    plan.planId
                )
            ) {

                errors.push(
                    `Duplicate candidate evidence requirement plan ${plan.planId}.`
                );

            }


            planIds.add(
                plan.planId
            );


            if (
                candidateIds.has(
                    plan.candidateId
                )
            ) {

                errors.push(
                    `Duplicate candidate evidence requirement plan for candidate ${plan.candidateId}.`
                );

            }


            candidateIds.add(
                plan.candidateId
            );


            if (
                !/^ERC-[1-9][0-9]*$/.test(
                    plan.sourceParticipantId
                ) ||
                !/^ERC-[1-9][0-9]*$/.test(
                    plan.targetParticipantId
                )
            ) {

                errors.push(
                    `Requirement plan ${plan.planId} contains unsupported participant identity.`
                );

            }


            if (
                plan.sourceParticipantId ===
                plan.targetParticipantId
            ) {

                errors.push(
                    `Requirement plan ${plan.planId} is not cross-protocol.`
                );

            }


            const requiresAdditionalEvidence =
                plan.evidenceResolution ===
                "REQUIRES_ADDITIONAL_EVIDENCE";


            if (
                requiresAdditionalEvidence &&
                plan.status !==
                    "ADDITIONAL_EVIDENCE_REQUIRED"
            ) {

                errors.push(
                    `Requirement plan ${plan.planId} has inconsistent additional-evidence status.`
                );

            }


            if (
                !requiresAdditionalEvidence &&
                plan.status !==
                    "BOUNDARY_EVIDENCE_RESOLVED"
            ) {

                errors.push(
                    `Requirement plan ${plan.planId} has inconsistent resolved-evidence status.`
                );

            }


            if (
                requiresAdditionalEvidence &&
                plan.requirements.length ===
                    0
            ) {

                errors.push(
                    `Requirement plan ${plan.planId} requires additional evidence but contains no requirements.`
                );

            }


            if (
                !requiresAdditionalEvidence &&
                plan.requirements.length >
                    0
            ) {

                errors.push(
                    `Resolved requirement plan ${plan.planId} unexpectedly contains additional requirements.`
                );

            }


            for (
                const requirement
                of plan.requirements
            ) {

                if (
                    !requirement.requirementId.trim()
                ) {

                    errors.push(
                        `Requirement plan ${plan.planId} contains an empty requirement identity.`
                    );

                    continue;

                }


                if (
                    requirementIds.has(
                        requirement.requirementId
                    )
                ) {

                    errors.push(
                        `Duplicate evidence requirement ${requirement.requirementId}.`
                    );

                }


                requirementIds.add(
                    requirement.requirementId
                );


                if (
                    requirement.candidateId !==
                    plan.candidateId
                ) {

                    errors.push(
                        `Evidence requirement ${requirement.requirementId} candidate identity does not match plan ${plan.planId}.`
                    );

                }


                if (
                    requirement.triggeringGapIds.length ===
                    0
                ) {

                    errors.push(
                        `Evidence requirement ${requirement.requirementId} has no triggering evidence gap.`
                    );

                }


                if (
                    sortedUnique(
                        requirement.triggeringGapIds
                    ).length !==
                    requirement.triggeringGapIds.length
                ) {

                    errors.push(
                        `Evidence requirement ${requirement.requirementId} contains duplicate triggering gaps.`
                    );

                }


                if (
                    sortedUnique(
                        requirement.targetBoundaryIds
                    ).length !==
                    requirement.targetBoundaryIds.length
                ) {

                    errors.push(
                        `Evidence requirement ${requirement.requirementId} contains duplicate target boundaries.`
                    );

                }


                if (
                    sortedUnique(
                        requirement.blockingGapIds
                    ).length !==
                    requirement.blockingGapIds.length
                ) {

                    errors.push(
                        `Evidence requirement ${requirement.requirementId} contains duplicate blocking gaps.`
                    );

                }


                if (
                    requirement.readiness ===
                        "READY" &&
                    requirement.blockingGapIds.length >
                        0
                ) {

                    errors.push(
                        `Ready evidence requirement ${requirement.requirementId} cannot retain blocking gaps.`
                    );

                }


                if (
                    requirement.readiness ===
                        "BLOCKED_BY_PREREQUISITE" &&
                    requirement.blockingGapIds.length ===
                        0
                ) {

                    errors.push(
                        `Blocked evidence requirement ${requirement.requirementId} declares no blocking gap.`
                    );

                }


                if (
                    requirement.kind ===
                        "ACQUIRE_ADDITIONAL_BOUNDARY_EVIDENCE" &&
                    requirement.targetBoundaryIds.length >
                        0
                ) {

                    errors.push(
                        `Boundary-evidence acquisition requirement ${requirement.requirementId} cannot invent target boundary identities.`
                    );

                }


                if (
                    requirement.kind ===
                        "COLLECT_CANDIDATE_BOUNDARY_OBSERVATIONS" &&
                    requirement.readiness ===
                        "READY" &&
                    requirement.targetBoundaryIds.length ===
                        0
                ) {

                    errors.push(
                        `Ready boundary-observation requirement ${requirement.requirementId} requires at least one exact target boundary.`
                    );

                }

            }

        }


        if (
            errors.length >
            0
        ) {

            return {

                specifications:
                    [],

                blockedRequirements:
                    [],

                statistics: {

                    plans:
                        input.requirements.plans.length,

                    specifications:
                        0,

                    blockedRequirements:
                        0,

                    boundaryEvidenceAcquisitionSpecifications:
                        0,

                    candidateBoundaryObservationSpecifications:
                        0

                },

                errors:
                    errors.sort()

            };

        }


        const specifications:
            ScientificCompositionCandidateEvidenceSpecification[] =
            [];

        const blockedRequirements:
            ScientificCompositionCandidateBlockedEvidenceRequirement[] =
            [];


        for (
            const plan
            of [...input.requirements.plans].sort(
                (a, b) =>
                    a.candidateId.localeCompare(
                        b.candidateId
                    )
            )
        ) {

            for (
                const requirement
                of [...plan.requirements].sort(
                    (a, b) =>
                        a.requirementId.localeCompare(
                            b.requirementId
                        )
                )
            ) {

                if (
                    requirement.readiness ===
                    "BLOCKED_BY_PREREQUISITE"
                ) {

                    blockedRequirements.push({

                        planId:
                            plan.planId,

                        diagnosticId:
                            plan.diagnosticId,

                        requirementId:
                            requirement.requirementId,

                        candidateId:
                            plan.candidateId,

                        candidateKind:
                            plan.candidateKind,

                        sourceParticipantId:
                            plan.sourceParticipantId,

                        targetParticipantId:
                            plan.targetParticipantId,

                        requirementKind:
                            requirement.kind,

                        triggeringGapIds:
                            [...requirement.triggeringGapIds].sort(),

                        targetBoundaryIds:
                            [...requirement.targetBoundaryIds].sort(),

                        blockingGapIds:
                            [...requirement.blockingGapIds].sort(),

                        status:
                            "BLOCKED_BY_PREREQUISITE"

                    });

                    continue;

                }


                let specificationKind:
                    ScientificCompositionCandidateEvidenceSpecificationKind;


                if (
                    requirement.kind ===
                    "ACQUIRE_ADDITIONAL_BOUNDARY_EVIDENCE"
                ) {

                    specificationKind =
                        "BOUNDARY_EVIDENCE_ACQUISITION";

                }
                else {

                    specificationKind =
                        "CANDIDATE_BOUNDARY_OBSERVATION";

                }


                specifications.push({

                    specificationId:
                        encode([
                            "SCIENTIFIC-COMPOSITION-CANDIDATE-EVIDENCE-SPECIFICATION",
                            plan.candidateId,
                            requirement.requirementId,
                            specificationKind
                        ]),

                    planId:
                        plan.planId,

                    diagnosticId:
                        plan.diagnosticId,

                    requirementId:
                        requirement.requirementId,

                    candidateId:
                        plan.candidateId,

                    candidateKind:
                        plan.candidateKind,

                    sourceParticipantId:
                        plan.sourceParticipantId,

                    targetParticipantId:
                        plan.targetParticipantId,

                    requirementKind:
                        requirement.kind,

                    specificationKind,

                    triggeringGapIds:
                        [...requirement.triggeringGapIds].sort(),

                    targetBoundaryIds:
                        [...requirement.targetBoundaryIds].sort(),

                    status:
                        "READY"

                });

            }

        }


        specifications.sort(
            (a, b) =>
                a.specificationId.localeCompare(
                    b.specificationId
                )
        );


        blockedRequirements.sort(
            (a, b) =>
                a.requirementId.localeCompare(
                    b.requirementId
                )
        );


        return {

            specifications,

            blockedRequirements,

            statistics: {

                plans:
                    input.requirements.plans.length,

                specifications:
                    specifications.length,

                blockedRequirements:
                    blockedRequirements.length,

                boundaryEvidenceAcquisitionSpecifications:
                    specifications.filter(
                        specification =>
                            specification.specificationKind ===
                            "BOUNDARY_EVIDENCE_ACQUISITION"
                    ).length,

                candidateBoundaryObservationSpecifications:
                    specifications.filter(
                        specification =>
                            specification.specificationKind ===
                            "CANDIDATE_BOUNDARY_OBSERVATION"
                    ).length

            },

            errors:
                []

        };

    }

}