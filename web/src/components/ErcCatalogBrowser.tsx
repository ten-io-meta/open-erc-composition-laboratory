"use client";

import { useEffect, useMemo, useState } from "react";
import type { ErcCatalog, ErcCatalogEntry } from "@/server/oeclErcCatalog";

const PAGE_SIZE=30;

export function ErcCatalogBrowser({onChoose}:{onChoose:(side:"A"|"B",id:string)=>void}){
  const [catalog,setCatalog]=useState<ErcCatalog|null>(null);
  const [error,setError]=useState<string|null>(null);
  const [search,setSearch]=useState("");
  const [page,setPage]=useState(0);
  const [retry,setRetry]=useState(0);

  useEffect(()=>{
    const controller=new AbortController();
    async function load(){
      try{
        const response=await fetch("/api/scientific/erc-catalog",{
          cache:"no-store",signal:controller.signal});
        const body=await response.json();
        if(!response.ok||!["COMPLETE_OFFICIAL_INDEX","PARTIAL_LOCAL_INDEX"].includes(body.status)||
          !Array.isArray(body.entries)||typeof body.officialCount!=="number")
          throw Error(body.message||"ERC directory is unavailable.");
        const entries=(body.entries as ErcCatalogEntry[]);
        if(!entries.every(x=>/^ERC-[1-9][0-9]{0,7}$/.test(x.id) &&
          (x.origin==="OFFICIAL_ERC_REPOSITORY"||x.origin==="OECL_SOURCE_ONLY")))
          throw Error("The ERC index failed integrity checks.");
        if(!controller.signal.aborted){
          setCatalog(body as ErcCatalog);setError(null);
        }
      }catch(e){
        if(!controller.signal.aborted)setError(e instanceof Error?e.message:"ERC directory lookup failed.");
      }
    }
    void load();
    return()=>controller.abort();
  },[retry]);
  const matches=useMemo(()=>{
    if(!catalog)return [];
    const q=search.trim().toLowerCase().replace(/[\s-]/g,"");
    return catalog.entries.filter(x=>
      !q || x.id.toLowerCase().replace("-","").includes(q) ||
      (x.title||"").toLowerCase().includes(search.trim().toLowerCase())
    );
  },[catalog,search]);
  const maxPage=Math.max(0,Math.ceil(matches.length/PAGE_SIZE)-1);
  const visible=matches.slice(Math.min(page,maxPage)*PAGE_SIZE,(Math.min(page,maxPage)+1)*PAGE_SIZE);

  return <section className="rounded-2xl border border-[#bed6c5] bg-[#f8fbf8] p-4 md:p-5"
    aria-label="Browse all ERC standards">
    <div className="flex flex-wrap items-start justify-between gap-2">
      <div>
        <h3 className="text-base font-semibold text-[#204b34]">Official ERC directory + OECL sources</h3>
        <p className="mt-1 text-xs leading-5 text-[#607467]">
          Choose a standard for side A or B. Draft specifications are included and do not establish compatibility.
        </p>
      </div>
      {catalog && <span className="rounded-full border border-[#cbdccf] bg-white px-3 py-1.5 text-xs font-semibold text-[#36624c]">
        {catalog.officialCount} official documents · {catalog.localOnlyCount} additional OECL profiles
      </span>}
    </div>
    {catalog?.status==="PARTIAL_LOCAL_INDEX" &&
      <p role="status" className="mt-3 rounded-xl bg-[#fff4df] p-3 text-xs text-[#856031]">
        Official directory temporarily unavailable. Showing only OECL-registered sources. You can still type any ERC number into the main inputs.
      </p>}
    {!catalog && !error && <p role="status" className="mt-4 text-sm text-[#64786a]">
      Retrieving the official ERC document directory...
    </p>}
    {error && <div role="alert" className="mt-4 rounded-xl bg-[#fff4ef] p-3 text-xs text-[#874536]">
      {error} You can still enter ERC IDs manually.
      <button type="button" onClick={()=>{setError(null);setRetry(x=>x+1);}}
        className="ml-3 font-semibold underline">Retry directory</button>
    </div>}
    {catalog && <>
      <label htmlFor="oecl-catalog-search" className="mt-4 block text-xs font-semibold text-[#3f604b]">
        Search all catalogued ERC numbers{catalog.entries.some(x=>x.title)? " and titles":""}
      </label>
      <input id="oecl-catalog-search" type="search" value={search}
        onChange={e=>{setSearch(e.target.value);setPage(0);}}
        placeholder="Try 8004, 4626, NFT, vault..."
        className="mt-2 w-full rounded-xl border border-[#c9d8ce] bg-white px-4 py-3 text-sm outline-none focus:border-[#28734c] focus:ring-2 focus:ring-[#bbdfc8]"/>
      <p role="status" className="mt-3 text-xs text-[#68786b]">
        {matches.length} matching entries · {matches.length?
          "Showing "+(Math.min(page,maxPage)*PAGE_SIZE+1)+"–"+Math.min((Math.min(page,maxPage)+1)*PAGE_SIZE,matches.length):
          "No matching document in the current directory"}
      </p>
      <div data-testid="oecl-catalog-list" className="mt-3 max-h-[390px] space-y-1 overflow-auto rounded-xl border border-[#d9e5db] bg-white p-2">
        {visible.map(x=><div key={x.id}
          className="flex flex-wrap items-center justify-between gap-2 rounded-lg px-3 py-2 hover:bg-[#f0f6f1]">
          <div className="min-w-0 flex-1">
            <strong className="font-mono text-sm text-[#214f39]">{x.id}</strong>
            {x.title && <span className="ml-2 text-xs text-[#4d6152]">{x.title}</span>}
            <p className="mt-0.5 text-[10px] text-[#7a8c7e]">
              {x.origin==="OECL_SOURCE_ONLY"?"OECL pinned source — not confirmed in official index":
                x.sourceProfile?"Official document · OECL source also available":"Official ERC repository"}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button type="button" onClick={()=>onChoose("A",x.id)}
              aria-label={"Use "+x.id+" as protocol A"}
              className="rounded-lg border border-[#c6dfce] bg-[#f2f8f3] px-3 py-1.5 text-xs font-semibold text-[#286647] hover:bg-[#e1efe4]">
              Use A
            </button>
            <button type="button" onClick={()=>onChoose("B",x.id)}
              aria-label={"Use "+x.id+" as protocol B"}
              className="rounded-lg bg-[#245a40] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#16442f]">
              Use B
            </button>
          </div>
        </div>)}
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-[#708373]">Directory source: <a className="underline"
          href={catalog.source.indexUrl} rel="noopener noreferrer" target="_blank">ethereum/ERCs</a>.
          {catalog.source.treeSha?" Git tree "+catalog.source.treeSha.slice(0,10):" Incomplete lookup."}
        </p>
        <div className="flex items-center gap-3">
          <button type="button" disabled={page===0} onClick={()=>setPage(x=>Math.max(0,x-1))}
            className="rounded-lg border border-[#cddcd0] bg-white px-3 py-2 text-xs disabled:opacity-40">Previous</button>
          <span className="text-xs text-[#5a7261]">{Math.min(page,maxPage)+1} / {maxPage+1}</span>
          <button type="button" disabled={page>=maxPage} onClick={()=>setPage(x=>Math.min(maxPage,x+1))}
            className="rounded-lg border border-[#cddcd0] bg-white px-3 py-2 text-xs disabled:opacity-40">Next</button>
        </div>
      </div>
    </>}
  </section>;
}
