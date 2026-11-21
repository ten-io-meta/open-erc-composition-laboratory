"use strict";
const fs=require("node:fs"),assert=require("node:assert/strict"),crypto=require("node:crypto");
const {execFileSync}=require("node:child_process");
const [sourceA,sourceB,reportPath]=process.argv.slice(2);
assert.ok(sourceA&&sourceB&&reportPath);
const SHA_A="c7eed906835ab39fbc8439eb0493e5a5371b23a2";
const SHA_B="68a05289bd68d89db8453c49500e0a1ae6cd11ec";
const revision=dir=>execFileSync("git",["-C",dir,"rev-parse","HEAD"],{encoding:"utf8"}).trim();
assert.equal(revision(sourceA),SHA_A);
assert.equal(revision(sourceB),SHA_B);
const raw=fs.readFileSync(reportPath);
const e=JSON.parse(raw);
assert.equal(e.schemaVersion,"OECL_PINNED_MULTIHOLDER_SOLVENCY_V1");
assert.equal(e.chainId,31337);
assert.equal(e.sourceRevisions.erc8060,SHA_A);
assert.equal(e.sourceRevisions.erc8098,SHA_B);
assert.equal(e.candidateAdmission,"NOT_ADMITTED");
assert.equal(e.scientificPolarity,"INCONCLUSIVE");
assert.equal(e.holders.length,2);
assert.notEqual(e.holders[0].toLowerCase(),e.holders[1].toLowerCase());
for(const h of e.holders)assert.match(h,/^0x[a-f0-9]{40}$/i);
const hashes=Object.values(e.tx);
assert.equal(hashes.length,3);
assert.equal(new Set(hashes).size,3);
for(const hash of hashes)assert.match(hash,/^0x[a-f0-9]{64}$/i);
const uint=v=>{assert.match(v,/^(0|[1-9][0-9]*)$/);return BigInt(v)};
const s=[e.before,e.afterSurplus,e.afterFirst,e.afterSecond];
for(const item of s){
  const backing=uint(item.backingWei),obligation=uint(item.obligationsWei),supply=uint(item.tokenSupply);
  assert.ok(backing>=obligation);
  assert.ok(supply<=100000000000000000000n);
}
const per=100000000000000000n,token=1000000000000000000n;
assert.equal(uint(e.surplusWithdrawnWei),40000000000000000n);
assert.equal(uint(e.before.backingWei),240000000000000000n);
assert.equal(uint(e.before.obligationsWei),2n*per);
assert.equal(uint(e.before.tokenSupply),100n*token);
assert.equal(e.before.nft1Owner,e.holders[0]);
assert.equal(e.before.nft2Owner,e.holders[1]);
assert.equal(uint(e.afterSurplus.backingWei),uint(e.afterSurplus.obligationsWei));
assert.equal(uint(e.afterSurplus.obligationsWei),2n*per);
assert.equal(uint(e.afterSurplus.tokenSupply),100n*token);
assert.equal(e.afterFirst.nft1Owner,null);
assert.equal(e.afterFirst.nft2Owner,e.holders[1]);
assert.equal(uint(e.afterFirst.backingWei),per);
assert.equal(uint(e.afterFirst.obligationsWei),per);
assert.equal(uint(e.afterFirst.tokenSupply),99n*token);
assert.equal(e.afterSecond.nft1Owner,null);
assert.equal(e.afterSecond.nft2Owner,null);
assert.equal(uint(e.afterSecond.backingWei),0n);
assert.equal(uint(e.afterSecond.obligationsWei),0n);
assert.equal(uint(e.afterSecond.tokenSupply),98n*token);
assert.equal(e.outcome,"TWO_INDEPENDENT_JOINT_BURNS_AFTER_MAX_ALLOWED_SURPLUS");
const result={
 schemaVersion:"OECL_PINNED_MULTIHOLDER_SOLVENCY_VALIDATED_V1",
 evidenceSha256:crypto.createHash("sha256").update(raw).digest("hex"),
 sourceRevisions:[SHA_A,SHA_B],
 checkedSourceObservedState:true,
 independentHolders:2,
 withdrawals:1,
 jointBurns:2,
 allMeasuredStatesSolvent:true,
 scientificPolarity:"INCONCLUSIVE",
 caveat:"Validates emitted Hardhat observations, not independent EVM replay or concurrent transaction interleavings."
};
fs.writeFileSync(reportPath.replace(/\.json$/,".validated.json"),JSON.stringify(result,null,2)+"\n");
console.log("OECL_MULTI_HOLDER_VALIDATED:"+JSON.stringify(result));
