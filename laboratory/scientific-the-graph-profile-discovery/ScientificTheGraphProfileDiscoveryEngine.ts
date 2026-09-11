import type {
    ScientificProtocolCompositionProfile
} from "../scientific-protocol-composition-profile/ScientificProtocolCompositionProfile.js";

import type {
    ScientificTheGraphProductDiscoveryRequest
} from "../scientific-the-graph-product-discovery/ScientificTheGraphProductDiscovery.js";

import type {
    ScientificTheGraphExpandedDiscoveryRequest,
    ScientificTheGraphProfileDiscoveryExpansionResult,
    ScientificTheGraphProfileDiscoveryTerm,
    ScientificTheGraphProfileDiscoveryTermOriginKind
} from "./ScientificTheGraphProfileDiscovery.js";


interface MutableTerm {

    term:
        string;

    originKinds:
        Set<ScientificTheGraphProfileDiscoveryTermOriginKind>;

    sourceArtifactIds:
        Set<string>;

    evidenceIds:
        Set<string>;

    sourceSubjects:
        Set<string>;

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


function uniqueSorted(
    values:
        string[]
): string[] {

    return [
        ...new Set(
            values
        )
    ].sort();

}


function normalizeWhitespace(
    value:
        string
): string {

    return value
        .trim()
        .replace(
            /\s+/g,
            " "
        );

}


const STOP_WORDS =
    new Set([
        "call",
        "external",
        "false",
        "from",
        "function",
        "interface",
        "level",
        "member",
        "other",
        "payable",
        "true",
        "with",
        "without",
        "that",
        "this",
        "then",
        "than",
        "into",
        "onto",
        "over",
        "under",
        "when",
        "where",
        "which",
        "what",
        "have",
        "has",
        "does",
        "done",
        "new",
        "get",
        "set",
        "for",
        "and",
        "the",
        "from",
        "low",
        "high"
    ]);


function tokenizeSubject(
    subject:
        string
): string[] {

    const camelSeparated =
        subject.replace(
            /([a-z0-9])([A-Z])/g,
            "$1 $2"
        );


    const normalized =
        camelSeparated
            .replace(
                /[^A-Za-z0-9]+/g,
                " "
            )
            .toLowerCase()
            .trim();


    if (
        normalized.length ===
        0
    ) {

        return [];

    }


    return uniqueSorted(
        normalized
            .split(
                /\s+/
            )
            .filter(
                token =>
                    token.length >=
                        4 &&
                    !STOP_WORDS.has(
                        token
                    ) &&
                    !/^erc\d+$/
                        .test(
                            token
                        ) &&
                    !/^\d+$/
                        .test(
                            token
                        )
            )
    );

}


function protocolAliases(
    protocolId:
        string
): string[] {

    const exact =
        protocolId.trim();

    const compact =
        exact.replace(
            /[^A-Za-z0-9]/g,
            ""
        );


    return uniqueSorted([
        exact,
        ...(
            compact !== exact
                ? [compact]
                : []
        )
    ]);

}


function addMutableTerm(
    map:
        Map<string, MutableTerm>,
    term:
        string,
    originKind:
        ScientificTheGraphProfileDiscoveryTermOriginKind,
    artifactId:
        string | null,
    evidenceIds:
        string[],
    sourceSubject:
        string
): void {

    const normalizedTerm =
        normalizeWhitespace(
            term
        );


    if (
        normalizedTerm.length ===
        0
    ) {

        return;

    }


    const key =
        normalizedTerm.toLowerCase();


    let mutable =
        map.get(
            key
        );


    if (
        mutable ===
        undefined
    ) {

        mutable = {

            term:
                normalizedTerm,

            originKinds:
                new Set(),

            sourceArtifactIds:
                new Set(),

            evidenceIds:
                new Set(),

            sourceSubjects:
                new Set()

        };


        map.set(
            key,
            mutable
        );

    }


    mutable.originKinds.add(
        originKind
    );


    if (
        artifactId !==
        null
    ) {

        mutable.sourceArtifactIds.add(
            artifactId
        );

    }


    for (
        const evidenceId
        of evidenceIds
    ) {

        if (
            evidenceId.trim().length >
            0
        ) {

            mutable.evidenceIds.add(
                evidenceId
            );

        }

    }


    if (
        sourceSubject.trim().length >
        0
    ) {

        mutable.sourceSubjects.add(
            sourceSubject
        );

    }

}


export class ScientificTheGraphProfileDiscoveryEngine {

    expand(
        profiles:
            ScientificProtocolCompositionProfile[],
        baseRequests:
            ScientificTheGraphProductDiscoveryRequest[],
        maxDerivedTermsPerProfile:
            number =
            6
    ): ScientificTheGraphProfileDiscoveryExpansionResult {

        const errors:
            string[] =
            [];


        if (
            !Number.isSafeInteger(
                maxDerivedTermsPerProfile
            ) ||
            maxDerivedTermsPerProfile <
                0
        ) {

            return {

                requests:
                    [],

                terms:
                    [],

                errors: [
                    "maxDerivedTermsPerProfile must be a non-negative safe integer."
                ]

            };

        }


        const profileById =
            new Map<
                string,
                ScientificProtocolCompositionProfile
            >();


        for (
            const profile
            of profiles
        ) {

            if (
                profileById.has(
                    profile.profileId
                )
            ) {

                errors.push(
                    `Duplicate profile ${profile.profileId} in profile-derived Graph discovery.`
                );

                continue;

            }


            profileById.set(
                profile.profileId,
                profile
            );

        }


        const seenRequestIds =
            new Set<string>();

        const expandedRequests:
            ScientificTheGraphExpandedDiscoveryRequest[] =
            [];

        const allTerms:
            ScientificTheGraphProfileDiscoveryTerm[] =
            [];


        for (
            const baseRequest
            of baseRequests
        ) {

            if (
                seenRequestIds.has(
                    baseRequest.requestId
                )
            ) {

                errors.push(
                    `Duplicate base Graph discovery request ${baseRequest.requestId}.`
                );

                continue;

            }


            seenRequestIds.add(
                baseRequest.requestId
            );


            const profile =
                profileById.get(
                    baseRequest.profileId
                );


            if (
                profile ===
                undefined
            ) {

                errors.push(
                    `Graph discovery request ${baseRequest.requestId} references unknown profile ${baseRequest.profileId}.`
                );

                continue;

            }


            if (
                baseRequest.protocolId !==
                    profile.protocolId ||
                baseRequest.sourceId !==
                    profile.sourceId ||
                baseRequest.sourceRevision !==
                    profile.sourceRevision
            ) {

                errors.push(
                    `Graph discovery request ${baseRequest.requestId} does not match exact source-scoped profile identity.`
                );

                continue;

            }


            const mutableTerms =
                new Map<
                    string,
                    MutableTerm
                >();


            for (
                const alias
                of protocolAliases(
                    profile.protocolId
                )
            ) {

                addMutableTerm(
                    mutableTerms,
                    alias,
                    "PROTOCOL_IDENTITY",
                    null,
                    [],
                    profile.protocolId
                );

            }


            for (
                const contribution
                of profile.contributions
            ) {

                for (
                    const token
                    of tokenizeSubject(
                        contribution.subject
                    )
                ) {

                    addMutableTerm(
                        mutableTerms,
                        token,
                        "CONTRIBUTION_SUBJECT",
                        contribution.contributionId,
                        contribution.evidenceIds,
                        contribution.subject
                    );

                }

            }


            for (
                const need
                of profile.needs
            ) {

                for (
                    const token
                    of tokenizeSubject(
                        need.subject
                    )
                ) {

                    addMutableTerm(
                        mutableTerms,
                        token,
                        "NEED_SUBJECT",
                        need.needId,
                        need.evidenceIds,
                        need.subject
                    );

                }

            }


            const identityKeys =
                new Set(
                    protocolAliases(
                        profile.protocolId
                    )
                        .map(
                            alias =>
                                alias.toLowerCase()
                        )
                );


            const materializedTerms =
                [
                    ...mutableTerms.entries()
                ]
                    .map(
                        (
                            [
                                key,
                                mutable
                            ]
                        ) => {

                            const identity =
                                identityKeys.has(
                                    key
                                );


                            const evidenceIds =
                                [
                                    ...mutable.evidenceIds
                                ]
                                    .sort();


                            const sourceArtifactIds =
                                [
                                    ...mutable.sourceArtifactIds
                                ]
                                    .sort();


                            const sourceSubjects =
                                [
                                    ...mutable.sourceSubjects
                                ]
                                    .sort();


                            const originKinds =
                                [
                                    ...mutable.originKinds
                                ]
                                    .sort();


                            /*
                             * Discovery score:
                             *
                             * identity terms always win;
                             * otherwise repeated independent
                             * profile evidence increases search
                             * priority.
                             *
                             * This is search ordering only.
                             */
                            const discoveryScore =
                                identity
                                    ? 1_000_000
                                    : (
                                        evidenceIds.length *
                                            100 +
                                        sourceArtifactIds.length *
                                            10 +
                                        sourceSubjects.length
                                    );


                            const termId =
                                encode([
                                    "SCIENTIFIC-THE-GRAPH-PROFILE-DISCOVERY-TERM",
                                    profile.protocolId,
                                    profile.profileId,
                                    profile.sourceId,
                                    profile.sourceRevision ??
                                        "NO-REVISION",
                                    mutable.term,
                                    ...originKinds,
                                    ...sourceArtifactIds,
                                    ...evidenceIds
                                ]);


                            return {

                                termId,

                                protocolId:
                                    profile.protocolId,

                                profileId:
                                    profile.profileId,

                                term:
                                    mutable.term,

                                originKinds,

                                sourceArtifactIds,

                                evidenceIds,

                                sourceSubjects,

                                discoveryScore

                            } satisfies
                                ScientificTheGraphProfileDiscoveryTerm;

                        }
                    );


            const identityTerms =
                materializedTerms
                    .filter(
                        term =>
                            term.originKinds.includes(
                                "PROTOCOL_IDENTITY"
                            )
                    )
                    .sort(
                        (
                            a,
                            b
                        ) =>
                            a.term.localeCompare(
                                b.term
                            )
                    );


            const derivedTerms =
                materializedTerms
                    .filter(
                        term =>
                            !term.originKinds.includes(
                                "PROTOCOL_IDENTITY"
                            )
                    )
                    .sort(
                        (
                            a,
                            b
                        ) =>
                            (
                                b.discoveryScore -
                                a.discoveryScore
                            ) ||
                            a.term.localeCompare(
                                b.term
                            )
                    )
                    .slice(
                        0,
                        maxDerivedTermsPerProfile
                    );


            const selectedTerms =
                [
                    ...identityTerms,
                    ...derivedTerms
                ];


            const searchTerms =
                selectedTerms.map(
                    term =>
                        term.term
                );


            const requestId =
                encode([
                    "SCIENTIFIC-THE-GRAPH-EXPANDED-DISCOVERY-REQUEST",
                    profile.protocolId,
                    profile.profileId,
                    profile.sourceId,
                    profile.sourceRevision ??
                        "NO-REVISION",
                    ...selectedTerms.map(
                        term =>
                            term.termId
                    )
                ]);


            expandedRequests.push({

                requestId,

                protocolId:
                    profile.protocolId,

                profileId:
                    profile.profileId,

                sourceId:
                    profile.sourceId,

                ...(
                    profile.sourceRevision !==
                    undefined
                        ? {
                            sourceRevision:
                                profile.sourceRevision
                        }
                        : {}
                ),

                searchTerms,

                searchBasis:
                    "PROTOCOL_IDENTITY_AND_PROFILE_TERMS",

                targetProductKind:
                    "SUBGRAPH",

                termIds:
                    selectedTerms.map(
                        term =>
                            term.termId
                    )

            });


            allTerms.push(
                ...selectedTerms
            );

        }


        if (
            errors.length >
            0
        ) {

            return {

                requests:
                    [],

                terms:
                    [],

                errors:
                    uniqueSorted(
                        errors
                    )

            };

        }


        return {

            requests:
                expandedRequests.sort(
                    (
                        a,
                        b
                    ) =>
                        a.requestId.localeCompare(
                            b.requestId
                        )
                ),

            terms:
                allTerms.sort(
                    (
                        a,
                        b
                    ) =>
                        a.termId.localeCompare(
                            b.termId
                        )
                ),

            errors:
                []

        };

    }

}