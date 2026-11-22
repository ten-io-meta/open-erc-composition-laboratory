import {createHash} from "node:crypto";
import pinned from "@/data/oeclIndependentBurnableEvm.json";

const expectedSha256="e0ca78bf9fa95925f62a5f100b60c9ed551c26a67c7e5553986e10b006428e66";
const expectedRun=45032636392;
const expectedWorkflowCommit="51d19072b2e6f2a5e3b08dd1facd77b0ced225b9";
export const independentEvmSnapshotSha256=expectedSha256;
export type IndependentEvmReport=typeof pinned;

export function getVerifiedIndependentEvmReport():IndependentEvmReport{
  if(createHash("sha256").update(JSON.stringify(pinned)).digest("hex")!==expectedSha256||
     pinned.schemaVersion!=="OECL_INDEPENDENT_BURNABLE_WEB_V1"||
     pinned.experimentRunId!==expectedRun||
     pinned.workflowCommit!==expectedWorkflowCommit||
     pinned.sourcePair.join("|")!=="ERC-8060|ERC-20-BURNABLE"||
     pinned.scientificVerdict!=="INCONCLUSIVE"||
     pinned.candidateAdmission!=="NOT_ADMITTED"||
     pinned.universalCompatibilityEstablished!==false||
     pinned.localEvm.chainId!==31337||
     pinned.localEvm.positiveCases!==3||
     pinned.localEvm.negativeCases!==7||
     pinned.localEvm.negativeRollbacksVerified!==true||
     pinned.localEvm.sameTransactionBurns!==true||
     pinned.nativeEvaluation.localPropertyPolarity!=="SUPPORT"||
     pinned.nativeEvaluation.finalScientificVerdict!=="INCONCLUSIVE"||
     pinned.nativeEvaluation.candidateAdmission!=="NOT_ADMITTED"||
     pinned.nativeEvaluation.nativeDiscoveryReady!==false||
     pinned.nativeEvaluation.nativeCandidateAdmissionPerformed!==false||
     pinned.nativeEvaluation.sourceCoverageComplete!==false||
     pinned.nativeEvaluation.observedConstraints!==4||
     pinned.nativeEvaluation.constraints.length!==4||
     pinned.cases.length!==10||
     pinned.cases.filter(c=>c.status===1).length!==3||
     pinned.cases.filter(c=>c.status===0&&c.rollbackObserved===true).length!==7||
     new Set(pinned.cases.map(c=>c.name)).size!==10||
     pinned.cases.some(c=>!/^0x[a-f0-9]{64}$/.test(c.transactionHash))||
     Object.values(pinned.evidenceHashes).some(hash=>!/^[a-f0-9]{64}$/.test(hash))||
     pinned.sourceHashes.some(hash=>!/^[a-f0-9]{64}$/.test(hash)))
    throw Error("OECL_INDEPENDENT_EVM_EVIDENCE_HASH_OR_SCOPE_MISMATCH");
  return pinned;
}
