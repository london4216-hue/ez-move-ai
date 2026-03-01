import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";
import CodeEntry from "@/components/register/CodeEntry";
import ProfileSetup from "@/components/register/ProfileSetup";
import Week1Setup from "@/components/register/Week1Setup";

export default function Register() {
  const [step, setStep] = useState("code"); // code | profile | week1
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleCodeVerified = async () => {
    setError("");
    try {
      // Just move to profile setup - let profile handle auth updates
      setStep("profile");
    } catch (e) {
      console.error("Code verification error:", e);
      setError("Failed to verify code. Please try again.");
    }
  };

  const handleProfileComplete = async (data) => {
    setError("");
    // Store profile data and move to week1 - will sync to user on week1 complete
    setStep("week1");
  };

  const handleWeek1Complete = async () => {
    setError("");
    try {
      await base44.auth.updateMe({ onboarded: true, current_week: 1 });
      navigate(createPageUrl("Dashboard"));
    } catch (e) {
      console.error("Week1 completion error:", e);
      setError("Failed to complete setup. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F3EF] flex flex-col items-center justify-center p-4">
      {error && (
        <div className="absolute top-4 left-4 right-4 bg-red-50 border border-red-200 rounded-xl p-3 max-w-sm">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      {step === "code" && <CodeEntry onVerified={handleCodeVerified} />}
      {step === "profile" && <ProfileSetup onComplete={handleProfileComplete} />}
      {step === "week1" && <Week1Setup onComplete={handleWeek1Complete} />}
    </div>
  );
}