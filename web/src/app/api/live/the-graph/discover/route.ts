import { NextRequest, NextResponse } from "next/server";
import { discoverLiveSubgraphs } from "@/server/oeclTheGraph";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const protocol = request.nextUrl.searchParams.get("protocol") ?? "";
  try {
    const result = await discoverLiveSubgraphs(protocol);
    return NextResponse.json(result, {
      status: result.status === "INVALID_PROTOCOL" ? 400 : result.status === "NOT_CONFIGURED" ? 503 : 200,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return NextResponse.json(
      { status: "ERROR", error: error instanceof Error ? error.message : "Unknown discovery error" },
      { status: 500 }
    );
  }
}
