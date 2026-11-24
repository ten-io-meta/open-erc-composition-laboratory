import assert from "node:assert/strict";
import {decodeErc165Boolean} from "../src/server/oeclCandidateEvidenceVerifier.ts";

const word=n=>"0x"+n.toString(16).padStart(64,"0");
assert.equal(decodeErc165Boolean(word(0)),false);
assert.equal(decodeErc165Boolean(word(1)),true);
for(const invalid of [
  null,undefined,false,1,"0x","0x0","0x1","0x01","0x"+("0".repeat(63)),
  word(2),word(255),"0x"+"f".repeat(64),"0x"+"g".repeat(64),
  "0x"+"0".repeat(65),"0x"+"0".repeat(64)+"01",
  "0X"+"0".repeat(63)+"1"
]){
  assert.throws(()=>decodeErc165Boolean(invalid),
    /invalid ABI boolean|noncanonical ABI boolean/,
    "Malformed ERC165 bool must fail closed: "+String(invalid));
}
console.log("OECL_ERC165_ABI_BOOLEAN_STRICT_ENCODING_PASS");
