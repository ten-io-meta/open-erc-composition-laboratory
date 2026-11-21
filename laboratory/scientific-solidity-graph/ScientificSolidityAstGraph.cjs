"use strict";
/**
 * Read compiler-resolved Solidity ASTs from immutable Hardhat build-info.
 * This is a source-provenance graph, NOT a path-feasibility/compatibility proof.
 * No source-regex capability inference: calls, inheritance, modifiers and
 * state effects originate from typed AST nodes and referencedDeclaration IDs.
 */
const crypto=require("node:crypto");
const hash=x=>crypto.createHash("sha256").update(x).digest("hex");
const astNodes=new Set(["ContractDefinition","FunctionDefinition","ModifierDefinition","VariableDeclaration"]);
const walk=(node,visit)=>{
  if(!node||typeof node!=="object")return;
  if(Array.isArray(node)){for(const n of node)walk(n,visit);return;}
  if(node.nodeType)visit(node);
  for(const [k,v] of Object.entries(node))
    if(k!=="documentation"&&v&&typeof v==="object")walk(v,visit);
};
const srcParts=node=>String(node?.src||"0:0:0").split(":").map(Number);
function buildGraph(buildInfo) {
  if(!buildInfo?.input?.sources||!buildInfo.output?.sources)
    throw Error("COMPILER_INPUT_AND_OUTPUT_REQUIRED");
  const units=Object.keys(buildInfo.output.sources).sort();
  const sources=new Map(),nodes=new Map(),contracts=[],functions=[],modifiers=[],variables=[],edges=[],guards=[],writes=[],branches=[],externalCalls=[],aborts=[],unresolved=[];
  const textAt=(node,unit)=>{
    const source=sources.get(unit);
    if(!source)return "";
    const [offset,length]=srcParts(node);
    return source.content.slice(offset,offset+length);
  };
  const loc=(node,unit)=>{
    const source=sources.get(unit);
    const [offset,length]=srcParts(node);
    const line=source?source.content.slice(0,offset).split("\n").length:0;
    return {unit,line,start:offset,length};
  };
  for(const unit of units){
    const src=buildInfo.input.sources[unit]?.content;
    const ast=buildInfo.output.sources[unit]?.ast;
    if(typeof src!=="string"||!ast||ast.nodeType!=="SourceUnit")
      throw Error("MISSING_COMPILER_AST_OR_EXACT_INPUT:"+unit);
    sources.set(unit,{content:src,sha256:hash(src),ast});
  }
  // First pass: compiler-declared identities (not names guessed from text).
  for(const unit of units){
    const ast=sources.get(unit).ast;
    walk(ast,n=>{
      if(!astNodes.has(n.nodeType)||!Number.isInteger(n.id))return;
      if(nodes.has(n.id))throw Error("DUPLICATE_SOLC_AST_NODE_ID:"+n.id);
      nodes.set(n.id,{node:n,unit});
    });
  }
  const sourceFacts=units.map(unit=>({unit,sha256:sources.get(unit).sha256}));
  for(const unit of units) {
    for(const n of sources.get(unit).ast.nodes||[]){
      if(n.nodeType!=="ContractDefinition")continue;
      const c={id:n.id,name:n.name,unit,kind:n.contractKind,
        linearizedBaseContracts:n.linearizedBaseContracts||[],
        location:loc(n,unit)};
      contracts.push(c);
      for(const base of n.baseContracts||[]){
        const target=base.baseName?.referencedDeclaration;
        if(Number.isInteger(target)&&nodes.has(target))
          edges.push({kind:"INHERITS",from:n.id,to:target,location:loc(base,unit)});
        else unresolved.push({kind:"UNRESOLVED_INHERITANCE",owner:n.id,location:loc(base,unit)});
      }
      for(const item of n.nodes||[]) {
        if(item.nodeType==="VariableDeclaration"&&item.stateVariable)
          variables.push({id:item.id,name:item.name,contractId:n.id,unit,
            location:loc(item,unit)});
        if(item.nodeType!=="FunctionDefinition"&&item.nodeType!=="ModifierDefinition")continue;
        const entry={id:item.id,contractId:n.id,contractName:n.name,unit,
          name:item.nodeType==="ModifierDefinition"?item.name:(item.kind==="constructor"?"constructor":item.name),
          kind:item.nodeType==="ModifierDefinition"?"modifier":item.kind,
          visibility:item.visibility||null,implemented:item.implemented!==false,
          parameterTypes:(item.parameters?.parameters||[]).map(p=>p.typeDescriptions?.typeString||p.typeName?.name||"unknown"),
          location:loc(item,unit)};
        if(item.nodeType==="ModifierDefinition")modifiers.push(entry);
        else functions.push(entry);
      }
    }
  }
  const functionsById=new Map([...functions,...modifiers].map(f=>[f.id,f]));
  const contractById=new Map(contracts.map(c=>[c.id,c]));
  const stateById=new Map(variables.map(v=>[v.id,v]));
  const referencedState=expr=>{
    if(!expr||typeof expr!=="object")return null;
    if(Number.isInteger(expr.referencedDeclaration)&&stateById.has(expr.referencedDeclaration))
      return stateById.get(expr.referencedDeclaration);
    if(expr.nodeType==="IndexAccess")return referencedState(expr.baseExpression);
    if(expr.nodeType==="MemberAccess")return referencedState(expr.expression);
    return null;
  };
  for(const [id,{node,unit}] of nodes){
    if(node.nodeType!=="FunctionDefinition"&&node.nodeType!=="ModifierDefinition")continue;
    const entry=functionsById.get(id);
    if(!entry)continue;
    for(const m of node.modifiers||[]){
      const target=m.modifierName?.referencedDeclaration;
      if(Number.isInteger(target)&&functionsById.has(target))
        edges.push({kind:"APPLIES_MODIFIER",from:id,to:target,location:loc(m,unit)});
      else unresolved.push({kind:"UNRESOLVED_MODIFIER",owner:id,location:loc(m,unit),
        name:m.modifierName?.name||m.modifierName?.memberName||""});
    }
    if(!node.body)continue;
    walk(node.body,n=>{
      const location=loc(n,unit);
      if(n.nodeType==="FunctionCall"){
        const e=n.expression;
        const target=e?.referencedDeclaration;
        if(Number.isInteger(target)&&functionsById.has(target)){
          edges.push({kind:"CALLS",from:id,to:target,location});
        } else if(Number.isInteger(target)&&target>0&&
                 e?.nodeType!=="ElementaryTypeNameExpression"){
          unresolved.push({kind:"CALL_TARGET_UNRESOLVED",owner:id,
            referencedDeclaration:target,location});
        }
        const name=e?.name||e?.memberName||"";
        if(name==="require"||name==="assert") {
          const arg=n.arguments?.[0];
          guards.push({owner:id,kind:name.toUpperCase(),condition:arg?textAt(arg,unit):"",
            expressionNodeType:arg?.nodeType||null,location});
        }
        if(e?.nodeType==="FunctionCallOptions"&&
           e.expression?.nodeType==="MemberAccess"&&
           e.expression.memberName==="call"){
          const valueIndex=(e.names||[]).indexOf("value");
          externalCalls.push({owner:id,kind:"LOW_LEVEL_CALL",
            valueExpression:valueIndex>=0?textAt(e.options[valueIndex],unit):null,
            location});
        }
      } else if(n.nodeType==="Assignment"){
        const variable=referencedState(n.leftHandSide);
        if(variable)writes.push({owner:id,stateId:variable.id,state:variable.name,
          kind:n.operator==="+="?"INCREASE":n.operator==="-="?"DECREASE":"ASSIGN",
          operator:n.operator,location});
      } else if(n.nodeType==="UnaryOperation"){
        const variable=referencedState(n.subExpression);
        if(variable&&["++","--","delete"].includes(n.operator))
          writes.push({owner:id,stateId:variable.id,state:variable.name,
            kind:n.operator==="++"?"INCREASE":n.operator==="--"?"DECREASE":"DELETE",
            operator:n.operator,location});
      } else if(n.nodeType==="IfStatement"){
        branches.push({owner:id,condition:textAt(n.condition,unit),
          conditionNodeType:n.condition?.nodeType||null,location});
      } else if(n.nodeType==="RevertStatement"){
        aborts.push({owner:id,kind:"REVERT",location});
      }
    });
  }
  contracts.sort((a,b)=>a.unit.localeCompare(b.unit)||a.name.localeCompare(b.name));
  const sorted=(xs)=>xs.sort((a,b)=>(a.location?.unit||"").localeCompare(b.location?.unit||"")||
    (a.location?.start||0)-(b.location?.start||0)||(a.kind||"").localeCompare(b.kind||""));
  for(const list of [functions,modifiers,variables,edges,guards,writes,branches,externalCalls,aborts,unresolved])sorted(list);
  return {
    schemaVersion:"OECL_SOLIDITY_COMPILER_AST_GRAPH_V1",
    status:"STRUCTURAL_OBSERVATION_ONLY",
    source:"SOLC_RESOLVED_AST_FROM_HARDHAT_BUILD_INFO",
    compilerVersion:buildInfo.solcVersion||null,
    sources:sourceFacts,
    contracts,functions,modifiers,variables,edges,guards,writes,branches,externalCalls,aborts,unresolved,
    limitations:[
      "AST call targets and inheritance are compiler-resolved, not proof of path feasibility.",
      "State writes may occur inside conditional branches; no unconditional-effect claim.",
      "Low-level/delegate calls, dynamic dispatch, proxy upgrades and modifier inheritance need additional evaluation.",
      "No cross-protocol composition candidate is admitted by this graph."
    ],
    scientificPolarity:"INCONCLUSIVE",
    candidateAdmission:"NOT_ADMITTED"
  };
}
module.exports={buildGraph};
