import type { ResearchExtraction } from "../extraction/ResearchExtraction.js";
import type { ProtocolSemanticResult } from "./ProtocolSemanticResult.js";

import { ProtocolSemanticExtractor } from "./ProtocolSemanticExtractor.js";
import { ProtocolSemanticRegistry } from "./ProtocolSemanticRegistry.js";

export class ProtocolSemanticEngine {

    extract(extraction: ResearchExtraction): ProtocolSemanticResult {

        try {

            const extractor = new ProtocolSemanticExtractor();
            const registry = new ProtocolSemanticRegistry();

            const semantics = extractor.extract(extraction);

            registry.registerMany(semantics);

            return {
                sourceId: extraction.sourceId,
                extractedAt: new Date().toISOString(),
                semantics: registry.getAll(),
                errors: []
            };

        } catch (error) {

            return {
                sourceId: extraction.sourceId,
                extractedAt: new Date().toISOString(),
                semantics: [],
                errors: [
                    error instanceof Error
                        ? error.message
                        : "Unknown protocol semantic extraction error"
                ]
            };

        }

    }

}