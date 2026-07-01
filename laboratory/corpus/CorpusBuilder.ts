import type { ResearchCorpus } from "./ResearchCorpus.js";
import type { ResearchCorpusEntry } from "./ResearchCorpusEntry.js";

export class CorpusBuilder {

    build(entries: ResearchCorpusEntry[]): ResearchCorpus {

        const statistics = {
            sources: entries.length,
            protocols: entries.reduce((sum, entry) => sum + entry.protocols, 0),
            capabilities: entries.reduce((sum, entry) => sum + entry.capabilities, 0),
            claims: entries.reduce((sum, entry) => sum + entry.claims, 0),
            supportedClaims: entries.reduce((sum, entry) => sum + entry.supportedClaims, 0),
            candidateClaims: entries.reduce((sum, entry) => sum + entry.candidateClaims, 0),
            inconclusiveClaims: entries.reduce((sum, entry) => sum + entry.inconclusiveClaims, 0)
        };

        return {
            corpusId: `CORPUS-${new Date().toISOString()}`,
            generatedAt: new Date().toISOString(),
            entries,
            statistics
        };

    }

}