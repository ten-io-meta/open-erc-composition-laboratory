import { GitHubRepositoryIngestor } from "../../laboratory/github-ingestion/GitHubRepositoryIngestor.js";
import { RepositoryScanner } from "../../laboratory/github-ingestion/RepositoryScanner.js";
import { RepositorySemanticExtractor } from "../../laboratory/github-ingestion/RepositorySemanticExtractor.js";
import { ResearchSourceExporter } from "../../laboratory/source-loader/ResearchSourceExporter.js";

async function main() {

    const repository = process.argv[2];

    if (!repository) {
        throw new Error(
            "Missing repository. Example: npx tsx scripts/ingestion/run-github-ingest.ts openzeppelin/openzeppelin-contracts"
        );
    }

    console.log("");
    console.log("====================================");
    console.log("OECL GitHub Ingestor");
    console.log("====================================");
    console.log(`Repository: ${repository}`);

    const ingestor = new GitHubRepositoryIngestor();

    const localPath = await ingestor.clone(repository);

    console.log(`Cloned to: ${localPath}`);

    const scanner = new RepositoryScanner();

    const scan = await scanner.scan(localPath);

    console.log(`Docs: ${scan.docs.length}`);
    console.log(`Contracts: ${scan.contracts.length}`);
    console.log(`Tests: ${scan.tests.length}`);

    const extractor = new RepositorySemanticExtractor();

    const normalizedSource = extractor.extract(
        repository,
        scan
    );

    const exporter = new ResearchSourceExporter();

    const exported = await exporter.export(normalizedSource);

    console.log("");
    console.log("Normalized source:");
    console.log(JSON.stringify(normalizedSource, null, 4));

    console.log("");
    console.log("Research source exported:");
    console.log(exported.sourcePath);

    console.log("Evidence exported:");
    console.log(exported.evidencePath);

}

main();