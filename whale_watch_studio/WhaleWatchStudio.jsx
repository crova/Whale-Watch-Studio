import { useState, useEffect } from "react";

// ─── Seed data — mirrors real UW API response shapes ──────────────────────────
const SEED_DATA = {
  NVDA: {
    spot: 875.50,
    flow: [
      { type: "Call", strike: 1000, expiry: "06-21", premium: 4200000, size: 3800, oi: 1200 },
      { type: "Call", strike: 950,  expiry: "03-15", premium: 2800000, size: 2200, oi: 4500 },
      { type: "Call", strike: 900,  expiry: "02-16", premium: 1900000, size: 5000, oi: 8900 },
      { type: "Call", strike: 1100, expiry: "09-20", premium: 3100000, size: 1800, oi: 450  },
      { type: "Put",  strike: 800,  expiry: "02-16", premium: 650000,  size: 1200, oi: 3200 },
    ],
    dp: [
      { price: 872.50, size: 850000,  time: "09:45" },
      { price: 876.20, size: 1200000, time: "11:22" },
      { price: 874.80, size: 620000,  time: "14:08" },
    ],
    vol: { call: 285000, put: 72000, pc: 0.25 },
    brief: {
      what: "Over $12M in call premium hit the tape across four strikes from $900 to $1100, with the June $1000 calls leading at $4.2M. A single $650K put at the $800 strike is the only visible downside hedge. Dark pool printed 2.67M shares averaging $874.50 — tight clustering across three prints, suggesting deliberate accumulation rather than routine flow.",
      why: "When call premium runs 18.5x puts and dark pool clusters below current price in a narrow band, it typically reflects institutional conviction built across multiple timeframes — not retail speculation. The multi-expiry structure spanning February through September suggests a position being constructed, not a one-day trade.",
      bull: "Dark pool average at $874.50 becomes a key support level — that's where institutions decided NVDA was worth owning. The $1100 strike with only 450 OI is fresh positioning with no existing crowd. A move through $900 could trigger dealer gamma hedging and accelerate any rally.",
      bear: "An 18.5x call/put ratio is a crowded long with no downside hedge. If the thesis breaks on an earnings miss or macro shift, the unwind could be sharp. The $800 put at $650K is far out of the money and provides minimal protection for anyone holding this flow.",
      questions: [
        "Who is building the $1100 strike with only 450 OI — is it the same entity as the $1000 strike buyer?",
        "What is NVDA's current IV rank — is this flow expensive or cheap relative to historical volatility?",
        "Are dark pool prints executing at the ask or mid — does that change the accumulation thesis?",
        "What does broader semiconductor flow look like — is this NVDA-specific or a sector-wide rotation?",
      ],
    },
  },

  AAPL: {
    spot: 183.50,
    flow: [
      { type: "Put",  strike: 175, expiry: "02-16", premium: 1800000, size: 8500, oi: 22000 },
      { type: "Put",  strike: 180, expiry: "01-19", premium: 720000,  size: 4100, oi: 15000 },
      { type: "Call", strike: 190, expiry: "03-15", premium: 950000,  size: 3200, oi: 8700  },
      { type: "Put",  strike: 170, expiry: "03-15", premium: 1100000, size: 5600, oi: 9200  },
    ],
    dp: [
      { price: 183.20, size: 2100000, time: "10:15" },
      { price: 183.75, size: 1400000, time: "13:40" },
    ],
    vol: { call: 145000, put: 118000, pc: 0.81 },
    brief: {
      what: "Put premium outpacing calls $3.6M to $950K across three strikes. The February $175 puts lead at $1.8M on 8,500 contracts against 22,000 existing OI — adding to an established position, not opening fresh. Near-term $180 puts expiring January 19 are already in-the-money with 4,100 contracts. Dark pool: 3.5M shares in two prints near current spot.",
      why: "When an institution adds to an existing put position rather than opening fresh, it often signals deliberate hedging of a real equity position — not a speculative bet. The near-term ITM puts add urgency. P/C at 0.81 is notably elevated for AAPL, which historically skews far more bullish.",
      bull: "Dark pool printed 3.5M shares right at current price — potential accumulation into weakness. The $190 call represents $950K in upside conviction. If the puts are covering a long equity position, the net institutional view might actually be bullish with a hedge attached.",
      bear: "Three put strikes, three timeframes, $3.6M total. Adding to 22,000 OI at $175 signals enough conviction to size up. The near-term ITM puts at $180 are a direct short-term directional bet — if they're right, $183 breaks as support and the ladder pays out.",
      questions: [
        "Is the $175 put buyer the same as the $170 put buyer — if so, they're laddering strikes for maximum coverage?",
        "What does AAPL's dark pool flow look like over 10 days — is this part of a larger distribution pattern?",
        "Is there an upcoming catalyst — earnings, product announcement — explaining the urgency of the near-term puts?",
        "What is the put/call ratio for the broader large-cap tech sector right now?",
      ],
    },
  },

  SPY: {
    spot: 475.20,
    flow: [
      { type: "Put",  strike: 460, expiry: "02-16", premium: 8900000,  size: 15000, oi: 45000 },
      { type: "Put",  strike: 450, expiry: "03-15", premium: 6200000,  size: 9800,  oi: 32000 },
      { type: "Put",  strike: 440, expiry: "06-21", premium: 11200000, size: 22000, oi: 8900  },
      { type: "Call", strike: 490, expiry: "02-16", premium: 2100000,  size: 4200,  oi: 18000 },
    ],
    dp: [
      { price: 474.80, size: 5200000, time: "09:31" },
      { price: 475.40, size: 3800000, time: "12:15" },
      { price: 474.20, size: 7100000, time: "15:20" },
    ],
    vol: { call: 890000, put: 1340000, pc: 1.51 },
    brief: {
      what: "$26.3M in put premium across three strikes — $460, $450, and $440 — spanning February through June. The June $440 puts at $11.2M on 22,000 contracts against only 8,900 OI is the standout: fresh, large exposure to a 7%+ S&P decline over five months. Dark pool: 16.1M shares in three prints averaging $474.80, concentrated near the day's lows.",
      why: "SPY put ladders of this size typically represent institutional hedging programs — pension funds, endowments, or large asset managers protecting equity portfolios. The June timeframe is the key tell: this isn't a short-term tactical trade, it's a structural hedge. The question worth asking is always whether it's protection or prediction.",
      bull: "The $490 calls at $2.1M represent a competing view — someone is buying upside while others stack puts. If the dark pool at $474.80 reflects buying rather than selling, the large put flow is protection, not prediction. Hedges being placed doesn't mean the hedger expects a crash.",
      bear: "$11.2M in fresh June $440 puts against low existing OI is not routine portfolio hedging — that's a directional bet. P/C at 1.51 is one of the most bearish aggregate readings in recent months. Dark pool printing near the lows without a bounce is worth watching closely.",
      questions: [
        "Is this a single institution buying the June $440 puts or multiple players — does the tape show block prints or a series of smaller fills?",
        "What does VIX flow look like right now — is volatility itself being bought alongside these puts?",
        "Are the puts a standalone trade or is there a matching call sale forming a short strangle on the other side?",
        "Which sectors are showing the most unusual put activity alongside SPY today?",
      ],
    },
  },

  TSLA: {
    spot: 215.80,
    flow: [
      { type: "Call", strike: 250, expiry: "02-16", premium: 3400000, size: 6200, oi: 9800  },
      { type: "Put",  strike: 200, expiry: "02-16", premium: 2900000, size: 5400, oi: 12000 },
      { type: "Call", strike: 300, expiry: "06-21", premium: 4800000, size: 3100, oi: 2800  },
      { type: "Put",  strike: 180, expiry: "03-15", premium: 1800000, size: 4200, oi: 7600  },
    ],
    dp: [
      { price: 214.90, size: 980000,  time: "10:45" },
      { price: 216.20, size: 1450000, time: "13:22" },
    ],
    vol: { call: 420000, put: 380000, pc: 0.90 },
    brief: {
      what: "$8.2M in call premium against $4.7M in puts — but the structure tells two stories. The June $300 calls at $4.8M are 40% OTM with only 2,800 OI: fresh, speculative. The February $200 puts at $2.9M are near-the-money with urgency. P/C at 0.90 is nearly neutral. Dark pool: 2.43M shares in two modest prints near spot.",
      why: "TSLA regularly attracts both directional speculators and sophisticated hedgers simultaneously. A near-neutral P/C with opposing premium structures shows the market is genuinely split. This is an important lesson for builders: not all unusual flow is a clear signal — sometimes it reflects genuine institutional disagreement.",
      bull: "$8.2M in call premium beats puts by volume. The June $300 calls, even deep OTM, represent real conviction — someone paid $4.8M to bet on a 40% move higher in months. Dark pool at $215 is neutral-to-supportive and shows no clear distribution.",
      bear: "The February $200 puts have timing and proximity on their side — they expire soon, they're near-the-money, and $2.9M is behind them against 12,000 OI. A close below $200 before expiration would validate this flow and trigger dealer gamma pressure.",
      questions: [
        "Is the June $300 call buyer rolling from a lower strike — if so, what does their original entry price tell us about conviction?",
        "What is TSLA's historical move magnitude around the February expiration date — is there a known catalyst?",
        "Are the $200 puts a hedge against a long equity position or a standalone directional bet?",
        "What does open interest change look like over the past week — is call OI growing or has it been flat?",
      ],
    },
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fm = {
  m:  n => n >= 1e6 ? `$${(n/1e6).toFixed(1)}M` : `$${(n/1e3).toFixed(0)}K`,
  sh: n => n >= 1e6 ? `${(n/1e6).toFixed(2)}M`  : `${(n/1e3).toFixed(0)}K`,
  p:  n => `$${n.toFixed(2)}`,
};

function calcStats(ticker) {
  const d = SEED_DATA[ticker];
  const cp = d.flow.filter(f => f.type === "Call").reduce((s, f) => s + f.premium, 0);
  const pp = d.flow.filter(f => f.type === "Put" ).reduce((s, f) => s + f.premium, 0);
  const dpv   = d.dp.reduce((s, p) => s + p.size,  0);
  const dpavg = d.dp.reduce((s, p) => s + p.price, 0) / d.dp.length;
  const bias  = cp >= pp ? "BULL" : "BEAR";
  return {
    cp, pp, bias,
    ratio:  (bias === "BULL" ? cp/pp : pp/cp).toFixed(1),
    dpv, dpavg,
    pc:   d.vol.pc,
    call: d.vol.call,
    put:  d.vol.put,
  };
}

async function callClaude(system, userContent) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system,
      messages: [{ role: "user", content: userContent }],
    }),
  });
  const json = await res.json();
  return json.content[0].text;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function WhaleWatchStudio() {
  const [ticker,          setTicker]          = useState(null);
  const [activeTab,       setActiveTab]       = useState("brief");
  const [chatInput,       setChatInput]       = useState("");
  const [chatResponse,    setChatResponse]    = useState(null);
  const [chatLoading,     setChatLoading]     = useState(false);
  const [templateContent, setTemplateContent] = useState(null);
  const [templateLoading, setTemplateLoading] = useState(false);
  const [searchVal,       setSearchVal]       = useState("");
  const [searchError,     setSearchError]     = useState(null);
  const [fontsReady,      setFontsReady]      = useState(false);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel  = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Bebas+Neue&family=DM+Serif+Display:ital@0;1&display=swap";
    link.onload = () => setFontsReady(true);
    document.head.appendChild(link);
  }, []);

  const mono    = fontsReady ? "'IBM Plex Mono', monospace"     : "monospace";
  const display = fontsReady ? "'Bebas Neue', sans-serif"        : "sans-serif";
  const serif   = fontsReady ? "'DM Serif Display', serif"       : "serif";

  // ── Actions ──────────────────────────────────────────────────────────────────

  const selectTicker = (t) => {
    setTicker(t);
    setActiveTab("brief");
    setChatResponse(null);
    setTemplateContent(null);
    setSearchError(null);
  };

  const handleSearch = () => {
    const val = searchVal.trim().toUpperCase();
    if (!val) return;
    if (SEED_DATA[val]) { selectTicker(val); setSearchVal(""); }
    else setSearchError(val);
  };

  const askClaude = async () => {
    const q = chatInput.trim();
    if (!q || !ticker) return;
    setChatLoading(true);
    setChatResponse(null);
    const d = SEED_DATA[ticker];
    const s = calcStats(ticker);
    try {
      const text = await callClaude(
        `You are a market educator helping builders understand options flow data. Answer questions factually and educationally. Never give buy/sell/hold recommendations. Frame everything as "what the data shows" and "questions worth exploring" — not predictions or advice.`,
        `${ticker} @ $${d.spot} | Bias: ${s.bias} ${s.ratio}x | P/C: ${d.vol.pc} | Dark Pool: ${fm.sh(s.dpv)} shares avg ${fm.p(s.dpavg)}
Flow: ${d.flow.map(f => `${f.type} $${f.strike} exp ${f.expiry} ${fm.m(f.premium)}`).join(" | ")}

Question: ${q}`
      );
      setChatResponse(text);
    } catch {
      setChatResponse("Connection error — please try again.");
    } finally {
      setChatLoading(false);
      setChatInput("");
    }
  };

  const generateTemplate = async () => {
    if (!ticker) return;
    setTemplateLoading(true);
    setTemplateContent(null);
    try {
      const text = await callClaude(
        `You are helping developers build with the Unusual Whales API and MCP server. Generate practical, immediately usable builder templates. Be concise and concrete.`,
        `Generate a complete builder template for Whale Watch Studio using ${ticker} as the example. Include:

1. SYSTEM PROMPT — exact prompt to generate educational market briefs from options flow JSON (not trading advice, educational framing only)
2. MCP WORKFLOW — the sequence of Unusual Whales MCP prompts to chain: morning-briefing → unusual-flow → ticker-analysis → greek-exposure, with what each call returns
3. PYTHON EXAMPLE — minimal working code hitting /api/option-trades/flow-alerts, /api/darkpool/${ticker}, and /api/stock/${ticker}/options-volume
4. TUTORIAL OUTLINE — a 5-section outline for "Building an AI Market Brief Generator with Unusual Whales"

Keep it tight and immediately useful for a developer.`
      );
      setTemplateContent(text);
    } catch {
      setTemplateContent("Connection error — please try again.");
    } finally {
      setTemplateLoading(false);
    }
  };

  // ── Styles ───────────────────────────────────────────────────────────────────

  const s = ticker ? calcStats(ticker) : null;
  const biasCol = s?.bias === "BULL" ? "#4ade80" : "#f87171";
  const pcCol   = !s ? "#8aaa86" : s.pc > 1 ? "#f87171" : s.pc < 0.5 ? "#4ade80" : "#8aaa86";

  const css = {
    root: {
      minHeight: "100vh", background: "#07090a", color: "#c8d4c4",
      fontFamily: mono,
    },
    inner: { maxWidth: 700, margin: "0 auto", padding: "40px 24px 80px" },

    // Header
    eyebrow: { fontSize: 10, letterSpacing: ".28em", color: "#5a9a6e", textTransform: "uppercase", marginBottom: 6 },
    title: {
      fontFamily: display, fontSize: "clamp(50px, 12vw, 80px)",
      lineHeight: .9, color: "#e8ede6", letterSpacing: ".02em", marginBottom: 8,
    },
    titleAccent: { color: "#4ade80" },
    sub: { fontSize: 9, color: "#4a6048", letterSpacing: ".18em", marginBottom: 28 },

    // Search
    searchRow: { display: "flex", gap: 8, marginBottom: 14 },
    searchInput: {
      flex: 1, background: "#0d1210", border: "1px solid #1e3020", color: "#c8d4c4",
      fontFamily: mono, fontSize: 12, padding: "10px 13px", borderRadius: 2,
      letterSpacing: ".1em", textTransform: "uppercase", outline: "none",
    },
    searchBtn: {
      background: "transparent", border: "1px solid #2a4028", color: "#6a9068",
      fontFamily: mono, fontSize: 10, letterSpacing: ".1em",
      padding: "10px 14px", borderRadius: 2, cursor: "pointer",
    },

    // Ticker buttons
    tickerGrid: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginBottom: 28 },
    tickerBtn: (t) => ({
      fontFamily: mono, fontSize: 13, fontWeight: 600, letterSpacing: ".1em",
      padding: "12px 4px", borderRadius: 2, cursor: "pointer",
      border: "1px solid", transition: "all .15s",
      borderColor: ticker === t ? "#4ade80" : "#1a2018",
      background: ticker === t ? "rgba(74,222,128,.07)" : "transparent",
      color: ticker === t ? "#4ade80" : "#5a7860",
    }),

    // Tabs
    tabBar: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", borderBottom: "1px solid #0d1210", marginBottom: 24 },
    tab: (name) => ({
      fontFamily: mono, fontSize: 10, fontWeight: 600, letterSpacing: ".2em",
      padding: "11px 4px", border: "none", background: "transparent",
      cursor: "pointer", textAlign: "center", transition: "all .15s",
      color: activeTab === name ? "#4ade80" : "#3a5038",
      borderBottom: activeTab === name ? "2px solid #4ade80" : "2px solid transparent",
    }),

    // Stats
    statsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: "#0a0f09", border: "1px solid #111814", borderRadius: 2, marginBottom: 24 },
    statFull:  { gridColumn: "1 / -1", borderTop: "1px solid #0a0f09" },
    statCell:  { padding: "14px 16px", background: "#0c110b" },
    statLabel: { fontSize: 9, letterSpacing: ".22em", textTransform: "uppercase", color: "#4a6048", marginBottom: 5 },
    statVal:   (color) => ({ fontSize: 20, fontWeight: 600, letterSpacing: "-.02em", color: color || "#c8d4c4", marginBottom: 3 }),
    statSub:   { fontSize: 9, color: "#4a6048", letterSpacing: ".08em" },

    // Section
    secLabel: { fontSize: 9, letterSpacing: ".25em", textTransform: "uppercase", color: "#4a6048", marginBottom: 9, paddingBottom: 7, borderBottom: "1px solid #0d1210" },

    // Brief
    briefText: { fontFamily: serif, fontSize: "clamp(14px, 3vw, 17px)", lineHeight: 1.72, color: "#a8b8a4" },
    biGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, margin: "18px 0" },
    biCard: { background: "#0c110b", border: "1px solid #131a12", borderRadius: 2, padding: 14 },
    biCardLabel: (color) => ({ fontSize: 9, letterSpacing: ".18em", textTransform: "uppercase", color, fontWeight: 600, marginBottom: 7 }),
    biCardText: { fontFamily: serif, fontSize: "clamp(12px, 2.5vw, 14px)", lineHeight: 1.65, color: "#8a9e86" },
    qsList: { listStyle: "none", padding: 0, margin: 0 },
    qsItem: { fontFamily: serif, fontSize: "clamp(13px, 2.5vw, 15px)", lineHeight: 1.55, color: "#8a9e86", padding: "7px 0 7px 18px", borderBottom: "1px solid #0c110b", position: "relative" },

    // Flow table
    flowCols: { display: "grid", gridTemplateColumns: "44px 1fr 80px 88px", gap: 0 },
    flowColHdr: { fontSize: 9, color: "#3a5038", letterSpacing: ".15em", padding: "0 0 6px" },
    flowRow: { display: "grid", gridTemplateColumns: "44px 1fr 80px 88px", padding: "8px 0", borderBottom: "1px solid #090e08", alignItems: "center" },
    flowType: (type) => ({ fontSize: 10, fontWeight: 600, color: type === "Call" ? "#4ade80" : "#f87171" }),
    flowInfo: { fontSize: 10, color: "#6a8868", paddingLeft: 6 },
    flowNum:  { fontSize: 10, color: "#8a9e86", textAlign: "right" },
    flowPrem: { fontSize: 10, color: "#c8a83a", fontWeight: 600, textAlign: "right" },

    // Dark pool row
    dpRow: { display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #090e08", fontSize: 10 },

    // Builder
    mcpStep: { display: "flex", gap: 12, padding: "10px 0", borderBottom: "1px solid #0c110b" },
    mcpNum: { fontSize: 9, color: "#4a6048", minWidth: 20, paddingTop: 1 },
    mcpName: { fontSize: 11, color: "#4ade80", fontWeight: 600, display: "block", marginBottom: 3 },
    mcpDesc: { fontSize: 10, color: "#6a8868", lineHeight: 1.5 },
    ep: { display: "block", fontSize: 10, color: "#8aaa86", padding: "6px 0", borderBottom: "1px solid #0c110b" },
    epMethod: { color: "#4a6048", marginRight: 8 },
    codeBlock: {
      background: "#050706", border: "1px solid #111814", borderRadius: 2,
      padding: 16, fontSize: 10, color: "#6a9068", lineHeight: 1.7,
      fontFamily: mono, whiteSpace: "pre-wrap", wordBreak: "break-word",
    },
    templateBtn: {
      width: "100%", marginTop: 20,
      background: "rgba(74,222,128,.06)", border: "1px solid #2a4830",
      color: "#4ade80", fontFamily: mono, fontSize: 10, letterSpacing: ".12em",
      padding: 14, borderRadius: 2, cursor: "pointer",
    },

    // Chat
    chatSection: { marginTop: 20, borderTop: "1px solid #0d1210", paddingTop: 16 },
    chatLabel: { fontSize: 9, color: "#4a6048", letterSpacing: ".22em", textTransform: "uppercase", marginBottom: 10 },
    chatRow: { display: "flex", gap: 8 },
    chatInput: {
      flex: 1, background: "#0d1210", border: "1px solid #1e3020", color: "#c8d4c4",
      fontFamily: mono, fontSize: 11, padding: "10px 12px", borderRadius: 2, outline: "none",
    },
    chatBtn: {
      background: "transparent", border: "1px solid #2a4028", color: "#6a9068",
      fontFamily: mono, fontSize: 10, letterSpacing: ".08em",
      padding: "10px 12px", borderRadius: 2, cursor: "pointer",
    },
    chatResponse: {
      marginTop: 16, background: "#050706", border: "1px solid #0f1510",
      borderRadius: 2, padding: 18,
      fontFamily: serif, fontSize: "clamp(13px, 2.5vw, 15px)", lineHeight: 1.72,
      color: "#a8b8a4", whiteSpace: "pre-line",
    },
    loadingDots: { fontSize: 10, color: "#4a6048", letterSpacing: ".2em", padding: "16px 0", textAlign: "center" },

    // API error
    apiNote: {
      background: "#0d1210", border: "1px solid #1e3020", borderRadius: 2,
      padding: 16, fontSize: 10, color: "#6a8868", lineHeight: 1.7,
    },

    // Misc
    idle: { padding: "56px 0", textAlign: "center", fontSize: 10, color: "#1e2a1c", letterSpacing: ".2em" },
    divider: { border: "none", borderTop: "1px solid #0d1210", margin: "20px 0" },
    sec: { marginBottom: 22 },
    footer: { marginTop: 48, fontSize: 9, color: "#1e2a1c", letterSpacing: ".2em", textAlign: "center" },
  };

  // ── Tab renderers ────────────────────────────────────────────────────────────

  const renderBrief = () => {
    const d = SEED_DATA[ticker];
    const b = d.brief;
    return (
      <>
        <div style={css.sec}>
          <div style={css.secLabel}>What happened</div>
          <div style={css.briefText}>{b.what}</div>
        </div>

        <div style={css.sec}>
          <div style={css.secLabel}>Why it matters to traders</div>
          <div style={css.briefText}>{b.why}</div>
        </div>

        <div style={css.biGrid}>
          <div style={css.biCard}>
            <div style={css.biCardLabel("#4ade80")}>Bullish read</div>
            <div style={css.biCardText}>{b.bull}</div>
          </div>
          <div style={css.biCard}>
            <div style={css.biCardLabel("#f87171")}>Bearish read</div>
            <div style={css.biCardText}>{b.bear}</div>
          </div>
        </div>

        <div style={css.sec}>
          <div style={css.secLabel}>Questions worth investigating</div>
          <ul style={css.qsList}>
            {b.questions.map((q, i) => (
              <li key={i} style={css.qsItem}>
                <span style={{ position: "absolute", left: 0, color: "#4a6048", fontFamily: mono }}>→</span>
                {q}
              </li>
            ))}
          </ul>
        </div>

        <div style={css.chatSection}>
          <div style={css.chatLabel}>Ask Claude about this data</div>
          <div style={css.chatRow}>
            <input
              style={css.chatInput}
              placeholder="e.g. is this a hedge or a directional bet?"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && askClaude()}
            />
            <button style={css.chatBtn} onClick={askClaude}>
              {chatLoading ? "..." : "ASK ↗"}
            </button>
          </div>
          {chatLoading && <div style={css.loadingDots}>READING ···</div>}
          {chatResponse && <div style={css.chatResponse}>{chatResponse}</div>}
        </div>
      </>
    );
  };

  const renderData = () => {
    const d = SEED_DATA[ticker];
    return (
      <>
        <div style={css.statsGrid}>
          <div style={css.statCell}>
            <div style={css.statLabel}>Net Flow Bias</div>
            <div style={css.statVal(biasCol)}>{s.bias}</div>
            <div style={css.statSub}>{fm.m(s.bias === "BULL" ? s.cp : s.pp)} dominant · {s.ratio}x</div>
          </div>
          <div style={{ ...css.statCell, borderLeft: "1px solid #090e08" }}>
            <div style={css.statLabel}>Put / Call Ratio</div>
            <div style={css.statVal(pcCol)}>{s.pc.toFixed(2)}</div>
            <div style={css.statSub}>{fm.sh(s.call)}C · {fm.sh(s.put)}P</div>
          </div>
          <div style={{ ...css.statCell, ...css.statFull }}>
            <div style={css.statLabel}>Dark Pool Volume</div>
            <div style={css.statVal("#c8a83a")}>{fm.sh(s.dpv)}</div>
            <div style={css.statSub}>avg print {fm.p(s.dpavg)}</div>
          </div>
        </div>

        <div style={css.secLabel}>Flow alerts · {d.flow.length} prints</div>
        <div style={{ ...css.flowCols, marginBottom: 4 }}>
          {["TYPE", "STRIKE / EXP", "SIZE", "PREMIUM"].map((h, i) => (
            <div key={i} style={{ ...css.flowColHdr, textAlign: i > 1 ? "right" : "left", paddingLeft: i === 1 ? 6 : 0 }}>{h}</div>
          ))}
        </div>
        {d.flow.map((f, i) => (
          <div key={i} style={css.flowRow}>
            <span style={css.flowType(f.type)}>{f.type === "Call" ? "↑ C" : "↓ P"}</span>
            <span style={css.flowInfo}>${f.strike} · {f.expiry}</span>
            <span style={css.flowNum}>{f.size.toLocaleString()}</span>
            <span style={css.flowPrem}>{fm.m(f.premium)}</span>
          </div>
        ))}

        <div style={{ ...css.secLabel, marginTop: 20 }}>Dark pool prints</div>
        {d.dp.map((p, i) => (
          <div key={i} style={css.dpRow}>
            <span style={{ color: "#c8d4c4" }}>{fm.p(p.price)}</span>
            <span style={{ color: "#6a8868" }}>{fm.sh(p.size)} shares · {p.time}</span>
          </div>
        ))}
      </>
    );
  };

  const renderBuilder = () => (
    <>
      <div style={css.sec}>
        <div style={css.secLabel}>MCP workflow to reproduce this</div>
        {[
          { name: "morning-briefing",  desc: "Get market context — tide, earnings, sector flow — before drilling into a ticker" },
          { name: "unusual-flow",       desc: `Pull the top unusual option prints for ${ticker} — size, premium, strike, expiry` },
          { name: "ticker-analysis",    desc: `Deep dive: options, dark pool, insider activity, key levels for ${ticker}` },
          { name: "greek-exposure",     desc: "Map gamma/delta exposure by strike to understand dealer positioning" },
        ].map((step, i) => (
          <div key={i} style={css.mcpStep}>
            <div style={css.mcpNum}>{i + 1}</div>
            <div>
              <span style={css.mcpName}>{step.name}</span>
              <span style={css.mcpDesc}>{step.desc}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={css.sec}>
        <div style={css.secLabel}>Raw API endpoints</div>
        {[
          `/api/option-trades/flow-alerts?ticker_symbol=${ticker}&min_premium=50000`,
          `/api/darkpool/${ticker}`,
          `/api/stock/${ticker}/options-volume`,
          `/api/stock/${ticker}/spot-exposures/strike`,
        ].map((ep, i) => (
          <span key={i} style={css.ep}>
            <span style={css.epMethod}>GET</span>{ep}
          </span>
        ))}
      </div>

      <div style={css.sec}>
        <div style={css.secLabel}>System prompt pattern</div>
        <div style={css.codeBlock}>{`You are a market educator, not an advisor.
Given options flow data for ${ticker}, write a brief with:
- What unusual activity occurred (factual)
- Why traders might care (context)
- Bullish interpretation (not advice)
- Bearish interpretation (not advice)
- 3–4 questions worth investigating

Never give buy/sell recommendations.
Write for a curious builder, not a trader.`}</div>
      </div>

      <button style={css.templateBtn} onClick={generateTemplate}>
        {templateLoading ? "GENERATING ···" : `GENERATE BUILDER TEMPLATE FOR ${ticker} ↗`}
      </button>

      {templateLoading && <div style={css.loadingDots}>ASKING CLAUDE ···</div>}
      {templateContent && (
        <div style={{ ...css.codeBlock, marginTop: 16, color: "#a8b8a4" }}>
          {templateContent}
        </div>
      )}
    </>
  );

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div style={css.root}>
      <style>{`
        button:hover { filter: brightness(1.25); }
        input::placeholder { color: #2e4030; }
      `}</style>

      <div style={css.inner}>

        {/* Header */}
        <div style={css.eyebrow}>Unusual Whales · Options Flow Intelligence</div>
        <div style={css.title}>
          WHALE WATCH <span style={css.titleAccent}>STUDIO</span>
        </div>
        <div style={css.sub}>EXPLORE · LEARN · BUILD</div>

        {/* Search */}
        <div style={css.searchRow}>
          <input
            style={css.searchInput}
            placeholder="Enter any ticker..."
            value={searchVal}
            onChange={e => { setSearchVal(e.target.value); setSearchError(null); }}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
          />
          <button style={css.searchBtn} onClick={handleSearch}>SEARCH ↗</button>
        </div>

        {searchError && (
          <div style={{ ...css.apiNote, marginBottom: 16 }}>
            <strong style={{ color: "#c8a83a", display: "block", marginBottom: 6, fontSize: 9, letterSpacing: ".15em" }}>
              ⚠ LIVE API KEY REQUIRED
            </strong>
            "{searchError}" requires a live Unusual Whales API key. This demo uses seeded data for{" "}
            <strong style={{ color: "#c8a83a" }}>NVDA, AAPL, SPY, TSLA</strong>. The full build queries the
            flow-alerts, darkpool, and options-volume endpoints in real time.
          </div>
        )}

        {/* Ticker selector */}
        <div style={css.tickerGrid}>
          {["NVDA", "AAPL", "SPY", "TSLA"].map(t => (
            <button key={t} style={css.tickerBtn(t)} onClick={() => selectTicker(t)}>{t}</button>
          ))}
        </div>

        {/* Content */}
        {!ticker ? (
          <div style={css.idle}>── SELECT A TICKER TO BEGIN ──</div>
        ) : (
          <>
            {/* Tab bar */}
            <div style={css.tabBar}>
              {["brief", "data", "builder"].map(tab => (
                <button key={tab} style={css.tab(tab)} onClick={() => setActiveTab(tab)}>
                  {tab.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Tab content */}
            {activeTab === "brief"   && renderBrief()}
            {activeTab === "data"    && renderData()}
            {activeTab === "builder" && renderBuilder()}
          </>
        )}

        <div style={css.footer}>
          DATA VIA UNUSUAL WHALES · ANALYSIS BY CLAUDE · DEMO BUILD
        </div>
      </div>
    </div>
  );
}
