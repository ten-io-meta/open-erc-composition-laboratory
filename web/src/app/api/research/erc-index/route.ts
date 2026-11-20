import { NextResponse } from "next/server";
import index from "@/data/officialErcIndex.json";
import openIndex from "@/data/openErcProposalIndex.json";
export function GET() {
  return NextResponse.json({
    status:"OFFICIAL_GITHUB_INDEX_SNAPSHOT",
    source:index.source,
    commitSha:index.sourceCommitSha,
    indexedDocumentCount:index.count,
    ids:index.ids,
    openProposalSnapshot:{
      scannedPullRequests:openIndex.scannedOpenPullRequests,
      proposedDocuments:openIndex.examinedDocumentProposals,
      sourceInconsistencies:openIndex.errors.length,
      coverage:openIndex.coverage,
      evidenceLevel:"UNMERGED_PR_DOCUMENTS_NOT_OFFICIAL_STANDARDS"
    },
    coverage:"PRESENCE_INDEX_ONLY",
    explanation:"An indexed ERC document is not analyzed, implemented, compatible or experimentally validated."
  },{headers:{"Cache-Control":"public, s-maxage=3600"}});
}
