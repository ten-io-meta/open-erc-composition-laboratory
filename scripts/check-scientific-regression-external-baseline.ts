import {
    readFile
} from "fs/promises";


const runnerPath =
    "./scripts/run-scientific-regression-suite.ts";

const externalRepository =
    "external/github/ten-io-meta/erc8060-reservable";


async function main() {

    const runner =
        await readFile(
            runnerPath,
            "utf8"
        );

    const hasExternalRepository =
        runner.includes(
            externalRepository
        );

    const hasStatusInspection =
        runner.includes(
            "status"
        ) &&
        runner.includes(
            "--porcelain"
        );

    const hasDirtyBaselineRejection =
        runner.includes(
            "EXTERNAL_BASELINE_DIRTY"
        );

    console.log("");
    console.log(
        "=== SCIENTIFIC REGRESSION EXTERNAL BASELINE CONTRACT ==="
    );

    console.log(
        "External repository declared:",
        hasExternalRepository
    );

    console.log(
        "Git status inspection:",
        hasStatusInspection
    );

    console.log(
        "Dirty baseline rejection:",
        hasDirtyBaselineRejection
    );

    if (
        !hasExternalRepository ||
        !hasStatusInspection ||
        !hasDirtyBaselineRejection
    ) {

        throw new Error(
            "Scientific regression runner does not enforce a clean external baseline."
        );

    }

    console.log("");
    console.log(
        "SCIENTIFIC REGRESSION EXTERNAL BASELINE: PASS"
    );

}


main();