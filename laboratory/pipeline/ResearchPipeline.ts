import { HypothesisEngine } from "../hypothesis/HypothesisEngine.js";
import { HypothesisValidationEngine } from "../hypothesis/HypothesisValidationEngine.js";
import { KnowledgeEngine } from "../research-knowledge/KnowledgeEngine.js";
import { IncrementalKnowledgeEngine } from "../incremental-knowledge/IncrementalKnowledgeEngine.js";
import { mkdir, readFile, writeFile } from "fs/promises";

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

export class ResearchPipeline {

    async run(sourceId = "DOI-0001"): Promise<ResearchPipelineResult> {

        const executedAt = new Date().toISOString();
        const analysisPath = `./analysis-results/${sourceId}`;

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

            const source = await sourceLoader.load(`./sources/doi/${sourceId}.json`);
            const extractionResult = extractionEngine.extract(source);

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

            const composabilityEvidenceResult = composabilityEvidenceEngine.build(
                protocolSemanticResult,
                semanticReasoningResult
            );

            const benchmark = await readJson("./benchmark-results/benchmark.json");
            const matrix = await readJson("./matrix-results/composition-matrix.json");
            const patterns = await readJson("./pattern-results/patterns.json");

            const supportedComposabilityEvidenceResult = evidenceSupportEngine.build(
                composabilityEvidenceResult.claims,
                benchmark,
                matrix,
                patterns
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

            const sourceIds = await corpusLoader.listAnalysisSources("./analysis-results");
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

const hypothesisValidationEngine = new HypothesisValidationEngine();

const hypothesisValidationResult = hypothesisValidationEngine.validate(
    hypothesisResult,
    supportedComposabilityEvidenceResult
);

await mkdir("./hypothesis-validation-results", { recursive: true });

await writeFile(
    "./hypothesis-validation-results/DOI-0001-v2-validation.json",
    JSON.stringify(hypothesisValidationResult, null, 4)
);

const knowledgeEngine = new KnowledgeEngine();

const knowledgeResult = knowledgeEngine.build(
    learningResult,
    hypothesisValidationResult
);

await mkdir("./research-knowledge-results", { recursive: true });

await writeFile(
    "./research-knowledge-results/OECL-V2-RESEARCH-KNOWLEDGE.json",
    JSON.stringify(knowledgeResult, null, 4)
);
const incrementalEngine = new IncrementalKnowledgeEngine();

const persistentKnowledgePath =
    "./research-knowledge-results/OECL-V2-KNOWLEDGE-BASE.json";

let previousKnowledge = null;

try {
    previousKnowledge = await readJson(persistentKnowledgePath);
} catch {
    previousKnowledge = null;
}

const incrementalResult = incrementalEngine.build(
    previousKnowledge,
    knowledgeResult.knowledge
);

await writeFile(
    "./research-knowledge-results/OECL-V2-KNOWLEDGE-BASE.json",
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
            return {
                pipelineId: `PIPELINE-${sourceId}`,
                executedAt,
                sourceId,
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

incrementalKnowledgePath:
    "./research-knowledge-results/OECL-V2-KNOWLEDGE-BASE.json",

incrementalObservations:
    incrementalResult.knowledge.statistics.totalObservations,

errors: []
            };

        } catch (error) {
           return {
    pipelineId: `PIPELINE-${sourceId}`,
    executedAt,
    sourceId,
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

    errors: [
        error instanceof Error
            ? error.message
            : "Unknown OECL V2 pipeline error"
    ]
};
        }
    }
}