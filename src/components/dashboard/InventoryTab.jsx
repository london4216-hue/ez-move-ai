import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Trash2, Mail, Loader2, CheckCircle2, Truck } from "lucide-react";

// Real mover item catalog with sizes movers care about
const ROOM_CATALOG = {
  "Living Room": [
    { name: "Sofa", sizes: ["Loveseat (sm)", "Sofa 3-seat (md)", "Sectional (lg)", "Sleeper Sofa (xl)"] },
    { name: "Coffee Table", sizes: ["Small", "Medium", "Large", "Ottoman"] },
    { name: "TV", sizes: ['Under 40"', '40–55"', '55–75"', '75"+ (xl)'] },
    { name: "TV Stand / Console", sizes: ["Small", "Medium", "Large/Hutch"] },
    { name: "Bookcase", sizes: ["Small (2-shelf)", "Medium (4-shelf)", "Large (6-shelf)", "Wall Unit (xl)"] },
    { name: "Armchair / Recliner", sizes: ["Armchair (sm)", "Recliner (md)", "Oversized Recliner (lg)"] },
    { name: "Lamp", sizes: ["Table Lamp (sm)", "Floor Lamp (md)", "Arc Lamp (lg)"] },
    { name: "Rug", sizes: ["5x7 (sm)", "8x10 (md)", "9x12 (lg)", "Runner"] },
    { name: "Side Table", sizes: ["Small", "Medium"] },
    { name: "Entertainment Center", sizes: ["Medium", "Large", "Full Wall Unit (xl)"] },
  ],
  "Kitchen": [
    { name: "Refrigerator", sizes: ["Mini Fridge (sm)", "Standard (md)", "French Door (lg)", "Side-by-Side (xl)"] },
    { name: "Dishwasher", sizes: ["Countertop (sm)", "Standard 24\" (md)", "Wide 30\" (lg)"] },
    { name: "Microwave", sizes: ["Countertop (sm)", "Over-Range (md)", "Drawer (lg)"] },
    { name: "Kitchen Table", sizes: ["2-seat (sm)", "4-seat (md)", "6-seat (lg)", "8+ seat (xl)"] },
    { name: "Kitchen Chairs", sizes: ["Set of 2 (sm)", "Set of 4 (md)", "Set of 6 (lg)"] },
    { name: "Bar Stools", sizes: ["Counter Height 2x", "Counter Height 4x", "Bar Height 2x", "Bar Height 4x"] },
    { name: "Kitchen Island", sizes: ["Small Cart", "Medium Island", "Large Island (xl)"] },
    { name: "Small Appliances (box)", sizes: ["1 box (sm)", "2 boxes (md)", "3+ boxes (lg)"] },
  ],
  "Master Bedroom": [
    { name: "Bed Frame", sizes: ["Twin", "Full", "Queen", "King", "Cal King"] },
    { name: "Mattress", sizes: ["Twin", "Full", "Queen", "King", "Cal King"] },
    { name: "Dresser", sizes: ["Small 4-drawer", "Medium 6-drawer", "Large 8-drawer", "Double Dresser (xl)"] },
    { name: "Nightstand", sizes: ["Small", "Medium (with drawer)", "Large Chest"] },
    { name: "Wardrobe / Armoire", sizes: ["Small", "Medium", "Large", "Extra Large"] },
    { name: "Vanity / Mirror", sizes: ["Tabletop (sm)", "Standing (md)", "Full Vanity Set (lg)"] },
    { name: "Chest of Drawers", sizes: ["3-drawer (sm)", "5-drawer (md)", "7-drawer (lg)"] },
  ],
  "Bedroom 2 / 3": [
    { name: "Bed Frame", sizes: ["Twin", "Full", "Queen", "King"] },
    { name: "Mattress", sizes: ["Twin", "Full", "Queen", "King"] },
    { name: "Dresser", sizes: ["Small 4-drawer", "Medium 6-drawer", "Large 8-drawer"] },
    { name: "Desk", sizes: ["Small Writing Desk", "Standard Desk", "L-Shaped (lg)", "Standing Desk"] },
    { name: "Desk Chair", sizes: ["Basic (sm)", "Ergonomic (md)", "Executive (lg)"] },
    { name: "Bookcase", sizes: ["Small (2-shelf)", "Medium (4-shelf)", "Large (6-shelf)"] },
  ],
  "Bathroom": [
    { name: "Vanity Cabinet", sizes: ["Single Sink (sm)", "Double Sink (lg)"] },
    { name: "Medicine Cabinet", sizes: ["Small", "Medium", "Large"] },
    { name: "Shelving Unit", sizes: ["Small Over-Toilet", "Freestanding (md)", "Large (lg)"] },
    { name: "Towel Rack / Bar", sizes: ["Single Bar", "Double Bar", "Tower (lg)"] },
  ],
  "Office / Den": [
    { name: "Desk", sizes: ["Small Writing Desk", "Standard Desk", "L-Shaped (lg)", "Standing Desk (xl)"] },
    { name: "Office Chair", sizes: ["Basic (sm)", "Ergonomic (md)", "Executive (lg)"] },
    { name: "Filing Cabinet", sizes: ["2-drawer (sm)", "4-drawer lateral (md)", "5-drawer (lg)"] },
    { name: "Bookcase", sizes: ["Small", "Medium", "Large", "Wall Unit (xl)"] },
    { name: "Computer Setup (boxes)", sizes: ["Laptop only (sm)", "Desktop setup (md)", "Full workstation (lg)"] },
  ],
  "Garage / Storage": [
    { name: "Workbench", sizes: ["Small", "Large"] },
    { name: "Shelving Unit", sizes: ["Small", "Medium", "Large", "Heavy-Duty (xl)"] },
    { name: "Lawn Mower", sizes: ["Push Mower (sm)", "Self-Propelled (md)", "Riding Mower (xl)"] },
    { name: "Bike", sizes: ["Kids Bike (sm)", "Adult Bike (md)", "E-Bike (lg)"] },
    { name: "Storage Bins (lot)", sizes: ["1–5 bins", "6–10 bins", "10+ bins"] },
    { name: "Tool Chest", sizes: ["Small Cabinet", "Medium Roll-Away", "Large Pro (xl)"] },
    { name: "Boxes (miscellaneous)", sizes: ["10 boxes (sm)", "20 boxes (md)", "30+ boxes (lg)"] },
  ],
  "Outdoor / Patio": [
    { name: "Patio Table", sizes: ["Bistro 2-seat (sm)", "4-seat (md)", "6-seat (lg)", "8+ seat (xl)"] },
    { name: "Patio Chairs", sizes: ["Set of 2", "Set of 4", "Set of 6"] },
    { name: "Grill", sizes: ["Tabletop (sm)", "2-burner (md)", "4-burner (lg)", "6-burner (xl)"] },
    { name: "Outdoor Sofa / Sectional", sizes: ["Loveseat (sm)", "3-piece (md)", "Large Sectional (lg)"] },
    { name: "Umbrella / Gazebo", sizes: ["Patio Umbrella (sm)", "Cantilever (md)", "Gazebo (lg)"] },
    { name: "Planters", sizes: ["Small x3", "Medium x3", "Large x2", "Oversized"] },
  ],
};

// Truck size estimator based on cubic feet
const ITEM_CUFT = {
  "Loveseat (sm)": 40, "Sofa 3-seat (md)": 60, "Sectional (lg)": 90, "Sleeper Sofa (xl)": 80,
  "Twin": 25, "Full": 35, "Queen": 45, "King": 55, "Cal King": 55,
  "Small 4-drawer": 15, "Medium 6-drawer": 25, "Large 8-drawer": 35, "Double Dresser (xl)": 40,
  "Standard (md)": 30, "French Door (lg)": 40, "Side-by-Side (xl)": 45, "Mini Fridge (sm)": 10,
};

function estimateTruck(items) {
  let cuft = items.reduce((sum, item) => sum + (ITEM_CUFT[item.size] || 10), 0);
  if (cuft < 100) return { label: "Small Van / Cargo Van", icon: "🚐", desc: "~100 cu ft — Studio or 1-room move" };
  if (cuft < 300) return { label: "10–14 ft Truck", icon: "🚚", desc: "~300 cu ft — 1 bedroom apartment" };
  if (cuft < 500) return { label: "15–17 ft Truck", icon: "🚛", desc: "~500 cu ft — 2 bedroom home" };
  if (cuft < 800) return { label: "20–22 ft Truck", icon: "🚛", desc: "~800 cu ft — 3 bedroom home" };
  return { label: "24–26 ft Truck (or two trips)", icon: "🚛🚛", desc: "~1200+ cu ft — Large home" };
}

const ALL_ROOMS = Object.keys(ROOM_CATALOG);

export default function InventoryTab({ user }) {
  // Each item: { room, name, size, list: 'moving'|'donate' }
  const [items, setItems] = useState([]);
  const [activeRoom, setActiveRoom] = useState(ALL_ROOMS[0]);
  const [addingItem, setAddingItem] = useState(null); // { name, sizes }
  const [selectedSize, setSelectedSize] = useState("");
  const [customItem, setCustomItem] = useState("");
  const [activeList, setActiveList] = useState("moving"); // for the side-by-side view toggle on mobile
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const addItem = (name, size, list) => {
    setItems(prev => [...prev, { room: activeRoom, name, size, list }]);
    setAddingItem(null);
    setSelectedSize("");
  };

  const removeItem = (idx) => setItems(prev => prev.filter((_, i) => i !== idx));

  const moveToList = (idx, list) => {
    setItems(prev => prev.map((item, i) => i === idx ? { ...item, list } : item));
  };

  const movingItems = items.filter(i => i.list === "moving");
  const donateItems = items.filter(i => i.list === "donate");
  const truck = estimateTruck(movingItems);

  const handleEmail = async () => {
    setSending(true);
    const movingList = movingItems.map(i => `• ${i.name} (${i.size}) — ${i.room}`).join("\n");
    const donateList = donateItems.map(i => `• ${i.name} (${i.size}) — ${i.room}`).join("\n");
    const body = `Hi ${user?.full_name || "there"},\n\nMoving Inventory\n================\n${movingList || "(none)"}\n\nEstimated Truck: ${truck.label}\n\nDonation / Sell List\n====================\n${donateList || "(none)"}\n\nGenerated by EZ Move AI`;
    await base44.integrations.Core.SendEmail({ to: user?.email, subject: "My Moving & Donation Inventory", body });
    setSending(false);
    setSent(true);
  };

  return (
    <div className="flex flex-col gap-3 pb-20">
      {/* Truck Estimate Banner */}
      <div className="bg-[#1A1A2E] rounded-2xl px-4 py-3 flex items-center gap-3">
        <span className="text-2xl">{truck.icon}</span>
        <div className="flex-1">
          <p className="text-white text-xs font-bold">{truck.label}</p>
          <p className="text-[#9CA3AF] text-[10px]">{truck.desc}</p>
        </div>
        <div className="text-right">
          <p className="text-[#F97316] text-base font-bold">{movingItems.length}</p>
          <p className="text-[#9CA3AF] text-[9px]">items</p>
        </div>
      </div>

      {/* Room selector */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {ALL_ROOMS.map(room => (
          <button
            key={room}
            onClick={() => { setActiveRoom(room); setAddingItem(null); }}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all
              ${activeRoom === room ? "bg-[#F97316] text-white" : "bg-white text-[#6B7280]"}`}
          >
            {room}
          </button>
        ))}
      </div>

      {/* Item picker for active room */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
        <div className="px-3 py-2.5 border-b border-[#F3F4F6]">
          <p className="text-xs font-bold text-[#1A1A2E]">{activeRoom} — Tap to add</p>
        </div>
        <div className="px-3 py-2 flex flex-wrap gap-1.5">
          {ROOM_CATALOG[activeRoom].map(item => (
            <button
              key={item.name}
              onClick={() => { setAddingItem(item); setSelectedSize(""); }}
              className={`text-[10px] px-2.5 py-1 rounded-full font-semibold border transition-all
                ${addingItem?.name === item.name
                  ? "bg-[#F97316] text-white border-[#F97316]"
                  : "bg-[#F5F3EF] text-[#374151] border-[#E5E7EB] hover:border-[#F97316] hover:text-[#F97316]"}`}
            >
              {item.name}
            </button>
          ))}
        </div>

        {/* Size picker */}
        {addingItem && (
          <div className="px-3 pb-3 border-t border-[#F3F4F6] pt-2 bg-[#FFF7ED]">
            <p className="text-[10px] font-bold text-[#F97316] mb-2">Choose size for: {addingItem.name}</p>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {addingItem.sizes.map(sz => (
                <button
                  key={sz}
                  onClick={() => setSelectedSize(sz)}
                  className={`text-[10px] px-2.5 py-1 rounded-full font-semibold border transition-all
                    ${selectedSize === sz ? "bg-[#1A1A2E] text-white border-[#1A1A2E]" : "bg-white text-[#374151] border-[#E5E7EB]"}`}
                >
                  {sz}
                </button>
              ))}
            </div>
            {selectedSize && (
              <div className="flex gap-2">
                <button
                  onClick={() => addItem(addingItem.name, selectedSize, "moving")}
                  className="flex-1 py-1.5 rounded-xl bg-[#F97316] text-white text-[11px] font-bold"
                >
                  📦 Moving
                </button>
                <button
                  onClick={() => addItem(addingItem.name, selectedSize, "donate")}
                  className="flex-1 py-1.5 rounded-xl bg-[#8B5CF6] text-white text-[11px] font-bold"
                >
                  🫶 Donate
                </button>
              </div>
            )}
          </div>
        )}

        {/* Custom item */}
        <div className="px-3 pb-3 pt-2 flex gap-2 border-t border-[#F3F4F6]">
          <input
            placeholder="Add custom item…"
            value={customItem}
            onChange={e => setCustomItem(e.target.value)}
            className="flex-1 px-3 py-1.5 rounded-xl border border-[#E5E7EB] text-xs focus:outline-none focus:border-[#F97316]"
          />
          <button
            onClick={() => { if (customItem.trim()) { addItem(customItem.trim(), "Custom", "moving"); setCustomItem(""); } }}
            className="px-3 py-1.5 bg-[#F97316] rounded-xl text-white"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Side-by-side lists */}
      {items.length > 0 && (
        <div className="flex gap-2">
          {/* Moving list */}
          <div className="flex-1 bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-3 py-2 bg-[#FFF7ED] border-b border-[#FED7AA]">
              <p className="text-[10px] font-bold text-[#F97316]">📦 Moving ({movingItems.length})</p>
            </div>
            <div className="divide-y divide-[#F3F4F6] max-h-64 overflow-y-auto">
              {movingItems.length === 0 && <p className="text-[10px] text-[#9CA3AF] px-3 py-3">None added yet</p>}
              {items.map((item, idx) => item.list !== "moving" ? null : (
                <div key={idx} className="px-2.5 py-2">
                  <p className="text-[10px] font-bold text-[#1A1A2E] leading-tight">{item.name}</p>
                  <p className="text-[9px] text-[#6B7280]">{item.size}</p>
                  <p className="text-[9px] text-[#9CA3AF]">{item.room}</p>
                  <div className="flex gap-1 mt-1">
                    <button onClick={() => moveToList(idx, "donate")} className="text-[9px] text-[#8B5CF6] font-semibold">→ Donate</button>
                    <button onClick={() => removeItem(idx)} className="text-[9px] text-[#EF4444] font-semibold ml-auto">✕</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Donation list */}
          <div className="flex-1 bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-3 py-2 bg-[#F5F3FF] border-b border-[#DDD6FE]">
              <p className="text-[10px] font-bold text-[#8B5CF6]">🫶 Donate ({donateItems.length})</p>
            </div>
            <div className="divide-y divide-[#F3F4F6] max-h-64 overflow-y-auto">
              {donateItems.length === 0 && <p className="text-[10px] text-[#9CA3AF] px-3 py-3">None added yet</p>}
              {items.map((item, idx) => item.list !== "donate" ? null : (
                <div key={idx} className="px-2.5 py-2">
                  <p className="text-[10px] font-bold text-[#1A1A2E] leading-tight">{item.name}</p>
                  <p className="text-[9px] text-[#6B7280]">{item.size}</p>
                  <p className="text-[9px] text-[#9CA3AF]">{item.room}</p>
                  <div className="flex gap-1 mt-1">
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
          <p className="text-[11px] text-[#6B7280] mb-2 text-center">Email full inventory + truck estimate to movers</p>
          {sent ? (
            <div className="flex items-center justify-center gap-2 py-2 bg-[#F0FDF4] rounded-xl">
              <CheckCircle2 className="w-4 h-4 text-[#059669]" />
              <span className="text-xs font-bold text-[#059669]">Sent!</span>
            </div>
          ) : (
            <button
              onClick={handleEmail}
              disabled={sending}
              className="w-full py-2.5 rounded-xl bg-[#F97316] text-white text-xs font-bold flex items-center justify-center gap-2"
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
              {sending ? "Sending…" : "Email Quote Sheet"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}