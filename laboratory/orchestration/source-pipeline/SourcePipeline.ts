import {
    readFile
} from "fs/promises";

import {
    dirname,
    join
} from "node:path";

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
    SemanticDiscoveryResult
} from "../../semantic-discovery/SemanticDiscoveryResult.js";

import {
    ScientificSemanticDerivationEngine
} from "../../scientific-semantic-derivation/ScientificSemanticDerivationEngine.js";

import type {
    ScientificSourceFact
} from "../../scientific-source-fact/ScientificSourceFact.js";

import type {
    AttributedSemanticModel,
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
         * by successful source executions.
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

        /*
         * Load each source's semantic model while preserving
         * the source identity that produced it.
         */
        const attributedSemanticModels:
            AttributedSemanticModel[] = [];

        const scientificSemanticDerivationEngine =
            new ScientificSemanticDerivationEngine();


        for (
            const result
            of sourceResults
        ) {

            if (
                !result.analysisPath ||
                result.errors.length > 0
            ) {

                continue;

            }


            const sourceEntry =
                sources.find(
                    source =>
                        source.sourceId ===
                        result.sourceId
                );


            if (
                !sourceEntry
            ) {

                errors.push(
                    `${result.sourceId}: source manifest entry not found for semantic attribution`
                );

                continue;

            }


            const scientificFactsPath =
                join(
                    dirname(
                        sourceEntry.path
                    ),
                    "scientific-source-facts.json"
                );


            try {

                const content =
                    await readFile(
                        scientificFactsPath,
                        "utf8"
                    );

                const parsed =
                    JSON.parse(
                        content
                    );


                if (
                    !Array.isArray(
                        parsed
                    )
                ) {

                    throw new Error(
                        "Scientific source facts artifact must contain an array."
                    );

                }


                const scientificFacts =
                    parsed as ScientificSourceFact[];


                const scientificSemanticResult =
                    scientificSemanticDerivationEngine.derive({

                        sourceId:
                            result.sourceId,

                        sourceRevision:
                            result.sourceRevision,

                        facts:
                            scientificFacts

                    });


                if (
                    scientificSemanticResult.errors.length >
                    0
                ) {

                    errors.push(
                        ...scientificSemanticResult.errors.map(
                            message =>
                                `${result.sourceId}: ${message}`
                        )
                    );

                    continue;

                }


                attributedSemanticModels.push({

                    sourceId:
                        result.sourceId,

                    sourceRevision:
                        result.sourceRevision,

                    model:
                        scientificSemanticResult.model

                });


                continue;

            } catch (error) {

                const isMissingScientificFacts =
                    typeof error ===
                        "object" &&
                    error !==
                        null &&
                    "code" in
                        error &&
                    (
                        error as {
                            code?:
                                string;
                        }
                    ).code ===
                        "ENOENT";


                if (
                    !isMissingScientificFacts
                ) {

                    const message =
                        error instanceof Error
                            ? error.message
                            : "Unknown scientific semantic derivation error";

                    errors.push(
                        `${result.sourceId}: ${message}`
                    );

                    continue;

                }

            }


            /*
             * Legacy semantic-model.json is permitted only when
             * scientific-source-facts.json does not exist.
             */

            try {

                const content =
                    await readFile(
                        `${result.analysisPath}/semantic-model.json`,
                        "utf8"
                    );

                const semanticDiscoveryResult =
                    JSON.parse(
                        content
                    ) as SemanticDiscoveryResult;


                attributedSemanticModels.push({

                    sourceId:
                        result.sourceId,

                    sourceRevision:
                        result.sourceRevision,

                    model:
                        semanticDiscoveryResult.model

                });

            } catch (error) {

                const message =
                    error instanceof Error
                        ? error.message
                        : "Unknown semantic model loading error";

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

            attributedSemanticModels,

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
                    partialKnowledgeBases.length,

                attributedSemanticModels:
                    attributedSemanticModels.length
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