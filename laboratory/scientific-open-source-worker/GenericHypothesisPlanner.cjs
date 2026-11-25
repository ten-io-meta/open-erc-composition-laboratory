"use strict";
/**
 * Data-only scientific hypothesis planner. Never deploys, signs or executes.
 * A caller-supplied ABI/AST cannot establish verified provenance or EVM proof.
 */
const crypto = require("node:crypto");
const hash = value => crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");
const isHash = s => typeof s === "string" && /^[a-f0-9]{64}$/.test(s);
const allowedTypes = new Set(["address","uint256","bool","bytes32"]);
const exactSignature = entry => entry.name + "(" + entry.inputs.map(x => x.type).join(",") + ")";
function functionEntries(abi) {
  if (!Array.isArray(abi)) return [];
  return abi.filter(x => x && x.type === "function" && typeof x.name === "string" &&
    Array.isArray(x.inputs) && x.inputs.every(i => i && typeof i.type === "string") &&
    Array.isArray(x.outputs) && typeof x.stateMutability === "string");
}
function discover({abi, ast, source}) {
  if (!source || !isHash(source.sourceSha256) || !isHash(source.astSha256) ||
      !isHash(source.abiSha256) || !Array.isArray(ast?.paths) ||
      hash(abi) !== source.abiSha256) {
    return {status:"BLOCKED_UNVERIFIED_INPUT_IDENTITY", hypotheses:[]};
  }
  // AST facts are proposals, not verified until an external compiler/source review.
  const entries = functionEntries(abi);
  const known = new Set();
  const hypotheses = [];
  for (const fn of entries) {
    const sig = exactSignature(fn);
    if (known.has(sig)) return {status:"BLOCKED_AMBIGUOUS_ABI",hypotheses:[]};
    known.add(sig);
    if (!["nonpayable","payable"].includes(fn.stateMutability) ||
        fn.inputs.length === 0 || !fn.inputs.every(i => allowedTypes.has(i.type))) continue;
    const paths = ast.paths.filter(p => p && p.signature === sig &&
      p.kind === "STATE_WRITE" && typeof p.path === "string" && p.path.length > 0 &&
      typeof p.stateVariable === "string" && p.stateVariable.length > 0);
    if (paths.length !== 1) continue;
    const p = paths[0];
    const core = {signature:sig, sourceSha256:source.sourceSha256,
      astSha256:source.astSha256, abiSha256:source.abiSha256,
      astPath:p.path, stateVariable:p.stateVariable};
    hypotheses.push({
      id:hash(core), status:"HYPOTHESIS_ONLY", ...core,
      hypothesis:"Calling "+sig+" may update "+p.stateVariable,
      prediction:"With verified preconditions and a nonzero expected effect, a mined success should change the measured target state",
      counterexample:"A mined success with verified preconditions but no predicted state effect challenges the hypothesis; a revert alone does not refute it",
      prerequisites:["independent source + compiler identity review",
        "explicit bounded calldata and caller policy",
        "local EVM state snapshots and mined receipt",
        "independent witness reconciliation"],
      evidenceStatus:"NOT_EXECUTED", scientificVerdict:"INCONCLUSIVE",
      compatibilityVerdict:"NOT_EVALUATED", candidateAdmission:"NOT_ADMITTED"
    });
  }
  return {schemaVersion:"OECL_GENERIC_HYPOTHESES_V1",
    status:"SOURCE_IDENTITY_UNATTESTED", executionAuthorized:false,
    hypotheses:hypotheses.sort((a,b)=>a.signature.localeCompare(b.signature))};
}
function assess(hypothesis, evidence) {
  if (!hypothesis || hypothesis.status !== "HYPOTHESIS_ONLY" ||
      !isHash(hypothesis.id) || !isHash(hypothesis.sourceSha256)) {
    return {status:"REJECTED_MALFORMED_HYPOTHESIS",verdict:"INCONCLUSIVE"};
  }
  // No unsigned, caller-provided witness may be self-promoted to verified.
  // This layer deliberately has no trusted reviewer/receipt verification API.
  return {id:hypothesis.id, status:evidence ? "EVIDENCE_AWAITING_INDEPENDENT_VERIFICATION" :
    "NOT_EXECUTED", verdict:"INCONCLUSIVE", compatibilityVerdict:"NOT_EVALUATED",
    candidateAdmission:"NOT_ADMITTED", executionAuthorized:false};
}
module.exports={discover,assess,hash};
