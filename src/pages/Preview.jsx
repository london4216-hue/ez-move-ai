import { base44 } from "@/api/base44Client";
import DemoModule from "../components/DemoModule";
import { Globe, Briefcase, UserCheck, ShieldAlert, Play, Users } from "lucide-react";

const SECTIONS = [
  {
    icon: Globe,
    color: "from-slate-700 to-slate-800",
    accent: "text-slate-300",
    border: "border-slate-600",
    badge: "bg-slate-600 text-slate-200",
    badgeText: "Public",
    title: "Sales Website",
    desc: "The public-facing main login page. Entry point for ALL user roles — clients, agents, and brokers all start here.",
    actions: [{ label: "Open Sales Website", onClick: () => window.open("/", "_blank") }],
  },
  {
    icon: Briefcase,
    color: "from-purple-700 to-purple-900",
    accent: "text-purple-300",
    border: "border-purple-600",
    badge: "bg-purple-600 text-white",
    badgeText: "Broker Portal",
    title: "Broker Portal",
    desc: "Portal for broker-level admins. Manage agents under your firm, add clients, track payments, and oversee all move progress.",
    actions: [{ label: "Open Broker Portal", onClick: () => base44.auth.redirectToLogin("/BrokerDashboard") }],
  },
  {
    icon: UserCheck,
    color: "from-orange-600 to-orange-800",
    accent: "text-orange-200",
    border: "border-orange-500",
    badge: "bg-orange-500 text-white",
    badgeText: "Agent Portal",
    title: "Agent Portal",
    desc: "Portal for individual real estate agents. Invite buyers and sellers, track close dates, and monitor client move progress.",
    actions: [{ label: "Open Agent Portal", onClick: () => base44.auth.redirectToLogin("/AgentDashboard") }],
  },
  {
    icon: ShieldAlert,
    color: "from-red-800 to-red-950",
    accent: "text-red-200",
    border: "border-red-700",
    badge: "bg-red-700 text-white",
    badgeText: "Super Admin",
    title: "EZ Move Super Admin Portal",
    desc: "Platform-wide control center. Oversees all Broker and Agent accounts, manages global users, system settings, analytics, and platform controls. Not visible to brokers or agents.",
    actions: [{ label: "Open Super Admin Portal", onClick: () => base44.auth.redirectToLogin("/SuperAdmin") }],
  },
  {
    icon: Play,
    color: "from-amber-600 to-amber-800",
    accent: "text-amber-200",
    border: "border-amber-500",
    badge: "bg-amber-500 text-white",
    badgeText: "Demo",
    title: "Demo Preview",
    desc: "Non-functional demo environment. Click through all screens with forward/back arrows. No real data, no validations, no workflows triggered.",
    showDemoModule: true,
  },
  {
    icon: Users,
    color: "from-emerald-700 to-emerald-900",
    accent: "text-emerald-200",
    border: "border-emerald-600",
    badge: "bg-emerald-600 text-white",
    badgeText: "Real Client",
    title: "Real Client Preview",
    desc: "Full end-to-end production environment. All real validations, onboarding logic, and workflows run here. Use a real invite code or register as a real client.",
    actions: [
      { label: "Client Register", onClick: () => base44.auth.redirectToLogin("/Register") },
      { label: "Client Dashboard", onClick: () => base44.auth.redirectToLogin("/Dashboard") },
    ],
  },
];

export default function Preview() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
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
          Select a section below to navigate to any part of the platform.
        </p>
        <div className="mt-5 inline-flex items-center gap-2 flex-wrap justify-center text-xs text-slate-500">
          <span className="bg-red-900/40 border border-red-700/40 text-red-300 px-2 py-1 rounded-lg font-bold">Super Admin</span>
          <span>→</span>
          <span className="bg-purple-900/40 border border-purple-700/40 text-purple-300 px-2 py-1 rounded-lg font-bold">Broker Portal</span>
          <span>→</span>
          <span className="bg-orange-900/40 border border-orange-700/40 text-orange-300 px-2 py-1 rounded-lg font-bold">Agent Portal</span>
          <span>→</span>
          <span className="bg-emerald-900/40 border border-emerald-700/40 text-emerald-300 px-2 py-1 rounded-lg font-bold">Clients</span>
        </div>
      </div>

      <div className="flex-1 max-w-3xl mx-auto w-full px-5 py-8 space-y-4">
        {SECTIONS.map((s, i) => (
          <div key={i} className={`bg-gradient-to-br ${s.color} rounded-3xl p-6 border ${s.border} shadow-xl`}>
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
                {s.actions && (
                  <div className="flex flex-wrap gap-2">
                    {s.actions.map((a, j) => (
                      <button key={j} onClick={a.onClick}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-sm transition-all active:scale-[0.97] border border-white/20">
                        {a.label} →
                      </button>
                    ))}
                  </div>
                )}
                {s.showDemoModule && (
                  <div className="mt-2">
                    <DemoModule />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <footer className="py-5 text-center border-t border-white/10">
        <p className="text-slate-600 text-xs">© 2026 EZ Move AI · Internal Preview Hub</p>
      </footer>
    </div>
  );
}