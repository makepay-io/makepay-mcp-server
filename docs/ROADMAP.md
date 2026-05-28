# MakePay MCP Server Roadmap

## Purpose

This repository is priority rank 3 in the MakePay integration roadmap. It gives
AI agents a safe, server-side way to create payment links, inspect payment
state, and reconcile bookkeeping records without exposing MakePay secrets to a
browser or mobile client.

## Current Scope

- Payment-link create, get, and list tools.
- Destination asset discovery.
- Customer upsert tool.
- Bookkeeping invoice creation.
- Invoice payment-link creation.
- Bookkeeping summary retrieval.
- Bookkeeping reconciliation creation.

## Near-Term Milestones

1. Publish repository and protect `main`.
2. Add hosted package publishing after internal review.
3. Add tool coverage for subscriptions, POS terminals, products, and Simple
   Shop.
4. Add optional read-only mode for support agents.
5. Add signed webhook verification helper resources.

## Acceptance Criteria

- `npm run validate` passes locally and in GitHub Actions.
- Tool schemas reject missing amounts, IDs, and ambiguous inputs.
- No committed examples contain live credentials.
- `main` requires pull requests and validation before merging.
