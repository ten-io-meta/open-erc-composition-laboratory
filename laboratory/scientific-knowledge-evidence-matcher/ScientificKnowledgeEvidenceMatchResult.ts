import type {
    ScientificKnowledgeEvidenceMatch
} from "./ScientificKnowledgeEvidenceMatch.js";

export interface ScientificKnowledgeEvidenceMatchResult {

    generatedAt: string;

    campaignId: string;

    matches:
        ScientificKnowledgeEvidenceMatch[];

    statistics: {

        total: number;

        matched: number;

        ambiguous: number;

        unmatched: number;

        strengthenMatched: number;

        challengeMatched: number;

        holdMatched: number;

        sourceConclusionIdMatches: number;

        explicitKnowledgeIdMatches: number;

        exactCanonicalStatementMatches: number;

    };

    errors: string[];

}