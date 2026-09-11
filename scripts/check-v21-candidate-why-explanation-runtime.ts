import {
    ScientificCandidateWhyExplanationEngine
} from "../laboratory/scientific-why-explanation/ScientificCandidateWhyExplanationEngine.js";

const engine = new ScientificCandidateWhyExplanationEngine();

function summary(
    polarity: "SUPPORT" | "CHALLENGE" | "INCONCLUSIVE",
    gaps: number,
    unevaluated: number,
    unresolved: number,
    functional: number
) {
    return {
        candidateId: "CANDIDATE-A",
        candidateKind: "STRUCTURAL_FOUNDATION",
        compatibilityPolarity: polarity,
        evidenceGaps: gaps,
        unevaluatedBoundaries: unevaluated,
        unresolvedRelevance: unresolved,
        functionalConfigurationCount: functional,
        reasonCodes: [],
        sourceParticipantId: "ERC8004",
        targetParticipantId: "ERC8060"
    } as any;
}

const support = engine.project(
    "WHY-SUPPORT",
    summary("SUPPORT", 0, 0, 0, 1)
);

const inconclusive = engine.project(
    "WHY-INCONCLUSIVE",
    summary("INCONCLUSIVE", 2, 3, 1, 0)
);

const challenge = engine.project(
    "WHY-CHALLENGE",
    summary("CHALLENGE", 0, 0, 0, 0)
);

const invalid = engine.project(
    "   ",
    summary("SUPPORT", 0, 0, 0, 0)
);

const checks = [
    ["SUPPORT POLARITY PRESERVED",
        support.explanation?.compatibilityPolarity === "SUPPORT"],

    ["FUNCTIONAL EVIDENCE IS OBSERVATION ONLY",
        support.explanation?.observations.includes(
            "FUNCTIONAL_CONFIGURATION_EVIDENCED"
        ) === true],

    ["INCONCLUSIVE POLARITY PRESERVED",
        inconclusive.explanation?.compatibilityPolarity === "INCONCLUSIVE"],

    ["GAPS PROJECT TO OBSERVATIONS",
        inconclusive.explanation?.observations.includes(
            "EVIDENCE_GAPS_PRESENT"
        ) === true &&
        inconclusive.explanation?.observations.includes(
            "UNEVALUATED_BOUNDARIES_PRESENT"
        ) === true &&
        inconclusive.explanation?.observations.includes(
            "UNRESOLVED_RELEVANCE_PRESENT"
        ) === true],

    ["CHALLENGE POLARITY PRESERVED",
        challenge.explanation?.compatibilityPolarity === "CHALLENGE"],

    ["EMPTY EXPLANATION ID FAILS CLOSED",
        invalid.explanation === null &&
        invalid.errors.length > 0],

    ["EXPLANATION REMAINS PROJECTION ONLY",
        support.explanation?.explanationAuthority ===
            "UPSTREAM_DOSSIER_STATE_ONLY"]
] as const;

let failures = 0;

for (const [name, ok] of checks) {
    console.log(`${name}: ${ok ? "PASS" : "FAIL"}`);
    if (!ok) failures++;
}

console.log(`RESULT: ${failures === 0 ? "PASS" : "FAIL"}`);

if (failures > 0) process.exitCode = 1;
