import type {
    ScientificTheGraphDiscoveryTriageCandidate,
    ScientificTheGraphDiscoveryTriageResult
} from "../scientific-the-graph-discovery-triage/ScientificTheGraphDiscoveryTriage.js";

import type {
    ScientificTheGraphExpandedDiscoveryRequest,
    ScientificTheGraphProfileDiscoveryTerm
} from "../scientific-the-graph-profile-discovery/ScientificTheGraphProfileDiscovery.js";

import type {
    ScientificTheGraphSubgraphMcpKeywordDiscoveryResult
} from "../scientific-the-graph-subgraph-mcp/ScientificTheGraphSubgraphMcp.js";

import type {
    ScientificTheGraphInspectionPlanItem,
    ScientificTheGraphInspectionPlanResult
} from "./ScientificTheGraphInspectionPlan.js";


export interface ScientificTheGraphInspectionPlanInput {

    requests:
        ScientificTheGraphExpandedDiscoveryRequest[];

    terms:
        ScientificTheGraphProfileDiscoveryTerm[];

    discovery:
        ScientificTheGraphSubgraphMcpKeywordDiscoveryResult;

    triage:
        ScientificTheGraphDiscoveryTriageResult;

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


function candidateKey(
    requestId:
        string,
    subgraphId:
        string,
    ipfsHash:
        string
): string {

    return encode([
        requestId,
        subgraphId,
        ipfsHash
    ]);

}


export class ScientificTheGraphInspectionPlanEngine {

    plan(
        input:
            ScientificTheGraphInspectionPlanInput,
        maxFallbackDeploymentsPerProtocol:
            number =
            2
    ): ScientificTheGraphInspectionPlanResult {

        if (
            !Number.isSafeInteger(
                maxFallbackDeploymentsPerProtocol
            ) ||
            maxFallbackDeploymentsPerProtocol <
                1
        ) {

            return {

                items:
                    [],

                errors: [
                    "maxFallbackDeploymentsPerProtocol must be a positive safe integer."
                ]

            };

        }


        if (
            input.discovery.errors.length >
                0 ||
            input.triage.errors.length >
                0
        ) {

            return {

                items:
                    [],

                errors: [
                    ...input.discovery.errors.map(
                        error =>
                            `Upstream discovery error: ${error}`
                    ),
                    ...input.triage.errors.map(
                        error =>
                            `Upstream triage error: ${error}`
                    )
                ].sort()

            };

        }


        const errors:
            string[] =
            [];


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

        const candidateByKey =
            new Map<
                string,
                ScientificTheGraphDiscoveryTriageCandidate
            >();


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
                    `Duplicate inspection-plan request ${request.requestId}.`
                );

                continue;

            }


            requestById.set(
                request.requestId,
                request
            );

        }


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
                    `Duplicate inspection-plan term ${term.termId}.`
                );

                continue;

            }


            termById.set(
                term.termId,
                term
            );

        }


        for (
            const candidate
            of input.triage.candidates
        ) {

            const key =
                candidateKey(
                    candidate.requestId,
                    candidate.subgraphId,
                    candidate.ipfsHash
                );


            if (
                candidateByKey.has(
                    key
                )
            ) {

                errors.push(
                    `Duplicate inspection-plan triage candidate ${candidate.candidateId}.`
                );

                continue;

            }


            candidateByKey.set(
                key,
                candidate
            );

        }


        if (
            errors.length >
            0
        ) {

            return {

                items:
                    [],

                errors:
                    uniqueSorted(
                        errors
                    )

            };

        }


        const items:
            ScientificTheGraphInspectionPlanItem[] =
            [];


        const selectedProtocolDeploymentKeys =
            new Set<string>();


        const addItem =
            (
                candidate:
                    ScientificTheGraphDiscoveryTriageCandidate,

                selectionBasis:
                    "TRIAGE_PRIORITY" |
                    "MOST_SELECTIVE_PROFILE_TERM_FALLBACK",

                searchId:
                    string,

                term:
                    ScientificTheGraphProfileDiscoveryTerm,

                searchTotal:
                    number,

                providerRank:
                    number
            ): void => {

                const exactDeploymentKey =
                    encode([
                        candidate.protocolId,
                        candidate.ipfsHash
                    ]);


                /*
                 * Same deployment schema does not need to be
                 * inspected twice for the same target protocol
                 * merely because multiple Subgraph IDs resolve
                 * to it.
                 */
                if (
                    selectedProtocolDeploymentKeys.has(
                        exactDeploymentKey
                    )
                ) {

                    return;

                }


                selectedProtocolDeploymentKeys.add(
                    exactDeploymentKey
                );


                const planItemId =
                    encode([
                        "SCIENTIFIC-THE-GRAPH-INSPECTION-PLAN-ITEM",
                        candidate.protocolId,
                        candidate.profileId,
                        candidate.sourceId,
                        candidate.sourceRevision ??
                            "NO-REVISION",
                        candidate.subgraphId,
                        candidate.ipfsHash,
                        selectionBasis,
                        searchId,
                        term.termId
                    ]);


                items.push({

                    planItemId,

                    protocolId:
                        candidate.protocolId,

                    profileId:
                        candidate.profileId,

                    sourceId:
                        candidate.sourceId,

                    ...(
                        candidate.sourceRevision !==
                        undefined
                            ? {
                                sourceRevision:
                                    candidate.sourceRevision
                            }
                            : {}
                    ),

                    triageCandidateId:
                        candidate.candidateId,

                    subgraphId:
                        candidate.subgraphId,

                    ipfsHash:
                        candidate.ipfsHash,

                    providerMode:
                        candidate.providerMode,

                    selectionBasis,

                    supportingSearchId:
                        searchId,

                    supportingTermId:
                        term.termId,

                    supportingTerm:
                        term.term,

                    providerSearchTotal:
                        searchTotal,

                    providerRank,

                    status:
                        "PLANNED_FOR_EXACT_DEPLOYMENT_INSPECTION",

                    nextAction:
                        "INSPECT_EXACT_DEPLOYMENT"

                });

            };



        for (
            const candidate
            of input.triage.prioritized
        ) {

            const matchingSearchHits =
                input.discovery.searches
                    .flatMap(
                        search =>
                            search.hits
                                .filter(
                                    hit =>
                                        hit.subgraphId ===
                                            candidate.subgraphId &&
                                        hit.ipfsHash ===
                                            candidate.ipfsHash &&
                                        search.requestId ===
                                            candidate.requestId
                                )
                                .map(
                                    hit => ({
                                        search,
                                        hit
                                    })
                                )
                    )
                    .sort(
                        (
                            a,
                            b
                        ) =>
                            (
                                a.search.total -
                                b.search.total
                            ) ||
                            (
                                a.hit.providerRank -
                                b.hit.providerRank
                            ) ||
                            a.search.searchTerm.localeCompare(
                                b.search.searchTerm
                            )
                    );


            if (
                matchingSearchHits.length ===
                0
            ) {

                errors.push(
                    `Prioritized candidate ${candidate.candidateId} has no exact discovery hit.`
                );

                continue;

            }


            const selected =
                matchingSearchHits[0];


            const request =
                requestById.get(
                    candidate.requestId
                );


            if (
                request ===
                undefined
            ) {

                errors.push(
                    `Prioritized candidate ${candidate.candidateId} references unknown request ${candidate.requestId}.`
                );

                continue;

            }


            const matchingTerm =
                request.termIds
                    .map(
                        termId =>
                            termById.get(
                                termId
                            )
                    )
                    .find(
                        term =>
                            term !==
                                undefined &&
                            term.term ===
                                selected.search.searchTerm
                    );


            if (
                matchingTerm ===
                undefined
            ) {

                errors.push(
                    `Prioritized candidate ${candidate.candidateId} has no exact supporting profile term.`
                );

                continue;

            }


            addItem(
                candidate,
                "TRIAGE_PRIORITY",
                selected.search.searchId,
                matchingTerm,
                selected.search.total,
                selected.hit.providerRank
            );

        }


        /*
         * BOUNDED FALLBACK
         *
         * If a protocol has no strong triage candidate, choose
         * the hit-producing profile-derived term with the lowest
         * provider result cardinality and inspect only the first
         * N distinct deployments returned for that term.
         *
         * This is relative provider selectivity, not confidence.
         */

        for (
            const request
            of input.requests
        ) {

            const alreadySelectedForProtocol =
                items.some(
                    item =>
                        item.protocolId ===
                        request.protocolId
                );


            if (
                alreadySelectedForProtocol
            ) {

                continue;

            }


            const eligibleSearches =
                input.discovery.searches
                    .filter(
                        search =>
                            search.requestId ===
                                request.requestId &&
                            search.hits.length >
                                0
                    )
                    .map(
                        search => {

                            const term =
                                request.termIds
                                    .map(
                                        termId =>
                                            termById.get(
                                                termId
                                            )
                                    )
                                    .find(
                                        candidateTerm =>
                                            candidateTerm !==
                                                undefined &&
                                            candidateTerm.term ===
                                                search.searchTerm
                                    );


                            return {

                                search,

                                term

                            };

                        }
                    )
                    .filter(
                        (
                            value
                        ): value is {
                            search:
                                typeof input.discovery.searches[number];
                            term:
                                ScientificTheGraphProfileDiscoveryTerm;
                        } =>
                            value.term !==
                                undefined &&
                            (
                                value.term.originKinds.includes(
                                    "CONTRIBUTION_SUBJECT"
                                ) ||
                                value.term.originKinds.includes(
                                    "NEED_SUBJECT"
                                )
                            ) &&
                            !value.term.originKinds.includes(
                                "PROTOCOL_IDENTITY"
                            )
                    )
                    .sort(
                        (
                            a,
                            b
                        ) =>
                            (
                                a.search.total -
                                b.search.total
                            ) ||
                            (
                                a.search.returned -
                                b.search.returned
                            ) ||
                            a.search.searchTerm.localeCompare(
                                b.search.searchTerm
                            ) ||
                            a.search.searchId.localeCompare(
                                b.search.searchId
                            )
                    );


            if (
                eligibleSearches.length ===
                0
            ) {

                continue;

            }


            const selectedSearch =
                eligibleSearches[0];


            const sortedHits =
                [...selectedSearch.search.hits]
                    .sort(
                        (
                            a,
                            b
                        ) =>
                            (
                                a.providerRank -
                                b.providerRank
                            ) ||
                            a.hitId.localeCompare(
                                b.hitId
                            )
                    );


            let selectedCount =
                0;


            for (
                const hit
                of sortedHits
            ) {

                if (
                    selectedCount >=
                    maxFallbackDeploymentsPerProtocol
                ) {

                    break;

                }


                const candidate =
                    candidateByKey.get(
                        candidateKey(
                            request.requestId,
                            hit.subgraphId,
                            hit.ipfsHash
                        )
                    );


                if (
                    candidate ===
                    undefined
                ) {

                    errors.push(
                        `Fallback hit ${hit.hitId} has no exact triage candidate.`
                    );

                    continue;

                }


                const before =
                    items.length;


                addItem(
                    candidate,
                    "MOST_SELECTIVE_PROFILE_TERM_FALLBACK",
                    selectedSearch.search.searchId,
                    selectedSearch.term,
                    selectedSearch.search.total,
                    hit.providerRank
                );


                if (
                    items.length >
                    before
                ) {

                    selectedCount++;

                }

            }

        }


        if (
            errors.length >
            0
        ) {

            return {

                items:
                    [],

                errors:
                    uniqueSorted(
                        errors
                    )

            };

        }


        return {

            items:
                items.sort(
                    (
                        a,
                        b
                    ) =>
                        a.protocolId.localeCompare(
                            b.protocolId
                        ) ||
                        a.providerSearchTotal -
                            b.providerSearchTotal ||
                        a.providerRank -
                            b.providerRank ||
                        a.ipfsHash.localeCompare(
                            b.ipfsHash
                        )
                ),

            errors:
                []

        };

    }

}