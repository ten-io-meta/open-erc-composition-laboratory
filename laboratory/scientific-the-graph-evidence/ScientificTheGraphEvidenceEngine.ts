import {
    createHash
} from "node:crypto";

import type {
    ScientificTheGraphEvidence,
    ScientificTheGraphEvidenceResult,
    ScientificTheGraphObservationKind,
    ScientificTheGraphProductKind,
    ScientificTheGraphProviderMode,
    ScientificTheGraphSource
} from "./ScientificTheGraphEvidence.js";


export interface ScientificTheGraphEvidenceSourceInput {

    productKind:
        ScientificTheGraphProductKind;

    productId:
        string;

    network:
        string;

    chainId:
        string;

    deploymentId?:
        string;

    schemaId?:
        string;

    providerMode:
        ScientificTheGraphProviderMode;

}


export interface ScientificTheGraphEvidenceQueryInput {

    document:
        string;

    variables:
        unknown;

    response:
        unknown;

    fetchedAt:
        string;

    indexedBlock: {

        number:
            number;

        hash?:
            string;

    };

}


export interface ScientificTheGraphObservationInput {

    observationKind:
        ScientificTheGraphObservationKind;

    entityType:
        string;

    entityId:
        string;

    fragment:
        unknown;

    blockNumber?:
        number;

    blockHash?:
        string;

    transactionHash?:
        string;

    contractAddress?:
        string;

}


export interface ScientificTheGraphEvidenceEngineInput {

    source:
        ScientificTheGraphEvidenceSourceInput;

    query:
        ScientificTheGraphEvidenceQueryInput;

    observations:
        ScientificTheGraphObservationInput[];

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


function sha256(
    value:
        string
): string {

    return createHash(
        "sha256"
    )
        .update(
            value
        )
        .digest(
            "hex"
        );

}


function nonEmpty(
    value:
        string
): boolean {

    return value
        .trim()
        .length >
        0;

}


function validTransactionOrBlockHash(
    value:
        string
): boolean {

    return /^0x[0-9a-fA-F]{64}$/
        .test(
            value
        );

}


function validAddress(
    value:
        string
): boolean {

    return /^0x[0-9a-fA-F]{40}$/
        .test(
            value
        );

}


function assertJsonSafe(
    value:
        unknown,
    path:
        string,
    errors:
        string[]
): void {

    if (
        value ===
        null
    ) {

        return;

    }


    const type =
        typeof value;


    if (
        type ===
            "string" ||
        type ===
            "boolean"
    ) {

        return;

    }


    if (
        type ===
        "number"
    ) {

        if (
            !Number.isFinite(
                value as number
            )
        ) {

            errors.push(
                `${path} contains a non-finite number.`
            );

        }


        return;

    }


    if (
        Array.isArray(
            value
        )
    ) {

        value.forEach(
            (
                child,
                index
            ) =>
                assertJsonSafe(
                    child,
                    `${path}[${index}]`,
                    errors
                )
        );


        return;

    }


    if (
        type ===
        "object"
    ) {

        for (
            const [
                key,
                child
            ]
            of Object.entries(
                value as Record<
                    string,
                    unknown
                >
            )
        ) {

            assertJsonSafe(
                child,
                `${path}.${key}`,
                errors
            );

        }


        return;

    }


    errors.push(
        `${path} contains unsupported JSON value type ${type}.`
    );

}


function canonicalize(
    value:
        unknown
): unknown {

    if (
        value ===
            null ||
        typeof value !==
            "object"
    ) {

        return value;

    }


    if (
        Array.isArray(
            value
        )
    ) {

        return value.map(
            canonicalize
        );

    }


    const result:
        Record<
            string,
            unknown
        > =
        {};


    for (
        const key
        of Object.keys(
            value as Record<
                string,
                unknown
            >
        ).sort()
    ) {

        result[key] =
            canonicalize(
                (
                    value as Record<
                        string,
                        unknown
                    >
                )[key]
            );

    }


    return result;

}


function canonicalJson(
    value:
        unknown
): string {

    return JSON.stringify(
        canonicalize(
            value
        )
    );

}


export class ScientificTheGraphEvidenceEngine {

    build(
        input:
            ScientificTheGraphEvidenceEngineInput
    ): ScientificTheGraphEvidenceResult {

        const errors:
            string[] =
            [];


        const productId =
            input.source.productId.trim();

        const network =
            input.source.network.trim();

        const chainId =
            input.source.chainId.trim();

        const deploymentId =
            input.source.deploymentId
                ?.trim();

        const schemaId =
            input.source.schemaId
                ?.trim();


        if (
            !nonEmpty(
                productId
            )
        ) {

            errors.push(
                "The Graph productId is required."
            );

        }


        if (
            !nonEmpty(
                network
            )
        ) {

            errors.push(
                "The Graph network is required."
            );

        }


        if (
            !nonEmpty(
                chainId
            )
        ) {

            errors.push(
                "The Graph chainId is required."
            );

        }


        if (
            !nonEmpty(
                input.query.document
            )
        ) {

            errors.push(
                "The Graph query document is required."
            );

        }


        if (
            !Number.isInteger(
                input.query.indexedBlock.number
            ) ||
            input.query.indexedBlock.number <
                0
        ) {

            errors.push(
                "The Graph indexed block number must be a non-negative integer."
            );

        }


        if (
            input.query.indexedBlock.hash !==
                undefined &&
            !validTransactionOrBlockHash(
                input.query.indexedBlock.hash
            )
        ) {

            errors.push(
                "The Graph indexed block hash is invalid."
            );

        }


        if (
            Number.isNaN(
                Date.parse(
                    input.query.fetchedAt
                )
            ) ||
            !/(Z|[+-]\d{2}:\d{2})$/
                .test(
                    input.query.fetchedAt
                )
        ) {

            errors.push(
                "The Graph fetchedAt must be an offset-aware ISO timestamp."
            );

        }


        assertJsonSafe(
            input.query.variables,
            "query.variables",
            errors
        );

        assertJsonSafe(
            input.query.response,
            "query.response",
            errors
        );


        for (
            const observation
            of input.observations
        ) {

            if (
                !nonEmpty(
                    observation.entityType
                )
            ) {

                errors.push(
                    "The Graph observation entityType is required."
                );

            }


            if (
                !nonEmpty(
                    observation.entityId
                )
            ) {

                errors.push(
                    "The Graph observation entityId is required."
                );

            }


            if (
                observation.blockNumber !==
                    undefined &&
                (
                    !Number.isInteger(
                        observation.blockNumber
                    ) ||
                    observation.blockNumber <
                        0
                )
            ) {

                errors.push(
                    `The Graph observation ${observation.entityId} has invalid blockNumber.`
                );

            }


            if (
                observation.blockNumber !==
                    undefined &&
                observation.blockNumber >
                    input.query.indexedBlock.number
            ) {

                errors.push(
                    `The Graph observation ${observation.entityId} is newer than the indexed query block.`
                );

            }


            if (
                observation.blockHash !==
                    undefined &&
                !validTransactionOrBlockHash(
                    observation.blockHash
                )
            ) {

                errors.push(
                    `The Graph observation ${observation.entityId} has invalid blockHash.`
                );

            }


            if (
                observation.transactionHash !==
                    undefined &&
                !validTransactionOrBlockHash(
                    observation.transactionHash
                )
            ) {

                errors.push(
                    `The Graph observation ${observation.entityId} has invalid transactionHash.`
                );

            }


            if (
                observation.contractAddress !==
                    undefined &&
                !validAddress(
                    observation.contractAddress
                )
            ) {

                errors.push(
                    `The Graph observation ${observation.entityId} has invalid contractAddress.`
                );

            }


            assertJsonSafe(
                observation.fragment,
                `observation.${observation.entityId}.fragment`,
                errors
            );

        }


        if (
            errors.length >
            0
        ) {

            return {

                source:
                    null,

                queryReceipt:
                    null,

                evidence:
                    [],

                errors: [
                    ...new Set(
                        errors
                    )
                ].sort()

            };

        }


        const sourceId =
            encode([
                "SCIENTIFIC-THE-GRAPH-SOURCE",
                input.source.productKind,
                input.source.providerMode,
                productId,
                network,
                chainId,
                deploymentId ??
                    "NO-DEPLOYMENT",
                schemaId ??
                    "NO-SCHEMA"
            ]);


        const source:
            ScientificTheGraphSource = {

                sourceId,

                provider:
                    "THE_GRAPH",

                productKind:
                    input.source.productKind,

                productId,

                network,

                chainId,

                ...(
                    deploymentId !==
                    undefined
                        ? {
                            deploymentId
                        }
                        : {}
                ),

                ...(
                    schemaId !==
                    undefined
                        ? {
                            schemaId
                        }
                        : {}
                ),

                providerMode:
                    input.source.providerMode

            };


        const queryDocumentHash =
            sha256(
                input.query.document.trim()
            );

        const variablesHash =
            sha256(
                canonicalJson(
                    input.query.variables
                )
            );

        const responseHash =
            sha256(
                canonicalJson(
                    input.query.response
                )
            );


        const queryReceiptId =
            encode([
                "SCIENTIFIC-THE-GRAPH-QUERY-RECEIPT",
                sourceId,
                queryDocumentHash,
                variablesHash,
                responseHash,
                String(
                    input.query.indexedBlock.number
                ),
                input.query.indexedBlock.hash ??
                    "NO-BLOCK-HASH"
            ]);


        const queryReceipt = {

            queryReceiptId,

            sourceId,

            queryDocumentHash,

            variablesHash,

            responseHash,

            indexedBlock: {

                number:
                    input.query.indexedBlock.number,

                ...(
                    input.query.indexedBlock.hash !==
                    undefined
                        ? {
                            hash:
                                input.query.indexedBlock.hash
                        }
                        : {}
                )

            },

            fetchedAt:
                input.query.fetchedAt

        };


        const evidenceById =
            new Map<
                string,
                ScientificTheGraphEvidence
            >();


        for (
            const observation
            of input.observations
        ) {

            const rawFragment =
                canonicalJson(
                    observation.fragment
                );

            const fragmentHash =
                sha256(
                    rawFragment
                );


            const evidenceId =
                encode([
                    "SCIENTIFIC-THE-GRAPH-EVIDENCE",
                    sourceId,
                    queryReceiptId,
                    observation.observationKind,
                    observation.entityType.trim(),
                    observation.entityId.trim(),
                    fragmentHash,
                    observation.transactionHash ??
                        "NO-TX",
                    observation.contractAddress ??
                        "NO-CONTRACT",
                    String(
                        observation.blockNumber ??
                        -1
                    ),
                    observation.blockHash ??
                        "NO-BLOCK-HASH"
                ]);


            evidenceById.set(
                evidenceId,
                {

                    evidenceId,

                    sourceId,

                    queryReceiptId,

                    evidenceBasis:
                        "THE_GRAPH_INDEXED_RESPONSE",

                    observationKind:
                        observation.observationKind,

                    entityType:
                        observation.entityType.trim(),

                    entityId:
                        observation.entityId.trim(),

                    rawFragment,

                    fragmentHash,

                    ...(
                        observation.blockNumber !==
                        undefined
                            ? {
                                blockNumber:
                                    observation.blockNumber
                            }
                            : {}
                    ),

                    ...(
                        observation.blockHash !==
                        undefined
                            ? {
                                blockHash:
                                    observation.blockHash
                            }
                            : {}
                    ),

                    ...(
                        observation.transactionHash !==
                        undefined
                            ? {
                                transactionHash:
                                    observation.transactionHash
                            }
                            : {}
                    ),

                    ...(
                        observation.contractAddress !==
                        undefined
                            ? {
                                contractAddress:
                                    observation.contractAddress
                            }
                            : {}
                    )

                }
            );

        }


        return {

            source,

            queryReceipt,

            evidence:
                [...evidenceById.values()]
                    .sort(
                        (a, b) =>
                            a.evidenceId.localeCompare(
                                b.evidenceId
                            )
                    ),

            errors:
                []

        };

    }

}