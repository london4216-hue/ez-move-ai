import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Mail, Loader2, CheckCircle2, X } from "lucide-react";

// Mover-aligned catalog: each item has S/M/L meaning real movers use
// Size labels match industry standard for weight/truck-space estimation
const ROOM_CATALOG = {
  "Living Room": [
    { name: "Sofa", s: "Loveseat", m: "3-Seat Sofa", l: "Sectional / Sleeper" },
    { name: "Coffee Table", s: "Small Ottoman", m: "Standard Table", l: "Large/Storage Table" },
    { name: "TV", s: 'Under 43"', m: '43–65"', l: '65"+ / Wall Mount' },
    { name: "TV Stand", s: "Open Console", m: "Standard Cabinet", l: "Hutch / Wall Unit" },
    { name: "Bookcase", s: "2–3 Shelf", m: "4–5 Shelf", l: "6+ Shelf / Wide" },
    { name: "Armchair", s: "Accent Chair", m: "Armchair", l: "Oversized Recliner" },
    { name: "Lamp", s: "Table Lamp", m: "Floor Lamp", l: "Arc / Tall Lamp" },
    { name: "Rug", s: "5×7 or smaller", m: "8×10", l: "9×12 or larger" },
    { name: "Side Table", s: "Small", m: "Standard", l: "Large w/ Shelves" },
    { name: "Entertainment Center", s: "Corner Unit (sm)", m: "Standard Center", l: "Full Wall Unit" },
  ],
  "Kitchen": [
    { name: "Refrigerator", s: "Mini / Bar Fridge", m: "Standard 30\"", l: "French Door / Side-by-Side" },
    { name: "Dishwasher", s: "Countertop", m: "Standard 24\"", l: "Wide 30\"+" },
    { name: "Microwave", s: "Countertop", m: "Over-Range", l: "Built-in Drawer" },
    { name: "Kitchen Table", s: "2–3 Person", m: "4–5 Person", l: "6–8+ Person" },
    { name: "Kitchen Chairs", s: "2 Chairs", m: "4 Chairs", l: "6+ Chairs" },
    { name: "Bar Stools", s: "2 Counter-Height", m: "4 Counter-Height", l: "4+ Bar-Height" },
    { name: "Kitchen Island", s: "Rolling Cart", m: "Medium Island", l: "Large Fixed Island" },
    { name: "Appliance Boxes", s: "1 Box", m: "2–3 Boxes", l: "4+ Boxes" },
  ],
  "Master Bedroom": [
    { name: "Bed Frame", s: "Twin / Full", m: "Queen", l: "King / Cal King" },
    { name: "Mattress", s: "Twin / Full", m: "Queen", l: "King / Cal King" },
    { name: "Dresser", s: "3–4 Drawer", m: "5–6 Drawer", l: "7–8 Drawer / Double" },
    { name: "Nightstand", s: "Small / Floating", m: "Standard w/ Drawer", l: "Large Chest" },
    { name: "Wardrobe", s: "Small Armoire", m: "Standard Wardrobe", l: "Large / Walk-in Unit" },
    { name: "Vanity", s: "Tabletop Vanity", m: "Standing Vanity", l: "Full Vanity Set" },
    { name: "Mirror", s: "Small Hanging", m: "Full-Length Standing", l: "Large Framed" },
  ],
  "Bedroom 2 / 3": [
    { name: "Bed Frame", s: "Twin / Bunk", m: "Full", l: "Queen / King" },
    { name: "Mattress", s: "Twin / Bunk", m: "Full", l: "Queen / King" },
    { name: "Dresser", s: "3–4 Drawer", m: "5–6 Drawer", l: "7–8 Drawer" },
    { name: "Desk", s: "Small Writing Desk", m: "Standard Desk", l: "L-Shaped / Standing" },
    { name: "Desk Chair", s: "Basic / Folding", m: "Standard Ergonomic", l: "Large Executive" },
    { name: "Bookcase", s: "2-Shelf", m: "4-Shelf", l: "6-Shelf / Wide" },
    { name: "Toy Chest / Storage", s: "Small Bin", m: "Medium Chest", l: "Large Unit" },
  ],
  "Bathroom": [
    { name: "Vanity Cabinet", s: "Pedestal / Small", m: "Single Sink 24–36\"", l: "Double Sink 48\"+" },
    { name: "Medicine Cabinet", s: "Surface Mount", m: "Recessed Single", l: "Large Double" },
    { name: "Shelving", s: "Over-Toilet Rack", m: "Freestanding Tower", l: "Large Freestanding" },
    { name: "Linen Cabinet", s: "Narrow Tall", m: "Standard Cabinet", l: "Wide Double-Door" },
  ],
  "Office": [
    { name: "Desk", s: "Small Writing Desk", m: "Standard 60\"", l: "L-Shaped / Standing" },
    { name: "Office Chair", s: "Basic / Task", m: "Mid-Back Ergonomic", l: "High-Back Executive" },
    { name: "Filing Cabinet", s: "2-Drawer Vertical", m: "4-Drawer Vertical", l: "Lateral Wide" },
    { name: "Bookcase", s: "2–3 Shelf", m: "4–5 Shelf", l: "6+ Shelf / Wide" },
    { name: "Printer / Equipment", s: "Inkjet Printer", m: "Laser / All-in-One", l: "Large Printer / Copier" },
  ],
  "Garage / Storage": [
    { name: "Workbench", s: "Small Portable", m: "Standard Fixed", l: "Large w/ Storage" },
    { name: "Shelving Unit", s: "Light-Duty (2-shelf)", m: "Standard (4-shelf)", l: "Heavy-Duty (5+ shelf)" },
    { name: "Lawn Mower", s: "Electric / Push", m: "Self-Propelled Gas", l: "Riding Mower" },
    { name: "Bike", s: "Kids Bike", m: "Adult Bike", l: "E-Bike / Cargo" },
    { name: "Tool Chest", s: "Small Portable Box", m: "Mid-Size Roll-Away", l: "Large Pro Unit" },
    { name: "Storage Bins", s: "1–5 Bins", m: "6–15 Bins", l: "16+ Bins" },
    { name: "Miscellaneous Boxes", s: "1–10 Boxes", m: "11–25 Boxes", l: "25+ Boxes" },
  ],
  "Outdoor / Patio": [
    { name: "Patio Table", s: "Bistro 2-seat", m: "4-Seat Round/Square", l: "6–8 Seat Rectangular" },
    { name: "Patio Chairs", s: "2 Chairs", m: "4 Chairs", l: "6+ Chairs" },
    { name: "Grill", s: "Tabletop / Small", m: "3–4 Burner Gas", l: "5+ Burner / Smoker" },
    { name: "Outdoor Sofa", s: "Loveseat", m: "3-Piece Set", l: "Large Sectional" },
    { name: "Umbrella / Shade", s: "Patio Umbrella", m: "Cantilever Umbrella", l: "Pergola / Gazebo" },
  ],
};

// Cubic feet approximations for truck estimate
const SIZE_CUFT = { s: 8, m: 20, l: 40 };

function estimateTruck(items) {
  const cuft = items.filter(i => i.list === "moving").reduce((sum, item) => sum + (SIZE_CUFT[item.size] || 15), 0);
  if (cuft === 0) return null;
  if (cuft < 100) return { label: "Cargo Van / Small Truck", icon: "🚐", truck: "~100 cu ft", rooms: "Studio / 1-room" };
  if (cuft < 300) return { label: "10–14 ft Truck", icon: "🚚", truck: "~300 cu ft", rooms: "1–2 Bedroom Apt" };
  if (cuft < 550) return { label: "15–17 ft Truck", icon: "🚛", truck: "~500 cu ft", rooms: "2–3 Bedroom Home" };
  if (cuft < 850) return { label: "20–22 ft Truck", icon: "🚛", truck: "~800 cu ft", rooms: "3–4 Bedroom Home" };
  return { label: "26 ft Truck (or 2 trips)", icon: "🚛🚛", truck: "1200+ cu ft", rooms: "Large Home / Estate" };
}

const ALL_ROOMS = Object.keys(ROOM_CATALOG);
const SIZE_LABELS = { s: "Small", m: "Medium", l: "Large" };
const SIZE_COLORS = {
  s: { btn: "bg-[#EFF6FF] text-[#3B82F6] border-[#BFDBFE]", active: "bg-[#3B82F6] text-white border-[#3B82F6]" },
  m: { btn: "bg-[#FFF7ED] text-[#F97316] border-[#FED7AA]", active: "bg-[#F97316] text-white border-[#F97316]" },
  l: { btn: "bg-[#FDF4FF] text-[#A855F7] border-[#E9D5FF]", active: "bg-[#A855F7] text-white border-[#A855F7]" },
};

export default function InventoryTab({ user }) {
  const [items, setItems] = useState([]);
  const [activeRoom, setActiveRoom] = useState(ALL_ROOMS[0]);
  const [pendingItem, setPendingItem] = useState(null); // { name, s, m, l }
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const addItem = (item, size, list) => {
    setItems(prev => [...prev, { room: activeRoom, name: item.name, size, sizeLabel: item[size], list }]);
    setPendingItem(null);
  };

  const removeItem = (idx) => setItems(prev => prev.filter((_, i) => i !== idx));
  const moveToList = (idx, list) => setItems(prev => prev.map((item, i) => i === idx ? { ...item, list } : item));

  const movingItems = items.filter(i => i.list === "moving");
  const donateItems = items.filter(i => i.list === "donate");
  const truck = estimateTruck(items);

  const handleEmail = async () => {
    setSending(true);
    const movingList = movingItems.map(i => `• ${i.name} — ${SIZE_LABELS[i.size]}: ${i.sizeLabel} (${i.room})`).join("\n");
    const donateList = donateItems.map(i => `• ${i.name} — ${SIZE_LABELS[i.size]}: ${i.sizeLabel} (${i.room})`).join("\n");
    const body = `Moving Inventory\n================\n${movingList || "(none)"}\n\nEstimated Truck: ${truck?.label || "TBD"}\n\nDonation / Sell List\n====================\n${donateList || "(none)"}\n\nGenerated by EZ Move AI`;
    await base44.integrations.Core.SendEmail({ to: user?.email, subject: "My Moving & Donation Inventory", body });
    setSending(false);
    setSent(true);
  };

  return (
    <div className="flex flex-col gap-3 pb-20">

      {/* Truck Estimate Banner */}
      {truck ? (
        <div className="bg-[#1A1A2E] rounded-2xl px-4 py-3 flex items-center gap-3">
          <span className="text-2xl">{truck.icon}</span>
          <div className="flex-1">
            <p className="text-white text-xs font-bold">{truck.label}</p>
            <p className="text-[#9CA3AF] text-[10px]">{truck.truck} · {truck.rooms}</p>
          </div>
          <div className="text-right">
            <p className="text-[#F97316] text-base font-bold">{movingItems.length}</p>
            <p className="text-[#9CA3AF] text-[9px]">items</p>
          </div>
        </div>
      ) : (
        <div className="bg-[#1A1A2E] rounded-2xl px-4 py-3">
          <p className="text-white text-xs font-bold">🚛 Estimated Truck Size</p>
          <p className="text-[#9CA3AF] text-[10px]">Add items below to get your estimate</p>
        </div>
      )}

      {/* Size Legend */}
      <div className="flex gap-2">
        {Object.entries(SIZE_LABELS).map(([key, label]) => (
          <div key={key} className={`flex-1 rounded-xl border px-2 py-1.5 text-center ${SIZE_COLORS[key].btn}`}>
            <p className="text-[10px] font-bold">{label}</p>
            <p className="text-[9px] opacity-70">mover size</p>
          </div>
        ))}
      </div>

      {/* Room selector */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {ALL_ROOMS.map(room => (
          <button
            key={room}
            onClick={() => { setActiveRoom(room); setPendingItem(null); }}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all
              ${activeRoom === room ? "bg-[#F97316] text-white" : "bg-white text-[#6B7280]"}`}
          >
            {room}
          </button>
        ))}
      </div>

      {/* Item picker */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
        <div className="px-3 py-2.5 border-b border-[#F3F4F6]">
          <p className="text-xs font-bold text-[#1A1A2E]">{activeRoom} — tap item, then pick Small / Medium / Large</p>
        </div>
        <div className="px-3 py-2 flex flex-wrap gap-1.5">
          {ROOM_CATALOG[activeRoom].map(item => (
            <button
              key={item.name}
              onClick={() => setPendingItem(pendingItem?.name === item.name ? null : item)}
              className={`text-[10px] px-2.5 py-1 rounded-full font-semibold border transition-all
                ${pendingItem?.name === item.name
                  ? "bg-[#1A1A2E] text-white border-[#1A1A2E]"
                  : "bg-[#F5F3EF] text-[#374151] border-[#E5E7EB] hover:border-[#F97316]"}`}
            >
              {item.name}
            </button>
          ))}
        </div>

        {/* Size chooser — appears when item selected */}
        {pendingItem && (
          <div className="px-3 pb-3 pt-2 border-t border-[#F3F4F6] bg-[#FAFAFA] space-y-2">
            <p className="text-[10px] font-bold text-[#1A1A2E]">How big is your {pendingItem.name}?</p>
            <div className="space-y-1.5">
              {(["s", "m", "l"]).map(sz => (
                <div key={sz} className={`flex items-center gap-2 rounded-xl border px-3 py-2 ${SIZE_COLORS[sz].btn}`}>
                  <div className="flex-1">
                    <span className="text-[10px] font-bold uppercase tracking-wide">{SIZE_LABELS[sz]}</span>
                    <span className="text-[10px] ml-2 opacity-80">— {pendingItem[sz]}</span>
                  </div>
                  <button
                    onClick={() => addItem(pendingItem, sz, "moving")}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${SIZE_COLORS[sz].active}`}
                  >
                    📦 Move
                  </button>
                  <button
                    onClick={() => addItem(pendingItem, sz, "donate")}
                    className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-[#8B5CF6] text-white"
                  >
                    🫶 Donate
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Side-by-side lists */}
      {items.length > 0 && (
        <div className="flex gap-2">
          {/* Moving */}
          <div className="flex-1 bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-3 py-2 bg-[#FFF7ED] border-b border-[#FED7AA]">
              <p className="text-[10px] font-bold text-[#F97316]">📦 Moving ({movingItems.length})</p>
            </div>
            <div className="divide-y divide-[#F3F4F6] max-h-56 overflow-y-auto">
              {movingItems.length === 0 && <p className="text-[10px] text-[#9CA3AF] px-3 py-2">None yet</p>}
              {items.map((item, idx) => item.list !== "moving" ? null : (
                <div key={idx} className="px-2.5 py-2">
                  <p className="text-[10px] font-bold text-[#1A1A2E]">{item.name}</p>
                  <p className="text-[9px] text-[#F97316] font-semibold">{SIZE_LABELS[item.size]}: {item.sizeLabel}</p>
                  <p className="text-[9px] text-[#9CA3AF]">{item.room}</p>
                  <div className="flex gap-1.5 mt-1">
                    <button onClick={() => moveToList(idx, "donate")} className="text-[9px] text-[#8B5CF6] font-semibold">→ Donate</button>
                    <button onClick={() => removeItem(idx)} className="text-[9px] text-[#EF4444] font-semibold ml-auto">✕</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Donate */}
          <div className="flex-1 bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-3 py-2 bg-[#F5F3FF] border-b border-[#DDD6FE]">
              <p className="text-[10px] font-bold text-[#8B5CF6]">🫶 Donate ({donateItems.length})</p>
            </div>
            <div className="divide-y divide-[#F3F4F6] max-h-56 overflow-y-auto">
              {donateItems.length === 0 && <p className="text-[10px] text-[#9CA3AF] px-3 py-2">None yet</p>}
              {items.map((item, idx) => item.list !== "donate" ? null : (
                <div key={idx} className="px-2.5 py-2">
                  <p className="text-[10px] font-bold text-[#1A1A2E]">{item.name}</p>
                  <p className="text-[9px] text-[#8B5CF6] font-semibold">{SIZE_LABELS[item.size]}: {item.sizeLabel}</p>
                  <p className="text-[9px] text-[#9CA3AF]">{item.room}</p>
                  <div className="flex gap-1.5 mt-1">
                    <button onClick={() => moveToList(idx, "moving")} className="text-[9px] text-[#F97316] font-semibold">→ Moving</button>
                    <button onClick={() => removeItem(idx)} className="text-[9px] text-[#EF4444] font-semibold ml-auto">✕</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Email CTA */}
      {items.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm px-4 py-3">
          {sent ? (
            <div className="flex items-center justify-center gap-2 py-2 bg-[#F0FDF4] rounded-xl">
              <CheckCircle2 className="w-4 h-4 text-[#059669]" />
              <span className="text-xs font-bold text-[#059669]">Sent to {user?.email}</span>
            </div>
          ) : (
            <button onClick={handleEmail} disabled={sending}
              className="w-full py-2.5 rounded-xl bg-[#F97316] text-white text-xs font-bold flex items-center justify-center gap-2">
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
              {sending ? "Sending…" : "Email Quote Sheet to Movers"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}