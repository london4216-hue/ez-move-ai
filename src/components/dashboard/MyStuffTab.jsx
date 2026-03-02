import { useState } from "react";
import { ChevronRight, ChevronLeft, SkipForward } from "lucide-react";

const ROOMS = [
  { name: "Living Room", emoji: "🛋️", items: ["Sofa", "Coffee Table", "TV", "TV Stand", "Bookcase", "Armchair", "Rug", "Side Tables", "Lamps", "Entertainment Center"] },
  { name: "Kitchen", emoji: "🍳", items: ["Refrigerator", "Microwave", "Kitchen Table", "Chairs", "Bar Stools", "Kitchen Island", "Small Appliances", "Dishes & Pots", "Pantry Items"] },
  { name: "Master Bedroom", emoji: "🛏️", items: ["Bed Frame", "Mattress", "Dresser", "Nightstands", "Wardrobe", "Vanity", "Mirror", "Bedding"] },
  { name: "Bedroom 2 / 3", emoji: "🛏️", items: ["Bed Frame", "Mattress", "Dresser", "Desk", "Desk Chair", "Bookcase", "Toys & Storage"] },
  { name: "Bathroom", emoji: "🚿", items: ["Vanity Cabinet", "Medicine Cabinet", "Shelving", "Linen Cabinet", "Towels & Linens"] },
  { name: "Office", emoji: "💻", items: ["Desk", "Office Chair", "Filing Cabinet", "Bookcase", "Electronics", "Printer"] },
  { name: "Garage / Storage", emoji: "🏠", items: ["Workbench", "Shelving Units", "Lawn Mower", "Bikes", "Tool Chest", "Storage Bins", "Boxes"] },
  { name: "Outdoor / Patio", emoji: "☀️", items: ["Patio Table", "Patio Chairs", "Grill", "Outdoor Sofa", "Planters"] },
];

const LISTS = [
  { key: "move", label: "Moving", emoji: "📦", color: "bg-blue-500", light: "bg-blue-50 border-blue-200 text-blue-700" },
  { key: "donate", label: "Donate", emoji: "🫶", color: "bg-emerald-500", light: "bg-emerald-50 border-emerald-200 text-emerald-700" },
  { key: "junk", label: "Junk It", emoji: "🗑️", color: "bg-red-500", light: "bg-red-50 border-red-200 text-red-700" },
];

function IntroScreen({ onStart }) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-8 px-2">
      <div className="text-6xl">📦</div>
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-black text-slate-800">Let's figure out<br />your stuff</h2>
        <p className="text-slate-500 text-sm leading-relaxed">
          We'll walk through each room so you can sort everything into your <strong>mover list</strong>, <strong>donation pile</strong>, or <strong>junk it</strong>.
        </p>
      </div>
      <button
        onClick={onStart}
        className="w-full max-w-xs py-4 rounded-2xl bg-orange-500 text-white font-black text-base flex items-center justify-center gap-2 shadow-lg shadow-orange-200 active:scale-[0.98] transition-transform"
      >
        Let's Get Started <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}

function RoomScreen({ room, roomIndex, totalRooms, decisions, onDecide, onNext, onBack, onSkip, isLast }) {
  return (
    <div className="flex flex-col gap-3">
      {/* Progress */}
      <div className="flex gap-1">
        {Array.from({ length: totalRooms }).map((_, i) => (
          <div key={i} className={`flex-1 h-1 rounded-full transition-all ${i < roomIndex ? "bg-emerald-400" : i === roomIndex ? "bg-orange-500" : "bg-slate-200"}`} />
        ))}
      </div>

      {/* Room header */}
      <div className="flex items-center gap-3">
        <span className="text-3xl">{room.emoji}</span>
        <div>
          <p className="font-black text-slate-800 text-base">{room.name}</p>
          <p className="text-[10px] text-slate-400">Room {roomIndex + 1} of {totalRooms}</p>
        </div>
      </div>

      {/* Items */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="divide-y divide-slate-50">
          {room.items.map(item => {
            const decided = decisions[item];
            return (
              <div key={item} className="px-4 py-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-slate-800">{item}</p>
                  {decided && (
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${LISTS.find(l => l.key === decided)?.light}`}>
                      {LISTS.find(l => l.key === decided)?.emoji} {LISTS.find(l => l.key === decided)?.label}
                    </span>
                  )}
                </div>
                <div className="flex gap-1.5">
                  {LISTS.map(l => (
                    <button
                      key={l.key}
                      onClick={() => onDecide(item, l.key)}
                      className={`flex-1 py-1.5 rounded-xl text-[10px] font-bold transition-all border
                        ${decided === l.key ? `${l.color} text-white border-transparent` : "bg-slate-50 text-slate-500 border-slate-100 active:bg-slate-100"}`}
                    >
                      {l.emoji} {l.label}
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
        {roomIndex > 0 && (
          <button onClick={onBack} className="px-4 py-3 rounded-2xl border border-slate-200 bg-white text-slate-600 text-xs font-bold flex items-center gap-1">
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={onSkip}
          className="px-4 py-3 rounded-2xl border border-slate-200 bg-white text-slate-400 text-xs font-bold flex items-center gap-1"
        >
          <SkipForward className="w-4 h-4" /> Skip
        </button>
        <button
          onClick={onNext}
          className="flex-1 py-3 rounded-2xl bg-orange-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 active:scale-[0.98] transition-transform"
        >
          {isLast ? "See My Lists 🎉" : "Next Room"} <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function SummaryScreen({ allDecisions, onRestart }) {
  const groups = {
    move: [],
    donate: [],
    junk: [],
  };

  Object.entries(allDecisions).forEach(([item, dec]) => {
    if (groups[dec]) groups[dec].push(item);
  });

  return (
    <div className="space-y-3">
      <div className="bg-gradient-to-r from-orange-500 to-orange-400 rounded-2xl px-4 py-4 text-white">
        <p className="font-black text-base">Your Stuff, Sorted! 🎉</p>
        <p className="text-orange-100 text-xs mt-0.5">Here's your complete list by category</p>
      </div>

      {LISTS.map(list => (
        <div key={list.key} className={`rounded-2xl border overflow-hidden ${list.light}`}>
          <div className="px-4 py-2.5 border-b border-white/50 flex items-center gap-2">
            <span className="text-base">{list.emoji}</span>
            <p className="text-xs font-bold">{list.label} List <span className="font-normal opacity-70">({groups[list.key].length} items)</span></p>
          </div>
          {groups[list.key].length === 0 ? (
            <p className="px-4 py-3 text-[10px] opacity-60">No items here</p>
          ) : (
            <div className="px-4 py-3 flex flex-wrap gap-1.5">
              {groups[list.key].map(item => (
                <span key={item} className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-white/60">
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
  const [phase, setPhase] = useState("intro"); // intro | sorting | summary
  const [roomIndex, setRoomIndex] = useState(0);
  const [decisions, setDecisions] = useState({}); // { roomName: { item: "move"|"donate"|"junk" } }

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
      setPhase("summary");
    } else {
      setRoomIndex(i => i + 1);
    }
  };

  const handleBack = () => setRoomIndex(i => i - 1);
  const handleSkip = () => handleNext();

  const allDecisions = Object.values(decisions).reduce((acc, r) => ({ ...acc, ...r }), {});

  const handleRestart = () => {
    setPhase("intro");
    setRoomIndex(0);
    setDecisions({});
  };

  if (phase === "intro") return <IntroScreen onStart={() => setPhase("sorting")} />;
  if (phase === "summary") return <SummaryScreen allDecisions={allDecisions} onRestart={handleRestart} />;

  return (
    <RoomScreen
      room={room}
      roomIndex={roomIndex}
      totalRooms={ROOMS.length}
      decisions={roomDecisions}
      onDecide={handleDecide}
      onNext={handleNext}
      onBack={handleBack}
      onSkip={handleSkip}
      isLast={roomIndex === ROOMS.length - 1}
    />
  );
}