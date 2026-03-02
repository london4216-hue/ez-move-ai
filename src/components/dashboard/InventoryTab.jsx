import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Mail, Loader2, CheckCircle2, GripHorizontal, Sparkles, MapPin, Phone } from "lucide-react";

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
    { name: "Refrigerator", s: "Mini / Bar Fridge", m: 'Standard 30"', l: "French Door / Side-by-Side" },
    { name: "Dishwasher", s: "Countertop", m: 'Standard 24"', l: 'Wide 30"+' },
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
    { name: "Vanity Cabinet", s: 'Pedestal / Small', m: 'Single Sink 24–36"', l: 'Double Sink 48"+' },
    { name: "Medicine Cabinet", s: "Surface Mount", m: "Recessed Single", l: "Large Double" },
    { name: "Shelving", s: "Over-Toilet Rack", m: "Freestanding Tower", l: "Large Freestanding" },
    { name: "Linen Cabinet", s: "Narrow Tall", m: "Standard Cabinet", l: "Wide Double-Door" },
  ],
  "Office": [
    { name: "Desk", s: 'Small Writing Desk', m: 'Standard 60"', l: "L-Shaped / Standing" },
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

const SIZE_CUFT = { s: 8, m: 20, l: 40 };
const WEIGHT_PER_CUFT = 7; // Average weight per cubic foot of household goods

function estimateTruck(items) {
  const cuft = items.reduce((sum, item) => sum + (SIZE_CUFT[item.size] || 15), 0);
  if (cuft === 0) return null;
  
  const totalWeight = Math.round(cuft * WEIGHT_PER_CUFT);
  
  if (cuft < 100) {
    return { 
      label: "Cargo Van / Small Truck", 
      icon: "🚐", 
      cuft: "~100 cu ft",
      weight: "~700 lbs",
      cost: "$500–$800",
      rooms: "Studio / 1-room" 
    };
  }
  if (cuft < 300) {
    return { 
      label: "10–14 ft Truck", 
      icon: "🚚", 
      cuft: "~300 cu ft",
      weight: `~${Math.round(300 * WEIGHT_PER_CUFT)} lbs`,
      cost: "$1,200–$1,800",
      rooms: "1–2 Bedroom Apt" 
    };
  }
  if (cuft < 550) {
    return { 
      label: "15–17 ft Truck", 
      icon: "🚛", 
      cuft: "~500 cu ft",
      weight: `~${Math.round(500 * WEIGHT_PER_CUFT)} lbs`,
      cost: "$2,500–$3,500",
      rooms: "2–3 Bedroom Home" 
    };
  }
  if (cuft < 850) {
    return { 
      label: "20–22 ft Truck", 
      icon: "🚛", 
      cuft: "~800 cu ft",
      weight: `~${Math.round(800 * WEIGHT_PER_CUFT)} lbs`,
      cost: "$4,000–$5,500",
      rooms: "3–4 Bedroom Home" 
    };
  }
  return { 
    label: "26 ft Truck (or 2 trips)", 
    icon: "🚛🚛", 
    cuft: "1200+ cu ft",
    weight: "8,400+ lbs",
    cost: "$6,000–$9,000+",
    rooms: "Large Home / Estate" 
  };
}

const ALL_ROOMS = Object.keys(ROOM_CATALOG);
const SIZE_LABELS = { s: "Small", m: "Medium", l: "Large" };
const SIZE_COLORS = {
  s: { pill: "bg-[#EFF6FF] text-[#3B82F6] border-[#BFDBFE]", active: "bg-[#3B82F6] text-white" },
  m: { pill: "bg-[#FFF7ED] text-[#F97316] border-[#FED7AA]", active: "bg-[#F97316] text-white" },
  l: { pill: "bg-[#FDF4FF] text-[#A855F7] border-[#E9D5FF]", active: "bg-[#A855F7] text-white" },
};

// Shared item picker used by both tabs
function ItemPicker({ listType, onAdd }) {
  const [activeRoom, setActiveRoom] = useState(ALL_ROOMS[0]);
  const [selectingItem, setSelectingItem] = useState(null);

  const addItem = (item, size) => {
    onAdd({ room: activeRoom, name: item.name, size, sizeLabel: item[size] });
    setSelectingItem(null);
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Room pills */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {ALL_ROOMS.map(room => (
          <button
            key={room}
            onClick={() => { setActiveRoom(room); setSelectingItem(null); }}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all
              ${activeRoom === room ? "bg-[#F97316] text-white" : "bg-white text-[#6B7280] border border-[#E5E7EB]"}`}
          >
            {room}
          </button>
        ))}
      </div>

      {/* Size selection modal */}
      {selectingItem ? (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-[#F3F4F6] bg-[#FAFAFA]">
            <button onClick={() => setSelectingItem(null)} className="text-[12px] text-[#6B7280] mb-2">← Back</button>
            <p className="text-[12px] font-bold text-[#1A1A2E]">Select size for {selectingItem.name}</p>
          </div>
          <div className="px-4 py-3 space-y-2">
            {["s", "m", "l"].map(sz => (
              <button
                key={sz}
                onClick={() => addItem(selectingItem, sz)}
                className={`w-full flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition-all ${SIZE_COLORS[sz].pill} hover:opacity-90`}
              >
                <span className="text-[11px] font-bold uppercase tracking-wide w-16 flex-shrink-0">{SIZE_LABELS[sz]}</span>
                <span className="text-[10px] flex-1 text-[#4B5563]">{selectingItem[sz]}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Item grid */
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-3 py-2 border-b border-[#F3F4F6]">
            <p className="text-[10px] font-bold text-[#1A1A2E]">
              {activeRoom} — tap item to add
            </p>
          </div>
          <div className="px-3 py-2 flex flex-wrap gap-1.5">
            {ROOM_CATALOG[activeRoom].map(item => (
              <button
                key={item.name}
                onClick={() => setSelectingItem(item)}
                className="text-[10px] px-2.5 py-1 rounded-full font-semibold border bg-[#F5F3EF] text-[#374151] border-[#E5E7EB] hover:bg-[#1A1A2E] hover:text-white transition-all"
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// List display + email + drag & drop
function ItemList({ items, listColor, listBg, onRemove, onEmail, sending, sent, user, emptyLabel, listType, onMove, otherItems }) {
  if (items.length === 0) return null;
  
  return (
    <div className="flex flex-col gap-2">
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="divide-y divide-[#F3F4F6] max-h-64 overflow-y-auto">
          {items.map((item, idx) => (
            <div 
              key={idx} 
              draggable
              onDragStart={() => {}}
              className="flex items-center gap-2 px-3 py-2.5 cursor-move transition-all"
            >
              <GripHorizontal className="w-4 h-4 text-[#D1D5DB] flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold text-[#1A1A2E]">{item.name}</p>
                <p className={`text-[9px] font-semibold ${listColor}`}>{SIZE_LABELS[item.size]}: {item.sizeLabel}</p>
                <p className="text-[9px] text-[#9CA3AF]">{item.room}</p>
              </div>
              <button onClick={() => onRemove(idx)} className="text-[#D1D5DB] hover:text-[#EF4444] text-xs px-1">✕</button>
            </div>
          ))}
        </div>
        
        {/* Drop zone for items from other list */}
        <div 
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => onMove(draggedIdx, listType)}
          className="border-t-2 border-dashed border-[#E5E7EB] px-3 py-3 text-center bg-[#FAFAFA] hover:bg-[#F3F4F6] transition-colors"
        >
          <p className="text-[10px] text-[#9CA3AF] font-semibold">Drop items here to {listType === "moving" ? "keep moving" : "donate/junk"}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm px-4 py-3">
        {sent ? (
          <div className="flex items-center justify-center gap-2 py-1 bg-[#F0FDF4] rounded-xl">
            <CheckCircle2 className="w-4 h-4 text-[#059669]" />
            <span className="text-sm font-bold text-[#059669]">Sent to {user?.email}</span>
          </div>
        ) : (
          <button onClick={onEmail} disabled={sending}
            className={`w-full py-3 rounded-xl text-white text-lg font-bold flex items-center justify-center gap-2 ${listBg}`}>
            {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Mail className="w-5 h-5" />}
            {sending ? "Sending…" : "Email Entire List"}
          </button>
        )}
      </div>
    </div>
  );
}

export default function InventoryTab({ user }) {
  const [activeTab, setActiveTab] = useState("moving");

  // Moving list state
  const [movingItems, setMovingItems] = useState([]);
  const [sendingMoving, setSendingMoving] = useState(false);
  const [sentMoving, setSentMoving] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);
  const [draggedSource, setDraggedSource] = useState(null);

  // Junk/Donation list state
  const [donateItems, setDonateItems] = useState([]);
  const [sendingDonate, setSendingDonate] = useState(false);
  const [sentDonate, setSentDonate] = useState(false);

  const truck = estimateTruck(movingItems);

  const handleMove = (idx, targetList) => {
    if (draggedSource === "moving" && targetList === "donate") {
      const item = movingItems[idx];
      setMovingItems(prev => prev.filter((_, i) => i !== idx));
      setDonateItems(prev => [...prev, item]);
    } else if (draggedSource === "donate" && targetList === "moving") {
      const item = donateItems[idx];
      setDonateItems(prev => prev.filter((_, i) => i !== idx));
      setMovingItems(prev => [...prev, item]);
    }
    setDraggedItem(null);
    setDraggedSource(null);
  };

  const handleEmailMoving = async () => {
    setSendingMoving(true);
    const roomGroups = {};
    movingItems.forEach(i => {
      if (!roomGroups[i.room]) roomGroups[i.room] = [];
      roomGroups[i.room].push(`  • ${i.name} — ${SIZE_LABELS[i.size]} (${i.sizeLabel})`);
    });
    const roomSections = Object.entries(roomGroups)
      .map(([room, items]) => `${room} (${items.length} items)\n${items.join("\n")}`)
      .join("\n\n");
    const body = `MOVING INVENTORY — QUOTE REQUEST\n${"=".repeat(50)}\n\n${roomSections}\n\n${"=".repeat(50)}\nTOTAL ITEMS: ${movingItems.length}\nEstimated Truck: ${truck?.label || "TBD"}\n${truck?.truck ? truck.truck : ""}\n\nGenerated by EZ Move AI`;
    await base44.integrations.Core.SendEmail({ to: user?.email, subject: "My Moving Inventory — Quote Request", body });
    setSendingMoving(false);
    setSentMoving(true);
  };

  const handleEmailDonate = async () => {
    setSendingDonate(true);
    const roomGroups = {};
    donateItems.forEach(i => {
      if (!roomGroups[i.room]) roomGroups[i.room] = [];
      roomGroups[i.room].push(`  • ${i.name} — ${SIZE_LABELS[i.size]} (${i.sizeLabel})`);
    });
    const roomSections = Object.entries(roomGroups)
      .map(([room, items]) => `${room} (${items.length} items)\n${items.join("\n")}`)
      .join("\n\n");
    const body = `JUNK / DONATION LIST\n${"=".repeat(50)}\n\n${roomSections}\n\n${"=".repeat(50)}\nTOTAL ITEMS: ${donateItems.length}\n\nGenerated by EZ Move AI`;
    await base44.integrations.Core.SendEmail({ to: user?.email, subject: "My Junk & Donation List", body });
    setSendingDonate(false);
    setSentDonate(true);
  };

  return (
    <div className="flex flex-col gap-3">

      {/* Truck banner — moving only */}
      {activeTab === "moving" && (
        truck ? (
          <div className="bg-gradient-to-r from-[#E0F2FE] to-[#BAE6FD] rounded-2xl px-4 py-3 border border-[#7DD3FC] shadow-sm">
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">{truck.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[#0369A1] text-xs font-bold">{truck.label}</p>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div>
                    <p className="text-[9px] text-[#0EA5E9] font-semibold">Space</p>
                    <p className="text-[10px] text-[#164E63] font-bold">{truck.cuft}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-[#0EA5E9] font-semibold">Weight</p>
                    <p className="text-[10px] text-[#164E63] font-bold">{truck.weight}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-[#0EA5E9] font-semibold">Est. Cost</p>
                    <p className="text-[10px] text-[#164E63] font-bold">{truck.cost}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-[#0EA5E9] font-semibold">Items</p>
                    <p className="text-[10px] text-[#164E63] font-bold">{movingItems.length}</p>
                  </div>
                </div>
                <p className="text-[8px] text-[#0369A1] mt-1 italic">{truck.rooms}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-[#E0F2FE] to-[#BAE6FD] rounded-2xl px-4 py-3 border border-[#7DD3FC]">
            <p className="text-[#0369A1] text-xs font-bold">🚛 Estimated Truck Size & Cost</p>
            <p className="text-[#0EA5E9] text-[10px] mt-1">Add items below to get accurate quote estimates</p>
          </div>
        )
      )}

      {activeTab === "donate" && (
        <div className="bg-[#4C1D95] rounded-2xl px-4 py-3 flex items-center gap-3">
          <span className="text-2xl">🫶</span>
          <div className="flex-1">
            <p className="text-white text-xs font-bold">Junk / Donation List</p>
            <p className="text-[#C4B5FD] text-[10px]">Items to donate, sell, or junk-haul</p>
          </div>
          <div className="text-right">
            <p className="text-[#C4B5FD] text-base font-bold">{donateItems.length}</p>
            <p className="text-[#C4B5FD] text-[9px]">items</p>
          </div>
        </div>
      )}

      {/* Sub-tabs */}
      <div className="flex bg-white rounded-xl overflow-hidden shadow-sm">
        <button
          onClick={() => setActiveTab("moving")}
          className={`flex-1 py-2.5 text-[11px] font-bold transition-all
            ${activeTab === "moving" ? "bg-[#F97316] text-white" : "text-[#9CA3AF]"}`}
        >
          📦 Moving ({movingItems.length})
        </button>
        <button
          onClick={() => setActiveTab("donate")}
          className={`flex-1 py-2.5 text-[11px] font-bold transition-all
            ${activeTab === "donate" ? "bg-[#8B5CF6] text-white" : "text-[#9CA3AF]"}`}
        >
          🫶 Junk / Donate ({donateItems.length})
        </button>
      </div>

      {/* Moving tab */}
      {activeTab === "moving" && (
        <>
          <ItemPicker listType="moving" onAdd={item => setMovingItems(prev => [...prev, item])} />
          <ItemList
            items={movingItems}
            listColor="text-[#F97316]"
            listBg="bg-[#F97316]"
            onRemove={idx => setMovingItems(prev => prev.filter((_, i) => i !== idx))}
            onEmail={handleEmailMoving}
            sending={sendingMoving}
            sent={sentMoving}
            user={user}
            emptyLabel="Tap items above to build your moving list"
            listType="moving"
            onMove={handleMove}
            otherItems={donateItems}
          />
        </>
      )}

      {/* Donate tab */}
      {activeTab === "donate" && (
        <>
          <ItemPicker listType="donate" onAdd={item => setDonateItems(prev => [...prev, item])} />
          <ItemList
            items={donateItems}
            listColor="text-[#8B5CF6]"
            listBg="bg-[#8B5CF6]"
            onRemove={idx => setDonateItems(prev => prev.filter((_, i) => i !== idx))}
            onEmail={handleEmailDonate}
            sending={sendingDonate}
            sent={sentDonate}
            user={user}
            emptyLabel="Add items to donate, sell, or junk-haul"
            listType="donate"
            onMove={handleMove}
            otherItems={movingItems}
          />
        </>
      )}
    </div>
  );
}