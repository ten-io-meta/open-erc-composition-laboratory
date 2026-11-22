import { createHash } from "node:crypto";
import pinned from "@/data/oeclAstExamples.json";

const EXPECTED_DIGEST="93c27209e59493996106305f1652f106e51db8aa24ae7e3ae2d99c8fbd02f978";
const EXPECTED_RUN=44968168041;
const EXPECTED_SHA="8ca66ecf07522a1ca2b33da20635249147f3a0db";
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
  if(pinned.views.some(v=>
    v.pathFeasibility?.scientificVerdict!=="INCONCLUSIVE" ||
    v.pathFeasibility?.candidateAdmission!=="NOT_ADMITTED" ||
    v.pathFeasibility?.evmExecuted!==false ||
    v.pathFeasibility?.hypotheses.length!==v.hypotheses.length))
    throw Error("OECL_AST_PATH_SAMPLE_INTEGRITY_MISMATCH");
  return pinned.views.find(v=>v.selected[0].id===sourceA&&v.selected[1].id===sourceB)||null;
}
export const AST_EXAMPLES_SHA256=EXPECTED_DIGEST;
