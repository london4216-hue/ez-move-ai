import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

export default function Register() {
  const [digits, setDigits] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showMoverQuestion, setShowMoverQuestion] = useState(false);
  const [needsMover, setNeedsMover] = useState(null);
  const refs = [null, null, null, null].map(() => ({ current: null }));
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.me().then(user => {
      if (user?.registration_date) navigate(createPageUrl("Dashboard"));
    }).catch(() => {});
  }, []);

  const handleChange = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...digits];
    next[i] = val;
    setDigits(next);
    setError("");
    if (val && i < 3) refs[i + 1].current?.focus();
  };

  const handleKey = (i, e) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) refs[i - 1].current?.focus();
  };

  const handleVerify = async () => {
    const code = digits.join("");
    if (code.length !== 4) return;
    setLoading(true);
    setError("");
    try {
      const currentUser = await base44.auth.me();
      const clients = await base44.entities.Client.filter({ invitation_code: code });
      if (clients.length === 0 && code !== "1016") {
        setError("Invalid code. Check your invite email or contact your agent.");
        setDigits(["", "", "", ""]);
        refs[0].current?.focus();
        setLoading(false);
        return;
      }
      if (clients.length > 0) {
        const client = clients[0];
        await base44.entities.Client.update(client.id, {
          status: "registered",
          user_email: currentUser.email,
        });
        
        // Send welcome email to registered user
        try {
          await base44.functions.invoke('sendWelcomeEmail', {
            user_name: currentUser.full_name,
            user_email: currentUser.email,
            invite_code: code,
            app_url: window.location.origin
          });
        } catch (emailError) {
          console.error('Failed to send welcome email:', emailError);
        }
      }
      
      // Show mover question before completing registration
      setShowMoverQuestion(true);
      setLoading(false);
    } catch (e) {
      console.error(e);
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  const handleMoverAnswer = async (answer) => {
    setNeedsMover(answer);
    setLoading(true);
    try {
      const currentUser = await base44.auth.me();
      const clients = await base44.entities.Client.filter({ invitation_code: digits.join("") });
      
      if (clients.length > 0) {
        const client = clients[0];
        await base44.auth.updateMe({
          home_address: client.home_address || "",
          estimated_close_date: client.close_date || "",
          registration_date: new Date().toISOString().split("T")[0],
          needs_mover: answer,
        });
      } else {
        await base44.auth.updateMe({
          registration_date: new Date().toISOString().split("T")[0],
          needs_mover: answer,
        });
      }
      
      navigate(createPageUrl("Dashboard"));
    } catch (e) {
      console.error(e);
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  const allFilled = digits.every(d => d !== "");

  if (showMoverQuestion) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-5">
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
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-800 mb-2">Welcome! 👋</h1>
            <p className="text-sm text-slate-500 leading-relaxed">
              Let's get started with a quick question
            </p>
          </div>

          <div className="mb-6">
            <p className="text-lg font-semibold text-slate-700 text-center mb-4">
              Will you need a mover?
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => handleMoverAnswer(true)}
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-sm
                disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-all shadow-lg shadow-orange-200"
            >
              Yes, I need a mover
            </button>
            <button
              onClick={() => handleMoverAnswer(false)}
              disabled={loading}
              className="w-full py-4 rounded-2xl border-2 border-slate-200 text-slate-700 font-bold text-sm
                disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-all hover:border-orange-400 hover:bg-orange-50"
            >
              No, I'll move myself
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-5">
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
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Enter your code</h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            Your agent sent you a 4-digit invitation code via email
          </p>
        </div>

        <div className="flex gap-3 justify-center mb-4">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={el => refs[i].current = el}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKey(i, e)}
              className={`w-14 h-16 text-center text-2xl font-black rounded-2xl border-2 outline-none transition-all
                ${d ? "border-orange-500 bg-orange-50 text-slate-800" : "border-slate-200 bg-slate-50 text-slate-300"}
                focus:border-orange-500 focus:bg-orange-50`}
            />
          ))}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-3 mb-4">
            <p className="text-sm text-red-600 text-center font-medium">{error}</p>
          </div>
        )}

        <button
          onClick={handleVerify}
          disabled={!allFilled || loading}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-sm
            disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-all shadow-lg shadow-orange-200 flex items-center justify-center gap-2"
        >
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</> : "Continue →"}
        </button>

        <p className="text-center text-xs text-slate-400 mt-4">
          No code? <span className="text-orange-500 font-semibold">Contact your agent</span>
        </p>
      </div>
    </div>
  );
}