import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";
import CodeEntry from "@/components/register/CodeEntry";
import NamePhoneEntry from "@/components/register/NamePhoneEntry";
import TextApproval from "@/components/register/TextApproval";
import ProfileSetup from "@/components/register/ProfileSetup";

export default function Register() {
  const [step, setStep] = useState("code");
  const [error, setError] = useState("");
  const [phone, setPhone] = useState("");
  const [userData, setUserData] = useState({});
  const [verifiedCode, setVerifiedCode] = useState("");
  const navigate = useNavigate();

  const handleCodeVerified = (code) => {
    setVerifiedCode(code);
    setError("");
    setStep("namePhone");
  };

  const handleNamePhoneComplete = (data) => {
    setError("");
    setPhone(data.phone);
    setUserData(data);
    setStep("textApproval");
  };

  const handleTextApprovalComplete = () => {
    setError("");
    setStep("profile");
  };

  const handleProfileComplete = async (data) => {
    setError("");
    try {
      const currentUser = await base44.auth.me();

      // Get close date from the client record
      let closeDate = data.estimated_close_date;
      let clientRecord = null;

      if (verifiedCode) {
        const clients = await base44.entities.Client.filter({ invitation_code: verifiedCode });
        if (clients.length > 0) {
          clientRecord = clients[0];
          if (clientRecord.close_date) closeDate = clientRecord.close_date;
          await base44.entities.Client.update(clientRecord.id, {
            status: "registered",
            user_email: currentUser.email,
            user_name: `${userData.firstName} ${userData.lastName}`.trim(),
            phone: userData.phone,
          });
        }
      }

      await base44.auth.updateMe({
        first_name: userData.firstName,
        last_name: userData.lastName,
        phone: userData.phone,
        home_address: data.home_address,
        user_type: data.user_type,
        estimated_close_date: closeDate,
        registration_date: new Date().toISOString().split("T")[0],
      });

      // Send welcome email
      await base44.functions.invoke("sendWelcomeEmail", {
        user_name: userData.firstName,
        user_email: currentUser.email,
      });
    } catch (e) {
      console.error("Profile save error:", e);
    }
    navigate(createPageUrl("Dashboard"));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-5">
      {/* Logo */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-200">
            <span className="text-white text-sm font-black">EZ</span>
          </div>
          <span className="text-slate-800 font-bold text-lg tracking-tight">
            EZ Move <span className="text-orange-500">AI</span>
          </span>
        </div>
      </div>

      {/* Step progress dots */}
      <div className="absolute top-28 left-1/2 -translate-x-1/2 flex gap-2">
        {["code", "namePhone", "textApproval", "profile"].map((s, i) => (
          <div
            key={s}
            className={`rounded-full transition-all duration-300 ${
              s === step
                ? "w-6 h-2 bg-orange-500"
                : ["code", "namePhone", "textApproval", "profile"].indexOf(step) > i
                ? "w-2 h-2 bg-orange-400"
                : "w-2 h-2 bg-slate-300"
            }`}
          />
        ))}
      </div>

      <div className="w-full max-w-sm bg-white rounded-3xl p-7 shadow-2xl mt-16">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-2xl p-3">
            <p className="text-sm text-red-600 font-medium">{error}</p>
          </div>
        )}
        {step === "code" && <CodeEntry onVerified={handleCodeVerified} />}
        {step === "namePhone" && <NamePhoneEntry onComplete={handleNamePhoneComplete} />}
        {step === "textApproval" && <TextApproval phone={phone} onComplete={handleTextApprovalComplete} />}
        {step === "profile" && <ProfileSetup onComplete={handleProfileComplete} />}
      </div>
    </div>
  );
}