import type {
    ScientificReferentialIntegrityResult
} from "../scientific-referential-integrity/ScientificReferentialIntegrityResult.js";

import type {
    ScientificExecutionReferentialIntegrityResult
} from "../scientific-execution-referential-integrity/ScientificExecutionReferentialIntegrityResult.js";

import type {
    ScientificPostExecutionReferentialIntegrityResult
} from "../scientific-post-execution-referential-integrity/ScientificPostExecutionReferentialIntegrityResult.js";

import type {
    ScientificProvenanceClosureIssue
} from "./ScientificProvenanceClosure.js";

import type {
    ScientificProvenanceClosureResult
} from "./ScientificProvenanceClosureResult.js";

export class ScientificProvenanceClosureEngine {

    build(
        campaignId: string,
        knowledge:
            ScientificReferentialIntegrityResult,
        execution:
            ScientificExecutionReferentialIntegrityResult,
        postExecution:
            ScientificPostExecutionReferentialIntegrityResult
    ): ScientificProvenanceClosureResult {

        try {

            const generatedAt =
                new Date().toISOString();

            const issues:
                ScientificProvenanceClosureIssue[] = [];

            const addIssue = (
                issue:
                    ScientificProvenanceClosureIssue
            ): void => {

                issues.push(issue);

            };

            /*
             * ----------------------------------------------------
             * Campaign continuity.
             * ----------------------------------------------------
             */

            if (knowledge.campaignId !== campaignId) {

                addIssue({
                    status: "CAMPAIGN_MISMATCH",
                    domain: "KNOWLEDGE",
                    message:
                        `Knowledge integrity campaign ${knowledge.campaignId} ` +
                        `does not match ${campaignId}.`
                });

            }

            if (execution.campaignId !== campaignId) {

                addIssue({
                    status: "CAMPAIGN_MISMATCH",
                    domain: "EXECUTION",
                    message:
                        `Execution integrity campaign ${execution.campaignId} ` +
                        `does not match ${campaignId}.`
                });

            }

            if (postExecution.campaignId !== campaignId) {

                addIssue({
                    status: "CAMPAIGN_MISMATCH",
                    domain: "POST_EXECUTION",
                    message:
                        `Post-execution integrity campaign ${postExecution.campaignId} ` +
                        `does not match ${campaignId}.`
                });

            }

            /*
             * ----------------------------------------------------
             * Domain engine errors.
             * ----------------------------------------------------
             */

            if ((knowledge.errors ?? []).length > 0) {

                addIssue({
                    status: "DOMAIN_ERROR",
                    domain: "KNOWLEDGE",
                    message:
                        "Knowledge referential integrity contains engine errors."
                });

            }

            if ((execution.errors ?? []).length > 0) {

                addIssue({
                    status: "DOMAIN_ERROR",
                    domain: "EXECUTION",
                    message:
                        "Execution referential integrity contains engine errors."
                });

            }

            if ((postExecution.errors ?? []).length > 0) {

                addIssue({
                    status: "DOMAIN_ERROR",
                    domain: "POST_EXECUTION",
                    message:
                        "Post-execution referential integrity contains engine errors."
                });

            }

            /*
             * ----------------------------------------------------
             * Domain integrity.
             * ----------------------------------------------------
             */

            if (
                knowledge.statistics.invalidKnowledge > 0 ||
                knowledge.integrity.some(
                    item => !item.valid
                )
            ) {

                addIssue({
                    status: "INVALID_KNOWLEDGE_INTEGRITY",
                    domain: "KNOWLEDGE",
                    message:
                        "Knowledge provenance contains invalid referential integrity."
                });

            }

            if (!execution.valid) {

                addIssue({
                    status: "INVALID_EXECUTION_INTEGRITY",
                    domain: "EXECUTION",
                    message:
                        "Scientific execution provenance is not referentially valid."
                });

            }

            if (!postExecution.valid) {

                addIssue({
                    status: "INVALID_POST_EXECUTION_INTEGRITY",
                    domain: "POST_EXECUTION",
                    message:
                        "Scientific post-execution provenance is not referentially valid."
                });

            }

            /*
             * ----------------------------------------------------
             * Coverage.
             *
             * A perfect numeric score must not certify an empty
             * domain when the campaign actually produced scientific
             * material requiring provenance validation.
             * ----------------------------------------------------
             */

            if (
                knowledge.statistics.totalKnowledge === 0
            ) {

                addIssue({
                    status: "MISSING_KNOWLEDGE_COVERAGE",
                    domain: "KNOWLEDGE",
                    message:
                        "Knowledge provenance closure has no audited knowledge."
                });

            }

            if (
                execution.statistics.tasks === 0 ||
                execution.statistics.plans === 0 ||
                execution.statistics.specifications === 0 ||
                execution.statistics.runtimeExecutions === 0 ||
                execution.statistics.outcomes === 0 ||
                execution.statistics.observations === 0 ||
                execution.statistics.evidence === 0
            ) {

                addIssue({
                    status: "MISSING_EXECUTION_COVERAGE",
                    domain: "EXECUTION",
                    message:
                        "Execution provenance closure is missing one or more audited execution stages."
                });

            }

            if (
                postExecution.statistics.executionEvidence === 0 ||
                postExecution.statistics.feedback === 0 ||
                postExecution.statistics.matches === 0 ||
                postExecution.statistics.reconciledKnowledge === 0 ||
                postExecution.statistics.revisions === 0 ||
                postExecution.statistics.authorizations === 0 ||
                postExecution.statistics.transitions === 0
            ) {

                addIssue({
                    status: "MISSING_POST_EXECUTION_COVERAGE",
                    domain: "POST_EXECUTION",
                    message:
                        "Post-execution provenance closure is missing one or more audited epistemic stages."
                });

            }

            /*
             * Assimilation is intentionally not required to be
             * non-zero. A campaign may legitimately produce no
             * newly assimilated evidence.
             */

            const invalidDomainSet =
                new Set(
                    issues.map(
                        issue => issue.domain
                    )
                );

            const domains = 3;

            const invalidDomains =
                invalidDomainSet.size;

            const validDomains =
                domains - invalidDomains;

            const campaignMismatches =
                issues.filter(
                    issue =>
                        issue.status ===
                        "CAMPAIGN_MISMATCH"
                ).length;

            const domainErrors =
                issues.filter(
                    issue =>
                        issue.status ===
                        "DOMAIN_ERROR"
                ).length;

            const integrityFailures =
                issues.filter(
                    issue =>
                        issue.status ===
                            "INVALID_KNOWLEDGE_INTEGRITY" ||
                        issue.status ===
                            "INVALID_EXECUTION_INTEGRITY" ||
                        issue.status ===
                            "INVALID_POST_EXECUTION_INTEGRITY"
                ).length;

            const coverageFailures =
                issues.filter(
                    issue =>
                        issue.status ===
                            "MISSING_KNOWLEDGE_COVERAGE" ||
                        issue.status ===
                            "MISSING_EXECUTION_COVERAGE" ||
                        issue.status ===
                            "MISSING_POST_EXECUTION_COVERAGE"
                ).length;

            return {

                generatedAt,

                campaignId,

                valid:
                    issues.length === 0,

                issues,

                statistics: {

                    domains,

                    validDomains,

                    invalidDomains,

                    campaignMismatches,

                    domainErrors,

                    integrityFailures,

                    coverageFailures,

                    knowledgeIntegrityScore:
                        knowledge.statistics.integrityScore,

                    executionIntegrityScore:
                        execution.statistics.integrityScore,

                    postExecutionIntegrityScore:
                        postExecution.statistics.integrityScore,

                    closureScore:
                        validDomains / domains
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

                    domains: 3,

                    validDomains: 0,

                    invalidDomains: 3,

                    campaignMismatches: 0,

                    domainErrors: 1,

                    integrityFailures: 0,

                    coverageFailures: 0,

                    knowledgeIntegrityScore: 0,

                    executionIntegrityScore: 0,

                    postExecutionIntegrityScore: 0,

                    closureScore: 0
                },

                errors: [
                    error instanceof Error
                        ? error.message
                        : "Unknown scientific provenance closure error"
                ]

            };

        }

    }

}
