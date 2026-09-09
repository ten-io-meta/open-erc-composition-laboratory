import type {
    ScientificCompositionBoundary
} from "../scientific-composition-frame/ScientificCompositionBoundary.js";

import type {
    ScientificCompositionCandidateBoundaryObservation
} from "../scientific-composition-candidate-compatibility/ScientificCompositionCandidateBoundaryObservation.js";

import type {
    ScientificCandidateBoundaryRelevanceEvidence
} from "./ScientificCandidateBoundaryRelevanceAssessment.js";


export interface ScientificCandidateBoundaryRelevanceEvidenceResult {

    evidence:
        ScientificCandidateBoundaryRelevanceEvidence[];

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


export class ScientificCandidateBoundaryRelevanceEvidenceEngine {

    deriveFromRuntimeObservations(
        candidateId:
            string,
        boundaries:
            ScientificCompositionBoundary[],
        observations:
            ScientificCompositionCandidateBoundaryObservation[]
    ): ScientificCandidateBoundaryRelevanceEvidenceResult {

        const errors:
            string[] = [];


        if (!candidateId.trim()) {

            errors.push(
                "Boundary relevance evidence requires candidateId."
            );

        }


        const boundariesById =
            new Map(
                boundaries.map(
                    boundary => [
                        boundary.boundaryId,
                        boundary
                    ] as const
                )
            );


        if (
            boundariesById.size !==
            boundaries.length
        ) {

            errors.push(
                "Boundary relevance evidence received duplicate boundary identities."
            );

        }


        const observationIds =
            new Set<string>();


        for (const observation of observations) {

            if (
                observationIds.has(
                    observation.observationId
                )
            ) {

                errors.push(
                    `Duplicate boundary observation ${observation.observationId}.`
                );

            }


            observationIds.add(
                observation.observationId
            );


            if (
                observation.candidateId !==
                candidateId
            ) {

                errors.push(
                    `Boundary observation ${observation.observationId} belongs to another candidate.`
                );

            }


            if (
                !boundariesById.has(
                    observation.boundaryId
                )
            ) {

                errors.push(
                    `Boundary observation ${observation.observationId} references unknown boundary ${observation.boundaryId}.`
                );

            }


            if (
                observation.evidenceIds.length ===
                0
            ) {

                errors.push(
                    `Boundary observation ${observation.observationId} contains no evidence.`
                );

            }

        }


        if (errors.length > 0) {

            return {
                evidence:
                    [],
                errors:
                    errors.sort()
            };

        }


        const evidence:
            ScientificCandidateBoundaryRelevanceEvidence[] =
            [];


        for (
            const observation
            of [...observations].sort(
                (a, b) =>
                    a.observationId.localeCompare(
                        b.observationId
                    )
            )
        ) {

            const boundary =
                boundariesById.get(
                    observation.boundaryId
                )!;


            evidence.push({

                evidenceId:
                    encode([
                        "SCIENTIFIC-CANDIDATE-BOUNDARY-RUNTIME-REACHABILITY",
                        candidateId,
                        observation.observationId,
                        boundary.boundaryId
                    ]),

                candidateId,

                participantId:
                    boundary.participantId,

                boundaryId:
                    boundary.boundaryId,

                /*
                 * PRESERVED and VIOLATED both prove that the
                 * candidate execution reached this boundary.
                 *
                 * Compatibility polarity is not projected here.
                 */
                kind:
                    "CANDIDATE_REACHABILITY"

            });

        }


        return {
            evidence,
            errors:
                []
        };

    }

}