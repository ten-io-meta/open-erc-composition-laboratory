import type { ResearchCorpus } from "./ResearchCorpus.js";

export interface CorpusResult {

    generatedAt: string;

    corpus: ResearchCorpus;

    errors: string[];

}