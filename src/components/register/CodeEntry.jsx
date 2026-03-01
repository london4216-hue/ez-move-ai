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

  const handleVerify = () => {
    const code = digits.join("");
    if (code === "9936") {
      onVerified();
    } else {
      setError("Invalid code. Please check your invite email.");
      setDigits(["", "", "", ""]);
      refs[0].current?.focus();
    }
  };

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 mb-6">
          <div className="w-8 h-8 bg-[#1A1A2E] rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-bold">EZ</span>
          </div>
          <span className="text-xl font-semibold text-[#1A1A2E] tracking-tight">EZ Move <span className="text-[#4F7EFF]">AI</span></span>
        </div>
        <h1 className="text-2xl font-bold text-[#1A1A2E] mb-2">Enter your invite code</h1>
        <p className="text-sm text-[#6B7280]">Your broker or agent sent you a 4-digit code</p>
      </div>

      <div className="flex gap-3 justify-center mb-6">
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
            className={`w-14 h-16 text-center text-2xl font-bold rounded-2xl border-2 outline-none transition-all bg-white
              ${d ? "border-[#4F7EFF] text-[#1A1A2E]" : "border-[#E5E7EB] text-[#9CA3AF]"}
              focus:border-[#4F7EFF] focus:shadow-[0_0_0_4px_rgba(79,126,255,0.1)]`}
          />
        ))}
      </div>

      {error && (
        <p className="text-center text-sm text-red-500 mb-4">{error}</p>
      )}

      <button
        onClick={handleVerify}
        disabled={digits.some(d => !d)}
        className="w-full py-4 rounded-2xl bg-[#1A1A2E] text-white font-semibold text-base
          disabled:opacity-40 active:scale-[0.98] transition-all"
      >
        Continue
      </button>

      <p className="text-center text-xs text-[#9CA3AF] mt-6">
        Don't have a code? Contact your real estate agent.
      </p>
    </div>
  );
}