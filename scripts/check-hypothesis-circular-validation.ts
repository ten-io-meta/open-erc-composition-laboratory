import assert from "node:assert/strict";
import { HypothesisValidationEngine } from "../laboratory/hypothesis/HypothesisValidationEngine.js";
import { HypothesisGenerator } from "../laboratory/hypothesis/HypothesisGenerator.js";
import type { HypothesisResult } from "../laboratory/hypothesis/HypothesisResult.js";
import type { EvidenceSupportResult } from "../laboratory/evidence-support/EvidenceSupportResult.js";
import type { ComposabilityEvidenceClaim } from "../laboratory/composability-evidence/ComposabilityEvidenceClaim.js";

const relation="Reservation->CONSTRAINS->Accounting";
const hypothesis:HypothesisResult={generatedAt:"controlled",errors:[],
    hypotheses:[{
        hypothesisId:"HYP-ONE",relation,statement:"hypothesis",
        confidence:99,evidence:10,status:"VALIDATED"
    }]
};
const claim:ComposabilityEvidenceClaim={
    claimId:"CLAIM-ORIGIN",protocolA:"ERC-8060",protocolB:"ERC-8098",
    capabilityA:"Reservation",capabilityB:"Accounting",
    relation:"CONSTRAINS",reason:"origination",
    evidence:["SOURCE-ORIGIN"],semanticConfidence:100,experimentalSupport:0,
    statisticalSupport:100,emergentPatternSupport:100,overallConfidence:100,
    status:"SUPPORTED"
};
const evidence:EvidenceSupportResult={generatedAt:"controlled",claims:[
    claim,{...claim}
],errors:[]};
const engine=new HypothesisValidationEngine();
const result=engine.validate(hypothesis,evidence);
assert.deepEqual(result.errors,[]);
assert.equal(result.validations.length,1);
const v=result.validations[0];
assert.equal(v.validationOutcome,"PARTIAL");
assert.equal(v.statusAfter,"EMERGING");
assert.equal(v.evidenceMatched,1,"Duplicate source claims do not count twice");
assert.equal(v.confidenceAfter,99,"Circular evidence cannot increase score");
assert.equal(v.independentlyValidated,false);
assert.equal(v.evmExecuted,false);
assert.equal(v.compatibilityVerdict,"NOT_EVALUATED");
assert.deepEqual(v.matchedPriorClaimIds,["CLAIM-ORIGIN"]);
const absent=engine.validate(hypothesis,{...evidence,claims:[]});
assert.equal(absent.validations[0].validationOutcome,"UNSUPPORTED");
assert.equal(absent.validations[0].statusAfter,"EMERGING",
    "No match does not constitute a refuting experiment");
assert.equal(absent.validations[0].confidenceAfter,99,
    "Missing evidence does not justify manufactured numerical penalty");
const upstream=engine.validate(hypothesis,{...evidence,errors:["MALFORMED"]});
assert.equal(upstream.validations.length,0);
assert.ok(upstream.errors.length>0);
const invalid=engine.validate({...hypothesis,hypotheses:[
    hypothesis.hypotheses[0],hypothesis.hypotheses[0]]},evidence);
assert.equal(invalid.validations.length,0);
assert.ok(invalid.errors.length>0);

const proposed=new HypothesisGenerator().generate([{
    relationKey:relation,protocolPair:"ERC-8060+ERC-8098",
    observations:10,supported:10,candidates:0,inconclusive:0,
    averageConfidence:99,status:"STABLE"
}]);
assert.equal(proposed.length,1);
assert.equal(proposed[0].status,"EMERGING",
    "Statistical STABLE cannot pre-certify an independent hypothesis");
assert.match(proposed[0].statement,/independent tests/);
console.log("OECL_HYPOTHESIS_CIRCULAR_VALIDATION_FAIL_CLOSED_PASS");
