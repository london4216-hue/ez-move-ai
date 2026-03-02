import { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2 } from "lucide-react";

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
    if (code.length !== 4) return;
    setLoading(true);
    setError("");
    try {
      const clients = await base44.entities.Client.filter({ invitation_code: code });
      if (clients.length > 0) {
        onVerified(code);
      } else {
        setError("Invalid code. Check your invite email or contact your agent.");
        setDigits(["", "", "", ""]);
        refs[0].current?.focus();
      }
    } catch (e) {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  const allFilled = digits.every(d => d !== "");

  return (
    <div className="w-full">
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
            ref={refs[i]}
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
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</> : "Continue"}
      </button>

      <p className="text-center text-xs text-slate-400 mt-4">
        No code? <span className="text-orange-500 font-semibold">Contact your agent</span>
      </p>
    </div>
  );
}