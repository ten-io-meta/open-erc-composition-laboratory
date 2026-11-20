/**
 * HTTP-level smoke test of the actual Next.js server with fixed read-only inputs.
 * No wallet, blockchain transaction, contract deployment or write routes.
 */
const port=process.env.OECL_WEB_PORT||"3100";
const base="http://127.0.0.1:"+port;
async function get(path) {
 const r=await fetch(base+path,{signal:AbortSignal.timeout(45000)});
 return {status:r.status,json:await r.json()};
}
const ok=(x,msg)=>{if(!x)throw Error(msg)};
const index=await get("/api/research/erc-index");
ok(index.status===200&&index.json.indexedDocumentCount>=626,"Official ERC index unavailable");
ok(index.json.coverage==="PRESENCE_INDEX_ONLY","Index must never claim compatibility");
const invalid=await get("/api/research/erc-pair?a=ERC-721&b=ERC-721");
ok(invalid.status===400,"Same ERC twice must be rejected");
const pair=await get("/api/research/erc-pair?a=ERC-721&b=ERC-1155");
ok(pair.status===200,"Official ERC documentary comparison failed");
ok(pair.json.standards.every(x=>x.status==="FETCHED"),"Official ERC corpus should be locally available");
ok(pair.json.newExperimentExecuted===false&&pair.json.emergentPropertiesVerified.length===0,
 "Documentary sources must not claim a proved emergent property");
const proposal=await get("/api/research/erc-pair?a=ERC-721&b=ERC-8060");
ok(proposal.status===200,"Open ERC proposal comparison API unavailable");
ok(proposal.json.standards[0].status==="FETCHED","ERC-721 must be in official corpus");
const proposalStatus=proposal.json.standards[1].status;
if(proposalStatus==="OPEN_PROPOSAL_PR") {
 ok(proposal.json.standards[1].requires.includes("ERC-721"),"PR source declaration was not parsed");
 ok(proposal.json.documentaryRelations.some(x=>x.kind==="PROPOSAL_REQUIRES"),
    "PR dependency must retain provisional source tier");
}else{
 console.log("OECL_PROPOSAL_REMOTE_INCOMPLETE "+proposalStatus);
 // A missing network/GitHub source cannot be silently promoted to official.
 ok(proposalStatus==="NOT_IN_OFFICIAL_SNAPSHOT",
    "Unverified PR must remain unestablished");
}
ok(proposal.json.emergentPropertiesVerified.length===0,"PR alone cannot prove emergence");
console.log("OECL_RESEARCH_HTTP_PASS "+JSON.stringify({
 indexed:index.json.indexedDocumentCount,officialPair:pair.json.protocols,
 proposalStatus,provenProperties:0
}));
