import { exec } from "child_process";

const pipeline = [
    "campaign",
    "benchmark",
    "requirements",
    "emergent",
    "patterns",
    "relationships",
    "matrix",
    "intelligence",
    "hypotheses",
    "validation",
    "generate-scenarios",
    "auto:scenarios",
    "adaptive",
    "adaptive:scenarios",
    "memory",
    "knowledge",
    "report"
];

async function main() {
    console.log("");
    console.log("====================================");
    console.log("OECL V1 Orchestrator");
    console.log("====================================");

    for (const step of pipeline) {
        console.log("");
        console.log("------------------------------------");
        console.log(`Running: ${step}`);
        console.log("------------------------------------");

        await run(`npm run ${step}`);
    }

    console.log("");
    console.log("====================================");
    console.log("OECL V1 completed successfully");
    console.log("====================================");

    console.log("");
    console.log("Final artifacts:");
    console.log("- knowledge-results/research-knowledge.json");
    console.log("- research-memory-results/research-memory.json");
    console.log("- reports/OECL-V1-RESEARCH-REPORT.md");
}

function run(command: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const child = exec(command, {
            maxBuffer: 1024 * 1024 * 50
        });

        child.stdout?.on("data", data => process.stdout.write(data));
        child.stderr?.on("data", data => process.stderr.write(data));

        child.on("close", code => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`Command failed: ${command}`));
            }
        });
    });
}

main().catch(error => {
    console.error("");
    console.error("OECL V1 Orchestrator failed.");
    console.error(error);
    process.exit(1);
});
