import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { ScientificCompositionConstraintEvaluatorEngine } from "../laboratory/scientific-composition-constraint-evaluation/ScientificCompositionConstraintEvaluatorEngine.js";
import type { ScientificCompositionConstraint } from "../laboratory/scientific-composition-evaluation-specification/ScientificCompositionConstraint.js";
import type { ScientificCompositionConstraintObservation } from "../laboratory/scientific-composition-constraint-evaluation/ScientificCompositionConstraintObservation.js";

type Fact = {
    id:string; side:"A"|"B"; repository:string; revision:string;
    file:string; line:number; text:string; fragment:string;
};
type Property = {
    invariantId:string;participantSide:string;sourceFactIds:string[];
    executionTransactionHash:string;verdict:string;
    checks:Record<string, unknown>;
};
/**
 * Converts independently checked LOCAL EVM property witnesses into native
 * behavioral constraint evaluations. Source integrity, numbers and provenance
 * are checked by evaluate-pinned-invariants.cjs in the previous CI step.
 * This is NOT a discovered composition candidate or its final SUPPORTS status.
 */
async function run() {
    const [witnessPath, evidencePath] = process.argv.slice(2);
    assert.ok(witnessPath && evidencePath, "Missing invariant report and EVM evidence");
    const witness = JSON.parse(await readFile(witnessPath,"utf8"));
    const evidence = JSON.parse(await readFile(evidencePath,"utf8"));
    assert.equal(witness.schemaVersion,"OECL_PINNED_INVARIANT_WITNESS_V1");
    assert.equal(witness.classification,"LOCAL_EVM_SOURCE_BOUND_PROPERTY_OBSERVATIONS");
    assert.equal(witness.evaluationSurfaceCompleteness,"PARTIAL");
    assert.equal(witness.scientificPolarity,"INCONCLUSIVE");
    assert.equal(witness.sourceTransactions.joint,evidence.transactions.jointRedemption);
    const candidateId="NOT_DISCOVERED-ERC8060-ERC8098";
    const facts = witness.sourceLineage.facts as Fact[];
    const byFact = new Map(facts.map(f=>[f.id,f]));
    assert.equal(byFact.size,facts.length);
    const properties=witness.properties as Property[];
    const mapping=[
        { id:"INV-8060-EXACT-PAYOUT",side:"A" as const,
          predicate:{kind:"UNSIGNED_INTEGER_RELATION" as const,leftMetric:"paidWei",operator:"EQ" as const,rightMetric:"redeemedWei"}},
        { id:"INV-8060-BACKING-SOLVENT",side:"A" as const,
          predicate:{kind:"UNSIGNED_INTEGER_RELATION" as const,leftMetric:"afterWei",operator:"GTE" as const,rightMetric:"remainingObligationWei"}},
        { id:"INV-8098-MONOTONE-SUPPLY",side:"B" as const,
          predicate:{kind:"UNSIGNED_INTEGER_RELATION" as const,leftMetric:"afterUnits",operator:"LTE" as const,rightMetric:"beforeUnits"}}
    ];
    const constraints: ScientificCompositionConstraint[]=[];
    const observations: ScientificCompositionConstraintObservation[]=[];
    for(const definition of mapping) {
        const property=properties.find(p=>p.invariantId===definition.id);
        assert.ok(property, "Expected concrete witness "+definition.id);
        assert.equal(property.participantSide,definition.side);
        assert.equal(property.verdict,"OBSERVED_CONSISTENT");
        assert.equal(property.executionTransactionHash,evidence.transactions.jointRedemption);
        assert.ok(property.sourceFactIds.length>=1);
        const fact=byFact.get(property.sourceFactIds[0]);
        assert.ok(fact && fact.side===definition.side,"Missing attributed first source fact");
        for(const factId of property.sourceFactIds) assert.ok(byFact.has(factId),"Missing supporting source fact "+factId);
        const expectedRevision=definition.side==="A"?evidence.erc8060PinnedRevision:evidence.erc8098PinnedRevision;
        assert.equal(fact.revision,expectedRevision);
        const constraintId="NATIVE-"+definition.id;
        constraints.push({
            constraintId,candidateId,participantSide:definition.side,
            participantKind:"PROTOCOL",participantId:definition.side==="A"?"ERC-8060":"ERC-8098",
            sourceId:"GITHUB-"+fact.repository.replaceAll("/","-"),
            sourceRevision:fact.revision,factId:fact.id,
            basis:"SOURCE_DERIVED_BEHAVIORAL_INVARIANT",
            containerKind:"CONTRACT",
            containerSymbol:definition.side==="A"?"ERC8060Reference":"ERC8098Reference",
            locator:{sourceLocation:fact.repository+"@"+fact.revision,
                filePath:fact.file,startLine:fact.line,endLine:fact.line},
            rawText:fact.text,
            behavioralPredicate:definition.predicate,
            dependencySources:property.sourceFactIds.slice(1).map(id=>{
                const f=byFact.get(id)!;
                return {repository:f.repository,revision:f.revision,filePath:f.file,
                    sourceSha256:f.repository==="OpenZeppelin/openzeppelin-contracts"
                    ? witness.sourceLineage.sourceHashes.OZ_ERC20
                    : definition.side==="A"
                        ? witness.sourceLineage.sourceHashes.A
                        : witness.sourceLineage.sourceHashes.B};
            })
        });
        const measurements: Record<string,string>={};
        for(const metric of [definition.predicate.leftMetric, definition.predicate.rightMetric]) {
            assert.equal(typeof property.checks[metric],"string");
            measurements[metric]=property.checks[metric] as string;
        }
        observations.push({
            observationId:"NATIVE-OBS-"+definition.id,candidateId,constraintId,
            participantSide:definition.side,sourceRevision:fact.revision,
            transactionHash:property.executionTransactionHash,
            verdict:"PRESERVED",
            evidence:["LOCAL-EVM-TRANSACTION:"+property.executionTransactionHash,
                "SOURCE-FACT:"+fact.id],numericMeasurements:measurements
        });
    }
    const engine=new ScientificCompositionConstraintEvaluatorEngine();
    const result=engine.evaluate(constraints,observations);
    assert.equal(result.scientificPolarity,"SUPPORT",JSON.stringify(result.errors));
    assert.equal(result.statistics.preserved,3);
    const tampered=structuredClone(observations);
    tampered[2].numericMeasurements!.afterUnits="999999999999999999999999";
    assert.equal(engine.evaluate(constraints,tampered).scientificPolarity,"INCONCLUSIVE",
        "Self-declared preservation must never override measured supply increase");
    const actualViolation=structuredClone(tampered);
    actualViolation[2].verdict="VIOLATED";
    assert.equal(engine.evaluate(constraints,actualViolation).scientificPolarity,"CHALLENGE");
    const partial=engine.evaluate(constraints,observations.slice(0,2));
    assert.equal(partial.scientificPolarity,"INCONCLUSIVE");

    const report={
        schemaVersion:"OECL_NATIVE_BEHAVIORAL_PROPERTY_EVALUATION_V1",
        source:"PINNED_LOCAL_EVM_WITNESS_NOT_CHAIN_REPLAY",
        candidateDiscovery:"NOT_ADMITTED",
        candidateId,
        constraints, observations,
        result,
        // A candidate-wide scientific result requires genuine discovery,
        // complete source-derived surfaces, chain linkage and formal scope.
        finalScientificResult:"INCONCLUSIVE",
        evaluationSurfaceCompleteness:"PARTIAL",
        excludedProperty:"INV-JOINT-ATOMIC-BURNS is joint-scope; native side A/B constraints cannot encode it without a separate joint-observation model"
    };
    await writeFile(evidencePath.replace(/\.json$/,".native-behavioral.json"),JSON.stringify(report,null,2)+"\n");
    console.log("OECL_NATIVE_BEHAVIORAL:"+JSON.stringify({
        total:result.statistics.total, preserved:result.statistics.preserved,
        localPropertyPolarity:result.scientificPolarity,
        finalScientificResult:report.finalScientificResult
    }));
}
run().catch(error=>{console.error(error);process.exitCode=1;});
