import {
    readFile
} from "fs/promises";

import {
    ResearchPipeline
} from "../../pipeline/ResearchPipeline.js";

import {
    SourceManifestLoader
} from "../../source-manifest/SourceManifestLoader.js";

import type {
    ResearchKnowledge
} from "../../research-knowledge/ResearchKnowledge.js";

import type {
    SourceExecutionResult,
    SourcePipelineResult
} from "./SourcePipelineResult.js";

export interface SourcePipelineOptions {

    manifestPath?: string;

    printSourceSummary?: boolean;

}

export class SourcePipeline {

    async run(
        options: SourcePipelineOptions = {}
    ): Promise<SourcePipelineResult> {

        const manifestPath =
            options.manifestPath ??
            "./sources/manifest.json";

        const printSourceSummary =
            options.printSourceSummary ??
            true;

        const errors: string[] = [];

        /*
         * Load source manifest
         */

        const manifestLoader =
            new SourceManifestLoader();

        const manifest =
            await manifestLoader.load(
                manifestPath
            );

        const sources =
            manifestLoader.enabledSources(
                manifest
            );

        /*
         * Execute enabled sources
         */

        const researchPipeline =
            new ResearchPipeline();

        const sourceResults:
            SourceExecutionResult[] = [];

        for (const source of sources) {

            if (printSourceSummary) {

                console.log("");
                console.log("------------------------------------");

                console.log(
                    `Running source: ${source.sourceId}`
                );

                console.log("------------------------------------");

            }

            try {

                const result =
                    await researchPipeline.run(
                        source.sourceId,
                        source.path,
                        source.evidencePath
                    );

                sourceResults.push(
                    result
                );

                if (printSourceSummary) {

                    this.printResult(
                        result
                    );

                }

            } catch (error) {

                const message =
                    error instanceof Error
                        ? error.message
                        : "Unknown source execution error";

                errors.push(
                    `${source.sourceId}: ${message}`
                );

                console.error("");
                console.error(
                    `Source failed: ${source.sourceId}`
                );

                console.error(
                    message
                );

            }

        }

        /*
         * Load partial knowledge produced
         * by successful source executions
         */

        const partialKnowledgeBases:
            ResearchKnowledge[] = [];

        for (const result of sourceResults) {

            if (
                !result.partialKnowledgePath ||
                result.errors.length > 0
            ) {
                continue;
            }

            try {

                const content =
                    await readFile(
                        result.partialKnowledgePath,
                        "utf8"
                    );

                const partialKnowledge =
                    JSON.parse(
                        content
                    ) as ResearchKnowledge;

                partialKnowledgeBases.push(
                    partialKnowledge
                );

            } catch (error) {

                const message =
                    error instanceof Error
                        ? error.message
                        : "Unknown partial knowledge loading error";

                errors.push(
                    `${result.sourceId}: ${message}`
                );

            }

        }

        const successfulSources =
            sourceResults.filter(
                result =>
                    result.errors.length === 0
            ).length;

        const failedSources =
            sources.length -
            successfulSources;

        return {

            manifest,

            sources,

            sourceResults,

            partialKnowledgeBases,

            statistics: {

                configuredSources:
                    manifest.sources.length,

                enabledSources:
                    sources.length,

                executedSources:
                    sourceResults.length,

                successfulSources,

                failedSources,

                partialKnowledgeBases:
                    partialKnowledgeBases.length

            },

            errors

        };

    }

    private printResult(
        result: SourceExecutionResult
    ): void {

        console.log("");

        console.log(
            `Source: ${result.sourceId}`
        );

        console.log(
            `Protocols: ${result.protocols}`
        );

        console.log(
            `Capabilities: ${result.capabilities}`
        );

        console.log(
            `Claims: ${result.claims}`
        );

        console.log(
            `Candidate claims: ${result.candidateClaims}`
        );

        console.log(
            `Inconclusive claims: ${result.inconclusiveClaims}`
        );

        console.log(
            `Knowledge entries: ${result.knowledgeEntries}`
        );

        console.log(
            `Supported knowledge: ${result.supportedKnowledge}`
        );

        console.log(
            `Emerging knowledge: ${result.emergingKnowledge}`
        );

        console.log(
            `Incremental observations: ${result.incrementalObservations}`
        );

        console.log(
            `Memory events: ${result.memoryEvents}`
        );

        console.log(
            `Research memory: ${result.memoryPath}`
        );

        if (result.errors.length > 0) {

            console.log(
                `Source errors: ${result.errors.length}`
            );

            for (const error of result.errors) {

                console.log(
                    `- ${error}`
                );

            }

        }

    }

}