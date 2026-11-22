import registry from "../../../laboratory/scientific-open-source-worker/source-registry.json";
import { isJobId } from "./oeclOnDemandJobs";

const repo = "ten-io-meta/open-erc-composition-laboratory";
const workflow = "oecl-generic-source-lab.yml";
const api = "https://api.github.com/repos/" + repo + "/actions/workflows/" + workflow;
const prefix = "OECL-SOURCE-REQUEST-";
const maxPerDay = 3;
const dayMs = 86400000;

export type SourceInfo = {
  id: string;
  label: string;
  kind: string;
};
export type SourceRun = {
  id: number;
  display_title?: string;
  event?: string;
  status?: string;
  conclusion?: string | null;
  created_at?: string;
};
export type Transport = (url: string, init?: RequestInit) => Promise<Response>;

export function availableSourceCatalog(): SourceInfo[] {
  return registry.sources.map(s => ({ id: s.id, label: s.label, kind: s.kind }));
}
export function acceptedSourcePair(a: unknown, b: unknown) {
  if (typeof a !== "string" || typeof b !== "string" || a === b) return false;
  return registry.sources.some(s => s.id === a) &&
    registry.sources.some(s => s.id === b);
}
export function genericSourceAvailable(env: NodeJS.ProcessEnv = process.env) {
  return env.OECL_ENABLE_GENERIC_SOURCE_ANALYSIS === "true" &&
    (env.OECL_ANALYSIS_ACCESS_KEY?.length ?? 0) >= 32 &&
    (env.OECL_GITHUB_ACTIONS_TOKEN?.length ?? 0) >= 20;
}
function headers(token: string): Record<string, string> {
  return {
    Accept: "application/vnd.github+json",
    Authorization: "Bearer " + token,
    "User-Agent": "oecl-isolated-ast-laboratory",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}
export class GenericSourceJobError extends Error {
  readonly code: string;
  constructor(code: string) { super(code); this.code = code; }
}
export async function recentSourceRuns(
  token: string, transport: Transport = fetch,
): Promise<SourceRun[]> {
  const r = await transport(api + "/runs?event=workflow_dispatch&per_page=100", {
    method: "GET", headers: headers(token),
    cache: "no-store", signal: AbortSignal.timeout(10000),
  });
  if (!r.ok) throw new GenericSourceJobError("SOURCE_RUN_LOOKUP_FAILED");
  const json: unknown = await r.json();
  if (typeof json !== "object" || !json ||
      !("workflow_runs" in json) || !Array.isArray(json.workflow_runs)) {
    throw new GenericSourceJobError("SOURCE_RUN_RESPONSE_INVALID");
  }
  return json.workflow_runs as SourceRun[];
}
/** The workflow can succeed without uploading usable source evidence.
 * Verify the exact run's named, nonempty, unexpired artifact separately.
 * Artifact-list presence is not SHA validation or source proof.
 */
export async function hasPublishedSourceArtifact(
  runId: number, token: string, transport: Transport = fetch,
): Promise<boolean> {
  if (!Number.isSafeInteger(runId) || runId <= 0)
    throw new GenericSourceJobError("INVALID_SOURCE_RUN_ID");
  const url = "https://api.github.com/repos/" + repo +
    "/actions/runs/" + runId + "/artifacts?per_page=100";
  const response = await transport(url, {
    method: "GET", headers: headers(token),
    cache: "no-store", signal: AbortSignal.timeout(10000),
  });
  if (!response.ok)
    throw new GenericSourceJobError("SOURCE_ARTIFACT_LOOKUP_FAILED");
  const body: unknown = await response.json();
  if (!body || typeof body !== "object" ||
      !("artifacts" in body) || !Array.isArray(body.artifacts))
    throw new GenericSourceJobError("SOURCE_ARTIFACT_RESPONSE_INVALID");
  return body.artifacts.some((item: unknown) => {
    if (!item || typeof item !== "object") return false;
    const artifact = item as Record<string, unknown>;
    return artifact.name === "oecl-generic-ast-evidence" &&
      artifact.expired === false &&
      typeof artifact.size_in_bytes === "number" &&
      Number.isSafeInteger(artifact.size_in_bytes) &&
      artifact.size_in_bytes > 0 &&
      typeof artifact.id === "number" &&
      Number.isSafeInteger(artifact.id) && artifact.id > 0;
  });
}

export function capacityAvailable(runs: SourceRun[], now = Date.now()) {
  const ours = runs.filter(run =>
    run.event === "workflow_dispatch" &&
    typeof run.display_title === "string" &&
    run.display_title.startsWith(prefix));
  const active = ours.some(run =>
    ["queued", "in_progress", "waiting", "pending", "requested"].includes(run.status ?? ""));
  const today = ours.filter(run => {
    const t = Date.parse(run.created_at ?? "");
    return Number.isFinite(t) && t >= now - dayMs && t <= now;
  }).length;
  return { available: !active && today < maxPerDay, active, today };
}
export async function dispatchGenericSource(
  id: string, a: string, b: string, token: string, transport: Transport = fetch,
) {
  if (!isJobId(id)) throw new GenericSourceJobError("INVALID_JOB_ID");
  if (!acceptedSourcePair(a,b)) throw new GenericSourceJobError("UNREGISTERED_SOURCE_PAIR");
  const recent = await recentSourceRuns(token, transport);
  if (!capacityAvailable(recent).available) {
    throw new GenericSourceJobError("SOURCE_WORKER_CAPACITY_EXHAUSTED");
  }
  const r = await transport(api + "/dispatches", {
    method: "POST",
    headers: { ...headers(token), "Content-Type": "application/json" },
    body: JSON.stringify({
      ref: "main",
      inputs: { request_id: id, source_a: a, source_b: b },
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(10000),
  });
  if (r.status !== 204) throw new GenericSourceJobError("SOURCE_DISPATCH_FAILED");
}
export function sourceJobState(runs: SourceRun[], id: string) {
  if (!isJobId(id)) throw new GenericSourceJobError("INVALID_JOB_ID");
  const run = runs.find(r =>
    r.event === "workflow_dispatch" &&
    r.display_title === prefix + id &&
    Number.isSafeInteger(r.id) && r.id > 0
  );
  if (!run) {
    return {
      requestId: id,
      state: "AWAITING_GITHUB_RUN",
      scientificVerdict: null,
      runUrl: null,
      message: "GitHub accepted the dispatch, but the workflow run is not yet confirmed.",
    };
  }
  const state = run.status === "completed"
    ? (run.conclusion === "success" ? "AWAITING_SOURCE_ARTIFACT" : "EXECUTION_FAILED")
    : run.status === "in_progress" ? "RUNNING" : "QUEUED";
  return {
    requestId: id,
    state,
    scientificVerdict: null,
    runId: run.id,
    runUrl: "https://github.com/" + repo + "/actions/runs/" + run.id,
    message: state === "AWAITING_SOURCE_ARTIFACT"
      ? "GitHub reports a successful source-only workflow; its evidence artifact is not yet confirmed."
      : state === "EXECUTION_FAILED"
      ? "The source-only worker failed or could not compile the source. No compatibility result is inferred."
      : "The pinned-source analysis workflow is queued or running.",
  };
}
