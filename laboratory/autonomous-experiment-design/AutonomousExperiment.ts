import type {
    GitHubExecutableTarget
} from "../github-adapter/GitHubExecutableTargetExtractor.js";

export interface AutonomousExperiment {

    experimentId: string;

    title: string;

    objective: string;

    targetType:
        | "THEORY_VALIDATION"
        | "CONTRADICTION_RESOLUTION"
        | "KNOWLEDGE_GAP"
        | "CONFIDENCE_IMPROVEMENT";

    targetId: string;

    sourcePatternRelation?:
        string;

    relationUnderTest?: {

        relation:
            string;

        subject:
            string;

        predicate:
            string;

        object:
            string;

    };

    sourceConclusionId?:
        string;

    /**
     * Scientific research sources from which the evidence
     * motivating this experiment originated.
     *
     * Source identity is preserved independently from
     * repository identity. Multiple sourceIds may refer to
     * the same repository, so repository identity must never
     * be used to reconstruct or infer source independence.
     */
    sourceIds:
        string[];

    targetEvidenceIds:
        string[];

    hypothesis:
        string;

    supportCondition:
        string | null;

    challengeCondition:
        string | null;

    scientificCriteria?: {

        relation:
            string;

        support: {
            expectedPolarity:
                "SUPPORT";

            condition:
                string;
        };

        challenge: {
            expectedPolarity:
                "CHALLENGE";

            condition:
                string;
        };

        inconclusive: {
            whenNoScientificPolarity:
                true;
        };

    };

    priority:
        | "HIGH"
        | "MEDIUM"
        | "LOW";

    requiredEvidence:
        string[];

    recommendedRepositories:
        string[];

    recommendedExecutableTargets?: {

        repository:
            string;

        target:
            GitHubExecutableTarget;

        relationRelevance?: {

            score:
                number;

            matchedComponents: (
                | "SUBJECT"
                | "PREDICATE"
                | "OBJECT"
            )[];

        };

    }[];

    variables: {

        independent:
            string[];

        dependent:
            string[];

        controlled:
            string[];

    };

    procedure:
        string[];

    successCriteria:
        string[];

    failureCriteria:
        string[];

    expectedOutcome:
        string;

    estimatedKnowledgeGain:
        number;

    evidenceNovelty?: {

        score:
            number;

        existingRepositories:
            string[];

        candidateRepositories:
            string[];

        knownExecutableTargetTypes: (
            | "TEST"
            | "INVARIANT"
        )[];

        rationale:
            string[];

    };

}