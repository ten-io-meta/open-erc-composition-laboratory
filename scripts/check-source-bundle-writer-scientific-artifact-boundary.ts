import {
    readFileSync
} from "node:fs";


const writerPath =
    "./laboratory/source-adapters/SourceBundleWriter.ts";


const source =
    readFileSync(
        writerPath,
        "utf8"
    );


const observationGuard =
    /if\s*\(\s*bundle\.sourceObservations\s*!==\s*undefined\s*\)/;


const factGuard =
    /if\s*\(\s*bundle\.sourceFacts\s*!==\s*undefined\s*\)/;


const checks: Array<{
    name: string;
    passed: boolean;
}> = [
    {
        name:
            "SCIENTIFIC OBSERVATION ARTIFACT HAS EXPLICIT PRESENCE GUARD",
        passed:
            observationGuard.test(
                source
            )
    },
    {
        name:
            "SCIENTIFIC FACT ARTIFACT HAS EXPLICIT PRESENCE GUARD",
        passed:
            factGuard.test(
                source
            )
    },
    {
        name:
            "SCIENTIFIC OBSERVATIONS ARE NOT DEFAULTED TO EMPTY ARRAY",
        passed:
            !source.includes(
                "bundle.sourceObservations ?? []"
            )
    },
    {
        name:
            "SCIENTIFIC FACTS ARE NOT DEFAULTED TO EMPTY ARRAY",
        passed:
            !source.includes(
                "bundle.sourceFacts ?? []"
            )
    },
    {
        name:
            "SCIENTIFIC OBSERVATION ARTIFACT REMAINS SUPPORTED",
        passed:
            source.includes(
                "scientific-source-observations.json"
            )
    },
    {
        name:
            "SCIENTIFIC FACT ARTIFACT REMAINS SUPPORTED",
        passed:
            source.includes(
                "scientific-source-facts.json"
            )
    }
];


console.log("");
console.log(
    "SOURCE BUNDLE WRITER SCIENTIFIC ARTIFACT BOUNDARY"
);
console.log(
    "-------------------------------------------------"
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