import type {
    ScientificCompositionFrameObjective
} from "../scientific-composition-frame/ScientificCompositionFrame.js";

import type {
    ScientificCompositionContribution
} from "../scientific-composition-frame/ScientificCompositionContribution.js";

import type {
    ScientificProtocolCompositionProfile
} from "../scientific-protocol-composition-profile/ScientificProtocolCompositionProfile.js";

import type {
    ScientificCompositionComplementarityMatch,
    ScientificCompositionObjectiveCoverage
} from "./ScientificCompositionComplementarityMatch.js";

import type {
    ScientificCompositionComplementarityResult
} from "./ScientificCompositionComplementarityResult.js";


export interface ScientificCompositionComplementarityEngineInput {

    objective:
        ScientificCompositionFrameObjective;

    profiles:
        ScientificProtocolCompositionProfile[];

}


function normalizeSubject(
    value:
        string
): string {

    return value
        .replace(
            /\s+/g,
            " "
        )
        .trim()
        .toUpperCase();

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


export class ScientificCompositionComplementarityEngine {

    discover(
        input:
            ScientificCompositionComplementarityEngineInput
    ): ScientificCompositionComplementarityResult {

        const errors:
            string[] = [];


        const protocolIds =
            new Set<string>();

        const contributionIds =
            new Set<string>();

        const needIds =
            new Set<string>();


        for (
            const profile
            of input.profiles
        ) {

            if (
                protocolIds.has(
                    profile.protocolId
                )
            ) {

                errors.push(
                    `Duplicate protocol composition profile ${profile.protocolId}.`
                );

            }


            protocolIds.add(
                profile.protocolId
            );


            for (
                const contribution
                of profile.contributions
            ) {

                if (
                    contribution.participantId !==
                    profile.protocolId
                ) {

                    errors.push(
                        `Contribution ${contribution.contributionId} does not belong to profile ${profile.protocolId}.`
                    );

                }


                if (
                    contributionIds.has(
                        contribution.contributionId
                    )
                ) {

                    errors.push(
                        `Duplicate composition contribution ${contribution.contributionId}.`
                    );

                }


                contributionIds.add(
                    contribution.contributionId
                );

            }


            for (
                const need
                of profile.needs
            ) {

                if (
                    need.participantId !==
                    profile.protocolId
                ) {

                    errors.push(
                        `Need ${need.needId} does not belong to profile ${profile.protocolId}.`
                    );

                }


                if (
                    needIds.has(
                        need.needId
                    )
                ) {

                    errors.push(
                        `Duplicate composition need ${need.needId}.`
                    );

                }


                needIds.add(
                    need.needId
                );

            }

        }


        if (
            errors.length >
            0
        ) {

            return {

                matches: [],

                unresolvedNeedIds: [],

                objectiveCoverage: [],

                errors

            };

        }


        const contributions:
            ScientificCompositionContribution[] =
            input.profiles
                .flatMap(
                    profile =>
                        profile.contributions
                )
                .sort(
                    (a, b) =>
                        a.contributionId.localeCompare(
                            b.contributionId
                        )
                );


        const contributionsBySubject =
            new Map<
                string,
                ScientificCompositionContribution[]
            >();


        for (
            const contribution
            of contributions
        ) {

            const subject =
                normalizeSubject(
                    contribution.subject
                );


            const existing =
                contributionsBySubject.get(
                    subject
                ) ?? [];


            existing.push(
                contribution
            );


            contributionsBySubject.set(
                subject,
                existing
            );

        }


        const matches:
            ScientificCompositionComplementarityMatch[] = [];

        const unresolvedNeedIds:
            string[] = [];


        for (
            const profile
            of [...input.profiles].sort(
                (a, b) =>
                    a.protocolId.localeCompare(
                        b.protocolId
                    )
            )
        ) {

            for (
                const need
                of [...profile.needs].sort(
                    (a, b) =>
                        a.needId.localeCompare(
                            b.needId
                        )
                )
            ) {

                const providers =
                    (
                        contributionsBySubject.get(
                            normalizeSubject(
                                need.subject
                            )
                        ) ?? []
                    )
                    .filter(
                        contribution =>
                            contribution.participantId !==
                            profile.protocolId
                    );


                if (
                    providers.length ===
                    0
                ) {

                    unresolvedNeedIds.push(
                        need.needId
                    );

                    continue;

                }


                for (
                    const provider
                    of providers
                ) {

                    matches.push({

                        matchId:
                            encode([
                                "SCIENTIFIC-COMPOSITION-COMPLEMENTARITY",
                                need.needId,
                                provider.contributionId
                            ]),

                        consumerParticipantId:
                            profile.protocolId,

                        providerParticipantId:
                            provider.participantId,

                        needId:
                            need.needId,

                        needSubject:
                            need.subject,

                        contributionId:
                            provider.contributionId,

                        contributionKind:
                            provider.kind,

                        contributionSubject:
                            provider.subject,

                        evidenceBasis:
                            "EXACT_NORMALIZED_SUBJECT_MATCH",

                        evidenceIds: [
                            ...need.evidenceIds,
                            ...provider.evidenceIds
                        ].sort(),

                        evaluationStatus:
                            "UNEVALUATED"

                    });

                }

            }

        }


        matches.sort(
            (a, b) =>
                a.matchId.localeCompare(
                    b.matchId
                )
        );


        unresolvedNeedIds.sort();


        const objectiveCoverage:
            ScientificCompositionObjectiveCoverage[] =
            [...input.objective.requiredSubjects]
                .sort()
                .map(
                    requiredSubject => {

                        const providers =
                            (
                                contributionsBySubject.get(
                                    normalizeSubject(
                                        requiredSubject
                                    )
                                ) ?? []
                            );


                        return {

                            requiredSubject,

                            status:
                                providers.length >
                                0
                                    ? "COVERED" as const
                                    : "UNRESOLVED" as const,

                            providerParticipantIds:
                                [
                                    ...new Set(
                                        providers.map(
                                            contribution =>
                                                contribution.participantId
                                        )
                                    )
                                ].sort(),

                            contributionIds:
                                providers
                                    .map(
                                        contribution =>
                                            contribution.contributionId
                                    )
                                    .sort()

                        };

                    }
                );


        return {

            matches,

            unresolvedNeedIds,

            objectiveCoverage,

            errors: []

        };

    }

}
