import type {
    ScientificCandidateBoundaryRelevanceEvidence
} from "./ScientificCandidateBoundaryRelevanceAssessment.js";

import type {
    ScientificCandidateBoundaryContainerBinding,
    ScientificCandidateExecutionSurface
} from "./ScientificCandidateExecutionSurface.js";


export interface ScientificCandidateExecutionSurfaceExclusionResult {

    evidence:
        ScientificCandidateBoundaryRelevanceEvidence[];

    excludedBoundaryIds:
        string[];

    retainedBoundaryIds:
        string[];

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


export class ScientificCandidateExecutionSurfaceExclusionEngine {

    derive(
        surface:
            ScientificCandidateExecutionSurface,
        boundaries:
            ScientificCandidateBoundaryContainerBinding[]
    ): ScientificCandidateExecutionSurfaceExclusionResult {

        const errors:
            string[] = [];


        if (!surface.surfaceId.trim()) {

            errors.push(
                "Execution surface requires surfaceId."
            );

        }


        if (!surface.candidateId.trim()) {

            errors.push(
                "Execution surface requires candidateId."
            );

        }


        if (!surface.participantId.trim()) {

            errors.push(
                "Execution surface requires participantId."
            );

        }


        if (
            surface.evidenceIds.length ===
            0
        ) {

            errors.push(
                "Execution surface requires explicit supporting evidence."
            );

        }


        if (
            new Set(
                surface.evidenceIds
            ).size !==
            surface.evidenceIds.length
        ) {

            errors.push(
                "Execution surface contains duplicate evidence identities."
            );

        }


        if (
            surface.includedContainerSymbols.some(
                symbol =>
                    !symbol.trim()
            )
        ) {

            errors.push(
                "Execution surface contains empty container identity."
            );

        }


        if (
            new Set(
                surface.includedContainerSymbols
            ).size !==
            surface.includedContainerSymbols.length
        ) {

            errors.push(
                "Execution surface contains duplicate container identities."
            );

        }


        const boundaryIds =
            new Set<string>();


        for (const boundary of boundaries) {

            if (
                boundaryIds.has(
                    boundary.boundaryId
                )
            ) {

                errors.push(
                    `Duplicate boundary binding ${boundary.boundaryId}.`
                );

            }


            boundaryIds.add(
                boundary.boundaryId
            );


            if (
                boundary.participantId !==
                surface.participantId
            ) {

                errors.push(
                    `Boundary ${boundary.boundaryId} belongs outside execution surface participant ${surface.participantId}.`
                );

            }


            if (
                !boundary.containerSymbol.trim()
            ) {

                errors.push(
                    `Boundary ${boundary.boundaryId} has empty container identity.`
                );

            }

        }


        /*
         * This is the critical fail-closed rule.
         *
         * Absence from a partial surface is never exclusion evidence.
         */
        if (
            surface.completeness !==
            "COMPLETE_FOR_CANDIDATE_EVALUATION"
        ) {

            errors.push(
                "Cannot derive candidate exclusion evidence from a partial execution surface."
            );

        }


        if (errors.length > 0) {

            return {
                evidence:
                    [],
                excludedBoundaryIds:
                    [],
                retainedBoundaryIds:
                    [],
                errors:
                    errors.sort()
            };

        }


        const includedContainers =
            new Set(
                surface.includedContainerSymbols
            );


        const evidence:
            ScientificCandidateBoundaryRelevanceEvidence[] =
            [];

        const excludedBoundaryIds:
            string[] = [];

        const retainedBoundaryIds:
            string[] = [];


        for (
            const boundary
            of [...boundaries].sort(
                (a, b) =>
                    a.boundaryId.localeCompare(
                        b.boundaryId
                    )
            )
        ) {

            if (
                includedContainers.has(
                    boundary.containerSymbol
                )
            ) {

                retainedBoundaryIds.push(
                    boundary.boundaryId
                );

                continue;

            }


            const evidenceId =
                encode([
                    "SCIENTIFIC-CANDIDATE-BOUNDARY-EXECUTION-SURFACE-EXCLUSION",
                    surface.surfaceId,
                    boundary.boundaryId,
                    boundary.containerSymbol
                ]);


            evidence.push({

                evidenceId,

                candidateId:
                    surface.candidateId,

                participantId:
                    surface.participantId,

                boundaryId:
                    boundary.boundaryId,

                kind:
                    "CANDIDATE_EXCLUSION"

            });


            excludedBoundaryIds.push(
                boundary.boundaryId
            );

        }


        return {

            evidence,

            excludedBoundaryIds:
                excludedBoundaryIds.sort(),

            retainedBoundaryIds:
                retainedBoundaryIds.sort(),

            errors:
                []

        };

    }

}