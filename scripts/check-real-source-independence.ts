import { readFile } from "fs/promises";

import {
    SourceIndependenceAssessmentEngine
} from "../laboratory/source-independence/SourceIndependenceAssessmentEngine.js";

import type {
    ResearchSource
} from "../laboratory/research-source/ResearchSource.js";

const sourceIds = [
    "DOI-0001",
    "GITHUB-CRYTIC-SLITHER",
    "GITHUB-TEST-0001",
    "GITHUB-TEN-IO-META-ERC8060-RESERVABLE"
];

async function loadSource(
    sourceId: string
): Promise<ResearchSource> {

    const path =
        `./sources/research/${sourceId}/source.json`;

    const raw =
        await readFile(
            path,
            "utf8"
        );

    return JSON.parse(
        raw
    ) as ResearchSource;

}

async function main(): Promise<void> {

    console.log(
        "\n=== PHASE 10.3F — REAL SOURCE INDEPENDENCE ===\n"
    );

    const sources:
        ResearchSource[] = [];

    for (
        const sourceId of sourceIds
    ) {

        try {

            sources.push(
                await loadSource(
                    sourceId
                )
            );

        } catch (error) {

            console.error(
                `FAILED TO LOAD SOURCE: ${sourceId}`
            );

            console.error(
                error
            );

            process.exitCode = 1;

            return;

        }

    }

    const engine =
        new SourceIndependenceAssessmentEngine();

    const result =
        engine.build(
            sources
        );

    for (
        const assessment of result.assessments
    ) {

        console.log(
            "----------------------------------------"
        );

        console.log(
            "sourceIds:"
        );

        for (
            const sourceId of assessment.sourceIds
        ) {

            console.log(
                `  - ${sourceId}`
            );

        }

        console.log(
            `status: ${assessment.status}`
        );

        console.log(
            `reason: ${assessment.reason}`
        );

        console.log(
            `establishedIndependentSources: ` +
            `${assessment.establishedIndependentSources}`
        );

        console.log(
            `explanation: ${assessment.explanation}`
        );

        console.log();

    }

    console.log(
        "=== STATISTICS ==="
    );

    console.log(
        JSON.stringify(
            result.statistics,
            null,
            4
        )
    );

    if (
        result.errors.length > 0
    ) {

        console.error(
            "\nERRORS:"
        );

        console.error(
            result.errors
        );

        process.exitCode = 1;

    }

}

main().catch(
    error => {

        console.error(
            error
        );

        process.exit(
            1
        );

    }
);