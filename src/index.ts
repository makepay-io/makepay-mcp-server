#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { loadConfigFromEnv } from "./config.js";
import { MakePayApiClient } from "./makepay-client.js";
import { registerMakePayTools } from "./tools.js";

export function createMakePayMcpServer(client: MakePayApiClient): McpServer {
  const server = new McpServer({
    name: "makepay-mcp-server",
    version: "0.1.0",
  });

  registerMakePayTools(server, client);
  return server;
}

async function main(): Promise<void> {
  const config = loadConfigFromEnv();
  const client = new MakePayApiClient(config);
  const server = createMakePayMcpServer(client);
  await server.connect(new StdioServerTransport());
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
}
