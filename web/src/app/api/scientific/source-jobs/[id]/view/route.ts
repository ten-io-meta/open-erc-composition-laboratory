import { NextRequest, NextResponse } from "next/server";
import { isJobId, validAccessKey } from "@/server/oeclOnDemandJobs";
import { genericSourceAvailable } from "@/server/oeclGenericSourceJobs";
import { verifiedSourceView } from "@/server/oeclSourceGraphGateway";

export const runtime="nodejs";
export const dynamic="force-dynamic";
const headers={ "Cache-Control":"no-store" };

/** Verified artifacts only: a workflow success alone is never the scientific verdict. */
export async function GET(request:NextRequest,context:{
  params:Promise<{id:string}>
}){
  if(!genericSourceAvailable())
    return NextResponse.json({status:"NOT_CONFIGURED"},{status:503,headers});
  if(!validAccessKey(request.headers.get("x-oecl-access-key"),
      process.env.OECL_ANALYSIS_ACCESS_KEY))
    return NextResponse.json({status:"UNAUTHORIZED"},{status:401,headers});
  const {id}=await context.params;
  if(!isJobId(id))
    return NextResponse.json({status:"INVALID_JOB_ID"},{status:400,headers});
  const sourceA=request.nextUrl.searchParams.get("sourceA");
  const sourceB=request.nextUrl.searchParams.get("sourceB");
  if(!sourceA||!sourceB)
    return NextResponse.json({status:"MISSING_SOURCE_PAIR"},{status:400,headers});
  try{
    const view=await verifiedSourceView({
      sourceA,sourceB,requestId:id
    },process.env.OECL_GITHUB_ACTIONS_TOKEN!);
    return NextResponse.json({status:"VERIFIED_SOURCE_GRAPH",view},{headers});
  }catch{
    return NextResponse.json({
      status:"SOURCE_GRAPH_NOT_VERIFIED",
      message:"Matching workflow artifacts are missing, expired, incomplete or inconsistent. A successful workflow does not establish compatibility.",
      scientificVerdict:null
    },{status:503,headers});
  }
}
