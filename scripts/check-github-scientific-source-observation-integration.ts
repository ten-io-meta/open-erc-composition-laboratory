import { readFile } from "fs/promises";


const adapterPath =
    "./laboratory/github-adapter/GitHubAdapter.ts";

const adapterResultPath =
    "./laboratory/github-adapter/GitHubAdapterResult.ts";

const bundlePath =
    "./laboratory/source-adapters/GitHubSourceBundle.ts";

const writerPath =
    "./laboratory/source-adapters/SourceBundleWriter.ts";


const adapter =
    normalize(
        await readFile(
            adapterPath,
            "utf8"
        )
    );

const adapterResult =
    normalize(
        await readFile(
            adapterResultPath,
            "utf8"
        )
    );

const bundle =
    normalize(
        await readFile(
            bundlePath,
            "utf8"
        )
    );

const writer =
    normalize(
        await readFile(
            writerPath,
            "utf8"
        )
    );


const checks: Array<{
    name: string;
    passed: boolean;
}> = [
    {
        name:
            "GITHUB SOURCE BUNDLE SUPPORTS SCIENTIFIC SOURCE OBSERVATIONS",
        passed:
            bundle.includes(
                "sourceObservations?: ScientificSourceObservation[]"
            )
    },
    {
        name:
            "GITHUB SOURCE BUNDLE SUPPORTS SCIENTIFIC SOURCE FACTS",
        passed:
            bundle.includes(
                "sourceFacts?: ScientificSourceFact[]"
            )
    },
    {
        name:
            "GITHUB ADAPTER RESULT EXPOSES SCIENTIFIC SOURCE OBSERVATIONS",
        passed:
            adapterResult.includes(
                "sourceObservations: ScientificSourceObservation[]"
            )
    },
    {
        name:
            "GITHUB ADAPTER RESULT EXPOSES SCIENTIFIC SOURCE FACTS",
        passed:
            adapterResult.includes(
                "sourceFacts: ScientificSourceFact[]"
            )
    },
    {
        name:
            "GITHUB ADAPTER USES SCIENTIFIC SOURCE OBSERVATION EXTRACTOR",
        passed:
            adapter.includes(
                "GitHubScientificSourceObservationExtractor"
            )
    },
    {
        name:
            "GITHUB ADAPTER USES SOLIDITY SCIENTIFIC SOURCE FACT EXTRACTOR",
        passed:
            adapter.includes(
                "SolidityScientificSourceFactExtractor"
            )
    },
    {
        name:
            "GITHUB OBSERVATIONS USE BUNDLE SOURCE ID",
        passed:
            /sourceId\s*:\s*bundle\.sourceId/.test(
                adapter
            )
    },
    {
        name:
            "GITHUB OBSERVATIONS USE PINNED REPOSITORY REVISION",
        passed:
            /sourceRevision\s*:\s*repository\.commitSha/.test(
                adapter
            )
    },
    {
        name:
            "GITHUB OBSERVATIONS USE CANONICAL REPOSITORY LOCATION",
        passed:
            /sourceLocation\s*:\s*bundle\.url/.test(
                adapter
            )
    },
    {
        name:
            "GITHUB OBSERVATIONS USE SCANNED FILES",
        passed:
            /files\s*:\s*files/.test(
                adapter
            )
    },
    {
        name:
            "GITHUB SOURCE FACTS ARE DERIVED FROM SCIENTIFIC OBSERVATIONS",
        passed:
            adapter.includes(
                "sourceObservations.flatMap"
            )
    },
    {
        name:
            "SCIENTIFIC BUNDLE PRESERVES SOURCE OBSERVATIONS",
        passed:
            /sourceObservations\s*,/.test(
                adapter
            )
    },
    {
        name:
            "SCIENTIFIC BUNDLE PRESERVES SOURCE FACTS",
        passed:
            /sourceFacts\s*,/.test(
                adapter
            )
    },
    {
        name:
            "SOURCE BUNDLE WRITER PERSISTS SCIENTIFIC SOURCE OBSERVATIONS",
        passed:
            writer.includes(
                "scientific-source-observations.json"
            ) &&
            writer.includes(
                "bundle.sourceObservations"
            )
    },
    {
        name:
            "SOURCE BUNDLE WRITER PERSISTS SCIENTIFIC SOURCE FACTS",
        passed:
            writer.includes(
                "scientific-source-facts.json"
            ) &&
            writer.includes(
                "bundle.sourceFacts"
            )
    },
    {
        name:
            "GITHUB ADAPTER RESULT RETURNS SCIENTIFIC SOURCE OBSERVATIONS",
        passed:
            /return\s*\{[\s\S]*sourceObservations\s*,/.test(
                adapter
            )
    },
    {
        name:
            "GITHUB ADAPTER RESULT RETURNS SCIENTIFIC SOURCE FACTS",
        passed:
            /return\s*\{[\s\S]*sourceFacts\s*,/.test(
                adapter
            )
    },
    {
        name:
            "GITHUB ADAPTER FAILURE PATH RETURNS EMPTY OBSERVATIONS",
        passed:
            /sourceObservations\s*:\s*\[\]/.test(
                adapter
            )
    },
    {
        name:
            "GITHUB ADAPTER FAILURE PATH RETURNS EMPTY FACTS",
        passed:
            /sourceFacts\s*:\s*\[\]/.test(
                adapter
            )
    },
    {
        name:
            "SCIENTIFIC INTEGRATION DOES NOT USE SEMANTIC REASONING ENGINE",
        passed:
            !adapter.includes(
                "SemanticReasoningEngine"
            )
    },
    {
        name:
            "SCIENTIFIC INTEGRATION DOES NOT USE MACHINE REASONING ENGINE",
        passed:
            !adapter.includes(
                "MachineReasoningEngine"
            )
    },
    {
        name:
            "SCIENTIFIC INTEGRATION DOES NOT USE LEGACY COMPOSITION DISCOVERY",
        passed:
            !adapter.includes(
                "CompositionDiscoveryEngine"
            )
    }
];


console.log("");
console.log(
    "GITHUB SCIENTIFIC SOURCE OBSERVATION INTEGRATION"
);
console.log(
    "------------------------------------------------"
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


if (
    failures.length === 0
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


function normalize(
    value: string
): string {

    return value
        .replace(/\s+/g, " ")
        .trim();

}