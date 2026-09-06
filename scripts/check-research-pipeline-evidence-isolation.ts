import {
    readFile
} from "fs/promises";

function check(
    condition: boolean,
    label: string
): boolean {

    console.log(
        `${label}: ${condition ? "PASS" : "FAIL"}`
    );

    return condition;
}

const pipelinePath =
    "./laboratory/pipeline/ResearchPipeline.ts";

const source =
    await readFile(
        pipelinePath,
        "utf8"
    );

console.log("");
console.log(
    "RESEARCH PIPELINE EVIDENCE ISOLATION"
);
console.log(
    "------------------------------------"
);

const benchmarkPath =
    "./benchmark-results/benchmark.json";

const matrixPath =
    "./matrix-results/composition-matrix.json";

const patternsPath =
    "./pattern-results/patterns.json";

const checks = [
    check(
        source.includes(
            "new EvidenceSupportEngine"
        ),
        "CONTROL: RESEARCH PIPELINE STILL CONTAINS EVIDENCE SUPPORT STAGE"
    ),

    check(
        !source.includes(
            benchmarkPath
        ),
        "PIPELINE DOES NOT IMPLICITLY READ GLOBAL BENCHMARK ARTIFACT"
    ),

    check(
        !source.includes(
            matrixPath
        ),
        "PIPELINE DOES NOT IMPLICITLY READ GLOBAL MATRIX ARTIFACT"
    ),

    check(
        !source.includes(
            patternsPath
        ),
        "PIPELINE DOES NOT IMPLICITLY READ GLOBAL PATTERN ARTIFACT"
    ),

    check(
        !hasImplicitLegacyEvidenceRead(
            source
        ),
        "PIPELINE HAS NO LEGACY GLOBAL EVIDENCE READ"
    )
];

const pass =
    checks.every(Boolean);

console.log("");
console.log(
    `RESULT: ${pass ? "PASS" : "FAIL"}`
);

if (!pass) {
    process.exitCode = 1;
}

function hasImplicitLegacyEvidenceRead(
    sourceCode: string
): boolean {

    const legacyEvidenceDirectories = [
        "benchmark-results",
        "matrix-results",
        "pattern-results"
    ];

    return legacyEvidenceDirectories.some(
        directory => {

            const escapedDirectory =
                directory.replace(
                    /[.*+?^${}()|[\]\\]/g,
                    "\\$&"
                );

            const readPattern =
                new RegExp(
                    `readJson\\s*\\(\\s*["'][^"']*${escapedDirectory}[^"']*["']\\s*\\)`,
                    "m"
                );

            return readPattern.test(
                sourceCode
            );
        }
    );
}