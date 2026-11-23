import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {readFileSync,mkdirSync,writeFileSync} from "node:fs";
import {resolve,dirname} from "node:path";
const sha256=x=>createHash("sha256").update(x).digest("hex");
const erc7837Path=resolve(process.argv[2]||
  "official-ercs/ERCS/erc-7837.md");
const erc8098Path=resolve(process.argv[3]||
  "pinned-8098/contracts/ERC8098Reference.sol");
const agendaPath=resolve(process.argv[4]||
  "audit-output/all-erc-scientific-falsification-agenda.json");
const destination=resolve(process.argv[5]||
  "audit-output/erc7837-erc8098-conditional-invariant-tension.json");
const aBytes=readFileSync(erc7837Path),bBytes=readFileSync(erc8098Path);
const a=aBytes.toString("utf8"),b=bBytes.toString("utf8");
const agenda=JSON.parse(readFileSync(agendaPath,"utf8"));
assert.equal(agenda.snapshot.revision,"e9c1adc6ad36faec8a6bc509cc8a14ec9b8f741d");
const record=agenda.standards.find(x=>x.ercId==="ERC-7837");
assert(record&&record.anchoredFallback);
assert.equal(record.sourceSha256,sha256(aBytes));
const expectedSource={
  implementationRepository:"ten-io-meta/erc8098-reference",
  implementationRevision:"68a05289bd68d89db8453c49500e0a1ae6cd11ec",
  implementationPath:"contracts/ERC8098Reference.sol"
};
assert(b.includes("contract ERC8098Reference is ERC20, ERC20Burnable"));
assert(b.includes("_mint(initialHolder, initialSupply);"));
assert(b.includes("No exposed post-deployment"));
assert(b.includes("mint, proxy upgrade"));
const excerpt=(lines,needle)=>{
 const matches=[];
 for(let i=0;i<lines.length;i++){
   if(lines[i].includes(needle))matches.push(i);
 }
 assert.equal(matches.length,1,"Missing/ambiguous original source assertion: "+needle);
 const line=matches[0];
 return {line:line+1,excerpt:lines[line].trim().slice(0,190),
   lineSha256:sha256(Buffer.from(lines[line],"utf8"))};
};
const evidence=[
 {source:"ERC-7837_PINNED_OFFICIAL",...excerpt(a.split(/\r?\n/),
   "The "+String.fromCharCode(96)+"totalSupply"+String.fromCharCode(96)+
   " increases by the transferred amount")},
 {source:"ERC-7837_PINNED_OFFICIAL",...excerpt(a.split(/\r?\n/),
   "does not lose any tokens")},
 {source:"ERC-8098_PINNED_REFERENCE_ONLY",...excerpt(b.split(/\r?\n/),
   "No exposed post-deployment")},
 {source:"ERC-8098_PINNED_REFERENCE_ONLY",...excerpt(b.split(/\r?\n/),
   "_mint(initialHolder, initialSupply);")}
];
/**
 * This is a symbolic conditional comparison, NOT an EVM test and
 * NOT an ERC compatibility verdict. It applies only if BOTH claimed
 * supply invariants govern the SAME token variable, positive transfer
 * succeeds, and no external supplies or different roles are introduced.
 */
function compareModel({supply,maxSupply,amount,sharedSupply,successful}){
 const s=BigInt(supply),m=BigInt(maxSupply),q=BigInt(amount);
 assert(s>=0n&&m>=s&&q>=0n);
 const inDomain=sharedSupply&&successful&&q>0n&&s+q<=m;
 const after7837=s+q;
 const after8098Upper=s;
 return {
  inDomain,
  source7837PredictedAfter:after7837.toString(),
  source8098MaximumAfter:after8098Upper.toString(),
  conditionalConflict:inDomain&&after7837>after8098Upper
 };
}
const cases=[
 {label:"POSITIVE_TRANSFER_ONE",supply:"100",maxSupply:"200",amount:"1",sharedSupply:true,successful:true,expected:true},
 {label:"POSITIVE_TRANSFER_TEN",supply:"100",maxSupply:"200",amount:"10",sharedSupply:true,successful:true,expected:true},
 {label:"ZERO_QUANTITY_BOUNDARY",supply:"100",maxSupply:"200",amount:"0",sharedSupply:true,successful:true,expected:false},
 {label:"MAX_SUPPLY_BOUNDARY_REVERTS",supply:"200",maxSupply:"200",amount:"1",sharedSupply:true,successful:false,expected:false},
 {label:"DIFFERENT_CONTRACT_SUPPLY_VARIABLES",supply:"100",maxSupply:"200",amount:"10",sharedSupply:false,successful:true,expected:false},
 {label:"UNEXECUTED_TRANSACTION",supply:"100",maxSupply:"200",amount:"10",sharedSupply:true,successful:false,expected:false}
].map(x=>{
 const {expected,...input}=x;
 const actual=compareModel(x);
 assert.equal(actual.conditionalConflict,expected,"Model control failed");
 return {caseId:x.label,assumptions:input,result:actual};
});
const report={
 schemaVersion:"OECL_7837_8098_CONDITIONAL_SOURCE_MODEL_TENSION_V1",
 sourceEvidence:{
  erc7837OfficialRevision:agenda.snapshot.revision,
  erc7837DocumentSha256:sha256(aBytes),
  erc8098Reference:expectedSource,
  erc8098ReferenceSourceSha256:sha256(bBytes),evidence
 },
 relation:"CONDITIONAL_TENSION_NOT_EXECUTABLE_INCOMPATIBILITY",
 researchQuestion:"Can a single positive post-deployment transfer on the same token obey both ERC-7837 mint-on-transfer and an ERC-8098-style non-increasing totalSupply invariant?",
 hypotheses:[
  {origin:"ERC-7837_PINNED_OFFICIAL_SPECIFICATION",
   statement:"Under its stated mint-on-transfer conditions, positive q increases the selected token supply by q."},
  {origin:"ERC-8098_PINNED_REFERENCE_AND_HYPOTHESIZED_PROFILE",
   statement:"Assume a post-construction token contract whose supply is strictly non-increasing for every successful operation."}
 ],
 preconditions:[
  "The two properties constrain the SAME on-chain totalSupply variable and SAME successful operation.",
  "Transfer quantity q is strictly positive.",
  "The ERC-7837 maxSupply and other transfer preconditions permit the operation.",
  "The ERC-8098-style property applies after initial deployment; the reference contract is one candidate only."
 ],
 conditionalDerivation:"For q>0, ERC-7837 requires S_after=S_before+q>S_before, while the hypothesized ERC-8098 invariant requires S_after<=S_before. Both cannot hold for the same S_after.",
 modelControls:cases,
 alternatives:[
  "If contracts track separate supplies, no shared-variable contradiction is established.",
  "If transfer reverts (e.g. max supply), no executed state change is implied.",
  "If q=0, the strict conflict argument does not apply.",
  "Changing the semantics, roles, or implementation constraints changes the hypothesis and requires fresh source/evidence review."
 ],
 nextFalsificationExperiment:{
  preregistration:"Pin a concrete implementation claiming BOTH behaviors for the SAME supply variable, with typed transfer ABI and exact post-deployment scope.",
  positive:"Invoke an allowed q>0 transfer with adequate fee/cap; compare supply, balances and emitted events against both predictions.",
  adversarial:"Test q=0, maxSupply boundary, fee failure, and a separate-contract composition as negative controls.",
  independentEvidence:["Pinned Solidity/AST bytecode","Authenticated before/after state and receipt","Distinct role and supply identity","Independent verifier of expected invariants"]
 },
 securityConclusion:"NO_VULNERABILITY_IDENTIFIED",
 scientificVerdict:"INCONCLUSIVE",
 compatibilityVerdict:"NOT_EVALUATED",
 candidateAdmission:"NOT_ADMITTED",evmExecuted:false,
 scope:"PINNED_SOURCE_ONLY_SYMBOLIC_CONDITIONAL_MODEL",
 limitation:"A conditional mathematical tension is not an observed ERC incompatibility, a formal proof about arbitrary bytecode, or any vulnerability report."
};
assert.equal(cases.filter(x=>x.result.conditionalConflict).length,2);
assert(cases.every(x=>!x.result.conditionalConflict||x.result.inDomain));
mkdirSync(dirname(destination),{recursive:true});
writeFileSync(destination,JSON.stringify(report,null,2)+"\n");
console.log("OECL_7837_8098_CONDITIONAL_SOURCE_TENSION_MODEL_PASS",
 JSON.stringify({positiveQuantityConditionalConflicts:2,
   negativeScopeControls:4,evmExecuted:false,
   compatibilityVerdict:report.compatibilityVerdict}));
