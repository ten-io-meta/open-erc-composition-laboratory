import { inflateRawSync } from "node:zlib";

const MAX_ZIP_BYTES = 1_500_000;
const MAX_FILES = 24;
const MAX_FILE_BYTES = 450_000;
const MAX_TOTAL_BYTES = 1_250_000;
const ZIP_END = 0x06054b50;
const CENTRAL_FILE = 0x02014b50;
const LOCAL_FILE = 0x04034b50;

export class ScientificArchiveError extends Error {
  readonly code: string;
  constructor(code: string) { super(code); this.code=code; }
}
function fail(code: string): never { throw new ScientificArchiveError(code); }
function crc32(input: Buffer): number {
  let crc = 0xffffffff;
  for (const byte of input) {
    crc ^= byte;
    for (let i=0;i<8;i++) crc = (crc>>>1) ^ ((crc&1) ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}
/**
 * Strict bounded ZIP reader for trusted GitHub Actions evidence artifacts.
 * It allows deflate or stored entries, checks central/local header agreement,
 * uncompressed size, CRC and path shape, and rejects ZIP64/encryption/symlinks.
 */
export function readScientificArchive(input: Buffer): Map<string, unknown> {
  if (input.length<22 || input.length>MAX_ZIP_BYTES) fail("ARCHIVE_SIZE_LIMIT");
  let end=-1;
  for(let i=input.length-22;i>=Math.max(0,input.length-65557);i--){
    if(input.readUInt32LE(i)===ZIP_END && i+22+input.readUInt16LE(i+20)===input.length){
      end=i;break;
    }
  }
  if(end<0)fail("ARCHIVE_CENTRAL_DIRECTORY_MISSING");
  const disk=input.readUInt16LE(end+4);
  const entries=input.readUInt16LE(end+10);
  const size=input.readUInt32LE(end+12),offset=input.readUInt32LE(end+16);
  if(disk!==0 || input.readUInt16LE(end+6)!==0 ||
     input.readUInt16LE(end+8)!==entries || entries<1 ||
     entries>MAX_FILES || size===0xffffffff || offset===0xffffffff ||
     offset+size>end) fail("ARCHIVE_DIRECTORY_INVALID");
  let pos=offset,total=0;
  const result=new Map<string,unknown>();
  for(let i=0;i<entries;i++){
    if(pos+46>offset+size || input.readUInt32LE(pos)!==CENTRAL_FILE)
      fail("ARCHIVE_CENTRAL_ENTRY_INVALID");
    const flags=input.readUInt16LE(pos+8), method=input.readUInt16LE(pos+10);
    const crc=input.readUInt32LE(pos+16),compressed=input.readUInt32LE(pos+20);
    const uncompressed=input.readUInt32LE(pos+24);
    const nameLen=input.readUInt16LE(pos+28),extraLen=input.readUInt16LE(pos+30);
    const commentLen=input.readUInt16LE(pos+32),diskStart=input.readUInt16LE(pos+34);
    const attrs=input.readUInt32LE(pos+38), localOffset=input.readUInt32LE(pos+42);
    if((flags&~0x808)!==0 || ![0,8].includes(method) || diskStart!==0 ||
       !nameLen || nameLen>150 || compressed>MAX_ZIP_BYTES ||
       uncompressed>MAX_FILE_BYTES || uncompressed===0xffffffff ||
       compressed===0xffffffff || ((attrs>>>16)&0xf000)===0xa000)
      fail("ARCHIVE_ENTRY_UNSUPPORTED");
    const nameEnd=pos+46+nameLen, next=nameEnd+extraLen+commentLen;
    if(next>offset+size) fail("ARCHIVE_ENTRY_BOUNDS");
    const name=input.subarray(pos+46,nameEnd).toString("utf8");
    if(!/^(?:pair-[a-z0-9-]+\/)?[a-z0-9-]+\.json$/.test(name)||
       name.includes("..") || result.has(name)) fail("ARCHIVE_PATH_UNTRUSTED");
    if(localOffset+30>input.length || input.readUInt32LE(localOffset)!==LOCAL_FILE)
      fail("ARCHIVE_LOCAL_HEADER_INVALID");
    if(input.readUInt16LE(localOffset+6)!==flags ||
       input.readUInt16LE(localOffset+8)!==method)fail("ARCHIVE_LOCAL_CENTRAL_MISMATCH");
    const localNameLen=input.readUInt16LE(localOffset+26);
    const localExtraLen=input.readUInt16LE(localOffset+28);
    const dataOffset=localOffset+30+localNameLen+localExtraLen;
    if(dataOffset+compressed>offset||
       input.subarray(localOffset+30,localOffset+30+localNameLen).toString("utf8")!==name)
      fail("ARCHIVE_FILE_BOUNDS");
    const body=input.subarray(dataOffset,dataOffset+compressed);
    let unzipped:Buffer;
    try{
      unzipped=method===8?
        inflateRawSync(body,{maxOutputLength:MAX_FILE_BYTES}):Buffer.from(body);
    }catch{fail("ARCHIVE_INFLATE_FAILURE");}
    total+=unzipped.length;
    if(unzipped.length!==uncompressed || total>MAX_TOTAL_BYTES ||
       crc32(unzipped)!==crc)fail("ARCHIVE_CRC_OR_INFLATED_SIZE_MISMATCH");
    try{
      result.set(name,JSON.parse(new TextDecoder("utf-8",{fatal:true}).decode(unzipped)));
    }catch{fail("ARCHIVE_JSON_INVALID");}
    pos=next;
  }
  if(pos!==offset+size)fail("ARCHIVE_TRAILING_CENTRAL_DATA");
  return result;
}

export function extractSourceEvidence(
  archive: Map<string,unknown>, prefix: string,
) {
  const required = [
    "structural-ast-graph.json",
    "generic-source-hypotheses.json",
    "source-scientific-report.json",
  ] as const;
  const documents = required.map(filename => archive.get(prefix+filename));
  if(documents.some(item=>!item || typeof item!=="object")) fail("ARTIFACT_DOCUMENT_MISSING");
  const report=documents[2] as Record<string,unknown>;
  const pathFeasibility=archive.get(prefix+"path-feasibility.json");
  if(report.pathFeasibilityArtifactSha256!==undefined&&
     (!pathFeasibility||typeof pathFeasibility!=="object"))
    fail("PATH_FEASIBILITY_DOCUMENT_MISSING");
  return {graph:documents[0],discovery:documents[1],report:documents[2],
    pathFeasibility};
}
