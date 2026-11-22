import { NextRequest, NextResponse } from "next/server";
import { hasVerifiedExample, verifiedSourceView } from "@/server/oeclSourceGraphGateway";
import { acceptedSourcePair } from "@/server/oeclGenericSourceJobs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const headers={ "Cache-Control":"no-store" };

export async function GET(request:NextRequest){
  const sourceA=request.nextUrl.searchParams.get("sourceA");
  const sourceB=request.nextUrl.searchParams.get("sourceB");
  if(!acceptedSourcePair(sourceA,sourceB) || !sourceA || !sourceB)
    return NextResponse.json({status:"INVALID_SOURCE_PAIR"},
      {status:400,headers});
  if(!hasVerifiedExample(sourceA,sourceB))
    return NextResponse.json({status:"NO_VERIFIED_GRAPH_EXAMPLE",
      scientificVerdict:"NOT_EVALUATED",
      message:"This pair has no published example; absence is not incompatibility."},
      {status:404,headers});
  const token=process.env.OECL_GITHUB_ACTIONS_TOKEN;
  if(!token)
    return NextResponse.json({status:"EXAMPLE_EVIDENCE_NOT_CONFIGURED",
      message:"The server does not have access to verify archived GitHub evidence."},
      {status:503,headers});
  try{
    const view=await verifiedSourceView({sourceA,sourceB},token);
    return NextResponse.json({status:"VERIFIED_SOURCE_GRAPH",view},{headers});
  }catch{
    return NextResponse.json({status:"EXAMPLE_EVIDENCE_NOT_VERIFIED",
      message:"The CI example archive is unavailable or fails strict verification; no scientific result can be inferred."},
      {status:503,headers});
  }
}
