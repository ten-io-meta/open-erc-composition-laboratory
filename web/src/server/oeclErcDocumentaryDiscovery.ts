import { createHash } from "node:crypto";

/** Official ERC document comparison, NEVER executable Solidity or candidate admission. */
export type StandardDocument = {
  id: string; availability: "PUBLISHED" | "NOT_IN_OFFICIAL_REGISTRY" | "SOURCE_UNAVAILABLE";
  title: string | null; description: string | null; abstract: string | null;
  status: string | null; category: string | null; requires: string[];
  interfaceNames: string[]; requirements: string[];
  provenance: { sourceUrl: string; canonicalUrl: string; sha256: string | null;
    ref: "master (mutable)" };
};
export type DocumentaryPair = {
  status: "DOCUMENTARY_COMPARISON";
  scope: "OFFICIAL_ERC_SPECIFICATIONS_ONLY";
  protocols: [string,string]; standards: [StandardDocument,StandardDocument];
  relation: {kind: "DECLARED_DEPENDENCY" | "SHARED_DEPENDENCY" |
    "NO_DECLARED_DEPENDENCY" | "INCOMPLETE_SPECIFICATIONS";
    statements: string[]; sharedPrerequisites: string[];
    overlappingInterfaceNames: string[]};
  researchQuestions: {id:string; basis:string[]; question:string; requiredEvidence:string[]}[];
  scientificVerdict: "NOT_EVALUATED"; candidateAdmission: "NOT_ADMITTED";
  implementationVerified: false; evmExecuted: false; warnings: string[];
};
type Transport = (url: string,init?: RequestInit) => Promise<Response>;
const MAX_BYTES=400_000, MAX_CHARS=200_000;
export function normalizeErcNumber(value:string|null):string|null{
  if(value===null||value.length>24)return null;
  const m=value.trim().toUpperCase().match(/^(?:ERC[- ]?)?([1-9][0-9]{0,7})$/);
  return m?"ERC-"+m[1]:null;
}
function source(id:string){return "https://raw.githubusercontent.com/ethereum/ERCs/master/ERCS/erc-"+id.slice(4)+".md";}
function canonical(id:string){return "https://eips.ethereum.org/EIPS/eip-"+id.slice(4);}
function missing(id:string,availability:StandardDocument["availability"]):StandardDocument{
  return {id,availability,title:null,description:null,abstract:null,status:null,
    category:null,requires:[],interfaceNames:[],requirements:[],provenance:{
    sourceUrl:source(id),canonicalUrl:canonical(id),sha256:null,ref:"master (mutable)"}};
}
function section(input:string,name:string):string{
  let enabled=false;const lines:string[]=[];
  for(const line of input.split(/\r?\n/)){
    const h=line.match(/^#{2}\s+(.+?)\s*$/);
    if(h){
      // ERC-20 nests its method specification under a same-level "Token" heading.
      // Preserve that documented subdivision instead of dropping its methods.
      if(enabled && name==="Specification" && ["token","methods","events"].includes(h[1].toLowerCase())){
        lines.push(line);continue;
      }
      if(enabled)break;
      enabled=h[1].toLowerCase()===name.toLowerCase();continue;
    }
    if(enabled)lines.push(line);
  }
  return lines.join("\n");
}
function readable(text:string):string{
  return text.replace(/\[([^\]]+)\]\([^)]*\)/g,"$1").replace(/[\x60*_#<>]/g,"")
    .replace(/\s+/g," ").trim();
}
export function parseOfficialErc(id:string,text:string):StandardDocument|null{
  if(text.length>MAX_CHARS||!text.startsWith("---\n"))return null;
  const end=text.indexOf("\n---",4);
  if(end<0||end>12000)return null;
  const meta:Record<string,string>={};
  for(const line of text.slice(4,end).split(/\r?\n/)){
    const m=line.match(/^([a-z][a-z-]*):\s*(.*?)\s*$/i);
    if(m)meta[m[1].toLowerCase()]=m[2];
  }
  if(meta.eip!==id.slice(4)||meta.category?.toLowerCase()!=="erc"||
     !meta.title||!meta.status||meta.status.toLowerCase()==="moved")return null;
  const body=text.slice(end+4),spec=section(body,"Specification");
  const abstract=readable((section(body,"Abstract")||section(body,"Simple Summary"))
    .split(/\n\s*\n/)[0]||"").slice(0,500)||null;
  const requires=[...new Set((meta.requires||"").split(",").map(x=>x.trim())
    .filter(x=>/^[1-9][0-9]{0,7}$/.test(x)).map(x=>"EIP-"+x))].slice(0,30);
  // Capture method/event headings only when explicitly nested under a
  // Methods, Events or Functions section. General explanation/example headings
  // (e.g., ERC-165's hello/world demonstrations) are not API declarations.
  const names:string[]=[];let inMethods=false;
  for(const line of spec.split(/\r?\n/)){
    const h=line.match(/^(#{3,5})\s+(.+?)\s*$/);
    if(!h)continue;
    if(h[1].length===3){
      inMethods=/^(?:Methods?|Events?|Functions?|Required Methods)$/i.test(h[2]);
      continue;
    }
    if(inMethods&&/^[A-Za-z][A-Za-z0-9_]{1,54}$/.test(h[2]))names.push(h[2]);
  }
  // Accept functions/events declared inside explicitly named ERC interfaces,
  // tolerating ERC-721's inline "is ERC165" comment. Ignore unrelated
  // tutorial interfaces, contracts and functions; this is still documentary.
  const declared=[...spec.matchAll(/\binterface\s+((?:I?ERC)[1-9][0-9]*[A-Za-z0-9_]*)\s*(?:\/\*[\s\S]*?\*\/\s*)?\{([\s\S]*?)\}/g)]
    .flatMap(block=>[...block[2].matchAll(/\b(?:function|event)\s+([A-Za-z_][A-Za-z0-9_]{1,54})\s*\(/g)].map(x=>x[1]));
  const interfaceNames=[...new Set([...names,...declared])].slice(0,24);
  const requirements=spec.split(/\r?\n/).filter(s=>/\b(?:MUST|SHALL|SHOULD)\b/.test(s))
    .map(readable).filter(s=>s.length>=24&&s.length<=300).slice(0,6);
  return {id,availability:"PUBLISHED",title:meta.title.slice(0,160),
    description:meta.description?.slice(0,250)||null,abstract,
    status:meta.status.slice(0,50),category:"ERC",requires,interfaceNames,
    requirements,provenance:{sourceUrl:source(id),canonicalUrl:canonical(id),
    sha256:createHash("sha256").update(text).digest("hex"),ref:"master (mutable)"}};
}
async function boundedText(response:Response):Promise<string>{
  const size=Number(response.headers.get("content-length")||"0");
  if((size&&(!Number.isFinite(size)||size>MAX_BYTES))||!response.body)
    throw Error("DOCUMENT_SIZE_UNAVAILABLE");
  const reader=response.body.getReader(),chunks:Uint8Array[]=[];let length=0;
  try{
    while(true){const {done,value}=await reader.read();if(done)break;
      length+=value.byteLength;if(length>MAX_BYTES)throw Error("DOCUMENT_TOO_LARGE");
      chunks.push(value);}
  }finally{await reader.cancel().catch(()=>{});reader.releaseLock();}
  const bytes=new Uint8Array(length);let pos=0;
  for(const c of chunks){bytes.set(c,pos);pos+=c.byteLength;}
  return new TextDecoder("utf-8",{fatal:true}).decode(bytes);
}
export async function readOfficialErc(id:string,transport:Transport=fetch):Promise<StandardDocument>{
  if(normalizeErcNumber(id)!==id)throw Error("INVALID_ERC_ID");
  try{
    const r=await transport(source(id),{method:"GET",cache:"no-store",redirect:"error",
      headers:{Accept:"text/plain"},signal:AbortSignal.timeout(7500)});
    if(r.status===404)return missing(id,"NOT_IN_OFFICIAL_REGISTRY");
    if(!r.ok)return missing(id,"SOURCE_UNAVAILABLE");
    return parseOfficialErc(id,await boundedText(r))??missing(id,"NOT_IN_OFFICIAL_REGISTRY");
  }catch{return missing(id,"SOURCE_UNAVAILABLE");}
}
export function deriveRelation(a:StandardDocument,b:StandardDocument):DocumentaryPair["relation"]{
  if(a.availability!=="PUBLISHED"||b.availability!=="PUBLISHED")
    return {kind:"INCOMPLETE_SPECIFICATIONS",statements:[
      "At least one official ERC specification could not be retrieved. No relationship is inferred."
    ],sharedPrerequisites:[],overlappingInterfaceNames:[]};
  const overlap=a.interfaceNames.filter(x=>b.interfaceNames.includes(x)).slice(0,12);
  const common=a.requires.filter(x=>b.requires.includes(x));
  const direct:string[]=[];
  if(a.requires.includes("EIP-"+b.id.slice(4)))direct.push(a.id+" explicitly lists "+b.id+" as a prerequisite.");
  if(b.requires.includes("EIP-"+a.id.slice(4)))direct.push(b.id+" explicitly lists "+a.id+" as a prerequisite.");
  if(direct.length)return {kind:"DECLARED_DEPENDENCY",statements:direct,
    sharedPrerequisites:common,overlappingInterfaceNames:overlap};
  if(common.length)return {kind:"SHARED_DEPENDENCY",statements:[
    "Both specifications list "+common.join(", ")+" as prerequisites."
  ],sharedPrerequisites:common,overlappingInterfaceNames:overlap};
  return {kind:"NO_DECLARED_DEPENDENCY",statements:[
    "Neither document lists the other as a direct prerequisite. This does not establish incompatibility."
  ],sharedPrerequisites:[],overlappingInterfaceNames:overlap};
}
/**
 * Test DESIGN only, derived from labels present in both source documents.
 * Never an admitted relation, compiled ABI or emergent-property discovery.
 */
export function proposeDocumentaryTests(a:StandardDocument,b:StandardDocument){
  if(a.availability!=="PUBLISHED"||b.availability!=="PUBLISHED")return [];
  const questions:{id:string;basis:string[];question:string;requiredEvidence:string[]}[]=[];
  const aNames=new Set(a.interfaceNames),bNames=new Set(b.interfaceNames);
  const aRequiresB=a.requires.includes("EIP-"+b.id.slice(4));
  const bRequiresA=b.requires.includes("EIP-"+a.id.slice(4));
  if(aRequiresB||bRequiresA)questions.push({
    id:"DECLARED_DEPENDENCY_CONFORMANCE",
    basis:[aRequiresB?a.id+" requires "+b.id:b.id+" requires "+a.id],
    question:"Does the selected implementation actually satisfy the required standard, including authorization and failure semantics?",
    requiredEvidence:["Immutable implementations and resolved ABI","Compiler source graph and compliance tests","Adversarial EVM executions"],
  });
  const matching=a.interfaceNames.filter(n=>bNames.has(n));
  if(matching.length)questions.push({
    id:"SHARED_METHOD_SEMANTICS",
    basis:matching.slice(0,5).map(n=>a.id+" / "+b.id+": "+n),
    question:"Do similarly named interface elements agree on argument types, asset units, access rules and state effects?",
    requiredEvidence:["Typed function signatures","Behavioral constraints for both implementations","Positive and negative EVM scenarios"],
  });
  const assetFlow=["transferFrom","safeTransferFrom","transfer","safeBatchTransferFrom"];
  const receiving=["deposit","mint","redeem","withdraw"];
  const flows=[
    {giver:a,taker:b,gives:assetFlow.find(n=>aNames.has(n)),takes:receiving.find(n=>bNames.has(n))},
    {giver:b,taker:a,gives:assetFlow.find(n=>bNames.has(n)),takes:receiving.find(n=>aNames.has(n))},
  ];
  for(const path of flows){
    if(!path.gives||!path.takes)continue;
    questions.push({
      id:"POTENTIAL_ASSET_FLOW_TEST",
      basis:[path.giver.id+"."+path.gives,path.taker.id+"."+path.takes],
      question:"Could a separately designed adapter coordinate these documented operations while preserving token type, custody and transaction rollback?",
      requiredEvidence:["Prove compatible asset classes and units","Verify allowance, ownership and receiver permissions","Execute authorized, unauthorized and rollback cases on isolated EVM"],
    });
    break;
  }
  return questions.slice(0,3);
}
export async function investigateErcSpecifications(
  first:string,second:string,transport:Transport=fetch):Promise<DocumentaryPair>{
  const a=normalizeErcNumber(first),b=normalizeErcNumber(second);
  if(!a||!b||a===b)throw Error("INVALID_ERC_PAIR");
  const documents=await Promise.all([readOfficialErc(a,transport),readOfficialErc(b,transport)]);
  return {status:"DOCUMENTARY_COMPARISON",scope:"OFFICIAL_ERC_SPECIFICATIONS_ONLY",
    protocols:[a,b],standards:[documents[0],documents[1]],
    relation:deriveRelation(documents[0],documents[1]),
    researchQuestions:proposeDocumentaryTests(documents[0],documents[1]),
    scientificVerdict:"NOT_EVALUATED",candidateAdmission:"NOT_ADMITTED",
    evmExecuted:false,implementationVerified:false,warnings:[
      "Specification metadata can list Core EIPs as well as ERCs, and is not a compatibility proof.",
      "Specification dependencies do not establish that two implementations can interact safely.",
      "Matching interface names are only documentary names, not verified ABI or behavioral matches.",
      "Official documents are fetched from a mutable branch; content hashes document what was read.",
      "Compiler AST, constraints, authorization, and independent EVM evidence are required for scientific admission.",
    ]};
}
