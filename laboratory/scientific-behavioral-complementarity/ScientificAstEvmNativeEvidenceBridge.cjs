"use strict";
/**
 * Fail-closed join of AST-derived SOURCE-ONLY hypothesis, independently
 * generated pinned EVM receipts, attributed invariant witnesses and native
 * scientific constraint/admission reports. This is NOT a candidate creator.
 */
const crypto=require("node:crypto");
const {analyze}=require("./ScientificGraphBoundBehavioralDiscovery.cjs");
const hash=x=>crypto.createHash("sha256").update(x).digest("hex");
const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const hex40=s=>typeof s==="string"&&/^[0-9a-f]{40}$/i.test(s);
const hex64=s=>typeof s==="string"&&/^[0-9a-f]{64}$/i.test(s);
const tx64=s=>typeof s==="string"&&/^0x[0-9a-f]{64}$/i.test(s);
const positive=s=>typeof s==="string"&&/^[1-9][0-9]*$/.test(s);
const rejection=(reason)=>({status:"INCONCLUSIVE",matched:false,
  candidateAdmission:"NOT_ADMITTED",scientificPolarity:"INCONCLUSIVE",reason});
function connect(i) {
  try {return inspect(i);} catch(error) {
    return rejection("MALFORMED_OR_UNVERIFIABLE_EVIDENCE");
  }
}
function inspect(i) {
  const {graph,ast,evm,witness,recognized,native,admission,discovery,raw}=i;
  if(![raw?.graph,raw?.ast,raw?.evm,raw?.witness,raw?.recognized,raw?.native]
    .every(x=>typeof x==="string"&&x.length>0))
    return rejection("MISSING_INDEPENDENT_ARTIFACT_BYTES");
  const derived=analyze(graph);
  if(derived.errors.length||derived.hypotheses.length!==1||
     ast.schemaVersion!=="OECL_AST_BOUND_BEHAVIORAL_SOURCE_DISCOVERY_V1"||
     ast.inputKind!=="PINNED_COMPILER_RESOLVED_AST_ONLY"||
     ast.executionEvidenceUsed!==false||
     ast.admission!=="NOT_ADMITTED"||
     ast.scientificPolarity!=="INCONCLUSIVE"||
     !eq(ast.hypotheses,derived.hypotheses)||
     !eq(ast.normalizedParticipants,derived.participants)||
     ast.graphEvidence?.sha256!==hash(raw.graph))
    return rejection("AST_HYPOTHESIS_NOT_VERIFIABLY_DERIVED");
  const sources=graph.provenance?.primary,dep=graph.provenance?.dependency;
  if(!Array.isArray(sources)||sources.length!==2||!dep?.integrity||
     dep.package!=="@openzeppelin/contracts"||dep.version!=="4.9.6")
    return rejection("SOURCE_IDENTITY_INCOMPLETE");
  const byClass=Object.fromEntries(derived.participants.map(x=>[x.assetClass,x]));
  const claim=byClass.CLAIM,fungible=byClass.FUNGIBLE;
  if(!claim||!fungible||derived.participants.length!==2)
    return rejection("WRONG_AST_ASSET_SEMANTICS");
  const claimSource=sources.find(x=>x.repository===claim.sourceId&&x.revision===claim.revision);
  const supplySource=sources.find(x=>x.repository===fungible.sourceId&&x.revision===fungible.revision);
  const hashes=witness.sourceLineage?.sourceHashes;
  if(!claimSource||!supplySource||!hashes||
     !hex40(claim.revision)||!hex40(fungible.revision)||
     claimSource.sourceSha256!==hashes.A||
     supplySource.sourceSha256!==hashes.B||
     !hex64(hashes.OZ_ERC20)||!hex64(hashes.OZ_BURNABLE)||
     dep.integrity!==witness.sourceLineage?.inheritedDependency?.integrity||
     dep.version!==witness.sourceLineage?.inheritedDependency?.version||
     graph.sources.find(x=>x.unit==="@openzeppelin/contracts/token/ERC20/ERC20.sol")?.sha256!==hashes.OZ_ERC20||
     graph.sources.find(x=>x.unit==="@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol")?.sha256!==hashes.OZ_BURNABLE)
    return rejection("AST_AND_PINNED_EVM_SOURCE_HASHES_DIVERGE");
  // All compiler facts must be present in the exact graph, with matching
  // dependency attribution. The evidence source ID is the actual repository,
  // NOT a guessed ERC identity derived from its filename.
  for(const p of derived.participants)for(const fact of p.provenance){
    const match=/^AST:(.+):([^:]+):(\d+)$/.exec(fact.factId);
    if(!match)return rejection("MALFORMED_AST_FACT_ID");
    const unit=match[1],offset=Number(match[3]);
    if(!Number.isSafeInteger(offset)||
       !graph.sources.some(x=>x.unit===unit&&x.sha256===fact.sourceSha256))
      return rejection("UNVERIFIED_AST_SOURCE_FACT");
    if(fact.sourceId!==p.sourceId &&
       (fact.sourceId!==dep.package||fact.sourceRevision!==dep.version||
        fact.attributedParticipantId!==p.sourceId||
        !p.provenance.some(a=>a.factId===fact.inheritanceAnchorFactId&&
          a.sourceId===p.sourceId)))
      return rejection("UNVERIFIED_DEPENDENCY_ATTRIBUTION");
  }
  if(evm.classification!=="LOCAL_REAL_EVM_TWO_PINNED_REFERENCE_REPOSITORIES"||
     evm.claimedGlobalCompatibility!==false||evm.chainId!==31337||
     evm.erc8060Repository!==claim.sourceId||
     evm.erc8060PinnedRevision!==claim.revision||
     evm.erc8098Repository!==fungible.sourceId||
     evm.erc8098PinnedRevision!==fungible.revision||
     evm.erc8098SourceSha256!==hashes.B||
     !tx64(evm.transactions?.jointRedemption)||
     witness.schemaVersion!=="OECL_PINNED_INVARIANT_WITNESS_V1"||
     witness.evidenceSha256!==hash(raw.evm)||
     witness.sourceTransactions?.joint!==evm.transactions.jointRedemption ||
     witness.evaluationSurfaceCompleteness!=="PARTIAL"||
     witness.scientificPolarity!=="INCONCLUSIVE")
    return rejection("EVM_WITNESS_OR_SOURCE_REVISION_MISMATCH");
  const bound=recognized.property?.sourceBinding;
  const property=recognized.property;
  if(recognized.schemaVersion!=="OECL_SOURCE_BOUND_EMERGENT_PROPERTY_RECOGNITION_V1"||
     recognized.candidateAdmission!=="NOT_ADMITTED"||
     recognized.scientificPolarity!=="INCONCLUSIVE"||
     property?.kind!=="SCOPED_ATOMIC_CROSS_ASSET_REDEMPTION_WITH_MONOTONE_SUPPLY"||
     property.status!=="OBSERVED_IN_PINNED_LOCAL_EVM"||
     property.witnessTransaction!==evm.transactions.jointRedemption||
     !bound||bound.chainId!==31337||
     bound.witnessTransaction!==evm.transactions.jointRedemption||
     bound.successEvidenceSha256!==hash(raw.evm)||
     recognized.sourceArtifacts?.[2]?.sha256!==hash(raw.evm)||
     !Array.isArray(bound.participants)||bound.participants.length!==2)
    return rejection("RECOGNIZED_EVM_EVENT_NOT_BOUND_TO_RECEIPT");
  const boundPairs=[
    {sourceId:claim.sourceId,revision:claim.revision,sourceSha256:hashes.A,assetClass:"NON_FUNGIBLE"},
    {sourceId:fungible.sourceId,revision:fungible.revision,sourceSha256:hashes.B,assetClass:"FUNGIBLE"}
  ];
  if(bound.participants.length!==boundPairs.length||
     boundPairs.some(p=>bound.participants.filter(q=>q.sourceId===p.sourceId&&
       q.revision===p.revision&&q.sourceSha256===p.sourceSha256&&
       q.assetClass===p.assetClass).length!==1)||
     bound.inheritedDependencies?.length!==1||
     !eq(bound.inheritedDependencies[0],{
       sourceId:"@openzeppelin/contracts",sourceRevision:dep.version,
       attributedParticipantId:fungible.sourceId,
       sourceSha256:hashes.OZ_BURNABLE,packageIntegrity:dep.integrity
     }))
    return rejection("RECOGNIZED_SOURCE_BINDING_INCOMPATIBLE_WITH_AST");
  const measured=property.observations;
  const values=evm.observations;
  if(!measured||!values||!positive(measured.nftValueRedeemedWei)||
     !positive(measured.fungibleSupplyDestroyedUnits)||
     measured.nftValueRedeemedWei!==values.ethRedeemed||
     measured.fungibleSupplyDestroyedUnits!==values.supplyDecrease||
     measured.backingAfterWei!==values.nftBackingAfter||
     measured.remainingNftObligationsWei!==values.nftObligationAfter||
     !values.sameTransactionContainsBothBurns||
     measured.distinctBurnLogIndices?.length!==2||
     measured.distinctBurnLogIndices[0]!==values.nftBurnLogIndex||
     measured.distinctBurnLogIndices[1]!==values.erc20BurnLogIndex||
     measured.independentlyCheckedRollbackScenarios!==4)
    return rejection("AST_PREDICTION_NOT_SUPPORTED_BY_BOUNDED_EVM_MEASUREMENTS");
  // Native engine has independently evaluated 3 bounded source constraints.
  // Require those exact numeric measurements to agree with source facts and
  // the measured receipt. Never silently reinterpret their local SUPPORT
  // result as a candidate-wide SUPPORTS admission.
  if(native.schemaVersion!=="OECL_NATIVE_BEHAVIORAL_PROPERTY_EVALUATION_V1"||
     native.candidateDiscovery!=="NOT_ADMITTED"||
     native.finalScientificResult!=="INCONCLUSIVE"||
     native.evaluationSurfaceCompleteness!=="PARTIAL"||
     native.result?.scientificPolarity!=="SUPPORT"||
     native.result?.statistics?.preserved!==3||
     native.constraints?.length!==3||native.observations?.length!==3)
    return rejection("NATIVE_CONSTRAINT_EVALUATION_INCOMPLETE");
  const expected=new Map([
    ["NATIVE-INV-8060-EXACT-PAYOUT",{side:"A",first:"A-PAYOUT",a:"paidWei",b:"redeemedWei",
      valueA:values.alicePayoutNetOfGas,valueB:values.ethRedeemed}],
    ["NATIVE-INV-8060-BACKING-SOLVENT",{side:"A",first:"A-BACKING-OBLIGATION",
      a:"afterWei",b:"remainingObligationWei",valueA:values.nftBackingAfter,
      valueB:values.nftObligationAfter}],
    ["NATIVE-INV-8098-MONOTONE-SUPPLY",{side:"B",first:"B-CONSTRUCTOR-MINT",
      a:"afterUnits",b:"beforeUnits",valueA:values.erc20SupplyAfter,
      valueB:values.erc20SupplyBefore}]
  ]);
  const facts=witness.sourceLineage?.facts;
  if(!Array.isArray(facts)||new Set(facts.map(f=>f.id)).size!==facts.length)
    return rejection("NATIVE_SOURCE_FACTS_INCONSISTENT");
  for(const [id,expect]of expected){
    const constraints=native.constraints.filter(c=>c.constraintId===id);
    const observations=native.observations.filter(o=>o.constraintId===id);
    if(constraints.length!==1||observations.length!==1)
      return rejection("NATIVE_CONSTRAINT_ID_NOT_UNIQUE");
    const c=constraints[0],o=observations[0];
    const first=facts.find(x=>x.id===expect.first);
    const source=expect.side==="A"?claim:supplySource;
    const revision=expect.side==="A"?claim.revision:fungible.revision;
    const associated=expect.side==="A"?claim.sourceId:fungible.sourceId;
    if(!first||first.repository!==associated||first.revision!==revision||
       c.participantSide!==expect.side||o.participantSide!==expect.side||
       c.sourceRevision!==revision||o.sourceRevision!==revision||
       c.factId!==expect.first||
       o.transactionHash!==evm.transactions.jointRedemption||
       c.basis!=="SOURCE_DERIVED_BEHAVIORAL_INVARIANT"||
       c.candidateId!==native.candidateId||o.candidateId!==native.candidateId||
       o.verdict!=="PRESERVED"||
       c.behavioralPredicate?.leftMetric!==expect.a||
       c.behavioralPredicate?.rightMetric!==expect.b||
       o.numericMeasurements?.[expect.a]!==expect.valueA||
       o.numericMeasurements?.[expect.b]!==expect.valueB)
      return rejection("NATIVE_CONSTRAINT_CANNOT_BE_ATTRIBUTED_TO_AST_OR_EVM");
  }
  if(discovery.schemaVersion!=="OECL_REAL_PINNED_SCIENTIFIC_DISCOVERY_V1"||
     discovery.scientificPolarity!=="INCONCLUSIVE"||
     !Array.isArray(discovery.matchedPairCandidates)||
     discovery.matchedPairCandidates.length!==0||
     admission.schemaVersion!=="OECL_PINNED_CANDIDATE_DISCOVERY_ADMISSION_V1"||
     admission.candidateDiscoveryStatus!=="BLOCKED"||
     admission.candidateAdmission?.status!=="BLOCKED"||
     admission.candidateScientificResult!=="INCONCLUSIVE")
    return rejection("NATIVE_CANDIDATE_ADMISSION_GATE_NOT_CLOSED");
  return {
    schemaVersion:"OECL_AST_EVM_NATIVE_EVIDENCE_BRIDGE_V1",
    status:"SCOPED_OBSERVATION_CONSISTENT",
    matched:true,reason:"AST_CLAIM_DECREASE_AND_FUNGIBLE_SUPPLY_DECREASE_MATCH_PINNED_LOCAL_EVM",
    hypothesisId:derived.hypotheses[0].hypothesisId,
    sourceRoles:[
      {sourceId:claim.sourceId,revision:claim.revision,sourceSha256:hashes.A,assetClass:"CLAIM"},
      {sourceId:fungible.sourceId,revision:fungible.revision,sourceSha256:hashes.B,assetClass:"FUNGIBLE"}
    ],
    dependency:{package:dep.package,version:dep.version,
      integrity:dep.integrity,sourceSha256:{ERC20:hashes.OZ_ERC20,ERC20Burnable:hashes.OZ_BURNABLE}},
    witnessTransaction:evm.transactions.jointRedemption,
    artifactHashes:{graph:hash(raw.graph),hypothesis:hash(raw.ast),evm:hash(raw.evm),
      witness:hash(raw.witness),recognized:hash(raw.recognized),native:hash(raw.native)},
    nativeConstraintObservations:3,
    nativeDiscoveredCandidateCount:0,
    remainingUnknowns:[
      "Full executable control-flow and dynamic dispatch not proved",
      "Candidate-specific complete constraint surface not available",
      "Independent native cross-protocol candidate discovery and READY specification absent"
    ],
    scientificPolarity:"INCONCLUSIVE",candidateAdmission:"NOT_ADMITTED",
    finalScientificResult:"INCONCLUSIVE"
  };
}
module.exports={connect};
