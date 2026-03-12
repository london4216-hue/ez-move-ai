import { useState } from "react";
import { ChevronRight } from "lucide-react";

const WEEK1_ITEMS = [
  { id: "w1-1", title: "Confirm what stays vs. goes", description: "Furniture, appliances, personal items checklist" },
  { id: "w1-2", title: "Start donation / sell pile", description: "Sort items worth selling vs. donating" },
  { id: "w1-3", title: "Estate sale decision", description: "Decide if you need to schedule an estate sale" },
  { id: "w1-4", title: "Request mover quotes", description: "Get 3 moving company quotes to compare" },
];

export default function Week1Setup({ onComplete }) {
  const [stepIdx, setStepIdx] = useState(0);
  const [answers, setAnswers] = useState({});

  const item = WEEK1_ITEMS[stepIdx];
  const isLast = stepIdx === WEEK1_ITEMS.length - 1;

  const handleAnswer = (answer) => {
    const newAnswers = { ...answers, [item.id]: answer };
    setAnswers(newAnswers);
    
    if (isLast) {
      // Pass answers back to onComplete
      onComplete && onComplete(newAnswers);
    } else {
      setStepIdx(i => i + 1);
    }
  };

  const handleBack = () => {
    if (stepIdx > 0) {
      setStepIdx(i => i - 1);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-br from-[#4F7EFF] to-[#2563EB] mb-6 mx-auto">
          <span className="text-white text-2xl">📋</span>
        </div>
        <h1 className="text-3xl font-bold text-[#1A1A2E] mb-2">Week 1 Setup</h1>
        <p className="text-sm text-[#6B7280]">{stepIdx + 1} of {WEEK1_ITEMS.length}</p>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-bold text-[#1A1A2E] mb-2">{item.title}?</h2>
        <p className="text-sm text-[#6B7280] mb-6">{item.description}</p>

        <div className="space-y-2.5">
          <button
            onClick={() => handleAnswer("yes")}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#C85A17] to-[#F97316] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(200,90,23,0.2)] active:scale-[0.98] transition-transform"
          >
            Yes, I will
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleAnswer("maybe")}
            className="w-full py-3.5 rounded-2xl border-2 border-[#FCD34D] bg-[#FEFCE8] text-[#92400E] text-sm font-bold active:scale-[0.98] transition-transform"
          >
            Maybe later
          </button>
          <button
            onClick={() => handleAnswer("skip")}
            className="w-full py-3 rounded-2xl border border-[#E5E7EB] text-[#6B7280] text-sm font-semibold active:scale-[0.98] transition-transform"
          >
            No, skip this
          </button>
        </div>
      </div>

      <div className="flex gap-2">
        {stepIdx > 0 && (
          <button
            onClick={handleBack}
            className="flex-1 py-3 rounded-xl border border-[#E5E7EB] text-[#6B7280] font-bold text-sm active:scale-[0.98] transition-transform"
          >
            Back
          </button>
        )}
        <button
          onClick={() => onComplete && onComplete(answers)}
          className={`${stepIdx > 0 ? "flex-1" : "w-full"} py-3 rounded-xl bg-[#F3F4F6] text-[#6B7280] font-bold text-sm active:scale-[0.98] transition-transform`}
        >
          Skip Setup
        </button>
      </div>
    </div>
  );
}