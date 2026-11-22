import {NextRequest,NextResponse} from "next/server";
import {getVerifiedIndependentEvmReport,independentEvmSnapshotSha256}
  from "@/server/oeclIndependentEvmReport";

export const runtime="nodejs";
export const dynamic="force-dynamic";
const cache={"Cache-Control":"no-store"};

export function GET(request:NextRequest){
  const a=request.nextUrl.searchParams.get("sourceA");
  const b=request.nextUrl.searchParams.get("sourceB");
  if(!a||!b||a===b)return NextResponse.json({
    status:"INVALID_SOURCE_PAIR"
  },{status:400,headers:cache});
  if(a!=="ERC-8060"||b!=="ERC-20-BURNABLE"){
    return NextResponse.json({
      status:"NO_INDEPENDENT_EVM_REPORT",
      scientificVerdict:"NOT_EVALUATED",
      message:"No independently evaluated EVM receipt is pinned for this selected pair. This is not proof of incompatibility."
    },{status:404,headers:cache});
  }
  try{
    const report=getVerifiedIndependentEvmReport();
    const headers={...cache,"X-OECL-Snapshot-SHA256":independentEvmSnapshotSha256};
    if(request.nextUrl.searchParams.get("download")==="1")
      return new NextResponse(JSON.stringify(report,null,2)+"\n",{
        headers:{...headers,"Content-Type":"application/json; charset=utf-8",
          "Content-Disposition":'attachment; filename="oecl-independent-erc8060-erc20-burnable-evm.json"'}
      });
    return NextResponse.json({status:"VERIFIED_INDEPENDENT_EVM_EVIDENCE",report},{
      headers
    });
  }catch{
    return NextResponse.json({
      status:"INDEPENDENT_EVM_EVIDENCE_NOT_VERIFIED",
      message:"Pinned local EVM evidence failed integrity checks. No scientific result can be inferred."
    },{status:503,headers:cache});
  }
}
