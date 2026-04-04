import { useState } from "react";
import { base44 } from "@/api/base44Client";
import DemoModule from "../components/DemoModule";
import {
  Globe, Briefcase, UserCheck, ShieldAlert, Play, Users,
  ArrowRight, ChevronDown, LayoutGrid
} from "lucide-react";

const MODULES = [
  {
    id: "overview",
    label: "Module Overview",
    icon: LayoutGrid,
    color: "from-slate-600 to-slate-800",
    accent: "text-slate-400",
    badge: "bg-slate-700 text-slate-200",
    badgeText: "Home",
  },
  {
    id: "sales",
    label: "Sales Website",
    icon: Globe,
    color: "from-slate-500 to-slate-700",
    accent: "text-slate-300",
    badge: "bg-slate-600 text-slate-100",
    badgeText: "Public Entry",
    desc: "The public-facing main login page. Entry point for ALL user roles — clients, agents, and brokers all start here.",
    actions: [{ label: "Open Sales Website", fn: () => window.open("/", "_blank") }],
  },
  {
    id: "demo",
    label: "Demo Preview",
    icon: Play,
    color: "from-amber-500 to-amber-700",
    accent: "text-amber-200",
    badge: "bg-amber-600 text-amber-100",
    badgeText: "Demo",
    desc: "Full end-to-end demo with Back ← and Next → arrows. No validations, no required fields, no real workflows triggered. View the entire system without entering data.",
    isDemo: true,
  },
  {
    id: "broker",
    label: "Broker Portal",
    icon: Briefcase,
    color: "from-purple-600 to-purple-800",
    accent: "text-purple-200",
    badge: "bg-purple-700 text-purple-100",
    badgeText: "Broker Portal",
    desc: "Portal for broker-level admins. Manage agents under your firm, add buyers and sellers, track payments, and oversee all move progress.",
    actions: [{ label: "Open Broker Portal", fn: () => base44.auth.redirectToLogin("/BrokerDashboard") }],
  },
  {
    id: "agent",
    label: "Agent Portal",
    icon: UserCheck,
    color: "from-orange-500 to-orange-700",
    accent: "text-orange-200",
    badge: "bg-orange-600 text-orange-100",
    badgeText: "Agent Portal",
    desc: "Portal for individual real estate agents. Invite buyers and sellers, track close dates, and monitor client move progress.",
    actions: [{ label: "Open Agent Portal", fn: () => base44.auth.redirectToLogin("/AgentDashboard") }],
  },
  {
    id: "superadmin",
    label: "EZ Move Super Admin Portal",
    icon: ShieldAlert,
    color: "from-red-700 to-red-900",
    accent: "text-red-200",
    badge: "bg-red-800 text-red-100",
    badgeText: "Super Admin",
    desc: "Platform-wide control center. Oversees and controls BOTH Broker and Agent portals. Manages all accounts, buyers/sellers, revenue, and system settings. Not visible to brokers or agents.",
    actions: [{ label: "Open Super Admin Portal", fn: () => base44.auth.redirectToLogin("/SuperAdmin") }],
  },
  {
    id: "realclient",
    label: "Real Client Preview",
    icon: Users,
    color: "from-emerald-600 to-emerald-800",
    accent: "text-emerald-200",
    badge: "bg-emerald-700 text-emerald-100",
    badgeText: "Real Client",
    desc: "Full end-to-end production environment. All real validations, onboarding logic, and workflows run here. Use a real invite code or register as a real client.",
    actions: [
      { label: "Client Register", fn: () => base44.auth.redirectToLogin("/Register") },
      { label: "Client Dashboard", fn: () => base44.auth.redirectToLogin("/Dashboard") },
    ],
  },
];

const OVERVIEW_CARDS = MODULES.filter(m => m.id !== "overview");

export default function Preview() {
  const [active, setActive] = useState("overview");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const current = MODULES.find(m => m.id === active);

  return (
    <div className="min-h-screen bg-[#0f1117] text-white">

      {/* ── Header + Dropdown ── */}
      <div className="sticky top-0 z-30 bg-[#0f1117]/95 backdrop-blur border-b border-white/10">
        <div className="max-w-2xl mx-auto px-5 py-4 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-900/50">
              <span className="text-white font-black text-sm">EZ</span>
            </div>
            <div className="hidden sm:block">
              <p className="font-black text-white text-base leading-tight">
                EZ Move <span className="text-orange-400">AI</span>
              </p>
              <p className="text-slate-500 text-[10px] font-semibold">Platform Preview</p>
            </div>
          </div>

          {/* Dropdown */}
          <div className="relative flex-1 max-w-xs">
            <button
              onClick={() => setDropdownOpen(o => !o)}
              className="w-full flex items-center justify-between gap-2 bg-white/8 hover:bg-white/12 border border-white/15 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-all"
            >
              <div className="flex items-center gap-2 min-w-0">
                <current.icon className="w-4 h-4 text-white/60 flex-shrink-0" />
                <span className="truncate">{current.label}</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-white/40 flex-shrink-0 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {dropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a1f2e] border border-white/15 rounded-2xl shadow-2xl overflow-hidden z-50">
                {MODULES.map(m => (
                  <button
                    key={m.id}
                    onClick={() => { setActive(m.id); setDropdownOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/8 transition-colors ${active === m.id ? "bg-white/10" : ""}`}
                  >
                    <m.icon className={`w-4 h-4 flex-shrink-0 ${active === m.id ? "text-orange-400" : "text-white/40"}`} />
                    <span className={`text-sm font-semibold ${active === m.id ? "text-white" : "text-white/70"}`}>{m.label}</span>
                    {active === m.id && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-2xl mx-auto px-5 py-8" onClick={() => dropdownOpen && setDropdownOpen(false)}>

        {/* OVERVIEW */}
        {active === "overview" && (
          <div className="space-y-5">
            <div className="mb-8">
              <h1 className="text-2xl font-black text-white mb-2">Module Overview</h1>
              <p className="text-slate-400 text-sm">Select a module below or use the dropdown above to navigate.</p>
            </div>

            {/* Hierarchy */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">System Hierarchy</p>
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { label: "Super Admin", color: "bg-red-900/50 border-red-700/50 text-red-300" },
                  { label: "Broker Portal", color: "bg-purple-900/50 border-purple-700/50 text-purple-300" },
                  { label: "Agent Portal", color: "bg-orange-900/50 border-orange-700/50 text-orange-300" },
                  { label: "Buyers/Sellers", color: "bg-emerald-900/50 border-emerald-700/50 text-emerald-300" },
                ].map((p, i, arr) => (
                  <div key={p.label} className="flex items-center gap-2">
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${p.color}`}>{p.label}</span>
                    {i < arr.length - 1 && <ArrowRight className="w-3 h-3 text-slate-600" />}
                  </div>
                ))}
              </div>
            </div>

            {/* Module Cards */}
            <div className="space-y-3">
              {OVERVIEW_CARDS.map(m => (
                <button
                  key={m.id}
                  onClick={() => setActive(m.id)}
                  className="w-full text-left bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 rounded-2xl overflow-hidden transition-all group"
                >
                  <div className={`bg-gradient-to-r ${m.color} px-5 py-4 flex items-center gap-4`}>
                    <div className="w-9 h-9 bg-black/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <m.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/60 block mb-0.5">{m.badgeText}</span>
                      <p className="font-black text-white text-sm leading-tight">{m.label}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-white/70 transition-colors flex-shrink-0" />
                  </div>
                  {m.desc && (
                    <div className="px-5 py-3">
                      <p className="text-slate-400 text-xs leading-relaxed line-clamp-2">{m.desc}</p>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* NON-DEMO MODULES */}
        {active !== "overview" && active !== "demo" && current && (
          <div className="space-y-5">
            <div className={`bg-gradient-to-r ${current.color} rounded-2xl px-6 py-6 flex items-center gap-5`}>
              <div className="w-14 h-14 bg-black/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                <current.icon className="w-7 h-7 text-white" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-white/60 block mb-1">{current.badgeText}</span>
                <h1 className="font-black text-white text-xl leading-tight">{current.label}</h1>
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <p className="text-slate-300 text-sm leading-relaxed">{current.desc}</p>
            </div>
            {current.actions && (
              <div className="flex flex-wrap gap-3">
                {current.actions.map((a, i) => (
                  <button
                    key={i}
                    onClick={a.fn}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm transition-all border border-white/15 hover:border-white/25"
                  >
                    {a.label}
                    <ArrowRight className="w-3.5 h-3.5 opacity-60" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* DEMO MODULE */}
        {active === "demo" && (
          <div className="space-y-5">
            <div className="bg-gradient-to-r from-amber-500 to-amber-700 rounded-2xl px-6 py-6 flex items-center gap-5">
              <div className="w-14 h-14 bg-black/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Play className="w-7 h-7 text-white" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-white/60 block mb-1">Demo</span>
                <h1 className="font-black text-white text-xl leading-tight">Demo Preview</h1>
                <p className="text-amber-100/80 text-xs mt-1">Use ← → arrows to navigate. No data required.</p>
              </div>
            </div>
            <DemoModule />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-white/5 py-6 text-center mt-8">
        <p className="text-slate-700 text-xs">© 2026 EZ Move AI · Internal Preview Hub</p>
      </div>
    </div>
  );
}