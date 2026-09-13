import {
  getLiveErc8004EthereumVerification,
} from "@/server/oeclEthereumVerification";

import {
  evaluateEvidenceAdmission,
} from "@/server/oeclEvidenceAdmission";


function matchStatus(
  value: boolean,
  checked: boolean
): "MATCH" | "MISMATCH" | "NOT_CHECKED" {

  if (!checked) {
    return "NOT_CHECKED";
  }

  return value
    ? "MATCH"
    : "MISMATCH";
}


function presenceStatus(
  value: boolean,
  checked: boolean
): "PRESENT" | "ABSENT" | "NOT_CHECKED" {

  if (!checked) {
    return "NOT_CHECKED";
  }

  return value
    ? "PRESENT"
    : "ABSENT";
}


export async function getErc8004EvidenceReceiptBundle() {

  const verification =
    await getLiveErc8004EthereumVerification();


  if (verification.status === "NOT_CONFIGURED") {

    return {
      schemaVersion:
        "OECL_EVIDENCE_RECEIPT_BUNDLE_V1",

      status:
        "NOT_CONFIGURED" as const,

      protocolId:
        "ERC-8004",

      standardizedObservation:
        "AGENT0-ERC8004",

      observer:
        "THE_GRAPH",

      witness:
        "INDEPENDENT_CHAIN_STATE",

      policy: {
        id:
          "OECL_EVIDENCE_ADMISSION_V1",

        rule:
          "Observer and witness evidence must both exist. Agreement is admissible, contradiction is rejected, and unavailable evidence remains incomplete.",
      },

      coverage:
        "NONE" as const,

      networksTargeted: 0,
      admissibleCount: 0,
      rejectedCount: 0,
      incompleteCount: 0,
      totalReceipts: 0,

      evidenceState:
        "INCOMPLETE" as const,

      compatibilityConclusion:
        "NOT_ESTABLISHED" as const,

      receipts: [],
    };
  }


  const receipts =
    verification.networks.map(
      (network) => {

        const observerReady =
          network.indexedBlock !== null &&
          typeof network.graphBlockHash === "string" &&
          network.graphBlockHash.length > 0 &&
          network.sampleAgent !== null &&
          Boolean(network.sampleAgent?.agentId) &&
          Boolean(network.sampleAgent?.owner);

        const witnessReady =
          network.error === null;

        const decision =
          evaluateEvidenceAdmission({
            observerReady,
            witnessReady,
            chainMatch:
              network.chainMatch,
            blockHashMatch:
              network.blockHashMatch,
            runtimeCodePresent:
              network.runtimeCodePresent,
            ownerMatch:
              network.ownerMatch,
          });

        const checksAvailable =
          observerReady &&
          witnessReady;


        return {
          schemaVersion:
            "OECL_EVIDENCE_RECEIPT_V1",

          policyId:
            "OECL_EVIDENCE_ADMISSION_V1",

          receiptType:
            "VERIFIED_PROTOCOL_STATE",

          protocolId:
            "ERC-8004",

          subject:
            "ERC8004_AGENT_IDENTITY",

          observer: {
            provider:
              network.graphProvider,

            providerMode:
              network.graphProviderMode,

            schemaId:
              "AGENT0-ERC8004",

            network:
              network.network,

            chainId:
              network.chainId,

            indexedBlock: {
              number:
                network.indexedBlock,

              hash:
                network.graphBlockHash,
            },

            deployment:
              network.deployment,

            sampleAgent:
              network.sampleAgent,
          },

          witness: {
            provider:
              "CHAIN_JSON_RPC",

            network:
              network.network,

            chainId:
              network.chainId,

            identityRegistry:
              network.identityRegistry,

            blockHash:
              network.rpcBlockHash,

            runtimeCodePresent:
              network.runtimeCodePresent,

            sampleAgentOwner:
              network.chainOwner,
          },

          checks: {
            observerEvidence:
              observerReady
                ? "AVAILABLE"
                : "UNAVAILABLE",

            witnessEvidence:
              witnessReady
                ? "AVAILABLE"
                : "UNAVAILABLE",

            chainId:
              matchStatus(
                network.chainMatch,
                checksAvailable
              ),

            blockHash:
              matchStatus(
                network.blockHashMatch,
                checksAvailable
              ),

            registryRuntime:
              presenceStatus(
                network.runtimeCodePresent,
                checksAvailable
              ),

            ownerOf:
              matchStatus(
                network.ownerMatch,
                checksAvailable
              ),
          },

          verdict:
            decision.verdict,

          admission:
            decision.admission,

          reasons:
            decision.reasons,

          diagnostics:
            network.error
              ? [network.error]
              : [],

          compatibilityConclusion:
            "NOT_ESTABLISHED",

          rule:
            "Protocol-state evidence may advance only when the standardized observation agrees with independent chain state. Availability failure remains incomplete; an observed contradiction is rejected.",
        };
      }
    );


  const admissibleCount =
    receipts.filter(
      receipt =>
        receipt.admission === "ADMISSIBLE"
    ).length;


  const rejectedCount =
    receipts.filter(
      receipt =>
        receipt.admission === "REJECTED"
    ).length;


  const incompleteCount =
    receipts.filter(
      receipt =>
        receipt.admission === "INCOMPLETE"
    ).length;


  /*
   * Coverage describes whether all requested networks
   * produced evaluable evidence.
   *
   * It is NOT a global admission decision.
   *
   * An application may consume an individual admissible
   * receipt even if another network is incomplete.
   */
  const coverage =
    incompleteCount > 0
      ? "PARTIAL" as const
      : "COMPLETE" as const;


  const evidenceState =
    rejectedCount > 0
      ? "HAS_REJECTIONS" as const
      : incompleteCount > 0
        ? "INCOMPLETE" as const
        : "ALL_ADMISSIBLE" as const;


  return {
    schemaVersion:
      "OECL_EVIDENCE_RECEIPT_BUNDLE_V1",

    status:
      "EVIDENCE_RECEIPTS_ISSUED" as const,

    protocolId:
      "ERC-8004",

    standardizedObservation:
      "AGENT0-ERC8004",

    observer:
      "THE_GRAPH",

    witness:
      "INDEPENDENT_CHAIN_STATE",

    policy: {
      id:
        "OECL_EVIDENCE_ADMISSION_V1",

      rule:
        "Observer and witness evidence must both exist. Agreement is admissible, contradiction is rejected, and unavailable evidence remains incomplete.",
    },

    coverage,

    networksTargeted:
      receipts.length,

    admissibleCount,
    rejectedCount,
    incompleteCount,

    totalReceipts:
      receipts.length,

    evidenceState,

    compatibilityConclusion:
      "NOT_ESTABLISHED" as const,

    receipts,
  };
}