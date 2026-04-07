import { useState } from "react";
import { ChevronRight, ChevronLeft, CheckCircle2, Sparkles, MapPin, Home, Package, Zap, Shield } from "lucide-react";

// ─── Data (unchanged) ─────────────────────────────────────────────────────────

const ROOM_OPTIONS = [
  { id: "studio", label: "Studio / 1BR", hours: 3, baseCost: 350 },
  { id: "2br",    label: "2 Bedrooms",   hours: 5, baseCost: 550 },
  { id: "3br",    label: "3 Bedrooms",   hours: 7, baseCost: 750 },
  { id: "4br",    label: "4+ Bedrooms",  hours: 10, baseCost: 1050 },
];

const SPECIALTY_ITEMS = [
  { id: "piano",      label: "🎹 Piano",       extra: 200 },
  { id: "pool_table", label: "🎱 Pool Table",   extra: 250 },
  { id: "safe",       label: "🔒 Heavy Safe",   extra: 150 },
  { id: "antiques",   label: "🏺 Antiques",     extra: 100 },
  { id: "none",       label: "None of these",   extra: 0 },
];

function estimateCost(rooms, specialty, hasMover) {
  if (!hasMover) return null;
  const roomData = ROOM_OPTIONS.find(r => r.id === rooms) || ROOM_OPTIONS[1];
  const specialtyExtra = specialty.includes("none") ? 0 : specialty.reduce((sum, s) => {
    const item = SPECIALTY_ITEMS.find(i => i.id === s);
    return sum + (item?.extra || 0);
  }, 0);
  const base = roomData.baseCost + specialtyExtra;
  return {
    low:  Math.round(base * 0.85 / 50) * 50,
    mid:  base,
    high: Math.round(base * 1.25 / 50) * 50,
  };
}

// ─── AI Insight messages ──────────────────────────────────────────────────────

function getInsight(step, movingStatus, rooms, specialty, hasMover) {
  if (step === 0) return { emoji: "✨", text: "Answer a few quick questions and we'll build your personalized move plan." };
  if (step === 1 && movingStatus === "moving") return { emoji: "📐", text: "We're calculating your move scope — home size is the biggest cost factor." };
  if (step === 2) {
    if (rooms === "4br") return { emoji: "🏠", text: "Large home detected — we'll add extra packing time and crew recommendations." };
    if (rooms === "studio") return { emoji: "⚡", text: "Small move detected — this could be done in a single day!" };
    return { emoji: "📦", text: "We're tailoring your move plan based on your home size." };
  }
  if (step === 3) {
    if (specialty.length > 0 && !specialty.includes("none")) return { emoji: "🎹", text: "Specialty items require certified handlers — we'll flag that in your mover search." };
    return { emoji: "🛡️", text: "Good news — no specialty items keeps your quote lower." };
  }
  if (step === 4) return { emoji: "🚛", text: "Local movers are in high demand near closing dates — booking early saves 20%." };
  return { emoji: "🎉", text: "Almost done! Here's your personalized move summary." };
}

// ─── Persona badge ────────────────────────────────────────────────────────────

function getPersona(rooms, specialty, hasMover) {
  if (!rooms) return null;
  if (specialty.length > 1 && !specialty.includes("none")) return { name: "Collector", emoji: "🏺", color: "bg-purple-100 text-purple-700" };
  if (rooms === "studio" || rooms === "2br") return { name: "Minimalist", emoji: "✨", color: "bg-blue-100 text-blue-700" };
  if (rooms === "4br") return { name: "Strategist", emoji: "♟️", color: "bg-amber-100 text-amber-700" };
  return { name: "Planner", emoji: "📋", color: "bg-green-100 text-green-700" };
}

// ─── Timeline preview ─────────────────────────────────────────────────────────

const TIMELINE_STEPS = [
  { icon: Package, label: "Packing Plan" },
  { icon: Zap,     label: "Move Day Setup" },
  { icon: Shield,  label: "Risk Radar" },
  { icon: MapPin,  label: "New Home Guide" },
];

// ─── Main component (logic unchanged) ────────────────────────────────────────

export default function PreOnboardingSteps({ userId, onComplete }) {
  const [step, setStep]               = useState(0);
  const [movingStatus, setMovingStatus] = useState(null);
  const [rooms, setRooms]             = useState(null);
  const [specialty, setSpecialty]     = useState([]);
  const [hasMover, setHasMover]       = useState(null);
  const [showSummary, setShowSummary] = useState(false);

  const totalSteps = movingStatus === "staying" ? 2 : 5;

  const save = (extra = {}) => {
    const data = { movingStatus, rooms, specialty, hasMover, ...extra };
    localStorage.setItem(`pre_onboarding_${userId}`, JSON.stringify(data));
    if (data.hasMover && data.rooms) {
      const est = estimateCost(data.rooms, data.specialty || [], data.hasMover);
      if (est) localStorage.setItem(`demo_mover_cost_${userId}`, JSON.stringify(est));
    }
  };

  const next = () => setStep(s => s + 1);
  const back = () => setStep(s => Math.max(0, s - 1));

  const finish = () => {
    save();
    onComplete({ movingStatus, rooms, specialty, hasMover });
  };

  const finishWithSummary = () => {
    save();
    setShowSummary(true);
  };

  const costEst = rooms ? estimateCost(rooms, specialty, hasMover) : null;
  const insight = getInsight(step, movingStatus, rooms, specialty, hasMover);
  const persona = getPersona(rooms, specialty, hasMover);

  // ── Summary screen ──────────────────────────────────────────────────────────
  if (showSummary) {
    const roomLabel = ROOM_OPTIONS.find(r => r.id === rooms)?.label || "—";
    const est = rooms ? estimateCost(rooms, specialty, true) : null;
    const specialtyLabels = specialty.filter(s => s !== "none").map(s => SPECIALTY_ITEMS.find(i => i.id === s)?.label).filter(Boolean);
    return (
      <div className="w-full animate-fade-in" style={{ background: "linear-gradient(180deg,#F7F9FC 0%,#FFFFFF 100%)", minHeight: "100vh" }}>
        {/* Sticky header */}
        <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-100 shadow-sm px-5 py-3 flex items-center justify-between">
          <button onClick={() => { setShowSummary(false); }} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
            <ChevronLeft className="w-4 h-4 text-slate-600" />
          </button>
          <span className="text-sm font-bold text-slate-700">Your Move Summary</span>
          <span className="text-xs font-bold text-orange-500">✓ Done</span>
        </div>

        <div className="px-5 pt-5 pb-28 space-y-4">
          {/* Hero */}
          <div className="text-center py-4">
            <div className="text-4xl mb-2">🎉</div>
            <h2 className="text-xl font-black text-slate-900">You're all set!</h2>
            <p className="text-sm text-slate-500 mt-1">Here's a summary of your personalized move plan.</p>
          </div>

          {/* Summary cards */}
          <SummaryRow icon="📍" label="Move Type" value={movingStatus === "staying" ? "Staying / Downsizing" : "Full Move Out"} />
          <SummaryRow icon="🏠" label="Home Size" value={roomLabel} />
          {specialtyLabels.length > 0 && (
            <SummaryRow icon="🎹" label="Specialty Items" value={specialtyLabels.join(", ")} />
          )}
          <SummaryRow icon="🚛" label="Using a Mover?" value={hasMover ? "Yes — we'll find local quotes" : "No — self-move / DIY"} />
          {est && (
            <SummaryRow icon="💰" label="Estimated Cost" value={`$${est.low.toLocaleString()} – $${est.high.toLocaleString()}`} highlight />
          )}
          <SummaryRow icon="📦" label="Packing Style" value={rooms === "studio" ? "Light pack (1–2 days)" : rooms === "4br" ? "Full pack (3–5 days)" : "Standard pack (1–3 days)"} />
          <SummaryRow icon="📐" label="Est. Box Count" value={rooms === "studio" ? "15–25 boxes" : rooms === "2br" ? "30–50 boxes" : rooms === "3br" ? "50–75 boxes" : "75–120 boxes"} />

          {persona && (
            <div className="flex items-center justify-center pt-2">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm ${persona.color}`}>
                {persona.emoji} Move Persona: {persona.name}
              </div>
            </div>
          )}
        </div>

        {/* Sticky bottom bar */}
        <div className="fixed bottom-0 left-0 right-0 max-w-sm mx-auto px-5 py-4 bg-white border-t border-slate-100 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] animate-slide-up">
          <button
            onClick={finish}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-200 active:scale-[0.98] transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            Set Up My Week 1 Plan
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // ── Step rendering ──────────────────────────────────────────────────────────

  return (
    <div className="w-full animate-fade-in" style={{ background: "linear-gradient(180deg,#F7F9FC 0%,#FFFFFF 100%)", minHeight: "100vh" }}>
      {/* Sticky header */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-100 shadow-sm px-5 py-3 flex items-center justify-between">
        {step > 0 ? (
          <button onClick={back} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
            <ChevronLeft className="w-4 h-4 text-slate-600" />
          </button>
        ) : <div className="w-8" />}
        <span className="text-sm font-bold text-slate-700">{STEP_TITLES[step] || "Setup"}</span>
        <span className="text-xs font-bold text-orange-500">Step {Math.min(step + 1, totalSteps)} of {totalSteps}</span>
      </div>

      <div className="px-5 pt-4 pb-28 space-y-4">
        {/* Progress bar */}
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, ((step + 1) / totalSteps) * 100)}%` }}
          />
        </div>

        {/* AI Insight Panel */}
        <div className="bg-white rounded-2xl border border-orange-100 shadow-sm px-4 py-3 flex items-start gap-2.5 animate-slide-up">
          <div className="w-7 h-7 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-orange-500" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-orange-500 uppercase tracking-wide mb-0.5">AI Insight</p>
            <p className="text-xs text-slate-600 leading-relaxed">{insight.emoji} {insight.text}</p>
          </div>
        </div>

        {/* Persona badge (after step 1) */}
        {persona && step >= 2 && (
          <div className="flex justify-center animate-fade-in">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${persona.color}`}>
              {persona.emoji} Move Persona: <span>{persona.name}</span>
            </div>
          </div>
        )}

        {/* Step content card */}
        <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-5 animate-slide-up">
          <div className="text-3xl mb-3">{STEP_EMOJIS[step]}</div>
          <h2 className="text-xl font-black text-slate-900 mb-1">{STEP_TITLES[step]}</h2>
          <p className="text-sm text-slate-500 mb-5">{STEP_SUBTITLES[step]}</p>

          {/* Step 0 — Move vs Stay */}
          {step === 0 && (
            <div className="space-y-3">
              <OptionBtn label="✅ Yes — I'm moving" sub="I need a full move plan"
                onClick={() => { setMovingStatus("moving"); next(); }} />
              <OptionBtn label="🏡 No — I'm staying" sub="I just need estate/downsizing help"
                onClick={() => { setMovingStatus("staying"); setStep(4); }} />
            </div>
          )}

          {/* Step 1 — Rooms */}
          {step === 1 && (
            <div className="space-y-2.5">
              {ROOM_OPTIONS.map(r => (
                <OptionBtn key={r.id} label={r.label} onClick={() => { setRooms(r.id); next(); }} selected={rooms === r.id} />
              ))}
              {/* Smart Defaults */}
              <button
                onClick={() => { setRooms("2br"); next(); }}
                className="w-full text-center text-xs text-slate-400 font-semibold py-2 hover:text-orange-500 transition-colors"
              >
                ✨ Fill this for me
              </button>
            </div>
          )}

          {/* Step 2 — Specialty items */}
          {step === 2 && (
            <>
              <div className="space-y-2.5 mb-5">
                {SPECIALTY_ITEMS.map(item => (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.id === "none") {
                        setSpecialty(["none"]);
                      } else {
                        setSpecialty(prev => {
                          const without = prev.filter(p => p !== "none");
                          return without.includes(item.id)
                            ? without.filter(p => p !== item.id)
                            : [...without, item.id];
                        });
                      }
                    }}
                    className={`w-full text-left px-4 py-3 rounded-2xl border-2 text-sm font-semibold transition-all active:scale-[0.98] ${
                      specialty.includes(item.id)
                        ? "border-orange-400 bg-orange-50 text-orange-700"
                        : "border-slate-200 bg-white text-slate-700"
                    }`}
                  >
                    {item.label}
                    {item.extra > 0 && <span className="text-xs text-slate-400 ml-2">(+${item.extra})</span>}
                  </button>
                ))}
              </div>
              {/* Smart Defaults */}
              {specialty.length === 0 && (
                <button
                  onClick={() => setSpecialty(["none"])}
                  className="w-full text-center text-xs text-slate-400 font-semibold py-1 hover:text-orange-500 transition-colors"
                >
                  ✨ Fill this for me — select "None"
                </button>
              )}
            </>
          )}

          {/* Step 3 — Mover? */}
          {step === 3 && (
            <div className="space-y-3">
              <OptionBtn label="✅ Yes — get mover quotes" sub="We'll compare 3 local movers for you"
                onClick={() => { setHasMover(true); next(); }} />
              <OptionBtn label="🙅 No — I'll handle it myself" sub="DIY or friends/family"
                onClick={() => { setHasMover(false); save({ hasMover: false }); finishWithSummary(); }} />
            </div>
          )}

          {/* Step 4 — Cost estimate */}
          {step === 4 && (() => {
            const est = rooms ? estimateCost(rooms, specialty, true) : null;
            return (
              <>
                {est ? (
                  <>
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <CostCard label="Low"       amount={est.low}  color="text-emerald-600" />
                      <CostCard label="Estimated" amount={est.mid}  color="text-orange-500" highlight />
                      <CostCard label="High"      amount={est.high} color="text-red-500" />
                    </div>
                    <div className="bg-orange-50 border border-orange-200 rounded-2xl px-4 py-3 text-xs text-orange-700">
                      💡 Most local moves in your area run <strong>${est.low}–${est.high}</strong>. Book early — availability fills fast near your closing date.
                    </div>
                  </>
                ) : (
                  <div className="bg-slate-50 rounded-2xl p-4 text-sm text-slate-500">
                    You chose to handle the move yourself — no mover cost needed!
                  </div>
                )}
              </>
            );
          })()}
        </div>

        {/* Move Timeline Preview */}
        <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">What's coming next</p>
          <div className="grid grid-cols-4 gap-2">
            {TIMELINE_STEPS.map((t, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center">
                  <t.icon className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <span className="text-[9px] font-semibold text-slate-400 text-center leading-tight">{t.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sticky bottom action bar */}
      {(step === 2 || step === 4) && (
        <div className="fixed bottom-0 left-0 right-0 max-w-sm mx-auto px-5 py-4 bg-white border-t border-slate-100 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] animate-slide-up">
          {step === 2 && (
            <button
              onClick={next}
              disabled={specialty.length === 0}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-sm disabled:opacity-40 flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-lg shadow-orange-200"
            >
              Continue <ChevronRight className="w-4 h-4" />
            </button>
          )}
          {step === 4 && (
            <button
              onClick={finishWithSummary}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-lg shadow-orange-200"
            >
              <CheckCircle2 className="w-4 h-4" />
              See My Summary
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Step metadata ─────────────────────────────────────────────────────────────

const STEP_TITLES    = ["Are you moving out?", "How big is your move?", "Any specialty items?", "Will you use a local mover?", "Your cost estimate"];
const STEP_SUBTITLES = [
  "This helps us build the right plan for you.",
  "Select your home size so we can estimate costs.",
  "These affect mover pricing — select all that apply.",
  "We'll find top-rated movers and estimate your costs.",
  "Based on your home size and inventory — local move, ~15 miles.",
];
const STEP_EMOJIS = ["🏠", "📦", "🎹", "🚚", "💰"];

// ─── Sub-components ────────────────────────────────────────────────────────────

function OptionBtn({ label, sub, onClick, selected }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-4 rounded-2xl border-2 transition-all active:scale-[0.98] ${
        selected
          ? "border-orange-400 bg-orange-50"
          : "border-slate-200 bg-white hover:border-orange-300 hover:bg-orange-50"
      }`}
    >
      <p className="font-bold text-slate-800 text-sm">{label}</p>
      {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
    </button>
  );
}

function CostCard({ label, amount, color, highlight }) {
  return (
    <div className={`rounded-2xl p-3 text-center border-2 ${highlight ? "border-orange-400 bg-orange-50" : "border-slate-100 bg-white"}`}>
      <p className="text-xs text-slate-500 font-semibold mb-1">{label}</p>
      <p className={`text-lg font-black ${color}`}>${amount.toLocaleString()}</p>
    </div>
  );
}

function SummaryRow({ icon, label, value, highlight }) {
  return (
    <div className={`flex items-center gap-3 p-4 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] ${highlight ? "bg-orange-50 border border-orange-200" : "bg-white"}`}>
      <span className="text-xl flex-shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{label}</p>
        <p className={`text-sm font-bold mt-0.5 ${highlight ? "text-orange-600" : "text-slate-800"}`}>{value}</p>
      </div>
    </div>
  );
}