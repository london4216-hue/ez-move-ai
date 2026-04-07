import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PUBLIC_DEMO_MODE } from "@/lib/featureFlags";
import Dashboard from "./Dashboard";

export default function BuyerExperience() {
  const navigate = useNavigate();

  useEffect(() => {
    if (PUBLIC_DEMO_MODE) {
      const demoUserId = 'demo-user';
      const onboardingDone = localStorage.getItem(`onboarding_done_${demoUserId}`);
      if (!onboardingDone) {
        navigate("/OnboardingWeek1");
      }
    }
  }, [navigate]);

  return <Dashboard />;
}