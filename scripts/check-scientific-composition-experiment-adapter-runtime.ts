import {
    ScientificCompositionExperimentAdapter
} from "../laboratory/scientific-composition-experiment/ScientificCompositionExperimentAdapter.js";

import type {
    ScientificCompositionConstraint
} from "../laboratory/scientific-composition-evaluation-specification/ScientificCompositionConstraint.js";

import type {
    ScientificCompositionEvaluationSpecification
} from "../laboratory/scientific-composition-evaluation-specification/ScientificCompositionEvaluationSpecification.js";

import type {
    ScientificCompositionEvaluationSpecificationResult
} from "../laboratory/scientific-composition-evaluation-specification/ScientificCompositionEvaluationSpecificationResult.js";


interface Check {

    name:
        string;

    passed:
        boolean;

}


const checks:
    Check[] = [];


function check(
    name:
        string,

    passed:
        boolean
): void {

    checks.push({
        name,
        passed
    });

}


function constraint(
    params: {

        constraintId:
            string;

        candidateId?:
            string;

        participantSide:
            "A" |
            "B";

        participantId:
            string;

        sourceId:
            string;

        factId:
            string;

        containerSymbol:
            string;

        rawText:
            string;

    }
): ScientificCompositionConstraint {

    return {

        constraintId:
            params.constraintId,

        candidateId:
            params.candidateId ??
            "CANDIDATE-1",

        participantSide:
            params.participantSide,

        participantKind:
            "PROTOCOL",

        participantId:
            params.participantId,

        sourceId:
            params.sourceId,

        sourceRevision:
            "REVISION-1",

        factId:
            params.factId,

        basis:
            "SOLIDITY_REQUIRE_STATEMENT",

        containerKind:
            "CONTRACT",

        containerSymbol:
            params.containerSymbol,

        locator: {

            sourceLocation:
                `https://example.test/${params.sourceId}`,

            filePath:
                `contracts/${params.containerSymbol}.sol`,

            startLine:
                10,

            endLine:
                10

        },

        rawText:
            params.rawText

    };

}


const constraintA =
    constraint({

        constraintId:
            "CONSTRAINT-A",

        participantSide:
            "A",

        participantId:
            "PROTOCOL-A",

        sourceId:
            "SOURCE-A",

        factId:
            "FACT-A",

        containerSymbol:
            "ProtocolA",

        rawText:
            "require(value > 0);"

    });


const constraintB =
    constraint({

        constraintId:
            "CONSTRAINT-B",

        participantSide:
            "B",

        participantId:
            "PROTOCOL-B",

        sourceId:
            "SOURCE-B",

        factId:
            "FACT-B",

        containerSymbol:
            "ProtocolB",

        rawText:
            "require(balance >= value);"

    });


function readySpecification(
    overrides:
        Partial<
            ScientificCompositionEvaluationSpecification
        > = {}
): ScientificCompositionEvaluationSpecification {

    return {

        specificationId:
            "SPECIFICATION-1",

        candidateId:
            "CANDIDATE-1",

        mechanism:
            "SHARED_RECURRENT_CONCEPT",

        candidateSnapshot: {

            candidateId:
                "CANDIDATE-1",

            participantA: {
                kind:
                    "PROTOCOL",

                id:
                    "PROTOCOL-A"
            },

            participantB: {
                kind:
                    "PROTOCOL",

                id:
                    "PROTOCOL-B"
            },

            mechanism:
                "SHARED_RECURRENT_CONCEPT",

            conceptId:
                "CONCEPT-1",

            supportingCapabilityIdsA:
                [],

            supportingCapabilityIdsB:
                [],

            provenance: [
                {
                    kind:
                        "PROTOCOL_CONCEPT",

                    sourceId:
                        "SOURCE-A",

                    sourceRevision:
                        "REV-A",

                    evidenceId:
                        "EVIDENCE-A"
                },
                {
                    kind:
                        "PROTOCOL_CONCEPT",

                    sourceId:
                        "SOURCE-B",

                    sourceRevision:
                        "REV-B",

                    evidenceId:
                        "EVIDENCE-B"
                }
            ],

            evaluationStatus:
                "UNEVALUATED"

        },

        status:
            "READY",

        sourceIds: [
            "SOURCE-A",
            "SOURCE-B"
        ],

        targetEvidenceIds: [
            "EVIDENCE-B",
            "EVIDENCE-A"
        ],

        constraints: [
            {
                ...constraintA,

                sourceRevision:
                    "REV-A"
            },
            {
                ...constraintB,

                sourceRevision:
                    "REV-B"
            }
        ],

        participantAConstraintIds: [
            "CONSTRAINT-A"
        ],

        participantBConstraintIds: [
            "CONSTRAINT-B"
        ],

        unresolvedGuardFactIds: [
            "REVERT-GUARD-1"
        ],

        scientificCriteria: {

            relation:
                "PRESERVES_OBSERVED_CONSTRAINTS",

            support: {

                expectedPolarity:
                    "SUPPORT",

                condition:
                    "ALL_OBSERVED_PARTICIPANT_CONSTRAINTS_PRESERVED"

            },

            challenge: {

                expectedPolarity:
                    "CHALLENGE",

                condition:
                    "ANY_OBSERVED_PARTICIPANT_CONSTRAINT_VIOLATED"

            },

            inconclusive: {

                whenNoScientificPolarity:
                    true

            }

        },

        ...overrides

    };

}


function insufficientSpecification(
    overrides:
        Partial<
            ScientificCompositionEvaluationSpecification
        > = {}
): ScientificCompositionEvaluationSpecification {

    return {

        specificationId:
            "SPECIFICATION-INSUFFICIENT",

        candidateId:
            "CANDIDATE-INSUFFICIENT",

        mechanism:
            "SHARED_RECURRENT_CONCEPT",

        status:
            "INSUFFICIENT_EVIDENCE",

        sourceIds: [
            "SOURCE-A"
        ],

        targetEvidenceIds: [
            "EVIDENCE-INSUFFICIENT"
        ],

        constraints: [
            constraintA
        ],

        participantAConstraintIds: [
            "CONSTRAINT-A"
        ],

        participantBConstraintIds: [],

        unresolvedGuardFactIds: [],

        scientificCriteria:
            null,

        ...overrides

    };

}


function input(
    specifications:
        ScientificCompositionEvaluationSpecification[],

    errors:
        string[] = []
): ScientificCompositionEvaluationSpecificationResult {

    return {

        specifications,
        errors

    };

}


const sources = [

    {
        sourceId:
            "SOURCE-A",

        repository:
            "owner-a/repository-a"
    },

    {
        sourceId:
            "SOURCE-B",

        repository:
            "owner-b/repository-b"
    }

];


const adapter =
    new ScientificCompositionExperimentAdapter();


const validResult =
    adapter.build(
        input([
            readySpecification()
        ]),
        sources
    );


check(
    "VALID READY SPECIFICATION PRODUCES NO ERRORS",
    validResult.errors.length ===
        0
);


check(
    "READY SPECIFICATION PRODUCES ONE EXPERIMENT",
    validResult.experiments.length ===
        1
);


const experiment =
    validResult.experiments[0];


check(
    "EXPERIMENT TARGET TYPE IS COMPOSITION CANDIDATE",
    experiment?.targetType ===
        "COMPOSITION_CANDIDATE"
);


check(
    "EXPERIMENT TARGET ID PRESERVES CANDIDATE ID",
    experiment?.targetId ===
        "CANDIDATE-1"
);


check(
    "EXPERIMENT ID PRESERVES SPECIFICATION ID",
    experiment?.experimentId ===
        "SCIENTIFIC-COMPOSITION-EXPERIMENT-SPECIFICATION-1"
);


check(
    "EXPERIMENT PRESERVES SOURCE IDS",
    JSON.stringify(
        experiment?.sourceIds
    ) ===
        JSON.stringify([
            "SOURCE-A",
            "SOURCE-B"
        ])
);


check(
    "EXPERIMENT PRESERVES TARGET EVIDENCE IDS",
    JSON.stringify(
        experiment?.targetEvidenceIds
    ) ===
        JSON.stringify([
            "EVIDENCE-B",
            "EVIDENCE-A"
        ])
);


check(
    "EXPERIMENT RESOLVES EXPLICIT REPOSITORIES",
    JSON.stringify(
        experiment?.recommendedRepositories
    ) ===
        JSON.stringify([
            "owner-a/repository-a",
            "owner-b/repository-b"
        ])
);


check(
    "EXPERIMENT PRESERVES SCIENTIFIC RELATION",
    experiment?.scientificCriteria?.relation ===
        "PRESERVES_OBSERVED_CONSTRAINTS"
);


check(
    "EXPERIMENT PRESERVES SUPPORT CONDITION",
    experiment?.supportCondition ===
        "ALL_OBSERVED_PARTICIPANT_CONSTRAINTS_PRESERVED"
);


check(
    "EXPERIMENT PRESERVES CHALLENGE CONDITION",
    experiment?.challengeCondition ===
        "ANY_OBSERVED_PARTICIPANT_CONSTRAINT_VIOLATED"
);


check(
    "SCIENTIFIC CRITERIA SUPPORT POLARITY IS PRESERVED",
    experiment?.scientificCriteria?.support.expectedPolarity ===
        "SUPPORT"
);


check(
    "SCIENTIFIC CRITERIA CHALLENGE POLARITY IS PRESERVED",
    experiment?.scientificCriteria?.challenge.expectedPolarity ===
        "CHALLENGE"
);


check(
    "INCONCLUSIVE REMAINS AVAILABLE WITHOUT FORCED POLARITY",
    experiment?.scientificCriteria?.inconclusive.whenNoScientificPolarity ===
        true
);


check(
    "FIRST OBSERVED CONSTRAINT REACHES REQUIRED EVIDENCE",
    experiment?.requiredEvidence.some(
        value =>
            value.includes(
                "require(value > 0);"
            )
    ) ===
        true
);


check(
    "SECOND OBSERVED CONSTRAINT REACHES REQUIRED EVIDENCE",
    experiment?.requiredEvidence.some(
        value =>
            value.includes(
                "require(balance >= value);"
            )
    ) ===
        true
);


check(
    "FIRST OBSERVED CONSTRAINT REACHES PROCEDURE",
    experiment?.procedure.some(
        value =>
            value.includes(
                "CONSTRAINT-A"
            ) &&
            value.includes(
                "require(value > 0);"
            )
    ) ===
        true
);


check(
    "SECOND OBSERVED CONSTRAINT REACHES PROCEDURE",
    experiment?.procedure.some(
        value =>
            value.includes(
                "CONSTRAINT-B"
            ) &&
            value.includes(
                "require(balance >= value);"
            )
    ) ===
        true
);


check(
    "EXPERIMENT DOES NOT INVENT SOURCE CONCLUSION",
    experiment !==
        undefined &&
    !Object.prototype.hasOwnProperty.call(
        experiment,
        "sourceConclusionId"
    )
);


check(
    "COMPOSITION CANDIDATE STATISTIC IS ONE",
    validResult.statistics.compositionCandidate ===
        1
);


check(
    "TOTAL EXPERIMENT STATISTIC IS ONE",
    validResult.statistics.experiments ===
        1
);


check(
    "COMPOSITION EXPERIMENT DOES NOT INFLATE LEGACY TYPE COUNTS",
    validResult.statistics.theoryValidation ===
        0 &&
    validResult.statistics.contradictionResolution ===
        0 &&
    validResult.statistics.knowledgeGap ===
        0 &&
    validResult.statistics.confidenceImprovement ===
        0
);


const insufficientResult =
    adapter.build(
        input([
            insufficientSpecification()
        ]),
        sources
    );


check(
    "INSUFFICIENT EVIDENCE PRODUCES NO EXPERIMENT",
    insufficientResult.experiments.length ===
        0
);


check(
    "INSUFFICIENT EVIDENCE IS NOT AN ADAPTER ERROR",
    insufficientResult.errors.length ===
        0
);


check(
    "INSUFFICIENT EVIDENCE DOES NOT COUNT AS COMPOSITION EXPERIMENT",
    insufficientResult.statistics.compositionCandidate ===
        0
);


const mixedResult =
    adapter.build(
        input([
            insufficientSpecification(),
            readySpecification()
        ]),
        sources
    );


check(
    "READY AND INSUFFICIENT MIX PRODUCES ONLY READY EXPERIMENT",
    mixedResult.experiments.length ===
        1 &&
    mixedResult.experiments[0]?.targetId ===
        "CANDIDATE-1"
);


const sameRepositoryResult =
    adapter.build(
        input([
            readySpecification()
        ]),
        [

            {
                sourceId:
                    "SOURCE-A",

                repository:
                    "shared/repository"
            },

            {
                sourceId:
                    "SOURCE-B",

                repository:
                    "shared/repository"
            }

        ]
    );


check(
    "TWO SOURCE IDS MAY RESOLVE TO ONE REPOSITORY",
    sameRepositoryResult.errors.length ===
        0 &&
    sameRepositoryResult.experiments.length ===
        1
);


check(
    "SAME REPOSITORY IS DEDUPLICATED",
    JSON.stringify(
        sameRepositoryResult
            .experiments[0]
            ?.recommendedRepositories
    ) ===
        JSON.stringify([
            "shared/repository"
        ])
);


check(
    "SOURCE IDS REMAIN DISTINCT WHEN REPOSITORY IS SHARED",
    JSON.stringify(
        sameRepositoryResult
            .experiments[0]
            ?.sourceIds
    ) ===
        JSON.stringify([
            "SOURCE-A",
            "SOURCE-B"
        ])
);


const unknownSourceResult =
    adapter.build(
        input([
            readySpecification({
                sourceIds: [
                    "SOURCE-A",
                    "SOURCE-UNKNOWN"
                ]
            })
        ]),
        sources
    );


check(
    "UNKNOWN SOURCE ID IS DETECTED",
    unknownSourceResult.errors.some(
        error =>
            error.includes(
                "references unknown source SOURCE-UNKNOWN"
            )
    )
);


check(
    "UNKNOWN SOURCE ID FAILS CLOSED",
    unknownSourceResult.experiments.length ===
        0
);


const missingRepositoryResult =
    adapter.build(
        input([
            readySpecification()
        ]),
        [

            {
                sourceId:
                    "SOURCE-A",

                repository:
                    "owner-a/repository-a"
            },

            {
                sourceId:
                    "SOURCE-B",

                repository:
                    ""
            }

        ]
    );


check(
    "MISSING REPOSITORY ATTRIBUTION IS DETECTED",
    missingRepositoryResult.errors.some(
        error =>
            error.includes(
                "SOURCE-B"
            ) &&
            error.includes(
                "has no repository attribution"
            )
    )
);


check(
    "MISSING REPOSITORY ATTRIBUTION FAILS CLOSED",
    missingRepositoryResult.experiments.length ===
        0
);


const duplicateSourceResult =
    adapter.build(
        input([
            readySpecification()
        ]),
        [

            {
                sourceId:
                    "SOURCE-A",

                repository:
                    "owner-a/repository-a"
            },

            {
                sourceId:
                    "SOURCE-A",

                repository:
                    "other/repository"
            },

            {
                sourceId:
                    "SOURCE-B",

                repository:
                    "owner-b/repository-b"
            }

        ]
    );


check(
    "DUPLICATE SOURCE ID IS DETECTED",
    duplicateSourceResult.errors.some(
        error =>
            error.includes(
                "Duplicate research source id: SOURCE-A"
            )
    )
);


check(
    "DUPLICATE SOURCE ID FAILS CLOSED",
    duplicateSourceResult.experiments.length ===
        0
);


const upstreamFailureResult =
    adapter.build(
        input(
            [
                readySpecification()
            ],
            [
                "UPSTREAM SCIENTIFIC FAILURE"
            ]
        ),
        sources
    );


check(
    "UPSTREAM ERROR IS PRESERVED",
    upstreamFailureResult.errors.includes(
        "UPSTREAM SCIENTIFIC FAILURE"
    )
);


check(
    "UPSTREAM ERROR FAILS CLOSED",
    upstreamFailureResult.experiments.length ===
        0
);


const duplicateSpecificationResult =
    adapter.build(
        input([
            readySpecification(),
            readySpecification()
        ]),
        sources
    );


check(
    "DUPLICATE SPECIFICATION ID IS DETECTED",
    duplicateSpecificationResult.errors.some(
        error =>
            error.includes(
                "Duplicate composition evaluation specification id"
            )
    )
);


check(
    "DUPLICATE CANDIDATE ID IS DETECTED",
    duplicateSpecificationResult.errors.some(
        error =>
            error.includes(
                "Duplicate composition candidate id"
            )
    )
);


check(
    "DUPLICATE SPECIFICATION INPUT FAILS CLOSED",
    duplicateSpecificationResult.experiments.length ===
        0
);


const nullCriteriaReadyResult =
    adapter.build(
        input([
            readySpecification({
                scientificCriteria:
                    null
            })
        ]),
        sources
    );


check(
    "READY SPECIFICATION WITHOUT CRITERIA IS DETECTED",
    nullCriteriaReadyResult.errors.some(
        error =>
            error.includes(
                "has no scientific criteria"
            )
    )
);


check(
    "READY SPECIFICATION WITHOUT CRITERIA FAILS CLOSED",
    nullCriteriaReadyResult.experiments.length ===
        0
);


const reversedSourceResult =
    adapter.build(
        input([
            readySpecification()
        ]),
        [
            sources[1],
            sources[0]
        ]
    );


check(
    "REPOSITORY OUTPUT IS DETERMINISTIC ACROSS SOURCE INPUT ORDER",
    JSON.stringify(
        reversedSourceResult
            .experiments[0]
            ?.recommendedRepositories
    ) ===
        JSON.stringify(
            validResult
                .experiments[0]
                ?.recommendedRepositories
        )
);


check(
    "GENERATED RESULT HAS TIMESTAMP",
    typeof validResult.generatedAt ===
        "string" &&
    validResult.generatedAt.length >
        0
);


console.log("");
console.log(
    "SCIENTIFIC COMPOSITION EXPERIMENT ADAPTER - RUNTIME"
);
console.log(
    "---------------------------------------------------"
);


for (
    const current
    of checks
) {

    console.log(
        `${current.name}: ${
            current.passed
                ? "PASS"
                : "FAIL"
        }`
    );

}


const failures =
    checks.filter(
        current =>
            !current.passed
    );


console.log("");
console.log(
    `PASS: ${
        checks.length -
        failures.length
    }`
);

console.log(
    `FAIL: ${failures.length}`
);


if (
    failures.length ===
    0
) {

    console.log(
        "RESULT: PASS"
    );

} else {

    console.log(
        "RESULT: FAIL"
    );

    process.exitCode =
        1;

}
