import { base44 } from "@/api/base44Client";
import DemoModule from "../components/DemoModule";
import { Globe, UserCheck, Briefcase, Play, LogIn, LayoutDashboard, ArrowRight } from "lucide-react";

const SECTIONS = [
  {
    icon: Globe,
    color: "from-slate-700 to-slate-800",
    accent: "text-slate-300",
    border: "border-slate-600",
    badge: "bg-slate-600 text-slate-200",
    badgeText: "Marketing",
    title: "Sales Website",
    desc: "The public-facing marketing site. Also contains Admin, Agent, and Broker login buttons.",
    actions: [{ label: "View Sales Site", onClick: () => window.open("/Home", "_blank") }],
  },
  {
    icon: Briefcase,
    color: "from-purple-700 to-purple-900",
    accent: "text-purple-300",
    border: "border-purple-600",
    badge: "bg-purple-600 text-white",
    badgeText: "Staff Portals",
    title: "Broker & Agent Portals",
    desc: "Log in as a Broker or Agent to manage clients, send invite links, and track move progress.",
    actions: [
      { label: "Agent Portal", onClick: () => base44.auth.redirectToLogin("/AgentDashboard") },
      { label: "Broker Portal", onClick: () => base44.auth.redirectToLogin("/BrokerDashboard") },
    ],
  },
  {
    icon: Play,
    color: "from-orange-500 to-orange-700",
    accent: "text-orange-200",
    border: "border-orange-500",
    badge: "bg-orange-500 text-white",
    badgeText: "Demo",
    title: "Full Registration Demo",
    desc: "Experience the complete client journey — from clicking an invite link, through the 7-question onboarding, all the way to the Move Dashboard.",
    actions: [{ label: "Start Demo →", onClick: () => base44.auth.redirectToLogin("/Register?code=DEMO") }],
    highlight: true,
    showDemoModule: true,
  },
  {
    icon: LogIn,
    color: "from-emerald-600 to-emerald-800",
    accent: "text-emerald-300",
    border: "border-emerald-600",
    badge: "bg-emerald-600 text-white",
    badgeText: "Real Client",
    title: "Real Client Login & Registration",
    desc: "Actual client entry point. Clients log in with their real account and complete real onboarding with their unique invite code.",
    actions: [{ label: "Client Login / Register", onClick: () => base44.auth.redirectToLogin("/Register") }],
  },
  {
    icon: LayoutDashboard,
    color: "from-blue-600 to-blue-900",
    accent: "text-blue-300",
    border: "border-blue-600",
    badge: "bg-blue-600 text-white",
    badgeText: "Real App",
    title: "Real App Dashboard",
    desc: "The live move management dashboard for real registered clients. Full checklist, AI tools, inventory, and calendar.",
    actions: [{ label: "Go to Dashboard", onClick: () => base44.auth.redirectToLogin("/Dashboard") }],
  },
];

export default function Preview() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* Header */}
      <div className="px-6 py-8 text-center border-b border-white/10">
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-900/40">
            <span className="text-white font-black text-base">EZ</span>
          </div>
          <div className="text-left">
            <p className="font-black text-white text-2xl leading-tight">EZ Move <span className="text-orange-400">AI</span></p>
            <p className="text-slate-400 text-xs font-semibold">Platform Preview Hub</p>
          </div>
        </div>
        <p className="text-slate-400 text-sm max-w-md mx-auto">
          Select a section below to explore different parts of the platform.
        </p>
      </div>

      {/* Cards */}
      <div className="flex-1 max-w-3xl mx-auto w-full px-5 py-10 space-y-4">
        {SECTIONS.map((s, i) => (
          <div
            key={i}
            className={`bg-gradient-to-br ${s.color} rounded-3xl p-6 border ${s.border} shadow-xl ${s.highlight ? "ring-2 ring-orange-400/40" : ""}`}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/15 rounded-2xl flex items-center justify-center flex-shrink-0 mt-0.5">
                <s.icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${s.badge}`}>{s.badgeText}</span>
                  <h2 className="font-black text-white text-lg leading-tight">{s.title}</h2>
                </div>
                <p className={`text-sm leading-relaxed mb-4 ${s.accent}`}>{s.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {s.actions.map((a, j) => (
                    <button
                      key={j}
                      onClick={a.onClick}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-sm transition-all active:scale-[0.97] border border-white/20"
                    >
                      {a.label} <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ))}
                </div>
                {s.showDemoModule && (
                  <div className="mt-5">
                    <DemoModule />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <footer className="py-5 text-center border-t border-white/10">
        <p className="text-slate-600 text-xs">© 2026 EZ Move AI · Internal Preview</p>
      </footer>
    </div>
  );
}