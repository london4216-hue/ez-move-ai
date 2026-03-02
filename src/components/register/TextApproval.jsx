import { useState } from "react";

export default function TextApproval({ phone, onComplete }) {
  const [approved, setApproved] = useState(false);

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
          <div className="w-16 h-16 bg-orange-100 rounded-3xl flex items-center justify-center text-3xl mb-6">💬</div>
          <h1 className="text-4xl font-black text-slate-900 leading-tight mb-3">Stay in the loop</h1>
          <p className="text-slate-500 text-base">We'll send you important reminders during your move</p>
        </div>

        <div className="space-y-4">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Sending updates to</p>
            <p className="text-lg font-bold text-slate-900">{phone}</p>
          </div>

          <button
            onClick={() => setApproved(!approved)}
            className={`w-full flex items-center gap-4 p-5 rounded-2xl border-2 transition-all text-left
              ${approved ? "border-orange-500 bg-orange-50" : "border-slate-200 bg-white"}`}
          >
            <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all
              ${approved ? "border-orange-500 bg-orange-500" : "border-slate-300 bg-white"}`}>
              {approved && (
                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <span className="text-sm font-semibold text-slate-700">I agree to receive text updates during my move</span>
          </button>

          <button
            onClick={() => onComplete()}
            disabled={!approved}
            className="btn-primary"
          >
            Continue →
          </button>
        </div>
      </div>
    </div>
  );
}