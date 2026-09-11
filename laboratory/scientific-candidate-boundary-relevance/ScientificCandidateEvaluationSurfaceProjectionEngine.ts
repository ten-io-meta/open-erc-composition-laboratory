import type {
    ScientificJointContractHarnessRecipeRegistration
} from "../scientific-joint-contract-harness/ScientificJointContractHarnessRecipeRegistration.js";

import type {
    ScientificCandidateExecutionSurface
} from "./ScientificCandidateExecutionSurface.js";


export interface ScientificCandidateEvaluationSurfaceTarget {

    candidateId:
        string;

    sourceParticipantId:
        string;

    targetParticipantId:
        string;

}


export interface ScientificCandidateEvaluationSurfaceProjectionResult {

    surfaces:
        ScientificCandidateExecutionSurface[];

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


export class ScientificCandidateEvaluationSurfaceProjectionEngine {

    project(
        registration:
            ScientificJointContractHarnessRecipeRegistration,
        candidate:
            ScientificCandidateEvaluationSurfaceTarget
    ): ScientificCandidateEvaluationSurfaceProjectionResult {

        const errors:
            string[] = [];


        if (!candidate.candidateId.trim()) {

            errors.push(
                "Candidate evaluation surface projection requires candidateId."
            );

        }


        if (
            candidate.sourceParticipantId ===
            candidate.targetParticipantId
        ) {

            errors.push(
                "Candidate evaluation surface projection requires two distinct participants."
            );

        }


        const evaluationSurface =
            registration.evaluationSurface;


        if (evaluationSurface === undefined) {

            errors.push(
                `Registration ${registration.registrationId} has no explicit evaluation surface.`
            );

            return {
                surfaces:
                    [],
                errors:
                    errors.sort()
            };

        }


        const applicabilityParticipants =
            [
                registration.applicability.participantA.participantId,
                registration.applicability.participantB.participantId
            ].sort();


        const candidateParticipants =
            [
                candidate.sourceParticipantId,
                candidate.targetParticipantId
            ].sort();


        if (
            JSON.stringify(applicabilityParticipants) !==
            JSON.stringify(candidateParticipants)
        ) {

            errors.push(
                `Registration ${registration.registrationId} participants do not match candidate ${candidate.candidateId}.`
            );

        }


        if (
            evaluationSurface.participantSurfaces.length !==
            2
        ) {

            errors.push(
                `Registration ${registration.registrationId} must declare exactly two participant evaluation surfaces.`
            );

        }


        const sides =
            new Set<string>();

        const participantIds =
            new Set<string>();


        for (
            const surface
            of evaluationSurface.participantSurfaces
        ) {

            if (
                sides.has(
                    surface.participantSide
                )
            ) {

                errors.push(
                    `Registration ${registration.registrationId} contains duplicate surface side ${surface.participantSide}.`
                );

            }


            sides.add(
                surface.participantSide
            );


            if (
                participantIds.has(
                    surface.participantId
                )
            ) {

                errors.push(
                    `Registration ${registration.registrationId} contains duplicate surface participant ${surface.participantId}.`
                );

            }


            participantIds.add(
                surface.participantId
            );


            const applicability =
                surface.participantSide ===
                    "A"
                    ? registration.applicability.participantA
                    : registration.applicability.participantB;


            if (
                surface.participantId !==
                    applicability.participantId ||
                surface.participantKind !==
                    applicability.participantKind
            ) {

                errors.push(
                    `Evaluation surface ${surface.participantSide} does not match registration applicability.`
                );

            }


            if (
                !candidateParticipants.includes(
                    surface.participantId
                )
            ) {

                errors.push(
                    `Evaluation surface participant ${surface.participantId} belongs outside candidate ${candidate.candidateId}.`
                );

            }


            if (
                surface.evidenceIds.length ===
                0
            ) {

                errors.push(
                    `Evaluation surface for ${surface.participantId} has no evidence.`
                );

            }


            if (
                new Set(
                    surface.evidenceIds
                ).size !==
                surface.evidenceIds.length
            ) {

                errors.push(
                    `Evaluation surface for ${surface.participantId} contains duplicate evidence identities.`
                );

            }


            if (
                surface.includedContainerSymbols.length ===
                0
            ) {

                errors.push(
                    `Evaluation surface for ${surface.participantId} contains no containers.`
                );

            }


            if (
                surface.includedContainerSymbols.some(
                    symbol =>
                        !symbol.trim()
                )
            ) {

                errors.push(
                    `Evaluation surface for ${surface.participantId} contains an empty container identity.`
                );

            }


            if (
                new Set(
                    surface.includedContainerSymbols
                ).size !==
                surface.includedContainerSymbols.length
            ) {

                errors.push(
                    `Evaluation surface for ${surface.participantId} contains duplicate container identities.`
                );

            }

        }


        if (
            !sides.has("A") ||
            !sides.has("B")
        ) {

            errors.push(
                `Registration ${registration.registrationId} must contain participant surfaces A and B.`
            );

        }


        if (errors.length > 0) {

            return {
                surfaces:
                    [],
                errors:
                    errors.sort()
            };

        }


        const surfaces =
            evaluationSurface.participantSurfaces
                .map(
                    surface => ({

                        surfaceId:
                            encode([
                                "SCIENTIFIC-CANDIDATE-EVALUATION-SURFACE",
                                registration.registrationId,
                                candidate.candidateId,
                                surface.participantId
                            ]),

                        candidateId:
                            candidate.candidateId,

                        participantId:
                            surface.participantId,

                        completeness:
                            surface.completeness,

                        includedContainerSymbols:
                            [
                                ...surface
                                    .includedContainerSymbols
                            ].sort(),

                        evidenceIds:
                            [
                                ...surface
                                    .evidenceIds
                            ].sort()

                    })
                )
                .sort(
                    (a, b) =>
                        a.participantId.localeCompare(
                            b.participantId
                        )
                );


        return {
            surfaces,
            errors:
                []
        };

    }

}