import { useState } from "react";
import { RotateCcw, Home, Package, Sparkles } from "lucide-react";
import ChecklistPanel from "@/components/dashboard/ChecklistPanel";
import MyStuffTab from "@/components/dashboard/MyStuffTab";
import AIMoveAssist from "@/components/dashboard/AIMoveAssist";

// Fully isolated demo environment — no real auth, no real data, no redirects
const DEMO_USER = {
  id: "demo-user-001",
  full_name: "Demo User",
  email: "demo@ezmove.ai",
  home_address: "123 Oak Street, Austin, TX 78701",
  estimated_close_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  registration_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
};

const TABS = [
  { id: "plan", label: "My Move", Icon: Home },
  { id: "inventory", label: "My Stuff", Icon: Package },
  { id: "ai", label: "AI Assist", Icon: Sparkles },
];

export default function DemoPreview() {
  const [activeTab, setActiveTab] = useState("plan");

  const handleDemoReset = () => {
    if (!confirm("Reset demo? This clears all demo checklist progress.")) return;
    const keys = Object.keys(localStorage).filter(k => k.includes(DEMO_USER.id));
    keys.forEach(k => localStorage.removeItem(k));
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col max-w-md mx-auto border-x border-slate-200 shadow-[0_0_40px_rgba(0,0,0,0.08)]">
      {/* Demo Banner */}
      <div className="bg-amber-400 text-amber-900 text-center text-[10px] font-bold py-1 tracking-wide uppercase">
        🎭 Demo Preview — No Real Data
      </div>

      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 pt-2 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex flex-col items-center gap-0.5">
              <button
                onClick={handleDemoReset}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 hover:bg-red-50 hover:text-red-500 text-slate-400 text-[9px] font-bold transition-colors border border-slate-200 hover:border-red-200"
              >
                <RotateCcw className="w-2.5 h-2.5" />
                Demo Reset
              </button>
              <span className="text-[9px] text-slate-400 font-semibold">Demo User</span>
            </div>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-900/30">
              <span className="text-white text-[10px] font-black tracking-tight">EZ</span>
            </div>
            <div>
              <p className="text-slate-900 font-bold text-sm leading-tight">
                EZ Move <span className="text-orange-500">AI</span>
              </p>
              <p className="text-slate-400 text-[10px] leading-tight">Hi, Demo</p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg">Demo Mode</span>
        </div>

        {/* Progress bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-slate-500 text-[9px] font-semibold uppercase tracking-wider">Move Timeline</span>
            <span className="text-orange-400 text-[9px] font-bold">21 days to close</span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full w-[30%]" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-24">
        {activeTab === "plan" && <ChecklistPanel user={DEMO_USER} />}
        {activeTab === "inventory" && <MyStuffTab user={DEMO_USER} onNavigate={setActiveTab} onStartOnboarding={() => {}} />}
        {activeTab === "ai" && <AIMoveAssist user={DEMO_USER} />}
      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-slate-100 px-4 py-2 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <div className="flex">
          {TABS.map(({ id, label, Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex-1 flex flex-col items-center gap-1 py-1.5 rounded-xl transition-all active:scale-95 ${active ? "text-orange-500" : "text-slate-400"}`}
              >
                <Icon className={`w-5 h-5 ${active ? "stroke-[2.5]" : ""}`} />
                <span className={`text-[10px] font-bold leading-none ${active ? "text-orange-500" : "text-slate-400"}`}>{label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}