import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";
import CodeEntry from "@/components/register/CodeEntry";
import NamePhoneEntry from "@/components/register/NamePhoneEntry";
import TextApproval from "@/components/register/TextApproval";
import ProfileSetup from "@/components/register/ProfileSetup";

export default function Register() {
  const [step, setStep] = useState("code"); // code | namePhone | textApproval | profile
  const [error, setError] = useState("");
  const [phone, setPhone] = useState("");
  const [userData, setUserData] = useState({});
  const navigate = useNavigate();

  const handleCodeVerified = async () => {
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
      await base44.auth.updateMe({
        first_name: userData.firstName,
        last_name: userData.lastName,
        phone: userData.phone,
        home_address: data.home_address,
        user_type: data.user_type,
        estimated_close_date: data.estimated_close_date,
        registration_date: data.registration_date
      });

      // Send welcome and congratulations emails
      await base44.functions.invoke('sendWelcomeEmail', {
        user_name: userData.firstName,
        user_email: await base44.auth.me().then(u => u.email)
      });

      // Create client record in agent system
      const invitationCode = new URLSearchParams(window.location.search).get('code');
      if (invitationCode) {
        const clients = await base44.entities.Client.filter({
          invitation_code: invitationCode
        });
        if (clients.length > 0) {
          await base44.entities.Client.update(clients[0].id, {
            status: 'registered',
            user_email: await base44.auth.me().then(u => u.email)
          });
        }
      }
    } catch (e) {
      console.error("Profile save error:", e);
    }
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
      {step === "namePhone" && <NamePhoneEntry onComplete={handleNamePhoneComplete} />}
      {step === "textApproval" && <TextApproval phone={phone} onComplete={handleTextApprovalComplete} />}
      {step === "profile" && <ProfileSetup onComplete={handleProfileComplete} />}
    </div>
  );
}