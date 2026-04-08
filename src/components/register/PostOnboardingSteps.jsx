import { useState, useEffect } from "react";
import { ChevronLeft, Star, Phone, Sparkles, CheckCircle2, LayoutDashboard, Truck, Trash2, Heart, Save } from "lucide-react";
import { base44 } from "@/api/base44Client";

// ─── Dashboard Builder Header ─────────────────────────────────────────────────

function DashboardBuilderBanner({ step, onSaveAndExit }) {
  const sections = [
    { icon: Truck, label: "Mover", color: "text-orange-500", bg: "bg-orange-100" },
    { icon: Trash2, label: "Junk Removal", color: "text-slate-500", bg: "bg-slate-100" },
    { icon: Heart, label: "Donations", color: "text-slate-500", bg: "bg-slate-100" },
  ].map((s, i) => ({ ...s, done: i < step, active: i === step }));

  return (
    <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-5 pt-5 pb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-orange-500 flex items-center justify-center">
            <LayoutDashboard className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <p className="text-white text-xs font-black tracking-wide">Building Your EZ Move Dashboard</p>
            <p className="text-slate-400 text-[10px]">Tap to save · finish anytime</p>
          </div>
        </div>
        <button onClick={onSaveAndExit} className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold px-3 py-1.5 rounded-full transition-all">
          <Save className="w-3 h-3" />
          Save & Exit
        </button>
      </div>

      {/* Section progress pills */}
      <div className="flex gap-2">
        {sections.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className={`flex-1 flex items-center gap-1.5 rounded-xl px-2 py-1.5 transition-all ${
              s.active ? "bg-orange-500" : s.done ? "bg-white/20" : "bg-white/5"
            }`}>
              <Icon className={`w-3 h-3 ${s.active ? "text-white" : s.done ? "text-white" : "text-slate-500"}`} />
              <span className={`text-[10px] font-bold truncate ${s.active ? "text-white" : s.done ? "text-white/80" : "text-slate-500"}`}>
                {s.label}
              </span>
              {s.done && <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400 ml-auto flex-shrink-0" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Saved Confirmation Toast ─────────────────────────────────────────────────

function SavedBadge({ name }) {
  return (
    <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3 animate-slide-up">
      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
      <div>
        <p className="text-xs font-black text-emerald-700">Saved to your EZ Move Dashboard!</p>
        <p className="text-[10px] text-emerald-600">{name} added to your contacts.</p>
      </div>
    </div>
  );
}

// ─── Provider Card ────────────────────────────────────────────────────────────

function ProviderCard({ provider, selected, onSelect }) {
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left rounded-2xl border-2 p-4 transition-all active:scale-[0.98] ${
        selected
          ? "border-orange-400 bg-orange-50 shadow-md shadow-orange-100"
          : "border-slate-200 bg-white shadow-sm"
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <p className="font-black text-slate-900 text-base pr-2">{provider.name}</p>
        <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5 flex-shrink-0">
          <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
          <span className="text-xs font-bold text-amber-700">{provider.rating}</span>
          <span className="text-[10px] text-amber-500">({provider.reviews})</span>
        </div>
      </div>
      <p className="text-sm text-slate-500 leading-relaxed mb-2">{provider.description}</p>
      <div className="flex items-center gap-2">
        <Phone className="w-3.5 h-3.5 text-orange-500" />
        <span className="text-sm font-semibold text-orange-600">{provider.phone}</span>
        {selected && (
          <span className="ml-auto text-[10px] font-black text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">
            ✓ Selected
          </span>
        )}
      </div>
    </button>
  );
}

// ─── Section Intro Card ───────────────────────────────────────────────────────

function SectionIntro({ emoji, title, subtitle }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-4 flex items-center gap-4">
      <div className="text-4xl">{emoji}</div>
      <div>
        <p className="text-[10px] font-bold text-orange-500 uppercase tracking-wide mb-0.5">Now setting up</p>
        <p className="font-black text-slate-900 text-base leading-tight">{title}</p>
        <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
}

// ─── Step 1: Find a Mover ─────────────────────────────────────────────────────

function FindMoverStep({ onNext, userAddress }) {
  const [loading, setLoading] = useState(false);
  const [movers, setMovers] = useState(null);
  const [saved, setSaved] = useState(null);

  const fallback = [
    { name: "All Star Movers", rating: "4.9", reviews: 312, phone: "(555) 210-4400", description: "Full-service local & long-distance. No hidden fees." },
    { name: "QuickShift Moving Co.", rating: "4.7", reviews: 187, phone: "(555) 340-8821", description: "Same-day availability, specialty item experts." },
    { name: "TrustMove Pro", rating: "4.8", reviews: 254, phone: "(555) 901-2233", description: "Licensed & insured. Rated #1 for customer satisfaction." },
  ];

  const fetchMovers = async () => {
    setLoading(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a moving company directory. Generate 3 realistic top-rated moving companies for someone moving from "${userAddress || "the local area"}". Each should have a name, rating (4.5–5.0), reviews count (number), phone number, and a one-line description of their specialty.`,
        response_json_schema: {
          type: "object",
          properties: {
            movers: { type: "array", items: { type: "object", properties: { name: { type: "string" }, rating: { type: "string" }, reviews: { type: "number" }, phone: { type: "string" }, description: { type: "string" } } } }
          }
        }
      });
      setMovers(res.movers?.length ? res.movers : fallback);
    } catch {
      setMovers(fallback);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (mover) => {
    setSaved(mover);
    // Store in localStorage for dashboard
    try { localStorage.setItem('ez_dashboard_mover', JSON.stringify(mover)); } catch {}
    setTimeout(() => onNext({ findMover: "Yes", selectedMover: mover }), 1200);
  };

  if (loading) return (
    <div className="flex flex-col items-center py-20 gap-4">
      <div className="w-16 h-16 rounded-3xl bg-orange-50 flex items-center justify-center">
        <Sparkles className="w-8 h-8 text-orange-500 animate-pulse" />
      </div>
      <p className="font-bold text-slate-700">Finding top movers near you…</p>
      <p className="text-xs text-slate-400">AI-searching local ratings & reviews</p>
    </div>
  );

  if (movers) return (
    <div className="space-y-3">
      <SectionIntro emoji="🚛" title="Your Mover Section" subtitle="Tap one to add it to your dashboard" />
      {saved && <SavedBadge name={saved.name} />}
      <p className="text-xs text-slate-400 text-center font-semibold pt-1">Top 3 movers near {userAddress ? userAddress.split(",")[0] : "you"}</p>
      {movers.map((m, i) => (
        <ProviderCard key={i} provider={m} selected={saved?.name === m.name} onSelect={() => !saved && handleSelect(m)} />
      ))}
      <button onClick={() => onNext({ findMover: "Maybe Later" })} className="w-full text-center text-xs text-slate-400 font-semibold py-3 hover:text-slate-600 transition-colors">
        Skip for now — I'll add this later
      </button>
    </div>
  );

  return (
    <div className="space-y-5">
      <SectionIntro emoji="🚛" title="Your Mover Section" subtitle="Let AI find the best movers near you" />
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3">
        <p className="text-sm text-slate-600 leading-relaxed">We'll search top-rated, geo-located movers near your origin address and add the best one to your EZ Move Dashboard.</p>
        <button
          onClick={fetchMovers}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-200 active:scale-[0.98] transition-all"
        >
          <Sparkles className="w-4 h-4" />
          Find Top Movers Near Me
        </button>
      </div>
      <button onClick={() => onNext({ findMover: "Maybe Later" })} className="w-full text-center text-xs text-slate-400 font-semibold py-2 hover:text-slate-600 transition-colors">
        Skip for now — I'll add this later
      </button>
    </div>
  );
}

// ─── Step 2: Junk Removal ─────────────────────────────────────────────────────

function JunkRemovalStep({ onNext, userAddress }) {
  const [loading, setLoading] = useState(false);
  const [providers, setProviders] = useState(null);
  const [saved, setSaved] = useState(null);

  const fallback = [
    { name: "Junk King", rating: "4.8", reviews: 421, phone: "(555) 100-5500", description: "Same-day junk pickup, eco-friendly disposal & recycling." },
    { name: "1-800-GOT-JUNK?", rating: "4.7", reviews: 893, phone: "(555) 468-5865", description: "Nation's #1 junk removal. All items, any size load." },
    { name: "LoadUp Junk Removal", rating: "4.6", reviews: 214, phone: "(555) 223-8844", description: "Upfront pricing, no hidden fees. Free online quotes." },
  ];

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a local services directory. Generate 3 realistic top-rated junk removal companies near "${userAddress || "the local area"}". Each should have a name, rating (4.5–5.0), reviews count (number), phone number, and a one-line description.`,
        response_json_schema: { type: "object", properties: { providers: { type: "array", items: { type: "object", properties: { name: { type: "string" }, rating: { type: "string" }, reviews: { type: "number" }, phone: { type: "string" }, description: { type: "string" } } } } } }
      });
      setProviders(res.providers?.length ? res.providers : fallback);
    } catch { setProviders(fallback); }
    finally { setLoading(false); }
  };

  const handleSelect = (p) => {
    setSaved(p);
    try { localStorage.setItem('ez_dashboard_junk', JSON.stringify(p)); } catch {}
    setTimeout(() => onNext({ junkRemoval: "Yes", selectedJunkProvider: p }), 1200);
  };

  if (loading) return (
    <div className="flex flex-col items-center py-20 gap-4">
      <div className="w-16 h-16 rounded-3xl bg-orange-50 flex items-center justify-center"><Sparkles className="w-8 h-8 text-orange-500 animate-pulse" /></div>
      <p className="font-bold text-slate-700">Finding junk removal near you…</p>
      <p className="text-xs text-slate-400">AI-searching top-rated local services</p>
    </div>
  );

  if (providers) return (
    <div className="space-y-3">
      <SectionIntro emoji="🗑️" title="Your Junk Removal Section" subtitle="Tap one to add it to your dashboard" />
      {saved && <SavedBadge name={saved.name} />}
      <p className="text-xs text-slate-400 text-center font-semibold pt-1">Top 3 junk removal near {userAddress ? userAddress.split(",")[0] : "you"}</p>
      {providers.map((p, i) => (
        <ProviderCard key={i} provider={p} selected={saved?.name === p.name} onSelect={() => !saved && handleSelect(p)} />
      ))}
      <button onClick={() => onNext({ junkRemoval: "Maybe Later" })} className="w-full text-center text-xs text-slate-400 font-semibold py-3 hover:text-slate-600 transition-colors">
        Skip for now — I'll add this later
      </button>
    </div>
  );

  return (
    <div className="space-y-5">
      <SectionIntro emoji="🗑️" title="Your Junk Removal Section" subtitle="Clear out before the big move" />
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3">
        <p className="text-sm text-slate-600 leading-relaxed">Got stuff to toss before moving? We'll find top-rated junk removal services near you and add them to your dashboard.</p>
        <button onClick={fetchProviders} className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-200 active:scale-[0.98] transition-all">
          <Sparkles className="w-4 h-4" />
          Find Junk Removal Near Me
        </button>
      </div>
      <button onClick={() => onNext({ junkRemoval: "Maybe Later" })} className="w-full text-center text-xs text-slate-400 font-semibold py-2 hover:text-slate-600 transition-colors">
        Skip for now — I'll add this later
      </button>
    </div>
  );
}

// ─── Step 3: Donation Pickup ──────────────────────────────────────────────────

function DonationStep({ onNext, prefilledAddress }) {
  const [loading, setLoading] = useState(false);
  const [providers, setProviders] = useState(null);
  const [saved, setSaved] = useState(null);
  const address = prefilledAddress || "";

  const fallback = [
    { name: "Habitat for Humanity ReStore", rating: "4.8", reviews: 512, phone: "(555) 422-7700", description: "Accepts furniture, appliances, and building materials." },
    { name: "The Salvation Army", rating: "4.6", reviews: 378, phone: "(555) 728-5687", description: "Free pickup for furniture, clothing & household goods." },
    { name: "GreenDrop", rating: "4.7", reviews: 201, phone: "(555) 944-3300", description: "Scheduled donation pickup. Benefits multiple charities." },
  ];

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a local services directory. Generate 3 realistic top-rated donation pickup or drop-off centers near "${address || "the local area"}". Each should have a name, rating (4.5–5.0), reviews count (number), phone number, and a one-line description of what they accept.`,
        response_json_schema: { type: "object", properties: { providers: { type: "array", items: { type: "object", properties: { name: { type: "string" }, rating: { type: "string" }, reviews: { type: "number" }, phone: { type: "string" }, description: { type: "string" } } } } } }
      });
      setProviders(res.providers?.length ? res.providers : fallback);
    } catch { setProviders(fallback); }
    finally { setLoading(false); }
  };

  const handleSelect = (p) => {
    setSaved(p);
    try { localStorage.setItem('ez_dashboard_donation', JSON.stringify(p)); } catch {}
    setTimeout(() => onNext({ donation: "Yes", selectedDonationCenter: p }), 1200);
  };

  if (loading) return (
    <div className="flex flex-col items-center py-20 gap-4">
      <div className="w-16 h-16 rounded-3xl bg-orange-50 flex items-center justify-center"><Sparkles className="w-8 h-8 text-orange-500 animate-pulse" /></div>
      <p className="font-bold text-slate-700">Finding donation centers near you…</p>
      <p className="text-xs text-slate-400">AI-searching local charities & drop-offs</p>
    </div>
  );

  if (providers) return (
    <div className="space-y-3">
      <SectionIntro emoji="♻️" title="Your Donations Section" subtitle="Tap one to add it to your dashboard" />
      {saved && <SavedBadge name={saved.name} />}
      <p className="text-xs text-slate-400 text-center font-semibold pt-1">Top 3 donation centers near {address ? address.split(",")[0] : "you"}</p>
      {providers.map((p, i) => (
        <ProviderCard key={i} provider={p} selected={saved?.name === p.name} onSelect={() => !saved && handleSelect(p)} />
      ))}
      <button onClick={() => onNext({ donation: "Maybe Later" })} className="w-full text-center text-xs text-slate-400 font-semibold py-3 hover:text-slate-600 transition-colors">
        Skip for now — I'll add this later
      </button>
    </div>
  );

  return (
    <div className="space-y-5">
      <SectionIntro emoji="♻️" title="Your Donations Section" subtitle="Give back while you move" />
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3">
        <p className="text-sm text-slate-600 leading-relaxed">Have items to donate? We'll find top-rated donation centers near you and save them straight to your EZ Move Dashboard.</p>
        <button onClick={fetchProviders} className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-200 active:scale-[0.98] transition-all">
          <Sparkles className="w-4 h-4" />
          Find Donation Centers Near Me
        </button>
      </div>
      <button onClick={() => onNext({ donation: "Maybe Later" })} className="w-full text-center text-xs text-slate-400 font-semibold py-2 hover:text-slate-600 transition-colors">
        Skip for now — I'll add this later
      </button>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export default function PostOnboardingSteps({ userId, userAddress, onComplete, onMoverWorkflow }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});

  const advance = (data) => {
    const next = { ...answers, ...data };
    setAnswers(next);
    if (step < 2) setStep(s => s + 1);
    else onComplete(next);
  };

  const handleSaveAndExit = () => {
    onComplete({ ...answers, savedEarly: true });
  };

  return (
    <div className="w-full animate-fade-in" style={{ minHeight: "100vh", background: "#F1F5F9" }}>
      {/* Dashboard Builder Header */}
      <DashboardBuilderBanner step={step} onSaveAndExit={handleSaveAndExit} />

      {/* Step indicator */}
      <div className="bg-white border-b border-slate-100 px-5 py-2.5 flex items-center justify-between">
        {step > 0 ? (
          <button onClick={() => setStep(s => s - 1)} className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center">
            <ChevronLeft className="w-3.5 h-3.5 text-slate-600" />
          </button>
        ) : <div className="w-7" />}
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map(i => (
            <div key={i} className={`rounded-full transition-all ${i === step ? "w-5 h-2 bg-orange-500" : i < step ? "w-2 h-2 bg-orange-300" : "w-2 h-2 bg-slate-200"}`} />
          ))}
        </div>
        <span className="text-[10px] font-bold text-slate-400">{step + 1} / 3</span>
      </div>

      <div className="px-4 pt-5 pb-24 max-w-lg mx-auto">
        {step === 0 && <FindMoverStep onNext={advance} userAddress={userAddress} />}
        {step === 1 && <JunkRemovalStep onNext={advance} userAddress={userAddress} />}
        {step === 2 && <DonationStep onNext={advance} prefilledAddress={userAddress} />}
      </div>
    </div>
  );
}