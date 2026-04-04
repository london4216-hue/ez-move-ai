import { base44 } from "@/api/base44Client";
import DemoModule from "../components/DemoModule";
import { Globe, Briefcase, UserCheck, ShieldAlert, Play, Users, ArrowRight } from "lucide-react";

const SECTIONS = [
  {
    icon: Globe,
    gradient: "from-slate-500 to-slate-700",
    iconBg: "bg-slate-600",
    badge: "bg-slate-700 text-slate-200",
    badgeText: "Public Entry",
    title: "Sales Website",
    desc: "The public-facing main login page. Entry point for ALL user roles — clients, agents, and brokers all start here.",
    actions: [{ label: "Open Sales Website", onClick: () => window.open("/", "_blank") }],
  },
  {
    icon: Briefcase,
    gradient: "from-purple-600 to-purple-800",
    iconBg: "bg-purple-700",
    badge: "bg-purple-700 text-purple-100",
    badgeText: "Broker Portal",
    title: "Broker Portal",
    desc: "Portal for broker-level admins. Manage agents under your firm, add clients, track payments, and oversee all move progress.",
    actions: [{ label: "Open Broker Portal", onClick: () => base44.auth.redirectToLogin("/BrokerDashboard") }],
  },
  {
    icon: UserCheck,
    gradient: "from-orange-500 to-orange-700",
    iconBg: "bg-orange-600",
    badge: "bg-orange-600 text-orange-100",
    badgeText: "Agent Portal",
    title: "Agent Portal",
    desc: "Portal for individual real estate agents. Invite buyers and sellers, track close dates, and monitor client move progress.",
    actions: [{ label: "Open Agent Portal", onClick: () => base44.auth.redirectToLogin("/AgentDashboard") }],
  },
  {
    icon: ShieldAlert,
    gradient: "from-red-700 to-red-900",
    iconBg: "bg-red-800",
    badge: "bg-red-800 text-red-100",
    badgeText: "Super Admin",
    title: "EZ Move Super Admin Portal",
    desc: "Platform-wide control center. Oversees all Broker and Agent accounts, manages global users, system settings, analytics, and platform controls. Not visible to brokers or agents.",
    actions: [{ label: "Open Super Admin Portal", onClick: () => base44.auth.redirectToLogin("/SuperAdmin") }],
  },
  {
    icon: Play,
    gradient: "from-amber-500 to-amber-700",
    iconBg: "bg-amber-600",
    badge: "bg-amber-600 text-amber-100",
    badgeText: "Demo",
    title: "Demo Preview",
    desc: "Non-functional demo environment. Click through all screens with forward/back arrows. No real data, no validations, no workflows triggered.",
    showDemoModule: true,
  },
  {
    icon: Users,
    gradient: "from-emerald-600 to-emerald-800",
    iconBg: "bg-emerald-700",
    badge: "bg-emerald-700 text-emerald-100",
    badgeText: "Real Client",
    title: "Real Client Preview",
    desc: "Full end-to-end production environment. All real validations, onboarding logic, and workflows run here. Use a real invite code or register as a real client.",
    actions: [
      { label: "Client Register", onClick: () => base44.auth.redirectToLogin("/Register") },
      { label: "Client Dashboard", onClick: () => base44.auth.redirectToLogin("/Dashboard") },
    ],
  },
];

const HierarchyPill = ({ color, label }) => (
  <span className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${color}`}>{label}</span>
);

export default function Preview() {
  return (
    <div className="min-h-screen bg-[#0f1117] text-white">

      {/* ── Header ── */}
      <div className="max-w-2xl mx-auto px-6 pt-12 pb-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-900/50 flex-shrink-0">
            <span className="text-white font-black text-lg">EZ</span>
          </div>
          <div>
            <h1 className="font-black text-white text-2xl leading-tight tracking-tight">
              EZ Move <span className="text-orange-400">AI</span>
            </h1>
            <p className="text-slate-400 text-sm font-medium mt-0.5">Platform Preview Hub</p>
          </div>
        </div>

        <p className="text-slate-400 text-sm leading-relaxed mb-6">
          Navigate to any section of the platform. Each card below routes to the correct portal or environment.
        </p>

        {/* Hierarchy */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3">System Hierarchy</p>
          <div className="flex flex-wrap items-center gap-2">
            <HierarchyPill color="bg-red-900/50 border-red-700/50 text-red-300" label="Super Admin" />
            <ArrowRight className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
            <HierarchyPill color="bg-purple-900/50 border-purple-700/50 text-purple-300" label="Broker Portal" />
            <ArrowRight className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
            <HierarchyPill color="bg-orange-900/50 border-orange-700/50 text-orange-300" label="Agent Portal" />
            <ArrowRight className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
            <HierarchyPill color="bg-emerald-900/50 border-emerald-700/50 text-emerald-300" label="Clients" />
          </div>
        </div>
      </div>

      {/* ── Cards ── */}
      <div className="max-w-2xl mx-auto px-6 pb-16 space-y-4">
        {SECTIONS.map((s, i) => (
          <div
            key={i}
            className="bg-white/[0.04] border border-white/10 rounded-2xl overflow-hidden hover:bg-white/[0.06] transition-colors"
          >
            {/* Card header bar */}
            <div className={`bg-gradient-to-r ${s.gradient} px-6 py-4 flex items-center gap-4`}>
              <div className={`w-10 h-10 ${s.iconBg} bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0`}>
                <s.icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-black/20 text-white/80`}>
                    {s.badgeText}
                  </span>
                  <h2 className="font-black text-white text-base leading-tight">{s.title}</h2>
                </div>
              </div>
            </div>

            {/* Card body */}
            <div className="px-6 py-5">
              <p className="text-slate-400 text-sm leading-relaxed mb-5">{s.desc}</p>

              {s.actions && (
                <div className="flex flex-wrap gap-2">
                  {s.actions.map((a, j) => (
                    <button
                      key={j}
                      onClick={a.onClick}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm transition-all border border-white/10 hover:border-white/20"
                    >
                      {a.label}
                      <ArrowRight className="w-3.5 h-3.5 opacity-70" />
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
        ))}
      </div>

      {/* Footer */}
      <div className="border-t border-white/5 py-6 text-center">
        <p className="text-slate-700 text-xs">© 2026 EZ Move AI · Internal Preview Hub</p>
      </div>
    </div>
  );
}