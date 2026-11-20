// OECL public ERC discovery. Documentary facts are not compatibility evidence.
export function normalizeErc(value) {
  const match = String(value ?? "").trim().match(/^(?:ERC[-\s]?)?([1-9]\d{0,7})$/i);
  return match ? "ERC-" + Number(match[1]) : null;
}
export function parseFrontmatter(source) {
  const match = source.replace(/^\uFEFF/, "").match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};
  const metadata = {};
  for (const line of match[1].split(/\r?\n/)) {
    const item = line.match(/^([a-zA-Z][\w-]*):\s*(.*?)\s*$/);
    if (item) metadata[item[1].toLowerCase()] = item[2].replace(/^["']|["']$/g, "");
  }
  return metadata;
}
export function parseOfficialErc(path, source) {
  const fileMatch = path.match(/^ERCS\/erc-([1-9]\d*)\.md$/i);
  if (!fileMatch) return null;
  const number = Number(fileMatch[1]), meta = parseFrontmatter(source);
  if (meta.eip && Number(meta.eip) !== number) return null;
  if (meta.category && meta.category.toUpperCase() !== "ERC") return null;
  const id = "ERC-" + number;
  const full = source.replace(/^\uFEFF/, "");
  const abstractMatch = full.match(/^#{1,3}\s+(?:Abstract|Simple Summary)\s*$([\s\S]*?)(?=^#{1,3}\s|\s*$)/im);
  const abstractText = abstractMatch ? abstractMatch[1] : "";
  const summary = abstractText.replace(/<[^>]+>/g, " ").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[\x60*_#]/g, "").replace(/\s+/g, " ").trim().slice(0, 320);
  const requires = [...new Set((meta.requires || "").match(/\b[1-9]\d+\b/g) || [])]
    .map(x => "ERC-" + Number(x)).filter(x => x !== id).sort((a,b) => Number(a.slice(4)) - Number(b.slice(4)));
  const mentioned = [...new Set([...full.matchAll(/\b(?:ERC|EIP)[-\s]?([1-9]\d{1,7})\b/gi)]
    .map(m => "ERC-" + Number(m[1])))].filter(x => x !== id && !requires.includes(x))
    .sort((a,b) => Number(a.slice(4)) - Number(b.slice(4))).slice(0, 28);
  const sourceUrl = "https://github.com/ethereum/ERCs/blob/master/" + path;
  const discussionUrl = /^(https:\/\/(?:ethereum-magicians\.org|github\.com)\/[^\s<>]+)$/i
    .test(meta["discussions-to"] || "") ? meta["discussions-to"] : null;
  return {id,number,title:meta.title || id,status:meta.status || "Unknown",
    category:meta.category || "ERC",created:meta.created || null,
    summary,requires,mentions:mentioned,discussionUrl,
    sourceUrl,canonicalUrl:"https://eips.ethereum.org/EIPS/erc-" + number};
}
export function indexedDiscussionIds(topic) {
  const title = String(topic?.title ?? "");
  return [...new Set([...title.matchAll(/\b(?:ERC|EIP)[-\s]?([1-9]\d{1,7})\b/gi)]
    .map(m => "ERC-" + Number(m[1])))];
}
export function relatePair(a,b) {
  const declared = a.requires.includes(b.id) || b.requires.includes(a.id);
  const mentions = a.mentions.includes(b.id) || b.mentions.includes(a.id);
  return {
    declaredDependency:declared,
    mentionedTogether:mentions,
    evidenceLevel: declared ? "DOCUMENTED_DEPENDENCY" : mentions ? "DOCUMENTARY_MENTION" : "NO_DOCUMENTARY_LINK",
    scientificConclusion:"NOT_EVALUATED",
    emergentProperties:[],
    caution:"Requirements, references and forum discussion do not demonstrate runtime composition, boundary preservation or emergent properties."
  };
}
