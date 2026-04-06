import { useState } from "react";
import { ChevronLeft, ChevronRight, ExternalLink, Globe, Briefcase, LayoutDashboard, Shield, UserCheck, MapPin, Calendar, User, Phone, Mail, Home, Truck, CheckCircle2, X, Layers } from "lucide-react";
import { useNavigate } from "react-router-dom";

// ─── Platform screens ─────────────────────────────────────────────────────────
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
    desc: "Platform-level admin view — manage all agents, buyers/sellers, billing status, and platform-wide settings.",
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
    desc: "The agent adds a buyer or seller in their portal — just name, email, phone, and role. No move details needed at this stage.",
    demoData: [
      { icon: User,     label: "Name",   value: "Sarah Johnson" },
      { icon: Mail,     label: "Email",  value: "sarah.j@gmail.com" },
      { icon: Phone,    label: "Phone",  value: "(617) 555-0182" },
      { icon: Home,     label: "Role",   value: "Buyer" },
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
      { icon: Mail,         label: "From",      value: "Prestige Realty (via EZ Move AI)" },
      { icon: User,         label: "To",        value: "sarah.j@gmail.com" },
      { icon: CheckCircle2, label: "Pre-filled", value: "Address · Close date · Miles" },
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
      { icon: Home,     label: "New Address", value: "47 Maple Dr, Newton, MA 02458  ✅" },
      { icon: Calendar, label: "Close Date",  value: "June 27, 2026  ✅" },
      { icon: User,     label: "Name",        value: "Sarah Johnson  ✅" },
      { icon: Phone,    label: "Phone",       value: "(617) 555-0182 — SMS opt-in" },
    ],
    color: "from-emerald-600 to-emerald-900",
    badgeColor: "bg-emerald-600",
    badge: "Step 3",
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

const NAV_ITEMS = [
  ...PLATFORM_SCREENS.map(s => ({ type: "platform", data: s })),
  ...CLIENT_STEPS.map(s => ({ type: "client", data: s })),
];

// ─── Overview modules ─────────────────────────────────────────────────────────
const OVERVIEW_MODULES = [
  { icon: Globe,           label: "Sales Website",        desc: "Public marketing landing page",                badge: "Marketing", color: "bg-slate-700",   url: "/Home" },
  { icon: LayoutDashboard, label: "Demo Experience",         desc: "Full 5-step buyer/seller move flow walkthrough",   badge: "Demo",      color: "bg-orange-600",  action: "demo" },
  { icon: UserCheck,       label: "Agent Portal",           desc: "Add buyers/sellers, track billing & move progress", badge: "Agent",     color: "bg-blue-600",    url: "/AgentDashboard",  requiresAuth: true },
  { icon: Briefcase,       label: "Broker Portal",          desc: "Firm-wide buyer/seller management",                badge: "Broker",    color: "bg-purple-600",  url: "/BrokerDashboard", requiresAuth: true },
  { icon: Shield,          label: "Super Admin Portal",     desc: "Platform-level control & reporting",               badge: "Admin",     color: "bg-red-600",     url: "/SuperAdmin",      requiresAuth: true },
  { icon: Home,            label: "Buyer/Seller Dashboard", desc: "Buyer/Seller move plan, AI tools & task checklist", badge: "Buyer/Seller", color: "bg-emerald-600", url: "/Dashboard", requiresAuth: true },
];

// ─── Helper components ────────────────────────────────────────────────────────
const DataRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3 py-2 border-b border-white/10 last:border-0">
    <Icon className="w-4 h-4 text-white/50 flex-shrink-0" />
    <span className="text-white/50 text-xs w-24 flex-shrink-0">{label}</span>
    <span className="text-white font-semibold text-sm">{value}</span>
  </div>
);

function SummaryOverview({ onStartDemo }) {
  return (
    <div className="flex-1 overflow-y-auto px-4 pt-5 pb-8 max-w-lg mx-auto w-full">
      <div className="w-full bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-6 border border-white/10 shadow-2xl mb-4">
        <div className="flex items-center gap-2 mb-1">
          <Layers className="w-5 h-5 text-orange-400" />
          <h2 className="font-black text-white text-xl">All Modules</h2>
        </div>
        <p className="text-slate-400 text-xs mb-5">Every section of EZ Move AI — tap Open to visit or Start to walk through the demo.</p>
        <div className="space-y-3">
          {OVERVIEW_MODULES.map(m => {
            const Icon = m.icon;
            return (
              <div key={m.label} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
                <div className={`w-10 h-10 ${m.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-white text-sm">{m.label}</p>
                    <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full text-white ${m.color}`}>{m.badge}</span>
                    {m.requiresAuth && <span className="text-[9px] text-slate-500">🔒 login required</span>}
                  </div>
                  <p className="text-slate-400 text-xs leading-tight">{m.desc}</p>
                </div>
                {m.action === "demo" ? (
                  <button onClick={onStartDemo}
                    className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all">
                    Start <ChevronRight className="w-3 h-3" />
                  </button>
                ) : m.url ? (
                  <a href={m.url} target="_blank" rel="noreferrer"
                    className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/10">
                    Open <ExternalLink className="w-3 h-3" />
                  </a>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
      <button onClick={onStartDemo}
        className="w-full py-4 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-black text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-900/40">
        Start Demo Experience <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}

function PlatformCard({ screen }) {
  const Icon = screen.icon;
  const actions = screen.actions || (screen.url ? [{ label: screen.urlLabel || "Open →", url: screen.url }] : []);
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
          <p className="text-white/70 text-xs"><span className="text-white font-bold">Login required</span> to open this page.</p>
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

function ClientStepCard({ step, onNext }) {
  const navigate = useNavigate();
  return (
    <div className={`w-full bg-gradient-to-br ${step.color} rounded-3xl p-7 border border-white/10 shadow-2xl ${step.highlight ? "ring-2 ring-blue-400/40" : ""}`}>
      <div className="flex items-center gap-3 mb-1">
        <span className="text-3xl">{step.emoji}</span>
        <div>
          <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full text-white ${step.badgeColor}`}>{step.badge} — Buyer/Seller Flow</span>
          <h2 className="font-black text-white text-xl mt-0.5">{step.title}</h2>
        </div>
      </div>
      <p className="text-white/70 text-sm leading-relaxed mt-3 mb-4">{step.desc}</p>

      {step.demoData && (
        <div className="bg-white/10 rounded-2xl px-4 py-1 mb-4 border border-white/10">
          {step.demoData.map((row, i) => <DataRow key={i} {...row} />)}
        </div>
      )}
      {step.preview && (
        <div className="bg-white/10 rounded-2xl px-4 py-3 mb-4 border border-white/10">
          <pre className="text-white/80 text-xs leading-relaxed whitespace-pre-wrap font-sans">{step.preview}</pre>
        </div>
      )}
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

      {step.url && (
        <button onClick={() => navigate(step.url)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-sm transition-all border border-white/20">
          {step.urlLabel || "Open →"} <ChevronRight className="w-3.5 h-3.5" />
        </button>
      )}
      {!step.url && (
        <button onClick={onNext}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/25 hover:bg-white/35 text-white font-bold text-sm transition-all border border-white/30">
          Next Step <ChevronRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function Preview() {
  const [showOverview, setShowOverview] = useState(true);
  const [idx, setIdx] = useState(0);
  const navigate = useNavigate();

  const current = NAV_ITEMS[idx];
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
        <p className="text-slate-500 text-xs">
          {showOverview ? "All platform modules at a glance" : "Flip through platform screens + full client demo flow"}
        </p>
        <button onClick={() => navigate("/Home")} className="absolute right-4 top-4 w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all" title="Exit Preview">
          <X className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {/* Overview — default/first screen */}
      {showOverview ? (
        <SummaryOverview onStartDemo={() => { setIdx(0); setShowOverview(false); }} />
      ) : (
        <>
          {/* Section tabs */}
          <div className="flex border-b border-white/10 flex-shrink-0">
            <button onClick={() => setIdx(0)}
              className={`flex-1 py-2.5 text-xs font-bold transition-all ${!isClientSection ? "text-orange-400 border-b-2 border-orange-400" : "text-slate-500 hover:text-slate-300"}`}>
              Platform Screens
            </button>
            <button onClick={() => setIdx(PLATFORM_SCREENS.length)}
              className={`flex-1 py-2.5 text-xs font-bold transition-all ${isClientSection ? "text-orange-400 border-b-2 border-orange-400" : "text-slate-500 hover:text-slate-300"}`}>
              Buyer/Seller Demo (5 steps)
            </button>
          </div>

          {/* Card area */}
          <div className="flex-1 flex flex-col items-center justify-start px-4 pt-4 pb-4 max-w-lg mx-auto w-full">
            <button onClick={() => setShowOverview(true)}
              className="self-start mb-3 flex items-center gap-1 text-slate-400 hover:text-white text-xs font-bold transition-colors">
              <ChevronLeft className="w-3.5 h-3.5" /> All Modules
            </button>

            {current.type === "platform"
              ? <PlatformCard screen={current.data} />
              : <ClientStepCard step={current.data} onNext={() => setIdx(i => Math.min(NAV_ITEMS.length - 1, i + 1))} />
            }

            <p className="text-slate-500 text-xs mt-4 font-semibold">
              {isClientSection
                ? `Client step ${idx - PLATFORM_SCREENS.length + 1} of ${CLIENT_STEPS.length}`
                : `Platform screen ${idx + 1} of ${PLATFORM_SCREENS.length}`}
            </p>

            <div className="flex justify-center gap-1.5 mt-3 mb-4">
              {NAV_ITEMS.map((_, i) => (
                <button key={i} onClick={() => setIdx(i)}
                  className={`h-2 rounded-full transition-all ${i === idx ? "bg-orange-500 w-5" : "bg-slate-700 hover:bg-slate-500 w-2"}`} />
              ))}
            </div>

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
        </>
      )}
    </div>
  );
}