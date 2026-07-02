import { mkdir, writeFile } from "fs/promises";

import { GitHubAdapter } from "../laboratory/github-adapter/GitHubAdapter.js";

async function main() {
    console.log("");
    console.log("====================================");
    console.log("OECL V2 GitHub Semantic Adapter");
    console.log("====================================");

    const adapter = new GitHubAdapter();

    const result = await adapter.run({
        owner: "ten-io-meta",
        repo: "erc8060-reservable",
        forceFresh: false
    });

    await mkdir("./github-adapter-results", { recursive: true });

    await writeFile(
        "./github-adapter-results/GITHUB-ERC8060-RESERVABLE.json",
        JSON.stringify(result, null, 4)
    );

    console.log("");
    console.log("GitHub Adapter Result");
    console.log("------------------------------");
    console.log(`Source: ${result.sourceId}`);
    console.log(`Repository: ${result.repository.owner}/${result.repository.repo}`);
    console.log(`Protocols: ${result.protocols.length}`);
    console.log(`Capabilities: ${result.capabilities.length}`);
    console.log(`Claims: ${result.claims.length}`);
    console.log(`Evidence quality: ${result.evidenceQuality}`);
    console.log(`Confidence weight: ${result.confidenceWeight}`);
    console.log(`Bundle path: ${result.bundlePath}`);

    if (result.errors.length > 0) {
        console.log("");
        console.log("Errors:");
        for (const error of result.errors) {
            console.log(`- ${error}`);
        }
    }

    console.log("");
    console.log("GitHub semantic adapter finished.");
}

main();