"use strict";
const fs=require("node:fs");
const assert=require("node:assert/strict");
const crypto=require("node:crypto");
const [successPath,failurePath,hypothesisPath,outputPath]=process.argv.slice(2);
assert.ok(successPath&&failurePath&&hypothesisPath&&outputPath,
    "Usage: check-interaction-experiment-suite.cjs <success.json> <failure-matrix.json> <hypothesis.json> <output.json>");
const read=p=>({raw:fs.readFileSync(p),data:JSON.parse(fs.readFileSync(p,"utf8"))});
const success=read(successPath),failure=read(failurePath),hypothesis=read(hypothesisPath);
const pinA="c7eed906835ab39fbc8439eb0493e5a5371b23a2";
const pinB="68a05289bd68d89db8453c49500e0a1ae6cd11ec";
assert.equal(success.data.erc8060PinnedRevision,pinA);
assert.equal(success.data.erc8098PinnedRevision,pinB);
assert.equal(success.data.chainId,31337);
assert.equal(success.data.observations.sameTransactionContainsBothBurns,true);
assert.equal(success.data.observations.nftSolventAfter,true);
assert.equal(success.data.claimedGlobalCompatibility,false);
assert.equal(failure.data.schemaVersion,"OECL_PINNED_FAILURE_EXPERIMENTS_V1");
assert.equal(failure.data.cases.length,4);
assert.equal(hypothesis.data.schemaVersion,"OECL_HETEROGENEOUS_INTERACTION_HYPOTHESIS_V1");
assert.equal(hypothesis.data.hypothesis.status,"SCOPED_EXPERIMENTAL_HYPOTHESIS");
assert.equal(hypothesis.data.hypothesis.discoveryAdmission,"NOT_ADMITTED");
assert.equal(hypothesis.data.hypothesis.scientificPolarity,"INCONCLUSIVE");
assert.equal(hypothesis.data.hypothesis.sharedTransactionHash,success.data.transactions.jointRedemption);
const failureIds=new Set(failure.data.cases.map(x=>x.experimentId));
assert.deepEqual([...failureIds].sort(),[
    "REVERT-ERC20-APPROVAL","REVERT-ERC20-BALANCE","REVERT-NFT-APPROVAL","REVERT-NONOWNER"
]);
const amount=(x)=>BigInt(x);
const o=success.data.observations;
assert.equal(amount(o.alicePayoutNetOfGas),amount(o.ethRedeemed));
assert.equal(amount(o.nftBackingBefore)-amount(o.nftBackingAfter),amount(o.ethRedeemed));
assert.ok(amount(o.nftBackingAfter)>=amount(o.nftObligationAfter));
assert.ok(amount(o.erc20SupplyBefore)>amount(o.erc20SupplyAfter));
assert.equal(amount(o.erc20SupplyBefore)-amount(o.erc20SupplyAfter),amount(o.supplyDecrease));
for(const item of failure.data.cases) {
    assert.equal(item.sourceProvenance.participantA.split("@")[1],pinA);
    assert.equal(item.sourceProvenance.participantB.split("@")[1],pinB);
    assert.equal(item.unchanged,true);
    assert.deepEqual(item.measuredStateAfter,item.measuredStateBefore);
}
const sha=p=>crypto.createHash("sha256").update(p.raw).digest("hex");
const report={
    schemaVersion:"OECL_SCOPED_INTERACTION_EXPERIMENT_SUITE_V1",
    sourceRevisions:{erc8060:pinA,erc8098:pinB},
    localChainId:31337,
    hypothesisId:hypothesis.data.hypothesis.hypothesisId,
    provenances:{
        successfulTransaction:{transactionHash:success.data.transactions.jointRedemption,artifactSha256:sha(success)},
        reverts:{artifactSha256:sha(failure),cases:failure.data.cases.map(x=>({
            experimentId:x.experimentId,transactionHash:x.attemptedTransactionHash,
            revertedReceiptStatus:x.revertedReceiptStatus,
            unchangedState:true
        }))},
        candidateHypothesis:{artifactSha256:sha(hypothesis)}
    },
    experimentalQuestions:{
        jointAtomicity:{
            outcome:"OBSERVED_SUCCESSFUL_SINGLE_TRANSACTION",
            evidenceTransactionHash:success.data.transactions.jointRedemption,
            limit:"No global cross-protocol atomicity claim; interaction is local and scoped."
        },
        failureRollback:{
            outcome:"FOUR_REVERT_CASES_STATE_UNCHANGED",
            cases:failure.data.cases.map(x=>x.experimentId),
            limit:"Only the named four failure scenarios are covered; failed-call receipts may be unavailable."
        },
        nftSolvency:{
            outcome:"OBSERVED_BACKING_REMAINS_AT_OR_ABOVE_OBLIGATIONS",
            beforeWei:o.nftBackingBefore,afterWei:o.nftBackingAfter,
            outstandingObligationsWei:o.nftObligationAfter
        },
        monotoneSupply:{
            outcome:"OBSERVED_SUPPLY_DECREASE",
            before:o.erc20SupplyBefore,after:o.erc20SupplyAfter
        }
    },
    sourceAuditStatus:"ARTIFACT_LINKED_LOCAL_EXECUTION_NOT_INDEPENDENT_CHAIN_REPLAY",
    discoveredCandidateStatus:"NOT_ADMITTED",
    scientificPolarity:"INCONCLUSIVE",
    pending:["INDEPENDENT_RECEIPT_REPLAY","ADVERSARIAL_REENTRANCY_CASE","CANDIDATE_SOURCE_DERIVED_DISCOVERY","FULL_HISTORICAL_REGRESSION_REVIEW"]
};
fs.writeFileSync(outputPath,JSON.stringify(report,null,2)+"\n");
console.log("OECL_INTERACTION_SUITE:"+JSON.stringify({
    rollbackCases:failure.data.cases.length,experimentalQuestions:Object.keys(report.experimentalQuestions).length,
    candidate:report.discoveredCandidateStatus,polarity:report.scientificPolarity
}));
