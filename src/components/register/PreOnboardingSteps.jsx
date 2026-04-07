import { useState } from "react";
import { ChevronRight, ChevronLeft, Home, Truck, Package, DollarSign, CheckCircle2 } from "lucide-react";

const ROOM_OPTIONS = [
  { id: "studio", label: "Studio / 1BR", hours: 3, baseCost: 350 },
  { id: "2br", label: "2 Bedrooms", hours: 5, baseCost: 550 },
  { id: "3br", label: "3 Bedrooms", hours: 7, baseCost: 750 },
  { id: "4br", label: "4+ Bedrooms", hours: 10, baseCost: 1050 },
];

const SPECIALTY_ITEMS = [
  { id: "piano", label: "🎹 Piano", extra: 200 },
  { id: "pool_table", label: "🎱 Pool Table", extra: 250 },
  { id: "safe", label: "🔒 Heavy Safe", extra: 150 },
  { id: "antiques", label: "🏺 Antiques", extra: 100 },
  { id: "none", label: "None of these", extra: 0 },
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
    low: Math.round(base * 0.85 / 50) * 50,
    mid: base,
    high: Math.round(base * 1.25 / 50) * 50,
  };
}

export default function PreOnboardingSteps({ userId, onComplete }) {
  const [step, setStep] = useState(0);
  const [movingStatus, setMovingStatus] = useState(null); // "moving" | "staying"
  const [rooms, setRooms] = useState(null);
  const [specialty, setSpecialty] = useState([]);
  const [hasMover, setHasMover] = useState(null);

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

  const costEst = rooms ? estimateCost(rooms, specialty, hasMover) : null;

  // Step 0 — Move vs Stay
  if (step === 0) return (
    <StepShell title="Are you moving out?" emoji="🏠" step={1} total={totalSteps}>
      <p className="text-sm text-slate-500 mb-6">This helps us build the right plan for you.</p>
      <div className="space-y-3">
        <OptionBtn
          label="✅ Yes — I'm moving"
          sub="I need a full move plan"
          onClick={() => { setMovingStatus("moving"); next(); }}
        />
        <OptionBtn
          label="🏡 No — I'm staying"
          sub="I just need estate/downsizing help"
          onClick={() => { setMovingStatus("staying"); setStep(4); }}
        />
      </div>
    </StepShell>
  );

  // Step 1 — Rooms
  if (step === 1) return (
    <StepShell title="How big is your move?" emoji="📦" step={2} total={totalSteps} onBack={back}>
      <p className="text-sm text-slate-500 mb-6">Select your home size so we can estimate costs.</p>
      <div className="space-y-2.5">
        {ROOM_OPTIONS.map(r => (
          <OptionBtn
            key={r.id}
            label={r.label}
            onClick={() => { setRooms(r.id); next(); }}
            selected={rooms === r.id}
          />
        ))}
      </div>
    </StepShell>
  );

  // Step 2 — Specialty items
  if (step === 2) return (
    <StepShell title="Any specialty items?" emoji="🎹" step={3} total={totalSteps} onBack={back}>
      <p className="text-sm text-slate-500 mb-6">These affect mover pricing. Select all that apply.</p>
      <div className="space-y-2.5 mb-6">
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
      <button
        onClick={next}
        disabled={specialty.length === 0}
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-sm disabled:opacity-40 flex items-center justify-center gap-2"
      >
        Continue <ChevronRight className="w-4 h-4" />
      </button>
    </StepShell>
  );

  // Step 3 — Local mover?
  if (step === 3) return (
    <StepShell title="Will you use a local mover?" emoji="🚚" step={4} total={totalSteps} onBack={back}>
      <p className="text-sm text-slate-500 mb-6">We'll find top-rated movers and estimate your costs.</p>
      <div className="space-y-3">
        <OptionBtn
          label="✅ Yes — get mover quotes"
          sub="We'll compare 3 local movers for you"
          onClick={() => { setHasMover(true); next(); }}
        />
        <OptionBtn
          label="🙅 No — I'll handle it myself"
          sub="DIY or friends/family"
          onClick={() => { setHasMover(false); save({ hasMover: false }); finish(); }}
        />
      </div>
    </StepShell>
  );

  // Step 4 — Cost estimate
  if (step === 4) {
    const est = rooms ? estimateCost(rooms, specialty, true) : null;
    return (
      <StepShell title="Your moving cost estimate" emoji="💰" step={5} total={totalSteps} onBack={hasMover ? back : undefined}>
        {est ? (
          <>
            <p className="text-sm text-slate-500 mb-5">Based on your home size and inventory — local move, ~15 miles.</p>
            <div className="grid grid-cols-3 gap-3 mb-6">
              <CostCard label="Low" amount={est.low} color="text-emerald-600" />
              <CostCard label="Estimated" amount={est.mid} color="text-orange-500" highlight />
              <CostCard label="High" amount={est.high} color="text-red-500" />
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-2xl px-4 py-3 mb-5 text-xs text-orange-700">
              💡 Most local moves in your area run <strong>${est.low}–${est.high}</strong>. Book early — availability fills up fast near your closing date.
            </div>
          </>
        ) : (
          <div className="bg-slate-50 rounded-2xl p-4 mb-5 text-sm text-slate-500">
            You chose to handle the move yourself — no mover cost needed!
          </div>
        )}
        <button
          onClick={finish}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-200"
        >
          <CheckCircle2 className="w-4 h-4" />
          Got it — Set Up My Week 1 Plan
          <ChevronRight className="w-4 h-4" />
        </button>
      </StepShell>
    );
  }

  return null;
}

function StepShell({ title, emoji, step, total, onBack, children }) {
  return (
    <div className="w-full">
      {/* Progress dots */}
      <div className="flex items-center gap-1.5 mb-6">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all ${
              i < step ? "bg-orange-500" : i === step - 1 ? "bg-orange-300" : "bg-slate-100"
            }`}
          />
        ))}
        <span className="text-xs font-bold text-orange-500 ml-1">{step}/{total}</span>
      </div>
      <div className="text-4xl mb-4">{emoji}</div>
      <h2 className="text-2xl font-black text-slate-900 mb-2">{title}</h2>
      {children}
      {onBack && (
        <button onClick={onBack} className="mt-4 flex items-center gap-1 text-slate-400 text-sm font-semibold">
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
      )}
    </div>
  );
}

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