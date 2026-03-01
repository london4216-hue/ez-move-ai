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
    if (code === "1016") {
      onVerified();
    } else {
      setError("Invalid code. Please check your invite email.");
      setDigits(["", "", "", ""]);
      refs[0].current?.focus();
    }
  };

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 mb-8">
          <div className="w-10 h-10 bg-[#1A1A2E] rounded-xl flex items-center justify-center">
            <span className="text-white text-sm font-bold">EZ</span>
          </div>
          <span className="text-2xl font-semibold text-[#1A1A2E] tracking-tight">EZ Move <span className="text-[#F97316]">AI</span></span>
        </div>
        <div className="mb-6 p-4 bg-[#FFF7ED] rounded-2xl border border-[#FED7AA]">
          <p className="text-xs font-bold text-[#C85A17] uppercase tracking-wider">Required to Begin</p>
          <h1 className="text-3xl font-bold text-[#1A1A2E] mt-2">Enter your invite code</h1>
        </div>
        <p className="text-sm text-[#6B7280]">You need an invite code from your real estate agent or broker to access EZ Move AI</p>
      </div>

      <div className="flex gap-3 justify-center mb-8">
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
            autoFocus={i === 0}
            className={`w-16 h-20 text-center text-3xl font-bold rounded-2xl border-2 outline-none transition-all bg-white
              ${d ? "border-[#F97316] text-[#1A1A2E] shadow-[0_0_0_4px_rgba(249,115,22,0.1)]" : "border-[#E5E7EB] text-[#9CA3AF]"}
              focus:border-[#F97316] focus:shadow-[0_0_0_4px_rgba(249,115,22,0.15)]`}
          />
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-6">
          <p className="text-sm text-red-600 font-medium">{error}</p>
        </div>
      )}

      <button
        onClick={handleVerify}
        disabled={digits.some(d => !d)}
        className="w-full py-4 rounded-2xl bg-[#1A1A2E] text-white font-semibold text-base
          disabled:opacity-40 active:scale-[0.98] transition-all shadow-lg hover:bg-[#2A2A3E]"
      >
        Verify Code
      </button>

      <p className="text-center text-xs text-[#9CA3AF] mt-8">
        <span className="block mb-2">Don't have an invite code?</span>
        <span className="text-[#6B7280] font-medium">Contact your real estate agent or broker</span>
      </p>
    </div>
  );
}