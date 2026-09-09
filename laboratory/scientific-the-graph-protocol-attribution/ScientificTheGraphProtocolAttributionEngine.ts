import type {
    ScientificProtocolCompositionProfile
} from "../scientific-protocol-composition-profile/ScientificProtocolCompositionProfile.js";

import type {
    ScientificTheGraphSubgraphInspection
} from "../scientific-the-graph-subgraph-inspection/ScientificTheGraphSubgraphInspection.js";

import type {
    ScientificTheGraphProtocolAttributionAssessment,
    ScientificTheGraphProtocolAttributionResult,
    ScientificTheGraphProtocolIdentifierRejectionReason
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


function protocolIdentifierRejectionReasons(
    line:
        string,
    identifier:
        string
): ScientificTheGraphProtocolIdentifierRejectionReason[] {

    const normalizedLine =
        line
            .toLowerCase()
            .replace(
                /\s+/g,
                " "
            )
            .trim();


    const normalizedIdentifier =
        escapeRegex(
            identifier.toLowerCase()
        );


    /*
     * These rules identify explicit contexts where the presence
     * of a protocol identifier is documentary or negative rather
     * than affirmative attribution evidence.
     *
     * They operate line-by-line and remain deliberately
     * conservative. They do not infer compatibility or semantic
     * protocol equivalence.
     *
     * String.raw preserves regex escapes in dynamic RegExp
     * construction.
     */
    const explicitNegationPatterns =
        [

            new RegExp(
                String.raw`\b(?:does|do|did)\s+not\s+(?:implement|index|support|use|represent|describe)\s+(?:the\s+)?${normalizedIdentifier}(?=$|[^a-z0-9])`
            ),

            new RegExp(
                String.raw`\b(?:doesn't|doesnt)\s+(?:implement|index|support|use|represent|describe)\s+(?:the\s+)?${normalizedIdentifier}(?=$|[^a-z0-9])`
            ),

            new RegExp(
                String.raw`${normalizedIdentifier}(?=$|[^a-z0-9]).{0,48}\b(?:is|are)\s+not\s+(?:implemented|indexed|supported|used|represented)\b`
            ),

            new RegExp(
                String.raw`\bnot\s+(?:an?\s+)?(?:implementation|indexer|supporter)\s+(?:of|for)\s+(?:the\s+)?${normalizedIdentifier}(?=$|[^a-z0-9])`
            ),

            new RegExp(
                String.raw`\bunrelated\s+to\s+(?:the\s+)?${normalizedIdentifier}(?=$|[^a-z0-9])`
            ),

            new RegExp(
                String.raw`\b(?:does|do|did)\s+not\s+conform\s+to\s+(?:the\s+)?${normalizedIdentifier}(?=$|[^a-z0-9])`
            ),

            new RegExp(
                String.raw`\b(?:doesn't|doesnt)\s+conform\s+to\s+(?:the\s+)?${normalizedIdentifier}(?=$|[^a-z0-9])`
            ),

            new RegExp(
                String.raw`\b(?:is|are)\s+not\s+compatible\s+with\s+(?:the\s+)?${normalizedIdentifier}(?=$|[^a-z0-9])`
            ),

            new RegExp(
                String.raw`${normalizedIdentifier}(?=$|[^a-z0-9]).{0,48}\bcompatibility\s+(?:is|was)\s+not\s+claimed\b`
            ),

            new RegExp(
                String.raw`\bexplicitly\s+excludes?\s+(?:the\s+)?${normalizedIdentifier}(?=$|[^a-z0-9])`
            ),

            new RegExp(
                String.raw`\bexcludes?\s+(?:the\s+)?${normalizedIdentifier}(?=$|[^a-z0-9])`
            ),

            new RegExp(
                String.raw`\bno\s+${normalizedIdentifier}(?=$|[^a-z0-9]).{0,48}\bentities?\s+(?:are|is)\s+indexed\b`
            )

        ];


    const referenceOnlyPatterns =
        [

            new RegExp(
                String.raw`\bdocumentation\s+reference\s*:\s*${normalizedIdentifier}(?=$|[^a-z0-9])`
            ),

            new RegExp(
                String.raw`\bdocs?\s+reference\s*:\s*${normalizedIdentifier}(?=$|[^a-z0-9])`
            ),

            new RegExp(
                String.raw`\breference\s+only\s*:?\s*${normalizedIdentifier}(?=$|[^a-z0-9])`
            ),

            new RegExp(
                String.raw`\bfor\s+reference\s*:?\s*${normalizedIdentifier}(?=$|[^a-z0-9])`
            ),

            new RegExp(
                String.raw`\bsee(?:\s+also)?\s+(?:the\s+)?${normalizedIdentifier}(?=$|[^a-z0-9])`
            ),

            new RegExp(
                String.raw`\bcomparison\s+with\s+(?:the\s+)?${normalizedIdentifier}(?=$|[^a-z0-9]).{0,32}\bonly\b`
            ),

            new RegExp(
                String.raw`${normalizedIdentifier}(?=$|[^a-z0-9]).{0,64}\bdiscussed\b.{0,48}\bonly\s+as\s+an?\s+alternative\b`
            ),

            new RegExp(
                String.raw`\binspired\s+by\s+(?:the\s+)?${normalizedIdentifier}(?=$|[^a-z0-9])`
            ),

            new RegExp(
                String.raw`\blegacy\s+reference\s+to\s+(?:the\s+)?${normalizedIdentifier}(?=$|[^a-z0-9])`
            ),

            new RegExp(
                String.raw`\bmigration\s+note\b.{0,64}\bmentions?\s+(?:the\s+)?${normalizedIdentifier}(?=$|[^a-z0-9]).{0,32}\bonly\b`
            ),

            new RegExp(
                String.raw`\bexample\s+label\b.{0,48}${normalizedIdentifier}(?=$|[^a-z0-9]).{0,96}\b(?:test\s+documentation|documentation)\b.{0,32}\bonly\b`
            ),

            new RegExp(
                String.raw`${normalizedIdentifier}(?=$|[^a-z0-9]).{0,64}\bhistorical\s+comparison\b`
            )

        ];


    const reasons:
        ScientificTheGraphProtocolIdentifierRejectionReason[] =
        [];


    if (
        explicitNegationPatterns.some(
            pattern =>
                pattern.test(
                    normalizedLine
                )
        )
    ) {

        reasons.push(
            "EXPLICIT_NEGATION_CONTEXT"
        );

    }


    if (
        referenceOnlyPatterns.some(
            pattern =>
                pattern.test(
                    normalizedLine
                )
        )
    ) {

        reasons.push(
            "REFERENCE_ONLY_CONTEXT"
        );

    }


    return [
        ...new Set(
            reasons
        )
    ].sort();

}

interface ScientificTheGraphProtocolIdentifierAnalysis {

    identifier:
        string;

    acceptedOccurrenceCount:
        number;

    rejectedOccurrenceCount:
        number;

    rejectionReasons:
        ScientificTheGraphProtocolIdentifierRejectionReason[];

}


function analyzeProtocolIdentifier(
    text:
        string,
    identifier:
        string
): ScientificTheGraphProtocolIdentifierAnalysis {

    let acceptedOccurrenceCount =
        0;

    let rejectedOccurrenceCount =
        0;

    const rejectionReasons =
        new Set<
            ScientificTheGraphProtocolIdentifierRejectionReason
        >();


    for (
        const line
        of text.split(
            /\r?\n/
        )
    ) {

        const occurrenceCount =
            countExactIdentifierOccurrences(
                line,
                identifier
            );


        if (
            occurrenceCount ===
            0
        ) {

            continue;

        }


        const reasons =
            protocolIdentifierRejectionReasons(
                line,
                identifier
            );


        if (
            reasons.length ===
            0
        ) {

            acceptedOccurrenceCount +=
                occurrenceCount;

            continue;

        }


        rejectedOccurrenceCount +=
            occurrenceCount;


        for (
            const reason
            of reasons
        ) {

            rejectionReasons.add(
                reason
            );

        }

    }


    return {

        identifier,

        acceptedOccurrenceCount,

        rejectedOccurrenceCount,

        rejectionReasons:
            [
                ...rejectionReasons
            ].sort()

    };

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


            const identifierAnalyses =
                identifiers.map(
                    identifier =>
                        analyzeProtocolIdentifier(
                            inspection.schemaObservation.schemaText,
                            identifier
                        )
                );


            const matchedIdentifiers =
                identifierAnalyses
                    .filter(
                        analysis =>
                            analysis.acceptedOccurrenceCount >
                            0
                    )
                    .map(
                        analysis => ({

                            identifier:
                                analysis.identifier,

                            occurrenceCount:
                                analysis.acceptedOccurrenceCount

                        })
                    );


            const rejectedIdentifierOccurrences =
                identifierAnalyses
                    .filter(
                        analysis =>
                            analysis.rejectedOccurrenceCount >
                            0
                    )
                    .map(
                        analysis => ({

                            identifier:
                                analysis.identifier,

                            occurrenceCount:
                                analysis.rejectedOccurrenceCount,

                            reasons:
                                analysis.rejectionReasons

                        })
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
                    ),
                    ...rejectedIdentifierOccurrences.flatMap(
                        rejection => [
                            rejection.identifier,
                            String(
                                rejection.occurrenceCount
                            ),
                            ...rejection.reasons
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

                rejectedIdentifierOccurrences,

                status:
                    attributed
                        ? "ATTRIBUTED"
                        : "UNATTRIBUTED",

                attributionBasis:
                    attributed
                        ? "EXPLICIT_SCHEMA_PROTOCOL_IDENTIFIER"
                        : rejectedIdentifierOccurrences.length >
                            0
                            ? "ONLY_REJECTED_SCHEMA_PROTOCOL_IDENTIFIER_CONTEXT"
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