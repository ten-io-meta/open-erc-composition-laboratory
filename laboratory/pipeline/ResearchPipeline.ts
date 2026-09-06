import { MachineReasoningEngine } from "../machine-reasoning/MachineReasoningEngine.js";
import { GitHubResearchAdapter } from "../research-source-adapter/GitHubResearchAdapter.js";
import { EvidenceProfileLoader } from "../evidence-profile/EvidenceProfileLoader.js";
import { HypothesisEngine } from "../hypothesis/HypothesisEngine.js";
import { HypothesisDiscoveryEngine } from "../hypothesis-discovery/HypothesisDiscoveryEngine.js";
import { HypothesisMergeEngine } from "../hypothesis-discovery/HypothesisMergeEngine.js";
import { HypothesisValidationEngine } from "../hypothesis/HypothesisValidationEngine.js";
import { KnowledgeEngine } from "../research-knowledge/KnowledgeEngine.js";
import { IncrementalKnowledgeEngine } from "../incremental-knowledge/IncrementalKnowledgeEngine.js";
import { ResearchMemoryEngine } from "../research-memory/ResearchMemoryEngine.js";
import { ResearchMemoryLoader } from "../research-memory/ResearchMemoryLoader.js";
import { mkdir, readFile, writeFile } from "fs/promises";
import { KnowledgeIntegrationEngine } from "../knowledge-integration/KnowledgeIntegrationEngine.js";
import { ResearchKnowledgeAggregator } from "../knowledge-integration/ResearchKnowledgeAggregator.js";

import { ResearchSourceLoader } from "../research-source/ResearchSourceLoader.js";
import { ResearchExtractionEngine } from "../extraction/ResearchExtractionEngine.js";
import { ProtocolSemanticEngine } from "../protocol-semantics/ProtocolSemanticEngine.js";
import { KnowledgeGraphBuilder } from "../knowledge-graph/KnowledgeGraphBuilder.js";
import { DiscoveryEngine } from "../discovery/DiscoveryEngine.js";
import { SemanticDiscoveryEngine } from "../semantic-discovery/SemanticDiscoveryEngine.js";
import { SemanticReasoningEngine } from "../reasoning/SemanticReasoningEngine.js";
import { ComposabilityEvidenceEngine } from "../composability-evidence/ComposabilityEvidenceEngine.js";
import { EvidenceSupportEngine } from "../evidence-support/EvidenceSupportEngine.js";
import { CorpusLoader } from "../corpus/CorpusLoader.js";
import { CorpusBuilder } from "../corpus/CorpusBuilder.js";
import { CompositionLearningEngine } from "../composition-learning/CompositionLearningEngine.js";

import type { ResearchPipelineResult } from "./ResearchPipelineResult.js";
import type { ResearchCorpusEntry } from "../corpus/ResearchCorpusEntry.js";

async function readJson(path: string): Promise<any> {
    return JSON.parse(await readFile(path, "utf8"));
}

export interface ResearchPipelineOptions {

    historicalStateMode?:
        | "ISOLATED"
        | "PERSISTENT";

}

export class ResearchPipeline {

    async run(
    sourceId = "DOI-0001",
    sourcePath = `./sources/research/${sourceId}/source.json`,
    evidencePath = `./sources/research/${sourceId}/evidence.json`,
    options: ResearchPipelineOptions = {}
): Promise<ResearchPipelineResult> {

        const executedAt = new Date().toISOString();
        const analysisPath = `./analysis-results/${sourceId}`;

        const historicalStateMode =
            options.historicalStateMode ?? "ISOLATED";

        let sourceRevision:
            string | undefined;

        try {
            const sourceLoader = new ResearchSourceLoader();
            const extractionEngine = new ResearchExtractionEngine();
            const protocolSemanticEngine = new ProtocolSemanticEngine();
            const graphBuilder = new KnowledgeGraphBuilder();
            const discoveryEngine = new DiscoveryEngine();
            const semanticDiscoveryEngine = new SemanticDiscoveryEngine();
            const semanticReasoningEngine = new SemanticReasoningEngine();
            const composabilityEvidenceEngine = new ComposabilityEvidenceEngine();
            const evidenceSupportEngine = new EvidenceSupportEngine();
const machineReasoningEngine = new MachineReasoningEngine();
            const source =
                await sourceLoader.load(
                    sourcePath
                );

            sourceRevision =
                source.commitSha ??
                source.commit;

const githubAdapter = new GitHubResearchAdapter();

const sourceBundle = source as any;

const adaptedSource = githubAdapter.adapt(sourceBundle);

const extractionResult = githubAdapter.supports(sourceBundle)
    ? {
        success: true,
        extraction: {
            sourceId,
            extractedAt: new Date().toISOString(),

            protocols:
                adaptedSource.protocols,

            capabilities:
                adaptedSource.capabilities,

            claims:
                adaptedSource.claims.map(
                    (claim: string, index: number) => ({
                        claimId:
                            `GITHUB-CLAIM-${String(index + 1).padStart(5, "0")}`,
                        text:
                            claim,
                        evidence:
                            sourceId,
                        confidence:
                            70
                    })
                ),

            invariants:
                [],

            relationships:
                (adaptedSource.compositionSignals ?? []).map(
                    (signal, index) => ({
                        relationshipId:
                            `GITHUB-REL-${String(index + 1).padStart(5, "0")}`,
                        fromCapability:
                            signal.fromCapability,
                        toCapability:
                            signal.toCapability,
                        relation:
                            signal.relation,
                        reason:
                            signal.reason,
                        evidence:
                            sourceId,
                        confidence:
                            70
                    })
                ) as any,

            errors:
                []
        },
        errors: []
    }
    : extractionEngine.extract(source);

if (!extractionResult.success || !extractionResult.extraction) {
    throw new Error("Research extraction failed.");
}

            const protocolSemanticResult = protocolSemanticEngine.extract(
                extractionResult.extraction
            );

            const graph = graphBuilder.build(
                extractionResult.extraction,
                protocolSemanticResult
            );

            const discoveryResult = discoveryEngine.discover(graph);
            const semanticDiscoveryResult = semanticDiscoveryEngine.discover(graph);

            const semanticReasoningResult = semanticReasoningEngine.reason(
                semanticDiscoveryResult
            );
const machineReasoningResult =
    machineReasoningEngine.reason(
        sourceId,
        extractionResult.extraction
    );
           const composabilityEvidenceResult = composabilityEvidenceEngine.build(
    protocolSemanticResult,
    semanticReasoningResult,
    extractionResult.extraction
);

            const supportedComposabilityEvidenceResult = evidenceSupportEngine.build(
                composabilityEvidenceResult.claims
            );

            await mkdir(analysisPath, { recursive: true });

            await writeFile(`${analysisPath}/extraction.json`, JSON.stringify(extractionResult, null, 4));
            await writeFile(`${analysisPath}/protocol-semantics.json`, JSON.stringify(protocolSemanticResult, null, 4));
            await writeFile(`${analysisPath}/graph.json`, JSON.stringify(graph, null, 4));
            await writeFile(`${analysisPath}/findings.json`, JSON.stringify(discoveryResult, null, 4));
            await writeFile(`${analysisPath}/semantic-model.json`, JSON.stringify(semanticDiscoveryResult, null, 4));
            await writeFile(`${analysisPath}/reasoning.json`, JSON.stringify(semanticReasoningResult, null, 4));
            await writeFile(`${analysisPath}/composability-evidence.json`, JSON.stringify(composabilityEvidenceResult, null, 4));
            await writeFile(`${analysisPath}/supported-composability-evidence.json`, JSON.stringify(supportedComposabilityEvidenceResult, null, 4));

            const corpusLoader = new CorpusLoader();
            const corpusBuilder = new CorpusBuilder();

            const sourceIds =

                historicalStateMode === "PERSISTENT"

                    ? await corpusLoader.listAnalysisSources("./analysis-results")

                    : [sourceId];
            const entries: ResearchCorpusEntry[] = [];

            for (const currentSourceId of sourceIds) {
                try {
                    const extraction = await corpusLoader.readJson(
                        `./analysis-results/${currentSourceId}/extraction.json`
                    );

                    const supported = await corpusLoader.readJson(
                        `./analysis-results/${currentSourceId}/supported-composability-evidence.json`
                    );

                    const claims = supported.claims ?? [];

                    entries.push({
                        sourceId: currentSourceId,
                        analysisPath: `./analysis-results/${currentSourceId}`,
                        protocols: extraction.extraction?.protocols?.length ?? 0,
                        capabilities: extraction.extraction?.capabilities?.length ?? 0,
                        claims: claims.length,
                        supportedClaims: claims.filter((claim: any) => claim.status === "SUPPORTED").length,
                        candidateClaims: claims.filter((claim: any) => claim.status === "CANDIDATE").length,
                        inconclusiveClaims: claims.filter((claim: any) => claim.status === "INCONCLUSIVE").length,
                        status: "ANALYZED"
                    });
                } catch {
                    entries.push({
                        sourceId: currentSourceId,
                        analysisPath: `./analysis-results/${currentSourceId}`,
                        protocols: 0,
                        capabilities: 0,
                        claims: 0,
                        supportedClaims: 0,
                        candidateClaims: 0,
                        inconclusiveClaims: 0,
                        status: "FAILED"
                    });
                }
            }

            const corpus = corpusBuilder.build(entries);

            await mkdir("./corpus-results", { recursive: true });
            await writeFile(
                "./corpus-results/research-corpus.json",
                JSON.stringify(corpus, null, 4)
            );

            const learningEngine = new CompositionLearningEngine();
            const learningResult = learningEngine.learn(
                supportedComposabilityEvidenceResult.claims
            );

            await mkdir("./composition-learning-results", { recursive: true });
            await writeFile(
                "./composition-learning-results/DOI-0001-composition-learning.json",
                JSON.stringify(learningResult, null, 4)
            );
const hypothesisEngine = new HypothesisEngine();

const hypothesisResult = hypothesisEngine.generate(
    learningResult
);

await mkdir("./hypothesis-results", { recursive: true });

await writeFile(
    "./hypothesis-results/DOI-0001-hypotheses.json",
    JSON.stringify(hypothesisResult, null, 4)
);
const knowledgeEngine = new KnowledgeEngine();

const preliminaryKnowledgeResult = knowledgeEngine.build(
    learningResult,
    {
        validatedAt: new Date().toISOString(),
        validations: [],
        errors: []
    },
    machineReasoningResult,
    sourceId
);

const hypothesisDiscoveryEngine = new HypothesisDiscoveryEngine();

const derivedHypotheses = hypothesisDiscoveryEngine.discover(
    preliminaryKnowledgeResult.knowledge,
    hypothesisResult.hypotheses.length
);

const hypothesisMergeEngine = new HypothesisMergeEngine();

const mergedHypothesisResult = hypothesisMergeEngine.merge(
    hypothesisResult,
    derivedHypotheses
);

await writeFile(
    "./hypothesis-results/OECL-V2-MERGED-HYPOTHESES.json",
    JSON.stringify(mergedHypothesisResult, null, 4)
);

const hypothesisValidationEngine = new HypothesisValidationEngine();

const hypothesisValidationResult = hypothesisValidationEngine.validate(
    mergedHypothesisResult,
    supportedComposabilityEvidenceResult
);

await mkdir("./hypothesis-validation-results", { recursive: true });

await writeFile(
    "./hypothesis-validation-results/DOI-0001-v2-validation.json",
    JSON.stringify(hypothesisValidationResult, null, 4)
);

const knowledgeResult = knowledgeEngine.build(
    learningResult,
    hypothesisValidationResult,
    machineReasoningResult,
    sourceId
);

const evidenceProfileLoader = new EvidenceProfileLoader();

const evidenceProfile = await evidenceProfileLoader.load(evidencePath);

const weightedEntries = knowledgeResult.knowledge.entries.map(entry => ({
    ...entry,
    averageConfidence: Math.min(
        100,
        Math.round(entry.averageConfidence * evidenceProfile.confidenceWeight)
    ),
    evidence: [
        ...entry.evidence,
        `evidence-profile:${evidenceProfile.sourceId}:${evidenceProfile.quality}`
    ]
}));

knowledgeResult.knowledge.entries = weightedEntries;

knowledgeResult.knowledge.statistics = {
    ...knowledgeResult.knowledge.statistics,
    emerging: weightedEntries.filter(entry => entry.status === "EMERGING").length,
    supported: weightedEntries.filter(entry => entry.status === "SUPPORTED").length,
    validated: weightedEntries.filter(entry => entry.status === "VALIDATED").length,
    canonical: weightedEntries.filter(entry => entry.status === "CANONICAL").length,
    rejected: weightedEntries.filter(entry => entry.status === "REJECTED").length
};

await mkdir("./research-knowledge-results", { recursive: true });

await writeFile(
    "./research-knowledge-results/OECL-V2-RESEARCH-KNOWLEDGE.json",
    JSON.stringify(knowledgeResult, null, 4)
);
knowledgeResult.knowledge.processedSources = [
    {
        sourceId,
        processedAt: new Date().toISOString()
    }
];
await writeFile(
    `${analysisPath}/research-knowledge.json`,
    JSON.stringify(
        knowledgeResult.knowledge,
        null,
        4
    )
);
await writeFile(
    `${analysisPath}/machine-reasoning.json`,
    JSON.stringify(machineReasoningResult, null, 4)
);
            let incrementalKnowledgePath = "";
            let incrementalObservations = 0;

            let memoryPath = "";
            let memoryEvents = 0;

            if (
                historicalStateMode === "PERSISTENT"
            ) {

                const incrementalEngine =
                    new IncrementalKnowledgeEngine();

                const persistentKnowledgePath =
                    "./research-knowledge-results/OECL-V2-KNOWLEDGE-BASE.json";

                let previousKnowledge = null;

                try {

                    previousKnowledge =
                        await readJson(
                            persistentKnowledgePath
                        );

                } catch {

                    previousKnowledge =
                        null;

                }

                const incrementalResult =
                    incrementalEngine.build(
                        previousKnowledge,
                        knowledgeResult.knowledge,
                        sourceId
                    );

                await writeFile(
                    persistentKnowledgePath,
                    JSON.stringify(
                        incrementalResult.knowledge,
                        null,
                        4
                    )
                );

                await writeFile(
                    "./research-knowledge-results/OECL-V2-INCREMENTAL-KNOWLEDGE.json",
                    JSON.stringify(
                        incrementalResult,
                        null,
                        4
                    )
                );

                incrementalKnowledgePath =
                    persistentKnowledgePath;

                incrementalObservations =
                    incrementalResult
                        .knowledge
                        .statistics
                        .totalObservations;

                const persistentMemoryPath =
                    "./research-memory-results/OECL-V2-RESEARCH-MEMORY.json";

                const memoryLoader =
                    new ResearchMemoryLoader();

                const previousMemory =
                    await memoryLoader.load(
                        persistentMemoryPath
                    );

                const memoryEngine =
                    new ResearchMemoryEngine();

                const memoryResult =
                    memoryEngine.update(
                        previousMemory,
                        knowledgeResult.knowledge,
                        sourceId
                    );

                await mkdir(
                    "./research-memory-results",
                    {
                        recursive: true
                    }
                );

                await writeFile(
                    persistentMemoryPath,
                    JSON.stringify(
                        memoryResult.memory,
                        null,
                        4
                    )
                );

                await writeFile(
                    "./research-memory-results/OECL-V2-RESEARCH-MEMORY-RESULT.json",
                    JSON.stringify(
                        memoryResult,
                        null,
                        4
                    )
                );

                memoryPath =
                    persistentMemoryPath;

                memoryEvents =
                    memoryResult
                        .memory
                        .statistics
                        .events;

                const knowledgeAggregator =
                    new ResearchKnowledgeAggregator();

                const aggregatedKnowledge =
                    await knowledgeAggregator.aggregate();

                await writeFile(
                    "./research-knowledge-results/OECL-V2-AGGREGATED-KNOWLEDGE.json",
                    JSON.stringify(
                        aggregatedKnowledge,
                        null,
                        4
                    )
                );
            }
            return {
                pipelineId: `PIPELINE-${sourceId}`,
                executedAt,
                historicalStateMode,
                sourceId,
                sourceRevision,

                analysisPath,
                corpusPath: "./corpus-results/research-corpus.json",
                learningPath: "./composition-learning-results/DOI-0001-composition-learning.json",
knowledgePath: "./research-knowledge-results/OECL-V2-RESEARCH-KNOWLEDGE.json",

protocols: extractionResult.extraction.protocols.length,
                capabilities: extractionResult.extraction.capabilities.length,
                claims: supportedComposabilityEvidenceResult.claims.length,
                candidateClaims: supportedComposabilityEvidenceResult.claims.filter(
                    claim => claim.status === "CANDIDATE"
                ).length,
                inconclusiveClaims: supportedComposabilityEvidenceResult.claims.filter(
                    claim => claim.status === "INCONCLUSIVE"
                ).length,
                knowledgeEntries:
    knowledgeResult.knowledge.statistics.entries,

supportedKnowledge:
    knowledgeResult.knowledge.statistics.supported,

emergingKnowledge:
    knowledgeResult.knowledge.statistics.emerging,

incrementalKnowledgePath,

incrementalObservations,
    memoryPath,

memoryEvents,
    partialKnowledgePath:
    `${analysisPath}/research-knowledge.json`,

errors: []
            };

        } catch (error) {
           return {
    pipelineId: `PIPELINE-${sourceId}`,
    executedAt,
    historicalStateMode,
    sourceId,
                sourceRevision,

    analysisPath,
    corpusPath: "./corpus-results/research-corpus.json",
    learningPath: "./composition-learning-results/DOI-0001-composition-learning.json",
    knowledgePath: "./research-knowledge-results/OECL-V2-RESEARCH-KNOWLEDGE.json",

    protocols: 0,
    capabilities: 0,
    claims: 0,
    candidateClaims: 0,
    inconclusiveClaims: 0,

    knowledgeEntries: 0,
    supportedKnowledge: 0,
    emergingKnowledge: 0,

    incrementalKnowledgePath: "",

    incrementalObservations: 0,
    memoryPath: "",

memoryEvents: 0,
partialKnowledgePath: "",
    errors: [
        error instanceof Error
            ? error.message
            : "Unknown OECL V2 pipeline error"
    ]
};
        }
    }
}
