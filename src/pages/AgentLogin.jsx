import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";

export default function AgentLogin() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await base44.auth.me();
      if (user?.role === "admin") {
        navigate(createPageUrl("AgentDashboard"));
      } else {
        setError("Only agents and brokers can access this portal.");
      }
    } catch {
      setError("Please sign in to continue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-12">
          <div className="inline-flex w-16 h-16 bg-orange-500 rounded-3xl items-center justify-center mb-5">
            <span className="text-white text-xl font-black">EZ</span>
          </div>
          <h1 className="text-3xl font-black text-white mb-2">Agent Portal</h1>
          <p className="text-slate-400 text-sm">Manage clients and moving plans</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
              <p className="text-sm text-red-400 font-medium">{error}</p>
            </div>
          )}

          <div className="bg-slate-800 rounded-2xl p-5 text-center border border-slate-700">
            <p className="text-slate-400 text-sm mb-3">You'll be authenticated via your platform account.</p>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-orange-500 text-white font-bold text-sm disabled:opacity-40 active:scale-[0.98] transition-all"
            >
              {loading ? "Checking access..." : "Sign In as Agent →"}
            </button>
          </div>
        </form>

        <p className="text-center text-xs text-slate-600 mt-8">
          Need an account? <span className="text-orange-500 font-semibold">Contact support</span>
        </p>
      </div>
    </div>
  );
}