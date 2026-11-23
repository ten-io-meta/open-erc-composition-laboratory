import { NextResponse } from "next/server";
import { catalogSnapshotHash, getErcCatalog } from "@/server/oeclErcCatalog";

export const runtime="nodejs";
export const dynamic="force-dynamic";
export async function GET(){
  try{
    const catalog=await getErcCatalog();
    return NextResponse.json({...catalog,checksumSha256:catalogSnapshotHash(catalog)},{
      headers:{"Cache-Control":"public, s-maxage=300, stale-while-revalidate=3600",
        "X-Content-Type-Options":"nosniff"},
    });
  }catch{
    return NextResponse.json({status:"CATALOG_UNAVAILABLE",
      message:"The ERC directory cannot be loaded. Enter any ERC number manually."},{
      status:503,headers:{"Cache-Control":"no-store"},
    });
  }
}
