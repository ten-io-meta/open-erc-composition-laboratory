import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { ScientificCompositionConstraintEvaluatorEngine } from
  "../laboratory/scientific-composition-constraint-evaluation/ScientificCompositionConstraintEvaluatorEngine.js";
import type { ScientificCompositionConstraint } from
  "../laboratory/scientific-composition-evaluation-specification/ScientificCompositionConstraint.js";
import type { ScientificCompositionConstraintObservation } from
  "../laboratory/scientific-composition-constraint-evaluation/ScientificCompositionConstraintObservation.js";

const require=createRequire(import.meta.url);
const {connect}=require("../laboratory/scientific-behavioral-complementarity/ScientificAstEvmNativeEvidenceBridge.cjs");
type ObjectRecord=Record<string,any>;
async function main(){
  const args=process.argv.slice(2);
  assert.equal(args.length,9, "Expected graph, AST hypothesis, EVM receipt, source witnesses, recognized property, native evaluation, native admission, real native discovery, output");
  const [graphPath,astPath,evmPath,witnessPath,recognizedPath,nativePath,admissionPath,discoveryPath,outPath]=args;
  const keys=["graph","ast","evm","witness","recognized","native","admission","discovery"] as const;
  const rawContents=await Promise.all(args.slice(0,8).map(p=>readFile(p,"utf8")));
  const inputs: ObjectRecord={raw:{}};
  keys.forEach((key,i)=>{inputs[key]=JSON.parse(rawContents[i]);inputs.raw[key]=rawContents[i];});
  // Native scientific constraint evaluation is independently re-run here,
  // not accepted merely because its report says SUPPORT for three properties.
  const nativeEngine=new ScientificCompositionConstraintEvaluatorEngine();
  const recomputed=nativeEngine.evaluate(
    inputs.native.constraints as ScientificCompositionConstraint[],
    inputs.native.observations as ScientificCompositionConstraintObservation[]
  );
  assert.deepEqual(recomputed,inputs.native.result,
    "Native scientific constraint evaluation changed when independently recomputed");
  assert.equal(recomputed.scientificPolarity,"SUPPORT",
    "Only the three bounded local property constraints may return SUPPORT");
  const positive=connect(inputs);
  assert.equal(positive.status,"SCOPED_OBSERVATION_CONSISTENT",
    "AST hypothesis, EVM receipt and scientific evaluation did not join: "+positive.reason);
  assert.equal(positive.finalScientificResult,"INCONCLUSIVE");
  assert.equal(positive.candidateAdmission,"NOT_ADMITTED");
  const attacks:[string,(x:ObjectRecord)=>void][]=[
    ["forged_ast_hypothesis_id",x=>{x.ast.hypotheses[0].hypothesisId="FAKE";}],
    ["forged_ast_participant_revision",x=>{x.ast.normalizedParticipants[0].revision="0".repeat(40);}],
    ["ast_graph_artifact_hash_mismatch",x=>{x.ast.graphEvidence.sha256="0".repeat(64);}],
    ["forged_ast_source_fact",x=>{x.ast.hypotheses[0].sourceEvidence[0].factId="AST:FORGED";}],
    ["forged_ast_dependency_revision",x=>{
      const f=x.ast.normalizedParticipants[1].provenance.find((p:ObjectRecord)=>p.attributedParticipantId);
      f.sourceRevision="0.0.0";
    }],
    ["swapped_ast_primary_hashes",x=>{
      const p=x.graph.provenance.primary;
      [p[0].sourceSha256,p[1].sourceSha256]=[p[1].sourceSha256,p[0].sourceSha256];
    }],
    ["forged_graph_source_revision",x=>{x.graph.provenance.primary[0].revision="f".repeat(40);}],
    ["changed_graph_burn_route",x=>{
      const burn=x.graph.functions.find((f:ObjectRecord)=>f.contractName==="ERC8060Reference"&&f.name==="burn");
      x.graph.edges=x.graph.edges.filter((e:ObjectRecord)=>!(e.from===burn.id&&e.kind==="CALLS"));
    }],
    ["changed_pinned_evm_revision",x=>{x.evm.erc8098PinnedRevision="0".repeat(40);}],
    ["changed_pinned_evm_source_bytes_hash",x=>{x.evm.erc8098SourceSha256="0".repeat(64);}],
    ["tampered_evm_receipt",x=>{x.evm.observations.ethRedeemed="1";}],
    ["forged_witness_evm_sha",x=>{x.witness.evidenceSha256="0".repeat(64);}],
    ["forged_witness_openzeppelin_sha",x=>{x.witness.sourceLineage.sourceHashes.OZ_ERC20="0".repeat(64);}],
    ["forged_recognized_success_digest",x=>{x.recognized.property.sourceBinding.successEvidenceSha256="0".repeat(64);}],
    ["wrong_recognized_transaction",x=>{x.recognized.property.witnessTransaction="0x"+"0".repeat(64);}],
    ["wrong_recognized_asset_identity",x=>{x.recognized.property.sourceBinding.participants[0].sourceId="other/repo";}],
    ["wrong_recognized_dependency_integrity",x=>{x.recognized.property.sourceBinding.inheritedDependencies[0].packageIntegrity="false";}],
    ["wrong_evm_supply_delta",x=>{x.recognized.property.observations.fungibleSupplyDestroyedUnits="1";}],
    ["forged_native_source_revision",x=>{x.native.constraints[0].sourceRevision="0".repeat(40);}],
    ["native_wrong_transaction",x=>{x.native.observations[0].transactionHash="0x"+"0".repeat(64);}],
    ["native_missing_constraint",x=>{x.native.constraints.pop();}],
    ["native_forced_global_support",x=>{x.native.finalScientificResult="SUPPORTS";}],
    ["native_approved_candidate",x=>{x.admission.candidateAdmission.status="ELIGIBLE_FOR_REVIEW";}],
    ["native_discovery_invented_pair",x=>{x.discovery.matchedPairCandidates=[{id:"FORGED"}];}],
    ["native_measurement_differs_from_receipt",x=>{x.native.observations[0].numericMeasurements.paidWei="99";}],
    ["missing_native_evidence_bytes",x=>{x.raw.native="";}]
  ];
  for(const [label,mutate] of attacks){
    const altered=structuredClone(inputs);
    mutate(altered);
    const outcome=connect(altered);
    assert.equal(outcome.matched,false,"Adversarial evidence was accepted: "+label);
    assert.equal(outcome.scientificPolarity,"INCONCLUSIVE");
  }
  const report={
    ...positive,
    schemaVersion:"OECL_AST_EVM_NATIVE_BRIDGE_REPORT_V1",
    inputPaths:keys.map((key,i)=>({kind:key,path:args[i]})),
    nativeLocalEvaluation:{
      result:recomputed.scientificPolarity,
      total:recomputed.statistics.total,preserved:recomputed.statistics.preserved,
      scope:"PARTIAL_LOCAL_PROPERTY_CONSTRAINTS_ONLY"
    },
    rejectedAdversarialMutations:attacks.map(([label])=>label),
    finalScientificResult:"INCONCLUSIVE",
    candidateAdmission:"NOT_ADMITTED",
    notes:"Native constraint engine recomputed local property preservation; structural AST hypothesis and EVM evidence match, but no eligible discovered native candidate or complete surface exists."
  };
  await writeFile(outPath,JSON.stringify(report,null,2)+"\n");
  console.log("OECL_AST_EVM_NATIVE_BRIDGE:"+JSON.stringify({
    matched:report.matched,hypothesisId:report.hypothesisId,
    sourceRoles:report.sourceRoles.map((x:ObjectRecord)=>x.assetClass),
    observedNativeConstraints:report.nativeConstraintObservations,
    adversarialRejections:attacks.length,
    admission:report.candidateAdmission,polarity:report.finalScientificResult
  }));
}
main().catch(e=>{console.error(e);process.exitCode=1;});
