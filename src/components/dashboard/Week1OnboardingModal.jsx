import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { CheckCircle2, ChevronRight, ChevronLeft, Loader2, Phone, Save, Sparkles } from "lucide-react";

// ── Full room-by-room inventory ──────────────────────────────────────────────
const ROOMS = [
  {
    room: "Living Room", emoji: "🛋️",
    items: ["Sofa", "Loveseat", "Coffee Table", "TV Stand / Entertainment Center", "Bookcase", "Area Rug", "Floor Lamps", "Artwork / Wall Decor"],
  },
  {
    room: "Bedroom", emoji: "🛏️",
    items: ["Bed Frame", "Mattress", "Dresser", "Nightstands", "Wardrobe / Armoire", "Desk & Chair", "Mirror"],
  },
  {
    room: "Kitchen", emoji: "🍳",
    items: ["Refrigerator", "Stove / Oven", "Dishwasher", "Microwave", "Pots & Pans", "Dishes & Glassware", "Small Appliances (toaster, blender…)"],
  },
  {
    room: "Dining Room", emoji: "🪑",
    items: ["Dining Table", "Dining Chairs", "China Cabinet / Hutch", "Bar Cart"],
  },
  {
    room: "Garage / Outdoor", emoji: "🔧",
    items: ["Tools & Tool Box", "Lawn Mower / Equipment", "Patio Furniture", "Bikes & Sports Gear", "Storage Shelves / Cabinets", "Ladders"],
  },
  {
    room: "Other", emoji: "📦",
    items: ["Electronics & Cables", "Books & Media", "Holiday / Seasonal Decor", "Exercise Equipment", "Clothing & Personal Items"],
  },
];

const CHOICES = [
  { id: "move",   label: "Moving",  color: "bg-orange-500 text-white border-orange-500" },
  { id: "donate", label: "Donate",  color: "bg-purple-500 text-white border-purple-500" },
  { id: "junk",   label: "Junk",    color: "bg-red-500 text-white border-red-500" },
];

const STEPS = ["welcome", "stays_goes", "estate_sale", "movers", "done"];

const STORAGE_KEY = (id) => `onboarding_progress_${id}`;

// ── AI helper ────────────────────────────────────────────────────────────────
async function findProviders(query, address) {
  const res = await base44.integrations.Core.InvokeLLM({
    prompt: `Find 3 real top-rated local businesses for: "${query}" near ${address || "my area"}. Include name, phone number, and a 1-line description.`,
    add_context_from_internet: true,
    response_json_schema: {
      type: "object",
      properties: {
        providers: {
          type: "array",
          items: { type: "object", properties: { name: { type: "string" }, phone: { type: "string" }, description: { type: "string" } } }
        }
      }
    }
  });
  return res?.providers || [];
}

// ── Component ────────────────────────────────────────────────────────────────
export default function Week1OnboardingModal({ user, onDone }) {
  const savedKey = STORAGE_KEY(user?.id);
  const saved = (() => { try { return JSON.parse(localStorage.getItem(savedKey) || "{}"); } catch { return {}; } })();

  const [stepIdx, setStepIdx]       = useState(saved.stepIdx ?? 0);
  const [decisions, setDecisions]   = useState(saved.decisions ?? {});          // { "Sofa": "move" | "donate" | "junk" }
  const [needsEstate, setNeedsEstate] = useState(saved.needsEstate ?? null);
  const [needsMover, setNeedsMover]   = useState(saved.needsMover ?? null);
  const [providers, setProviders]   = useState([]);
  const [loadingAI, setLoadingAI]   = useState(false);

  const step = STEPS[stepIdx];

  const persist = (patch = {}) => {
    localStorage.setItem(savedKey, JSON.stringify({ stepIdx, decisions, needsEstate, needsMover, ...patch }));
  };

  const goTo = (idx, patch = {}) => {
    setStepIdx(idx);
    persist({ stepIdx: idx, ...patch });
  };

  const toggleItem = (item, choice) => {
    const updated = { ...decisions, [item]: decisions[item] === choice ? null : choice };
    setDecisions(updated);
    persist({ decisions: updated });
  };

  const handleEstateAnswer = async (answer) => {
    setNeedsEstate(answer);
    persist({ needsEstate: answer });
    if (answer) {
      setLoadingAI(true);
      setProviders(await findProviders("estate sale companies", user?.home_address));
      setLoadingAI(false);
    }
    goTo(stepIdx + 1, { needsEstate: answer });
  };

  const handleMoverAnswer = async (answer) => {
    setNeedsMover(answer);
    persist({ needsMover: answer });
    if (answer) {
      setLoadingAI(true);
      setProviders(await findProviders("local moving companies", user?.home_address));
      setLoadingAI(false);
    }
    goTo(stepIdx + 1, { needsMover: answer });
  };

  const finish = () => {
    // Seed MyStuff lists
    const stuffLists = { move: [], junk: [], donate: [] };
    Object.entries(decisions).forEach(([name, choice]) => {
      if (stuffLists[choice]) stuffLists[choice].push({ id: `seed-${name}`, name, size: "Medium" });
    });
    base44.auth.updateMe({ stuff_lists: JSON.stringify(stuffLists), needs_mover: needsMover, needs_estate_sale: needsEstate }).catch(() => {});
    localStorage.setItem(`onboarding_done_${user?.id}`, "1");
    localStorage.removeItem(savedKey);
    onDone();
  };

  const handleSaveExit = () => {
    persist({ stepIdx });
    base44.auth.logout("/");
  };

  const decisionCount = Object.values(decisions).filter(Boolean).length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col">
      {/* Top bar */}
      <div className="bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
            <span className="text-white text-[9px] font-black">EZ</span>
          </div>
          <span className="text-sm font-black text-slate-800">Week 1 Setup</span>
          <span className="text-xs text-slate-400 font-semibold">{stepIdx + 1} / {STEPS.length}</span>
        </div>
        <button
          onClick={handleSaveExit}
          className="flex items-center gap-1 text-[11px] text-slate-500 font-bold bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-colors"
        >
          <Save className="w-3 h-3" /> Save & Exit
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-slate-100 flex-shrink-0">
        <div
          className="h-full bg-gradient-to-r from-orange-500 to-orange-400 transition-all duration-500"
          style={{ width: `${((stepIdx + 1) / STEPS.length) * 100}%` }}
        />
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 py-6 max-w-md mx-auto w-full">

        {/* ── WELCOME ── */}
        {step === "welcome" && (
          <div className="text-center">
            <div className="text-6xl mb-5">👋</div>
            <h2 className="text-2xl font-black text-slate-900 mb-3">Welcome to EZ Move AI!</h2>
            <p className="text-sm text-slate-500 leading-relaxed mb-8">
              Your agent set up this account for you. Let's build your personalized moving plan — it takes about 3 minutes. You can save & come back any time.
            </p>
            <div className="grid grid-cols-3 gap-3 mb-8">
              {["📋 Move Plan", "📦 Sort Items", "🚛 Find Movers"].map((l) => (
                <div key={l} className="bg-orange-50 rounded-2xl p-3 text-center">
                  <p className="text-[11px] font-bold text-orange-700">{l}</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => goTo(1)}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-black text-sm shadow-lg shadow-orange-200 flex items-center justify-center gap-2"
            >
              Let's Get Started <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ── STAYS / GOES ── */}
        {step === "stays_goes" && (
          <div>
            <div className="flex justify-end mb-1">
              <button onClick={() => goTo(2)} className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 transition-colors px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200">
                Skip for now →
              </button>
            </div>
            <div className="text-center mb-5">
              <div className="text-4xl mb-2">📦</div>
              <h2 className="text-xl font-black text-slate-900">What Stays vs. Goes?</h2>
              <p className="text-xs text-slate-400 mt-1">Tap each item to sort it. This pre-loads your "My Stuff" tab.</p>
              {decisionCount > 0 && (
                <p className="text-xs font-bold text-orange-500 mt-1">{decisionCount} item{decisionCount !== 1 ? "s" : ""} sorted so far</p>
              )}
            </div>

            <div className="space-y-4 mb-6">
              {ROOMS.map(({ room, emoji, items }) => (
                <div key={room}>
                  <p className="text-xs font-black text-slate-600 uppercase tracking-wider mb-2">{emoji} {room}</p>
                  <div className="space-y-1.5">
                    {items.map((item) => (
                      <div key={item} className="flex items-center gap-2 bg-white rounded-2xl px-3 py-2.5 border border-slate-100">
                        <p className="text-xs font-semibold text-slate-700 flex-1 leading-tight">{item}</p>
                        <div className="flex gap-1">
                          {CHOICES.map((c) => (
                            <button
                              key={c.id}
                              onClick={() => toggleItem(item, c.id)}
                              className={`px-2 py-1 rounded-lg text-[9px] font-bold border transition-all ${
                                decisions[item] === c.id ? c.color : "bg-white text-slate-400 border-slate-200"
                              }`}
                            >
                              {c.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <p className="text-[10px] text-slate-400 text-center mb-4">You can always edit these in the "My Stuff" tab later</p>
            <div className="flex gap-3">
              <button onClick={() => goTo(0)} className="flex items-center gap-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-500 font-bold text-sm">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => goTo(2)}
                className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-sm shadow-lg shadow-orange-200 flex items-center justify-center gap-2"
              >
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── ESTATE SALE ── */}
        {step === "estate_sale" && (
          <div className="text-center">
            <div className="text-5xl mb-4">🏷️</div>
            <h2 className="text-xl font-black text-slate-900 mb-2">Do you need an Estate Sale?</h2>
            <p className="text-sm text-slate-500 leading-relaxed mb-3">If you have furniture or valuables you want to sell, a professional estate sale company can handle it for you.</p>
            <div className="bg-purple-50 border border-purple-200 rounded-2xl px-4 py-3 mb-6 flex items-start gap-2 text-left">
              <Sparkles className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-purple-700 font-semibold">Say Yes and we'll find top-rated estate sale companies near you right now.</p>
            </div>

            {loadingAI && (
              <div className="flex flex-col items-center py-8 gap-3">
                <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                <p className="text-sm text-slate-500">Finding estate sale companies near you…</p>
              </div>
            )}

            {!loadingAI && needsEstate === null && (
              <div className="space-y-3">
                <button onClick={() => handleEstateAnswer(true)}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-sm shadow-lg shadow-orange-200">
                  Yes, I need an estate sale
                </button>
                <button onClick={() => handleEstateAnswer(false)}
                  className="w-full py-3.5 rounded-2xl border-2 border-slate-200 text-slate-700 font-bold text-sm">
                  No, I'll handle items myself
                </button>
              </div>
            )}

            {!loadingAI && needsEstate !== null && (
              <div>
                {providers.length > 0 && (
                  <div className="space-y-2 mb-5 text-left">
                    {providers.map((p, i) => (
                      <div key={i} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
                        <p className="font-bold text-slate-800 text-sm">{p.name}</p>
                        {p.description && <p className="text-xs text-slate-500 mt-0.5">{p.description}</p>}
                        {p.phone && <a href={`tel:${p.phone}`} className="text-xs font-bold text-orange-500 flex items-center gap-1 mt-1"><Phone className="w-3 h-3" />{p.phone}</a>}
                      </div>
                    ))}
                  </div>
                )}
                {needsEstate === false && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3 mb-5">
                    <p className="text-sm font-bold text-emerald-700">Got it — we'll skip estate sale planning.</p>
                  </div>
                )}
                <div className="flex gap-3">
                  <button onClick={() => { setNeedsEstate(null); setProviders([]); }} className="flex items-center gap-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-500 font-bold text-sm">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button onClick={() => goTo(3)} className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-sm shadow-lg shadow-orange-200 flex items-center justify-center gap-2">
                    Continue <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── MOVERS ── */}
        {step === "movers" && (
          <div className="text-center">
            <div className="text-5xl mb-4">🚛</div>
            <h2 className="text-xl font-black text-slate-900 mb-2">Will you need a mover?</h2>
            <p className="text-sm text-slate-500 leading-relaxed mb-3">Getting quotes early ensures you lock in a good date and price.</p>
            <div className="bg-purple-50 border border-purple-200 rounded-2xl px-4 py-3 mb-6 flex items-start gap-2 text-left">
              <Sparkles className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-purple-700 font-semibold">Say Yes and we'll find top-rated local movers near you right now.</p>
            </div>

            {loadingAI && (
              <div className="flex flex-col items-center py-8 gap-3">
                <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                <p className="text-sm text-slate-500">Finding movers near you…</p>
              </div>
            )}

            {!loadingAI && needsMover === null && (
              <div className="space-y-3">
                <button onClick={() => handleMoverAnswer(true)}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-sm shadow-lg shadow-orange-200">
                  Yes, I need a mover
                </button>
                <button onClick={() => handleMoverAnswer(false)}
                  className="w-full py-3.5 rounded-2xl border-2 border-slate-200 text-slate-700 font-bold text-sm">
                  No, I'll move myself
                </button>
              </div>
            )}

            {!loadingAI && needsMover !== null && (
              <div>
                {providers.length > 0 && (
                  <div className="space-y-2 mb-5 text-left">
                    {providers.map((p, i) => (
                      <div key={i} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
                        <p className="font-bold text-slate-800 text-sm">{p.name}</p>
                        {p.description && <p className="text-xs text-slate-500 mt-0.5">{p.description}</p>}
                        {p.phone && <a href={`tel:${p.phone}`} className="text-xs font-bold text-orange-500 flex items-center gap-1 mt-1"><Phone className="w-3 h-3" />{p.phone}</a>}
                      </div>
                    ))}
                  </div>
                )}
                {needsMover === false && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3 mb-5">
                    <p className="text-sm font-bold text-emerald-700">Great — we'll focus your plan on packing & logistics.</p>
                  </div>
                )}
                <div className="flex gap-3">
                  <button onClick={() => { setNeedsMover(null); setProviders([]); }} className="flex items-center gap-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-500 font-bold text-sm">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button onClick={() => goTo(4)} className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-sm shadow-lg shadow-orange-200 flex items-center justify-center gap-2">
                    Continue <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── DONE ── */}
        {step === "done" && (
          <div className="text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">You're all set!</h2>
            <p className="text-sm text-slate-500 leading-relaxed mb-6">Your Week 1 plan is built. Your inventory decisions are saved in the "My Stuff" tab and your full checklist is ready to go.</p>
            <div className="space-y-2 mb-8">
              {[
                "Your Week 1 tasks are ready in My Move",
                "My Stuff tab is pre-loaded with your decisions",
                "AI Assist has local providers ready for you",
              ].map((tip, i) => (
                <div key={i} className="flex items-center gap-2 bg-emerald-50 rounded-2xl px-4 py-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <p className="text-[11px] font-semibold text-emerald-700 text-left">{tip}</p>
                </div>
              ))}
            </div>
            <button
              onClick={finish}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-black text-sm shadow-lg shadow-orange-200 flex items-center justify-center gap-2"
            >
              Go to My Dashboard 🎉
            </button>
          </div>
        )}
      </div>
    </div>
  );
}