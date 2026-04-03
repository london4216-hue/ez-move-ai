import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { differenceInDays, parseISO } from "date-fns";
import { Home, Package, Sparkles, LogOut } from "lucide-react";
import ChecklistPanel from "@/components/dashboard/ChecklistPanel";
import MyStuffTab from "@/components/dashboard/MyStuffTab";
import AIMoveAssist from "@/components/dashboard/AIMoveAssist";
import Week1OnboardingModal from "@/components/dashboard/Week1OnboardingModal";

// Full real workflow preview — mirrors production exactly
// Real auth, real metadata, real onboarding, real redirects
const TABS = [
  { id: "plan", label: "My Move", Icon: Home },
  { id: "inventory", label: "My Stuff", Icon: Package },
  { id: "ai", label: "AI Assist", Icon: Sparkles },
];

export default function WorkflowPreview() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("plan");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    base44.auth.me()
      .then(u => {
        if (!u) {
          setAuthError("Not authenticated. Please open your invite link or log in.");
          setLoading(false);
          return;
        }
        if (!u.registration_date) {
          // Not registered — redirect to real registration
          window.location.assign(createPageUrl("Register"));
          return;
        }
        setUser(u);
        setLoading(false);
        const urlParams = new URLSearchParams(window.location.search);
        const isNewUser = urlParams.get('newUser') === '1';
        if (u?.needs_onboarding || isNewUser) {
          setShowOnboarding(true);
        }
      })
      .catch(err => {
        setAuthError("Authentication failed. Please open your invite link or log in again.");
        setLoading(false);
      });
  }, []);

  const handleOnboardingDone = () => {
    base44.auth.updateMe({ needs_onboarding: false }).catch(() => {});
    const url = new URL(window.location.href);
    url.searchParams.delete('newUser');
    window.history.replaceState({}, '', url.toString());
    setShowOnboarding(false);
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (authError) return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-white rounded-3xl p-8 shadow-xl max-w-sm w-full">
        <div className="text-4xl mb-4">🔐</div>
        <h2 className="text-lg font-black text-slate-800 mb-2">Authentication Required</h2>
        <p className="text-sm text-slate-500 mb-6">{authError}</p>
        <button
          onClick={() => base44.auth.redirectToLogin()}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-sm"
        >
          Log In
        </button>
      </div>
    </div>
  );

  const daysToClose = user?.estimated_close_date
    ? differenceInDays(parseISO(user.estimated_close_date), new Date())
    : null;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col max-w-md mx-auto border-x border-slate-200 shadow-[0_0_40px_rgba(0,0,0,0.08)]">
      {/* Workflow Preview Banner */}
      <div className="bg-blue-500 text-white text-center text-[10px] font-bold py-1 tracking-wide uppercase">
        ⚡ Real Workflow Preview — Live Auth & Data
      </div>

      {showOnboarding && <Week1OnboardingModal user={user} onDone={handleOnboardingDone} />}

      {!showOnboarding && (
        <>
          {/* Header */}
          <div className="bg-white border-b border-slate-200 px-4 pt-2 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-900/30">
                  <span className="text-white text-[10px] font-black tracking-tight">EZ</span>
                </div>
                <div>
                  <p className="text-slate-900 font-bold text-sm leading-tight">
                    EZ Move <span className="text-orange-500">AI</span>
                  </p>
                  {user?.full_name && (
                    <p className="text-slate-400 text-[10px] leading-tight">Hi, {user.full_name.split(" ")[0]}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => base44.auth.logout(createPageUrl("Register"))}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold transition-colors border border-slate-200"
              >
                <LogOut className="w-3.5 h-3.5" />
                Save & Exit
              </button>
            </div>

            {/* Progress bar */}
            {user?.estimated_close_date && (
              <div className="mt-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-500 text-[9px] font-semibold uppercase tracking-wider">Move Timeline</span>
                  <span className="text-orange-400 text-[9px] font-bold">
                    {daysToClose !== null && daysToClose > 0 ? `${daysToClose} days to close` : daysToClose === 0 ? "Closing today!" : "Closed!"}
                  </span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full transition-all duration-700"
                    style={{ width: `${Math.max(2, Math.min(100, 100 - Math.round((Math.max(0, daysToClose) / 30) * 100)))}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-4 pt-4 pb-24">
            {activeTab === "plan" && <ChecklistPanel user={user} />}
            {activeTab === "inventory" && <MyStuffTab user={user} onNavigate={setActiveTab} onStartOnboarding={() => setShowOnboarding(true)} />}
            {activeTab === "ai" && <AIMoveAssist user={user} />}
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
        </>
      )}
    </div>
  );
}