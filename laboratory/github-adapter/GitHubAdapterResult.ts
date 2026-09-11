import type {
    GitHubRepositoryIntelligenceResult
} from "./GitHubRepositoryIntelligence.js";

import type {
    GitHubRepositoryMetadata
} from "./GitHubRepositoryMetadata.js";

import type {
    ScientificSourceObservation
} from "../scientific-source-observation/ScientificSourceObservation.js";

import type {
    ScientificSourceFact
} from "../scientific-source-fact/ScientificSourceFact.js";


export interface GitHubAdapterResult {

    generatedAt: string;

    repository:
        GitHubRepositoryMetadata;

    intelligence:
        GitHubRepositoryIntelligenceResult;

    sourceId: string;

    bundlePath: string;

    protocols: string[];

    capabilities: string[];

    claims: string[];

    sourceObservations:
        ScientificSourceObservation[];

    sourceFacts:
        ScientificSourceFact[];

    evidenceQuality: string;

    confidenceWeight: number;

    errors: string[];

}