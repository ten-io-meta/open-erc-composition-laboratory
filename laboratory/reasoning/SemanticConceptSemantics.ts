export interface SemanticConceptEvidence {

    tokenSequences:
        string[][];

}


export function semanticConceptEvidence(
    concept:
        string
): SemanticConceptEvidence {

    const normalizedConcept =
        String(
            concept ??
            ""
        )
            .trim()
            .toUpperCase();


    switch (
        normalizedConcept
    ) {

        case "ACCOUNTING":

            return {

                tokenSequences: [

                    [
                        "accounting"
                    ],

                    [
                        "account"
                    ],

                    [
                        "balance"
                    ],

                    [
                        "ledger"
                    ],

                    [
                        "tracked"
                    ],

                    [
                        "recorded"
                    ],

                    [
                        "locked",
                        "value"
                    ],

                    [
                        "available",
                        "value"
                    ],

                    [
                        "reserved",
                        "value"
                    ]

                ]

            };


        default:

            return {

                tokenSequences:
                    []

            };

    }

}


export function semanticConceptMatches(
    concept:
        string,

    semanticTokens:
        string[]
): boolean {

    const evidence =
        semanticConceptEvidence(
            concept
        );


    if (
        evidence.tokenSequences.length ===
            0
    ) {

        return false;

    }


    return evidence.tokenSequences.some(
        sequence => {

            if (
                sequence.length ===
                    0 ||
                sequence.length >
                    semanticTokens.length
            ) {

                return false;

            }


            for (
                let startIndex = 0;
                startIndex <=
                    semanticTokens.length -
                    sequence.length;
                startIndex++
            ) {

                const matches =
                    sequence.every(
                        (
                            expectedToken,
                            sequenceIndex
                        ) =>
                            semanticTokens[
                                startIndex +
                                sequenceIndex
                            ] ===
                                expectedToken
                    );


                if (
                    matches
                ) {

                    return true;

                }

            }


            return false;

        }
    );

}