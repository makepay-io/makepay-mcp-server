import { describe, expect, it } from "vitest";
import { errorToolResponse, jsonToolResponse } from "../src/tool-response.js";

describe("tool responses", () => {
  it("formats JSON as MCP text content", () => {
    expect(jsonToolResponse({ ok: true })).toEqual({
      content: [
        {
          type: "text",
          text: "{\n  \"ok\": true\n}",
        },
      ],
    });
  });

  it("formats errors as MCP error content", () => {
    expect(errorToolResponse(new Error("boom"))).toEqual({
      isError: true,
      content: [
        {
          type: "text",
          text: "boom",
        },
      ],
    });
  });
});
