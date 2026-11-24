import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {anchoredSpecCue} from "./oecl-spec-anchor.mjs";
const h=s=>createHash("sha256").update(s).digest("hex");
const tick=String.fromCharCode(96);
const code=tick.repeat(3);
const cases=[
 ["ERC-55","---\neip: 55\n---\n# Specification\n\nThe checksum is encoded using keccak256 over address hex digits.\n# Rationale\n","FORMULA_OR_ENCODING_CUE",6],
 ["ERC-191","## Abstract\nHi\n## Specification\nWe propose the following format for signed_data:\n0x19 <version> <data>\n## Rationale\n","FORMULA_OR_ENCODING_CUE",5],
 ["ERC-897","## Standardized interface\n\n"+code+"solidity\nfunction implementation() external view returns (address codeAddr);\n"+code+"\n## Benefits","DECLARED_CODE_FRAGMENT",4],
 ["ERC-7201","## Specification\n\nThe formula is defined as keccak256(keccak256(id) - 1) & ~0xff.\n## Rationale","FORMULA_OR_ENCODING_CUE",3],
 ["ERC-2535","## Specification\n\nA diamond calls functions from its facets using delegatecall.\n## Rationale","BEHAVIORAL_PROSE_CUE",3],
 ["ERC-67","## Specification\nThe full specification is maintained separately in another repository.\n## Rationale","EXTERNAL_SPECIFICATION_REFERENCE",2]
];
for(const [id,source,kind,line] of cases){
  const result=anchoredSpecCue(id,source);
  assert(result,"Missing exact original line");
  assert.equal(result.evidenceType,kind);
  assert.equal(result.location.line,line);
  assert.equal(result.sourceLineSha256,h(source.split("\n")[line-1]));
  assert.equal(result.certainty,"EXACT_TEXT_ANCHOR_ONLY");
  assert.equal(result.requiresFullSemanticContext,true);
}
assert.equal(anchoredSpecCue("ERC-55","## Abstract\nA standard without extractable specification."),null);
assert.equal(anchoredSpecCue("ERC-55","## Specification\nTODO\n## Rationale"),null);
assert.equal(anchoredSpecCue("ERC-55","## Specification\n\nfoobar\n## Rationale"),null);
assert.equal(anchoredSpecCue("ERC-55","## Specification\nkeccak256(value)\n## Rationale")?.location.line,2);
assert.equal(anchoredSpecCue("ERC-55",{"malformed":true}),null);
console.log("OECL_ERC_SPEC_ANCHOR_FAIL_CLOSED_PASS",cases.length);
