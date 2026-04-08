import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ChevronRight, ChevronLeft, CheckCircle2, Loader2, Save, Sparkles } from "lucide-react";
import { WEEK1_TASKS } from "@/lib/week1Tasks";

// Week1Setup — guided, resumable onboarding through Week 1 tasks
// Tasks with ai_search_query MUST complete AI sub-task inline before proceeding
export default function Week1Setup({ userId, userAddress, onComplete, onSaveExit, hideButtons }) {
  const navigate = useNavigate();
  const storageKey = `week1_setup_${userId}`;

  const [stepIdx, setStepIdx] = useState(() => {
    try { return JSON.parse(localStorage.getItem(storageKey))?.step ?? 0; } catch { return 0; }
  });
  const [answers, setAnswers] = useState(() => {
    try { return JSON.parse(localStorage.getItem(storageKey))?.answers ?? {}; } catch { return {}; }
  });
  const [aiPhase, setAiPhase] = useState(null); // null | "loading" | "results"
  const [aiResults, setAiResults] = useState([]);

  const task = WEEK1_TASKS[stepIdx];
  const isLast = stepIdx === WEEK1_TASKS.length - 1;

  const saveProgress = (step, ans) => {
    localStorage.setItem(storageKey, JSON.stringify({ step, answers: ans }));
  };

  const runAiSearch = async () => {
    setAiPhase("loading");
    setAiResults([]);
    const locationHint = userAddress || "my area";
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Find the top 3 local businesses for: "${task.ai_search_query} ${locationHint}". For each provide name, rating (e.g. 4.8★), one-line description, and phone number if available.`,
      response_json_schema: {
        type: "object",
        properties: {
          results: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                rating: { type: "string" },
                description: { type: "string" },
                phone: { type: "string" }
              }
            }
          }
        }
      }
    });
    setAiResults(res?.results || []);
    setAiPhase("results");
  };

  const handleAnswer = async (answer) => {
    const newAnswers = { ...answers, [task.id]: answer };
    setAnswers(newAnswers);
    saveProgress(stepIdx, newAnswers);

    // If "yes" and has AI sub-task, run it now (required)
    if (answer === "yes" && task.ai_search_query) {
      runAiSearch();
      return;
    }

    advance(newAnswers);
  };

  const advance = async (ans) => {
    if (isLast) {
      localStorage.removeItem(storageKey);
      if (onComplete) {
        await onComplete(ans);
      } else {
        navigate(createPageUrl("Dashboard"));
      }
    } else {
      const next = stepIdx + 1;
      setStepIdx(next);
      setAiPhase(null);
      setAiResults([]);
      saveProgress(next, ans);
    }
  };

  const handleBack = () => {
    if (aiPhase) {
      setAiPhase(null);
      setAiResults([]);
      return;
    }
    if (stepIdx > 0) {
      const prev = stepIdx - 1;
      setStepIdx(prev);
      saveProgress(prev, answers);
    }
  };

  const handleSaveExit = () => {
    saveProgress(stepIdx, answers);
    onSaveExit && onSaveExit(answers);
  };

  const progress = (stepIdx / WEEK1_TASKS.length) * 100;

  return (
    <div className="w-full animate-fade-in" style={{ background: "linear-gradient(180deg,#F7F9FC 0%,#FFFFFF 100%)", minHeight: "100vh" }}>

      {/* Sticky header */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-100 shadow-sm px-5 py-3 flex items-center justify-between">
        {(stepIdx > 0 || aiPhase) ? (
          <button onClick={handleBack} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
            <ChevronLeft className="w-4 h-4 text-slate-600" />
          </button>
        ) : <div className="w-8" />}
        <span className="text-sm font-bold text-slate-700">Week 1 Setup</span>
        <span className="text-xs font-bold text-orange-500">Step {stepIdx + 1} of {WEEK1_TASKS.length}</span>
      </div>

      <div className="px-5 pt-4 pb-32 max-w-sm mx-auto space-y-4">

        {/* Progress bar */}
        <div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex gap-1.5">
            {WEEK1_TASKS.map((t, i) => (
              <div
                key={t.id}
                className={`flex-1 h-1 rounded-full transition-all ${
                  i < stepIdx ? "bg-orange-500" : i === stepIdx ? "bg-orange-300" : "bg-slate-100"
                }`}
              />
            ))}
          </div>
        </div>


        {/* Task card */}
        {aiPhase === null && (
          <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-5 animate-slide-up">
            <div className="text-4xl mb-4">{task.emoji}</div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">{task.title}</h2>
            <p className="text-sm text-slate-500 leading-relaxed mb-6">{task.description}</p>

            {task.ai_search_query && (
              <div className="bg-purple-50 border border-purple-200 rounded-2xl px-4 py-3 mb-5 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-purple-700 font-semibold">
                  If you say <strong>Yes</strong>, we'll find top-rated local providers for you right now — takes 10 seconds.
                </p>
              </div>
            )}

            <p className="text-xs text-slate-400 font-semibold mb-3 uppercase tracking-wide">Will you do this this week?</p>

            <div className="space-y-2.5">
              <button
                onClick={() => handleAnswer("yes")}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-200 active:scale-[0.98] transition-transform"
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
                onClick={() => handleAnswer("na")}
                className="w-full py-3 rounded-2xl border border-slate-200 text-slate-400 text-sm font-semibold active:scale-[0.98] transition-transform"
              >
                N/A — not applicable to me
              </button>
            </div>
          </div>
        )}

        {/* AI Sub-task — REQUIRED to complete before continuing */}
        {(aiPhase === "loading" || aiPhase === "results") && (
          <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-5 animate-slide-up">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-purple-500" />
              <h3 className="text-base font-black text-slate-800">{task.ai_label}</h3>
            </div>

            {aiPhase === "loading" && (
              <div className="flex flex-col items-center py-10 gap-3">
                <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                <p className="text-sm text-slate-500 font-semibold">Finding top providers near you…</p>
              </div>
            )}

            {aiPhase === "results" && (
              <>
                {aiResults.length === 0 ? (
                  <p className="text-sm text-slate-400 py-4 text-center">No results found. You can always search later in the AI tools tab.</p>
                ) : (
                  <>
                    <p className="text-xs text-orange-600 font-bold text-center mb-3">Tap a provider to select &amp; continue</p>
                    <div className="space-y-3 mb-5">
                      {aiResults.map((r, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            localStorage.setItem(`demo_estate_pro_${userId}`, JSON.stringify(r));
                            advance(answers);
                          }}
                          className="w-full text-left bg-white border-2 border-slate-100 rounded-2xl p-4 shadow-sm hover:border-orange-400 hover:bg-orange-50 active:scale-[0.98] transition-all"
                        >
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <p className="font-bold text-slate-800 text-sm">{r.name}</p>
                            {r.rating && <span className="text-xs font-bold text-amber-500 whitespace-nowrap">{r.rating}</span>}
                          </div>
                          <p className="text-xs text-slate-500 mb-1.5">{r.description}</p>
                          {r.phone && <p className="text-xs font-bold text-orange-500">📞 {r.phone}</p>}
                          <p className="text-xs text-orange-500 font-bold mt-2">Tap to select →</p>
                        </button>
                      ))}
                    </div>
                  </>
                )}

                <p className="text-xs text-slate-400 text-center mb-4">These results are also saved in your AI Tools tab for reference.</p>

                <button
                  onClick={() => advance(answers)}
                  className="w-full py-3.5 rounded-2xl border border-slate-200 text-slate-500 font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                >
                  Skip — Continue without selecting
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Sticky bottom nav */}
      {((stepIdx > 0 || aiPhase) || (!hideButtons)) && (
        <div className="fixed bottom-0 left-0 right-0 px-5 py-4 bg-white border-t border-slate-100 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] z-40">
          <div className="flex gap-2 max-w-sm mx-auto">
            {(stepIdx > 0 || aiPhase) && (
              <button
                onClick={handleBack}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-500 font-bold text-sm flex items-center justify-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            )}
            {!hideButtons && (
              <button
                onClick={handleSaveExit}
                className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-500 font-bold text-sm flex items-center justify-center gap-1 hover:bg-slate-200 transition-colors"
              >
                <Save className="w-3.5 h-3.5" /> Save & Exit
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}