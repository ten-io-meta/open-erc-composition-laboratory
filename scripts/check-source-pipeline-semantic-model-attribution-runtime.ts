import {
    mkdir,
    mkdtemp,
    rm,
    writeFile
} from "fs/promises";

import {
    tmpdir
} from "os";

import {
    join
} from "path";

import {
    ResearchPipeline
} from "../laboratory/pipeline/ResearchPipeline.js";

import {
    SourcePipeline
} from "../laboratory/orchestration/source-pipeline/SourcePipeline.js";

const temporaryRoot =
    await mkdtemp(
        join(
            tmpdir(),
            "oecl-semantic-attribution-"
        )
    );

const manifestPath =
    join(
        temporaryRoot,
        "manifest.json"
    );

const sourceAAnalysisPath =
    join(
        temporaryRoot,
        "SOURCE-A"
    );

const sourceBAnalysisPath =
    join(
        temporaryRoot,
        "SOURCE-B"
    );

const originalRun =
    ResearchPipeline.prototype.run;

try {
    await mkdir(
        sourceAAnalysisPath,
        {
            recursive: true
        }
    );

    await mkdir(
        sourceBAnalysisPath,
        {
            recursive: true
        }
    );

    await writeFile(
        manifestPath,
        JSON.stringify(
            {
                manifestId:
                    "CONTROLLED-SEMANTIC-ATTRIBUTION-MANIFEST",

                sources: [
                    {
                        sourceId:
                            "SOURCE-A",

                        path:
                            "./controlled/SOURCE-A/source.json",

                        evidencePath:
                            "./controlled/SOURCE-A/evidence.json",

                        enabled:
                            true
                    },
                    {
                        sourceId:
                            "SOURCE-B",

                        path:
                            "./controlled/SOURCE-B/source.json",

                        evidencePath:
                            "./controlled/SOURCE-B/evidence.json",

                        enabled:
                            true
                    }
                ]
            },
            null,
            4
        ),
        "utf8"
    );

    await writeSemanticModel(
        sourceAAnalysisPath,
        "MODEL-A"
    );

    await writeSemanticModel(
        sourceBAnalysisPath,
        "MODEL-B"
    );

    (
        ResearchPipeline.prototype as any
    ).run =
        async (
            sourceId: string
        ) => {
            const analysisPath =
                sourceId === "SOURCE-A"
                    ? sourceAAnalysisPath
                    : sourceBAnalysisPath;

            return {
                pipelineId:
                    `PIPELINE-${sourceId}`,

                executedAt:
                    "2026-01-01T00:00:00.000Z",

                historicalStateMode:
                    "ISOLATED",

                sourceId,

                analysisPath,

                corpusPath:
                    "",

                protocols:
                    0,

                capabilities:
                    0,

                claims:
                    0,

                candidateClaims:
                    0,

                inconclusiveClaims:
                    0,

                knowledgeEntries:
                    0,

                supportedKnowledge:
                    0,

                emergingKnowledge:
                    0,

                incrementalKnowledgePath:
                    "",

                incrementalObservations:
                    0,

                memoryPath:
                    "",

                memoryEvents:
                    0,

                partialKnowledgePath:
                    "",

                errors:
                    []
            };
        };

    const pipeline =
        new SourcePipeline();

    const result =
        await pipeline.run({
            manifestPath,
            printSourceSummary:
                false
        });

    const sourceA =
        result.attributedSemanticModels.find(
            entry =>
                entry.sourceId ===
                "SOURCE-A"
        );

    const sourceB =
        result.attributedSemanticModels.find(
            entry =>
                entry.sourceId ===
                "SOURCE-B"
        );

    const checks: Array<{
        name: string;
        passed: boolean;
    }> = [
        {
            name:
                "TWO ATTRIBUTED SEMANTIC MODELS REACH GLOBAL SOURCE PIPELINE",
            passed:
                result.attributedSemanticModels.length ===
                2
        },
        {
            name:
                "SOURCE A ATTRIBUTION PRESERVED",
            passed:
                sourceA !==
                undefined
        },
        {
            name:
                "SOURCE A MODEL PRESERVED",
            passed:
                sourceA?.model.modelId ===
                "MODEL-A"
        },
        {
            name:
                "SOURCE B ATTRIBUTION PRESERVED",
            passed:
                sourceB !==
                undefined
        },
        {
            name:
                "SOURCE B MODEL PRESERVED",
            passed:
                sourceB?.model.modelId ===
                "MODEL-B"
        },
        {
            name:
                "SOURCE A MODEL DOES NOT CROSS INTO SOURCE B",
            passed:
                sourceA?.model.modelId !==
                sourceB?.model.modelId
        },
        {
            name:
                "NO OECL SOURCE ID INVENTED",
            passed:
                !result.attributedSemanticModels.some(
                    entry =>
                        entry.sourceId
                            .toUpperCase()
                            .includes(
                                "OECL"
                            )
                )
        },
        {
            name:
                "ATTRIBUTED MODEL STATISTIC MATCHES ACTUAL MODELS",
            passed:
                result.statistics
                    .attributedSemanticModels ===
                result.attributedSemanticModels.length
        },
        {
            name:
                "NO SOURCE PIPELINE ERRORS",
            passed:
                result.errors.length ===
                0
        }
    ];

    console.log("");
    console.log(
        "SOURCE PIPELINE SEMANTIC MODEL ATTRIBUTION — RUNTIME"
    );
    console.log(
        "----------------------------------------------------"
    );

    for (const check of checks) {
        console.log(
            `${check.name}: ${
                check.passed
                    ? "PASS"
                    : "FAIL"
            }`
        );
    }

    const failures =
        checks.filter(
            check =>
                !check.passed
        );

    console.log("");

    if (failures.length === 0) {
        console.log(
            "RESULT: PASS"
        );
    } else {
        console.log(
            `RESULT: FAIL (${failures.length}/${checks.length})`
        );

        process.exitCode = 1;
    }

} finally {
    ResearchPipeline.prototype.run =
        originalRun;

    await rm(
        temporaryRoot,
        {
            recursive: true,
            force: true
        }
    );
}

async function writeSemanticModel(
    analysisPath: string,
    modelId: string
): Promise<void> {
    await writeFile(
        join(
            analysisPath,
            "semantic-model.json"
        ),
        JSON.stringify(
            {
                graphId:
                    `GRAPH-${modelId}`,

                discoveredAt:
                    "2026-01-01T00:00:00.000Z",

                model: {
                    modelId,

                    generatedAt:
                        "2026-01-01T00:00:00.000Z",

                    capabilities:
                        [],

                    relationships:
                        []
                }
            },
            null,
            4
        ),
        "utf8"
    );
}