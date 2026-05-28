import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { MakePayApiClient } from "./makepay-client.js";
import { errorToolResponse, jsonToolResponse } from "./tool-response.js";

const metadataSchema = z.record(z.unknown()).optional();

export function registerMakePayTools(server: McpServer, client: MakePayApiClient): void {
  server.registerTool(
    "makepay_create_payment_link",
    {
      title: "Create MakePay payment link",
      description: "Create a hosted MakePay checkout link for a merchant order.",
      inputSchema: {
        amount: z.string().min(1),
        currency: z.string().optional(),
        asset: z.string().optional(),
        title: z.string().optional(),
        description: z.string().optional(),
        orderId: z.string().optional(),
        customerEmail: z.string().email().optional(),
        clientId: z.string().optional(),
        returnUrl: z.string().url().optional(),
        successUrl: z.string().url().optional(),
        failureUrl: z.string().url().optional(),
        status: z.enum(["active", "paused", "archived"]).optional(),
        sendPaymentRequestEmail: z.boolean().optional(),
        metadata: metadataSchema,
      },
    },
    async (input) => {
      try {
        const { status, sendPaymentRequestEmail, ...payload } = input;
        const result = await client.createPaymentLink({
          status,
          sendPaymentRequestEmail,
          payload,
        });
        return jsonToolResponse(result);
      } catch (error) {
        return errorToolResponse(error);
      }
    },
  );

  server.registerTool(
    "makepay_get_payment_link",
    {
      title: "Get MakePay payment link",
      description: "Fetch a MakePay payment link by UID.",
      inputSchema: {
        uid: z.string().min(1),
      },
    },
    async ({ uid }) => {
      try {
        return jsonToolResponse(await client.getPaymentLink(uid));
      } catch (error) {
        return errorToolResponse(error);
      }
    },
  );

  server.registerTool(
    "makepay_list_payment_links",
    {
      title: "List MakePay payment links",
      description: "List recent MakePay payment links for the authenticated merchant.",
      inputSchema: {
        limit: z.number().int().min(1).max(100).optional(),
        status: z.string().optional(),
      },
    },
    async (input) => {
      try {
        return jsonToolResponse(await client.listPaymentLinks(input));
      } catch (error) {
        return errorToolResponse(error);
      }
    },
  );

  server.registerTool(
    "makepay_list_destination_assets",
    {
      title: "List MakePay destination assets",
      description: "List supported settlement destination assets for the merchant.",
    },
    async () => {
      try {
        return jsonToolResponse(await client.listDestinationAssets());
      } catch (error) {
        return errorToolResponse(error);
      }
    },
  );

  server.registerTool(
    "makepay_create_customer",
    {
      title: "Create or update MakePay customer",
      description: "Create or update a MakePay customer profile.",
      inputSchema: {
        email: z.string().email().optional(),
        customerEmail: z.string().email().optional(),
        name: z.string().optional(),
        clientId: z.string().optional(),
        metadata: metadataSchema,
      },
    },
    async (input) => {
      try {
        if (!input.email && !input.customerEmail && !input.name && !input.clientId) {
          throw new Error("Provide at least one of email, customerEmail, name, or clientId.");
        }
        return jsonToolResponse(await client.upsertCustomer(input));
      } catch (error) {
        return errorToolResponse(error);
      }
    },
  );

  server.registerTool(
    "makepay_get_bookkeeping_summary",
    {
      title: "Get MakePay bookkeeping summary",
      description: "Fetch invoices, expenses, documents, and reconciliation queue summary.",
    },
    async () => {
      try {
        return jsonToolResponse(await client.getBookkeepingSummary());
      } catch (error) {
        return errorToolResponse(error);
      }
    },
  );

  server.registerTool(
    "makepay_create_bookkeeping_invoice",
    {
      title: "Create MakePay bookkeeping invoice",
      description: "Create a bookkeeping invoice that can be paid with a MakePay payment link.",
      inputSchema: {
        title: z.string().optional(),
        currency: z.string().default("USD"),
        issueDate: z.string().optional(),
        dueDate: z.string().optional(),
        counterparty: z
          .object({
            name: z.string().optional(),
            email: z.string().email().optional(),
            clientId: z.string().optional(),
            type: z.string().optional(),
          })
          .optional(),
        lineItems: z
          .array(
            z.object({
              description: z.string().min(1),
              quantity: z.string().optional(),
              unitAmount: z.string().optional(),
              taxAmount: z.string().optional(),
              totalAmount: z.string().optional(),
            }),
          )
          .optional(),
        metadata: metadataSchema,
      },
    },
    async (input) => {
      try {
        return jsonToolResponse(await client.createBookkeepingInvoice(input));
      } catch (error) {
        return errorToolResponse(error);
      }
    },
  );

  server.registerTool(
    "makepay_create_invoice_payment_link",
    {
      title: "Create MakePay invoice payment link",
      description: "Create a hosted MakePay payment link for an existing bookkeeping invoice.",
      inputSchema: {
        invoiceId: z.string().min(1),
        sendPaymentRequestEmail: z.boolean().optional(),
      },
    },
    async ({ invoiceId, sendPaymentRequestEmail }) => {
      try {
        return jsonToolResponse(
          await client.createBookkeepingInvoicePaymentLink(invoiceId, {
            sendPaymentRequestEmail,
          }),
        );
      } catch (error) {
        return errorToolResponse(error);
      }
    },
  );

  server.registerTool(
    "makepay_create_bookkeeping_reconciliation",
    {
      title: "Create MakePay bookkeeping reconciliation",
      description: "Link an invoice or expense to a payment session, payment link, subscription cycle, wallet activity, or manual record.",
      inputSchema: {
        invoiceId: z.string().optional(),
        expenseId: z.string().optional(),
        paymentLinkId: z.string().optional(),
        paymentSessionId: z.string().optional(),
        subscriptionCycleId: z.string().optional(),
        walletActivityEventId: z.string().optional(),
        linkType: z.enum(["payment", "chain_transfer", "subscription", "manual"]).optional(),
        amount: z.string().optional(),
        assetSymbol: z.string().optional(),
        metadata: metadataSchema,
      },
    },
    async (input) => {
      try {
        if (!input.invoiceId && !input.expenseId) {
          throw new Error("Provide invoiceId or expenseId as the reconciliation target.");
        }
        if (
          !input.paymentLinkId &&
          !input.paymentSessionId &&
          !input.subscriptionCycleId &&
          !input.walletActivityEventId &&
          input.linkType !== "manual"
        ) {
          throw new Error("Provide a payment/session/subscription/wallet source, or use linkType=manual.");
        }

        return jsonToolResponse(await client.createBookkeepingReconciliation(input));
      } catch (error) {
        return errorToolResponse(error);
      }
    },
  );
}
