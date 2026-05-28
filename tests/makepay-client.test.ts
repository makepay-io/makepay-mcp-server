import { describe, expect, it } from "vitest";
import { MakePayApiClient, MakePayApiError } from "../src/makepay-client.js";

describe("MakePayApiClient", () => {
  it("sends payment-link requests with auth headers", async () => {
    const calls: Array<{ url: string; init: RequestInit }> = [];
    const fetchImpl: typeof fetch = async (url, init) => {
      calls.push({ url: String(url), init: init || {} });
      return new Response(
        JSON.stringify({
          paymentLink: {
            uid: "pay_123",
            publicUrl: "https://makepay.io/payment/pay_123",
          },
        }),
        {
          status: 200,
          headers: { "content-type": "application/json" },
        },
      );
    };

    const client = new MakePayApiClient(
      {
        baseUrl: "https://www.makecrypto.io",
        checkoutBaseUrl: "https://makepay.io",
        keyId: "key_id",
        keySecret: "key_secret",
      },
      fetchImpl,
    );

    const result = await client.createPaymentLink({
      payload: { amount: "10.00", currency: "USDT" },
    });

    expect(result).toEqual({
      paymentLink: {
        uid: "pay_123",
        publicUrl: "https://makepay.io/payment/pay_123",
      },
    });
    expect(calls).toHaveLength(1);
    expect(calls[0].url).toBe("https://www.makecrypto.io/api/partner/v1/makepay/payment-links");
    const headers = calls[0].init.headers as Headers;
    expect(headers.get("x-makecrypto-key-id")).toBe("key_id");
    expect(headers.get("x-makecrypto-key-secret")).toBe("key_secret");
    expect(JSON.parse(String(calls[0].init.body))).toMatchObject({
      status: "active",
      payload: { amount: "10.00", currency: "USDT" },
    });
  });

  it("throws MakePayApiError on non-2xx responses", async () => {
    const fetchImpl: typeof fetch = async () =>
      new Response(JSON.stringify({ error: "onboarding_required" }), { status: 409 });

    const client = new MakePayApiClient(
      {
        baseUrl: "https://www.makecrypto.io",
        checkoutBaseUrl: "https://makepay.io",
        keyId: "key_id",
        keySecret: "key_secret",
      },
      fetchImpl,
    );

    await expect(client.listDestinationAssets()).rejects.toMatchObject({
      name: "MakePayApiError",
      status: 409,
      responseBody: "{\"error\":\"onboarding_required\"}",
    } satisfies Partial<MakePayApiError>);
  });

  it("builds hosted checkout URLs", () => {
    const client = new MakePayApiClient({
      baseUrl: "https://www.makecrypto.io",
      checkoutBaseUrl: "https://makepay.io",
      keyId: "key_id",
      keySecret: "key_secret",
    });

    expect(client.hostedCheckoutUrl("pay_123")).toBe("https://makepay.io/payment/pay_123");
  });
});
