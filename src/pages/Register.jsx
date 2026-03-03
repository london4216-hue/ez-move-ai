import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";
import CodeEntry from "@/components/register/CodeEntry";

export default function Register() {
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // If user is already logged in and has data, go to dashboard
  useEffect(() => {
    base44.auth.me().then(user => {
      if (user?.home_address || user?.registration_date) {
        navigate(createPageUrl("Dashboard"));
      }
    }).catch(() => {});
  }, []);

  const handleCodeVerified = async (code) => {
    setError("");
    try {
      const currentUser = await base44.auth.me();
      // Find client record and copy agent-entered data to the user profile
      const clients = await base44.entities.Client.filter({ invitation_code: code });
      if (clients.length > 0) {
        const client = clients[0];
        await base44.entities.Client.update(client.id, {
          status: "registered",
          user_email: currentUser.email,
        });
        await base44.auth.updateMe({
          home_address: client.home_address || "",
          estimated_close_date: client.close_date || "",
          registration_date: new Date().toISOString().split("T")[0],
        });
      } else {
        await base44.auth.updateMe({
          registration_date: new Date().toISOString().split("T")[0],
        });
      }
      navigate(createPageUrl("Dashboard"));
    } catch (e) {
      console.error("Registration error:", e);
      setError("Something went wrong. Please try again.");
    }
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

      <div className="w-full max-w-sm bg-white rounded-3xl p-7 shadow-2xl mt-16">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-2xl p-3">
            <p className="text-sm text-red-600 font-medium">{error}</p>
          </div>
        )}
        <CodeEntry onVerified={handleCodeVerified} />
      </div>

      <p className="text-xs text-slate-400 mt-6 text-center max-w-xs">
        Enter the 4-digit code your agent sent you to get started.
      </p>
    </div>
  );
}