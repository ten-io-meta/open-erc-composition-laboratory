import { getLiveAgent0MultichainState } from "@/server/oeclTheGraph";

const ERC8004_IDENTITY_REGISTRY =
  "0x8004A169FB4a3325136EB29fA0ceB6D2e539a432";

type RpcTarget = {
  network: string;
  chainId: string;
  uri: string;
};

function rpcTargets(): RpcTarget[] {
  return [
    {
      network: "ethereum",
      chainId: "1",
      uri:
        process.env.ETHEREUM_MAINNET_RPC_URL?.trim() ||
        "https://ethereum-rpc.publicnode.com",
    },
    {
      network: "base",
      chainId: "8453",
      uri:
        process.env.BASE_MAINNET_RPC_URL?.trim() ||
        "https://mainnet.base.org",
    },
    {
      network: "polygon",
      chainId: "137",
      uri:
        process.env.POLYGON_MAINNET_RPC_URL?.trim() ||
        "https://polygon-bor-rpc.publicnode.com",
    },
  ];
}

type JsonRpcResponse = {
  result?: unknown;
  error?: {
    code?: number;
    message?: string;
  };
};

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

function ownerOfCallData(agentId: string): string {
  const tokenId = BigInt(agentId);

  if (tokenId < BigInt(0)) {
    throw new Error("Negative agentId is invalid.");
  }

  return `0x6352211e${tokenId.toString(16).padStart(64, "0")}`;
}

function decodeAddress(value: unknown): string {
  if (typeof value !== "string" || !value.startsWith("0x")) {
    throw new Error("ownerOf returned an invalid value.");
  }

  const hex = value.slice(2);

  if (hex.length < 40) {
    throw new Error("ownerOf returned a short value.");
  }

  return `0x${hex.slice(-40)}`.toLowerCase();
}

function networkLabel(network: string): string {
  if (network === "ethereum") return "Ethereum";
  if (network === "base") return "Base";
  if (network === "polygon") return "Polygon";

  return network;
}

export async function getLiveErc8004EthereumVerification() {
  const graph = await getLiveAgent0MultichainState();

  if (graph.status === "NOT_CONFIGURED") {
    return {
      status: "NOT_CONFIGURED" as const,
      protocolId: "ERC-8004",
      identityRegistry: ERC8004_IDENTITY_REGISTRY,
      verifiedNetworks: 0,
      totalNetworks: 0,
      networks: [],
    };
  }

  const targets = new Map(
    rpcTargets().map((target) => [target.network, target])
  );

  const networks = await Promise.all(
    graph.networks.map(async (observation) => {
      const target = targets.get(observation.network);

      const base = {
        network: observation.network,
        networkLabel: networkLabel(observation.network),
        chainId: observation.chainId,
        identityRegistry: ERC8004_IDENTITY_REGISTRY,
        indexedBlock: observation.indexedBlock?.number ?? null,
        graphBlockHash: observation.indexedBlock?.hash ?? null,
        deployment: observation.deployment,
        graphProvider: observation.provider,
        graphProviderMode: observation.providerMode,
        sampleAgent: observation.sampleAgent,
      };

      if (!target) {
        return {
          ...base,
          status: "NOT_VERIFIED" as const,
          chainMatch: false,
          blockHashMatch: false,
          runtimeCodePresent: false,
          ownerMatch: false,
          rpcBlockHash: null,
          chainOwner: null,
          error: "No RPC target configured.",
        };
      }

      if (
        observation.indexedBlock?.number === undefined ||
        !observation.indexedBlock.hash
      ) {
        return {
          ...base,
          status: "NOT_VERIFIED" as const,
          chainMatch: false,
          blockHashMatch: false,
          runtimeCodePresent: false,
          ownerMatch: false,
          rpcBlockHash: null,
          chainOwner: null,
          error: "The Graph observation has no indexed block provenance.",
        };
      }

      if (
        !observation.sampleAgent?.agentId ||
        !observation.sampleAgent.owner
      ) {
        return {
          ...base,
          status: "NOT_VERIFIED" as const,
          chainMatch: false,
          blockHashMatch: false,
          runtimeCodePresent: false,
          ownerMatch: false,
          rpcBlockHash: null,
          chainOwner: null,
          error: "No sample agent is available for owner verification.",
        };
      }

      try {
        const blockNumber = observation.indexedBlock.number;
        const blockTag = `0x${blockNumber.toString(16)}`;

        const [
          rpcChainResult,
          rpcBlockResult,
          runtimeCodeResult,
          ownerResult,
        ] = await Promise.all([
          rpc(target.uri, "eth_chainId", []),

          rpc(target.uri, "eth_getBlockByNumber", [
            blockTag,
            false,
          ]),

          rpc(target.uri, "eth_getCode", [
            ERC8004_IDENTITY_REGISTRY,
            blockTag,
          ]),

          rpc(target.uri, "eth_call", [
            {
              to: ERC8004_IDENTITY_REGISTRY,
              data: ownerOfCallData(observation.sampleAgent.agentId),
            },
            blockTag,
          ]),
        ]);

        if (typeof rpcChainResult !== "string") {
          throw new Error("eth_chainId returned an invalid value.");
        }

        const rpcChainId = BigInt(rpcChainResult).toString(10);

        const rpcBlock =
          rpcBlockResult as {
            hash?: string | null;
          } | null;

        const rpcBlockHash =
          rpcBlock?.hash?.toLowerCase() ?? null;

        const graphBlockHash =
          observation.indexedBlock.hash.toLowerCase();

        const runtimeCodePresent =
          typeof runtimeCodeResult === "string" &&
          runtimeCodeResult !== "0x";

        const chainOwner =
          decodeAddress(ownerResult);

        const graphOwner =
          observation.sampleAgent.owner.toLowerCase();

        const chainMatch =
          rpcChainId === observation.chainId;

        const blockHashMatch =
          rpcBlockHash === graphBlockHash;

        const ownerMatch =
          chainOwner === graphOwner;

        const verified =
          chainMatch &&
          blockHashMatch &&
          runtimeCodePresent &&
          ownerMatch;

        return {
          ...base,
          status:
            verified
              ? "VERIFIED" as const
              : "NOT_VERIFIED" as const,
          chainMatch,
          blockHashMatch,
          runtimeCodePresent,
          ownerMatch,
          rpcBlockHash,
          chainOwner,
          error: null,
        };
      } catch (error) {
        return {
          ...base,
          status: "ERROR" as const,
          chainMatch: false,
          blockHashMatch: false,
          runtimeCodePresent: false,
          ownerMatch: false,
          rpcBlockHash: null,
          chainOwner: null,
          error:
            error instanceof Error
              ? error.message
              : "Unknown RPC verification error.",
        };
      }
    })
  );

  const verifiedNetworks =
    networks.filter(
      (network) => network.status === "VERIFIED"
    ).length;

  return {
    status:
      verifiedNetworks === networks.length
        ? "VERIFIED" as const
        : verifiedNetworks > 0
          ? "PARTIAL" as const
          : "ERROR" as const,
    protocolId: "ERC-8004",
    verificationBasis:
      "THE_GRAPH_INDEXED_STATE_CROSS_CHECKED_AGAINST_ETHEREUM_JSON_RPC_AT_THE_SAME_BLOCK",
    identityRegistry: ERC8004_IDENTITY_REGISTRY,
    verifiedNetworks,
    totalNetworks: networks.length,
    networks,
  };
}
