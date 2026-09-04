import type {
    ScientificExecutionEvidence
} from "../scientific-execution-evidence/ScientificExecutionEvidence.js";

import type {
    ScientificExecutionEvidenceResult
} from "../scientific-execution-evidence/ScientificExecutionEvidenceResult.js";

import type {
    ScientificEvidenceFeedback
} from "../scientific-evidence-feedback/ScientificEvidenceFeedback.js";

import type {
    ScientificEvidenceFeedbackResult
} from "../scientific-evidence-feedback/ScientificEvidenceFeedbackResult.js";

import type {
    ScientificKnowledgeEvidenceMatch
} from "../scientific-knowledge-evidence-matcher/ScientificKnowledgeEvidenceMatch.js";

import type {
    ScientificKnowledgeEvidenceMatchResult
} from "../scientific-knowledge-evidence-matcher/ScientificKnowledgeEvidenceMatchResult.js";

import type {
    ScientificEvidenceAssimilation
} from "../scientific-evidence-assimilation/ScientificEvidenceAssimilation.js";

import type {
    ScientificEvidenceAssimilationResult
} from "../scientific-evidence-assimilation/ScientificEvidenceAssimilationResult.js";

import type {
    ScientificKnowledgeEvolution
} from "../scientific-knowledge-evolution/ScientificKnowledgeEvolution.js";

import type {
    ScientificKnowledgeEvolutionResult
} from "../scientific-knowledge-evolution/ScientificKnowledgeEvolutionResult.js";

import type {
    ScientificBeliefRevision
} from "../scientific-belief-revision/ScientificBeliefRevision.js";

import type {
    ScientificBeliefRevisionResult
} from "../scientific-belief-revision/ScientificBeliefRevisionResult.js";

import type {
    ScientificBeliefTransitionAuthorization
} from "../scientific-belief-transition-authorization/ScientificBeliefTransitionAuthorization.js";

import type {
    ScientificBeliefTransitionAuthorizationResult
} from "../scientific-belief-transition-authorization/ScientificBeliefTransitionAuthorizationResult.js";

import type {
    ScientificBeliefStateTransition
} from "../scientific-belief-state-transition/ScientificBeliefStateTransition.js";

import type {
    ScientificBeliefStateTransitionResult
} from "../scientific-belief-state-transition/ScientificBeliefStateTransitionResult.js";

import type {
    ScientificPostExecutionReferentialIntegrityIssue,
    ScientificPostExecutionReferentialIntegrityStatus
} from "./ScientificPostExecutionReferentialIntegrity.js";

import type {
    ScientificPostExecutionReferentialIntegrityResult
} from "./ScientificPostExecutionReferentialIntegrityResult.js";


export class ScientificPostExecutionReferentialIntegrityEngine {

    build(
        campaignId: string,
        executionEvidence:
            ScientificExecutionEvidenceResult,
        feedback:
            ScientificEvidenceFeedbackResult,
        matches:
            ScientificKnowledgeEvidenceMatchResult,
        assimilation:
            ScientificEvidenceAssimilationResult,
        reconciliation:
            ScientificKnowledgeEvolutionResult,
        beliefRevision:
            ScientificBeliefRevisionResult,
        authorization:
            ScientificBeliefTransitionAuthorizationResult,
        stateTransition:
            ScientificBeliefStateTransitionResult
    ): ScientificPostExecutionReferentialIntegrityResult {

        try {

            const issues:
                ScientificPostExecutionReferentialIntegrityIssue[] = [];

            const addIssue = (
                status:
                    ScientificPostExecutionReferentialIntegrityStatus,
                entityType:
                    ScientificPostExecutionReferentialIntegrityIssue[
                        "entityType"
                    ],
                entityId: string,
                referenceType: string,
                referenceId: string | null,
                explanation: string
            ): void => {

                issues.push({
                    status,
                    entityType,
                    entityId,
                    referenceType,
                    referenceId,
                    explanation
                });

            };


            /*
             * ----------------------------------------------------
             * Campaign continuity.
             * ----------------------------------------------------
             */

            const campaignResults = [
                {
                    entityType: "EVIDENCE" as const,
                    entityId: "EXECUTION-EVIDENCE-RESULT",
                    campaignId:
                        executionEvidence.campaignId
                },
                {
                    entityType: "FEEDBACK" as const,
                    entityId: "EVIDENCE-FEEDBACK-RESULT",
                    campaignId:
                        feedback.campaignId
                },
                {
                    entityType: "MATCH" as const,
                    entityId: "KNOWLEDGE-EVIDENCE-MATCH-RESULT",
                    campaignId:
                        matches.campaignId
                },
                {
                    entityType: "ASSIMILATION" as const,
                    entityId: "EVIDENCE-ASSIMILATION-RESULT",
                    campaignId:
                        assimilation.campaignId
                },
                {
                    entityType: "RECONCILIATION" as const,
                    entityId: "KNOWLEDGE-EVIDENCE-RECONCILIATION",
                    campaignId:
                        reconciliation.campaignId
                }
            ];

            for (const item of campaignResults) {

                if (
                    item.campaignId !==
                    campaignId
                ) {

                    addIssue(
                        "CAMPAIGN_MISMATCH",
                        item.entityType,
                        item.entityId,
                        "campaignId",
                        item.campaignId ?? null,
                        `Expected campaign ${campaignId}, ` +
                        `received ${item.campaignId}.`
                    );

                }

            }


            /*
             * ----------------------------------------------------
             * Indexes.
             * ----------------------------------------------------
             */

            const evidenceById =
                new Map<
                    string,
                    ScientificExecutionEvidence
                >(
                    (executionEvidence.evidence ?? []).map(
                        item => [
                            item.evidenceId,
                            item
                        ]
                    )
                );

            const feedbackById =
                new Map<
                    string,
                    ScientificEvidenceFeedback
                >(
                    (feedback.feedback ?? []).map(
                        item => [
                            item.feedbackId,
                            item
                        ]
                    )
                );

            const matchesByEvidenceKnowledge =
                new Map<
                    string,
                    ScientificKnowledgeEvidenceMatch[]
                >();

            for (
                const match
                of matches.matches ?? []
            ) {

                if (
                    match.matchStatus !== "MATCHED" ||
                    !match.knowledgeId
                ) {
                    continue;
                }

                const key =
                    this.evidenceKnowledgeKey(
                        match.evidenceId,
                        match.knowledgeId
                    );

                const current =
                    matchesByEvidenceKnowledge.get(
                        key
                    ) ?? [];

                current.push(
                    match
                );

                matchesByEvidenceKnowledge.set(
                    key,
                    current
                );

            }


            const reconciliationsByKnowledge =
                this.indexByKnowledge(
                    reconciliation.evolutions ?? []
                );

            const revisionsByKnowledge =
                this.indexByKnowledge(
                    beliefRevision.revisions ?? []
                );

            const authorizationsByKnowledge =
                this.indexByKnowledge(
                    authorization.authorizations ?? []
                );

            const transitionsByKnowledge =
                this.indexByKnowledge(
                    stateTransition.transitions ?? []
                );


            /*
             * ----------------------------------------------------
             * Evidence -> Feedback.
             * ----------------------------------------------------
             */

            for (
                const item
                of feedback.feedback ?? []
            ) {

                const sourceEvidence =
                    evidenceById.get(
                        item.evidenceId
                    );

                if (!sourceEvidence) {

                    addIssue(
                        "BROKEN_FEEDBACK_EVIDENCE_REFERENCE",
                        "FEEDBACK",
                        item.feedbackId,
                        "evidenceId",
                        item.evidenceId,
                        `Feedback ${item.feedbackId} references ` +
                        `execution evidence ${item.evidenceId}, ` +
                        `but that evidence does not exist.`
                    );

                    continue;

                }

                if (
                    !this.feedbackMatchesEvidence(
                        item,
                        sourceEvidence
                    )
                ) {

                    addIssue(
                        "FEEDBACK_EVIDENCE_PROVENANCE_MISMATCH",
                        "FEEDBACK",
                        item.feedbackId,
                        "evidenceId",
                        item.evidenceId,
                        `Feedback ${item.feedbackId} does not preserve ` +
                        `the provenance of execution evidence ` +
                        `${item.evidenceId}.`
                    );

                }

            }


            /*
             * ----------------------------------------------------
             * Feedback -> Match.
             * ----------------------------------------------------
             */

            for (
                const match
                of matches.matches ?? []
            ) {

                const sourceFeedback =
                    feedbackById.get(
                        match.feedbackId
                    );

                if (!sourceFeedback) {

                    addIssue(
                        "BROKEN_MATCH_FEEDBACK_REFERENCE",
                        "MATCH",
                        match.matchId,
                        "feedbackId",
                        match.feedbackId,
                        `Match ${match.matchId} references feedback ` +
                        `${match.feedbackId}, but that feedback ` +
                        `does not exist.`
                    );

                    continue;

                }

                if (
                    !this.matchPreservesFeedback(
                        match,
                        sourceFeedback
                    )
                ) {

                    addIssue(
                        "MATCH_FEEDBACK_PROVENANCE_MISMATCH",
                        "MATCH",
                        match.matchId,
                        "feedbackId",
                        match.feedbackId,
                        `Match ${match.matchId} does not preserve ` +
                        `the execution-feedback provenance of ` +
                        `${match.feedbackId}.`
                    );

                }

            }


            /*
             * ----------------------------------------------------
             * Match -> Assimilation.
             * ----------------------------------------------------
             */

            for (
                const item
                of assimilation.assimilations ?? []
            ) {

                const key =
                    this.evidenceKnowledgeKey(
                        item.evidenceId,
                        item.knowledgeId
                    );

                const sourceMatches =
                    matchesByEvidenceKnowledge.get(
                        key
                    ) ?? [];

                if (
                    sourceMatches.length === 0
                ) {

                    addIssue(
                        "BROKEN_ASSIMILATION_MATCH_REFERENCE",
                        "ASSIMILATION",
                        item.assimilationId,
                        "evidenceId+knowledgeId",
                        key,
                        `Assimilation ${item.assimilationId} cannot ` +
                        `be reconstructed from a MATCHED evidence ` +
                        `match for ${key}.`
                    );

                    continue;

                }

                if (
                    sourceMatches.length > 1
                ) {

                    addIssue(
                        "AMBIGUOUS_ASSIMILATION_MATCH_REFERENCE",
                        "ASSIMILATION",
                        item.assimilationId,
                        "evidenceId+knowledgeId",
                        key,
                        `Assimilation ${item.assimilationId} maps to ` +
                        `${sourceMatches.length} matched evidence ` +
                        `records for ${key}.`
                    );

                    continue;

                }

                const sourceMatch =
                    sourceMatches[0];

                if (
                    !this.assimilationMatchesMatch(
                        item,
                        sourceMatch
                    )
                ) {

                    addIssue(
                        "ASSIMILATION_MATCH_PROVENANCE_MISMATCH",
                        "ASSIMILATION",
                        item.assimilationId,
                        "matchId",
                        sourceMatch.matchId,
                        `Assimilation ${item.assimilationId} does not ` +
                        `preserve the provenance of matched evidence ` +
                        `${sourceMatch.matchId}.`
                    );

                }

            }


            /*
             * ----------------------------------------------------
             * Assimilation -> Reconciliation.
             *
             * This is deliberately aggregate provenance.
             * Multiple evidence items may contribute to one
             * knowledgeId.
             * ----------------------------------------------------
             */

            const assimilationsByKnowledge =
                this.indexByKnowledge(
                    assimilation.assimilations ?? []
                );

            for (
                const item
                of assimilation.assimilations ?? []
            ) {

                const candidates =
                    reconciliationsByKnowledge.get(
                        item.knowledgeId
                    ) ?? [];

                if (
                    candidates.length === 0
                ) {

                    addIssue(
                        "BROKEN_RECONCILIATION_ASSIMILATION_REFERENCE",
                        "ASSIMILATION",
                        item.assimilationId,
                        "knowledgeId",
                        item.knowledgeId,
                        `Assimilation ${item.assimilationId} targets ` +
                        `knowledge ${item.knowledgeId}, but no ` +
                        `reconciled knowledge evolution exists.`
                    );

                } else if (
                    candidates.length > 1
                ) {

                    addIssue(
                        "AMBIGUOUS_RECONCILIATION_KNOWLEDGE_REFERENCE",
                        "ASSIMILATION",
                        item.assimilationId,
                        "knowledgeId",
                        item.knowledgeId,
                        `Knowledge ${item.knowledgeId} resolves to ` +
                        `${candidates.length} reconciled evolutions.`
                    );

                }

            }


            for (
                const evolution
                of reconciliation.evolutions ?? []
            ) {

                const knowledgeAssimilations =
                    assimilationsByKnowledge.get(
                        evolution.knowledgeId
                    ) ?? [];

                if (
                    !this.reconciliationMatchesAssimilations(
                        evolution,
                        knowledgeAssimilations
                    )
                ) {

                    addIssue(
                        "RECONCILIATION_EVIDENCE_PRESSURE_MISMATCH",
                        "RECONCILIATION",
                        evolution.evolutionId,
                        "knowledgeId",
                        evolution.knowledgeId,
                        `Reconciled knowledge ${evolution.knowledgeId} ` +
                        `does not represent the exact aggregate ` +
                        `assimilation pressure for this knowledge item.`
                    );

                }

            }


            /*
             * ----------------------------------------------------
             * Reconciliation -> Belief Revision.
             * ----------------------------------------------------
             */

            for (
                const evolution
                of reconciliation.evolutions ?? []
            ) {

                const candidates =
                    revisionsByKnowledge.get(
                        evolution.knowledgeId
                    ) ?? [];

                if (
                    candidates.length === 0
                ) {

                    addIssue(
                        "BROKEN_REVISION_RECONCILIATION_REFERENCE",
                        "RECONCILIATION",
                        evolution.evolutionId,
                        "knowledgeId",
                        evolution.knowledgeId,
                        `No belief revision exists for reconciled ` +
                        `knowledge ${evolution.knowledgeId}.`
                    );

                    continue;

                }

                if (
                    candidates.length > 1
                ) {

                    addIssue(
                        "AMBIGUOUS_REVISION_RECONCILIATION_REFERENCE",
                        "RECONCILIATION",
                        evolution.evolutionId,
                        "knowledgeId",
                        evolution.knowledgeId,
                        `Reconciled knowledge ${evolution.knowledgeId} ` +
                        `maps to ${candidates.length} belief revisions.`
                    );

                    continue;

                }

                if (
                    !this.revisionMatchesReconciliation(
                        candidates[0],
                        evolution
                    )
                ) {

                    addIssue(
                        "REVISION_RECONCILIATION_MISMATCH",
                        "REVISION",
                        candidates[0].knowledgeId,
                        "evolutionId",
                        evolution.evolutionId,
                        `Belief revision for ${evolution.knowledgeId} ` +
                        `does not preserve reconciled epistemic pressure.`
                    );

                }

            }


            for (
                const revision
                of beliefRevision.revisions ?? []
            ) {

                const candidates =
                    reconciliationsByKnowledge.get(
                        revision.knowledgeId
                    ) ?? [];

                if (
                    candidates.length === 0
                ) {

                    addIssue(
                        "BROKEN_REVISION_RECONCILIATION_REFERENCE",
                        "REVISION",
                        revision.knowledgeId,
                        "knowledgeId",
                        revision.knowledgeId,
                        `Belief revision references knowledge ` +
                        `${revision.knowledgeId}, but no reconciled ` +
                        `knowledge evolution exists.`
                    );

                }

            }


            /*
             * ----------------------------------------------------
             * Revision -> Authorization.
             * ----------------------------------------------------
             */

            for (
                const revision
                of beliefRevision.revisions ?? []
            ) {

                const candidates =
                    authorizationsByKnowledge.get(
                        revision.knowledgeId
                    ) ?? [];

                if (
                    candidates.length === 0
                ) {

                    addIssue(
                        "BROKEN_AUTHORIZATION_REVISION_REFERENCE",
                        "REVISION",
                        revision.knowledgeId,
                        "knowledgeId",
                        revision.knowledgeId,
                        `No belief-transition authorization exists ` +
                        `for revision ${revision.knowledgeId}.`
                    );

                    continue;

                }

                if (
                    candidates.length > 1
                ) {

                    addIssue(
                        "AMBIGUOUS_AUTHORIZATION_REVISION_REFERENCE",
                        "REVISION",
                        revision.knowledgeId,
                        "knowledgeId",
                        revision.knowledgeId,
                        `Revision ${revision.knowledgeId} maps to ` +
                        `${candidates.length} authorizations.`
                    );

                    continue;

                }

                if (
                    !this.authorizationMatchesRevision(
                        candidates[0],
                        revision
                    )
                ) {

                    addIssue(
                        "AUTHORIZATION_REVISION_MISMATCH",
                        "AUTHORIZATION",
                        candidates[0].knowledgeId,
                        "knowledgeId",
                        revision.knowledgeId,
                        `Authorization for ${revision.knowledgeId} ` +
                        `does not preserve its belief-revision lineage.`
                    );

                }

            }


            /*
             * ----------------------------------------------------
             * Authorization -> State Transition.
             * ----------------------------------------------------
             */

            for (
                const auth
                of authorization.authorizations ?? []
            ) {

                const candidates =
                    transitionsByKnowledge.get(
                        auth.knowledgeId
                    ) ?? [];

                if (
                    candidates.length === 0
                ) {

                    addIssue(
                        "BROKEN_TRANSITION_AUTHORIZATION_REFERENCE",
                        "AUTHORIZATION",
                        auth.knowledgeId,
                        "knowledgeId",
                        auth.knowledgeId,
                        `No belief-state transition exists for ` +
                        `authorization ${auth.knowledgeId}.`
                    );

                    continue;

                }

                if (
                    candidates.length > 1
                ) {

                    addIssue(
                        "AMBIGUOUS_TRANSITION_AUTHORIZATION_REFERENCE",
                        "AUTHORIZATION",
                        auth.knowledgeId,
                        "knowledgeId",
                        auth.knowledgeId,
                        `Authorization ${auth.knowledgeId} maps to ` +
                        `${candidates.length} belief-state transitions.`
                    );

                    continue;

                }

                if (
                    !this.transitionMatchesAuthorization(
                        candidates[0],
                        auth
                    )
                ) {

                    addIssue(
                        "TRANSITION_AUTHORIZATION_MISMATCH",
                        "TRANSITION",
                        candidates[0].knowledgeId,
                        "knowledgeId",
                        auth.knowledgeId,
                        `Belief-state transition ${auth.knowledgeId} ` +
                        `does not preserve authorization semantics.`
                    );

                }

            }


            const brokenReferences =
                issues.filter(
                    issue =>
                        issue.status.startsWith(
                            "BROKEN_"
                        ) ||
                        issue.status.startsWith(
                            "AMBIGUOUS_"
                        )
                ).length;

            /*
             * ----------------------------------------------------
             * Reverse orphan integrity.
             * ----------------------------------------------------
             */

            for (
                const auth
                of authorization.authorizations ?? []
            ) {

                const candidates =
                    revisionsByKnowledge.get(
                        auth.knowledgeId
                    ) ?? [];

                if (
                    candidates.length === 0
                ) {

                    addIssue(
                        "BROKEN_AUTHORIZATION_REVISION_REFERENCE",
                        "AUTHORIZATION",
                        auth.knowledgeId,
                        "knowledgeId",
                        auth.knowledgeId,
                        `Authorization ${auth.knowledgeId} has no corresponding belief revision.`
                    );

                } else if (
                    candidates.length > 1
                ) {

                    addIssue(
                        "AMBIGUOUS_AUTHORIZATION_REVISION_REFERENCE",
                        "AUTHORIZATION",
                        auth.knowledgeId,
                        "knowledgeId",
                        auth.knowledgeId,
                        `Authorization ${auth.knowledgeId} maps back to ${candidates.length} belief revisions.`
                    );

                }

            }


            for (
                const transition
                of stateTransition.transitions ?? []
            ) {

                const candidates =
                    authorizationsByKnowledge.get(
                        transition.knowledgeId
                    ) ?? [];

                if (
                    candidates.length === 0
                ) {

                    addIssue(
                        "BROKEN_TRANSITION_AUTHORIZATION_REFERENCE",
                        "TRANSITION",
                        transition.knowledgeId,
                        "knowledgeId",
                        transition.knowledgeId,
                        `State transition ${transition.knowledgeId} has no corresponding authorization.`
                    );

                } else if (
                    candidates.length > 1
                ) {

                    addIssue(
                        "AMBIGUOUS_TRANSITION_AUTHORIZATION_REFERENCE",
                        "TRANSITION",
                        transition.knowledgeId,
                        "knowledgeId",
                        transition.knowledgeId,
                        `State transition ${transition.knowledgeId} maps back to ${candidates.length} authorizations.`
                    );

                }

            }


            const provenanceMismatches =
                issues.filter(
                    issue =>
                        issue.status ===
                            "FEEDBACK_EVIDENCE_PROVENANCE_MISMATCH" ||
                        issue.status ===
                            "MATCH_FEEDBACK_PROVENANCE_MISMATCH" ||
                        issue.status ===
                            "ASSIMILATION_MATCH_PROVENANCE_MISMATCH"
                ).length;

            const epistemicMismatches =
                issues.filter(
                    issue =>
                        issue.status ===
                            "RECONCILIATION_EVIDENCE_PRESSURE_MISMATCH" ||
                        issue.status ===
                            "REVISION_RECONCILIATION_MISMATCH" ||
                        issue.status ===
                            "AUTHORIZATION_REVISION_MISMATCH" ||
                        issue.status ===
                            "TRANSITION_AUTHORIZATION_MISMATCH"
                ).length;

            const campaignMismatches =
                issues.filter(
                    issue =>
                        issue.status ===
                        "CAMPAIGN_MISMATCH"
                ).length;

            const totalEntities =
                (executionEvidence.evidence ?? []).length +
                (feedback.feedback ?? []).length +
                (matches.matches ?? []).length +
                (assimilation.assimilations ?? []).length +
                (reconciliation.evolutions ?? []).length +
                (beliefRevision.revisions ?? []).length +
                (authorization.authorizations ?? []).length +
                (stateTransition.transitions ?? []).length;

            const integrityScore =
                totalEntities === 0
                    ? 1
                    : Math.max(
                        0,
                        1 -
                        (
                            issues.length /
                            totalEntities
                        )
                    );


            return {

                generatedAt:
                    new Date().toISOString(),

                campaignId,

                valid:
                    issues.length === 0,

                issues,

                statistics: {

                    executionEvidence:
                        (executionEvidence.evidence ?? []).length,

                    feedback:
                        (feedback.feedback ?? []).length,

                    matches:
                        (matches.matches ?? []).length,

                    assimilations:
                        (assimilation.assimilations ?? []).length,

                    reconciledKnowledge:
                        (reconciliation.evolutions ?? []).length,

                    revisions:
                        (beliefRevision.revisions ?? []).length,

                    authorizations:
                        (authorization.authorizations ?? []).length,

                    transitions:
                        (stateTransition.transitions ?? []).length,

                    brokenReferences,

                    provenanceMismatches,

                    epistemicMismatches,

                    campaignMismatches,

                    integrityScore
                },

                errors: []

            };

        } catch (error) {

            return {

                generatedAt:
                    new Date().toISOString(),

                campaignId,

                valid: false,

                issues: [],

                statistics: {

                    executionEvidence: 0,
                    feedback: 0,
                    matches: 0,
                    assimilations: 0,
                    reconciledKnowledge: 0,
                    revisions: 0,
                    authorizations: 0,
                    transitions: 0,

                    brokenReferences: 0,

                    provenanceMismatches: 0,

                    epistemicMismatches: 0,

                    campaignMismatches: 0,

                    integrityScore: 0
                },

                errors: [
                    error instanceof Error
                        ? error.message
                        : String(error)
                ]

            };

        }

    }


    private feedbackMatchesEvidence(
        feedback:
            ScientificEvidenceFeedback,
        evidence:
            ScientificExecutionEvidence
    ): boolean {

        return (
            feedback.evidenceId === evidence.evidenceId &&
            feedback.observationId === evidence.observationId &&
            feedback.outcomeId === evidence.outcomeId &&
            feedback.experimentId === evidence.experimentId &&
            feedback.targetType === evidence.targetType &&
            feedback.targetId === evidence.targetId &&
            feedback.sourceConclusionId === evidence.sourceConclusionId &&
            this.sameArray(
                feedback.sourceIds,
                evidence.sourceIds
            ) &&
            this.sameArray(
                feedback.targetEvidenceIds,
                evidence.targetEvidenceIds
            ) &&
            feedback.executionPlanId === evidence.executionPlanId &&
            feedback.executionTaskId === evidence.executionTaskId &&
            feedback.stepId === evidence.stepId &&
            feedback.stepType === evidence.stepType &&
            feedback.repository === evidence.repository &&
            feedback.action ===
                this.feedbackActionForEvidence(
                    evidence
                ) &&
            feedback.statement === evidence.statement &&
            this.sameArray(
                feedback.sourceEvidence,
                evidence.sourceEvidence
            ) &&
            this.sameArray(
                feedback.sourceObservations,
                evidence.sourceObservations
            )
        );

    }


    private matchPreservesFeedback(
        match:
            ScientificKnowledgeEvidenceMatch,
        feedback:
            ScientificEvidenceFeedback
    ): boolean {

        return (
            match.feedbackId === feedback.feedbackId &&
            match.evidenceId === feedback.evidenceId &&
            match.experimentId === feedback.experimentId &&
            match.sourceConclusionId === feedback.sourceConclusionId &&
            this.sameArray(
                match.sourceIds,
                feedback.sourceIds
            ) &&
            this.sameArray(
                match.targetEvidenceIds,
                feedback.targetEvidenceIds
            ) &&
            match.executionPlanId === feedback.executionPlanId &&
            match.executionTaskId === feedback.executionTaskId &&
            match.stepId === feedback.stepId &&
            match.repository === feedback.repository &&
            match.feedbackAction === feedback.action &&
            match.statement === feedback.statement
        );

    }


    private assimilationMatchesMatch(
        assimilation:
            ScientificEvidenceAssimilation,
        match:
            ScientificKnowledgeEvidenceMatch
    ): boolean {

        const expectedEvidenceIdentity =
            [
                match.experimentId,
                match.executionPlanId,
                match.executionTaskId,
                match.stepId,
                match.feedbackAction
            ].join(":");

        return (
            assimilation.knowledgeId ===
                match.knowledgeId &&
            assimilation.evidenceId ===
                match.evidenceId &&
            assimilation.evidenceIdentity ===
                expectedEvidenceIdentity &&
            assimilation.repository ===
                match.repository &&
            assimilation.action ===
                match.feedbackAction
        );

    }


    private reconciliationMatchesAssimilations(
        evolution:
            ScientificKnowledgeEvolution,
        assimilations:
            ScientificEvidenceAssimilation[]
    ): boolean {

        const strengthened =
            assimilations.filter(
                item =>
                    item.action ===
                    "STRENGTHEN"
            );

        const challenged =
            assimilations.filter(
                item =>
                    item.action ===
                    "CHALLENGE"
            );

        const held =
            assimilations.filter(
                item =>
                    item.action ===
                    "HOLD"
            );

        const newlyAssimilated =
            assimilations.filter(
                item =>
                    item.assimilated === true
            );

        const newlyStrengthened =
            strengthened.filter(
                item =>
                    item.assimilated === true
            );

        const newlyChallenged =
            challenged.filter(
                item =>
                    item.assimilated === true
            );

        const supportingEvidenceIds =
            this.unique(
                newlyStrengthened.map(
                    item =>
                        item.evidenceId
                )
            );

        const contradictoryEvidenceIds =
            this.unique(
                newlyChallenged.map(
                    item =>
                        item.evidenceId
                )
            );

        const repositoriesObserved =
            this.unique(
                assimilations
                    .map(
                        item =>
                            item.repository
                    )
                    .filter(
                        (
                            repository
                        ): repository is string =>
                            typeof repository ===
                                "string" &&
                            repository
                                .trim()
                                .length > 0
                    )
            );

        const pressure =
            evolution
                .scientificEvidencePressure;

        const replication =
            evolution
                .scientificReplicationPressure;

        const expectedTransition =
            this.evidenceTransitionFor(
                newlyStrengthened.length,
                newlyChallenged.length,
                held.length,
                newlyAssimilated.length
            );

        if (
            !pressure ||
            !replication
        ) {
            return false;
        }

        return (
            pressure.strengthened ===
                strengthened.length &&
            pressure.challenged ===
                challenged.length &&
            pressure.held ===
                held.length &&
            pressure.newlyAssimilated ===
                newlyAssimilated.length &&
            this.sameSet(
                pressure.supportingEvidenceIds,
                supportingEvidenceIds
            ) &&
            this.sameSet(
                pressure.contradictoryEvidenceIds,
                contradictoryEvidenceIds
            ) &&
            evolution.scientificEvidenceTransition ===
                expectedTransition &&

            replication.duplicates ===
                this.countReplication(
                    assimilations,
                    "DUPLICATE"
                ) &&

            replication.firstRepositoryObservations ===
                this.countReplication(
                    assimilations,
                    "FIRST_REPOSITORY_OBSERVATION"
                ) &&

            replication.sameRepositoryReplications ===
                this.countReplication(
                    assimilations,
                    "SAME_REPOSITORY_REPLICATION"
                ) &&

            replication.crossRepositoryEvidence ===
                this.countReplication(
                    assimilations,
                    "CROSS_REPOSITORY_EVIDENCE"
                ) &&

            replication.sourceProvenanceUnknown ===
                this.countReplication(
                    assimilations,
                    "SOURCE_PROVENANCE_UNKNOWN"
                ) &&

            replication.notApplicable ===
                this.countReplication(
                    assimilations,
                    "NOT_APPLICABLE"
                ) &&

            this.sameSet(
                replication.repositoriesObserved,
                repositoriesObserved
            )
        );

    }


    private revisionMatchesReconciliation(
        revision:
            ScientificBeliefRevision,
        evolution:
            ScientificKnowledgeEvolution
    ): boolean {

        const pressure =
            evolution
                .scientificEvidencePressure;

        const replication =
            evolution
                .scientificReplicationPressure;

        const expectedTransition =
            evolution
                .scientificEvidenceTransition ??
            "UNCHANGED";

        const repositoriesObserved =
            replication
                ?.repositoriesObserved ??
            [];

        const expectedDecision =
            this.revisionDecisionFor(
                expectedTransition
            );

        return (
            revision.knowledgeId ===
                evolution.knowledgeId &&
            revision.statement ===
                evolution.statement &&
            revision.evidenceTransition ===
                expectedTransition &&
            revision.decision ===
                expectedDecision &&
            revision.newlyAssimilatedEvidence ===
                (
                    pressure
                        ?.newlyAssimilated ??
                    0
                ) &&
            revision.supportingEvidenceAdded ===
                (
                    pressure
                        ?.strengthened ??
                    0
                ) &&
            revision.contradictoryEvidenceAdded ===
                (
                    pressure
                        ?.challenged ??
                    0
                ) &&
            this.sameSet(
                revision.repositoriesObserved,
                repositoriesObserved
            ) &&
            revision.duplicateEvidenceObserved ===
                (
                    (
                        replication
                            ?.duplicates ??
                        0
                    ) > 0
                ) &&
            revision.sameRepositoryReplicationObserved ===
                (
                    (
                        replication
                            ?.sameRepositoryReplications ??
                        0
                    ) > 0
                ) &&
            revision.crossRepositoryEvidenceObserved ===
                (
                    (
                        replication
                            ?.crossRepositoryEvidence ??
                        0
                    ) > 0
                ) &&
            revision.sourceProvenanceUnknown ===
                (
                    (
                        replication
                            ?.sourceProvenanceUnknown ??
                        0
                    ) > 0
                ) &&
            revision.repositoryDiversityObserved ===
                (
                    repositoriesObserved.length > 1 ||
                    (
                        (
                            replication
                                ?.crossRepositoryEvidence ??
                            0
                        ) > 0
                    )
                )
        );

    }


    private authorizationMatchesRevision(
        authorization:
            ScientificBeliefTransitionAuthorization,
        revision:
            ScientificBeliefRevision
    ): boolean {

        return (
            authorization.knowledgeId ===
                revision.knowledgeId &&
            authorization.statement ===
                revision.statement &&
            authorization.revisionDecision ===
                revision.decision &&
            authorization.scientificEvidenceAssimilated ===
                (
                    revision
                        .newlyAssimilatedEvidence >
                    0
                ) &&
            authorization.supportingEvidencePresent ===
                (
                    revision
                        .supportingEvidenceAdded >
                    0
                ) &&
            authorization.contradictoryEvidencePresent ===
                (
                    revision
                        .contradictoryEvidenceAdded >
                    0
                ) &&
            authorization.sameRepositoryReplicationObserved ===
                revision
                    .sameRepositoryReplicationObserved &&
            authorization.crossRepositoryEvidenceObserved ===
                revision
                    .crossRepositoryEvidenceObserved &&
            authorization.repositoryDiversityObserved ===
                revision
                    .repositoryDiversityObserved &&
            authorization.sourceIndependenceEstablished ===
                revision
                    .sourceIndependenceEstablished &&
            authorization.requiresFurtherExperiment ===
                revision
                    .requiresFurtherExperiment
        );

    }


    private transitionMatchesAuthorization(
        transition:
            ScientificBeliefStateTransition,
        authorization:
            ScientificBeliefTransitionAuthorization
    ): boolean {

        return (
            transition.knowledgeId ===
                authorization.knowledgeId &&
            transition.statement ===
                authorization.statement &&
            transition.authorizationDecision ===
                authorization.decision &&
            transition.authorizedDirection ===
                authorization.direction &&
            transition.evidenceQualified ===
                (
                    authorization.decision ===
                        "AUTHORIZED" &&
                    authorization
                        .scientificEvidenceAssimilated
                ) &&
            transition.confidenceMutationAuthorized ===
                authorization
                    .confidenceMutationAuthorized &&
            transition.statusMutationAuthorized ===
                authorization
                    .statusMutationAuthorized &&
            transition.sourceIndependenceEstablished ===
                authorization
                    .sourceIndependenceEstablished &&
            transition.requiresFurtherExperiment ===
                authorization
                    .requiresFurtherExperiment
        );

    }


    private feedbackActionForEvidence(
        evidence:
            ScientificExecutionEvidence
    ):
        | "STRENGTHEN"
        | "CHALLENGE"
        | "HOLD" {

        switch (evidence.status) {

            case "SUPPORTING":
                return "STRENGTHEN";

            case "CHALLENGING":
                return "CHALLENGE";

            case "INCONCLUSIVE":
                return "HOLD";

        }

    }


    private evidenceTransitionFor(
        newlyStrengthened: number,
        newlyChallenged: number,
        held: number,
        newlyAssimilated: number
    ):
        | "STRENGTHENED"
        | "CHALLENGED"
        | "CONFLICTED"
        | "HELD"
        | "UNCHANGED" {

        if (
            newlyStrengthened > 0 &&
            newlyChallenged > 0
        ) {
            return "CONFLICTED";
        }

        if (
            newlyChallenged > 0
        ) {
            return "CHALLENGED";
        }

        if (
            newlyStrengthened > 0
        ) {
            return "STRENGTHENED";
        }

        if (
            newlyAssimilated === 0 &&
            held > 0
        ) {
            return "HELD";
        }

        return "UNCHANGED";

    }


    private revisionDecisionFor(
        transition:
            | "STRENGTHENED"
            | "CHALLENGED"
            | "CONFLICTED"
            | "HELD"
            | "UNCHANGED"
    ):
        | "PRESERVE"
        | "REVIEW_SUPPORT"
        | "REVIEW_CHALLENGE"
        | "REVIEW_CONFLICT"
        | "DEFER" {

        switch (transition) {

            case "STRENGTHENED":
                return "REVIEW_SUPPORT";

            case "CHALLENGED":
                return "REVIEW_CHALLENGE";

            case "CONFLICTED":
                return "REVIEW_CONFLICT";

            case "HELD":
                return "DEFER";

            case "UNCHANGED":
                return "PRESERVE";

        }

    }


    private countReplication(
        assimilations:
            ScientificEvidenceAssimilation[],
        classification:
            ScientificEvidenceAssimilation[
                "replicationClassification"
            ]
    ): number {

        return assimilations.filter(
            item =>
                item.replicationClassification ===
                classification
        ).length;

    }


    private evidenceKnowledgeKey(
        evidenceId: string,
        knowledgeId: string
    ): string {

        return (
            `${evidenceId}::${knowledgeId}`
        );

    }


    private indexByKnowledge<
        T extends {
            knowledgeId: string;
        }
    >(
        items: T[]
    ): Map<string, T[]> {

        const index =
            new Map<
                string,
                T[]
            >();

        for (
            const item
            of items
        ) {

            const current =
                index.get(
                    item.knowledgeId
                ) ?? [];

            current.push(
                item
            );

            index.set(
                item.knowledgeId,
                current
            );

        }

        return index;

    }


    private sameArray(
        left:
            readonly string[] | undefined,
        right:
            readonly string[] | undefined
    ): boolean {

        return (
            JSON.stringify(
                left ?? []
            ) ===
            JSON.stringify(
                right ?? []
            )
        );

    }


    private sameSet(
        left:
            readonly string[] | undefined,
        right:
            readonly string[] | undefined
    ): boolean {

        const normalize = (
            values:
                readonly string[] | undefined
        ): string[] =>
            Array.from(
                new Set(
                    values ?? []
                )
            ).sort();

        return (
            JSON.stringify(
                normalize(left)
            ) ===
            JSON.stringify(
                normalize(right)
            )
        );

    }


    private unique(
        values: string[]
    ): string[] {

        return Array.from(
            new Set(
                values
            )
        );

    }

}
