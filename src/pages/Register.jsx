import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";
import CodeEntry from "@/components/register/CodeEntry";
import ProfileSetup from "@/components/register/ProfileSetup";
import Week1Setup from "@/components/register/Week1Setup";

export default function Register() {
  const [step, setStep] = useState("code"); // code | profile | week1
  const navigate = useNavigate();

  const handleCodeVerified = async () => {
    // If already onboarded, go straight to dashboard after code
    try {
      const u = await base44.auth.me();
      if (u?.onboarded) { navigate(createPageUrl("Dashboard")); return; }
    } catch (_) {}
    setStep("profile");
  };

  const handleProfileComplete = async (data) => {
    try {
      const userData = {
        user_type: data.user_type,
        close_date: data.close_date,
        registration_date: data.registration_date
      };
      await base44.auth.updateMe(userData);
      setStep("week1");
    } catch (e) {
      console.error("Profile update error:", e);
      alert("Error saving profile. Please try again.");
    }
  };

  const handleWeek1Complete = async () => {
    await base44.auth.updateMe({ onboarded: true, current_week: 1 });
    navigate(createPageUrl("Dashboard"));
  };

  return (
    <div className="min-h-screen bg-[#F5F3EF] flex flex-col items-center justify-center p-4">
      {step === "code" && <CodeEntry onVerified={handleCodeVerified} />}
      {step === "profile" && <ProfileSetup onComplete={handleProfileComplete} />}
      {step === "week1" && <Week1Setup onComplete={handleWeek1Complete} />}
    </div>
  );
}