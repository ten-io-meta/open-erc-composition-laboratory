"use strict";
/**
 * Generic relational matcher over source-provenance-backed *normalized*
 * effects and restrictions. No ERC, contract, function or repository names.
 * Source parsers are separate adapters. This matcher only creates
 * UNEVALUATED hypotheses, not validated composition candidates.
 */
const crypto = require("node:crypto");
const key = value => crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");
const VALID_CLASSES = new Set(["NON_FUNGIBLE","FUNGIBLE","ACCOUNT_BALANCE","CLAIM","RESOURCE"]);
const REQUIRED = ["AUTHORIZATION","AVAILABILITY","STATE_CONSISTENCY"];
const distinct = values => new Set(values).size===values.length;
function discover(input) {
  const errors=[];
  if(!input || !Array.isArray(input.participants) || input.participants.length<2) {
    return {hypotheses:[],errors:["At least two separately attributed participants required."]};
  }
  for(const p of input.participants) {
    if(!p || !p.sourceId || !p.revision || !p.assetClass || !VALID_CLASSES.has(p.assetClass) ||
       !Array.isArray(p.effects) || !Array.isArray(p.restrictions) ||
       !Array.isArray(p.provenance) || !p.provenance.length ||
       !p.provenance.every(e=>!!e.factId && !!e.sourceSha256 &&
         ((e.sourceId===p.sourceId && e.sourceRevision===p.revision) ||
          (e.attributedParticipantId===p.sourceId && e.sourceId!==p.sourceId &&
           !!e.sourceRevision && !!e.inheritanceAnchorFactId &&
           p.provenance.some(root=>root.factId===e.inheritanceAnchorFactId &&
             root.sourceId===p.sourceId && root.sourceRevision===p.revision))))) errors.push("Invalid or unattributed participant facts.");
  }
  if(!distinct(input.participants.map(p=>p.sourceId+"@"+p.revision)))
    errors.push("Duplicate participant source identity.");
  if(errors.length) return {hypotheses:[],errors};
  const hypotheses=[];
  const sorted=[...input.participants].sort((a,b)=>a.sourceId.localeCompare(b.sourceId));
  for(let i=0;i<sorted.length;i++) for(let j=i+1;j<sorted.length;j++) {
    const a=sorted[i],b=sorted[j];
    // Reusable class of relation: two independently authorized and bounded
    // state reductions, with distinct conserved quantities, could be coupled
    // atomically. Neither vocabulary overlap nor a matching "burn" name suffices.
    const valid=p=>
      p.effects.some(e=>e.kind==="DECREASE" && e.assetClass===p.assetClass &&
        e.boundedBy==="AVAILABLE_QUANTITY" && e.sourceFactIds?.length>0 &&
        e.sourceFactIds.every(id=>p.provenance.some(f=>f.factId===id))) &&
      REQUIRED.every(type=>p.restrictions.some(r=>r.kind===type &&
        r.sourceFactIds?.length>0 &&
        r.sourceFactIds.every(id=>p.provenance.some(f=>f.factId===id))));
    if(!valid(a)||!valid(b)||a.assetClass===b.assetClass) continue;
    const expected=[a,b].map(p=>({sourceId:p.sourceId,assetClass:p.assetClass,
      effects:p.effects,restrictions:p.restrictions,revision:p.revision}));
    hypotheses.push({
      hypothesisId:"BEHAVIORAL-COUPLED-DECREASE-"+key(expected).slice(0,24),
      relation:"POTENTIAL_ATOMIC_COUPLED_RESOURCE_DECREASE",
      participants:[{sourceId:a.sourceId,revision:a.revision,assetClass:a.assetClass},
        {sourceId:b.sourceId,revision:b.revision,assetClass:b.assetClass}],
      sourceEvidence:[...a.provenance,...b.provenance],
      constraints:[...a.restrictions,...b.restrictions],
      predictedProperties:[
        "Both admitted resource reductions occur in one atomic transition",
        "Any failed permission or unavailable resource leaves both ledgers unchanged",
        "Each participant's independent conservation and backing restrictions are preserved"
      ],
      unknowns:[
        "No source-only proof of cross-contract authorization or suitable coordinator",
        "No executed call graph, implementation equivalence, or cross-chain security proof",
        "Effects and constraints are syntactic source observations pending semantic validation"
      ],
      status:"UNEVALUATED_SOURCE_HYPOTHESIS",
      admission:"NOT_ADMITTED",
      scientificPolarity:"INCONCLUSIVE"
    });
  }
  return {hypotheses,errors:[]};
}
module.exports={discover};
