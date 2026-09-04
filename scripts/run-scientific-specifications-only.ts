import {
    readFile,
    writeFile,
    mkdir
} from "fs/promises";

import {
    ScientificExecutionSpecificationEngine
} from "../laboratory/scientific-execution-specification/ScientificExecutionSpecificationEngine.js";

import type {
    ScientificExecutionPlanResult
} from "../laboratory/scientific-execution-plan/ScientificExecutionPlanResult.js";

async function main() {

    console.log("");
    console.log("====================================");
    console.log("OECL V2 Specification Regeneration");
    console.log("====================================");

    const plansRaw =
        await readFile(
            "./scientific-execution-plan-results/" +
            "OECL-V2-SCIENTIFIC-EXECUTION-PLANS.json",
            "utf8"
        );

    const plans =
        JSON.parse(
            plansRaw
        ) as ScientificExecutionPlanResult;

    /*
     * Load repository metadata directly from
     * generated research source bundles.
     */

    const repositoryToolchains:
    Record<
        string,
        "FOUNDRY" |
        "HARDHAT" |
        "MIXED" |
        "UNKNOWN"
    > = {};

const repositoryLocalPaths:
    Record<
        string,
        string
    > = {};

    const {
        readdir
    } = await import("fs/promises");

    const sourceDirectories =
        await readdir(
            "./sources/research",
            {
                withFileTypes: true
            }
        );

    for (
        const directory
        of sourceDirectories
    ) {

        if (!directory.isDirectory()) {
            continue;
        }

        const sourcePath =
            `./sources/research/${directory.name}/source.json`;

        try {

            const sourceRaw =
                await readFile(
                    sourcePath,
                    "utf8"
                );

            const source =
                JSON.parse(
                    sourceRaw
                ) as {
                    repository?: string;
                    toolchain?: string;
                    localPath?: string;
                };

            if (source.repository) {

                if (source.toolchain) {

                    repositoryToolchains[
    source.repository
] =
    source.toolchain as
        | "FOUNDRY"
        | "HARDHAT"
        | "MIXED"
        | "UNKNOWN";

                }

                if (source.localPath) {

                    repositoryLocalPaths[
    source.repository
] =
    source.localPath;

                }

            }

        } catch {

            // Ignore source directories without source.json.

        }

    }

    const result =
        new ScientificExecutionSpecificationEngine().build(
            plans.campaignId,
            plans,
            repositoryToolchains,
            repositoryLocalPaths
        );

    await mkdir(
        "./scientific-execution-specification-results",
        {
            recursive: true
        }
    );

    await writeFile(
        "./scientific-execution-specification-results/" +
        "OECL-V2-SCIENTIFIC-EXECUTION-SPECIFICATIONS.json",
        JSON.stringify(
            result,
            null,
            4
        )
    );

    console.log("");
    console.log(`Campaign: ${result.campaignId}`);
    console.log(`Specifications: ${result.statistics.total}`);
    console.log(`EXECUTABLE: ${result.statistics.executable}`);
    console.log(`UNRESOLVED: ${result.statistics.unresolved}`);
    console.log(`TEST_EXECUTION: ${result.statistics.testExecution}`);
    console.log(
        `INVARIANT_VALIDATION: ${result.statistics.invariantValidation}`
    );
    console.log(`STATIC_ANALYSIS: ${result.statistics.staticAnalysis}`);

    console.log("");
    console.log("Specification regeneration finished.");

}

main();