import { NextRequest, NextResponse } from "next/server";
import {
  isDispatchConfigured,
  isJobId,
  listAnalysisRuns,
  locatePinnedJob,
  validAccessKey,
} from "@/server/oeclOnDemandJobs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const headers = { "Cache-Control": "no-store" };
  if (!isDispatchConfigured()) {
    return NextResponse.json({ status: "NOT_CONFIGURED" }, { status: 503, headers });
  }
  if (!validAccessKey(request.headers.get("x-oecl-access-key"), process.env.OECL_ANALYSIS_ACCESS_KEY)) {
    return NextResponse.json({ status: "UNAUTHORIZED" }, { status: 401, headers });
  }
  const { id } = await context.params;
  if (!isJobId(id)) {
    return NextResponse.json({ status: "INVALID_JOB_ID" }, { status: 400, headers });
  }
  try {
    const runs = await listAnalysisRuns(process.env.OECL_GITHUB_ACTIONS_TOKEN!);
    return NextResponse.json({
      status: "ANALYSIS_JOB_STATE",
      ...locatePinnedJob(runs, id),
    }, { headers });
  } catch {
    return NextResponse.json({
      status: "JOB_STATUS_UNAVAILABLE",
      scientificVerdict: null,
      message: "Could not verify job status with GitHub.",
    }, { status: 502, headers });
  }
}
