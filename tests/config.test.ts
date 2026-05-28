import { describe, expect, it } from "vitest";
import { loadConfigFromEnv } from "../src/config.js";

describe("loadConfigFromEnv", () => {
  it("loads required credentials and defaults", () => {
    const config = loadConfigFromEnv({
      MAKEPAY_KEY_ID: "key_id",
      MAKEPAY_KEY_SECRET: "key_secret",
    });

    expect(config).toEqual({
      baseUrl: "https://www.makecrypto.io",
      checkoutBaseUrl: "https://makepay.io",
      keyId: "key_id",
      keySecret: "key_secret",
    });
  });

  it("rejects missing credentials", () => {
    expect(() => loadConfigFromEnv({ MAKEPAY_KEY_ID: "key_id" })).toThrow(
      "MAKEPAY_KEY_SECRET is required.",
    );
  });
});
