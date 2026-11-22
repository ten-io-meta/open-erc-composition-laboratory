import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { validAccessKey } from "@/server/oeclOnDemandJobs";
import {
  acceptedSourcePair, availableSourceCatalog,
  dispatchGenericSource, genericSourceAvailable, GenericSourceJobError,
} from "@/server/oeclGenericSourceJobs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "no-store" };

export function GET() {
  const enabled = genericSourceAvailable();
  return NextResponse.json({
    status: enabled ? "GENERIC_AST_BETA_AVAILABLE" : "NOT_CONFIGURED",
    enabled,
    sources: availableSourceCatalog(),
    researchAccessRequired: true,
    acceptsArbitraryRepositories: false,
    runsEvm: false,
    scientificVerdictFromDispatch: null,
    message: enabled
      ? "Authorized researchers may run new source-only AST analysis for selected registered sources."
      : "Source-only worker is disabled until reviewed deployment and server credentials.",
  }, { headers });
}

async function readSmallJson(request: NextRequest) {
  if (!request.headers.get("content-type")?.startsWith("application/json")) {
    throw Error("INVALID_CONTENT_TYPE");
  }
  const declared = Number(request.headers.get("content-length") ?? "0");
  if (declared > 384) throw Error("INPUT_TOO_LARGE");
  if (!request.body) throw Error("EMPTY_REQUEST");
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > 384) throw Error("INPUT_TOO_LARGE");
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  const input: unknown = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
  if (!input || typeof input !== "object" || Array.isArray(input)) throw Error("INVALID_REQUEST_BODY");
  const record = input as Record<string, unknown>;
  if (Object.keys(record).sort().join(",") !== "sourceA,sourceB" ||
      !acceptedSourcePair(record.sourceA,record.sourceB)) {
    throw Error("UNREGISTERED_SOURCE_PAIR");
  }
  return { a: record.sourceA as string, b: record.sourceB as string };
}

export async function POST(request: NextRequest) {
  if (!genericSourceAvailable())
    return NextResponse.json({ status: "NOT_CONFIGURED" }, { status: 503, headers });
  if (!validAccessKey(request.headers.get("x-oecl-access-key"), process.env.OECL_ANALYSIS_ACCESS_KEY))
    return NextResponse.json({ status: "UNAUTHORIZED" }, { status: 401, headers });
  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin)
    return NextResponse.json({ status: "ORIGIN_REJECTED" }, { status: 403, headers });
  let pair;
  try {
    pair = await readSmallJson(request);
  } catch {
    return NextResponse.json({
      status: "INVALID_OR_UNREGISTERED_PAIR",
      message: "Submit exactly sourceA and sourceB from the published registry.",
    }, { status: 400, headers });
  }
  const id = randomUUID();
  try {
    await dispatchGenericSource(id,pair.a,pair.b,process.env.OECL_GITHUB_ACTIONS_TOKEN!);
    return NextResponse.json({
      status: "SOURCE_DISPATCH_ACCEPTED",
      requestId: id,
      sourceA: pair.a, sourceB: pair.b,
      state: "AWAITING_GITHUB_RUN",
      scientificVerdict: null,
      statusPath: "/api/scientific/source-jobs/" + id,
      message: "A new source-only AST experiment has been requested. Scientific evidence is not yet verified.",
    }, { status: 202, headers });
  } catch (error) {
    const code = error instanceof GenericSourceJobError ? error.code : "SOURCE_BACKEND_UNAVAILABLE";
    return NextResponse.json({ status: code, scientificVerdict: null }, {
      status: code === "SOURCE_WORKER_CAPACITY_EXHAUSTED" ? 429 : 502,
      headers,
    });
  }
}
