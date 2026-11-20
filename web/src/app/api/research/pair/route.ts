import { NextRequest, NextResponse } from "next/server";
import corpus from "@/data/publicErcCorpus.json";
import materialized from "@/data/scientificPairCatalog.json";

export const dynamic = "force-dynamic";
type ErcRecord = {
  id:string;number:number;title:string;status:string;summary:string;
  requires:string[];mentions:string[];discussionUrl:string|null;
  sourceUrl:string;canonicalUrl:string;
};
type ForumTopic={id:number;title:string;url:string;ercs:string[];updatedAt:string|null};
function normalize(value:string|null) {
  const m=String(value||"").trim().match(/^(?:ERC[-\s]?)?([1-9]\d{0,7})$/i);
  return m ? "ERC-"+Number(m[1]):null;
}
function forumId(sourceUrl:string|null) {
  if (!sourceUrl) return null;
  const m=sourceUrl.match(/^https:\/\/ethereum-magicians\.org\/t\/(?:[^/?#]+\/)?(\d+)(?:[/?#]|$)/i);
  return m ? Number(m[1]):null;
}
async function readLinkedForum(url:string|null) {
  const id=forumId(url);
  if (!id) return {url,status:url?"EXTERNAL_DISCUSSION_NOT_PARSED":"NOT_LINKED",excerpt:null};
  try {
    const response=await fetch("https://ethereum-magicians.org/t/"+id+".json",{
      headers:{"accept":"application/json"},
      signal:AbortSignal.timeout(4000),next:{revalidate:3600}
    });
    if(!response.ok)throw Error("HTTP "+response.status);
    const topic=await response.json();
    const first=topic?.post_stream?.posts?.[0];
    const raw=String(first?.cooked||"").replace(/<[^>]+>/g," ")
      .replace(/&(?:nbsp|amp|lt|gt|quot);/g," ").replace(/\s+/g," ").trim();
    const excerpt=raw.split(/\s+/).slice(0,24).join(" ");
    return {url,status:first?"FORUM_FIRST_POST_OBSERVED":"FORUM_UNAVAILABLE",
      title:String(topic?.title||"").slice(0,150),
      excerpt:first?excerpt:null,updatedAt:topic?.last_posted_at||null,
      caution:"Forum content is an author statement, not proof of compatible deployed behavior."};
  }catch{
    return {url,status:"FORUM_UNAVAILABLE",excerpt:null};
  }
}
export async function GET(request:NextRequest){
  const idA=normalize(request.nextUrl.searchParams.get("left"));
  const idB=normalize(request.nextUrl.searchParams.get("right"));
  if(!idA||!idB||idA===idB)
    return NextResponse.json({status:"INVALID_PAIR",message:"Enter two distinct ERC numbers."},{status:400});
  const indexed=corpus.standards as ErcRecord[];
  const a=indexed.find(x=>x.id===idA)||null;
  const b=indexed.find(x=>x.id===idB)||null;
  const projection=materialized.projections.find(x=>
    (x.sourceParticipantId===idA&&x.targetParticipantId===idB)||
    (x.sourceParticipantId===idB&&x.targetParticipantId===idA))||null;
  const declaredDependency=Boolean(a?.requires.includes(idB)||b?.requires.includes(idA));
  const documentaryMention=Boolean(a?.mentions.includes(idB)||b?.mentions.includes(idA));
  const relation=declaredDependency?"DECLARED_REQUIREMENT":
    documentaryMention?"DOCUMENTARY_MENTION":"NO_DOCUMENTED_RELATION";
  const topics=(corpus.recentDiscussionTopics as ForumTopic[]).filter(x=>
    x.ercs.includes(idA)||x.ercs.includes(idB)).slice(0,12);
  const forumReads=await Promise.all([a?.discussionUrl||null,b?.discussionUrl||null].map(readLinkedForum));
  return NextResponse.json({
    status:"OPEN_ERC_PAIR_RESEARCH",
    indexedOfficialRecords:[Boolean(a),Boolean(b)].filter(Boolean).length,
    sources:{officialGitHub:corpus.source,magicians:corpus.forum,
      legacyScientificScope:materialized.scientificScope},
    protocols:[{id:idA,record:a},{id:idB,record:b}],
    documentary:{
      relation,declaredDependency,documentaryMention,
      discussionLinks:forumReads,recentForumTopicMentions:topics,
      caution:"A reference, discussion or declared requirement is not observed interoperability."},
    scientific:{
      evaluationStatus:projection?"MATERIALIZED_SCIENTIFIC_SNAPSHOT":"NOT_EVALUATED",
      compatibility:projection?.compatibility.polarity||"NOT_EVALUATED",
      harmony:projection?.harmony?.status||"NOT_ESTABLISHED",
      compositionValue:projection?.compositionValue?.status||"NOT_ESTABLISHED",
      observedEmergentProperties:[],
      source:"Frozen materialized OECL scientific state; a new documentary query does not execute contracts."},
    researchQuestions: [
      "Can a single concrete configuration implement both protocol interfaces without violating either participant's declared boundaries?",
      "What system-level capability becomes possible only when the participants interact, compared with running each independently?",
      "Can adversarial execution, removing one participant, or reordering actions falsify the proposed emergent property?"
    ],
    nextExperiment:"Pin implementation commits, define joint objective and invariants, run isolated controls, joint execution and ablation. Publish exact evidence before a SUPPORT verdict.",
    note:(!a||!b)?"One or both ERCs are not in the official pinned ERC repository snapshot. Absence is not incompatibility; proposals discussed on Magicians may exist separately.":
      "Documentary comparison complete. No previously untested pair has been promoted to compatible or emergent."
  });
}
