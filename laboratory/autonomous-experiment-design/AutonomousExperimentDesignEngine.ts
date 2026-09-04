import type {
    ScientificValidationResult
} from "../scientific-validation/ScientificValidationResult.js";
import type {
    EvidenceGraphResult
} from "../evidence-graph/EvidenceGraphResult.js";

import type {
    GitHubRepositoryIntelligenceResult
} from "../github-adapter/GitHubRepositoryIntelligence.js";

import type {
    KnowledgeGapResult
} from "../knowledge-gap/KnowledgeGapResult.js";

import type {
    ContradictionResult
} from "../contradiction-engine/ContradictionResult.js";

import type {
    ConfidenceAssessmentResult
} from "../confidence-engine/ConfidenceAssessmentResult.js";

import type {
    AutonomousExperiment
} from "./AutonomousExperiment.js";

import type {
    AutonomousExperimentResult
} from "./AutonomousExperimentResult.js";

export class AutonomousExperimentDesignEngine {

    build(
    validations: ScientificValidationResult,
    gaps: KnowledgeGapResult,
    contradictions: ContradictionResult,
    confidence: ConfidenceAssessmentResult,
    evidenceGraph: EvidenceGraphResult,
sourceRepositories: Record<string, string>,
repositoryExecutionIntelligence: Record<
    string,
    GitHubRepositoryIntelligenceResult
>
): AutonomousExperimentResult {

        try {

            const experiments: AutonomousExperiment[] = [];

            let counter = 1;

            for (const validation of validations.validations ?? []) {

                if (validation.status === "VALIDATED") {
                    continue;
                }
const targetEvidenceIds =
    [
        ...(
            validation.supportingEvidenceIds ??
            []
        ),
        ...(
            validation.contradictoryEvidenceIds ??
            []
        )
    ];

const existingSourceIds =
    this.sourceIdsForEvidence(
        targetEvidenceIds,
        evidenceGraph
    );
    const existingRepositories =
    existingSourceIds
        .map(
            sourceId =>
                sourceRepositories[
                    sourceId
                ]
        )
        .filter(
            (
                repository
            ): repository is string =>
                typeof repository === "string" &&
                repository.length > 0
        );

const recommendedRepositories =
    this.repositoriesFor(
        validation.theoryTitle,
        existingRepositories,
        repositoryExecutionIntelligence
    );

const recommendedExecutableTargets =
    this.executableTargetsForRepositories(
        recommendedRepositories,
        repositoryExecutionIntelligence,
        this.relationUnderTest(
            validation.sourcePatternRelation
        )
    );

const evidenceNovelty =
    this.validationEvidenceNovelty(
        existingRepositories,
        recommendedRepositories,
        repositoryExecutionIntelligence
    );

experiments.push({

                    experimentId:
                        `AUTO-EXPERIMENT-${String(counter++)
                            .padStart(5, "0")}`,

                    title:
                        `Validate ${validation.theoryTitle}`,

                    objective:
                        validation.status === "CHALLENGED"
                            ? `Resolve contradictory evidence affecting "${validation.theoryTitle}".`
                            : `Collect sufficient independent evidence to determine whether "${validation.theoryTitle}" should be validated or rejected.`,

                    targetType:
                        validation.status === "CHALLENGED"
                            ? "CONTRADICTION_RESOLUTION"
                            : "THEORY_VALIDATION",

                    targetId:
    validation.theoryId,

    sourcePatternRelation:
    validation.sourcePatternRelation,

relationUnderTest:
    this.relationUnderTest(
        validation.sourcePatternRelation
    ),

sourceIds:
    [...existingSourceIds],

targetEvidenceIds:
    targetEvidenceIds,

hypothesis:
    `"${validation.theoryTitle}" predicts that independent executable evidence ` +
    `will reproduce the scientific relation "${validation.sourcePatternRelation}".`,

supportCondition:
    `${validation.theoryTitle} is supported when an executable assertion ` +
    `demonstrates behavior consistent with the scientific relation ` +
    `"${validation.sourcePatternRelation}".`,

challengeCondition:
    `${validation.theoryTitle} is challenged when an executable assertion ` +
    `reproduces a counterexample incompatible with the scientific relation ` +
    `"${validation.sourcePatternRelation}".`,

    scientificCriteria: {
    relation:
        validation.sourcePatternRelation,

    support: {
        expectedPolarity:
            "SUPPORT",

        condition:
            `${validation.theoryTitle} is supported when an executable assertion ` +
            `demonstrates behavior consistent with the scientific relation ` +
            `"${validation.sourcePatternRelation}".`
    },

    challenge: {
        expectedPolarity:
            "CHALLENGE",

        condition:
            `${validation.theoryTitle} is challenged when an executable assertion ` +
            `reproduces a counterexample incompatible with the scientific relation ` +
            `"${validation.sourcePatternRelation}".`
    },

    inconclusive: {
        whenNoScientificPolarity:
            true
    }
},
                    priority:
                        validation.status === "REJECTED" ||
                        validation.status === "CHALLENGED"
                            ? "HIGH"
                            : "MEDIUM",

                    requiredEvidence: [

                        "At least one independent implementation source.",

                        "Executable tests or invariant checks.",

                        `Direct executable evidence supporting or challenging the relation "${validation.sourcePatternRelation}".`,

                        "Evidence from a repository not currently responsible for the theory."

                    ],

                   recommendedRepositories:
    recommendedRepositories,

recommendedExecutableTargets:
    recommendedExecutableTargets,

evidenceNovelty:
    evidenceNovelty,
                    variables: {

                        independent: [
                            "Repository implementation",
                            "Protocol architecture",
                            "Testing methodology"
                        ],

                        dependent: [
                            "Theory validation score",
                            "Number of supporting relations",
                            "Number of contradictory relations",
                            "Independent source count"
                        ],

                        controlled: [
                            "OECL normalization rules",
                            "Evidence weighting rules",
                            "Confidence thresholds",
                            "Relation vocabulary"
                        ]

                    },

                    procedure: [

                        "Select one repository not currently included in the supporting evidence.",

                        "Ingest and normalize the selected repository.",

                        "Extract protocols, capabilities, claims, tests, and invariants.",

                        "Regenerate the cross-source evidence graph.",

                        `Search for executable assertions that support or challenge the relation "${validation.sourcePatternRelation}".`,

                        "Recalculate confidence, contradictions, and scientific validation.",

                        "Compare the new validation result with the previous result."

                    ],

                    successCriteria: [

                        "Independent source count increases.",

                        "At least one new directly relevant evidence edge is discovered.",

                        "Validation score changes by at least 5 points.",

                        "The experiment produces a reproducible result."

                    ],

                    failureCriteria: [

                        "No relevant evidence is discovered.",

                        "The selected repository duplicates existing evidence without increasing diversity.",

                        "The validation score remains unchanged.",

                        "The evidence cannot be reproduced or traced to its source."

                    ],

                    expectedOutcome:
                        validation.status === "CHALLENGED"
                            ? "The experiment should determine which competing relationship has stronger independent evidence."
                            : "The experiment should move the theory toward VALIDATED, CHALLENGED, or REJECTED instead of leaving it INCONCLUSIVE.",

                    estimatedKnowledgeGain:
    this.validationKnowledgeGain(
        validation
    )

                });

            }

            for (const contradiction of contradictions.contradictions ?? []) {

                experiments.push({

                    experimentId:
                        `AUTO-EXPERIMENT-${String(counter++)
                            .padStart(5, "0")}`,

                    title:
                        `Resolve ${contradiction.subject} contradiction`,

                    objective:
                        `Determine whether ${contradiction.subject} relates to ${contradiction.object} through ${contradiction.relationA}, ${contradiction.relationB}, or context-dependent behavior.`,

                    targetType:
                        "CONTRADICTION_RESOLUTION",

                    targetId:
    contradiction.contradictionId,

sourceIds:
    [],

targetEvidenceIds:
    [],

hypothesis:
    `The apparent contradiction between ${contradiction.relationA} and ${contradiction.relationB} can be explained by implementation context, protocol scope, or evidence quality.`,
    supportCondition:
    "The contradiction is reduced when executable evidence " +
    "reproduces behavior consistent with one interpretation " +
    "and resolves the conflicting evidence deterministically.",

challengeCondition:
    "The contradiction is reinforced when executable evidence " +
    "reproduces behavior incompatible with the currently supported " +
    "interpretation or independently reproduces the conflicting result.",
                    priority:
                        contradiction.severity === "HIGH"
                            ? "HIGH"
                            : "MEDIUM",

                    requiredEvidence: [

                        "At least two independent implementations.",

                        "Direct code-level evidence for each competing relation.",

                        "Tests exercising both behaviors.",

                        "Context describing when each relation applies."

                    ],

                    recommendedRepositories:
                        this.repositoriesFor(
                            `${contradiction.subject} ${contradiction.object}`
                        ),

                    variables: {

                        independent: [
                            "Implementation design",
                            "Protocol configuration",
                            "Execution context"
                        ],

                        dependent: [
                            "Observed relationship",
                            "Invariant preservation",
                            "Contradiction severity"
                        ],

                        controlled: [
                            "Input state",
                            "Test scenario",
                            "Evidence scoring rules"
                        ]

                    },

                    procedure: [

                        "Identify the evidence supporting each competing relation.",

                        "Select implementations representing both sides.",

                        "Construct equivalent test scenarios.",

                        "Execute or inspect behavior under controlled conditions.",

                        "Compare accounting, safety, and settlement outcomes.",

                        "Classify the contradiction as genuine, contextual, or extraction noise."

                    ],

                    successCriteria: [

                        "The contradiction is classified as genuine or contextual.",

                        "At least one relation receives stronger direct evidence.",

                        "The explanation is reproducible from source evidence."

                    ],

                    failureCriteria: [

                        "Neither relation can be reproduced.",

                        "Available evidence is purely textual and non-executable.",

                        "The conflict remains unresolved after independent analysis."

                    ],

                    expectedOutcome:
                        "The experiment should either resolve the contradiction or define the exact conditions under which both relations can coexist.",

                    estimatedKnowledgeGain:
                        contradiction.severity === "HIGH"
                            ? 95
                            : 75

                });

            }

            for (const gap of gaps.gaps ?? []) {

                if (gap.priority === "LOW") {
                    continue;
                }

                experiments.push({

                    experimentId:
                        `AUTO-EXPERIMENT-${String(counter++)
                            .padStart(5, "0")}`,

                    title:
                        `Investigate knowledge gap ${gap.gapId}`,

                    objective:
                        gap.statement,

                    targetType:
                        "KNOWLEDGE_GAP",

                    targetId:
    gap.gapId,

sourceConclusionId:
    gap.sourceConclusionId,

sourceIds:
    this.sourceIdsForEvidence(
        [...(gap.relatedEdges ?? [])],
        evidenceGraph
    ),

targetEvidenceIds:
    [...(gap.relatedEdges ?? [])],

hypothesis:
    `Additional independent evidence can reduce uncertainty associated with: ${gap.statement}`,

    supportCondition:
    "The knowledge gap is reduced when new independent executable " +
    "evidence provides reproducible information directly relevant " +
    "to the unresolved scientific statement.",

challengeCondition:
    "The knowledge gap remains or increases when new executable " +
    "evidence contradicts the unresolved statement or exposes " +
    "additional uncertainty that prevents deterministic resolution.",
                    priority:
                        gap.priority,

                    requiredEvidence:
                        this.requiredEvidenceForGap(
                            gap.gapType
                        ),

                    recommendedRepositories:
                        this.repositoriesFor(
                            gap.statement
                        ),

                    variables: {

                        independent: [
                            "Selected evidence source",
                            "Implementation architecture"
                        ],

                        dependent: [
                            "Gap confidence",
                            "Evidence diversity",
                            "Direct relation count"
                        ],

                        controlled: [
                            "Normalization",
                            "Evidence quality thresholds",
                            "Source independence rules"
                        ]

                    },

                    procedure: [

                        "Select a repository relevant to the gap.",

                        "Ingest the repository through the OECL GitHub ingestor.",

                        "Extract direct and indirect evidence related to the gap.",

                        "Rebuild conclusions and confidence assessments.",

                        "Check whether the gap remains, weakens, or is resolved."

                    ],

                    successCriteria: [

                        "Evidence diversity increases.",

                        "The associated confidence score increases or decreases meaningfully.",

                        "The gap receives a clear resolved or unresolved classification."

                    ],

                    failureCriteria: [

                        "No relevant evidence is found.",

                        "Only duplicate evidence is discovered.",

                        "The gap remains unchanged."

                    ],

                    expectedOutcome:
                        gap.recommendation,

                    estimatedKnowledgeGain:
                        gap.priority === "HIGH"
                            ? 80
                            : 55

                });

            }

            for (const assessment of confidence.assessments ?? []) {

                if (assessment.maturity !== "PRELIMINARY") {
                    continue;
                }

                const alreadyTargeted =
                    experiments.some(
                        experiment =>
                            experiment.objective.includes(
                                assessment.statement
                            )
                    );

                if (alreadyTargeted) {
                    continue;
                }

                experiments.push({

                    experimentId:
                        `AUTO-EXPERIMENT-${String(counter++)
                            .padStart(5, "0")}`,

                    title:
                        `Increase confidence in ${assessment.assessmentId}`,

                    objective:
                        `Increase or challenge confidence in "${assessment.statement}".`,

                    targetType:
                        "CONFIDENCE_IMPROVEMENT",

                    targetId:
    assessment.assessmentId,

sourceConclusionId:
    assessment.sourceConclusionId,

sourceIds:
    [],

targetEvidenceIds:
    [],

hypothesis:
    `Independent implementation evidence will clarify whether "${assessment.statement}" should move beyond PRELIMINARY maturity.`,

    supportCondition:
    "Confidence improves when additional independent executable " +
    "evidence reproducibly supports the scientific statement " +
    "without introducing contradictory evidence.",

challengeCondition:
    "Confidence is challenged when additional independent executable " +
    "evidence reproducibly contradicts the scientific statement " +
    "or weakens the basis for increasing maturity.",
                    priority:
                        assessment.calculatedConfidence < 60
                            ? "HIGH"
                            : "MEDIUM",

                    requiredEvidence: [

                        "One additional independent source.",

                        "Implementation or executable test evidence.",

                        "Evidence directly connected to the assessed statement."

                    ],

                    recommendedRepositories:
                        this.repositoriesFor(
                            assessment.statement
                        ),

                    variables: {

                        independent: [
                            "New source",
                            "Evidence type"
                        ],

                        dependent: [
                            "Calculated confidence",
                            "Maturity status",
                            "Independent source count"
                        ],

                        controlled: [
                            "Confidence formula",
                            "Quality classification",
                            "Normalization rules"
                        ]

                    },

                    procedure: [

                        "Select a source that is independent from current supporting sources.",

                        "Extract evidence related to the target statement.",

                        "Run Confidence Engine again.",

                        "Compare confidence and maturity before and after ingestion."

                    ],

                    successCriteria: [

                        "Confidence changes by at least 5 points.",

                        "Independent source count increases.",

                        "Maturity changes or receives stronger justification."

                    ],

                    failureCriteria: [

                        "Evidence is duplicated.",

                        "Confidence and source count remain unchanged.",

                        "Evidence is too weak to affect maturity."

                    ],

                    expectedOutcome:
                        "The statement should receive a better-supported maturity classification.",

                    estimatedKnowledgeGain:
                        assessment.calculatedConfidence < 60
                            ? 75
                            : 50

                });

            }

            const deduplicated =
                this.deduplicate(
                    experiments
                );

            const prioritized =
    deduplicated
        .sort(
            (a, b) =>
                this.priorityWeight(b.priority) -
                this.priorityWeight(a.priority) ||
                b.estimatedKnowledgeGain -
                a.estimatedKnowledgeGain ||
                (
                    b.evidenceNovelty?.score ??
                    0
                ) -
                (
                    a.evidenceNovelty?.score ??
                    0
                )
        )
        .slice(0, 100);

            return {

                generatedAt:
                    new Date().toISOString(),

                experiments:
                    prioritized,

                statistics: {

                    experiments:
                        prioritized.length,

                    highPriority:
                        prioritized.filter(
                            item => item.priority === "HIGH"
                        ).length,

                    mediumPriority:
                        prioritized.filter(
                            item => item.priority === "MEDIUM"
                        ).length,

                    lowPriority:
                        prioritized.filter(
                            item => item.priority === "LOW"
                        ).length,

                    theoryValidation:
                        prioritized.filter(
                            item =>
                                item.targetType ===
                                "THEORY_VALIDATION"
                        ).length,

                    contradictionResolution:
                        prioritized.filter(
                            item =>
                                item.targetType ===
                                "CONTRADICTION_RESOLUTION"
                        ).length,

                    knowledgeGap:
                        prioritized.filter(
                            item =>
                                item.targetType ===
                                "KNOWLEDGE_GAP"
                        ).length,

                    confidenceImprovement:
                        prioritized.filter(
                            item =>
                                item.targetType ===
                                "CONFIDENCE_IMPROVEMENT"
                        ).length,

                    averageExpectedKnowledgeGain:
                        this.average(
                            prioritized.map(
                                item =>
                                    item.estimatedKnowledgeGain
                            )
                        )

                },

                errors: []

            };

        } catch (error) {

            return {

                generatedAt:
                    new Date().toISOString(),

                experiments: [],

                statistics: {
                    experiments: 0,
                    highPriority: 0,
                    mediumPriority: 0,
                    lowPriority: 0,
                    theoryValidation: 0,
                    contradictionResolution: 0,
                    knowledgeGap: 0,
                    confidenceImprovement: 0,
                    averageExpectedKnowledgeGain: 0
                },

                errors: [
                    error instanceof Error
                        ? error.message
                        : "Unknown autonomous experiment design error"
                ]

            };

        }

    }
private sourceIdsForEvidence(
    evidenceIds: string[],
    evidenceGraph: EvidenceGraphResult
): string[] {

    const targetEvidenceIds =
        new Set(
            evidenceIds
        );

    const sourceIds =
        new Set<string>();

    for (
        const edge
        of evidenceGraph.edges ?? []
    ) {

        if (
            !targetEvidenceIds.has(
                edge.edgeId
            )
        ) {
            continue;
        }

        for (
            const sourceId
            of edge.sources ?? []
        ) {

            sourceIds.add(
                sourceId
            );

        }

    }

    return [
    ...sourceIds
];

}

private relationUnderTest(
    relation: string | undefined
): AutonomousExperiment["relationUnderTest"] {

    if (!relation) {
        return undefined;
    }

    const parts =
        relation
            .split(":")
            .map(
                part =>
                    part.trim()
            );

    if (
        parts.length !== 3 ||
        parts.some(
            part =>
                part.length === 0
        )
    ) {
        return undefined;
    }

    const [
        subject,
        predicate,
        object
    ] = parts;

    return {
        relation,
        subject,
        predicate,
        object
    };
}

private validationKnowledgeGain(
    validation: ScientificValidationResult["validations"][number]
): number {

    let score =
        validation.status === "CHALLENGED"
            ? 60
            : validation.status === "REJECTED"
                ? 55
                : 50;

    const independentSourceDeficit =
        Math.max(
            0,
            3 - validation.independentSources
        );

    score +=
        independentSourceDeficit * 8;

    const totalEvidence =
        validation.supportingEvidence +
        validation.contradictoryEvidence;

    if (totalEvidence === 0) {

        score += 15;

    } else if (totalEvidence <= 2) {

        score += 10;

    } else if (totalEvidence <= 5) {

        score += 5;

    }

    if (
        validation.supportingEvidence > 0 &&
        validation.contradictoryEvidence > 0
    ) {

        score += 10;

    }

    score +=
        Math.min(
            6,
            validation.challenges.length * 2
        );

    return Math.min(
        100,
        score
    );

}
  private repositoriesFor(
    text: string,
    excludedRepositories: string[] = [],
    repositoryExecutionIntelligence: Record<
        string,
        GitHubRepositoryIntelligenceResult
    > = {}
): string[] {

    const normalized =
        text.toLowerCase();

    const repositories =
        new Set<string>();

    if (
        normalized.includes("reservation") ||
        normalized.includes("accounting") ||
        normalized.includes("settlement") ||
        normalized.includes("reserved") ||
        normalized.includes("locked value") ||
        normalized.includes("available value")
    ) {

        repositories.add(
            "ten-io-meta/erc8060-reservable"
        );

        repositories.add(
            "OpenZeppelin/openzeppelin-contracts"
        );

        repositories.add(
            "Vectorized/solady"
        );

        repositories.add(
            "transmissions11/solmate"
        );

        repositories.add(
            "thirdweb-dev/contracts"
        );

    }

    if (
        normalized.includes("transfer") ||
        normalized.includes("mint") ||
        normalized.includes("burn")
    ) {

        repositories.add(
            "OpenZeppelin/openzeppelin-contracts"
        );

        repositories.add(
            "Vectorized/solady"
        );

        repositories.add(
            "transmissions11/solmate"
        );

    }

    if (
        normalized.includes("invariant") ||
        normalized.includes("testing") ||
        normalized.includes("safety") ||
        normalized.includes("contradiction")
    ) {

        if (
            normalized.includes("accounting") ||
            normalized.includes("reservation") ||
            normalized.includes("settlement")
        ) {

            repositories.add(
                "ten-io-meta/erc8060-reservable"
            );

        }

        repositories.add(
            "foundry-rs/foundry"
        );

        repositories.add(
            "crytic/slither"
        );

        repositories.add(
            "crytic/echidna"
        );

    }

    if (
        normalized.includes("authority") ||
        normalized.includes("signature") ||
        normalized.includes("eip712")
    ) {

        repositories.add(
            "safe-global/safe-smart-account"
        );

        repositories.add(
            "OpenZeppelin/openzeppelin-contracts"
        );

        repositories.add(
            "Vectorized/solady"
        );

    }

    if (
        normalized.includes("standardization") ||
        normalized.includes("specification") ||
        normalized.includes("security considerations") ||
        normalized.includes("interoperability") ||
        normalized.includes("composition")
    ) {

        repositories.add(
            "OpenZeppelin/openzeppelin-contracts"
        );

        repositories.add(
            "Vectorized/solady"
        );

        repositories.add(
            "transmissions11/solmate"
        );

        repositories.add(
            "thirdweb-dev/contracts"
        );

        repositories.add(
            "ethereum/EIPs"
        );

    }

    if (
        repositories.size === 0
    ) {

        repositories.add(
            "OpenZeppelin/openzeppelin-contracts"
        );

        repositories.add(
            "Vectorized/solady"
        );

        repositories.add(
            "transmissions11/solmate"
        );

        repositories.add(
            "thirdweb-dev/contracts"
        );

        repositories.add(
            "foundry-rs/foundry"
        );

    }

    const excluded =
        new Set(
            excludedRepositories.map(
                repository =>
                    repository.toLowerCase()
            )
        );

    return [
        ...repositories
    ]
        .filter(
            repository =>
                !excluded.has(
                    repository.toLowerCase()
                )
        )
        .map(
            (
                repository,
                originalIndex
            ) => ({

                repository,

                originalIndex,

                feasibilityScore:
                    this.repositoryFeasibilityScore(
                        repository,
                        normalized,
                        repositoryExecutionIntelligence
                    )

            })
        )
        .sort(
            (a, b) => {

                if (
                    b.feasibilityScore !==
                    a.feasibilityScore
                ) {

                    return (
                        b.feasibilityScore -
                        a.feasibilityScore
                    );

                }

                return (
                    a.originalIndex -
                    b.originalIndex
                );

            }
        )
        .slice(
            0,
            5
        )
        .map(
            candidate =>
                candidate.repository
        );

}

private repositoryFeasibilityScore(
    repository: string,
    normalizedExperimentText: string,
    repositoryExecutionIntelligence: Record<
        string,
        GitHubRepositoryIntelligenceResult
    >
): number {

    const intelligence =
        repositoryExecutionIntelligence[
            repository
        ];

    if (!intelligence) {
        return 0;
    }

    let score = 0;

    if (
        intelligence.toolchain !==
        "UNKNOWN"
    ) {
        score += 2;
    }

    if (
        intelligence.executableTargets.length >
        0
    ) {
        score += 2;
    }

    const requiresInvariantEvidence =
        normalizedExperimentText.includes(
            "invariant"
        ) ||
        normalizedExperimentText.includes(
            "safety"
        ) ||
        normalizedExperimentText.includes(
            "accounting"
        );

    const requiresTestEvidence =
        normalizedExperimentText.includes(
            "test"
        ) ||
        normalizedExperimentText.includes(
            "testing"
        ) ||
        normalizedExperimentText.includes(
            "execute"
        ) ||
        normalizedExperimentText.includes(
            "reproduce"
        );

    if (
        requiresInvariantEvidence &&
        intelligence.executableTargets.some(
            target =>
                target.type ===
                "INVARIANT"
        )
    ) {
        score += 4;
    }

    if (
        requiresTestEvidence &&
        intelligence.executableTargets.some(
            target =>
                target.type ===
                "TEST"
        )
    ) {
        score += 4;
    }

    return score;

}
private executableTargetsForRepositories(
    repositories: string[],
    repositoryExecutionIntelligence: Record<
        string,
        GitHubRepositoryIntelligenceResult
    >,
    relationUnderTest:
        AutonomousExperiment["relationUnderTest"]
): NonNullable<
    AutonomousExperiment["recommendedExecutableTargets"]
> {

    const targets:
        {
            repository: string;
            target:
                NonNullable<
                    AutonomousExperiment[
                        "recommendedExecutableTargets"
                    ]
                >[number]["target"];
            originalIndex: number;
            relevanceScore: number;
            matchedComponents: (
                | "SUBJECT"
                | "PREDICATE"
                | "OBJECT"
            )[];
        }[] = [];

    let originalIndex =
        0;

    for (
        const repository
        of repositories
    ) {

        const intelligence =
            repositoryExecutionIntelligence[
                repository
            ];

        if (!intelligence) {
            continue;
        }

        for (
            const target
            of intelligence.executableTargets
        ) {

            const normalizedTargetText =
                (
                    target.selector +
                    " " +
                    target.semanticContext
                )
                    .toLowerCase();

            const matchedComponents: (
                | "SUBJECT"
                | "PREDICATE"
                | "OBJECT"
            )[] = [];

            if (relationUnderTest) {

                if (
                    normalizedTargetText.includes(
                        relationUnderTest.subject.toLowerCase()
                    )
                ) {

                    matchedComponents.push(
                        "SUBJECT"
                    );

                }

                if (
                    normalizedTargetText.includes(
                        relationUnderTest.predicate.toLowerCase()
                    )
                ) {

                    matchedComponents.push(
                        "PREDICATE"
                    );

                }

                if (
                    normalizedTargetText.includes(
                        relationUnderTest.object.toLowerCase()
                    )
                ) {

                    matchedComponents.push(
                        "OBJECT"
                    );

                }

            }

            targets.push({
                repository,
                target,
                originalIndex,
                relevanceScore:
                    matchedComponents.length,
                matchedComponents
            });

            originalIndex++;

        }

    }

    return targets
        .sort(
            (a, b) => {

                if (
                    b.relevanceScore !==
                    a.relevanceScore
                ) {

                    return (
                        b.relevanceScore -
                        a.relevanceScore
                    );

                }

                return (
                    a.originalIndex -
                    b.originalIndex
                );

            }
        )
        .map(
            candidate => ({
                repository:
                    candidate.repository,

                target:
                    candidate.target,

                relationRelevance: {

                    score:
                        candidate.relevanceScore,

                    matchedComponents:
                        candidate.matchedComponents

                }
            })
        );
}
private validationEvidenceNovelty(
    existingRepositories: string[],
    candidateRepositories: string[],
    repositoryExecutionIntelligence: Record<
        string,
        GitHubRepositoryIntelligenceResult
    >
): NonNullable<
    AutonomousExperiment["evidenceNovelty"]
> {

    const normalizedExistingRepositories =
        new Set(
            existingRepositories.map(
                repository =>
                    repository.toLowerCase()
            )
        );

    const novelCandidateRepositories =
        candidateRepositories.filter(
            repository =>
                !normalizedExistingRepositories.has(
                    repository.toLowerCase()
                )
        );

    const existingTargetTypes =
        new Set<
            "TEST" |
            "INVARIANT"
        >();

    for (
        const repository
        of existingRepositories
    ) {

        const intelligence =
            repositoryExecutionIntelligence[
                repository
            ];

        if (!intelligence) {
            continue;
        }

        for (
            const target
            of intelligence.executableTargets
        ) {

            existingTargetTypes.add(
                target.type
            );

        }

    }

    const candidateTargetTypes =
        new Set<
            "TEST" |
            "INVARIANT"
        >();

    let executableCandidateRepositories =
        0;

    for (
        const repository
        of candidateRepositories
    ) {

        const intelligence =
            repositoryExecutionIntelligence[
                repository
            ];

        if (!intelligence) {
            continue;
        }

        if (
            intelligence.executableTargets.length >
            0
        ) {

            executableCandidateRepositories++;

        }

        for (
            const target
            of intelligence.executableTargets
        ) {

            candidateTargetTypes.add(
                target.type
            );

        }

    }

    const novelTargetTypes =
        [
            ...candidateTargetTypes
        ].filter(
            targetType =>
                !existingTargetTypes.has(
                    targetType
                )
        );

    let score =
        0;

    const rationale:
        string[] =
        [];

    if (
        candidateRepositories.length >
        0
    ) {

        const repositoryNoveltyRatio =
            novelCandidateRepositories.length /
            candidateRepositories.length;

        score +=
            Math.round(
                repositoryNoveltyRatio *
                50
            );

        rationale.push(
            `${novelCandidateRepositories.length} of ${candidateRepositories.length} candidate repositories are independent of the repositories already represented by the target evidence.`
        );

        const executableCoverageRatio =
            executableCandidateRepositories /
            candidateRepositories.length;

        score +=
            Math.round(
                executableCoverageRatio *
                25
            );

        rationale.push(
            `${executableCandidateRepositories} of ${candidateRepositories.length} candidate repositories expose known executable targets.`
        );

    } else {

        rationale.push(
            "No candidate repository is currently available for novelty assessment."
        );

    }

    if (
        candidateTargetTypes.size >
        0
    ) {

        const targetTypeNoveltyRatio =
            novelTargetTypes.length /
            candidateTargetTypes.size;

        score +=
            Math.round(
                targetTypeNoveltyRatio *
                25
            );

        rationale.push(
            `${novelTargetTypes.length} of ${candidateTargetTypes.size} candidate executable target types are not represented by the existing evidence repositories.`
        );

    } else {

        rationale.push(
            "No known executable target type is available in the candidate repositories."
        );

    }

    return {

        score:
            Math.min(
                100,
                score
            ),

        existingRepositories:
            [
                ...existingRepositories
            ],

        candidateRepositories:
            [
                ...candidateRepositories
            ],

        knownExecutableTargetTypes:
            [
                ...candidateTargetTypes
            ],

        rationale

    };

}

private requiredEvidenceForGap(
        gapType: string
    ): string[] {

        switch (gapType) {

            case "INFERRED_ONLY":

                return [
                    "Direct source evidence for the inferred relationship.",
                    "At least one independent implementation.",
                    "A test or invariant demonstrating the relation."
                ];

            case "LOW_CONFIDENCE":

                return [
                    "Additional independent sources.",
                    "Higher-quality implementation evidence.",
                    "Executable tests or formal invariants."
                ];

            case "WEAK_EVIDENCE":

                return [
                    "At least one additional independent source.",
                    "Direct implementation evidence.",
                    "Reproducible evidence references."
                ];

            case "UNDERCONNECTED_NODE":

                return [
                    "Additional graph relations.",
                    "Protocol implementations using the target capability.",
                    "Evidence connecting the node to upstream and downstream concepts."
                ];

            default:

                return [
                    "Additional independent evidence.",
                    "Implementation evidence.",
                    "Reproducible validation."
                ];

        }

    }

    private deduplicate(
        experiments: AutonomousExperiment[]
    ): AutonomousExperiment[] {

        const unique =
            new Map<string, AutonomousExperiment>();

        for (const experiment of experiments) {

            const key =
                `${experiment.targetType}:${experiment.targetId}`;

            const existing =
                unique.get(key);

            if (
    !existing ||
    experiment.estimatedKnowledgeGain >
        existing.estimatedKnowledgeGain ||
    (
        experiment.estimatedKnowledgeGain ===
            existing.estimatedKnowledgeGain &&
        (
            experiment.evidenceNovelty?.score ??
            0
        ) >
        (
            existing.evidenceNovelty?.score ??
            0
        )
    )
) {

    unique.set(
        key,
        experiment
    );

}
        }

        return [
            ...unique.values()
        ];

    }

    private priorityWeight(
        priority: AutonomousExperiment["priority"]
    ): number {

        switch (priority) {

            case "HIGH":
                return 3;

            case "MEDIUM":
                return 2;

            case "LOW":
                return 1;

        }

    }

    private average(
        values: number[]
    ): number {

        if (values.length === 0) {
            return 0;
        }

        return Math.round(
            values.reduce(
                (sum, value) =>
                    sum + value,
                0
            ) / values.length
        );

    }

}