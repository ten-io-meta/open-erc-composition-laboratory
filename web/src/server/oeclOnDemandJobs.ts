import { createHash, timingSafeEqual } from "node:crypto";

/**
 * Limited, authenticated research beta:
 * - one immutable, independently verified ERC-8060 × ERC-8098 recipe;
 * - never accepts arbitrary repositories, code, URLs, commits or commands;
 * - untrusted Solidity is never executed by Next.js;
 * - GitHub Actions performs the pre-reviewed, isolated pinned experiment.
 *
 * This is a controlled REPRODUCTION, not general discovery of new pairs.
 */
const REPO = "ten-io-meta/open-erc-composition-laboratory";
const WORKFLOW = "joint-pinned-references.yml";
const API = "https://api.github.com/repos/" + REPO + "/actions/workflows/" + WORKFLOW;
const PREFIX = "OECL-REQUEST-";
const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_DAILY_DISPATCHES = 3;

export const ANALYSIS_SCENARIO = "PINNED_ERC8060_ERC8098_REPRODUCTION";
export const ANALYSIS_SCOPE = "PINNED_LOCAL_HARDHAT_EVM";
export type JobState = "AWAITING_GITHUB_RUN" | "QUEUED" | "RUNNING" |
  "AWAITING_EVIDENCE" | "EVIDENCE_AVAILABLE" | "EXECUTION_FAILED";

export type GitHubRun = {
  id: number;
  name?: string;
  display_title?: string;
  event?: string;
  status?: string;
  conclusion?: string | null;
  created_at?: string;
  html_url?: string;
};
export type Transport = (input: string, init?: RequestInit) => Promise<Response>;

export function isDispatchConfigured(env: NodeJS.ProcessEnv = process.env): boolean {
  return env.OECL_ENABLE_PINNED_ANALYSIS === "true" &&
    (env.OECL_ANALYSIS_ACCESS_KEY?.length ?? 0) >= 32 &&
    (env.OECL_GITHUB_ACTIONS_TOKEN?.length ?? 0) >= 20;
}

export function validAccessKey(value: string | null, expected: string | undefined): boolean {
  if (!value || !expected || expected.length < 32 ||
      value.length > 512 || value.length < 32) return false;
  const digest = (s: string) => createHash("sha256").update(s).digest();
  return timingSafeEqual(digest(value), digest(expected));
}

export function isJobId(value: string): boolean {
  return /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(value);
}

function headers(token: string): Record<string, string> {
  return {
    Accept: "application/vnd.github+json",
    Authorization: "Bearer " + token,
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "oecl-scientific-analysis-service",
  };
}

export class GitHubAnalysisError extends Error {
  readonly code: string;
  constructor(code: string) { super(code); this.code = code; }
}

export async function listAnalysisRuns(
  token: string,
  transport: Transport = fetch,
): Promise<GitHubRun[]> {
  const res = await transport(API + "/runs?event=workflow_dispatch&per_page=100", {
    method: "GET",
    headers: headers(token),
    cache: "no-store",
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new GitHubAnalysisError("GITHUB_RUN_LOOKUP_FAILED");
  const body: unknown = await res.json();
  if (!body || typeof body !== "object" || !("workflow_runs" in body) ||
      !Array.isArray(body.workflow_runs)) {
    throw new GitHubAnalysisError("GITHUB_RUN_RESPONSE_INVALID");
  }
  return body.workflow_runs as GitHubRun[];
}

/**
 * A green workflow does not prove that GitHub actually published the evidence.
 * Verify that the artifact is listed for the exact run ID before presenting
 * EVIDENCE_AVAILABLE. This proves listing/size only, NOT replay or scientific
 * validity of its contents.
 */
export async function hasPublishedEvidenceArtifact(
  runId: number,
  token: string,
  transport: Transport = fetch,
): Promise<boolean> {
  if (!Number.isSafeInteger(runId) || runId <= 0)
    throw new GitHubAnalysisError("INVALID_RUN_ID");
  const url = "https://api.github.com/repos/" + REPO +
    "/actions/runs/" + runId + "/artifacts?per_page=100";
  const res = await transport(url, {
    method: "GET",
    headers: headers(token),
    cache: "no-store",
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new GitHubAnalysisError("GITHUB_ARTIFACT_LOOKUP_FAILED");
  const body: unknown = await res.json();
  if (!body || typeof body !== "object" ||
      !("artifacts" in body) || !Array.isArray(body.artifacts)) {
    throw new GitHubAnalysisError("GITHUB_ARTIFACT_RESPONSE_INVALID");
  }
  return body.artifacts.some((artifact: unknown) => {
    if (!artifact || typeof artifact !== "object") return false;
    const a = artifact as Record<string, unknown>;
    return a.name === "oecl-two-pinned-references" &&
      a.expired === false &&
      typeof a.size_in_bytes === "number" &&
      Number.isSafeInteger(a.size_in_bytes) && a.size_in_bytes > 0 &&
      typeof a.id === "number" && Number.isSafeInteger(a.id) && a.id > 0;
  });
}

/**
 * GitHub's list API supplies an advisory quota. Parallel requests can race.
 * For public use a shared atomic quota + authenticated per-user identities
 * MUST replace this closed-beta gate.
 */
export function evaluateCapacity(runs: GitHubRun[], at = Date.now()) {
  const relevant = runs.filter(run =>
    run.event === "workflow_dispatch" &&
    typeof run.display_title === "string" &&
    run.display_title.startsWith(PREFIX));
  const active = relevant.some(run =>
    run.status === "queued" || run.status === "in_progress" ||
    run.status === "waiting" || run.status === "pending" || run.status === "requested");
  const daily = relevant.filter(run => {
    const created = Date.parse(run.created_at ?? "");
    return Number.isFinite(created) && created <= at && created > at - DAY_MS;
  }).length;
  return { allowed: !active && daily < MAX_DAILY_DISPATCHES, active, daily, maxDaily: MAX_DAILY_DISPATCHES };
}

export async function dispatchPinnedAnalysis(
  id: string,
  token: string,
  transport: Transport = fetch,
): Promise<void> {
  if (!isJobId(id)) throw new GitHubAnalysisError("INVALID_JOB_ID");
  const runs = await listAnalysisRuns(token, transport);
  if (!evaluateCapacity(runs).allowed) throw new GitHubAnalysisError("ANALYSIS_CAPACITY_EXHAUSTED");

  // GitHub REST dispatch returns 204 without a run ID. The unique run-name
  // holds the correlation identifier until GitHub indexes the new run.
  const res = await transport(API + "/dispatches", {
    method: "POST",
    headers: { ...headers(token), "Content-Type": "application/json" },
    body: JSON.stringify({ ref: "main", inputs: { request_id: id } }),
    cache: "no-store",
    signal: AbortSignal.timeout(10000),
  });
  if (res.status !== 204) {
    throw new GitHubAnalysisError("GITHUB_WORKFLOW_DISPATCH_FAILED");
  }
}

export function locatePinnedJob(runs: GitHubRun[], id: string) {
  if (!isJobId(id)) throw new GitHubAnalysisError("INVALID_JOB_ID");
  const run = runs.find(x =>
    x.event === "workflow_dispatch" &&
    x.display_title === PREFIX + id && Number.isInteger(x.id) && x.id > 0);
  if (!run) {
    return {
      id, state: "AWAITING_GITHUB_RUN" as JobState,
      scientificVerdict: null, candidateAdmission: null,
      runUrl: null, runId: null,
      message: "Dispatch submitted, but the matching GitHub run has not been indexed or verified.",
    };
  }
  const state: JobState = run.status === "completed"
    ? (run.conclusion === "success" ? "AWAITING_EVIDENCE" : "EXECUTION_FAILED")
    : run.status === "in_progress" ? "RUNNING" : "QUEUED";
  return {
    id, state, scientificVerdict: null, candidateAdmission: null,
    runId: run.id,
    runUrl: "https://github.com/" + REPO + "/actions/runs/" + run.id,
    message: state === "AWAITING_EVIDENCE"
      ? "Workflow succeeded; the evidence artifact has not yet been independently confirmed in GitHub's artifact list."
      : state === "EXECUTION_FAILED"
        ? "Experiment workflow failed; no scientific result can be inferred."
        : "The pinned experiment is pending or running on GitHub Actions.",
  };
}
