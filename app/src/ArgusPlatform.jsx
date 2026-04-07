import { useState, useEffect, useRef, useCallback } from "react";

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: "overview", label: "Overview", icon: "◈" },
  { id: "signals", label: "Signal Feed", icon: "◉" },
  { id: "briefing", label: "Briefing", icon: "◆" },
  { id: "cim", label: "CIM Analyzer", icon: "◰" },
  { id: "portfolio", label: "Portfolio", icon: "◱" },
  { id: "mailbox", label: "Mailbox", icon: "◲" },
  { id: "query", label: "Query", icon: "◳" },
];

const SIGNALS = [
  { id: 1, type: "M&A", urgency: "high", company: "Besi Semiconductor", region: "Benelux", sector: "Technology", summary: "Strategic buyer interest from Asian consortium at ~€42/share premium signals sector consolidation pressure across AMS-listed semicon names", time: "06:47", tags: ["M&A", "Semicon", "Benelux"] },
  { id: 2, type: "Regulatory", urgency: "high", company: "AFM Enforcement", region: "EU", sector: "Financial", summary: "AFM tightens greenwashing enforcement: 3 Dutch asset managers under formal investigation, Q2 SFDR Article 9 filings at risk", time: "06:51", tags: ["AFM", "SFDR", "ESG"] },
  { id: 3, type: "Earnings", urgency: "low", company: "Kion Group AG", region: "DACH", sector: "Industrials", summary: "Q1 EBITDA beat of 8.3% driven by automation segment; guidance raised, order book at record €4.2B. BaFin filing pending.", time: "07:02", tags: ["Earnings", "Beat", "DACH"] },
  { id: 4, type: "Credit", urgency: "high", company: "Moody's EU Watch", region: "EU", sector: "Financial", summary: "Sovereign credit outlook shifted negative for two Eurozone members; HY spread widening 40bps expected across European leveraged loan market", time: "07:11", tags: ["Credit", "Macro", "Risk"] },
  { id: 5, type: "Deal Flow", urgency: "medium", company: "Triton Partners", region: "Nordics", sector: "Healthcare", summary: "Triton exploring exit of Nordic home-care platform Capio; process launched, EV ~€1.1B, CS advising sell-side", time: "07:18", tags: ["PE", "Exit", "Healthcare"] },
  { id: 6, type: "Macro", urgency: "medium", company: "ECB Forward Guidance", region: "EU", sector: "Financial", summary: "ECB signals two additional cuts in H2 2025; spread compression expected in IG European credit; leveraged buyout financing window reopening", time: "07:31", tags: ["ECB", "Rates", "Credit"] },
  { id: 7, type: "M&A", urgency: "medium", company: "Springer Nature", region: "DACH", sector: "Technology", summary: "BC Partners and GIC weighing secondary buyout at €8B EV; management buyout structure under discussion with Holtzbrinck co-investors", time: "07:44", tags: ["PE", "Secondary", "Media"] },
];

const PORTFOLIO_HOLDINGS = [
  { id: 1, name: "ASML Holding", ticker: "ASML", sector: "Technology", region: "Benelux", entryPrice: 620.00, currentPrice: 742.30, shares: 12, currency: "EUR", status: "active", moic: 1.20, irr: 18.2, notes: "Core semicon position. Monitor export control risk." },
  { id: 2, name: "Kion Group AG", ticker: "KGX", sector: "Industrials", region: "DACH", entryPrice: 28.40, currentPrice: 34.80, shares: 45, currency: "EUR", status: "active", moic: 1.23, irr: 21.4, notes: "Automation tailwind. Q1 beat confirmed thesis." },
  { id: 3, name: "Nordic Capital Fund XI", ticker: "NC-XI", sector: "Healthcare", region: "Nordics", entryPrice: 1000000, currentPrice: 1340000, shares: 1, currency: "EUR", status: "active", moic: 1.34, irr: 16.8, notes: "LP position. Capio exit could return capital Q3." },
  { id: 4, name: "VUSA ETF (S&P 500)", ticker: "VUSA", sector: "Index", region: "Global", entryPrice: 88.20, currentPrice: 103.60, shares: 200, currency: "USD", status: "active", moic: 1.17, irr: 12.4, notes: "DCA strategy. Core passive position." },
  { id: 5, name: "Ahold Delhaize", ticker: "AD", sector: "Consumer", region: "Benelux", entryPrice: 31.20, currentPrice: 28.14, shares: 30, currency: "EUR", status: "watch", moic: 0.90, irr: -8.1, notes: "Underperforming. Review thesis vs. margin compression." },
];

const MONTHLY_DATA = [
  { m: "Jan", v: 100 }, { m: "Feb", v: 103 }, { m: "Mar", v: 101 }, { m: "Apr", v: 107 },
  { m: "May", v: 112 }, { m: "Jun", v: 109 }, { m: "Jul", v: 116 }, { m: "Aug", v: 119 },
  { m: "Sep", v: 115 }, { m: "Oct", v: 122 }, { m: "Nov", v: 128 }, { m: "Dec", v: 134 },
];

const MAILBOX_ITEMS = [
  { id: 1, from: "Argus Intelligence", subject: "Morning Briefing — Tuesday 7 April 2025", preview: "European credit spreads tightening 12bps overnight. Key watch: AFM enforcement action on 3 Dutch funds. Triton exit process launched...", time: "07:00", read: true, tag: "Briefing", tagColor: "#00d4aa" },
  { id: 2, from: "Argus Signals", subject: "HIGH URGENCY: Besi Semiconductor — M&A Signal", preview: "Asian consortium bid at €42/share premium detected. Strategic implications for AMS-listed semicon basket. Recommend immediate review...", time: "06:47", read: false, tag: "Alert", tagColor: "#ff4d6d" },
  { id: 3, from: "Argus CIM Digest", subject: "CIM Analysis Complete: Project Falcon (Healthcare)", preview: "Analysis of 47-page CIM complete. Key risks identified: customer concentration (top 3 = 68% revenue), covenant headroom 1.2x. IRR base case 18.4%...", time: "Yesterday", read: true, tag: "CIM", tagColor: "#f5a623" },
  { id: 4, from: "Argus Portfolio", subject: "Weekly Portfolio Report — W14 2025", preview: "Portfolio NAV: €1,847,432 (+2.3% WoW). ASML +1.8%, Kion Q1 beat confirmed. Ahold Delhaize watch flag triggered. Full breakdown attached...", time: "Mon", read: true, tag: "Portfolio", tagColor: "#6c8ef5" },
  { id: 5, from: "Argus Regulatory", subject: "SFDR Article 9 — AFM Enforcement Update", preview: "AFM has opened formal investigation into 3 Dutch asset managers for suspected Article 9 greenwashing. Fines up to €10M possible under SFDR...", time: "Mon", read: false, tag: "Regulatory", tagColor: "#ff4d6d" },
  { id: 6, from: "Argus Intelligence", subject: "Morning Briefing — Monday 6 April 2025", preview: "ECB Governor signals two additional cuts H2. HY spread compression 40bps. Nordic PE exit pipeline accelerating. Springer Nature secondary process...", time: "Mon", read: true, tag: "Briefing", tagColor: "#00d4aa" },
  { id: 7, from: "Argus Deal Flow", subject: "New Deal: Nordic Capital Fund XI — Capio Exit", preview: "Triton Partners has launched a formal exit process for Capio home-care. EV guidance €1.1B. CS advising. LOI deadline Q2. Relevant to HC thesis...", time: "Sun", read: true, tag: "Deal", tagColor: "#f5a623" },
];

// ─── UTILITY COMPONENTS ──────────────────────────────────────────────────────
function LiveDot() {
  return <span style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: "#00d4aa", animation: "pulseDot 1.8s ease-in-out infinite", marginRight: 6 }} />;
}

function UrgencyBadge({ level }) {
  const map = { high: { color: "#ff4d6d", label: "HIGH" }, medium: { color: "#f5a623", label: "MED" }, low: { color: "#00d4aa", label: "LOW" } };
  const { color, label } = map[level] || map.low;
  return (
    <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: 1, padding: "2px 6px", borderRadius: 3, background: `${color}22`, color, border: `1px solid ${color}44` }}>{label}</span>
  );
}

function Tag({ label, color = "#00d4aa" }) {
  return <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 0.4, padding: "2px 8px", borderRadius: 4, background: `${color}18`, color, border: `1px solid ${color}30` }}>{label}</span>;
}

function TypingText({ text, speed = 14, onDone }) {
  const [displayed, setDisplayed] = useState("");
  const idx = useRef(0);
  useEffect(() => {
    setDisplayed(""); idx.current = 0;
    const go = () => {
      if (idx.current < text.length) {
        setDisplayed(text.slice(0, idx.current + 1));
        idx.current++;
        setTimeout(go, speed);
      } else if (onDone) onDone();
    };
    if (text) setTimeout(go, 100);
  }, [text]);
  return <span>{displayed}<span style={{ animation: "blink 1s infinite", opacity: displayed.length < text.length ? 1 : 0 }}>▋</span></span>;
}

function Shimmer({ w = "100%", h = 14, style = {} }) {
  return <div style={{ width: w, height: h, borderRadius: 4, background: "linear-gradient(90deg,rgba(255,255,255,0.03) 25%,rgba(255,255,255,0.08) 50%,rgba(255,255,255,0.03) 75%)", backgroundSize: "200%", animation: "shimmer 1.4s infinite", ...style }} />;
}

function MiniSpark({ data, up, w = 90, h = 30 }) {
  const vals = data.map(d => d.v ?? d.value ?? d);
  const min = Math.min(...vals), max = Math.max(...vals) + 0.001;
  const pts = vals.map((v, i) => `${(i / (vals.length - 1)) * w},${h - ((v - min) / (max - min)) * h}`).join(" ");
  return (
    <svg width={w} height={h}><polyline points={pts} fill="none" stroke={up ? "#00d4aa" : "#ff4d6d"} strokeWidth="1.8" strokeLinejoin="round" /></svg>
  );
}

function AreaChart({ data, h = 90 }) {
  const w = 600;
  const vals = data.map(d => d.v ?? d.value);
  const min = Math.min(...vals) - 3, max = Math.max(...vals) + 3;
  const px = (i) => 20 + (i / (data.length - 1)) * (w - 40);
  const py = (v) => h - 10 - ((v - min) / (max - min)) * (h - 20);
  const line = data.map((d, i) => `${px(i)},${py(vals[i])}`).join(" ");
  const area = `${px(0)},${h} ${line} ${px(data.length - 1)},${h}`;
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{ display: "block" }}>
      <defs>
        <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#00d4aa" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#00d4aa" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill="url(#ag)" />
      <polyline points={line} fill="none" stroke="#00d4aa" strokeWidth="2" strokeLinejoin="round" />
      {data.map((d, i) => (
        <g key={i}>
          <circle cx={px(i)} cy={py(vals[i])} r="3" fill="#00d4aa" opacity="0.7" />
          <text x={px(i)} y={h - 1} textAnchor="middle" fontSize="9" fill="#3a4a5a">{d.m}</text>
        </g>
      ))}
    </svg>
  );
}

function AIBlock({ loading, text, done, emptyMsg }) {
  if (loading) return <div style={{ display: "flex", flexDirection: "column", gap: 8 }}><Shimmer /><Shimmer w="90%" /><Shimmer w="75%" /></div>;
  if (!text) return <div style={{ color: "#3a4a5a", fontSize: 12, fontStyle: "italic" }}>{emptyMsg}</div>;
  return <div style={{ fontSize: 13, lineHeight: 1.85, color: "#a8b8c8", whiteSpace: "pre-wrap" }}>{done ? text : <TypingText text={text} speed={12} onDone={() => { }} />}</div>;
}

// ─── API CALL ─────────────────────────────────────────────────────────────────
async function callArgus(messages, system) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey || "",
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system,
      messages,
    }),
  });
  const data = await res.json();
  return data.content?.map(b => b.text || "").join("") || "No response.";
}

const ARGUS_SYSTEM = `You are Argus, an autonomous AI research agent delivering institutional-grade intelligence to European mid-market investment funds (€50M–€5B AUM). You sound like a senior analyst at a tier-1 PE or asset management firm — sharp, precise, authoritative, zero fluff. Always reference specific frameworks (AFM, BaFin, SFDR, IFRS, HGB, MiFID II) where relevant. English only.`;

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function ArgusPlatform() {
  const [tab, setTab] = useState("overview");
  const now = new Date();
  const timeStr = now.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" }) + " CET";
  const dateStr = now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div style={{ minHeight: "100vh", background: "#070b12", color: "#e0e8f0", fontFamily: "'IBM Plex Sans', 'Helvetica Neue', sans-serif", display: "flex" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:3px;}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:2px;}
        @keyframes pulseDot{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.4;transform:scale(0.75)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes scanLine{0%{top:0}100%{top:100%}}
        .fade-up{animation:fadeUp 0.35s ease both;}
        button{cursor:pointer;border:none;background:none;font-family:inherit;}
        input,textarea{font-family:inherit;}
        input:focus,textarea:focus{outline:none;}
      `}</style>

      {/* SIDEBAR */}
      <Sidebar tab={tab} setTab={setTab} timeStr={timeStr} dateStr={dateStr} />

      {/* CONTENT */}
      <main style={{ flex: 1, overflowY: "auto", minHeight: "100vh" }}>
        {tab === "overview" && <OverviewTab dateStr={dateStr} setTab={setTab} />}
        {tab === "signals" && <SignalsTab />}
        {tab === "briefing" && <BriefingTab dateStr={dateStr} timeStr={timeStr} />}
        {tab === "cim" && <CIMTab />}
        {tab === "portfolio" && <PortfolioTab />}
        {tab === "mailbox" && <MailboxTab setTab={setTab} />}
        {tab === "query" && <QueryTab />}
      </main>
    </div>
  );
}

// ─── SIDEBAR ─────────────────────────────────────────────────────────────────
function Sidebar({ tab, setTab, timeStr, dateStr }) {
  return (
    <aside style={{ width: 220, background: "#050810", borderRight: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh" }}>
      {/* Logo */}
      <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(0,212,170,0.1)", border: "1px solid rgba(0,212,170,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="9" r="8" stroke="#00d4aa" strokeWidth="1.2" />
              <circle cx="9" cy="9" r="4.5" stroke="#00d4aa" strokeWidth="0.8" strokeDasharray="1.5 1.5" />
              <circle cx="9" cy="9" r="2" fill="#00d4aa" />
            </svg>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, letterSpacing: -0.3, color: "#fff" }}>Argus</div>
            <div style={{ fontSize: 9, color: "#2a4a3a", fontWeight: 600, letterSpacing: 1 }}>INTELLIGENCE</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "12px 10px", overflowY: "auto" }}>
        {NAV_ITEMS.map(item => (
          <button key={item.id} onClick={() => setTab(item.id)} style={{
            width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 12px",
            borderRadius: 7, marginBottom: 2, fontSize: 13, fontWeight: tab === item.id ? 600 : 400,
            color: tab === item.id ? "#00d4aa" : "#4a5a6a", textAlign: "left",
            background: tab === item.id ? "rgba(0,212,170,0.08)" : "transparent",
            border: `1px solid ${tab === item.id ? "rgba(0,212,170,0.2)" : "transparent"}`,
            transition: "all 0.15s",
          }}
            onMouseEnter={e => { if (tab !== item.id) e.currentTarget.style.color = "#8a9aaa"; }}
            onMouseLeave={e => { if (tab !== item.id) e.currentTarget.style.color = "#4a5a6a"; }}
          >
            <span style={{ fontSize: 12, opacity: 0.7 }}>{item.icon}</span>
            {item.label}
            {item.id === "mailbox" && <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 700, background: "#ff4d6d", color: "#fff", borderRadius: 10, padding: "1px 6px" }}>2</span>}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ padding: "14px 16px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
          <LiveDot />
          <span style={{ fontSize: 11, color: "#00d4aa", fontFamily: "'IBM Plex Mono', monospace", fontWeight: 500 }}>{timeStr}</span>
        </div>
        <div style={{ fontSize: 10, color: "#2a3a4a", fontWeight: 500 }}>AFM · BaFin · SFDR · IFRS</div>
      </div>
    </aside>
  );
}

// ─── PAGE HEADER ─────────────────────────────────────────────────────────────
function PageHeader({ label, title, subtitle, action }) {
  return (
    <div style={{ padding: "28px 32px 20px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: "#2a4a3a", textTransform: "uppercase", marginBottom: 6 }}>{label}</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: "#f0f5f8", letterSpacing: -0.5 }}>{title}</div>
        {subtitle && <div style={{ fontSize: 13, color: "#3a5060", marginTop: 4 }}>{subtitle}</div>}
      </div>
      {action}
    </div>
  );
}

// ─── STAT CARD ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, color = "#00d4aa", icon }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "16px 20px" }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, color: "#3a4a5a", textTransform: "uppercase", marginBottom: 10, display: "flex", justifyContent: "space-between" }}>
        <span>{label}</span>{icon && <span style={{ opacity: 0.5 }}>{icon}</span>}
      </div>
      <div style={{ fontSize: 24, fontWeight: 700, color, fontFamily: "'IBM Plex Mono', monospace", letterSpacing: -1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: "#3a5060", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

// ─── TAB: OVERVIEW ───────────────────────────────────────────────────────────
function OverviewTab({ dateStr, setTab }) {
  const totalNav = PORTFOLIO_HOLDINGS.reduce((sum, h) => sum + h.currentPrice * h.shares, 0);
  const totalEntry = PORTFOLIO_HOLDINGS.reduce((sum, h) => sum + h.entryPrice * h.shares, 0);
  const gain = ((totalNav - totalEntry) / totalEntry * 100).toFixed(1);
  const highSignals = SIGNALS.filter(s => s.urgency === "high").length;
  const unread = MAILBOX_ITEMS.filter(m => !m.read).length;

  return (
    <div className="fade-up">
      <PageHeader label="Argus Intelligence Platform" title={`Good morning — ${dateStr}`} subtitle="Your institutional intelligence briefing is ready." />
      <div style={{ padding: "24px 32px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
          <StatCard label="Portfolio NAV" value={`€${(totalNav / 1000).toFixed(0)}K`} sub={`+${gain}% total return`} color="#00d4aa" icon="◱" />
          <StatCard label="High Urgency Signals" value={highSignals} sub="Active alerts" color="#ff4d6d" icon="◉" />
          <StatCard label="Unread Messages" value={unread} sub="Awaiting review" color="#f5a623" icon="◲" />
          <StatCard label="CIM Queue" value="1" sub="Analysis ready" color="#6c8ef5" icon="◰" />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: "#3a5060", textTransform: "uppercase" }}>Latest Signals</div>
              <button onClick={() => setTab("signals")} style={{ fontSize: 11, color: "#00d4aa", fontWeight: 600 }}>View all →</button>
            </div>
            {SIGNALS.slice(0, 4).map(s => (
              <div key={s.id} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <UrgencyBadge level={s.urgency} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#c8d8e8", marginBottom: 2 }}>{s.company}</div>
                  <div style={{ fontSize: 11, color: "#4a5a6a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.summary}</div>
                </div>
                <div style={{ fontSize: 10, color: "#3a4a5a", fontFamily: "monospace", flexShrink: 0 }}>{s.time}</div>
              </div>
            ))}
          </div>

          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: "#3a5060", textTransform: "uppercase" }}>Portfolio</div>
              <button onClick={() => setTab("portfolio")} style={{ fontSize: 11, color: "#00d4aa", fontWeight: 600 }}>Manage →</button>
            </div>
            <AreaChart data={MONTHLY_DATA} h={80} />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
              {PORTFOLIO_HOLDINGS.slice(0, 4).map(h => (
                <div key={h.id} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 10, color: "#3a4a5a", fontFamily: "monospace" }}>{h.ticker}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: h.moic >= 1 ? "#00d4aa" : "#ff4d6d" }}>{h.moic >= 1 ? "+" : ""}{((h.moic - 1) * 100).toFixed(0)}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: "#3a5060", textTransform: "uppercase" }}>Recent Messages</div>
            <button onClick={() => setTab("mailbox")} style={{ fontSize: 11, color: "#00d4aa", fontWeight: 600 }}>Open Mailbox →</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            {MAILBOX_ITEMS.slice(0, 3).map(m => (
              <div key={m.id} style={{ padding: "12px 14px", borderRadius: 8, background: m.read ? "transparent" : "rgba(0,212,170,0.04)", border: `1px solid ${m.read ? "rgba(255,255,255,0.05)" : "rgba(0,212,170,0.15)"}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <Tag label={m.tag} color={m.tagColor} />
                  {!m.read && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#00d4aa", display: "inline-block", marginTop: 3 }} />}
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#c8d8e8", marginBottom: 4, lineHeight: 1.3 }}>{m.subject}</div>
                <div style={{ fontSize: 11, color: "#4a5a6a", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{m.preview}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── TAB: SIGNALS ────────────────────────────────────────────────────────────
function SignalsTab() {
  const [active, setActive] = useState(SIGNALS[0]);
  const [analysis, setAnalysis] = useState({});
  const [loading, setLoading] = useState({});
  const [filter, setFilter] = useState("All");
  const types = ["All", ...Array.from(new Set(SIGNALS.map(s => s.type)))];

  const loadAnalysis = async (sig) => {
    if (analysis[sig.id]) return;
    setLoading(l => ({ ...l, [sig.id]: true }));
    const text = await callArgus(
      [{ role: "user", content: `Analyze this signal for a European mid-market fund manager: ${sig.company} — ${sig.summary}. Type: ${sig.type}. Region: ${sig.region}. Provide: 1) Investment implication (2 sentences), 2) Key risk to monitor (1 sentence), 3) Recommended action (1 sentence). Be precise and institutional.` }],
      ARGUS_SYSTEM
    ).catch(() => "Analysis unavailable.");
    setAnalysis(a => ({ ...a, [sig.id]: text }));
    setLoading(l => ({ ...l, [sig.id]: false }));
  };

  useEffect(() => { loadAnalysis(active); }, [active]);

  const filtered = filter === "All" ? SIGNALS : SIGNALS.filter(s => s.type === filter);

  return (
    <div className="fade-up" style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <div style={{ width: 360, borderRight: "1px solid rgba(255,255,255,0.05)", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "20px 20px 12px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: "#2a4a3a", textTransform: "uppercase", marginBottom: 12 }}>Signal Feed</div>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            {types.map(t => (
              <button key={t} onClick={() => setFilter(t)} style={{ padding: "3px 10px", borderRadius: 5, fontSize: 10, fontWeight: 600, background: filter === t ? "rgba(0,212,170,0.12)" : "rgba(255,255,255,0.04)", color: filter === t ? "#00d4aa" : "#4a5a6a", border: `1px solid ${filter === t ? "rgba(0,212,170,0.3)" : "transparent"}`, transition: "all 0.15s" }}>{t}</button>
            ))}
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "10px 12px" }}>
          {filtered.map(s => (
            <div key={s.id} onClick={() => setActive(s)} style={{ padding: "12px 14px", borderRadius: 8, marginBottom: 6, cursor: "pointer", background: active?.id === s.id ? "rgba(0,212,170,0.07)" : "rgba(255,255,255,0.02)", border: `1px solid ${active?.id === s.id ? "rgba(0,212,170,0.25)" : "rgba(255,255,255,0.04)"}`, transition: "all 0.15s" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <UrgencyBadge level={s.urgency} />
                <span style={{ fontSize: 10, color: "#3a5060", fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase" }}>{s.type}</span>
                <span style={{ marginLeft: "auto", fontSize: 10, color: "#2a3a4a", fontFamily: "monospace" }}>{s.time}</span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#c8d8e8", marginBottom: 4 }}>{s.company}</div>
              <div style={{ fontSize: 11, color: "#4a5a6a", lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{s.summary}</div>
              <div style={{ marginTop: 8, display: "flex", gap: 5 }}>{s.tags.map(t => <Tag key={t} label={t} />)}</div>
            </div>
          ))}
        </div>
      </div>

      {active && (
        <div style={{ flex: 1, overflowY: "auto", padding: "28px 32px" }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 20 }}>
            <UrgencyBadge level={active.urgency} />
            <span style={{ fontSize: 11, color: "#3a5060", fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase" }}>{active.type} · {active.region} · {active.sector}</span>
            <span style={{ marginLeft: "auto", fontSize: 11, color: "#2a3a4a", fontFamily: "monospace" }}>{active.time} CET</span>
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#f0f5f8", marginBottom: 10, lineHeight: 1.2 }}>{active.company}</div>
          <div style={{ fontSize: 14, color: "#6a7a8a", lineHeight: 1.8, marginBottom: 24 }}>{active.summary}</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>{active.tags.map(t => <Tag key={t} label={t} />)}</div>
          <div style={{ background: "rgba(0,212,170,0.04)", border: "1px solid rgba(0,212,170,0.12)", borderRadius: 10, padding: "18px 20px", marginBottom: 20 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: "#00d4aa", textTransform: "uppercase", marginBottom: 12 }}>◈ Argus Analysis</div>
            <AIBlock loading={loading[active.id]} text={analysis[active.id]} done={true} emptyMsg="Loading analysis..." />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
            {[{ l: "Relevance Score", v: "9.2 / 10" }, { l: "Action", v: active.urgency === "high" ? "Act Now" : "Monitor" }, { l: "Coverage", v: active.region }].map(m => (
              <div key={m.l} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, padding: "14px 16px" }}>
                <div style={{ fontSize: 10, color: "#3a4a5a", fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 6 }}>{m.l}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#00d4aa" }}>{m.v}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── TAB: BRIEFING ───────────────────────────────────────────────────────────
function BriefingTab({ dateStr, timeStr }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const generate = async () => {
    setLoading(true); setText(""); setDone(false);
    const t = await callArgus(
      [{ role: "user", content: `Generate the institutional morning briefing for ${dateStr}. Structure:\n\n1. MACRO PULSE (2 sentences on ECB/rates/credit conditions)\n2. DEAL FLOW (2-3 active European mid-market M&A/PE situations)\n3. REGULATORY WATCH (AFM, BaFin, SFDR, IFRS updates)\n4. SECTOR SIGNALS (2 sector-specific intelligence items)\n5. PORTFOLIO FLAG (1 actionable watch item)\n\nBe specific. Use real-sounding data points. Institutional tone.` }],
      ARGUS_SYSTEM
    ).catch(() => "Briefing generation failed.");
    setText(t); setLoading(false);
  };

  return (
    <div className="fade-up">
      <PageHeader
        label="Morning Briefing"
        title={dateStr}
        subtitle="Institutional intelligence delivered at 07:00 CET"
        action={
          <button onClick={generate} disabled={loading} style={{ padding: "9px 20px", borderRadius: 8, fontSize: 12, fontWeight: 700, background: "rgba(0,212,170,0.12)", color: "#00d4aa", border: "1px solid rgba(0,212,170,0.3)", letterSpacing: 0.3, opacity: loading ? 0.6 : 1 }}>
            {loading ? "Generating..." : text ? "↻ Refresh" : "▶ Generate Briefing"}
          </button>
        }
      />
      <div style={{ padding: "24px 32px" }}>
        <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
          {["EU", "DACH", "Benelux", "Nordics", "CEE"].map(r => <Tag key={r} label={r} />)}
          {text && <span style={{ marginLeft: "auto", fontSize: 11, color: "#2a3a4a", fontFamily: "monospace", alignSelf: "center" }}>Generated {timeStr}</span>}
        </div>
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "28px 32px", minHeight: 350 }}>
          {loading && <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>{[...Array(6)].map((_, i) => <Shimmer key={i} w={i % 3 === 0 ? "40%" : "85%"} h={16} />)}</div>}
          {text && <div style={{ fontSize: 14, lineHeight: 1.9, color: "#a8b8c8", whiteSpace: "pre-wrap" }}>{done ? text : <TypingText text={text} speed={10} onDone={() => setDone(true)} />}</div>}
          {!loading && !text && (
            <div style={{ textAlign: "center", paddingTop: 80 }}>
              <div style={{ fontSize: 40, marginBottom: 14, opacity: 0.2 }}>◆</div>
              <div style={{ fontSize: 13, color: "#3a4a5a", fontWeight: 500 }}>Click "Generate Briefing" to receive your institutional morning intelligence</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── TAB: CIM ANALYZER ───────────────────────────────────────────────────────
function CIMTab() {
  const [files, setFiles] = useState([]);
  const [active, setActive] = useState(null);
  const [analyses, setAnalyses] = useState({});
  const [loading, setLoading] = useState({});
  const [question, setQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState({});
  const [chatLoading, setChatLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInput = useRef(null);

  const readFileAsBase64 = (file) =>
    new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(r.result.split(",")[1]);
      r.onerror = rej;
      r.readAsDataURL(file);
    });

  const readFileAsText = (file) =>
    new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(r.result);
      r.onerror = rej;
      r.readAsText(file);
    });

  const analyzeFile = async (file, id) => {
    setLoading(l => ({ ...l, [id]: true }));
    try {
      let messages;
      if (file.type === "application/pdf") {
        const base64 = await readFileAsBase64(file);
        messages = [{
          role: "user",
          content: [
            { type: "document", source: { type: "base64", media_type: "application/pdf", data: base64 } },
            { type: "text", text: `This is a Confidential Information Memorandum (CIM). Provide institutional-grade analysis:\n\n1. EXECUTIVE SUMMARY (2-3 sentences)\n2. BUSINESS MODEL (key revenue drivers, customer concentration)\n3. FINANCIALS (revenue, EBITDA, growth, leverage)\n4. INVESTMENT THESIS (bull case, 2-3 points)\n5. KEY RISKS (top 3 risks, 1 sentence each)\n6. VALUATION RANGE (EV/EBITDA multiple range, IRR estimate)\n7. VERDICT (Go/No-Go with rationale)\n\nBe specific, use numbers from the document. Institutional tone.` }
          ]
        }];
      } else {
        const text = await readFileAsText(file);
        messages = [{ role: "user", content: `CIM Text:\n\n${text.slice(0, 8000)}\n\nProvide:\n1. EXECUTIVE SUMMARY\n2. BUSINESS MODEL\n3. FINANCIALS\n4. INVESTMENT THESIS\n5. KEY RISKS\n6. VALUATION RANGE\n7. VERDICT\n\nInstitutional tone, be specific.` }];
      }
      const result = await callArgus(messages, ARGUS_SYSTEM + " You are analyzing a Confidential Information Memorandum (CIM). Extract and analyze all financial and strategic information.");
      setAnalyses(a => ({ ...a, [id]: result }));
    } catch (e) {
      setAnalyses(a => ({ ...a, [id]: "Analysis failed — PDF parsing error. Please try a text-based PDF." }));
    }
    setLoading(l => ({ ...l, [id]: false }));
  };

  const handleFiles = (incoming) => {
    const valid = Array.from(incoming).filter(f => f.type === "application/pdf" || f.type === "text/plain" || f.name.endsWith(".txt") || f.name.endsWith(".pdf"));
    const newFiles = valid.map(f => ({ id: Date.now() + Math.random(), file: f, name: f.name, size: (f.size / 1024).toFixed(0) + " KB", uploaded: new Date().toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" }) }));
    setFiles(prev => [...prev, ...newFiles]);
    newFiles.forEach(nf => { analyzeFile(nf.file, nf.id); if (!active) setActive(nf); });
    if (!active && newFiles.length) setActive(newFiles[0]);
  };

  const askQuestion = async () => {
    if (!question.trim() || !active || chatLoading) return;
    const q = question.trim();
    setQuestion("");
    const key = active.id;
    setChatHistory(h => ({ ...h, [key]: [...(h[key] || []), { role: "user", content: q }] }));
    setChatLoading(true);
    const history = chatHistory[key] || [];
    const context = analyses[key] ? `CIM Analysis:\n${analyses[key]}\n\n` : "";
    const answer = await callArgus(
      [...history, { role: "user", content: context + q }],
      ARGUS_SYSTEM + " You are answering questions about a CIM based on your prior analysis. Be precise and reference specific data points."
    ).catch(() => "Failed to answer.");
    setChatHistory(h => ({ ...h, [key]: [...(h[key] || []), { role: "user", content: q }, { role: "assistant", content: answer }] }));
    setChatLoading(false);
  };

  return (
    <div className="fade-up" style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <div style={{ width: 280, borderRight: "1px solid rgba(255,255,255,0.05)", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "20px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: "#2a4a3a", textTransform: "uppercase", marginBottom: 12 }}>CIM Analyzer</div>
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
            onClick={() => fileInput.current?.click()}
            style={{ border: `2px dashed ${dragOver ? "rgba(0,212,170,0.6)" : "rgba(255,255,255,0.1)"}`, borderRadius: 10, padding: "20px 12px", textAlign: "center", cursor: "pointer", background: dragOver ? "rgba(0,212,170,0.05)" : "transparent", transition: "all 0.2s" }}
          >
            <div style={{ fontSize: 22, marginBottom: 8, opacity: 0.4 }}>◰</div>
            <div style={{ fontSize: 12, color: "#4a5a6a", fontWeight: 500 }}>Drop CIM here</div>
            <div style={{ fontSize: 10, color: "#2a3a4a", marginTop: 4 }}>PDF or TXT · Click to browse</div>
          </div>
          <input ref={fileInput} type="file" accept=".pdf,.txt" multiple style={{ display: "none" }} onChange={e => handleFiles(e.target.files)} />
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "10px 12px" }}>
          {files.length === 0 && <div style={{ textAlign: "center", padding: "30px 10px", color: "#2a3a4a", fontSize: 12 }}>No CIMs uploaded yet</div>}
          {files.map(f => (
            <div key={f.id} onClick={() => setActive(f)} style={{ padding: "10px 12px", borderRadius: 8, marginBottom: 6, cursor: "pointer", background: active?.id === f.id ? "rgba(0,212,170,0.07)" : "rgba(255,255,255,0.02)", border: `1px solid ${active?.id === f.id ? "rgba(0,212,170,0.25)" : "rgba(255,255,255,0.04)"}`, transition: "all 0.15s" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <span style={{ fontSize: 14, opacity: 0.6 }}>📄</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#c8d8e8", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 10, color: "#3a4a5a" }}>{f.size}</span>
                {loading[f.id] ? <span style={{ fontSize: 10, color: "#f5a623" }}>Analyzing...</span> : analyses[f.id] ? <span style={{ fontSize: 10, color: "#00d4aa" }}>✓ Ready</span> : null}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {!active ? (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 14, color: "#2a3a4a" }}>
            <div style={{ fontSize: 48, opacity: 0.15 }}>◰</div>
            <div style={{ fontSize: 14, fontWeight: 500 }}>Upload a CIM to begin analysis</div>
            <div style={{ fontSize: 12 }}>Argus will extract financials, risks, and investment thesis</div>
          </div>
        ) : (
          <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <span style={{ fontSize: 16, opacity: 0.6 }}>📄</span>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#f0f5f8" }}>{active.name}</div>
                <div style={{ fontSize: 11, color: "#3a5060" }}>{active.size} · Uploaded {active.uploaded}</div>
              </div>
            </div>
            <div style={{ background: "rgba(0,212,170,0.04)", border: "1px solid rgba(0,212,170,0.12)", borderRadius: 10, padding: "20px 24px", marginBottom: 20 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: "#00d4aa", textTransform: "uppercase", marginBottom: 14 }}>◈ Argus CIM Analysis</div>
              <AIBlock loading={loading[active.id]} text={analyses[active.id]} done={true} emptyMsg="Upload a CIM to generate analysis" />
            </div>
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "18px 20px" }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: "#3a5060", textTransform: "uppercase", marginBottom: 14 }}>Ask Argus about this CIM</div>
              <div style={{ maxHeight: 250, overflowY: "auto", marginBottom: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                {!(chatHistory[active.id]?.length) && (
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {["What is the revenue CAGR?", "What are the top 3 risks?", "Is the valuation justified?", "Debt structure overview"].map(q => (
                      <button key={q} onClick={() => setQuestion(q)} style={{ padding: "5px 12px", borderRadius: 6, fontSize: 11, fontWeight: 500, background: "rgba(255,255,255,0.04)", color: "#5a6a7a", border: "1px solid rgba(255,255,255,0.08)" }}>{q}</button>
                    ))}
                  </div>
                )}
                {(chatHistory[active.id] || []).map((m, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                    <div style={{ maxWidth: "80%", padding: "9px 13px", borderRadius: m.role === "user" ? "10px 10px 3px 10px" : "10px 10px 10px 3px", background: m.role === "user" ? "rgba(0,212,170,0.1)" : "rgba(255,255,255,0.04)", border: `1px solid ${m.role === "user" ? "rgba(0,212,170,0.2)" : "rgba(255,255,255,0.06)"}`, fontSize: 12, lineHeight: 1.6, color: m.role === "user" ? "#9ae8d0" : "#a8b8c8", whiteSpace: "pre-wrap" }}>{m.content}</div>
                  </div>
                ))}
                {chatLoading && <div style={{ display: "flex", gap: 4, padding: "8px 12px" }}>{[0, 1, 2].map(i => <span key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: "#00d4aa", opacity: 0.6, animation: `blink 1s ${i * 0.25}s infinite` }} />)}</div>}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <input value={question} onChange={e => setQuestion(e.target.value)} onKeyDown={e => e.key === "Enter" && askQuestion()} placeholder="Ask about this CIM..." style={{ flex: 1, padding: "9px 14px", borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#e0e8f0", fontSize: 12 }} />
                <button onClick={askQuestion} disabled={!question.trim() || chatLoading || !analyses[active.id]} style={{ padding: "9px 16px", borderRadius: 8, background: "rgba(0,212,170,0.12)", color: "#00d4aa", border: "1px solid rgba(0,212,170,0.25)", fontSize: 13, fontWeight: 700, opacity: (!question.trim() || chatLoading || !analyses[active.id]) ? 0.4 : 1 }}>→</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── TAB: PORTFOLIO ──────────────────────────────────────────────────────────
function PortfolioTab() {
  const [holdings, setHoldings] = useState(PORTFOLIO_HOLDINGS);
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState(null);
  const [aiNote, setAiNote] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [form, setForm] = useState({ name: "", ticker: "", sector: "", region: "", entryPrice: "", currentPrice: "", shares: "", currency: "EUR", notes: "" });

  const totalNav = holdings.reduce((s, h) => s + h.currentPrice * h.shares, 0);
  const totalEntry = holdings.reduce((s, h) => s + h.entryPrice * h.shares, 0);
  const totalGain = ((totalNav - totalEntry) / totalEntry * 100).toFixed(1);

  const addHolding = () => {
    if (!form.name || !form.entryPrice || !form.currentPrice || !form.shares) return;
    const ep = parseFloat(form.entryPrice), cp = parseFloat(form.currentPrice);
    const newH = { id: Date.now(), ...form, entryPrice: ep, currentPrice: cp, shares: parseFloat(form.shares), moic: cp / ep, irr: ((cp / ep - 1) * 100).toFixed(1), status: cp >= ep ? "active" : "watch" };
    setHoldings(h => [...h, newH]);
    setForm({ name: "", ticker: "", sector: "", region: "", entryPrice: "", currentPrice: "", shares: "", currency: "EUR", notes: "" });
    setShowAdd(false);
  };

  const removeHolding = (id) => { setHoldings(h => h.filter(x => x.id !== id)); if (selected?.id === id) setSelected(null); };

  const getAINote = async (h) => {
    setSelected(h); setAiNote(""); setAiLoading(true);
    const text = await callArgus(
      [{ role: "user", content: `Portfolio position review: ${h.name} (${h.ticker}). Entry: €${h.entryPrice}. Current: €${h.currentPrice}. MOIC: ${h.moic.toFixed(2)}x. Sector: ${h.sector}. Region: ${h.region}. Notes: ${h.notes}. Provide: 1) Current situation (1 sentence), 2) Key risk to watch (1 sentence), 3) Recommended action: Hold/Add/Reduce/Exit (with brief rationale). Be direct.` }],
      ARGUS_SYSTEM
    ).catch(() => "Analysis failed.");
    setAiNote(text); setAiLoading(false);
  };

  return (
    <div className="fade-up">
      <PageHeader
        label="Portfolio Management"
        title="Holdings Overview"
        subtitle={`NAV: €${totalNav.toLocaleString("nl-NL", { maximumFractionDigits: 0 })} · Total Return: ${totalGain}%`}
        action={
          <button onClick={() => setShowAdd(s => !s)} style={{ padding: "9px 18px", borderRadius: 8, fontSize: 12, fontWeight: 700, background: "rgba(0,212,170,0.12)", color: "#00d4aa", border: "1px solid rgba(0,212,170,0.3)" }}>
            {showAdd ? "✕ Cancel" : "+ Add Position"}
          </button>
        }
      />
      <div style={{ padding: "20px 32px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 24 }}>
          <StatCard label="Total NAV" value={`€${(totalNav / 1000).toFixed(0)}K`} sub="Across all positions" />
          <StatCard label="Total Return" value={`+${totalGain}%`} sub="Entry to current" color="#00d4aa" />
          <StatCard label="Positions" value={holdings.length} sub={`${holdings.filter(h => h.status === "watch").length} on watch`} color="#f5a623" />
          <StatCard label="Avg MOIC" value={`${(holdings.reduce((s, h) => s + h.moic, 0) / holdings.length).toFixed(2)}x`} sub="Portfolio average" color="#6c8ef5" />
        </div>

        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "18px 20px", marginBottom: 20 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, color: "#3a5060", textTransform: "uppercase", marginBottom: 12 }}>NAV Index (12M)</div>
          <AreaChart data={MONTHLY_DATA} h={90} />
        </div>

        {showAdd && (
          <div style={{ background: "rgba(0,212,170,0.04)", border: "1px solid rgba(0,212,170,0.15)", borderRadius: 12, padding: 20, marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#00d4aa", marginBottom: 14 }}>New Position</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 10 }}>
              {[
                { key: "name", ph: "Company name" }, { key: "ticker", ph: "Ticker" },
                { key: "sector", ph: "Sector" }, { key: "region", ph: "Region" },
                { key: "entryPrice", ph: "Entry price (€)", type: "number" },
                { key: "currentPrice", ph: "Current price (€)", type: "number" },
                { key: "shares", ph: "Shares / Units", type: "number" },
                { key: "currency", ph: "Currency" },
              ].map(f => (
                <input key={f.key} type={f.type || "text"} placeholder={f.ph} value={form[f.key]} onChange={e => setForm(x => ({ ...x, [f.key]: e.target.value }))}
                  style={{ padding: "8px 12px", borderRadius: 7, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#e0e8f0", fontSize: 12 }} />
              ))}
            </div>
            <textarea placeholder="Investment notes..." value={form.notes} onChange={e => setForm(x => ({ ...x, notes: e.target.value }))} rows={2}
              style={{ width: "100%", padding: "8px 12px", borderRadius: 7, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#e0e8f0", fontSize: 12, resize: "vertical", marginBottom: 10 }} />
            <button onClick={addHolding} style={{ padding: "8px 20px", borderRadius: 7, background: "rgba(0,212,170,0.15)", color: "#00d4aa", border: "1px solid rgba(0,212,170,0.3)", fontSize: 12, fontWeight: 700 }}>Add Position</button>
          </div>
        )}

        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, overflow: "hidden", marginBottom: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 90px 90px 80px 80px 90px 32px", gap: 0, padding: "10px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            {["Position", "Ticker", "Entry", "Current", "P&L", "MOIC", "Status", ""].map(h => (
              <div key={h} style={{ fontSize: 10, fontWeight: 700, color: "#3a4a5a", letterSpacing: 0.5, textTransform: "uppercase" }}>{h}</div>
            ))}
          </div>
          {holdings.map(h => {
            const pnl = ((h.currentPrice - h.entryPrice) / h.entryPrice * 100).toFixed(1);
            const up = h.currentPrice >= h.entryPrice;
            return (
              <div key={h.id} onClick={() => getAINote(h)} style={{ display: "grid", gridTemplateColumns: "1fr 80px 90px 90px 80px 80px 90px 32px", gap: 0, padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.04)", cursor: "pointer", background: selected?.id === h.id ? "rgba(0,212,170,0.04)" : "transparent", transition: "background 0.15s" }}
                onMouseEnter={e => { if (selected?.id !== h.id) e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}
                onMouseLeave={e => { if (selected?.id !== h.id) e.currentTarget.style.background = "transparent"; }}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#c8d8e8" }}>{h.name}</div>
                  <div style={{ fontSize: 10, color: "#3a4a5a" }}>{h.sector} · {h.region}</div>
                </div>
                <div style={{ fontSize: 12, fontFamily: "monospace", color: "#6c8ef5", fontWeight: 600 }}>{h.ticker}</div>
                <div style={{ fontSize: 12, fontFamily: "monospace", color: "#6a7a8a" }}>€{h.entryPrice.toLocaleString()}</div>
                <div style={{ fontSize: 12, fontFamily: "monospace", color: "#c8d8e8", fontWeight: 600 }}>€{h.currentPrice.toLocaleString()}</div>
                <div style={{ fontSize: 12, fontFamily: "monospace", color: up ? "#00d4aa" : "#ff4d6d", fontWeight: 700 }}>{up ? "+" : ""}{pnl}%</div>
                <div style={{ fontSize: 12, fontFamily: "monospace", color: up ? "#00d4aa" : "#ff4d6d", fontWeight: 700 }}>{h.moic.toFixed(2)}x</div>
                <div><span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4, background: h.status === "active" ? "rgba(0,212,170,0.1)" : "rgba(245,166,35,0.1)", color: h.status === "active" ? "#00d4aa" : "#f5a623", border: `1px solid ${h.status === "active" ? "rgba(0,212,170,0.2)" : "rgba(245,166,35,0.2)"}` }}>{h.status.toUpperCase()}</span></div>
                <button onClick={e => { e.stopPropagation(); removeHolding(h.id); }} style={{ fontSize: 12, color: "#3a4a5a", width: 24, height: 24, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" }}
                  onMouseEnter={e => e.currentTarget.style.color = "#ff4d6d"}
                  onMouseLeave={e => e.currentTarget.style.color = "#3a4a5a"}>✕</button>
              </div>
            );
          })}
        </div>

        {selected && (
          <div style={{ background: "rgba(0,212,170,0.04)", border: "1px solid rgba(0,212,170,0.12)", borderRadius: 12, padding: "18px 22px" }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: "#00d4aa", textTransform: "uppercase", marginBottom: 10 }}>◈ Argus Position Review — {selected.name}</div>
            <AIBlock loading={aiLoading} text={aiNote} done={true} emptyMsg="Loading..." />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── TAB: MAILBOX ────────────────────────────────────────────────────────────
function MailboxTab({ setTab }) {
  const [items, setItems] = useState(MAILBOX_ITEMS);
  const [selected, setSelected] = useState(null);
  const [aiSummary, setAiSummary] = useState({});
  const [aiLoading, setAiLoading] = useState({});
  const [filter, setFilter] = useState("All");
  const tags = ["All", ...Array.from(new Set(MAILBOX_ITEMS.map(m => m.tag)))];

  const open = async (item) => {
    setItems(i => i.map(x => x.id === item.id ? { ...x, read: true } : x));
    setSelected(item);
    if (aiSummary[item.id]) return;
    setAiLoading(l => ({ ...l, [item.id]: true }));
    const text = await callArgus(
      [{ role: "user", content: `This is an investment intelligence message:\n\nFrom: ${item.from}\nSubject: ${item.subject}\n\nPreview: ${item.preview}\n\nProvide a sharp 2-sentence executive summary and one recommended action. Institutional tone.` }],
      ARGUS_SYSTEM
    ).catch(() => "Summary unavailable.");
    setAiSummary(s => ({ ...s, [item.id]: text }));
    setAiLoading(l => ({ ...l, [item.id]: false }));
  };

  const filtered = filter === "All" ? items : items.filter(m => m.tag === filter);
  const unread = items.filter(m => !m.read).length;

  return (
    <div className="fade-up" style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <div style={{ width: 320, borderRight: "1px solid rgba(255,255,255,0.05)", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "20px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: "#2a4a3a", textTransform: "uppercase" }}>Mailbox</div>
            {unread > 0 && <span style={{ fontSize: 10, fontWeight: 700, background: "#ff4d6d", color: "#fff", borderRadius: 10, padding: "1px 6px" }}>{unread}</span>}
            <button onClick={() => setItems(i => i.map(x => ({ ...x, read: true })))} style={{ marginLeft: "auto", fontSize: 10, color: "#3a5060", fontWeight: 600 }}>Mark all read</button>
          </div>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            {tags.map(t => (
              <button key={t} onClick={() => setFilter(t)} style={{ padding: "3px 9px", borderRadius: 5, fontSize: 10, fontWeight: 600, background: filter === t ? "rgba(0,212,170,0.12)" : "rgba(255,255,255,0.04)", color: filter === t ? "#00d4aa" : "#4a5a6a", border: `1px solid ${filter === t ? "rgba(0,212,170,0.3)" : "transparent"}` }}>{t}</button>
            ))}
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>
          {filtered.map(m => (
            <div key={m.id} onClick={() => open(m)} style={{ padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.04)", cursor: "pointer", background: selected?.id === m.id ? "rgba(0,212,170,0.05)" : !m.read ? "rgba(255,255,255,0.015)" : "transparent", borderLeft: `3px solid ${selected?.id === m.id ? "#00d4aa" : !m.read ? "rgba(0,212,170,0.3)" : "transparent"}`, transition: "all 0.15s" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5 }}>
                <Tag label={m.tag} color={m.tagColor} />
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {!m.read && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#00d4aa", display: "inline-block" }} />}
                  <span style={{ fontSize: 10, color: "#2a3a4a", fontFamily: "monospace" }}>{m.time}</span>
                </div>
              </div>
              <div style={{ fontSize: 12, fontWeight: !m.read ? 700 : 500, color: !m.read ? "#e0e8f0" : "#8a9aaa", marginBottom: 4 }}>{m.subject}</div>
              <div style={{ fontSize: 11, color: "#3a4a5a", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", lineHeight: 1.5 }}>{m.preview}</div>
            </div>
          ))}
        </div>
      </div>

      {selected ? (
        <div style={{ flex: 1, overflowY: "auto", padding: "28px 32px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
            <div>
              <Tag label={selected.tag} color={selected.tagColor} />
              <div style={{ fontSize: 20, fontWeight: 700, color: "#f0f5f8", marginTop: 10, marginBottom: 6, lineHeight: 1.2 }}>{selected.subject}</div>
              <div style={{ fontSize: 12, color: "#3a5060" }}>From: <span style={{ color: "#6a7a8a" }}>{selected.from}</span> · <span style={{ fontFamily: "monospace" }}>{selected.time}</span></div>
            </div>
          </div>
          <div style={{ background: "rgba(0,212,170,0.04)", border: "1px solid rgba(0,212,170,0.12)", borderRadius: 10, padding: "16px 20px", marginBottom: 22 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: "#00d4aa", textTransform: "uppercase", marginBottom: 10 }}>◈ Argus Summary & Action</div>
            <AIBlock loading={aiLoading[selected.id]} text={aiSummary[selected.id]} done={true} emptyMsg="Summarizing..." />
          </div>
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "20px 24px" }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, color: "#3a5060", textTransform: "uppercase", marginBottom: 14 }}>Full Message</div>
            <div style={{ fontSize: 13, lineHeight: 1.85, color: "#8a9aaa" }}>{selected.preview}</div>
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.05)", fontSize: 12, color: "#3a4a5a", lineHeight: 1.8 }}>
              This report was generated by Argus Intelligence and delivered to your inbox at {selected.time}. For the full dataset and source breakdown, open the relevant module in the platform dashboard.
            </div>
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12, color: "#2a3a4a" }}>
          <div style={{ fontSize: 40, opacity: 0.15 }}>◲</div>
          <div style={{ fontSize: 13, fontWeight: 500 }}>Select a message to read</div>
        </div>
      )}
    </div>
  );
}

// ─── TAB: QUERY ──────────────────────────────────────────────────────────────
function QueryTab() {
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [history, loading]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const q = input.trim(); setInput("");
    setHistory(h => [...h, { role: "user", content: q }]);
    setLoading(true);
    const answer = await callArgus(
      [...history, { role: "user", content: q }],
      ARGUS_SYSTEM + " Answer questions about European investment markets, M&A, PE, credit, regulation (AFM, BaFin, SFDR, IFRS, MiFID II), valuation, and deal analysis. Be concise and precise."
    ).catch(() => "Query failed.");
    setHistory(h => [...h, { role: "user", content: q }, { role: "assistant", content: answer }]);
    setLoading(false);
  };

  const SUGGESTIONS = [
    "What's the current SFDR Article 9 reclassification trend in Europe?",
    "How does ECB rate policy affect European LBO financing?",
    "Compare EV/EBITDA multiples in DACH healthcare vs. Nordics",
    "Explain AFM enforcement priorities for 2025",
    "What drives ASML's moat in the semiconductor value chain?",
    "Typical covenant package in a European mid-market leveraged loan",
  ];

  return (
    <div className="fade-up" style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <PageHeader label="Intelligence Query" title="Ask Argus" subtitle="Institutional-grade answers on European markets, deals, regulation & valuation" />
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px", display: "flex", flexDirection: "column", gap: 12 }}>
        {history.length === 0 && (
          <div>
            <div style={{ textAlign: "center", paddingBottom: 32 }}>
              <div style={{ fontSize: 48, opacity: 0.1, marginBottom: 12 }}>◳</div>
              <div style={{ fontSize: 14, color: "#3a5060", fontWeight: 500 }}>Ask anything about European investment markets</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {SUGGESTIONS.map(s => (
                <button key={s} onClick={() => setInput(s)} style={{ padding: "12px 16px", borderRadius: 8, fontSize: 12, fontWeight: 500, textAlign: "left", background: "rgba(255,255,255,0.02)", color: "#5a6a7a", border: "1px solid rgba(255,255,255,0.06)", lineHeight: 1.5, transition: "all 0.15s" }}
                  onMouseEnter={e => { e.currentTarget.style.color = "#c8d8e8"; e.currentTarget.style.borderColor = "rgba(0,212,170,0.2)"; }}
                  onMouseLeave={e => { e.currentTarget.style.color = "#5a6a7a"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; }}
                >{s}</button>
              ))}
            </div>
          </div>
        )}
        {history.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{ maxWidth: "78%", padding: "13px 17px", borderRadius: m.role === "user" ? "12px 12px 4px 12px" : "12px 12px 12px 4px", background: m.role === "user" ? "rgba(0,212,170,0.1)" : "rgba(255,255,255,0.03)", border: `1px solid ${m.role === "user" ? "rgba(0,212,170,0.22)" : "rgba(255,255,255,0.06)"}`, fontSize: 13, lineHeight: 1.8, color: m.role === "user" ? "#9ae8d0" : "#a8b8c8", whiteSpace: "pre-wrap" }}>{m.content}</div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex" }}>
            <div style={{ padding: "12px 16px", borderRadius: "12px 12px 12px 4px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: 5, alignItems: "center" }}>
              {[0, 1, 2].map(i => <span key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "#00d4aa", opacity: 0.7, animation: `blink 1s ${i * 0.3}s infinite` }} />)}
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>
      <div style={{ padding: "16px 32px", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", gap: 10 }}>
        <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} placeholder="Ask about deals, regulation, valuation, macro... (Enter to send)" rows={2}
          style={{ flex: 1, padding: "11px 16px", borderRadius: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#e0e8f0", fontSize: 13, resize: "none", lineHeight: 1.5, fontFamily: "inherit", transition: "border 0.2s" }}
          onFocus={e => e.target.style.borderColor = "rgba(0,212,170,0.4)"}
          onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />
        <button onClick={send} disabled={!input.trim() || loading} style={{ padding: "11px 20px", borderRadius: 10, background: "rgba(0,212,170,0.13)", color: "#00d4aa", border: "1px solid rgba(0,212,170,0.28)", fontSize: 15, fontWeight: 700, opacity: !input.trim() || loading ? 0.4 : 1, transition: "opacity 0.2s" }}>→</button>
      </div>
    </div>
  );
}
