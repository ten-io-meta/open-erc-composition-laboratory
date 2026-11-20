/**
 * Refresh official ERC index into a file; does not modify GitHub or publish web deployments.
 * Source: canonical ethereum/ERCs GitHub repository. Records presence, never endorsement.
 */
import { readFile, writeFile } from "node:fs/promises";

const url="https://api.github.com/repos/ethereum/ERCs";
const output=new URL("../web/src/data/officialErcIndex.json",import.meta.url);
const headers={
  "Accept":"application/vnd.github+json",
  "User-Agent":"OECL-ERC-indexer/1.0",
  ...(process.env.GITHUB_TOKEN?{"Authorization":"Bearer "+process.env.GITHUB_TOKEN}:{})
};
async function get(endpoint) {
  const res=await fetch(url+endpoint,{headers,signal:AbortSignal.timeout(20000)});
  if(!res.ok)throw Error("GitHub API "+res.status+" for "+endpoint);
  return res.json();
}
const [branch,tree]=await Promise.all([
  get("/branches/master"),
  get("/git/trees/master?recursive=1")
]);
if(tree.truncated||!Array.isArray(tree.tree))throw Error("Truncated GitHub tree; not publishing incomplete ERC index.");
const ids=tree.tree.flatMap(f=>{
  if(f.type!=="blob")return [];
  const m=/^ERCS\/erc-(\d+)\.md$/i.exec(f.path);
  return m?[Number(m[1])]:[];
}).sort((a,b)=>a-b);
if(ids.length<300||new Set(ids).size!==ids.length)throw Error("Invalid or unexpectedly small ERC index.");
const updated={
  schemaVersion:"OECL_OFFICIAL_ERC_INDEX_V1",
  source:"ethereum/ERCs",
  branch:"master",
  sourceTreeSha:tree.sha,
  sourceCommitSha:branch.commit.sha,
  description:"Official GitHub ERC documents; indexed presence only, not composition validation",
  count:ids.length,
  ids
};
const old=JSON.parse(await readFile(output,"utf8"));
if(JSON.stringify(old)!==JSON.stringify(updated)) {
  await writeFile(output,JSON.stringify(updated,null,2)+"\n","utf8");
  console.log("ERC_INDEX_UPDATED "+JSON.stringify({count:ids.length,commit:branch.commit.sha}));
}else console.log("ERC_INDEX_UNCHANGED "+JSON.stringify({count:ids.length,commit:branch.commit.sha}));
