# MakePay MCP Server

MCP server for MakePay. It lets AI agents create payment links, inspect payment
state, create bookkeeping invoices, create invoice payment links, and reconcile
records through the MakePay partner API.

## Install

```bash
npm install
npm run build
```

## Configuration

Set credentials in the MCP host environment:

```bash
export MAKEPAY_KEY_ID="..."
export MAKEPAY_KEY_SECRET="..."
```

Optional:

```bash
export MAKEPAY_BASE_URL="https://www.makecrypto.io"
export MAKEPAY_CHECKOUT_BASE_URL="https://makepay.io"
```

Never expose `MAKEPAY_KEY_SECRET` to browser clients, mobile apps, or public
logs.

## Claude Desktop / MCP JSON Example

```json
{
  "mcpServers": {
    "makepay": {
      "command": "node",
      "args": ["/absolute/path/to/makepay-mcp-server/dist/index.js"],
      "env": {
        "MAKEPAY_KEY_ID": "your_key_id",
        "MAKEPAY_KEY_SECRET": "your_key_secret"
      }
    }
  }
}
```

## Tools

- `makepay_create_payment_link`
- `makepay_get_payment_link`
- `makepay_list_payment_links`
- `makepay_list_destination_assets`
- `makepay_create_customer`
- `makepay_create_bookkeeping_invoice`
- `makepay_create_invoice_payment_link`
- `makepay_get_bookkeeping_summary`
- `makepay_create_bookkeeping_reconciliation`

## Validation

```bash
npm run validate
```

Maintainer: Ethan Carter (`makepayio`).
