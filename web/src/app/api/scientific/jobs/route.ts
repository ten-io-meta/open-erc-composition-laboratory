import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import {
  ANALYSIS_SCENARIO,
  ANALYSIS_SCOPE,
  dispatchPinnedAnalysis,
  GitHubAnalysisError,
  isDispatchConfigured,
  validAccessKey,
} from "@/server/oeclOnDemandJobs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const noStore = { "Cache-Control": "no-store" };

export function GET() {
  const enabled = isDispatchConfigured();
  return NextResponse.json({
    status: enabled ? "PINNED_REPRODUCTION_AVAILABLE" : "NOT_CONFIGURED",
    enabled,
    scenario: ANALYSIS_SCENARIO,
    scope: ANALYSIS_SCOPE,
    requiresResearchAccessKey: true,
    arbitraryRepositoryAnalysisAvailable: false,
    message: enabled
      ? "Access-key protected beta: a fresh pinned experiment can be requested."
      : "On-demand analysis is disabled until an isolated runner and server-side credentials are configured.",
  }, { headers: noStore });
}

/**
 * Dispatch ONLY the fixed, previously audited pinned experiment.
 * No source URLs, code, commits, command strings, arbitrary job IDs,
 * redirects or other user-controlled inputs are accepted.
 */
export async function POST(request: NextRequest) {
  if (!isDispatchConfigured()) {
    return NextResponse.json({ status: "NOT_CONFIGURED" }, { status: 503, headers: noStore });
  }
  if (!validAccessKey(request.headers.get("x-oecl-access-key"), process.env.OECL_ANALYSIS_ACCESS_KEY)) {
    return NextResponse.json({ status: "UNAUTHORIZED" }, { status: 401, headers: noStore });
  }
  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin) {
    return NextResponse.json({ status: "ORIGIN_REJECTED" }, { status: 403, headers: noStore });
  }
  if (request.body !== null) {
    return NextResponse.json({
      status: "UNSUPPORTED_INPUT",
      message: "Pinned reproduction accepts no request body or user-supplied code.",
    }, { status: 400, headers: noStore });
  }
  const id = randomUUID();
  try {
    await dispatchPinnedAnalysis(id, process.env.OECL_GITHUB_ACTIONS_TOKEN!);
    return NextResponse.json({
      status: "DISPATCH_ACCEPTED",
      requestId: id,
      state: "AWAITING_GITHUB_RUN",
      statusPath: "/api/scientific/jobs/" + id,
      scientificVerdict: null,
      candidateAdmission: null,
      message: "GitHub accepted the workflow dispatch. A matching run is not yet confirmed.",
    }, { status: 202, headers: noStore });
  } catch (error) {
    const code = error instanceof GitHubAnalysisError ? error.code : "ANALYSIS_BACKEND_UNAVAILABLE";
    return NextResponse.json({ status: code, scientificVerdict: null }, {
      status: code === "ANALYSIS_CAPACITY_EXHAUSTED" ? 429 : 502,
      headers: noStore,
    });
  }
}
