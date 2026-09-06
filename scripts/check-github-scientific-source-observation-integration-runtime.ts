import {
    GitHubAdapter
} from "../laboratory/github-adapter/GitHubAdapter.js";

import {
    GitHubRepositoryLoader
} from "../laboratory/github-adapter/GitHubRepositoryLoader.js";

import {
    GitHubFileScanner
} from "../laboratory/github-adapter/GitHubFileScanner.js";

import {
    GitHubSemanticExtractor
} from "../laboratory/github-adapter/GitHubSemanticExtractor.js";

import {
    GitHubClaimExtractor
} from "../laboratory/github-adapter/GitHubClaimExtractor.js";

import {
    GitHubEvidenceExtractor
} from "../laboratory/github-adapter/GitHubEvidenceExtractor.js";

import {
    GitHubRepositoryIntelligence
} from "../laboratory/github-adapter/GitHubRepositoryIntelligence.js";

import {
    SourceBundleWriter
} from "../laboratory/source-adapters/SourceBundleWriter.js";


const originalRepositoryLoad =
    GitHubRepositoryLoader.prototype.load;

const originalScan =
    GitHubFileScanner.prototype.scan;

const originalExtractProtocols =
    GitHubSemanticExtractor.prototype.extractProtocols;

const originalExtractCapabilities =
    GitHubSemanticExtractor.prototype.extractCapabilities;

const originalExtractClaims =
    GitHubClaimExtractor.prototype.extract;

const originalEvidenceExtract =
    GitHubEvidenceExtractor.prototype.extract;

const originalIntelligenceAnalyze =
    GitHubRepositoryIntelligence.prototype.analyze;

const originalWrite =
    SourceBundleWriter.prototype.write;


let writtenBundle: any =
    null;

let result: any =
    null;

let executionSucceeded =
    false;


try {

    GitHubRepositoryLoader.prototype.load =
        async function () {

            return {
                owner:
                    "example",

                repo:
                    "repository",

                url:
                    "https://github.com/example/repository",

                localPath:
                    "./external/github/example/repository",

                defaultBranch:
                    "main",

                commitSha:
                    "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",

                worktreeClean:
                    true
            };

        };


    GitHubFileScanner.prototype.scan =
        async function () {

            return [
                {
                    path:
                        "/contracts/Example.sol",

                    content:
`contract Example {
    uint256 public value;

    function setValue(uint256 next) external {
        require(next > 0, "zero");
        value = next;
    }
}`
                }
            ];

        };


    GitHubSemanticExtractor.prototype.extractProtocols =
        function () {

            return [];

        };


    GitHubSemanticExtractor.prototype.extractCapabilities =
        function () {

            return [];

        };


    GitHubClaimExtractor.prototype.extract =
        function () {

            return [];

        };


    GitHubEvidenceExtractor.prototype.extract =
        function () {

            return {
                quality:
                    "HIGH",

                confidenceWeight:
                    0.85,

                reproducible:
                    true,

                hasImplementation:
                    true,

                hasTests:
                    false,

                hasInvariants:
                    false,

                hasCoverage:
                    false,

                hasCitation:
                    false,

                observations:
                    []
            };

        };


    GitHubRepositoryIntelligence.prototype.analyze =
        function () {

            return {
                structure: {
                    readmes:
                        0,

                    contracts:
                        1,

                    tests:
                        0,

                    docs:
                        0,

                    configs:
                        0,

                    workflows:
                        0,

                    totalFiles:
                        1
                },

                toolchain:
                    "UNKNOWN",

                invariants:
                    [],

                executableTargets:
                    [],

                intelligenceSignals:
                    []
            };

        };


    SourceBundleWriter.prototype.write =
        async function (
            bundle: any
        ) {

            writtenBundle =
                bundle;

        };


    const adapter =
        new GitHubAdapter();


    result =
        await adapter.run({
            owner:
                "example",

            repo:
                "repository"
        });


    executionSucceeded =
        true;

} finally {

    GitHubRepositoryLoader.prototype.load =
        originalRepositoryLoad;

    GitHubFileScanner.prototype.scan =
        originalScan;

    GitHubSemanticExtractor.prototype.extractProtocols =
        originalExtractProtocols;

    GitHubSemanticExtractor.prototype.extractCapabilities =
        originalExtractCapabilities;

    GitHubClaimExtractor.prototype.extract =
        originalExtractClaims;

    GitHubEvidenceExtractor.prototype.extract =
        originalEvidenceExtract;

    GitHubRepositoryIntelligence.prototype.analyze =
        originalIntelligenceAnalyze;

    SourceBundleWriter.prototype.write =
        originalWrite;

}


const observations =
    result?.sourceObservations ??
    [];

const facts =
    result?.sourceFacts ??
    [];

const contractObservation =
    observations.find(
        (observation: any) =>
            observation.locator?.filePath ===
            "/contracts/Example.sol"
    );

const functionFact =
    facts.find(
        (fact: any) =>
            fact.kind ===
                "FUNCTION_DECLARATION" &&
            fact.symbol ===
                "setValue"
    );

const requireFact =
    facts.find(
        (fact: any) =>
            fact.kind ===
            "REQUIRE_STATEMENT"
    );


const checks: Array<{
    name: string;
    passed: boolean;
}> = [
    {
        name:
            "GITHUB ADAPTER RUNTIME EXECUTION SUCCEEDS",
        passed:
            executionSucceeded
    },
    {
        name:
            "GITHUB ADAPTER RETURNS ONE SCIENTIFIC SOURCE OBSERVATION",
        passed:
            observations.length ===
            1
    },
    {
        name:
            "RUNTIME OBSERVATION USES BUNDLE SOURCE ID",
        passed:
            contractObservation?.sourceId ===
            "GITHUB-EXAMPLE-REPOSITORY"
    },
    {
        name:
            "RUNTIME OBSERVATION PRESERVES COMMIT SHA",
        passed:
            contractObservation?.sourceRevision ===
            "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
    },
    {
        name:
            "RUNTIME OBSERVATION PRESERVES REPOSITORY LOCATION",
        passed:
            contractObservation
                ?.locator
                ?.sourceLocation ===
            "https://github.com/example/repository"
    },
    {
        name:
            "RUNTIME OBSERVATION PRESERVES FILE PATH",
        passed:
            contractObservation
                ?.locator
                ?.filePath ===
            "/contracts/Example.sol"
    },
    {
        name:
            "RUNTIME OBSERVATION PRESERVES RAW SOURCE",
        passed:
            contractObservation
                ?.rawText
                ?.includes(
                    "contract Example"
                ) ===
            true
    },
    {
        name:
            "RUNTIME FACT EXTRACTION OBSERVES FUNCTION",
        passed:
            functionFact !==
            undefined
    },
    {
        name:
            "RUNTIME FACT EXTRACTION OBSERVES REQUIRE",
        passed:
            requireFact !==
            undefined
    },
    {
        name:
            "RUNTIME FACT PRESERVES OBSERVATION ID",
        passed:
            functionFact?.observationId ===
            contractObservation?.observationId
    },
    {
        name:
            "RUNTIME FACT PRESERVES SOURCE REVISION",
        passed:
            functionFact?.sourceRevision ===
            "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
    },
    {
        name:
            "RUNTIME FACT PRESERVES FILE PATH",
        passed:
            functionFact
                ?.locator
                ?.filePath ===
            "/contracts/Example.sol"
    },
    {
        name:
            "WRITTEN BUNDLE RECEIVES SCIENTIFIC SOURCE OBSERVATIONS",
        passed:
            Array.isArray(
                writtenBundle?.sourceObservations
            ) &&
            writtenBundle.sourceObservations.length ===
            1
    },
    {
        name:
            "WRITTEN BUNDLE RECEIVES SCIENTIFIC SOURCE FACTS",
        passed:
            Array.isArray(
                writtenBundle?.sourceFacts
            ) &&
            writtenBundle.sourceFacts.length >
            0
    },
    {
        name:
            "WRITTEN BUNDLE AND RESULT SHARE OBSERVATION IDENTITY",
        passed:
            writtenBundle
                ?.sourceObservations?.[0]
                ?.observationId ===
            observations[0]?.observationId
    },
    {
        name:
            "WRITTEN BUNDLE AND RESULT SHARE FACT IDENTITY",
        passed:
            writtenBundle
                ?.sourceFacts?.[0]
                ?.factId ===
            facts[0]?.factId
    },
    {
        name:
            "RUNTIME OBSERVATIONS DO NOT CONTAIN PROTOCOL PAIR",
        passed:
            observations.every(
                (observation: any) =>
                    !Object.prototype.hasOwnProperty.call(
                        observation,
                        "protocolPair"
                    )
            )
    },
    {
        name:
            "RUNTIME FACTS DO NOT CONTAIN CAPABILITY PAIR",
        passed:
            facts.every(
                (fact: any) =>
                    !Object.prototype.hasOwnProperty.call(
                        fact,
                        "capabilityPair"
                    )
            )
    },
    {
        name:
            "RUNTIME FACTS DO NOT CONTAIN SEMANTIC RELATION",
        passed:
            facts.every(
                (fact: any) =>
                    !Object.prototype.hasOwnProperty.call(
                        fact,
                        "relation"
                    )
            )
    },
    {
        name:
            "RUNTIME FACTS DO NOT CONTAIN COMPOSITION CONFIDENCE",
        passed:
            facts.every(
                (fact: any) =>
                    !Object.prototype.hasOwnProperty.call(
                        fact,
                        "confidence"
                    )
            )
    },
    {
        name:
            "RUNTIME TEST DOES NOT WRITE REAL SOURCE BUNDLE",
        passed:
            writtenBundle !==
            null
    }
];


console.log("");
console.log(
    "GITHUB SCIENTIFIC SOURCE OBSERVATION INTEGRATION RUNTIME"
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