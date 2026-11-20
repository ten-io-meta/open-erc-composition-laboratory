/**
 * OECL emergent-property FALSIFIABILITY GATE.
 *
 * All verdicts are evidence-admission or falsification candidates, never a
 * certification that untrusted trace claims match real EVM execution.
 * Replaying execution artifacts independently remains a separate requirement.
 */
export const EMERGENCE_RUN_KINDS = [
  "JOINT","ISOLATED_A","ISOLATED_B","ABLATION_A","ABLATION_B","ADVERSARIAL"
] as const;
export type EmergenceRunKind = typeof EMERGENCE_RUN_KINDS[number];
export type BoundaryOutcome = "PRESERVED" | "VIOLATED" | "UNOBSERVED";
export interface PinnedErcParticipant {
  participantId:string;
  repository:string;
  revision:string;
}
export interface EmergenceRunEvidence {
  runId:string;
  kind:EmergenceRunKind;
  status:"EXECUTED" | "NOT_EXECUTED" | "REJECTED";
  configurationId:string;
  selectedParticipants:string[];
  pinnedSources:PinnedErcParticipant[];
  runtime:{kind:"LOCAL_EVM";chainId:number;clientVersion:string};
  evidence:{sha256:string;artifactUrl:string;runAt:string};
  signals:Record<string,boolean|null>;
  boundaries:Array<{boundaryId:string;outcome:BoundaryOutcome;evidenceId:string}>;
}
export interface EmergencePropertyHypothesis {
  hypothesisId:string;
  title:string;
  predicateId:string;
  compositionId:string;
  participantIds:[string,string];
  pinnedSources:PinnedErcParticipant[];
  relevantBoundaryIds:string[];
}
export type EmergenceGateResult = {
  status:"INCONCLUSIVE"|"CHALLENGED"|"NOT_EMERGENT_IN_OBSERVED_RUNS"|"READY_FOR_INDEPENDENT_REPLAY";
  hypothesisId:string;
  reviewedRunIds:string[];
  boundaryViolations:Array<{runId:string;boundaryId:string;evidenceId:string}>;
  reasons:string[];
  independentReplayCompleted:false;
  certifiedEmergentProperties:[];
  experimentProofAuthority:"NO_PROMOTION_WITHOUT_INDEPENDENT_REPLAY";
};
function uniqueStrings(xs:string[]) {return [...new Set(xs)].sort();}
function identical(a:string[],b:string[]) {return JSON.stringify(uniqueStrings(a))===JSON.stringify(uniqueStrings(b));}
function validPin(pin:PinnedErcParticipant) {
 return /^ERC-[1-9]\d{0,6}$/.test(pin.participantId)&&
   /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(pin.repository)&&
   /^[a-f0-9]{40}$/.test(pin.revision);
}
function pinIdentity(pins:PinnedErcParticipant[]) {
 return pins.map(p=>[p.participantId,p.repository,p.revision].join("@")).sort();
}
function result(h:EmergencePropertyHypothesis,
 status:EmergenceGateResult["status"],
 reasons:string[],
 runs:EmergenceRunEvidence[],
 violations:EmergenceGateResult["boundaryViolations"]):EmergenceGateResult{
 return {
  status,hypothesisId:h.hypothesisId,reviewedRunIds:runs.map(r=>r.runId).sort(),
  boundaryViolations:violations,reasons,
  independentReplayCompleted:false,certifiedEmergentProperties:[],
  experimentProofAuthority:"NO_PROMOTION_WITHOUT_INDEPENDENT_REPLAY"
 };
}
export function assessEmergenceEvidence(
 hypothesis:EmergencePropertyHypothesis, evidence:EmergenceRunEvidence[]
):EmergenceGateResult {
 const errors:string[]=[];
 const ids=hypothesis.participantIds;
 if(!hypothesis.hypothesisId.trim()||!hypothesis.compositionId.trim()||
    !/^[A-Z][A-Z0-9_:-]{2,95}$/.test(hypothesis.predicateId)||
    ids[0]===ids[1]||!ids.every(x=>/^ERC-[1-9]\d{0,6}$/.test(x))||
    !identical(hypothesis.pinnedSources.map(x=>x.participantId),[...ids])||
    !hypothesis.pinnedSources.every(validPin))
   errors.push("Hypothesis identity, participants, or exact executable source revisions are incomplete");
 if(!hypothesis.relevantBoundaryIds.length||
    new Set(hypothesis.relevantBoundaryIds).size!==hypothesis.relevantBoundaryIds.length)
   errors.push("A scoped, non-duplicate boundary set is required");
 if(!Array.isArray(evidence)||evidence.length>24){
   return result(hypothesis,"INCONCLUSIVE",["Evidence must be bounded and supplied as a list"],[],[]);
 }
 const byKind=new Map<EmergenceRunKind,EmergenceRunEvidence>();
 const byId=new Set<string>();
 for(const run of evidence) {
   if(byKind.has(run.kind))errors.push("Duplicate run mode: "+run.kind);
   else byKind.set(run.kind,run);
   if(!run.runId||byId.has(run.runId))errors.push("Missing or duplicate runtime run ID");
   else byId.add(run.runId);
   if(run.status!=="EXECUTED")errors.push("Unexecuted or rejected mode: "+run.kind);
   if(run.configurationId!==hypothesis.compositionId)
     errors.push("Configuration identity mismatch in "+run.kind);
   if(!identical(pinIdentity(run.pinnedSources),pinIdentity(hypothesis.pinnedSources)))
     errors.push("Pinned source mismatch in "+run.kind);
   if(run.runtime.kind!=="LOCAL_EVM"||!Number.isSafeInteger(run.runtime.chainId)||
      run.runtime.chainId<=0||!run.runtime.clientVersion?.trim())
     errors.push("Unverified runtime description in "+run.kind);
   if(!/^[a-f0-9]{64}$/i.test(run.evidence.sha256)||
      !/^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\/actions\/runs\/\d+(?:\/.*)?$/.test(run.evidence.artifactUrl)||
      !Number.isFinite(Date.parse(run.evidence.runAt)))
     errors.push("Incomplete artifact provenance in "+run.kind);
   const active=run.kind==="JOINT"||run.kind==="ADVERSARIAL"?ids:
     run.kind==="ISOLATED_A"||run.kind==="ABLATION_B"?[ids[0]]:[ids[1]];
   if(!identical(run.selectedParticipants,active))
     errors.push("Incorrect participant activation in "+run.kind);
   if(typeof run.signals[hypothesis.predicateId]!=="boolean")
     errors.push("No observed falsifiable predicate in "+run.kind);
   const boundaries=new Set<string>();
   for(const b of run.boundaries){
     if(!hypothesis.relevantBoundaryIds.includes(b.boundaryId)||
        boundaries.has(b.boundaryId)||!b.evidenceId.trim())
       errors.push("Unscoped, duplicate, or unwitnessed boundary in "+run.kind);
     boundaries.add(b.boundaryId);
   }
   if(!identical([...boundaries],hypothesis.relevantBoundaryIds))
     errors.push("Missing relevant boundary in "+run.kind);
 }
 for(const mode of EMERGENCE_RUN_KINDS) {
   if(!byKind.has(mode))errors.push("Missing required "+mode+" execution");
 }
 const violations=evidence.flatMap(run=>run.boundaries
  .filter(b=>b.outcome==="VIOLATED")
  .map(b=>({runId:run.runId,boundaryId:b.boundaryId,evidenceId:b.evidenceId})));
 if(errors.length) return result(hypothesis,"INCONCLUSIVE",uniqueStrings(errors),evidence,violations);
 const unobserved=evidence.filter(run=>run.boundaries.some(b=>b.outcome!=="PRESERVED"));
 if(violations.length)return result(hypothesis,"CHALLENGED",["Observed violation of a participant boundary"],evidence,violations);
 if(unobserved.length)return result(hypothesis,"INCONCLUSIVE",["Some relevant boundaries remain unobserved"],evidence,[]);
 const joint=byKind.get("JOINT")!;
 if(joint.signals[hypothesis.predicateId]!==true)
   return result(hypothesis,"NOT_EMERGENT_IN_OBSERVED_RUNS",["The composition did not exhibit the proposed property"],evidence,[]);
 const isolatedAndAblations=["ISOLATED_A","ISOLATED_B","ABLATION_A","ABLATION_B"] as const;
 const positiveBaseline=isolatedAndAblations.filter(k=>byKind.get(k)!.signals[hypothesis.predicateId]===true);
 if(positiveBaseline.length)return result(hypothesis,"NOT_EMERGENT_IN_OBSERVED_RUNS",
  ["Property also observed without the full composition: "+positiveBaseline.join(", ")],evidence,[]);
 // An adversarial run must preserve the guards; its predicate can remain
 // true or false depending on attacker action. The absence of a recorded
 // boundary violation does not establish global correctness.
 return result(hypothesis,"READY_FOR_INDEPENDENT_REPLAY",[
   "Evidence manifest is structurally complete and the predicate differs in baselines/ablations.",
   "Artifact hashes, actual EVM traces, provenance and property measurement require independent replay.",
   "No emergent property has been certified."
 ],evidence,[]);
}
