import { useState } from "react";
import { ChevronRight, ChevronLeft, Plus, Minus } from "lucide-react";

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
function FindMoverStep({ onNext }) {
  return (
    <div className="space-y-6">
      <div className="text-center py-4">
        <div className="text-5xl mb-3">🚛</div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Find a Mover</h2>
        <p className="text-slate-500 text-base">Would you like EZ Move AI to find you a top-tier mover?</p>
      </div>
      <OptionButtons onSelect={(opt) => onNext({ findMover: opt })} />
    </div>
  );
}

// Step 2: Junk Removal
function JunkRemovalStep({ onNext }) {
  const [answer, setAnswer] = useState(null);
  const [inventory, setInventory] = useState({});
  const [misc, setMisc] = useState("");

  if (!answer) {
    return (
      <div className="space-y-6">
        <div className="text-center py-4">
          <div className="text-5xl mb-3">🗑️</div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Junk Removal</h2>
          <p className="text-slate-500 text-base">Do you have any junk you want removed?</p>
        </div>
        <OptionButtons onSelect={(opt) => {
          if (opt === "Yes") setAnswer("yes");
          else onNext({ junkRemoval: opt, junkInventory: null });
        }} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-black text-slate-900 mb-1">🗑️ What needs to go?</h2>
        <p className="text-sm text-slate-500">Select items from each room you want removed.</p>
      </div>
      <InventoryPicker inventory={inventory} setInventory={setInventory} misc={misc} setMisc={setMisc} />
      <button
        onClick={() => onNext({ junkRemoval: "Yes", junkInventory: inventory, junkMisc: misc })}
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-200 active:scale-[0.98] transition-all"
      >
        Continue <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

// Step 3: Donation Pickup
function DonationStep({ onNext, prefilledAddress }) {
  const [answer, setAnswer] = useState(null);
  const [inventory, setInventory] = useState({});
  const [misc, setMisc] = useState("");
  const [address, setAddress] = useState(prefilledAddress || "");

  if (!answer) {
    return (
      <div className="space-y-6">
        <div className="text-center py-4">
          <div className="text-5xl mb-3">♻️</div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Donation Pickup</h2>
          <p className="text-slate-500 text-base">Do you have items you want to donate?</p>
        </div>
        <OptionButtons onSelect={(opt) => {
          if (opt === "Yes") setAnswer("yes");
          else onNext({ donation: opt, donationInventory: null });
        }} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-black text-slate-900 mb-1">♻️ What are you donating?</h2>
        <p className="text-sm text-slate-500">Select items and we'll find donation centers near you.</p>
      </div>
      {!prefilledAddress && (
        <div className="bg-white rounded-2xl border-2 border-slate-200 p-4">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">Your Current Address</label>
          <input
            type="text"
            value={address}
            onChange={e => setAddress(e.target.value)}
            placeholder="123 Current St, City, State"
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-orange-400"
          />
        </div>
      )}
      <InventoryPicker inventory={inventory} setInventory={setInventory} misc={misc} setMisc={setMisc} />
      <button
        onClick={() => onNext({ donation: "Yes", donationInventory: inventory, donationMisc: misc, donationAddress: address })}
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-200 active:scale-[0.98] transition-all"
      >
        Finish Setup <ChevronRight className="w-4 h-4" />
      </button>
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
        {step === 0 && <FindMoverStep onNext={advance} />}
        {step === 1 && <JunkRemovalStep onNext={advance} />}
        {step === 2 && <DonationStep onNext={advance} prefilledAddress={userAddress} />}
      </div>
    </div>
  );
}