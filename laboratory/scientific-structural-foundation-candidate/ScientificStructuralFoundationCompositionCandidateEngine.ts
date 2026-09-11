import type {
    ScientificCompositionProvenance
} from "../scientific-cross-protocol-composition/ScientificCompositionCandidate.js";

import type {
    ScientificCrossProtocolCompositionResult
} from "../scientific-cross-protocol-composition/ScientificCrossProtocolCompositionResult.js";

import type {
    ScientificStructuralFoundationCompositionCandidate,
    ScientificStructuralFoundationCompositionCandidateResult
} from "./ScientificStructuralFoundationCompositionCandidate.js";


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


function provenanceKey(
    provenance:
        ScientificCompositionProvenance
): string {

    return encode([
        provenance.kind,
        provenance.sourceId,
        provenance.sourceRevision ??
            "NO-REVISION",
        provenance.evidenceId
    ]);

}


function isProtocolId(
    value:
        string
): boolean {

    return /^ERC-[1-9][0-9]*$/.test(
        value
    );

}


export class ScientificStructuralFoundationCompositionCandidateEngine {

    normalize(
        input:
            ScientificCrossProtocolCompositionResult
    ): ScientificStructuralFoundationCompositionCandidateResult {

        if (
            input.errors.length >
            0
        ) {

            return {

                candidates:
                    [],

                ignoredCandidateIds:
                    [],

                errors:
                    [
                        "Cannot normalize structural-foundation candidates from cross-protocol discovery containing errors.",
                        ...input.errors
                    ].sort()

            };

        }


        const errors:
            string[] = [];

        const ignoredCandidateIds:
            string[] = [];

        const normalizedCandidates:
            ScientificStructuralFoundationCompositionCandidate[] =
            [];

        const normalizedCandidateIds =
            new Set<string>();


        for (
            const candidate
            of [...input.candidates].sort(
                (a, b) =>
                    a.candidateId.localeCompare(
                        b.candidateId
                    )
            )
        ) {

            if (
                candidate.mechanism !==
                "SHARED_PROTOCOL_FOUNDATION"
            ) {

                ignoredCandidateIds.push(
                    candidate.candidateId
                );

                continue;

            }


            const candidateErrors:
                string[] = [];


            if (
                !candidate.candidateId.trim()
            ) {

                candidateErrors.push(
                    "Structural-foundation source candidate has an empty identity."
                );

            }


            if (
                candidate.participantA.kind !==
                    "PROTOCOL" ||
                candidate.participantB.kind !==
                    "PROTOCOL"
            ) {

                candidateErrors.push(
                    `Structural-foundation candidate ${candidate.candidateId} must contain two protocol participants.`
                );

            }


            if (
                !isProtocolId(
                    candidate.participantA.id
                ) ||
                !isProtocolId(
                    candidate.participantB.id
                )
            ) {

                candidateErrors.push(
                    `Structural-foundation candidate ${candidate.candidateId} contains an unsupported participant identity.`
                );

            }


            if (
                candidate.participantA.id ===
                candidate.participantB.id
            ) {

                candidateErrors.push(
                    `Structural-foundation candidate ${candidate.candidateId} is not cross-protocol.`
                );

            }


            if (
                candidate.foundationProtocolId ===
                    undefined ||
                !isProtocolId(
                    candidate.foundationProtocolId
                )
            ) {

                candidateErrors.push(
                    `Structural-foundation candidate ${candidate.candidateId} has no valid ERC-family foundation identity.`
                );

            }


            if (
                candidate.evaluationStatus !==
                "UNEVALUATED"
            ) {

                candidateErrors.push(
                    `Structural-foundation candidate ${candidate.candidateId} is not unevaluated.`
                );

            }


            if (
                candidate.provenance.length ===
                0
            ) {

                candidateErrors.push(
                    `Structural-foundation candidate ${candidate.candidateId} has no discovery provenance.`
                );

            }


            const provenanceIds =
                new Set<string>();


            for (
                const provenance
                of candidate.provenance
            ) {

                if (
                    provenance.kind !==
                    "STRUCTURAL_PROTOCOL_RELATION"
                ) {

                    candidateErrors.push(
                        `Structural-foundation candidate ${candidate.candidateId} contains non-structural provenance ${provenance.kind}.`
                    );

                }


                if (
                    !provenance.sourceId.trim()
                ) {

                    candidateErrors.push(
                        `Structural-foundation candidate ${candidate.candidateId} contains an empty provenance source identity.`
                    );

                }


                if (
                    provenance.sourceRevision !==
                        undefined &&
                    !provenance.sourceRevision.trim()
                ) {

                    candidateErrors.push(
                        `Structural-foundation candidate ${candidate.candidateId} contains an empty source revision.`
                    );

                }


                if (
                    !provenance.evidenceId.trim()
                ) {

                    candidateErrors.push(
                        `Structural-foundation candidate ${candidate.candidateId} contains an empty evidence identity.`
                    );

                }


                const key =
                    provenanceKey(
                        provenance
                    );


                if (
                    provenanceIds.has(
                        key
                    )
                ) {

                    candidateErrors.push(
                        `Structural-foundation candidate ${candidate.candidateId} contains duplicate provenance ${key}.`
                    );

                }


                provenanceIds.add(
                    key
                );

            }


            if (
                candidateErrors.length >
                0
            ) {

                errors.push(
                    ...candidateErrors
                );

                continue;

            }


            const participantIds =
                [
                    candidate.participantA.id,
                    candidate.participantB.id
                ].sort();


            const participantAId =
                participantIds[0];

            const participantBId =
                participantIds[1];

            const foundationProtocolId =
                candidate.foundationProtocolId!;


            const normalizedCandidateId =
                encode([
                    "SCIENTIFIC-STRUCTURAL-FOUNDATION-COMPOSITION-CANDIDATE",
                    participantAId,
                    participantBId,
                    foundationProtocolId
                ]);


            if (
                normalizedCandidateIds.has(
                    normalizedCandidateId
                )
            ) {

                errors.push(
                    `Duplicate normalized structural-foundation candidate ${normalizedCandidateId}.`
                );

                continue;

            }


            normalizedCandidateIds.add(
                normalizedCandidateId
            );


            const provenance =
                [...candidate.provenance]
                    .sort(
                        (a, b) =>
                            provenanceKey(
                                a
                            ).localeCompare(
                                provenanceKey(
                                    b
                                )
                            )
                    );


            const evidenceIds =
                [
                    ...new Set(
                        provenance.map(
                            item =>
                                item.evidenceId
                        )
                    )
                ].sort();


            normalizedCandidates.push({

                candidateId:
                    normalizedCandidateId,

                sourceCandidateId:
                    candidate.candidateId,

                participantAId,

                participantBId,

                directionality:
                    "UNDIRECTED",

                mechanism:
                    "SHARED_PROTOCOL_FOUNDATION",

                foundationProtocolId,

                evidenceIds,

                provenance,

                evaluationStatus:
                    "UNEVALUATED"

            });

        }


        if (
            errors.length >
            0
        ) {

            return {

                candidates:
                    [],

                ignoredCandidateIds:
                    [...ignoredCandidateIds].sort(),

                errors:
                    errors.sort()

            };

        }


        normalizedCandidates.sort(
            (a, b) =>
                a.candidateId.localeCompare(
                    b.candidateId
                )
        );


        return {

            candidates:
                normalizedCandidates,

            ignoredCandidateIds:
                [...ignoredCandidateIds].sort(),

            errors:
                []

        };

    }

}