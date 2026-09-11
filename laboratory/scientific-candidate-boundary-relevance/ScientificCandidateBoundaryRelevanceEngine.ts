import type {
    ScientificCompositionBoundary
} from "../scientific-composition-frame/ScientificCompositionBoundary.js";

import type {
    ScientificCandidateBoundaryRelevanceAssessment,
    ScientificCandidateBoundaryRelevanceEvidence,
    ScientificCandidateBoundaryRelevanceResult
} from "./ScientificCandidateBoundaryRelevanceAssessment.js";


export interface ScientificCandidateBoundaryRelevanceEngineInput {

    candidateId:
        string;

    participantIds:
        string[];

    boundaries:
        ScientificCompositionBoundary[];

    evidence:
        ScientificCandidateBoundaryRelevanceEvidence[];

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


export class ScientificCandidateBoundaryRelevanceEngine {

    evaluate(
        input:
            ScientificCandidateBoundaryRelevanceEngineInput
    ): ScientificCandidateBoundaryRelevanceResult {

        const errors:
            string[] = [];


        if (!input.candidateId.trim()) {

            errors.push(
                "Candidate boundary relevance requires candidateId."
            );

        }


        const participantIds =
            new Set(
                input.participantIds
            );


        if (
            participantIds.size !==
            input.participantIds.length
        ) {

            errors.push(
                "Candidate boundary relevance received duplicate participant identities."
            );

        }


        const boundaryIds =
            new Set<string>();


        for (const boundary of input.boundaries) {

            if (
                boundaryIds.has(
                    boundary.boundaryId
                )
            ) {

                errors.push(
                    `Duplicate boundary ${boundary.boundaryId}.`
                );

            }


            boundaryIds.add(
                boundary.boundaryId
            );


            if (
                !participantIds.has(
                    boundary.participantId
                )
            ) {

                errors.push(
                    `Boundary ${boundary.boundaryId} belongs outside the candidate participants.`
                );

            }

        }


        const evidenceIds =
            new Set<string>();


        for (const evidence of input.evidence) {

            if (
                evidenceIds.has(
                    evidence.evidenceId
                )
            ) {

                errors.push(
                    `Duplicate relevance evidence ${evidence.evidenceId}.`
                );

            }


            evidenceIds.add(
                evidence.evidenceId
            );


            if (
                evidence.candidateId !==
                input.candidateId
            ) {

                errors.push(
                    `Relevance evidence ${evidence.evidenceId} belongs to another candidate.`
                );

            }


            if (
                !participantIds.has(
                    evidence.participantId
                )
            ) {

                errors.push(
                    `Relevance evidence ${evidence.evidenceId} belongs to another participant.`
                );

            }


            if (
                !boundaryIds.has(
                    evidence.boundaryId
                )
            ) {

                errors.push(
                    `Relevance evidence ${evidence.evidenceId} references unknown boundary ${evidence.boundaryId}.`
                );

            }

        }


        if (errors.length > 0) {

            return {

                assessments:
                    [],

                statistics: {
                    total:
                        0,
                    relevant:
                        0,
                    outOfScope:
                        0,
                    unresolved:
                        0
                },

                errors:
                    errors.sort()

            };

        }


        const assessments:
            ScientificCandidateBoundaryRelevanceAssessment[] =
            [];


        for (
            const boundary
            of [...input.boundaries].sort(
                (a, b) =>
                    a.boundaryId.localeCompare(
                        b.boundaryId
                    )
            )
        ) {

            const boundaryEvidence =
                input.evidence
                    .filter(
                        evidence =>
                            evidence.boundaryId ===
                                boundary.boundaryId &&
                            evidence.participantId ===
                                boundary.participantId
                    )
                    .sort(
                        (a, b) =>
                            a.evidenceId.localeCompare(
                                b.evidenceId
                            )
                    );


            const reachabilityEvidence =
                boundaryEvidence.filter(
                    evidence =>
                        evidence.kind ===
                        "CANDIDATE_REACHABILITY"
                );


            const exclusionEvidence =
                boundaryEvidence.filter(
                    evidence =>
                        evidence.kind ===
                        "CANDIDATE_EXCLUSION"
                );


            let relevance:
                ScientificCandidateBoundaryRelevanceAssessment["relevance"];

            let reason:
                ScientificCandidateBoundaryRelevanceAssessment["reason"];


            if (
                reachabilityEvidence.length >
                    0 &&
                exclusionEvidence.length >
                    0
            ) {

                relevance =
                    "UNRESOLVED";

                reason =
                    "CONFLICTING_RELEVANCE_EVIDENCE";

            }
            else if (
                reachabilityEvidence.length >
                0
            ) {

                relevance =
                    "RELEVANT";

                reason =
                    "EXPLICIT_CANDIDATE_REACHABILITY_EVIDENCE";

            }
            else if (
                exclusionEvidence.length >
                0
            ) {

                relevance =
                    "OUT_OF_SCOPE";

                reason =
                    "EXPLICIT_CANDIDATE_EXCLUSION_EVIDENCE";

            }
            else {

                relevance =
                    "UNRESOLVED";

                reason =
                    "NO_RELEVANCE_EVIDENCE";

            }


            assessments.push({

                assessmentId:
                    encode([
                        "SCIENTIFIC-CANDIDATE-BOUNDARY-RELEVANCE",
                        input.candidateId,
                        boundary.participantId,
                        boundary.boundaryId
                    ]),

                candidateId:
                    input.candidateId,

                participantId:
                    boundary.participantId,

                boundaryId:
                    boundary.boundaryId,

                relevance,

                reason,

                evidenceIds:
                    boundaryEvidence.map(
                        evidence =>
                            evidence.evidenceId
                    )

            });

        }


        return {

            assessments,

            statistics: {

                total:
                    assessments.length,

                relevant:
                    assessments.filter(
                        assessment =>
                            assessment.relevance ===
                            "RELEVANT"
                    ).length,

                outOfScope:
                    assessments.filter(
                        assessment =>
                            assessment.relevance ===
                            "OUT_OF_SCOPE"
                    ).length,

                unresolved:
                    assessments.filter(
                        assessment =>
                            assessment.relevance ===
                            "UNRESOLVED"
                    ).length

            },

            errors:
                []

        };

    }

}