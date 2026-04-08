import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import PostOnboardingSteps from "@/components/register/PostOnboardingSteps";
import MoverQuoteOnboarding from "@/components/register/MoverQuoteOnboarding";
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
  const [preOnboardingDone, setPreOnboardingDone] = useState(false);
  const [showMoverWorkflow, setShowMoverWorkflow] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Reset demo state on page load
    const demoId = getDemoUserId();
    localStorage.removeItem(`mq_${demoId}`);
    localStorage.removeItem(`pre_onboarding_${demoId}`);
    localStorage.removeItem(`demo_mover_cost_${demoId}`);
    
    if (PUBLIC_DEMO_MODE) {
      const demoAddress = localStorage.getItem('demo_home_address') || '742 Evergreen Terrace, Springfield, IL 62704';
      const demoCloseDate = localStorage.getItem('demo_close_date') || (() => {
        const d = new Date(); d.setDate(d.getDate() + 30); return d.toISOString().split('T')[0];
      })();
      setUser({ id: demoId, home_address: demoAddress, estimated_close_date: demoCloseDate });
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
    <div className="min-h-screen bg-slate-50">
      {!preOnboardingDone ? (
        <MoverQuoteOnboarding
          userId={user.id}
          onComplete={(data) => {
            localStorage.setItem(`pre_onboarding_done_${user.id}`, "true");
            setPreOnboardingDone(true);
          }}
        />
      ) : (
        <PostOnboardingSteps
          userId={user.id}
          userAddress={user.home_address || ""}
          onComplete={handleComplete}
          onMoverWorkflow={() => setShowMoverWorkflow(true)}
        />
      )}
    </div>
  );
}