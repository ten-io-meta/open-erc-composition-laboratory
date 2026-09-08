import type {
    ScientificProtocolCompositionProfile
} from "../scientific-protocol-composition-profile/ScientificProtocolCompositionProfile.js";

import type {
    ScientificTheGraphEvidenceResult
} from "../scientific-the-graph-evidence/ScientificTheGraphEvidence.js";

import type {
    ScientificGitHubNormativeSourceIdentity,
    ScientificGitHubTheGraphEvidenceBinding,
    ScientificGitHubTheGraphEvidenceBindingResult,
    ScientificTheGraphProtocolAttribution
} from "./ScientificGitHubTheGraphEvidenceBinding.js";


export interface ScientificGitHubTheGraphEvidenceBindingEngineInput {

    profile:
        ScientificProtocolCompositionProfile;

    normativeSource:
        ScientificGitHubNormativeSourceIdentity;

    graphEvidence:
        ScientificTheGraphEvidenceResult;

    attribution:
        ScientificTheGraphProtocolAttribution;

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


function nonEmpty(
    value:
        string
): boolean {

    return value
        .trim()
        .length >
        0;

}


function unique(
    values:
        string[]
): string[] {

    return [
        ...new Set(
            values
        )
    ].sort();

}


export class ScientificGitHubTheGraphEvidenceBindingEngine {

    bind(
        input:
            ScientificGitHubTheGraphEvidenceBindingEngineInput
    ): ScientificGitHubTheGraphEvidenceBindingResult {

        const errors:
            string[] =
            [];

        const {
            profile,
            normativeSource,
            graphEvidence,
            attribution
        } =
            input;


        /*
         * -----------------------------------------------------
         * EXPLICIT ATTRIBUTION IDENTITY
         * -----------------------------------------------------
         */

        if (
            !nonEmpty(
                attribution.attributionId
            )
        ) {

            errors.push(
                "Graph protocol attributionId is required."
            );

        }


        if (
            !nonEmpty(
                attribution.adapterId
            )
        ) {

            errors.push(
                "Graph protocol adapterId is required."
            );

        }


        if (
            !nonEmpty(
                attribution.protocolId
            )
        ) {

            errors.push(
                "Graph protocol attribution protocolId is required."
            );

        }


        /*
         * -----------------------------------------------------
         * NORMATIVE PROFILE <-> GITHUB SOURCE
         * -----------------------------------------------------
         */

        if (
            profile.protocolId !==
            attribution.protocolId
        ) {

            errors.push(
                `Profile protocol ${profile.protocolId} does not match attributed Graph protocol ${attribution.protocolId}.`
            );

        }


        if (
            normativeSource.sourceType !==
            "GITHUB"
        ) {

            errors.push(
                "Normative binding source must be GITHUB."
            );

        }


        if (
            !nonEmpty(
                normativeSource.sourceRevision
            )
        ) {

            errors.push(
                "GitHub normative source must have an exact revision."
            );

        }


        if (
            profile.sourceId !==
            normativeSource.sourceId
        ) {

            errors.push(
                "Profile sourceId does not match the declared GitHub normative source."
            );

        }


        if (
            profile.sourceRevision ===
            undefined
        ) {

            errors.push(
                "Protocol profile has no pinned source revision."
            );

        }
        else if (
            profile.sourceRevision !==
            normativeSource.sourceRevision
        ) {

            errors.push(
                "Protocol profile revision does not match the declared GitHub normative revision."
            );

        }


        /*
         * -----------------------------------------------------
         * GRAPH RESULT VALIDITY
         * -----------------------------------------------------
         */

        if (
            graphEvidence.errors.length >
            0
        ) {

            errors.push(
                ...graphEvidence.errors.map(
                    error =>
                        `The Graph evidence error: ${error}`
                )
            );

        }


        const graphSource =
            graphEvidence.source;

        const queryReceipt =
            graphEvidence.queryReceipt;


        if (
            graphSource ===
            null
        ) {

            errors.push(
                "The Graph evidence has no source."
            );

        }


        if (
            queryReceipt ===
            null
        ) {

            errors.push(
                "The Graph evidence has no query receipt."
            );

        }


        if (
            graphEvidence.evidence.length ===
            0
        ) {

            errors.push(
                "The Graph binding requires at least one indexed evidence item."
            );

        }


        if (
            graphSource !==
            null
        ) {

            if (
                graphSource.provider !==
                "THE_GRAPH"
            ) {

                errors.push(
                    "Runtime evidence provider is not THE_GRAPH."
                );

            }


            if (
                graphSource.productId !==
                attribution.graphProductId
            ) {

                errors.push(
                    "The Graph product does not match the explicit protocol attribution."
                );

            }


            if (
                graphSource.network !==
                attribution.network
            ) {

                errors.push(
                    "The Graph network does not match the explicit protocol attribution."
                );

            }


            if (
                graphSource.chainId !==
                attribution.chainId
            ) {

                errors.push(
                    "The Graph chainId does not match the explicit protocol attribution."
                );

            }


            if (
                graphSource.providerMode !==
                attribution.requiredProviderMode
            ) {

                errors.push(
                    `The Graph provider mode ${graphSource.providerMode} does not satisfy required mode ${attribution.requiredProviderMode}.`
                );

            }

        }


        if (
            graphSource !==
                null &&
            queryReceipt !==
                null &&
            queryReceipt.sourceId !==
                graphSource.sourceId
        ) {

            errors.push(
                "The Graph query receipt does not belong to the Graph source."
            );

        }


        /*
         * -----------------------------------------------------
         * EXACT EVIDENCE OWNERSHIP
         * -----------------------------------------------------
         */

        const evidenceIds =
            new Set<string>();


        for (
            const evidence
            of graphEvidence.evidence
        ) {

            if (
                evidenceIds.has(
                    evidence.evidenceId
                )
            ) {

                errors.push(
                    `Duplicate The Graph evidence ${evidence.evidenceId}.`
                );

                continue;

            }


            evidenceIds.add(
                evidence.evidenceId
            );


            if (
                graphSource !==
                    null &&
                evidence.sourceId !==
                    graphSource.sourceId
            ) {

                errors.push(
                    `The Graph evidence ${evidence.evidenceId} does not belong to the bound Graph source.`
                );

            }


            if (
                queryReceipt !==
                    null &&
                evidence.queryReceiptId !==
                    queryReceipt.queryReceiptId
            ) {

                errors.push(
                    `The Graph evidence ${evidence.evidenceId} does not belong to the bound query receipt.`
                );

            }


            if (
                evidence.evidenceBasis !==
                "THE_GRAPH_INDEXED_RESPONSE"
            ) {

                errors.push(
                    `The Graph evidence ${evidence.evidenceId} has an unexpected evidence basis.`
                );

            }

        }


        if (
            errors.length >
            0 ||
            graphSource ===
                null ||
            queryReceipt ===
                null
        ) {

            return {

                bindings:
                    [],

                errors:
                    unique(
                        errors
                    )

            };

        }


        const orderedEvidenceIds =
            [...evidenceIds]
                .sort();


        const bindingId =
            encode([
                "SCIENTIFIC-GITHUB-THE-GRAPH-EVIDENCE-BINDING",

                profile.protocolId,

                profile.profileId,

                normativeSource.sourceId,

                normativeSource.sourceRevision,

                attribution.attributionId,

                attribution.adapterId,

                graphSource.sourceId,

                queryReceipt.queryReceiptId,

                ...orderedEvidenceIds
            ]);


        const binding:
            ScientificGitHubTheGraphEvidenceBinding = {

                bindingId,

                protocolId:
                    profile.protocolId,

                profileId:
                    profile.profileId,

                normativeSourceType:
                    "GITHUB",

                normativeSourceId:
                    normativeSource.sourceId,

                normativeSourceRevision:
                    normativeSource.sourceRevision,

                attributionId:
                    attribution.attributionId,

                adapterId:
                    attribution.adapterId,

                attributionBasis:
                    attribution.attributionBasis,

                graphSourceId:
                    graphSource.sourceId,

                graphProductKind:
                    graphSource.productKind,

                graphProductId:
                    graphSource.productId,

                graphNetwork:
                    graphSource.network,

                graphChainId:
                    graphSource.chainId,

                ...(
                    graphSource.deploymentId !==
                    undefined
                        ? {
                            graphDeploymentId:
                                graphSource.deploymentId
                        }
                        : {}
                ),

                ...(
                    graphSource.schemaId !==
                    undefined
                        ? {
                            graphSchemaId:
                                graphSource.schemaId
                        }
                        : {}
                ),

                providerMode:
                    graphSource.providerMode,

                queryReceiptId:
                    queryReceipt.queryReceiptId,

                indexedBlockNumber:
                    queryReceipt.indexedBlock.number,

                ...(
                    queryReceipt.indexedBlock.hash !==
                    undefined
                        ? {
                            indexedBlockHash:
                                queryReceipt.indexedBlock.hash
                        }
                        : {}
                ),

                evidenceIds:
                    orderedEvidenceIds,

                status:
                    "BOUND",

                bindingBasis:
                    "EXPLICIT_PROTOCOL_ATTRIBUTION_WITH_INDEXED_PROVIDER_EVIDENCE"

            };


        return {

            bindings: [
                binding
            ],

            errors:
                []

        };

    }

}