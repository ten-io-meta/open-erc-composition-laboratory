import { getLiveErc8004EthereumVerification } from "@/server/oeclEthereumVerification";
import {
  buildConfiguredProtocolDescriptor,
  observeProtocolCandidate,
} from "@/server/oeclCandidateEvidenceVerifier";

type NetworkConfig = {
  network: "ethereum" | "base" | "polygon";
  label: string;
  chainId: string;
  rpcUri: string;
  candidateAddress: string | null;
  sourceClaim: string | null;
  sourceClaimProvenance: string | null;
};

function configs(): NetworkConfig[] {
  return [
    {
      network: "ethereum",
      label: "Ethereum",
      chainId: "1",
      rpcUri:
        process.env.ETHEREUM_MAINNET_RPC_URL?.trim() ||
        "https://ethereum-rpc.publicnode.com",
      candidateAddress:
        process.env.OECL_EVIDENCE_ETHEREUM_ADDRESS?.trim() ||
        null,
      sourceClaim:
        process.env.OECL_EVIDENCE_ETHEREUM_DEPLOYMENT_CLAIM?.trim() ||
        null,
      sourceClaimProvenance:
        process.env.OECL_EVIDENCE_ETHEREUM_DEPLOYMENT_CLAIM_PROVENANCE?.trim() ||
        null,
    },
    {
      network: "base",
      label: "Base",
      chainId: "8453",
      rpcUri:
        process.env.BASE_MAINNET_RPC_URL?.trim() ||
        "https://mainnet.base.org",
      candidateAddress:
        process.env.OECL_EVIDENCE_BASE_ADDRESS?.trim() ||
        null,
      sourceClaim:
        process.env.OECL_EVIDENCE_BASE_DEPLOYMENT_CLAIM?.trim() ||
        null,
      sourceClaimProvenance:
        process.env.OECL_EVIDENCE_BASE_DEPLOYMENT_CLAIM_PROVENANCE?.trim() ||
        null,
    },
    {
      network: "polygon",
      label: "Polygon",
      chainId: "137",
      rpcUri:
        process.env.POLYGON_MAINNET_RPC_URL?.trim() ||
        "https://polygon-bor-rpc.publicnode.com",
      candidateAddress:
        process.env.OECL_EVIDENCE_POLYGON_ADDRESS?.trim() ||
        null,
      sourceClaim:
        process.env.OECL_EVIDENCE_POLYGON_DEPLOYMENT_CLAIM?.trim() ||
        null,
      sourceClaimProvenance:
        process.env.OECL_EVIDENCE_POLYGON_DEPLOYMENT_CLAIM_PROVENANCE?.trim() ||
        null,
    },
  ];
}

export async function getProtocolEvidenceGate() {
  const primaryProtocolId =
    "ERC-8004";

  const candidateProtocolId =
    process.env
      .OECL_EVIDENCE_PROTOCOL_ID
      ?.trim() ||
    "ERC-8060";

  const candidateDescriptor =
    buildConfiguredProtocolDescriptor(
      candidateProtocolId
    );

  const primary =
    await getLiveErc8004EthereumVerification();

  const primaryByNetwork =
    new Map(
      primary.networks.map(
        (network) => [
          network.network,
          network,
        ]
      )
    );

  const networks =
    await Promise.all(
      configs().map(
        async (config) => {
          const primaryObservation =
            primaryByNetwork.get(
              config.network
            );

          const candidate =
            await observeProtocolCandidate({
              rpcUri: config.rpcUri,
              expectedChainId:
                config.chainId,
              candidateAddress:
                config.candidateAddress,
              descriptor:
                candidateDescriptor,
            });

          const primaryStatus =
            primaryObservation?.status ===
            "VERIFIED"
              ? "OBSERVED_VERIFIED" as const
              : "UNRESOLVED" as const;

          const eligible =
            primaryStatus ===
              "OBSERVED_VERIFIED" &&
            candidate.identityStatus ===
              "IDENTITY_CRITERIA_SATISFIED";

          return {
            network:
              config.network,

            networkLabel:
              config.label,

            chainId:
              config.chainId,

            primary: {
              protocolId:
                primaryProtocolId,

              status:
                primaryStatus,

              evidenceBasis:
                primaryObservation?.status ===
                "VERIFIED"
                  ? "THE_GRAPH_PLUS_SAME_BLOCK_ETHEREUM_RPC"
                  : null,
            },

            candidate: {
              protocolId:
                candidateProtocolId,

              sourceClaim: {
                status:
                  config.sourceClaim
                    ? "SOURCE_CLAIM_OBSERVED" as const
                    : "NO_SOURCE_CLAIM" as const,

                statement:
                  config.sourceClaim,

                provenance:
                  config.sourceClaimProvenance,

                locatorStatus:
                  config.candidateAddress
                    ? "LOCATOR_SUPPLIED" as const
                    : "LOCATOR_UNRESOLVED" as const,
              },

              ...candidate,

              evidenceBasis:
                candidate.identityStatus ===
                "IDENTITY_CRITERIA_SATISFIED"
                  ? "SAME_BLOCK_ETHEREUM_RPC_PLUS_CONFIGURED_IDENTITY_CRITERIA"
                  : candidate.runtimeCodePresent
                    ? "SAME_BLOCK_ETHEREUM_RPC_RUNTIME_CODE_ONLY"
                    : null,
            },

            pairEligibility:
              eligible
                ? "ELIGIBLE_FOR_INTERACTION_SEARCH" as const
                : "NOT_ELIGIBLE_FOR_INTERACTION_SEARCH" as const,
          };
        }
      )
    );

  const eligibleNetworks =
    networks.filter(
      (network) =>
        network.pairEligibility ===
        "ELIGIBLE_FOR_INTERACTION_SEARCH"
    ).length;

  return {
    status:
      "EVIDENCE_GATE_COMPLETE" as const,

    rule:
      "KNOWLEDGE_DEFINES_WHAT_TO_TEST_ETHEREUM_DETERMINES_WHETHER_THE_TEST_PASSES",

    primaryProtocolId,
    candidateProtocolId,

    descriptor: {
      protocolId:
        candidateDescriptor.protocolId,

      identityCriteria:
        candidateDescriptor.identityCriteria,
    },

    eligibleNetworks,
    totalNetworks:
      networks.length,

    interpretation: {
      runtimeCode:
        "Runtime bytecode at a candidate address is observable evidence, but does not establish protocol identity.",

      identityCriteria:
        "Identity criteria originate from the evidence descriptor and are executed against Ethereum at the same observed block.",

      eligibility:
        "Eligibility requires verified primary evidence and satisfied candidate identity criteria. It permits interaction search only; it does not establish compatibility or composition.",

      noEvidenceSource:
        "NO_EVIDENCE_SOURCE means OECL has no independently testable locator on that chain. It does not mean no deployment exists.",
    },

    networks,
  };
}
