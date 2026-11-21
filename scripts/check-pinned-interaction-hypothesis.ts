import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { ScientificHeterogeneousBurnInteractionHypothesisEngine } from "../laboratory/scientific-interaction-hypothesis/ScientificHeterogeneousBurnInteractionHypothesisEngine.js";

async function main() {
    const [semanticsPath,invariantsPath,outputPath]=process.argv.slice(2);
    assert.ok(semanticsPath&&invariantsPath&&outputPath,"Expected burn semantics, invariant witnesses and output");
    const semantics=JSON.parse(await readFile(semanticsPath,"utf8"));
    const evidence=JSON.parse(await readFile(invariantsPath,"utf8"));
    assert.equal(semantics.schemaVersion,"OECL_PINNED_BURN_SEMANTICS_V1");
    assert.equal(semantics.outcome,"INCONCLUSIVE");
    assert.equal(semantics.comparison.equivalentAssetUnit,false);
    assert.equal(semantics.comparison.equivalentRedemptionSemantics,false);
    assert.equal(semantics.discoveredCandidateCount,0);
    assert.equal(evidence.schemaVersion,"OECL_PINNED_INVARIANT_WITNESS_V1");
    assert.equal(evidence.scientificPolarity,"INCONCLUSIVE");
    assert.equal(semantics.exactEvmTransaction,evidence.sourceTransactions.joint);

    const mechanisms=semantics.participantMechanisms;
    const properties=evidence.properties.map((p:{invariantId:string;participantSide:"A"|"B"|"JOINT";sourceFactIds:string[];executionTransactionHash:string;verdict:string})=>({
        invariantId:p.invariantId,participantSide:p.participantSide,
        sourceFactIds:p.sourceFactIds,transactionHash:p.executionTransactionHash,
        verdict:p.verdict
    }));
    const engine=new ScientificHeterogeneousBurnInteractionHypothesisEngine();
    const input={mechanisms,properties,discoveryCandidateCount:semantics.discoveredCandidateCount};
    const hypothesis=engine.derive(input);
    assert.equal(hypothesis.status,"SCOPED_EXPERIMENTAL_HYPOTHESIS");
    assert.equal(hypothesis.mechanism,"COORDINATED_HETEROGENEOUS_DESTRUCTION");
    assert.equal(hypothesis.scientificPolarity,"INCONCLUSIVE");
    assert.equal(hypothesis.discoveryAdmission,"NOT_ADMITTED");
    assert.equal(hypothesis.supportingPropertyIds.length,4);

    let rejected=0;
    const challenge=(label:string,mutate:(input:typeof input)=>void)=>{
        const copy=structuredClone(input);
        mutate(copy);
        const result=engine.derive(copy);
        assert.equal(result.status,"BLOCKED_INSUFFICIENT_EVIDENCE",label);
        assert.equal(result.discoveryAdmission,"NOT_ADMITTED");
        rejected++;
    };
    challenge("different joint transaction",x=>{x.properties[2].transactionHash="0x"+"a".repeat(64);});
    challenge("missing participant B observations",x=>{x.properties=x.properties.filter(p=>p.participantSide!=="B");});
    challenge("missing joint observation",x=>{x.properties=x.properties.filter(p=>p.participantSide!=="JOINT");});
    challenge("inconsistent supply violation",x=>{x.properties[2].verdict="OBSERVED_VIOLATION";});
    challenge("asset units falsely equal",x=>{x.mechanisms[1].assetUnit=x.mechanisms[0].assetUnit;});
    challenge("missing source facts",x=>{x.mechanisms[1].sourceFactIds=[];});
    challenge("different source bound property IDs",x=>{x.properties[2].sourceFactIds=["FORGED-FACT"];});
    challenge("forged inheritance path",x=>{x.mechanisms[1].burnDeclaration.inheritanceEdgeIds=[];});
    challenge("duplicate property evidence",x=>{x.properties.push(structuredClone(x.properties[0]));});
    challenge("unconfirmed discovery count",x=>{x.discoveryCandidateCount=1;});
    challenge("different successful contract transactions",x=>{x.mechanisms[0].transactionHash="0x"+"b".repeat(64);});
    challenge("no committed version identity",x=>{x.mechanisms[0].sourceRevision="not-revision";});
    const result={
        schemaVersion:"OECL_HETEROGENEOUS_INTERACTION_HYPOTHESIS_V1",
        sourceSemanticsArtifact:semanticsPath,
        sourceInvariantArtifact:invariantsPath,
        hypothesis,
        rejectedAdversarialCases:rejected,
        candidateCount:semantics.discoveredCandidateCount,
        candidateScientificResult:"INCONCLUSIVE",
        guidance:"A hypothesis for testing cross-protocol effects, not a discovered compatible composition or scientific SUPPORTS."
    };
    await writeFile(outputPath,JSON.stringify(result,null,2)+"\n");
    console.log("OECL_INTERACTION_HYPOTHESIS:"+JSON.stringify({
        status:hypothesis.status,mechanism:hypothesis.mechanism,
        sourceFactGroups:hypothesis.sourceProvenance.length,
        propertyEvidenceCount:hypothesis.supportingPropertyIds.length,
        rejectedAdversarialCases:rejected,
        admission:hypothesis.discoveryAdmission,
        scientificPolarity:hypothesis.scientificPolarity
    }));
}
main().catch(e=>{console.error(e);process.exitCode=1;});
