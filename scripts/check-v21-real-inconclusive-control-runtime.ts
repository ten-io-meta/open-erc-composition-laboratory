import { readFile } from "node:fs/promises";

const benchmark =
    JSON.parse(
        await readFile(
            "./benchmarks/scientific-composition-controls/real-controls-v1.json",
            "utf8"
        )
    );

const control =
    benchmark.controls.find(
        (item: any) =>
            item.controlId ===
            "REAL-CONTROL-INCONCLUSIVE-8301-8354"
    );

if (!control) {
    throw new Error("Inconclusive control missing.");
}

const evidence =
    control.knownEvidence;

const reasons: string[] = [];

if (evidence.knownCandidateBoundaries === 0) {
    reasons.push("NO_KNOWN_BOUNDARIES");
}

if (evidence.candidateCompatibilityObservations === 0) {
    reasons.push("NO_CANDIDATE_COMPATIBILITY_OBSERVATIONS");
}

if (evidence.functionalConfigurations === 0) {
    reasons.push("GLOBAL_COMPOSITION_NOT_ESTABLISHED");
}

const decision =
    reasons.length > 0
        ? "INCONCLUSIVE"
        : "UNRESOLVED";

console.log(
    "control: REAL-CONTROL-INCONCLUSIVE-8301-8354"
);
console.log(
    `documentary evidence: ${evidence.documentaryRelationEvidenceCount}`
);
console.log(
    `known boundaries: ${evidence.knownCandidateBoundaries}`
);
console.log(
    `compatibility observations: ${evidence.candidateCompatibilityObservations}`
);
console.log(
    `functional configurations: ${evidence.functionalConfigurations}`
);
console.log(`decision: ${decision}`);

const expectedReasons =
    new Set(control.expectedReasons);

if (
    control.selectionStatus !== "LOCKED" ||
    control.expectedFinalDecision !== "INCONCLUSIVE" ||
    evidence.documentaryRelationEvidenceCount !== 2 ||
    decision !== "INCONCLUSIVE" ||
    !reasons.every(reason => expectedReasons.has(reason))
) {
    throw new Error(
        "Real inconclusive control contract not satisfied."
    );
}

console.log("RESULT: PASS");
