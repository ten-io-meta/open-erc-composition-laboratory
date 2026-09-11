export type ScientificPolarity =
    | "SUPPORT"
    | "CHALLENGE"
    | "NEUTRAL";


export type ScientificPolarityDecisionSource =
    | "RELATION_EVIDENCE"
    | "CONDITION_FALLBACK"
    | "NEUTRAL";


export interface ScientificPolarityTrace {

    polarity:
        ScientificPolarity;

    decisionSource:
        ScientificPolarityDecisionSource;

    relation:
        string | null;

    relationSubject:
        string | null;

    relationPredicate:
        string | null;

    relationObject:
        string | null;

    subjectMatched:
        boolean;

    objectMatched:
        boolean;

    hasExecutableAssertion:
        boolean;

    matchedSupportCues:
        string[];

    matchedChallengeCues:
        string[];

    negatedSupportCues:
        string[];

    negatedChallengeCues:
        string[];

    supportConditionScore:
        number;

    challengeConditionScore:
        number;

}