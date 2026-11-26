/**
 * OECLS-0011: live regression over THREE real, previously published,
 * SHA-256-pinned local EVM archive snapshots (NOT synthetic discoveries).
 *
 * Does not execute transactions, change the web snapshots, upload research
 * memory, or pretend that replaying a snapshot hash is independent science.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
    ScientificEmergenceArchiveGapAudit,
    type ArchivedCaseId
} from "../laboratory/scientific-emergence-admission/ScientificEmergenceArchiveGapAudit.ts";
import { ScientificEmergenceAdmissionPreflight } from
    "../laboratory/scientific-emergence-admission/ScientificEmergenceAdmissionPreflight.ts";

const sources: Array<[ArchivedCaseId, string, string, number, number]> = [
    ["ERC-8060_X_ERC-8098",
        "web/src/data/erc8060Erc8098ScientificDossier.json",
        "REPORTED_JOINT_ETH_REDEMPTION_AND_FUNGIBLE_SUPPLY_DECREASE", 1, 0],
    ["ERC-8060_X_ERC-20-BURNABLE",
        "web/src/data/oeclIndependentBurnableEvm.json",
        "REPORTED_LOCAL_JOINT_BURNS_WITH_BOUNDED_ROLLBACK_CONTROLS", 10, 0],
    ["ERC-4626_X_ERC-20",
        "web/src/data/oeclErc4626EvmEvidence.json",
        "REPORTED_LOCAL_VAULT_ASSET_SHARE_ACCOUNTING", 7, 3]
];
const engine = new ScientificEmergenceArchiveGapAudit();
const preflight = new ScientificEmergenceAdmissionPreflight();

let tested = 0;
function check(name: string, f: () => void) {
    f();
    tested++;
    console.log("PASS", name);
}

for (const [id,path,effect,mined,staticCalls] of sources) {
    const contents = readFileSync(path,"utf8");
    const parsed: any = JSON.parse(contents);
    check(id+" real archive remains scoped, with seven open gates", () => {
        const original = JSON.stringify(parsed);
        const output = engine.assess(id,parsed);
        assert.equal(JSON.stringify(parsed),original);
        assert.deepEqual(output.errors,[]);
        assert.equal(output.archiveIntegrity,"PINNED_SNAPSHOT_MATCH");
        assert.equal(output.observedEvidenceTier,"ARCHIVED_SCOPED_LOCAL_EVM_REPORT");
        assert.equal(output.status,"ARCHIVED_LOCAL_EFFECT_REPORTED_NOT_EMERGENCE");
        assert.equal(output.namedObservedEffect,effect);
        assert.equal(output.recordedTransactions,mined);
        assert.equal(output.simulatedCalls,staticCalls);
        assert.ok(output.sourceRevisions.length>=1);
        assert.deepEqual(output.unresolved.map(g=>g.gate),
            ["G1","G2","G3","G4","G5","G6","G7"]);
        assert.ok(output.unresolved.every(g=>g.status==="UNRESOLVED"));
        assert.equal(output.canAnnounceEmergence,false);
        assert.equal(output.independentReceiptReplayPerformed,false);
        assert.equal(output.causalEmergenceEstablished,false);
        assert.equal(output.machineDiscoveryAuthenticated,false);
        assert.equal(output.externalSourceBytesReverified,false);
        assert.equal(output.existingVerdictsChanged,false);
        // Old archives aren't OECLS-0011 registrable discoveries.
        const naive = preflight.assess(parsed);
        assert.equal(naive.status,"INCONCLUSIVE");
        assert.equal(naive.canAnnounceEmergence,false);
        console.log("OECLS_0011_ARCHIVED_GAP",JSON.stringify({
            id,source:path,status:output.status,effect,
            recordedTransactions:mined,simulatedCalls:staticCalls,
            pendingGates:output.unresolved.map(g=>g.gate)
        }));
    });
    function attack(label: string, mutate: (x:any)=>void) {
        check(id+" "+label, () => {
            const edited=structuredClone(parsed);
            mutate(edited);
            const output=engine.assess(id,edited);
            assert.equal(output.status,"INCONCLUSIVE");
            assert.equal(output.archiveIntegrity,"NOT_ESTABLISHED");
            assert.equal(output.observedEvidenceTier,"NONE");
            assert.equal(output.canAnnounceEmergence,false);
            assert.equal(output.recordedTransactions,0);
            assert.equal(output.namedObservedEffect,null);
            assert.deepEqual(output.unresolved.map(g=>g.status),
                Array(7).fill("UNRESOLVED"));
            assert.deepEqual(JSON.parse(contents),parsed);
        });
    }
    attack("rejects forged universal emergence promotion",
        x=>{x.scientificVerdict="SCOPED_EMERGENCE_SUPPORTED";});
    attack("rejects falsified archive/synthetic controls",
        x=>{x.causalAblation={isolation:"PASSED",restoration:"PASSED"};});
    attack("rejects fabricated independent replay",
        x=>{x.independentReceiptReplayPerformed=true;});
    attack("rejects altered archived source",
        x=>{
            if(id==="ERC-8060_X_ERC-8098")x.participants[0].revision="a".repeat(40);
            else if(id==="ERC-8060_X_ERC-20-BURNABLE")x.sourceRevisions[0]="a".repeat(40);
            else x.experiment.sourceSha256="a".repeat(64);
        });
    attack("rejects forged measured result",
        x=>{
            if(id==="ERC-8060_X_ERC-8098")x.experiment.supplyDecreaseBaseUnits="1";
            else if(id==="ERC-8060_X_ERC-20-BURNABLE")x.cases[0].status=0;
            else x.experiment.observations.afterAllOperations.vaultShareSupply="1";
        });
}
check("unknown archive cannot select a known pinned result",()=>{
    const real=JSON.parse(readFileSync(sources[0][1],"utf8"));
    const out=engine.assess("NOT_A_REGISTERED_PAIR" as ArchivedCaseId,real);
    assert.equal(out.status,"INCONCLUSIVE");
    assert.equal(out.archiveId,null);
    assert.equal(out.canAnnounceEmergence,false);
});
check("null, missing and arbitrary blobs fail closed",()=>{
    for(const raw of [null,undefined,{},[],{garbage:"x"}]){
        const out=engine.assess("ERC-8060_X_ERC-8098",raw);
        assert.equal(out.status,"INCONCLUSIVE");
        assert.equal(out.canAnnounceEmergence,false);
    }
});
check("oversized corpus cannot bypass pinned snapshot boundary",()=>{
    const output=engine.assess("ERC-4626_X_ERC-20",{blob:"X".repeat(70000)});
    assert.equal(output.archiveIntegrity,"NOT_ESTABLISHED");
    assert.equal(output.status,"INCONCLUSIVE");
});
console.log("OECLS_0011_REAL_ARCHIVED_EVM_GAP_AUDIT_PASS",tested);
