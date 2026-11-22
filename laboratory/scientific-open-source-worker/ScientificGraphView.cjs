"use strict";
/** Pure, read-only projection. Source/provenance validation must fail closed. */
const assert=require("node:assert/strict");
const crypto=require("node:crypto");
const hash=x=>crypto.createHash("sha256").update(x).digest("hex");
const hex=x=>typeof x==="string"&&/^[0-9a-f]{64}$/.test(x);
const requireFact=(v,m)=>{if(!v)throw Error("OECL_GRAPH_EVIDENCE_REJECTED:"+m)};
const locEq=(a,b)=>a?.unit===b?.unit&&a?.line===b?.line&&a?.start===b?.start;
function projectGraphBundle(graph,discovery,report,run){
  requireFact(graph?.schemaVersion==="OECL_SOLIDITY_COMPILER_AST_GRAPH_V1"&&
    graph.status==="STRUCTURAL_OBSERVATION_ONLY"&&graph.scientificPolarity==="INCONCLUSIVE"&&
    graph.candidateAdmission==="NOT_ADMITTED"&&Array.isArray(graph.functions)&&
    Array.isArray(graph.contracts)&&Array.isArray(graph.sources)&&
    Array.isArray(graph.edges)&&Array.isArray(graph.guards)&&
    Array.isArray(graph.writes)&&Array.isArray(graph.modifiers),"GRAPH_INVALID");
  requireFact(discovery?.schemaVersion==="OECL_GENERIC_AST_HYPOTHESES_V1"&&
    discovery.verdict==="INCONCLUSIVE"&&discovery.candidateAdmission==="NOT_ADMITTED"&&
    Array.isArray(discovery.errors)&&discovery.errors.length===0&&
    Array.isArray(discovery.primarySources)&&discovery.primarySources.length===2&&
    Array.isArray(discovery.hypotheses),"DISCOVERY_INVALID");
  requireFact(report?.schemaVersion==="OECL_OPEN_GENERIC_AST_RESULT_V1"&&
    report.scientificVerdict==="INCONCLUSIVE"&&report.candidateAdmission==="NOT_ADMITTED"&&
    report.sourceOnly===true&&report.evmExecuted===false&&
    Array.isArray(report.selected)&&report.selected.length===2&&
    Array.isArray(report.scientificLimitations),"REPORT_INVALID");
  const graphSha256=hash(JSON.stringify(graph)),discoverySha256=hash(JSON.stringify(discovery));
  requireFact(report.graphSha256===graphSha256&&
    discovery.sourceGraphSha256===graphSha256&&
    report.hypothesisArtifactSha256===discoverySha256,"ARTIFACT_DIGEST_MISMATCH");
  assert.deepStrictEqual(report.hypotheses,discovery.hypotheses);
  requireFact(report.counts?.sourceUnits===graph.sources.length&&
    report.counts?.contracts===graph.contracts.length&&
    report.counts?.callableFunctions===graph.functions.length&&
    report.counts?.hypotheses===discovery.hypotheses.length&&
    report.compilerVersion===graph.compilerVersion,"REPORT_COUNTS_MISMATCH");
  requireFact(Number.isSafeInteger(run?.runId)&&run.runId>0&&
    /^[a-f0-9]{40}$/.test(run.workflowSha)&&
    ["CI_REGRESSION","CONTROLLED_REQUEST"].includes(run.mode),"RUN_IDENTITY_INVALID");
  const sources=new Map(graph.sources.map(s=>[s.unit,s.sha256]));
  const funcs=new Map(graph.functions.map(f=>[f.id,f]));
  const mods=new Map(graph.modifiers.map(m=>[m.id,m]));
  const contracts=new Map(graph.contracts.map(c=>[c.id,c]));
  const selected=report.selected.map((s,i)=>{
    const p=discovery.primarySources[i];
    requireFact(p?.id===s.id&&p.sourceUnit===s.sourceUnit&&
      p.sourceSha256===s.sourceSha256&&sources.get(s.sourceUnit)===s.sourceSha256&&
      hex(s.sourceSha256)&&typeof p.primaryContract==="string","SOURCE_NOT_ATTESTED");
    const matches=graph.contracts.filter(c=>c.unit===s.sourceUnit&&
      c.name===p.primaryContract&&c.kind==="contract");
    requireFact(matches.length===1,"PRIMARY_CONTRACT_MISSING");
    return {id:s.id,kind:s.kind,repository:s.repository,revision:s.revision,
      sourceUnit:s.sourceUnit,sourceSha256:s.sourceSha256,
      primaryContract:p.primaryContract,contractId:matches[0].id,
      exportedFunctionCount:p.exportedFunctionCount};
  });
  requireFact(selected[0].id!==selected[1].id,"DUPLICATE_SELECTION");
  const nodes=new Map(),edges=new Map(),focusIds=new Map();
  const node=(id,kind,label,side,extra={})=>{
    if(!nodes.has(id))nodes.set(id,{id,kind,label:String(label).slice(0,110),side,...extra});
    return id;
  };
  const edge=(from,to,kind)=>{
    if(from===to||!from||!to)return;
    const id=kind+"|"+from+"|"+to;
    if(!edges.has(id))edges.set(id,{id,from,to,kind});
  };
  selected.forEach((s,i)=>node("c:"+s.contractId,"CONTRACT",s.primaryContract,i,
    {unit:s.sourceUnit,line:1,sourceSha256:s.sourceSha256}));
  const addFunction=(id,side)=>{
    const f=funcs.get(id)||mods.get(id);
    requireFact(f&&f.location&&hex(sources.get(f.location.unit)),"UNKNOWN_AST_FUNCTION");
    node("f:"+id,mods.has(id)?"MODIFIER":"FUNCTION",f.name||"constructor",side,
      {unit:f.location.unit,line:f.location.line,sourceSha256:sources.get(f.location.unit),
        contract:f.contractName,visibility:f.visibility});
    return f;
  };
  const hypotheses=[];
  for(const h of discovery.hypotheses){
    requireFact(/^AST-HYP-[a-f0-9]{24}$/.test(h?.hypothesisId||"")&&
      h.status==="SOURCE_ONLY_UNEVALUATED"&&h.candidateAdmission==="NOT_ADMITTED"&&
      h.scientificVerdict==="INCONCLUSIVE"&&Array.isArray(h.evidence)&&h.evidence.length===2&&
      ["SHARED_STANDARD_INHERITANCE","POTENTIAL_COUPLED_STATE_DECREASE"].includes(h.kind),"HYPOTHESIS_INVALID");
    requireFact(h.evidence.every((e,i)=>e.participant===selected[i].id),
      "HYPOTHESIS_PARTICIPANTS_CHANGED");
    const hid="h:"+h.hypothesisId;
    node(hid,"HYPOTHESIS",h.kind,-1);
    const evidence=[];
    for(let i=0;i<2;i++){
      const e=h.evidence[i];
      if(h.kind==="SHARED_STANDARD_INHERITANCE"){
        requireFact(e.contract===selected[i].primaryContract&&
          e.sourceUnit===selected[i].sourceUnit&&e.sourceSha256===selected[i].sourceSha256,
          "INHERITANCE_SOURCE_MISMATCH");
        const root=contracts.get(selected[i].contractId);
        for(const name of h.bases||[]){
          requireFact(["ERC20","ERC721","ERC1155"].includes(name)&&
            graph.contracts.some(c=>c.name===name&&root.linearizedBaseContracts?.includes(c.id)),
            "INHERITANCE_NOT_AST_RESOLVED");
          const bid="b:"+i+":"+name;
          node(bid,"INHERITED_BASE",name,i);edge("c:"+root.id,bid,"INHERITS");edge(bid,hid,"HYPOTHESIZES");
        }
        evidence.push({participant:selected[i].id,bases:h.bases||[]});
      }else{
        const entry=e.publicEntrypoint,delta=e.stateDecrease,path=e.callPath;
        requireFact(entry&&delta&&Array.isArray(path)&&path.length>=1&&path.length<=20&&
          entry.sourceSha256===sources.get(entry.unit)&&delta.sourceSha256===sources.get(delta.unit),
          "HYPOTHESIS_SOURCE_MISMATCH");
        const first=funcs.get(path[0]),last=funcs.get(path.at(-1));
        requireFact(first?.name===entry.name&&locEq(first.location,entry.location)&&
          ["public","external"].includes(first.visibility)&&last&&
          graph.writes.some(w=>w.owner===last.id&&w.kind==="DECREASE"&&
            w.state===delta.state&&locEq(w.location,delta.location)),
          "UNSUPPORTED_FUNCTION_OR_STATE_DECREASE");
        for(let j=0;j<path.length;j++){
          const f=addFunction(path[j],i);focusIds.set(f.id,i);
          if(j===0)edge("c:"+selected[i].contractId,"f:"+f.id,"EXPOSES");
          else{
            requireFact(graph.edges.some(x=>x.kind==="CALLS"&&x.from===path[j-1]&&x.to===f.id),
              "INVENTED_FUNCTION_CALL_EDGE");
            edge("f:"+path[j-1],"f:"+f.id,"CALLS");
          }
        }
        const sid="s:"+i+":"+delta.unit+":"+delta.state+":"+delta.location.start;
        node(sid,"STATE_DECREASE",delta.state,i,
          {unit:delta.unit,line:delta.location.line,sourceSha256:delta.sourceSha256});
        edge("f:"+last.id,sid,"DECREASES");edge(sid,hid,"HYPOTHESIZES");
        evidence.push({participant:selected[i].id,publicEntrypoint:entry.name,
          state:delta.state,unit:delta.unit,line:delta.location.line,callPath:path});
      }
    }
    hypotheses.push({id:h.hypothesisId,kind:h.kind,
      finding:String(h.finding).slice(0,500),status:h.status,
      scientificVerdict:h.scientificVerdict,candidateAdmission:h.candidateAdmission,
      evidence,constraints:(h.constraints||[]).map(x=>String(x).slice(0,400))});
  }
  selected.forEach((s,i)=>{
    const exposed=graph.functions.filter(f=>f.contractId===s.contractId&&
      f.kind==="function"&&f.implemented!==false&&
      ["public","external"].includes(f.visibility)).slice(0,7);
    for(const f of exposed){
      addFunction(f.id,i);edge("c:"+s.contractId,"f:"+f.id,"EXPOSES");focusIds.set(f.id,i);
    }
  });
  const guards=[];
  for(const [fid,side] of focusIds){
    for(const m of graph.edges.filter(e=>e.kind==="APPLIES_MODIFIER"&&e.from===fid).slice(0,6)){
      if(!mods.has(m.to))continue;
      addFunction(m.to,side);edge("f:"+fid,"f:"+m.to,"MODIFIED_BY");
    }
    for(const g of graph.guards.filter(g=>g.owner===fid).slice(0,10)){
      requireFact(g.location&&sources.has(g.location.unit)&&typeof g.condition==="string",
        "UNATTESTED_GUARD");
      const gid="g:"+fid+":"+g.location.start;
      node(gid,"GUARD",g.condition.slice(0,66),side,
        {unit:g.location.unit,line:g.location.line,sourceSha256:sources.get(g.location.unit)});
      edge("f:"+fid,gid,"REQUIRES");
      guards.push({participant:selected[side].id,functionId:fid,
        condition:g.condition.slice(0,300),sourceUnit:g.location.unit,
        line:g.location.line,kind:g.kind});
    }
  }
  requireFact(nodes.size<=95&&edges.size<=140,"VIEW_GRAPH_TOO_LARGE");
  return {schemaVersion:"OECL_VERIFIED_AST_GRAPH_VIEW_V1",
    scientificVerdict:"INCONCLUSIVE",candidateAdmission:"NOT_ADMITTED",
    sourceOnly:true,evmExecuted:false,
    provenance:{...run,graphSha256,discoverySha256,
      sourceReportSha256:hash(JSON.stringify(report)),
      url:"https://github.com/ten-io-meta/open-erc-composition-laboratory/actions/runs/"+run.runId},
    selected:selected.map(({contractId,...item})=>item),counts:report.counts,
    discoveryReason:report.discoveryReason,
    hypotheses,guards,nodes:[...nodes.values()],edges:[...edges.values()],
    unresolvedCount:graph.unresolved?.length||0,
    limitations:report.scientificLimitations.map(x=>String(x).slice(0,400))};
}
module.exports={projectGraphBundle};
