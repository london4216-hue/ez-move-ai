import { useState, useRef } from "react";

export default function CodeEntry({ onVerified }) {
  const [digits, setDigits] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
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
    if (code === "1016") {
      try {
        await onVerified();
      } catch (e) {
        setError("Something went wrong. Please try again.");
      }
    } else {
      setError("Invalid code. Please check your invite email.");
      setDigits(["", "", "", ""]);
      refs[0].current?.focus();
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-br from-[#C85A17] to-[#F97316] mb-6 mx-auto">
          <span className="text-white text-lg font-bold">EZ</span>
        </div>
        <h1 className="text-3xl font-bold text-[#1A1A2E] mb-2">Welcome back</h1>
        <p className="text-sm text-[#6B7280]">Enter the 4-digit code your agent sent you</p>
      </div>

      <div className="space-y-6">
        <div className="flex gap-3 justify-center">
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
              className={`w-16 h-20 text-center text-3xl font-bold rounded-2xl border-2 outline-none transition-all
                ${d ? "border-[#C85A17] bg-[#FEF3ED] text-[#1A1A2E]" : "border-[#E5E7EB] bg-white text-[#D1D5DB]"}
                focus:border-[#C85A17] focus:shadow-[0_0_0_4px_rgba(200,90,23,0.1)]`}
            />
          ))}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-3.5">
            <p className="text-sm text-red-600 text-center font-medium">{error}</p>
          </div>
        )}

        <button
          onClick={handleVerify}
          disabled={digits.some(d => !d)}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#C85A17] to-[#F97316] text-white font-bold text-base
            disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-all shadow-[0_4px_12px_rgba(200,90,23,0.2)]"
        >
          Continue
        </button>

        <p className="text-center text-xs text-[#9CA3AF]">
          Questions? <span className="text-[#C85A17] font-semibold">Contact your agent</span>
        </p>
      </div>
    </div>
  );
}