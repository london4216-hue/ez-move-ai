import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PUBLIC_DEMO_MODE } from "@/lib/featureFlags";
import Week1OnboardingModal from "@/components/dashboard/Week1OnboardingModal";

export default function OnboardingWeek1() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Reset demo state on page load
    if (PUBLIC_DEMO_MODE) {
      const demoUserId = 'demo-user';
      
      // Clear all demo-related localStorage keys
      const keysToRemove = [
        `onboarding_done_${demoUserId}`,
        `onboarding_progress_${demoUserId}`,
        `moveContext_${demoUserId}`,
        `demo_inventory_${demoUserId}`,
        `demo_rooms_${demoUserId}`,
        `demo_special_items_${demoUserId}`,
        `demo_boxes_${demoUserId}`,
        `demo_distance_${demoUserId}`,
        `demo_home_type_${demoUserId}`,
        `demo_access_${demoUserId}`,
        `demo_packing_${demoUserId}`,
        `demo_quote_${demoUserId}`,
      ];
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });
      
      // Create fresh demo user
      const demoUser = {
        id: demoUserId,
        email: 'demo@demo.local',
        full_name: 'Demo User',
        role: 'user',
        is_demo: true
      };
      
      setUser(demoUser);
      setLoading(false);
    } else {
      // Non-demo mode: check auth
      const checkAuth = async () => {
        try {
          const { base44 } = await import("@/api/base44Client");
          const u = await base44.auth.me();
          setUser(u);
        } catch {
          navigate("/Register");
          return;
        }
        setLoading(false);
      };
      checkAuth();
    }
  }, [navigate]);

  const handleOnboardingDone = () => {
    // Mark onboarding as complete and navigate to buyer experience
    if (user?.id) {
      localStorage.setItem(`onboarding_done_${user.id}`, 'true');
    }
    navigate("/BuyerExperience");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm font-medium">Loading onboarding…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Week1OnboardingModal user={user} onDone={handleOnboardingDone} />
    </div>
  );
}