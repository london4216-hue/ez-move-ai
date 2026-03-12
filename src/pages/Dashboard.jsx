import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";
import { differenceInDays, parseISO } from "date-fns";
import { LayoutList, CalendarDays, Package, Home, Sparkles } from "lucide-react";
import ChecklistPanel from "@/components/dashboard/ChecklistPanel";
import CalendarSheet from "@/components/dashboard/CalendarSheet";
import MyStuffTab from "@/components/dashboard/MyStuffTab";
import MoveCommandCenter from "@/components/dashboard/MoveCommandCenter";
import Week1OnboardingModal from "@/components/dashboard/Week1OnboardingModal";
import AIMoveAssist from "@/components/dashboard/AIMoveAssist";

const TABS = [
  { id: "plan", label: "My Move", Icon: Home },
  { id: "inventory", label: "My Stuff", Icon: Package },
  { id: "ai", label: "AI Assist", Icon: Sparkles },
];

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("plan");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      setLoading(false);
      // Show onboarding for brand-new users (registered in last 2 minutes)
      const regDate = u?.registration_date ? new Date(u.registration_date) : null;
      const isNew = regDate && (Date.now() - regDate.getTime()) < 2 * 60 * 1000;
      const alreadySeen = localStorage.getItem(`onboarding_done_${u?.id}`);
      if (isNew && !alreadySeen) setShowOnboarding(true);
    }).catch(() => navigate(createPageUrl("Register")));
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
      <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const handleOnboardingDone = () => {
    localStorage.setItem(`onboarding_done_${user?.id}`, "1");
    setShowOnboarding(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col max-w-md mx-auto">
      {showOnboarding && <Week1OnboardingModal user={user} onDone={handleOnboardingDone} />}
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-5 pt-12 pb-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-900/40">
              <span className="text-white text-xs font-black tracking-tight">EZ</span>
            </div>
            <div>
              <p className="text-slate-900 font-bold text-base leading-tight">
                EZ Move <span className="text-orange-500">AI</span>
              </p>
              {user?.full_name && (
                <p className="text-slate-400 text-[11px] leading-tight">Hi, {user.full_name.split(" ")[0]}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {closeStatus && (
              <div className={`${closeStatus.color} rounded-full px-3 py-1`}>
                <span className="text-white text-[11px] font-bold">{closeStatus.label}</span>
              </div>
            )}
            <button
              onClick={() => base44.auth.logout(createPageUrl("Register"))}
              className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
            >
              <span className="text-slate-600 text-xs font-bold">{user?.full_name?.[0] || "U"}</span>
            </button>
          </div>
        </div>

        {/* Progress bar toward close */}
        {user?.estimated_close_date && user?.registration_date && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider">Move Timeline</span>
              <span className="text-orange-400 text-[10px] font-bold">
                {Math.max(0, Math.min(100, Math.round(
                  (differenceInDays(new Date(), parseISO(user.registration_date)) /
                    differenceInDays(parseISO(user.estimated_close_date), parseISO(user.registration_date))) * 100
                )))}% complete
              </span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full transition-all duration-700"
                style={{
                  width: `${Math.max(2, Math.min(100, Math.round(
                    (differenceInDays(new Date(), parseISO(user.registration_date)) /
                      Math.max(1, differenceInDays(parseISO(user.estimated_close_date), parseISO(user.registration_date)))) * 100
                  )))}%`
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-24">
        {activeTab === "plan" && <ChecklistPanel user={user} />}
        {activeTab === "inventory" && <MyStuffTab user={user} onNavigate={setActiveTab} />}
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
    </div>
  );
}