import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";

export default function AgentLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // This would use your auth system - for now, we'll just validate
      const user = await base44.auth.me();
      if (user?.role === "admin") {
        navigate(createPageUrl("AgentDashboard"));
      } else {
        setError("Only agents and brokers can access this portal");
      }
    } catch (err) {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F3EF] to-[#FAF8F5] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-br from-[#C85A17] to-[#F97316] mb-6">
            <span className="text-white text-lg font-bold">EZ</span>
          </div>
          <h1 className="text-3xl font-bold text-[#1A1A2E] mb-2">Agent Portal</h1>
          <p className="text-sm text-[#6B7280]">Manage your clients and moving plans</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-[#6B7280] mb-2 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@agency.com"
              className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-white text-[#1A1A2E] text-sm focus:outline-none focus:border-[#C85A17] focus:ring-2 focus:ring-[#C85A17]/10"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#6B7280] mb-2 block">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-white text-[#1A1A2E] text-sm focus:outline-none focus:border-[#C85A17] focus:ring-2 focus:ring-[#C85A17]/10"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#C85A17] to-[#F97316] text-white font-bold text-sm disabled:opacity-40 active:scale-[0.98] transition-all"
          >
            {loading ? "Logging in..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-xs text-[#6B7280] mt-6">
          Don't have an account? <span className="text-[#C85A17] font-semibold">Contact support</span>
        </p>
      </div>
    </div>
  );
}