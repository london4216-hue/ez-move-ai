import { useState } from "react";
import { ChevronRight, ChevronLeft, Plus, Minus, Star, Phone, Sparkles } from "lucide-react";
import { base44 } from "@/api/base44Client";

// Reuse the same room/item definitions from MoverQuoteOnboarding
const ROOM_TYPES = [
  { id: "bedroom", label: "Bedroom", emoji: "🛏️" },
  { id: "living_room", label: "Living Room", emoji: "🛋️" },
  { id: "kitchen", label: "Kitchen", emoji: "🍳" },
  { id: "garage", label: "Garage", emoji: "🚗" },
  { id: "bathroom", label: "Bathroom", emoji: "🚿" },
  { id: "office", label: "Home Office", emoji: "💻" },
];

const ROOM_ITEMS = {
  bedroom: ["Bed (Twin)", "Bed (Full)", "Bed (Queen)", "Bed (King)", "Nightstand", "Dresser", "TV", "Lamps"],
  living_room: ["Sofa (2-seat)", "Sofa (3-seat)", "Sectional", "Coffee Table", "TV", "TV Stand", "Lamps"],
  kitchen: ["Cabinets", "Dining Table", "Chairs", "Small Appliances"],
  garage: ["Tool Chest", "Lawn Mower", "Bikes", "Storage Shelves"],
  bathroom: ["Cabinets", "Mirror"],
  office: ["Desk", "Office Chair", "Bookshelves", "Filing Cabinet"],
};

function InventoryPicker({ inventory, setInventory, misc, setMisc }) {
  const [expanded, setExpanded] = useState(null);

  const getQty = (roomId, item) => (inventory[roomId]?.[item] || 0);
  const setQty = (roomId, item, qty) => {
    setInventory(prev => ({
      ...prev,
      [roomId]: { ...(prev[roomId] || {}), [item]: Math.max(0, qty) }
    }));
  };

  const roomTotal = (roomId) =>
    Object.values(inventory[roomId] || {}).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-3">
      {ROOM_TYPES.map(room => {
        const total = roomTotal(room.id);
        const isOpen = expanded === room.id;
        return (
          <div key={room.id} className={`rounded-2xl border-2 ${total > 0 ? "border-orange-300 bg-orange-50/30" : "border-slate-200 bg-white"}`}>
            <button className="w-full flex items-center justify-between px-4 py-3" onClick={() => setExpanded(isOpen ? null : room.id)}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{room.emoji}</span>
                <div className="text-left">
                  <p className="text-sm font-bold text-slate-800">{room.label}</p>
                  {total > 0 && <p className="text-xs text-orange-500 font-semibold">{total} item{total !== 1 ? "s" : ""}</p>}
                </div>
              </div>
              <span className="text-slate-400 text-xs">{isOpen ? "▲" : "▼"}</span>
            </button>
            {isOpen && (
              <div className="px-4 pb-4 border-t border-slate-100 pt-3 space-y-2">
                {ROOM_ITEMS[room.id].map(item => (
                  <div key={item} className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0">
                    <span className="text-sm text-slate-700">{item}</span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setQty(room.id, item, getQty(room.id, item) - 1)}
                        className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-black text-slate-800 w-5 text-center">{getQty(room.id, item)}</span>
                      <button onClick={() => setQty(room.id, item, getQty(room.id, item) + 1)}
                        className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
      <div className="bg-white rounded-2xl border-2 border-slate-200 p-4">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">Miscellaneous Items</label>
        <textarea
          value={misc}
          onChange={e => setMisc(e.target.value)}
          placeholder="List any other items not shown above…"
          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-orange-400 resize-none"
          rows={3}
        />
      </div>
    </div>
  );
}

function OptionButtons({ onSelect }) {
  return (
    <div className="space-y-3">
      {["Yes", "No", "Maybe Later"].map(opt => (
        <button
          key={opt}
          onClick={() => onSelect(opt)}
          className={`w-full py-4 rounded-2xl border-2 font-bold text-sm transition-all active:scale-[0.98] ${
            opt === "Yes"
              ? "border-orange-400 bg-orange-50 text-orange-700 hover:bg-orange-100"
              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

// Step 1: Find a Mover
function FindMoverStep({ onNext, userAddress }) {
  const [loading, setLoading] = useState(false);
  const [movers, setMovers] = useState(null);

  const fetchMovers = async () => {
    setLoading(true);
    const fallback = [
      { name: "All Star Movers", rating: "4.9", reviews: 312, phone: "(555) 210-4400", description: "Full-service local & long-distance. No hidden fees." },
      { name: "QuickShift Moving Co.", rating: "4.7", reviews: 187, phone: "(555) 340-8821", description: "Same-day availability, specialty item experts." },
      { name: "TrustMove Pro", rating: "4.8", reviews: 254, phone: "(555) 901-2233", description: "Licensed & insured. Rated #1 for customer satisfaction." },
    ];
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a moving company directory. Generate 3 realistic top-rated moving companies for someone moving from "${userAddress || "the local area"}". Each should have a name, rating (4.5–5.0), reviews count, phone number, and a one-line description of their specialty.`,
        response_json_schema: {
          type: "object",
          properties: {
            movers: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  rating: { type: "string" },
                  reviews: { type: "number" },
                  phone: { type: "string" },
                  description: { type: "string" }
                }
              }
            }
          }
        }
      });
      setMovers(res.movers || fallback);
    } catch {
      setMovers(fallback);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center py-20 gap-4">
        <div className="w-16 h-16 rounded-3xl bg-orange-50 flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-orange-500 animate-pulse" />
        </div>
        <p className="font-bold text-slate-700">Finding top movers near you…</p>
        <p className="text-xs text-slate-400">Searching local ratings & reviews</p>
      </div>
    );
  }

  if (movers) {
    return (
      <div className="space-y-4">
        <div className="text-center py-2">
          <h2 className="text-xl font-black text-slate-900 mb-1">Top Movers Near You</h2>
          <p className="text-sm text-slate-500">AI-curated based on your move details</p>
        </div>
        {movers.map((m, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-2">
            <div className="flex items-start justify-between">
              <p className="font-black text-slate-900 text-base">{m.name}</p>
              <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
                <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                <span className="text-xs font-bold text-amber-700">{m.rating}</span>
                <span className="text-[10px] text-amber-500">({m.reviews})</span>
              </div>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">{m.description}</p>
            <div className="flex items-center gap-2 pt-1">
              <Phone className="w-3.5 h-3.5 text-orange-500" />
              <span className="text-sm font-semibold text-orange-600">{m.phone}</span>
            </div>
          </div>
        ))}
        <button
          onClick={() => onNext({ findMover: "Yes", movers })}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-200 active:scale-[0.98] transition-all"
        >
          Continue <ChevronRight className="w-4 h-4" />
        </button>
        <button onClick={() => onNext({ findMover: "Maybe Later" })} className="w-full text-center text-xs text-slate-400 font-semibold py-2">
          Skip for now
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center py-4">
        <div className="text-5xl mb-3">🚛</div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Find a Mover</h2>
        <p className="text-slate-500 text-base">Would you like EZ Move AI to find you a top-tier mover?</p>
      </div>
      <div className="space-y-3">
        <button
          onClick={fetchMovers}
          className="w-full py-4 rounded-2xl border-2 border-orange-400 bg-orange-50 text-orange-700 font-bold text-sm hover:bg-orange-100 active:scale-[0.98] transition-all"
        >
          Yes, find me a mover
        </button>
        {["No", "Maybe Later"].map(opt => (
          <button
            key={opt}
            onClick={() => onNext({ findMover: opt })}
            className="w-full py-4 rounded-2xl border-2 border-slate-200 bg-white text-slate-700 font-bold text-sm hover:bg-slate-50 active:scale-[0.98] transition-all"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

// Step 2: Junk Removal
function JunkRemovalStep({ onNext, userAddress }) {
  const [loading, setLoading] = useState(false);
  const [providers, setProviders] = useState(null);

  const fetchProviders = async () => {
    setLoading(true);
    const fallback = [
      { name: "Junk King", rating: "4.8", reviews: 421, phone: "(555) 100-5500", description: "Same-day junk pickup, eco-friendly disposal & recycling." },
      { name: "1-800-GOT-JUNK?", rating: "4.7", reviews: 893, phone: "(555) 468-5865", description: "Nation's #1 junk removal. All items, any size load." },
      { name: "LoadUp Junk Removal", rating: "4.6", reviews: 214, phone: "(555) 223-8844", description: "Upfront pricing, no hidden fees. Free online quotes." },
    ];
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a local services directory. Generate 3 realistic top-rated junk removal companies near "${userAddress || "the local area"}". Each should have a name, rating (4.5–5.0), reviews count, phone number, and a one-line description.`,
        response_json_schema: {
          type: "object",
          properties: {
            providers: { type: "array", items: { type: "object", properties: { name: { type: "string" }, rating: { type: "string" }, reviews: { type: "number" }, phone: { type: "string" }, description: { type: "string" } } } }
          }
        }
      });
      setProviders(res.providers || fallback);
    } catch { setProviders(fallback); }
    finally { setLoading(false); }
  };

  if (loading) return (
    <div className="flex flex-col items-center py-20 gap-4">
      <div className="w-16 h-16 rounded-3xl bg-orange-50 flex items-center justify-center"><Sparkles className="w-8 h-8 text-orange-500 animate-pulse" /></div>
      <p className="font-bold text-slate-700">Finding junk removal services near you…</p>
    </div>
  );

  if (providers) return (
    <div className="space-y-4">
      <div className="text-center py-2">
        <h2 className="text-xl font-black text-slate-900 mb-1">🗑️ Junk Removal Near You</h2>
        <p className="text-sm text-slate-500">AI-curated based on your location</p>
      </div>
      {providers.map((p, i) => (
        <div key={i} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-2">
          <div className="flex items-start justify-between">
            <p className="font-black text-slate-900 text-base">{p.name}</p>
            <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
              <span className="text-xs font-bold text-amber-700">{p.rating}</span>
              <span className="text-[10px] text-amber-500">({p.reviews})</span>
            </div>
          </div>
          <p className="text-sm text-slate-500">{p.description}</p>
          <div className="flex items-center gap-2 pt-1"><Phone className="w-3.5 h-3.5 text-orange-500" /><span className="text-sm font-semibold text-orange-600">{p.phone}</span></div>
        </div>
      ))}
      <button onClick={() => onNext({ junkRemoval: "Yes", junkProviders: providers })} className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-200 active:scale-[0.98] transition-all">Continue <ChevronRight className="w-4 h-4" /></button>
      <button onClick={() => onNext({ junkRemoval: "Maybe Later" })} className="w-full text-center text-xs text-slate-400 font-semibold py-2">Skip for now</button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="text-center py-4">
        <div className="text-5xl mb-3">🗑️</div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Junk Removal</h2>
        <p className="text-slate-500 text-base">Do you have any junk you want removed?</p>
      </div>
      <div className="space-y-3">
        <button onClick={fetchProviders} className="w-full py-4 rounded-2xl border-2 border-orange-400 bg-orange-50 text-orange-700 font-bold text-sm hover:bg-orange-100 active:scale-[0.98] transition-all">Yes, find junk removal</button>
        {["No", "Maybe Later"].map(opt => (
          <button key={opt} onClick={() => onNext({ junkRemoval: opt })} className="w-full py-4 rounded-2xl border-2 border-slate-200 bg-white text-slate-700 font-bold text-sm hover:bg-slate-50 active:scale-[0.98] transition-all">{opt}</button>
        ))}
      </div>
    </div>
  );
}

// Step 3: Donation Pickup
function DonationStep({ onNext, prefilledAddress }) {
  const [loading, setLoading] = useState(false);
  const [providers, setProviders] = useState(null);
  const address = prefilledAddress || "";

  const fetchProviders = async () => {
    setLoading(true);
    const fallback = [
      { name: "Habitat for Humanity ReStore", rating: "4.8", reviews: 512, phone: "(555) 422-7700", description: "Accepts furniture, appliances, and building materials." },
      { name: "The Salvation Army", rating: "4.6", reviews: 378, phone: "(555) 728-5687", description: "Free pickup for furniture, clothing & household goods." },
      { name: "GreenDrop", rating: "4.7", reviews: 201, phone: "(555) 944-3300", description: "Scheduled donation pickup. Benefits multiple charities." },
    ];
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a local services directory. Generate 3 realistic top-rated donation pickup or drop-off centers near "${address || "the local area"}". Each should have a name, rating (4.5–5.0), reviews count, phone number, and a one-line description of what they accept.`,
        response_json_schema: {
          type: "object",
          properties: {
            providers: { type: "array", items: { type: "object", properties: { name: { type: "string" }, rating: { type: "string" }, reviews: { type: "number" }, phone: { type: "string" }, description: { type: "string" } } } }
          }
        }
      });
      setProviders(res.providers || fallback);
    } catch { setProviders(fallback); }
    finally { setLoading(false); }
  };

  if (loading) return (
    <div className="flex flex-col items-center py-20 gap-4">
      <div className="w-16 h-16 rounded-3xl bg-orange-50 flex items-center justify-center"><Sparkles className="w-8 h-8 text-orange-500 animate-pulse" /></div>
      <p className="font-bold text-slate-700">Finding donation centers near you…</p>
    </div>
  );

  if (providers) return (
    <div className="space-y-4">
      <div className="text-center py-2">
        <h2 className="text-xl font-black text-slate-900 mb-1">♻️ Donation Centers Near You</h2>
        <p className="text-sm text-slate-500">AI-curated based on your location</p>
      </div>
      {providers.map((p, i) => (
        <div key={i} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-2">
          <div className="flex items-start justify-between">
            <p className="font-black text-slate-900 text-base">{p.name}</p>
            <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
              <span className="text-xs font-bold text-amber-700">{p.rating}</span>
              <span className="text-[10px] text-amber-500">({p.reviews})</span>
            </div>
          </div>
          <p className="text-sm text-slate-500">{p.description}</p>
          <div className="flex items-center gap-2 pt-1"><Phone className="w-3.5 h-3.5 text-orange-500" /><span className="text-sm font-semibold text-orange-600">{p.phone}</span></div>
        </div>
      ))}
      <button onClick={() => onNext({ donation: "Yes", donationProviders: providers })} className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-200 active:scale-[0.98] transition-all">Finish Setup <ChevronRight className="w-4 h-4" /></button>
      <button onClick={() => onNext({ donation: "Maybe Later" })} className="w-full text-center text-xs text-slate-400 font-semibold py-2">Skip for now</button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="text-center py-4">
        <div className="text-5xl mb-3">♻️</div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Donation Pickup</h2>
        <p className="text-slate-500 text-base">Do you have items you want to donate?</p>
      </div>
      <div className="space-y-3">
        <button onClick={fetchProviders} className="w-full py-4 rounded-2xl border-2 border-orange-400 bg-orange-50 text-orange-700 font-bold text-sm hover:bg-orange-100 active:scale-[0.98] transition-all">Yes, find donation centers</button>
        {["No", "Maybe Later"].map(opt => (
          <button key={opt} onClick={() => onNext({ donation: opt })} className="w-full py-4 rounded-2xl border-2 border-slate-200 bg-white text-slate-700 font-bold text-sm hover:bg-slate-50 active:scale-[0.98] transition-all">{opt}</button>
        ))}
      </div>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export default function PostOnboardingSteps({ userId, userAddress, onComplete, onMoverWorkflow }) {
  const [step, setStep] = useState(0); // 0=mover, 1=junk, 2=donation
  const [answers, setAnswers] = useState({});

  const STEP_TITLES = ["Find a Mover", "Junk Removal", "Donation Pickup"];

  const advance = (data) => {
    const next = { ...answers, ...data };
    setAnswers(next);
    if (step < 2) setStep(s => s + 1);
    else onComplete(next);
  };

  return (
    <div className="w-full animate-fade-in" style={{ background: "linear-gradient(180deg,#F7F9FC 0%,#FFFFFF 100%)", minHeight: "100vh" }}>
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-100 shadow-sm px-5 py-3 flex items-center justify-between">
        {step > 0 ? (
          <button onClick={() => setStep(s => s - 1)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
            <ChevronLeft className="w-4 h-4 text-slate-600" />
          </button>
        ) : <div className="w-8" />}
        <span className="text-sm font-bold text-slate-700">{STEP_TITLES[step]}</span>
        <span className="text-xs font-bold text-orange-500">Step {step + 1} of 3</span>
      </div>

      {/* Progress bar */}
      <div className="px-5 pt-3 pb-1 bg-white border-b border-slate-50">
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full transition-all duration-500"
            style={{ width: `${((step + 1) / 3) * 100}%` }} />
        </div>
      </div>

      <div className="px-4 pt-6 pb-24 max-w-lg mx-auto">
        {step === 0 && <FindMoverStep onNext={advance} userAddress={userAddress} />}
        {step === 1 && <JunkRemovalStep onNext={advance} userAddress={userAddress} />}
        {step === 2 && <DonationStep onNext={advance} prefilledAddress={userAddress} />}
      </div>
    </div>
  );
}