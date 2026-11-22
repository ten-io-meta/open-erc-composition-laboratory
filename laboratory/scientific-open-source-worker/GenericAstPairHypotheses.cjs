"use strict";
/*
 * Generalized source-only composition hypothesis explorer.
 * Consumes compiler-resolved Solidity AST graph facts; does not infer from
 * protocol IDs, regex-scanned source expressions, or EVM outcomes.
 *
 * A source path containing CALLS edges is not a proof of executable path:
 * proxy dispatch, guards, contradictory modifiers and asset custody remain
 * unknown until the independent scientific evaluator checks them.
 */
const crypto=require("node:crypto");
const digest=x=>crypto.createHash("sha256").update(x).digest("hex");
const validSha=x=>typeof x==="string"&&/^[0-9a-f]{64}$/.test(x);
function discoverGenericPair(graph, participants){
  const failed=reason=>({schemaVersion:"OECL_GENERIC_AST_HYPOTHESES_V1",
    verdict:"INCONCLUSIVE",candidateAdmission:"NOT_ADMITTED",hypotheses:[],
    reason,errors:[reason]});
  if(graph?.schemaVersion!=="OECL_SOLIDITY_COMPILER_AST_GRAPH_V1"||
      graph.status!=="STRUCTURAL_OBSERVATION_ONLY"||
      graph.scientificPolarity!=="INCONCLUSIVE"||
      graph.candidateAdmission!=="NOT_ADMITTED"||
      !Array.isArray(graph.contracts)||!Array.isArray(graph.functions)||
      !Array.isArray(graph.edges)||!Array.isArray(graph.writes)||
      !Array.isArray(graph.sources)||!Array.isArray(participants)||
      participants.length!==2||participants[0].id===participants[1].id)
    return failed("INVALID_AST_GRAPH_OR_PAIR");
  const hashes=new Map(graph.sources.map(s=>[s.unit,s.sha256]));
  const units=[],roots=[];
  for(const participant of participants){
    if(!participant||typeof participant.id!=="string"||
        typeof participant.contract!=="string"||typeof participant.unit!=="string"||
        !validSha(hashes.get(participant.unit)))
      return failed("PARTICIPANT_SOURCE_NOT_ATTESTED");
    const found=graph.contracts.filter(c=>c.unit===participant.unit&&
      c.name===participant.contract && c.kind==="contract");
    if(found.length!==1)return failed("PRIMARY_CONTRACT_AMBIGUOUS_OR_MISSING");
    units.push(participant.unit);roots.push(found[0]);
  }
  const funcs=new Map(graph.functions.map(f=>[f.id,f]));
  const links=new Map();
  for(const edge of graph.edges.filter(e=>e.kind==="CALLS")){
    if(!funcs.has(edge.from)||!funcs.has(edge.to))continue;
    const nodes=links.get(edge.from)||[];
    nodes.push(edge.to);links.set(edge.from,nodes);
  }
  const reachable=(start,target)=>{
    const seen=new Set([start]),queue=[[start]];
    while(queue.length){
      const path=queue.shift();
      if(path.length>20)continue;
      const last=path[path.length-1];
      if(last===target)return path;
      for(const next of links.get(last)||[]){
        if(seen.has(next))continue;
        seen.add(next);queue.push([...path,next]);
      }
    }
    return null;
  };
  const profiles=roots.map((root,i)=>{
    const inherited=new Set([root.id,...(root.linearizedBaseContracts||[])]);
    const exported=graph.functions.filter(f=>inherited.has(f.contractId)&&
      f.kind==="function"&&f.implemented &&
      ["public","external"].includes(f.visibility));
    const writes=graph.writes.filter(w=>w.kind==="DECREASE"&&
      funcs.has(w.owner)&&inherited.has(funcs.get(w.owner).contractId));
    const effects=[];
    for(const w of writes){
      const target=funcs.get(w.owner);
      for(const entry of exported){
        const path=reachable(entry.id,target.id);
        if(!path)continue;
        const own=graph.sources.find(s=>s.unit===target.unit);
        if(!own||!validSha(own.sha256))continue;
        effects.push({
          publicEntrypoint:{name:entry.name,unit:entry.unit,
            location:entry.location,sourceSha256:hashes.get(entry.unit)},
          stateDecrease:{state:w.state,unit:target.unit,
            location:w.location,sourceSha256:own.sha256},
          compilerResolvedCallPath:path
        });
      }
    }
    const dedup=new Map(effects.map(e=>[
      e.publicEntrypoint.name+"|"+e.stateDecrease.unit+"|"+
        e.stateDecrease.state+"|"+e.stateDecrease.location?.start,e]));
    const baseNames=[...new Set(graph.contracts.filter(c=>inherited.has(c.id))
      .map(c=>c.name))].sort();
    return {id:participants[i].id,sourceUnit:participants[i].unit,
      sourceSha256:hashes.get(participants[i].unit),
      primaryContract:participants[i].contract,
      inheritedContractNames:baseNames,exportedFunctionCount:exported.length,
      // Report root-local state changes first, without silently erasing the
      // inherited state effects that the compiler also observed.
      observedStateDecreases:[...dedup.values()]
        .sort((left,right)=>
          Number(right.stateDecrease.unit===participants[i].unit)-
          Number(left.stateDecrease.unit===participants[i].unit)||
          left.publicEntrypoint.name.localeCompare(right.publicEntrypoint.name)||
          left.stateDecrease.state.localeCompare(right.stateDecrease.state))
        .slice(0,40)};
  });
  const hypotheses=[];
  const common=profiles[0].inheritedContractNames
    .filter(n=>profiles[1].inheritedContractNames.includes(n))
    .filter(n=>n==="ERC20"||n==="ERC721"||n==="ERC1155");
  if(common.length){
    hypotheses.push({
      kind:"SHARED_STANDARD_INHERITANCE",
      finding:"Both selected Solidity contracts share a compiler-resolved standard base.",
      bases:common,evidence:profiles.map(p=>({
        participant:p.id,contract:p.primaryContract,sourceUnit:p.sourceUnit,
        sourceSha256:p.sourceSha256})),
      constraints:["Same inherited standard is not proof of cross-contract interoperability.",
        "Capabilities and access restrictions must be evaluated per implementation."]
    });
  }
  const a=profiles[0].observedStateDecreases;
  const b=profiles[1].observedStateDecreases;
  if(a.length&&b.length){
    hypotheses.push({
      kind:"POTENTIAL_COUPLED_STATE_DECREASE",
      finding:"Each source has a public entry point with a compiler-resolved path to a state decrease.",
      evidence:[{
        participant:profiles[0].id,publicEntrypoint:a[0].publicEntrypoint,
        stateDecrease:a[0].stateDecrease,callPath:a[0].compilerResolvedCallPath
      },{
        participant:profiles[1].id,publicEntrypoint:b[0].publicEntrypoint,
        stateDecrease:b[0].stateDecrease,callPath:b[0].compilerResolvedCallPath
      }],
      constraints:[
        "A source call graph does not establish that either entrypoint is executable.",
        "No custody, permission, amount equivalence or atomic coordinator is proven.",
        "State variable decreases do not imply interchangeable asset units.",
        "A paired experimental coordinator must be proposed and tested separately."
      ]
    });
  }
  const provenanced=hypotheses.map(h=>({
    ...h,
    hypothesisId:"AST-HYP-"+digest(JSON.stringify({
      kind:h.kind,evidence:h.evidence,
      inputSha:profiles.map(p=>p.sourceSha256)
    })).slice(0,24),
    status:"SOURCE_ONLY_UNEVALUATED",
    candidateAdmission:"NOT_ADMITTED",
    scientificVerdict:"INCONCLUSIVE"
  }));
  return {
    schemaVersion:"OECL_GENERIC_AST_HYPOTHESES_V1",
    verdict:"INCONCLUSIVE",candidateAdmission:"NOT_ADMITTED",
    sourceGraphSha256:digest(JSON.stringify(graph)),
    primarySources:profiles,
    hypotheses:provenanced,errors:[],
    reason:provenanced.length?"STRUCTURAL_HYPOTHESES_REQUIRE_EXPERIMENTS":
      "NO_ADMISSIBLE_SOURCE_RELATION_DISCOVERED",
    limitations:[
      "No Solidity or third-party package code was executed.",
      "Only compiler-resolved AST relationships and selected root contracts are considered.",
      "Reachability is approximate; guards, modifiers, dynamic dispatch and external environment are not proven.",
      "Hypotheses require independent constraints and EVM evidence before scientific admission.",
      "Unobserved source relations remain inconclusive, not incompatible."
    ]
  };
}
module.exports={discoverGenericPair};
