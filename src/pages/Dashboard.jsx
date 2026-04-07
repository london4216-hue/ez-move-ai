import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { PUBLIC_DEMO_MODE } from "@/lib/featureFlags";
import { differenceInDays, parseISO } from "date-fns";
import { Package, Home, Sparkles, RotateCcw, LogOut, QrCode } from "lucide-react";
import ChecklistPanel from "@/components/dashboard/ChecklistPanel";
import CalendarSheet from "@/components/dashboard/CalendarSheet";
import MyStuffTab from "@/components/dashboard/MyStuffTab";
import MoveCommandCenter from "@/components/dashboard/MoveCommandCenter";
import Week1OnboardingModal from "@/components/dashboard/Week1OnboardingModal";
import AIMoveAssist from "@/components/dashboard/AIMoveAssist";

const TABS = [
  { id: "plan",      label: "My Move",  Icon: Home },
  { id: "inventory", label: "My Stuff", Icon: Package },
  { id: "ai",        label: "AI Assist", Icon: Sparkles },
];

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("plan");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const navigate = useNavigate();

  // Guard: Redirect if onboarding not complete
  useEffect(() => {
    const onboardingComplete = localStorage.getItem('onboardingComplete') === 'true';
    if (!onboardingComplete) {
      navigate('/OnboardingWeek1');
    }
  }, [navigate]);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      setLoading(false);
      // Force-show modal if user just completed registration
      const justRegistered = localStorage.getItem('just_registered');
      if (justRegistered === u?.id) {
        localStorage.removeItem('just_registered');
        localStorage.removeItem(`onboarding_done_${u?.id}`);
        localStorage.removeItem(`onboarding_progress_${u?.id}`);
        setShowOnboarding(true);
        return;
      }
      // Show onboarding for any user who hasn't completed it yet
      const alreadyDone = localStorage.getItem(`onboarding_done_${u?.id}`);
      if (!alreadyDone) {
        localStorage.removeItem(`onboarding_progress_${u?.id}`);
        setShowOnboarding(true);
      }
    }).catch(() => {
      if (!PUBLIC_DEMO_MODE) {
        navigate("/Register");
      } else {
        // In demo mode, create demo user and continue
        const demoUser = {
          id: 'demo-user',
          email: 'demo@demo.local',
          full_name: 'Demo User',
          role: 'user',
          is_demo: true
        };
        setUser(demoUser);
        setLoading(false);
      }
    });
  }, []);

  const daysToClose = user?.estimated_close_date
    ? differenceInDays(parseISO(user.estimated_close_date), new Date())
    : null;

  const closeStatus = daysToClose === null ? null
    : daysToClose < 0 ? { label: "Closed!", color: "bg-emerald-500" }
    : daysToClose <= 7 ? { label: `${daysToClose}d left`, color: "bg-red-500" }
    : daysToClose <= 14 ? { label: `${daysToClose}d left`, color: "bg-amber-500" }
    : { label: `${daysToClose}d to close`, color: "bg-orange-500" };

  if (loading) return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-9 h-9 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-sm font-medium">Loading your move plan…</p>
      </div>
    </div>
  );

  const handleOnboardingDone = () => {
    setShowOnboarding(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-md mx-auto border-x border-slate-200 shadow-[0_0_40px_rgba(0,0,0,0.08)]">
      {showOnboarding && <Week1OnboardingModal user={user} onDone={handleOnboardingDone} />}
      {!showOnboarding && (<>
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-4 pt-3 pb-3">
        <div className="flex items-center justify-between gap-2">
          {/* Brand + name */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-md shadow-orange-200 flex-shrink-0">
              <span className="text-white text-[10px] font-black tracking-tight">EZ</span>
            </div>
            <div>
              <p className="text-slate-900 font-black text-sm leading-tight">EZ Move <span className="text-orange-500">AI</span></p>
              {user?.full_name && (
                <p className="text-slate-400 text-[11px] font-medium leading-tight">Hi, {user.full_name.split(" ")[0]} 👋</p>
              )}
            </div>
          </div>

          {/* Right side: countdown pill + avatar */}
          <div className="flex items-center gap-2">
            {closeStatus && (
              <span className={`${closeStatus.color} text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-sm`}>
                {closeStatus.label}
              </span>
            )}
            {user?.role === 'admin' && (
              <button
                onClick={() => {
                  if (!confirm("Reset demo? This clears all checklist progress and onboarding data.")) return;
                  const keys = Object.keys(localStorage).filter(k => k.includes(user?.id) || k === 'register_progress');
                  keys.forEach(k => localStorage.removeItem(k));
                  window.location.reload();
                }}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-red-50 hover:text-red-500 text-slate-400 flex items-center justify-center transition-colors border border-slate-200 hover:border-red-200"
                title="Demo Reset"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={() => base44.auth.logout("/")}
              className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center shadow-sm hover:opacity-80 transition-opacity"
              title="Sign out"
            >
              <span className="text-white text-[11px] font-black">{user?.full_name?.[0] || "U"}</span>
            </button>
          </div>
        </div>

        {/* Progress bar toward close */}
        {user?.estimated_close_date && (
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-slate-400 text-[9px] font-bold uppercase tracking-widest">Move Timeline</span>
              <span className="text-orange-500 text-[10px] font-bold">
                {daysToClose !== null && daysToClose > 0 ? `${daysToClose} days to closing` : daysToClose === 0 ? "Closing today!" : "Closed! 🎉"}
              </span>
            </div>
            <div className="bg-slate-100 rounded-full overflow-hidden" style={{height: "5px"}}>
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full transition-all duration-700"
                style={{
                  width: daysToClose === null ? '2%' : `${Math.max(3, Math.min(100, Math.round(
                    (Math.max(0, daysToClose) / Math.max(1,
                      user.registration_date
                        ? Math.abs(differenceInDays(parseISO(user.estimated_close_date), parseISO(user.registration_date)))
                        : 90
                    )) * 100
                  )))}%`
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* QR Labels shortcut */}
      <div className="px-4 pt-3">
        <button onClick={() => navigate("/BoxInventory")}
          className="w-full flex items-center gap-3 bg-white border border-slate-100 rounded-2xl px-4 py-3 text-left active:scale-[0.98] transition-transform shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
            <QrCode className="w-4 h-4 text-orange-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-black text-slate-800">QR Labels & Box Inventory</p>
            <p className="text-[11px] text-slate-400">Snap a photo, get a smart label</p>
          </div>
          <span className="text-[10px] bg-orange-100 text-orange-600 font-bold px-2 py-0.5 rounded-full">NEW</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-28">
        {activeTab === "plan" && <ChecklistPanel user={user} />}
        {activeTab === "inventory" && <MyStuffTab user={user} onNavigate={setActiveTab} onStartOnboarding={() => setShowOnboarding(true)} />}
        {activeTab === "ai" && <AIMoveAssist user={user} />}
      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/95 backdrop-blur-md border-t border-slate-100 px-3 pt-2 pb-3 z-50 shadow-[0_-8px_24px_rgba(0,0,0,0.07)]">
        <div className="flex gap-1">
          {TABS.map(({ id, label, Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-2xl transition-all active:scale-95 min-h-[52px] ${
                  active
                    ? "bg-orange-50 text-orange-500"
                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? "stroke-[2.5]" : "stroke-[1.5]"}`} />
                <span className={`text-[10px] font-bold leading-none ${active ? "text-orange-500" : "text-slate-400"}`}>{label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>)}
    </div>
  );
}