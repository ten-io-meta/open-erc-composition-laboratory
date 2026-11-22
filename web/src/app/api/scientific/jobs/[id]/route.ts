import { NextRequest, NextResponse } from "next/server";
import {
  hasPublishedEvidenceArtifact,
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
    const token = process.env.OECL_GITHUB_ACTIONS_TOKEN!;
    const runs = await listAnalysisRuns(token);
    const job = locatePinnedJob(runs, id);
    if (job.state === "AWAITING_EVIDENCE" && job.runId !== null) {
      // A completed green workflow is insufficient: confirm that the exact
      // pinned evidence artifact is published and non-empty for this run.
      const exists = await hasPublishedEvidenceArtifact(job.runId, token);
      if (exists) {
        return NextResponse.json({
          status: "ANALYSIS_JOB_STATE", ...job,
          state: "EVIDENCE_AVAILABLE",
          message: "GitHub lists a non-empty pinned evidence artifact for this exact run. Contents require independent scientific review.",
        }, { headers });
      }
    }
    return NextResponse.json({
      status: "ANALYSIS_JOB_STATE",
      ...job,
    }, { headers });
  } catch {
    return NextResponse.json({
      status: "JOB_STATUS_UNAVAILABLE",
      scientificVerdict: null,
      message: "Could not verify job status with GitHub.",
    }, { status: 502, headers });
  }
}
