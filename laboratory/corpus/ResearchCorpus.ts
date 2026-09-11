import type { ResearchCorpusEntry } from "./ResearchCorpusEntry.js";
import type { CorpusStatistics } from "./CorpusStatistics.js";

export interface ResearchCorpus {

    corpusId: string;

    generatedAt: string;

    entries: ResearchCorpusEntry[];

    statistics: CorpusStatistics;

}