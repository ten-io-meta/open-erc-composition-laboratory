export type ScientificCompositionContributionKind =
    | "CAPABILITY"
    | "CONCEPT"
    | "PROTOCOL_DEPENDENCY"
    | "EXTERNAL_BEHAVIOR"
    | "OTHER";


export interface ScientificCompositionContribution {

    contributionId:
        string;

    participantId:
        string;

    kind:
        ScientificCompositionContributionKind;

    /*
     * Neutral machine-readable subject.
     *
     * Examples may eventually represent authority, value,
     * settlement, verification, cursor usage, etc., but this
     * model does not hardcode any ERC-specific meaning.
     */
    subject:
        string;

    evidenceIds:
        string[];

}
