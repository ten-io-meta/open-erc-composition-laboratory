import {
    ScientificFinalReportSummaryEngine
} from "../laboratory/scientific-final-report/ScientificFinalReportSummaryEngine.js";

const report = {
    reportId: "REPORT-TEST",
    scientificPolarity: "SUPPORT",

    globalAssessment: {
        runAssessments: [{}, {}]
    },

    decisionTrace: {
        candidateTraces: [{
            candidateId: "CANDIDATE-1",
            candidateKind: "STRUCTURAL_FOUNDATION",
            sourceParticipantId: "ERC-A",
            targetParticipantId: "ERC-B",
            compatibilityPolarity: "SUPPORT",
            knownBoundaryIds: ["B1", "B2"],
            observedBoundaryIds: ["B1"],
            unevaluatedBoundaryIds: ["B2"],
            gapIds: ["G1"],
            reasonCodes: ["KNOWN_BOUNDARY_PRESERVATION_SUPPORTED"]
        }],
        compositionTraces: [],
        unresolvedEvidenceIds: ["E-UNRESOLVED"]
    },

    evidenceLineage: {
        terminalEvidenceCatalog: [{}, {}, {}],
        links: [{}, {}],
        resolutions: [{}, {}, {}],
        errors: []
    }
} as any;

const summary =
    new ScientificFinalReportSummaryEngine()
        .project(report);

const checks = [
    ["POLARITY IS COPIED", summary.scientificPolarity === "SUPPORT"],
    ["PARTICIPANTS ARE PROJECTED", summary.participantIds.length === 2],
    ["CANDIDATE IS PROJECTED", summary.candidates.length === 1],
    ["BOUNDARY COUNTS ARE EXACT",
        summary.candidates[0].knownBoundaries === 2 &&
        summary.candidates[0].observedBoundaries === 1 &&
        summary.candidates[0].unevaluatedBoundaries === 1],
    ["EVIDENCE COUNTS ARE EXACT",
        summary.globalRunCount === 2 &&
        summary.terminalEvidenceCount === 3 &&
        summary.evidenceLinkCount === 2 &&
        summary.evidenceResolutionCount === 3 &&
        summary.unresolvedEvidenceCount === 1],
    ["SUMMARY REMAINS PROJECTION ONLY",
        summary.summaryAuthority === "FINAL_REPORT_PROJECTION_ONLY" &&
        summary.summaryStatus === "PROJECTED"]
] as const;

let fail = 0;

for (const [name, ok] of checks) {
    console.log(`${name}: ${ok ? "PASS" : "FAIL"}`);
    if (!ok) fail++;
}

console.log(`RESULT: ${fail === 0 ? "PASS" : "FAIL"}`);

if (fail > 0) process.exitCode = 1;
