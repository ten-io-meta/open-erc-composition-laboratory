"use strict";
/**
 * Source-only, rule-based behavioral complementarity discovery prototype.
 *
 * No joint coordinator, EVM receipt, expected protocol IDs, or hand-written
 * candidate is an input to discover(). Heuristics are intentionally narrow:
 * the returned HYPOTHESIS is never scientific admission or compatibility.
 */
const crypto = require("node:crypto");
const digest = value => crypto.createHash("sha256").update(value).digest("hex");
// Ignore comments without altering offsets or newlines: source claims hidden
// inside comments must never be treated as executable Solidity facts.
function maskComments(text) {
  let state="code",out="";
  for(let i=0;i<text.length;i++){
    const c=text[i],n=text[i+1];
    if(state==="line"){
      if(c==="\n"){state="code";out+=c;} else out+=" ";
    } else if(state==="block"){
      if(c==="*"&&n==="/"){out+="  ";i++;state="code";}
      else out+=c==="\n"?"\n":" ";
    } else if(state==="string"){
      out+=c;
      if(c==="\\"){if(i+1<text.length)out+=text[++i];}
      else if(c==="\"")state="code";
    } else if(state==="quote"){
      out+=c;
      if(c==="\\"){if(i+1<text.length)out+=text[++i];}
      else if(c==="'")state="code";
    } else if(c==="/"&&n==="/"){out+="  ";i++;state="line";}
    else if(c==="/"&&n==="*"){out+="  ";i++;state="block";}
    else {out+=c;if(c==="\"")state="string";else if(c==="'")state="quote";}
  }
  return out;
}
const fact = (source,pattern,kind) => {
  const match = pattern.exec(source.matchText ?? source.text);
  if (!match) return null;
  const line = source.text.slice(0,match.index).split("\n").length;
  return {kind,sourceId:source.id,sourceRevision:source.revision,
    file:source.file,line,sourceSha256:digest(source.text),
    excerpt:match[0].slice(0,240)};
};
const all = values => values.every(Boolean);
// Keep offsets stable and limit behavioral claims to the method that
// actually contains the guard/effect. Unrelated helper methods are not proof.
function scopedBody(source, signature) {
  const text=source.matchText;
  const match=signature.exec(text);
  if(!match)return {...source,matchText:" ".repeat(text.length)};
  const open=text.indexOf("{",match.index+match[0].length-1);
  if(open<0)return {...source,matchText:" ".repeat(text.length)};
  let depth=0,quote=null,end=-1;
  for(let i=open;i<text.length;i++){
    const c=text[i];
    if(quote){
      if(c==="\\"){i++;continue;}
      if(c===quote)quote=null;
      continue;
    }
    if(c==="\""||c==="'"){quote=c;continue;}
    if(c==="{")depth++;
    if(c==="}"&&--depth===0){end=i;break;}
  }
  if(end<0)return {...source,matchText:" ".repeat(text.length)};
  const scoped=text.slice(open,end+1);
  return {...source,matchText:" ".repeat(open)+scoped+" ".repeat(text.length-end-1)};
}

function extract(source, dependency) {
  if (!source || !source.text || !source.id || !source.revision ||
      !source.file || !/^[a-f0-9]{40}$/i.test(source.revision)) return [];
  const sourceCode={...source,matchText:maskComments(source.text)};
  const dependencyCode=dependency?.text?{...dependency,matchText:maskComments(dependency.text)}:dependency;
  const burnBody=scopedBody(sourceCode,/function\s+burn\s*\(\s*uint256\s+tokenId\s*\)[^;{]*\{/);
  const internalBurnBody=scopedBody(sourceCode,/function\s+_burn\s*\(\s*uint256\s+tokenId\s*\)[^;{]*\{/);
  const results = [];
  // Redemptive NFT destruction: these separate source facts supply a
  // hypothesis, but their coexistence is not a proof of control flow.
  const nft = [
    fact(sourceCode,/function\s+burn\s*\(\s*uint256\s+tokenId\s*\)[\s\S]{0,100}?external\b/,"NFT_BURN_ENTRY"),
    fact(burnBody,/require\s*\(\s*ownerOf\s*\(\s*tokenId\s*\)\s*==\s*msg\.sender/,"OWNER_GUARD"),
    fact(internalBurnBody,/totalRedeemableValue\s*-=\s*redeemable/,"LIABILITY_DECREASE"),
    fact(burnBody,/\.call\s*\{\s*value\s*:\s*redeemable\s*\}/,"ETH_PAYOUT"),
    fact(burnBody,/address\s*\(\s*this\s*\)\.balance\s*>=\s*redeemable/,"SOLVENCY_GUARD")
  ];
  const terminalEntryRevert =
    /function\s+burn\s*\(\s*uint256\s+tokenId\s*\)[\s\S]{0,130}?\{\s*(?:revert\s*\(|require\s*\(\s*false\b)/.test(sourceCode.matchText);
  if (all(nft) && !terminalEntryRevert) results.push({
    participant:{id:source.id,revision:source.revision,file:source.file},
    effects:["NFT_DESTRUCTION","ETH_VALUE_PAYOUT","ETH_LIABILITY_DECREASE"],
    restrictions:["NFT_OWNER_AUTHORIZATION","BACKING_SOLVENCY","PAYOUT_MUST_SUCCEED"],
    evidence:nft
  });
  const erc20 = [
    fact(sourceCode,/contract\s+\w+\s+is\s+ERC20\s*,\s*ERC20Burnable\b/,"ERC20_BURNABLE_INHERITANCE"),
    fact(sourceCode,/constructor\s*\([\s\S]{0,350}?\)\s*ERC20\s*\([\s\S]{0,150}?\)\s*\{[\s\S]{0,250}?_mint\s*\(/,"CONSTRUCTOR_ALLOCATION"),
    dependencyCode && fact(dependencyCode,/function\s+burn\s*\(\s*uint256\s+amount\s*\)[\s\S]{0,130}?public\s+virtual\s*\{[\s\S]{0,130}?_burn\s*\(\s*_msgSender\s*\(\s*\)\s*,\s*amount\s*\)/,"INHERITED_FUNGIBLE_BURN"),
    fact(sourceCode,/import\s+["']@openzeppelin\/contracts\/token\/ERC20\/extensions\/ERC20Burnable\.sol["']/,"BURNABLE_IMPORT")
  ];
  // Absence of a source-level mint entry is NOT formal proof of an
  // immutable supply; proxies, inherited internals and upgrades need audit.
  const unsafeMint=/function\s+(?:mint|increaseSupply)\s*\(/.test(sourceCode.matchText);
  if (all(erc20) && !unsafeMint) results.push({
    participant:{id:source.id,revision:source.revision,file:source.file},
    effects:["FUNGIBLE_SUPPLY_DESTRUCTION"],
    restrictions:["FUNGIBLE_BALANCE_AND_ALLOWANCE","NO_EXPOSED_MINT_IN_PRIMARY_SOURCE"],
    evidence:erc20
  });
  return results;
}
function discover(sources, dependency) {
  if (!Array.isArray(sources) || sources.length!==2 ||
      !dependency?.text || !dependency.id || !dependency.revision) {
    return {candidates:[],errors:["Two source revisions and one inherited dependency are required."]};
  }
  if(new Set(sources.map(x=>x.id)).size!==2 ||
     new Set(sources.map(x=>x.id+"@"+x.revision)).size!==2) {
    return {candidates:[],errors:["Source identities must be independent."]};
  }
  const capabilities=sources.flatMap(s=>extract(s,dependency));
  const redeem=capabilities.filter(c=>c.effects.includes("ETH_VALUE_PAYOUT"));
  const supply=capabilities.filter(c=>c.effects.includes("FUNGIBLE_SUPPLY_DESTRUCTION"));
  if (redeem.length!==1 || supply.length!==1 ||
      redeem[0].participant.id===supply[0].participant.id) {
    return {candidates:[],capabilities,errors:[]};
  }
  const a=redeem[0],b=supply[0];
  const candidate={
    mechanism:"BEHAVIORAL_COMPLEMENTARITY_HYPOTHESIS",
    hypothesis:"Can a coordinator atomically couple NFT ETH redemption to fungible supply destruction without violating either protocol's restrictions?",
    participants:[a.participant,b.participant],
    independentlyObservedEffects:[...a.effects,...b.effects],
    sourceRestrictions:[...a.restrictions,...b.restrictions],
    provenance:[...a.evidence,...b.evidence],
    requiredExperiments:[
      "Check ownership and transfer/approval preconditions for the coordinator",
      "Verify one transaction destroys NFT and fungible amount with exact ETH payout",
      "Verify revert atomicity when any permission, balance or payout fails",
      "Verify backing solvency and ERC20 supply non-increase across transitions"
    ],
    blockingUnknowns:[
      "The source does not establish a lawful coordinator custody/approval path",
      "Token burn and NFT redemption are different asset units",
      "Source-level patterns do not prove full reachable control flow or universal invariants",
      "No independent EVM observations are admitted at discovery time"
    ],
    status:"SOURCE_ONLY_UNEVALUATED",
    candidateAdmission:"NOT_ADMITTED",
    scientificPolarity:"INCONCLUSIVE"
  };
  return {candidates:[candidate],capabilities,errors:[]};
}
module.exports={discover,extract};
