import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { setSession, getSession, ROLE_PATHS } from "@/lib/internalAuth";

export default function SignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (session) navigate(ROLE_PATHS[session.role] || "/", { replace: true });
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const users = await base44.entities.InternalUsers.filter({ email: email.toLowerCase().trim() });
      const match = users.find(u => u.password === password);
      if (!match) { setError("Invalid email or password."); setLoading(false); return; }
      setSession({ id: match.id, email: match.email, role: match.role });
      navigate(ROLE_PATHS[match.role] || "/", { replace: true });
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0c0f1a] flex flex-col items-center justify-center px-4">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-900/50">
          <span className="text-white font-black text-sm">EZ</span>
        </div>
        <p className="font-black text-white text-2xl">EZ Move <span className="text-orange-400">AI</span></p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white/5 border border-white/10 rounded-2xl p-8 space-y-5"
      >
        <h1 className="text-white font-bold text-xl text-center">Sign In</h1>

        <div className="space-y-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-orange-500 text-sm"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-orange-500 text-sm"
          />
        </div>

        {error && <p className="text-red-400 text-sm text-center">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition-all disabled:opacity-50"
        >
          {loading ? "Signing in…" : "Sign In"}
        </button>

        <div className="border-t border-white/10 pt-4 space-y-1 text-xs text-white/30 text-center">
          <p>agent@ezmoveai.com · broker@ezmoveai.com · superadmin@ezmoveai.com</p>
          <p>buyer@moveezai.com · seller@moveezai.com</p>
          <p className="text-white/20">password: <span className="font-mono">password</span></p>
        </div>
      </form>
    </div>
  );
}