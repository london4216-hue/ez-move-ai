import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import Week1Setup from "@/components/register/Week1Setup";
import { PUBLIC_DEMO_MODE } from "@/lib/featureFlags";

function getDemoUserId() {
  let id = localStorage.getItem('demo_user_id');
  if (!id) {
    id = 'demo-' + Math.random().toString(36).slice(2, 10);
    localStorage.setItem('demo_user_id', id);
  }
  return id;
}

export default function OnboardingWeek1() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (PUBLIC_DEMO_MODE) {
      setUser({ id: getDemoUserId(), home_address: '' });
      setLoading(false);
      return;
    }
    base44.auth.me().then(u => {
      if (!u) {
        navigate(createPageUrl("Register"));
        return;
      }
      setUser(u);
      setLoading(false);
    }).catch(() => navigate(createPageUrl("Register")));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleComplete = async (answerMap) => {
    const userId = user.id;
    localStorage.setItem(`user_selections_${userId}`, JSON.stringify(answerMap || {}));
    localStorage.setItem(`week1_answers_${userId}`, JSON.stringify(answerMap || {}));
    localStorage.setItem(`walkthrough_done_w1_${userId}`, "1");
    localStorage.setItem(`onboarding_done_${userId}`, "true");
    if (!PUBLIC_DEMO_MODE) {
      try {
        const currentUser = await base44.auth.me();
        if (currentUser) {
          localStorage.setItem(`user_selections_${currentUser.id}`, JSON.stringify(answerMap || {}));
          localStorage.setItem(`onboarding_done_${currentUser.id}`, "true");
        }
      } catch {}
    }
    navigate(createPageUrl("Dashboard"));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2.5 mb-8 justify-center">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-200">
            <span className="text-white text-sm font-black">EZ</span>
          </div>
          <span className="text-slate-800 font-bold text-lg tracking-tight">
            EZ Move <span className="text-orange-500">AI</span>
          </span>
        </div>
        <Week1Setup
          userId={user.id}
          userAddress={user.home_address || ""}
          onComplete={handleComplete}
          hideButtons={false}
        />
      </div>
    </div>
  );
}