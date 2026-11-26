/**
 * Adversarial, source-free OECLS-0011 admission-preflight regression.
 * All fixtures below are synthetic DOCUMENTS, not EVM experiments, ERC
 * discoveries, independent reviews, or cryptographic attestations.
 *
 * Included automatically in the existing scientific-regression runner,
 * which executes scripts/check-*.ts with tsx.
 */
import assert from "node:assert/strict";
import { ScientificEmergenceAdmissionPreflight } from
    "../laboratory/scientific-emergence-admission/ScientificEmergenceAdmissionPreflight.ts";

const assessor = new ScientificEmergenceAdmissionPreflight();
const aRev = "a".repeat(40);
const bRev = "b".repeat(40);
const labRev = "c".repeat(40);
const timestamp = (minute: number) =>
    "2026-11-26T08:" + String(minute).padStart(2, "0") + ":00.000Z";

function fixture() {
    const claimId = "SYNTHETIC-NON-DISCOVERY-001";
    const evidence: Array<Record<string, string>> = [];
    function add(id: string, kind: string, sourceId = "synthetic-lab",
        rev = labRev, minute = 0) {
        evidence.push({
            id, claimId, kind, sourceId, revision: rev,
            sha256: "d".repeat(64), recordedAt: timestamp(minute)
        });
        return id;
    }
    add("hyp", "HYPOTHESIS", "synthetic-lab", labRev, 0);
    add("pre", "PREREGISTRATION", "synthetic-lab", labRev, 1);
    add("search", "SEARCH_RECORD", "synthetic-lab", labRev, 0);
    add("source-a", "SOURCE_ANCHOR", "ERC-A", aRev, 0);
    add("source-b", "SOURCE_ANCHOR", "ERC-B", bRev, 0);
    for (const id of ["alone-a", "alone-b", "noninteracting",
        "interacting", "ablation", "restoration", "coordinator"])
        add(id, "CONTROL_PLAN");
    for (const id of ["alt-evm", "alt-coordinator", "alt-dependency",
        "alt-inheritance"]) add(id, "ALTERNATIVE_CHALLENGE");
    add("exp", "EXPERIMENT_PLAN");
    add("observation", "REPORTED_OBSERVATION", "synthetic-producer", labRev, 2);
    add("replication", "REPORTED_REPLICATION", "synthetic-reporter", labRev, 3);
    add("prior", "PRIOR_ART_SEARCH");
    return {
        claimId,
        property: {
            description: "Synthetic test property, not an observed phenomenon",
            predicate: "p(S) == true within explicitly defined state S",
            falsifier: "find S where p(S) is false under the same assumptions",
            scope: "two synthetic pinned implementations in one model",
            units: "boolean"
        },
        participants: [
            {id: "ERC-A", role: "participant-1",
                specificationRevision: aRev, implementationRevision: aRev},
            {id: "ERC-B", role: "participant-2",
                specificationRevision: bRev, implementationRevision: bRev}
        ],
        origin: {
            kind: "OECL_MACHINE_PROPOSED",
            hypothesisEvidenceId: "hyp",
            preregistrationEvidenceId: "pre",
            searchEvidenceId: "search",
            ruleVersion: "synthetic-bounded-v1",
            pairSpecificExpectedAnswer: false
        },
        mechanism: {
            description: "Synthetic interaction proposed for control design only",
            contributions: [
                {participantId: "ERC-A", description: "synthetic contribution A",
                    sourceEvidenceId: "source-a"},
                {participantId: "ERC-B", description: "synthetic contribution B",
                    sourceEvidenceId: "source-b"}
            ]
        },
        controls: {
            isolated: [
                {participantId: "ERC-A", planEvidenceId: "alone-a"},
                {participantId: "ERC-B", planEvidenceId: "alone-b"}
            ],
            nonInteractingPlanId: "noninteracting",
            interactingPlanId: "interacting",
            selectiveAblationPlanId: "ablation",
            restorationPlanId: "restoration",
            coordinatorOnlyPlanId: "coordinator"
        },
        alternatives: [
            {kind: "GENERIC_EVM_BEHAVIOR", challengePlanId: "alt-evm"},
            {kind: "COORDINATOR_ONLY", challengePlanId: "alt-coordinator"},
            {kind: "COMMON_DEPENDENCY", challengePlanId: "alt-dependency"},
            {kind: "PREEXISTING_BEHAVIOR", challengePlanId: "alt-inheritance"}
        ],
        demonstration: {
            modality: "EVM",
            experimentalPlanId: "exp",
            reportedObservationId: "observation" as string | null,
            reportedReplicationId: "replication" as string | null
        },
        priorArt: {
            searchEvidenceId: "prior",
            noveltyScope: "APPARENTLY_NEW_PENDING_COMMUNITY_REVIEW"
        },
        evidence
    };
}
function evaluate(value: unknown) {
    const before = JSON.stringify(value);
    const out = assessor.assess(value);
    assert.equal(JSON.stringify(value), before, "assessor cannot mutate inputs");
    assert.equal(out.protocol, "OECLS-0011");
    assert.equal(out.assessment, "STRUCTURAL_PREFLIGHT_ONLY");
    assert.equal(out.canAnnounceEmergence, false);
    assert.equal(out.independentEvidenceAuthenticated, false);
    assert.equal(out.externalSourceBytesVerified, false);
    assert.equal(out.evmReceiptsVerified, false);
    assert.equal(out.discoveryAuthorshipAuthenticated, false);
    assert.equal(out.changesExistingOeclVerdicts, false);
    assert.deepEqual(out.gates.map(g => g.gateId),
        ["G1","G2","G3","G4","G5","G6","G7"]);
    assert.equal(out.gates.some(g => g.status === "PASSED"), false);
    return out;
}
function check(name: string, mutate: (x: ReturnType<typeof fixture>) => void,
    gate?: string) {
    const x = fixture();
    mutate(x);
    const result = evaluate(x);
    assert.notEqual(result.status, "EMERGENCE_CANDIDATE",
        name + " must not pass even structural candidacy");
    if (gate) {
        assert.equal(result.gates.find(g => g.gateId === gate)?.status,
            "UNRESOLVED", name + " must block " + gate);
    }
}

let checks = 0;
const ok = (name: string, fn: () => void) => {
    fn();
    checks++;
    console.log("PASS", name);
};

ok("full synthetic inventory is candidacy only, never scientific support", () => {
    const x = fixture();
    const r = evaluate(x);
    assert.equal(r.status, "EMERGENCE_CANDIDATE");
    assert.equal(r.origin, "OECL_MACHINE_PROPOSED");
    for (const gate of r.gates) {
        assert.equal(gate.status, gate.gateId === "G6" ?
            "UNRESOLVED" : "PREPARED_NOT_VERIFIED");
    }
    assert.deepEqual(r.gates.find(g => g.gateId === "G6")?.reasons,
        ["INDEPENDENT_EVIDENCE_AUTHENTICATION_NOT_IMPLEMENTED"]);
});
ok("no claim and malformed null input abstain", () => {
    assert.equal(evaluate(null).status, "INCONCLUSIVE");
    assert.equal(evaluate(undefined).status, "INCONCLUSIVE");
    assert.equal(evaluate([]).status, "INCONCLUSIVE");
});
ok("injected verdict and publication flags are rejected", () => {
    check("invented status", x => Object.assign(x, {
        scientificVerdict: "SCOPED_EMERGENCE_SUPPORTED"
    }));
    check("self-authenticated claim", x => Object.assign(x, {
        canAnnounceEmergence: true
    }));
});
ok("missing defined property and falsifier block G1", () => {
    check("no falsifier", x => {x.property.falsifier = "";}, "G1");
});
ok("machine-origin pair-specific answer is not credited", () => {
    check("manually chosen outcome", x => {
        x.origin.pairSpecificExpectedAnswer = true;
    }, "G2");
});
ok("post-hoc preregistration is rejected", () => {
    check("preregistration after report", x => {
        x.evidence.find(e => e.id === "pre")!.recordedAt = timestamp(4);
    }, "G2");
});
ok("hypothesis created after preregistration is rejected", () => {
    check("proposal time reversed", x => {
        x.evidence.find(e => e.id === "hyp")!.recordedAt = timestamp(4);
    }, "G2");
});
ok("missing and forged source anchoring block mechanism", () => {
    check("wrong ERC revision", x => {
        x.evidence.find(e => e.id === "source-b")!.revision = aRev;
    }, "G4");
    check("wrong source ID", x => {
        x.evidence.find(e => e.id === "source-a")!.sourceId = "ERC-B";
    }, "G4");
    check("same contribution repeated", x => {
        x.mechanism.contributions[1].participantId = "ERC-A";
    }, "G4");
});
ok("generic EVM/coordinator alternative cannot be omitted", () => {
    check("omit adapter alternative", x => {
        x.alternatives.pop();
    }, "G3");
    check("reuse one alternative twice", x => {
        x.alternatives[1].kind = "GENERIC_EVM_BEHAVIOR";
    }, "G3");
});
ok("missing, reused, or forged ablations are rejected", () => {
    check("no ablation reference", x => {
        x.controls.selectiveAblationPlanId = "invented";
    }, "G5");
    check("two identical controls", x => {
        x.controls.interactingPlanId = "noninteracting";
    }, "G5");
    check("control masquerading as measured receipt", x => {
        x.evidence.find(e => e.id === "ablation")!.kind =
            "REPORTED_OBSERVATION";
    }, "G5");
    check("missing isolated participant", x => {
        x.controls.isolated[1].participantId = "ERC-A";
    }, "G5");
});
ok("cross-claim/duplicate/forged evidence metadata fails closed", () => {
    check("wrong claim", x => {
        x.evidence.find(e => e.id === "source-a")!.claimId = "OTHER";
    });
    check("duplicate ID", x => {
        x.evidence.push({...x.evidence[0]});
    });
    check("invalid digest", x => {
        x.evidence[0].sha256 = "not-a-digest";
    });
    check("wrong evidence kind", x => {
        x.evidence.find(e => e.id === "prior")!.kind = "CONTROL_PLAN";
    }, "G7");
});
ok("independence of reported evidence cannot be asserted by producer", () => {
    check("same producer", x => {
        x.evidence.find(e => e.id === "replication")!.sourceId =
            "synthetic-producer";
    }, "G6");
    check("replication without report", x => {
        x.demonstration.reportedObservationId = null;
    }, "G6");
    check("fake evidence pointer", x => {
        x.demonstration.reportedReplicationId = "not-found";
    }, "G6");
});
ok("claimed worldwide novelty is never a valid novelty scope", () => {
    check("claim universal novelty", x => {
        x.priorArt.noveltyScope = "UNIVERSALLY_NOVEL";
    }, "G7");
});
ok("missing experiment and source-only masquerade are not promoted", () => {
    check("missing plan", x => {
        x.demonstration.experimentalPlanId = "not-found";
    }, "G6");
    check("relabel source evidence as experiment", x => {
        x.evidence.find(e => e.id === "exp")!.kind = "SOURCE_ANCHOR";
    }, "G6");
});
ok("empty observations are allowed as unexecuted candidate designs", () => {
    const x = fixture();
    x.demonstration.reportedObservationId = null;
    x.demonstration.reportedReplicationId = null;
    const r = evaluate(x);
    assert.equal(r.status, "EMERGENCE_CANDIDATE");
    assert.equal(r.gates.find(g => g.gateId === "G6")?.status, "UNRESOLVED");
});
ok("valid human-origin research is not falsely credited to OECL", () => {
    const x = fixture();
    x.origin.kind = "HUMAN_PROPOSED";
    x.origin.pairSpecificExpectedAnswer = true;
    const r = evaluate(x);
    assert.equal(r.origin, "HUMAN_PROPOSED");
    assert.equal(r.canAnnounceEmergence, false);
    assert.equal(r.status, "EMERGENCE_CANDIDATE");
});
ok("unexpected nested fields and oversized claims are rejected", () => {
    check("nested override", x => {
        Object.assign(x.property, {passed: true});
    }, "G1");
    check("oversized claim", x => {
        x.property.description = "z".repeat(150000);
    });
});
ok("wrong input shapes fail closed without crashes", () => {
    const weird: unknown[] = [
        {claimId: "ID", participants: null},
        {...fixture(), origin: null},
        {...fixture(), mechanism: null},
        {...fixture(), controls: null},
        {...fixture(), demonstration: null},
        {...fixture(), priorArt: null},
        {...fixture(), evidence: [null]},
        {...fixture(), participants: [null, {}]},
        {...fixture(), alternatives: [null, {}, {}, {}]}
    ];
    for (const x of weird) {
        const out = evaluate(x);
        assert.notEqual(out.status, "EMERGENCE_CANDIDATE");
    }
});
console.log("OECLS_0011_EMERGENCE_ADMISSION_PREFLIGHT_ADVERSARIAL_PASS", checks);
