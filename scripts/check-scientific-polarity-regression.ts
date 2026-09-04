import { ScientificExecutionTargetResolverEngine } from
    "../laboratory/scientific-execution-target-resolution/ScientificExecutionTargetResolverEngine";


type ScientificPolarity =
    | "SUPPORT"
    | "CHALLENGE"
    | "NEUTRAL";


interface RelationCase {

    relation: string;

    subject: string;

    object: string;

    supportCue: string;

    challengeCue: string;

}


const relationCases: RelationCase[] = [

    {
        relation: "ENABLES",
        subject: "standardization",
        object: "interoperability",
        supportCue: "allowed",
        challengeCue: "blocked"
    },

    {
        relation: "DEPENDS_ON",
        subject: "settlement",
        object: "authorization",
        supportCue: "required",
        challengeCue: "independent"
    },

    {
        relation: "REQUIRES",
        subject: "execution",
        object: "authorization",
        supportCue: "required",
        challengeCue: "optional"
    },

    {
        relation: "CONSTRAINS",
        subject: "reservation",
        object: "accounting",
        supportCue: "locked",
        challengeCue: "bypassed"
    },

    {
        relation: "PRODUCES",
        subject: "execution",
        object: "receipt",
        supportCue: "generated",
        challengeCue: "missing"
    },

    {
        relation: "CONSUMES",
        subject: "settlement",
        object: "balance",
        supportCue: "deducted",
        challengeCue: "unchanged"
    },

    {
        relation: "SETTLES",
        subject: "escrow",
        object: "payment",
        supportCue: "finalized",
        challengeCue: "pending"
    },

    {
        relation: "PROTECTS",
        subject: "authorization",
        object: "accounting",
        supportCue: "protected",
        challengeCue: "vulnerable"
    },

    {
        relation: "VALIDATES",
        subject: "invariant",
        object: "accounting",
        supportCue: "verified",
        challengeCue: "invalid"
    },

    {
        relation: "ANCHORS",
        subject: "commitment",
        object: "state",
        supportCue: "linked",
        challengeCue: "detached"
    },

    {
        relation: "RESERVES",
        subject: "escrow",
        object: "balance",
        supportCue: "locked",
        challengeCue: "released"
    },

    {
        relation: "ACCOUNTS_FOR",
        subject: "ledger",
        object: "reservation",
        supportCue: "tracked",
        challengeCue: "untracked"
    }

];


const engine =
    Object.create(
        ScientificExecutionTargetResolverEngine.prototype
    ) as any;


const scientificPolarityFor =
    (
        task: any,
        target: any
    ): ScientificPolarity => {

        return engine.scientificPolarityFor(
            task,
            target
        );

    };
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

function makeTask(
    testCase: RelationCase
): any {

    return {

        targetId:
            `TEST-${testCase.relation}`,

        supportCondition:
            "",

        challengeCondition:
            "",

        sourcePatternRelation:
            (
                `${testCase.subject}:` +
                `${testCase.relation}:` +
                `${testCase.object}`
            )

    };

}


function makeTarget(
    testCase: RelationCase,
    cue: string
): any {

    return {

        type:
            "TEST",

        filePath:
            "test/ScientificPolarityRegression.test.ts",

        selector:
            (
                `${testCase.subject} ` +
                `${testCase.object} ` +
                `${cue}`
            ),

        framework:
            "HARDHAT",

        semanticContext:
            `
                const value = 1;

                // ${testCase.subject}
                // ${testCase.object}
                // ${cue}

                expect(value).to.equal(1);
            `

    };

}


function makeNeutralTarget(
    testCase: RelationCase
): any {

    return {

        type:
            "TEST",

        filePath:
            "test/ScientificPolarityRegression.test.ts",

        selector:
            (
                `${testCase.subject} ` +
                `${testCase.object} behavior`
            ),

        framework:
            "HARDHAT",

        semanticContext:
            `
                const value = 1;

                // ${testCase.subject}
                // ${testCase.object}

                expect(value).to.equal(1);
            `

    };

}


interface ResultRow {

    relation: string;

    expected: ScientificPolarity;

    actual: ScientificPolarity;

    passed: boolean;

}


const results: ResultRow[] = [];


for (
    const testCase
    of relationCases
) {

    const task =
        makeTask(
            testCase
        );


    const supportActual =
        scientificPolarityFor(
            task,
            makeTarget(
                testCase,
                testCase.supportCue
            )
        );


    results.push({

        relation:
            testCase.relation,

        expected:
            "SUPPORT",

        actual:
            supportActual,

        passed:
            supportActual === "SUPPORT"

    });


    const challengeActual =
        scientificPolarityFor(
            task,
            makeTarget(
                testCase,
                testCase.challengeCue
            )
        );


    results.push({

        relation:
            testCase.relation,

        expected:
            "CHALLENGE",

        actual:
            challengeActual,

        passed:
            challengeActual === "CHALLENGE"

    });


    const neutralActual =
        scientificPolarityFor(
            task,
            makeNeutralTarget(
                testCase
            )
        );


    results.push({

        relation:
            testCase.relation,

        expected:
            "NEUTRAL",

        actual:
            neutralActual,

        passed:
            neutralActual === "NEUTRAL"

    });

}


/*
 * Regression for the real negation shape that previously
 * caused "release" to look like challenge evidence.
 */

const negationTask = {

    targetId:
        "NEGATION-CONSTRAINS",

    supportCondition:
        "",

    challengeCondition:
        "",

    sourcePatternRelation:
        "RESERVATION:CONSTRAINS:ACCOUNTING"

};


const negationTarget = {

    type:
        "TEST",

    filePath:
        "test/ReservationAccounting.test.ts",

    selector:
        "settles escrow without releasing reserved accounting",

    framework:
        "HARDHAT",

    semanticContext:
        `
            const before =
                await lockedValue(account);

            await settleEscrow();

            const after =
                await lockedValue(account);

            expect(after).to.equal(before);
        `

};


const negationActual =
    scientificPolarityFor(
        negationTask,
        negationTarget
    );


results.push({

    relation:
        "CONSTRAINS_NEGATION",

    expected:
        "SUPPORT",

    actual:
        negationActual,

    passed:
        negationActual === "SUPPORT"

});
/*
 * Regression for a real repository release shape.
 *
 * A reservation is created and therefore locked during
 * setup. The test then performs a valid lifecycle release
 * and verifies that accounting returns the value from
 * locked to available.
 *
 * Releasing an obligation is not, by itself, evidence
 * that a CONSTRAINS relation has been challenged.
 *
 * The executable accounting assertions provide positive
 * evidence that the reservation/accounting constraint is
 * behaving correctly through the transition.
 */

const realReleaseSupportTask = {

    targetId:
        "REAL-RELEASE-CONSTRAINS",

    supportCondition:
        "",

    challengeCondition:
        "",

    sourcePatternRelation:
        "RESERVATION:CONSTRAINS:ACCOUNTING"

};


const realReleaseSupportTarget = {

    type:
        "TEST",

    filePath:
        "test/MinimalReservableEscrow.js",

    selector:
        "releases escrow back to available value",

    framework:
        "HARDHAT",

    semanticContext:
        `
            await reservable.approveReserve(
                TOKEN_ID,
                escrow.address,
                ETH_ASSET,
                ESCROW_AMOUNT
            );

            await escrow.createEscrow(
                TOKEN_ID,
                ETH_ASSET,
                ESCROW_AMOUNT,
                seller.address
            );

            await escrow.releaseEscrow(0);

            expect(
                (
                    await reservable.lockedValue(
                        TOKEN_ID,
                        ETH_ASSET
                    )
                ).toString()
            ).to.equal("0");

            expect(
                (
                    await reservable.availableValue(
                        TOKEN_ID,
                        ETH_ASSET
                    )
                ).toString()
            ).to.equal(
                ONE_ETH.toString()
            );
        `

};


const realReleaseSupportTrace =
    scientificPolarityTraceFor(
        realReleaseSupportTask,
        realReleaseSupportTarget
    );


const realReleaseSupportActual =
    realReleaseSupportTrace.polarity as
        ScientificPolarity;


results.push({

    relation:
        "CONSTRAINS_REAL_RELEASE_SUPPORT",

    expected:
        "SUPPORT",

    actual:
        realReleaseSupportActual,

    passed:
        realReleaseSupportActual ===
            "SUPPORT" &&
        realReleaseSupportTrace.decisionSource ===
            "RELATION_EVIDENCE" &&
        realReleaseSupportTrace.subjectMatched ===
            true &&
        realReleaseSupportTrace.objectMatched ===
            true &&
        realReleaseSupportTrace.hasExecutableAssertion ===
            true &&
        realReleaseSupportTrace.matchedSupportCues.includes(
            "locked"
        ) &&
        realReleaseSupportTrace.matchedChallengeCues.length ===
            0

});
/*
 * ==================================================
 * POLARITY CONFIDENCE REGRESSION
 * ==================================================
 */

interface ConfidenceResultRow {

    case:
        string;

    expected:
        string;

    actual:
        number | null;

    passed:
        boolean;

}


const confidenceResults:
    ConfidenceResultRow[] =
        [];


/*
 * RELATION_EVIDENCE:
 * complete relation evidence must produce
 * maximum polarity confidence.
 */

const relationConfidenceCase =
    relationCases.find(
        testCase =>
            testCase.relation ===
                "CONSTRAINS"
    )!;


const relationConfidenceTask =
    makeTask(
        relationConfidenceCase
    );


const relationConfidenceTrace =
    scientificPolarityTraceFor(
        relationConfidenceTask,
        makeTarget(
            relationConfidenceCase,
            relationConfidenceCase.supportCue
        )
    );


const relationConfidence =
    scientificPolarityConfidenceFor(
        relationConfidenceTrace
    );


confidenceResults.push({

    case:
        "RELATION_EVIDENCE",

    expected:
        "1",

    actual:
        relationConfidence,

    passed:
        relationConfidence ===
            1

});


/*
 * CONDITION_FALLBACK:
 * two distinctive support-condition tokens
 * produce the minimum accepted fallback
 * with no opposing score.
 */

const fallbackTask = {

    targetId:
        "CONFIDENCE-FALLBACK",

    supportCondition:
        "alpha beta",

    challengeCondition:
        "gamma delta",

    sourcePatternRelation:
        ""

};


const fallbackTarget = {

    type:
        "TEST",

    filePath:
        "test/ConfidenceFallback.test.ts",

    selector:
        "alpha beta behavior",

    framework:
        "HARDHAT",

    semanticContext:
        `
            alpha beta behavior
        `

};


const fallbackTrace =
    scientificPolarityTraceFor(
        fallbackTask,
        fallbackTarget
    );


const fallbackConfidence =
    scientificPolarityConfidenceFor(
        fallbackTrace
    );


confidenceResults.push({

    case:
        "CONDITION_FALLBACK",

    expected:
        "> 0 && <= 0.5",

    actual:
        fallbackConfidence,

    passed:
        fallbackTrace.decisionSource ===
            "CONDITION_FALLBACK" &&
        fallbackConfidence !==
            null &&
        fallbackConfidence >
            0 &&
        fallbackConfidence <=
            0.5

});


/*
 * NEUTRAL:
 * insufficient directional evidence must not
 * be converted into confidence in neutrality.
 */

const neutralConfidenceTrace =
    scientificPolarityTraceFor(
        relationConfidenceTask,
        makeNeutralTarget(
            relationConfidenceCase
        )
    );


const neutralConfidence =
    scientificPolarityConfidenceFor(
        neutralConfidenceTrace
    );


confidenceResults.push({

    case:
        "NEUTRAL",

    expected:
        "null",

    actual:
        neutralConfidence,

    passed:
        neutralConfidenceTrace.polarity ===
            "NEUTRAL" &&
        neutralConfidence ===
            null

});


console.log(
    ""
);


console.log(
    "POLARITY CONFIDENCE REGRESSION:"
);


console.table(
    confidenceResults
);

console.table(
    results
);


const failures =
    results.filter(
        result =>
            !result.passed
    );
const confidenceFailures =
    confidenceResults.filter(
        result =>
            !result.passed
    );

console.log(
    ""
);


console.log(
    `Total checks: ${results.length}`
);


console.log(
    `Passed: ${results.length - failures.length}`
);


console.log(
    `Failed: ${failures.length}`
);


if (
    failures.length > 0 ||
    confidenceFailures.length > 0
) {
    console.log(
        ""
    );


    console.log(
        "FAILED POLARITY REGRESSIONS:"
    );


    console.table(
        failures
    );

if (
    confidenceFailures.length > 0
) {

    console.log(
        ""
    );

    console.log(
        "FAILED POLARITY CONFIDENCE REGRESSIONS:"
    );

    console.table(
        confidenceFailures
    );

}
    process.exitCode =
        1;

} else {

    console.log(
        ""
    );


    console.log(
        "SCIENTIFIC POLARITY REGRESSION: PASS"
    );

}