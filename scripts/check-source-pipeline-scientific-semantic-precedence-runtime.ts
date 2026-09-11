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
            "oecl-scientific-semantic-precedence-"
        )
    );


const manifestPath =
    join(
        temporaryRoot,
        "manifest.json"
    );


const scientificSourceDirectory =
    join(
        temporaryRoot,
        "SOURCE-SCIENTIFIC"
    );

const legacySourceDirectory =
    join(
        temporaryRoot,
        "SOURCE-LEGACY"
    );

const corruptSourceDirectory =
    join(
        temporaryRoot,
        "SOURCE-CORRUPT"
    );


const scientificAnalysisPath =
    join(
        temporaryRoot,
        "analysis-SOURCE-SCIENTIFIC"
    );

const legacyAnalysisPath =
    join(
        temporaryRoot,
        "analysis-SOURCE-LEGACY"
    );

const corruptAnalysisPath =
    join(
        temporaryRoot,
        "analysis-SOURCE-CORRUPT"
    );


const scientificRevision =
    "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";

const legacyRevision =
    "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";

const corruptRevision =
    "cccccccccccccccccccccccccccccccccccccccc";


const originalRun =
    ResearchPipeline.prototype.run;


try {

    await mkdir(
        scientificSourceDirectory,
        {
            recursive:
                true
        }
    );

    await mkdir(
        legacySourceDirectory,
        {
            recursive:
                true
        }
    );

    await mkdir(
        corruptSourceDirectory,
        {
            recursive:
                true
        }
    );

    await mkdir(
        scientificAnalysisPath,
        {
            recursive:
                true
        }
    );

    await mkdir(
        legacyAnalysisPath,
        {
            recursive:
                true
        }
    );

    await mkdir(
        corruptAnalysisPath,
        {
            recursive:
                true
        }
    );


    const scientificSourcePath =
        join(
            scientificSourceDirectory,
            "source.json"
        );

    const legacySourcePath =
        join(
            legacySourceDirectory,
            "source.json"
        );

    const corruptSourcePath =
        join(
            corruptSourceDirectory,
            "source.json"
        );


    await writeFile(
        scientificSourcePath,
        JSON.stringify(
            {
                sourceId:
                    "SOURCE-SCIENTIFIC"
            },
            null,
            4
        ),
        "utf8"
    );

    await writeFile(
        legacySourcePath,
        JSON.stringify(
            {
                sourceId:
                    "SOURCE-LEGACY"
            },
            null,
            4
        ),
        "utf8"
    );

    await writeFile(
        corruptSourcePath,
        JSON.stringify(
            {
                sourceId:
                    "SOURCE-CORRUPT"
            },
            null,
            4
        ),
        "utf8"
    );


    await writeFile(
        manifestPath,
        JSON.stringify(
            {
                manifestId:
                    "CONTROLLED-SCIENTIFIC-SEMANTIC-PRECEDENCE",

                sources: [
                    {
                        sourceId:
                            "SOURCE-SCIENTIFIC",

                        path:
                            scientificSourcePath,

                        evidencePath:
                            join(
                                scientificSourceDirectory,
                                "evidence.json"
                            ),

                        enabled:
                            true
                    },
                    {
                        sourceId:
                            "SOURCE-LEGACY",

                        path:
                            legacySourcePath,

                        evidencePath:
                            join(
                                legacySourceDirectory,
                                "evidence.json"
                            ),

                        enabled:
                            true
                    },
                    {
                        sourceId:
                            "SOURCE-CORRUPT",

                        path:
                            corruptSourcePath,

                        evidencePath:
                            join(
                                corruptSourceDirectory,
                                "evidence.json"
                            ),

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


    /*
     * Scientific source:
     *
     * It has both a scientific facts artifact and a legacy
     * semantic model. Scientific precedence must win.
     */

    await writeFile(
        join(
            scientificSourceDirectory,
            "scientific-source-facts.json"
        ),
        JSON.stringify(
            [
                {
                    factId:
                        "SOURCE-SCIENTIFIC-OBS-00001-FACT-00001",

                    observationId:
                        "SOURCE-SCIENTIFIC-OBS-00001",

                    sourceId:
                        "SOURCE-SCIENTIFIC",

                    sourceRevision:
                        scientificRevision,

                    kind:
                        "FUNCTION_DECLARATION",

                    symbol:
                        "reserveValue",

                    locator: {
                        sourceLocation:
                            "https://github.com/example/scientific",

                        filePath:
                            "/contracts/Example.sol",

                        startLine:
                            10,

                        endLine:
                            10
                    },

                    rawText:
                        "function reserveValue(uint256 amount) external;"
                }
            ],
            null,
            4
        ),
        "utf8"
    );


    await writeSemanticModel(
        scientificAnalysisPath,
        "LEGACY-MODEL-MUST-NOT-WIN"
    );


    /*
     * Legacy source:
     *
     * It deliberately has NO scientific-source-facts.json.
     * The legacy semantic model is therefore allowed.
     */

    await writeSemanticModel(
        legacyAnalysisPath,
        "LEGACY-MODEL"
    );


    /*
     * Corrupt scientific source:
     *
     * A facts artifact exists, but its revision does not match
     * the executed source revision.
     *
     * A legacy model also exists. It MUST NOT be used to hide
     * the provenance failure.
     */

    await writeFile(
        join(
            corruptSourceDirectory,
            "scientific-source-facts.json"
        ),
        JSON.stringify(
            [
                {
                    factId:
                        "SOURCE-CORRUPT-OBS-00001-FACT-00001",

                    observationId:
                        "SOURCE-CORRUPT-OBS-00001",

                    sourceId:
                        "SOURCE-CORRUPT",

                    sourceRevision:
                        "dddddddddddddddddddddddddddddddddddddddd",

                    kind:
                        "FUNCTION_DECLARATION",

                    symbol:
                        "corruptValue",

                    locator: {
                        sourceLocation:
                            "https://github.com/example/corrupt",

                        filePath:
                            "/contracts/Corrupt.sol",

                        startLine:
                            5,

                        endLine:
                            5
                    },

                    rawText:
                        "function corruptValue() external;"
                }
            ],
            null,
            4
        ),
        "utf8"
    );


    await writeSemanticModel(
        corruptAnalysisPath,
        "CORRUPT-LEGACY-MODEL-MUST-NOT-WIN"
    );


    (
        ResearchPipeline.prototype as any
    ).run =
        async (
            sourceId:
                string
        ) => {

            const analysisPath =
                sourceId ===
                    "SOURCE-SCIENTIFIC"
                    ? scientificAnalysisPath
                    : sourceId ===
                        "SOURCE-LEGACY"
                        ? legacyAnalysisPath
                        : corruptAnalysisPath;


            const sourceRevision =
                sourceId ===
                    "SOURCE-SCIENTIFIC"
                    ? scientificRevision
                    : sourceId ===
                        "SOURCE-LEGACY"
                        ? legacyRevision
                        : corruptRevision;


            return {

                pipelineId:
                    `PIPELINE-${sourceId}`,

                executedAt:
                    "2026-01-01T00:00:00.000Z",

                historicalStateMode:
                    "ISOLATED",

                sourceId,

                sourceRevision,

                analysisPath,

                corpusPath:
                    "",

                learningPath:
                    "",

                knowledgePath:
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


    const scientificModel =
        result.attributedSemanticModels.find(
            entry =>
                entry.sourceId ===
                "SOURCE-SCIENTIFIC"
        );


    const legacyModel =
        result.attributedSemanticModels.find(
            entry =>
                entry.sourceId ===
                "SOURCE-LEGACY"
        );


    const corruptModel =
        result.attributedSemanticModels.find(
            entry =>
                entry.sourceId ===
                "SOURCE-CORRUPT"
        );


    const scientificCapability =
        scientificModel
            ?.model
            .capabilities
            .find(
                capability =>
                    capability.capabilityId ===
                    "LEXICAL-RESERVE-VALUE"
            );


    const checks: Array<{
        name: string;
        passed: boolean;
    }> = [
        {
            name:
                "SCIENTIFIC SOURCE PRODUCES ATTRIBUTED MODEL",
            passed:
                scientificModel !==
                undefined
        },
        {
            name:
                "SCIENTIFIC MODEL PRESERVES SOURCE REVISION",
            passed:
                scientificModel?.sourceRevision ===
                scientificRevision
        },
        {
            name:
                "SCIENTIFIC MODEL USES SCIENTIFIC DERIVATION",
            passed:
                scientificModel
                    ?.model
                    .modelId ===
                `SCIENTIFIC-SEMANTIC-SOURCE-SCIENTIFIC-${scientificRevision}`
        },
        {
            name:
                "SCIENTIFIC MODEL DOES NOT USE LEGACY MODEL",
            passed:
                scientificModel
                    ?.model
                    .modelId !==
                "LEGACY-MODEL-MUST-NOT-WIN"
        },
        {
            name:
                "SCIENTIFIC CAPABILITY REACHES SOURCE PIPELINE",
            passed:
                scientificCapability !==
                undefined
        },
        {
            name:
                "SCIENTIFIC CAPABILITY PRESERVES FACT EVIDENCE",
            passed:
                scientificCapability
                    ?.evidence
                    .includes(
                        "SOURCE-SCIENTIFIC-OBS-00001-FACT-00001"
                    ) ===
                true
        },
        {
            name:
                "SCIENTIFIC CAPABILITY HAS NO PROTOCOL ATTRIBUTION",
            passed:
                scientificCapability
                    ?.protocols
                    .length ===
                0
        },
        {
            name:
                "SCIENTIFIC MODEL HAS NO RELATIONSHIPS",
            passed:
                scientificModel
                    ?.model
                    .relationships
                    .length ===
                0
        },
        {
            name:
                "MISSING SCIENTIFIC FACTS USE LEGACY FALLBACK",
            passed:
                legacyModel
                    ?.model
                    .modelId ===
                "LEGACY-MODEL"
        },
        {
            name:
                "LEGACY FALLBACK PRESERVES SOURCE REVISION",
            passed:
                legacyModel?.sourceRevision ===
                legacyRevision
        },
        {
            name:
                "CORRUPT SCIENTIFIC SOURCE PRODUCES NO ATTRIBUTED MODEL",
            passed:
                corruptModel ===
                undefined
        },
        {
            name:
                "CORRUPT SCIENTIFIC SOURCE DOES NOT FALL BACK TO LEGACY",
            passed:
                !result
                    .attributedSemanticModels
                    .some(
                        entry =>
                            entry
                                .model
                                .modelId ===
                            "CORRUPT-LEGACY-MODEL-MUST-NOT-WIN"
                    )
        },
        {
            name:
                "CORRUPT SCIENTIFIC PROVENANCE PRODUCES ERROR",
            passed:
                result.errors.some(
                    error =>
                        error.includes(
                            "SOURCE-CORRUPT"
                        ) &&
                        error.includes(
                            "different source revision"
                        )
                )
        },
        {
            name:
                "ONLY SCIENTIFIC AND LEGACY MODELS ARE ATTRIBUTED",
            passed:
                result
                    .attributedSemanticModels
                    .length ===
                2
        },
        {
            name:
                "ATTRIBUTED MODEL STATISTIC MATCHES ACTUAL MODELS",
            passed:
                result
                    .statistics
                    .attributedSemanticModels ===
                result
                    .attributedSemanticModels
                    .length
        },
        {
            name:
                "SCIENTIFIC AND LEGACY MODELS KEEP DISTINCT IDENTITIES",
            passed:
                scientificModel
                    ?.model
                    .modelId !==
                legacyModel
                    ?.model
                    .modelId
        }
    ];


    console.log("");
    console.log(
        "SOURCE PIPELINE SCIENTIFIC SEMANTIC PRECEDENCE — RUNTIME"
    );
    console.log(
        "--------------------------------------------------------"
    );


    for (
        const check
        of checks
    ) {

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


    if (
        failures.length ===
        0
    ) {

        console.log(
            "RESULT: PASS"
        );

    } else {

        console.log(
            `RESULT: FAIL (${failures.length}/${checks.length})`
        );

        process.exitCode =
            1;

    }

} finally {

    ResearchPipeline.prototype.run =
        originalRun;


    await rm(
        temporaryRoot,
        {
            recursive:
                true,

            force:
                true
        }
    );

}


async function writeSemanticModel(
    analysisPath:
        string,
    modelId:
        string
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