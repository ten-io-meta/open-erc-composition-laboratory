import fs from "node:fs";
import path from "node:path";

import {
    ScientificExecutionTargetResolverEngine
} from "../laboratory/scientific-execution-target-resolution/ScientificExecutionTargetResolverEngine";


type ScientificPolarity =
    | "SUPPORT"
    | "CHALLENGE"
    | "NEUTRAL";


interface RelationProbe {

    name: string;

    sourcePatternRelation: string;

}


interface SourceBundle {

    sourceId?: string;

    repository?: string;

    toolchain?: string;

    executableTargets?: any[];

}


interface Classification {

    sourceId: string;

    repository: string;

    toolchain: string;

    relation: string;

    targetType: string;

    filePath: string;

    selector: string;

    polarity:
        ScientificPolarity;

    polarityConfidence:
        number | null;

    decisionSource:
        string;

    matchedSupportCues:
        string[];

    matchedChallengeCues:
        string[];

    negatedSupportCues:
        string[];

    negatedChallengeCues:
        string[];

}


const relationProbes: RelationProbe[] = [

    {
        name:
            "RESERVATION_CONSTRAINS_ACCOUNTING",

        sourcePatternRelation:
            "RESERVATION:CONSTRAINS:ACCOUNTING"
    },

    {
        name:
            "INVARIANT_VALIDATION_VALIDATES_ACCOUNTING",

        sourcePatternRelation:
            "INVARIANT VALIDATION:VALIDATES:ACCOUNTING"
    },

    {
        name:
            "STANDARDIZATION_ENABLES_INTEROPERABILITY",

        sourcePatternRelation:
            "STANDARDIZATION:ENABLES:INTEROPERABILITY"
    }

];


const sourceIds = [

    "GITHUB-ETHEREUM-EIPS",

    "GITHUB-OPENZEPPELIN-OPENZEPPELIN-CONTRACTS",

    "GITHUB-TEN-IO-META-ERC8060-RESERVABLE",

    "GITHUB-THIRDWEB-DEV-CONTRACTS",

    "GITHUB-TRANSMISSIONS11-SOLMATE",

    "GITHUB-VECTORIZED-SOLADY"

];


const engine =
    Object.create(
        ScientificExecutionTargetResolverEngine.prototype
    ) as any;


    const scientificPolarityTraceFor =
    (
        task: any,
        target: any
    ): any => {

        return engine.scientificPolarityTraceFor(
            task,
            target
        );

    };


const scientificPolarityConfidenceFor =
    (
        trace: any
    ): number | null => {

        return engine.scientificPolarityConfidenceFor(
            trace
        );

    };


const classifications: Classification[] = [];


for (
    const sourceId
    of sourceIds
) {

    const sourcePath =
        path.resolve(
            process.cwd(),
            "sources",
            "research",
            sourceId,
            "source.json"
        );


    if (
        !fs.existsSync(
            sourcePath
        )
    ) {

        console.warn(
            `SOURCE NOT FOUND: ${sourceId}`
        );

        continue;

    }


    const source =
        JSON.parse(
            fs.readFileSync(
                sourcePath,
                "utf8"
            )
        ) as SourceBundle;


    const targets =
        Array.isArray(
            source.executableTargets
        )
            ? source.executableTargets
            : [];


    for (
        const relationProbe
        of relationProbes
    ) {

        const task = {

            targetId:
                `REAL-CROSS-${relationProbe.name}`,

            supportCondition:
                "",

            challengeCondition:
                "",

            sourcePatternRelation:
                relationProbe.sourcePatternRelation

        };


        for (
            const target
            of targets
        ) {

            const polarityTrace =
                scientificPolarityTraceFor(
                    task,
                    target
                );


            const polarity =
                polarityTrace.polarity as
                    ScientificPolarity;


            const polarityConfidence =
    scientificPolarityConfidenceFor(
        polarityTrace
    );

    if (
    relationProbe.sourcePatternRelation ===
        "RESERVATION:CONSTRAINS:ACCOUNTING" &&
    polarity ===
        "SUPPORT"
) {

    console.log(
        "\n=== REAL CHALLENGE CANDIDATE DIAGNOSTIC ==="
    );

    console.log({
        repository:
            source.repository ??
            sourceId,

        filePath:
            target.filePath,

        selector:
            target.selector,

        scientificPolarity:
            polarity,

        polarityConfidence,

        decisionSource:
            polarityTrace.decisionSource,

        relation:
            polarityTrace.relation,

        subjectMatched:
            polarityTrace.subjectMatched,

        objectMatched:
            polarityTrace.objectMatched,

        hasExecutableAssertion:
            polarityTrace.hasExecutableAssertion,

        matchedSupportCues:
            polarityTrace.matchedSupportCues,

        matchedChallengeCues:
            polarityTrace.matchedChallengeCues,

        negatedSupportCues:
            polarityTrace.negatedSupportCues,

        negatedChallengeCues:
            polarityTrace.negatedChallengeCues,

        supportConditionScore:
            polarityTrace.supportConditionScore,

        challengeConditionScore:
            polarityTrace.challengeConditionScore
    });

}


classifications.push({

                sourceId,

                repository:
                    source.repository ??
                    sourceId,

                toolchain:
                    source.toolchain ??
                    "UNKNOWN",

                relation:
                    relationProbe.name,

                targetType:
                    String(
                        target.type ??
                        "UNKNOWN"
                    ),

                filePath:
                    String(
                        target.filePath ??
                        ""
                    ),

                selector:
                    String(
                        target.selector ??
                        ""
                    ),

               polarity,

polarityConfidence,

decisionSource:
    polarityTrace.decisionSource,

matchedSupportCues:
    polarityTrace.matchedSupportCues,

matchedChallengeCues:
    polarityTrace.matchedChallengeCues,

negatedSupportCues:
    polarityTrace.negatedSupportCues,

negatedChallengeCues:
    polarityTrace.negatedChallengeCues
            });

        }

    }

}


/*
 * Repository/relation distribution.
 */

const distributionRows: any[] = [];


for (
    const relationProbe
    of relationProbes
) {

    for (
        const sourceId
        of sourceIds
    ) {

        const rows =
            classifications.filter(
                row =>
                    row.relation ===
                        relationProbe.name &&
                    row.sourceId ===
                        sourceId
            );


        if (
            rows.length === 0
        ) {
            continue;
        }


        const support =
            rows.filter(
                row =>
                    row.polarity ===
                        "SUPPORT"
            ).length;

        const challenge =
            rows.filter(
                row =>
                    row.polarity ===
                        "CHALLENGE"
            ).length;

        const neutral =
            rows.filter(
                row =>
                    row.polarity ===
                        "NEUTRAL"
            ).length;

        const nonNeutral =
            support +
            challenge;

        const nonNeutralRate =
            rows.length > 0
                ? (
                    nonNeutral /
                    rows.length
                ) * 100
                : 0;


        distributionRows.push({

            relation:
                relationProbe.name,

            repository:
                rows[0].repository,

            toolchain:
                rows[0].toolchain,

            targets:
                rows.length,

            support,

            challenge,

            neutral,

            nonNeutral,

            nonNeutralRate:
                Number(
                    nonNeutralRate.toFixed(
                        2
                    )
                )

        });

    }

}


console.log(
    ""
);

console.log(
    "=== REAL TARGET POLARITY DISTRIBUTION ==="
);

console.table(
    distributionRows
);


/*
 * Aggregate relation distribution.
 */

const aggregateRows =
    relationProbes.map(
        relationProbe => {

            const rows =
                classifications.filter(
                    row =>
                        row.relation ===
                            relationProbe.name
                );


            const support =
                rows.filter(
                    row =>
                        row.polarity ===
                            "SUPPORT"
                ).length;

            const challenge =
                rows.filter(
                    row =>
                        row.polarity ===
                            "CHALLENGE"
                ).length;

            const neutral =
                rows.filter(
                    row =>
                        row.polarity ===
                            "NEUTRAL"
                ).length;

            const nonNeutral =
                support +
                challenge;


            return {

                relation:
                    relationProbe.name,

                targets:
                    rows.length,

                support,

                challenge,

                neutral,

                nonNeutral,

                nonNeutralRate:
                    Number(
                        (
                            (
                                nonNeutral /
                                Math.max(
                                    rows.length,
                                    1
                                )
                            ) *
                            100
                        ).toFixed(
                            3
                        )
                    )

            };

        }
    );


console.log(
    ""
);

console.log(
    "=== AGGREGATE RELATION DISTRIBUTION ==="
);

console.table(
    aggregateRows
);


/*
 * Show concrete non-neutral examples.
 *
 * These are the important rows for manual scientific
 * inspection. A low count can be good: the resolver
 * should remain conservative on unrelated code.
 */

for (
    const relationProbe
    of relationProbes
) {

    console.log(
        ""
    );

    console.log(
        (
            "=== NON-NEUTRAL EXAMPLES: " +
            relationProbe.name +
            " ==="
        )
    );


    const nonNeutral =
        classifications.filter(
            row =>
                row.relation ===
                    relationProbe.name &&
                row.polarity !==
                    "NEUTRAL"
        );


    const examples =
        nonNeutral.slice(
            0,
            20
        );


    if (
        examples.length === 0
    ) {

        console.log(
            "No non-neutral targets."
        );

        continue;

    }


    console.table(
        examples.map(
            row => ({

                polarity:
                    row.polarity,

                repository:
                    row.repository,

                type:
                    row.targetType,

                file:
                    row.filePath,

                selector:
                    row.selector

            })
        )
    );

}


/*
 * ERC-8060 focused check.
 *
 * We already know this repository contains the real
 * reservation/accounting experiment. Print every
 * non-neutral classification for that relation.
 */

const erc8060ReservationRows =
    classifications.filter(
        row =>
            row.sourceId ===
                "GITHUB-TEN-IO-META-ERC8060-RESERVABLE" &&
            row.relation ===
                "RESERVATION_CONSTRAINS_ACCOUNTING" &&
            row.polarity !==
                "NEUTRAL"
    );


console.log(
    ""
);

console.log(
    "=== ERC8060 RESERVATION/ACCOUNTING NON-NEUTRAL TARGETS ==="
);


console.table(
    erc8060ReservationRows.map(
        row => ({

            polarity:
                row.polarity,

            polarityConfidence:
                row.polarityConfidence,

            file:
                row.filePath,

            selector:
                row.selector

        })
    )
);
/*
 * ERC-8060 challenge audit.
 *
 * Show every real CHALLENGE classification together
 * with the directional evidence that produced it.
 */

const erc8060ChallengeRows =
    erc8060ReservationRows.filter(
        row =>
            row.polarity ===
                "CHALLENGE"
    );


console.log(
    ""
);

console.log(
    "=== ERC8060 CHALLENGE AUDIT ==="
);


console.table(
    erc8060ChallengeRows.map(
        row => ({

            selector:
                row.selector,

            decisionSource:
                row.decisionSource,

            polarityConfidence:
                row.polarityConfidence,

            matchedSupportCues:
                row.matchedSupportCues.join(
                    ", "
                ),

            matchedChallengeCues:
                row.matchedChallengeCues.join(
                    ", "
                ),

            negatedSupportCues:
                row.negatedSupportCues.join(
                    ", "
                ),

            negatedChallengeCues:
                row.negatedChallengeCues.join(
                    ", "
                )

        })
    )
);
/*
 * Guardrail diagnostic.
 *
 * This does not fail the script automatically.
 * A high non-neutral rate is a signal for inspection,
 * not proof of a bug.
 */

const suspiciousRows =
    distributionRows.filter(
        row =>
            row.nonNeutralRate >
                10
    );


console.log(
    ""
);

console.log(
    "=== HIGH NON-NEUTRAL RATE (>10%) ==="
);


if (
    suspiciousRows.length === 0
) {

    console.log(
        "None."
    );

} else {

    console.table(
        suspiciousRows
    );

}
/*
 * ==================================================
 * POLARITY CONFIDENCE CROSS-VALIDATION
 * ==================================================
 *
 * Invariants:
 *
 * 1. NEUTRAL classifications have no polarity
 *    confidence.
 *
 * 2. Directional classifications have a finite
 *    confidence in the interval (0, 1].
 *
 * 3. The known ERC-8060 reservation/accounting
 *    evidence resolves as SUPPORT with maximum
 *    relation-evidence confidence.
 */

const neutralConfidenceViolations =
    classifications.filter(
        row =>
            row.polarity ===
                "NEUTRAL" &&
            row.polarityConfidence !==
                null
    );


const directionalConfidenceViolations =
    classifications.filter(
        row =>
            row.polarity !==
                "NEUTRAL" &&
            (
                row.polarityConfidence ===
                    null ||
                !Number.isFinite(
                    row.polarityConfidence
                ) ||
                row.polarityConfidence <=
                    0 ||
                row.polarityConfidence >
                    1
            )
    );


const erc8060SupportConfidenceRows =
    erc8060ReservationRows.filter(
        row =>
            row.polarity ===
                "SUPPORT" &&
            row.polarityConfidence ===
                1
    );


const erc8060ConfidencePassed =
    erc8060SupportConfidenceRows.length >
        0;


console.log(
    ""
);


console.log(
    "=== POLARITY CONFIDENCE CROSS-VALIDATION ==="
);


console.table([
    {
        invariant:
            "NEUTRAL => null",

        violations:
            neutralConfidenceViolations.length,

        passed:
            neutralConfidenceViolations.length ===
                0
    },
    {
        invariant:
            "DIRECTIONAL => (0, 1]",

        violations:
            directionalConfidenceViolations.length,

        passed:
            directionalConfidenceViolations.length ===
                0
    },
    {
        invariant:
            "ERC8060 SUPPORT => confidence 1",

        violations:
            erc8060ConfidencePassed
                ? 0
                : 1,

        passed:
            erc8060ConfidencePassed
    }
]);


const polarityConfidenceCrossValidationPassed =
    neutralConfidenceViolations.length ===
        0 &&
    directionalConfidenceViolations.length ===
        0 &&
    erc8060ConfidencePassed;


if (
    !polarityConfidenceCrossValidationPassed
) {

    console.log(
        ""
    );


    if (
        neutralConfidenceViolations.length >
            0
    ) {

        console.log(
            "NEUTRAL CONFIDENCE VIOLATIONS:"
        );

        console.table(
            neutralConfidenceViolations.slice(
                0,
                20
            )
        );

    }


    if (
        directionalConfidenceViolations.length >
            0
    ) {

        console.log(
            "DIRECTIONAL CONFIDENCE VIOLATIONS:"
        );

        console.table(
            directionalConfidenceViolations.slice(
                0,
                20
            )
        );

    }


    process.exitCode =
        1;

} else {

    console.log(
        ""
    );

    console.log(
        "POLARITY CONFIDENCE CROSS-VALIDATION: PASS"
    );

}

/*
 * Summary.
 */

console.log(
    ""
);

console.log(
    "=== CROSS-VALIDATION SUMMARY ==="
);

console.log(
    `Repositories: ${sourceIds.length}`
);

console.log(
    `Relations: ${relationProbes.length}`
);

console.log(
    (
        "Executable target classifications: " +
        classifications.length
    )
);