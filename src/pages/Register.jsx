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
  const [phone, setPhone] = useState("");
  const [userData, setUserData] = useState({});
  const [inviteCode, setInviteCode] = useState("");
  const navigate = useNavigate();

  const handleCodeVerified = async (code) => {
    // Validate code against DB
    const clients = await base44.entities.Client.filter({ invitation_code: code });
    if (clients.length === 0) throw new Error("Invalid code");
    setInviteCode(code);
    setStep("namePhone");
  };

  const handleNamePhoneComplete = (data) => {
    setPhone(data.phone);
    setUserData(data);
    setStep("textApproval");
  };

  const handleTextApprovalComplete = () => {
    setStep("profile");
  };

  const handleProfileComplete = async (data) => {
    try {
      const currentUser = await base44.auth.me();

      // Get close date from client record
      let closeDate = data.estimated_close_date;
      if (inviteCode) {
        const clients = await base44.entities.Client.filter({ invitation_code: inviteCode });
        if (clients.length > 0 && clients[0].close_date) {
          closeDate = clients[0].close_date;
          await base44.entities.Client.update(clients[0].id, {
            status: "registered",
            user_email: currentUser.email
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
        registration_date: data.registration_date
      });

      await base44.functions.invoke("sendWelcomeEmail", {
        user_name: userData.firstName,
        user_email: currentUser.email
      });
    } catch (e) {
      console.error("Profile save error:", e);
    }
    navigate(createPageUrl("Dashboard"));
  };

  return (
    <div className="min-h-screen bg-white">
      {step === "code" && <CodeEntry onVerified={handleCodeVerified} />}
      {step === "namePhone" && <NamePhoneEntry onComplete={handleNamePhoneComplete} />}
      {step === "textApproval" && <TextApproval phone={phone} onComplete={handleTextApprovalComplete} />}
      {step === "profile" && <ProfileSetup onComplete={handleProfileComplete} />}
    </div>
  );
}