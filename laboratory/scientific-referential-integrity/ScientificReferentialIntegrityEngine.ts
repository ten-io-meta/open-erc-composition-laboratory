import type {
    ScientificKnowledgeEvolutionResult
} from "../scientific-knowledge-evolution/ScientificKnowledgeEvolutionResult.js";

import type {
    ScientificKnowledgeState
} from "../scientific-knowledge-evolution/ScientificKnowledgeState.js";

import type {
    ResearchConclusion
} from "../research-conclusions/ResearchConclusion.js";

import type {
    ResearchConclusionResult
} from "../research-conclusions/ResearchConclusionResult.js";

import type {
    CrossSourcePattern
} from "../cross-source-patterns/CrossSourcePattern.js";

import type {
    CrossSourcePatternResult
} from "../cross-source-patterns/CrossSourcePatternResult.js";

import type {
    ScientificReferentialIntegrity,
    ScientificReferentialIntegrityStatus
} from "./ScientificReferentialIntegrity.js";

import type {
    ScientificReferentialIntegrityResult
} from "./ScientificReferentialIntegrityResult.js";

export class ScientificReferentialIntegrityEngine {

    build(
        campaignId: string,
        knowledge:
            ScientificKnowledgeEvolutionResult,
        conclusions:
            ResearchConclusionResult,
        patterns:
            CrossSourcePatternResult
    ): ScientificReferentialIntegrityResult {

        try {

            const generatedAt =
                new Date().toISOString();

            const conclusionById =
                new Map<
                    string,
                    ResearchConclusion
                >(
                    (conclusions.conclusions ?? []).map(
                        conclusion => [
                            conclusion.conclusionId,
                            conclusion
                        ]
                    )
                );

            const patternById =
                new Map<
                    string,
                    CrossSourcePattern
                >(
                    (patterns.patterns ?? []).map(
                        pattern => [
                            pattern.patternId,
                            pattern
                        ]
                    )
                );

            /*
 * Referential integrity is evaluated only against
 * knowledge observed in the current campaign.
 *
 * Archived states preserve historical provenance whose
 * positional conclusion and pattern IDs belong to an
 * earlier campaign and must not be resolved against the
 * current campaign graph.
 */

const auditableStates =
    (knowledge.states ?? []).filter(
        state =>
            state.status !== "ARCHIVED"
    );

const originUsage =
    this.originUsageFor(
        auditableStates
    );

            const integrity:
                ScientificReferentialIntegrity[] = [];

            let integrityCounter = 1;

            for (
    const state
    of auditableStates
) {

                const issues:
                    ScientificReferentialIntegrityStatus[] = [];

                const explanations:
                    string[] = [];

                const conclusion =
                    conclusionById.get(
                        state.sourceConclusionId
                    );

                const pattern =
                    patternById.get(
                        state.sourcePatternId
                    );

                /*
                 * Check 1:
                 * The referenced conclusion must exist.
                 */

                if (!conclusion) {

                    issues.push(
                        "BROKEN_CONCLUSION_REFERENCE"
                    );

                    explanations.push(
                        `Conclusion ${state.sourceConclusionId} does not exist.`
                    );

                }

                /*
                 * Check 2:
                 * The referenced cross-source pattern must exist.
                 */

                if (!pattern) {

                    issues.push(
                        "BROKEN_PATTERN_REFERENCE"
                    );

                    explanations.push(
                        `Pattern ${state.sourcePatternId} does not exist.`
                    );

                }

                /*
                 * Check 3:
                 * The conclusion must originate from the same pattern
                 * referenced by the scientific knowledge state.
                 */

                if (
                    conclusion &&
                    conclusion.sourcePatternId !==
                    state.sourcePatternId
                ) {

                    issues.push(
                        "CONCLUSION_PATTERN_MISMATCH"
                    );

                    explanations.push(
                        `Conclusion ${conclusion.conclusionId} references ` +
                        `${conclusion.sourcePatternId}, but knowledge ` +
                        `${state.knowledgeId} references ${state.sourcePatternId}.`
                    );

                }

                /*
                 * Check 4:
                 * The knowledge relation must match the relation
                 * stored by the conclusion.
                 */

                if (
                    conclusion &&
                    !this.sameRelation(
                        state.sourcePatternRelation,
                        conclusion.sourcePatternRelation
                    )
                ) {

                    issues.push(
                        "RELATION_MISMATCH"
                    );

                    explanations.push(
                        `Knowledge relation ${state.sourcePatternRelation} ` +
                        `does not match conclusion relation ` +
                        `${conclusion.sourcePatternRelation}.`
                    );

                }

                /*
                 * Check 5:
                 * The knowledge relation must also match the
                 * normalized relation stored by the pattern.
                 */

                if (
                    pattern &&
                    !this.sameRelation(
                        state.sourcePatternRelation,
                        pattern.normalizedRelation
                    )
                ) {

                    if (
                        !issues.includes(
                            "RELATION_MISMATCH"
                        )
                    ) {
                        issues.push(
                            "RELATION_MISMATCH"
                        );
                    }

                    explanations.push(
                        `Knowledge relation ${state.sourcePatternRelation} ` +
                        `does not match pattern relation ` +
                        `${pattern.normalizedRelation}.`
                    );

                }

                /*
                 * Check 6:
                 * Knowledge origin must identify the same conclusion.
                 */

                const expectedOriginTargetId =
                    `CONCLUSION:${state.sourceConclusionId}`;

                if (
                    state.originTargetId !==
                    expectedOriginTargetId
                ) {

                    issues.push(
                        "ORIGIN_TARGET_MISMATCH"
                    );

                    explanations.push(
                        `Origin target ${state.originTargetId} does not match ` +
                        `expected origin ${expectedOriginTargetId}.`
                    );

                }

                /*
                 * Check 7:
                 * A conclusion should not produce multiple incompatible
                 * scientific knowledge states.
                 */

                const statesUsingOrigin =
                    originUsage.get(
                        state.originTargetId
                    ) ?? [];

                const incompatibleDuplicate =
                    statesUsingOrigin.some(
                        candidate =>
                            candidate.knowledgeId !==
                            state.knowledgeId &&
                            this.canonicalStatement(
                                candidate.statement
                            ) !==
                            this.canonicalStatement(
                                state.statement
                            )
                    );

                if (
                    incompatibleDuplicate
                ) {

                    issues.push(
                        "DUPLICATE_ORIGIN"
                    );

                    explanations.push(
                        `Origin ${state.originTargetId} is used by multiple ` +
                        `knowledge states with different statements.`
                    );

                }

                const uniqueIssues =
                    Array.from(
                        new Set(
                            issues
                        )
                    );

                const status =
                    this.primaryStatusFor(
                        uniqueIssues
                    );

                const valid =
                    uniqueIssues.length === 0;

                integrity.push({

                    integrityId:
                        `SCI-REFERENTIAL-INTEGRITY-${String(
                            integrityCounter++
                        ).padStart(5, "0")}`,

                    knowledgeId:
                        state.knowledgeId,

                    sourceConclusionId:
                        state.sourceConclusionId,

                    sourcePatternId:
                        state.sourcePatternId,

                    sourcePatternRelation:
                        state.sourcePatternRelation,

                    originTargetId:
                        state.originTargetId,

                    status,

                    valid,

                    issues:
                        uniqueIssues,

                    explanation:
                        valid
                            ? (
                                "All scientific provenance references are valid and internally consistent."
                            )
                            : explanations.join(" ")

                });

            }

            return {

                generatedAt,

                campaignId,

                integrity,

                statistics:
                    this.statisticsFor(
                        integrity
                    ),

                errors: []

            };

        } catch (error) {

            return {

                generatedAt:
                    new Date().toISOString(),

                campaignId,

                integrity: [],

                statistics: {

                    totalKnowledge: 0,

                    validKnowledge: 0,

                    invalidKnowledge: 0,

                    brokenConclusionReferences: 0,

                    brokenPatternReferences: 0,

                    conclusionPatternMismatches: 0,

                    relationMismatches: 0,

                    originTargetMismatches: 0,

                    duplicatedOrigins: 0,

                    integrityScore: 0
                },

                errors: [
                    error instanceof Error
                        ? error.message
                        : "Unknown scientific referential integrity error"
                ]

            };

        }

    }

    private originUsageFor(
        states:
            ScientificKnowledgeState[]
    ): Map<
        string,
        ScientificKnowledgeState[]
    > {

        const originUsage =
            new Map<
                string,
                ScientificKnowledgeState[]
            >();

        for (
            const state
            of states
        ) {

            const existing =
                originUsage.get(
                    state.originTargetId
                ) ?? [];

            existing.push(
                state
            );

            originUsage.set(
                state.originTargetId,
                existing
            );

        }

        return originUsage;

    }

    private sameRelation(
        first: string,
        second: string
    ): boolean {

        return (
            this.normalizeRelation(
                first
            ) ===
            this.normalizeRelation(
                second
            )
        );

    }

    private normalizeRelation(
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
                ":"
            )
            .replace(
                /^:+|:+$/g,
                ""
            )
            .replace(
                /:+/g,
                ":"
            )
            .toUpperCase();

    }

    private canonicalStatement(
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
            .replace(
                /\s+/g,
                " "
            )
            .toLowerCase()
            .trim();

    }

    private primaryStatusFor(
        issues:
            ScientificReferentialIntegrityStatus[]
    ): ScientificReferentialIntegrityStatus {

        const priority:
            ScientificReferentialIntegrityStatus[] = [
                "BROKEN_CONCLUSION_REFERENCE",
                "BROKEN_PATTERN_REFERENCE",
                "CONCLUSION_PATTERN_MISMATCH",
                "RELATION_MISMATCH",
                "ORIGIN_TARGET_MISMATCH",
                "DUPLICATE_ORIGIN"
            ];

        for (
            const status
            of priority
        ) {

            if (
                issues.includes(
                    status
                )
            ) {
                return status;
            }

        }

        return "VALID";

    }

    private statisticsFor(
        integrity:
            ScientificReferentialIntegrity[]
    ): ScientificReferentialIntegrityResult["statistics"] {

        const totalKnowledge =
            integrity.length;

        const validKnowledge =
            integrity.filter(
                item =>
                    item.valid
            ).length;

        const invalidKnowledge =
            totalKnowledge -
            validKnowledge;

        return {

            totalKnowledge,

            validKnowledge,

            invalidKnowledge,

            brokenConclusionReferences:
                this.countIssue(
                    integrity,
                    "BROKEN_CONCLUSION_REFERENCE"
                ),

            brokenPatternReferences:
                this.countIssue(
                    integrity,
                    "BROKEN_PATTERN_REFERENCE"
                ),

            conclusionPatternMismatches:
                this.countIssue(
                    integrity,
                    "CONCLUSION_PATTERN_MISMATCH"
                ),

            relationMismatches:
                this.countIssue(
                    integrity,
                    "RELATION_MISMATCH"
                ),

            originTargetMismatches:
                this.countIssue(
                    integrity,
                    "ORIGIN_TARGET_MISMATCH"
                ),

            duplicatedOrigins:
                this.countIssue(
                    integrity,
                    "DUPLICATE_ORIGIN"
                ),

            integrityScore:
                totalKnowledge === 0
                    ? 100
                    : Math.round(
                        (
                            validKnowledge /
                            totalKnowledge
                        ) *
                        100
                    )

        };

    }

    private countIssue(
        integrity:
            ScientificReferentialIntegrity[],
        issue:
            ScientificReferentialIntegrityStatus
    ): number {

        return integrity.filter(
            item =>
                item.issues.includes(
                    issue
                )
        ).length;

    }

}