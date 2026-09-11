import { readFile } from "fs/promises";

const extractorPath =
    "./laboratory/github-adapter/GitHubScientificSourceObservationExtractor.ts";

const extractorSource =
    await readFileSafe(
        extractorPath
    );

let observations: any[] = [];

let extractorLoaded =
    false;

let extractionSucceeded =
    false;

try {

    const modulePath =
        "../laboratory/github-adapter/GitHubScientificSourceObservationExtractor.js";

    const imported =
        await import(
            modulePath
        );

    const Extractor =
        imported.GitHubScientificSourceObservationExtractor;

    if (
        typeof Extractor ===
        "function"
    ) {

        extractorLoaded =
            true;

        const extractor =
            new Extractor();

        /*
         * Deliberately reverse lexical file order.
         *
         * The extractor must establish deterministic ordering
         * independently of filesystem traversal order.
         */
        observations =
            extractor.extract({
                sourceId:
                    "SOURCE-A",

                sourceRevision:
                    "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",

                sourceLocation:
                    "https://github.com/example/repository",

                files: [
                    {
                        path:
                            "/README.md",

                        content:
                            "# Example\nResearch documentation"
                    },
                    {
                        path:
                            "/empty.md",

                        content:
                            ""
                    },
                    {
                        path:
                            "/contracts/Example.sol",

                        content:
                            "contract Example {\n    uint256 value;\n}"
                    }
                ]
            });

        extractionSucceeded =
            Array.isArray(
                observations
            );

    }

} catch {

    observations =
        [];

}

const contractObservation =
    observations.find(
        observation =>
            observation.locator?.filePath ===
            "/contracts/Example.sol"
    );

const documentationObservation =
    observations.find(
        observation =>
            observation.locator?.filePath ===
            "/README.md"
    );

const forbiddenFields = [
    "protocolPair",
    "capabilityPair",
    "relation",
    "confidence"
];

const hasForbiddenObservationField =
    observations.some(
        observation =>
            forbiddenFields.some(
                field =>
                    Object.prototype.hasOwnProperty.call(
                        observation,
                        field
                    )
            )
    );

const checks: Array<{
    name: string;
    passed: boolean;
}> = [
    {
        name:
            "GITHUB SCIENTIFIC SOURCE OBSERVATION EXTRACTOR EXISTS",
        passed:
            extractorSource.length > 0
    },
    {
        name:
            "GITHUB SCIENTIFIC SOURCE OBSERVATION EXTRACTOR LOADS",
        passed:
            extractorLoaded
    },
    {
        name:
            "GITHUB SCIENTIFIC SOURCE OBSERVATION EXTRACTION SUCCEEDS",
        passed:
            extractionSucceeded
    },
    {
        name:
            "EMPTY SOURCE FILE DOES NOT CREATE SCIENTIFIC OBSERVATION",
        passed:
            observations.length === 2
    },
    {
        name:
            "OBSERVATION ORDER IS DETERMINISTIC BY FILE PATH",
        passed:
            observations.length === 2 &&
            observations[0]?.locator?.filePath ===
                "/contracts/Example.sol" &&
            observations[1]?.locator?.filePath ===
                "/README.md"
    },
    {
        name:
            "OBSERVATION IDS ARE DETERMINISTIC",
        passed:
            observations[0]?.observationId ===
                "SOURCE-A-OBS-00001" &&
            observations[1]?.observationId ===
                "SOURCE-A-OBS-00002"
    },
    {
        name:
            "OBSERVATIONS PRESERVE SOURCE ID",
        passed:
            observations.length === 2 &&
            observations.every(
                observation =>
                    observation.sourceId ===
                    "SOURCE-A"
            )
    },
    {
        name:
            "OBSERVATIONS PRESERVE GITHUB SOURCE TYPE",
        passed:
            observations.length === 2 &&
            observations.every(
                observation =>
                    observation.sourceType ===
                    "GITHUB"
            )
    },
    {
        name:
            "OBSERVATIONS PRESERVE SOURCE REVISION",
        passed:
            observations.length === 2 &&
            observations.every(
                observation =>
                    observation.sourceRevision ===
                    "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
            )
    },
    {
        name:
            "OBSERVATIONS PRESERVE SOURCE LOCATION",
        passed:
            observations.length === 2 &&
            observations.every(
                observation =>
                    observation.locator?.sourceLocation ===
                    "https://github.com/example/repository"
            )
    },
    {
        name:
            "CONTRACT OBSERVATION PRESERVES FILE PATH",
        passed:
            contractObservation?.locator?.filePath ===
            "/contracts/Example.sol"
    },
    {
        name:
            "CONTRACT OBSERVATION PRESERVES START LINE",
        passed:
            contractObservation?.locator?.startLine ===
            1
    },
    {
        name:
            "CONTRACT OBSERVATION PRESERVES END LINE",
        passed:
            contractObservation?.locator?.endLine ===
            3
    },
    {
        name:
            "CONTRACT OBSERVATION PRESERVES RAW SOURCE",
        passed:
            contractObservation?.rawText ===
            "contract Example {\n    uint256 value;\n}"
    },
    {
        name:
            "CONTRACT FILE IS CLASSIFIED STRUCTURALLY",
        passed:
            contractObservation?.kind ===
            "CONTRACT_SOURCE"
    },
    {
        name:
            "DOCUMENTATION FILE IS CLASSIFIED STRUCTURALLY",
        passed:
            documentationObservation?.kind ===
            "DOCUMENTATION"
    },
    {
        name:
            "OBSERVATIONS DO NOT PRECOMPUTE SEMANTIC ANSWERS",
        passed:
            observations.length === 2 &&
            !hasForbiddenObservationField
    },
    {
        name:
            "EXTRACTOR DOES NOT DEPEND ON SEMANTIC REASONING ENGINE",
        passed:
            extractorSource.length > 0 &&
            !extractorSource.includes(
                "SemanticReasoningEngine"
            )
    },
    {
        name:
            "EXTRACTOR DOES NOT DEPEND ON MACHINE REASONING ENGINE",
        passed:
            extractorSource.length > 0 &&
            !extractorSource.includes(
                "MachineReasoningEngine"
            )
    },
    {
        name:
            "EXTRACTOR DOES NOT DEPEND ON COMPOSITION SIGNAL EXTRACTOR",
        passed:
            extractorSource.length > 0 &&
            !extractorSource.includes(
                "GitHubCompositionSignalExtractor"
            )
    },
    {
        name:
            "EXTRACTOR DOES NOT DEPEND ON PROTOCOL SEMANTIC TABLE",
        passed:
            extractorSource.length > 0 &&
            !extractorSource.includes(
                "ProtocolSemanticExtractor"
            )
    },
    {
        name:
            "EXTRACTOR DOES NOT DEPEND ON LEGACY COMPOSITION DISCOVERY",
        passed:
            extractorSource.length > 0 &&
            !extractorSource.includes(
                "CompositionDiscoveryEngine"
            )
    }
];

console.log("");
console.log(
    "GITHUB SCIENTIFIC SOURCE OBSERVATION EXTRACTION"
);
console.log(
    "-----------------------------------------------"
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