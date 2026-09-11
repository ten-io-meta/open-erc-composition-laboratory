import { readFile } from "fs/promises";

const observationPath =
    "./laboratory/scientific-source-observation/ScientificSourceObservation.ts";

const locatorPath =
    "./laboratory/scientific-source-observation/ScientificSourceObservationLocator.ts";

const observation =
    normalize(
        await readFileSafe(
            observationPath
        )
    );

const locator =
    normalize(
        await readFileSafe(
            locatorPath
        )
    );

const checks: Array<{
    name: string;
    passed: boolean;
}> = [
    {
        name:
            "SCIENTIFIC SOURCE OBSERVATION CONTRACT EXISTS",
        passed:
            observation.length > 0
    },
    {
        name:
            "SCIENTIFIC SOURCE OBSERVATION DECLARES OBSERVATION ID",
        passed:
            observation.includes(
                "observationId: string"
            )
    },
    {
        name:
            "SCIENTIFIC SOURCE OBSERVATION PRESERVES SOURCE ID",
        passed:
            observation.includes(
                "sourceId: string"
            )
    },
    {
        name:
            "SCIENTIFIC SOURCE OBSERVATION PRESERVES SOURCE TYPE",
        passed:
            observation.includes(
                "sourceType: string"
            )
    },
    {
        name:
            "SCIENTIFIC SOURCE OBSERVATION PRESERVES OPTIONAL SOURCE REVISION",
        passed:
            observation.includes(
                "sourceRevision?: string"
            )
    },
    {
        name:
            "SCIENTIFIC SOURCE OBSERVATION PRESERVES OBSERVATION KIND",
        passed:
            observation.includes(
                "kind: ScientificSourceObservationKind"
            )
    },
    {
        name:
            "SCIENTIFIC SOURCE OBSERVATION PRESERVES RAW TEXT",
        passed:
            observation.includes(
                "rawText: string"
            )
    },
    {
        name:
            "SCIENTIFIC SOURCE OBSERVATION USES STRUCTURED LOCATOR",
        passed:
            observation.includes(
                "locator: ScientificSourceObservationLocator"
            )
    },
    {
        name:
            "SCIENTIFIC SOURCE LOCATOR CONTRACT EXISTS",
        passed:
            locator.length > 0
    },
    {
        name:
            "SCIENTIFIC SOURCE LOCATOR PRESERVES SOURCE LOCATION",
        passed:
            locator.includes(
                "sourceLocation: string"
            )
    },
    {
        name:
            "SCIENTIFIC SOURCE LOCATOR SUPPORTS FILE PATH",
        passed:
            locator.includes(
                "filePath?: string"
            )
    },
    {
        name:
            "SCIENTIFIC SOURCE LOCATOR SUPPORTS START LINE",
        passed:
            locator.includes(
                "startLine?: number"
            )
    },
    {
        name:
            "SCIENTIFIC SOURCE LOCATOR SUPPORTS END LINE",
        passed:
            locator.includes(
                "endLine?: number"
            )
    },
    {
        name:
            "SOURCE OBSERVATION DOES NOT PRECOMPUTE PROTOCOL PAIR",
        passed:
            !observation.includes(
                "protocolPair"
            )
    },
    {
        name:
            "SOURCE OBSERVATION DOES NOT PRECOMPUTE CAPABILITY PAIR",
        passed:
            !observation.includes(
                "capabilityPair"
            )
    },
    {
        name:
            "SOURCE OBSERVATION DOES NOT PRECOMPUTE SEMANTIC RELATION",
        passed:
            !/\brelation\s*:/.test(
                observation
            )
    },
    {
        name:
            "SOURCE OBSERVATION DOES NOT PRECOMPUTE COMPOSITION CONFIDENCE",
        passed:
            !/\bconfidence\s*:/.test(
                observation
            )
    },
    {
        name:
            "SOURCE OBSERVATION DOES NOT PRECOMPUTE COMPOSITION CANDIDATE",
        passed:
            !observation.includes(
                "CompositionCandidate"
            )
    }
];

console.log("");
console.log(
    "SCIENTIFIC SOURCE OBSERVATION BOUNDARY"
);
console.log(
    "--------------------------------------"
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

async function readFileSafe(
    path: string
): Promise<string> {

    try {
        return await readFile(
            path,
            "utf8"
        );
    } catch {
        return "";
    }

}

function normalize(
    value: string
): string {

    return value
        .replace(/\s+/g, " ")
        .trim();

}