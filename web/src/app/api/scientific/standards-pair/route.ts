import { NextRequest, NextResponse } from "next/server";
import { investigateErcSpecifications, normalizeErcNumber } from "@/server/oeclErcDocumentaryDiscovery";
import { verifyAutonomousResearchPlan } from "@/server/oeclAutonomousResearchPlanner";
import { documentaryScientificQuality } from "@/server/oeclScientificQualityContract";
import { reviewScientificQuality } from "@/server/oeclScientificQualityReviewer";

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
    if(!verifyAutonomousResearchPlan(result,result.autonomousResearch))
      throw Error("UNVERIFIED_DOCUMENTARY_HYPOTHESIS_PLAN");
    const qualityContract = documentaryScientificQuality(result);
    const independentQualityReview = reviewScientificQuality(qualityContract,{
      basis:"DOCUMENTARY_SOURCE_ONLY",report:result,
    });
    if(!independentQualityReview.accepted)throw Error("SCIENTIFIC_QUALITY_GATE_FAILED");
    return NextResponse.json({...result,qualityContract,independentQualityReview},
      { headers: {...headers,"X-OECL-Quality-SHA256":qualityContract.integrity.sha256} });
  } catch {
    return NextResponse.json({
      status: "DOCUMENTARY_LOOKUP_FAILED",
      scientificVerdict: "NOT_EVALUATED",
      message: "The official specification lookup could not be completed; no relation was inferred.",
    }, { status: 503, headers });
  }
}
