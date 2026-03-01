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
    setStep("profile");
  };

  const handleProfileComplete = async (data) => {
    setError("");
    setStep("week1");
  };

  const handleWeek1Complete = async () => {
    setError("");
    navigate(createPageUrl("Dashboard"));
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