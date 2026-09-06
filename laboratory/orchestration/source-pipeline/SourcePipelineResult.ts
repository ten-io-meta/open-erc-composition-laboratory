import type {
    ResearchPipeline
} from "../../pipeline/ResearchPipeline.js";

import type {
    SourceManifestLoader
} from "../../source-manifest/SourceManifestLoader.js";

import type {
    ResearchKnowledge
} from "../../research-knowledge/ResearchKnowledge.js";

import type {
    SemanticModel
} from "../../semantic-discovery/SemanticModel.js";

export type LoadedSourceManifest =
    Awaited<
        ReturnType<
            SourceManifestLoader["load"]
        >
    >;

export type EnabledResearchSource =
    ReturnType<
        SourceManifestLoader["enabledSources"]
    >[number];

export type SourceExecutionResult =
    Awaited<
        ReturnType<
            ResearchPipeline["run"]
        >
    >;

export interface AttributedSemanticModel {
    sourceId: string;

    model: SemanticModel;
}

export interface SourcePipelineResult {
    manifest:
        LoadedSourceManifest;

    sources:
        EnabledResearchSource[];

    sourceResults:
        SourceExecutionResult[];

    partialKnowledgeBases:
        ResearchKnowledge[];

    attributedSemanticModels:
        AttributedSemanticModel[];

    statistics: {
        configuredSources: number;

        enabledSources: number;

        executedSources: number;

        successfulSources: number;

        failedSources: number;

        partialKnowledgeBases: number;

        attributedSemanticModels: number;
    };

    errors: string[];
}