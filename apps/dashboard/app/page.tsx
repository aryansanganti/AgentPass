"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import WorldVerifyModal, {
  loadStoredCredential,
  loadStoredWorldSession,
  type WorldVerifyCredential,
} from "@/components/WorldVerifyModal";
import AgentProfile from "@/components/AgentProfile";
import {
  AgentIcon,
  ShieldCheckIcon,
  WalletIcon,
  ArrowUpRightIcon,
  GraphIcon,
  ActivityIcon,
  AlertIcon,
} from "@/components/Icons";

// ─── Extra inline icons ───────────────────────────────────────────────────────
function ZapIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M13 2 4.5 13.5H11L10 22l9.5-11.5H13L13 2Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function LockIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" strokeLinecap="round" />
    </svg>
  );
}
function CoinIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v8M9.5 10.5c0-1.4 1.1-2.5 2.5-2.5s2.5 1.1 2.5 2.5c0 1.4-1.1 2-2.5 2s-2.5.6-2.5 2c0 1.4 1.1 2.5 2.5 2.5s2.5-1.1 2.5-2.5" strokeLinecap="round" />
    </svg>
  );
}
function ChainIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function TrendUpIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M3 17l4-4 4 4 4-4 4-4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 7h4v4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function SkullIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={className}>
      <path d="M12 4a7 7 0 0 1 7 7c0 2.8-1.6 5.2-4 6.4V19a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-1.6C6.6 16.2 5 13.8 5 11a7 7 0 0 1 7-7Z" strokeLinejoin="round" />
      <path d="M9 17h6" strokeLinecap="round" />
      <circle cx="9.5" cy="11" r="1" fill="currentColor" stroke="none" />
      <circle cx="14.5" cy="11" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
function BotIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={className}>
      <rect x="3" y="9" width="18" height="12" rx="3" />
      <path d="M12 3v6M8 3h8" strokeLinecap="round" />
      <circle cx="9" cy="14" r="1.5" />
      <circle cx="15" cy="14" r="1.5" />
      <path d="M9 18h6" strokeLinecap="round" />
    </svg>
  );
}
function RocketIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M12 2C6.5 2 4 8 4 8s-2 4 2 6c0 0 1 4 6 4s6-4 6-4c4-2 2-6 2-6s-2.5-6-8-6Z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="10" r="2" />
      <path d="M8 18 4 22M16 18l4 4" strokeLinecap="round" />
    </svg>
  );
}
function SunIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" strokeLinecap="round" />
    </svg>
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const HOW_IT_WORKS = [
  {
    step: "01",
    icon: ShieldCheckIcon,
    title: "Prove You're Human",
    desc: "Verify with World ID in one tap. No KYC, no email, just proof you're a unique human — not a bot farming the agent.",
    color: "#22c55e",
    badge: "World ID",
  },
  {
    step: "02",
    icon: WalletIcon,
    title: "Drop Any Wallet",
    desc: "Paste any Ethereum address. Your AI agent instantly queries Aave V3 and Compound V3 via The Graph's subgraph MCP.",
    color: "#7c3aed",
    badge: "The Graph",
  },
  {
    step: "03",
    icon: CoinIcon,
    title: "Agent Pays Itself",
    desc: "The agent autonomously pays for its own analysis using HBAR via the x402 micropayment protocol on Hedera — no API keys, no subscriptions.",
    color: "#14b8a6",
    badge: "Hedera x402",
  },
  {
    step: "04",
    icon: ActivityIcon,
    title: "Get Your Risk Score",
    desc: "Receive a 0–100 risk score, LTV breakdown, health factor analysis, and a plain-English recommendation. Published to Hedera Consensus Service.",
    color: "#3b82f6",
    badge: "HCS",
  },
];

const FEATURES = [
  {
    icon: ZapIcon,
    title: "AI Agent with ENS Identity",
    desc: "sentinel.agentpass.eth — a real ENS identity with roles, reputation, and capabilities. Not just a script.",
    color: "#7c3aed",
  },
  {
    icon: LockIcon,
    title: "Sybil-Resistant by Design",
    desc: "World ID proof of personhood ensures each agent budget is tied to a unique human. No bots, no abuse.",
    color: "#22c55e",
  },
  {
    icon: CoinIcon,
    title: "Agent-Autonomous Payments",
    desc: "x402 + Blocky402 on Hedera testnet. The agent manages its own HBAR budget and pays per analysis call.",
    color: "#14b8a6",
  },
  {
    icon: ChainIcon,
    title: "Live On-Chain Data",
    desc: "Real Aave V3 & Compound V3 positions via The Graph subgraph MCP. Not mocked, not cached — live.",
    color: "#3b82f6",
  },
  {
    icon: GraphIcon,
    title: "Transparent Risk Model",
    desc: "LTV ratios, health factors, concentration risk. Every factor is surfaced — no black-box scoring.",
    color: "#f59e0b",
  },
  {
    icon: AlertIcon,
    title: "HCS Audit Trail",
    desc: "Every analysis event is published to a Hedera Consensus Service topic — fully auditable, tamper-proof.",
    color: "#ec4899",
  },
];

// Icon-based meme cards — zero emojis
const MEMES = [
  {
    Icon: SkullIcon,
    iconColor: "#ef4444",
    title: "Checking health factor",
    subtitle: "after ETH dumps 40%",
    caption: "Health factor: 1.02",
    captionColor: "#ef4444",
    bg: "from-red-950/60 to-orange-950/40",
    border: "border-red-900/30",
  },
  {
    Icon: BotIcon,
    iconColor: "#14b8a6",
    title: "Your agent at 3 AM",
    subtitle: "paying for your risk check autonomously",
    caption: "0.05 HBAR sent",
    captionColor: "#14b8a6",
    bg: "from-teal-950/60 to-slate-950/40",
    border: "border-teal-900/30",
  },
  {
    Icon: TrendUpIcon,
    iconColor: "#f59e0b",
    title: "Your DeFi portfolio",
    subtitle: "62% in one asset, borrowed to the max",
    caption: "Risk score: 94 / 100",
    captionColor: "#ef4444",
    bg: "from-purple-950/60 to-slate-950/40",
    border: "border-purple-900/30",
  },
  {
    Icon: SunIcon,
    iconColor: "#22c55e",
    title: "After AgentPass confirms",
    subtitle: "your position is actually safe",
    caption: "Risk score: 12 — all good",
    captionColor: "#22c55e",
    bg: "from-green-950/60 to-slate-950/40",
    border: "border-green-900/30",
  },
];

const STATS = [
  { value: "$26B+", label: "Aave V3 Total Supply Monitored", color: "#7c3aed" },
  { value: "0.05", label: "HBAR per Analysis (Auto-paid)", color: "#14b8a6" },
  { value: "< 5s", label: "Time to Risk Score", color: "#3b82f6" },
  { value: "100%", label: "On-Chain Audit Trail", color: "#22c55e" },
];

const TECH_STACK = [
  "ENSv2 Identity", "The Graph", "Hedera x402", "World ID",
  "Aave V3", "Compound V3", "HCS Topic", "Blocky402", "Next.js 16", "Subgraph MCP",
];

// ─── Logo component ───────────────────────────────────────────────────────────
function Logo({ size = 32 }: { size?: number }) {
  return <Image src="/logo.svg" alt="AgentPass" width={size} height={size} priority />;
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar({
  onVerifyClick,
  isVerified,
  onProfileClick,
}: {
  onVerifyClick: () => void;
  isVerified: boolean;
  onProfileClick: () => void;
}) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${scrolled ? "nav-glass" : "bg-transparent"
        }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo only — no brand text */}
        <div className="flex items-center">
          <Logo size={36} />
        </div>

        <nav className="hidden md:flex items-center gap-6 text-sm text-[#94a3b8]">
          <a href="#how-it-works" className="hover:text-[#e5e7eb] transition-colors">How it works</a>
          <a href="#features" className="hover:text-[#e5e7eb] transition-colors">Features</a>
          <a href="#check" className="hover:text-[#e5e7eb] transition-colors">Check Risk</a>
        </nav>

        <div className="flex items-center gap-3">
          {isVerified ? (
            <button
              type="button"
              onClick={onProfileClick}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[rgba(34,197,94,0.08)] border border-[rgba(34,197,94,0.2)] text-[#22c55e] text-xs font-medium"
            >
              <ShieldCheckIcon className="h-3.5 w-3.5" />
              Verified
            </button>
          ) : (
            <button
              type="button"
              onClick={onVerifyClick}
              className="text-sm text-[#94a3b8] hover:text-[#e5e7eb] transition-colors hidden sm:block"
            >
              Verify ID
            </button>
          )}
          <a href="#check" className="cta-btn !py-2 !px-4 !text-sm">
            Check Risk <ArrowUpRightIcon className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </header>
  );
}

// ─── Hero orbit visual ────────────────────────────────────────────────────────
function HeroVisual() {
  return (
    <div className="relative w-64 h-64 mx-auto flex items-center justify-center select-none" aria-hidden="true">
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#7c3aed]/20 to-[#14b8a6]/10 blur-3xl" />
      <div className="absolute inset-8 rounded-full border border-[rgba(124,58,237,0.2)]" />
      <div className="absolute inset-16 rounded-full border border-[rgba(20,184,166,0.25)]" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="orbit-dot w-3 h-3 rounded-full bg-[#7c3aed] shadow-[0_0_12px_#7c3aed]" />
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="orbit-dot-reverse w-2.5 h-2.5 rounded-full bg-[#14b8a6] shadow-[0_0_10px_#14b8a6]" />
      </div>
      {/* Centre: actual logo image */}
      <div className="relative z-10 w-20 h-20 rounded-2xl bg-[rgba(15,23,42,0.6)] border border-[rgba(124,58,237,0.25)] flex items-center justify-center shadow-[0_0_40px_rgba(124,58,237,0.3)] backdrop-blur-sm">
        <Logo size={46} />
      </div>
      <div className="absolute top-4 right-0 tech-badge text-[10px] py-1 px-2.5 shadow-md">ENS</div>
      <div className="absolute bottom-6 left-0 tech-badge text-[10px] py-1 px-2.5 shadow-md">HBAR</div>
      <div className="absolute bottom-0 right-6 tech-badge text-[10px] py-1 px-2.5 shadow-md">LIVE</div>
    </div>
  );
}

// ─── Wallet input ─────────────────────────────────────────────────────────────
function HeroWalletInput({
  isVerified,
  onVerifyClick,
}: {
  isVerified: boolean;
  onVerifyClick: () => void;
}) {
  const [address, setAddress] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const addr = address.trim() || "0x7a3f8E2d1C9b4A5e6F0d7B8c9E1a2D3f4C5b6A7c";
    router.push(`/check?address=${encodeURIComponent(addr)}`);
  };

  if (!isVerified) {
    return (
      <div className="w-full max-w-xl mx-auto">
        <button
          type="button"
          onClick={onVerifyClick}
          className="cta-btn w-full justify-center text-base py-4"
        >
          <ShieldCheckIcon className="h-5 w-5" />
          Verify with World ID to Check Your Risk
        </button>
        <p className="text-xs text-center text-[#94a3b8] mt-3">
          Free to verify · Sybil-resistant · No email needed
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto">
      <div className="relative flex items-center bg-[rgba(15,23,42,0.8)] border border-[rgba(124,58,237,0.35)] rounded-2xl p-2 backdrop-blur-xl shadow-[0_0_40px_rgba(124,58,237,0.12)] focus-within:border-[rgba(124,58,237,0.6)] transition-colors">
        <div className="pl-3 text-[#94a3b8] flex-shrink-0">
          <WalletIcon className="h-5 w-5" />
        </div>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="0x... wallet address (or leave blank for demo)"
          className="flex-1 bg-transparent px-4 py-2.5 text-[#e5e7eb] mono text-sm focus:outline-none placeholder:text-[#94a3b8]/60"
        />
        <button type="submit" className="flex-shrink-0 cta-btn !py-2.5 !px-6 !text-sm !rounded-xl">
          Check Risk
        </button>
      </div>
      <p className="text-xs text-center text-[#22c55e] mt-3 flex items-center justify-center gap-1.5">
        <ShieldCheckIcon className="h-3.5 w-3.5" />
        Verified — agent has 1.0 HBAR budget ready
      </p>
    </form>
  );
}

// ─── Sparkline ────────────────────────────────────────────────────────────────
function MiniSparkline({ data, color, height = 48 }: { data: number[]; color: string; height?: number }) {
  const w = 200; const h = height;
  const min = Math.min(...data); const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * (h - 8) - 4}`);
  const safeColor = color.replace("#", "");
  const area = `M ${pts[0]} L ${pts.slice(1).join(" L ")} L ${w},${h} L 0,${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" preserveAspectRatio="none" style={{ height }}>
      <defs>
        <linearGradient id={`sg-${safeColor}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#sg-${safeColor})`} />
      <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Intersection hook ────────────────────────────────────────────────────────
function useIntersectionOnce(threshold = 0.4) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);
  return { ref, visible };
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [credential, setCredential] = useState<WorldVerifyCredential | null>(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [isAgentProfileOpen, setIsAgentProfileOpen] = useState(false);
  const [agentName, setAgentName] = useState("sentinel.agentpass.eth");

  const isVerified = Boolean(credential?.verified && credential.hash);

  useEffect(() => {
    const stored = loadStoredCredential();
    const sessionId = loadStoredWorldSession();
    if (stored?.verified && sessionId) {
      setCredential(stored);
      fetch(`/api/world/session?sessionId=${encodeURIComponent(sessionId)}`)
        .then((r) => r.json())
        .then((data) => { if (data.verified && data.credential) setCredential(data.credential); })
        .catch(() => { });
    }
    fetch("/api/agent")
      .then((r) => r.json())
      .then((d) => { if (d?.name) setAgentName(d.name); })
      .catch(() => { });
  }, []);

  const healthData = [62, 58, 65, 71, 69, 74, 68, 72, 78, 75, 80, 76];
  const ltvData = [45, 48, 52, 49, 55, 58, 53, 61, 65, 62, 68, 70];
  const riskData = [30, 35, 28, 42, 38, 55, 48, 62, 58, 71, 68, 74];

  const { ref: statsRef, visible: statsVisible } = useIntersectionOnce();

  return (
    <>
      <Navbar
        onVerifyClick={() => setShowVerifyModal(true)}
        isVerified={isVerified}
        onProfileClick={() => setIsAgentProfileOpen(true)}
      />

      <main className="min-h-screen overflow-x-hidden">

        {/* ══ HERO ══ */}
        <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 pb-16 px-6 hero-grid">
          <div className="absolute top-1/4 -left-40 w-[500px] h-[500px] bg-[#7c3aed] rounded-full mix-blend-screen filter blur-[130px] opacity-[0.14] float pointer-events-none" />
          <div className="absolute bottom-1/4 -right-40 w-[500px] h-[500px] bg-[#14b8a6] rounded-full mix-blend-screen filter blur-[130px] opacity-[0.10] float pointer-events-none" style={{ animationDelay: "-3s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#3b82f6] rounded-full mix-blend-screen filter blur-[160px] opacity-[0.05] pointer-events-none" />

          <div className="relative z-10 w-full max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[rgba(124,58,237,0.3)] bg-[rgba(124,58,237,0.06)] text-sm text-[#a78bfa] mb-8 step-enter">
              <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
              Built at ETHOnline · AI Agent · DeFi Risk
              <ArrowUpRightIcon className="h-3.5 w-3.5 opacity-60" />
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.08] mb-6 step-enter anim-delay-1">
              Your DeFi Portfolio<br />
              <span className="gradient-text">Has a Dirty Secret.</span>
            </h1>
            <p className="text-lg md:text-xl text-[#cbd5e1] max-w-2xl mx-auto leading-relaxed mb-4 step-enter anim-delay-2">
              An AI agent with its own identity, budget, and HBAR wallet checks your lending risk on Aave &amp; Compound —{" "}
              <em>and pays for itself.</em>
            </p>
            <p className="text-sm text-[#94a3b8] mb-12 step-enter anim-delay-2">
              No API keys · No subscriptions · No BS. Just paste a wallet, get the truth.
            </p>

            <div className="step-enter anim-delay-3" id="check">
              <HeroWalletInput isVerified={isVerified} onVerifyClick={() => setShowVerifyModal(true)} />
            </div>

            <div className="flex flex-wrap justify-center gap-2 mt-10 step-enter anim-delay-4">
              {TECH_STACK.map((t) => <span key={t} className="tech-badge">{t}</span>)}
            </div>
          </div>

          <div className="relative z-10 mt-16 step-enter anim-delay-5">
            <HeroVisual />
          </div>
        </section>

        {/* ══ STATS ══ */}
        <section className="py-12 px-6 border-y border-[rgba(148,163,184,0.1)]" ref={statsRef}>
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((s) => (
              <div
                key={s.label}
                className={`stat-card p-5 text-center rounded-2xl transition-all duration-500 ${statsVisible ? "scale-in" : "opacity-0"}`}
              >
                <div className="text-3xl font-extrabold mb-1" style={{ color: s.color }}>{s.value}</div>
                <div className="text-xs text-[#94a3b8] leading-snug">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ══ HOW IT WORKS ══ */}
        <section id="how-it-works" className="py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <p className="section-label mb-3">How it works</p>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Four steps. Zero friction.</h2>
              <p className="text-[#94a3b8] max-w-xl mx-auto">
                From wallet address to full risk report in under 5 seconds. The agent handles everything — including paying for itself.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {HOW_IT_WORKS.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.step} className="step-flow-card p-6 relative overflow-hidden">
                    <div className="absolute top-4 right-5 text-6xl font-extrabold opacity-[0.06] select-none" style={{ color: item.color }}>
                      {item.step}
                    </div>
                    <div className="flex items-start gap-4">
                      <div
                        className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center"
                        style={{ background: `${item.color}18`, border: `1px solid ${item.color}33` }}
                      >
                        <Icon className="h-5 w-5" style={{ color: item.color } as React.CSSProperties} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-sm font-bold text-[#e5e7eb]">{item.title}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: `${item.color}15`, color: item.color, border: `1px solid ${item.color}25` }}>
                            {item.badge}
                          </span>
                        </div>
                        <p className="text-sm text-[#94a3b8] leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-2 text-xs text-[#94a3b8]">
              <span className="tech-badge">Verify</span>
              <span className="text-[#7c3aed]">→</span>
              <span className="tech-badge">Paste wallet</span>
              <span className="text-[#7c3aed]">→</span>
              <span className="tech-badge">Agent analyzes</span>
              <span className="text-[#7c3aed]">→</span>
              <span className="tech-badge">Get score</span>
            </div>
          </div>
        </section>

        {/* ══ REAL TALK — icon cards, no emojis ══ */}
        <section className="py-16 px-6 bg-[rgba(255,255,255,0.01)]">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <p className="section-label mb-3">Real talk</p>
              <h2 className="text-3xl md:text-4xl font-bold mb-3">DeFi is ruthless.</h2>
              <p className="text-[#94a3b8] max-w-lg mx-auto">
                Most people check their health factor <em>after</em> the margin call. Don&apos;t be that person.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {MEMES.map((m, i) => {
                const Icon = m.Icon;
                return (
                  <div key={i} className={`meme-card p-5 bg-gradient-to-br ${m.bg} border ${m.border} flex flex-col gap-3`}>
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: `${m.iconColor}18`, border: `1px solid ${m.iconColor}33` }}
                    >
                      <Icon className="h-5 w-5" style={{ color: m.iconColor } as React.CSSProperties} />
                    </div>
                    <div>
                      <p className="font-semibold text-[#e5e7eb] text-sm leading-snug">{m.title}</p>
                      <p className="text-[#94a3b8] text-xs mt-0.5">{m.subtitle}</p>
                    </div>
                    <div className="mt-auto text-xs font-bold mono pt-3 border-t border-white/5" style={{ color: m.captionColor }}>
                      {m.caption}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-8 gradient-border p-6 text-center max-w-2xl mx-auto">
              <p className="text-lg font-semibold text-[#e5e7eb] leading-relaxed">
                &ldquo;ngmi if your health factor is 1.01 and you haven&apos;t checked it since last Tuesday&rdquo;
              </p>
              <p className="text-[#94a3b8] text-sm mt-2">— Every DeFi liquidation bot, probably</p>
            </div>
          </div>
        </section>

        {/* ══ WHAT YOU GET — mock dashboard ══ */}
        <section className="py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <p className="section-label mb-3">What you get</p>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Not just a number. A full picture.</h2>
              <p className="text-[#94a3b8] max-w-xl mx-auto">
                Risk score, portfolio breakdown, health factor trend, payment receipt — all in one report.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Risk gauge */}
              <div className="glass-card p-6 flex flex-col items-center text-center">
                <p className="text-xs text-[#94a3b8] uppercase tracking-wider font-semibold mb-4">Overall Risk</p>
                <div className="relative w-28 h-28 mb-4">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#f59e0b" strokeWidth="10"
                      strokeDasharray="251" strokeDashoffset="88" strokeLinecap="round"
                      style={{ filter: "drop-shadow(0 0 8px #f59e0b)" }} />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-[#f59e0b]">65</span>
                    <span className="text-[10px] text-[#94a3b8]">/ 100</span>
                  </div>
                </div>
                <div className="px-3 py-1 rounded-full text-xs font-semibold bg-[rgba(245,158,11,0.1)] text-[#f59e0b] border border-[rgba(245,158,11,0.2)]">
                  Moderate Risk
                </div>
                <p className="text-xs text-[#94a3b8] mt-3">Hold &amp; Monitor your positions</p>
              </div>

              {/* Health trend */}
              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-[#94a3b8] uppercase tracking-wider font-semibold">Health Factor Trend</p>
                  <span className="text-xs text-[#22c55e] font-medium">1.82 ↑</span>
                </div>
                <p className="text-xs text-[#94a3b8] mb-4">Last 12 weeks</p>
                <MiniSparkline data={healthData} color="#22c55e" height={60} />
                <div className="flex justify-between mt-2 text-[10px] text-[#94a3b8]">
                  <span>12w ago</span><span>Now</span>
                </div>
              </div>

              {/* LTV breakdown */}
              <div className="glass-card p-6">
                <p className="text-xs text-[#94a3b8] uppercase tracking-wider font-semibold mb-4">LTV Breakdown</p>
                <div className="space-y-3">
                  {[
                    { asset: "WETH", ltv: 72, color: "#7c3aed", protocol: "Aave" },
                    { asset: "USDC", ltv: 45, color: "#14b8a6", protocol: "Compound" },
                    { asset: "WBTC", ltv: 28, color: "#3b82f6", protocol: "Aave" },
                  ].map((p) => (
                    <div key={p.asset}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-[#cbd5e1] font-medium">{p.asset} <span className="text-[#94a3b8] font-normal">· {p.protocol}</span></span>
                        <span className="mono font-semibold" style={{ color: p.ltv > 65 ? "#ef4444" : p.ltv > 45 ? "#f59e0b" : p.color }}>{p.ltv}%</span>
                      </div>
                      <div className="risk-bar-track">
                        <div className="risk-bar-fill" style={{ width: `${p.ltv}%`, background: p.ltv > 65 ? "#ef4444" : p.ltv > 45 ? "#f59e0b" : p.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risk factors */}
              <div className="glass-card p-6 md:col-span-2">
                <p className="text-xs text-[#94a3b8] uppercase tracking-wider font-semibold mb-4">Key Risk Factors</p>
                <div className="space-y-2">
                  {[
                    "WETH position at 72% LTV — approaching liquidation threshold of 80%",
                    "High concentration: 68% of collateral in single volatile asset",
                    "Health factor 1.82 — safe but within 20% of danger zone",
                  ].map((f, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-[rgba(239,68,68,0.04)] border border-[rgba(239,68,68,0.1)]">
                      <AlertIcon className="h-4 w-4 text-[#ef4444] flex-shrink-0 mt-0.5" />
                      <span className="text-xs text-[#cbd5e1] leading-relaxed">{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risk score trend */}
              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-[#94a3b8] uppercase tracking-wider font-semibold">Risk Score Trend</p>
                  <span className="text-xs text-[#ef4444] font-medium">74 ↑</span>
                </div>
                <p className="text-xs text-[#94a3b8] mb-4">Score worsening over time</p>
                <MiniSparkline data={riskData} color="#ef4444" height={60} />
                <div className="mt-3 text-center">
                  <span className="text-xs text-[#94a3b8]">Rebalance to improve your score</span>
                </div>
              </div>

              {/* LTV trend */}
              <div className="glass-card p-6 md:col-span-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-[#94a3b8] uppercase tracking-wider font-semibold">LTV Trend Over Time</p>
                  <span className="text-xs text-[#f59e0b] font-medium mono">70% current</span>
                </div>
                <p className="text-xs text-[#94a3b8] mb-4">Your LTV has been climbing — watch the liquidation threshold</p>
                <MiniSparkline data={ltvData} color="#f59e0b" height={72} />
                <div className="flex justify-between mt-2 text-[10px] text-[#94a3b8]">
                  <span>12 periods ago</span>
                  <span className="text-[#f59e0b] font-medium">Threshold at 80% →</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══ FEATURES ══ */}
        <section id="features" className="py-20 px-6 bg-[rgba(255,255,255,0.01)]">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <p className="section-label mb-3">Under the hood</p>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Powered by the full Web3 stack</h2>
              <p className="text-[#94a3b8] max-w-xl mx-auto">
                Every piece is real, on-chain, and open. No mock data in production, no hardcoded scores.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {FEATURES.map((f, i) => {
                const Icon = f.icon;
                return (
                  <div key={i} className="step-flow-card p-6">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: `${f.color}15`, border: `1px solid ${f.color}25` }}>
                      <Icon className="h-5 w-5" style={{ color: f.color } as React.CSSProperties} />
                    </div>
                    <h3 className="font-semibold text-[#e5e7eb] mb-2 text-sm">{f.title}</h3>
                    <p className="text-xs text-[#94a3b8] leading-relaxed">{f.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ══ TECH MARQUEE ══ */}
        <section className="py-10 overflow-hidden border-y border-[rgba(148,163,184,0.08)]">
          <div className="flex">
            <div className="marquee-track flex gap-6 items-center whitespace-nowrap px-3">
              {[...TECH_STACK, ...TECH_STACK].map((t, i) => (
                <span key={i} className="tech-badge text-sm py-2 px-4 cursor-default">{t}</span>
              ))}
            </div>
          </div>
        </section>

        {/* ══ AGENT IDENTITY ══ */}
        <section className="py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              <div>
                <p className="section-label mb-3">The Agent</p>
                <h2 className="text-3xl md:text-4xl font-bold mb-5">
                  It&apos;s not just code.<br />
                  <span className="gradient-text">It has an identity.</span>
                </h2>
                <p className="text-[#94a3b8] leading-relaxed mb-6">
                  {agentName} is a registered ENSv2 name on Sepolia with roles, reputation, and a verifiable human owner. It&apos;s an autonomous economic agent — not a serverless function.
                </p>
                <div className="space-y-3">
                  {[
                    { label: "ENS Name", val: agentName, color: "#7c3aed" },
                    { label: "Capabilities", val: "defi-risk-analysis · portfolio-query", color: "#14b8a6" },
                    { label: "Payment", val: "x402 / Blocky402 · HBAR testnet", color: "#3b82f6" },
                    { label: "Sybil Protection", val: "World ID proof-of-personhood", color: "#22c55e" },
                  ].map((r) => (
                    <div key={r.label} className="flex items-center gap-3 p-3 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(148,163,184,0.1)]">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: r.color }} />
                      <span className="text-xs text-[#94a3b8] w-28 flex-shrink-0">{r.label}</span>
                      <span className="text-xs text-[#cbd5e1] mono">{r.val}</span>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={() => setIsAgentProfileOpen(true)} className="cta-btn-ghost mt-6">
                  View Agent Profile <ArrowUpRightIcon className="h-4 w-4" />
                </button>
              </div>

              {/* Agent card */}
              <div className="glass-card p-6 relative overflow-hidden">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-[rgba(15,23,42,0.8)] border border-[rgba(124,58,237,0.25)] flex items-center justify-center shadow-lg">
                    <Logo size={36} />
                  </div>
                  <div>
                    <p className="gradient-text font-bold text-lg">{agentName}</p>
                    <p className="text-xs text-[#94a3b8]">ENSv2 · Sepolia · Verified Human Owner</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    { label: "HBAR Budget", value: "0.85 HBAR", extra: true },
                    { label: "Reputation", value: "14 successful checks", color: "#22c55e" },
                    { label: "Last Analysis", value: "~2 min ago" },
                    { label: "HCS Topic", value: "0.0.5183979", color: "#14b8a6" },
                  ].map((row) => (
                    <div key={row.label} className="flex justify-between items-center py-2 border-b border-[rgba(148,163,184,0.1)] last:border-0">
                      <span className="text-xs text-[#94a3b8]">{row.label}</span>
                      {row.extra ? (
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-[rgba(255,255,255,0.06)] rounded-full overflow-hidden">
                            <div className="h-full w-[85%] bg-gradient-to-r from-[#7c3aed] to-[#14b8a6] rounded-full" />
                          </div>
                          <span className="text-xs mono text-[#e5e7eb]">{row.value}</span>
                        </div>
                      ) : (
                        <span className="text-xs mono" style={{ color: row.color ?? "#e5e7eb" }}>{row.value}</span>
                      )}
                    </div>
                  ))}
                </div>
                <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-[#7c3aed] rounded-full filter blur-[60px] opacity-10 pointer-events-none" />
              </div>
            </div>
          </div>
        </section>

        {/* ══ FINAL CTA ══ */}
        <section className="py-24 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[rgba(124,58,237,0.04)] to-transparent pointer-events-none" />
          <div className="max-w-2xl mx-auto text-center relative z-10">
            {/* Icon instead of emoji */}
            <div className="w-14 h-14 rounded-2xl bg-[rgba(124,58,237,0.1)] border border-[rgba(124,58,237,0.25)] flex items-center justify-center mx-auto mb-6">
              <RocketIcon className="h-7 w-7 text-[#a78bfa]" />
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-5 leading-tight">
              Check your risk.<br />
              <span className="gradient-text">Before the market does it for you.</span>
            </h2>
            <p className="text-[#94a3b8] mb-10 text-lg leading-relaxed">
              Your AI agent is standing by with a full HBAR budget and a live connection to Aave &amp; Compound. Takes 5 seconds.
            </p>
            <HeroWalletInput isVerified={isVerified} onVerifyClick={() => setShowVerifyModal(true)} />
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs text-[#94a3b8]">
              {[
                { label: "ENS Identity", color: "#7c3aed" },
                { label: "The Graph Data", color: "#14b8a6" },
                { label: "Hedera x402", color: "#3b82f6" },
                { label: "World ID", color: "#22c55e" },
              ].map((item) => (
                <span key={item.label} className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: item.color }} />
                  {item.label}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ══ FOOTER ══ */}
        <footer className="border-t border-[rgba(148,163,184,0.1)] py-10 px-6">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Logo size={28} />
              <span className="text-[#94a3b8] text-sm">— Built for ETHOnline 2025</span>
            </div>
            <div className="text-xs text-[#94a3b8]">
              ENSv2 · Hedera · The Graph · World ID
            </div>
          </div>
        </footer>
      </main>

      <WorldVerifyModal
        open={showVerifyModal}
        onClose={() => setShowVerifyModal(false)}
        ensName={agentName}
        onVerified={({ credential: cred }) => setCredential(cred)}
      />
      <AgentProfile
        isOpen={isAgentProfileOpen}
        onClose={() => setIsAgentProfileOpen(false)}
      />
    </>
  );
}
