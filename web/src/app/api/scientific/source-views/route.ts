import { NextRequest,NextResponse } from "next/server";
import { getVerifiedAstExample,AST_EXAMPLES_SHA256 } from "@/server/oeclVerifiedAstExamples";
import { acceptedSourcePair } from "@/server/oeclGenericSourceJobs";

export const runtime="nodejs";
export const dynamic="force-dynamic";
const headers={"Cache-Control":"no-store"};

export function GET(request:NextRequest){
  const a=request.nextUrl.searchParams.get("sourceA");
  const b=request.nextUrl.searchParams.get("sourceB");
  if(!acceptedSourcePair(a,b)||!a||!b)
    return NextResponse.json({status:"INVALID_SOURCE_PAIR"},{status:400,headers});
  try{
    const view=getVerifiedAstExample(a,b);
    if(!view)return NextResponse.json({
      status:"NO_VERIFIED_GRAPH_EXAMPLE",scientificVerdict:"NOT_EVALUATED",
      message:"There is no CI snapshot for this pair. No incompatibility is inferred."
    },{status:404,headers});
    return NextResponse.json({status:"VERIFIED_SOURCE_GRAPH",view},{
      headers:{...headers,"X-OECL-Snapshot-SHA256":AST_EXAMPLES_SHA256}
    });
  }catch{
    return NextResponse.json({status:"SOURCE_EXAMPLE_INTEGRITY_FAILURE",
      message:"The pinned scientific source graph failed verification."},
      {status:503,headers});
  }
}
