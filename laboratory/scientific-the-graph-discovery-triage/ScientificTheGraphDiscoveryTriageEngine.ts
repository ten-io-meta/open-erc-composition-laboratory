import type {
    ScientificTheGraphSubgraphMcpKeywordDiscoveryResult
} from "../scientific-the-graph-subgraph-mcp/ScientificTheGraphSubgraphMcp.js";

import type {
    ScientificTheGraphExpandedDiscoveryRequest,
    ScientificTheGraphProfileDiscoveryTerm,
    ScientificTheGraphProfileDiscoveryTermOriginKind
} from "../scientific-the-graph-profile-discovery/ScientificTheGraphProfileDiscovery.js";

import type {
    ScientificTheGraphDiscoveryTriageCandidate,
    ScientificTheGraphDiscoveryTriageResult
} from "./ScientificTheGraphDiscoveryTriage.js";


export interface ScientificTheGraphDiscoveryTriageInput {

    requests:
        ScientificTheGraphExpandedDiscoveryRequest[];

    terms:
        ScientificTheGraphProfileDiscoveryTerm[];

    discovery:
        ScientificTheGraphSubgraphMcpKeywordDiscoveryResult;

}


interface MutableCandidate {

    request:
        ScientificTheGraphExpandedDiscoveryRequest;

    providerMode:
        "LIVE" | "FIXTURE";

    subgraphId:
        string;

    ipfsHash:
        string;

    displayNames:
        Set<string>;

    matchedTerms:
        Set<string>;

    matchedTermIds:
        Set<string>;

    matchedOriginKinds:
        Set<ScientificTheGraphProfileDiscoveryTermOriginKind>;

    sourceArtifactIds:
        Set<string>;

    evidenceIds:
        Set<string>;

    searchIds:
        Set<string>;

    hitIds:
        Set<string>;

    identityMatch:
        boolean;

    derivedTerms:
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


export class ScientificTheGraphDiscoveryTriageEngine {

    triage(
        input:
            ScientificTheGraphDiscoveryTriageInput
    ): ScientificTheGraphDiscoveryTriageResult {

        const errors:
            string[] =
            [];


        if (
            input.discovery.errors.length >
            0
        ) {

            return {

                candidates:
                    [],

                prioritized:
                    [],

                deferred:
                    [],

                errors:
                    input.discovery.errors.map(
                        error =>
                            `Upstream MCP discovery error: ${error}`
                    )

            };

        }


        const requestById =
            new Map<
                string,
                ScientificTheGraphExpandedDiscoveryRequest
            >();

        const termById =
            new Map<
                string,
                ScientificTheGraphProfileDiscoveryTerm
            >();


        for (
            const term
            of input.terms
        ) {

            if (
                termById.has(
                    term.termId
                )
            ) {

                errors.push(
                    `Duplicate profile discovery term ${term.termId}.`
                );

                continue;

            }


            termById.set(
                term.termId,
                term
            );

        }


        for (
            const request
            of input.requests
        ) {

            if (
                requestById.has(
                    request.requestId
                )
            ) {

                errors.push(
                    `Duplicate expanded Graph discovery request ${request.requestId}.`
                );

                continue;

            }


            requestById.set(
                request.requestId,
                request
            );


            if (
                request.searchTerms.length !==
                request.termIds.length
            ) {

                errors.push(
                    `Expanded request ${request.requestId} has mismatched searchTerms and termIds lengths.`
                );

                continue;

            }


            const seenRequestTerms =
                new Set<string>();


            for (
                const termId
                of request.termIds
            ) {

                const term =
                    termById.get(
                        termId
                    );


                if (
                    term ===
                    undefined
                ) {

                    errors.push(
                        `Expanded request ${request.requestId} references unknown term ${termId}.`
                    );

                    continue;

                }


                if (
                    term.protocolId !==
                        request.protocolId ||
                    term.profileId !==
                        request.profileId
                ) {

                    errors.push(
                        `Expanded request ${request.requestId} references a term from another protocol/profile.`
                    );

                }


                if (
                    !request.searchTerms.includes(
                        term.term
                    )
                ) {

                    errors.push(
                        `Expanded request ${request.requestId} term ${termId} is not represented in searchTerms.`
                    );

                }


                if (
                    seenRequestTerms.has(
                        term.term
                    )
                ) {

                    errors.push(
                        `Expanded request ${request.requestId} contains duplicate selected term ${term.term}.`
                    );

                }


                seenRequestTerms.add(
                    term.term
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

                prioritized:
                    [],

                deferred:
                    [],

                errors:
                    uniqueSorted(
                        errors
                    )

            };

        }


        const candidateByKey =
            new Map<
                string,
                MutableCandidate
            >();

        const seenHitIds =
            new Set<string>();

        const deploymentByRequestAndSubgraph =
            new Map<
                string,
                string
            >();


        for (
            const search
            of input.discovery.searches
        ) {

            const request =
                requestById.get(
                    search.requestId
                );


            if (
                request ===
                undefined
            ) {

                errors.push(
                    `MCP search ${search.searchId} references unknown expanded request ${search.requestId}.`
                );

                continue;

            }


            if (
                search.protocolId !==
                request.protocolId
            ) {

                errors.push(
                    `MCP search ${search.searchId} protocol does not match its request.`
                );

                continue;

            }


            if (
                !request.searchTerms.includes(
                    search.searchTerm
                )
            ) {

                errors.push(
                    `MCP search ${search.searchId} uses unrequested term ${search.searchTerm}.`
                );

                continue;

            }


            const matchingTerms =
                request.termIds
                    .map(
                        termId =>
                            termById.get(
                                termId
                            )
                    )
                    .filter(
                        (
                            term
                        ): term is ScientificTheGraphProfileDiscoveryTerm =>
                            term !==
                                undefined &&
                            term.term ===
                                search.searchTerm
                    );


            if (
                matchingTerms.length !==
                1
            ) {

                errors.push(
                    `MCP search ${search.searchId} resolves to ${matchingTerms.length} profile terms instead of exactly one.`
                );

                continue;

            }


            const term =
                matchingTerms[0];


            for (
                const hit
                of search.hits
            ) {

                if (
                    seenHitIds.has(
                        hit.hitId
                    )
                ) {

                    errors.push(
                        `Duplicate MCP discovery hit ${hit.hitId}.`
                    );

                    continue;

                }


                seenHitIds.add(
                    hit.hitId
                );


                const subgraphScope =
                    encode([
                        request.requestId,
                        hit.subgraphId
                    ]);


                const previouslyObservedDeployment =
                    deploymentByRequestAndSubgraph.get(
                        subgraphScope
                    );


                if (
                    previouslyObservedDeployment !==
                        undefined &&
                    previouslyObservedDeployment !==
                        hit.ipfsHash
                ) {

                    errors.push(
                        `Subgraph ${hit.subgraphId} changed deployment within discovery request ${request.requestId}.`
                    );

                    continue;

                }


                deploymentByRequestAndSubgraph.set(
                    subgraphScope,
                    hit.ipfsHash
                );


                const candidateKey =
                    encode([
                        request.requestId,
                        hit.subgraphId,
                        hit.ipfsHash
                    ]);


                let mutable =
                    candidateByKey.get(
                        candidateKey
                    );


                if (
                    mutable ===
                    undefined
                ) {

                    mutable = {

                        request,

                        providerMode:
                            search.providerMode,

                        subgraphId:
                            hit.subgraphId,

                        ipfsHash:
                            hit.ipfsHash,

                        displayNames:
                            new Set(),

                        matchedTerms:
                            new Set(),

                        matchedTermIds:
                            new Set(),

                        matchedOriginKinds:
                            new Set(),

                        sourceArtifactIds:
                            new Set(),

                        evidenceIds:
                            new Set(),

                        searchIds:
                            new Set(),

                        hitIds:
                            new Set(),

                        identityMatch:
                            false,

                        derivedTerms:
                            new Set()

                    };


                    candidateByKey.set(
                        candidateKey,
                        mutable
                    );

                }


                if (
                    mutable.providerMode !==
                    search.providerMode
                ) {

                    errors.push(
                        `Candidate ${hit.subgraphId} mixes provider modes within one discovery request.`
                    );

                    continue;

                }


                mutable.displayNames.add(
                    hit.displayName
                );

                mutable.matchedTerms.add(
                    term.term
                );

                mutable.matchedTermIds.add(
                    term.termId
                );

                mutable.searchIds.add(
                    search.searchId
                );

                mutable.hitIds.add(
                    hit.hitId
                );


                for (
                    const originKind
                    of term.originKinds
                ) {

                    mutable.matchedOriginKinds.add(
                        originKind
                    );


                    if (
                        originKind ===
                        "PROTOCOL_IDENTITY"
                    ) {

                        mutable.identityMatch =
                            true;

                    }


                    if (
                        originKind ===
                            "CONTRIBUTION_SUBJECT" ||
                        originKind ===
                            "NEED_SUBJECT"
                    ) {

                        mutable.derivedTerms.add(
                            term.term
                        );

                    }

                }


                for (
                    const artifactId
                    of term.sourceArtifactIds
                ) {

                    mutable.sourceArtifactIds.add(
                        artifactId
                    );

                }


                for (
                    const evidenceId
                    of term.evidenceIds
                ) {

                    mutable.evidenceIds.add(
                        evidenceId
                    );

                }

            }

        }


        if (
            errors.length >
            0
        ) {

            return {

                candidates:
                    [],

                prioritized:
                    [],

                deferred:
                    [],

                errors:
                    uniqueSorted(
                        errors
                    )

            };

        }


        const candidates:
            ScientificTheGraphDiscoveryTriageCandidate[] =
            [];


        for (
            const mutable
            of candidateByKey.values()
        ) {

            const derivedTermCount =
                mutable.derivedTerms.size;

            const totalDistinctTermCount =
                mutable.matchedTerms.size;


            const prioritized =
                mutable.identityMatch ||
                derivedTermCount >=
                    2;


            const triageBasis =
                mutable.identityMatch
                    ? "EXPLICIT_PROTOCOL_IDENTITY_HIT" as const
                    : derivedTermCount >=
                        2
                        ? "MULTIPLE_PROFILE_DERIVED_TERM_HITS" as const
                        : "SINGLE_PROFILE_DERIVED_TERM_HIT" as const;


            const candidateId =
                encode([
                    "SCIENTIFIC-THE-GRAPH-DISCOVERY-TRIAGE-CANDIDATE",
                    mutable.request.protocolId,
                    mutable.request.profileId,
                    mutable.request.sourceId,
                    mutable.request.sourceRevision ??
                        "NO-REVISION",
                    mutable.subgraphId,
                    mutable.ipfsHash,
                    ...[
                        ...mutable.matchedTerms
                    ].sort()
                ]);


            candidates.push({

                candidateId,

                requestId:
                    mutable.request.requestId,

                protocolId:
                    mutable.request.protocolId,

                profileId:
                    mutable.request.profileId,

                sourceId:
                    mutable.request.sourceId,

                ...(
                    mutable.request.sourceRevision !==
                    undefined
                        ? {
                            sourceRevision:
                                mutable.request.sourceRevision
                        }
                        : {}
                ),

                provider:
                    "THE_GRAPH",

                providerMode:
                    mutable.providerMode,

                productKind:
                    "SUBGRAPH",

                subgraphId:
                    mutable.subgraphId,

                ipfsHash:
                    mutable.ipfsHash,

                displayNames:
                    [
                        ...mutable.displayNames
                    ].sort(),

                matchedTerms:
                    [
                        ...mutable.matchedTerms
                    ].sort(),

                matchedTermIds:
                    [
                        ...mutable.matchedTermIds
                    ].sort(),

                matchedOriginKinds:
                    [
                        ...mutable.matchedOriginKinds
                    ].sort(),

                sourceArtifactIds:
                    [
                        ...mutable.sourceArtifactIds
                    ].sort(),

                evidenceIds:
                    [
                        ...mutable.evidenceIds
                    ].sort(),

                searchIds:
                    [
                        ...mutable.searchIds
                    ].sort(),

                hitIds:
                    [
                        ...mutable.hitIds
                    ].sort(),

                identityMatch:
                    mutable.identityMatch,

                derivedTermCount,

                totalDistinctTermCount,

                status:
                    prioritized
                        ? "PRIORITIZED_FOR_INSPECTION"
                        : "DEFERRED_LOW_SPECIFICITY",

                triageBasis,

                nextAction:
                    prioritized
                        ? "INSPECT_EXACT_DEPLOYMENT"
                        : "RETAIN_AS_DISCOVERY_ONLY"

            });

        }


        candidates.sort(
            (
                a,
                b
            ) =>
                a.protocolId.localeCompare(
                    b.protocolId
                ) ||
                (
                    b.derivedTermCount -
                    a.derivedTermCount
                ) ||
                (
                    b.totalDistinctTermCount -
                    a.totalDistinctTermCount
                ) ||
                a.subgraphId.localeCompare(
                    b.subgraphId
                )
        );


        const prioritized =
            candidates.filter(
                candidate =>
                    candidate.status ===
                    "PRIORITIZED_FOR_INSPECTION"
            );


        const deferred =
            candidates.filter(
                candidate =>
                    candidate.status ===
                    "DEFERRED_LOW_SPECIFICITY"
            );


        return {

            candidates,

            prioritized,

            deferred,

            errors:
                []

        };

    }

}