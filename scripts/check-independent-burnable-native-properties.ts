import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {readFile,writeFile} from "node:fs/promises";
import {join} from "node:path";
import {ScientificCompositionConstraintEvaluatorEngine}
    from "../laboratory/scientific-composition-constraint-evaluation/ScientificCompositionConstraintEvaluatorEngine.js";
import type {ScientificCompositionConstraint}
    from "../laboratory/scientific-composition-evaluation-specification/ScientificCompositionConstraint.js";
import type {ScientificCompositionConstraintObservation}
    from "../laboratory/scientific-composition-constraint-evaluation/ScientificCompositionConstraintObservation.js";

/**
 * Real native property evaluation for an independently executed source-only
 * hypothesis. It is NOT native candidate admission; there is no native READY
 * candidate specification or complete source/constraint surface for this pair.
 */
type EvmCase={
  scenario:string;transactionHash:string;receiptStatus:number;
  before:Record<string,string>;after:Record<string,string>;
  burnEvidence?:{tokenUnits:string;sameTransaction:boolean};
  observations:Record<string,string|boolean>;
};
const pinned8060="c7eed906835ab39fbc8439eb0493e5a5371b23a2";
const pinnedOz="dc44c9f1a4c3b10af99492eed84f83ed244203f6";
const sha=(value:string)=>createHash("sha256").update(value).digest("hex");
function findUniqueLine(raw:string,fragment:string){
  const lines=raw.split(/\r?\n/);
  const found=lines.flatMap((text,i)=>text.includes(fragment)?[{line:i+1,text:text.trim()}]:[]);
  assert.equal(found.length,1,"Expected exactly one Solidity source anchor: "+fragment);
  return found[0];
}
async function main(){
  const [bridgeFile,evmFile,sourceReportFile,root8060,rootOZ,outFile]=process.argv.slice(2);
  assert.ok(bridgeFile&&evmFile&&sourceReportFile&&root8060&&rootOZ&&outFile);
  const bridge=JSON.parse(await readFile(bridgeFile,"utf8"));
  const evm=JSON.parse(await readFile(evmFile,"utf8"));
  const source=JSON.parse(await readFile(sourceReportFile,"utf8"));
  assert.equal(bridge.schemaVersion,"OECL_INDEPENDENT_EVM_EVIDENCE_BRIDGE_V1");
  assert.equal(bridge.scientificVerdict,"INCONCLUSIVE");
  assert.equal(bridge.candidateAdmission,"NOT_ADMITTED");
  assert.equal(bridge.admissionDecision,"WITHHELD_PENDING_NATIVE_SCOPED_EVALUATION");
  assert.equal(bridge.sourceReportSha256,sha(JSON.stringify(source)));
  assert.equal(bridge.evmReceiptSha256,sha(JSON.stringify(evm)));
  assert.equal(bridge.sourceHypothesisId,source.hypotheses[0].hypothesisId);
  assert.equal(evm.coverage.positive,3);
  assert.equal(evm.coverage.negative,7);
  assert.equal(evm.coverage.allNegativeRollbacksVerified,true);
  assert.deepEqual(bridge.sourcePair,["ERC-8060","ERC-20-BURNABLE"]);
  const rawA=await readFile(join(root8060,"contracts/ERC8060Reference.sol"),"utf8");
  const rawBurn=await readFile(join(rootOZ,"contracts/token/ERC20/extensions/ERC20Burnable.sol"),"utf8");
  const rawERC20=await readFile(join(rootOZ,"contracts/token/ERC20/ERC20.sol"),"utf8");
  assert.equal(sha(rawA),source.selected[0].sourceSha256);
  assert.equal(sha(rawBurn),source.selected[1].sourceSha256);
  assert.equal(rawBurn,await readFile(join(root8060,
    "node_modules/@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol"),"utf8"));
  assert.equal(rawERC20,await readFile(join(root8060,
    "node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol"),"utf8"));
  assert.equal(evm.sourceChain.participants[0].revision,pinned8060);
  assert.equal(evm.sourceChain.participants[1].version,"4.9.6");

  const candidateId=bridge.sourceHypothesisId;
  assert.match(candidateId,/^AST-HYP-[a-f0-9]{24}$/);
  const originals=[
    {side:"A" as const,id:"ERC-8060",repo:"ten-io-meta/erc8060-native-eth-value",
      revision:pinned8060,file:"contracts/ERC8060Reference.sol",name:"ERC8060Reference",
      anchor:findUniqueLine(rawA,"totalRedeemableValue -= redeemable;"),raw:rawA},
    {side:"B" as const,id:"ERC-20-BURNABLE",repo:"OpenZeppelin/openzeppelin-contracts",
      revision:pinnedOz,file:"contracts/token/ERC20/ERC20.sol",name:"ERC20",
      anchor:findUniqueLine(rawERC20,"_totalSupply -= amount;"),raw:rawERC20}
  ];
  const positive=evm.cases.find((x:EvmCase)=>x.scenario==="AUTHORIZED_AND_FUNDED") as EvmCase;
  assert.ok(positive);
  assert.equal(positive.receiptStatus,1);
  assert.equal(positive.burnEvidence?.sameTransaction,true);
  assert.equal(positive.observations.ownerReceivedWeiAfterGas,"100000000000000000");
  assert.equal(positive.observations.nftObligationDeltaWei,"100000000000000000");
  assert.equal(positive.observations.tokenSupplyDeltaBaseUnits,"1000000000000000000");
  const constraints:ScientificCompositionConstraint[]=[];
  const observations:ScientificCompositionConstraintObservation[]=[];
  const add=(i:0|1,label:string,
      predicate:NonNullable<ScientificCompositionConstraint["behavioralPredicate"]>,
      measurements:Record<string,string>)=>{
    const p=originals[i];
    const constraintId="INDEPENDENT-"+label;
    const factId="PINNED-SOURCE-LINE-"+p.side+"-"+p.anchor.line;
    const main:ScientificCompositionConstraint={
      constraintId,candidateId,participantSide:p.side,participantKind:"PROTOCOL",
      participantId:p.id,sourceId:"GITHUB-"+p.repo.replaceAll("/","-"),
      sourceRevision:p.revision,factId,
      basis:"SOURCE_DERIVED_BEHAVIORAL_INVARIANT",
      containerKind:"CONTRACT",containerSymbol:p.name,
      locator:{
        sourceLocation:p.repo+"@"+p.revision,
        filePath:p.file,startLine:p.anchor.line,endLine:p.anchor.line
      },
      rawText:p.anchor.text,behavioralPredicate:predicate,
      dependencySources:i===1?[{
        repository:p.repo,revision:p.revision,
        filePath:"contracts/token/ERC20/extensions/ERC20Burnable.sol",
        sourceSha256:sha(rawBurn)
      }]:[]
    };
    constraints.push(main);
    observations.push({
      observationId:"INDEPENDENT-OBS-"+label,candidateId,constraintId,
      participantSide:p.side,sourceRevision:p.revision,
      transactionHash:positive.transactionHash,verdict:"PRESERVED",
      evidence:[
        "LOCAL-EVM-TRANSACTION:"+positive.transactionHash,
        "SOURCE-SHA256:"+sha(p.raw),
        "SOURCE-LINE:"+p.repo+"@"+p.revision+":"+p.file+":"+p.anchor.line,
        "EVM-RECEIPT-SHA256:"+bridge.evmReceiptSha256
      ],
      numericMeasurements:measurements
    });
  };
  const unsigned=(x:unknown)=>{
    assert.equal(typeof x,"string");
    assert.match(x as string,/^(0|[1-9][0-9]*)$/);
    return x as string;
  };
  add(0,"8060-SOLVENT",{
    kind:"UNSIGNED_INTEGER_RELATION",leftMetric:"backingAfterWei",
    operator:"GTE",rightMetric:"obligationAfterWei"
  },{
    backingAfterWei:unsigned(positive.after.backingWei),
    obligationAfterWei:unsigned(positive.after.obligationWei)
  });
  add(0,"8060-EXACT-REDEMPTION",{
    kind:"UNSIGNED_INTEGER_RELATION",leftMetric:"liabilityDecreaseWei",
    operator:"EQ",rightMetric:"ethPaidWei"
  },{
    liabilityDecreaseWei:unsigned(positive.observations.nftObligationDeltaWei),
    ethPaidWei:unsigned(positive.observations.ownerReceivedWeiAfterGas)
  });
  add(1,"ERC20-NONINCREASE",{
    kind:"UNSIGNED_INTEGER_RELATION",leftMetric:"supplyAfter",
    operator:"LTE",rightMetric:"supplyBefore"
  },{
    supplyAfter:unsigned(positive.after.tokenTotalSupply),
    supplyBefore:unsigned(positive.before.tokenTotalSupply)
  });
  add(1,"ERC20-EXACT-BURN",{
    kind:"UNSIGNED_INTEGER_RELATION",leftMetric:"supplyDecrease",
    operator:"EQ",rightMetric:"burnedUnits"
  },{
    supplyDecrease:unsigned(positive.observations.tokenSupplyDeltaBaseUnits),
    burnedUnits:unsigned(positive.burnEvidence?.tokenUnits)
  });
  const engine=new ScientificCompositionConstraintEvaluatorEngine();
  const evaluation=engine.evaluate(constraints,observations);
  assert.equal(evaluation.scientificPolarity,"SUPPORT",JSON.stringify(evaluation.errors));
  assert.equal(evaluation.statistics.preserved,4);
  assert.equal(evaluation.statistics.unevaluated,0);
  assert.equal(evaluation.errors.length,0);
  const falsified=structuredClone(observations);
  falsified[2].numericMeasurements!.supplyAfter=
    (BigInt(falsified[2].numericMeasurements!.supplyBefore)+1n).toString();
  assert.equal(engine.evaluate(constraints,falsified).scientificPolarity,"INCONCLUSIVE",
    "False preservation of increasing supply must not pass native checks");
  falsified[2].verdict="VIOLATED";
  assert.equal(engine.evaluate(constraints,falsified).scientificPolarity,"CHALLENGE",
    "A correctly measured violation is a native challenge, not automatic support");
  assert.equal(engine.evaluate(constraints,observations.slice(0,3))
    .scientificPolarity,"INCONCLUSIVE");
  const nativeReport={
    schemaVersion:"OECL_8060_ERC20_BURNABLE_NATIVE_PROPERTIES_V1",
    provenance:{
      graphHypothesisId:candidateId,
      sourceReportSha256:bridge.sourceReportSha256,
      independentEvmReceiptSha256:bridge.evmReceiptSha256,
      bridgeDigest:sha(JSON.stringify(bridge)),
      participantRevisions:[pinned8060,pinnedOz],
      sourceSha256:[sha(rawA),sha(rawBurn),sha(rawERC20)]
    },
    nativePropertyEvaluation:evaluation,
    constraints,observations,
    localPropertyPolarity:"SUPPORT",
    finalScientificVerdict:"INCONCLUSIVE",
    candidateAdmission:"NOT_ADMITTED",
    nativeDiscoveryReady:false,
    nativeCandidateAdmissionPerformed:false,
    sourceCoverageComplete:false,
    experimentalScope:"ONLY_THE_RECORDED_LOCAL_EVM_AND_TEST_FIXTURES",
    unmodeledJointBehavior:[
      "Atomicity, callback safety and cross-protocol custody are not represented by four participant-side numeric predicates.",
      "Three local positive controls and seven failures do not cover all possible EVM paths or protocol implementations.",
      "The generic AST source hypothesis lacks a native READY candidate specification and complete scientific admission review."
    ],
    nativeAdversarialControls:{
      tamperedPreservation:"INCONCLUSIVE",
      actualMeasuredViolation:"CHALLENGE",
      missingObservation:"INCONCLUSIVE"
    }
  };
  await writeFile(outFile,JSON.stringify(nativeReport,null,2)+"\n");
  console.log("OECL_NATIVE_INDEPENDENT_BURNABLE:"+JSON.stringify({
    observed:4,localPropertyPolarity:evaluation.scientificPolarity,
    finalScientificVerdict:nativeReport.finalScientificVerdict,
    admitted:nativeReport.candidateAdmission
  }));
}
main().catch(e=>{console.error(e);process.exitCode=1;});
