import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const SCREENS = [
  { label: "Sales Website",           badge: "Marketing",    badgeColor: "bg-slate-600",   url: "/Home" },
  { label: "Agent Portal",            badge: "Staff",        badgeColor: "bg-purple-600",  url: "/AgentDashboard" },
  { label: "Broker Portal",           badge: "Staff",        badgeColor: "bg-purple-600",  url: "/BrokerDashboard" },
  { label: "Agent Onboarding",        badge: "Setup",        badgeColor: "bg-indigo-600",  url: "/AgentOnboarding" },
  { label: "Client Registration",     badge: "Client Flow",  badgeColor: "bg-orange-500",  url: "/Register?code=DEMO" },
  { label: "Client Move Dashboard",   badge: "Real App",     badgeColor: "bg-blue-600",    url: "/Dashboard" },
  { label: "Super Admin",             badge: "Admin",        badgeColor: "bg-red-600",     url: "/SuperAdmin" },
];

export default function Preview() {
  const [idx, setIdx] = useState(0);
  const screen = SCREENS[idx];
  const prev = () => setIdx(i => Math.max(0, i - 1));
  const next = () => setIdx(i => Math.min(SCREENS.length - 1, i + 1));

  return (
    <div className="fixed inset-0 bg-slate-950 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
            <span className="text-white font-black text-xs">EZ</span>
          </div>
          <span className="text-white font-black text-sm">EZ Move AI <span className="text-slate-400 font-normal">· Preview</span></span>
        </div>
        <span className="text-slate-400 text-xs font-semibold">{idx + 1} / {SCREENS.length}</span>
      </div>

      {/* Nav bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-white/10 flex-shrink-0">
        <button onClick={prev} disabled={idx === 0} className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm disabled:opacity-30 disabled:cursor-not-allowed transition-all">
          <ChevronLeft className="w-4 h-4" /> Prev
        </button>

        <div className="text-center">
          <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full text-white ${screen.badgeColor}`}>{screen.badge}</span>
          <p className="text-white font-bold text-sm mt-0.5">{screen.label}</p>
        </div>

        <button onClick={next} disabled={idx === SCREENS.length - 1} className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm disabled:opacity-30 disabled:cursor-not-allowed transition-all">
          Next <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Dot indicators */}
      <div className="flex justify-center gap-1.5 py-2 bg-slate-900 flex-shrink-0">
        {SCREENS.map((s, i) => (
          <button key={i} onClick={() => setIdx(i)} className={`h-2 rounded-full transition-all ${i === idx ? "bg-orange-500 w-4" : "bg-slate-600 hover:bg-slate-400 w-2"}`} title={s.label} />
        ))}
      </div>

      {/* iframe preview */}
      <iframe
        key={screen.url}
        src={screen.url}
        className="flex-1 w-full border-0"
        title={screen.label}
      />
    </div>
  );
}