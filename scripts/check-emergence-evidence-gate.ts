import assert from "node:assert/strict";
import {
  assessEmergenceEvidence,EMERGENCE_RUN_KINDS
} from "../laboratory/scientific-emergence-evidence/EmergentEvidenceGate.js";
import type {EmergencePropertyHypothesis,EmergenceRunEvidence} from
  "../laboratory/scientific-emergence-evidence/EmergentEvidenceGate.js";

const pins=[
 {participantId:"ERC-721",repository:"ethereum/ERCs",revision:"a".repeat(40)},
 {participantId:"ERC-8060",repository:"ten-io-meta/erc8060-native-eth-value",revision:"b".repeat(40)}
];
const hypothesis:EmergencePropertyHypothesis={
 hypothesisId:"HYPOTHESIS-SYNTHETIC-001",title:"Synthetic predicate for gate testing only",
 predicateId:"SYNTHETIC_ONLY_GUARANTEE",compositionId:"SYNTHETIC-JOINT-001",
 participantIds:["ERC-721","ERC-8060"],pinnedSources:pins,
 relevantBoundaryIds:["NO_DOUBLE_COMMIT","REDEMPTION_COHERENCE"]
};
function fixtures():EmergenceRunEvidence[]{
 return EMERGENCE_RUN_KINDS.map((kind,i)=>{
  const selectedParticipants=kind==="JOINT"||kind==="ADVERSARIAL"?
    ["ERC-721","ERC-8060"]:
    kind==="ISOLATED_A"||kind==="ABLATION_B"?["ERC-721"]:["ERC-8060"];
  return {
   runId:"SYNTHETIC-ONLY-"+kind,kind,status:"EXECUTED",
   configurationId:hypothesis.compositionId,selectedParticipants,
   pinnedSources:pins,runtime:{kind:"LOCAL_EVM",chainId:31337,clientVersion:"Synthetic fixture 0"},
   evidence:{sha256:(i+1).toString(16).repeat(64),
     artifactUrl:"https://github.com/example/synthetic-fixtures/actions/runs/"+(i+1),
     runAt:"2026-11-20T00:00:00.000Z"},
   signals:{[hypothesis.predicateId]:kind==="JOINT"},
   boundaries:hypothesis.relevantBoundaryIds.map((boundaryId,k)=>({
     boundaryId,outcome:"PRESERVED",evidenceId:"SYNTHETIC-BOUNDARY-"+kind+"-"+k
   }))
  };
 });
}
let count=0;
function check(name:string,fn:()=>void){
 fn();count++;console.log("OECL_EMERGENCE_GATE_PASS "+name);
}
check("Synthetic complete matrix is replay candidate NOT scientific proof",()=>{
 const r=assessEmergenceEvidence(hypothesis,fixtures());
 assert.equal(r.status,"READY_FOR_INDEPENDENT_REPLAY");
 assert.equal(r.independentReplayCompleted,false);
 assert.deepEqual(r.certifiedEmergentProperties,[]);
});
check("Missing one participant ablation is inconclusive",()=>{
 const r=assessEmergenceEvidence(hypothesis,fixtures().filter(x=>x.kind!=="ABLATION_B"));
 assert.equal(r.status,"INCONCLUSIVE");
 assert.match(r.reasons.join(),/Missing required ABLATION_B/);
});
check("Property exists without full composition => not emergent",()=>{
 const runs=fixtures();runs.find(x=>x.kind==="ISOLATED_A")!.signals[hypothesis.predicateId]=true;
 const r=assessEmergenceEvidence(hypothesis,runs);
 assert.equal(r.status,"NOT_EMERGENT_IN_OBSERVED_RUNS");
 assert.match(r.reasons.join(),/ISOLATED_A/);
});
check("Missing joint observation => not emergent",()=>{
 const runs=fixtures();runs.find(x=>x.kind==="JOINT")!.signals[hypothesis.predicateId]=false;
 const r=assessEmergenceEvidence(hypothesis,runs);
 assert.equal(r.status,"NOT_EMERGENT_IN_OBSERVED_RUNS");
});
check("Observed boundary violation challenges the hypothesis",()=>{
 const runs=fixtures();runs.find(x=>x.kind==="ADVERSARIAL")!.boundaries[0].outcome="VIOLATED";
 const r=assessEmergenceEvidence(hypothesis,runs);
 assert.equal(r.status,"CHALLENGED");
 assert.equal(r.boundaryViolations.length,1);
});
check("Unobserved boundary prevents positive evidence",()=>{
 const runs=fixtures();runs.find(x=>x.kind==="JOINT")!.boundaries[0].outcome="UNOBSERVED";
 assert.equal(assessEmergenceEvidence(hypothesis,runs).status,"INCONCLUSIVE");
});
check("Unpinned sources abort result",()=>{
 const runs=fixtures();runs[2].pinnedSources=[{...pins[0],revision:"0".repeat(40)},pins[1]];
 const r=assessEmergenceEvidence(hypothesis,runs);
 assert.equal(r.status,"INCONCLUSIVE");
 assert.match(r.reasons.join(),/Pinned source mismatch/);
});
check("Arbitrary or duplicate run IDs rejected",()=>{
 const runs=fixtures();runs[1].runId=runs[0].runId;
 assert.equal(assessEmergenceEvidence(hypothesis,runs).status,"INCONCLUSIVE");
});
check("Incompatible participant selection rejected",()=>{
 const runs=fixtures();runs[2].selectedParticipants=["ERC-721","ERC-8060"];
 assert.equal(assessEmergenceEvidence(hypothesis,runs).status,"INCONCLUSIVE");
});
check("Missing property observation never coerced to false",()=>{
 const runs=fixtures();runs[0].signals[hypothesis.predicateId]=null;
 assert.equal(assessEmergenceEvidence(hypothesis,runs).status,"INCONCLUSIVE");
});
check("Wrong artifact URL blocks evidence admission",()=>{
 const runs=fixtures();runs[0].evidence.artifactUrl="https://attacker.example/evidence";
 assert.equal(assessEmergenceEvidence(hypothesis,runs).status,"INCONCLUSIVE");
});
console.log("OECL_EMERGENCE_SYNTHETIC_TESTS "+count+"/11 PASS; 0 scientific claims issued");
