import { NextResponse } from "next/server";
import index from "@/data/officialErcIndex.json";
export function GET() {
  return NextResponse.json({
    status:"OFFICIAL_GITHUB_INDEX_SNAPSHOT",
    source:index.source,
    commitSha:index.sourceCommitSha,
    indexedDocumentCount:index.count,
    ids:index.ids,
    coverage:"PRESENCE_INDEX_ONLY",
    explanation:"An indexed ERC document is not analyzed, implemented, compatible or experimentally validated."
  },{headers:{"Cache-Control":"public, s-maxage=3600"}});
}
