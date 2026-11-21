import assert from "node:assert/strict";
import {readFile,writeFile} from "node:fs/promises";
import {createHash} from "node:crypto";
import {CrossProtocolCompositionEngine} from "../laboratory/scientific-cross-protocol-composition/CrossProtocolCompositionEngine.js";
import {ScientificCompositionEvaluationSpecificationEngine} from "../laboratory/scientific-composition-evaluation-specification/ScientificCompositionEvaluationSpecificationEngine.js";

async function main(){
    const [graphPath,hypothesisPath,outputPath]=process.argv.slice(2);
    assert.ok(graphPath&&hypothesisPath&&outputPath,
        "Expected pinned compiler AST graph, source-only hypothesis and output");
    const graphRaw=await readFile(graphPath,"utf8");
    const hypothesisRaw=await readFile(hypothesisPath,"utf8");
    const graph=JSON.parse(graphRaw),sourceHypothesisArtifact=JSON.parse(hypothesisRaw);
    const nativeDiscovery=new CrossProtocolCompositionEngine();
    const nativeSpecification=new ScientificCompositionEvaluationSpecificationEngine();
    const input={graph,sourceHypothesisArtifact,rawGraph:graphRaw};
    const discovery=nativeDiscovery.discoverBehavioralSourceHypotheses(input);
    assert.deepEqual(discovery.errors,[]);
    assert.equal(discovery.hypotheses.length,1);
    assert.equal(discovery.candidateCount,0);
    assert.equal(discovery.hypotheses[0].candidateAdmission,"NOT_ADMITTED");
    assert.equal(discovery.hypotheses[0].scientificPolarity,"INCONCLUSIVE");
    assert.equal(discovery.sourceGraphSha256,
        createHash("sha256").update(graphRaw).digest("hex"));
    const specification=nativeSpecification.buildBehavioralHypothesisSpecification({
        discovery,normalizedParticipants:sourceHypothesisArtifact.normalizedParticipants
    });
    assert.deepEqual(specification.errors,[]);
    assert.equal(specification.specifications.length,1);
    assert.equal(specification.candidateCount,0);
    const spec=specification.specifications[0];
    assert.equal(spec.status,"INSUFFICIENT_EVIDENCE");
    assert.equal(spec.questions.length,10);
    assert.equal(spec.participantAQuestionIds.length,4);
    assert.equal(spec.participantBQuestionIds.length,4);
    assert.equal(spec.jointQuestionIds.length,2);
    assert.equal(spec.nativeCandidateId,null);
    assert.equal(spec.candidateAdmission,"NOT_ADMITTED");
    assert.equal(spec.scientificPolarity,"INCONCLUSIVE");
    assert.ok(spec.questions.every(x=>x.status==="NOT_EVALUATED"&&x.sourceFactIds.length>0));
    assert.ok(spec.unresolvedRequirements.length>=4);
    const controls: [string,(x:any)=>void, "discovery"|"specification"][]=[
        ["forged_compiler_sha",x=>{x.sourceHypothesisArtifact.graphEvidence.sha256="0".repeat(64);},"discovery"],
        ["swapped_hypothesis_identity",x=>{x.sourceHypothesisArtifact.hypotheses[0].hypothesisId="FORGED";},"discovery"],
        ["source_only_evm_contamination",x=>{x.sourceHypothesisArtifact.executionEvidenceUsed=true;},"discovery"],
        ["source_revision_swap",x=>{
            const p=x.graph.provenance.primary;
            [p[0].revision,p[1].revision]=[p[1].revision,p[0].revision];
        },"discovery"],
        ["source_byte_hash_swap",x=>{
            const p=x.graph.provenance.primary;
            [p[0].sourceSha256,p[1].sourceSha256]=[p[1].sourceSha256,p[0].sourceSha256];
        },"discovery"],
        ["destroyed_nft_internal_call",x=>{
            const fn=x.graph.functions.find((f:any)=>f.contractName==="ERC8060Reference"&&f.name==="burn");
            x.graph.edges=x.graph.edges.filter((e:any)=>!(e.kind==="CALLS"&&e.from===fn.id));
        },"discovery"],
        ["forged_nft_obligation_decrease",x=>{
            x.graph.writes=x.graph.writes.filter((w:any)=>w.state!=="totalRedeemableValue");
        },"discovery"],
        ["dependency_source_revision_absent",x=>{
            x.graph.provenance.dependency.integrity="";
        },"discovery"],
        ["missing_authorization_evidence",x=>{
            x.sourceHypothesisArtifact.normalizedParticipants[0].restrictions=
              x.sourceHypothesisArtifact.normalizedParticipants[0].restrictions.filter((r:any)=>r.kind!=="AUTHORIZATION");
        },"specification"],
        ["missing_quantity_decrease_evidence",x=>{
            x.sourceHypothesisArtifact.normalizedParticipants[0].effects=[];
        },"specification"],
        ["duplicated_source_fact_ids",x=>{
            const p=x.sourceHypothesisArtifact.normalizedParticipants[1];
            p.provenance.push({...p.provenance[0]});
        },"specification"],
        ["fabricated_participant_asset_type",x=>{
            x.sourceHypothesisArtifact.normalizedParticipants[1].assetClass="CLAIM";
        },"specification"],
        ["duplicate_restriction_category",x=>{
            const p=x.sourceHypothesisArtifact.normalizedParticipants[0];
            p.restrictions.push({...p.restrictions[0]});
        },"specification"]
    ];
    for(const [name,mutate,target] of controls){
        const copy=structuredClone(input);
        mutate(copy);
        if(target==="discovery"){
            const r=nativeDiscovery.discoverBehavioralSourceHypotheses(copy);
            assert.equal(r.hypotheses.length,0,"Native source falsification not rejected: "+name);
            assert.ok(r.errors.length>0);
        } else {
            const r=nativeSpecification.buildBehavioralHypothesisSpecification({
                discovery,normalizedParticipants:copy.sourceHypothesisArtifact.normalizedParticipants
            });
            assert.equal(r.specifications.length,0,"Native spec falsification not rejected: "+name);
            assert.ok(r.errors.length>0);
        }
    }
    const report={
        schemaVersion:"OECL_NATIVE_AST_BEHAVIORAL_STUDY_V1",
        inputArtifactDigests:{
            graph:discovery.sourceGraphSha256,
            sourceHypothesis:createHash("sha256").update(hypothesisRaw).digest("hex")
        },
        discovery,specification,
        adversarialControlsRejected:controls.map(x=>x[0]),
        nativeCandidatesGenerated:0,
        admission:"NOT_ADMITTED",
        finalScientificResult:"INCONCLUSIVE",
        limitation:"No candidate, READY specification, executable universal control-flow proof, or complete runtime observations are inferred from Solidity source AST alone."
    };
    await writeFile(outputPath,JSON.stringify(report,null,2)+"\n");
    console.log("OECL_NATIVE_AST_BEHAVIORAL_STUDY:"+JSON.stringify({
        hypotheses:discovery.hypotheses.length,
        questions:spec.questions.length,unresolved:spec.unresolvedRequirements.length,
        negativeControls:controls.length,candidateCount:0,
        specificationStatus:spec.status,admission:report.admission,
        scientificPolarity:report.finalScientificResult
    }));
}
main().catch(e=>{console.error(e);process.exitCode=1;});
