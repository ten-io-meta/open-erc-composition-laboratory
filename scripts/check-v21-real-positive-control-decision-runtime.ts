import {
    ScientificSupportedControlDecisionEngine
} from "../laboratory/scientific-composition-control-decision/ScientificSupportedControlDecisionEngine.js";

const gates = [
    {
        gate: "QUALIFYING_COMPOSITION_CANDIDATE" as const,
        satisfied: true,
        evidenceIds: ["A1.3b:STRUCTURAL_FOUNDATION"]
    },
    {
        gate: "KNOWN_RELEVANT_BOUNDARIES" as const,
        satisfied: true,
        evidenceIds: ["A2.7:17_RELEVANT_20_OUT_OF_SCOPE"]
    },
    {
        gate: "OBSERVED_RELEVANT_BOUNDARIES" as const,
        satisfied: true,
        evidenceIds: ["A2.7:17_RUNTIME_BOUNDARIES_OBSERVED"]
    },
    {
        gate: "NO_OBSERVED_BOUNDARY_VIOLATION" as const,
        satisfied: true,
        evidenceIds: ["A2.7:17_PRESERVED_0_VIOLATED"]
    },
    {
        gate: "SUFFICIENT_COMPATIBILITY_EVIDENCE" as const,
        satisfied: true,
        evidenceIds: ["A2.7:CANDIDATE_LEVEL_SUPPORT"]
    },
    {
        gate: "FUNCTIONAL_CONFIGURATION_EVIDENCE" as const,
        satisfied: true,
        evidenceIds: ["A2.9b:OBSERVED_RUNTIME_CONFIGURATION_EVIDENCED"]
    }
];

const result =
    new ScientificSupportedControlDecisionEngine()
        .evaluate(gates);

console.log("control: REAL-CONTROL-POSITIVE-8004-8060");
console.log(`gates: ${gates.length}/6`);
console.log(`decision: ${result.decision}`);
console.log(`errors: ${result.errors.length}`);

if (
    result.decision !== "SUPPORTED" ||
    result.errors.length !== 0 ||
    result.missingGates.length !== 0
) {
    throw new Error("Real positive control did not close as SUPPORTED.");
}

console.log("RESULT: PASS");
