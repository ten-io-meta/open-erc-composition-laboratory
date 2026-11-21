import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { resolve, join } from "node:path";
import { createHash } from "node:crypto";
import { SolidityScientificSourceFactExtractor } from "../laboratory/scientific-source-fact/SolidityScientificSourceFactExtractor.js";
import { ScientificSemanticDerivationEngine } from "../laboratory/scientific-semantic-derivation/ScientificSemanticDerivationEngine.js";
import { ScientificCapabilityAttributionEngine } from "../laboratory/scientific-capability-attribution/ScientificCapabilityAttributionEngine.js";
import { ScientificConceptAbstractionEngine } from "../laboratory/scientific-concept-abstraction/ScientificConceptAbstractionEngine.js";
import { ScientificProtocolConceptAttributionEngine } from "../laboratory/scientific-protocol-concept-attribution/ScientificProtocolConceptAttributionEngine.js";
import { ScientificProtocolIdentityAttributionEngine } from "../laboratory/scientific-protocol-identity/ScientificProtocolIdentityAttributionEngine.js";
import { ScientificStructuralProtocolRelationEvidenceEngine } from "../laboratory/scientific-protocol-relation-evidence/ScientificStructuralProtocolRelationEvidenceEngine.js";
import { CrossProtocolCompositionEngine } from "../laboratory/scientific-cross-protocol-composition/CrossProtocolCompositionEngine.js";
import { ScientificSolidityInheritanceGraphEngine } from "../laboratory/scientific-solidity-inheritance/ScientificSolidityInheritanceGraphEngine.js";
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
    const protocolConceptResults=[];
    const participantFacts=[];
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
        participantFacts.push(...facts);
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
        const concepts=new ScientificConceptAbstractionEngine().abstract(semantic);
        assert.deepEqual(concepts.errors,[],"Lexical concept abstraction failed for "+source.id);
        const protocolConcepts=new ScientificProtocolConceptAttributionEngine().attribute({
            concepts,protocols
        });
        assert.deepEqual(protocolConcepts.errors,[],"Protocol concept attribution failed for "+source.id);
        protocolConceptResults.push(protocolConcepts);
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
            recurrentLexicalConcepts:concepts.concepts.map(c=>c.label),
            attributedProtocolConcepts:protocolConcepts.protocolConcepts.map(c=>({conceptId:c.conceptId,protocolId:c.protocolId,evidence:c.evidence})),
            structuralRelations:relations.relations
        });
    }

    const ozRoot=join(roots[0],"node_modules/@openzeppelin/contracts");
    const lock=JSON.parse(await readFile(join(roots[0],"package-lock.json"),"utf8"));
    assert.equal(lock.packages?.["node_modules/@openzeppelin/contracts"]?.version,"4.9.6");
    const inheritedFiles=[
        "token/ERC20/ERC20.sol",
        "token/ERC20/extensions/ERC20Burnable.sol",
        "token/ERC721/ERC721.sol",
        "token/ERC721/extensions/ERC721URIStorage.sol"
    ];
    const inheritedFacts=[];
    const inheritedSources=[];
    for(const file of inheritedFiles){
        const raw=await readFile(join(ozRoot,file),"utf8");
        const observed:ScientificSourceObservation={
            observationId:"PINNED-INHERITED-"+file.replace(/[^a-z0-9]/gi,"-"),
            sourceId:"NPM-OPENZEPPELIN-CONTRACTS",
            sourceType:"NPM_PACKAGE",sourceRevision:"4.9.6",kind:"CONTRACT_SOURCE",
            locator:{sourceLocation:"@openzeppelin/contracts@4.9.6",filePath:file,
                startLine:1,endLine:raw.split(/\\r?\\n/).length},
            rawText:raw
        };
        const facts=extractor.extract(observed);
        assert.ok(facts.length>0,"Inherited dependency facts missing: "+file);
        inheritedFacts.push(...facts);
        inheritedSources.push({file,sha256:sha256(raw),facts:facts.length});
    }
    const inheritanceGraph=new ScientificSolidityInheritanceGraphEngine().build({
        facts:[...participantFacts,...inheritedFacts]
    });
    assert.deepEqual(inheritanceGraph.errors,[],"Pinned inheritance graph invalid");
    const foundEdge=(subject:string,base:string)=>
        inheritanceGraph.edges.some(edge=>
            edge.subjectContainerSymbol===subject && edge.inheritedSymbol===base &&
            edge.objectContainerSymbol===base
        );
    assert.ok(foundEdge("ERC8098Reference","ERC20"),"ERC8098 -> ERC20 inheritance unresolved");
    assert.ok(foundEdge("ERC8098Reference","ERC20Burnable"),"ERC8098 -> ERC20Burnable inheritance unresolved");
    assert.ok(foundEdge("ERC8060Reference","ERC721URIStorage"),"ERC8060 -> ERC721URIStorage inheritance unresolved");
    assert.ok(foundEdge("ERC721URIStorage","ERC721"),"ERC721URIStorage -> ERC721 inheritance unresolved");

    const paths={
        "ERC-8060":["ERC8060Reference","ERC721URIStorage","ERC721"],
        "ERC-8098":["ERC8098Reference","ERC20Burnable","ERC20"]
    };
    // Different canonical token standards: an inherited ability to burn
    // cannot by itself establish shared ERC-family protocol foundation.
    assert.notEqual(paths["ERC-8060"].at(-1),paths["ERC-8098"].at(-1));
    const inheritedEvidence={
        package:"@openzeppelin/contracts",version:"4.9.6",
        integrity:lock.packages["node_modules/@openzeppelin/contracts"].integrity,
        sources:inheritedSources,
        verifiedInheritanceEdges:inheritanceGraph.edges.filter(edge=>
            ["ERC8060Reference","ERC721URIStorage","ERC8098Reference","ERC20Burnable"].includes(edge.subjectContainerSymbol)
        ).map(edge=>({
            subject:edge.subjectContainerSymbol,inherited:edge.inheritedSymbol,
            evidenceId:edge.inheritanceEdgeId,sourceFact:edge.subjectDeclarationFactId
        })),
        paths,
        distinctCanonicalFoundation:true,
        limits:"Inherited ERC-20 burn and ERC-721 burn are different units. No shared protocol foundation or compatibility is inferred."
    };

    // The native discovery engine only receives structures ACTUALLY returned
    // by semantic + source attribution stages above. Do not invent common
    // lexical concepts or manually supply a compatibility hypothesis.
    const discoveryInput={
        protocolConceptResults,
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
        inheritedEvidence,
        sourceKinds:["PINNED_SOLIDITY_SOURCE_FACTS","NATIVE_SEMANTIC_CAPABILITY_ATTRIBUTION",
            "NATIVE_CONCEPT_ABSTRACTION","NATIVE_PROTOCOL_CONCEPT_ATTRIBUTION",
            "NATIVE_PROTOCOL_IDENTITY","NATIVE_STRUCTURAL_PROTOCOL_RELATION",
            "PINNED_INHERITANCE_GRAPH"],
        discovery,
        matchedPairCandidates:pair,
        structuralCandidateCount:pair.length,
        epistemicStatus:pair.length?"DISCOVERED_STRUCTURAL_HYPOTHESIS_ONLY":"NO_NATIVE_PAIR_CANDIDATE_FROM_STRUCTURAL_SOURCES",
        scientificPolarity:"INCONCLUSIVE",
        discoveryGaps:[
            "A common structural ERC-family dependency is required for the native foundation mechanism",
            "The recurring concept mechanism requires two distinct independently attributed capabilities per protocol",
            "A local joint coordinator is an experimental implementation, not independent documentary extension evidence",
            "Only lexical concepts independently produced by native attribution are eligible; no hand-authored concept inputs are permitted",
            "A matching READY specification and complete test scope remain mandatory"
        ]
    };
    await writeFile(output,JSON.stringify(report,null,2)+"\n");
    console.log("OECL_REAL_SOURCE_DISCOVERY:"+JSON.stringify({
        facts:participants.map(p=>({protocol:p.protocolId,facts:p.extractedFacts,capabilities:p.protocolAttributedCapabilities,
            dependencies:p.structuralRelations.map(x=>x.objectProtocolId),
            lexicalConcepts:p.recurrentLexicalConcepts,
            protocolConcepts:p.attributedProtocolConcepts.map(x=>x.conceptId)})),
        candidateCount:pair.length,status:report.epistemicStatus,scientificPolarity:report.scientificPolarity,
        inheritedPaths:paths
    }));
}
main().catch(e=>{console.error(e);process.exitCode=1;});
