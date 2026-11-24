import { createHash } from "node:crypto";

/**
 * Editorially compact, provenance-pinned excerpts of the independently reviewed
 * source-only AST plans + same-run local EVM scientist review from GitHub Actions
 * 45465965307, commit c7c2bded0d58f343956ba549f165abe5dfd0b243.
 * NOT an independent receipt authenticator. The raw CI evidence remains linked.
 */
const PINNED = {
  "ERC-4626|ERC-20": {
    "title": "Vault share accounting versus plain ERC-20 behavior",
    "origin": "AST_SOURCE_ONLY",
    "hypothesisId": "AST-HYP-6d8375c0288cc4724465377d",
    "hypothesisKind": "SHARED_STANDARD_INHERITANCE",
    "hypothesis": "The pinned ERC-4626 vault and plain ERC-20 asset share a compiler-resolved ERC20 base. Shared inheritance alone does not establish equivalent extended methods or cross-contract compatibility.",
    "question": "Does shared ERC-20 inheritance imply identical deposit behavior in the two reviewed implementations?",
    "sourcePathScreen": "NO_EXECUTABLE_ROUTE_SPECIFIED",
    "preregisteredTestCount": 3,
    "positiveOutcome": "SCOPED_BEHAVIORAL_DIFFERENCE_OBSERVED",
    "tests": [
      {
        "id": "CAP-828c53b5e47059266b8cae7c",
        "name": "Vault deposit",
        "falsifier": "A mined successful deposit without the observed asset custody and share-supply increases",
        "observation": "The pinned vault received 100 underlying tokens and issued 100 shares.",
        "evidenceType": "MINED_LOCAL_TRANSACTION",
        "tx": "0x09229f61502c4af29a948f5df9ea1fb2eab7ffe76f2a5d257bd211357fcf7257"
      },
      {
        "id": "CAP-cfbf7f47bacfaf80a4122cbc",
        "name": "Vault redemption",
        "falsifier": "A mined successful redemption that leaves vault supply or custody unchanged",
        "observation": "The pinned vault redeemed 40 shares and released 40 underlying tokens.",
        "evidenceType": "MINED_LOCAL_TRANSACTION",
        "tx": "0xafe2dee7752a935ecc0028acbad3622e8ecb14cfcee46ed20e3e0b173ee8a5d2"
      },
      {
        "id": "CAP-449866008e1e9f4b9cc88ed6",
        "name": "Plain ERC-20 deposit selector",
        "falsifier": "A valid, ABI-decodable ERC-4626 deposit result returned by the pinned plain ERC-20 asset",
        "observation": "The raw local call did not revert but returned 0x (empty bytes), which cannot be decoded as an ERC-4626 deposit return. No transaction was mined.",
        "evidenceType": "UNMINED_READ_ONLY_ABI_PROBE",
        "rawReturn": "0x",
        "callReverted": false,
        "decodableAsDeposit": false
      }
    ],
    "limitations": [
      "Only OpenZeppelin 4.9.6 pinned wrappers on local Hardhat 31337 were examined.",
      "No hostile ERC-20 asset, general interoperability or production security was tested.",
      "Unmined read-only calls are not transaction receipts."
    ],
    "provenance": {
      "sourceRunId": 45465965307,
      "sourcePlanSha256": "b5cec547559ca064f4d2a64b0fdf9be7505a7421368262e7ac2eca5bd9979ac8",
      "scientificConclusionSha256": "a0698440cdaa7fd7add7c799296f89b5fcdd6d85167dbda7c1e0e01a0d93ebd8",
      "sourceGraphSha256": "c569919ca14efc777ca8f416cddcdea279abf597742995abbbe9e60777b8ca18",
      "evmArtifactSha256": "be7aa22547c8f0cadbd484a5d3cce55e44d81300b2c560f04188ce82c31855e9",
      "sourceARevision": "4.9.6",
      "sourceBRevision": "4.9.6"
    }
  },
  "ERC-8098|ERC-4626": {
    "title": "Two conditional supply decreases with boundary challenges",
    "origin": "AST_SOURCE_ONLY",
    "hypothesisId": "AST-HYP-7bb4f7ca6a8dfee4feeb62cc",
    "hypothesisKind": "POTENTIAL_COUPLED_STATE_DECREASE",
    "hypothesis": "The compiler detects separate public entrypoints capable of decreasing tracked supply in the pinned ERC-8098 and ERC-4626 implementations. This is not a claim of atomic cross-contract execution.",
    "question": "Does every successful invocation of those entrypoints decrease supply, and can every invocation execute?",
    "sourcePathScreen": "NOT_PROVEN_EXECUTABLE",
    "preregisteredTestCount": 4,
    "positiveOutcome": "CONTROLLED_LOCAL_EVM_AND_REPLAY_COMPLETE",
    "tests": [
      {
        "id": "be03b568ea6676aeb5adfda9",
        "name": "ERC-8098 burn",
        "falsifier": "A successful positive owner burn that does not reduce supply, or a zero-quantity success that disproves unconditional strict decrease",
        "observation": "An eligible positive burn decreased supply; a successful zero-quantity burn did not. An above-owned-balance callStatic reverted without mining.",
        "evidenceType": "MINED_POSITIVE_WITH_ZERO_AND_UNMINED_BOUNDARIES",
        "tx": "0xc343ec627831c469be932b302a53ffdd2e36605f109813fbe386226964324aa4",
        "zeroTx": "0xa2c2da3dec6b32e0d8a1c47976878049e0d793b07910dd96da927f42b40c97e1",
        "negativeReverted": true
      },
      {
        "id": "ef69d7e9f8102534096caa02",
        "name": "ERC-4626 redeem",
        "falsifier": "A successful positive owner redemption without a supply decrease, or boundary behavior contradicting an unconditional claim",
        "observation": "An eligible positive redemption decreased share supply; a successful zero-quantity redemption did not. An above-owned-balance callStatic reverted without mining.",
        "evidenceType": "MINED_POSITIVE_WITH_ZERO_AND_UNMINED_BOUNDARIES",
        "tx": "0x82f97b64e2fda2e82cf02f8c970353a9c2115725ffc407f6ae0831f5154ebbcc",
        "zeroTx": "0xffec1978afdc6a454729a6e1e4dd57cf37caee4abc0437ddd44c963a17cac131",
        "negativeReverted": true
      }
    ],
    "limitations": [
      "Successful zero-quantity executions refute an overbroad strict-decrease claim, not the original conditional AST observation.",
      "Above-balance errors were unmined read-only EVM simulations, not mined negative receipts.",
      "Cross-contract atomicity, arbitrary implementations, adverse callbacks and universal compatibility remain unproven."
    ],
    "provenance": {
      "sourceRunId": 45465965307,
      "sourcePlanSha256": "7af4f702503a74f97b269c378a9844365e3cc0c705ff7c6fd0ea63623cbdd0b8",
      "scientificConclusionSha256": "b62a2ef424e159a6c720d814ae10ed256764080bf0cbcd2705b52140b061752e",
      "sourceGraphSha256": "447d1b2f55c17956c200b550757c60e782109f4cc489436367f852f3c6eee0d9",
      "sourceARevision": "68a05289bd68d89db8453c49500e0a1ae6cd11ec",
      "sourceBRevision": "4.9.6",
      "originalSourceProtocolSha256": "5888bd5f87df31a440901f5e37944b538ffe87b71e25c1b607777dae50574991",
      "challengePlanSha256": "1ce82a7a35403eaf02afe466a40f0cd937cd39d6f09a73060b1d8a751efb60fe",
      "positiveEvmArtifactSha256": "3ef907070b073747592b895f411307e9dc50414e826bc5ed671855c087c51ef0",
      "counterfactualEvmArtifactSha256": "9b28a24fb4ca0f55f5d8f310aa2a33c642c3d7f02b27ecffd1f7d2c0f79101e5"
    }
  }
} as const;

const PINNED_DEPLOYED_SHA="c7c2bded0d58f343956ba549f165abe5dfd0b243";
const PINNED_SNAPSHOT_SHA256="2e1e79e922f4d66111d0e26f7133ba89cd02ef92134555b2bce1cfff7f1674e5";
const sha=(s:string)=>createHash("sha256").update(s).digest("hex");
export function getPinnedScientificCycle(sourceA:string,sourceB:string){
  const key=[sourceA,sourceB].sort().join("|");
  const a=Object.keys(PINNED).find(k=>k.split("|").sort().join("|")===key);
  if(!a) return null;
  if(sha(JSON.stringify(PINNED))!==PINNED_SNAPSHOT_SHA256)
    throw Error("OECL_SCIENTIFIC_CYCLE_INTEGRITY_FAILURE");
  const cycle=PINNED[a as keyof typeof PINNED];
  if(cycle.origin!=="AST_SOURCE_ONLY"||
      cycle.provenance.sourceRunId!==45465965307||
      (a==="ERC-4626|ERC-20" && (cycle.tests.length!==3||cycle.preregisteredTestCount!==3))||
      (a==="ERC-8098|ERC-4626" && (cycle.tests.length!==2||cycle.preregisteredTestCount!==4))||
      cycle.tests.some(test=>test.evidenceType!=="UNMINED_READ_ONLY_ABI_PROBE" &&
        (!("tx" in test)||!/^0x[a-f0-9]{64}$/i.test(test.tx))))
    throw Error("OECL_SCIENTIFIC_CYCLE_SCOPE_FAILURE");
  return {
    schemaVersion:"OECL_PUBLIC_PINNED_SCIENTIFIC_CYCLE_V1" as const,
    status:"REVIEWED_SCOPED_SCIENTIFIC_CYCLE" as const,
    selected:a.split("|"),
    ...{cycle},
    scientificVerdict:"INCONCLUSIVE" as const,
    compatibilityVerdict:"NOT_EVALUATED" as const,
    candidateAdmission:"NOT_ADMITTED" as const,
    rawEvidenceUrl:"https://github.com/ten-io-meta/open-erc-composition-laboratory/actions/runs/45465965307",
    sourceCommit:PINNED_DEPLOYED_SHA,
    snapshotSha256:PINNED_SNAPSHOT_SHA256,
    evidenceDisclosure:"Pinned excerpts of exact-run independently reviewed AST/EVM artifacts; full artifacts remain in GitHub Actions. This read-only website does not replay the local EVM or independently authenticate chain receipts." as const
  };
}
export type PinnedScientificCycle = NonNullable<ReturnType<typeof getPinnedScientificCycle>>;
