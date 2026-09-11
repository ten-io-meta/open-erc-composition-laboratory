import type {
    ScientificProvenanceClosureIssue
} from "./ScientificProvenanceClosure.js";

export interface ScientificProvenanceClosureResult {

    generatedAt: string;

    campaignId: string;

    valid: boolean;

    issues:
        ScientificProvenanceClosureIssue[];

    statistics: {

        domains: number;

        validDomains: number;

        invalidDomains: number;

        campaignMismatches: number;

        domainErrors: number;

        integrityFailures: number;

        coverageFailures: number;

        knowledgeIntegrityScore: number;

        executionIntegrityScore: number;

        postExecutionIntegrityScore: number;

        closureScore: number;
    };

    errors: string[];
}
