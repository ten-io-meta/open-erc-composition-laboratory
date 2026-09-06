import { readFile } from "fs/promises";

const sourcePipelinePath =
    "./laboratory/orchestration/source-pipeline/SourcePipeline.ts";

const sourcePipelineResultPath =
    "./laboratory/orchestration/source-pipeline/SourcePipelineResult.ts";

const sourcePipeline =
    normalize(
        await readFile(
            sourcePipelinePath,
            "utf8"
        )
    );

const sourcePipelineResult =
    normalize(
        await readFile(
            sourcePipelineResultPath,
            "utf8"
        )
    );

const checks: Array<{
    name: string;
    passed: boolean;
}> = [
    {
        name:
            "SOURCE PIPELINE RESULT DECLARES ATTRIBUTED SEMANTIC MODEL TYPE",
        passed:
            sourcePipelineResult.includes(
                "export interface AttributedSemanticModel"
            )
    },
    {
        name:
            "ATTRIBUTED SEMANTIC MODEL PRESERVES SOURCE ID",
        passed:
            sourcePipelineResult.includes(
                "sourceId: string"
            )
    },
    {
        name:
            "ATTRIBUTED SEMANTIC MODEL PRESERVES SEMANTIC MODEL",
        passed:
            sourcePipelineResult.includes(
                "model: SemanticModel"
            )
    },
    {
        name:
            "SOURCE PIPELINE RESULT EXPOSES ATTRIBUTED SEMANTIC MODELS",
        passed:
            sourcePipelineResult.includes(
                "attributedSemanticModels: AttributedSemanticModel[]"
            )
    },
    {
        name:
            "SOURCE PIPELINE LOADS PER-SOURCE SEMANTIC MODEL ARTIFACT",
        passed:
            sourcePipeline.includes(
                "semantic-model.json"
            )
    },
    {
        name:
            "SEMANTIC MODEL ATTRIBUTION USES EXECUTED SOURCE ID",
        passed:
            /sourceId\s*:\s*result\.sourceId/.test(
                sourcePipeline
            )
    },
    {
        name:
            "ATTRIBUTION PRESERVES DISCOVERED SEMANTIC MODEL",
        passed:
            /model\s*:\s*semanticDiscoveryResult\.model/.test(
                sourcePipeline
            )
    },
    {
        name:
            "SOURCE PIPELINE RETURNS ATTRIBUTED SEMANTIC MODELS",
        passed:
            /return\s*\{[^}]*attributedSemanticModels/s.test(
                sourcePipeline
            )
    },
    {
        name:
            "SOURCE PIPELINE STATISTICS COUNT ATTRIBUTED SEMANTIC MODELS",
        passed:
            sourcePipelineResult.includes(
                "attributedSemanticModels: number"
            ) &&
            /attributedSemanticModels\s*:\s*attributedSemanticModels\.length/.test(
                sourcePipeline
            )
    }
];

console.log("");
console.log(
    "SOURCE PIPELINE SEMANTIC MODEL ATTRIBUTION"
);
console.log(
    "------------------------------------------"
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
        check => !check.passed
    );

console.log("");

if (failures.length === 0) {
    console.log("RESULT: PASS");
} else {
    console.log(
        `RESULT: FAIL (${failures.length}/${checks.length})`
    );

    process.exitCode = 1;
}

function normalize(
    value: string
): string {
    return value
        .replace(/\s+/g, " ")
        .trim();
}