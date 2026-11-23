import { NextRequest, NextResponse } from "next/server";
import { getVerifiedErc4626LocalEvm } from "@/server/oeclPinnedErc4626Evm";

export const runtime="nodejs";
export const dynamic="force-dynamic";

export function GET(request:NextRequest){
  const headers:Record<string,string>={
    "Cache-Control":"public, max-age=60",
    "X-Content-Type-Options":"nosniff",
  };
  try{
    const evidence=getVerifiedErc4626LocalEvm();
    if(request.nextUrl.searchParams.get("download")==="1")
      headers["Content-Disposition"]='attachment; filename="oecl-erc4626-erc20-local-evm-evidence.json"';
    return NextResponse.json({
      status:"VERIFIED_PINNED_LOCAL_EVM",
      ...evidence,
    },{headers});
  }catch{
    return NextResponse.json({
      status:"LOCAL_EVM_EVIDENCE_INTEGRITY_FAILURE",
      scientificVerdict:"INCONCLUSIVE",
      candidateAdmission:"NOT_ADMITTED",
      message:"The pinned ERC-4626/20 receipt bundle did not pass independent integrity checks. No EVM claim is shown.",
    },{status:503,headers:{"Cache-Control":"no-store"}});
  }
}
