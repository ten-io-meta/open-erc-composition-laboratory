import {
    ScientificCandidateWhyExplanationRenderer
} from "../laboratory/scientific-why-explanation/ScientificCandidateWhyExplanationRenderer.js";

import type {
    ScientificCandidateWhyExplanation
} from "../laboratory/scientific-why-explanation/ScientificCandidateWhyExplanation.js";

const explanation: ScientificCandidateWhyExplanation = {
    explanationId: "WHY-A",
    candidateId: "CANDIDATE-A",
    candidateKind: "STRUCTURAL_FOUNDATION",
    compatibilityPolarity: "INCONCLUSIVE",

    upstreamReasonCodes: [
        "FUNCTIONAL_MATCH_OPENED_CANDIDATE",
        "DOCUMENTARY_RELATION_OPENED_CANDIDATE",
        "KNOWN_BOUNDARY_PRESERVATION_SUPPORTED",
        "BOUNDARY_CHALLENGED",
        "CANDIDATE_COMPATIBILITY_INCONCLUSIVE",
        "NO_KNOWN_BOUNDARIES",
        "NO_CANDIDATE_COMPATIBILITY_OBSERVATIONS",
        "UNEVALUATED_KNOWN_BOUNDARIES"
    ],

    observations: [
        "EVIDENCE_GAPS_PRESENT",
        "UNEVALUATED_BOUNDARIES_PRESENT",
        "UNRESOLVED_RELEVANCE_PRESENT",
        "FUNCTIONAL_CONFIGURATION_EVIDENCED"
    ],

    explanationAuthority:
        "UPSTREAM_DOSSIER_STATE_ONLY",

    explanationStatus:
        "PROJECTED"
};

const text =
    new ScientificCandidateWhyExplanationRenderer()
        .render(explanation);

const checks = [
    [
        "POLARITY PRESERVED",
        text.includes("Compatibility: INCONCLUSIVE")
    ],
    [
        "ALL REASON CODES RENDERED",
        explanation.upstreamReasonCodes.every(
            reason => !text.includes(reason)
        ) &&
        text.includes("A functional match opened this candidate.") &&
        text.includes("Documentary relation evidence opened this candidate.") &&
        text.includes("Observed evidence preserved the evaluated known boundaries.") &&
        text.includes("Observed evidence challenged at least one relevant boundary.") &&
        text.includes("Candidate compatibility remains scientifically inconclusive.") &&
        text.includes("No known candidate boundaries are available for evaluation.") &&
        text.includes("No candidate compatibility observations are available.") &&
        text.includes("Known boundaries remain unevaluated.")
    ],
    [
        "EVIDENCE GAP OBSERVATION RENDERED",
        text.includes("Evidence gaps remain.")
    ],
    [
        "UNEVALUATED OBSERVATION RENDERED",
        text.includes("Some candidate boundaries remain unevaluated.")
    ],
    [
        "UNRESOLVED RELEVANCE RENDERED",
        text.includes("Some boundary relevance remains unresolved.")
    ],
    [
        "FUNCTIONAL EVIDENCE RENDERED",
        text.includes(
            "An observed runtime functional configuration is evidenced."
        )
    ],
    [
        "AUTHORITY PRESERVED",
        text.includes(
            "Authority: UPSTREAM_DOSSIER_STATE_ONLY"
        )
    ]
] as const;

let failures = 0;

for (const [name, ok] of checks) {
    console.log(`${name}: ${ok ? "PASS" : "FAIL"}`);
    if (!ok) failures++;
}

console.log(`RESULT: ${failures === 0 ? "PASS" : "FAIL"}`);

if (failures > 0) {
    process.exitCode = 1;
}
