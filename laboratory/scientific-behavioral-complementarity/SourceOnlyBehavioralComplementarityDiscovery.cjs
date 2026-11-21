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
const fact = (source,pattern,kind) => {
  const match = pattern.exec(source.text);
  if (!match) return null;
  const line = source.text.slice(0,match.index).split("\n").length;
  return {kind,sourceId:source.id,sourceRevision:source.revision,
    file:source.file,line,sourceSha256:digest(source.text),
    excerpt:match[0].slice(0,240)};
};
const all = values => values.every(Boolean);
function extract(source, dependency) {
  if (!source || !source.text || !source.id || !source.revision ||
      !source.file || !/^[a-f0-9]{40}$/i.test(source.revision)) return [];
  const results = [];
  // Redemptive NFT destruction: these separate source facts supply a
  // hypothesis, but their coexistence is not a proof of control flow.
  const nft = [
    fact(source,/function\s+burn\s*\(\s*uint256\s+tokenId\s*\)[\s\S]{0,100}?external\b/,"NFT_BURN_ENTRY"),
    fact(source,/require\s*\(\s*ownerOf\s*\(\s*tokenId\s*\)\s*==\s*msg\.sender/,"OWNER_GUARD"),
    fact(source,/function\s+_burn\s*\(\s*uint256\s+tokenId\s*\)[\s\S]{0,220}?\{[\s\S]{0,550}?totalRedeemableValue\s*-=\s*redeemable/,"LIABILITY_DECREASE"),
    fact(source,/\.call\s*\{\s*value\s*:\s*redeemable\s*\}/,"ETH_PAYOUT"),
    fact(source,/address\s*\(\s*this\s*\)\.balance\s*>=\s*redeemable/,"SOLVENCY_GUARD")
  ];
  if (all(nft)) results.push({
    participant:{id:source.id,revision:source.revision,file:source.file},
    effects:["NFT_DESTRUCTION","ETH_VALUE_PAYOUT","ETH_LIABILITY_DECREASE"],
    restrictions:["NFT_OWNER_AUTHORIZATION","BACKING_SOLVENCY","PAYOUT_MUST_SUCCEED"],
    evidence:nft
  });
  const erc20 = [
    fact(source,/contract\s+\w+\s+is\s+ERC20\s*,\s*ERC20Burnable\b/,"ERC20_BURNABLE_INHERITANCE"),
    fact(source,/constructor\s*\([\s\S]{0,350}?\)\s*ERC20\s*\([\s\S]{0,150}?\)\s*\{[\s\S]{0,250}?_mint\s*\(/,"CONSTRUCTOR_ALLOCATION"),
    dependency && fact(dependency,/function\s+burn\s*\(\s*uint256\s+amount\s*\)[\s\S]{0,130}?public\s+virtual\s*\{[\s\S]{0,130}?_burn\s*\(\s*_msgSender\s*\(\s*\)\s*,\s*amount\s*\)/,"INHERITED_FUNGIBLE_BURN"),
    fact(source,/import\s+["']@openzeppelin\/contracts\/token\/ERC20\/extensions\/ERC20Burnable\.sol["']/,"BURNABLE_IMPORT")
  ];
  // Absence of a source-level mint entry is NOT formal proof of an
  // immutable supply; proxies, inherited internals and upgrades need audit.
  const unsafeMint=/function\s+(?:mint|increaseSupply)\s*\(/.test(source.text);
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
