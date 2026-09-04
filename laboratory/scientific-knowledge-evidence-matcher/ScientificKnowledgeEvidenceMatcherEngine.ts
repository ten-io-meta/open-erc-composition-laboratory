import type {
    ResearchTheoryResult
} from "../theory-engine/ResearchTheoryResult.js";

import type {
    EvidenceGraphResult
} from "../evidence-graph/EvidenceGraphResult.js";

import type {
    ScientificEvidenceFeedback
} from "../scientific-evidence-feedback/ScientificEvidenceFeedback.js";

import type {
    ScientificEvidenceFeedbackResult
} from "../scientific-evidence-feedback/ScientificEvidenceFeedbackResult.js";

import type {
    ScientificKnowledgeEvolutionResult
} from "../scientific-knowledge-evolution/ScientificKnowledgeEvolutionResult.js";

import type {
    ScientificKnowledgeState
} from "../scientific-knowledge-evolution/ScientificKnowledgeState.js";

import type {
    ScientificKnowledgeEvidenceMatch,
    ScientificKnowledgeEvidenceMatchStatus
} from "./ScientificKnowledgeEvidenceMatch.js";

import type {
    ScientificKnowledgeEvidenceMatchResult
} from "./ScientificKnowledgeEvidenceMatchResult.js";

export class ScientificKnowledgeEvidenceMatcherEngine {

   build(
    campaignId: string,
    feedbackResult:
        ScientificEvidenceFeedbackResult,
    knowledgeEvolution:
        ScientificKnowledgeEvolutionResult,
    theories:
        ResearchTheoryResult,
    evidenceGraph:
        EvidenceGraphResult
): ScientificKnowledgeEvidenceMatchResult {

        try {

            const matches:
                ScientificKnowledgeEvidenceMatch[] = [];

            let counter = 1;

            const matchableKnowledgeStates =
    (knowledgeEvolution.states ?? []).filter(
        state =>
            state.status !== "ARCHIVED"
    );

            for (
                const feedback
                of feedbackResult.feedback ?? []
            ) {

                matches.push(
    this.buildMatch(
        counter++,
        campaignId,
        feedback,
        matchableKnowledgeStates,
        theories,
        evidenceGraph
    )
);

            }

            return {

                generatedAt:
                    new Date().toISOString(),

                campaignId,

                matches,

                statistics: {

                    total:
                        matches.length,

                    matched:
                        this.countStatus(
                            matches,
                            "MATCHED"
                        ),

                    ambiguous:
                        this.countStatus(
                            matches,
                            "AMBIGUOUS"
                        ),

                    unmatched:
                        this.countStatus(
                            matches,
                            "UNMATCHED"
                        ),

                    strengthenMatched:
                        matches.filter(
                            item =>
                                item.matchStatus === "MATCHED" &&
                                item.feedbackAction === "STRENGTHEN"
                        ).length,

                    challengeMatched:
                        matches.filter(
                            item =>
                                item.matchStatus === "MATCHED" &&
                                item.feedbackAction === "CHALLENGE"
                        ).length,

                    holdMatched:
                        matches.filter(
                            item =>
                                item.matchStatus === "MATCHED" &&
                                item.feedbackAction === "HOLD"
                        ).length,

                    sourceConclusionIdMatches:
    matches.filter(
        item =>
            item.matchStatus === "MATCHED" &&
            item.matchMethod ===
            "SOURCE_CONCLUSION_ID"
    ).length,

explicitKnowledgeIdMatches:
    matches.filter(
        item =>
            item.matchStatus === "MATCHED" &&
            item.matchMethod ===
            "EXPLICIT_KNOWLEDGE_ID"
    ).length,
                    exactCanonicalStatementMatches:
                        matches.filter(
                            item =>
                                item.matchStatus === "MATCHED" &&
                                item.matchMethod ===
                                "EXACT_CANONICAL_STATEMENT"
                        ).length

                },

                errors: []

            };

        } catch (error) {

            return {

                generatedAt:
                    new Date().toISOString(),

                campaignId,

                matches: [],

                statistics: {

                    total: 0,

                    matched: 0,

                    ambiguous: 0,

                    unmatched: 0,

                    strengthenMatched: 0,

                    challengeMatched: 0,

                    holdMatched: 0,

                    sourceConclusionIdMatches: 0,

explicitKnowledgeIdMatches: 0,

exactCanonicalStatementMatches: 0

                },

                errors: [
                    error instanceof Error
                        ? error.message
                        : String(error)
                ]

            };

        }

    }

    private buildMatch(
    index: number,
    campaignId: string,
    feedback:
        ScientificEvidenceFeedback,
    knowledgeStates:
        ScientificKnowledgeState[],
    theories:
        ResearchTheoryResult,
    evidenceGraph:
        EvidenceGraphResult
): ScientificKnowledgeEvidenceMatch {
    /*
 * Theory provenance match.
 *
 * Resolve:
 *
 * feedback.targetId
 * -> ResearchTheory.theoryId
 * -> ResearchTheory.supportingEdges
 * -> EvidenceGraph edges
 * -> canonical scientific knowledge statement
 *
 * This preserves deterministic provenance instead of
 * relying on fuzzy semantic similarity.
 */

const normalizedFeedbackTarget =
    this.normalizeTargetId(
        feedback.targetId
    );

const matchingTheory =
    (theories.theories ?? []).find(
        theory =>
            this.normalizeTargetId(
                theory.theoryId
            ) ===
            normalizedFeedbackTarget
    );

if (matchingTheory) {

    const supportingEdgeIds =
        new Set(
            matchingTheory.supportingEdges ?? []
        );

    const theoryEdges =
        (evidenceGraph.edges ?? []).filter(
            edge =>
                supportingEdgeIds.has(
                    edge.edgeId
                )
        );

    const theoryKnowledgeCandidates =
        knowledgeStates.filter(
            state => {

                const canonicalKnowledge =
                    this.canonicalStatement(
                        state.statement
                    );

                return theoryEdges.some(
                    edge =>
                        this.canonicalStatement(
                            this.statementForEvidenceEdge(
                                edge.from,
                                edge.relation,
                                edge.to
                            )
                        ) ===
                        canonicalKnowledge
                );

            }
        );

    const uniqueTheoryCandidates =
        Array.from(
            new Map(
                theoryKnowledgeCandidates.map(
                    state => [
                        state.knowledgeId,
                        state
                    ]
                )
            ).values()
        );

    if (
        uniqueTheoryCandidates.length === 1
    ) {

        return this.resultFor(
            index,
            campaignId,
            feedback,
            uniqueTheoryCandidates,
            "MATCHED",
            "THEORY_PROVENANCE"
        );

    }

    if (
        uniqueTheoryCandidates.length > 1
    ) {

        return this.resultFor(
            index,
            campaignId,
            feedback,
            uniqueTheoryCandidates,
            "AMBIGUOUS",
            "THEORY_PROVENANCE"
        );

    }

}
/*
 * Deterministic source conclusion match.
 *
 * The original ResearchConclusion identity is propagated through:
 *
 * ResearchConclusion
 *   -> ConfidenceAssessment
 *   -> KnowledgeConsolidation
 *   -> ScientificKnowledgeState
 *
 * and independently through:
 *
 * ResearchConclusion
 *   -> Experiment
 *   -> Execution
 *   -> Feedback
 */

const sourceConclusionCandidates =
    knowledgeStates.filter(
        state =>
            feedback.sourceConclusionId &&
            state.sourceConclusionId &&
            state.sourceConclusionId ===
            feedback.sourceConclusionId
    );

if (sourceConclusionCandidates.length === 1) {

    return this.resultFor(
        index,
        campaignId,
        feedback,
        sourceConclusionCandidates,
        "MATCHED",
        "SOURCE_CONCLUSION_ID"
    );

}

if (sourceConclusionCandidates.length > 1) {

    return this.resultFor(
        index,
        campaignId,
        feedback,
        sourceConclusionCandidates,
        "AMBIGUOUS",
        "SOURCE_CONCLUSION_ID"
    );

}
        /*
 * Deterministic targetId match.
 *
 * The scientific target identity is propagated from
 * experiment -> execution -> outcome -> observation
 * -> evidence -> feedback.
 *
 * Retest experiments may prefix the original target:
 * KNOWLEDGE:<knowledgeId>
 * THEORY:<id>
 * DISCOVERY:<id>
 * EVIDENCE_HISTORY:<id>
 */

const normalizedTargetId =
    this.normalizeTargetId(
        feedback.targetId
    );

const targetCandidates =
    knowledgeStates.filter(
        state =>
            this.normalizeTargetId(
                state.knowledgeId
            ) ===
            normalizedTargetId
    );

if (
    targetCandidates.length === 1
) {

    return this.resultFor(
        index,
        campaignId,
        feedback,
        targetCandidates,
        "MATCHED",
        "EXPLICIT_KNOWLEDGE_ID"
    );

}

if (
    targetCandidates.length > 1
) {

    return this.resultFor(
        index,
        campaignId,
        feedback,
        targetCandidates,
        "AMBIGUOUS",
        "EXPLICIT_KNOWLEDGE_ID"
    );

}

        /*
         * First attempt:
         *
         * Look for an explicit knowledgeId anywhere in the
         * provenance carried by the execution feedback.
         */

        const provenanceText =
            this.provenanceTextFor(
                feedback
            );

        const explicitCandidates =
            knowledgeStates.filter(
                state =>
                    provenanceText.includes(
                        this.normalize(
                            state.knowledgeId
                        )
                    )
            );

        if (
            explicitCandidates.length === 1
        ) {

            return this.resultFor(
                index,
                campaignId,
                feedback,
                explicitCandidates,
                "MATCHED",
                "EXPLICIT_KNOWLEDGE_ID"
            );

        }

        if (
            explicitCandidates.length > 1
        ) {

            return this.resultFor(
                index,
                campaignId,
                feedback,
                explicitCandidates,
                "AMBIGUOUS",
                "EXPLICIT_KNOWLEDGE_ID"
            );

        }

        /*
         * Second attempt:
         *
         * Require an exact canonical statement match.
         *
         * We deliberately do not use fuzzy semantic similarity
         * because scientific evidence must not strengthen knowledge
         * merely because two sentences appear related.
         */

        const feedbackStatements =
            [
                feedback.statement,
                ...feedback.sourceEvidence,
                ...feedback.sourceObservations
            ]
                .map(
                    value =>
                        this.canonicalStatement(
                            value
                        )
                )
                .filter(
                    value =>
                        value.length > 0
                );

        const statementCandidates =
            knowledgeStates.filter(
                state => {

                    const canonicalKnowledge =
                        this.canonicalStatement(
                            state.statement
                        );

                    return feedbackStatements.includes(
                        canonicalKnowledge
                    );

                }
            );

        if (
            statementCandidates.length === 1
        ) {

            return this.resultFor(
                index,
                campaignId,
                feedback,
                statementCandidates,
                "MATCHED",
                "EXACT_CANONICAL_STATEMENT"
            );

        }

        if (
            statementCandidates.length > 1
        ) {

            return this.resultFor(
                index,
                campaignId,
                feedback,
                statementCandidates,
                "AMBIGUOUS",
                "EXACT_CANONICAL_STATEMENT"
            );

        }

        return this.resultFor(
            index,
            campaignId,
            feedback,
            [],
            "UNMATCHED",
            "NONE"
        );

    }

    private resultFor(
        index: number,
        campaignId: string,
        feedback:
            ScientificEvidenceFeedback,
        candidates:
            ScientificKnowledgeState[],
        status:
            ScientificKnowledgeEvidenceMatchStatus,
        method:
            ScientificKnowledgeEvidenceMatch[
                "matchMethod"
            ]
    ): ScientificKnowledgeEvidenceMatch {

        const matchedKnowledge =
            status === "MATCHED" &&
            candidates.length === 1
                ? candidates[0]
                : null;

        return {

            matchId:
                `SCIENTIFIC-KNOWLEDGE-EVIDENCE-MATCH-${String(
                    index
                ).padStart(5, "0")}`,

            campaignId,

            feedbackId:
                feedback.feedbackId,

            evidenceId:
    feedback.evidenceId,

experimentId:
    feedback.experimentId,

sourceConclusionId:
    feedback.sourceConclusionId,

sourceIds:
    [
        ...(
            feedback.sourceIds ??
            []
        )
    ],

targetEvidenceIds:
    [
        ...(
            feedback.targetEvidenceIds ??
            []
        )
    ],

executionPlanId:
    feedback.executionPlanId,

            executionTaskId:
                feedback.executionTaskId,

                        stepId:
                feedback.stepId,

            repository:
                feedback.repository,

            feedbackAction:
                feedback.action,

            matchStatus:
                status,

            knowledgeId:
                matchedKnowledge
                    ?.knowledgeId ??
                null,

            candidateKnowledgeIds:
                candidates.map(
                    candidate =>
                        candidate.knowledgeId
                ),

            matchMethod:
                method,

            statement:
                feedback.statement,

            generatedAt:
                new Date().toISOString(),

            explanation:
                this.explanationFor(
                    feedback,
                    status,
                    method,
                    candidates
                )

        };

    }

    private provenanceTextFor(
        feedback:
            ScientificEvidenceFeedback
    ): string {

        return this.normalize(
            [
                feedback.statement,
                ...feedback.sourceEvidence,
                ...feedback.sourceObservations
            ].join(
                " "
            )
        );

    }

    private explanationFor(
        feedback:
            ScientificEvidenceFeedback,
        status:
            ScientificKnowledgeEvidenceMatchStatus,
        method:
            ScientificKnowledgeEvidenceMatch[
                "matchMethod"
            ],
        candidates:
            ScientificKnowledgeState[]
    ): string {

        switch (status) {

            case "MATCHED":

                return (
                    `Feedback ${feedback.feedbackId} was matched ` +
                    `deterministically to knowledge ` +
                    `${candidates[0]?.knowledgeId ?? "UNKNOWN"} ` +
                    `using method ${method}.`
                );

            case "AMBIGUOUS":

                return (
                    `Feedback ${feedback.feedbackId} matched multiple ` +
                    `knowledge candidates using method ${method}. ` +
                    `No scientific knowledge mutation is permitted ` +
                    `until the ambiguity is resolved.`
                );

            case "UNMATCHED":

                return (
                    `Feedback ${feedback.feedbackId} could not be ` +
                    `deterministically linked to a scientific knowledge ` +
                    `state. The feedback is preserved but cannot modify ` +
                    `scientific knowledge.`
                );

        }

    }
private statementForEvidenceEdge(
    from: string,
    relation: string,
    to: string
): string {

    return (
        `${from} appears to ` +
        `${String(relation).toLowerCase()} ` +
        `${to}`
    );

}
    private canonicalStatement(
        value: string
    ): string {

        return this.normalize(
            value
        )
            .replace(
                /\bacross \d+ independent sources?\b/g,
                ""
            )
            .replace(
                /\bwith \d+ independent sources?\b/g,
                ""
            )
            .replace(
                /\bsupported by \d+ sources?\b/g,
                ""
            )
            .replace(
                /\bconfidence \d+\b/g,
                ""
            )
            .replace(
                /\bconfidence score \d+\b/g,
                ""
            )
            .replace(
                /\bevidence count \d+\b/g,
                ""
            )
            .replace(
                /\s+/g,
                " "
            )
            .trim();

    }
private normalizeTargetId(
    value: string
): string {

    const raw =
        String(
            value ?? ""
        ).trim();

    const withoutKnownPrefix =
        raw.replace(
            /^(KNOWLEDGE|THEORY|DISCOVERY|EVIDENCE_HISTORY):/i,
            ""
        );

    return withoutKnownPrefix
        .replace(
            /[^a-zA-Z0-9]+/g,
            "-"
        )
        .replace(
            /^-|-$/g,
            ""
        )
        .toUpperCase();

}
    private normalize(
        value: string
    ): string {

        return String(
            value ?? ""
        )
            .replace(
                /([a-z])([A-Z])/g,
                "$1 $2"
            )
            .replace(
                /[^a-zA-Z0-9]+/g,
                " "
            )
            .toLowerCase()
            .trim();

    }

    private countStatus(
        matches:
            ScientificKnowledgeEvidenceMatch[],
        status:
            ScientificKnowledgeEvidenceMatchStatus
    ): number {

        return matches.filter(
            match =>
                match.matchStatus ===
                status
        ).length;

    }

}