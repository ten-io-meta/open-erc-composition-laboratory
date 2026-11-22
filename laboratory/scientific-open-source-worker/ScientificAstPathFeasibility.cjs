"use strict";
/**
 * Conservative AST-only path feasibility screen. This is NOT a theorem prover:
 * it may prove a local, branch-limited impossibility but never declares a
 * reachable execution, scientific SUPPORTS, or a newly admitted candidate.
 *
 * Evidence comes from solc AST node ids, modifiers, typed guard expressions
 * and statement offsets. Source strings are diagnostic only, not parsed.
 */
const crypto=require("node:crypto");
const digest=x=>crypto.createHash("sha256").update(x).digest("hex");
const range=n=>{
  const [start,length]=String(n?.src||"0:0:0").split(":").map(Number);
  return {start,length,end:start+length};
};
const contains=(n,offset)=>{
  const r=range(n);
  return r.start<=offset&&offset<r.end;
};
const cmpSwap={">":"<",">=":"<=","<":">","<=":">=","==":"==","!=":"!="};
const cmpInvert={">":"<=",">=":"<","<":">=","<=":">","==":"!=","!=":"=="};
function collectAst(buildInfo,graph){
  if(!buildInfo?.input?.sources||!buildInfo.output?.sources)throw Error("AST_BUILD_INFO_MISSING");
  const nodes=new Map(),sources=new Map();
  function walk(n){
    if(!n||typeof n!=="object")return;
    if(Array.isArray(n)){for(const c of n)walk(c);return;}
    if(Number.isSafeInteger(n.id)&&n.nodeType)nodes.set(n.id,n);
    for(const [name,v] of Object.entries(n)){
      if(name!=="documentation"&&v&&typeof v==="object")walk(v);
    }
  }
  for(const src of graph.sources||[]){
    const content=buildInfo.input.sources[src.unit]?.content;
    const ast=buildInfo.output.sources[src.unit]?.ast;
    if(typeof content!=="string"||!ast||ast.nodeType!=="SourceUnit"||
       digest(content)!==src.sha256)throw Error("AST_SOURCE_HASH_MISMATCH:"+src.unit);
    sources.set(src.unit,{content,sha256:src.sha256});
    walk(ast);
  }
  if(sources.size!==Object.keys(buildInfo.output.sources).length)
    throw Error("AST_SOURCE_SET_MISMATCH");
  return {nodes,sources};
}
function literal(n){
  if(n?.nodeType!=="Literal")return null;
  if(n.kind==="bool")return {type:"bool",value:n.value==="true"};
  if(n.kind==="number"&&typeof n.value==="string"&&
     /^(0|[1-9][0-9]*|0x[0-9a-fA-F]+)$/.test(n.value)&&!n.subdenomination)
    return {type:"number",value:BigInt(n.value).toString()};
  return null;
}
function variable(n){
  if(n?.nodeType!=="Identifier"||!Number.isSafeInteger(n.referencedDeclaration)||
     n.referencedDeclaration<0)return null;
  const type=String(n.typeDescriptions?.typeString||"");
  if(/^u?int(?:[0-9]+)?$/.test(type))return {id:n.referencedDeclaration,type:"number",name:n.name};
  if(type==="bool")return {id:n.referencedDeclaration,type:"bool",name:n.name};
  return null;
}
function expressionAtoms(node,positive=true){
  if(node?.nodeType==="UnaryOperation"&&node.operator==="!")
    return expressionAtoms(node.subExpression,!positive);
  if(node?.nodeType==="BinaryOperation" &&
     ((positive&&node.operator==="&&")||(!positive&&node.operator==="||"))){
    const a=expressionAtoms(node.leftExpression,positive);
    const b=expressionAtoms(node.rightExpression,positive);
    return a&&b?[...a,...b]:null;
  }
  if(node?.nodeType==="BinaryOperation"&&cmpSwap[node.operator]){
    let sym=variable(node.leftExpression),value=literal(node.rightExpression);
    let op=node.operator;
    if(!sym||!value){
      sym=variable(node.rightExpression);value=literal(node.leftExpression);
      op=cmpSwap[op];
    }
    if(!sym||!value||sym.type!==value.type)return null;
    if(sym.type==="bool"&&!["==","!="].includes(op))return null;
    return [{symbol:sym.id,label:sym.name,type:sym.type,
      op:positive?op:cmpInvert[op],value:value.value}];
  }
  const v=variable(node);
  if(v?.type==="bool")return [{symbol:v.id,label:v.name,type:"bool",
    op:"==",value:positive}];
  const constant=literal(node);
  if(constant?.type==="bool")return [{constant:constant.value===positive}];
  return null;
}
function contradiction(guards){
  const model=new Map();
  for(const guard of guards){
    for(const a of guard.atoms||[]){
      if("constant" in a){
        if(a.constant===false)return {kind:"LITERAL_FALSE_GUARD",facts:[guard]};
        continue;
      }
      const key=a.symbol+":"+a.type;
      if(!model.has(key))model.set(key,{type:a.type,lower:null,upper:null,
        equals:null,excludes:new Set(),facts:[]});
      const state=model.get(key);
      state.facts.push(guard);
      if(a.type==="bool"){
        const val=a.op==="=="?a.value:!a.value;
        if(state.equals!==null&&state.equals!==val)
          return {kind:"CONTRADICTORY_BOOLEAN_GUARDS",symbol:a.label,facts:state.facts};
        if(state.excludes.has(String(val)))
          return {kind:"CONTRADICTORY_BOOLEAN_GUARDS",symbol:a.label,facts:state.facts};
        state.equals=val;
      }else{
        const n=BigInt(a.value);
        if(a.op==="==") {
          if(state.equals!==null&&state.equals!==n)
            return {kind:"CONTRADICTORY_NUMERIC_GUARDS",symbol:a.label,facts:state.facts};
          state.equals=n;
        }else if(a.op==="!=")state.excludes.add(n.toString());
        else if(a.op===">"||a.op===">="){
          const low=a.op===">"?n+1n:n;
          if(state.lower===null||low>state.lower)state.lower=low;
        }else if(a.op==="<"||a.op==="<="){
          const high=a.op==="<"?n-1n:n;
          if(state.upper===null||high<state.upper)state.upper=high;
        }
        if(state.lower!==null&&state.upper!==null&&state.lower>state.upper)
          return {kind:"CONTRADICTORY_INTERVAL_GUARDS",symbol:a.label,facts:state.facts};
        if(state.equals!==null&&
           ((state.lower!==null&&state.equals<state.lower)||
            (state.upper!==null&&state.equals>state.upper)||
            state.excludes.has(state.equals.toString())))
          return {kind:"CONTRADICTORY_NUMERIC_GUARDS",symbol:a.label,facts:state.facts};
        if(state.lower!==null&&state.upper!==null&&state.lower===state.upper&&
           state.excludes.has(state.lower.toString()))
          return {kind:"EXCLUDED_ONLY_REMAINING_VALUE",symbol:a.label,facts:state.facts};
      }
    }
  }
  return null;
}
function exprReachesPermission(node){
  let auth=false,environment=false,unknownCall=false;
  function walk(n){
    if(!n||typeof n!=="object")return;
    if(Array.isArray(n)){n.forEach(walk);return;}
    if(n.nodeType==="MemberAccess"&&
       n.memberName==="sender"&&n.expression?.nodeType==="Identifier"&&
       n.expression.name==="msg")auth=true;
    if(n.nodeType==="MemberAccess"&&
       ["origin","balance","value"].includes(n.memberName))environment=true;
    if(n.nodeType==="FunctionCall"){
      const e=n.expression;
      const name=e?.name||e?.memberName||"";
      if(["_msgSender","ownerOf","isApprovedForAll","hasRole","getRoleAdmin"].includes(name))auth=true;
      unknownCall=true;
    }
    for(const [k,v] of Object.entries(n))
      if(k!=="documentation"&&v&&typeof v==="object")walk(v);
  }
  walk(node);return {auth,environment,unknownCall};
}
function simpleAbort(n){
  if(!n)return false;
  if(["RevertStatement","Return"].includes(n.nodeType))return true;
  if(n.nodeType==="Block"&&n.statements?.length===1)return simpleAbort(n.statements[0]);
  return false;
}
function recognizedGuard(stmt){
  if(stmt?.nodeType==="ExpressionStatement"&&
     stmt.expression?.nodeType==="FunctionCall"&&
     ["require","assert"].includes(stmt.expression.expression?.name)){
    const call=stmt.expression;
    if((call.arguments?.length||0)<1)return null;
    const pureMessage=(call.arguments?.length||0)<=1||
      call.arguments.slice(1).every(x=>x?.nodeType==="Literal");
    return {kind:call.expression.name.toUpperCase(),expr:call.arguments[0],
      rawNode:stmt,immutableCondition:pureMessage};
  }
  // An else branch may mutate the tested variable on the continuing path.
  // Without proving that branch side-effect free, this is not a pure guard.
  if(stmt?.nodeType==="IfStatement"&&!stmt.falseBody&&simpleAbort(stmt.trueBody)){
    return {kind:"IF_ABORTS",expr:stmt.condition,rawNode:stmt,
      positive:false,immutableCondition:true};
  }
  return null;
}
function diagnostic(g,unit,sources){
  const loc=range(g.rawNode),src=sources.get(unit);
  const expr=range(g.expr);
  const text=src.content.slice(expr.start,expr.end);
  const line=src.content.slice(0,loc.start).split("\n").length;
  const atom=g.immutableCondition===false?null:expressionAtoms(g.expr,g.positive!==false);
  return {kind:g.kind,sourceUnit:unit,sourceSha256:src.sha256,line,
    offset:loc.start,condition:text.slice(0,300),
    atoms:atom||[],symbolicallyModeled:atom!==null,
    ...exprReachesPermission(g.expr)};
}
function analyzeBeforeEvent(def,eventOffset,unit,sources){
  const result={guards:[],blockers:[],unknowns:[],permissionRequired:false,
    environmentalDependency:false};
  if(!def?.body||def.body.nodeType!=="Block"){
    result.unknowns.push("BODY_NOT_STRAIGHT_LINE_BLOCK");
    return result;
  }
  const statements=def.body.statements||[];
  const targetIndex=statements.findIndex(s=>contains(s,eventOffset));
  if(targetIndex<0){
    result.unknowns.push("EVENT_OUTSIDE_COMPILER_BODY");
    return result;
  }
  let segment=[];
  for(let i=0;i<targetIndex;i++){
    const stmt=statements[i];
    if(stmt.nodeType==="Return"||stmt.nodeType==="RevertStatement"){
      result.blockers.push({kind:"UNCONDITIONAL_EXIT_BEFORE_TARGET",
        sourceUnit:unit,offset:range(stmt).start});
      break;
    }
    const recognized=recognizedGuard(stmt);
    if(!recognized){segment=[];continue;}
    const fact=diagnostic(recognized,unit,sources);
    result.guards.push(fact);
    result.permissionRequired ||= fact.auth;
    result.environmentalDependency ||= fact.environment;
    // Only adjacent pure comparisons are combined. Any stateful call,
    // variable assignment or unmodeled statement ends a proof segment.
    if(!fact.symbolicallyModeled||fact.unknownCall){
      segment=[];
      if(!fact.symbolicallyModeled)result.unknowns.push("UNMODELED_GUARD_EXPR");
      continue;
    }
    segment.push(fact);
    const conflict=contradiction(segment);
    if(conflict){
      result.blockers.push({kind:conflict.kind,symbol:conflict.symbol||null,
        facts:conflict.facts.map(f=>({kind:f.kind,sourceUnit:f.sourceUnit,
          line:f.line,condition:f.condition}))});
      break;
    }
  }
  if(statements[targetIndex].nodeType!=="ExpressionStatement"&&
     statements[targetIndex].nodeType!=="VariableDeclarationStatement")
    result.unknowns.push("EVENT_IN_NESTED_OR_CONDITIONAL_STATEMENT");
  return result;
}
function placeholders(node){
  let found=0;
  function walk(n){
    if(!n||typeof n!=="object")return;
    if(Array.isArray(n)){for(const x of n)walk(x);return;}
    if(n.nodeType==="PlaceholderStatement")found++;
    for(const [k,v] of Object.entries(n))
      if(k!=="documentation"&&v&&typeof v==="object")walk(v);
  }
  walk(node);return found;
}
function evaluateParticipant(e,graph,nodes,sources){
  const ids=e.callPath;
  const fails=[],parts=[],flags=new Set();
  if(!Array.isArray(ids)||ids.length<1||ids.length>20)
    throw Error("PATH_ID_CHAIN_INVALID");
  for(let i=0;i<ids.length;i++){
    const id=ids[i],def=nodes.get(id),fn=graph.functions.find(f=>f.id===id);
    if(!def||!fn||def.nodeType!=="FunctionDefinition"||fn.id!==def.id)
      throw Error("PATH_FUNCTION_NOT_COMPILER_RESOLVED");
    const targets=i<ids.length-1?
      graph.edges.filter(x=>x.kind==="CALLS"&&x.from===id&&x.to===ids[i+1]):
      graph.writes.filter(x=>x.owner===id&&x.kind==="DECREASE"&&
        x.state===e.stateDecrease?.state&&
        x.location?.start===e.stateDecrease?.location?.start);
    if(targets.length===0)throw Error("PATH_EDGE_NOT_COMPILER_RESOLVED");
    const variants=targets.map(t=>
      analyzeBeforeEvent(def,t.location.start,fn.unit,sources));
    const modifiers=[];
    for(const edge of graph.edges.filter(x=>x.kind==="APPLIES_MODIFIER"&&x.from===id)){
      const modifier=nodes.get(edge.to);
      const meta=graph.modifiers.find(m=>m.id===edge.to);
      if(!modifier||!meta)throw Error("INHERITED_MODIFIER_UNRESOLVED");
      const count=placeholders(modifier.body);
      if(modifier.body && count===0){
        fails.push({kind:"MODIFIER_SUPPRESSES_FUNCTION_BODY",
          modifierId:edge.to,sourceUnit:meta.unit,line:meta.location?.line});
      }
      if(count!==1)flags.add("MODIFIER_PLACEHOLDER_CARDINALITY_UNRESOLVED");
      if(count>=1){
        let first;
        function find(n){
          if(first!==undefined||!n||typeof n!=="object")return;
          if(n.nodeType==="PlaceholderStatement"){first=range(n).start;return;}
          for(const [k,v] of Object.entries(n))
            if(k!=="documentation"&&v&&typeof v==="object"){
              if(Array.isArray(v))v.forEach(find);else find(v);
            }
        }
        find(modifier.body);
        const analysis=analyzeBeforeEvent(modifier,first,meta.unit,sources);
        if(analysis.blockers.length)fails.push(...analysis.blockers);
        if(analysis.permissionRequired)flags.add("MODIFIER_AUTHORIZATION_GATED");
        if(analysis.unknowns.length)flags.add("MODIFIER_CONTEXT_NOT_FULLY_MODELED");
        modifiers.push({modifierId:edge.to,name:meta.name,sourceUnit:meta.unit,
          inherited:meta.contractId!==fn.contractId,
          placeholderCount:count,guards:analysis.guards,
          unknowns:analysis.unknowns});
      }
    }
    const variantBlocking=variants.length>0&&variants.every(v=>v.blockers.length>0);
    if(variantBlocking)fails.push({kind:"ALL_RESOLVED_SITES_BLOCKED",
      functionId:id,sites:variants.map(v=>v.blockers)});
    if(variants.some(v=>v.permissionRequired))flags.add("AUTHORIZATION_GATED");
    if(variants.some(v=>v.environmentalDependency))flags.add("ENVIRONMENT_DEPENDENT");
    if(variants.some(v=>v.unknowns.length))flags.add("SOURCE_PATH_HAS_UNMODELED_CONTEXT");
    if(graph.unresolved?.some(u=>u.owner===id))flags.add("UNRESOLVED_CALL_OR_MODIFIER");
    if(graph.externalCalls?.some(c=>c.owner===id))flags.add("EXTERNAL_CALLBACK_DEPENDENCY");
    parts.push({functionId:id,functionName:fn.name,unit:fn.unit,
      variantCount:variants.length,variants,modifiers});
  }
  return {participant:e.participant,sourcePath:ids,
    pathScreen:fails.length?"PROVEN_BLOCKED_WITHIN_MODELED_AST_PATH":"NOT_PROVEN_EXECUTABLE",
    blockers:fails,flags:[...flags].sort(),functions:parts,
    pathEvidenceScope:"SOLC_AST_LOCAL_NO_EVM_EXECUTION"};
}
function evaluateFeasibility(buildInfo,graph,discovery){
  if(graph?.schemaVersion!=="OECL_SOLIDITY_COMPILER_AST_GRAPH_V1"||
     graph.scientificPolarity!=="INCONCLUSIVE"||graph.candidateAdmission!=="NOT_ADMITTED"||
     discovery?.schemaVersion!=="OECL_GENERIC_AST_HYPOTHESES_V1"||
     discovery.verdict!=="INCONCLUSIVE"||discovery.candidateAdmission!=="NOT_ADMITTED"||
     discovery.sourceGraphSha256!==digest(JSON.stringify(graph)))
    throw Error("SCIENTIFIC_PROVENANCE_INVALID");
  const {nodes,sources}=collectAst(buildInfo,graph);
  const hypotheses=[];
  for(const h of discovery.hypotheses||[]){
    if(h.status!=="SOURCE_ONLY_UNEVALUATED"||h.candidateAdmission!=="NOT_ADMITTED")
      throw Error("HYPOTHESIS_ADMISSION_FORGED");
    if(h.kind!=="POTENTIAL_COUPLED_STATE_DECREASE"){
      hypotheses.push({hypothesisId:h.hypothesisId,kind:h.kind,
        pathScreen:"NO_EXECUTABLE_ROUTE_SPECIFIED",participants:[],
        evmPlan:{status:"DESIGN_ONLY_NOT_EXECUTED",reason:"NO_ACTION_ROUTE"}});
      continue;
    }
    if(h.evidence?.length!==2)throw Error("PARTICIPANT_EVIDENCE_MISSING");
    const participants=h.evidence.map(e=>evaluateParticipant(e,graph,nodes,sources));
    hypotheses.push({hypothesisId:h.hypothesisId,kind:h.kind,
      pathScreen:participants.some(x=>x.blockers.length)?
        "AT_LEAST_ONE_MODELED_PATH_BLOCKED":"NOT_PROVEN_EXECUTABLE",
      participants,
      evmPlan:{
        status:"DESIGN_ONLY_NOT_EXECUTED",
        requires:"INDEPENDENT_DEPLOYABLE_ADAPTER_AND_PINNED_COMPILER",
        scenarios:["authorized-and-funded-positive","unauthorized-caller-negative",
          "unsatisfied-asset-preconditions-negative",
          "unmet-modifier-or-guard-negative",
          "atomic-rollback-on-failed-second-leg",
          "hostile-receiver-and-callback-negative",
          "repeat-operation-and-state-invariant-check"],
        invariants:["Per-source state changes checked before and after transaction",
          "No unintended increase in token supply or redemption liabilities",
          "Reverted transaction leaves both protocol states unchanged",
          "EVM receipt with exact source revision, compiler and gas context"]
      }});
  }
  return {schemaVersion:"OECL_AST_PATH_FEASIBILITY_V1",
    sourceGraphSha256:digest(JSON.stringify(graph)),
    discoverySha256:digest(JSON.stringify(discovery)),
    scientificVerdict:"INCONCLUSIVE",candidateAdmission:"NOT_ADMITTED",
    evmExecuted:false,pathAnalysisScope:"SOURCE_ONLY_PARTIAL_CONSTRAINT_MODEL",
    hypotheses,limitations:[
      "No route is ever declared executable based on AST evidence alone.",
      "A blocked result proves only the modeled path, not global protocol incompatibility.",
      "Only consecutive pure AST guards before the exact call/write site can establish a contradiction.",
      "Modifier guards and placeholder behavior are inspected; dynamic dispatch and argument substitution are not proved.",
      "Assignments, loops, complex conditions, reentrancy and cross-contract state may require independent EVM evidence."
    ]};
}
module.exports={evaluateFeasibility,expressionAtoms,contradiction,
  analyzeBeforeEvent,placeholders};
