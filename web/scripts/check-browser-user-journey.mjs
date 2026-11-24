import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

// Tests the actual Next.js production build in a real headless Chromium browser.
// No wallet, chain deployment, researcher token or external UI-test dependency.
const webPort=31982,chromePort=31983;
const productionOrigin="https://open-erc-composition-laboratory.vercel.app";
const remote=process.env.OECL_BROWSER_BASE_URL||"";
if(remote&&remote!==productionOrigin)
  throw Error("Production browser check is restricted to the verified OECL domain");
const base=remote||"http://127.0.0.1:"+webPort;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let app,browser,connection,profile;
function stop(p){if(p?.pid)try{process.kill(-p.pid,"SIGTERM");}catch{}}
async function until(fn,reason,timeout=30000){
  const start=Date.now();
  while(Date.now()-start<timeout){
    try{const v=await fn();if(v)return v;}catch{}
    await sleep(250);
  }
  throw Error("Timed out: "+reason);
}
function locateChrome(){
  for(const binary of [process.env.OECL_CHROME_BIN,"google-chrome","google-chrome-stable","chromium","chromium-browser"]){
    if(!binary)continue;
    const result=spawnSync(binary,["--version"],{stdio:"ignore"});
    if(!result.error&&result.status===0)return binary;
  }
  throw Error("Headless Chrome/Chromium is not available on the runner");
}
async function devtools(target){
  const socket=new WebSocket(target);
  await new Promise((resolve,reject)=>{
    socket.addEventListener("open",resolve,{once:true});
    socket.addEventListener("error",reject,{once:true});
  });
  connection=socket;
  let seq=0;
  const requests=new Map();
  socket.addEventListener("message",event=>{
    const m=JSON.parse(String(event.data));
    if(!m.id||!requests.has(m.id))return;
    const task=requests.get(m.id);requests.delete(m.id);
    if(m.error)task.reject(Error(JSON.stringify(m.error)));
    else task.resolve(m.result);
  });
  const send=(method,params={})=>new Promise((resolve,reject)=>{
    const id=++seq;
    requests.set(id,{resolve,reject});
    socket.send(JSON.stringify({id,method,params}));
  });
  const evalJs=async expression=>{
    const result=await send("Runtime.evaluate",{expression,returnByValue:true,awaitPromise:true});
    if(result.exceptionDetails)throw Error("Browser exception: "+result.exceptionDetails.text);
    return result.result.value;
  };
  return {send,evalJs};
}
async function test(){
  if(!remote){
    app=spawn("npm",["run","start","--","--port",String(webPort)],{
      cwd:process.cwd(),detached:true,stdio:"ignore"
    });
  }
  await until(async()=>{
    if(app&&app.exitCode!==null)throw Error("Next production server exited");
    return (await fetch(base)).status===200;
  },remote?"Vercel production deployment readiness":"local production server startup",
    remote?100000:40000);
  console.log("OECL_BROWSER_VERIFIED_TARGET:"+base);
  profile=await mkdtemp(join(tmpdir(),"oecl-ui-"));
  browser=spawn(locateChrome(),[
    "--headless=new","--no-sandbox","--disable-dev-shm-usage",
    "--no-first-run","--no-default-browser-check","--remote-allow-origins=*",
    "--remote-debugging-port="+chromePort,"--user-data-dir="+profile,
    "about:blank"
  ],{detached:true,stdio:"ignore"});
  const tab=await until(async()=>{
    if(browser.exitCode!==null)throw Error("Chrome exited");
    const pages=await(await fetch("http://127.0.0.1:"+chromePort+"/json/list")).json();
    return pages.find(x=>x.type==="page"&&x.webSocketDebuggerUrl);
  },"DevTools browser startup",20000);
  const {send,evalJs}=await devtools(tab.webSocketDebuggerUrl);
  await send("Page.enable");await send("Runtime.enable");
  const expectUi=(exp,label,timeout=30000)=>until(()=>evalJs(exp),label,timeout);
  const click=async title=>{
    const exp='(()=>{const button=[...document.querySelectorAll("button")].find(x=>x.textContent?.includes('+
      JSON.stringify(title)+'));if(!button||button.disabled)return false;button.click();return true;})()';
    assert.equal(await evalJs(exp),true,"Missing or disabled button: "+title);
  };
  await send("Page.navigate",{url:base});
  await expectUi('document.querySelector("#composition-workbench")!==null',"new top-level composition workbench");
  assert.equal(await evalJs('document.querySelector("label[for=oecl-protocol-a]")?.innerText.trim()'),"ERC protocol A");
  assert.equal(await evalJs('document.querySelector("label[for=oecl-protocol-b]")?.innerText.trim()'),"ERC protocol B");
  assert.equal(await evalJs('document.querySelectorAll("#oecl-protocol-a").length'),1);
  assert.equal(await evalJs('document.querySelectorAll("#oecl-protocol-b").length'),1);
  const headerBefore=await evalJs('document.body.innerText.indexOf("Choose any two ERC standards")');
  const otherBefore=await evalJs('document.body.innerText.indexOf("Related data, separate scientific questions")');
  assert.ok(headerBefore>=0&&otherBefore>headerBefore,"Main composition UI must appear before secondary services");
  await expectUi('document.querySelector("[data-testid=oecl-outcome]")!==null',"verified pair summary automatically loads");
  assert.equal(await evalJs('document.querySelector("[data-testid=oecl-outcome]").innerText.includes("INCONCLUSIVE")'),true);
  assert.equal(await evalJs('document.querySelector("[data-testid=oecl-outcome]").innerText.includes("0.1 ETH")'),true);
  console.log("OECL_BROWSER_IMMEDIATE_FINDINGS_PASS");

  await click("Browse all ERCs");
  await expectUi('document.querySelector("[data-testid=oecl-catalog-list]")!==null',
    "ERC directory loads with official entries or clearly labeled partial local fallback");
  const catalogApi=await fetch(base+"/api/scientific/erc-catalog");
  assert.equal(catalogApi.status,200);
  const catalogJson=await catalogApi.json();
  assert.ok(["COMPLETE_OFFICIAL_INDEX","PARTIAL_LOCAL_INDEX"].includes(catalogJson.status));
  assert.ok(catalogJson.entries.some(x=>x.id==="ERC-8060"&&x.sourceProfile));
  if(catalogJson.status==="COMPLETE_OFFICIAL_INDEX"){
    assert.ok(catalogJson.officialCount>=50);
    assert.ok(catalogJson.entries.some(x=>x.origin==="OFFICIAL_ERC_REPOSITORY"));
  }else assert.match(catalogJson.message,/temporarily unavailable/);
  const filteredCatalog=await evalJs('(()=>{const x=document.getElementById("oecl-catalog-search");if(!(x instanceof HTMLInputElement))return false;const set=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,"value").set;set.call(x,"8060");x.dispatchEvent(new Event("input",{bubbles:true}));return true})()');
  assert.equal(filteredCatalog,true);
  await expectUi('document.querySelector("[data-testid=oecl-catalog-list]")?.innerText.includes("ERC-8060")',
    "catalog search includes OECL source profile even if not in official repo");
  assert.equal(await evalJs('document.querySelector("[data-testid=oecl-catalog-list]")?.innerText.includes("ERC-8060")'),true);
  await click("Close ERC directory");
  console.log("OECL_BROWSER_FULL_ERC_DIRECTORY_PASS:"+catalogJson.status+":"+catalogJson.officialCount);

  assert.equal(await evalJs('[...document.querySelectorAll("button")].find(x=>x.textContent?.includes("ERC-8004 live chain observations"))?.getAttribute("aria-expanded")'),"false");
  console.log("OECL_BROWSER_DEFERRED_SECONDARY_DATA_PASS");
  const gateway=await fetch(base+"/api/live/evidence/erc8004");
  const liveState=await gateway.json();
  if(gateway.status===503&&liveState.status==="NOT_CONFIGURED"){
    await click("ERC-8004 live chain observations & EvidenceReceipts");
    await expectUi('document.body.innerText.includes("Live ERC-8004 verification is not configured")',
      "Gateway states that no live receipt was created");
    console.log("OECL_BROWSER_UNCONFIGURED_GATEWAY_TRUTHFUL_PASS");
  }

  await click("EVM & evidence");
  await expectUi('document.querySelector("[aria-label=\\"Pinned scientific evidence report\\"]")!==null',"pinned 8060 x 8098 dossier");
  assert.equal(await evalJs('document.querySelector("[aria-label=\\"Pinned scientific evidence report\\"]").innerText.includes("INCONCLUSIVE")'),true);
  const dossier=await fetch(base+"/api/scientific/dossier?protocolA=ERC-8060&protocolB=ERC-8098&download=1");
  assert.equal(dossier.status,200,"Dossier JSON export must be accessible");
  assert.match(dossier.headers.get("content-disposition")||"",/attachment; filename=/);
  const dossierJson=await dossier.json();
  assert.equal(dossierJson.verdict,"INCONCLUSIVE");
  assert.equal(dossierJson.candidateAdmission,"NOT_ADMITTED");
  const expanded=await evalJs('(()=>{const d=[...document.querySelectorAll("details")].find(x=>x.querySelector("summary")?.textContent?.includes("scientific questions and evidence"));if(!d)return false;d.open=true;return d.open&&d.textContent.includes("Evidence:");})()');
  assert.equal(expanded,true,"Scientific questions must expose real evidence");
  console.log("OECL_BROWSER_DOSSIER_DISCLOSURE_AND_JSON_PASS");
  console.log("OECL_BROWSER_DOSSIER_PASS");

  await click("Capabilities & graph");
  await expectUi('document.querySelector("[aria-label=\\"Interactive verified Solidity AST graph\\"]")!==null',"source-only graph");
  const count=await evalJs('document.querySelectorAll("svg [role=button]").length');
  assert.ok(count>2,"Interactive AST nodes must be visible");
  await click("Hypotheses");
  assert.equal(await evalJs('[...document.querySelectorAll("button")].some(x=>x.textContent?.trim()==="Hypotheses"&&x.getAttribute("aria-pressed")==="true")'),true);
  const keyboard=await evalJs('(()=>{const n=document.querySelector("svg [role=button]");if(!n)return false;n.dispatchEvent(new KeyboardEvent("keydown",{key:"Enter",bubbles:true}));return true})()');
  assert.equal(keyboard,true,"AST graph nodes should support keyboard interaction");
  await expectUi('document.querySelector("[aria-label=\\"Selected AST node\\"]")!==null',"keyboard-selected node details");
  console.log("OECL_BROWSER_GRAPH_FILTER_AND_KEYBOARD_PASS");
  console.log("OECL_BROWSER_AST_GRAPH_PASS:"+count);

  await click("NFT redemption × burnable token");
  await expectUi('document.querySelector("[data-testid=oecl-outcome]")?.innerText.includes("Ten independent local EVM receipts")',
    "same pair selection updates summary");
  await click("EVM & evidence");
  await expectUi('document.querySelector("[aria-label=\\"Independent local EVM evidence and scientific evaluation\\"]")!==null',
    "independent EVM panel matches selected pair");
  const num=await evalJs('document.querySelectorAll("[aria-label=\\"Independent local EVM evidence and scientific evaluation\\"] table tbody tr").length');
  assert.equal(num,10,"Ten local EVM receipts must be visible");
  assert.equal(await evalJs('document.querySelector("[aria-label=\\"Independent local EVM evidence and scientific evaluation\\"]").innerText.includes("NOT_ADMITTED")'),true);
  console.log("OECL_BROWSER_EVM_RECEIPTS_PASS:"+num);

  await click("ERC-1155 × ERC-20 (negative control)");
  await expectUi('document.querySelector("[data-testid=oecl-outcome]")?.innerText.includes("No supported structural relationship discovered")',
    "negative control does not claim a relation");
  await click("Capabilities & graph");
  await expectUi('document.body.innerText.includes("No supported relation discovered under the current rules")',
    "negative control graph evidence");
  console.log("OECL_BROWSER_NEGATIVE_CONTROL_PASS");

  await click("Vaults × fungible tokens");
  await expectUi('document.getElementById("oecl-protocol-a")?.value==="ERC-4626" && document.getElementById("oecl-protocol-b")?.value==="ERC-20"',
    "arbitrary official ERC pair is selectable");
  await expectUi('document.querySelector("[data-testid=oecl-documentary-results]")!==null',
    "published ERC documentary research is returned",30000);
  assert.equal(await evalJs('document.querySelector("[data-testid=oecl-documentary-results]").innerText.includes("NOT EVALUATED")'),true);
  assert.equal(await evalJs('document.querySelector("[data-testid=oecl-documentary-results]").innerText.includes("NOT ADMITTED")'),true);
  const documentary=await fetch(base+"/api/scientific/standards-pair?protocolA=ERC-4626&protocolB=ERC-20");
  assert.equal(documentary.status,200,"Documentary endpoint must return scoped response");
  const documentaryJson=await documentary.json();
  assert.equal(documentaryJson.status,"DOCUMENTARY_COMPARISON");
  assert.equal(documentaryJson.scientificVerdict,"NOT_EVALUATED");
  assert.equal(documentaryJson.evmExecuted,false);
  assert.equal(documentaryJson.implementationVerified,false);
  if(documentaryJson.standards.every(s=>s.availability==="PUBLISHED")){
    assert.equal(documentaryJson.relation.kind,"DECLARED_DEPENDENCY");
    assert.ok(documentaryJson.relation.statements.some(s=>s.includes("ERC-4626")&&s.includes("ERC-20")));
  }else assert.equal(documentaryJson.relation.kind,"INCOMPLETE_SPECIFICATIONS");
  await expectUi('document.querySelector("[data-testid=oecl-erc4626-evm]")!==null',
    "seven independent ERC4626 x ERC20 local EVM receipts are visible",30000);
  assert.equal(await evalJs('document.querySelectorAll("[data-testid=oecl-erc4626-evm] table tbody tr").length'),7);
  assert.equal(await evalJs('document.querySelector("[data-testid=oecl-erc4626-evm]").innerText.includes("GLOBAL VERDICT INCONCLUSIVE")'),true);
  assert.equal(await evalJs('document.querySelector("[data-testid=oecl-erc4626-evm]").innerText.includes("callStatic")'),true);
  console.log("OECL_BROWSER_NEW_ERC4626_LOCAL_EVM_PASS:7:3");
  await expectUi('document.querySelector("[data-testid=oecl-scientific-cycle]")!==null',
    "read-only source hypothesis to falsifier to EVM to conclusion");
  assert.equal(await evalJs('document.querySelectorAll("[data-testid=oecl-cycle-case]").length'),3);
  assert.equal(await evalJs('document.querySelector("[data-testid=oecl-scientific-cycle]").innerText.includes("COMPATIBILITY NOT EVALUATED")'),true);
  assert.equal(await evalJs('document.querySelector("[data-testid=oecl-scientific-cycle]").innerText.includes("returned 0x (empty bytes)")'),true);
  console.log("OECL_BROWSER_VAULT_SCIENCE_CYCLE_PASS:3");

  await click("Monotone supply × vault shares (scientific cycle)");
  await sleep(1300);
  const secondDiagnostic=await evalJs('JSON.stringify({heading:document.querySelector("[data-testid=oecl-pair-report] h3")?.textContent,workbenches:document.querySelectorAll("#composition-workbench").length,reports:document.querySelectorAll("[data-testid=oecl-pair-report]").length,cycles:[...document.querySelectorAll("[data-testid=oecl-scientific-cycle]")].map(n=>({pair:n.getAttribute("data-pair"),visible:n.getClientRects().length>0,ancestorHidden:!!n.closest("[hidden],[aria-hidden=true]"),text:n.innerText.slice(0,760),kindPresent:n.innerText.includes("POTENTIAL COUPLED STATE DECREASE")})),alerts:[...document.querySelectorAll("[role=alert]")].map(n=>n.innerText.slice(0,220))})');
  console.log("OECL_BROWSER_SECOND_CYCLE_DIAGNOSTIC:"+secondDiagnostic);
  await expectUi('(()=>{const n=[...document.querySelectorAll("[data-testid=oecl-scientific-cycle]")].find(n=>n.getAttribute("data-pair")==="ERC-8098|ERC-4626");return !!n && n.innerText.includes("POTENTIAL COUPLED STATE DECREASE")})()',
    "second reviewed independent hypothesis-to-EVM report",12000);
  const displayIntegrity=await evalJs('JSON.stringify([...document.querySelectorAll("[data-testid=oecl-scientific-cycle]")].filter(n=>n.getClientRects().length>0).map(n=>n.getAttribute("data-pair")))');
  assert.deepEqual(JSON.parse(displayIntegrity),["ERC-8098|ERC-4626"],
    "Only the currently selected pair may have a visible scientific-cycle panel");
  assert.equal(await evalJs('(()=>{const n=[...document.querySelectorAll("[data-testid=oecl-scientific-cycle]")].find(n=>n.getAttribute("data-pair")==="ERC-8098|ERC-4626");return n?.querySelectorAll("[data-testid=oecl-cycle-case]").length})()'),2);
  assert.equal(await evalJs('(()=>{const n=[...document.querySelectorAll("[data-testid=oecl-scientific-cycle]")].find(n=>n.getAttribute("data-pair")==="ERC-8098|ERC-4626");return n?.innerText.includes("successful zero-quantity")})()'),true);
  assert.equal(await evalJs('(()=>{const n=[...document.querySelectorAll("[data-testid=oecl-scientific-cycle]")].find(n=>n.getAttribute("data-pair")==="ERC-8098|ERC-4626");return n?.innerText.includes("COMPATIBILITY NOT EVALUATED")})()'),true);
  console.log("OECL_BROWSER_SECOND_SCIENCE_CYCLE_PASS:2");
  await click("Vaults × fungible tokens");
  await expectUi('document.querySelector("[data-testid=oecl-erc4626-evm]")!==null',
    "return to verified vault-specific evidence");

  console.log("OECL_BROWSER_ANY_ERC_DOCUMENTARY_COMPARISON_PASS");

  await expectUi('document.querySelector("[data-testid=oecl-fresh-ast]")?.innerText.includes("PINNED SOURCE AVAILABLE")',
    "new ERC-4626 x ERC-20 source profiles are eligible for fresh compiler AST");
  const sourceConfig=await fetch(base+"/api/scientific/source-jobs");
  assert.equal(sourceConfig.status,200);
  const sourceJson=await sourceConfig.json();
  assert.equal(sourceJson.runsEvm,false);
  assert.equal(sourceJson.sources.length,10);
  for(const n of ["ERC-165","ERC-2612","ERC-2981","ERC-4626"])
    assert.ok(sourceJson.sources.some(x=>x.id===n),"new pinned source profile "+n);
  if(!sourceJson.enabled){
    assert.equal(await evalJs('document.querySelector("[data-testid=oecl-fresh-ast]")?.innerText.includes("not activated")'),true);
    assert.equal(await evalJs('document.querySelectorAll("[data-testid=oecl-fresh-ast] button").length'),0);
  }
  console.log("OECL_BROWSER_FRESH_SOURCE_PREFLIGHT_PASS");


  const edited=await evalJs('(()=>{const el=document.getElementById("oecl-protocol-a");if(!(el instanceof HTMLInputElement))return false;const set=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,"value").set;set.call(el,"ERC-99999");el.dispatchEvent(new Event("input",{bubbles:true}));return true})()');
  assert.equal(edited,true);
  await expectUi('document.getElementById("oecl-protocol-a")?.value==="ERC-99999"',"unlisted ERC user input");
  await click("Inspect pair");
  await expectUi('document.querySelector("[data-testid=oecl-no-evidence]")!==null',
    "unverified pair does not invent scientific evidence");
  assert.equal(await evalJs('document.querySelector("[data-testid=oecl-no-evidence]").innerText.includes("neither a compatibility approval")'),true);
  console.log("OECL_BROWSER_UNSUPPORTED_PAIR_TRUTHFUL_PASS");

  await expectUi('document.querySelector("[data-testid=oecl-fresh-ast]")?.innerText.includes("SOURCE REVIEW REQUIRED")',
    "unregistered ERC needs concrete source and cannot start EVM");
  console.log("OECL_BROWSER_UNREGISTERED_SOURCE_FAIL_CLOSED_PASS");


  const graphDiscover=await fetch(base+"/api/live/the-graph/discover?protocol=ERC-8004");
  const graphState=await graphDiscover.json();
  if(graphDiscover.status===503&&graphState.status==="NOT_CONFIGURED"){
    await click("Advanced protocol discovery via The Graph");
    await click("Discover");
    await expectUi('document.body.innerText.includes("Live The Graph search is not configured here")',
      "The Graph unavailable is not misrepresented as empty");
    assert.equal(await evalJs('document.body.innerText.includes("0 subgraphs discovered.")'),false);
    console.log("OECL_BROWSER_GRAPH_UNCONFIGURED_TRUTHFUL_PASS");
  }

  await send("Emulation.setDeviceMetricsOverride",{width:390,height:844,deviceScaleFactor:1,mobile:true});
  await sleep(600);
  const geometry=await evalJs('({viewport:innerWidth,content:document.documentElement.scrollWidth})');
  assert.ok(geometry.content<=geometry.viewport+12,"Mobile horizontal overflow: "+JSON.stringify(geometry));
  console.log("OECL_BROWSER_MOBILE_PASS:"+JSON.stringify(geometry));
  console.log("OECL_BROWSER_USER_JOURNEY: PASS — dossier, AST graph, independent EVM, negative control, mobile");
}
try{await test();}
finally{
  if(connection?.readyState===WebSocket.OPEN)connection.close();
  stop(browser);stop(app);
  if(profile)await rm(profile,{recursive:true,force:true}).catch(()=>{});
}
