import {
    readFileSync
} from "node:fs";


const pipelinePath =
    "./laboratory/orchestration/source-pipeline/SourcePipeline.ts";


const source =
    readFileSync(
        pipelinePath,
        "utf8"
    );


const checks: Array<{
    name: string;
    passed: boolean;
}> = [
    {
        name:
            "SOURCE PIPELINE USES SCIENTIFIC SEMANTIC DERIVATION ENGINE",
        passed:
            source.includes(
                "ScientificSemanticDerivationEngine"
            )
    },
    {
        name:
            "SOURCE PIPELINE USES SCIENTIFIC SOURCE FACT CONTRACT",
        passed:
            source.includes(
                "ScientificSourceFact"
            )
    },
    {
        name:
            "SOURCE PIPELINE RESOLVES SOURCE ENTRY BY SOURCE ID",
        passed:
            /sources\.find\([\s\S]*?sourceId\s*===\s*result\.sourceId/.test(
                source
            )
    },
    {
        name:
            "SOURCE PIPELINE RESOLVES SCIENTIFIC FACT ARTIFACT",
        passed:
            source.includes(
                "scientific-source-facts.json"
            )
    },
    {
        name:
            "SCIENTIFIC DERIVATION USES EXECUTED SOURCE ID",
        passed:
            /derive\(\{[\s\S]*?sourceId\s*:\s*result\.sourceId/.test(
                source
            )
    },
    {
        name:
            "SCIENTIFIC DERIVATION USES EXECUTED SOURCE REVISION",
        passed:
            /derive\(\{[\s\S]*?sourceRevision\s*:\s*result\.sourceRevision/.test(
                source
            )
    },
    {
        name:
            "SCIENTIFIC DERIVATION CONSUMES LOADED FACTS",
        passed:
            /derive\(\{[\s\S]*?facts\s*:/.test(
                source
            )
    },
    {
        name:
            "SCIENTIFIC MODEL IS ATTRIBUTED WITH SOURCE ID",
        passed:
            /attributedSemanticModels\.push\(\{[\s\S]*?sourceId\s*:\s*result\.sourceId/.test(
                source
            )
    },
    {
        name:
            "SCIENTIFIC MODEL IS ATTRIBUTED WITH SOURCE REVISION",
        passed:
            /attributedSemanticModels\.push\(\{[\s\S]*?sourceRevision\s*:\s*result\.sourceRevision/.test(
                source
            )
    },
    {
        name:
            "SCIENTIFIC DERIVED MODEL REACHES ATTRIBUTION",
        passed:
            /model\s*:\s*scientificSemanticResult\.model/.test(
                source
            )
    },
    {
        name:
            "SCIENTIFIC DERIVATION ERRORS ARE NOT SILENTLY IGNORED",
        passed:
            /scientificSemanticResult\.errors\.length\s*>\s*0/.test(
                source
            )
    },
    {
        name:
            "LEGACY SEMANTIC MODEL REMAINS AVAILABLE AS FALLBACK",
        passed:
            source.includes(
                "semantic-model.json"
            )
    },
    {
        name:
            "LEGACY FALLBACK IS LIMITED TO MISSING SCIENTIFIC FACT ARTIFACT",
        passed:
            source.includes(
                "ENOENT"
            )
    },
    {
        name:
            "SOURCE PIPELINE DOES NOT CALL SEMANTIC REASONING ENGINE",
        passed:
            !source.includes(
                "new SemanticReasoningEngine"
            )
    },
    {
        name:
            "SOURCE PIPELINE DOES NOT CALL MACHINE REASONING ENGINE",
        passed:
            !source.includes(
                "new MachineReasoningEngine"
            )
    },
    {
        name:
            "SOURCE PIPELINE DOES NOT CALL LEGACY COMPOSITION DISCOVERY",
        passed:
            !source.includes(
                "CompositionDiscoveryEngine"
            )
    }
];


console.log("");
console.log(
    "SOURCE PIPELINE SCIENTIFIC SEMANTIC PRECEDENCE"
);
console.log(
    "----------------------------------------------"
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