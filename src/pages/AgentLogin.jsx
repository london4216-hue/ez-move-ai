import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";
import { Loader2, ArrowRight } from "lucide-react";

export default function AgentLogin() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.me().then(user => {
      if (user?.role === "admin") {
        navigate(createPageUrl("AgentDashboard"));
      } else {
        setLoading(false);
      }
    }).catch(() => setLoading(false));
  }, []);

  const handleLogin = () => {
    setLoading(true);
    base44.auth.redirectToLogin("/AgentOnboarding");
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-br from-orange-500 to-orange-600 mb-5 shadow-2xl shadow-orange-900/50">
            <span className="text-white text-xl font-black">EZ</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Agent Portal
          </h1>
          <p className="text-slate-400 text-sm">
            Manage your clients and moving timelines
          </p>
        </div>

        {/* Features */}
        <div className="space-y-3 mb-8">
          {[
            { emoji: "👥", title: "Client Management", desc: "Invite clients and track their move progress" },
            { emoji: "📅", title: "Close Date Control", desc: "Set closing dates that drive the project plan" },
            { emoji: "💳", title: "Simple Billing", desc: "$40 per client, charged on activation" },
          ].map(f => (
            <div key={f.title} className="flex items-start gap-3 bg-slate-800/50 rounded-2xl p-3.5">
              <span className="text-xl">{f.emoji}</span>
              <div>
                <p className="text-sm font-bold text-white">{f.title}</p>
                <p className="text-xs text-slate-400">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-700 rounded-2xl p-4 mb-4">
            <p className="text-sm text-red-400 font-medium">{error}</p>
          </div>
        )}

        <button
          onClick={handleLogin}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-base shadow-lg shadow-orange-900/40 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          Sign In as Agent <ArrowRight className="w-5 h-5" />
        </button>

        <p className="text-center text-xs text-slate-500 mt-5">
          Agent access requires admin role.{" "}
          <span className="text-orange-400 font-semibold">Contact support</span> to get set up.
        </p>
      </div>
    </div>
  );
}