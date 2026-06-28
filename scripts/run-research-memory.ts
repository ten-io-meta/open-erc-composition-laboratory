import { mkdir, readdir, readFile, writeFile } from "fs/promises";

import { ResearchMemoryEngine } from "../laboratory/research-memory/ResearchMemoryEngine.js";

async function main() {

    console.log("");
    console.log("====================================");
    console.log("OECL Research Memory Engine");
    console.log("====================================");

    const requirements = JSON.parse(
        await readFile(
            "./requirements-results/protocols.json",
            "utf8"
        )
    );

    const hypotheses = JSON.parse(
        await readFile(
            "./hypothesis-results/composition-hypotheses.json",
            "utf8"
        )
    );

    const emergent = JSON.parse(
        await readFile(
            "./emergent-results/properties.json",
            "utf8"
        )
    );

    const patterns = JSON.parse(
        await readFile(
            "./pattern-results/patterns.json",
            "utf8"
        )
    );

    const relationships = JSON.parse(
        await readFile(
            "./relationship-results/relationships.json",
            "utf8"
        )
    );

    const datasets = await loadDatasets("./datasets");

    const passedScenarios = datasets.filter(
        dataset => dataset.validationPassed === true
    ).length;

    const failedScenarios =
        datasets.length - passedScenarios;

    const protocolCoverage: Record<string, number> = {};

    for (const dataset of datasets) {
        for (const protocol of dataset.resolvedProtocols ?? []) {
            protocolCoverage[protocol] =
                (protocolCoverage[protocol] ?? 0) + 1;
        }
    }

    const protocols = Object.keys(protocolCoverage);

    const campaign = {
        campaignId: `MEM-${new Date().toISOString()}`,
        timestamp: new Date().toISOString(),
        executedScenarios: datasets.length,
        passedScenarios,
        failedScenarios,
        protocols:
            protocols.length > 0
                ? protocols
                : requirements.map((protocol: any) => protocol.protocolId),
        protocolCoverage,
        hypothesesGenerated: hypotheses.length,
        hypothesesValidated: hypotheses.length,
        emergentProperties: emergent.length,
        patterns: patterns.length,
        relationships: relationships.length
    };

    const engine = new ResearchMemoryEngine();

    const memory = engine.build([campaign]);

    console.log("");
    console.log("Research Memory");
    console.log("------------------------------");

    console.log(`Total campaigns: ${memory.totalCampaigns}`);
    console.log(`Total scenarios: ${memory.totalScenarios}`);
    console.log(`Total passed: ${memory.totalPassed}`);
    console.log(`Total failed: ${memory.totalFailed}`);
    console.log(`Hypothesis coverage: ${memory.hypothesisCoverage}`);

    console.log("");
    console.log("Protocol coverage:");

    for (const [protocol, count] of Object.entries(memory.protocolCoverage)) {
        console.log(`- ${protocol}: ${count}`);
    }

    await mkdir("./research-memory-results", {
        recursive: true
    });

    await writeFile(
        "./research-memory-results/research-memory.json",
        JSON.stringify(memory, null, 4)
    );

    console.log("");
    console.log("Research memory exported:");
    console.log("./research-memory-results/research-memory.json");

    console.log("");
    console.log("Research Memory finished.");

}

async function loadDatasets(directory: string): Promise<any[]> {

    const files = await readdir(directory);

    const datasets: any[] = [];

    for (const file of files) {

        if (!file.endsWith(".json")) {
            continue;
        }

        const content = await readFile(
            `${directory}/${file}`,
            "utf8"
        );

        datasets.push(JSON.parse(content));

    }

    return datasets;

}

main();
