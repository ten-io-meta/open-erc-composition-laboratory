import { NextRequest, NextResponse } from "next/server";
import { normalizeErcNumber, investigateErcSpecifications } from "@/server/oeclErcDocumentaryDiscovery";
import { verifyAutonomousResearchPlan } from "@/server/oeclAutonomousResearchPlanner";
import { documentaryScientificQuality, pinnedScientificQuality } from "@/server/oeclScientificQualityContract";
import { reviewScientificQuality } from "@/server/oeclScientificQualityReviewer";
import { reviewedScientificClaimLedger } from "@/server/oeclScientificClaimGate";
import { DOSSIER_EVIDENCE_RUN,DOSSIER_SNAPSHOT_SHA256,getVerifiedScientificDossier,isDossierPair } from "@/server/oeclScientificDossier";

export const runtime="nodejs";
export const dynamic="force-dynamic";
const headers={"Cache-Control":"no-store","X-Content-Type-Options":"nosniff"};

/**
 * Read-only, agent-consumable quality contract for the selected ERC pair.
 * "pinned" requires an actual already-archived local EVM dossier;
 * "documentary" never asks a worker to execute or promote evidence.
 */
export async function GET(request:NextRequest){
  const a=normalizeErcNumber(request.nextUrl.searchParams.get("protocolA"));
  const b=normalizeErcNumber(request.nextUrl.searchParams.get("protocolB"));
  const basis=request.nextUrl.searchParams.get("basis")??"documentary";
  if(!a||!b||a===b||!["documentary","pinned"].includes(basis)){
    return NextResponse.json({status:"INVALID_QUALITY_REQUEST",candidateAdmission:"NOT_ADMITTED"},
      {status:400,headers});
  }
  if(basis==="pinned"&&!isDossierPair(a,b)){
    return NextResponse.json({status:"NO_PINNED_QUALITY_EVIDENCE",
      message:"No archived local-EVM dossier for this pair. This does not prove incompatibility."},
    {status:404,headers});
  }
  try{
    let contract,review;
    let sourceReport:Parameters<typeof reviewedScientificClaimLedger>[2]|null=null;
    if(basis==="pinned"){
      const dossier=getVerifiedScientificDossier();
      sourceReport=dossier;
      contract=pinnedScientificQuality(dossier,DOSSIER_SNAPSHOT_SHA256,DOSSIER_EVIDENCE_RUN);
      review=reviewScientificQuality(contract,{basis:"PINNED_LOCAL_EVM_SNAPSHOT",
        report:dossier,snapshotSha256:DOSSIER_SNAPSHOT_SHA256,evidenceRunUrl:DOSSIER_EVIDENCE_RUN});
    }else{
      const pair=await investigateErcSpecifications(a,b);
      sourceReport=pair;
      if(!verifyAutonomousResearchPlan(pair,pair.autonomousResearch))
        throw Error("UNVERIFIED_AUTONOMOUS_RESEARCH");
      contract=documentaryScientificQuality(pair);
      review=reviewScientificQuality(contract,{basis:"DOCUMENTARY_SOURCE_ONLY",report:pair});
    }
    if(!review.accepted||!sourceReport)throw Error("SCIENTIFIC_QUALITY_REVIEW_REJECTED");
    const {claimLedger,independentClaimReview}=reviewedScientificClaimLedger(
      contract,review,sourceReport);
    const response={status:"SCIENTIFIC_QUALITY_CONTRACT_REVIEWED",contract,review,
      claimLedger,independentClaimReview};
    const responseHeaders={...headers,"X-OECL-Quality-SHA256":contract.integrity.sha256,
      "X-OECL-Claims-SHA256":claimLedger.integrity.sha256};
    if(request.nextUrl.searchParams.get("download")==="1"){
      return new NextResponse(JSON.stringify(response,null,2)+"\n",{status:200,headers:{
        ...responseHeaders,"Content-Type":"application/json; charset=utf-8",
        "Content-Disposition":'attachment; filename="oecl-scientific-quality-contract.json"',
      }});
    }
    return NextResponse.json(response,{headers:responseHeaders});
  }catch{
    return NextResponse.json({status:"SCIENTIFIC_QUALITY_UNAVAILABLE",
      message:"A scientific source or the independent quality checks could not be verified. No claim has been promoted.",
      candidateAdmission:"NOT_ADMITTED",compatibilityVerdict:"NOT_EVALUATED"},
    {status:503,headers});
  }
}
