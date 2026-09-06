import {
    readFileSync
} from "node:fs";


const researchSourcePath =
    "./laboratory/research-source/ResearchSource.ts";

const researchPipelineResultPath =
    "./laboratory/pipeline/ResearchPipelineResult.ts";

const researchPipelinePath =
    "./laboratory/pipeline/ResearchPipeline.ts";

const sourcePipelineResultPath =
    "./laboratory/orchestration/source-pipeline/SourcePipelineResult.ts";

const sourcePipelinePath =
    "./laboratory/orchestration/source-pipeline/SourcePipeline.ts";


const researchSource =
    readFileSync(
        researchSourcePath,
        "utf8"
    );

const researchPipelineResult =
    readFileSync(
        researchPipelineResultPath,
        "utf8"
    );

const researchPipeline =
    readFileSync(
        researchPipelinePath,
        "utf8"
    );

const sourcePipelineResult =
    readFileSync(
        sourcePipelineResultPath,
        "utf8"
    );

const sourcePipeline =
    readFileSync(
        sourcePipelinePath,
        "utf8"
    );


const checks: Array<{
    name: string;
    passed: boolean;
}> = [
    {
        name:
            "RESEARCH SOURCE EXPOSES GITHUB COMMIT SHA",
        passed:
            /commitSha\?\s*:\s*string/.test(
                researchSource
            )
    },
    {
        name:
            "RESEARCH PIPELINE RESULT EXPOSES SOURCE REVISION",
        passed:
            /sourceRevision\?\s*:\s*string/.test(
                researchPipelineResult
            )
    },
    {
        name:
            "RESEARCH PIPELINE READS REVISION FROM SOURCE COMMIT SHA",
        passed:
            /sourceRevision\s*=\s*source\.commitSha/.test(
                researchPipeline
            )
    },
    {
        name:
            "RESEARCH PIPELINE MAY PRESERVE LEGACY COMMIT FIELD",
        passed:
            /source\.commitSha\s*\?\?\s*source\.commit/.test(
                researchPipeline
            )
    },
    {
        name:
            "RESEARCH PIPELINE SUCCESS RESULT PRESERVES SOURCE REVISION",
        passed:
            (
                researchPipeline.match(
                    /\bsourceRevision\s*,/g
                ) ??
                []
            ).length >=
            2
    },
    {
        name:
            "RESEARCH PIPELINE FAILURE RESULT PRESERVES SOURCE REVISION",
        passed:
            /catch\s*\(error\)[\s\S]*?sourceRevision\s*,[\s\S]*?errors\s*:/.test(
                researchPipeline
            )
    },
    {
        name:
            "ATTRIBUTED SEMANTIC MODEL EXPOSES SOURCE REVISION",
        passed:
            /interface\s+AttributedSemanticModel[\s\S]*?sourceRevision\?\s*:\s*string/.test(
                sourcePipelineResult
            )
    },
    {
        name:
            "SOURCE PIPELINE ATTRIBUTES SEMANTIC MODEL REVISION",
        passed:
            /attributedSemanticModels\.push\(\{[\s\S]*?sourceId\s*:\s*result\.sourceId\s*,[\s\S]*?sourceRevision\s*:\s*result\.sourceRevision\s*,[\s\S]*?model\s*:/.test(
                sourcePipeline
            )
    },
    {
        name:
            "SOURCE REVISION IS NOT DERIVED FROM SOURCE ID",
        passed:
            !/sourceRevision\s*=\s*sourceId/.test(
                researchPipeline
            )
    },
    {
        name:
            "SOURCE REVISION IS NOT DERIVED FROM BRANCH",
        passed:
            !/sourceRevision\s*=\s*source\.branch/.test(
                researchPipeline
            )
    },
    {
        name:
            "SEMANTIC ATTRIBUTION DOES NOT INVENT REVISION",
        passed:
            !/sourceRevision\s*:\s*["'`][^"'`]+["'`]/.test(
                sourcePipeline
            )
    }
];


console.log("");
console.log(
    "SEMANTIC SOURCE REVISION CONTINUITY"
);
console.log(
    "-----------------------------------"
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