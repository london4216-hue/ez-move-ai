import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PUBLIC_DEMO_MODE } from "@/lib/featureFlags";
import Dashboard from "./Dashboard";

export default function SellerExperience() {
  const navigate = useNavigate();
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    if (PUBLIC_DEMO_MODE) {
      const demoUserId = 'demo-user';
      const onboardingDone = localStorage.getItem(`onboarding_done_${demoUserId}`);
      if (!onboardingDone) {
        setShouldRender(false);
        navigate("/OnboardingWeek1");
      }
    }
  }, [navigate]);

  if (!shouldRender) {
    return null;
  }

  return <Dashboard />;
}