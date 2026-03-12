import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { CheckCircle2, ChevronRight, X, Loader2, Phone } from "lucide-react";

const STEPS = [
  {
    id: "mover_question",
    emoji: "🚛",
    title: "Will you need a mover?",
    subtitle: "This helps us customize your plan and recommendations.",
    cta: "Continue →",
  },
  {
    id: "welcome",
    emoji: "👋",
    title: "Welcome to EZ Move AI!",
    subtitle: "Let's get your Week 1 set up in 4 quick steps so nothing falls through the cracks.",
    cta: "Let's Go →",
  },
  {
    id: "stays_goes",
    emoji: "📦",
    title: "What stays vs. goes?",
    subtitle: "Tap each item to decide — this builds your moving inventory automatically.",
    cta: "Looks Good →",
  },
  {
    id: "movers",
    emoji: "🚛",
    title: "Find Local Movers",
    subtitle: "We'll find top-rated movers near your address so you can get quotes fast.",
    cta: "Next →",
  },
  {
    id: "done",
    emoji: "🎉",
    title: "You're all set!",
    subtitle: "Your Week 1 plan is ready. Tap each task to get started — we'll guide you every step.",
    cta: "Go to My Plan",
  },
];

const STAYS_GOES_ITEMS = [
  { label: "Living Room Furniture", emoji: "🛋️" },
  { label: "Bedroom Sets", emoji: "🛏️" },
  { label: "Kitchen Appliances", emoji: "🍳" },
  { label: "Patio / Outdoor", emoji: "☀️" },
  { label: "Garage Items", emoji: "🔧" },
  { label: "Decor & Art", emoji: "🖼️" },
];

export default function Week1OnboardingModal({ user, onDone }) {
  const [stepIdx, setStepIdx] = useState(0);
  const [needsMover, setNeedsMover] = useState(null);
  const [decisions, setDecisions] = useState({}); // itemLabel -> "moving"|"donate"|null
  const [movers, setMovers] = useState([]);
  const [loadingMovers, setLoadingMovers] = useState(false);
  const [moversLoaded, setMoversLoaded] = useState(false);

  const step = STEPS[stepIdx];

  const toggleDecision = (label, choice) => {
    setDecisions(d => ({ ...d, [label]: d[label] === choice ? null : choice }));
  };

  const fetchMovers = async () => {
    if (moversLoaded) return;
    setLoadingMovers(true);
    try {
      const location = user?.home_address || "my area";
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Find 3 real top-rated local moving companies near: ${location}. Include their name, phone number, and a 1-line description.`,
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
                  description: { type: "string" },
                }
              }
            }
          }
        }
      });
      setMovers(res.providers || []);
    } catch (e) {
      setMovers([]);
    }
    setLoadingMovers(false);
    setMoversLoaded(true);
  };

  const handleMoverAnswer = async (answer) => {
    setNeedsMover(answer);
    try {
      await base44.auth.updateMe({ needs_mover: answer });
    } catch (e) {
      console.error('Failed to save mover preference:', e);
    }
    setStepIdx(i => i + 1);
  };

  const handleNext = () => {
    if (stepIdx === 2) {
      // entering movers step — preload
      fetchMovers();
    }
    if (stepIdx < STEPS.length - 1) {
      setStepIdx(i => i + 1);
    } else {
      onDone();
    }
  };

  const handleSkip = () => onDone();

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-t-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
        
        {/* Progress bar */}
        <div className="h-1 bg-slate-100">
          <div
            className="h-full bg-gradient-to-r from-orange-500 to-orange-400 transition-all duration-500"
            style={{ width: `${((stepIdx + 1) / STEPS.length) * 100}%` }}
          />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-1">
          <div className="flex gap-1">
            {STEPS.map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i <= stepIdx ? "bg-orange-500 w-5" : "bg-slate-200 w-1.5"}`} />
            ))}
          </div>
          <button onClick={handleSkip} className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center">
            <X className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="px-5 pt-3 pb-6">

          {/* Mover Question */}
          {step.id === "mover_question" && (
            <div className="text-center pt-2 pb-4">
              <div className="text-5xl mb-4">{step.emoji}</div>
              <h2 className="text-xl font-black text-slate-900 mb-2">{step.title}</h2>
              <p className="text-sm text-slate-500 leading-relaxed mb-6">{step.subtitle}</p>
              <div className="space-y-3">
                <button
                  onClick={() => handleMoverAnswer(true)}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-sm
                    active:scale-[0.98] transition-all shadow-lg shadow-orange-200"
                >
                  Yes, I need a mover
                </button>
                <button
                  onClick={() => handleMoverAnswer(false)}
                  className="w-full py-4 rounded-2xl border-2 border-slate-200 text-slate-700 font-bold text-sm
                    active:scale-[0.98] transition-all hover:border-orange-400 hover:bg-orange-50"
                >
                  No, I'll move myself
                </button>
              </div>
            </div>
          )}

          {/* Welcome step */}
          {step.id === "welcome" && (
            <div className="text-center pt-2 pb-4">
              <div className="text-5xl mb-4">{step.emoji}</div>
              <h2 className="text-xl font-black text-slate-900 mb-2">{step.title}</h2>
              <p className="text-sm text-slate-500 leading-relaxed">{step.subtitle}</p>
              <div className="mt-5 grid grid-cols-3 gap-2">
                {["📋 Week 1 Plan", "🚛 Find Movers", "📦 Sort Items"].map((label, i) => (
                  <div key={i} className="bg-orange-50 rounded-2xl p-3 text-center">
                    <p className="text-[11px] font-bold text-orange-700">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stays vs goes */}
          {step.id === "stays_goes" && (
            <div>
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">{step.emoji}</div>
                <h2 className="text-lg font-black text-slate-900">{step.title}</h2>
                <p className="text-xs text-slate-400 mt-1">{step.subtitle}</p>
              </div>
              <div className="space-y-2 mb-2">
                {STAYS_GOES_ITEMS.map(({ label, emoji }) => (
                  <div key={label} className="flex items-center gap-3 bg-slate-50 rounded-2xl px-3 py-2.5">
                    <span className="text-xl">{emoji}</span>
                    <p className="text-xs font-bold text-slate-700 flex-1">{label}</p>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => toggleDecision(label, "moving")}
                        className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border transition-all
                          ${decisions[label] === "moving" ? "bg-orange-500 text-white border-orange-500" : "bg-white text-slate-500 border-slate-200"}`}
                      >
                        Moving
                      </button>
                      <button
                        onClick={() => toggleDecision(label, "donate")}
                        className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border transition-all
                          ${decisions[label] === "donate" ? "bg-purple-500 text-white border-purple-500" : "bg-white text-slate-500 border-slate-200"}`}
                      >
                        Donate
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-slate-400 text-center mt-2">Don't worry — you can change these anytime in "My Stuff"</p>
            </div>
          )}

          {/* Movers */}
          {step.id === "movers" && (
            <div>
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">{step.emoji}</div>
                <h2 className="text-lg font-black text-slate-900">{step.title}</h2>
                <p className="text-xs text-slate-400 mt-1">{step.subtitle}</p>
              </div>
              {loadingMovers && (
                <div className="flex items-center justify-center gap-2 py-6">
                  <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
                  <span className="text-xs text-slate-400">Finding movers near you…</span>
                </div>
              )}
              {!loadingMovers && movers.length === 0 && moversLoaded && (
                <p className="text-xs text-slate-400 text-center py-4">No results found. You can search manually in the My Plan tab.</p>
              )}
              {!loadingMovers && movers.map((m, i) => (
                <div key={i} className="flex items-start gap-3 bg-slate-50 rounded-2xl px-3 py-3 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-base">🚛</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-slate-800">{m.name}</p>
                    {m.description && <p className="text-[9px] text-slate-400 mt-0.5">{m.description}</p>}
                  </div>
                  {m.phone && (
                    <a href={`tel:${m.phone}`} className="flex items-center gap-1 text-[10px] font-bold text-orange-500 flex-shrink-0">
                      <Phone className="w-3 h-3" />
                      {m.phone}
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Done */}
          {step.id === "done" && (
            <div className="text-center pt-2 pb-4">
              <div className="text-5xl mb-4">{step.emoji}</div>
              <h2 className="text-xl font-black text-slate-900 mb-2">{step.title}</h2>
              <p className="text-sm text-slate-500 leading-relaxed">{step.subtitle}</p>
              <div className="mt-5 space-y-2">
                {["Complete Week 1 tasks to unlock Week 2", "Tap any task to get AI-powered help", "Add appointments in the Calendar tab"].map((tip, i) => (
                  <div key={i} className="flex items-center gap-2 bg-emerald-50 rounded-2xl px-4 py-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <p className="text-[11px] font-semibold text-emerald-700 text-left">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTA Button - hide for mover question since it has its own buttons */}
          {step.id !== "mover_question" && (
            <button
              onClick={handleNext}
              className="w-full mt-4 py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-sm shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
            >
              {step.cta}
              {stepIdx < STEPS.length - 1 && <ChevronRight className="w-4 h-4" />}
            </button>
          )}

          {stepIdx > 0 && stepIdx < STEPS.length - 1 && (
            <button onClick={handleSkip} className="w-full mt-2 py-2 text-xs text-slate-400 font-semibold">
              Skip for now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}