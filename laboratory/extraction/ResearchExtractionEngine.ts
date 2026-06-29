import type { ResearchSource } from "../research-source/ResearchSource.js";
import type { ResearchExtraction } from "./ResearchExtraction.js";
import type { ResearchExtractionResult } from "./ResearchExtractionResult.js";

export class ResearchExtractionEngine {

    extract(source: ResearchSource): ResearchExtractionResult {

        try {

            const extraction: ResearchExtraction = {
                sourceId: source.sourceId,
                extractedAt: new Date().toISOString(),
                protocols: source.referencedProtocols,
                capabilities: source.referencedCapabilities,
                invariants: [],
                relationships: [],
                claims: [
                    {
                        claimId: `${source.sourceId}-CLAIM-0001`,
                        text: source.description ?? "No description provided.",
                        evidence: source.location ?? source.sourceId,
                        confidence: 100
                    }
                ]
            };

            return {
                sourceId: source.sourceId,
                success: true,
                extraction,
                errors: []
            };

        } catch (error) {

            return {
                sourceId: source.sourceId,
                success: false,
                errors: [
                    error instanceof Error
                        ? error.message
                        : "Unknown extraction error"
                ]
            };

        }

    }

}