import { ScientificTheGraphSubgraphMcpLiveClient } from "../../../laboratory/scientific-the-graph-subgraph-mcp/ScientificTheGraphSubgraphMcpClient.js";
import { ScientificTheGraphSubgraphMcpKeywordProvider } from "../../../laboratory/scientific-the-graph-subgraph-mcp/ScientificTheGraphSubgraphMcpKeywordProvider.js";
import { ScientificTheGraphSubgraphInspectionEngine } from "../../../laboratory/scientific-the-graph-subgraph-inspection/ScientificTheGraphSubgraphInspectionEngine.js";
import { ScientificTheGraphGatewayProvider } from "../../../laboratory/scientific-the-graph-provider/ScientificTheGraphGatewayProvider.js";
import { AGENT0_BASE_MAINNET_SUBGRAPH_ID } from "../../../laboratory/scientific-the-graph-agent0/ScientificAgent0Erc8004Adapter.js";

type Agent0GraphResponse = {
  data?: {
    agents?: Array<{
      id?: string | null;
      chainId?: string | null;
      agentId?: string | null;
      owner?: string | null;
      totalFeedback?: string | null;
      lastActivity?: string | null;
    }>;
    _meta?: {
      deployment?: string | null;
      hasIndexingErrors?: boolean | null;
    };
  };
};
const AGENT0_DOCUMENT = `
query OECLAgent0BaseEvidence {
  agents(first: 5) {
    chainId
    agentId
    owner
    agentURI
    createdAt
    updatedAt
    totalFeedback
    lastActivity
  }
  _meta {
    block { number hash }
    deployment
    hasIndexingErrors
  }
}
`;

export async function getLiveAgent0State() {
  const apiKey = process.env.THE_GRAPH_API_KEY?.trim();

  if (!apiKey) {
    return { status: "NOT_CONFIGURED" as const };
  }

  const provider = new ScientificTheGraphGatewayProvider();
  const result = await provider.query({
    subgraphId: AGENT0_BASE_MAINNET_SUBGRAPH_ID,
    network: "base",
    chainId: "8453",
    apiKey,
    document: AGENT0_DOCUMENT,
    variables: {},
    schemaId: "AGENT0-ERC8004",
    timeoutMs: 30_000,
  });

  const response = result.query?.response as Agent0GraphResponse | null;
  const agents = Array.isArray(response?.data?.agents) ? response.data.agents : [];

  return {
    status: result.errors.length === 0 ? "LIVE" as const : "ERROR" as const,
    provider: result.provider,
    providerMode: result.providerMode,
    productId: result.productId,
    network: result.network,
    chainId: result.chainId,
    schemaId: result.schemaId ?? null,
    fetchedAt: result.query?.fetchedAt ?? null,
    indexedBlock: result.query?.indexedBlock ?? null,
    agentCount: agents.length,
    agents: agents.map((agent) => ({
      agentId: agent.agentId ?? null,
      owner: agent.owner ?? null,
      totalFeedback: agent.totalFeedback ?? null,
      lastActivity: agent.lastActivity ?? null,
    })),
    deployment: response?.data?._meta?.deployment ?? null,
    hasIndexingErrors: response?.data?._meta?.hasIndexingErrors ?? null,
    errors: result.errors,
  };
}





export async function discoverLiveSubgraphs(protocolId: string) {
  const apiKey = process.env.THE_GRAPH_API_KEY?.trim();
  const normalized = protocolId.trim().toUpperCase();

  if (!apiKey) {
    return { status: "NOT_CONFIGURED" as const, protocolId: normalized, searches: [] };
  }

  if (!/^ERC-\d+$/.test(normalized)) {
    return { status: "INVALID_PROTOCOL" as const, protocolId: normalized, searches: [] };
  }

  const client = new ScientificTheGraphSubgraphMcpLiveClient(apiKey);

  try {
    const result = await new ScientificTheGraphSubgraphMcpKeywordProvider(
      client,
      "LIVE"
    ).discover([
      {
        requestId: `WEB-DISCOVERY-${normalized}`,
        protocolId: normalized,
        profileId: `WEB-PROFILE-${normalized}`,
        sourceId: "OECL-WEB-LIVE-DISCOVERY",
        searchTerms: [normalized],
        searchBasis: "PROTOCOL_IDENTITY_ALIASES",
        targetProductKind: "SUBGRAPH",
      },
    ]);

    return {
      status: result.errors.length === 0 ? "LIVE" as const : "ERROR" as const,
      protocolId: normalized,
      searches: result.searches.map((search) => ({
        protocolId: search.protocolId,
        searchTerm: search.searchTerm,
        provider: search.provider,
        providerMode: search.providerMode,
        returned: search.returned,
        total: search.total,
        status: search.status,
        hits: search.hits.map((hit) => ({
          subgraphId: hit.subgraphId,
          displayName: hit.displayName,
          ipfsHash: hit.ipfsHash,
          providerRank: hit.providerRank,
        })),
      })),
      errors: result.errors,
    };
  } finally {
    await client.close();
  }
}
export async function inspectLiveSubgraph(
  subgraphId: string,
  ipfsHash: string
) {
  const apiKey = process.env.THE_GRAPH_API_KEY?.trim();
  const normalizedSubgraphId = subgraphId.trim();
  const normalizedIpfsHash = ipfsHash.trim();

  if (!apiKey) {
    return { status: "NOT_CONFIGURED" as const };
  }

  if (!normalizedSubgraphId || !normalizedIpfsHash) {
    return { status: "INVALID_REQUEST" as const };
  }

  const client = new ScientificTheGraphSubgraphMcpLiveClient(apiKey);

  try {
    const result = await new ScientificTheGraphSubgraphInspectionEngine(
      client,
      "LIVE"
    ).inspect([
      {
        requestId: `WEB-INSPECTION-${normalizedSubgraphId}`,
        subgraphId: normalizedSubgraphId,
        ipfsHash: normalizedIpfsHash,
      },
    ]);

    if (result.errors.length > 0 || result.inspections.length !== 1) {
      return {
        status: "ERROR" as const,
        errors: result.errors,
      };
    }

    const inspection = result.inspections[0];

    return {
      status: "LIVE" as const,
      subgraphId: inspection.subgraphId,
      ipfsHash: inspection.ipfsHash,
      providerMode: inspection.providerMode,
      inspectionStatus: inspection.status,
      schema: {
        status: inspection.schemaObservation.status,
        hash: inspection.schemaObservation.schemaHash,
        characters: inspection.schemaObservation.schemaText.length,
      },
      activity: {
        status: inspection.queryActivityObservation.activityStatus,
        dataPoints: inspection.queryActivityObservation.dataPointsCount,
        totalQueries: inspection.queryActivityObservation.totalQueryCount,
      },
      nextAction: inspection.nextAction,
      errors: [],
    };
  } finally {
    await client.close();
  }
}


type Agent0StandardizedTarget = {
  network: string;
  chainId: string;
  subgraphId: string;
};

const AGENT0_STANDARDIZED_TARGETS: Agent0StandardizedTarget[] = [
  {
    network: "ethereum",
    chainId: "1",
    subgraphId: "FV6RR6y13rsnCxBAicKuQEwDp8ioEGiNaWaZUmvr1F8k",
  },
  {
    network: "base",
    chainId: "8453",
    subgraphId: "43s9hQRurMGjuYnC1r2ZwS6xSQktbFyXMPMqGKUFJojb",
  },
  {
    network: "polygon",
    chainId: "137",
    subgraphId: "9q16PZv1JudvtnCAf44cBoxg82yK9SSsFvrjCY9xnneF",
  },
];

const AGENT0_STANDARDIZED_DOCUMENT = `
query OECLAgent0StandardizedObservation {
  agents(first: 3) {
    id
    chainId
    agentId
    owner
    totalFeedback
    lastActivity
  }

  _meta {
    block {
      number
      hash
    }
    deployment
    hasIndexingErrors
  }
}
`;

async function queryStandardizedAgent0Target(
  provider: ScientificTheGraphGatewayProvider,
  target: Agent0StandardizedTarget,
  apiKey: string
) {
  const maxAttempts = 3;

  let lastResult:
    Awaited<
      ReturnType<
        ScientificTheGraphGatewayProvider["query"]
      >
    > | null = null;

  for (
    let attempt = 1;
    attempt <= maxAttempts;
    attempt += 1
  ) {
    const result = await provider.query({
      subgraphId: target.subgraphId,
      network: target.network,
      chainId: target.chainId,
      apiKey,
      document: AGENT0_STANDARDIZED_DOCUMENT,
      variables: {},
      schemaId: "AGENT0-ERC8004",
      timeoutMs: 30_000,
    });

    lastResult = result;

    const completeIndexedBlock =
      result.errors.length === 0 &&
      result.query?.indexedBlock?.number !== undefined &&
      typeof result.query.indexedBlock.hash === "string" &&
      result.query.indexedBlock.hash.length > 0;

    if (completeIndexedBlock) {
      return {
        result,
        attempts: attempt,
        provenanceReady: true,
      };
    }

    if (attempt < maxAttempts) {
      await new Promise<void>((resolve) => {
        setTimeout(resolve, 500 * attempt);
      });
    }
  }

  if (lastResult === null) {
    throw new Error(
      "The Graph observation was not attempted."
    );
  }

  return {
    result: lastResult,
    attempts: maxAttempts,
    provenanceReady: false,
  };
}


export async function getLiveAgent0MultichainState() {
  const apiKey = process.env.THE_GRAPH_API_KEY?.trim();

  if (!apiKey) {
    return {
      status: "NOT_CONFIGURED" as const,
      protocolId: "ERC-8004",
      standardizedQuery: true,
      networksRequested: AGENT0_STANDARDIZED_TARGETS.length,
      networksLive: 0,
      networks: [],
    };
  }

  const provider = new ScientificTheGraphGatewayProvider();

  const observations = await Promise.all(
    AGENT0_STANDARDIZED_TARGETS.map(async (target) => {
      const {
        result,
        attempts,
        provenanceReady,
      } = await queryStandardizedAgent0Target(
        provider,
        target,
        apiKey
      );

      const response = result.query?.response as Agent0GraphResponse | null;
      const agents = Array.isArray(response?.data?.agents)
        ? response.data.agents
        : [];

      return {
        network: target.network,
        chainId: target.chainId,
        status:
          provenanceReady
            ? "LIVE" as const
            : "ERROR" as const,
        observationAttempts: attempts,
        provenanceReady,
        provider: result.provider,
        providerMode: result.providerMode,
        productId: result.productId,
        schemaId: result.schemaId ?? null,
        fetchedAt: result.query?.fetchedAt ?? null,
        indexedBlock: result.query?.indexedBlock ?? null,
        deployment: response?.data?._meta?.deployment ?? null,
        agentCount: agents.length,
        sampleAgent:
          agents.length > 0
            ? {
                id: agents[0].id ?? null,
                agentId: agents[0].agentId ?? null,
                owner: agents[0].owner ?? null,
              }
            : null,
        hasIndexingErrors:
          response?.data?._meta?.hasIndexingErrors ?? null,
        errors:
          provenanceReady
            ? result.errors
            : Array.from(
                new Set([
                  ...result.errors,
                  "The Graph observation has no complete indexed block provenance after availability retries.",
                ])
              ),
      };
    })
  );

  const networksLive = observations.filter(
    (observation) => observation.status === "LIVE"
  ).length;

  return {
    status:
      networksLive === observations.length
        ? "LIVE" as const
        : networksLive > 0
          ? "PARTIAL" as const
          : "ERROR" as const,
    protocolId: "ERC-8004",
    standardizedQuery: true,
    schemaId: "AGENT0-ERC8004",
    networksRequested: observations.length,
    networksLive,
    networks: observations,
  };
}
