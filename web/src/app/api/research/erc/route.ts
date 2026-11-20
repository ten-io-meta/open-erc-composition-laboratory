import { NextRequest, NextResponse } from "next/server";
import corpus from "@/data/publicErcCorpus.json";

export const dynamic = "force-dynamic";

export function GET(request: NextRequest) {
  const query = (request.nextUrl.searchParams.get("q") || "").trim().toLowerCase().slice(0, 80);
  const limit = Math.min(100, Math.max(1, Number(request.nextUrl.searchParams.get("limit")) || 40));
  const records = corpus.standards.filter(item => {
    if (!query) return true;
    return [item.id, item.title, item.summary, item.status].some(x => String(x).toLowerCase().includes(query));
  });
  return NextResponse.json({
    status: corpus.standards.length > 0 ? "OFFICIAL_ERC_DOCUMENTARY_CATALOG" : "CATALOG_NOT_SYNCED",
    source: corpus.source, generatedAt: corpus.generatedAt, forum: corpus.forum,
    scientificStatus: "NOT_EVALUATED",
    totalIndexed: corpus.standards.length, matches: records.length,
    standards: records.slice(0, limit).map(record => ({
      id:record.id,title:record.title,status:record.status,
      summary:record.summary,requires:record.requires,
      sourceUrl:record.sourceUrl,discussionUrl:record.discussionUrl
    })),
    note: "Official GitHub metadata is documentary evidence. Indexed ERC does not imply deployed implementation, compatibility, or an emergent property."
  });
}
