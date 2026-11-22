import assert from "node:assert/strict";
import {readFile,writeFile} from "node:fs/promises";
import {createHash} from "node:crypto";
import {ScientificNativeBehavioralEvidenceCoverageEngine} from
 "../laboratory/scientific-composition-constraint-evaluation/ScientificNativeBehavioralEvidenceCoverageEngine.js";

const keys=["nativeStudy","bridge","evm","witness","native","rollback",
  "rollbackValidated","recognized","inheritedAuth","inheritedAuthValidated","nftTrace","nftTraceValidated"] as const;
type Bundle=Parameters<ScientificNativeBehavioralEvidenceCoverageEngine["evaluate"]>[0];
const sha=(s:string)=>createHash("sha256").update(s).digest("hex");
async function main(){
    const args=process.argv.slice(2);
    assert.equal(args.length,13,
        "Expected study, bridge, EVM, witness, native constraints, rollback, validated rollback, recognized property, inherited burn, validated inherited burn, output");
    const rawTexts=await Promise.all(args.slice(0,12).map(p=>readFile(p,"utf8")));
    const data:any={raw:{}};
    keys.forEach((k,i)=>{
        data[k]=JSON.parse(rawTexts[i]);
        data.raw[k]=rawTexts[i];
    });
    const evaluator=new ScientificNativeBehavioralEvidenceCoverageEngine();
    const observed=evaluator.evaluate(data as Bundle);
    assert.deepEqual(observed.errors,[]);
    assert.equal(observed.status,"PARTIAL_OBSERVATION");
    assert.equal(observed.statistics.total,10);
    assert.equal(observed.statistics.scopedObserved,10);
    assert.equal(observed.statistics.partial,0);
    assert.equal(observed.statistics.missing,0);
    assert.equal(observed.allQuestionsResolved,false);
    assert.equal(observed.sourceCoverageComplete,false);
    assert.equal(observed.candidateAdmission,"NOT_ADMITTED");
    assert.equal(observed.finalScientificResult,"INCONCLUSIVE");
    const status=(side:string,category:string)=>observed.observations.find(
        x=>x.participantSide===side&&x.category===category)?.status;
    assert.equal(status("A","RESOURCE_DECREASE"),"SCOPED_OBSERVED");
    assert.equal(status("A","STATE_CONSISTENCY"),"SCOPED_OBSERVED");
    assert.equal(status("B","AUTHORIZATION"),"SCOPED_OBSERVED");
    assert.equal(status("B","RESOURCE_DECREASE"),"SCOPED_OBSERVED");
    assert.equal(status("JOINT","ATOMIC_EXECUTION"),"SCOPED_OBSERVED");
    assert.equal(status("JOINT","JOINT_ROLLBACK"),"SCOPED_OBSERVED");
    const cases:[
      string,(x:any)=>void
    ][]=[
      ["mismatched_native_study_sha",x=>{x.bridge.artifactHashes.nativeStudy="0".repeat(64);}],
      ["forged_study_specification_id",x=>{x.nativeStudy.specification.specifications[0].specificationId="FORGED";}],
      ["falsely_ready_specification",x=>{x.nativeStudy.specification.specifications[0].status="READY";}],
      ["promoted_native_candidate",x=>{x.nativeStudy.nativeCandidatesGenerated=1;}],
      ["changed_evm_transaction",x=>{x.evm.transactions.jointRedemption="0x"+"0".repeat(64);}],
      ["changed_evm_supply_delta",x=>{x.evm.observations.supplyDecrease="1";}],
      ["forged_native_preserved_count",x=>{x.native.result.statistics.preserved=2;}],
      ["forged_native_constraint_revision",x=>{x.native.constraints[0].sourceRevision="0".repeat(40);}],
      ["forged_witness_hash",x=>{x.witness.evidenceSha256="0".repeat(64);}],
      ["rollback_before_after_divergence",x=>{x.rollback.cases[0].measuredStateAfter.tokenSupply="999";}],
      ["rollback_missing_case",x=>{x.rollback.cases.pop();}],
      ["rollback_missing_reverted_receipt",x=>{x.rollback.cases[0].revertedReceiptStatus=null;}],
      ["rollback_spoofed_source",x=>{x.rollback.cases[0].sourceProvenance.participantA="other/repository@0";}],
      ["rollback_validated_wrong_digest",x=>{x.rollbackValidated.sourceReportSha256="0".repeat(64);}],
      ["rollback_validated_miscount",x=>{x.rollbackValidated.counts.revertedReceipts=0;}],
      ["recognized_property_wrong_tx",x=>{x.recognized.property.witnessTransaction="0x"+"f".repeat(64);}],
      ["recognized_missing_rollback_digest",x=>{x.recognized.sourceArtifacts[3].sha256="0".repeat(64);}],
      ["native_spec_missing_question",x=>{x.nativeStudy.specification.specifications[0].questions.pop();}],
      ["native_spec_forged_source_fact",x=>{x.nativeStudy.specification.specifications[0].questions[0].sourceFactIds=["AST:FORGED"];}],
      ["missing_original_evm_bytes",x=>{x.raw.evm="";}],
      ["missing_nft_liability_before",x=>{delete x.evm.observations.nftObligationBefore;}],
      ["forged_nft_liability_delta",x=>{x.evm.observations.nftObligationDecrease="1";}],
      ["missing_invariant_liability_before",x=>{
          x.witness.properties.find((p:any)=>p.invariantId==="INV-8060-BACKING-SOLVENT").checks.obligationsBeforeWei="";
      }],
      ["forged_inherited_auth_source",x=>{x.inheritedAuth.source.sha256="0".repeat(64);}],
      ["forged_inherited_auth_raw",x=>{x.raw.inheritedAuth="{}";}],
      ["forged_inherited_auth_validator_digest",x=>{x.inheritedAuthValidated.sourceReportSha256="0".repeat(64);}],
      ["forged_inherited_burn_supply",x=>{x.inheritedAuth.selfBurn.after.supply="123";}],
      ["forged_inherited_allowance",x=>{x.inheritedAuth.approvedDelegatedBurn.after.attackerAllowance="3";}],
      ["wrong_inherited_burn_dependency_sha",x=>{x.inheritedAuthValidated.inheritedBurnableSha256="0".repeat(64);}],
      ["fabricated_inherited_burn_permission",x=>{x.inheritedAuth.unapprovedDelegatedBurn.reverted=false;}],
      ["missing_raw_nft_trace",x=>{x.raw.nftTrace="";}],
      ["changed_nft_trace_transaction",x=>{x.nftTrace.transactionHash="0x"+"0".repeat(64);}],
      ["wrong_nft_compiler_source_hash",x=>{x.nftTrace.source.sha256="0".repeat(64);}],
      ["wrong_nft_trace_digest",x=>{x.nftTraceValidated.rawTraceSha256="0".repeat(64);}],
      ["nft_trace_no_liability_sstore",x=>{x.nftTraceValidated.observed.nftLiabilityDebitSstore=0;}],
      ["nft_trace_no_modifier_exit",x=>{x.nftTraceValidated.sourceMappedAnchors=
          x.nftTraceValidated.sourceMappedAnchors.filter((a:any)=>a.kind!=="NFT_REENTRANCY_EXIT_SSTORE");}],
      ["nft_trace_source_revision_swap",x=>{x.nftTraceValidated.sourceRevisionA="f".repeat(40);}]
    ];
    for(const [label,mutate] of cases){
        const changed=structuredClone(data);
        mutate(changed);
        const evaluated=evaluator.evaluate(changed as Bundle);
        assert.equal(evaluated.status,"BLOCKED_EVIDENCE",
            "Manipulated evidence was not rejected: "+label);
        assert.ok(evaluated.errors.length>0);
        assert.equal(evaluated.allQuestionsResolved,false);
        assert.equal(evaluated.finalScientificResult,"INCONCLUSIVE");
    }
    const report={
        ...observed,
        evidenceArtifactDigests:Object.fromEntries(keys.map((k,i)=>[k,sha(rawTexts[i])])),
        negativeControls:cases.map(([name])=>name),
        limitations:[
            "Partial evidence does not satisfy a source-derived evaluation question.",
            "Observed means only bounded pinned local-EVM evidence, not public-chain independent replay.",
            "NFT liability decrease is measured only for the pinned local EVM execution.",
            "Native candidate discovery and READY specification remain separate and blocked.",
            "All ten observations cover selected pinned local EVM executions only, not complete execution-path reachability."
        ]
    };
    await writeFile(args[12],JSON.stringify(report,null,2)+"\n");
    console.log("OECL_NATIVE_AST_QUESTION_COVERAGE:"+JSON.stringify({
        total:report.statistics.total,
        scopedObserved:report.statistics.scopedObserved,
        partial:report.statistics.partial,
        missing:report.statistics.missing,
        negativeControls:report.negativeControls.length,
        status:report.status,
        admission:report.candidateAdmission,
        polarity:report.finalScientificResult
    }));
}
main().catch(error=>{console.error(error);process.exitCode=1;});
