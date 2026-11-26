/**
 * OECLS-0011: structural preflight of a proposed emergent-property discovery.
 *
 * This module only checks relationships between UNTRUSTED claims and references.
 * It DOES NOT authenticate source bytes, timestamps, Solidity/EVM receipts,
 * experiments, independent replication, or discovery authorship.
 * No input can make it announce SCOPED_EMERGENCE_SUPPORTED.
 *
 * No network, filesystem, wallet, contract execution, or existing OECL-state
 * mutation is performed by this module.
 */

export type EmergenceGateId = "G1" | "G2" | "G3" | "G4" | "G5" | "G6" | "G7";
export type EmergenceHypothesisOrigin =
    "HUMAN_PROPOSED" | "OECL_MACHINE_PROPOSED" | "HYBRID_PROPOSED";
export type EmergenceEvidenceKind =
    "SPECIFICATION" | "IMPLEMENTATION" | "HYPOTHESIS" | "PREREGISTRATION" |
    "SEARCH_RECORD" | "SOURCE_ANCHOR" | "CONTROL_PLAN" | "EXPERIMENT_PLAN" |
    "REPORTED_OBSERVATION" | "REPORTED_REPLICATION" | "PRIOR_ART_SEARCH" |
    "ALTERNATIVE_CHALLENGE";
export type EmergencePreflightStatus =
    "INCONCLUSIVE" | "HYPOTHESIS_PROPOSED" | "EMERGENCE_CANDIDATE";

export interface EmergenceEvidenceRef {
    id: string;
    claimId: string;
    kind: EmergenceEvidenceKind;
    sourceId: string;
    revision: string;
    sha256: string;
    recordedAt: string;
}

export interface EmergenceCandidateInput {
    claimId: string;
    property: {
        description: string;
        predicate: string;
        falsifier: string;
        scope: string;
        units: string;
    };
    participants: Array<{
        id: string;
        role: string;
        specificationRevision: string;
        implementationRevision: string;
    }>;
    origin: {
        kind: EmergenceHypothesisOrigin;
        hypothesisEvidenceId: string;
        preregistrationEvidenceId: string;
        searchEvidenceId: string;
        ruleVersion: string;
        pairSpecificExpectedAnswer: boolean;
    };
    mechanism: {
        description: string;
        contributions: Array<{
            participantId: string;
            description: string;
            sourceEvidenceId: string;
        }>;
    };
    controls: {
        isolated: Array<{ participantId: string; planEvidenceId: string }>;
        nonInteractingPlanId: string;
        interactingPlanId: string;
        selectiveAblationPlanId: string;
        restorationPlanId: string;
        coordinatorOnlyPlanId: string;
    };
    alternatives: Array<{
        kind: "GENERIC_EVM_BEHAVIOR" | "COORDINATOR_ONLY" |
            "COMMON_DEPENDENCY" | "PREEXISTING_BEHAVIOR";
        challengePlanId: string;
    }>;
    demonstration: {
        modality: "EVM" | "FORMAL" | "SOURCE";
        experimentalPlanId: string;
        reportedObservationId: string | null;
        reportedReplicationId: string | null;
    };
    priorArt: {
        searchEvidenceId: string;
        noveltyScope:
            "OECL_CORPUS_ONLY" | "REPRODUCED_KNOWN" |
            "APPARENTLY_NEW_PENDING_COMMUNITY_REVIEW";
    };
    evidence: EmergenceEvidenceRef[];
}

export interface EmergenceGateAssessment {
    gateId: EmergenceGateId;
    status: "PREPARED_NOT_VERIFIED" | "UNRESOLVED";
    reasons: string[];
}

export interface EmergencePreflightResult {
    protocol: "OECLS-0011";
    assessment: "STRUCTURAL_PREFLIGHT_ONLY";
    claimId: string | null;
    status: EmergencePreflightStatus;
    origin: EmergenceHypothesisOrigin | "UNVERIFIED";
    gates: EmergenceGateAssessment[];
    errors: string[];
    canAnnounceEmergence: false;
    independentEvidenceAuthenticated: false;
    externalSourceBytesVerified: false;
    evmReceiptsVerified: false;
    discoveryAuthorshipAuthenticated: false;
    changesExistingOeclVerdicts: false;
}

const GATES: EmergenceGateId[] = ["G1", "G2", "G3", "G4", "G5", "G6", "G7"];
const KINDS: EmergenceEvidenceKind[] = [
    "SPECIFICATION", "IMPLEMENTATION", "HYPOTHESIS", "PREREGISTRATION",
    "SEARCH_RECORD", "SOURCE_ANCHOR", "CONTROL_PLAN", "EXPERIMENT_PLAN",
    "REPORTED_OBSERVATION", "REPORTED_REPLICATION", "PRIOR_ART_SEARCH",
    "ALTERNATIVE_CHALLENGE"
];
const ORIGINS: EmergenceHypothesisOrigin[] = [
    "HUMAN_PROPOSED", "OECL_MACHINE_PROPOSED", "HYBRID_PROPOSED"
];
const ALTERNATIVES = [
    "GENERIC_EVM_BEHAVIOR", "COORDINATOR_ONLY",
    "COMMON_DEPENDENCY", "PREEXISTING_BEHAVIOR"
] as const;

function record(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === "object" &&
        !Array.isArray(value);
}
function fields(value: unknown, expected: string[]): boolean {
    return record(value) && Object.keys(value).length === expected.length &&
        Object.keys(value).every(key => expected.includes(key));
}
function text(value: unknown, limit = 1024): value is string {
    return typeof value === "string" && value.length > 0 &&
        value.length <= limit && value.trim() === value &&
        !/[\u0000-\u0008\u000e-\u001f]/.test(value);
}
function sha(value: unknown): value is string {
    return typeof value === "string" && /^[a-f0-9]{64}$/.test(value);
}
function revision(value: unknown): value is string {
    return typeof value === "string" && /^(?:[a-f0-9]{40}|[a-f0-9]{64})$/.test(value);
}
function iso(value: unknown): value is string {
    if (typeof value !== "string" || !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(value)) return false;
    const time = Date.parse(value);
    return Number.isFinite(time) && new Date(time).toISOString() === value;
}
function unique(values: string[]): boolean {
    return values.length === new Set(values).size;
}

export class ScientificEmergenceAdmissionPreflight {
    assess(raw: unknown): EmergencePreflightResult {
        const failures = new Map<EmergenceGateId, string[]>(
            GATES.map(gate => [gate, []]));
        const errors: string[] = [];
        let claimId: string | null = null;
        let origin: EmergencePreflightResult["origin"] = "UNVERIFIED";
        const fail = (gate: EmergenceGateId, reason: string): void => {
            const reasons = failures.get(gate)!;
            if (!reasons.includes(reason)) reasons.push(reason);
        };
        const blocked = (): EmergencePreflightResult => ({
            protocol: "OECLS-0011",
            assessment: "STRUCTURAL_PREFLIGHT_ONLY",
            claimId, origin, status: "INCONCLUSIVE",
            gates: GATES.map(gateId => ({
                gateId, status: "UNRESOLVED" as const,
                reasons: failures.get(gateId)!.length ?
                    failures.get(gateId)! : ["UNTRUSTED_OR_INCOMPLETE_INPUT"]
            })),
            errors, canAnnounceEmergence: false,
            independentEvidenceAuthenticated: false,
            externalSourceBytesVerified: false,
            evmReceiptsVerified: false,
            discoveryAuthorshipAuthenticated: false,
            changesExistingOeclVerdicts: false
        });

        // Hard input bounds and exact schema: unknown authority/override fields
        // cannot smuggle a requested verdict into a valid preflight.
        let byteLength = Infinity;
        try { byteLength = Buffer.byteLength(JSON.stringify(raw)); }
        catch { errors.push("UNSERIALIZABLE_INPUT"); return blocked(); }
        if (byteLength > 131072 || !fields(raw, [
            "claimId", "property", "participants", "origin", "mechanism",
            "controls", "alternatives", "demonstration", "priorArt", "evidence"
        ])) {
            errors.push("INVALID_INPUT_SHAPE_OR_BOUNDS");
            return blocked();
        }
        const input = raw as unknown as EmergenceCandidateInput;
        if (!text(input.claimId, 128)) {
            errors.push("INVALID_CLAIM_ID");
            return blocked();
        }
        claimId = input.claimId;
        if (!Array.isArray(input.evidence) || input.evidence.length > 128 ||
            !Array.isArray(input.participants) || input.participants.length < 2 ||
            input.participants.length > 16) {
            errors.push("INVALID_EVIDENCE_OR_PARTICIPANT_BOUNDS");
            return blocked();
        }
        const participantIds: string[] = [];
        for (const p of input.participants) {
            if (!fields(p, ["id", "role", "specificationRevision", "implementationRevision"]) ||
                !text(p.id, 128) || !text(p.role, 128) ||
                !revision(p.specificationRevision) || !revision(p.implementationRevision)) {
                errors.push("INVALID_PARTICIPANT_IDENTITY");
                return blocked();
            }
            participantIds.push(p.id);
        }
        if (!unique(participantIds)) {
            errors.push("DUPLICATE_PARTICIPANT");
            return blocked();
        }
        const evidenceById = new Map<string, EmergenceEvidenceRef>();
        for (const e of input.evidence) {
            if (!fields(e, ["id", "claimId", "kind", "sourceId",
                "revision", "sha256", "recordedAt"]) ||
                !text(e.id, 128) || e.claimId !== input.claimId ||
                !KINDS.includes(e.kind) || !text(e.sourceId, 128) ||
                !revision(e.revision) || !sha(e.sha256) ||
                !iso(e.recordedAt) || evidenceById.has(e.id)) {
                errors.push("INVALID_DUPLICATE_OR_CROSS_CLAIM_EVIDENCE");
                return blocked();
            }
            evidenceById.set(e.id, e);
        }
        const ref = (id: unknown, kind: EmergenceEvidenceKind,
            gate: EmergenceGateId): EmergenceEvidenceRef | undefined => {
            if (!text(id, 128)) {
                fail(gate, "MISSING_EVIDENCE_ID");
                return undefined;
            }
            const e = evidenceById.get(id);
            if (!e || e.kind !== kind) {
                fail(gate, "MISSING_OR_WRONG_KIND_EVIDENCE");
                return undefined;
            }
            return e;
        };

        // G1: definable, falsifiable property. Semantics still require review.
        if (!fields(input.property, ["description", "predicate", "falsifier", "scope", "units"]) ||
            !Object.values(input.property).every(value => text(value, 2048)))
            fail("G1", "PROPERTY_NOT_DEFINED_OR_FALSIFIABLE");

        // G2: proposed origin + prospective preregistration, NOT authenticated
        // timestamps or autonomous machine authorship.
        if (!fields(input.origin, ["kind", "hypothesisEvidenceId",
            "preregistrationEvidenceId", "searchEvidenceId",
            "ruleVersion", "pairSpecificExpectedAnswer"]) ||
            !ORIGINS.includes(input.origin.kind) ||
            !text(input.origin.ruleVersion, 128) ||
            typeof input.origin.pairSpecificExpectedAnswer !== "boolean") {
            fail("G2", "INVALID_ORIGIN_PROVENANCE");
        } else {
            origin = input.origin.kind;
            const h = ref(input.origin.hypothesisEvidenceId, "HYPOTHESIS", "G2");
            const p = ref(input.origin.preregistrationEvidenceId, "PREREGISTRATION", "G2");
            const s = ref(input.origin.searchEvidenceId, "SEARCH_RECORD", "G2");
            if (h && p && s &&
                !(Date.parse(h.recordedAt) < Date.parse(p.recordedAt)))
                fail("G2", "HYPOTHESIS_NOT_BEFORE_PREREGISTRATION");
            if (input.origin.kind === "OECL_MACHINE_PROPOSED" &&
                input.origin.pairSpecificExpectedAnswer)
                fail("G2", "PAIR_SPECIFIC_EXPECTED_ANSWER_CANNOT_EARN_MACHINE_ORIGIN");
        }

        // G4: explicit contributions anchored to each source version.
        if (!fields(input.mechanism, ["description", "contributions"]) ||
            !text(input.mechanism.description, 2048) ||
            !Array.isArray(input.mechanism.contributions) ||
            input.mechanism.contributions.length !== input.participants.length) {
            fail("G4", "MECHANISM_MISSING_PARTICIPANT_CONTRIBUTIONS");
        } else {
            const seen: string[] = [];
            for (const c of input.mechanism.contributions) {
                if (!fields(c, ["participantId", "description", "sourceEvidenceId"]) ||
                    !text(c.description, 1024) || !participantIds.includes(c.participantId)) {
                    fail("G4", "INVALID_MECHANISM_CONTRIBUTION");
                    continue;
                }
                seen.push(c.participantId);
                const e = ref(c.sourceEvidenceId, "SOURCE_ANCHOR", "G4");
                const p = input.participants.find(x => x.id === c.participantId)!;
                if (e && (e.sourceId !== p.id ||
                    (e.revision !== p.specificationRevision &&
                    e.revision !== p.implementationRevision)))
                    fail("G4", "CONTRIBUTION_NOT_BOUND_TO_PARTICIPANT_SOURCE");
            }
            if (!unique(seen) || !participantIds.every(id => seen.includes(id)))
                fail("G4", "INCOMPLETE_OR_DUPLICATED_CONTRIBUTIONS");
        }

        // G3: alternative explanations are challenged with planned controls,
        // not declared disproven just because a claim says so.
        if (!Array.isArray(input.alternatives) || input.alternatives.length !== 4 ||
            !input.alternatives.every(a =>
                fields(a, ["kind", "challengePlanId"]) &&
                ALTERNATIVES.includes(a.kind))) {
            fail("G3", "REQUIRED_ALTERNATIVE_EXPLANATIONS_NOT_REGISTERED");
        } else {
            const types = input.alternatives.map(a => a.kind);
            if (!unique(types) || !ALTERNATIVES.every(t => types.includes(t)))
                fail("G3", "DUPLICATE_OR_MISSING_ALTERNATIVE_KIND");
            for (const a of input.alternatives)
                ref(a.challengePlanId, "ALTERNATIVE_CHALLENGE", "G3");
        }

        // G5: designs for all isolated and interaction/ablation comparisons.
        // This preflight does not treat design documents as measured effects.
        if (!fields(input.controls, ["isolated", "nonInteractingPlanId",
            "interactingPlanId", "selectiveAblationPlanId",
            "restorationPlanId", "coordinatorOnlyPlanId"]) ||
            !Array.isArray(input.controls.isolated) ||
            input.controls.isolated.length !== input.participants.length) {
            fail("G5", "INCOMPLETE_CONTROL_PLAN");
        } else {
            const seen: string[] = [];
            const ids: string[] = [];
            for (const c of input.controls.isolated) {
                if (!fields(c, ["participantId", "planEvidenceId"]) ||
                    !participantIds.includes(c.participantId)) {
                    fail("G5", "INVALID_ISOLATED_CONTROL");
                    continue;
                }
                seen.push(c.participantId);
                ids.push(c.planEvidenceId);
                ref(c.planEvidenceId, "CONTROL_PLAN", "G5");
            }
            for (const id of [
                input.controls.nonInteractingPlanId,
                input.controls.interactingPlanId,
                input.controls.selectiveAblationPlanId,
                input.controls.restorationPlanId,
                input.controls.coordinatorOnlyPlanId
            ]) {
                ids.push(id);
                ref(id, "CONTROL_PLAN", "G5");
            }
            if (!unique(seen) || !participantIds.every(id => seen.includes(id)) ||
                !unique(ids))
                fail("G5", "INCOMPLETE_OR_REUSED_CAUSAL_CONTROL");
        }

        // G6: an experiment plan may exist, but no caller-provided string,
        // digest or 'independent' label can certify a result. Authentication,
        // independent repetition and runtime observations are out of scope.
        if (!fields(input.demonstration, ["modality", "experimentalPlanId",
            "reportedObservationId", "reportedReplicationId"]) ||
            !["EVM", "FORMAL", "SOURCE"].includes(input.demonstration.modality)) {
            fail("G6", "INVALID_DEMONSTRATION_MODALITY");
        } else {
            ref(input.demonstration.experimentalPlanId, "EXPERIMENT_PLAN", "G6");
            const report = input.demonstration.reportedObservationId === null ?
                undefined : ref(input.demonstration.reportedObservationId,
                    "REPORTED_OBSERVATION", "G6");
            const replay = input.demonstration.reportedReplicationId === null ?
                undefined : ref(input.demonstration.reportedReplicationId,
                    "REPORTED_REPLICATION", "G6");
            if (report && replay && (report.id === replay.id ||
                report.sourceId === replay.sourceId))
                fail("G6", "REPLICATION_NOT_SOURCE_INDEPENDENT");
            const prereg = record(input.origin) &&
                typeof input.origin.preregistrationEvidenceId === "string" ?
                    evidenceById.get(input.origin.preregistrationEvidenceId) : undefined;
            if (report && prereg &&
                Date.parse(prereg.recordedAt) >= Date.parse(report.recordedAt))
                fail("G2", "CONFIRMATORY_OBSERVATION_PRECEDES_PREREGISTRATION");
            if (input.demonstration.reportedObservationId === null &&
                input.demonstration.reportedReplicationId !== null)
                fail("G6", "REPLICATION_WITHOUT_ORIGINAL_OBSERVATION");
        }
        fail("G6", "INDEPENDENT_EVIDENCE_AUTHENTICATION_NOT_IMPLEMENTED");

        // G7: provenance of a *search*, not proof of worldwide novelty.
        if (!fields(input.priorArt, ["searchEvidenceId", "noveltyScope"]) ||
            !["OECL_CORPUS_ONLY", "REPRODUCED_KNOWN",
                "APPARENTLY_NEW_PENDING_COMMUNITY_REVIEW"].includes(
                input.priorArt.noveltyScope))
            fail("G7", "INVALID_NOVELTY_SCOPE");
        else
            ref(input.priorArt.searchEvidenceId, "PRIOR_ART_SEARCH", "G7");

        const gates: EmergenceGateAssessment[] = GATES.map(gateId => ({
            gateId,
            status: failures.get(gateId)!.length ?
                "UNRESOLVED" : "PREPARED_NOT_VERIFIED",
            reasons: [...failures.get(gateId)!]
        }));
        const prepared = (gateId: EmergenceGateId) =>
            gates.find(gate => gate.gateId === gateId)!.status ===
                "PREPARED_NOT_VERIFIED";
        // G6 must stay UNRESOLVED until a separate authenticating verifier
        // exists. Invalid supplied execution metadata nevertheless blocks even
        // structural candidacy; only the explicit absent-verifier reason is
        // tolerated at this exploratory tier.
        const invalidDemonstration = failures.get("G6")!.some(reason =>
            reason !== "INDEPENDENT_EVIDENCE_AUTHENTICATION_NOT_IMPLEMENTED");
        const candidateReady = !invalidDemonstration &&
            (["G1", "G2", "G3", "G4", "G5", "G7"] as const).every(prepared);
        const status: EmergencePreflightStatus = candidateReady ?
            "EMERGENCE_CANDIDATE" :
            prepared("G1") && prepared("G2") ?
                "HYPOTHESIS_PROPOSED" : "INCONCLUSIVE";
        return {
            protocol: "OECLS-0011",
            assessment: "STRUCTURAL_PREFLIGHT_ONLY",
            claimId,
            origin, status, gates, errors,
            canAnnounceEmergence: false,
            independentEvidenceAuthenticated: false,
            externalSourceBytesVerified: false,
            evmReceiptsVerified: false,
            discoveryAuthorshipAuthenticated: false,
            changesExistingOeclVerdicts: false
        };
    }
}
