"use strict";
const assert=require("node:assert/strict");
const crypto=require("node:crypto");
const fs=require("node:fs");
const path=require("node:path");
const {createRequire}=require("node:module");

const modules=path.resolve("oecl/integrations/secure-evm-toolchain/package.json");
const toolchainRequire=createRequire(modules);
const ethers=toolchainRequire("ethers");
const {keccak256:independentKeccak}=toolchainRequire("ethereum-cryptography/keccak");
const source=path.resolve(process.argv[2]||"pinned-ercs/ERCS/erc-7201.md");
const output=path.resolve(process.argv[3]||"source-output/erc7201/namespace-formula-observations.json");
const sourceBytes=fs.readFileSync(source);
const text=sourceBytes.toString("utf8"),lines=text.split(/\r?\n/);
const sha256=x=>crypto.createHash("sha256").update(x).digest("hex");
const selector="erc7201(id: string) = keccak256(keccak256(id) - 1) & ~0xff";
const matches=lines.map((line,index)=>line.includes(selector)?index:-1).filter(x=>x>=0);
assert.equal(matches.length,1,"Wrong ERC-7201 formula or ambiguous source anchor");
assert(text.includes("keccak256(abi.encode(uint256(keccak256(bytes(id))) - 1)) & ~bytes32(uint256(0xff))"),
  "Pinned ERC-7201 formula and ABI encoding must be available");
const MAX=(1n<<256n)-1n;
const MASK=MAX ^ 255n;
const asHex=v=>"0x"+(v&MASK).toString(16).padStart(64,"0");
const inputCases=[
  "openzeppelin.storage.ERC20",
  "openzeppelin.storage.ERC721",
  "oecl.storage.ERC7201",
  "",
  "déjà-vu.存储"
];
const results=inputCases.map(id=>{
  // First oracle: ethers 5 Keccak + ethers' canonical ABI uint256 encoder.
  const hashA=ethers.utils.keccak256(ethers.utils.toUtf8Bytes(id));
  const minusA=BigInt(hashA)-1n;
  assert(minusA>=0n);
  const encodedA=ethers.utils.defaultAbiCoder.encode(["uint256"],[minusA.toString()]);
  const hashAOuter=ethers.utils.keccak256(encodedA);
  const rootA=asHex(BigInt(hashAOuter));

  // Independent oracle: ethereum-cryptography Keccak + manual 32-byte
  // big-endian uint256 encoding (not ethers ABI or ethers Keccak).
  const hashB=Buffer.from(independentKeccak(Buffer.from(id,"utf8")));
  const minusB=BigInt("0x"+hashB.toString("hex"))-1n;
  assert(minusB>=0n);
  const encodedB=Buffer.from(minusB.toString(16).padStart(64,"0"),"hex");
  const hashBOuter=Buffer.from(independentKeccak(encodedB));
  const rootB=asHex(BigInt("0x"+hashBOuter.toString("hex")));
  assert.equal(hashB.toString("hex"),hashA.slice(2));
  assert.equal(encodedB.toString("hex"),encodedA.slice(2));
  assert.equal(rootA,rootB,"Independent EIP-7201 formula oracles disagree for "+JSON.stringify(id));
  assert(/^0x[0-9a-f]{64}$/.test(rootA));
  assert.equal(BigInt(rootA)&255n,0n,"Slot is not 256-byte aligned");

  // Sanity: two deliberately wrong interpretations are NOT the EIP-7201
  // formula. This rejects common false positives; it is not a collision proof.
  const skippedMinusOne=asHex(BigInt(ethers.utils.keccak256(
    ethers.utils.defaultAbiCoder.encode(["uint256"],[hashA]))));
  const skippedOuterHash=asHex(minusA);
  const sha3=asHex(BigInt("0x"+crypto.createHash("sha3-256")
    .update(encodedB).digest("hex")));
  assert.notEqual(rootA,skippedMinusOne,
    "Mutant without the subtract-one step escaped the negative control");
  assert.notEqual(rootA,skippedOuterHash,
    "Mutant without outer Keccak escaped the negative control");
  assert.notEqual(rootA,sha3,
    "SHA3-256 must not be substituted for Ethereum Keccak-256");
  return {
    namespaceId:id,namespaceIdUtf8Sha256:sha256(Buffer.from(id,"utf8")),
    computedRoot:rootA,oracleA:"ethers@5.8.0_KECCAK_ABI",
    oracleB:"ethereum-cryptography_KECCAK_MANUAL_UINT256_ENCODING",
    independentByteLevelMatch:true,alignedTo256ByteBoundary:true,
    negativeControls:[
      "OMIT_MINUS_ONE_REJECTED",
      "OMIT_OUTER_KECCAK_REJECTED",
      "SUBSTITUTE_SHA3_256_REJECTED"
    ]
  };
});
assert.equal(new Set(results.map(x=>x.computedRoot)).size,results.length,
  "Sample namespace collisions: fail closed, not a universal claim");
const report={
  schemaVersion:"OECL_ERC7201_PINNED_FORMULA_TWO_ORACLE_VALIDATION_V1",
  officialSource:{
    repository:"ethereum/ERCs",
    revision:"e9c1adc6ad36faec8a6bc509cc8a14ec9b8f741d",
    path:"ERCS/erc-7201.md",
    sourceSha256:sha256(sourceBytes),
    formulaLine:matches[0]+1,
    formulaSourceLineSha256:sha256(Buffer.from(lines[matches[0]],"utf8"))
  },
  interpretation:"EXACT_ERC7201_FORMULA_TWO_INDEPENDENT_OFFCHAIN_KECCAK_IMPLEMENTATIONS",
  positiveCases:results,
  testCases:results.length,
  negativeControlKinds:3,
  observationsFrom:"OFFCHAIN_COMPUTATION_NOT_EVM",
  independentOnchainExecution:false,
  observedEvmReceipts:0,
  scientificConclusion:"FORMULA_MATCHES_TWO_OFFCHAIN_ORACLES_FOR_TESTED_IDS",
  generalCompatibilityVerdict:"NOT_EVALUATED",
  candidateAdmission:"NOT_ADMITTED",
  limitations:[
    "Two Keccak implementations plus two uint256 encoders establish scoped reproducibility, not a mathematical collision-freedom theorem.",
    "No pinned Solidity implementation/storage layout was executed by this test and no EVM receipt was inspected.",
    "A conforming formula does not prove safety of a particular proxy upgrade, storage layout or namespace annotation.",
    "The five tested namespace strings are examples, not a universal quantification."
  ]
};
fs.mkdirSync(path.dirname(output),{recursive:true});
fs.writeFileSync(output,JSON.stringify(report,null,2)+"\n");
console.log("OECL_ERC7201_TWO_ORACLE_FORMULA_CONTROLS_PASS",JSON.stringify({
  cases:results.length,negativeControls:3,
  exampleRoot:results[0].computedRoot,
  evmExecuted:false,globalCompatibility:report.generalCompatibilityVerdict
}));
