import {createHash} from "node:crypto";

/** Extract a source line, not an independently validated invariant or typed ABI. */
export function anchoredSpecCue(id,sourceText){
  if(typeof id!=="string"||!/^ERC-[1-9][0-9]{0,7}$/.test(id)||
    typeof sourceText!=="string"||sourceText.length>400000)return null;
  const lines=sourceText.split(/\r?\n/),headings=[];
  for(let i=0;i<lines.length;i++){
    const m=lines[i].match(/^(#{1,4})[ \t]+(.+?)[ \t]*#*[ \t]*$/);
    if(m)headings.push({index:i,level:m[1].length,title:m[2].trim()});
  }
  const wanted=/^(?:Specification|Standardized interface|Draft interface|Interface Definitions|Interface|Standard json format|Token Semantics|Test Cases|Contract|Data Structures|Format|Package Specification|Draft implementation)$/i;
  const selected=headings.find(h=>wanted.test(h.title));
  if(!selected)return null;
  const next=headings.find(h=>h.index>selected.index&&h.level<=selected.level&&
    !(selected.title.toLowerCase()==="specification"&&/^RecoverableToken$/i.test(h.title)));
  const end=Math.min(next?.index??lines.length,lines.length),candidates=[];
  let inCode=false;
  for(let i=selected.index+1;i<end;i++){
    const raw=lines[i],line=raw.trim();
    if(/^(`{3,}|~{3,})/.test(line)){inCode=!inCode;continue;}
    if(!line||line.length<12||/^#{1,6}\s/.test(line)||
       /^(?:TODO|TBD|FIXME|Copyright)\b/i.test(line)||
       /^\s*(?:\||[-*]\s*[-|]+\s*$)/.test(line))continue;
    const external=/(?:maintained separately|full specification.{0,25}(?:repository|here|external)|refer(?:s)? to.{0,60}version.{0,20}specification)/i.test(line);
    const code=/\b(?:function|event|def)\s+[A-Za-z_][A-Za-z0-9_]*\s*\(/.test(line);
    const rule=/\b(?:MUST(?:\s+NOT)?|SHALL(?:\s+NOT)?|SHOULD(?:\s+NOT)?)\b/i.test(line);
    const format=/\b(?:keccak256|sha256|encode|decode|checksum|storage[- ]location|formula|signature|key derivation|BIP32|hardened|0x19|bytes32|ABI|bitwise|uint256|URI|syntax|derivation|keccak|checksum)\b/i.test(line);
    const descriptive=/\b(?:defined as|defined by|uses|is defined|consists of|represents|contains|calls|define|calculat(?:e|ed|ion)|requires|returned|implements|transfers|increments|decrements|must be|should be|reverts|may be|shall be)\b/i.test(line);
    if(!rule&&!code&&!format&&!descriptive&&!external)continue;
    const evidenceType=external?"EXTERNAL_SPECIFICATION_REFERENCE":
      rule?"NORMATIVE_STATEMENT":code?"DECLARED_CODE_FRAGMENT":
      format?"FORMULA_OR_ENCODING_CUE":"BEHAVIORAL_PROSE_CUE";
    const score=external?12:rule?100:code?85:format?70:45;
    candidates.push({index:i,score,evidenceType,line,inCode});
  }
  candidates.sort((a,b)=>b.score-a.score||a.index-b.index);
  const found=candidates[0];
  if(!found)return null;
  return {ercId:id,sectionTitle:selected.title,evidenceType:found.evidenceType,
    location:{line:found.index+1,sectionLine:selected.index+1},
    sourceLineSha256:createHash("sha256").update(lines[found.index],"utf8").digest("hex"),
    sourceExcerpt:found.line.slice(0,180),exactSourceLineLength:lines[found.index].length,
    codeFenceContext:found.inCode,certainty:"EXACT_TEXT_ANCHOR_ONLY",
    requiresFullSemanticContext:true,
    warning:found.evidenceType==="EXTERNAL_SPECIFICATION_REFERENCE"?
      "External specification must be read and pinned before conformance claims.":
      "Code examples, text and headings are not verified ABI, behavior or executed invariants."};
}
