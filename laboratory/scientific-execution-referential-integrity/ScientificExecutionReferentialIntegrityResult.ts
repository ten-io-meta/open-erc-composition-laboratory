import type {
    ScientificExecutionReferentialIntegrityIssue
} from "./ScientificExecutionReferentialIntegrity.js";

export interface ScientificExecutionReferentialIntegrityResult {

    generatedAt: string;

    campaignId: string;

    valid: boolean;

    issues:
        ScientificExecutionReferentialIntegrityIssue[];

    statistics: {

        tasks: number;

        plans: number;

        specifications: number;

        runtimeExecutions: number;

        outcomes: number;

        observations: number;

        evidence: number;

        brokenReferences: number;

        scientificProvenanceMismatches: number;

        executableTargetProvenanceMismatches: number;

        integrityScore: number;
    };

    errors: string[];
}
