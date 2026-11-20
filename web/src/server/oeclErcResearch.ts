/**
 * OECL documentary intake. Source facts, search observations, candidate relations
 * and experimentally established composition properties are different evidence levels.
 * No untrusted web content is executed, no ERC is privileged, no compatibility is inferred.
 */
import index from "@/data/officialErcIndex.json";
import scientificCatalog from "@/data/scientificPairCatalog.json";

export type ErcDocument = {
  id: string;
  status: "FETCHED" | "NOT_IN_OFFICIAL_SNAPSHOT" | "SOURCE_UNAVAILABLE";
  title: string | null;
  editorialStatus: string | null;
  requires: string[];
  references: string[];
  url: string;
  sourceRevision: string;
};
export type ForumEvidence = {
  status: "SEARCHED" | "SOURCE_UNAVAILABLE";
  query: string;
  topics: Array<{ id: number; title: string; url: string }>;
};
type DocumentRelation = {
  kind: "DECLARED_REQUIRES" | "MENTIONS";
  source: string;
  target: string;
  explanation: string;
  evidenceUrl: string;
};
const known = new Set<number>(index.ids);
export const indexedCount = index.count;
export const indexSourceRevision = index.sourceTreeSha;
export const normalizeErc = (value: string | null): string | null => {
  if (!value) return null;
  const match = /^(?:ERC[- ]?)?([1-9][0-9]{0,6})$/i.exec(value.trim());
  return match ? "ERC-" + Number(match[1]) : null;
};
const idNumber = (id: string) => Number(id.slice(4));
const unique = (values: string[]) => Array.from(new Set(values)).sort(
  (a,b) => Number(a.split("-")[1]) - Number(b.split("-")[1])
);
function parseFrontmatter(body: string) {
  const normalized = body.replace(/^\uFEFF/, "");
  const match = /^---\s*\r?\n([\s\S]{0,12000}?)\r?\n---/.exec(normalized);
  const fields: Record<string,string> = {};
  for (const line of (match?.[1] ?? "").split(/\r?\n/)) {
    const field = /^([a-z][a-z-]*):\s*(.*)$/i.exec(line);
    if (field) fields[field[1].toLowerCase()] = field[2].trim().replace(/^["']|["']$/g,"");
  }
  return fields;
}
function ercIdsFromText(text: string, max = 50): string[] {
  const refs: string[] = [];
  for (const match of text.matchAll(/\b(?:ERC|EIP)[- ]([1-9]\d{0,6})\b/gi)) {
    refs.push("ERC-" + Number(match[1]));
    if (refs.length > max * 8) break;
  }
  return unique(refs).slice(0, max);
}
async function loadDocument(id: string): Promise<ErcDocument> {
  const n = idNumber(id);
  const url = "https://github.com/ethereum/ERCs/blob/master/ERCS/erc-" + n + ".md";
  const base: ErcDocument = { id, status:"SOURCE_UNAVAILABLE", title:null,
    editorialStatus:null, requires:[], references:[], url, sourceRevision:index.sourceTreeSha };
  if (!known.has(n)) return {...base,status:"NOT_IN_OFFICIAL_SNAPSHOT"};
  try {
    const response = await fetch(
      "https://raw.githubusercontent.com/ethereum/ERCs/" + index.sourceTreeSha + "/ERCS/erc-" + n + ".md",
      { next:{revalidate:21600}, signal:AbortSignal.timeout(8000), headers:{"Accept":"text/plain"} }
    );
    if (!response.ok) return base;
    const text = (await response.text()).slice(0,230000);
    const front = parseFrontmatter(text);
    const requires = (front.requires ?? "").split(/[,\s]+/).filter(Boolean)
      .map(x => normalizeErc(x.replace(/^EIP-/i,"").replace(/^ERC-/i,"")))
      .filter((x):x is string=>Boolean(x));
    return {...base,status:"FETCHED",title:front.title || null,
      editorialStatus:front.status || null,requires:unique(requires),
      references:ercIdsFromText(text.slice(0,100000)).filter(x=>x!==id)};
  } catch {return base;}
}
async function searchMagicians(id: string): Promise<ForumEvidence> {
  const fallback: ForumEvidence={status:"SOURCE_UNAVAILABLE",query:id,topics:[]};
  try {
    // Discourse public search, fixed origin: bounded, read-only and not proof of implementation.
    const response=await fetch(
      "https://ethereum-magicians.org/search.json?q=" + encodeURIComponent('"' + id + '"'),
      { next:{revalidate:3600},signal:AbortSignal.timeout(7000),
        headers:{"Accept":"application/json","User-Agent":"OECL-documentary-research/1.0"} }
    );
    if (!response.ok) return fallback;
    const json: unknown=await response.json();
    const data=json as {topics?:unknown[]};
    const topics=(Array.isArray(data.topics)?data.topics:[]).slice(0,6)
      .flatMap((t): ForumEvidence["topics"] => {
        if (!t || typeof t!=="object") return [];
        const v=t as {id?:unknown,title?:unknown,slug?:unknown};
        if (typeof v.id!=="number"||typeof v.title!=="string"||
            typeof v.slug!=="string"||!/^[a-z0-9-]+$/.test(v.slug)) return [];
        return [{id:v.id,title:v.title.slice(0,240),
          url:"https://ethereum-magicians.org/t/"+v.slug+"/"+v.id}];
      });
    return {status:"SEARCHED",query:id,topics};
  } catch {return fallback;}
}
export async function researchErcPair(a:string,b:string) {
  const [left,right,forumA,forumB] = await Promise.all([
    loadDocument(a),loadDocument(b),searchMagicians(a),searchMagicians(b)
  ]);
  const documentaryRelations: DocumentRelation[]=[];
  for (const [source,target] of [[left,right],[right,left]]) {
    if (source.status!=="FETCHED") continue;
    if (source.requires.includes(target.id)) documentaryRelations.push({
      kind:"DECLARED_REQUIRES",source:source.id,target:target.id,
      explanation:source.id+" explicitly declares "+target.id+" in the specification's requires field.",
      evidenceUrl:source.url
    });
    else if(source.references.includes(target.id)) documentaryRelations.push({
      kind:"MENTIONS",source:source.id,target:target.id,
      explanation:source.id+" mentions "+target.id+" in its source text; a mention is not proof of interoperability.",
      evidenceUrl:source.url
    });
  }
  const projection=scientificCatalog.projections.find(p=>
    (p.sourceParticipantId===a&&p.targetParticipantId===b)||
    (p.sourceParticipantId===b&&p.targetParticipantId===a)
  )??null;
  const bothFetched=left.status==="FETCHED"&&right.status==="FETCHED";
  return {
    status:"DOCUMENTARY_RESEARCH_ONLY" as const,
    protocols:[a,b],
    provenance:{repository:"ethereum/ERCs",treeSha:index.sourceTreeSha,
      indexedDocuments:index.count,forum:"ethereum-magicians.org"},
    standards:[left,right],
    forum:[forumA,forumB],
    documentaryRelations,
    scientificProjection:projection ? {
      compatibility:projection.compatibility?.polarity??"INCONCLUSIVE",
      harmony:projection.harmony?.status??"INCONCLUSIVE",
      valueStatus:projection.compositionValue?.status??"NOT_ESTABLISHED",
      findingCount:projection.compositionValue?.findingCount??0,
      basis:"EXISTING_FROZEN_SCIENTIFIC_SNAPSHOT"
    }:null,
    newExperimentExecuted:false,
    emergentPropertiesVerified:[] as string[],
    conclusion:projection ? "EXISTING_SCIENTIFIC_SNAPSHOT" :
      bothFetched ? "DOCUMENTARY_CANDIDATE_NOT_EVALUATED" : "INCOMPLETE_SOURCE_EVIDENCE",
    researchQuestions:documentaryRelations.some(x=>x.kind==="DECLARED_REQUIRES")?[
      "Does the declared dependency preserve the required invariants when both contracts execute?",
      "Which behavior, if any, emerges only when these participants are composed?",
      "Does removing either participant remove that behavior, and what exact boundary fails?"
    ]:[
      "Is there an actual shared execution or interface dependency, beyond documentary similarity?",
      "What joint runtime configuration and independent boundary evidence would establish feasibility?",
      "Can any newly observed property be falsified with an ablation or adversarial execution?"
    ],
    limitation:"Forum mentions and ERC text are documentary signals, never proof of runtime compatibility or emergence. Missing source evidence is INCONCLUSIVE, not incompatible."
  };
}
