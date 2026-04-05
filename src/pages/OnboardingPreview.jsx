import { useState } from "react";
import Week1Setup from "@/components/register/Week1Setup";

export default function OnboardingPreview() {
  const [step, setStep] = useState("setup");

  const handleComplete = (answerMap) => {
    setStep("complete");
  };

  if (step === "complete") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-600 to-emerald-900 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl p-8 max-w-md text-center shadow-2xl">
          <div className="text-5xl mb-4">✅</div>
          <h1 className="text-2xl font-black text-emerald-900 mb-2">Preview Complete</h1>
          <p className="text-slate-600 mb-6">You've completed the Week 1 onboarding wizard. In production, this would redirect to the client dashboard.</p>
          <button
            onClick={() => setStep("setup")}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all"
          >
            Restart Preview
          </button>
        </div>
      </div>
    );
  }

  return (
    <Week1Setup
      userId="preview_user_id"
      userAddress="123 Main St, Boston, MA 02101"
      onComplete={handleComplete}
    />
  );
}