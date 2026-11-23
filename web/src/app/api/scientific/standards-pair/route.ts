import { NextRequest, NextResponse } from "next/server";
import { investigateErcSpecifications, normalizeErcNumber } from "@/server/oeclErcDocumentaryDiscovery";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };

export async function GET(request: NextRequest) {
  const a = normalizeErcNumber(request.nextUrl.searchParams.get("protocolA"));
  const b = normalizeErcNumber(request.nextUrl.searchParams.get("protocolB"));
  if (!a || !b || a === b) {
    return NextResponse.json({
      status: "INVALID_ERC_PAIR",
      message: "Choose two distinct positive numeric ERC identifiers. No arbitrary URL or code is accepted.",
    }, { status: 400, headers });
  }
  try {
    const result = await investigateErcSpecifications(a,b);
    return NextResponse.json(result, { headers });
  } catch {
    return NextResponse.json({
      status: "DOCUMENTARY_LOOKUP_FAILED",
      scientificVerdict: "NOT_EVALUATED",
      message: "The official specification lookup could not be completed; no relation was inferred.",
    }, { status: 503, headers });
  }
}
