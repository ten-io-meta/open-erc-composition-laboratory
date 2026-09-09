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
    | "AMBIGUOUS_PROTOCOL_IDENTIFIER_CONTEXT";


export interface ScientificTheGraphProtocolAttributionDecisionProjection {

    assessmentId:
        string;

    protocolId:
        string;

    profileId:
        string;

    subgraphId:
        string;

    ipfsHash:
        string;

    decision:
        ScientificTheGraphProtocolAttributionDecision;

    decisionBasis:
        ScientificTheGraphProtocolAttributionDecisionBasis;

}


/*
 * Projects an attribution assessment into a selective decision.
 *
 * POSITIVE:
 *   accepted affirmative attribution evidence exists.
 *
 * NEGATIVE:
 *   the exact inspected schema contains no target identifier,
 *   or contains explicit negation/reference-only evidence.
 *
 * ABSTAIN:
 *   an exact target identifier exists but its context is
 *   ambiguous and does not justify a firm attribution decision.
 *
 * This decision is scoped only to explicit protocol attribution
 * in the inspected schema. It does not establish compatibility,
 * composition, scientific SUPPORT or global protocol absence.
 */
export function projectScientificTheGraphProtocolAttributionDecision(
    assessment:
        ScientificTheGraphProtocolAttributionAssessment
): ScientificTheGraphProtocolAttributionDecisionProjection {

    if (
        assessment.status ===
        "ATTRIBUTED"
    ) {

        return {

            assessmentId:
                assessment.assessmentId,

            protocolId:
                assessment.protocolId,

            profileId:
                assessment.profileId,

            subgraphId:
                assessment.subgraphId,

            ipfsHash:
                assessment.ipfsHash,

            decision:
                "POSITIVE",

            decisionBasis:
                "AFFIRMATIVE_ATTRIBUTION_EVIDENCE"

        };

    }


    if (
        assessment.attributionBasis ===
        "NO_EXPLICIT_SCHEMA_PROTOCOL_IDENTIFIER"
    ) {

        return {

            assessmentId:
                assessment.assessmentId,

            protocolId:
                assessment.protocolId,

            profileId:
                assessment.profileId,

            subgraphId:
                assessment.subgraphId,

            ipfsHash:
                assessment.ipfsHash,

            decision:
                "NEGATIVE",

            decisionBasis:
                "NO_EXPLICIT_PROTOCOL_IDENTIFIER"

        };

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

            assessmentId:
                assessment.assessmentId,

            protocolId:
                assessment.protocolId,

            profileId:
                assessment.profileId,

            subgraphId:
                assessment.subgraphId,

            ipfsHash:
                assessment.ipfsHash,

            decision:
                "NEGATIVE",

            decisionBasis:
                "EXPLICIT_NON_ATTRIBUTION_EVIDENCE"

        };

    }


    return {

        assessmentId:
            assessment.assessmentId,

        protocolId:
            assessment.protocolId,

        profileId:
            assessment.profileId,

        subgraphId:
            assessment.subgraphId,

        ipfsHash:
            assessment.ipfsHash,

        decision:
            "ABSTAIN",

        decisionBasis:
            "AMBIGUOUS_PROTOCOL_IDENTIFIER_CONTEXT"

    };

}