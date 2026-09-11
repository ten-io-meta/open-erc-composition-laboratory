import { mkdir, writeFile } from "fs/promises";

import { CorpusLoader } from "../laboratory/corpus/CorpusLoader.js";
import { CorpusBuilder } from "../laboratory/corpus/CorpusBuilder.js";
import type { ResearchCorpusEntry } from "../laboratory/corpus/ResearchCorpusEntry.js";

async function main() {

    console.log("");
    console.log("====================================");
    console.log("OECL V2 Research Corpus Engine");
    console.log("====================================");

    const analysisRoot = "./analysis-results";

    const loader = new CorpusLoader();
    const builder = new CorpusBuilder();

    const sourceIds = await loader.listAnalysisSources(analysisRoot);

    const entries: ResearchCorpusEntry[] = [];

    for (const sourceId of sourceIds) {

        try {

            const extraction = await loader.readJson(
                `${analysisRoot}/${sourceId}/extraction.json`
            );

            const supported = await loader.readJson(
                `${analysisRoot}/${sourceId}/supported-composability-evidence.json`
            );

            const claims = supported.claims ?? [];

            entries.push({
                sourceId,
                analysisPath: `${analysisRoot}/${sourceId}`,
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
                sourceId,
                analysisPath: `${analysisRoot}/${sourceId}`,
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

    const corpus = builder.build(entries);

    await mkdir("./corpus-results", { recursive: true });

    await writeFile(
        "./corpus-results/research-corpus.json",
        JSON.stringify(corpus, null, 4)
    );

    console.log("");
    console.log("Research Corpus");
    console.log("------------------------------");
    console.log(`Sources: ${corpus.statistics.sources}`);
    console.log(`Protocols: ${corpus.statistics.protocols}`);
    console.log(`Capabilities: ${corpus.statistics.capabilities}`);
    console.log(`Claims: ${corpus.statistics.claims}`);
    console.log(`Supported claims: ${corpus.statistics.supportedClaims}`);
    console.log(`Candidate claims: ${corpus.statistics.candidateClaims}`);
    console.log(`Inconclusive claims: ${corpus.statistics.inconclusiveClaims}`);

    console.log("");
    console.log("Research corpus exported:");
    console.log("./corpus-results/research-corpus.json");

    console.log("");
    console.log("Research Corpus finished.");

}

main();