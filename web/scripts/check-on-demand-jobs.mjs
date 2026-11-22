import assert from "node:assert/strict";
import {
  ANALYSIS_SCENARIO,
  ANALYSIS_SCOPE,
  dispatchPinnedAnalysis,
  evaluateCapacity,
  isDispatchConfigured,
  isJobId,
  listAnalysisRuns,
  locatePinnedJob,
  validAccessKey,
} from "../src/server/oeclOnDemandJobs.ts";

const id = "123e4567-e89b-42d3-a456-426614174000";
const token = "ghp_TEST_ONLY_NOT_A_REAL_TOKEN_REDACTED";
const pass = "A".repeat(40);
const date = new Date().toISOString();
const success = (body) => new Response(JSON.stringify({ workflow_runs: body }), {
  status: 200, headers: { "content-type": "application/json" },
});
const githubRun = (id, state, conclusion = null, created_at = date) => ({
  id: 481234, event: "workflow_dispatch",
  display_title: "OECL-REQUEST-" + id,
  status: state, conclusion, created_at,
  html_url: "https://attacker.invalid/forged",
});
assert.equal(ANALYSIS_SCENARIO, "PINNED_ERC8060_ERC8098_REPRODUCTION");
assert.equal(ANALYSIS_SCOPE, "PINNED_LOCAL_HARDHAT_EVM");
assert.equal(isDispatchConfigured({}), false);
assert.equal(isDispatchConfigured({
  OECL_ENABLE_PINNED_ANALYSIS: "true",
  OECL_ANALYSIS_ACCESS_KEY: pass,
  OECL_GITHUB_ACTIONS_TOKEN: token,
}), true);
assert.equal(validAccessKey(pass, pass), true);
assert.equal(validAccessKey(pass + "Z", pass), false);
assert.equal(validAccessKey("", pass), false);
assert.equal(validAccessKey(pass, undefined), false);
assert.equal(isJobId(id), true);
for (const malformed of ["../etc/passwd", "not-a-uuid", "OECL-REQUEST-123", id + "?foo=x"]) {
  assert.equal(isJobId(malformed), false);
}

const allowed = evaluateCapacity([], Date.now());
assert.equal(allowed.allowed, true);
assert.equal(evaluateCapacity([githubRun(id, "in_progress")]).allowed, false);
assert.equal(evaluateCapacity([githubRun(id, "queued")]).allowed, false);
assert.equal(evaluateCapacity([githubRun(id, "completed", "success"),githubRun(id, "completed", "success"),githubRun(id, "completed", "success")]).allowed, false);
const old = new Date(Date.now() - 2 * 86400000).toISOString();
assert.equal(evaluateCapacity([githubRun(id, "completed", "success", old)]).allowed, true);
assert.equal(evaluateCapacity([{...githubRun(id,"in_progress"),display_title:"OTHER-REQUEST-"+id}]).allowed,true);

const observed = [];
const fake = async (url, init={}) => {
  observed.push({url, init});
  if (init.method === "GET") return success([]);
  if (init.method === "POST") return new Response(null, {status: 204});
  throw Error("Unexpected mock request");
};
await dispatchPinnedAnalysis(id, token, fake);
assert.equal(observed.length, 2);
assert.match(observed[0].url, /^https:\/\/api.github.com\/repos\/ten-io-meta\/open-erc-composition-laboratory\/actions\/workflows\/joint-pinned-references.yml\/runs\?/);
assert.ok(observed[0].init.headers.Authorization.includes(token));
assert.equal(observed[1].init.method, "POST");
assert.equal(observed[1].url, "https://api.github.com/repos/ten-io-meta/open-erc-composition-laboratory/actions/workflows/joint-pinned-references.yml/dispatches");
assert.deepEqual(JSON.parse(observed[1].init.body), {
  ref: "main", inputs: {request_id: id},
});
await assert.rejects(
  dispatchPinnedAnalysis(id, token, async () => success([githubRun(id,"queued")])),
  /ANALYSIS_CAPACITY_EXHAUSTED/,
);
await assert.rejects(
  dispatchPinnedAnalysis("bad", token, fake),
  /INVALID_JOB_ID/,
);
await assert.rejects(
  listAnalysisRuns(token, async () => new Response("forbidden",{status:403})),
  /GITHUB_RUN_LOOKUP_FAILED/,
);
await assert.rejects(
  listAnalysisRuns(token, async () => new Response(JSON.stringify({wrong:"shape"}),{status:200})),
  /GITHUB_RUN_RESPONSE_INVALID/,
);

assert.equal(locatePinnedJob([],id).state,"AWAITING_GITHUB_RUN");
assert.equal(locatePinnedJob([githubRun(id,"queued")],id).state,"QUEUED");
assert.equal(locatePinnedJob([githubRun(id,"in_progress")],id).state,"RUNNING");
const complete = locatePinnedJob([githubRun(id,"completed","success")],id);
assert.equal(complete.state,"EVIDENCE_AVAILABLE");
assert.equal(complete.scientificVerdict,null);
assert.equal(complete.candidateAdmission,null);
assert.equal(complete.runUrl,
  "https://github.com/ten-io-meta/open-erc-composition-laboratory/actions/runs/481234");
assert.equal(locatePinnedJob([githubRun(id,"completed","failure")],id).state,"EXECUTION_FAILED");
assert.equal(locatePinnedJob([githubRun(id,"completed","cancelled")],id).state,"EXECUTION_FAILED");
const wrongEvent = {...githubRun(id,"completed","success"),event:"push"};
assert.equal(locatePinnedJob([wrongEvent],id).state,"AWAITING_GITHUB_RUN");
assert.throws(() => locatePinnedJob([], "../evil"), /INVALID_JOB_ID/);
console.log("OECL_ON_DEMAND_POLICY: PASS · fixed recipe, access key, immutable dispatch, quotas, job states and forged URL rejection");
