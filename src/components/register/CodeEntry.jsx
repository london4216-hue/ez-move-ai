import { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";

export default function CodeEntry({ onVerified }) {
  const [digits, setDigits] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const refs = [useRef(), useRef(), useRef(), useRef()];

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
    setLoading(true);
    setError("");
    try {
      const clients = await base44.entities.Client.filter({ invitation_code: code });
      if (clients.length === 0) {
        setError("Invalid code. Please check your invite.");
        setDigits(["", "", "", ""]);
        refs[0].current?.focus();
        return;
      }
      await onVerified(code);
    } catch (e) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const allFilled = digits.every(d => d);

  return (
    <div className="w-full max-w-sm mx-auto px-6 py-10 flex flex-col min-h-screen justify-center">
      {/* Logo */}
      <div className="flex items-center gap-2.5 mb-14">
        <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center">
          <span className="text-white text-sm font-black tracking-tight">EZ</span>
        </div>
        <span className="text-xl font-bold text-slate-900">EZ Move <span className="text-orange-500">AI</span></span>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        <div className="mb-10">
          <h1 className="text-4xl font-black text-slate-900 leading-tight mb-3">Enter your code</h1>
          <p className="text-slate-500 text-base">Your agent sent you a 4-digit invite code</p>
        </div>

        <div className="flex gap-3 mb-6">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={refs[i]}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKey(i, e)}
              className={`flex-1 h-20 text-center text-3xl font-black rounded-2xl border-2 outline-none transition-all
                ${d ? "border-orange-500 bg-orange-50 text-slate-900" : "border-slate-200 bg-white text-slate-300"}
                focus:border-orange-500 focus:ring-4 focus:ring-orange-100`}
            />
          ))}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-4 mb-6">
            <p className="text-sm text-red-600 font-medium">{error}</p>
          </div>
        )}

        <button
          onClick={handleVerify}
          disabled={!allFilled || loading}
          className="btn-primary"
        >
          {loading ? "Checking..." : "Continue →"}
        </button>

        <p className="text-center text-sm text-slate-400 mt-6">
          Need help? <span className="text-orange-500 font-semibold">Contact your agent</span>
        </p>
      </div>
    </div>
  );
}