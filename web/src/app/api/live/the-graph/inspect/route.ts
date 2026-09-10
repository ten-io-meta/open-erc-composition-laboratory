import { NextRequest, NextResponse } from "next/server";
import { inspectLiveSubgraph } from "@/server/oeclTheGraph";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const subgraphId = request.nextUrl.searchParams.get("subgraphId") ?? "";
  const ipfsHash = request.nextUrl.searchParams.get("ipfsHash") ?? "";

  try {
    const result = await inspectLiveSubgraph(subgraphId, ipfsHash);

    const status =
      result.status === "INVALID_REQUEST"
        ? 400
        : result.status === "NOT_CONFIGURED"
          ? 503
          : result.status === "ERROR"
            ? 502
            : 200;

    return NextResponse.json(result, {
      status,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "ERROR",
        error: error instanceof Error ? error.message : "Unknown inspection error",
      },
      { status: 500 }
    );
  }
}
