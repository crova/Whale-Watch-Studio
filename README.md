# Whale Watch Studio

A Claude artifact for exploring options flow data from [Unusual Whales](https://unusualwhales.com). Pick a ticker, get a plain-English brief on the unusual flow — what printed, why it might matter, and the competing reads on it.

**[Live demo →](https://claude.ai/public/artifacts/252a24b6-ce1c-4daa-9f0f-f001a32e52f4)**

## How to run it

1. Open [claude.ai](https://claude.ai) and start a new conversation
2. Copy the contents of `whale_watch_studio/WhaleWatchStudio.jsx`
3. Paste it into the chat and ask Claude to render it as an artifact

That's it. The artifact runs in Claude's built-in sandbox — no install, no build step.

## What's inside

Three tabs per ticker (NVDA, AAPL, SPY, TSLA):

- **Brief** — plain-English breakdown of the flow, bull/bear reads, and questions worth digging into. Includes a chat box to ask Claude follow-up questions about the data.
- **Data** — raw numbers: flow alerts, dark pool prints, put/call ratio, net premium bias
- **Builder** — the MCP workflow, API endpoints, and system prompt pattern to reproduce this in your own app

## Live AI features

The chat and template generation call the Anthropic API directly. For those to work inside the artifact, Claude needs a valid API key in scope. In practice, this works seamlessly when running inside claude.ai — Claude handles auth automatically.

## Unusual Whales API endpoints referenced

```
GET /api/option-trades/flow-alerts?ticker_symbol={ticker}&min_premium=50000
GET /api/darkpool/{ticker}
GET /api/stock/{ticker}/options-volume
GET /api/stock/{ticker}/spot-exposures/strike
```

The Builder tab also shows the MCP chain: `morning-briefing → unusual-flow → ticker-analysis → greek-exposure`.

## On the analysis

Nothing here is trading advice. The briefs explain what the data shows and what questions it raises — not what to do about it. That framing is intentional and baked into every system prompt in the component.
