import {
    readFile
} from "fs/promises";

const path =
    "./laboratory/research-evolution/ResearchEvolutionEngine.ts";

const source =
    normalize(
        await readFile(
            path,
            "utf8"
        )
    );

const entityIdStart =
    source.indexOf(
        "id: this.entityId("
    );

const entityIdWindow =
    entityIdStart >= 0
        ? source.slice(
            entityIdStart,
            entityIdStart + 800
        )
        : "";

const hasKnowledgeFallback =
    /entry\.knowledgeId\s*\?\?\s*entry\.id\s*\?\?/
        .test(
            entityIdWindow
        );

const hasRelationIdentity =
    /entry\.relation\s*\?\?\s*statement/
        .test(
            entityIdWindow
        );

const hasProtocolIdentity =
    /entry\.protocolPair\s*\?\?\s*""/
        .test(
            entityIdWindow
        );

const hasCapabilityIdentity =
    /entry\.capabilityPair\s*\?\?\s*""/
        .test(
            entityIdWindow
        );

const checks: Array<{
    name: string;
    passed: boolean;
}> = [
    {
        name:
            "RESEARCH EVOLUTION HAS KNOWLEDGE ID FALLBACK",
        passed:
            hasKnowledgeFallback
    },
    {
        name:
            "FALLBACK PRESERVES RELATION IDENTITY",
        passed:
            hasRelationIdentity
    },
    {
        name:
            "FALLBACK PRESERVES PROTOCOL IDENTITY WHEN KNOWN",
        passed:
            hasProtocolIdentity
    },
    {
        name:
            "FALLBACK PRESERVES CAPABILITY IDENTITY WHEN KNOWN",
        passed:
            hasCapabilityIdentity
    },
    {
        name:
            "FALLBACK IDENTITY CONTAINS BOTH PROTOCOL AND CAPABILITY DIMENSIONS",
        passed:
            hasProtocolIdentity &&
            hasCapabilityIdentity
    }
];

console.log("");
console.log(
    "RESEARCH EVOLUTION SEMANTIC IDENTITY BOUNDARY"
);
console.log(
    "---------------------------------------------"
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

function normalize(
    value: string
): string {
    return value
        .replace(/\s+/g, " ")
        .trim();
}