import { base44 } from "@/api/base44Client";
import { Globe, UserCheck, Briefcase, Play, LogIn, LayoutDashboard, ArrowRight } from "lucide-react";

const SECTIONS = [
  {
    icon: Globe,
    color: "from-orange-500 to-orange-700",
    accent: "text-orange-200",
    border: "border-orange-500",
    badge: "bg-orange-500 text-white",
    badgeText: "Unified Preview",
    title: "EZ Move AI Unified Preview",
    desc: "Complete EZ Move AI application preview with all features and workflows.",
    actions: [{ label: "Open Preview", onClick: () => window.open("https://app.base44.com/apps/69a4327be3c6be2ca74b3ad5/editor/preview", "_blank") }],
    highlight: true,
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