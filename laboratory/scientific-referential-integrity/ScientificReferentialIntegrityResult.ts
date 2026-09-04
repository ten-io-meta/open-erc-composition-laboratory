import type {
    ScientificReferentialIntegrity
} from "./ScientificReferentialIntegrity.js";

export interface ScientificReferentialIntegrityResult {

    generatedAt: string;

    campaignId: string;

    integrity:
        ScientificReferentialIntegrity[];

    statistics: {

        totalKnowledge: number;

        validKnowledge: number;

        invalidKnowledge: number;

        brokenConclusionReferences: number;

        brokenPatternReferences: number;

        conclusionPatternMismatches: number;

        relationMismatches: number;

        originTargetMismatches: number;

        duplicatedOrigins: number;

        integrityScore: number;
    };

    errors: string[];
}