import { useState } from "react";

const WEEK1_ITEMS = [
  { id: 1, title: "Confirm what stays vs. goes", description: "Furniture, appliances, personal items checklist" },
  { id: 2, title: "Estate sale decision", description: "Decide if you need to schedule an estate sale" },
  { id: 3, title: "Request mover quotes", description: "Get 3 moving company quotes to compare" },
  { id: 4, title: "Start donation / sell pile", description: "Sort items worth selling vs. donating" },
];

export default function Week1Setup({ onComplete }) {
  const [checked, setChecked] = useState({});

  const toggle = (id) => setChecked(c => ({ ...c, [id]: !c[id] }));
  const count = Object.values(checked).filter(Boolean).length;

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-br from-[#4F7EFF] to-[#2563EB] mb-6 mx-auto">
          <span className="text-white text-2xl">📋</span>
        </div>
        <h1 className="text-3xl font-bold text-[#1A1A2E] mb-2">Week 1 Priorities</h1>
        <p className="text-sm text-[#6B7280]">Select what applies to you</p>
      </div>

      <div className="space-y-3 mb-8">
        {WEEK1_ITEMS.map(item => (
          <button
            key={item.id}
            onClick={() => toggle(item.id)}
            className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-start gap-3 hover:border-[#C85A17]/50
              ${checked[item.id]
                 ? "border-[#C85A17] bg-gradient-to-br from-[#FEF3ED] to-[#FFF7ED]"
                 : "border-[#E5E7EB] bg-white hover:bg-[#FAFAF9]"}`}
          >
            <div className={`w-6 h-6 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all
              ${checked[item.id] ? "border-[#C85A17] bg-gradient-to-r from-[#C85A17] to-[#F97316]" : "border-[#D1D5DB]"}`}>
              {checked[item.id] && (
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm text-[#1A1A2E]">{item.title}</p>
              <p className="text-xs text-[#6B7280] mt-1">{item.description}</p>
            </div>
          </button>
        ))}
      </div>

      {count > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-3 mb-4 text-center">
          <p className="text-sm text-green-700 font-bold">
            ✓ {count} task{count > 1 ? "s" : ""} selected
          </p>
        </div>
      )}

      <div className="space-y-3">
        <button
          onClick={() => onComplete && onComplete()}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#C85A17] to-[#F97316] text-white font-bold text-base
            active:scale-[0.98] transition-all shadow-[0_4px_12px_rgba(200,90,23,0.2)]"
        >
          Go to Dashboard
        </button>

        <button
          onClick={() => onComplete && onComplete()}
          className="w-full py-3 text-sm font-semibold text-[#6B7280] hover:text-[#C85A17] transition-colors"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}