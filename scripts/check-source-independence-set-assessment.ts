import {
    SourceIndependenceSetAssessmentEngine
} from "../laboratory/source-independence/SourceIndependenceSetAssessmentEngine.js";

import type {
    SourceIndependenceAssessment
} from "../laboratory/source-independence/SourceIndependenceAssessment.js";

const engine =
    new SourceIndependenceSetAssessmentEngine();

function pair(
    sourceAId: string,
    sourceBId: string,
    status:
        | "INDEPENDENT"
        | "DEPENDENT"
        | "INCONCLUSIVE"
): SourceIndependenceAssessment {

    return {
        sourceIds: [
            sourceAId,
            sourceBId
        ],

        status,

        reason:
            status === "DEPENDENT"
                ? "SAME_REPOSITORY"
                : "DISTINCT_SOURCE_IDENTITY_WITHOUT_DEPENDENCY_EVIDENCE",

        establishedIndependentSources:
            status === "INDEPENDENT"
                ? 2
                : 0,

        explanation:
            "Controlled source independence set fixture."
    };

}

function assert(
    condition: boolean,
    message: string
): void {

    if (condition) {

        console.log(
            `PASS: ${message}`
        );

        return;

    }

    console.error(
        `FAIL: ${message}`
    );

    process.exitCode = 1;

}

console.log(
    "\n=== SOURCE INDEPENDENCE SET REGRESSION ===\n"
);

/*
 * CASE 1
 *
 * A-B independent
 * A-C independent
 * B-C independent
 *
 * Therefore all three sources are mutually independent.
 */
const fullyIndependent =
    engine.build(
        [
            "SOURCE-A",
            "SOURCE-B",
            "SOURCE-C"
        ],
        [
            pair(
                "SOURCE-A",
                "SOURCE-B",
                "INDEPENDENT"
            ),
            pair(
                "SOURCE-A",
                "SOURCE-C",
                "INDEPENDENT"
            ),
            pair(
                "SOURCE-B",
                "SOURCE-C",
                "INDEPENDENT"
            )
        ]
    );

assert(
    fullyIndependent.establishedIndependentSources === 3,
    "THREE MUTUALLY INDEPENDENT SOURCES COUNT AS THREE"
);

assert(
    fullyIndependent.fullyEstablished === true,
    "FULL PAIRWISE INDEPENDENCE ESTABLISHES THE COMPLETE SET"
);

assert(
    fullyIndependent.hasInconclusiveRelationships === false,
    "FULLY ESTABLISHED SET HAS NO INCONCLUSIVE RELATIONSHIPS"
);

/*
 * CASE 2
 *
 * A-B independent
 * A-C inconclusive
 * B-C independent
 *
 * The system must never count all three as independent.
 */
const partiallyEstablished =
    engine.build(
        [
            "SOURCE-A",
            "SOURCE-B",
            "SOURCE-C"
        ],
        [
            pair(
                "SOURCE-A",
                "SOURCE-B",
                "INDEPENDENT"
            ),
            pair(
                "SOURCE-A",
                "SOURCE-C",
                "INCONCLUSIVE"
            ),
            pair(
                "SOURCE-B",
                "SOURCE-C",
                "INDEPENDENT"
            )
        ]
    );

assert(
    partiallyEstablished.establishedIndependentSources === 2,
    "INCONCLUSIVE RELATIONSHIP PREVENTS COUNTING THREE SOURCES"
);

assert(
    partiallyEstablished.fullyEstablished === false,
    "PARTIAL PAIRWISE INDEPENDENCE DOES NOT ESTABLISH COMPLETE SET"
);

assert(
    partiallyEstablished.hasInconclusiveRelationships === true,
    "PARTIAL SET RECORDS INCONCLUSIVE RELATIONSHIP"
);

/*
 * CASE 3
 *
 * A-B independent
 * A-C dependent
 * B-C independent
 *
 * Dependency also prevents a three-source independent set.
 */
const dependencyPresent =
    engine.build(
        [
            "SOURCE-A",
            "SOURCE-B",
            "SOURCE-C"
        ],
        [
            pair(
                "SOURCE-A",
                "SOURCE-B",
                "INDEPENDENT"
            ),
            pair(
                "SOURCE-A",
                "SOURCE-C",
                "DEPENDENT"
            ),
            pair(
                "SOURCE-B",
                "SOURCE-C",
                "INDEPENDENT"
            )
        ]
    );

assert(
    dependencyPresent.establishedIndependentSources === 2,
    "DEPENDENT PAIR PREVENTS COUNTING COMPLETE SET"
);

assert(
    dependencyPresent.fullyEstablished === false,
    "DEPENDENCY PREVENTS FULL INDEPENDENCE"
);

/*
 * CASE 4
 *
 * Four different sourceIds with no established pairwise
 * independence must not become four independent sources.
 */
const unknownRelationships =
    engine.build(
        [
            "SOURCE-A",
            "SOURCE-B",
            "SOURCE-C",
            "SOURCE-D"
        ],
        [
            pair(
                "SOURCE-A",
                "SOURCE-B",
                "INCONCLUSIVE"
            ),
            pair(
                "SOURCE-A",
                "SOURCE-C",
                "INCONCLUSIVE"
            ),
            pair(
                "SOURCE-A",
                "SOURCE-D",
                "INCONCLUSIVE"
            ),
            pair(
                "SOURCE-B",
                "SOURCE-C",
                "INCONCLUSIVE"
            ),
            pair(
                "SOURCE-B",
                "SOURCE-D",
                "INCONCLUSIVE"
            ),
            pair(
                "SOURCE-C",
                "SOURCE-D",
                "INCONCLUSIVE"
            )
        ]
    );

assert(
    unknownRelationships.establishedIndependentSources === 0,
    "FOUR DISTINCT SOURCE IDS DO NOT AUTOMATICALLY COUNT AS FOUR INDEPENDENT SOURCES"
);

assert(
    unknownRelationships.fullyEstablished === false,
    "UNKNOWN SOURCE RELATIONSHIPS DO NOT ESTABLISH INDEPENDENCE"
);

/*
 * CASE 5
 *
 * Duplicate source identities must not inflate the set.
 */
const duplicateSourceIds =
    engine.build(
        [
            "SOURCE-A",
            "SOURCE-A",
            "SOURCE-B"
        ],
        [
            pair(
                "SOURCE-A",
                "SOURCE-B",
                "INDEPENDENT"
            )
        ]
    );

assert(
    duplicateSourceIds.sourceIds.length === 2,
    "DUPLICATE SOURCE IDS ARE DEDUPLICATED"
);

assert(
    duplicateSourceIds.establishedIndependentSources === 2,
    "DUPLICATE SOURCE ID DOES NOT INFLATE INDEPENDENT SOURCE COUNT"
);

assert(
    duplicateSourceIds.fullyEstablished === true,
    "TWO UNIQUE EXPLICITLY INDEPENDENT SOURCES FORM COMPLETE SET"
);

/*
 * CASE 6
 *
 * One source alone does not establish source independence.
 */
const singleSource =
    engine.build(
        [
            "SOURCE-A"
        ],
        []
    );

assert(
    singleSource.establishedIndependentSources === 0,
    "SINGLE SOURCE DOES NOT ESTABLISH INDEPENDENT SOURCES"
);

assert(
    singleSource.fullyEstablished === false,
    "SINGLE SOURCE IS NOT A FULL INDEPENDENCE SET"
);

if (process.exitCode) {

    console.error(
        "\nPHASE 10.3G2 SOURCE INDEPENDENCE SET REGRESSION FAILED"
    );

    process.exit(
        process.exitCode
    );

}

console.log(
    "\nPHASE 10.3G2 SOURCE INDEPENDENCE SET REGRESSION PASSED"
);