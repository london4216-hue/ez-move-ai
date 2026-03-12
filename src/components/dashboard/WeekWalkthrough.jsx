import { useState } from "react";
import { ChevronRight, CheckCircle2, ChevronLeft } from "lucide-react";

export default function WeekWalkthrough({ weekData, weekNum, onDone }) {
  const items = weekData?.items || [];
  const [stepIdx, setStepIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // id -> answer

  const item = items[stepIdx];
  const isLast = stepIdx === items.length - 1;

  const handleAnswer = (answer) => {
    setAnswers(a => ({ ...a, [item.id]: answer }));
    if (isLast) {
      onDone({ ...answers, [item.id]: answer });
    } else {
      setStepIdx(i => i + 1);
    }
  };

  const handleBack = () => {
    if (stepIdx > 0) {
      setStepIdx(i => i - 1);
    }
  };

  if (!item) return null;

  const progress = ((stepIdx) / items.length) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-t-3xl shadow-2xl overflow-hidden">
        {/* Progress bar */}
        <div className="h-1 bg-slate-100">
          <div
            className="h-full bg-gradient-to-r from-orange-500 to-orange-400 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="px-5 pt-4 pb-2 flex items-center justify-between">
          <button
            onClick={handleBack}
            className={`text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1 ${stepIdx === 0 ? "opacity-0 cursor-default pointer-events-none" : ""}`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="text-[11px] font-bold">Back</span>
          </button>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">
            Week {weekNum} · {stepIdx + 1}/{items.length}
          </p>
          <div className="flex gap-1">
            {items.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i < stepIdx ? "bg-orange-500 w-3" : i === stepIdx ? "bg-orange-400 w-5" : "bg-slate-200 w-1.5"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="px-5 pt-4 pb-8">
          <div className="mb-6">
            <p className="text-2xl mb-3">
              {stepIdx === 0 ? "📋" : stepIdx === 1 ? "🎯" : stepIdx === 2 ? "⚡" : "✅"}
            </p>
            <h2 className="text-xl font-black text-slate-900 mb-2">{item.title}</h2>
            {item.description && (
              <p className="text-sm text-slate-500 leading-relaxed">{item.description}</p>
            )}
          </div>

          <p className="text-xs text-slate-400 font-semibold mb-3">Will you do this this week?</p>

          <div className="space-y-2.5">
            <button
              onClick={() => handleAnswer("yes")}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-500/30 active:scale-[0.98] transition-transform"
            >
              <CheckCircle2 className="w-4 h-4" />
              Yes, add to my plan
              <ChevronRight className="w-4 h-4 ml-auto" />
            </button>
            <button
              onClick={() => handleAnswer("maybe")}
              className="w-full py-3.5 rounded-2xl border-2 border-amber-300 bg-amber-50 text-amber-700 text-sm font-bold active:scale-[0.98] transition-transform"
            >
              🤔 Maybe — add later
            </button>
            <button
              onClick={() => handleAnswer("skip")}
              className="w-full py-3 rounded-2xl border border-slate-200 text-slate-400 text-sm font-semibold active:scale-[0.98] transition-transform"
            >
              No, don't add to my plan
            </button>
          </div>

          <div className="flex gap-2 mt-6 pt-4 border-t border-slate-100">
            <button
              onClick={() => onDone(answers)}
              className="w-full py-3 rounded-xl bg-slate-100 text-slate-600 font-bold text-sm active:scale-[0.98] transition-transform"
            >
              Save & Exit Anytime
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}