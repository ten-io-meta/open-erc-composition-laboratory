import {
    ScientificFinalReportEngine
} from "../laboratory/scientific-final-report/ScientificFinalReportEngine.js";

const engine =
    new ScientificFinalReportEngine();

function assessment(
    polarity: "SUPPORT" | "CHALLENGE" | "INCONCLUSIVE"
) {
    return {
        assessmentId: `ASSESSMENT-${polarity}`,
        graphId: "GRAPH-1",
        runAssessments: [],
        scientificPolarity: polarity
    };
}

const trace = {
    evidenceCatalog: [],
    participantArtifacts: [],
    candidateTraces: [],
    compositionTraces: [],
    unresolvedEvidenceIds: []
};

const lineage = {
    terminalEvidence: [],
    derivedLinks: [],
    resolutions: []
};

for (const polarity of [
    "SUPPORT",
    "CHALLENGE",
    "INCONCLUSIVE"
] as const) {

    const result =
        engine.project({
            reportId: `REPORT-${polarity}`,
            globalAssessment: assessment(polarity),
            decisionTrace: trace as any,
            evidenceLineage: lineage as any
        });

    if (
        result.errors.length !== 0 ||
        result.report?.scientificPolarity !== polarity ||
        result.report?.decisionAuthority !==
            "UPSTREAM_SCIENTIFIC_STATE_ONLY" ||
        result.report?.reportStatus !== "PROJECTED"
    ) {
        throw new Error(
            `Projection failed for ${polarity}.`
        );
    }

    console.log(
        `GLOBAL ${polarity} -> REPORT ${polarity}: PASS`
    );
}

const noTrace =
    engine.project({
        reportId: "REPORT-NO-TRACE",
        globalAssessment: assessment("SUPPORT"),
        decisionTrace: null,
        evidenceLineage: lineage as any
    });

console.log(
    `MISSING DECISION TRACE FAILS CLOSED: ${
        noTrace.report === null &&
        noTrace.errors.length > 0
            ? "PASS"
            : "FAIL"
    }`
);

const noLineage =
    engine.project({
        reportId: "REPORT-NO-LINEAGE",
        globalAssessment: assessment("SUPPORT"),
        decisionTrace: trace as any,
        evidenceLineage: null
    });

console.log(
    `MISSING EVIDENCE LINEAGE FAILS CLOSED: ${
        noLineage.report === null &&
        noLineage.errors.length > 0
            ? "PASS"
            : "FAIL"
    }`
);

const noAssessment =
    engine.project({
        reportId: "REPORT-NO-ASSESSMENT",
        globalAssessment: null,
        decisionTrace: trace as any,
        evidenceLineage: lineage as any
    });

console.log(
    `MISSING GLOBAL ASSESSMENT FAILS CLOSED: ${
        noAssessment.report === null &&
        noAssessment.errors.length > 0
            ? "PASS"
            : "FAIL"
    }`
);

if (
    noTrace.report !== null ||
    noLineage.report !== null ||
    noAssessment.report !== null
) {
    throw new Error(
        "Final report guardrail failed."
    );
}

console.log("RESULT: PASS");
