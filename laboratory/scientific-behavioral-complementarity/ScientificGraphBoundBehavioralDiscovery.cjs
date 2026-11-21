"use strict";
/**
 * Source-only structural adapter for the native generic hypothesis matcher.
 *
 * The graph comes from the compiler's resolved Solidity AST. This adapter
 * uses AST node IDs, call edges, inheritance and state-write nodes; it never
 * manufactures a scientific CrossProtocolCompositionEngine candidate.
 *
 * An NFT redemption-liability decrease is a CLAIM decrease, not a decrease
 * in the number of fungible units. A fungible supply decrease is FUNGIBLE.
 */
const {discover}=require("./GenericBehavioralEffectMatcher.cjs");
const hex64=x=>typeof x==="string"&&/^[a-f0-9]{64}$/i.test(x);
const sha40=x=>typeof x==="string"&&/^[a-f0-9]{40}$/i.test(x);
function analyze(graph) {
  const failure=reason=>({hypotheses:[],participants:[],errors:[reason],
    scientificPolarity:"INCONCLUSIVE",admission:"NOT_ADMITTED"});
  if(graph?.schemaVersion!=="OECL_SOLIDITY_COMPILER_AST_GRAPH_V1"||
     graph.status!=="STRUCTURAL_OBSERVATION_ONLY"||
     graph.candidateAdmission!=="NOT_ADMITTED"||
     graph.scientificPolarity!=="INCONCLUSIVE"||
     !Array.isArray(graph.contracts)||!Array.isArray(graph.functions)||
     !Array.isArray(graph.edges)||!Array.isArray(graph.writes)||
     !Array.isArray(graph.guards)||!Array.isArray(graph.sources)||
     !Array.isArray(graph.externalCalls))
    return failure("INVALID_COMPILER_AST_GRAPH");
  const primary=graph.provenance?.primary||[];
  const deps=graph.provenance?.dependency;
  if(primary.length!==2 || !deps || !deps.integrity ||
     deps.package!=="@openzeppelin/contracts" ||
     typeof deps.version!=="string" ||
     primary.some(x=>!x.repository||!sha40(x.revision)||!hex64(x.sourceSha256)||
       graph.sources.filter(s=>s.unit===x.unit&&s.sha256===x.sourceSha256).length!==1)||
     primary[0].repository===primary[1].repository)
    return failure("SOURCE_LINEAGE_MISMATCH");
  const files=new Map(graph.sources.map(x=>[x.unit,x.sha256]));
  const contracts=new Map(graph.contracts.map(x=>[x.id,x]));
  const functions=new Map(graph.functions.map(x=>[x.id,x]));
  const signature=(fn,name,visibility)=>
    fn.name===name&&fn.kind==="function"&&fn.implemented&&
    (!visibility||visibility.includes(fn.visibility))&&fn.parameterTypes?.length===1&&
    fn.parameterTypes[0].includes("uint256");
  const inherited=(contract,name)=>graph.contracts.some(x=>
    x.name===name&&contract.linearizedBaseContracts?.includes(x.id));
  const edge=(kind,from,to)=>graph.edges.find(x=>
    x.kind===kind&&x.from===from.id&&x.to===to.id);
  const findUnitContract=(unit,base)=>graph.contracts.filter(c=>
    c.unit===unit&&c.kind==="contract"&&inherited(c,base));
  const nftPrimary=primary.filter(p=>findUnitContract(p.unit,"ERC721").length===1);
  const erc20Primary=primary.filter(p=>findUnitContract(p.unit,"ERC20").length===1);
  if(nftPrimary.length!==1||erc20Primary.length!==1||
     nftPrimary[0].repository===erc20Primary[0].repository)
    return failure("AMBIGUOUS_OR_MISSING_DIFFERENT_ASSET_CLASSES");
  const nft=nftPrimary[0],token=erc20Primary[0];
  const nContract=findUnitContract(nft.unit,"ERC721")[0];
  const fContract=findUnitContract(token.unit,"ERC20")[0];
  if(!inherited(fContract,"ERC20Burnable"))return failure("UNRESOLVED_BURNABLE_INHERITANCE");
  const own=(c,name)=>graph.functions.filter(x=>x.contractId===c.id&&x.name===name&&x.kind==="function");
  const nftBurn=own(nContract,"burn").filter(x=>signature(x,"burn",["public","external"]));
  const nftInternal=own(nContract,"_burn").filter(x=>signature(x,"_burn",["internal"]));
  if(nftBurn.length!==1||nftInternal.length!==1)
    return failure("MISSING_OR_AMBIGUOUS_NFT_BURN_ROUTE");
  const nftEdge=edge("CALLS",nftBurn[0],nftInternal[0]);
  if(!nftEdge)return failure("NFT_BURN_INTERNAL_CALL_NOT_RESOLVED");
  const nState=graph.writes.filter(x=>x.owner===nftInternal[0].id&&
    x.kind==="DECREASE"&&x.state==="totalRedeemableValue");
  if(nState.length!==1)return failure("NO_SOURCE_ANCHORED_REDEMPTION_OBLIGATION_DECREASE");
  const owner=graph.guards.filter(g=>g.owner===nftBurn[0].id&&g.kind==="REQUIRE"&&
    g.condition.includes("ownerOf(tokenId)")&&g.condition.includes("msg.sender")&&
    g.condition.includes("=="));
  const solvent=graph.guards.filter(g=>g.owner===nftBurn[0].id&&g.kind==="REQUIRE"&&
    g.condition.includes("address(this).balance")&&g.condition.includes("redeemable")&&
    g.condition.includes(">="));
  const paid=graph.externalCalls.filter(x=>x.owner===nftBurn[0].id&&
    x.kind==="LOW_LEVEL_CALL"&&x.valueExpression?.trim()==="redeemable");
  if(owner.length!==1||solvent.length!==1||paid.length!==1)
    return failure("NFT_OWNER_SOLVENCY_OR_PAYOUT_NOT_SOURCE_ANCHORED");
  if(graph.aborts?.some(x=>x.owner===nftBurn[0].id))
    return failure("NFT_EXPLICIT_REVERT_PATH_UNRESOLVED");
  const bContract=graph.contracts.filter(c=>c.name==="ERC20Burnable"&&
    fContract.linearizedBaseContracts.includes(c.id));
  const cContract=graph.contracts.filter(c=>c.name==="ERC20"&&
    fContract.linearizedBaseContracts.includes(c.id));
  if(bContract.length!==1||cContract.length!==1||own(fContract,"burn").length>0)
    return failure("OVERRIDDEN_OR_UNRESOLVED_FUNGIBLE_BURN");
  const bBurn=own(bContract[0],"burn").filter(x=>signature(x,"burn",["public","external"]));
  const cBurn=own(cContract[0],"_burn").filter(x=>signature(x,"_burn",["internal"]));
  const cMint=own(cContract[0],"_mint").filter(x=>signature(x,"_mint",["internal"]));
  const fConstructor=graph.functions.filter(x=>x.contractId===fContract.id&&
    x.kind==="constructor");
  if(bBurn.length!==1||cBurn.length!==1||cMint.length!==1||fConstructor.length!==1 ||
     graph.functions.some(x=>x.contractId===fContract.id&&
       ["mint","increaseSupply"].includes(x.name)&&
       ["public","external"].includes(x.visibility)))
    return failure("FUNGIBLE_SUPPLY_ENTRYPOINT_NOT_ESTABLISHED");
  const callBurn=edge("CALLS",bBurn[0],cBurn[0]);
  const callMint=edge("CALLS",fConstructor[0],cMint[0]);
  const senderCall=graph.edges.find(e=>e.kind==="CALLS"&&e.from===bBurn[0].id&&
    functions.get(e.to)?.name==="_msgSender");
  const supply=graph.writes.filter(x=>x.owner===cBurn[0].id&&
    x.state==="_totalSupply"&&x.kind==="DECREASE");
  const balance=graph.guards.filter(x=>x.owner===cBurn[0].id&&x.kind==="REQUIRE"&&
    x.condition.includes("accountBalance")&&x.condition.includes("amount")&&
    x.condition.includes(">="));
  if(!callBurn||!callMint||!senderCall||supply.length!==1||balance.length!==1)
    return failure("MISSING_INHERITED_ERC20_SUPPLY_OR_BALANCE_ROUTE");
  const expectedHashForUnit=unit=>files.get(unit);
  const dependencyUnit=unit=>
    deps.sourceUnits?.includes(unit)&&!!expectedHashForUnit(unit);
  if(!dependencyUnit(bBurn[0].unit)||!dependencyUnit(cBurn[0].unit)||
     !dependencyUnit(cMint[0].unit) ||
     !String(functions.get(senderCall.to)?.unit||"").startsWith("@openzeppelin/contracts/") ||
     !expectedHashForUnit(functions.get(senderCall.to).unit))
    return failure("INHERITED_FACT_OUTSIDE_LOCKED_DEPENDENCY");
  const sourceFact=(p,kind,item,originUnit=p.unit,anchor=null)=>{
    const location=item?.location;
    const sourceSha256=expectedHashForUnit(originUnit);
    if(!location||location.unit!==originUnit||!hex64(sourceSha256))
      throw Error("AST_PROVENANCE_MISSING:"+kind);
    const fact={
      factId:"AST:"+originUnit+":"+kind+":"+location.start,
      sourceId:anchor?deps.package:p.repository,
      sourceRevision:anchor?deps.version:p.revision,
      sourceSha256
    };
    if(anchor){
      fact.attributedParticipantId=p.repository;
      fact.inheritanceAnchorFactId=anchor.factId;
    }
    return fact;
  };
  const nftFacts=[
    sourceFact(nft,"OWNER_AUTHORIZATION",owner[0]),
    sourceFact(nft,"REDEMPTION_SOLVENCY",solvent[0]),
    sourceFact(nft,"CLAIM_DECREASE",nState[0]),
    sourceFact(nft,"CALLS_INTERNAL_BURN",nftEdge),
    sourceFact(nft,"REDEEMABLE_ETH_PAYOUT",paid[0])
  ];
  const fAnchor=sourceFact(token,"INHERITANCE_ANCHOR",fContract);
  const fFacts=[
    fAnchor,
    sourceFact(token,"CONSTRUCTOR_MINT_ROUTE",callMint),
    sourceFact(token,"INHERITED_FUNGIBLE_BURN_CALL",callBurn,bBurn[0].unit,fAnchor),
    sourceFact(token,"INHERITED_SENDER_CALL",senderCall,bBurn[0].unit,fAnchor),
    sourceFact(token,"INHERITED_BALANCE_REQUIRE",balance[0],cBurn[0].unit,fAnchor),
    sourceFact(token,"INHERITED_SUPPLY_DECREASE",supply[0],cBurn[0].unit,fAnchor)
  ];
  const id=(facts,k)=>[facts.find(f=>f.factId.includes(":"+k+":"))?.factId].filter(Boolean);
  const participants=[
    {sourceId:nft.repository,revision:nft.revision,assetClass:"CLAIM",
      provenance:nftFacts,
      effects:[{kind:"DECREASE",assetClass:"CLAIM",boundedBy:"AVAILABLE_QUANTITY",
        sourceFactIds:id(nftFacts,"CLAIM_DECREASE")}],
      restrictions:[
        {kind:"AUTHORIZATION",sourceFactIds:id(nftFacts,"OWNER_AUTHORIZATION")},
        {kind:"AVAILABILITY",sourceFactIds:id(nftFacts,"REDEMPTION_SOLVENCY")},
        {kind:"STATE_CONSISTENCY",sourceFactIds:id(nftFacts,"CALLS_INTERNAL_BURN")}
      ]},
    {sourceId:token.repository,revision:token.revision,assetClass:"FUNGIBLE",
      provenance:fFacts,
      effects:[{kind:"DECREASE",assetClass:"FUNGIBLE",boundedBy:"AVAILABLE_QUANTITY",
        sourceFactIds:id(fFacts,"INHERITED_SUPPLY_DECREASE")}],
      restrictions:[
        {kind:"AUTHORIZATION",sourceFactIds:id(fFacts,"INHERITED_SENDER_CALL")},
        {kind:"AVAILABILITY",sourceFactIds:id(fFacts,"INHERITED_BALANCE_REQUIRE")},
        {kind:"STATE_CONSISTENCY",sourceFactIds:id(fFacts,"INHERITED_FUNGIBLE_BURN_CALL")}
      ]}
  ];
  const result=discover({participants});
  return {...result,participants,
    mechanism:"SOURCE_AST_BOUND_BEHAVIORAL_COMPLEMENTARITY",
    status:result.hypotheses.length===1?"SOURCE_ONLY_UNEVALUATED":"INCONCLUSIVE",
    scientificPolarity:"INCONCLUSIVE",admission:"NOT_ADMITTED",
    warnings:[
      "Source graph proves syntactic call edges but not reachability under all modifiers or dynamic dispatch.",
      "NFT decreases ETH redemption liabilities; ERC20 decreases fungible token supply; their units differ.",
      "No native composition candidate, feasibility or universal compatibility is established."
    ]};
}
module.exports={analyze};
