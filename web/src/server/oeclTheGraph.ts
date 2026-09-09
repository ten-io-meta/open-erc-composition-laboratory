import { ScientificTheGraphGatewayProvider } from "../../../laboratory/scientific-the-graph-provider/ScientificTheGraphGatewayProvider.js";
import { AGENT0_BASE_MAINNET_SUBGRAPH_ID } from "../../../laboratory/scientific-the-graph-agent0/ScientificAgent0Erc8004Adapter.js";

type Agent0GraphResponse = {
  data?: {
    agents?: Array<{
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



