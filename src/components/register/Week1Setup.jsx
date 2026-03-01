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
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <div className="w-12 h-12 bg-[#EEF2FF] rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🟦</span>
        </div>
        <h1 className="text-2xl font-bold text-[#1A1A2E] mb-1">Week 1 Setup</h1>
        <p className="text-sm text-[#6B7280]">Does this apply for you? Select all that do.</p>
      </div>

      <div className="space-y-3 mb-6">
        {WEEK1_ITEMS.map(item => (
          <button
            key={item.id}
            onClick={() => toggle(item.id)}
            className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-start gap-3
              ${checked[item.id]
                ? "border-[#4F7EFF] bg-[#EEF2FF]"
                : "border-[#E5E7EB] bg-white"}`}
          >
            <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all
              ${checked[item.id] ? "border-[#4F7EFF] bg-[#4F7EFF]" : "border-[#D1D5DB]"}`}>
              {checked[item.id] && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <div>
              <p className="font-semibold text-sm text-[#1A1A2E]">{item.title}</p>
              <p className="text-xs text-[#6B7280] mt-0.5">{item.description}</p>
            </div>
          </button>
        ))}
      </div>

      {count > 0 && (
        <p className="text-center text-sm text-[#4F7EFF] font-medium mb-4">
          {count} task{count > 1 ? "s" : ""} added to your Week 1 plan
        </p>
      )}

      <button
        onClick={onComplete}
        className="w-full py-4 rounded-2xl bg-[#1A1A2E] text-white font-semibold text-base
          active:scale-[0.98] transition-all shadow-lg"
      >
        Go to My Dashboard
      </button>

      <button
        onClick={onComplete}
        className="w-full py-3 text-sm text-[#6B7280] mt-2"
      >
        Skip for now
      </button>
    </div>
  );
}