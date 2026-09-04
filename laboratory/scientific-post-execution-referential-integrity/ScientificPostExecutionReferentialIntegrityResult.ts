import type {
    ScientificPostExecutionReferentialIntegrityIssue
} from "./ScientificPostExecutionReferentialIntegrity.js";


export interface ScientificPostExecutionReferentialIntegrityResult {

    generatedAt: string;

    campaignId: string;

    valid: boolean;

    issues:
        ScientificPostExecutionReferentialIntegrityIssue[];

    statistics: {

        executionEvidence: number;

        feedback: number;

        matches: number;

        assimilations: number;

        reconciledKnowledge: number;

        revisions: number;

        authorizations: number;

        transitions: number;

        brokenReferences: number;

        provenanceMismatches: number;

        epistemicMismatches: number;

        campaignMismatches: number;

        integrityScore: number;
    };

    errors: string[];
}