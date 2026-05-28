import type { MakePayConfig } from "./config.js";

export type MakePayRequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
};

export class MakePayApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly responseBody: string,
  ) {
    super(message);
    this.name = "MakePayApiError";
  }
}

export class MakePayApiClient {
  constructor(
    private readonly config: MakePayConfig,
    private readonly fetchImpl: typeof fetch = fetch,
  ) {}

  createPaymentLink(input: {
    status?: string;
    sendPaymentRequestEmail?: boolean;
    payload: Record<string, unknown>;
  }): Promise<unknown> {
    return this.request("/api/partner/v1/makepay/payment-links", {
      method: "POST",
      body: {
        status: input.status || "active",
        sendPaymentRequestEmail: input.sendPaymentRequestEmail || false,
        payload: input.payload,
      },
    });
  }

  listPaymentLinks(query: Record<string, string | number | boolean | undefined> = {}): Promise<unknown> {
    return this.request("/api/partner/v1/makepay/payment-links", { query });
  }

  getPaymentLink(uid: string): Promise<unknown> {
    return this.request(`/api/partner/v1/makepay/payment-links/${encodeURIComponent(uid)}`);
  }

  listDestinationAssets(): Promise<unknown> {
    return this.request("/api/partner/v1/makepay/destination-assets");
  }

  upsertCustomer(payload: Record<string, unknown>): Promise<unknown> {
    return this.request("/api/partner/v1/makepay/customers", {
      method: "POST",
      body: payload,
    });
  }

  getBookkeepingSummary(): Promise<unknown> {
    return this.request("/api/partner/v1/makepay/bookkeeping");
  }

  createBookkeepingInvoice(payload: Record<string, unknown>): Promise<unknown> {
    return this.request("/api/partner/v1/makepay/bookkeeping/invoices", {
      method: "POST",
      body: payload,
    });
  }

  createBookkeepingInvoicePaymentLink(
    invoiceId: string,
    options: { sendPaymentRequestEmail?: boolean } = {},
  ): Promise<unknown> {
    return this.request(
      `/api/partner/v1/makepay/bookkeeping/invoices/${encodeURIComponent(invoiceId)}/payment-link`,
      {
        method: "POST",
        body: options,
      },
    );
  }

  createBookkeepingReconciliation(payload: Record<string, unknown>): Promise<unknown> {
    return this.request("/api/partner/v1/makepay/bookkeeping/reconciliation", {
      method: "POST",
      body: payload,
    });
  }

  hostedCheckoutUrl(paymentLinkUid: string): string {
    return `${this.config.checkoutBaseUrl}/payment/${encodeURIComponent(paymentLinkUid)}`;
  }

  async request(path: string, options: MakePayRequestOptions = {}): Promise<unknown> {
    const url = new URL(path, `${this.config.baseUrl}/`);
    for (const [key, value] of Object.entries(options.query || {})) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    }

    const headers = new Headers({
      accept: "application/json",
      "user-agent": "MakePayMCP/0.1.0",
      "x-makecrypto-key-id": this.config.keyId,
      "x-makecrypto-key-secret": this.config.keySecret,
    });

    const init: RequestInit = {
      headers,
      method: options.method || "GET",
    };

    if (options.body !== undefined && init.method !== "GET") {
      headers.set("content-type", "application/json");
      init.body = JSON.stringify(options.body);
    }

    const response = await this.fetchImpl(url, init);
    const responseText = await response.text();
    const decoded = responseText ? safeJsonParse(responseText) : {};

    if (!response.ok) {
      const message =
        typeof decoded === "object" && decoded && "error" in decoded
          ? String((decoded as { error: unknown }).error)
          : `MakePay API request failed with ${response.status}.`;
      throw new MakePayApiError(message, response.status, responseText);
    }

    return decoded;
  }
}

function safeJsonParse(value: string): unknown {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return value;
  }
}
