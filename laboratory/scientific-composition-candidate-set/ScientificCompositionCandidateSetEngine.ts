import type {
    ScientificCompositionComplementarityMatch
} from "../scientific-composition-complementarity/ScientificCompositionComplementarityMatch.js";

import type {
    ScientificDocumentaryCompositionCandidate
} from "../scientific-documentary-composition-candidate/ScientificDocumentaryCompositionCandidate.js";

import type {
    ScientificCompositionCandidate
} from "./ScientificCompositionCandidate.js";

import type {
    ScientificCompositionCandidateSetResult
} from "./ScientificCompositionCandidateSetResult.js";


export interface ScientificCompositionCandidateSetEngineInput {

    participantIds:
        string[];

    functionalMatches:
        ScientificCompositionComplementarityMatch[];

    documentaryCandidates:
        ScientificDocumentaryCompositionCandidate[];

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


export class ScientificCompositionCandidateSetEngine {

    build(
        input:
            ScientificCompositionCandidateSetEngineInput
    ): ScientificCompositionCandidateSetResult {

        const errors:
            string[] = [];


        const participantIds =
            new Set<string>();


        for (
            const participantId
            of input.participantIds
        ) {

            if (
                !/^ERC-[1-9][0-9]*$/.test(
                    participantId
                )
            ) {

                errors.push(
                    `Composition candidate set received unsupported participant identity ${participantId}.`
                );

                continue;

            }


            if (
                participantIds.has(
                    participantId
                )
            ) {

                errors.push(
                    `Duplicate composition candidate participant ${participantId}.`
                );

            }


            participantIds.add(
                participantId
            );

        }


        const functionalMatchIds =
            new Set<string>();


        for (
            const match
            of input.functionalMatches
        ) {

            if (
                !match.matchId.trim()
            ) {

                errors.push(
                    "Composition candidate set received an empty functional match identity."
                );

                continue;

            }


            if (
                functionalMatchIds.has(
                    match.matchId
                )
            ) {

                errors.push(
                    `Duplicate functional complementarity match ${match.matchId}.`
                );

            }


            functionalMatchIds.add(
                match.matchId
            );


            if (
                !participantIds.has(
                    match.consumerParticipantId
                )
            ) {

                errors.push(
                    `Functional match ${match.matchId} references unknown consumer participant ${match.consumerParticipantId}.`
                );

            }


            if (
                !participantIds.has(
                    match.providerParticipantId
                )
            ) {

                errors.push(
                    `Functional match ${match.matchId} references unknown provider participant ${match.providerParticipantId}.`
                );

            }


            if (
                match.consumerParticipantId ===
                    match.providerParticipantId
            ) {

                errors.push(
                    `Functional match ${match.matchId} is not cross-protocol.`
                );

            }


            if (
                match.evaluationStatus !==
                    "UNEVALUATED"
            ) {

                errors.push(
                    `Functional match ${match.matchId} is not unevaluated.`
                );

            }


            if (
                match.evidenceIds.length ===
                0
            ) {

                errors.push(
                    `Functional match ${match.matchId} has no evidence.`
                );

            }


            const evidenceIds =
                new Set<string>();


            for (
                const evidenceId
                of match.evidenceIds
            ) {

                if (
                    !evidenceId.trim()
                ) {

                    errors.push(
                        `Functional match ${match.matchId} contains an empty evidence identity.`
                    );

                    continue;

                }


                if (
                    evidenceIds.has(
                        evidenceId
                    )
                ) {

                    errors.push(
                        `Functional match ${match.matchId} contains duplicate evidence identity ${evidenceId}.`
                    );

                }


                evidenceIds.add(
                    evidenceId
                );

            }

        }


        const documentaryCandidateIds =
            new Set<string>();


        for (
            const candidate
            of input.documentaryCandidates
        ) {

            if (
                !candidate.candidateId.trim()
            ) {

                errors.push(
                    "Composition candidate set received an empty documentary candidate identity."
                );

                continue;

            }


            if (
                documentaryCandidateIds.has(
                    candidate.candidateId
                )
            ) {

                errors.push(
                    `Duplicate documentary composition candidate ${candidate.candidateId}.`
                );

            }


            documentaryCandidateIds.add(
                candidate.candidateId
            );


            if (
                !participantIds.has(
                    candidate.subjectParticipantId
                )
            ) {

                errors.push(
                    `Documentary candidate ${candidate.candidateId} references unknown subject participant ${candidate.subjectParticipantId}.`
                );

            }


            if (
                !participantIds.has(
                    candidate.objectParticipantId
                )
            ) {

                errors.push(
                    `Documentary candidate ${candidate.candidateId} references unknown object participant ${candidate.objectParticipantId}.`
                );

            }


            if (
                candidate.subjectParticipantId ===
                    candidate.objectParticipantId
            ) {

                errors.push(
                    `Documentary candidate ${candidate.candidateId} is not cross-protocol.`
                );

            }


            if (
                candidate.evaluationStatus !==
                    "UNEVALUATED"
            ) {

                errors.push(
                    `Documentary candidate ${candidate.candidateId} is not unevaluated.`
                );

            }


            if (
                candidate.evidenceIds.length ===
                0
            ) {

                errors.push(
                    `Documentary candidate ${candidate.candidateId} has no evidence.`
                );

            }


            const evidenceIds =
                new Set<string>();


            for (
                const evidenceId
                of candidate.evidenceIds
            ) {

                if (
                    !evidenceId.trim()
                ) {

                    errors.push(
                        `Documentary candidate ${candidate.candidateId} contains an empty evidence identity.`
                    );

                    continue;

                }


                if (
                    evidenceIds.has(
                        evidenceId
                    )
                ) {

                    errors.push(
                        `Documentary candidate ${candidate.candidateId} contains duplicate evidence identity ${evidenceId}.`
                    );

                }


                evidenceIds.add(
                    evidenceId
                );

            }

        }


        if (
            errors.length >
            0
        ) {

            return {

                candidates:
                    [],

                errors:
                    errors.sort()

            };

        }


        const candidates:
            ScientificCompositionCandidate[] =
            [];


        for (
            const match
            of [...input.functionalMatches].sort(
                (a, b) =>
                    a.matchId.localeCompare(
                        b.matchId
                    )
            )
        ) {

            candidates.push({

                candidateId:
                    encode([
                        "SCIENTIFIC-COMPOSITION-CANDIDATE",
                        "FUNCTIONAL_COMPLEMENTARITY",
                        match.matchId
                    ]),

                kind:
                    "FUNCTIONAL_COMPLEMENTARITY",

                sourceParticipantId:
                    match.consumerParticipantId,

                targetParticipantId:
                    match.providerParticipantId,

                functionalMatchId:
                    match.matchId,

                needId:
                    match.needId,

                needSubject:
                    match.needSubject,

                contributionId:
                    match.contributionId,

                contributionKind:
                    match.contributionKind,

                contributionSubject:
                    match.contributionSubject,

                evidenceBasis:
                    match.evidenceBasis,

                evidenceIds:
                    [...match.evidenceIds].sort(),

                evaluationStatus:
                    "UNEVALUATED"

            });

        }


        for (
            const documentary
            of [...input.documentaryCandidates].sort(
                (a, b) =>
                    a.candidateId.localeCompare(
                        b.candidateId
                    )
            )
        ) {

            candidates.push({

                candidateId:
                    encode([
                        "SCIENTIFIC-COMPOSITION-CANDIDATE",
                        "DOCUMENTARY_COMPOSITION",
                        documentary.candidateId
                    ]),

                kind:
                    "DOCUMENTARY_COMPOSITION",

                sourceParticipantId:
                    documentary.subjectParticipantId,

                targetParticipantId:
                    documentary.objectParticipantId,

                documentaryCandidateId:
                    documentary.candidateId,

                relation:
                    documentary.relation,

                evidenceIds:
                    [...documentary.evidenceIds].sort(),

                evaluationStatus:
                    "UNEVALUATED"

            });

        }


        candidates.sort(
            (a, b) =>
                a.candidateId.localeCompare(
                    b.candidateId
                )
        );


        return {

            candidates,

            errors:
                []

        };

    }

}