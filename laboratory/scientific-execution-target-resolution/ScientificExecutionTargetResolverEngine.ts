import {
    ScientificPolarityTrace
} from "./ScientificPolarityTrace.js";

import {
    normalizeSemanticRelation,
    semanticRelationPhrase,
    semanticRelationEvidenceCues
} from "../reasoning/SemanticRelationSemantics.js";

import type {
    ScientificExperimentExecutionResult
} from "../scientific-experiment-execution/ScientificExperimentExecutionResult.js";

import type {
    GitHubRepositoryIntelligenceResult
} from "../github-adapter/GitHubRepositoryIntelligence.js";

import type {
    GitHubExecutableTarget
} from "../github-adapter/GitHubExecutableTargetExtractor.js";

import type {
    ScientificExecutionTargetResolution
} from "./ScientificExecutionTargetResolution.js";

import {
    semanticConceptMatches
} from "../reasoning/SemanticConceptSemantics.js";

import type {
    ScientificExecutionTargetResolutionResult
} from "./ScientificExecutionTargetResolutionResult.js";


export type ScientificRepositoryExecutionIntelligence =
    Record<
        string,
        GitHubRepositoryIntelligenceResult
    >;


type ExecutionTask =
    ScientificExperimentExecutionResult[
        "tasks"
    ][number];


interface RankedExecutableTarget {

    repository: string;

    target:
        GitHubExecutableTarget;

    score: number;

    matchedTerms: string[];

    reasons: string[];

}


export class ScientificExecutionTargetResolverEngine {

    build(
        campaignId: string,

        execution:
            ScientificExperimentExecutionResult,

        repositoryIntelligence:
            ScientificRepositoryExecutionIntelligence
    ): ScientificExecutionTargetResolutionResult {

        try {

            const resolutions:
                ScientificExecutionTargetResolution[] = [];

            for (
                const task
                of execution.tasks ?? []
            ) {

                resolutions.push(
                    this.resolveTask(
                        task,
                        repositoryIntelligence
                    )
                );

            }

            return {

                generatedAt:
                    new Date().toISOString(),

                campaignId,

                resolutions,

                statistics: {

                    total:
                        resolutions.length,

                    resolved:
                        resolutions.filter(
                            item =>
                                item.resolutionStatus ===
                                "RESOLVED"
                        ).length,

                    unresolved:
                        resolutions.filter(
                            item =>
                                item.resolutionStatus ===
                                "UNRESOLVED"
                        ).length,

                    tests:
                        resolutions.filter(
                            item =>
                                item.executionKind ===
                                "TEST"
                        ).length,

                    invariants:
                        resolutions.filter(
                            item =>
                                item.executionKind ===
                                "INVARIANT"
                        ).length,

                    staticAnalysis:
                        resolutions.filter(
                            item =>
                                item.executionKind ===
                                "STATIC_ANALYSIS"
                        ).length

                },

                errors: []

            };

        } catch (error) {

            return {

                generatedAt:
                    new Date().toISOString(),

                campaignId,

                resolutions: [],

                statistics: {
                    total: 0,
                    resolved: 0,
                    unresolved: 0,
                    tests: 0,
                    invariants: 0,
                    staticAnalysis: 0
                },

                errors: [
                    error instanceof Error
                        ? error.message
                        : String(error)
                ]

            };

        }

    }


    private resolveTask(
        task:
            ExecutionTask,

        repositoryIntelligence:
            ScientificRepositoryExecutionIntelligence
    ): ScientificExecutionTargetResolution {

        const candidateRepositories =
            task.recommendedRepositories ?? [];

        const reasons:
            string[] = [];

        const scientificTerms =
            this.extractScientificTerms(
                task
            );

        const rankedTargets:
            RankedExecutableTarget[] = [];


        for (
            const repository
            of candidateRepositories
        ) {

            const intelligence =
                repositoryIntelligence[
                    repository
                ];

            if (!intelligence) {

                reasons.push(
                    `No repository intelligence is available for ${repository}.`
                );

                continue;

            }


            const executableTargets =
                intelligence.executableTargets ?? [];


            if (
                executableTargets.length === 0
            ) {

                reasons.push(
                    `${repository} exposes no executable targets.`
                );

                continue;

            }


            const invariantTargets =
                executableTargets.filter(
                    target =>
                        target.type ===
                        "INVARIANT"
                );


            const testTargets =
                executableTargets.filter(
                    target =>
                        target.type ===
                        "TEST"
                );


            reasons.push(
                `${repository} exposes ${testTargets.length} executable test target(s) and ${invariantTargets.length} executable invariant target(s).`
            );


            for (
                const target
                of executableTargets
            ) {

                const ranked =
                    this.rankTarget(
                        task,
                        repository,
                        target,
                        scientificTerms
                    );


                if (
                    ranked.score > 0
                ) {

                    rankedTargets.push(
                        ranked
                    );

                }

            }

        }


        rankedTargets.sort(
            (
                left,
                right
            ) =>
                right.score -
                left.score
        );


        const best =
            rankedTargets[0];


        if (!best) {

            return this.unresolved(
                task,
                [
                    ...reasons,
                    (
                        "No executable target shared meaningful semantic " +
                        `terms with ${task.targetId}.`
                    )
                ]
            );

        }


        const secondBest =
            rankedTargets[1];


        /*
         * Resolution policy
         * -----------------
         *
         * We deliberately avoid resolving a scientific experiment
         * from a weak single-token collision.
         *
         * A target needs:
         *
         *   1. a minimum semantic score,
         *   2. at least two meaningful matched terms,
         *   3. and enough separation from the next candidate when
         *      the competing candidate is similarly strong.
         *
         * This is intentionally conservative.
         */

        const minimumScore =
            45;

        const minimumMatchedTerms =
            2;

        const ambiguityMargin =
            8;


        if (
            best.score <
                minimumScore ||
            best.matchedTerms.length <
                minimumMatchedTerms
        ) {

            return this.unresolved(
                task,
                [
                    ...reasons,
                    (
                        `Best executable candidate was ${best.repository} :: ` +
                        `${best.target.filePath} :: ${best.target.selector} ` +
                        `with semantic score ${best.score}, matching ` +
                        `${best.matchedTerms.length} meaningful term(s): ` +
                        `${best.matchedTerms.join(", ") || "none"}.`
                    ),
                    (
                        `Resolution requires score >= ${minimumScore} ` +
                        `and at least ${minimumMatchedTerms} meaningful matched terms.`
                    )
                ]
            );

        }


        if (
            secondBest &&
            secondBest.score >=
                minimumScore &&
            (
                best.score -
                secondBest.score
            ) <
                ambiguityMargin
        ) {

            return this.unresolved(
                task,
                [
                    ...reasons,
                    (
                        "Semantic resolution remains ambiguous. " +
                        `Best candidate scored ${best.score}: ` +
                        `${best.repository} :: ` +
                        `${best.target.filePath} :: ` +
                        `${best.target.selector}.`
                    ),
                    (
                        `Second candidate scored ${secondBest.score}: ` +
                        `${secondBest.repository} :: ` +
                        `${secondBest.target.filePath} :: ` +
                        `${secondBest.target.selector}.`
                    )
                ]
            );

        }


        const confidence =
            this.calculateConfidence(
                best,
                secondBest
            );
const polarityTrace =
    this.scientificPolarityTraceFor(
        task,
        best.target
    );

const polarityConfidence =
    this.scientificPolarityConfidenceFor(
        polarityTrace
    );

return {

            experimentId:
                task.experimentId,

            executionTaskId:
                task.executionTaskId,

            targetType:
                task.targetType,

            targetId:
                task.targetId,

            repository:
                best.repository,

            selectedExecutableTarget: {
    repository:
        best.repository,

    filePath:
        best.target.filePath,

    selector:
        best.target.selector,

    type:
        best.target.type,

    framework:
        best.target.framework
},

            executionKind:
                best.target.type ===
                    "INVARIANT"
                    ? "INVARIANT"
                    : "TEST",

            testSelector:
                best.target.type ===
                    "TEST"
                    ? best.target.selector
                    : null,

            invariantSelector:
                best.target.type ===
                    "INVARIANT"
                    ? best.target.selector
                    : null,

            staticAnalysisSelector:
                null,

            confidence,

resolutionStatus:
    "RESOLVED",

scientificPolarity:
    polarityTrace.polarity,

polarityTrace,

polarityConfidence,

resolutionReasons: [
                (
                    `Resolved ${task.targetId} to an executable ` +
                    `${best.target.type.toLowerCase()} target in ` +
                    `${best.repository}.`
                ),
                (
                    `Semantic score: ${best.score}.`
                ),
                (
                    `Matched scientific terms: ` +
                    `${best.matchedTerms.join(", ")}.`
                ),
                (
                    `File: ${best.target.filePath}.`
                ),
                (
                    `Selector: ${best.target.selector}.`
                ),
                ...best.reasons
            ]

        };

    }


    private rankTarget(
        task:
            ExecutionTask,

        repository:
            string,

        target:
            GitHubExecutableTarget,

        scientificTerms:
            string[]
    ): RankedExecutableTarget {

        const selector =
            this.normalize(
                target.selector
            );

        const filePath =
            this.normalize(
                target.filePath
            );

        const searchable =
            `${selector} ${filePath}`;

        let score =
            0;

        const matchedTerms =
            new Set<string>();

        const reasons:
            string[] = [];


        for (
            const term
            of scientificTerms
        ) {

            const normalizedTerm =
                this.normalize(
                    term
                );


            if (
                normalizedTerm.length <
                3
            ) {
                continue;
            }


            const selectorMatch =
                selector.includes(
                    normalizedTerm
                );


            const pathMatch =
                filePath.includes(
                    normalizedTerm
                );


            if (
                selectorMatch
            ) {

                score +=
                    normalizedTerm.length >= 8
                        ? 18
                        : 12;

                matchedTerms.add(
                    term
                );

            }


            if (
                pathMatch
            ) {

                score +=
                    normalizedTerm.length >= 8
                        ? 12
                        : 8;

                matchedTerms.add(
                    term
                );

            }

        }


        /*
         * Token-level comparison catches:
         *
         * transferFrom      -> transfer
         * reservedBalance   -> reserved
         * access-control    -> access/control
         * test_revert_x     -> revert
         */

        const targetTokens =
            new Set(
                this.tokenize(
                    searchable
                )
            );


        for (
            const term
            of scientificTerms
        ) {

            const termTokens =
                this.tokenize(
                    term
                );


            for (
                const token
                of termTokens
            ) {

                if (
                    this.isMeaningfulToken(
                        token
                    ) &&
                    targetTokens.has(
                        token
                    )
                ) {

                    score += 5;

                    matchedTerms.add(
                        token
                    );

                }

            }

        }


        /*
         * Scientific execution preference.
         *
         * RETEST / THEORY_VALIDATION generally benefits from
         * executable falsification evidence.
         */

        const requiredEvidenceText =
            this.normalize(
                (
                    task.requiredEvidence ??
                    []
                ).join(" ")
            );


        const procedureText =
            this.normalize(
                (
                    task.procedure ??
                    []
                ).join(" ")
            );


        if (
            target.type ===
                "INVARIANT" &&
            (
                requiredEvidenceText.includes(
                    "invariant"
                ) ||
                procedureText.includes(
                    "invariant"
                )
            )
        ) {

            score += 15;

            reasons.push(
                "The experiment explicitly requests invariant evidence."
            );

        }


        if (
            target.type ===
                "TEST" &&
            (
                requiredEvidenceText.includes(
                    "test"
                ) ||
                requiredEvidenceText.includes(
                    "executable"
                ) ||
                procedureText.includes(
                    "test"
                ) ||
                procedureText.includes(
                    "counterexample"
                )
            )
        ) {

            score += 10;

            reasons.push(
                "The experiment explicitly requests executable test evidence."
            );

        }


        /*
         * Revert/failure tests are especially useful when an
         * experiment is explicitly searching for contradiction
         * or falsification evidence.
         */

        const adversarialExperiment =
            requiredEvidenceText.includes(
                "adversarial"
            ) ||
            requiredEvidenceText.includes(
                "contradict"
            ) ||
            procedureText.includes(
                "counterexample"
            ) ||
            procedureText.includes(
                "contradict"
            ) ||
            procedureText.includes(
                "falsif"
            );


        if (
            adversarialExperiment &&
            target.type ===
                "TEST" &&
            (
                searchable.includes(
                    "revert"
                ) ||
                searchable.includes(
                    "fail"
                ) ||
                searchable.includes(
                    "invalid"
                ) ||
                searchable.includes(
                    "unauthorized"
                ) ||
                searchable.includes(
                    "cannot"
                )
            )
        ) {

            score += 8;

            reasons.push(
                "The target exposes adversarial or failure-oriented test semantics."
            );

        }


        return {

            repository,

            target,

            score,

            matchedTerms:
                [...matchedTerms],

            reasons

        };

    }
private scientificPolarityTraceFor(
    task:
        ExecutionTask,

    target:
        GitHubExecutableTarget
): ScientificPolarityTrace {

    const targetTokens =
        new Set(
            this.tokenize(
                [
                    target.selector,
                    target.filePath,
                    target.semanticContext
                ].join(" ")
            ).filter(
                token =>
                    this.isMeaningfulToken(
                        token
                    )
            )
        );


    const conditionTokens =
        (
            condition:
                string | null | undefined
        ): Set<string> => {

            if (!condition) {
                return new Set<string>();
            }

            return new Set(
                this.tokenize(
                    condition
                ).filter(
                    token =>
                        this.isMeaningfulToken(
                            token
                        )
                )
            );

        };


    const supportTokens =
        conditionTokens(
            task.supportCondition
        );

    const challengeTokens =
        conditionTokens(
            task.challengeCondition
        );


    const supportDistinctive =
        new Set(
            [...supportTokens].filter(
                token =>
                    !challengeTokens.has(
                        token
                    )
            )
        );

    const challengeDistinctive =
        new Set(
            [...challengeTokens].filter(
                token =>
                    !supportTokens.has(
                        token
                    )
            )
        );


    const scoreDistinctive =
        (
            tokens:
                Set<string>
        ): number => {

            let score =
                0;

            for (
                const token
                of tokens
            ) {

                if (
                    targetTokens.has(
                        token
                    )
                ) {

                    score += 1;

                }

            }

            return score;

        };


    const supportConditionScore =
        scoreDistinctive(
            supportDistinctive
        );

    const challengeConditionScore =
        scoreDistinctive(
            challengeDistinctive
        );


    const relationParts =
        String(
            task.sourcePatternRelation ?? ""
        )
            .split(":")
            .map(
                part =>
                    part.trim()
            )
            .filter(
                Boolean
            );


    const relationSubject =
        relationParts[0] ?? "";

    const relationPredicate =
        relationParts[1] ?? "";

    const relationObject =
        relationParts[2] ?? "";


    const normalizedRelationPredicate =
        normalizeSemanticRelation(
            relationPredicate
        );

    const relationPredicatePhrase =
        semanticRelationPhrase(
            normalizedRelationPredicate
        );


    const relationSubjectTokens =
        this.tokenize(
            relationSubject
        );

    const relationObjectTokens =
        this.tokenize(
            relationObject
        );

    const relationPredicateTokens =
        this.tokenize(
            relationPredicatePhrase
        );

    void relationPredicateTokens;


    const relationEvidenceCues =
        semanticRelationEvidenceCues(
            normalizedRelationPredicate
        );


    const supportCueTokens =
        relationEvidenceCues.support;

    const challengeCueTokens =
        relationEvidenceCues.challenge;


 const selectorTokenList =
    this.tokenize(
        target.selector ??
        ""
    );


const semanticTokenList =
    this.tokenize(
        [
            target.selector,
            target.semanticContext
        ].join(" ")
    );

const semanticTokens =
    new Set(
        semanticTokenList
    );


const conceptTokenMatches =
    (
        relationToken:
            string,

        semanticToken:
            string
    ): boolean => {

        if (
            relationToken ===
            semanticToken
        ) {

            return true;

        }

        const minimumSharedPrefix =
            5;

        const maximumComparableLength =
            Math.min(
                relationToken.length,
                semanticToken.length
            );

        if (
            maximumComparableLength <
                minimumSharedPrefix
        ) {

            return false;

        }

        let sharedPrefixLength =
            0;

        while (
            sharedPrefixLength <
                maximumComparableLength &&
            relationToken[
                sharedPrefixLength
            ] ===
                semanticToken[
                    sharedPrefixLength
                ]
        ) {

            sharedPrefixLength++;

        }

        return (
            sharedPrefixLength >=
                minimumSharedPrefix
        );

    };


const tokenBelongsToConcept =
    (
        semanticToken:
            string
    ): boolean => {

        return [
            ...relationSubjectTokens,
            ...relationObjectTokens
        ].some(
            conceptToken =>
                conceptTokenMatches(
                    conceptToken,
                    semanticToken
                )
        );

    };


const cueIsNegatedIn =
    (
        cue:
            string,

        tokenList:
            string[]
    ): boolean => {

        const negationTokens =
            new Set([
                "without",
                "not",
                "never",
                "cannot"
            ]);

        for (
            let index = 0;
            index < tokenList.length;
            index++
        ) {

            const semanticToken =
                tokenList[index];

            if (
                !conceptTokenMatches(
                    cue,
                    semanticToken
                )
            ) {

                continue;

            }

            if (
                tokenBelongsToConcept(
                    semanticToken
                )
            ) {

                continue;

            }

            const previousTokens =
                tokenList.slice(
                    Math.max(
                        0,
                        index - 3
                    ),
                    index
                );

            if (
                previousTokens.some(
                    token =>
                        negationTokens.has(
                            token
                        )
                )
            ) {

                return true;

            }

            if (
                previousTokens.length >= 2 &&
                previousTokens[
                    previousTokens.length - 2
                ] === "does" &&
                previousTokens[
                    previousTokens.length - 1
                ] === "not"
            ) {

                return true;

            }

            if (
                previousTokens.length >= 2 &&
                previousTokens[
                    previousTokens.length - 2
                ] === "did" &&
                previousTokens[
                    previousTokens.length - 1
                ] === "not"
            ) {

                return true;

            }

        }

        return false;

    };


const cueMatchesEvidenceIn =
    (
        cue:
            string,

        tokenList:
            string[]
    ): boolean => {

        return tokenList.some(
            semanticToken => {

                if (
                    tokenBelongsToConcept(
                        semanticToken
                    )
                ) {

                    return false;

                }

                return conceptTokenMatches(
                    cue,
                    semanticToken
                );

            }
        );

    };


const selectorMatchedSupportCues =
    supportCueTokens.filter(
        cue =>
            !cueIsNegatedIn(
                cue,
                selectorTokenList
            ) &&
            cueMatchesEvidenceIn(
                cue,
                selectorTokenList
            )
    );

const selectorMatchedChallengeCues =
    challengeCueTokens.filter(
        cue =>
            !cueIsNegatedIn(
                cue,
                selectorTokenList
            ) &&
            cueMatchesEvidenceIn(
                cue,
                selectorTokenList
            )
    );


const selectorHasActiveDirectionalEvidence =
    selectorMatchedSupportCues.length >
        0 ||
    selectorMatchedChallengeCues.length >
        0;


const evidenceTokenList =
    selectorHasActiveDirectionalEvidence
        ? selectorTokenList
        : semanticTokenList;


const negatedSupportCues =
    supportCueTokens.filter(
        cue =>
            cueMatchesEvidenceIn(
                cue,
                evidenceTokenList
            ) &&
            cueIsNegatedIn(
                cue,
                evidenceTokenList
            )
    );

const negatedChallengeCues =
    challengeCueTokens.filter(
        cue =>
            cueMatchesEvidenceIn(
                cue,
                evidenceTokenList
            ) &&
            cueIsNegatedIn(
                cue,
                evidenceTokenList
            )
    );


const matchedSupportCues =
    supportCueTokens.filter(
        cue =>
            !cueIsNegatedIn(
                cue,
                evidenceTokenList
            ) &&
            cueMatchesEvidenceIn(
                cue,
                evidenceTokenList
            )
    );

const matchedChallengeCues =
    challengeCueTokens.filter(
        cue =>
            !cueIsNegatedIn(
                cue,
                evidenceTokenList
            ) &&
            cueMatchesEvidenceIn(
                cue,
                evidenceTokenList
            )
    );
    const conceptMatched =
    (
        relationTokens:
            string[]
    ): boolean => {

        if (
            relationTokens.length ===
                0
        ) {

            return false;

        }


        return relationTokens.every(
            relationToken => {

                const lexicalMatch =
                    [...semanticTokens].some(
                        semanticToken =>
                            conceptTokenMatches(
                                relationToken,
                                semanticToken
                            )
                    );


                if (
                    lexicalMatch
                ) {

                    return true;

                }


                return semanticConceptMatches(
                    relationToken,
                    semanticTokenList
                );

            }
        );

    };


    const subjectMatched =
        conceptMatched(
            relationSubjectTokens
        );

    const objectMatched =
        conceptMatched(
            relationObjectTokens
        );


    const normalizedSemanticContext =
        this.normalize(
            target.semanticContext ?? ""
        );

    const hasExecutableAssertion =
        normalizedSemanticContext.includes(
            "expect"
        ) ||
        normalizedSemanticContext.includes(
            "assert"
        );


    let polarity:
        "SUPPORT" | "CHALLENGE" | "NEUTRAL" =
            "NEUTRAL";

    let decisionSource:
        "RELATION_EVIDENCE" |
        "CONDITION_FALLBACK" |
        "NEUTRAL" =
            "NEUTRAL";


    if (
        subjectMatched &&
        objectMatched &&
        hasExecutableAssertion &&
        matchedSupportCues.length > 0 &&
        matchedChallengeCues.length === 0
    ) {

        polarity =
            "SUPPORT";

        decisionSource =
            "RELATION_EVIDENCE";

    } else if (
        subjectMatched &&
        objectMatched &&
        hasExecutableAssertion &&
        matchedChallengeCues.length > 0 &&
        matchedSupportCues.length === 0
    ) {

        polarity =
            "CHALLENGE";

        decisionSource =
            "RELATION_EVIDENCE";

    } else {

        const minimumScore =
            2;

        const minimumMargin =
            2;


        if (
            supportConditionScore >=
                minimumScore &&
            supportConditionScore -
                challengeConditionScore >=
                minimumMargin
        ) {

            polarity =
                "SUPPORT";

            decisionSource =
                "CONDITION_FALLBACK";

        } else if (
            challengeConditionScore >=
                minimumScore &&
            challengeConditionScore -
                supportConditionScore >=
                minimumMargin
        ) {

            polarity =
                "CHALLENGE";

            decisionSource =
                "CONDITION_FALLBACK";

        }

    }


    return {

        polarity,

        decisionSource,

        relation:
            task.sourcePatternRelation ?? null,

        relationSubject:
            relationSubject || null,

        relationPredicate:
            normalizedRelationPredicate || null,

        relationObject:
            relationObject || null,

        subjectMatched,

        objectMatched,

        hasExecutableAssertion,

        matchedSupportCues,

        matchedChallengeCues,

        negatedSupportCues,

        negatedChallengeCues,

        supportConditionScore,

        challengeConditionScore

    };

}
private scientificPolarityConfidenceFor(
    trace:
        ScientificPolarityTrace
): number | null {

    if (
        trace.polarity ===
            "NEUTRAL" ||
        trace.decisionSource ===
            "NEUTRAL"
    ) {

        return null;

    }


    if (
        trace.decisionSource ===
            "RELATION_EVIDENCE"
    ) {

        const directionalEvidencePresent =
            trace.polarity ===
                "SUPPORT"
                ? trace.matchedSupportCues.length > 0
                : trace.matchedChallengeCues.length > 0;

        const opposingEvidenceAbsent =
            trace.polarity ===
                "SUPPORT"
                ? trace.matchedChallengeCues.length === 0
                : trace.matchedSupportCues.length === 0;


        if (
            trace.subjectMatched &&
            trace.objectMatched &&
            trace.hasExecutableAssertion &&
            directionalEvidencePresent &&
            opposingEvidenceAbsent
        ) {

            return 1;

        }

        return null;

    }


    if (
        trace.decisionSource ===
            "CONDITION_FALLBACK"
    ) {

        const winningScore =
            trace.polarity ===
                "SUPPORT"
                ? trace.supportConditionScore
                : trace.challengeConditionScore;

        const opposingScore =
            trace.polarity ===
                "SUPPORT"
                ? trace.challengeConditionScore
                : trace.supportConditionScore;

        const totalDirectionalScore =
            winningScore +
            opposingScore;


        if (
            totalDirectionalScore <=
                0
        ) {

            return null;

        }


        const directionalDominance =
            (
                winningScore -
                opposingScore
            ) /
            totalDirectionalScore;


        return (
            directionalDominance /
            2
        );

    }


    return null;

}
    private scientificPolarityFor(
    task:
        ExecutionTask,

    target:
        GitHubExecutableTarget
):
    "SUPPORT" | "CHALLENGE" | "NEUTRAL" {

    return this.scientificPolarityTraceFor(
        task,
        target
    ).polarity;

}

private extractScientificTerms(
    task:
        ExecutionTask
): string[] {

    /*
     * Only scientific identity contributes directly
     * to executable-target semantic matching.
     *
     * Procedure, requiredEvidence, successCriteria and
     * failureCriteria describe HOW to perform research,
     * not WHAT repository behavior the scientific target
     * represents.
     */

    const semanticText = [
    task.title,
    task.targetType,
    task.objective ?? "",
    task.hypothesis ?? ""
].join(
    " "
);
    const terms =
        new Set<string>();

    for (
        const token
        of this.tokenize(
            semanticText
        )
    ) {

        if (
            this.isMeaningfulToken(
                token
            )
        ) {
            terms.add(
                token
            );
        }

    }

    /*
     * Domain-aware concept expansion.
     *
     * This connects scientific vocabulary with common
     * executable-test terminology without using unsafe
     * substring matching such as:
     *
     * reserve -> preserves
     */

    if (
        terms.has(
            "reservation"
        )
    ) {

        terms.add(
            "reserve"
        );

        terms.add(
            "reserved"
        );

        terms.add(
            "reservable"
        );

        terms.add(
            "escrow"
        );

        terms.add(
            "locked"
        );

    }

    if (
        terms.has(
            "accounting"
        )
    ) {

        terms.add(
            "allocation"
        );

        terms.add(
            "balance"
        );

        terms.add(
            "available"
        );

    }

    if (
        terms.has(
            "settlement"
        )
    ) {

        terms.add(
            "settle"
        );

        terms.add(
            "settles"
        );

        terms.add(
            "release"
        );

    }

    if (
        terms.has(
            "invariant"
        )
    ) {

        terms.add(
            "invariants"
        );

    }

    return [
        ...terms
    ];

}

    private tokenize(
        value:
            string
    ): string[] {

        return value
            .replace(
                /([a-z])([A-Z])/g,
                "$1 $2"
            )
            .toLowerCase()
            .replace(
                /[^a-z0-9]+/g,
                " "
            )
            .split(
                /\s+/
            )
            .map(
                token =>
                    token.trim()
            )
            .filter(
                Boolean
            );

    }


    private normalize(
        value:
            string
    ): string {

        return this.tokenize(
            value
        ).join(
            " "
        );

    }


    private isMeaningfulToken(
        token:
            string
    ): boolean {

        if (
            token.length <
            4
        ) {
            return false;
        }


        if (
            /^\d+$/.test(
                token
            )
        ) {
            return false;
        }


        const stopWords =
            new Set([
                "this",
                "that",
                "with",
                "from",
                "into",
                "through",
                "after",
                "before",
                "against",
                "between",
                "under",
                "over",
                "then",
                "than",
                "when",
                "where",
                "which",
                "while",
                "have",
                "has",
                "been",
                "being",
                "were",
                "will",
                "would",
                "could",
                "should",
                "must",
                "source",
                "sources",
                "repository",
                "repositories",
                "evidence",
                "experiment",
                "experimental",
                "scientific",
                "target",
                "targets",
                "result",
                "results",
                "execution",
                "implementation",
                "implementations",
                "direct",
                "independent",
                "selected",
                "select",
                "related",
                "relevant",
                "current",
                "original",
                "previous",
                "regenerate",
                "generate",
                "compare",
                "recalculate",
                "search",
                "extract",
                "normalize",
                "ingest",
                "pipeline",
                "confidence",
                "assessment",
                "assessments",
                "validation"
            ]);


        return !stopWords.has(
            token
        );

    }


    private calculateConfidence(
        best:
            RankedExecutableTarget,

        secondBest:
            RankedExecutableTarget | undefined
    ): number {

        const semanticComponent =
            Math.min(
                70,
                best.score
            );


        const termComponent =
            Math.min(
                20,
                best.matchedTerms.length *
                    4
            );


        let separationComponent =
            10;


        if (
            secondBest
        ) {

            const separation =
                best.score -
                secondBest.score;


            separationComponent =
                Math.max(
                    0,
                    Math.min(
                        10,
                        separation
                    )
                );

        }


        return Math.min(
            100,
            semanticComponent +
                termComponent +
                separationComponent
        );

    }


    private unresolved(
        task:
            ExecutionTask,

        reasons:
            string[]
    ): ScientificExecutionTargetResolution {

        return {

            experimentId:
                task.experimentId,

            executionTaskId:
                task.executionTaskId,

            targetType:
                task.targetType,

            targetId:
                task.targetId,

            repository:
    null,

selectedExecutableTarget:
    null,

executionKind:
    "UNRESOLVED",

            testSelector:
                null,

            invariantSelector:
                null,

            staticAnalysisSelector:
                null,

            confidence:
                0,

            resolutionStatus:
                "UNRESOLVED",
            scientificPolarity:
    "NEUTRAL",

    polarityTrace:
    null,
    polarityConfidence:
    null,

            resolutionReasons:
                reasons.length > 0
                    ? reasons
                    : [
                        (
                            "No repository execution intelligence " +
                            "could be semantically resolved for this scientific target."
                        )
                    ]

        };

    }

}