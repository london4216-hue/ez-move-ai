import { useState } from "react";
import { ChevronLeft, ChevronRight, ExternalLink, Globe, Briefcase, Play, LogIn, LayoutDashboard, Shield, UserCheck } from "lucide-react";

const SCREENS = [
  {
    icon: Globe,
    badge: "Marketing",
    badgeColor: "bg-slate-600",
    color: "from-slate-700 to-slate-800",
    title: "Sales Website",
    desc: "The public-facing marketing page. Contains hero copy, pricing, and login buttons for agents/brokers.",
    url: "/Home",
    actions: [{ label: "Open Sales Site", url: "/Home" }],
  },
  {
    icon: UserCheck,
    badge: "Agent",
    badgeColor: "bg-purple-600",
    color: "from-purple-700 to-purple-900",
    title: "Agent Portal",
    desc: "Agents log in here to manage clients, send invite links, track billing, and view move progress.",
    url: "/AgentDashboard",
    actions: [{ label: "Open Agent Portal", url: "/AgentDashboard" }],
  },
  {
    icon: Briefcase,
    badge: "Broker",
    badgeColor: "bg-indigo-600",
    color: "from-indigo-700 to-indigo-900",
    title: "Broker Dashboard",
    desc: "Broker firms manage multiple agents, onboard clients in bulk, and track firm-wide revenue.",
    url: "/BrokerDashboard",
    actions: [{ label: "Open Broker Portal", url: "/BrokerDashboard" }],
  },
  {
    icon: Play,
    badge: "Demo",
    badgeColor: "bg-orange-500",
    color: "from-orange-500 to-orange-700",
    title: "Client Registration Demo",
    desc: "Full client onboarding flow — invite code entry, address setup, close date, and Week 1 setup wizard.",
    url: "/Register?code=DEMO",
    actions: [{ label: "Start Demo", url: "/Register?code=DEMO" }],
    highlight: true,
  },
  {
    icon: LayoutDashboard,
    badge: "Real App",
    badgeColor: "bg-blue-600",
    color: "from-blue-600 to-blue-900",
    title: "Client Move Dashboard",
    desc: "The live dashboard for registered clients. Week-by-week checklist, AI tools, inventory, contacts & calendar.",
    url: "/Dashboard",
    actions: [{ label: "Open Dashboard", url: "/Dashboard" }],
  },
  {
    icon: Shield,
    badge: "Admin",
    badgeColor: "bg-red-600",
    color: "from-red-700 to-red-900",
    title: "Super Admin",
    desc: "Platform-level admin view. Manage all agents, clients, billing status, and platform-wide settings.",
    url: "/SuperAdmin",
    actions: [{ label: "Open Super Admin", url: "/SuperAdmin" }],
  },
];

export default function Preview() {
  const [idx, setIdx] = useState(0);
  const screen = SCREENS[idx];
  const Icon = screen.icon;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Header */}
      <div className="px-6 py-5 text-center border-b border-white/10 flex-shrink-0">
        <div className="flex items-center justify-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
            <span className="text-white font-black text-sm">EZ</span>
          </div>
          <p className="font-black text-white text-xl">EZ Move <span className="text-orange-400">AI</span> <span className="text-slate-400 font-normal text-base">· Workflow Preview</span></p>
        </div>
        <p className="text-slate-500 text-xs mt-1">Use arrows to flip through each screen in the platform</p>
      </div>

      {/* Main card */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 py-8">
        <div className={`w-full max-w-lg bg-gradient-to-br ${screen.color} rounded-3xl p-8 border border-white/10 shadow-2xl ${screen.highlight ? "ring-2 ring-orange-400/50" : ""} mb-6`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 bg-white/15 rounded-2xl flex items-center justify-center">
              <Icon className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full text-white ${screen.badgeColor}`}>{screen.badge}</span>
              <h2 className="font-black text-white text-2xl mt-0.5">{screen.title}</h2>
            </div>
          </div>
          <p className="text-white/70 text-sm leading-relaxed mb-6">{screen.desc}</p>
          <div className="flex flex-wrap gap-2">
            {screen.actions.map((a, i) => (
              <a key={i} href={a.url} target="_blank" rel="noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-sm transition-all border border-white/20">
                {a.label} <ExternalLink className="w-3.5 h-3.5" />
              </a>
            ))}
          </div>
        </div>

        {/* Step counter */}
        <p className="text-slate-500 text-xs mb-4 font-semibold">Screen {idx + 1} of {SCREENS.length}</p>

        {/* Dot indicators */}
        <div className="flex justify-center gap-2 mb-6">
          {SCREENS.map((s, i) => (
            <button key={i} onClick={() => setIdx(i)}
              className={`h-2 rounded-full transition-all ${i === idx ? "bg-orange-500 w-6" : "bg-slate-600 hover:bg-slate-400 w-2"}`}
              title={s.title} />
          ))}
        </div>

        {/* Prev / Next */}
        <div className="flex gap-4">
          <button onClick={() => setIdx(i => Math.max(0, i - 1))} disabled={idx === 0}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-white/10">
            <ChevronLeft className="w-5 h-5" /> Prev
          </button>
          <button onClick={() => setIdx(i => Math.min(SCREENS.length - 1, i + 1))} disabled={idx === SCREENS.length - 1}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg shadow-orange-900/40">
            Next <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}