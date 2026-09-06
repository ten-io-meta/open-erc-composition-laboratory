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

function compact(
    source: string
): string {

    return source
        .replace(
            /\s+/g,
            " "
        )
        .trim();
}

const pipelinePath =
    "./laboratory/pipeline/ResearchPipeline.ts";

const resultPath =
    "./laboratory/pipeline/ResearchPipelineResult.ts";

const sourcePipelinePath =
    "./laboratory/orchestration/source-pipeline/SourcePipeline.ts";

const runtimePath =
    "./laboratory/scientific-execution-runtime/ScientificExecutionRuntimeEngine.ts";

const [
    pipelineSource,
    resultSource,
    sourcePipelineSource,
    runtimeSource
] =
    await Promise.all([
        readFile(
            pipelinePath,
            "utf8"
        ),

        readFile(
            resultPath,
            "utf8"
        ),

        readFile(
            sourcePipelinePath,
            "utf8"
        ),

        readFile(
            runtimePath,
            "utf8"
        )
    ]);

const pipeline =
    compact(
        pipelineSource
    );

const result =
    compact(
        resultSource
    );

const sourcePipeline =
    compact(
        sourcePipelineSource
    );

const runtime =
    compact(
        runtimeSource
    );

console.log("");
console.log(
    "RESEARCH PIPELINE HISTORICAL STATE BOUNDARY"
);
console.log(
    "-------------------------------------------"
);

const persistentMarker =
    'historicalStateMode === "PERSISTENT"';

const persistentBranchIndex =
    pipeline.indexOf(
        persistentMarker
    );

const persistentKnowledgeRead =
    "previousKnowledge = await readJson( persistentKnowledgePath )";

const previousKnowledgeIndex =
    pipeline.indexOf(
        persistentKnowledgeRead
    );

const persistentMemoryRead =
    "await memoryLoader.load( persistentMemoryPath )";

const previousMemoryIndex =
    pipeline.indexOf(
        persistentMemoryRead
    );

const aggregationCall =
    "await knowledgeAggregator.aggregate()";

const aggregationIndex =
    pipeline.indexOf(
        aggregationCall
    );

const checks = [

    check(
        pipeline.includes(
            "export interface ResearchPipelineOptions"
        ),
        "PIPELINE DECLARES EXPLICIT EXECUTION OPTIONS"
    ),

    check(
        pipeline.includes(
            'historicalStateMode?: | "ISOLATED" | "PERSISTENT";'
        ),
        "OPTIONS DISTINGUISH ISOLATED FROM PERSISTENT STATE"
    ),

    check(
        pipeline.includes(
            'options.historicalStateMode ?? "ISOLATED"'
        ),
        "ISOLATED MODE IS THE DEFAULT"
    ),

    check(
        persistentBranchIndex >= 0,
        "PERSISTENT STATE HAS AN EXPLICIT OPT-IN BRANCH"
    ),

    check(
        previousKnowledgeIndex >= 0 &&
        previousKnowledgeIndex >
            persistentBranchIndex,
        "PREVIOUS KNOWLEDGE READ OCCURS ONLY AFTER PERSISTENT OPT-IN"
    ),

    check(
        previousMemoryIndex >= 0 &&
        previousMemoryIndex >
            persistentBranchIndex,
        "PREVIOUS RESEARCH MEMORY READ OCCURS ONLY AFTER PERSISTENT OPT-IN"
    ),

    check(
        aggregationIndex >= 0 &&
        aggregationIndex >
            persistentBranchIndex,
        "GLOBAL ANALYSIS AGGREGATION OCCURS ONLY AFTER PERSISTENT OPT-IN"
    ),

    check(
        pipeline.includes(
            'const sourceIds = historicalStateMode === "PERSISTENT" ? await corpusLoader.listAnalysisSources("./analysis-results") : [sourceId];'
        ),
        "ISOLATED MODE BUILDS CORPUS FROM CURRENT SOURCE ONLY"
    ),

    check(
        result.includes(
            'historicalStateMode: | "ISOLATED" | "PERSISTENT";'
        ),
        "PIPELINE RESULT DECLARES HISTORICAL STATE MODE"
    ),

    check(
        pipeline.includes(
            "executedAt, historicalStateMode,"
        ),
        "PIPELINE RETURNS HISTORICAL STATE MODE"
    ),

    check(
        !sourcePipeline.includes(
            'historicalStateMode: "PERSISTENT"'
        ),
        "SOURCE PIPELINE DOES NOT SILENTLY ENABLE PERSISTENT STATE"
    ),

    check(
        !runtime.includes(
            'historicalStateMode: "PERSISTENT"'
        ),
        "SCIENTIFIC RUNTIME DOES NOT SILENTLY ENABLE PERSISTENT STATE"
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