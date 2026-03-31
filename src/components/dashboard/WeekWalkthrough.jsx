import { useState } from "react";
import { ChevronRight, CheckCircle2, ChevronLeft, Loader2, Phone, Star } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function WeekWalkthrough({ weekData, weekNum, onDone, user }) {
  const items = weekData?.items || [];
  const [stepIdx, setStepIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [aiStep, setAiStep] = useState(false); // showing AI results between questions
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResults, setAiResults] = useState([]);

  const item = items[stepIdx];
  const isLast = stepIdx === items.length - 1;

  const handleAnswer = async (answer) => {
    const newAnswers = { ...answers, [item.id]: answer };
    setAnswers(newAnswers);

    // If user said yes and item has an AI search query, show AI results first
    if (answer === "yes" && item.ai_search_query) {
      setAiStep(true);
      setAiLoading(true);
      setAiResults([]);
      const location = user?.home_address || "my area";
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Find 4 real local ${item.ai_search_query} for someone moving from: ${location}. Return name, phone number, rating (e.g. 4.8★), and a short 1-line description. Only include businesses that actually exist.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            providers: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  phone: { type: "string" },
                  rating: { type: "string" },
                  description: { type: "string" },
                }
              }
            }
          }
        }
      });
      setAiResults(res?.providers || []);
      setAiLoading(false);
      return;
    }

    if (isLast) {
      onDone(newAnswers);
    } else {
      setStepIdx(i => i + 1);
    }
  };

  const handleAiContinue = () => {
    setAiStep(false);
    setAiResults([]);
    if (isLast) {
      onDone(answers);
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
            onClick={stepIdx === 0 ? () => onDone(answers) : handleBack}
            className="text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1"
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

        {/* AI Results Step */}
        {aiStep ? (
          <div className="px-5 pt-4 pb-8">
            <div className="mb-4">
              <p className="text-2xl mb-2">🤖</p>
              <h2 className="text-xl font-black text-slate-900 mb-1">AI Found Local Options</h2>
              <p className="text-sm text-slate-500">For: <span className="font-semibold">{item.title}</span></p>
            </div>

            {aiLoading ? (
              <div className="flex flex-col items-center justify-center gap-3 py-10">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                <p className="text-sm text-slate-400 font-semibold">Searching local providers…</p>
              </div>
            ) : (
              <div className="space-y-3 mb-6">
                {aiResults.map((r, i) => (
                  <div key={i} className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800">{r.name}</p>
                        {r.rating && (
                          <p className="text-[11px] text-amber-500 font-bold mt-0.5">{r.rating}</p>
                        )}
                        {r.description && (
                          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{r.description}</p>
                        )}
                      </div>
                      {r.phone && (
                        <a
                          href={`tel:${r.phone}`}
                          className="flex items-center gap-1 text-[11px] font-bold text-orange-500 bg-orange-50 border border-orange-100 rounded-xl px-3 py-2 flex-shrink-0"
                        >
                          <Phone className="w-3 h-3" />
                          {r.phone}
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={handleAiContinue}
              disabled={aiLoading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-500/30 disabled:opacity-50"
            >
              Continue
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onDone(answers)}
              className="w-full py-3 rounded-xl bg-slate-100 text-slate-600 font-bold text-sm mt-2"
            >
              Save & Exit
            </button>
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
}