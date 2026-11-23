"use strict";
const assert=require("node:assert/strict");
const crypto=require("node:crypto");
const fs=require("node:fs");
const path=require("node:path");
const {createRequire}=require("node:module");
const moduleRequire=createRequire(path.resolve("oecl/integrations/secure-evm-toolchain/package.json"));
const solc=moduleRequire("solc");
const sha256=x=>crypto.createHash("sha256").update(x).digest("hex");
const depRoot=path.resolve(process.argv[2]||"dependency-source");
const fixturePath=path.resolve(process.argv[3]||
  "source-output/erc7201/namespace-formula-observations.json");
const output=path.resolve(process.argv[4]||
  "source-output/erc7201/namespace-slot-evm-witness.json");

const reportBytes=fs.readFileSync(fixturePath);
const report=JSON.parse(reportBytes.toString("utf8"));
assert.equal(report.schemaVersion,"OECL_ERC7201_PINNED_FORMULA_TWO_ORACLE_VALIDATION_V1");
assert.equal(report.officialSource.revision,"e9c1adc6ad36faec8a6bc509cc8a14ec9b8f741d");
assert.equal(report.positiveCases.length,5);
assert(report.positiveCases.every(x=>x.independentByteLevelMatch===true));
assert.equal(report.observedEvmReceipts,0);
const capturedPlanSha256=sha256(reportBytes);
const source=[
"// SPDX-License-Identifier: MIT",
"pragma solidity ^0.8.20;",
"contract OECL7201PureSlotProbe {",
"    event SlotDerived(bytes32 indexed namespaceHash, bytes32 slot);",
"    function namespaceSlot(string memory id) public pure returns (bytes32) {",
"        unchecked {",
"            return bytes32(uint256(keccak256(abi.encode(uint256(keccak256(bytes(id))) - 1))) & ~uint256(0xff));",
"        }",
"    }",
"    function missingMinusOne(string memory id) public pure returns (bytes32) {",
"        return bytes32(uint256(keccak256(abi.encode(uint256(keccak256(bytes(id)))))) & ~uint256(0xff));",
"    }",
"    function publishSlot(string memory id) external {",
"        emit SlotDerived(keccak256(bytes(id)), namespaceSlot(id));",
"    }",
"}"
].join("\n")+"\n";
const sourceSha256=sha256(Buffer.from(source,"utf8"));
assert(solc.version().startsWith("0.8.26+"),"Unreviewed compiler version");
const compiled=JSON.parse(solc.compile(JSON.stringify({
  language:"Solidity",sources:{"OECL7201PureSlotProbe.sol":{content:source}},
  settings:{optimizer:{enabled:false},
    outputSelection:{"*":{"*":["abi","evm.bytecode.object"]}}}
})));
const errors=(compiled.errors||[]).filter(x=>x.severity==="error");
assert.equal(errors.length,0,JSON.stringify(errors).slice(0,1000));
const contract=compiled.contracts?.["OECL7201PureSlotProbe.sol"]?.OECL7201PureSlotProbe;
assert(contract?.abi&&/^[a-f0-9]+$/i.test(contract?.evm?.bytecode?.object||""));
async function main(){
  process.chdir(depRoot);
  const hre=require(path.join(depRoot,"node_modules/hardhat"));
  const chain=await hre.ethers.provider.getNetwork();
  assert.equal(Number(chain.chainId),31337,"MUST_EXECUTE_LOCAL_HARDHAT_ONLY");
  const [owner]=await hre.ethers.getSigners();
  const factory=new hre.ethers.ContractFactory(contract.abi,contract.evm.bytecode.object,owner);
  const probe=await factory.deploy();
  await probe.deployed();
  const provider=hre.ethers.provider;
  const receipts=[];
  for(const item of report.positiveCases){
    const root=await probe.namespaceSlot(item.namespaceId);
    assert.equal(root.toLowerCase(),item.computedRoot.toLowerCase(),
      "On-chain Solidity formula disagrees with independent offchain oracles");
    const wrong=await probe.missingMinusOne(item.namespaceId);
    assert.notEqual(wrong.toLowerCase(),item.computedRoot.toLowerCase(),
      "Deliberately incorrect EVM formula was not rejected");
    const tx=await probe.publishSlot(item.namespaceId);
    const rc=await tx.wait(1);
    assert.equal(rc.status,1);
    const again=await provider.getTransactionReceipt(rc.transactionHash);
    assert(again&&again.status===1);
    assert.equal(again.blockHash.toLowerCase(),rc.blockHash.toLowerCase());
    assert.equal(again.blockNumber,rc.blockNumber);
    const block=await provider.getBlock(rc.blockNumber);
    assert(block&&block.hash.toLowerCase()===again.blockHash.toLowerCase());
    assert(block.transactions.some(h=>h.toLowerCase()===rc.transactionHash.toLowerCase()));
    const txData=await provider.getTransaction(rc.transactionHash);
    assert(txData&&txData.to.toLowerCase()===probe.address.toLowerCase());
    assert.equal(txData.from.toLowerCase(),owner.address.toLowerCase());
    assert.equal(txData.data.slice(0,10).toLowerCase(),
      probe.interface.getSighash("publishSlot(string)").toLowerCase());
    const decoded=probe.interface.decodeFunctionData("publishSlot(string)",txData.data);
    assert.equal(decoded[0],item.namespaceId);
    const eventTopic=probe.interface.getEventTopic("SlotDerived");
    const events=again.logs.filter(l=>l.address.toLowerCase()===
      probe.address.toLowerCase()&&l.topics[0]?.toLowerCase()===eventTopic.toLowerCase())
      .map(l=>probe.interface.parseLog(l));
    assert.equal(events.length,1);
    const expectedHash=hre.ethers.utils.keccak256(hre.ethers.utils.toUtf8Bytes(item.namespaceId));
    assert.equal(events[0].args.namespaceHash.toLowerCase(),expectedHash.toLowerCase());
    assert.equal(events[0].args.slot.toLowerCase(),item.computedRoot.toLowerCase());
    const deployed=await provider.getCode(probe.address,rc.blockNumber);
    assert(deployed!=="0x");
    receipts.push({
      namespaceId:item.namespaceId,
      expectedOffchainRoot:item.computedRoot,
      observedOnchainRoot:root,
      mutationMissingMinusOneRejected:true,
      txHash:rc.transactionHash,
      minedReceiptStatus:rc.status,blockNumber:rc.blockNumber,
      blockHash:rc.blockHash,transactionTo:txData.to,
      methodSelector:txData.data.slice(0,10),
      contractRuntimeCodeKeccak256:hre.ethers.utils.keccak256(deployed),
      receiptAndBlockCheckedAgainstLiveLocalProvider:true,
      decodedEvent:{namespaceHash:events[0].args.namespaceHash,
        slot:events[0].args.slot},
      trustScope:"LOCAL_HARDHAT_ONLY_NOT_MAINNET_CONSENSUS"
    });
  }
  assert.equal(receipts.length,5);
  assert.equal(sha256(fs.readFileSync(fixturePath)),capturedPlanSha256,
    "Original preregistered offchain oracle outcomes were mutated");
  const result={
    schemaVersion:"OECL_ERC7201_SOLIDITY_LOCAL_EVM_SOURCE_SCOPED_WITNESS_V1",
    sourceDocumentSha256:report.officialSource.sourceSha256,
    originalOffchainPlanSha256:capturedPlanSha256,
    compilerVersion:solc.version(),
    fixtureSoliditySha256:sourceSha256,
    fixtureKind:"CONTROLLED_TEST_PROBE_NOT_ERC7201_DEPLOYED_IMPLEMENTATION",
    localChainId:31337,
    contractAddress:probe.address,
    observedSuccesses:receipts.length,
    receipts,
    interpretation:"5_TEST_FIXTURE_SOLIDITY_EXECUTIONS_MATCH_2_OFFCHAIN_ORACLES",
    evmExecuted:true,
    generalCompatibilityVerdict:"NOT_EVALUATED",
    candidateAdmission:"NOT_ADMITTED",
    limitations:[
      "The source is a deliberately small synthetic Solidity formula probe, not a deployed application or full storage-layout conformance test.",
      "Authenticated receipts here mean checked against the running local Hardhat provider, not independent mainnet consensus.",
      "Matching five fixtures does not prove collision freedom or security of every ERC-7201 namespace implementation.",
      "No proxy upgrades, storage writes, or actual struct layout behavior were tested."
    ]
  };
  fs.mkdirSync(path.dirname(output),{recursive:true});
  fs.writeFileSync(output,JSON.stringify(result,null,2)+"\n");
  console.log("OECL_ERC7201_SOLIDITY_LOCAL_EVM_FORMULA_PASS",JSON.stringify({
    matched:receipts.length,mutantRejected:receipts.length,
    localChainId:result.localChainId,
    globalCompatibilityVerdict:result.generalCompatibilityVerdict
  }));
}
main().catch(e=>{console.error(e);process.exitCode=1;});
