import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import Week1Setup from "@/components/register/Week1Setup";

export default function OnboardingWeek1() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
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

  const handleComplete = async () => {
    // Mark Week1 onboarding as done
    localStorage.setItem(`onboarding_done_${user.id}`, "true");
    // Redirect to main dashboard
    navigate(createPageUrl("Dashboard"));
  };

  return (
    <Week1Setup
      userId={user.id}
      userAddress={user.home_address || ""}
      onComplete={handleComplete}
    />
  );
}