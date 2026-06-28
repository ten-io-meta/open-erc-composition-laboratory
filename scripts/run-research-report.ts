import { mkdir, readFile, writeFile } from "fs/promises";

import { ResearchReportEngine } from "../laboratory/research-report/ResearchReportEngine.js";

async function main() {

    console.log("");
    console.log("====================================");
    console.log("OECL Research Report Engine");
    console.log("====================================");

    const knowledge = JSON.parse(
        await readFile(
            "./knowledge-results/research-knowledge.json",
            "utf8"
        )
    );

    const engine = new ResearchReportEngine();

    const report = engine.build(knowledge);

    await mkdir("./reports", {
        recursive: true
    });

    await writeFile(
        "./reports/OECL-V1-RESEARCH-REPORT.md",
        report
    );

    console.log("");
    console.log("Research report exported:");
    console.log("./reports/OECL-V1-RESEARCH-REPORT.md");

    console.log("");
    console.log("Research Report finished.");

}

main();
