import { NextRequest,NextResponse } from "next/server";
import { normalizeErcNumber,investigateErcSpecifications } from "@/server/oeclErcDocumentaryDiscovery";
import { verifyAutonomousResearchPlan } from "@/server/oeclAutonomousResearchPlanner";
import { documentaryScientificQuality,pinnedScientificQuality } from "@/server/oeclScientificQualityContract";
import { reviewScientificQuality } from "@/server/oeclScientificQualityReviewer";
import { DOSSIER_EVIDENCE_RUN,DOSSIER_SNAPSHOT_SHA256,getVerifiedScientificDossier,isDossierPair } from "@/server/oeclScientificDossier";

export const runtime="nodejs";
export const dynamic="force-dynamic";
const headers={"Cache-Control":"no-store","X-Content-Type-Options":"nosniff"};

/**
 * A verifier for quality contract digests held by agents.
 * Reconstructs from separately checked server sources, never from the
 * requester's claims. A changed mutable source invalidates the old digest,
 * but is not itself evidence of tampering. NO EVM replay here.
 */
export async function GET(request:NextRequest){
  const params=request.nextUrl.searchParams;
  const a=normalizeErcNumber(params.get("protocolA")),b=normalizeErcNumber(params.get("protocolB"));
  const basis=params.get("basis")??"documentary",expected=params.get("sha256");
  if(!a||!b||a===b||!["documentary","pinned"].includes(basis)||
     !expected||!/^[a-f0-9]{64}$/.test(expected)){
    return NextResponse.json({status:"INVALID_VERIFICATION_REQUEST",
      message:"Supply a valid pair, basis and SHA-256 digest."},{status:400,headers});
  }
  if(basis==="pinned"&&!isDossierPair(a,b)){
    return NextResponse.json({status:"NO_PINNED_QUALITY_EVIDENCE"},{status:404,headers});
  }
  try{
    let contract,review;
    if(basis==="pinned"){
      const report=getVerifiedScientificDossier();
      contract=pinnedScientificQuality(report,DOSSIER_SNAPSHOT_SHA256,DOSSIER_EVIDENCE_RUN);
      review=reviewScientificQuality(contract,{basis:"PINNED_LOCAL_EVM_SNAPSHOT",
        report,snapshotSha256:DOSSIER_SNAPSHOT_SHA256,evidenceRunUrl:DOSSIER_EVIDENCE_RUN});
    }else{
      const report=await investigateErcSpecifications(a,b);
      if(!verifyAutonomousResearchPlan(report,report.autonomousResearch))
        throw Error("SCIENTIFIC_SOURCE_PLAN_NOT_VERIFIED");
      contract=documentaryScientificQuality(report);
      review=reviewScientificQuality(contract,{basis:"DOCUMENTARY_SOURCE_ONLY",report});
    }
    if(!review.accepted)throw Error("QUALITY_VERIFICATION_REJECTED");
    const matches=contract.integrity.sha256===expected;
    return NextResponse.json({
      status:matches?"QUALITY_DIGEST_MATCHES_RECONSTRUCTED_SOURCE":"QUALITY_DIGEST_MISMATCH",
      matches,submittedSha256:expected,reconstructedSha256:contract.integrity.sha256,
      review,
      note:matches
        ?"The quality contract matches a server-side reconstruction. This does not independently authenticate mutable source documents or replay EVM receipts."
        :"The digest differs from the current source-backed result. Mutable ERC documents may have changed; do not treat the old contract as verified against this snapshot.",
      compatibilityVerdict:"NOT_EVALUATED",candidateAdmission:"NOT_ADMITTED",
    },{status:matches?200:409,headers});
  }catch{
    return NextResponse.json({status:"QUALITY_VERIFICATION_UNAVAILABLE",matches:false,
      candidateAdmission:"NOT_ADMITTED",
      message:"The server source or quality reviewer could not be verified."},
    {status:503,headers});
  }
}
