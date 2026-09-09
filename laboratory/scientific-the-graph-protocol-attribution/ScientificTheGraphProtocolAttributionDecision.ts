import type {
    ScientificTheGraphProviderMode
} from "../scientific-the-graph-evidence/ScientificTheGraphEvidence.js";

import type {
    ScientificTheGraphProtocolAttributionAssessment
} from "./ScientificTheGraphProtocolAttribution.js";


export type ScientificTheGraphProtocolAttributionDecision =
    | "POSITIVE"
    | "NEGATIVE"
    | "ABSTAIN";


export type ScientificTheGraphProtocolAttributionDecisionBasis =
    | "AFFIRMATIVE_ATTRIBUTION_EVIDENCE"
    | "NO_EXPLICIT_PROTOCOL_IDENTIFIER"
    | "EXPLICIT_NON_ATTRIBUTION_EVIDENCE"
    | "AMBIGUOUS_PROTOCOL_IDENTIFIER_CONTEXT"
    | "INCONSISTENT_ATTRIBUTION_ASSESSMENT";


export interface ScientificTheGraphProtocolAttributionDecisionProjection {

    assessmentId:
        string;

    protocolId:
        string;

    profileId:
        string;

    normativeSourceId:
        string;

    normativeSourceRevision?:
        string;

    subgraphId:
        string;

    ipfsHash:
        string;

    providerMode:
        ScientificTheGraphProviderMode;

    schemaObservationId:
        string;

    schemaHash:
        string;

    decision:
        ScientificTheGraphProtocolAttributionDecision;

    decisionBasis:
        ScientificTheGraphProtocolAttributionDecisionBasis;

}


function projectionBase(
    assessment:
        ScientificTheGraphProtocolAttributionAssessment
): Omit<
    ScientificTheGraphProtocolAttributionDecisionProjection,
    "decision" | "decisionBasis"
> {

    return {

        assessmentId:
            assessment.assessmentId,

        protocolId:
            assessment.protocolId,

        profileId:
            assessment.profileId,

        normativeSourceId:
            assessment.normativeSourceId,

        normativeSourceRevision:
            assessment.normativeSourceRevision,

        subgraphId:
            assessment.subgraphId,

        ipfsHash:
            assessment.ipfsHash,

        providerMode:
            assessment.providerMode,

        schemaObservationId:
            assessment.schemaObservationId,

        schemaHash:
            assessment.schemaHash

    };

}


function abstainInconsistent(
    assessment:
        ScientificTheGraphProtocolAttributionAssessment
): ScientificTheGraphProtocolAttributionDecisionProjection {

    return {

        ...projectionBase(
            assessment
        ),

        decision:
            "ABSTAIN",

        decisionBasis:
            "INCONSISTENT_ATTRIBUTION_ASSESSMENT"

    };

}


function hasNonEmptyString(
    value:
        string
): boolean {

    return (
        typeof value ===
            "string" &&
        value.trim().length >
            0
    );

}


function hasValidCoreProvenance(
    assessment:
        ScientificTheGraphProtocolAttributionAssessment
): boolean {

    return (

        hasNonEmptyString(
            assessment.assessmentId
        ) &&

        hasNonEmptyString(
            assessment.protocolId
        ) &&

        hasNonEmptyString(
            assessment.profileId
        ) &&

        hasNonEmptyString(
            assessment.normativeSourceId
        ) &&

        hasNonEmptyString(
            assessment.subgraphId
        ) &&

        hasNonEmptyString(
            assessment.ipfsHash
        ) &&

        hasNonEmptyString(
            assessment.schemaObservationId
        ) &&

        hasNonEmptyString(
            assessment.schemaHash
        )

    );

}


function hasValidIdentifierEvidence(
    assessment:
        ScientificTheGraphProtocolAttributionAssessment
): boolean {

    const identifiersChecked =
        new Set(
            assessment.identifiersChecked
        );


    if (
        identifiersChecked.size !==
        assessment.identifiersChecked.length
    ) {

        return false;

    }


    if (
        [
            ...identifiersChecked
        ].some(
            identifier =>
                !hasNonEmptyString(
                    identifier
                )
        )
    ) {

        return false;

    }


    const matchedIdentifiers =
        new Set<string>();


    for (
        const match
        of assessment.matchedIdentifiers
    ) {

        if (
            !identifiersChecked.has(
                match.identifier
            ) ||
            matchedIdentifiers.has(
                match.identifier
            ) ||
            !Number.isInteger(
                match.occurrenceCount
            ) ||
            match.occurrenceCount <=
                0
        ) {

            return false;

        }


        matchedIdentifiers.add(
            match.identifier
        );

    }


    const rejectedIdentifiers =
        new Set<string>();


    for (
        const rejected
        of assessment.rejectedIdentifierOccurrences
    ) {

        if (
            !identifiersChecked.has(
                rejected.identifier
            ) ||
            rejectedIdentifiers.has(
                rejected.identifier
            ) ||
            !Number.isInteger(
                rejected.occurrenceCount
            ) ||
            rejected.occurrenceCount <=
                0 ||
            rejected.reasons.length ===
                0
        ) {

            return false;

        }


        rejectedIdentifiers.add(
            rejected.identifier
        );

    }


    return true;

}


/*
 * Projects one exact attribution assessment into a selective
 * protocol-attribution decision.
 *
 * POSITIVE:
 *   internally consistent affirmative attribution evidence.
 *
 * NEGATIVE:
 *   internally consistent absence of an exact identifier, or
 *   explicit rejected non-attribution evidence.
 *
 * ABSTAIN:
 *   ambiguous evidence or an internally inconsistent assessment.
 *
 * ABSTAIN is fail-closed: malformed or contradictory input can
 * never manufacture a firm POSITIVE or NEGATIVE decision.
 *
 * This projection is scoped only to explicit protocol attribution
 * in the exact inspected schema. It does not establish protocol
 * compatibility, composition, scientific SUPPORT or global
 * protocol absence.
 */
export function projectScientificTheGraphProtocolAttributionDecision(
    assessment:
        ScientificTheGraphProtocolAttributionAssessment
): ScientificTheGraphProtocolAttributionDecisionProjection {

    if (
        !hasValidCoreProvenance(
            assessment
        ) ||
        !hasValidIdentifierEvidence(
            assessment
        )
    ) {

        return abstainInconsistent(
            assessment
        );

    }


    if (
        assessment.status ===
        "ATTRIBUTED"
    ) {

        if (
            assessment.attributionBasis !==
                "EXPLICIT_SCHEMA_PROTOCOL_IDENTIFIER" ||
            assessment.matchedIdentifiers.length ===
                0 ||
            assessment.nextAction !==
                "ELIGIBLE_FOR_DATA_QUERY_DESIGN"
        ) {

            return abstainInconsistent(
                assessment
            );

        }


        return {

            ...projectionBase(
                assessment
            ),

            decision:
                "POSITIVE",

            decisionBasis:
                "AFFIRMATIVE_ATTRIBUTION_EVIDENCE"

        };

    }


    if (
        assessment.status !==
        "UNATTRIBUTED"
    ) {

        return abstainInconsistent(
            assessment
        );

    }


    if (
        assessment.nextAction !==
        "REQUIRES_ADDITIONAL_ATTRIBUTION_EVIDENCE"
    ) {

        return abstainInconsistent(
            assessment
        );

    }


    if (
        assessment.attributionBasis ===
        "NO_EXPLICIT_SCHEMA_PROTOCOL_IDENTIFIER"
    ) {

        if (
            assessment.matchedIdentifiers.length !==
                0 ||
            assessment.rejectedIdentifierOccurrences.length !==
                0
        ) {

            return abstainInconsistent(
                assessment
            );

        }


        return {

            ...projectionBase(
                assessment
            ),

            decision:
                "NEGATIVE",

            decisionBasis:
                "NO_EXPLICIT_PROTOCOL_IDENTIFIER"

        };

    }


    if (
        assessment.attributionBasis !==
        "ONLY_REJECTED_SCHEMA_PROTOCOL_IDENTIFIER_CONTEXT" ||
        assessment.matchedIdentifiers.length !==
            0 ||
        assessment.rejectedIdentifierOccurrences.length ===
            0
    ) {

        return abstainInconsistent(
            assessment
        );

    }


    const rejectionReasons =
        new Set(
            assessment.rejectedIdentifierOccurrences
                .flatMap(
                    rejected =>
                        rejected.reasons
                )
        );


    if (
        rejectionReasons.has(
            "EXPLICIT_NEGATION_CONTEXT"
        ) ||
        rejectionReasons.has(
            "REFERENCE_ONLY_CONTEXT"
        )
    ) {

        return {

            ...projectionBase(
                assessment
            ),

            decision:
                "NEGATIVE",

            decisionBasis:
                "EXPLICIT_NON_ATTRIBUTION_EVIDENCE"

        };

    }


    if (
        rejectionReasons.has(
            "AMBIGUOUS_IDENTIFIER_CONTEXT"
        )
    ) {

        return {

            ...projectionBase(
                assessment
            ),

            decision:
                "ABSTAIN",

            decisionBasis:
                "AMBIGUOUS_PROTOCOL_IDENTIFIER_CONTEXT"

        };

    }


    return abstainInconsistent(
        assessment
    );

}