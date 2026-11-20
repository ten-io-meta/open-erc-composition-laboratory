import { NextRequest, NextResponse } from "next/server";
import { normalizeErc, researchErcPair } from "@/server/oeclErcResearch";

export const runtime="nodejs";

export async function GET(request:NextRequest) {
  const a=normalizeErc(request.nextUrl.searchParams.get("a"));
  const b=normalizeErc(request.nextUrl.searchParams.get("b"));
  if (!a||!b||a===b) return NextResponse.json({
    status:"INVALID_PAIR",
    message:"Choose two different valid ERC numbers, such as ERC-721 and ERC-8060."
  },{status:400});
  try {
    return NextResponse.json(await researchErcPair(a,b),{
      headers:{"Cache-Control":"public, s-maxage=900, stale-while-revalidate=3600"}
    });
  } catch {
    return NextResponse.json({status:"SOURCE_UNAVAILABLE",
      message:"Documentary lookup unavailable. No compatibility verdict was created."},
      {status:503});
  }
}
