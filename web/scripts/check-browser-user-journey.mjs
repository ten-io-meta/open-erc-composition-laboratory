import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

// Tests the actual Next.js production build in a real headless Chromium browser.
// No wallet, chain deployment, researcher token or external UI-test dependency.
const webPort=31982,chromePort=31983;
const base="http://127.0.0.1:"+webPort;
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
  app=spawn("npm",["run","start","--","--port",String(webPort)],{
    cwd:process.cwd(),detached:true,stdio:"ignore"
  });
  await until(async()=>{
    if(app.exitCode!==null)throw Error("Next production server exited");
    return (await fetch(base)).status===200;
  },"production server startup",40000);
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
  const expectUi=(exp,label)=>until(()=>evalJs(exp),label);
  const click=async title=>{
    const exp='(()=>{const button=[...document.querySelectorAll("button")].find(x=>x.textContent?.includes('+
      JSON.stringify(title)+'));if(!button||button.disabled)return false;button.click();return true;})()';
    assert.equal(await evalJs(exp),true,"Missing or disabled button: "+title);
  };
  await send("Page.navigate",{url:base});
  await expectUi('document.querySelector("#composition-workbench")!==null',"composition workbench");
  await expectUi('[...document.querySelectorAll("button")].some(x=>x.textContent?.includes("Explore verified AST example"))',"hydrated source laboratory");
  assert.equal(await evalJs('document.body.innerText.includes("Fresh analysis is disabled")'),true);
  assert.equal(await evalJs('document.querySelector("label[for=oecl-protocol-a]")?.innerText.trim()'),"ERC protocol A");
  assert.equal(await evalJs('document.querySelector("label[for=oecl-protocol-b]")?.innerText.trim()'),"ERC protocol B");
  const gateway=await fetch(base+"/api/live/evidence/erc8004");
  const liveState=await gateway.json();
  if(gateway.status===503&&liveState.status==="NOT_CONFIGURED"){
    await expectUi('document.body.innerText.includes("Live ERC-8004 verification is not configured")',
      "live gateway explicitly tells visitor that no receipt was created");
    assert.equal(await evalJs('document.body.innerText.includes("Target networks (design)")'),true);
    console.log("OECL_BROWSER_UNCONFIGURED_GATEWAY_TRUTHFUL_PASS");
  }
  await click("Inspect available evidence");
  await expectUi('document.querySelector("[aria-label=\\"Pinned scientific evidence report\\"]")!==null',"pinned 8060 x 8098 dossier");
  assert.equal(await evalJs('document.querySelector("[aria-label=\\"Pinned scientific evidence report\\"]").innerText.includes("INCONCLUSIVE")'),true);
  const dossier=await fetch(base+"/api/scientific/dossier?protocolA=ERC-8060&protocolB=ERC-8098&download=1");
  assert.equal(dossier.status,200,"Dossier JSON export must be accessible");
  assert.match(dossier.headers.get("content-disposition")||"",/attachment; filename=/);
  const dossierJson=await dossier.json();
  assert.equal(dossierJson.verdict,"INCONCLUSIVE");
  assert.equal(dossierJson.candidateAdmission,"NOT_ADMITTED");
  const expanded=await evalJs('(()=>{const d=[...document.querySelectorAll("details")].find(x=>x.querySelector("summary")?.textContent?.includes("scientific questions and evidence"));if(!d)return false;d.open=true;return d.open&&d.textContent.includes("Evidence:");})()');
  assert.equal(expanded,true,"Scientific questions disclosure must expand actual source evidence");
  console.log("OECL_BROWSER_DOSSIER_DISCLOSURE_AND_JSON_PASS");
  console.log("OECL_BROWSER_DOSSIER_PASS");

  await click("Explore verified AST example");
  await expectUi('document.querySelector("[aria-label=\\"Interactive verified Solidity AST graph\\"]")!==null',"source-only graph");
  const count=await evalJs('document.querySelectorAll("svg [role=button]").length');
  assert.ok(count>2,"Interactive AST nodes must be visible");
  await click("Hypotheses");
  assert.equal(await evalJs('[...document.querySelectorAll("button")].some(x=>x.textContent?.trim()==="Hypotheses"&&x.getAttribute("aria-pressed")==="true")'),true);
  const keyboard=await evalJs('(()=>{const n=document.querySelector("svg [role=button]");if(!n)return false;n.dispatchEvent(new KeyboardEvent("keydown",{key:"Enter",bubbles:true}));return true})()');
  assert.equal(keyboard,true,"Graph nodes should be keyboard navigable");
  await expectUi('document.querySelector("[aria-label=\\\"Selected AST node\\\"]")!==null',
    "keyboard-focused AST node details");
  console.log("OECL_BROWSER_GRAPH_FILTER_AND_KEYBOARD_PASS");
  console.log("OECL_BROWSER_AST_GRAPH_PASS:"+count);

  await click("Explore verified independent EVM evidence");
  await expectUi('document.querySelector("[aria-label=\\"Independent local EVM evidence and scientific evaluation\\"]")!==null',"EVM evidence");
  const num=await evalJs('document.querySelectorAll("[aria-label=\\"Independent local EVM evidence and scientific evaluation\\"] table tbody tr").length');
  assert.equal(num,10,"Ten local EVM receipts must be visible");
  assert.equal(await evalJs('document.querySelector("[aria-label=\\"Independent local EVM evidence and scientific evaluation\\"]").innerText.includes("NOT_ADMITTED")'),true);
  console.log("OECL_BROWSER_EVM_RECEIPTS_PASS:"+num);

  const selected=await evalJs('(()=>{for(const [id,value] of [["source-a","ERC-1155"],["source-b","ERC-20"]]){const s=document.getElementById(id);if(!(s instanceof HTMLSelectElement))return false;s.value=value;s.dispatchEvent(new Event("change",{bubbles:true}));}return true;})()');
  assert.equal(selected,true);
  await expectUi('document.getElementById("source-a")?.value==="ERC-1155"&&document.getElementById("source-b")?.value==="ERC-20"',"negative control selection");
  await click("Explore verified AST example");
  await expectUi('document.body.innerText.includes("No supported relation discovered under the current rules")',"negative control without hypothetical compatibility");
  console.log("OECL_BROWSER_NEGATIVE_CONTROL_PASS");

  const graphDiscover=await fetch(base+"/api/live/the-graph/discover?protocol=ERC-8004");
  const graphState=await graphDiscover.json();
  if(graphDiscover.status===503&&graphState.status==="NOT_CONFIGURED"){
    const advanced=await evalJs('(()=>{const s=[...document.querySelectorAll("summary")].find(x=>x.textContent?.includes("Advanced protocol discovery"));if(!s)return false;s.click();return s.parentElement?.open===true})()');
    assert.equal(advanced,true,"Advanced protocol discovery disclosure must open");
    await click("Discover");
    await expectUi('document.body.innerText.includes("Live The Graph search is not configured here")',
      "The Graph missing configuration is not misrepresented as zero results");
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
