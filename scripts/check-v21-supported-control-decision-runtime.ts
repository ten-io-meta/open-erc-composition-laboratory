import {
    SCIENTIFIC_SUPPORTED_CONTROL_GATES,
    ScientificSupportedControlDecisionEngine
} from "../laboratory/scientific-composition-control-decision/ScientificSupportedControlDecisionEngine.js";

let pass = 0;
let fail = 0;

function check(name: string, ok: boolean): void {
    console.log(`${name}: ${ok ? "PASS" : "FAIL"}`);
    ok ? pass++ : fail++;
}

const engine =
    new ScientificSupportedControlDecisionEngine();

const complete =
    SCIENTIFIC_SUPPORTED_CONTROL_GATES.map(
        gate => ({
            gate,
            satisfied: true,
            evidenceIds: [`EVIDENCE:${gate}`]
        })
    );

const supported =
    engine.evaluate(complete);

check(
    "6 OF 6 EVIDENCED GATES -> SUPPORTED",
    supported.decision === "SUPPORTED" &&
    supported.errors.length === 0 &&
    supported.missingGates.length === 0
);

const incomplete =
    engine.evaluate(
        complete.map(
            item =>
                item.gate === "FUNCTIONAL_CONFIGURATION_EVIDENCE"
                    ? { ...item, satisfied: false }
                    : item
        )
    );

check(
    "5 OF 6 GATES -> INCONCLUSIVE",
    incomplete.decision === "INCONCLUSIVE" &&
    incomplete.missingGates.includes(
        "FUNCTIONAL_CONFIGURATION_EVIDENCE"
    )
);

const noEvidence =
    engine.evaluate(
        complete.map(
            item =>
                item.gate === "KNOWN_RELEVANT_BOUNDARIES"
                    ? { ...item, evidenceIds: [] }
                    : item
        )
    );

check(
    "SATISFIED GATE WITHOUT EVIDENCE FAILS CLOSED",
    noEvidence.decision === "INCONCLUSIVE" &&
    noEvidence.errors.length > 0
);

const missingGate =
    engine.evaluate(
        complete.slice(0, 5)
    );

check(
    "MISSING GATE FAILS CLOSED",
    missingGate.decision === "INCONCLUSIVE" &&
    missingGate.errors.length > 0
);

console.log("");
console.log(`PASS: ${pass}`);
console.log(`FAIL: ${fail}`);
console.log(`RESULT: ${fail === 0 ? "PASS" : "FAIL"}`);

if (fail > 0) process.exitCode = 1;
