"use client";

import { useMemo,useState } from "react";

export type AstGraphView = {
  schemaVersion:string;scientificVerdict:string;candidateAdmission:string;
  sourceOnly:boolean;evmExecuted:boolean;
  provenance:{runId:number;workflowSha:string;requestId:string|null;
    mode:string;url:string;graphSha256:string;discoverySha256:string;sourceReportSha256:string};
  selected:Array<{id:string;kind:string;repository:string;revision:string;sourceUnit:string;
    sourceSha256:string;primaryContract:string;exportedFunctionCount:number}>;
  counts:{sourceUnits:number;contracts:number;callableFunctions:number;
    stateDecreases:number;hypotheses:number};
  discoveryReason:string;
  hypotheses:Array<{id:string;kind:string;finding:string;status:string;
    candidateAdmission:string;scientificVerdict:string;constraints:string[];
    evidence:Array<{participant:string;publicEntrypoint?:string;state?:string;
      unit?:string;line?:number;bases?:string[]}>}>;
  nodes:Array<{id:string;kind:string;label:string;side:number;unit?:string;
    line?:number;sourceSha256?:string;contract?:string;visibility?:string}>;
  edges:Array<{id:string;from:string;to:string;kind:string}>;
  guards:Array<{participant:string;functionId:number;condition:string;
    sourceUnit:string;line:number;kind:string}>;
  unresolvedCount:number;limitations:string[];
};

const palette:Record<string,[string,string]>={
  CONTRACT:["#e0eee6","#32805d"],FUNCTION:["#f5f8f6","#9fac9f"],
  INHERITED_BASE:["#e9e5f4","#9277b8"],MODIFIER:["#fff1da","#bd8f3b"],
  GUARD:["#fff1da","#bd8f3b"],STATE_DECREASE:["#e2eaf6","#6288be"],
  HYPOTHESIS:["#fff3df","#be9147"]
};
const filters={
  all:["EXPOSES","CALLS","DECREASES","HYPOTHESIZES","MODIFIED_BY","REQUIRES","INHERITS"],
  calls:["EXPOSES","CALLS","DECREASES"],
  restrictions:["REQUIRES","MODIFIED_BY"],
  hypotheses:["HYPOTHESIZES","INHERITS"]
};
function short(s:string,max:number){return s.length>max?s.slice(0,max-1)+"…":s;}
function sourceLink(view:AstGraphView,unit:string,line:number){
  if(!Number.isSafeInteger(line)||line<1)return null;
  const match=unit.match(/^github\/([01])\/([A-Za-z0-9_./-]+\.sol)$/);
  if(match){
    const ref=view.selected[Number(match[1])];
    if(!ref||!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(ref.repository)||
       !/^[a-f0-9]{40}$/.test(ref.revision))return null;
    return "https://github.com/"+ref.repository+"/blob/"+ref.revision+"/"+
      match[2]+"#L"+line;
  }
  const oz=unit.match(/^@openzeppelin\/contracts\/([A-Za-z0-9_./-]+\.sol)$/);
  return oz?"https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.9.6/contracts/"+
    oz[1]+"#L"+line:null;
}
export function ScientificAstGraphExplorer({view}:{view:AstGraphView}){
  const [focus,setFocus]=useState<string|null>(null);
  const [filter,setFilter]=useState<keyof typeof filters>("all");
  const graph=useMemo(()=>{
    const nodes=view.nodes;
    const order:Record<string,number>={CONTRACT:0,FUNCTION:1,INHERITED_BASE:2,
      MODIFIER:3,STATE_DECREASE:4,GUARD:5,HYPOTHESIS:6};
    const sides=[0,1].map(side=>nodes.filter(n=>n.side===side)
      .sort((a,b)=>(order[a.kind]??9)-(order[b.kind]??9)));
    const centers=nodes.filter(n=>n.side===-1);
    const height=Math.max(410,125+Math.max(...sides.map(s=>s.length))*52);
    const positions=new Map<string,{x:number;y:number;w:number}>();
    sides[0].forEach((n,i)=>positions.set(n.id,{x:15,y:30+i*52,w:264}));
    sides[1].forEach((n,i)=>positions.set(n.id,{x:661,y:30+i*52,w:264}));
    centers.forEach((n,i)=>positions.set(n.id,{x:352,y:Math.min(height-65,140+i*120),w:236}));
    return {positions,height};
  },[view.nodes]);
  const chosen=view.nodes.find(n=>n.id===focus)||view.nodes[0];
  const adjacent=view.edges.filter(e=>e.from===chosen?.id||e.to===chosen?.id);
  function download(){
    const blob=new Blob([JSON.stringify(view,null,2)+"\n"],{type:"application/json"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");a.href=url;
    a.download="oecl-"+view.selected.map(s=>s.id.toLowerCase()).join("-")+"-ast-view.json";
    a.click();URL.revokeObjectURL(url);
  }
  return <section className="mt-6 space-y-5 rounded-2xl border border-[#d3dfd6] bg-white p-4 md:p-6"
      aria-label="Interactive verified Solidity AST graph">
    <header className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#28634b]">
          Compiler-resolved source evidence · Verified
        </p>
        <h3 className="mt-1 text-xl font-medium">{view.selected.map(s=>s.id).join(" × ")}</h3>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#64726a]">
          Click or focus a node to inspect its Solidity source and relationship.
          Dashed links are proposed interactions, not proven compositions.
        </p>
      </div>
      <span className="rounded-full border border-[#ddcba5] bg-[#fff8e9] px-3 py-2 font-mono text-xs text-[#8c6b32]">
        {view.scientificVerdict} · {view.candidateAdmission}
      </span>
    </header>
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {([["Contracts",view.counts.contracts],["Functions",view.counts.callableFunctions],
        ["Source units",view.counts.sourceUnits],["Hypotheses",view.counts.hypotheses]] as const)
        .map(([title,value])=><div key={title} className="rounded-xl border border-[#e0e8e2] p-3">
          <p className="text-xs text-[#68756c]">{title}</p>
          <p className="mt-1 text-2xl font-medium">{value}</p>
        </div>)}
    </div>
    <div className="flex flex-wrap gap-2" aria-label="Graph filters">
      {([["all","All edges"],["calls","Calls & state"],
        ["restrictions","Guards & modifiers"],["hypotheses","Hypotheses"]] as const)
        .map(([id,label])=><button type="button" key={id} onClick={()=>setFilter(id)}
          aria-pressed={filter===id}
          className={"rounded-lg border px-3 py-2 text-xs "+
            (filter===id?"border-[#2d7554] bg-[#e8f3ec] text-[#246546]":
              "border-[#d9e1da] text-[#5e7065]")}>{label}</button>)}
    </div>
    <div className="overflow-x-auto rounded-xl border border-[#dbe5dd] bg-[#fafcfb]">
      <svg viewBox={"0 0 940 "+graph.height} width="100%" className="min-w-[680px]"
        role="img" aria-label="Graph of two Solidity contracts, call paths, guards, state changes and hypotheses">
        <text x="147" y="18" textAnchor="middle" fontSize="12" fill="#28634b">
          {short(view.selected[0].id,26)}</text>
        <text x="792" y="18" textAnchor="middle" fontSize="12" fill="#28634b">
          {short(view.selected[1].id,26)}</text>
        <text x="470" y="94" textAnchor="middle" fontSize="11" fill="#967344">
          Source hypotheses</text>
        {view.edges.filter(e=>filters[filter].includes(e.kind)).map(e=>{
          const a=graph.positions.get(e.from),b=graph.positions.get(e.to);
          if(!a||!b)return null;
          const x1=a.x+a.w/2,y1=a.y+20,x2=b.x+b.w/2,y2=b.y+20;
          const mx=(x1+x2)/2,possible=e.kind==="HYPOTHESIZES";
          return <path key={e.id} d={"M"+x1+" "+y1+" C"+mx+" "+y1+" "+mx+" "+y2+" "+x2+" "+y2}
            stroke={possible?"#c79c53":"#a2b3a8"} strokeWidth={possible?2:1.2}
            strokeDasharray={possible?"5 4":undefined} opacity=".75" fill="none">
            <title>{e.kind}</title></path>;
        })}
        {view.nodes.map(n=>{
          const p=graph.positions.get(n.id);if(!p)return null;
          const [fill,stroke]=palette[n.kind]||["#fff","#9ba8a0"];
          const active=chosen?.id===n.id;
          return <g key={n.id} role="button" tabIndex={0} aria-label={n.kind+": "+n.label}
            onClick={()=>setFocus(n.id)}
            onKeyDown={e=>{if(e.key==="Enter"||e.key===" "){
              e.preventDefault();setFocus(n.id);}}} className="cursor-pointer">
            <rect x={p.x} y={p.y} width={p.w} height="41" rx="9" fill={fill}
              stroke={active?"#17513a":stroke} strokeWidth={active?2.6:1.1}/>
            <text x={p.x+10} y={p.y+15} fontSize="9" fill="#637268">
              {n.kind.replaceAll("_"," ")}</text>
            <text x={p.x+10} y={p.y+30} fontSize="12" fill="#274336">
              {short(n.label,p.w===236?28:34)}</text>
            <title>{n.label}</title>
          </g>;
        })}
      </svg>
    </div>
    {chosen&&<section className="rounded-xl bg-[#f1f6f2] p-4" aria-label="Selected AST node">
      <p className="font-mono text-[10px] uppercase text-[#587060]">Selected node</p>
      <h4 className="mt-1 text-sm font-semibold">
        {chosen.kind.replaceAll("_"," ")} · {chosen.label}</h4>
      {chosen.unit&&<p className="mt-2 break-all font-mono text-[11px] text-[#5c6d61]">
        {chosen.unit}{chosen.line?":"+chosen.line:""}</p>}
      {chosen.sourceSha256&&<p className="mt-2 break-all font-mono text-[10px] text-[#5c6d61]">
        SHA-256: {chosen.sourceSha256}</p>}
      {chosen.unit&&chosen.line&&sourceLink(view,chosen.unit,chosen.line)&&
        <a href={sourceLink(view,chosen.unit,chosen.line)!} target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-block text-xs font-semibold text-[#236847] underline">
          Read original Solidity at this line</a>}
      <p className="mt-2 text-xs text-[#5c6d61]">
        {adjacent.length} related edges · This is a focused projection of the full AST.</p>
    </section>}
    {view.hypotheses.length===0?
      <p className="rounded-xl border border-[#ded3b7] bg-[#fff9ed] p-4 text-sm text-[#806c40]">
        No supported relation discovered under the current rules. This is not
        a claim that the protocols are incompatible.</p>:
      <div className="space-y-3">
        <h4 className="font-semibold">Source-only hypotheses</h4>
        {view.hypotheses.map(h=><div key={h.id} className="rounded-xl border border-[#dee5df] p-4">
          <p className="break-all font-mono text-[10px] text-[#66756a]">{h.id}</p>
          <p className="mt-1 text-sm font-semibold">{h.kind.replaceAll("_"," ")}</p>
          <p className="mt-2 text-sm text-[#5a6a5e]">{h.finding}</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {h.evidence.map(e=><div key={e.participant}
              className="rounded-lg bg-[#f5f8f5] p-3 text-xs">
              <strong>{e.participant}</strong>
              <p className="mt-2 font-mono">{e.publicEntrypoint?
                e.publicEntrypoint+"() → "+e.state:(e.bases||[]).join(", ")}</p>
              {e.unit&&<p className="mt-1 break-all text-[10px] text-[#66756a]">
                {e.unit}:{e.line}</p>}
            </div>)}
          </div>
          <details className="mt-3 text-xs text-[#5c6d61]">
            <summary className="cursor-pointer font-semibold">
              Missing conditions and limits ({h.constraints.length})
            </summary>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {h.constraints.map(c=><li key={c}>{c}</li>)}
            </ul>
          </details>
        </div>)}
      </div>}
    {view.guards.length>0&&<details className="rounded-xl border border-[#dee5df] p-4">
      <summary className="cursor-pointer text-sm font-semibold">
        AST restrictions · {view.guards.length} guards
      </summary>
      <div className="mt-3 space-y-2">{view.guards.map((g,i)=>
        <div className="rounded-lg bg-[#f7f9f7] p-3 text-xs" key={i}>
          <strong>{g.participant}</strong> · <code>{g.condition}</code>
          <p className="mt-1 text-[10px] text-[#66756a]">{g.sourceUnit}:{g.line}</p>
        </div>)}</div>
    </details>}
    <details className="rounded-xl border border-[#dee5df] p-4">
      <summary className="cursor-pointer text-sm font-semibold">
        Scientific limits and provenance
      </summary>
      <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-[#64726a]">
        {view.limitations.map((l,i)=><li key={i}>{l}</li>)}
      </ul>
      <p className="mt-3 break-all font-mono text-[10px]">
        AST SHA-256: {view.provenance.graphSha256}</p>
      <p className="mt-2 break-all font-mono text-[10px]">
        Discovery SHA-256: {view.provenance.discoverySha256}</p>
    </details>
    <div className="flex flex-wrap gap-2">
      <button onClick={download} type="button"
        className="rounded-xl bg-[#245d45] px-4 py-3 text-xs font-semibold text-white">
        Download graph view (JSON)
      </button>
      <a href={view.provenance.url} target="_blank" rel="noopener noreferrer"
        className="rounded-xl border border-[#ccd8d0] px-4 py-3 text-xs font-semibold text-[#245d45]">
        Original scientific artifacts
      </a>
    </div>
    <p className="text-xs leading-5 text-[#66766a]">
      The graph is based on compiler AST facts; no EVM experiment was run for
      this source-only view. Its hypotheses are not admitted.
    </p>
  </section>;
}
