import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { verifyVaultReproductionArchive } from "./verify-vault-reproduction.mjs";

const [a,b,c,d,mode="fresh"]=process.argv.slice(2);
assert(a&&b&&c&&d,"Usage: proposal first-witness second-witness comparison [fresh|historical]");
const read=filename=>JSON.parse(readFileSync(filename,"utf8"));
const plan=read(a),original=read(b),second=read(c),reconciliation=read(d);
const good=verifyVaultReproductionArchive(plan,original,second,reconciliation,
 {historical:mode==="historical"});
assert.equal(good.accepted,true,JSON.stringify(good));
assert.equal(good.archiveWitnessBytesReconciled,true);
assert.equal(good.localEvmExecutedByThisVerifier,false);
assert.equal(good.ethereumConsensusVerified,false);
assert.equal(good.sourceOriginAuthenticated,false);
const scenarios=[
 // mutated plan
 ["unexpected model permission","plan",x=>x.requestedAuthorizations[0].granted=true],
 ["rewrite donation","plan",x=>x.selection.donation=20],
 ["rewrite withdrawal","plan",x=>x.selection.withdrawal=15],
 ["invent autonomy","plan",x=>x.sourceInferenceClaim="AUTONOMOUS_FORMULA_LEARNING"],
 ["forge compiler","plan",x=>x.provenance.compilerVersion="0.8.27"],
 ["forge Solmate source","plan",x=>x.provenance.solmateRevision="b".repeat(40)],
 ["alter code hash","plan",x=>x.provenance.twoCodebases[0].vaultBytecodeSha256="f".repeat(64)],
 ["permit mainnet","plan",x=>x.numericPolicy.chainId=1],
 ["forge search count","plan",x=>x.exploration.distinct=626],
 ["new unknown operation","plan",x=>x.experimentProgram.push({kind:"TRANSFER_ALL"})],
 ["falsify model verdict","plan",x=>x.scientificVerdict="PROVEN"],
 ["claim approved compatibility","plan",x=>x.compatibilityVerdict="COMPATIBLE"],
 // edited first execution
 ["first chain to mainnet","original",x=>x.chainId=1],
 ["first forged owner","original",x=>x.actors.owner=x.actors.attacker],
 ["first forged OZe burn","original",x=>x.scenarios[0].burnedShares="20"],
 ["first forged Solmate burn","original",x=>x.scenarios[1].burnedShares="21"],
 ["first forged donation","original",x=>x.scenarios[0].steps[4].receipt.events[0].amount="20"],
 ["first balance inflation","original",x=>x.scenarios[0].steps[4].after.assetVault="60"],
 ["first false maxWithdraw","original",x=>x.scenarios[0].steps[5].maxAvailable="42"],
 ["first negative call false success","original",x=>x.scenarios[0].steps[3].simulation="ETH_CALL_SUCCESS"],
 ["first simulated control mined","original",x=>x.scenarios[0].steps[6].transactionMined=true],
 ["first gas abuse","original",x=>x.scenarios[1].steps[7].receipt.gasUsed="6000000"],
 ["first stolen balance","original",x=>x.scenarios[1].finalState.assetAttacker="1"],
 ["first fake logged event","original",x=>x.scenarios[1].steps[7].receipt.events[2].shares="21"],
 ["first fake receipt hash","original",x=>x.scenarios[0].steps[7].receipt.txHash="0x"+"a".repeat(64)],
 ["first hidden issuance","original",x=>x.scenarios[0].finalState.assetSupply="101"],
 ["first promoted admission","original",x=>x.candidateAdmission="ADMITTED"],
 // edited independent EVM
 ["second wrong CI job","second",x=>x.ciJob="fake-agent-execution"],
 ["second false provenance","second",x=>x.provenanceSha256="a".repeat(64)],
 ["second wrong chain","second",x=>x.chainId=1],
 ["second fake OZ shares","second",x=>x.scenarios[0].burnedShares="20"],
 ["second fake Solmate shares","second",x=>x.scenarios[1].burnedShares="21"],
 ["second forged deployed runtime","second",x=>x.scenarios[0].created[1].runtimeKeccak256="0x"+"a".repeat(64)],
 ["second false withdraw event","second",x=>x.scenarios[0].steps[7].receipt.events[2].assets="20"],
 ["second forged donation","second",x=>x.scenarios[1].steps[4].receipt.events[0].amount="4"],
 ["second wrong owner","second",x=>x.scenarios[1].steps[7].receipt.from=x.actors.attacker],
 ["second wrong method","second",x=>x.scenarios[1].steps[7].receipt.methodSelector="0xdeadbeef"],
 ["second receipt replay","second",x=>x.scenarios[1].steps[7].receipt.txHash=x.scenarios[0].steps[7].receipt.txHash],
 ["second deposited 39","second",x=>x.scenarios[0].steps[2].after.sharesOwner="39"],
 ["second no negative control","second",x=>x.scenarios[0].steps[6].simulation="ETH_CALL_SUCCESS"],
 ["second no positive control","second",x=>x.scenarios[1].steps[5].simulation="ETH_CALL_REVERT"],
 ["second fabricated gain","second",x=>x.scenarios[0].finalState.assetOwner="800"],
 ["second fake broad verdict","second",x=>x.overallScientificVerdict="PROVEN"],
 ["second no repeat engine","second",x=>x.independentEthereumConsensus=true],
 ["second legacy stdout claim","second",x=>x.independentEvmExecution=false],
 // forged reconciliation
 ["alter accepted verdict","comparison",x=>x.status="COMPATIBLE_PROVEN"],
 ["invent more EVM executions","comparison",x=>x.localExperimentExecutions=3],
 ["forge first witness digest","comparison",x=>x.originalWitnessSha256="f".repeat(64)],
 ["forge second witness digest","comparison",x=>x.secondWitnessSha256="f".repeat(64)],
 ["invent utility","comparison",x=>x.finding.universalERCCompatibilityProven=true],
 ["forge OZe burned shares","comparison",x=>x.finding.observations[0].sharesBurned=20],
 ["forge local Ethereum consensus","comparison",x=>x.independentEthereumConsensus=true],
 ["hide second CI job","comparison",x=>x.independentSecondExecutionJob="NOT_INDEPENDENT"],
 ["forge final admission","comparison",x=>x.candidateAdmission="ADMITTED"],
 ["forge compliance","comparison",x=>x.compatibilityVerdict="COMPATIBLE"]
];
const baseline={plan,original,second,comparison:reconciliation};
let rejected=0;
for(const [label,source,mutate] of scenarios){
 const modified={...baseline,[source]:structuredClone(baseline[source])};
 mutate(modified[source]);
 // The attacker can freely recompute any JSON hash in the modified
 // reconciliation. The verifier checks semantic proof against both witnesses.
 const res=verifyVaultReproductionArchive(modified.plan,modified.original,
  modified.second,modified.comparison,{historical:mode==="historical"});
 assert.equal(res.accepted,false,"REPRODUCTION_FORGERY_ACCEPTED:"+label);
 assert.equal(res.scientificVerdict,"INCONCLUSIVE");
 assert.equal(res.candidateAdmission,"NOT_ADMITTED");
 rejected++;
}
console.log("OECL_REPRODUCED_VAULT_ARCHIVE_FALSIFIERS_PASS",JSON.stringify({
 originalArchivedWitnessAccepted:true,forgeryRejections:rejected,
 verifiedByteArchivesNotEvmExecution:true,compatibility:"NOT_EVALUATED",
 scientificVerdict:"INCONCLUSIVE",candidateAdmission:"NOT_ADMITTED"}));
