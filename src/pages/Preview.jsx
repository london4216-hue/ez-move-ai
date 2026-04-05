import { useState } from "react";
import { ChevronLeft, ChevronRight, ExternalLink, Globe, Briefcase, LayoutDashboard, Shield, UserCheck, MapPin, Calendar, User, Phone, Mail, Home, Truck, CheckCircle2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

// ─── Non-client screens ───────────────────────────────────────────────────────
const PLATFORM_SCREENS = [
  {
    icon: Globe,
    badge: "Marketing",
    badgeColor: "bg-slate-600",
    color: "from-slate-700 to-slate-800",
    title: "Sales Website",
    desc: "Public-facing marketing page with hero copy, pricing calculator, and login buttons for agents and brokers.",
    url: "/Home",
  },
  {
    icon: UserCheck,
    badge: "Agent / Broker",
    badgeColor: "bg-purple-600",
    color: "from-purple-700 to-purple-900",
    title: "Agent & Broker Portals",
    desc: "Agents and broker firms log in to add clients, send invite links, track billing, and monitor move progress.",
    actions: [
      { label: "Agent Portal", url: "/AgentDashboard" },
      { label: "Broker Portal", url: "/BrokerDashboard" },
    ],
    requiresAuth: true,
  },
  {
    icon: Shield,
    badge: "Admin",
    badgeColor: "bg-red-600",
    color: "from-red-700 to-red-900",
    title: "Super Admin",
    desc: "Platform-level admin view — manage all agents, clients, billing status, and platform-wide settings.",
    url: "/SuperAdmin",
    requiresAuth: true,
  },
];

// ─── Client demo flow steps ───────────────────────────────────────────────────
const CLIENT_STEPS = [
  {
    step: 1,
    emoji: "📤",
    title: "Agent Sends Invite",
    desc: "The agent fills out the client form in their portal. All property details are pre-filled — the client never has to enter them.",
    demoData: [
      { icon: User,     label: "Client",       value: "Sarah Johnson" },
      { icon: Mail,     label: "Email",        value: "sarah.j@gmail.com" },
      { icon: Phone,    label: "Phone",        value: "(617) 555-0182" },
      { icon: Home,     label: "Moving TO",    value: "47 Maple Dr, Newton, MA 02458" },
      { icon: Truck,    label: "Moving FROM",  value: "12 Elm St, Boston, MA 02115" },
      { icon: Calendar, label: "Close Date",   value: "June 27, 2026" },
      { icon: MapPin,   label: "Est. Miles",   value: "~11 miles" },
    ],
    color: "from-purple-700 to-purple-900",
    badgeColor: "bg-purple-600",
    badge: "Step 1",
    url: "/AgentDashboard",
    urlLabel: "Open Agent Portal",
  },
  {
    step: 2,
    emoji: "📧",
    title: "Client Gets Invite Email",
    desc: "Sarah receives a branded email with a personalized invite link. One click opens her registration — address & close date already filled in.",
    demoData: [
      { icon: Mail,     label: "From",         value: "Prestige Realty (via EZ Move AI)" },
      { icon: User,     label: "To",           value: "sarah.j@gmail.com" },
      { icon: CheckCircle2, label: "Pre-filled",value: "Address · Close date · Miles" },
    ],
    preview: `Hi Sarah,\n\nPrestige Realty has invited you to EZ Move AI — your personal step-by-step moving assistant.\n\nYour property at 47 Maple Dr, Newton is already set up. Just tap below to get started!\n\n[Get Started →]`,
    color: "from-orange-600 to-orange-800",
    badgeColor: "bg-orange-500",
    badge: "Step 2",
    url: "/Register?code=DEMO",
    urlLabel: "See Registration Page →",
    requiresAuth: true,
  },
  {
    step: 3,
    emoji: "📝",
    title: "Client Registers (30 seconds)",
    desc: "Sarah opens her invite link. Her address and close date are already filled in by her agent. She just confirms her name and phone.",
    demoData: [
      { icon: Home,     label: "New Address",  value: "47 Maple Dr, Newton, MA 02458  ✅" },
      { icon: Calendar, label: "Close Date",   value: "June 27, 2026  ✅" },
      { icon: User,     label: "Name",         value: "Sarah Johnson  ✅" },
      { icon: Phone,    label: "Phone",        value: "(617) 555-0182 — SMS opt-in" },
    ],
    color: "from-emerald-600 to-emerald-900",
    badgeColor: "bg-emerald-600",
    badge: "Step 3",
    url: "/Register?code=DEMO",
    urlLabel: "Try Registration Demo →",
    requiresAuth: true,
  },
  {
    step: 4,
    emoji: "🏠",
    title: "Week 1 Setup Wizard",
    desc: "After registering, Sarah goes through a guided 3-minute onboarding — she sorts her stuff, answers mover questions, and gets an AI move estimate.",
    bullets: [
      "Stays vs. Goes — mark each room item",
      "AI generates weight, truck size & cost estimate",
      "Finds & saves local movers to her contacts",
      "Adds walkthrough date & lawyer info",
    ],
    color: "from-amber-600 to-amber-800",
    badgeColor: "bg-amber-500",
    badge: "Step 4",
    url: "/Dashboard",
    urlLabel: "Walkthrough Questions →",
    requiresAuth: true,
  },
  {
    step: 5,
    emoji: "📱",
    title: "Sarah's Move Dashboard",
    desc: "Her personalized command center. Week-by-week task checklist, AI assistant, inventory tracker, contacts & calendar — all in one place.",
    bullets: [
      "83 days until closing — countdown ticker",
      "Week-by-week move checklist (auto-generated)",
      "AI tools: neighborhood research, food finder, quote generator",
      "My Stuff inventory with move/donate/junk lists",
      "Appointments & contacts pre-loaded from setup",
    ],
    color: "from-blue-600 to-blue-900",
    badgeColor: "bg-blue-600",
    badge: "Step 5",
    url: "/Dashboard",
    urlLabel: "Open Live Dashboard →",
    highlight: true,
    requiresAuth: true,
  },
];

const DataRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3 py-2 border-b border-white/10 last:border-0">
    <Icon className="w-4 h-4 text-white/50 flex-shrink-0" />
    <span className="text-white/50 text-xs w-24 flex-shrink-0">{label}</span>
    <span className="text-white font-semibold text-sm">{value}</span>
  </div>
);

function PlatformCard({ screen, onOpen }) {
  const Icon = screen.icon;
  const actions = screen.actions || (screen.url ? [{ label: screen.urlLabel || `Open →`, url: screen.url }] : []);
  return (
    <div className={`w-full bg-gradient-to-br ${screen.color} rounded-3xl p-7 border border-white/10 shadow-2xl`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-white/15 rounded-2xl flex items-center justify-center">
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full text-white ${screen.badgeColor}`}>{screen.badge}</span>
          <h2 className="font-black text-white text-xl mt-0.5">{screen.title}</h2>
        </div>
      </div>
      <p className="text-white/70 text-sm leading-relaxed mb-5">{screen.desc}</p>
      {screen.requiresAuth && (
        <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 mb-4">
          <span className="text-lg">🔒</span>
          <p className="text-white/70 text-xs"><span className="text-white font-bold">Login required</span> to open this page — use <span className="text-white font-bold">Next →</span> below to keep browsing the preview.</p>
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {actions.map((a, i) => (
          <a key={i} href={a.url} target="_blank" rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-sm transition-all border border-white/20">
            {a.label} <ExternalLink className="w-3.5 h-3.5" />
          </a>
        ))}
      </div>
    </div>
  );
}

function ClientStepCard({ step }) {
  return (
    <div className={`w-full bg-gradient-to-br ${step.color} rounded-3xl p-7 border border-white/10 shadow-2xl ${step.highlight ? "ring-2 ring-blue-400/40" : ""}`}>
      <div className="flex items-center gap-3 mb-1">
        <span className="text-3xl">{step.emoji}</span>
        <div>
          <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full text-white ${step.badgeColor}`}>{step.badge} — Client Flow</span>
          <h2 className="font-black text-white text-xl mt-0.5">{step.title}</h2>
        </div>
      </div>
      <p className="text-white/70 text-sm leading-relaxed mt-3 mb-4">{step.desc}</p>

      {/* Data rows */}
      {step.demoData && (
        <div className="bg-white/10 rounded-2xl px-4 py-1 mb-4 border border-white/10">
          {step.demoData.map((row, i) => <DataRow key={i} {...row} />)}
        </div>
      )}

      {/* Email preview */}
      {step.preview && (
        <div className="bg-white/10 rounded-2xl px-4 py-3 mb-4 border border-white/10">
          <pre className="text-white/80 text-xs leading-relaxed whitespace-pre-wrap font-sans">{step.preview}</pre>
        </div>
      )}

      {/* Bullet points */}
      {step.bullets && (
        <div className="space-y-1.5 mb-4">
          {step.bullets.map((b, i) => (
            <div key={i} className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-white/50 flex-shrink-0" />
              <span className="text-white/80 text-sm">{b}</span>
            </div>
          ))}
        </div>
      )}

      {step.requiresAuth && (
        <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 mb-3">
          <span className="text-lg">🔒</span>
          <p className="text-white/70 text-xs"><span className="text-white font-bold">Login required</span> to open this live page — use <span className="text-white font-bold">Next →</span> below to continue the preview without signing in.</p>
        </div>
      )}
      {step.url && (
        <a href={step.url} target="_blank" rel="noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-sm transition-all border border-white/20">
          {step.urlLabel || "Open →"} <ExternalLink className="w-3.5 h-3.5" />
        </a>
      )}
    </div>
  );
}

// Combined ordered list: platform screens first, then client flow
const ALL_SECTIONS = [
  { type: "header", label: "Platform Screens" },
  ...PLATFORM_SCREENS.map(s => ({ type: "platform", data: s })),
  { type: "header", label: "Client Demo Flow (5 steps)" },
  ...CLIENT_STEPS.map(s => ({ type: "client", data: s })),
];

// Filter out header items for navigation
const NAV_ITEMS = ALL_SECTIONS.filter(s => s.type !== "header");

export default function Preview() {
  const [idx, setIdx] = useState(0);
  const current = NAV_ITEMS[idx];
  const navigate = useNavigate();

  const isClientSection = idx >= PLATFORM_SCREENS.length;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Header */}
      <div className="relative px-6 py-4 border-b border-white/10 flex-shrink-0 text-center">
        <div className="flex items-center justify-center gap-2 mb-0.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
            <span className="text-white font-black text-xs">EZ</span>
          </div>
          <p className="font-black text-white text-lg">EZ Move AI <span className="text-slate-400 font-normal text-sm">· App Preview</span></p>
        </div>
        <p className="text-slate-500 text-xs">Flip through platform screens + full client demo flow</p>
        <button onClick={() => navigate("/Home")} className="absolute right-4 top-4 w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all" title="Exit Preview">
          <X className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {/* Section tabs */}
      <div className="flex border-b border-white/10 flex-shrink-0">
        <button onClick={() => setIdx(0)}
          className={`flex-1 py-2.5 text-xs font-bold transition-all ${!isClientSection ? "text-orange-400 border-b-2 border-orange-400" : "text-slate-500 hover:text-slate-300"}`}>
          Platform Screens
        </button>
        <button onClick={() => setIdx(PLATFORM_SCREENS.length)}
          className={`flex-1 py-2.5 text-xs font-bold transition-all ${isClientSection ? "text-orange-400 border-b-2 border-orange-400" : "text-slate-500 hover:text-slate-300"}`}>
          Client Demo (5 steps)
        </button>
      </div>

      {/* Card */}
      <div className="flex-1 flex flex-col items-center justify-start px-4 pt-5 pb-4 max-w-lg mx-auto w-full">
        {current.type === "platform"
          ? <PlatformCard screen={current.data} />
          : <ClientStepCard step={current.data} />
        }

        {/* Counter */}
        <p className="text-slate-500 text-xs mt-4 font-semibold">
          {isClientSection
            ? `Client step ${idx - PLATFORM_SCREENS.length + 1} of ${CLIENT_STEPS.length}`
            : `Platform screen ${idx + 1} of ${PLATFORM_SCREENS.length}`}
        </p>

        {/* Dots */}
        <div className="flex justify-center gap-1.5 mt-3 mb-4">
          {NAV_ITEMS.map((_, i) => (
            <button key={i} onClick={() => setIdx(i)}
              className={`h-2 rounded-full transition-all ${i === idx ? "bg-orange-500 w-5" : "bg-slate-700 hover:bg-slate-500 w-2"}`} />
          ))}
        </div>

        {/* Prev / Next */}
        <div className="flex gap-3">
          <button onClick={() => setIdx(i => Math.max(0, i - 1))} disabled={idx === 0}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm disabled:opacity-25 disabled:cursor-not-allowed transition-all border border-white/10">
            <ChevronLeft className="w-5 h-5" /> Back
          </button>
          <button onClick={() => setIdx(i => Math.min(NAV_ITEMS.length - 1, i + 1))} disabled={idx === NAV_ITEMS.length - 1}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm disabled:opacity-25 disabled:cursor-not-allowed transition-all shadow-lg shadow-orange-900/40">
            Next <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}