import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { resolve, join } from "node:path";
import { createHash } from "node:crypto";
import { SolidityScientificSourceFactExtractor } from "../laboratory/scientific-source-fact/SolidityScientificSourceFactExtractor.js";
import { ScientificSemanticDerivationEngine } from "../laboratory/scientific-semantic-derivation/ScientificSemanticDerivationEngine.js";
import { ScientificCapabilityAttributionEngine } from "../laboratory/scientific-capability-attribution/ScientificCapabilityAttributionEngine.js";
import { ScientificProtocolIdentityAttributionEngine } from "../laboratory/scientific-protocol-identity/ScientificProtocolIdentityAttributionEngine.js";
import { ScientificStructuralProtocolRelationEvidenceEngine } from "../laboratory/scientific-protocol-relation-evidence/ScientificStructuralProtocolRelationEvidenceEngine.js";
import { CrossProtocolCompositionEngine } from "../laboratory/scientific-cross-protocol-composition/CrossProtocolCompositionEngine.js";
import type { ScientificSourceObservation } from "../laboratory/scientific-source-observation/ScientificSourceObservation.js";

const sources=[
    {id:"ERC-8060",sourceId:"GITHUB-TEN-IO-META-ERC8060-NATIVE-ETH-VALUE",
        repository:"ten-io-meta/erc8060-native-eth-value",
        revision:"c7eed906835ab39fbc8439eb0493e5a5371b23a2",
        path:"contracts/ERC8060Reference.sol"},
    {id:"ERC-8098",sourceId:"GITHUB-TEN-IO-META-ERC8098-REFERENCE",
        repository:"ten-io-meta/erc8098-reference",
        revision:"68a05289bd68d89db8453c49500e0a1ae6cd11ec",
        path:"contracts/ERC8098Reference.sol"}
] as const;
const sha256=(s:string)=>createHash("sha256").update(s).digest("hex");
const git=(root:string)=>execFileSync("git",["-C",root,"rev-parse","HEAD"],{encoding:"utf8"}).trim();

async function main(){
    const [rootA,rootB,output]=process.argv.slice(2);
    assert.ok(rootA&&rootB&&output,"Usage: check-pinned-real-scientific-discovery <8060-root> <8098-root> <output.json>");
    const roots=[resolve(rootA),resolve(rootB)];
    const extractor=new SolidityScientificSourceFactExtractor();
    const participants=[];
    const structuralResults=[];
    for (let i=0;i<2;i++){
        const source=sources[i],root=roots[i];
        assert.equal(git(root),source.revision,"Unexpected source revision for "+source.id);
        const raw=await readFile(join(root,source.path),"utf8");
        const observation:ScientificSourceObservation={
            observationId:"PINNED-SCIENTIFIC-DISCOVERY-"+source.id,
            sourceId:source.sourceId,sourceType:"GITHUB",sourceRevision:source.revision,
            kind:"CONTRACT_SOURCE",
            locator:{sourceLocation:source.repository+"@"+source.revision,
                filePath:source.path,startLine:1,endLine:raw.split(/\r?\n/).length},
            rawText:raw
        };
        const facts=extractor.extract(observation);
        assert.ok(facts.length>0,"No scientific facts extracted for "+source.id);
        const semantic=new ScientificSemanticDerivationEngine().derive({
            sourceId:source.sourceId,sourceRevision:source.revision,facts
        });
        assert.deepEqual(semantic.errors,[],"Semantic derivation failed for "+source.id);
        const attributed=new ScientificCapabilityAttributionEngine().attribute({derivation:semantic,facts});
        assert.deepEqual(attributed.errors,[],"Capability attribution failed for "+source.id);
        const protocols=new ScientificProtocolIdentityAttributionEngine().attribute({
            attribution:attributed,observations:[observation]
        });
        assert.deepEqual(protocols.errors,[],"Protocol identity attribution failed for "+source.id);
        const relations=new ScientificStructuralProtocolRelationEvidenceEngine().extract({
            sourceId:source.sourceId,sourceRevision:source.revision,facts,
            protocolAttributedCapabilities:protocols.protocolAttributedCapabilities
        });
        assert.deepEqual(relations.errors,[],"Structural relation extraction failed for "+source.id);
        structuralResults.push(relations);
        participants.push({
            protocolId:source.id,sourceId:source.sourceId,repository:source.repository,
            revision:source.revision,path:source.path,sourceSha256:sha256(raw),
            extractedFacts:facts.length,
            protocolAttributedCapabilities:protocols.protocolAttributedCapabilities.length,
            structuralRelations:relations.relations
        });
    }

    // The native discovery engine only receives structures ACTUALLY returned
    // by semantic + source attribution stages above. Do not invent common
    // lexical concepts or manually supply a compatibility hypothesis.
    const discoveryInput={
        protocolConceptResults:[],
        protocolRelationEvidenceResults:[],
        structuralProtocolRelationEvidenceResults:structuralResults
    };
    const discovery=new CrossProtocolCompositionEngine().discover(discoveryInput);
    assert.deepEqual(discovery.errors,[],"Native discovery failed on authentic source relations");
    const rerun=new CrossProtocolCompositionEngine().discover(discoveryInput);
    assert.deepEqual(discovery,rerun,"Native discovery is not deterministic");
    const pair=discovery.candidates.filter(candidate=>
        [candidate.participantA.id,candidate.participantB.id].sort().join("|")==="ERC-8060|ERC-8098"
    );
    // If this pair shares no discovered structural foundation, it MUST remain
    // unadmitted; a local EVM coordinator cannot manufacture one.
    const report={
        schemaVersion:"OECL_REAL_PINNED_SCIENTIFIC_DISCOVERY_V1",
        participants,
        sourceKinds:["PINNED_SOLIDITY_SOURCE_FACTS","NATIVE_SEMANTIC_CAPABILITY_ATTRIBUTION",
            "NATIVE_PROTOCOL_IDENTITY","NATIVE_STRUCTURAL_PROTOCOL_RELATION"],
        discovery,
        matchedPairCandidates:pair,
        structuralCandidateCount:pair.length,
        epistemicStatus:pair.length?"DISCOVERED_STRUCTURAL_HYPOTHESIS_ONLY":"NO_NATIVE_PAIR_CANDIDATE_FROM_STRUCTURAL_SOURCES",
        scientificPolarity:"INCONCLUSIVE",
        discoveryGaps:[
            "A common structural ERC-family dependency is required for the native foundation mechanism",
            "The recurring concept mechanism requires two distinct independently attributed capabilities per protocol",
            "A local joint coordinator is an experimental implementation, not independent documentary extension evidence",
            "No source-grounded recurring concept attribution is supplied or invented by this audit",
            "A matching READY specification and complete test scope remain mandatory"
        ]
    };
    await writeFile(output,JSON.stringify(report,null,2)+"\n");
    console.log("OECL_REAL_SOURCE_DISCOVERY:"+JSON.stringify({
        facts:participants.map(p=>({protocol:p.protocolId,facts:p.extractedFacts,capabilities:p.protocolAttributedCapabilities,
            dependencies:p.structuralRelations.map(x=>x.objectProtocolId)})),
        candidateCount:pair.length,status:report.epistemicStatus,scientificPolarity:report.scientificPolarity
    }));
}
main().catch(e=>{console.error(e);process.exitCode=1;});
