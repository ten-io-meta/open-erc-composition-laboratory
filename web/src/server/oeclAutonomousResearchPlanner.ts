import { createHash } from "node:crypto";
import type { DocumentaryPair, StandardDocument } from "./oeclErcDocumentaryDiscovery";

/**
 * Generic, bounded and deterministic source-anchored research protocol designer.
 * This module is deliberately NOT an LLM, EVM runtime, semantic proof engine,
 * general ERC compatibility classifier or source code execution service.
 */
export type ScientistAnchor = {
  sourceId:string;
  documentSha256:string;
  sourceUrl:string;
  kind:"DECLARED_PREREQUISITE"|"SHARED_INTERFACE_LABEL"|
    "INTERFACE_LABEL"|"NORMATIVE_EXCERPT";
  excerpt:string;
};
export type AutonomousHypothesis = {
  id:string;
  family:"DECLARED_PREREQUISITE_CONFORMANCE"|
    "SHARED_PREREQUISITE_SEMANTICS"|
    "SHARED_INTERFACE_SEMANTICS"|
    "CONDITIONAL_ASSET_FLOW"|
    "SINGLE_ERC_NORMATIVE_TEST"|
    "SINGLE_ERC_INTERFACE_TEST";
  relationshipScope:"CROSS_STANDARD_CONDITIONAL"|"SINGLE_STANDARD_ONLY";
  priority:number;
  question:string;
  conditionalPrediction:string;
  falsifier:string;
  alternativeExplanation:string;
  positiveControl:string;
  negativeControl:string;
  preconditions:string[];
  evidenceRequired:string[];
  anchors:ScientistAnchor[];
  hypothesisStatus:"PROPOSED_FOR_HUMAN_SEMANTIC_REVIEW";
  experimentStatus:"NOT_EXECUTED";
};
export type AutonomousResearchPlan = {
  schemaVersion:"OECL_AUTONOMOUS_DOCUMENTARY_SCIENTIST_V1";
  engine:"DETERMINISTIC_SOURCE_ANCHORED_PLANNER";
  autonomyLevel:"DOCUMENTARY_HYPOTHESIS_AND_FALSIFIER_DESIGN_ONLY";
  scope:"OFFICIAL_ERC_SPECIFICATIONS_ONLY";
  pairKey:string;
  sourceRevisions:{id:string;sha256:string;ref:"master (mutable)"}[];
  planningStatus:"CROSS_STANDARD_CANDIDATES_FOR_REVIEW"|
    "SINGLE_STANDARD_ONLY_NO_COMPOSITION_INFERRED"|
    "PARTIAL_DOCUMENTS_NO_PAIR_CLAIM"|
    "ABSTAINED_NO_SUPPORTED_ANCHORS";
  hypotheses:AutonomousHypothesis[];
  abstentionReasons:string[];
  nextActions:string[];
  evidenceGap:string[];
  outcome:"PROPOSED_NOT_TESTED";
  scientificVerdict:"NOT_EVALUATED";
  compatibilityVerdict:"NOT_EVALUATED";
  candidateAdmission:"NOT_ADMITTED";
  sourceCompiled:false;
  evmExecuted:false;
  experimentDispatched:false;
  humanSemanticReviewRequired:true;
  executionGate:"BLOCKED_UNTIL_PINNED_IMPLEMENTATION_AND_REVIEWED_PROTOCOL";
  planSha256:string;
};
const hash=(value:string)=>createHash("sha256").update(value).digest("hex");
const isSha=(v:unknown):v is string=>typeof v==="string"&&/^[a-f0-9]{64}$/.test(v);
const legalId=(v:unknown)=>typeof v==="string"&&/^ERC-[1-9][0-9]{0,7}$/.test(v);
const approved=(d:StandardDocument)=>d.availability==="PUBLISHED"&&
  legalId(d.id)&&isSha(d.provenance?.sha256)&&d.provenance?.ref==="master (mutable)"&&
  d.provenance.sourceUrl==="https://raw.githubusercontent.com/ethereum/ERCs/master/ERCS/erc-"+
    d.id.slice(4)+".md";
const unique=(items:string[])=>[...new Set(items)];
const safeText=(x:unknown,max=250)=>typeof x==="string"?x.slice(0,max).trim():"";
const prereq=(v:string)=>/^EIP-[1-9][0-9]{0,7}$/.test(v);
const method=(v:string)=>/^[A-Za-z_][A-Za-z0-9_]{1,54}$/.test(v);

function anchor(d:StandardDocument,kind:ScientistAnchor["kind"],excerpt:string):ScientistAnchor{
  if(!approved(d)||!excerpt)throw Error("SCIENTIST_UNVERIFIED_DOCUMENT_ANCHOR");
  return {sourceId:d.id,documentSha256:d.provenance.sha256!,
    sourceUrl:d.provenance.sourceUrl,kind,excerpt:safeText(excerpt)};
}
function proposal(
  key:string,
  family:AutonomousHypothesis["family"],
  scope:AutonomousHypothesis["relationshipScope"],
  priority:number,
  anchors:ScientistAnchor[],
  wording:Pick<AutonomousHypothesis,"question"|"conditionalPrediction"|"falsifier"|
    "alternativeExplanation"|"positiveControl"|"negativeControl"|
    "preconditions"|"evidenceRequired">
):AutonomousHypothesis{
  if(!anchors.length||anchors.some(a=>!isSha(a.documentSha256)||!a.excerpt))
    throw Error("SCIENTIST_MISSING_SOURCE_ANCHOR");
  const stable=anchors.map(a=>[a.sourceId,a.documentSha256,a.kind,a.excerpt].join(":")).sort();
  return {id:"SCI-HYP-"+hash(JSON.stringify([key,family,stable])).slice(0,24),family,
    relationshipScope:scope,priority,...wording,anchors,
    hypothesisStatus:"PROPOSED_FOR_HUMAN_SEMANTIC_REVIEW",
    experimentStatus:"NOT_EXECUTED"};
}
function cleanPrerequisites(d:StandardDocument):string[]{
  return unique(Array.isArray(d.requires)?d.requires.filter(prereq):[]).slice(0,20);
}
function cleanInterfaces(d:StandardDocument):string[]{
  return unique(Array.isArray(d.interfaceNames)?d.interfaceNames.filter(method):[]).slice(0,24);
}
function cleanRequirements(d:StandardDocument):string[]{
  return unique(Array.isArray(d.requirements)?d.requirements.filter(x=>
    typeof x==="string"&&x.length>=24&&x.length<=300&&/\b(MUST|SHALL|SHOULD)\b/.test(x)):[])
    .slice(0,6);
}
const requirements=[
  "Pin reviewed implementation source bytes, complete imports and compiler version",
  "Resolve typed ABI, caller roles and actual execution preconditions",
  "Register a positive, negative and boundary experiment before execution",
  "Use an independent observation oracle and preserve unmined/reverted results separately",
];
const allGaps=[
  "Source documents do not prove a contract implementation exists or conforms.",
  "No typed ABI, authorization, custody, units, callback or rollback path has been verified for this pair.",
  "No isolated EVM execution, authenticated receipt, test oracle or general interoperability result exists for this plan.",
];

export function designAutonomousResearch(pair:DocumentaryPair):AutonomousResearchPlan{
  if(pair.status!=="DOCUMENTARY_COMPARISON"||
     pair.scope!=="OFFICIAL_ERC_SPECIFICATIONS_ONLY"||
     pair.standards.length!==2||pair.protocols.length!==2||
     !pair.standards.every((d,i)=>d.id===pair.protocols[i]&&legalId(d.id))||
     pair.protocols[0]===pair.protocols[1]||
     pair.scientificVerdict!=="NOT_EVALUATED"||
     pair.candidateAdmission!=="NOT_ADMITTED"||
     pair.implementationVerified!==false||pair.evmExecuted!==false)
    throw Error("SCIENTIST_REJECTED_UNVERIFIED_DOCUMENTARY_INPUT");

  // Canonical source ordering means the same hypothesis ID for a pair reversal.
  const sorted=[...pair.standards].sort((a,b)=>Number(a.id.slice(4))-Number(b.id.slice(4)));
  const [a,b]=sorted,key=a.id+"|"+b.id;
  const valid=sorted.filter(approved);
  const items:AutonomousHypothesis[]=[];
  if(valid.length===2){
    for(const [dependent,base] of [[a,b],[b,a]]){
      const requirement="EIP-"+base.id.slice(4);
      if(!cleanPrerequisites(dependent).includes(requirement))continue;
      items.push(proposal(key,"DECLARED_PREREQUISITE_CONFORMANCE",
        "CROSS_STANDARD_CONDITIONAL",100,
        [anchor(dependent,"DECLARED_PREREQUISITE",requirement)],
        {
          question:"Does a pinned "+dependent.id+" implementation satisfy its declared "+base.id+
            " prerequisite under the same interface roles and state transitions?",
          conditionalPrediction:"A conforming "+dependent.id+" implementation should satisfy the requirements of "+base.id+
            " relevant to the specific integration, if both roles are actually implemented.",
          falsifier:"A reproducible, independently observed failure of a specific, applicable "+base.id+
            " requirement in the pinned "+dependent.id+" implementation under documented preconditions.",
          alternativeExplanation:"A named specification prerequisite is metadata; a contract may omit the relevant interface, use an adapter or implement a nonconforming variant.",
          positiveControl:"Confirm the expected requirement with a separately verified implementation and valid authorized input.",
          negativeControl:"Use an invalid precondition or boundary input; distinguish expected rejection from a standards violation.",
          preconditions:["Human reviewer confirms the exact required clause of "+base.id,
            "The tested implementation and expected interface roles are pinned and relevant"],
          evidenceRequired:[...requirements,"A clause-level conformance oracle for the prerequisite"],
        }));
    }
    const sharedPrereq=cleanPrerequisites(a).filter(x=>cleanPrerequisites(b).includes(x));
    if(sharedPrereq.length)items.push(proposal(key,"SHARED_PREREQUISITE_SEMANTICS",
      "CROSS_STANDARD_CONDITIONAL",80,
      [anchor(a,"DECLARED_PREREQUISITE",sharedPrereq[0]),
       anchor(b,"DECLARED_PREREQUISITE",sharedPrereq[0])],
      {
        question:"Do "+a.id+" and "+b.id+" actually interpret their common "+sharedPrereq[0]+
          " prerequisite in compatible roles?",
        conditionalPrediction:"Only when two reviewed implementations share the same interface, roles and units could a common dependency support matched behavior.",
        falsifier:"An independently observed ABI, role, unit or state-transition mismatch defeats the proposed equivalence for those reviewed implementations.",
        alternativeExplanation:"The shared prerequisite may serve unrelated roles in the two standards.",
        positiveControl:"Compare a known-good invocation of the shared prerequisite under matched roles.",
        negativeControl:"Change a role, interface argument or unit independently and check for mismatched behavior.",
        preconditions:["Both implementations independently satisfy the prerequisite",
          "Identify comparable functions and units without assuming a shared state"],
        evidenceRequired:[...requirements,"Typed role-matched prerequisite conformance results"],
      }));
    const common=cleanInterfaces(a).filter(x=>cleanInterfaces(b).includes(x));
    if(common.length)items.push(proposal(key,"SHARED_INTERFACE_SEMANTICS",
      "CROSS_STANDARD_CONDITIONAL",85,
      [anchor(a,"SHARED_INTERFACE_LABEL",common[0]),
       anchor(b,"SHARED_INTERFACE_LABEL",common[0])],
      {
        question:"Does the shared documented method label "+common[0]+" have the same typed ABI, role and state meaning in both implementations?",
        conditionalPrediction:"Under a fixed, role-matched implementation pair, behavioral interchangeability requires compatible signatures and observable effects.",
        falsifier:"Different compiled signatures or a reproducible state/permission mismatch under equivalent preconditions refutes interchangeability for that pair.",
        alternativeExplanation:"Identical interface names do not establish ABI equivalence or shared state.",
        positiveControl:"Invoke each fully verified interface with a valid, matched test fixture.",
        negativeControl:"Probe missing or mismatched signatures and one unauthorized or boundary call.",
        preconditions:["The label "+common[0]+" names the intended operation rather than a tutorial",
          "Both implementations have verified complete interfaces and comparable roles"],
        evidenceRequired:[...requirements,"Independent ABI decoding and state-difference oracle"],
      }));
    const assetMethods=["transferFrom","safeTransferFrom","transfer","safeBatchTransferFrom"];
    const receiverMethods=["deposit","mint","redeem","withdraw"];
    const paths=[[a,b],[b,a]] as [StandardDocument,StandardDocument][];
    for(const [giver,taker] of paths){
      const transfer=assetMethods.find(x=>cleanInterfaces(giver).includes(x));
      const receiver=receiverMethods.find(x=>cleanInterfaces(taker).includes(x));
      if(!transfer||!receiver)continue;
      items.push(proposal(key,"CONDITIONAL_ASSET_FLOW",
        "CROSS_STANDARD_CONDITIONAL",70,
        [anchor(giver,"INTERFACE_LABEL",transfer),
         anchor(taker,"INTERFACE_LABEL",receiver)],
        {
          question:"Can a reviewed adapter connect "+giver.id+"."+transfer+" to "+taker.id+"."+
            receiver+" without losing asset custody or rollback guarantees?",
          conditionalPrediction:"If token classes, roles, units and transfer semantics agree, an adapter may support a measured, isolated operation.",
          falsifier:"A verified loss of custody, invalid authorization or incomplete rollback in a preregistered adapter refutes that specific candidate.",
          alternativeExplanation:"The method labels may concern different asset types, call semantics or economic accounting paths.",
          positiveControl:"An authorized positive-quantity operation with before/after custody and supply witnesses.",
          negativeControl:"An unauthorized or intentionally failed second-leg operation with full rollback and callback checks.",
          preconditions:["Explicit adapter and asset-type compatibility reviewed by a human",
            "Source and execution role identity pinned for both contracts"],
          evidenceRequired:[...requirements,"Accounting invariants, units and independently checked rollback"],
        }));
      break; // One scoped role direction per pair, never all inferred routes.
    }
  }

  // At least one grounded per-standard test where text is available, even
  // when the pair has NO direct relationship. This is not a composition claim.
  for(const d of valid){
    const norm=cleanRequirements(d)[0];
    const label=cleanInterfaces(d)[0];
    if(norm){
      items.push(proposal(key,"SINGLE_ERC_NORMATIVE_TEST","SINGLE_STANDARD_ONLY",50,
        [anchor(d,"NORMATIVE_EXCERPT",norm)],
        {
          question:"Does an independently pinned "+d.id+" implementation satisfy this candidate normative excerpt in its applicable context?",
          conditionalPrediction:"If a human confirms that the cited text is a binding applicable requirement, a conforming implementation should respect it in an appropriately chosen scenario.",
          falsifier:"An independently reproduced implementation trace violating the confirmed clause while its documented preconditions hold.",
          alternativeExplanation:"The extracted MUST/SHALL/SHOULD line may be conditional, advisory, illustrative or incomplete without surrounding text.",
          positiveControl:"Define a valid scenario and independently verify the expected behavior against the complete clause.",
          negativeControl:"Vary or remove the relevant precondition, record whether the expected behavior should change.",
          preconditions:["Human reads the complete clause and determines normative force and applicability",
            "Pin any tested implementation and independent oracle"],
          evidenceRequired:[...requirements,"Complete specification paragraph and normative-context review"],
        }));
    }else if(label){
      items.push(proposal(key,"SINGLE_ERC_INTERFACE_TEST","SINGLE_STANDARD_ONLY",40,
        [anchor(d,"INTERFACE_LABEL",label)],
        {
          question:"Does an independently pinned "+d.id+" implementation expose the documented "+label+" interface with the expected types?",
          conditionalPrediction:"If the documented label is normative for the selected implementation role, the corresponding interface should be present and correctly typed.",
          falsifier:"A reviewed compiler ABI showing the mandatory "+label+" operation is absent or incompatible under the stated role.",
          alternativeExplanation:"A method label can be optional, illustrative, version-specific or satisfied through another interface.",
          positiveControl:"Compile and query the interface on a known conforming reviewed implementation.",
          negativeControl:"Compare with an intentionally missing or mismatched interface and confirm rejection by the oracle.",
          preconditions:["Reviewer determines whether the method is mandatory",
            "Pin implementation, compiler, inherited ABI and interface role"],
          evidenceRequired:["Original interface section and human applicability review",
            "Pinned source compiler ABI and separately defined conformance oracle"],
        }));
    }else{
      const req=cleanPrerequisites(d)[0];
      if(req)items.push(proposal(key,"SINGLE_ERC_NORMATIVE_TEST","SINGLE_STANDARD_ONLY",35,
        [anchor(d,"DECLARED_PREREQUISITE",req)],
        {
          question:"Does the pinned "+d.id+" implementation satisfy its stated "+req+" prerequisite?",
          conditionalPrediction:"When "+req+" is applicable, a conforming implementation should meet its requirements.",
          falsifier:"A verified, applicable "+req+" conformance failure in the chosen immutable implementation.",
          alternativeExplanation:"The prerequisite may be external or only apply to one interface role.",
          positiveControl:"Run a conformance oracle against the explicitly required behavior.",
          negativeControl:"Check a documented rejection or boundary condition separately.",
          preconditions:["Full prerequisite and role reviewed","Implementation and oracle pinned"],
          evidenceRequired:["Read the referenced "+req+" specification",...requirements],
        }));
    }
  }
  // Strongest cross-standard candidates first; no artificial null hypotheses.
  const dedup=[...new Map(items.map(h=>[h.id,h])).values()]
    .sort((x,y)=>y.priority-x.priority||x.id.localeCompare(y.id))
    .slice(0,6);
  const cross=dedup.some(h=>h.relationshipScope==="CROSS_STANDARD_CONDITIONAL");
  const incomplete=valid.length!==2;
  const status:AutonomousResearchPlan["planningStatus"]=incomplete?
    "PARTIAL_DOCUMENTS_NO_PAIR_CLAIM":cross?
      "CROSS_STANDARD_CANDIDATES_FOR_REVIEW":dedup.length?
        "SINGLE_STANDARD_ONLY_NO_COMPOSITION_INFERRED":"ABSTAINED_NO_SUPPORTED_ANCHORS";
  const abstentionReasons:string[]=[];
  for(const d of sorted.filter(x=>!approved(x))){
    abstentionReasons.push(d.id+": "+d.availability+
      " or missing verifiable official-document SHA. No hypothesis is inferred from this source.");
  }
  if(!cross)abstentionReasons.push("No source-anchored cross-standard composition mechanism can be inferred for this pair.");
  if(!dedup.length)abstentionReasons.push("No extracted requirement, method label or prerequisite supports even a scoped preliminary hypothesis.");
  const provenance=valid.map(d=>({id:d.id,sha256:d.provenance.sha256!,ref:"master (mutable)" as const}));
  const plan:Omit<AutonomousResearchPlan,"planSha256">={
    schemaVersion:"OECL_AUTONOMOUS_DOCUMENTARY_SCIENTIST_V1",
    engine:"DETERMINISTIC_SOURCE_ANCHORED_PLANNER",
    autonomyLevel:"DOCUMENTARY_HYPOTHESIS_AND_FALSIFIER_DESIGN_ONLY",
    scope:"OFFICIAL_ERC_SPECIFICATIONS_ONLY",pairKey:key,
    sourceRevisions:provenance,planningStatus:status,hypotheses:dedup,
    abstentionReasons,
    nextActions:dedup.length?[
      "Review original specification clauses, applicability and alternative explanations.",
      "Identify immutable contract implementations or an independent off-chain oracle, as applicable.",
      "Confirm typed execution roles and preregister explicit, adversarial falsification tests.",
      "Run only authorized, capability-gated experiments; independently check outcomes before any scoped conclusion."
    ]:[
      "Collect missing original specifications and independent source evidence.",
      "Do not infer a relationship from ERC identifiers or an empty list of extracted methods."
    ],
    evidenceGap:allGaps,
    outcome:"PROPOSED_NOT_TESTED",scientificVerdict:"NOT_EVALUATED",
    compatibilityVerdict:"NOT_EVALUATED",candidateAdmission:"NOT_ADMITTED",
    sourceCompiled:false,evmExecuted:false,experimentDispatched:false,
    humanSemanticReviewRequired:true,
    executionGate:"BLOCKED_UNTIL_PINNED_IMPLEMENTATION_AND_REVIEWED_PROTOCOL",
  };
  return {...plan,planSha256:hash(JSON.stringify(plan))};
}

/**
 * Fail closed on modified plans. Regeneration is a deterministic consistency
 * check of source-scoped protocol design, NOT an independent experiment.
 */
export function verifyAutonomousResearchPlan(
  pair:DocumentaryPair,plan:AutonomousResearchPlan
):boolean{
  try{
    if(!plan||typeof plan!=="object")return false;
    const canonical=designAutonomousResearch(pair);
    return plan.planSha256===canonical.planSha256&&
      JSON.stringify(plan)===JSON.stringify(canonical);
  }catch{return false;}
}
