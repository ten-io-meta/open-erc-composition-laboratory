"use strict";
const assert=require("node:assert/strict");
const crypto=require("node:crypto");
const fs=require("node:fs");
const path=require("node:path");
const {createRequire}=require("node:module");
const deps=createRequire(path.resolve(__dirname,"../../integrations/secure-evm-toolchain/package.json"));
const solc=deps("solc");
const sha256=x=>crypto.createHash("sha256").update(x).digest("hex");
const depRoot=path.resolve(process.argv[2]||"dependency-source");
const referencePath=path.resolve(process.argv[3]||
  "pinned-ercs/assets/erc-2535/reference/Diamond.sol");
const specPath=path.resolve(process.argv[4]||"pinned-ercs/ERCS/erc-2535.md");
const erc7201Path=path.resolve(process.argv[5]||
  "source-output/erc7201/namespace-formula-observations.json");
const output=path.resolve(process.argv[6]||
  "source-output/erc2535/pinned-diamond-local-evm-witness.json");
const refBytes=fs.readFileSync(referencePath);
const specBytes=fs.readFileSync(specPath);
const erc7201Bytes=fs.readFileSync(erc7201Path);
const reference=refBytes.toString("utf8");
const spec=specBytes.toString("utf8");
const named=JSON.parse(erc7201Bytes.toString("utf8"));
const namespace="oecl.storage.ERC7201";
const root=named.positiveCases.find(x=>x.namespaceId===namespace);
assert(root&&root.independentByteLevelMatch===true);
assert.equal(named.officialSource.revision,"e9c1adc6ad36faec8a6bc509cc8a14ec9b8f741d");
assert(reference.includes("contract DiamondCutFacet is IDiamondCut"));
assert(reference.includes("contract DiamondLoupeFacet is IDiamondLoupe, IERC165"));
assert(reference.includes("contract Diamond {"));
assert(reference.includes("LibDiamond.enforceIsContractOwner();"));
assert(reference.includes("emit DiamondCut(_diamondCut, _init, _calldata);"));
assert(spec.includes("A diamond calls functions from its facets using"));
assert(spec.includes("A " + String.fromCharCode(96) +
  "DiamondCut" + String.fromCharCode(96) + " event must be emitted"));
const facetSource=[
"// SPDX-License-Identifier: MIT",
"pragma solidity ^0.8.20;",
"abstract contract OECLSharedSlot {",
"    function _slot() internal pure returns (bytes32) {",
"        unchecked {",
"            return bytes32(uint256(keccak256(abi.encode(uint256(keccak256(bytes('oecl.storage.ERC7201'))) - 1))) & ~uint256(0xff));",
"        }",
"    }",
"}",
"contract OECLFacetV1 is OECLSharedSlot {",
"    function setValue(uint256 value) external {",
"        bytes32 slot=_slot();",
"        assembly { sstore(slot, value) }",
"    }",
"    function getValue() external view returns (uint256 value) {",
"        bytes32 slot=_slot();",
"        assembly { value := sload(slot) }",
"    }",
"    function storageRoot() external pure returns (bytes32) { return _slot(); }",
"}",
"contract OECLFacetV2 is OECLSharedSlot {",
"    function setValue(uint256 value) external {",
"        uint256 doubled=value*2;",
"        bytes32 slot=_slot();",
"        assembly { sstore(slot, doubled) }",
"    }",
"}"
].join("\n")+"\n";
assert(solc.version().startsWith("0.8.26+"));
const sources={
  "ERC2535DiamondReference.sol":{content:reference},
  "OECLControlledFacets.sol":{content:facetSource}
};
const compiled=JSON.parse(solc.compile(JSON.stringify({
  language:"Solidity",sources,
  settings:{optimizer:{enabled:false},outputSelection:{"*":{"*":["abi","evm.bytecode.object"]}}}
})));
const errors=(compiled.errors||[]).filter(e=>e.severity==="error");
assert.equal(errors.length,0,JSON.stringify(errors).slice(0,1100));
function outputOf(file,contract){
 const result=compiled.contracts?.[file]?.[contract];
 assert(result?.abi&&/^[0-9a-f]+$/i.test(result?.evm?.bytecode?.object||""),
   "Missing Solidity bytecode for "+contract);
 return result;
}
const officialFile="ERC2535DiamondReference.sol";
const cutOut=outputOf(officialFile,"DiamondCutFacet");
const loupeOut=outputOf(officialFile,"DiamondLoupeFacet");
const diamondOut=outputOf(officialFile,"Diamond");
const v1Out=outputOf("OECLControlledFacets.sol","OECLFacetV1");
const v2Out=outputOf("OECLControlledFacets.sol","OECLFacetV2");
const signers=[];
async function mustRevert(label,promise){
 let rejected=false;
 try{await promise;}catch{rejected=true;}
 assert(rejected,"Expected scoped negative-call revert: "+label);
 return {label,execution:"READ_ONLY_CALLSTATIC_REVERT",minedReceipt:false};
}
async function main(){
 process.chdir(depRoot);
 const hre=require(path.join(depRoot,"node_modules/hardhat"));
 const [owner,attacker]=await hre.ethers.getSigners();
 const {ethers}=hre,provider=ethers.provider;
 const network=await provider.getNetwork();
 assert.equal(Number(network.chainId),31337);
 const ZERO=ethers.constants.AddressZero;
 async function deploy(out,args=[]){
  const c=await new ethers.ContractFactory(out.abi,out.evm.bytecode.object,owner).deploy(...args);
  await c.deployed();return c;
 }
 const cutFacet=await deploy(cutOut),loupeFacet=await deploy(loupeOut);
 const firstFacet=await deploy(v1Out),secondFacet=await deploy(v2Out);
 const cutInterface=cutFacet.interface,loupeInterface=loupeFacet.interface;
 const selector=iface=>Object.keys(iface.functions).map(s=>iface.getSighash(s));
 const initialCut=[
  {facetAddress:cutFacet.address,action:0,functionSelectors:selector(cutInterface)},
  {facetAddress:loupeFacet.address,action:0,functionSelectors:selector(loupeInterface)}
 ];
 const diamond=await deploy(diamondOut,[initialCut,
   {owner:owner.address,init:ZERO,initCalldata:"0x"}]);
 const cut=new ethers.Contract(diamond.address,cutOut.abi,owner);
 const loupe=new ethers.Contract(diamond.address,loupeOut.abi,owner);
 const proxyV1=new ethers.Contract(diamond.address,v1Out.abi,owner);
 const getSelector=firstFacet.interface.getSighash("getValue()");
 const setSelector=firstFacet.interface.getSighash("setValue(uint256)");
 const rootSelector=firstFacet.interface.getSighash("storageRoot()");
 const steps=[],negative=[];
 const diamondCutTopic=cut.interface.getEventTopic("DiamondCut");
 const diamondStorage=ethers.utils.keccak256(ethers.utils.toUtf8Bytes("diamond.standard.diamond.storage"));
 assert.notEqual(diamondStorage.toLowerCase(),root.computedRoot.toLowerCase(),
   "Sample ERC7201 namespace overlaps reference Diamond internal storage");

 async function verifyReceipt(tx,label,expectedCutAction){
  const receipt=await tx.wait(1);
  assert.equal(receipt.status,1,label+" reverted");
  const fetched=await provider.getTransactionReceipt(receipt.transactionHash);
  assert(fetched&&fetched.status===1);
  assert.equal(fetched.blockHash.toLowerCase(),receipt.blockHash.toLowerCase());
  const block=await provider.getBlock(receipt.blockNumber);
  assert(block&&block.hash.toLowerCase()===receipt.blockHash.toLowerCase());
  assert(block.transactions.some(h=>h.toLowerCase()===receipt.transactionHash.toLowerCase()));
  const txData=await provider.getTransaction(receipt.transactionHash);
  assert(txData&&txData.to.toLowerCase()===diamond.address.toLowerCase());
  assert.equal(txData.from.toLowerCase(),owner.address.toLowerCase());
  const events=receipt.logs.filter(l=>l.address.toLowerCase()===diamond.address.toLowerCase()&&
    l.topics[0]?.toLowerCase()===diamondCutTopic.toLowerCase())
    .map(l=>cut.interface.parseLog(l));
  if(expectedCutAction!==null){
    assert.equal(events.length,1,"Missing required DiamondCut event");
    assert(events[0].args._diamondCut.some(x=>Number(x.action)===expectedCutAction));
  }
  const code=await provider.getCode(diamond.address,receipt.blockNumber);
  assert(code!=="0x");
  return {label,txHash:receipt.transactionHash,blockNumber:receipt.blockNumber,
    blockHash:receipt.blockHash,receiptStatus:receipt.status,
    contractCodeKeccak256:ethers.utils.keccak256(code),
    diamondCutEvents:events.length,expectedCutAction,
    checkedAgainst:"LIVE_LOCAL_HARDHAT_PROVIDER"};
 }
 const initialRc=await diamond.deployTransaction.wait(1);
 const initialEvents=initialRc.logs.filter(l=>
   l.address.toLowerCase()===diamond.address.toLowerCase()&&
   l.topics[0]?.toLowerCase()===diamondCutTopic.toLowerCase());
 assert.equal(initialEvents.length,1,"Reference Diamond constructor omitted DiamondCut event");
 assert.equal((await loupe.facetAddress(cut.interface.getSighash("diamondCut"))).toLowerCase(),
   cutFacet.address.toLowerCase());

 const added={facetAddress:firstFacet.address,action:0,
   functionSelectors:[setSelector,getSelector,rootSelector]};
 steps.push(await verifyReceipt(await cut.diamondCut([added],ZERO,"0x"),
   "ADD_V1_THREE_SELECTORS",0));
 assert.equal((await loupe.facetAddress(setSelector)).toLowerCase(),firstFacet.address.toLowerCase());
 assert.equal((await loupe.facetAddress(getSelector)).toLowerCase(),firstFacet.address.toLowerCase());
 assert.equal((await proxyV1.storageRoot()).toLowerCase(),root.computedRoot.toLowerCase());
 assert.equal((await proxyV1.getValue()).toString(),"0");
 assert.equal((await firstFacet.getValue()).toString(),"0");

 negative.push(await mustRevert("DUPLICATE_SELECTOR_ADDITION",
   cut.callStatic.diamondCut([added],ZERO,"0x")));
 negative.push(await mustRevert("NON_OWNER_DIAMOND_CUT",
   cut.connect(attacker).callStatic.diamondCut([
     {facetAddress:secondFacet.address,action:1,functionSelectors:[setSelector]}
   ],ZERO,"0x")));
 assert.equal((await loupe.facetAddress(setSelector)).toLowerCase(),
   firstFacet.address.toLowerCase());

 steps.push(await verifyReceipt(await proxyV1.setValue(7),"DELEGATED_STATE_SET_7",null));
 assert.equal((await proxyV1.getValue()).toString(),"7");
 assert.equal((await firstFacet.getValue()).toString(),"0",
   "Delegatecall wrote to facet storage instead of diamond storage");
 const beforeReplacement=(await proxyV1.getValue()).toString();
 const replaced={facetAddress:secondFacet.address,action:1,functionSelectors:[setSelector]};
 steps.push(await verifyReceipt(await cut.diamondCut([replaced],ZERO,"0x"),
   "REPLACE_SET_VALUE_SELECTOR",1));
 assert.equal((await loupe.facetAddress(setSelector)).toLowerCase(),
   secondFacet.address.toLowerCase());
 assert.equal((await loupe.facetAddress(getSelector)).toLowerCase(),
   firstFacet.address.toLowerCase());
 assert.equal((await proxyV1.getValue()).toString(),beforeReplacement,
   "Facet replacement changed existing diamond storage");
 steps.push(await verifyReceipt(await proxyV1.setValue(10),"DELEGATED_V2_SETS_20",null));
 assert.equal((await proxyV1.getValue()).toString(),"20");
 assert.equal((await firstFacet.getValue()).toString(),"0");
 const removed={facetAddress:ZERO,action:2,functionSelectors:[setSelector]};
 steps.push(await verifyReceipt(await cut.diamondCut([removed],ZERO,"0x"),
   "REMOVE_SET_VALUE_SELECTOR",2));
 assert.equal((await loupe.facetAddress(setSelector)).toLowerCase(),ZERO.toLowerCase());
 negative.push(await mustRevert("REMOVED_SELECTOR_NOT_DISPATCHABLE",
   proxyV1.callStatic.setValue(99)));
 assert.equal((await proxyV1.getValue()).toString(),"20");
 assert.equal((await proxyV1.storageRoot()).toLowerCase(),root.computedRoot.toLowerCase());
 const finalRoot=await proxyV1.storageRoot();
 assert.equal(finalRoot.toLowerCase(),root.computedRoot.toLowerCase());

 const report={
  schemaVersion:"OECL_ERC2535_PINNED_DIAMOND_ERC7201_NAMESPACE_LOCAL_EVM_V1",
  source:{
    repository:"ethereum/ERCs",revision:"e9c1adc6ad36faec8a6bc509cc8a14ec9b8f741d",
    erc2535DocumentSha256:sha256(specBytes),
    diamondReferencePath:"assets/erc-2535/reference/Diamond.sol",
    diamondReferenceSourceSha256:sha256(refBytes),
    controlledFacetSourceSha256:sha256(Buffer.from(facetSource)),
    offchainErc7201FormulaResultSha256:sha256(erc7201Bytes),
    compilerVersion:solc.version()
  },
  configuration:{
    chainId:31337,owner:owner.address,nonOwner:attacker.address,
    diamond:diamond.address,diamondCutFacet:cutFacet.address,
    diamondLoupeFacet:loupeFacet.address,facetV1:firstFacet.address,facetV2:secondFacet.address,
    erc7201NamespaceId:namespace,verifiedStorageRoot:root.computedRoot,
    diamondInternalStorageRoot:diamondStorage
  },
  initialConstructorDiamondCutEventObserved:true,
  positiveMinedReceipts:steps,
  simulatedNegativeControls:negative,
  measuredState:{
    afterDelegatedV1Write:"7",afterFacetReplacement:"7",afterDelegatedV2Write:"20",
    afterSelectorRemoval:"20",directFacetV1State:"0"
  },
  evmExecuted:true,observedMinedSuccesses:steps.length,
  observedReadOnlyReverts:negative.length,
  scientificStatus:"SCOPED_PINNED_REFERENCE_AND_SYNTHETIC_FACET_EXPERIMENT",
  globalCompatibilityVerdict:"NOT_EVALUATED",
  candidateAdmission:"NOT_ADMITTED",
  securityConclusion:"NO_EXPLOIT_IDENTIFIED_IN_TESTED_OWNER_ONLY_PATH",
  trust:"LIVE_LOCAL_HARDHAT_RECEIPTS_NOT_MAINNET_CONSENSUS",
  limitations:[
    "Diamond.sol was pinned from the official ERC repository; V1/V2 facets are synthetic experiment code and not production-vetted contracts.",
    "Owner enforcement, duplicate selectors, event emission and storage retention were tested only for the exact sampled calls and revisions.",
    "Namespace collision-freedom, global upgrade security, malicious delegatecall behavior and general ERC2535/7201 interoperability remain unproven.",
    "Read-only callStatic reverts are unmined negative evidence."
  ]
 };
 assert.equal(report.observedMinedSuccesses,5);
 assert.equal(report.observedReadOnlyReverts,3);
 fs.mkdirSync(path.dirname(output),{recursive:true});
 fs.writeFileSync(output,JSON.stringify(report,null,2)+"\n");
 console.log("OECL_ERC2535_PINNED_DIAMOND_7201_NAMESPACE_EVM_PASS",JSON.stringify({
   minedActions:steps.length,negativeControls:negative.length,
   constructorDiamondCutObserved:true,namespaceRootMatched:true,
   globalCompatibility:report.globalCompatibilityVerdict
 }));
}
main().catch(e=>{console.error(e);process.exitCode=1;});
