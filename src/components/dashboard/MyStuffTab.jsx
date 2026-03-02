import { useState } from "react";
import { ChevronRight, ChevronLeft, CheckCircle2, Trash2, Heart, Package } from "lucide-react";

const ROOMS = [
  {
    name: "Living Room", emoji: "🛋️",
    items: ["Sofa", "Coffee Table", "TV", "TV Stand", "Bookcase", "Armchair", "Rug", "Side Tables", "Lamps", "Entertainment Center"]
  },
  {
    name: "Kitchen", emoji: "🍳",
    items: ["Refrigerator", "Microwave", "Kitchen Table", "Chairs", "Bar Stools", "Kitchen Island", "Small Appliances", "Dishes & Pots", "Pantry Items"]
  },
  {
    name: "Master Bedroom", emoji: "🛏️",
    items: ["Bed Frame", "Mattress", "Dresser", "Nightstands", "Wardrobe", "Vanity", "Mirror", "Bedding"]
  },
  {
    name: "Bedroom 2 / 3", emoji: "🛏️",
    items: ["Bed Frame", "Mattress", "Dresser", "Desk", "Desk Chair", "Bookcase", "Toys & Storage"]
  },
  {
    name: "Bathroom", emoji: "🚿",
    items: ["Vanity Cabinet", "Medicine Cabinet", "Shelving", "Linen Cabinet", "Towels & Linens"]
  },
  {
    name: "Office", emoji: "💻",
    items: ["Desk", "Office Chair", "Filing Cabinet", "Bookcase", "Electronics", "Printer"]
  },
  {
    name: "Garage / Storage", emoji: "🏠",
    items: ["Workbench", "Shelving Units", "Lawn Mower", "Bikes", "Tool Chest", "Storage Bins", "Boxes"]
  },
  {
    name: "Outdoor / Patio", emoji: "☀️",
    items: ["Patio Table", "Patio Chairs", "Grill", "Outdoor Sofa", "Planters"]
  },
];

const DECISIONS = [
  { key: "keep", label: "Keep", emoji: "📦", color: "bg-blue-500", light: "bg-blue-50 border-blue-200 text-blue-700" },
  { key: "donate", label: "Donate", emoji: "🫶", color: "bg-emerald-500", light: "bg-emerald-50 border-emerald-200 text-emerald-700" },
  { key: "junk", label: "Junk", emoji: "🗑️", color: "bg-red-500", light: "bg-red-50 border-red-200 text-red-700" },
];

function SortScreen({ room, decisions, onDecide, onNext, onBack, isLast }) {
  const allDone = room.items.every(item => decisions[item]);
  const done = room.items.filter(item => decisions[item]).length;

  return (
    <div className="space-y-3">
      {/* Room header */}
      <div className="bg-white rounded-2xl border border-slate-100 px-4 py-3 flex items-center gap-3">
        <span className="text-2xl">{room.emoji}</span>
        <div className="flex-1">
          <p className="text-sm font-bold text-slate-800">{room.name}</p>
          <p className="text-[10px] text-slate-400">{done}/{room.items.length} items sorted</p>
        </div>
        <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-orange-500 rounded-full transition-all"
            style={{ width: `${(done / room.items.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Items */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="divide-y divide-slate-50">
          {room.items.map(item => {
            const decided = decisions[item];
            const dec = DECISIONS.find(d => d.key === decided);
            return (
              <div key={item} className="px-4 py-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-slate-800">{item}</p>
                  {dec && (
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${dec.light}`}>
                      {dec.emoji} {dec.label}
                    </span>
                  )}
                </div>
                <div className="flex gap-1.5">
                  {DECISIONS.map(d => (
                    <button
                      key={d.key}
                      onClick={() => onDecide(item, d.key)}
                      className={`flex-1 py-1.5 rounded-xl text-[10px] font-bold transition-all border
                        ${decided === d.key
                          ? `${d.color} text-white border-transparent`
                          : "bg-slate-50 text-slate-500 border-slate-100 hover:bg-slate-100"
                        }`}
                    >
                      {d.emoji} {d.label}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Nav */}
      <div className="flex gap-2">
        {onBack && (
          <button onClick={onBack} className="flex items-center gap-1 px-4 py-3 rounded-2xl border border-slate-200 bg-white text-slate-600 text-xs font-bold">
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
        )}
        <button
          onClick={onNext}
          disabled={!allDone}
          className={`flex-1 py-3 rounded-2xl text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all
            ${allDone ? "bg-orange-500 shadow-sm active:scale-[0.98]" : "bg-slate-200 text-slate-400"}`}
        >
          {isLast ? "See My Summary" : `Next: ${ROOMS[ROOMS.findIndex(r => r.name === room.name) + 1]?.name || ""}`}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {!allDone && (
        <p className="text-center text-[10px] text-slate-400">Sort all items to continue</p>
      )}
    </div>
  );
}

function SummaryScreen({ allDecisions, onRestart }) {
  const keeps = [], donates = [], junks = [];

  Object.entries(allDecisions).forEach(([item, dec]) => {
    if (dec === "keep") keeps.push(item);
    else if (dec === "donate") donates.push(item);
    else if (dec === "junk") junks.push(item);
  });

  return (
    <div className="space-y-3">
      <div className="bg-gradient-to-r from-orange-500 to-orange-400 rounded-2xl px-4 py-4 text-white">
        <p className="font-black text-base">Your Move Summary 🎉</p>
        <p className="text-orange-100 text-xs mt-0.5">Here's where everything is going</p>
      </div>

      {[
        { title: "📦 Moving with you", items: keeps, color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-100" },
        { title: "🫶 Donating", items: donates, color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-100" },
        { title: "🗑️ Junk / Toss", items: junks, color: "text-red-700", bg: "bg-red-50", border: "border-red-100" },
      ].map(group => (
        <div key={group.title} className={`${group.bg} border ${group.border} rounded-2xl overflow-hidden`}>
          <div className="px-4 py-2.5 border-b border-white/50">
            <p className={`text-xs font-bold ${group.color}`}>{group.title} ({group.items.length})</p>
          </div>
          {group.items.length === 0 ? (
            <p className="px-4 py-3 text-[10px] text-slate-400">None</p>
          ) : (
            <div className="px-4 py-2 flex flex-wrap gap-1.5">
              {group.items.map(item => (
                <span key={item} className={`text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/70 ${group.color}`}>
                  {item}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}

      <button
        onClick={onRestart}
        className="w-full py-3 rounded-2xl border border-slate-200 bg-white text-slate-500 text-xs font-bold"
      >
        Start Over
      </button>
    </div>
  );
}

export default function MyStuffTab({ user }) {
  const [started, setStarted] = useState(false);
  const [roomIndex, setRoomIndex] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  // decisions: { [roomName]: { [itemName]: "keep"|"donate"|"junk" } }
  const [decisions, setDecisions] = useState({});

  const room = ROOMS[roomIndex];

  const roomDecisions = decisions[room?.name] || {};

  const handleDecide = (item, dec) => {
    setDecisions(prev => ({
      ...prev,
      [room.name]: { ...(prev[room.name] || {}), [item]: dec }
    }));
  };

  const handleNext = () => {
    if (roomIndex === ROOMS.length - 1) {
      setShowSummary(true);
    } else {
      setRoomIndex(i => i + 1);
    }
  };

  const handleBack = () => {
    if (roomIndex === 0) return;
    setRoomIndex(i => i - 1);
  };

  const allDecisions = Object.values(decisions).reduce((acc, roomDecs) => ({ ...acc, ...roomDecs }), {});

  if (!started) {
    return (
      <div className="space-y-4">
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl px-5 py-6 text-white">
          <p className="text-xl font-black mb-1">Let's figure out where everything is going 📦</p>
          <p className="text-orange-100 text-xs leading-relaxed">
            We'll go room by room so you can decide what to keep, donate, or junk before moving day.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="divide-y divide-slate-50">
            {ROOMS.map((r, i) => (
              <div key={r.name} className="flex items-center gap-3 px-4 py-2.5">
                <span className="text-lg">{r.emoji}</span>
                <p className="flex-1 text-xs font-semibold text-slate-700">{r.name}</p>
                <p className="text-[10px] text-slate-400">{r.items.length} items</p>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => setStarted(true)}
          className="w-full py-4 rounded-2xl bg-orange-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-200 active:scale-[0.98] transition-transform"
        >
          Start Sorting <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    );
  }

  if (showSummary) {
    return <SummaryScreen allDecisions={allDecisions} onRestart={() => { setStarted(false); setRoomIndex(0); setDecisions({}); setShowSummary(false); }} />;
  }

  return (
    <div className="space-y-3">
      {/* Progress bar across rooms */}
      <div className="flex gap-1">
        {ROOMS.map((r, i) => (
          <button
            key={r.name}
            onClick={() => setRoomIndex(i)}
            className={`flex-1 h-1.5 rounded-full transition-all ${i === roomIndex ? "bg-orange-500" : i < roomIndex ? "bg-emerald-400" : "bg-slate-200"}`}
          />
        ))}
      </div>
      <p className="text-[10px] text-slate-400 text-center font-semibold">
        Room {roomIndex + 1} of {ROOMS.length}
      </p>

      <SortScreen
        room={room}
        decisions={roomDecisions}
        onDecide={handleDecide}
        onNext={handleNext}
        onBack={roomIndex > 0 ? handleBack : null}
        isLast={roomIndex === ROOMS.length - 1}
      />
    </div>
  );
}