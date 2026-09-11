import {
    Client,
    SSEClientTransport
} from "@modelcontextprotocol/client";


export interface ScientificTheGraphSubgraphMcpToolCallResult {

    isError?:
        boolean;

    content?:
        unknown;

    structuredContent?:
        unknown;

}


export interface ScientificTheGraphSubgraphMcpToolClient {

    callTool(
        name:
            string,
        args:
            Record<string, unknown>
    ): Promise<ScientificTheGraphSubgraphMcpToolCallResult>;

    close():
        Promise<void>;

}


export class ScientificTheGraphSubgraphMcpLiveClient
implements ScientificTheGraphSubgraphMcpToolClient {

    private client:
        Client | null =
        null;

    private connected:
        boolean =
        false;


    constructor(
        private readonly apiKey:
            string,
        private readonly endpoint:
            string =
            "https://subgraphs.mcp.thegraph.com/sse"
    ) {

        if (
            this.apiKey.trim().length ===
            0
        ) {

            throw new Error(
                "The Graph MCP API key is required."
            );

        }


        const parsed =
            new URL(
                this.endpoint
            );


        if (
            parsed.protocol !==
            "https:"
        ) {

            throw new Error(
                "The Graph MCP endpoint must use HTTPS."
            );

        }

    }


    private async connect():
        Promise<void> {

        if (
            this.connected
        ) {

            return;

        }


        const client =
            new Client({

                name:
                    "oecl-scientific-subgraph-mcp",

                version:
                    "1.0.0"

            });


        const transport =
            new SSEClientTransport(

                new URL(
                    this.endpoint
                ),

                {

                    authProvider: {

                        token:
                            async () =>
                                this.apiKey

                    }

                } as any

            );


        await client.connect(
            transport
        );


        this.client =
            client;

        this.connected =
            true;

    }


    async callTool(
        name:
            string,
        args:
            Record<string, unknown>
    ): Promise<ScientificTheGraphSubgraphMcpToolCallResult> {

        await this.connect();


        if (
            this.client ===
            null
        ) {

            throw new Error(
                "The Graph MCP client is not connected."
            );

        }


        const result =
            await this.client.callTool({

                name,

                arguments:
                    args

            });


        return result as
            ScientificTheGraphSubgraphMcpToolCallResult;

    }


    async close():
        Promise<void> {

        if (
            this.client !==
            null
        ) {

            await this.client.close();

        }


        this.client =
            null;

        this.connected =
            false;

    }

}