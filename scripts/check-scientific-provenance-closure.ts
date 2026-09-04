import {
    ScientificProvenanceClosureEngine
} from "../laboratory/scientific-provenance-closure/ScientificProvenanceClosureEngine.js";

import type {
    ScientificReferentialIntegrityResult
} from "../laboratory/scientific-referential-integrity/ScientificReferentialIntegrityResult.js";

import type {
    ScientificExecutionReferentialIntegrityResult
} from "../laboratory/scientific-execution-referential-integrity/ScientificExecutionReferentialIntegrityResult.js";

import type {
    ScientificPostExecutionReferentialIntegrityResult
} from "../laboratory/scientific-post-execution-referential-integrity/ScientificPostExecutionReferentialIntegrityResult.js";

const campaignId =
    "OECL-10.4I-CONTROLLED-CAMPAIGN";

const engine =
    new ScientificProvenanceClosureEngine();

function knowledgeResult():
    ScientificReferentialIntegrityResult {

    return {

        generatedAt:
            new Date().toISOString(),

        campaignId,

        integrity: [
            {
                integrityId:
                    "SCI-REFERENTIAL-INTEGRITY-00001",

                knowledgeId:
                    "KNOWLEDGE-001",

                sourceConclusionId:
                    "CONCLUSION-001",

                sourcePatternId:
                    "PATTERN-001",

                sourcePatternRelation:
                    "SUPPORTS",

                originTargetId:
                    "CONCLUSION:CONCLUSION-001",

                status:
                    "VALID",

                valid:
                    true,

                issues: [],

                explanation:
                    "Controlled valid knowledge provenance."
            }
        ],

        statistics: {

            totalKnowledge: 1,

            validKnowledge: 1,

            invalidKnowledge: 0,

            brokenConclusionReferences: 0,

            brokenPatternReferences: 0,

            conclusionPatternMismatches: 0,

            relationMismatches: 0,

            originTargetMismatches: 0,

            duplicatedOrigins: 0,

            integrityScore: 100
        },

        errors: []
    };

}

function executionResult():
    ScientificExecutionReferentialIntegrityResult {

    return {

        generatedAt:
            new Date().toISOString(),

        campaignId,

        valid: true,

        issues: [],

        statistics: {

            tasks: 1,

            plans: 1,

            specifications: 1,

            runtimeExecutions: 1,

            outcomes: 1,

            observations: 1,

            evidence: 1,

            brokenReferences: 0,

            scientificProvenanceMismatches: 0,

            executableTargetProvenanceMismatches: 0,

            integrityScore: 1
        },

        errors: []
    };

}

function postExecutionResult():
    ScientificPostExecutionReferentialIntegrityResult {

    return {

        generatedAt:
            new Date().toISOString(),

        campaignId,

        valid: true,

        issues: [],

        statistics: {

            executionEvidence: 1,

            feedback: 1,

            matches: 1,

            assimilations: 0,

            reconciledKnowledge: 1,

            revisions: 1,

            authorizations: 1,

            transitions: 1,

            brokenReferences: 0,

            provenanceMismatches: 0,

            epistemicMismatches: 0,

            campaignMismatches: 0,

            integrityScore: 1
        },

        errors: []
    };

}

function assert(
    condition: boolean,
    message: string
): void {

    if (!condition) {

        throw new Error(message);

    }

}

function hasStatus(
    result:
        ReturnType<
            ScientificProvenanceClosureEngine["build"]
        >,
    status: string
): boolean {

    return result.issues.some(
        issue =>
            issue.status === status
    );

}

/*
 * 1. Clean closure.
 */

{
    const result =
        engine.build(
            campaignId,
            knowledgeResult(),
            executionResult(),
            postExecutionResult()
        );

    assert(
        result.valid,
        "Clean provenance closure should be valid."
    );

    assert(
        result.issues.length === 0,
        "Clean provenance closure should contain no issues."
    );

    assert(
        result.statistics.validDomains === 3,
        "Clean provenance closure should validate all three domains."
    );

    assert(
        result.statistics.closureScore === 1,
        "Clean provenance closure score should be 1."
    );

    console.log(
        "PASS clean scientific provenance closure accepted"
    );
}

/*
 * 2. Cross-campaign knowledge result.
 */

{
    const knowledge =
        knowledgeResult();

    knowledge.campaignId =
        "OTHER-CAMPAIGN";

    const result =
        engine.build(
            campaignId,
            knowledge,
            executionResult(),
            postExecutionResult()
        );

    assert(
        !result.valid &&
        hasStatus(
            result,
            "CAMPAIGN_MISMATCH"
        ),
        "Knowledge campaign mismatch was not detected."
    );

    console.log(
        "PASS cross-campaign provenance detected"
    );
}

/*
 * 3. Invalid knowledge integrity.
 */

{
    const knowledge =
        knowledgeResult();

    knowledge.integrity[0].valid =
        false;

    knowledge.integrity[0].status =
        "BROKEN_PATTERN_REFERENCE";

    knowledge.integrity[0].issues = [
        "BROKEN_PATTERN_REFERENCE"
    ];

    knowledge.statistics.validKnowledge = 0;
    knowledge.statistics.invalidKnowledge = 1;
    knowledge.statistics.brokenPatternReferences = 1;
    knowledge.statistics.integrityScore = 0;

    const result =
        engine.build(
            campaignId,
            knowledge,
            executionResult(),
            postExecutionResult()
        );

    assert(
        !result.valid &&
        hasStatus(
            result,
            "INVALID_KNOWLEDGE_INTEGRITY"
        ),
        "Invalid knowledge integrity was not detected."
    );

    console.log(
        "PASS invalid knowledge provenance detected"
    );
}

/*
 * 4. Invalid execution integrity.
 */

{
    const execution =
        executionResult();

    execution.valid =
        false;

    execution.statistics.brokenReferences =
        1;

    execution.statistics.integrityScore =
        0;

    const result =
        engine.build(
            campaignId,
            knowledgeResult(),
            execution,
            postExecutionResult()
        );

    assert(
        !result.valid &&
        hasStatus(
            result,
            "INVALID_EXECUTION_INTEGRITY"
        ),
        "Invalid execution integrity was not detected."
    );

    console.log(
        "PASS invalid execution provenance detected"
    );
}

/*
 * 5. Invalid post-execution integrity.
 */

{
    const postExecution =
        postExecutionResult();

    postExecution.valid =
        false;

    postExecution.statistics.provenanceMismatches =
        1;

    postExecution.statistics.integrityScore =
        0;

    const result =
        engine.build(
            campaignId,
            knowledgeResult(),
            executionResult(),
            postExecution
        );

    assert(
        !result.valid &&
        hasStatus(
            result,
            "INVALID_POST_EXECUTION_INTEGRITY"
        ),
        "Invalid post-execution integrity was not detected."
    );

    console.log(
        "PASS invalid post-execution provenance detected"
    );
}

/*
 * 6. Empty knowledge coverage with a nominal score of 100.
 */

{
    const knowledge =
        knowledgeResult();

    knowledge.integrity = [];

    knowledge.statistics.totalKnowledge = 0;
    knowledge.statistics.validKnowledge = 0;
    knowledge.statistics.invalidKnowledge = 0;

    /*
     * This deliberately preserves the legacy engine's
     * empty-domain score of 100.
     */
    knowledge.statistics.integrityScore = 100;

    const result =
        engine.build(
            campaignId,
            knowledge,
            executionResult(),
            postExecutionResult()
        );

    assert(
        !result.valid &&
        hasStatus(
            result,
            "MISSING_KNOWLEDGE_COVERAGE"
        ),
        "Empty knowledge coverage with score 100 was not detected."
    );

    console.log(
        "PASS empty-domain perfect-score false positive rejected"
    );
}

console.log(
    "PASS scientific provenance closure controlled regression"
);
