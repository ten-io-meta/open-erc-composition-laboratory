import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { ScientificBurnSemanticsComparisonEngine } from "../laboratory/scientific-burn-semantics/ScientificBurnSemanticsComparisonEngine.js";
import type { ScientificSourceBoundBurnMechanism } from "../laboratory/scientific-burn-semantics/ScientificBurnSemanticsComparisonEngine.js";

async function main() {
    const [discoveryFile,invariantsFile,outFile]=process.argv.slice(2);
    assert.ok(discoveryFile&&invariantsFile&&outFile,"Usage: <source-discovery.json> <invariants.json> <output.json>");
    const discovery=JSON.parse(await readFile(discoveryFile,"utf8"));
    const invariant=JSON.parse(await readFile(invariantsFile,"utf8"));
    assert.equal(discovery.schemaVersion,"OECL_REAL_PINNED_SCIENTIFIC_DISCOVERY_V1");
    assert.equal(discovery.scientificPolarity,"INCONCLUSIVE");
    assert.equal(discovery.matchedPairCandidates.length,0);
    assert.equal(discovery.inheritedEvidence.importClosure.status,"RESOLVED");
    assert.ok(discovery.inheritedCapabilityObservations.every((x:{status:string})=>x.status==="RESOLVED"));
    assert.equal(invariant.classification,"LOCAL_EVM_SOURCE_BOUND_PROPERTY_OBSERVATIONS");
    assert.equal(invariant.scientificPolarity,"INCONCLUSIVE");
    const tx=invariant.sourceTransactions.joint;
    assert.match(tx,/^0x[a-f0-9]{64}$/i);
    const facts=new Map(invariant.sourceLineage.facts.map((fact:{id:string})=>[fact.id,fact]));
    const getProperty=(id:string)=>{
        const matches=invariant.properties.filter((p:{invariantId:string})=>p.invariantId===id);
        assert.equal(matches.length,1,"Exactly one property evidence for "+id);
        const value=matches[0];
        assert.equal(value.verdict,"OBSERVED_CONSISTENT");
        assert.equal(value.executionTransactionHash,tx);
        for(const factId of value.sourceFactIds)assert.ok(facts.has(factId),"Missing exact source fact "+factId);
        return value;
    };
    const payout=getProperty("INV-8060-EXACT-PAYOUT");
    const backing=getProperty("INV-8060-BACKING-SOLVENT");
    const supply=getProperty("INV-8098-MONOTONE-SUPPLY");
    const joint=getProperty("INV-JOINT-ATOMIC-BURNS");
    assert.equal(joint.participantSide,"JOINT");
    assert.equal(payout.participantSide,"A");
    assert.equal(backing.participantSide,"A");
    assert.equal(supply.participantSide,"B");
    const evidence=discovery.inheritedCapabilityObservations;
    const locate=(id:string,container:string)=>{
        const occurrences=evidence.filter((x:{protocolId:string})=>x.protocolId===id);
        assert.equal(occurrences.length,1);
        const matches=occurrences[0].burnCapabilityProvenance.filter((p:{symbol:string;containerSymbol:string})=>p.symbol==="burn"&&p.containerSymbol===container);
        assert.equal(matches.length,1);
        return matches[0];
    };
    const a=discovery.participants.find((x:{protocolId:string})=>x.protocolId==="ERC-8060");
    const b=discovery.participants.find((x:{protocolId:string})=>x.protocolId==="ERC-8098");
    assert.ok(a&&b);
    const nft=locate("ERC-8060","ERC8060Reference");
    const fungible=locate("ERC-8098","ERC20Burnable");
    assert.equal(nft.depth,0);
    assert.equal(nft.sourceRevision,a.revision);
    assert.match(nft.sourceRawText,/function\\s+burn\\s*\\(\\s*uint256\\s+tokenId\\s*\\)/,
        "ERC8060 must destroy one specific NFT tokenId");
    assert.equal(fungible.depth,1);
    assert.equal(fungible.sourceRevision,"4.9.6");
    assert.match(fungible.sourceRawText,/function\\s+burn\\s*\\(\\s*uint256\\s+amount\\s*\\)/,
        "ERC8098's inherited burn must consume fungible amount");
    assert.deepEqual(fungible.inheritanceContainers,["ERC8098Reference","ERC20Burnable"]);
    const dependencySource=discovery.inheritedEvidence.sources.find((x:{file:string})=>x.file==="token/ERC20/extensions/ERC20Burnable.sol");
    assert.ok(dependencySource&&/^[a-f0-9]{64}$/.test(dependencySource.sha256));
    const construct=(participant:typeof a,burn:typeof nft,unit:ScientificSourceBoundBurnMechanism["assetUnit"],
        propertyIds:string[]):ScientificSourceBoundBurnMechanism=>({
        participantId:participant.protocolId,
        repository:participant.repository,
        sourceRevision:participant.revision,
        burnDeclaration:{
            sourceId:burn.sourceId,sourceRevision:burn.sourceRevision,
            containerSymbol:burn.containerSymbol,
            declarationFactId:burn.sourceFactId,
            inheritanceEdgeIds:burn.inheritanceEdgeIds,
            depth:burn.depth
        },
        assetUnit:unit,
        sourceFactIds:[...new Set(propertyIds.flatMap(id=>getProperty(id).sourceFactIds))],
        numericalWitnesses:propertyIds,
        transactionHash:tx,
        ...(burn.depth ? { inheritedDependency:{
            package:"@openzeppelin/contracts",version:"4.9.6",
            filePath:dependencySource.file,sourceSha256:dependencySource.sha256
        }}:{})
    });
    const left=construct(a,nft,"ERC721_TOKEN_ID",["INV-8060-EXACT-PAYOUT","INV-8060-BACKING-SOLVENT"]);
    const right=construct(b,fungible,"ERC20_FUNGIBLE_AMOUNT",["INV-8098-MONOTONE-SUPPLY"]);
    const engine=new ScientificBurnSemanticsComparisonEngine();
    const comparison=engine.compare(left,right);
    assert.equal(comparison.status,"SCOPED_SHARED_IRREVERSIBLE_DESTRUCTION");
    assert.equal(comparison.equivalentAssetUnit,false);
    assert.equal(comparison.equivalentRedemptionSemantics,false);
    assert.equal(comparison.scientificPolarity,"INCONCLUSIVE");
    const tamper=structuredClone(right);
    tamper.transactionHash="0x"+"0".repeat(64);
    assert.equal(engine.compare(left,tamper).status,"INSUFFICIENT_EVIDENCE");
    tamper.transactionHash=tx;
    tamper.burnDeclaration.inheritanceEdgeIds=[];
    assert.equal(engine.compare(left,tamper).status,"INSUFFICIENT_EVIDENCE");
    const absent=structuredClone(right);
    absent.sourceFactIds=[];
    assert.equal(engine.compare(left,absent).status,"INSUFFICIENT_EVIDENCE");
    const report={
        schemaVersion:"OECL_PINNED_BURN_SEMANTICS_V1",
        participantMechanisms:[left,right],
        comparison,
        exactEvmTransaction:tx,
        discoveredCandidateCount:discovery.matchedPairCandidates.length,
        outcome:"INCONCLUSIVE",
        note:"Shared on-chain destruction is a scoped comparison, not automatically a genuine native discovered candidate or equivalent redemption."
    };
    await writeFile(outFile,JSON.stringify(report,null,2)+"\n");
    console.log("OECL_BURN_SEMANTICS:"+JSON.stringify({
        status:comparison.status,assetUnitsEqual:comparison.equivalentAssetUnit,
        redeemedNFT:true,erc20SupplyBurn:true,candidateCount:report.discoveredCandidateCount,outcome:report.outcome
    }));
}
main().catch(err=>{console.error(err);process.exitCode=1;});
