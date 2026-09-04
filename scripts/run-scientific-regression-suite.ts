import {
    readdir,
    stat,
    writeFile
} from "fs/promises";

import {
    execFile,
    spawn
} from "child_process";

import {
    promisify
} from "util";

interface RegressionResult {
    script: string;
    status: "PASS" | "FAIL";
    exitCode: number;
    durationMs: number;
}

interface RegressionSuiteResult {
    generatedAt: string;
    suite: "OECL_V2_SCIENTIFIC_REGRESSION";
    valid: boolean;
    statistics: {
        discovered: number;
        executed: number;
        passed: number;
        failed: number;
        excluded: number;
        empty: number;
        durationMs: number;
    };
    excluded: string[];
    empty: string[];
    results: RegressionResult[];
    typescript: {
        valid: boolean;
        exitCode: number;
        durationMs: number;
    };
}

const excludedChecks =
    new Set<string>([
        "check-knowledge-pipeline-source-independence.ts",
        "check-real-source-independence.ts",
        "check-real-target-polarity-cross-validation.ts",
        "check-solady-full-refresh.ts",
        "check-source-independence-assessment.ts"
    ]);

const execFileAsync =
    promisify(
        execFile
    );

const externalFixtureRepositories =
    [
        "./external/github/ten-io-meta/erc8060-reservable"
    ];

async function assertCleanExternalBaseline() {

    for (
        const repository
        of externalFixtureRepositories
    ) {

        const { stdout } =
            await execFileAsync(
                "git",
                [
                    "-C",
                    repository,
                    "status",
                    "--porcelain"
                ],
                {
                    encoding: "utf8"
                }
            );

        if (
            stdout.trim().length > 0
        ) {

            console.error(
                "EXTERNAL_BASELINE_DIRTY"
            );

            console.error(
                repository
            );

            console.error(
                stdout.trim()
            );

            throw new Error(
                `EXTERNAL_BASELINE_DIRTY: ${repository}`
            );

        }

    }

}

function execute(
    command: string,
    args: string[]
): Promise<{
    exitCode: number;
    durationMs: number;
}> {

    return new Promise(
        resolve => {

            const startedAt =
                Date.now();

            const child =
                spawn(
                    command,
                    args,
                    {
                        stdio: "inherit",
                        shell: true
                    }
                );

            child.on(
                "close",
                code => {

                    resolve({
                        exitCode:
                            code ?? 1,
                        durationMs:
                            Date.now() - startedAt
                    });

                }
            );

            child.on(
                "error",
                () => {

                    resolve({
                        exitCode: 1,
                        durationMs:
                            Date.now() - startedAt
                    });

                }
            );

        }
    );

}

async function main() {

    console.log("");
    console.log("====================================");
    console.log("OECL V2 Scientific Regression Suite");
    console.log("====================================");
    console.log("");

    await assertCleanExternalBaseline();

    const entries =
        await readdir(
            "./scripts"
        );

    const discovered =
        entries
            .filter(
                name =>
                    name.startsWith("check-") &&
                    name.endsWith(".ts")
            )
            .sort();

    const excluded:
        string[] = [];

    const empty:
        string[] = [];

    const controlled:
        string[] = [];

    for (
        const script
        of discovered
    ) {

        const information =
            await stat(
                `./scripts/${script}`
            );

        if (
            information.size === 0
        ) {

            empty.push(
                script
            );

            continue;

        }

        if (
            excludedChecks.has(
                script
            )
        ) {

            excluded.push(
                script
            );

            continue;

        }

        controlled.push(
            script
        );

    }

    console.log(
        `Discovered checks: ${discovered.length}`
    );

    console.log(
        `Controlled checks: ${controlled.length}`
    );

    console.log(
        `Excluded external checks: ${excluded.length}`
    );

    console.log(
        `Empty checks: ${empty.length}`
    );

    console.log("");

    const suiteStartedAt =
        Date.now();

    const results:
        RegressionResult[] = [];

    for (
        let index = 0;
        index < controlled.length;
        index++
    ) {

        const script =
            controlled[index];

        console.log(
            `[${index + 1}/${controlled.length}] RUNNING ${script}`
        );

        const execution =
            await execute(
                "npx",
                [
                    "tsx",
                    `scripts/${script}`
                ]
            );

        await assertCleanExternalBaseline();

        const status:
            RegressionResult["status"] =
                execution.exitCode === 0
                    ? "PASS"
                    : "FAIL";

        results.push({
            script,
            status,
            exitCode:
                execution.exitCode,
            durationMs:
                execution.durationMs
        });

        console.log(
            `[${index + 1}/${controlled.length}] ` +
            `${status} ` +
            `${(execution.durationMs / 1000).toFixed(2)} s`
        );

        console.log("");

    }

    console.log(
        "TYPESCRIPT RUNNING"
    );

    const typescript =
        await execute(
            "npx",
            [
                "tsc",
                "--noEmit"
            ]
        );

    const passed =
        results.filter(
            result =>
                result.status === "PASS"
        ).length;

    const failed =
        results.length -
        passed;

    const typescriptValid =
        typescript.exitCode === 0;

    const valid =
        failed === 0 &&
        typescriptValid &&
        empty.length === 0;

    const result:
        RegressionSuiteResult = {

            generatedAt:
                new Date().toISOString(),

            suite:
                "OECL_V2_SCIENTIFIC_REGRESSION",

            valid,

            statistics: {

                discovered:
                    discovered.length,

                executed:
                    results.length,

                passed,

                failed,

                excluded:
                    excluded.length,

                empty:
                    empty.length,

                durationMs:
                    Date.now() -
                    suiteStartedAt

            },

            excluded,

            empty,

            results,

            typescript: {

                valid:
                    typescriptValid,

                exitCode:
                    typescript.exitCode,

                durationMs:
                    typescript.durationMs

            }

        };

    await writeFile(
        "./scientific-regression-suite-results.json",
        JSON.stringify(
            result,
            null,
            4
        )
    );

    console.log("");
    console.log("====================================");
    console.log("Scientific Regression Suite Result");
    console.log("====================================");

    console.log(
        `Executed: ${result.statistics.executed}`
    );

    console.log(
        `PASS: ${result.statistics.passed}`
    );

    console.log(
        `FAIL: ${result.statistics.failed}`
    );

    console.log(
        `Excluded: ${result.statistics.excluded}`
    );

    console.log(
        `Empty: ${result.statistics.empty}`
    );

    console.log(
        `TypeScript: ${typescriptValid ? "PASS" : "FAIL"}`
    );

    console.log(
        `Suite: ${valid ? "PASS" : "FAIL"}`
    );

    console.log("");

    console.log(
        "Result: ./scientific-regression-suite-results.json"
    );

    if (
        !valid
    ) {

        process.exitCode =
            1;

    }

}

main().catch(
    error => {

        console.error(
            error
        );

        process.exitCode =
            1;

    }
);
