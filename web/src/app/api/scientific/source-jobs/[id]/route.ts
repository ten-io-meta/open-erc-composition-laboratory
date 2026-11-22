import { NextRequest, NextResponse } from "next/server";
import { isJobId, validAccessKey } from "@/server/oeclOnDemandJobs";
import {
  genericSourceAvailable, hasPublishedSourceArtifact, recentSourceRuns, sourceJobState,
} from "@/server/oeclGenericSourceJobs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "no-store" };

export async function GET(request: NextRequest, context: {
  params: Promise<{ id: string }>
}) {
  if (!genericSourceAvailable())
    return NextResponse.json({ status: "NOT_CONFIGURED" }, { status: 503, headers });
  if (!validAccessKey(request.headers.get("x-oecl-access-key"), process.env.OECL_ANALYSIS_ACCESS_KEY))
    return NextResponse.json({ status: "UNAUTHORIZED" }, { status: 401, headers });
  const { id } = await context.params;
  if (!isJobId(id))
    return NextResponse.json({ status: "INVALID_JOB_ID" }, { status: 400, headers });
  try {
    const token = process.env.OECL_GITHUB_ACTIONS_TOKEN!;
    const runs = await recentSourceRuns(token);
    const state = sourceJobState(runs,id);
    if (state.state === "AWAITING_SOURCE_ARTIFACT" && state.runId) {
      const published = await hasPublishedSourceArtifact(state.runId, token);
      if (published) {
        return NextResponse.json({
          status: "SOURCE_JOB_STATE",
          ...state,
          state: "SOURCE_ARTIFACT_AVAILABLE",
          message: "GitHub lists an unexpired, nonempty source AST artifact for this exact run. Scientific validation of its contents is not implied.",
        }, { headers });
      }
    }
    return NextResponse.json({ status: "SOURCE_JOB_STATE", ...state }, { headers });
  } catch {
    return NextResponse.json({
      status: "SOURCE_JOB_STATUS_UNAVAILABLE", scientificVerdict: null,
      message: "Could not confirm source analysis status with GitHub.",
    }, { status: 502, headers });
  }
}
