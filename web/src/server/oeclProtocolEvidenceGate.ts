import { getLiveErc8004EthereumVerification } from "@/server/oeclEthereumVerification";

type NetworkConfig = {
  network: "ethereum" | "base" | "polygon";
  label: string;
  chainId: string;
  rpcUri: string;
  candidateAddress: string | null;
};

type JsonRpcResponse = {
  result?: unknown;
  error?: {
    code?: number;
    message?: string;
  };
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
        process.env.OECL_EVIDENCE_ETHEREUM_ADDRESS?.trim() || null,
    },
    {
      network: "base",
      label: "Base",
      chainId: "8453",
      rpcUri:
        process.env.BASE_MAINNET_RPC_URL?.trim() ||
        "https://mainnet.base.org",
      candidateAddress:
        process.env.OECL_EVIDENCE_BASE_ADDRESS?.trim() || null,
    },
    {
      network: "polygon",
      label: "Polygon",
      chainId: "137",
      rpcUri:
        process.env.POLYGON_MAINNET_RPC_URL?.trim() ||
        "https://polygon-bor-rpc.publicnode.com",
      candidateAddress:
        process.env.OECL_EVIDENCE_POLYGON_ADDRESS?.trim() || null,
    },
  ];
}

async function rpc(
  uri: string,
  method: string,
  params: unknown[]
): Promise<unknown> {
  const response = await fetch(uri, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method,
      params,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`${method} HTTP ${response.status}`);
  }

  const body = (await response.json()) as JsonRpcResponse;

  if (body.error) {
    throw new Error(
      `${method} RPC error: ${body.error.message ?? body.error.code ?? "UNKNOWN"}`
    );
  }

  return body.result;
}

function validAddress(value: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(value);
}

async function observeCandidateDeployment(
  config: NetworkConfig
) {
  if (!config.candidateAddress) {
    return {
      protocolStatus: "NO_EVIDENCE_SOURCE" as const,
      candidateAddress: null,
      chainMatch: null,
      runtimeCodePresent: null,
      error: null,
    };
  }

  if (!validAddress(config.candidateAddress)) {
    return {
      protocolStatus: "INVALID_EVIDENCE_SOURCE" as const,
      candidateAddress: config.candidateAddress,
      chainMatch: false,
      runtimeCodePresent: false,
      error: "Candidate deployment address is invalid.",
    };
  }

  try {
    const [chainResult, codeResult] = await Promise.all([
      rpc(config.rpcUri, "eth_chainId", []),
      rpc(config.rpcUri, "eth_getCode", [
        config.candidateAddress,
        "latest",
      ]),
    ]);

    if (typeof chainResult !== "string") {
      throw new Error("eth_chainId returned an invalid value.");
    }

    const observedChainId =
      BigInt(chainResult).toString(10);

    const chainMatch =
      observedChainId === config.chainId;

    const runtimeCodePresent =
      typeof codeResult === "string" &&
      codeResult !== "0x";

    return {
      protocolStatus:
        chainMatch && runtimeCodePresent
          ? "RUNTIME_CODE_OBSERVED_AT_CANDIDATE" as const
          : "NO_CODE_AT_CANDIDATE" as const,
      candidateAddress: config.candidateAddress,
      chainMatch,
      runtimeCodePresent,
      error: null,
    };
  } catch (error) {
    return {
      protocolStatus: "UNRESOLVED" as const,
      candidateAddress: config.candidateAddress,
      chainMatch: false,
      runtimeCodePresent: false,
      error:
        error instanceof Error
          ? error.message
          : "Unknown deployment observation error.",
    };
  }
}

export async function getProtocolEvidenceGate() {
  const primaryProtocolId = "ERC-8004";

  const candidateProtocolId =
    process.env.OECL_EVIDENCE_PROTOCOL_ID?.trim() ||
    "ERC-8060";

  const primary =
    await getLiveErc8004EthereumVerification();

  const primaryByNetwork = new Map(
    primary.networks.map((network) => [
      network.network,
      network,
    ])
  );

  const networks = await Promise.all(
    configs().map(async (config) => {
      const primaryObservation =
        primaryByNetwork.get(config.network);

      const candidate =
        await observeCandidateDeployment(config);

      const primaryStatus =
        primaryObservation?.status === "VERIFIED"
          ? "OBSERVED_VERIFIED" as const
          : "UNRESOLVED" as const;

      const eligible =
        primaryStatus === "OBSERVED_VERIFIED" &&
        candidate.protocolStatus ===
          "RUNTIME_CODE_OBSERVED_AT_CANDIDATE";

      return {
        network: config.network,
        networkLabel: config.label,
        chainId: config.chainId,

        primary: {
          protocolId: primaryProtocolId,
          status: primaryStatus,
          evidenceBasis:
            primaryObservation?.status === "VERIFIED"
              ? "THE_GRAPH_PLUS_SAME_BLOCK_ETHEREUM_RPC"
              : null,
        },

        candidate: {
          protocolId: candidateProtocolId,
          ...candidate,
          evidenceBasis:
            candidate.protocolStatus ===
            "RUNTIME_CODE_OBSERVED_AT_CANDIDATE"
              ? "CANDIDATE_ADDRESS_PLUS_ETH_GETCODE"
              : null,
        },

        pairEligibility:
          eligible
            ? "ELIGIBLE_FOR_INTERACTION_SEARCH" as const
            : "NOT_ELIGIBLE_FOR_INTERACTION_SEARCH" as const,
      };
    })
  );

  const eligibleNetworks =
    networks.filter(
      (network) =>
        network.pairEligibility ===
        "ELIGIBLE_FOR_INTERACTION_SEARCH"
    ).length;

  return {
    status: "EVIDENCE_GATE_COMPLETE" as const,

    rule:
      "KNOWLEDGE_MAY_LOCATE_EVIDENCE_BUT_CANNOT_REPLACE_OBSERVATION",

    primaryProtocolId,
    candidateProtocolId,

    eligibleNetworks,
    totalNetworks: networks.length,

    interpretation: {
      runtimeCodeObservedAtCandidate:
        "Runtime code exists at a supplied candidate deployment address on the expected chain.",
      noEvidenceSource:
        "OECL has no independently testable deployment locator for this protocol on this chain.",
      eligibility:
        "Eligibility permits searching for a qualifying on-chain interaction. It does not establish compatibility or composition.",
    },

    networks,
  };
}
