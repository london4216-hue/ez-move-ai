import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { CheckCircle2, ChevronRight, X, Loader2, Phone, Save } from "lucide-react";

const STEPS = [
  { id: "welcome",        emoji: "👋", title: "Welcome to EZ Move AI!", subtitle: "Let's set up your personalized moving plan in a few quick steps. You can save & continue any time." },
  { id: "mover_question", emoji: "🚛", title: "Will you need a mover?", subtitle: "This helps us customize your plan and recommendations." },
  { id: "stays_goes",     emoji: "📦", title: "What stays vs. goes?", subtitle: "Tap each item to decide — this builds your moving inventory automatically." },
  { id: "movers",         emoji: "🚛", title: "Find Local Movers", subtitle: "We'll find top-rated movers near your address so you can get quotes fast." },
  { id: "done",           emoji: "🎉", title: "You're all set!", subtitle: "Your Week 1 plan is ready. Tap any task to get started — we'll guide you every step." },
];

const STAYS_GOES_ITEMS = [
  { label: "Living Room Furniture", emoji: "🛋️" },
  { label: "Bedroom Sets",          emoji: "🛏️" },
  { label: "Kitchen Appliances",    emoji: "🍳" },
  { label: "Patio / Outdoor",       emoji: "☀️" },
  { label: "Garage Items",          emoji: "🔧" },
  { label: "Decor & Art",           emoji: "🖼️" },
  { label: "Electronics",           emoji: "📺" },
  { label: "Tools & Equipment",     emoji: "🛠️" },
];

const STORAGE_KEY = (userId) => `onboarding_progress_${userId}`;

export default function Week1OnboardingModal({ user, onDone }) {
  const savedKey = STORAGE_KEY(user?.id);

  // Restore progress from localStorage
  const saved = (() => {
    try { return JSON.parse(localStorage.getItem(savedKey) || "{}"); } catch { return {}; }
  })();

  const [stepIdx, setStepIdx]         = useState(saved.stepIdx ?? 0);
  const [needsMover, setNeedsMover]   = useState(saved.needsMover ?? null);
  const [decisions, setDecisions]     = useState(saved.decisions ?? {});
  const [movers, setMovers]           = useState([]);
  const [loadingMovers, setLoadingMovers] = useState(false);
  const [moversLoaded, setMoversLoaded]   = useState(false);

  const step = STEPS[stepIdx];

  // Persist progress every time something changes
  const persist = (patch = {}) => {
    const current = { stepIdx, needsMover, decisions, ...patch };
    localStorage.setItem(savedKey, JSON.stringify(current));
  };

  const toggleDecision = (label, choice) => {
    const updated = { ...decisions, [label]: decisions[label] === choice ? null : choice };
    setDecisions(updated);
    persist({ decisions: updated });
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
    } catch { setMovers([]); }
    setLoadingMovers(false);
    setMoversLoaded(true);
  };

  const handleMoverAnswer = async (answer) => {
    setNeedsMover(answer);
    persist({ needsMover: answer });
    try { await base44.auth.updateMe({ needs_mover: answer }); } catch {}
    advanceTo(stepIdx + 1);
  };

  const advanceTo = (idx) => {
    if (idx >= STEPS.length) {
      finish();
      return;
    }
    if (STEPS[idx].id === "movers") fetchMovers();
    setStepIdx(idx);
    persist({ stepIdx: idx });
  };

  const handleNext = () => advanceTo(stepIdx + 1);

  // Save decisions to MyStuff lists and mark done
  const finish = () => {
    // Save stays/goes data for MyStuff tab pre-seeding
    const stuffLists = { move: [], junk: [], donate: [] };
    STAYS_GOES_ITEMS.forEach(({ label }) => {
      if (decisions[label] === "moving") {
        stuffLists.move.push({ id: `seed-${label}`, name: label, size: "Medium" });
      } else if (decisions[label] === "donate") {
        stuffLists.donate.push({ id: `seed-${label}`, name: label, size: "Medium" });
      }
    });
    // Persist to user profile so MyStuffTab can read it
    base44.auth.updateMe({ stuff_lists: JSON.stringify(stuffLists) }).catch(() => {});
    // Mark onboarding done
    localStorage.setItem(`onboarding_done_${user?.id}`, "1");
    localStorage.removeItem(savedKey);
    onDone();
  };

  const handleSaveExit = () => {
    persist({ stepIdx });
    onDone(); // exits modal, onboarding will re-show next time (onboarding_done not set)
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-t-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">

        {/* Progress bar */}
        <div className="h-1.5 bg-slate-100">
          <div
            className="h-full bg-gradient-to-r from-orange-500 to-orange-400 transition-all duration-500"
            style={{ width: `${((stepIdx + 1) / STEPS.length) * 100}%` }}
          />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-1">
          <div className="flex gap-1 items-center">
            {STEPS.map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i <= stepIdx ? "bg-orange-500 w-5" : "bg-slate-200 w-1.5"}`} />
            ))}
            <span className="text-[10px] text-slate-400 font-semibold ml-2">{stepIdx + 1} / {STEPS.length}</span>
          </div>
          <button
            onClick={handleSaveExit}
            className="flex items-center gap-1 text-[11px] text-slate-400 font-bold bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition-colors"
          >
            <Save className="w-3 h-3" /> Save & Exit
          </button>
        </div>

        {/* Content */}
        <div className="px-5 pt-3 pb-6 max-h-[72vh] overflow-y-auto">

          {/* Welcome */}
          {step.id === "welcome" && (
            <div className="text-center pt-2 pb-4">
              <div className="text-5xl mb-4">{step.emoji}</div>
              <h2 className="text-xl font-black text-slate-900 mb-2">{step.title}</h2>
              <p className="text-sm text-slate-500 leading-relaxed mb-5">{step.subtitle}</p>
              <div className="grid grid-cols-3 gap-2 mb-6">
                {["📋 Move Plan", "🚛 Find Movers", "📦 Sort Items"].map((label, i) => (
                  <div key={i} className="bg-orange-50 rounded-2xl p-3 text-center">
                    <p className="text-[11px] font-bold text-orange-700">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mover Question */}
          {step.id === "mover_question" && (
            <div className="text-center pt-2 pb-4">
              <div className="text-5xl mb-4">{step.emoji}</div>
              <h2 className="text-xl font-black text-slate-900 mb-2">{step.title}</h2>
              <p className="text-sm text-slate-500 leading-relaxed mb-6">{step.subtitle}</p>
              <div className="space-y-3">
                <button onClick={() => handleMoverAnswer(true)}
                  className={`w-full py-4 rounded-2xl font-bold text-sm transition-all shadow-lg ${needsMover === true ? "bg-orange-600 text-white scale-[0.99]" : "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-orange-200"}`}>
                  Yes, I need a mover
                </button>
                <button onClick={() => handleMoverAnswer(false)}
                  className={`w-full py-4 rounded-2xl border-2 font-bold text-sm transition-all ${needsMover === false ? "border-orange-400 bg-orange-50 text-orange-600" : "border-slate-200 text-slate-700 hover:border-orange-400 hover:bg-orange-50"}`}>
                  No, I'll move myself
                </button>
              </div>
            </div>
          )}

          {/* Stays vs Goes */}
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
                      <button onClick={() => toggleDecision(label, "moving")}
                        className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border transition-all ${decisions[label] === "moving" ? "bg-orange-500 text-white border-orange-500" : "bg-white text-slate-500 border-slate-200"}`}>
                        Moving
                      </button>
                      <button onClick={() => toggleDecision(label, "donate")}
                        className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border transition-all ${decisions[label] === "donate" ? "bg-purple-500 text-white border-purple-500" : "bg-white text-slate-500 border-slate-200"}`}>
                        Donate
                      </button>
                      <button onClick={() => toggleDecision(label, "junk")}
                        className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border transition-all ${decisions[label] === "junk" ? "bg-red-500 text-white border-red-500" : "bg-white text-slate-500 border-slate-200"}`}>
                        Junk
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
              {!loadingMovers && moversLoaded && movers.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-4">No results found. You can search in the AI Assist tab.</p>
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
                      <Phone className="w-3 h-3" />{m.phone}
                    </a>
                  )}
                </div>
              ))}
              {/* Skip movers if they said they don't need one */}
              {needsMover === false && !loadingMovers && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3 text-center">
                  <p className="text-sm font-bold text-emerald-700">Great! You'll handle your own move.</p>
                  <p className="text-xs text-emerald-600 mt-1">We'll focus your plan on packing & logistics instead.</p>
                </div>
              )}
            </div>
          )}

          {/* Done */}
          {step.id === "done" && (
            <div className="text-center pt-2 pb-4">
              <div className="text-5xl mb-4">{step.emoji}</div>
              <h2 className="text-xl font-black text-slate-900 mb-2">{step.title}</h2>
              <p className="text-sm text-slate-500 leading-relaxed mb-5">{step.subtitle}</p>
              <div className="space-y-2">
                {[
                  "Your Week 1 tasks are ready below",
                  "My Stuff tab is pre-loaded with your decisions",
                  "Tap any task for AI-powered help & local services",
                ].map((tip, i) => (
                  <div key={i} className="flex items-center gap-2 bg-emerald-50 rounded-2xl px-4 py-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <p className="text-[11px] font-semibold text-emerald-700 text-left">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTA — hide for mover question (has own buttons) */}
          {step.id !== "mover_question" && (
            <button
              onClick={stepIdx === STEPS.length - 1 ? finish : handleNext}
              className="w-full mt-5 py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-sm shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
            >
              {stepIdx === STEPS.length - 1 ? "Go to My Plan 🎉" : "Continue →"}
              {stepIdx < STEPS.length - 1 && <ChevronRight className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}