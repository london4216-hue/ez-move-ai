import { useState } from "react";

export default function TextApproval({ phone, onComplete }) {
  const [approved, setApproved] = useState(false);

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-[#1A1A2E] rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-bold">EZ</span>
          </div>
          <span className="text-xl font-semibold text-[#1A1A2E] tracking-tight">EZ Move <span className="text-[#F97316]">AI</span></span>
        </div>
        <h1 className="text-2xl font-bold text-[#1A1A2E] mb-1">Text updates</h1>
        <p className="text-sm text-[#6B7280]">Get important reminders and updates via text</p>
      </div>

      <div className="space-y-4">
        <div className="bg-[#FEF3ED] border border-[#FCDDD8] rounded-xl p-4">
          <p className="text-sm text-[#1A1A2E] mb-2">We'll send texts to:</p>
          <p className="text-base font-semibold text-[#C85A17]">{phone}</p>
        </div>

        <button
          onClick={() => setApproved(!approved)}
          className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all
            ${approved 
              ? "border-[#F97316] bg-[#FEF9F3]" 
              : "border-[#E5E7EB] bg-white hover:border-[#F97316]"}`}
        >
          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all
            ${approved ? "border-[#F97316] bg-[#F97316]" : "border-[#D1D5DB]"}`}>
            {approved && (
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
          <span className="text-sm font-medium text-[#1A1A2E]">I agree to text updates during my move</span>
        </button>

        <button
          onClick={() => onComplete()}
          disabled={!approved}
          className="w-full py-4 rounded-2xl bg-[#1A1A2E] text-white font-semibold text-base disabled:opacity-40 active:scale-[0.98] transition-all"
        >
          Continue
        </button>
      </div>
    </div>
  );
}