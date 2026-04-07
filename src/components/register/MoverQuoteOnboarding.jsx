import { useState } from "react";
import { base44 } from "@/api/base44Client";
import {
  ChevronRight, ChevronLeft, CheckCircle2, Sparkles, Loader2,
  MapPin, Home, Package, Truck, DollarSign, Star, AlertTriangle
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const HOME_TYPES = ["Apartment", "House", "Townhome", "Condo", "Studio"];

const ROOMS = [
  { id: "living_room", label: "Living Room", emoji: "🛋️" },
  { id: "bedroom", label: "Bedroom (each)", emoji: "🛏️" },
  { id: "kitchen", label: "Kitchen", emoji: "🍳" },
  { id: "dining_room", label: "Dining Room", emoji: "🪑" },
  { id: "office", label: "Home Office", emoji: "💻" },
  { id: "garage", label: "Garage", emoji: "🚗" },
  { id: "basement", label: "Basement", emoji: "📦" },
];

const FURNITURE = [
  { id: "sofa", label: "Sofa / Sectional", emoji: "🛋️" },
  { id: "bed_frame", label: "Bed Frame", emoji: "🛏️" },
  { id: "dresser", label: "Dresser", emoji: "🪞" },
  { id: "dining_table", label: "Dining Table", emoji: "🪑" },
  { id: "desk", label: "Desk", emoji: "🖥️" },
  { id: "bookshelf", label: "Bookshelf", emoji: "📚" },
  { id: "wardrobe", label: "Wardrobe / Armoire", emoji: "👕" },
  { id: "tv_stand", label: "TV & Stand", emoji: "📺" },
];

const SPECIAL_ITEMS = [
  { id: "piano", label: "🎹 Piano", fee: 300 },
  { id: "pool_table", label: "🎱 Pool Table", fee: 250 },
  { id: "safe", label: "🔒 Heavy Safe", fee: 200 },
  { id: "treadmill", label: "🏃 Treadmill", fee: 100 },
  { id: "antiques", label: "🏺 Fragile Antiques", fee: 150 },
  { id: "hot_tub", label: "🛁 Hot Tub", fee: 400 },
  { id: "none", label: "None", fee: 0 },
];

const APPLIANCES = [
  { id: "washer_dryer", label: "Washer / Dryer", emoji: "🫧" },
  { id: "fridge", label: "Refrigerator", emoji: "🧊" },
  { id: "dishwasher", label: "Dishwasher", emoji: "🍽️" },
  { id: "stove", label: "Stove / Range", emoji: "🔥" },
  { id: "none", label: "None", emoji: "✅" },
];

const PACK_OPTIONS = [
  { id: "full", label: "Full Pack", sub: "Crew packs everything", fee: 500 },
  { id: "partial", label: "Partial Pack", sub: "Crew packs kitchen + fragile", fee: 250 },
  { id: "fragile", label: "Fragile Only", sub: "Just artwork, mirrors, glass", fee: 150 },
  { id: "none", label: "No Packing", sub: "I'll pack myself", fee: 0 },
];

const TOTAL_STEPS = 7;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 3958.8;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function geocode(address) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
  );
  const data = await res.json();
  if (data[0]) return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
  return null;
}

function calcQuote(state) {
  const { rooms, furniture, specialItems, appliances, packOption, accessConditions, miles } = state;

  const roomCount = Object.values(rooms || {}).reduce((a, b) => a + b, 0);
  const furnitureCount = (furniture || []).length;
  const specialFees = (specialItems || [])
    .filter(s => s !== "none")
    .reduce((sum, s) => sum + (SPECIAL_ITEMS.find(i => i.id === s)?.fee || 0), 0);
  const applianceCount = (appliances || []).filter(a => a !== "none").length;
  const packFee = PACK_OPTIONS.find(p => p.id === packOption)?.fee || 0;

  const baseHours = 2 + roomCount * 0.8 + furnitureCount * 0.3 + applianceCount * 0.5;
  const crewSize = roomCount <= 2 ? 2 : roomCount <= 5 ? 3 : 4;
  const hourlyRate = 150 + crewSize * 20;
  const laborCost = Math.round(baseHours * hourlyRate);
  const truckCost = crewSize <= 2 ? 150 : crewSize === 3 ? 200 : 250;
  const fuelCost = Math.round((miles || 15) * 1.5);
  const accessFee = accessConditions?.stairs > 2 ? 100 : 0;
  const insurance = 75;
  const total = laborCost + truckCost + fuelCost + packFee + specialFees + accessFee + insurance;

  const truckSize = crewSize <= 2 ? "16ft" : crewSize === 3 ? "20ft" : "26ft";
  const trips = miles > 60 ? 1 : applianceCount + roomCount > 8 ? 2 : 1;
  const complexity = Math.min(10, Math.round((roomCount + furnitureCount * 0.5 + specialFees / 100) / 2));

  return {
    crewSize, estimatedHours: Math.round(baseHours * 10) / 10, truckSize, trips, complexity,
    laborCost, truckCost, fuelCost, packCost: packFee, materialsCost: Math.round(packFee * 0.2),
    specialFees, accessFee, insurance,
    total, low: Math.round(total * 0.85), high: Math.round(total * 1.2),
  };
}

// ─── UI Atoms ─────────────────────────────────────────────────────────────────

function Card({ children, className = "" }) {
  return (
    <div className={`bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-5 animate-slide-up ${className}`}>
      {children}
    </div>
  );
}

function PrimaryBtn({ onClick, disabled, children }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-200 active:scale-[0.98] transition-all disabled:opacity-40"
    >
      {children}
    </button>
  );
}

function ToggleChip({ label, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded-xl border-2 text-sm font-semibold transition-all active:scale-[0.97] ${
        selected ? "border-orange-400 bg-orange-50 text-orange-700" : "border-slate-200 bg-white text-slate-600"
      }`}
    >
      {label}
    </button>
  );
}

function InsightBanner({ text }) {
  return (
    <div className="bg-white rounded-2xl border border-orange-100 shadow-sm px-4 py-3 flex items-start gap-2.5">
      <div className="w-7 h-7 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
        <Sparkles className="w-3.5 h-3.5 text-orange-500" />
      </div>
      <div>
        <p className="text-[10px] font-bold text-orange-500 uppercase tracking-wide mb-0.5">AI Insight</p>
        <p className="text-xs text-slate-600 leading-relaxed">{text}</p>
      </div>
    </div>
  );
}

// ─── Step Components ──────────────────────────────────────────────────────────

function Step1Basics({ data, onChange, onNext }) {
  const [calculating, setCalculating] = useState(false);

  const calcDistance = async () => {
    if (!data.fromAddress || !data.toAddress) return;
    setCalculating(true);
    const [from, to] = await Promise.all([geocode(data.fromAddress), geocode(data.toAddress)]);
    if (from && to) {
      const d = haversineDistance(from.lat, from.lon, to.lat, to.lon);
      onChange("miles", Math.round(d));
    }
    setCalculating(false);
  };

  const canNext = data.moveDate && data.fromAddress && data.toAddress && data.homeType;

  return (
    <div className="space-y-4">
      <InsightBanner text="Accurate addresses let us calculate drive time, fuel costs, and recommend crew size." />
      <Card>
        <h2 className="text-xl font-black text-slate-900 mb-1">Move Basics</h2>
        <p className="text-sm text-slate-500 mb-5">Tell us where and when you're moving.</p>

        <div className="space-y-4">
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-1.5">Move Date</label>
            <input type="date" value={data.moveDate || ""} onChange={e => onChange("moveDate", e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/10" />
          </div>
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-1.5">Moving From</label>
            <input type="text" value={data.fromAddress || ""} onChange={e => onChange("fromAddress", e.target.value)}
              placeholder="123 Current St, City, State"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/10" />
          </div>
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-1.5">Moving To</label>
            <input type="text" value={data.toAddress || ""} onChange={e => onChange("toAddress", e.target.value)}
              placeholder="456 New St, City, State"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/10" />
          </div>

          <button onClick={calcDistance} disabled={!data.fromAddress || !data.toAddress || calculating}
            className="text-xs font-bold text-orange-500 hover:text-orange-600 disabled:opacity-40 flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {calculating ? "Calculating…" : data.miles ? `Distance: ~${data.miles} miles — Recalculate` : "Auto-calculate distance"}
          </button>

          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-2">Home Type</label>
            <div className="flex flex-wrap gap-2">
              {HOME_TYPES.map(t => (
                <ToggleChip key={t} label={t} selected={data.homeType === t} onClick={() => onChange("homeType", t)} />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-1.5">Floors / Stairs</label>
              <select value={data.floors || ""} onChange={e => onChange("floors", e.target.value)}
                className="w-full px-3 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-orange-400 bg-white">
                <option value="">Select</option>
                {["1 floor", "2 floors", "3+ floors"].map(f => <option key={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-1.5">Elevator?</label>
              <select value={data.elevator || ""} onChange={e => onChange("elevator", e.target.value)}
                className="w-full px-3 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-orange-400 bg-white">
                <option value="">Select</option>
                {["Yes — full service", "Yes — freight only", "No elevator"].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>
        </div>
      </Card>

      <PrimaryBtn onClick={onNext} disabled={!canNext}>
        Next: Inventory <ChevronRight className="w-4 h-4" />
      </PrimaryBtn>
    </div>
  );
}

function Step2Inventory({ data, onChange, onNext }) {
  const rooms = data.rooms || {};
  const furniture = data.furniture || [];
  const boxCount = data.boxCount || 0;
  const specialItems = data.specialItems || [];
  const appliances = data.appliances || [];

  const toggleFurniture = (id) => {
    const next = furniture.includes(id) ? furniture.filter(f => f !== id) : [...furniture, id];
    onChange("furniture", next);
  };

  const toggleSpecial = (id) => {
    if (id === "none") { onChange("specialItems", ["none"]); return; }
    const without = specialItems.filter(s => s !== "none");
    const next = without.includes(id) ? without.filter(s => s !== id) : [...without, id];
    onChange("specialItems", next);
  };

  const toggleAppliance = (id) => {
    if (id === "none") { onChange("appliances", ["none"]); return; }
    const without = appliances.filter(a => a !== "none");
    const next = without.includes(id) ? without.filter(a => a !== id) : [...without, id];
    onChange("appliances", next);
  };

  const roomCount = Object.values(rooms).reduce((a, b) => a + b, 0);
  const canNext = roomCount > 0 && (specialItems.length > 0) && (appliances.length > 0);

  return (
    <div className="space-y-4">
      <InsightBanner text="Inventory is the #1 factor in your quote accuracy. More detail = better price." />

      <Card>
        <h2 className="text-xl font-black text-slate-900 mb-1">Rooms</h2>
        <p className="text-sm text-slate-500 mb-4">How many of each room are you moving?</p>
        <div className="space-y-3">
          {ROOMS.map(r => (
            <div key={r.id} className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700">{r.emoji} {r.label}</span>
              <div className="flex items-center gap-3">
                <button onClick={() => onChange("rooms", { ...rooms, [r.id]: Math.max(0, (rooms[r.id] || 0) - 1) })}
                  className="w-8 h-8 rounded-xl border border-slate-200 text-slate-500 font-bold text-lg flex items-center justify-center hover:bg-slate-50">−</button>
                <span className="text-sm font-black text-slate-800 w-5 text-center">{rooms[r.id] || 0}</span>
                <button onClick={() => onChange("rooms", { ...rooms, [r.id]: (rooms[r.id] || 0) + 1 })}
                  className="w-8 h-8 rounded-xl border border-slate-200 text-slate-500 font-bold text-lg flex items-center justify-center hover:bg-slate-50">+</button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-black text-slate-900 mb-1">Large Furniture</h2>
        <p className="text-sm text-slate-500 mb-4">Select all items you're moving.</p>
        <div className="grid grid-cols-2 gap-2">
          {FURNITURE.map(f => (
            <ToggleChip key={f.id} label={`${f.emoji} ${f.label}`} selected={furniture.includes(f.id)} onClick={() => toggleFurniture(f.id)} />
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-black text-slate-900 mb-1">Boxes</h2>
        <p className="text-sm text-slate-500 mb-4">Approximately how many packed boxes?</p>
        <div className="flex items-center gap-4">
          <button onClick={() => onChange("boxCount", Math.max(0, boxCount - 5))}
            className="w-10 h-10 rounded-xl border border-slate-200 text-slate-500 font-bold text-xl flex items-center justify-center hover:bg-slate-50">−</button>
          <div className="flex-1 text-center">
            <p className="text-3xl font-black text-orange-500">{boxCount}</p>
            <p className="text-xs text-slate-400">boxes</p>
          </div>
          <button onClick={() => onChange("boxCount", boxCount + 5)}
            className="w-10 h-10 rounded-xl border border-slate-200 text-slate-500 font-bold text-xl flex items-center justify-center hover:bg-slate-50">+</button>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-black text-slate-900 mb-1">Special Items</h2>
        <p className="text-sm text-slate-500 mb-4">Require certified handlers.</p>
        <div className="space-y-2">
          {SPECIAL_ITEMS.map(s => (
            <ToggleChip key={s.id} label={`${s.label}${s.fee > 0 ? ` (+$${s.fee})` : ""}`} selected={specialItems.includes(s.id)} onClick={() => toggleSpecial(s.id)} />
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-black text-slate-900 mb-1">Appliances</h2>
        <div className="flex flex-wrap gap-2 mt-3">
          {APPLIANCES.map(a => (
            <ToggleChip key={a.id} label={`${a.emoji} ${a.label}`} selected={appliances.includes(a.id)} onClick={() => toggleAppliance(a.id)} />
          ))}
        </div>
      </Card>

      <PrimaryBtn onClick={onNext} disabled={!canNext}>
        Next: Access Conditions <ChevronRight className="w-4 h-4" />
      </PrimaryBtn>
    </div>
  );
}

function Step3Access({ data, onChange, onNext }) {
  const ac = data.accessConditions || {};
  const set = (k, v) => onChange("accessConditions", { ...ac, [k]: v });

  return (
    <div className="space-y-4">
      <InsightBanner text="Access conditions affect crew time — stairs and parking can add 30–60 min." />
      <Card>
        <h2 className="text-xl font-black text-slate-900 mb-4">Access Conditions</h2>
        <div className="space-y-5">
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-2">Stairs at origin</label>
            <div className="flex flex-wrap gap-2">
              {["0", "1–2", "3–5", "6+"].map(s => (
                <ToggleChip key={s} label={`${s} flights`} selected={ac.stairs === s} onClick={() => set("stairs", s)} />
              ))}
            </div>
          </div>
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-2">Parking distance to door</label>
            <div className="flex flex-wrap gap-2">
              {["< 50ft", "50–100ft", "100–200ft", "200ft+"].map(s => (
                <ToggleChip key={s} label={s} selected={ac.parking === s} onClick={() => set("parking", s)} />
              ))}
            </div>
          </div>
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-2">Long carry distance?</label>
            <div className="flex gap-2">
              {["Yes", "No"].map(s => (
                <ToggleChip key={s} label={s} selected={ac.longCarry === s} onClick={() => set("longCarry", s)} />
              ))}
            </div>
          </div>
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-2">Tight hallways / narrow doors?</label>
            <div className="flex gap-2">
              {["Yes", "No"].map(s => (
                <ToggleChip key={s} label={s} selected={ac.tightHallways === s} onClick={() => set("tightHallways", s)} />
              ))}
            </div>
          </div>
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-2">Loading dock at destination?</label>
            <div className="flex gap-2">
              {["Yes", "No", "N/A"].map(s => (
                <ToggleChip key={s} label={s} selected={ac.loadingDock === s} onClick={() => set("loadingDock", s)} />
              ))}
            </div>
          </div>
        </div>
      </Card>
      <PrimaryBtn onClick={onNext} disabled={!ac.stairs || !ac.parking}>
        Next: Packing Needs <ChevronRight className="w-4 h-4" />
      </PrimaryBtn>
    </div>
  );
}

function Step4Packing({ data, onChange, onNext }) {
  const materials = data.materials || [];
  const toggleMaterial = (id) => {
    const next = materials.includes(id) ? materials.filter(m => m !== id) : [...materials, id];
    onChange("materials", next);
  };
  const MATERIAL_OPTIONS = ["Boxes", "Packing Tape", "Bubble Wrap", "Packing Paper", "Wardrobe Boxes", "Mattress Bags"];

  return (
    <div className="space-y-4">
      <InsightBanner text="Packing services typically add $150–$500 but reduce damage claims by 80%." />
      <Card>
        <h2 className="text-xl font-black text-slate-900 mb-1">Packing Services</h2>
        <p className="text-sm text-slate-500 mb-5">How much packing help do you need?</p>
        <div className="space-y-3">
          {PACK_OPTIONS.map(p => (
            <button key={p.id} onClick={() => onChange("packOption", p.id)}
              className={`w-full text-left px-4 py-4 rounded-2xl border-2 transition-all active:scale-[0.98] ${
                data.packOption === p.id ? "border-orange-400 bg-orange-50" : "border-slate-200 bg-white hover:border-orange-300"
              }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800 text-sm">{p.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{p.sub}</p>
                </div>
                <span className="text-sm font-black text-orange-500">{p.fee > 0 ? `+$${p.fee}` : "Free"}</span>
              </div>
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-black text-slate-900 mb-1">Materials Needed</h2>
        <p className="text-sm text-slate-500 mb-4">Check anything you need the crew to bring.</p>
        <div className="flex flex-wrap gap-2">
          {MATERIAL_OPTIONS.map(m => (
            <ToggleChip key={m} label={m} selected={materials.includes(m)} onClick={() => toggleMaterial(m)} />
          ))}
        </div>
      </Card>

      <PrimaryBtn onClick={onNext} disabled={!data.packOption}>
        Next: AI Estimate <ChevronRight className="w-4 h-4" />
      </PrimaryBtn>
    </div>
  );
}

function Step5Estimate({ quote }) {
  const complexityColor = quote.complexity <= 3 ? "text-emerald-500" : quote.complexity <= 6 ? "text-amber-500" : "text-red-500";
  const complexityLabel = quote.complexity <= 3 ? "Low" : quote.complexity <= 6 ? "Medium" : "High";

  return (
    <div className="space-y-4">
      <InsightBanner text="These estimates are generated from your inventory and access data — not guessed." />
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Truck className="w-5 h-5 text-orange-500" />
          <h2 className="text-xl font-black text-slate-900">AI Crew Estimate</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Crew Size", value: `${quote.crewSize} movers` },
            { label: "Est. Hours", value: `${quote.estimatedHours} hrs` },
            { label: "Truck Size", value: quote.truckSize },
            { label: "Trips", value: `${quote.trips} trip${quote.trips > 1 ? "s" : ""}` },
          ].map(({ label, value }) => (
            <div key={label} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center">
              <p className="text-xl font-black text-slate-800">{value}</p>
              <p className="text-xs text-slate-400 font-semibold mt-1">{label}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-semibold">Move Complexity</p>
            <p className={`text-2xl font-black ${complexityColor}`}>{complexityLabel}</p>
          </div>
          <div className="flex gap-1">
            {[...Array(10)].map((_, i) => (
              <div key={i} className={`w-2 h-6 rounded-full ${i < quote.complexity ? (quote.complexity <= 3 ? "bg-emerald-400" : quote.complexity <= 6 ? "bg-amber-400" : "bg-red-400") : "bg-slate-200"}`} />
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

function Step6Quote({ quote, onNext }) {
  const lineItems = [
    { label: "Labor", amount: quote.laborCost },
    { label: "Truck", amount: quote.truckCost },
    { label: "Packing Services", amount: quote.packCost },
    { label: "Materials", amount: quote.materialsCost },
    { label: "Special Items", amount: quote.specialFees },
    { label: "Access Fees", amount: quote.accessFee },
    { label: "Fuel Surcharge", amount: quote.fuelCost },
    { label: "Insurance", amount: quote.insurance },
  ].filter(l => l.amount > 0);

  return (
    <div className="space-y-4">
      <InsightBanner text="This is a binding-quality estimate. Final price varies ±10% based on actual hours." />
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="w-5 h-5 text-emerald-500" />
          <h2 className="text-xl font-black text-slate-900">Your Cost Breakdown</h2>
        </div>
        <div className="space-y-2 mb-4">
          {lineItems.map(({ label, amount }) => (
            <div key={label} className="flex items-center justify-between py-2 border-b border-slate-50">
              <span className="text-sm text-slate-600">{label}</span>
              <span className="text-sm font-bold text-slate-800">${amount.toLocaleString()}</span>
            </div>
          ))}
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4">
          <p className="text-xs text-orange-500 font-bold uppercase tracking-wide mb-1">Total Estimate</p>
          <p className="text-4xl font-black text-orange-600">${quote.total.toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-1">Range: ${quote.low.toLocaleString()} – ${quote.high.toLocaleString()}</p>
        </div>
      </Card>
      <PrimaryBtn onClick={onNext}>
        Get My AI Move Summary <ChevronRight className="w-4 h-4" />
      </PrimaryBtn>
    </div>
  );
}

function Step7Summary({ state, quote, onFinish }) {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);

  useState(() => {
    const generate = async () => {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a professional moving coordinator. Generate a personalized AI move summary for a client moving from "${state.fromAddress}" to "${state.toAddress}" on ${state.moveDate}. 
Home type: ${state.homeType}. Crew: ${quote.crewSize} movers. Est hours: ${quote.estimatedHours}. Truck: ${quote.truckSize}. Move complexity: ${quote.complexity}/10.
Provide:
1. move_day_timeline: array of 5 time-based steps (e.g. "8:00 AM — Crew arrives, protects floors")
2. risk_radar: array of 3 top risks with emoji and tip
3. packing_plan: 3 key packing recommendations
4. recommendations: 3 pro tips specific to their move
5. simulation: a short paragraph describing what move day will feel like`,
        response_json_schema: {
          type: "object",
          properties: {
            move_day_timeline: { type: "array", items: { type: "string" } },
            risk_radar: { type: "array", items: { type: "object", properties: { risk: { type: "string" }, tip: { type: "string" } } } },
            packing_plan: { type: "array", items: { type: "string" } },
            recommendations: { type: "array", items: { type: "string" } },
            simulation: { type: "string" }
          }
        }
      });
      setSummary(res);
      setLoading(false);
    };
    generate();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center py-20 gap-4">
        <div className="w-16 h-16 rounded-3xl bg-orange-50 flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-orange-500 animate-pulse" />
        </div>
        <p className="font-bold text-slate-700">Generating your AI Move Summary…</p>
        <p className="text-xs text-slate-400">Analyzing your inventory, route, and conditions</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center py-4">
        <div className="text-4xl mb-2">🎉</div>
        <h2 className="text-xl font-black text-slate-900">Your AI Move Summary</h2>
        <p className="text-sm text-slate-500 mt-1">Personalized for your move on {state.moveDate}</p>
      </div>

      {summary?.simulation && (
        <Card>
          <p className="text-[10px] font-bold text-orange-500 uppercase tracking-wide mb-2">Move Day Simulation</p>
          <p className="text-sm text-slate-700 leading-relaxed italic">"{summary.simulation}"</p>
        </Card>
      )}

      {summary?.move_day_timeline?.length > 0 && (
        <Card>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-3">Move Day Timeline</p>
          <div className="space-y-3">
            {summary.move_day_timeline.map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</div>
                <p className="text-sm text-slate-700">{step}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {summary?.risk_radar?.length > 0 && (
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Risk Radar</p>
          </div>
          <div className="space-y-3">
            {summary.risk_radar.map((r, i) => (
              <div key={i} className="bg-amber-50 border border-amber-100 rounded-xl p-3">
                <p className="text-sm font-bold text-slate-800 mb-0.5">{r.risk}</p>
                <p className="text-xs text-slate-500">{r.tip}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {summary?.recommendations?.length > 0 && (
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-4 h-4 text-orange-500" />
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Pro Tips</p>
          </div>
          <div className="space-y-2">
            {summary.recommendations.map((r, i) => (
              <div key={i} className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-slate-700">{r}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      <PrimaryBtn onClick={onFinish}>
        <CheckCircle2 className="w-4 h-4" />
        Set Up My Week 1 Checklist
        <ChevronRight className="w-4 h-4" />
      </PrimaryBtn>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const STEP_TITLES = [
  "Move Basics", "Your Inventory", "Access Conditions",
  "Packing Needs", "AI Estimate", "Cost Breakdown", "AI Move Summary"
];

const STEP_INSIGHTS = [
  "Let's start with the basics of your move.",
  "Accurate inventory = accurate quote.",
  "Access conditions affect crew time and cost.",
  "Packing services can save you hours of stress.",
  "Calculating your personalized crew and truck size.",
  "Here's your full cost breakdown.",
  "Your personalized AI move plan is ready."
];

export default function MoverQuoteOnboarding({ userId, onComplete }) {
  const [step, setStep] = useState(0);
  const [state, setState] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`mq_${userId}`)) || {}; } catch { return {}; }
  });

  const quote = step >= 4 ? calcQuote(state) : null;

  const setField = (key, val) => {
    const next = { ...state, [key]: val };
    setState(next);
    localStorage.setItem(`mq_${userId}`, JSON.stringify(next));
  };

  const next = () => setStep(s => Math.min(TOTAL_STEPS - 1, s + 1));
  const back = () => setStep(s => Math.max(0, s - 1));

  const finish = () => {
    localStorage.setItem(`pre_onboarding_${userId}`, JSON.stringify({ ...state, fromMoverQuote: true }));
    if (state.miles) localStorage.setItem(`demo_mover_cost_${userId}`, JSON.stringify(quote));
    onComplete && onComplete(state);
  };

  return (
    <div className="w-full animate-fade-in" style={{ background: "linear-gradient(180deg,#F7F9FC 0%,#FFFFFF 100%)", minHeight: "100vh" }}>

      {/* Sticky header */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-100 shadow-sm px-5 py-3 flex items-center justify-between">
        {step > 0 ? (
          <button onClick={back} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
            <ChevronLeft className="w-4 h-4 text-slate-600" />
          </button>
        ) : <div className="w-8" />}
        <span className="text-sm font-bold text-slate-700">{STEP_TITLES[step]}</span>
        <span className="text-xs font-bold text-orange-500">Step {step + 1} of {TOTAL_STEPS}</span>
      </div>

      {/* Progress bar */}
      <div className="px-5 pt-3 pb-1 bg-white border-b border-slate-50">
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full transition-all duration-500"
            style={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
          />
        </div>
      </div>

      <div className="px-4 pt-4 pb-24 max-w-lg mx-auto space-y-4">
        {step === 0 && <Step1Basics data={state} onChange={setField} onNext={next} />}
        {step === 1 && <Step2Inventory data={state} onChange={setField} onNext={next} />}
        {step === 2 && <Step3Access data={state} onChange={setField} onNext={next} />}
        {step === 3 && <Step4Packing data={state} onChange={setField} onNext={next} />}
        {step === 4 && quote && (
          <div className="space-y-4">
            <Step5Estimate quote={quote} />
            <PrimaryBtn onClick={next}>
              See My Cost Breakdown <ChevronRight className="w-4 h-4" />
            </PrimaryBtn>
          </div>
        )}
        {step === 5 && quote && <Step6Quote quote={quote} onNext={next} />}
        {step === 6 && quote && <Step7Summary state={state} quote={quote} onFinish={finish} />}
      </div>
    </div>
  );
}