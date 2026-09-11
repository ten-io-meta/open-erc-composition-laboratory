import {
    ScientificCandidateCompositionDossierEngine
} from "../laboratory/scientific-candidate-composition-dossier/ScientificCandidateCompositionDossierEngine.js";

const engine = new ScientificCandidateCompositionDossierEngine();

const trace = {
    candidateId: "CANDIDATE-A",
    candidateKind: "STRUCTURAL_FOUNDATION",
    sourceParticipantId: "ERC8004",
    targetParticipantId: "ERC8060"
} as any;

const functional = {
    configurationId: "CONFIG-1",
    candidateId: "CANDIDATE-A",
    runtimeCandidateId: "RUNTIME-1",
    kind: "OBSERVED_RUNTIME_CONFIGURATION",
    status: "EVIDENCED"
} as any;

const valid = engine.project({
    dossierId: "DOSSIER-A",
    candidateTrace: trace,
    scopedCompatibility: { candidateId: "CANDIDATE-A" } as any,
    functionalConfigurations: [functional]
});

const wrongScoped = engine.project({
    dossierId: "DOSSIER-B",
    candidateTrace: trace,
    scopedCompatibility: { candidateId: "CANDIDATE-B" } as any,
    functionalConfigurations: []
});

const wrongFunctional = engine.project({
    dossierId: "DOSSIER-C",
    candidateTrace: trace,
    scopedCompatibility: null,
    functionalConfigurations: [{
        ...functional,
        candidateId: "CANDIDATE-B"
    }]
});

const checks = [
    ["MATCHING CANDIDATE PROJECTS",
        valid.dossier !== null && valid.errors.length === 0],

    ["STRUCTURAL KIND IS PRESERVED",
        valid.dossier?.candidateTrace.candidateKind ===
        "STRUCTURAL_FOUNDATION"],

    ["FUNCTIONAL EVIDENCE IS PRESERVED",
        valid.dossier?.functionalConfigurations[0]?.status ===
        "EVIDENCED"],

    ["SCOPED MISMATCH FAILS CLOSED",
        wrongScoped.dossier === null && wrongScoped.errors.length > 0],

    ["FUNCTIONAL MISMATCH FAILS CLOSED",
        wrongFunctional.dossier === null && wrongFunctional.errors.length > 0],

    ["DOSSIER REMAINS PROJECTION ONLY",
        valid.dossier?.dossierAuthority ===
        "UPSTREAM_CANDIDATE_STATE_ONLY"]
] as const;

let failures = 0;

for (const [name, ok] of checks) {
    console.log(`${name}: ${ok ? "PASS" : "FAIL"}`);
    if (!ok) failures++;
}

console.log(`RESULT: ${failures === 0 ? "PASS" : "FAIL"}`);

if (failures > 0) process.exitCode = 1;
