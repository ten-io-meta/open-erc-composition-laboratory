import { NextRequest, NextResponse } from "next/server";
import { getPinnedScientificCycle } from "@/server/oeclPinnedScientificCycles";

export const runtime="nodejs";
export const dynamic="force-dynamic";
const noStore={"Cache-Control":"no-store","X-Content-Type-Options":"nosniff"};

export function GET(request:NextRequest){
  const a=request.nextUrl.searchParams.get("sourceA")??"";
  const b=request.nextUrl.searchParams.get("sourceB")??"";
  if(!/^ERC-[1-9][0-9]{0,7}$/.test(a)||
     !/^ERC-[1-9][0-9]{0,7}$/.test(b)||a===b)
    return NextResponse.json({status:"INVALID_PAIR"},{status:400,headers:noStore});
  try{
    const record=getPinnedScientificCycle(a,b);
    if(!record)return NextResponse.json({
      status:"NO_REVIEWED_SCIENTIFIC_CYCLE",scientificVerdict:"NOT_EVALUATED",
      candidateAdmission:"NOT_ADMITTED",evmExecuted:false
    },{status:404,headers:noStore});
    const headers={...noStore};
    if(request.nextUrl.searchParams.get("download")==="1")
      return new NextResponse(JSON.stringify(record,null,2)+"\n",{
        status:200,headers:{...headers,"Content-Type":"application/json; charset=utf-8",
          "Content-Disposition":'attachment; filename="oecl-scientific-cycle-evidence.json"'}});
    return NextResponse.json(record,{headers});
  }catch{
    return NextResponse.json({
      status:"SCIENTIFIC_CYCLE_EVIDENCE_INTEGRITY_FAILURE",
      scientificVerdict:"INCONCLUSIVE",candidateAdmission:"NOT_ADMITTED"
    },{status:503,headers:noStore});
  }
}
