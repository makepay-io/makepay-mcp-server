import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

export function jsonToolResponse(value: unknown): CallToolResult {
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(value, null, 2),
      },
    ],
  };
}

export function errorToolResponse(error: unknown): CallToolResult {
  return {
    isError: true,
    content: [
      {
        type: "text",
        text: error instanceof Error ? error.message : String(error),
      },
    ],
  };
}
