import { createHash } from "node:crypto";
import pinned from "@/data/oeclAstExamples.json";

const EXPECTED_DIGEST="02e1ad9afaf2a68fb3ac60990887bed74ef4bd5f223d6e5fff1ce9a4a7919037";
const EXPECTED_RUN=44966583987;
const EXPECTED_SHA="36541e50d765f7a678d051f15dfafadbab66c5d7";
export type AstGraphSample=(typeof pinned.views)[number];

export function getVerifiedAstExample(sourceA:string,sourceB:string):AstGraphSample|null {
  const digest=createHash("sha256").update(JSON.stringify(pinned)).digest("hex");
  if(digest!==EXPECTED_DIGEST||
     pinned.schemaVersion!=="OECL_VERIFIED_AST_GRAPH_SAMPLES_V1"||
     pinned.runId!==EXPECTED_RUN||pinned.workflowSha!==EXPECTED_SHA||
     pinned.views.length!==4||
     pinned.views.some(v=>
       v.schemaVersion!=="OECL_VERIFIED_AST_GRAPH_VIEW_V1"||
       v.scientificVerdict!=="INCONCLUSIVE"||
       v.candidateAdmission!=="NOT_ADMITTED"||
       v.sourceOnly!==true||v.evmExecuted!==false||
       v.provenance.runId!==EXPECTED_RUN||v.provenance.workflowSha!==EXPECTED_SHA))
    throw Error("OECL_AST_SAMPLE_INTEGRITY_MISMATCH");
  return pinned.views.find(v=>v.selected[0].id===sourceA&&v.selected[1].id===sourceB)||null;
}
export const AST_EXAMPLES_SHA256=EXPECTED_DIGEST;
