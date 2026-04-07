import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { PUBLIC_DEMO_MODE } from "@/lib/featureFlags";
import {
  ChevronRight, ChevronLeft, CheckCircle2, Sparkles,
  MapPin, DollarSign, Star, AlertTriangle, Plus, Minus, ChevronDown, ChevronUp
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const TOTAL_STEPS = 6;

const STEP_TITLES = [
  "Welcome!", "Move Basics", "Your Inventory", "Access Conditions",
  "Cost Breakdown", "AI Move Summary"
];

const HOME_TYPES = ["Apartment", "House", "Townhome", "Condo", "Studio"];

const SPECIAL_ITEMS = [
  { id: "piano", label: "🎹 Piano", fee: 300 },
  { id: "pool_table", label: "🎱 Pool Table", fee: 250 },
  { id: "safe", label: "🔒 Heavy Safe", fee: 200 },
  { id: "treadmill", label: "🏃 Treadmill", fee: 100 },
  { id: "antiques", label: "🏺 Fragile Antiques", fee: 150 },
  { id: "hot_tub", label: "🛁 Hot Tub", fee: 400 },
  { id: "none", label: "None", fee: 0 },
];

const PACK_OPTIONS = [
  { id: "full", label: "Full Pack", sub: "Crew packs everything", fee: 500 },
  { id: "partial", label: "Partial Pack", sub: "Crew packs kitchen + fragile", fee: 250 },
  { id: "fragile", label: "Fragile Only", sub: "Just artwork, mirrors, glass", fee: 150 },
  { id: "none", label: "No Packing", sub: "I'll pack myself", fee: 0 },
];

const MATERIAL_OPTIONS = ["Boxes", "Packing Tape", "Bubble Wrap", "Packing Paper", "Wardrobe Boxes", "Mattress Bags"];

// ─── Room Inventory Definitions ───────────────────────────────────────────────

const ROOM_TYPES = [
  { id: "bedroom", label: "Bedroom", emoji: "🛏️" },
  { id: "living_room", label: "Living Room", emoji: "🛋️" },
  { id: "kitchen", label: "Kitchen", emoji: "🍳" },
  { id: "garage", label: "Garage", emoji: "🚗" },
  { id: "bathroom", label: "Bathroom", emoji: "🚿" },
  { id: "office", label: "Home Office", emoji: "💻" },
];

const ROOM_ITEMS = {
  bedroom: [
    { id: "bed_twin", label: "Bed (Twin)", emoji: "🛏️" },
    { id: "bed_full", label: "Bed (Full)", emoji: "🛏️" },
    { id: "bed_queen", label: "Bed (Queen)", emoji: "🛏️" },
    { id: "bed_king", label: "Bed (King)", emoji: "🛏️" },
    { id: "nightstand", label: "Nightstand", emoji: "🪔" },
    { id: "dresser", label: "Dresser", emoji: "🪞" },
    { id: "tv", label: "TV", emoji: "📺" },
    { id: "lamps", label: "Lamps", emoji: "💡" },
    { id: "boxes", label: "Boxes", emoji: "📦" },
  ],
  living_room: [
    { id: "sofa_2", label: "Sofa (2-seat)", emoji: "🛋️" },
    { id: "sofa_3", label: "Sofa (3-seat)", emoji: "🛋️" },
    { id: "sectional", label: "Sectional", emoji: "🛋️" },
    { id: "coffee_table", label: "Coffee Table", emoji: "🪵" },
    { id: "tv", label: "TV", emoji: "📺" },
    { id: "tv_stand", label: "TV Stand", emoji: "🗄️" },
    { id: "lamps", label: "Lamps", emoji: "💡" },
    { id: "boxes", label: "Boxes", emoji: "📦" },
  ],
  kitchen: [
    { id: "cabinets", label: "Cabinets", emoji: "🗄️" },
    { id: "dining_table", label: "Dining Table", emoji: "🪑" },
    { id: "chairs", label: "Chairs", emoji: "🪑" },
    { id: "boxes", label: "Boxes", emoji: "📦" },
  ],
  garage: [
    { id: "tool_chest", label: "Tool Chest", emoji: "🧰" },
    { id: "lawn_mower", label: "Lawn Mower", emoji: "🌿" },
    { id: "bikes", label: "Bikes", emoji: "🚲" },
    { id: "storage_shelves", label: "Storage Shelves", emoji: "📦" },
  ],
  bathroom: [
    { id: "cabinets", label: "Cabinets", emoji: "🗄️" },
    { id: "boxes", label: "Boxes", emoji: "📦" },
  ],
  office: [
    { id: "desk", label: "Desk", emoji: "🖥️" },
    { id: "office_chair", label: "Office Chair", emoji: "🪑" },
    { id: "bookshelves", label: "Bookshelves", emoji: "📚" },
    { id: "boxes", label: "Boxes", emoji: "📦" },
  ],
};

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
  const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
  const data = await res.json();
  if (data[0]) return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
  return null;
}

function calcQuote(state) {
  const { inventory = {}, specialItems = [], packOption, accessConditions = {}, miles } = state;

  // Count total items from detailed inventory
  let totalItems = 0;
  let roomCount = 0;
  Object.values(inventory).forEach(roomItems => {
    const roomTotal = Object.values(roomItems || {}).reduce((a, b) => a + b, 0);
    if (roomTotal > 0) roomCount++;
    totalItems += roomTotal;
  });

  const specialFees = (specialItems || []).filter(s => s !== "none")
    .reduce((sum, s) => sum + (SPECIAL_ITEMS.find(i => i.id === s)?.fee || 0), 0);
  const packFee = PACK_OPTIONS.find(p => p.id === packOption)?.fee || 0;
  const baseHours = 2 + roomCount * 0.8 + totalItems * 0.15;
  const crewSize = roomCount <= 2 ? 2 : roomCount <= 5 ? 3 : 4;
  const hourlyRate = 150 + crewSize * 20;
  const laborCost = Math.round(baseHours * hourlyRate);
  const truckCost = crewSize <= 2 ? 150 : crewSize === 3 ? 200 : 250;
  const fuelCost = Math.round((miles || 15) * 1.5);
  const accessFee = accessConditions?.stairs === "3–5" || accessConditions?.stairs === "6+" ? 100 : 0;
  const insurance = 75;
  const total = laborCost + truckCost + fuelCost + packFee + specialFees + accessFee + insurance;
  const truckSize = crewSize <= 2 ? "16ft" : crewSize === 3 ? "20ft" : "26ft";
  const trips = (miles || 15) > 60 ? 1 : totalItems > 40 ? 2 : 1;
  const complexity = Math.min(10, Math.round((roomCount + totalItems * 0.2 + specialFees / 100) / 2));

  return {
    crewSize, estimatedHours: Math.round(baseHours * 10) / 10, truckSize, trips, complexity,
    laborCost, truckCost, fuelCost, packCost: packFee, materialsCost: Math.round(packFee * 0.2),
    specialFees, accessFee, insurance, total, low: Math.round(total * 0.85), high: Math.round(total * 1.2),
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
    <button onClick={onClick} disabled={disabled}
      className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-200 active:scale-[0.98] transition-all disabled:opacity-40">
      {children}
    </button>
  );
}

function ToggleChip({ label, selected, onClick }) {
  return (
    <button onClick={onClick}
      className={`px-3 py-2 rounded-xl border-2 text-sm font-semibold transition-all active:scale-[0.97] ${
        selected ? "border-orange-400 bg-orange-50 text-orange-700" : "border-slate-200 bg-white text-slate-600"
      }`}>
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

function QtyRow({ label, emoji, value, onChange }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
      <span className="text-sm text-slate-700">{emoji} {label}</span>
      <div className="flex items-center gap-2">
        <button onClick={() => onChange(Math.max(0, value - 1))}
          className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50">
          <Minus className="w-3 h-3" />
        </button>
        <span className="text-sm font-black text-slate-800 w-5 text-center">{value}</span>
        <button onClick={() => onChange(value + 1)}
          className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50">
          <Plus className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

// ─── Steps ────────────────────────────────────────────────────────────────────

function Step0Welcome({ onNext }) {
  return (
    <div className="space-y-6 text-center px-2 pt-8">
      <div>
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-3xl font-black text-slate-900 mb-3">Congrats on your move!</h1>
        <p className="text-slate-500 text-base leading-relaxed max-w-xs mx-auto">
          Let's build your personalized move plan and get you an accurate quote — takes about 3 minutes.
        </p>
      </div>
      <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5 text-left space-y-3">
        <p className="text-xs font-bold text-orange-500 uppercase tracking-wide">What we'll cover</p>
        {[
          ["📍", "Your move details & addresses"],
          ["📦", "Room-by-room inventory"],
          ["🚛", "Access conditions & packing"],
          ["💰", "Full cost breakdown & quote"],
          ["✨", "Personalized AI move summary"],
        ].map(([emoji, text]) => (
          <div key={text} className="flex items-center gap-3">
            <span className="text-lg">{emoji}</span>
            <span className="text-sm font-semibold text-slate-700">{text}</span>
          </div>
        ))}
      </div>
      <PrimaryBtn onClick={onNext}>Let's Get Started <ChevronRight className="w-4 h-4" /></PrimaryBtn>
    </div>
  );
}

function Step1Basics({ data, onChange, onNext }) {
  const [calculating, setCalculating] = useState(false);

  const calcDistance = async () => {
    if (!data.fromAddress || !data.toAddress) return;
    setCalculating(true);
    const [from, to] = await Promise.all([geocode(data.fromAddress), geocode(data.toAddress)]);
    if (from && to) onChange("miles", Math.round(haversineDistance(from.lat, from.lon, to.lat, to.lon)));
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
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-orange-400" />
          </div>
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-1.5">Moving From</label>
            <input type="text" value={data.fromAddress || ""} onChange={e => onChange("fromAddress", e.target.value)}
              placeholder="123 Current St, City, State"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-orange-400" />
          </div>
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-1.5">Moving To</label>
            <input type="text" value={data.toAddress || ""} onChange={e => onChange("toAddress", e.target.value)}
              placeholder="456 New St, City, State"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-orange-400" />
          </div>
          <button onClick={calcDistance} disabled={!data.fromAddress || !data.toAddress || calculating}
            className="text-xs font-bold text-orange-500 hover:text-orange-600 disabled:opacity-40 flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {calculating ? "Calculating…" : data.miles ? `Distance: ~${data.miles} miles — Recalculate` : "Auto-calculate distance"}
          </button>
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-2">Home Type</label>
            <div className="flex flex-wrap gap-2">
              {HOME_TYPES.map(t => <ToggleChip key={t} label={t} selected={data.homeType === t} onClick={() => onChange("homeType", t)} />)}
            </div>
          </div>
        </div>
      </Card>
      <PrimaryBtn onClick={onNext} disabled={!canNext}>Next: Inventory <ChevronRight className="w-4 h-4" /></PrimaryBtn>
    </div>
  );
}

function RoomCard({ room, roomInventory, onChange }) {
  const [expanded, setExpanded] = useState(false);
  const items = ROOM_ITEMS[room.id] || [];
  const totalQty = Object.values(roomInventory || {}).reduce((a, b) => a + b, 0);

  const setQty = (itemId, qty) => {
    onChange({ ...(roomInventory || {}), [itemId]: qty });
    if (!expanded && qty > 0) setExpanded(true);
  };

  return (
    <div className={`rounded-2xl border-2 transition-all ${totalQty > 0 ? "border-orange-300 bg-orange-50/30" : "border-slate-200 bg-white"}`}>
      <button
        className="w-full flex items-center justify-between px-4 py-3.5"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{room.emoji}</span>
          <div className="text-left">
            <p className="text-sm font-bold text-slate-800">{room.label}</p>
            {totalQty > 0 && <p className="text-xs text-orange-500 font-semibold">{totalQty} item{totalQty !== 1 ? "s" : ""} added</p>}
          </div>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-slate-100 mt-0 pt-3">
          {items.map(item => (
            <QtyRow
              key={item.id}
              label={item.label}
              emoji={item.emoji}
              value={(roomInventory || {})[item.id] || 0}
              onChange={qty => setQty(item.id, qty)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function Step2Inventory({ data, onChange, onNext }) {
  const inventory = data.inventory || {};
  const specialItems = data.specialItems || [];

  const setRoomInventory = (roomId, roomData) => {
    onChange("inventory", { ...inventory, [roomId]: roomData });
  };

  const toggleSpecial = (id) => {
    if (id === "none") { onChange("specialItems", ["none"]); return; }
    const without = specialItems.filter(s => s !== "none");
    onChange("specialItems", without.includes(id) ? without.filter(s => s !== id) : [...without, id]);
  };

  const totalItems = Object.values(inventory).reduce((sum, room) =>
    sum + Object.values(room || {}).reduce((a, b) => a + b, 0), 0);

  return (
    <div className="space-y-4">
      <InsightBanner text="Tap each room to add items. The more detail you provide, the more accurate your quote." />

      <Card>
        <h2 className="text-xl font-black text-slate-900 mb-1">Room-by-Room Inventory</h2>
        <p className="text-sm text-slate-500 mb-4">Tap a room to expand and add items.</p>
        <div className="space-y-2">
          {ROOM_TYPES.map(room => (
            <RoomCard
              key={room.id}
              room={room}
              roomInventory={inventory[room.id]}
              onChange={(roomData) => setRoomInventory(room.id, roomData)}
            />
          ))}
        </div>
        {totalItems > 0 && (
          <div className="mt-4 bg-orange-50 border border-orange-100 rounded-xl px-4 py-3 text-center">
            <p className="text-sm font-bold text-orange-600">{totalItems} total items across your rooms</p>
          </div>
        )}
      </Card>

      <Card>
        <h2 className="text-lg font-black text-slate-900 mb-1">Special Items</h2>
        <p className="text-sm text-slate-500 mb-4">Require certified handlers — select all that apply.</p>
        <div className="flex flex-wrap gap-2">
          {SPECIAL_ITEMS.map(s => (
            <ToggleChip key={s.id} label={`${s.label}${s.fee > 0 ? ` (+$${s.fee})` : ""}`}
              selected={specialItems.includes(s.id)} onClick={() => toggleSpecial(s.id)} />
          ))}
        </div>
      </Card>

      <PrimaryBtn onClick={onNext} disabled={totalItems === 0 && specialItems.length === 0}>
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
          {[
            { key: "stairs", label: "Stairs at origin", options: ["0", "1–2", "3–5", "6+"].map(s => ({ val: s, label: `${s} flights` })) },
            { key: "parking", label: "Parking distance to door", options: ["< 50ft", "50–100ft", "100–200ft", "200ft+"].map(s => ({ val: s, label: s })) },
            { key: "longCarry", label: "Long carry distance?", options: ["Yes", "No"].map(s => ({ val: s, label: s })) },
            { key: "tightHallways", label: "Tight hallways / narrow doors?", options: ["Yes", "No"].map(s => ({ val: s, label: s })) },
            { key: "loadingDock", label: "Loading dock at destination?", options: ["Yes", "No", "N/A"].map(s => ({ val: s, label: s })) },
          ].map(({ key, label, options }) => (
            <div key={key}>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-2">{label}</label>
              <div className="flex flex-wrap gap-2">
                {options.map(o => <ToggleChip key={o.val} label={o.label} selected={ac[key] === o.val} onClick={() => set(key, o.val)} />)}
              </div>
            </div>
          ))}
        </div>
      </Card>
      <PrimaryBtn onClick={onNext} disabled={!ac.stairs || !ac.parking}>See My Quote <ChevronRight className="w-4 h-4" /></PrimaryBtn>
    </div>
  );
}

function StepStaysGoes({ data, onChange, onNext }) {
  const inventory = data.inventory || {};
  const staysGoes = data.staysGoes || {};

  // Build flat list of rooms with items
  const roomsWithItems = ROOM_TYPES.filter(room => {
    const total = Object.values(inventory[room.id] || {}).reduce((a, b) => a + b, 0);
    return total > 0;
  });

  const setRoom = (roomId, decision) => {
    onChange("staysGoes", { ...staysGoes, [roomId]: decision });
  };

  const allDecided = roomsWithItems.length === 0 || roomsWithItems.every(r => staysGoes[r.id]);

  return (
    <div className="space-y-4">
      <InsightBanner text="Confirm what's moving with you vs staying behind or being donated. This finalizes your estimate." />
      <Card>
        <h2 className="text-xl font-black text-slate-900 mb-1">What Stays & What Goes?</h2>
        <p className="text-sm text-slate-500 mb-4">For each room, choose what happens to those items.</p>
        {roomsWithItems.length === 0 && (
          <p className="text-sm text-slate-400 text-center py-4">No inventory added — all clear to move!</p>
        )}
        <div className="space-y-3">
          {roomsWithItems.map(room => {
            const total = Object.values(inventory[room.id] || {}).reduce((a, b) => a + b, 0);
            const decision = staysGoes[room.id];
            return (
              <div key={room.id} className="border border-slate-100 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">{room.emoji}</span>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{room.label}</p>
                    <p className="text-xs text-slate-400">{total} item{total !== 1 ? "s" : ""}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {[
                    { id: "moving", label: "🚛 Moving with me", active: "bg-orange-50 border-orange-400 text-orange-700" },
                    { id: "staying", label: "🏠 Staying behind", active: "bg-slate-100 border-slate-400 text-slate-700" },
                    { id: "donate", label: "♻️ Donating", active: "bg-emerald-50 border-emerald-400 text-emerald-700" },
                  ].map(opt => (
                    <button key={opt.id} onClick={() => setRoom(room.id, opt.id)}
                      className={`flex-1 py-2 rounded-xl border-2 text-xs font-bold transition-all ${
                        decision === opt.id ? opt.active : "border-slate-200 text-slate-500"
                      }`}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
      <PrimaryBtn onClick={onNext} disabled={!allDecided}>
        Get My AI Move Summary <ChevronRight className="w-4 h-4" />
      </PrimaryBtn>
      <button onClick={onNext} className="w-full text-center text-xs text-slate-400 font-semibold py-2">
        Skip — decide later
      </button>
    </div>
  );
}

function Step5Quote({ quote, onNext }) {
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

      {/* Crew summary */}
      <Card>
        <h2 className="text-lg font-black text-slate-900 mb-3">Your Move at a Glance</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Crew Size", value: `${quote.crewSize} movers` },
            { label: "Est. Hours", value: `${quote.estimatedHours} hrs` },
            { label: "Truck Size", value: quote.truckSize },
            { label: "Trips", value: `${quote.trips} trip${quote.trips > 1 ? "s" : ""}` },
          ].map(({ label, value }) => (
            <div key={label} className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
              <p className="text-lg font-black text-slate-800">{value}</p>
              <p className="text-xs text-slate-400 font-semibold mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Cost breakdown */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="w-5 h-5 text-emerald-500" />
          <h2 className="text-xl font-black text-slate-900">Cost Breakdown</h2>
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

      <PrimaryBtn onClick={onNext}>Get My AI Move Summary <ChevronRight className="w-4 h-4" /></PrimaryBtn>
    </div>
  );
}

function Step6Summary({ state, quote, onFinish }) {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);

  const generateSummary = async () => {
    setLoading(true);
    const totalItems = Object.values(state.inventory || {}).reduce((sum, room) =>
      sum + Object.values(room || {}).reduce((a, b) => a + b, 0), 0);
    
    // Fallback demo data if API fails or inventory is empty
    const fallbackSummary = {
      simulation: "You'll arrive at 8am with a 3-person crew. First hour: protective coverings, furniture padding. Mid-morning: systematic room-by-room loading. Lunch break 12-1pm. Afternoon: continue loading, final walkthrough by 4pm. You'll be settled in your new place by evening.",
      move_day_timeline: [
        "8:00 AM - Crew arrival, equipment setup, protective coverings",
        "9:00 AM - Begin systematic furniture padding and loading",
        "12:00 PM - Lunch break (30-60 min)",
        "1:00 PM - Resume loading remaining items",
        "4:00 PM - Final walkthrough, last checks, depart"
      ],
      risk_radar: [
        { risk: "Weather delays", tip: "Monitor forecast and plan an extra day if storms are forecasted" },
        { risk: "Hidden obstacles", tip: "Measure stairwells/doorways in new home beforehand to avoid surprises" },
        { risk: "Item damage", tip: "Mark fragile boxes clearly and brief crew on high-value items" }
      ],
      recommendations: [
        "Pack an 'essentials' box with toiletries, meds, chargers for the first night",
        "Do a final walkthrough of old place before leaving (closets, cabinets, utilities)",
        "Take photos of the new place's condition before furniture arrives"
      ]
    };
    try {
      try {
        const res = await base44.integrations.Core.InvokeLLM({
          prompt: `You are a professional moving coordinator. Generate a personalized AI move summary for a client moving from "${state.fromAddress || "origin"}" to "${state.toAddress || "destination"}" on ${state.moveDate || "their move date"}. Home type: ${state.homeType || "home"}. Crew: ${quote.crewSize} movers. Est hours: ${quote.estimatedHours}. Truck: ${quote.truckSize}. Total items: ${totalItems}. Move complexity: ${quote.complexity}/10. Provide: 1. move_day_timeline: array of 5 time-based steps. 2. risk_radar: array of 3 top risks with risk and tip fields. 3. recommendations: 3 pro tips. 4. simulation: a short paragraph describing what move day will feel like.`,
          response_json_schema: {
            type: "object",
            properties: {
              move_day_timeline: { type: "array", items: { type: "string" } },
              risk_radar: { type: "array", items: { type: "object", properties: { risk: { type: "string" }, tip: { type: "string" } } } },
              recommendations: { type: "array", items: { type: "string" } },
              simulation: { type: "string" }
            }
          }
        });
        setSummary(res.data || fallbackSummary);
      } catch (err) {
        console.error('AI Summary error:', err);
        setSummary(fallbackSummary);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!summary && !loading) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8">
          <div className="text-4xl mb-3">✨</div>
          <h2 className="text-xl font-black text-slate-900">AI Move Summary</h2>
          <p className="text-sm text-slate-500 mt-1">Get personalized insights about your move</p>
        </div>
        <Card>
          <p className="text-sm text-slate-600 leading-relaxed text-center">Based on your move details, we'll generate a personalized timeline, risk assessment, and pro tips for move day.</p>
        </Card>
        <PrimaryBtn onClick={generateSummary} disabled={loading}>
          {loading ? (
            <>
              <Sparkles className="w-4 h-4 animate-spin" />
              Generating…
            </>
          ) : (
            <>
              Generate My Summary
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </PrimaryBtn>
      </div>
    );
  }

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
            {summary.move_day_timeline.map((s, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</div>
                <p className="text-sm text-slate-700">{s}</p>
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

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function MoverQuoteOnboarding({ userId, onComplete }) {
  const [step, setStep] = useState(0);
  const [state, setState] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(`mq_${userId}`));
      if (saved) return saved;
    } catch {}
    if (PUBLIC_DEMO_MODE) {
      return {
        fromAddress: "159 Summer Street, New York, NY 10024",
        toAddress: "42 West 72nd Street, New York, NY 10023",
        moveDate: new Date().toISOString().split('T')[0],
      };
    }
    return {};
  });

  const quote = step >= 4 ? calcQuote(state) : null;
  // Save move profile for task generation when completing
  const saveProfile = (s) => localStorage.setItem(`pre_onboarding_${userId}`, JSON.stringify({ ...s, fromMoverQuote: true }));

  const setField = (key, val) => {
    const next = { ...state, [key]: val };
    setState(next);
    localStorage.setItem(`mq_${userId}`, JSON.stringify(next));
  };

  const next = () => setStep(s => Math.min(TOTAL_STEPS - 1, s + 1));
  const back = () => setStep(s => Math.max(0, s - 1));

  const finish = () => {
    saveProfile(state);
    if (quote) localStorage.setItem(`demo_mover_cost_${userId}`, JSON.stringify(quote));
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
          <div className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full transition-all duration-500"
            style={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }} />
        </div>
      </div>

      <div className="px-4 pt-4 pb-24 max-w-lg mx-auto space-y-4">
        {step === 0 && <Step0Welcome onNext={next} />}
        {step === 1 && <Step1Basics data={state} onChange={setField} onNext={next} />}
        {step === 2 && <Step2Inventory data={state} onChange={setField} onNext={next} />}
        {step === 3 && <Step3Access data={state} onChange={setField} onNext={next} />}
        {step === 4 && quote && <Step5Quote quote={quote} onNext={next} />}
        {step === 5 && quote && <Step6Summary state={state} quote={quote} onFinish={finish} />}
      </div>
    </div>
  );
}