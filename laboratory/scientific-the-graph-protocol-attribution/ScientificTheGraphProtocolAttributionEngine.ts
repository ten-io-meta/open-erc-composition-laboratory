import type {
    ScientificProtocolCompositionProfile
} from "../scientific-protocol-composition-profile/ScientificProtocolCompositionProfile.js";

import type {
    ScientificTheGraphSubgraphInspection
} from "../scientific-the-graph-subgraph-inspection/ScientificTheGraphSubgraphInspection.js";

import type {
    ScientificTheGraphProtocolAttributionAssessment,
    ScientificTheGraphProtocolAttributionResult
} from "./ScientificTheGraphProtocolAttribution.js";


export interface ScientificTheGraphProtocolAttributionInput {

    profile:
        ScientificProtocolCompositionProfile;

    inspection:
        ScientificTheGraphSubgraphInspection;

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


function nonEmpty(
    value:
        string | undefined
): value is string {

    return (
        value !== undefined &&
        value.trim().length >
            0
    );

}


function protocolIdentifiers(
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


    return uniqueSorted(
        [
            exact,
            ...(
                compact !==
                exact
                    ? [
                        compact
                    ]
                    : []
            )
        ]
    );

}


function escapeRegex(
    value:
        string
): string {

    return value.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
    );

}


function countExactIdentifierOccurrences(
    text:
        string,
    identifier:
        string
): number {

    const escaped =
        escapeRegex(
            identifier
        );


    /*
     * Protocol identifiers are matched case-sensitively and
     * bounded by non-alphanumeric characters.
     *
     * ERC-8004 matches:
     *   "# ERC-8004 protocol"
     *
     * It does not match:
     *   "XERC-8004Y"
     *   "erc-8004"
     */
    const pattern =
        new RegExp(
            `(^|[^A-Za-z0-9])${escaped}(?=$|[^A-Za-z0-9])`,
            "g"
        );


    let count =
        0;


    while (
        pattern.exec(
            text
        ) !==
        null
    ) {

        count++;

    }


    return count;

}


export class ScientificTheGraphProtocolAttributionEngine {

    assess(
        inputs:
            ScientificTheGraphProtocolAttributionInput[]
    ): ScientificTheGraphProtocolAttributionResult {

        const errors:
            string[] =
            [];

        const assessments:
            ScientificTheGraphProtocolAttributionAssessment[] =
            [];

        const seenScopes =
            new Set<string>();


        for (
            const input
            of inputs
        ) {

            const profile =
                input.profile;

            const inspection =
                input.inspection;


            if (
                !nonEmpty(
                    profile.profileId
                )
            ) {

                errors.push(
                    "The Graph protocol attribution profile has no profileId."
                );

                continue;

            }


            if (
                !nonEmpty(
                    profile.protocolId
                )
            ) {

                errors.push(
                    `Profile ${profile.profileId} has no protocolId.`
                );

                continue;

            }


            if (
                !nonEmpty(
                    profile.sourceId
                )
            ) {

                errors.push(
                    `Profile ${profile.profileId} has no sourceId.`
                );

                continue;

            }


            if (
                inspection.status !==
                "INSPECTED"
            ) {

                errors.push(
                    `Subgraph ${inspection.subgraphId} is not INSPECTED.`
                );

                continue;

            }


            if (
                inspection.nextAction !==
                "ASSESS_PROTOCOL_ATTRIBUTION"
            ) {

                errors.push(
                    `Subgraph ${inspection.subgraphId} is not ready for protocol attribution.`
                );

                continue;

            }


            if (
                inspection.schemaObservation.requestId !==
                    inspection.requestId ||
                inspection.schemaObservation.subgraphId !==
                    inspection.subgraphId ||
                inspection.schemaObservation.ipfsHash !==
                    inspection.ipfsHash ||
                inspection.schemaObservation.providerMode !==
                    inspection.providerMode
            ) {

                errors.push(
                    `Subgraph inspection ${inspection.inspectionId} has inconsistent schema provenance.`
                );

                continue;

            }


            if (
                inspection.schemaObservation.status !==
                "SCHEMA_OBSERVED"
            ) {

                errors.push(
                    `Subgraph inspection ${inspection.inspectionId} has no observed schema.`
                );

                continue;

            }


            if (
                inspection.queryActivityObservation.requestId !==
                    inspection.requestId ||
                inspection.queryActivityObservation.subgraphId !==
                    inspection.subgraphId ||
                inspection.queryActivityObservation.ipfsHash !==
                    inspection.ipfsHash ||
                inspection.queryActivityObservation.providerMode !==
                    inspection.providerMode
            ) {

                errors.push(
                    `Subgraph inspection ${inspection.inspectionId} has inconsistent activity provenance.`
                );

                continue;

            }


            /*
             * Query activity is deliberately not an attribution
             * gate. A deployment with zero recent queries may still
             * explicitly index the protocol.
             */
            const scope =
                encode([
                    profile.profileId,
                    profile.protocolId,
                    profile.sourceId,
                    profile.sourceRevision ??
                        "NO-REVISION",
                    inspection.subgraphId,
                    inspection.ipfsHash,
                    inspection.schemaObservation.schemaHash
                ]);


            if (
                seenScopes.has(
                    scope
                )
            ) {

                errors.push(
                    `Duplicate The Graph protocol attribution scope for ${profile.protocolId} and ${inspection.subgraphId}.`
                );

                continue;

            }


            seenScopes.add(
                scope
            );


            const identifiers =
                protocolIdentifiers(
                    profile.protocolId
                );


            const matchedIdentifiers =
                identifiers
                    .map(
                        identifier => ({

                            identifier,

                            occurrenceCount:
                                countExactIdentifierOccurrences(
                                    inspection.schemaObservation.schemaText,
                                    identifier
                                )

                        })
                    )
                    .filter(
                        match =>
                            match.occurrenceCount >
                            0
                    );


            const attributed =
                matchedIdentifiers.length >
                0;


            const assessmentId =
                encode([
                    "SCIENTIFIC-THE-GRAPH-PROTOCOL-ATTRIBUTION",
                    profile.protocolId,
                    profile.profileId,
                    profile.sourceId,
                    profile.sourceRevision ??
                        "NO-REVISION",
                    inspection.subgraphId,
                    inspection.ipfsHash,
                    inspection.schemaObservation.observationId,
                    inspection.schemaObservation.schemaHash,
                    attributed
                        ? "ATTRIBUTED"
                        : "UNATTRIBUTED",
                    ...matchedIdentifiers.flatMap(
                        match => [
                            match.identifier,
                            String(
                                match.occurrenceCount
                            )
                        ]
                    )
                ]);


            assessments.push({

                assessmentId,

                protocolId:
                    profile.protocolId,

                profileId:
                    profile.profileId,

                normativeSourceId:
                    profile.sourceId,

                ...(
                    profile.sourceRevision !==
                    undefined
                        ? {
                            normativeSourceRevision:
                                profile.sourceRevision
                        }
                        : {}
                ),

                subgraphId:
                    inspection.subgraphId,

                ipfsHash:
                    inspection.ipfsHash,

                providerMode:
                    inspection.providerMode,

                schemaObservationId:
                    inspection.schemaObservation
                        .observationId,

                schemaHash:
                    inspection.schemaObservation
                        .schemaHash,

                identifiersChecked:
                    identifiers,

                matchedIdentifiers,

                status:
                    attributed
                        ? "ATTRIBUTED"
                        : "UNATTRIBUTED",

                attributionBasis:
                    attributed
                        ? "EXPLICIT_SCHEMA_PROTOCOL_IDENTIFIER"
                        : "NO_EXPLICIT_SCHEMA_PROTOCOL_IDENTIFIER",

                nextAction:
                    attributed
                        ? "ELIGIBLE_FOR_DATA_QUERY_DESIGN"
                        : "REQUIRES_ADDITIONAL_ATTRIBUTION_EVIDENCE"

            });

        }


        if (
            errors.length >
            0
        ) {

            return {

                assessments:
                    [],

                errors:
                    uniqueSorted(
                        errors
                    )

            };

        }


        return {

            assessments:
                assessments.sort(
                    (
                        a,
                        b
                    ) =>
                        a.assessmentId.localeCompare(
                            b.assessmentId
                        )
                ),

            errors:
                []

        };

    }

}