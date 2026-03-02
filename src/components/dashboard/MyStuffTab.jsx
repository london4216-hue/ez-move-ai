import { useState, useEffect } from "react";
import { ChevronRight, ChevronLeft, SkipForward, AlertTriangle, CheckCircle2, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { base44 } from "@/api/base44Client";

const AI_IDEAS = [
  { emoji: "📸", title: "Photo Room Scan", desc: "Snap a photo of any room and AI instantly suggests what to move, donate, or junk." },
  { emoji: "💰", title: "Resale Estimator", desc: "AI checks current market prices for your donate/junk items — you might be sitting on cash." },
  { emoji: "🕐", title: "Move Day Timeline", desc: "AI builds a custom hour-by-hour schedule for move day based on your inventory and closing time." },
  { emoji: "📋", title: "Instant Mover Quote", desc: "One tap sends your sized inventory list to 3 local movers as a professional quote request." },
  { emoji: "📦", title: "Box & Supply Estimator", desc: "Based on your item count and sizes, AI estimates exactly how many boxes and supplies you need." },
  { emoji: "🌱", title: "Eco Move Score", desc: "See how green your move is. AI scores donate vs junk ratio and suggests local charities nearby." },
];

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

const SIZES = ["Small", "Medium", "Large", "N/A"];
const SIZE_DESC = {
  Small: "Can be carried by 1 person",
  Medium: "Needs 2 people / fits in sedan",
  Large: "Truck required / oversized",
  "N/A": "Not applicable",
};

// ─── Intro ───────────────────────────────────────────────────────────────────
function IntroScreen({ onStart }) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-8 px-2">
      <div className="text-6xl">📦</div>
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-black text-slate-800">Let's figure out<br />your stuff</h2>
        <p className="text-slate-500 text-sm leading-relaxed">
          We'll walk through each room so you can sort everything into your <strong>mover list</strong>, <strong>donation pile</strong>, or <strong>junk it</strong> — and flag sizes for an accurate quote.
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

// ─── Single item row ──────────────────────────────────────────────────────────
function ItemRow({ item, decision, size, onDecide, onSize }) {
  const dec = LISTS.find(l => l.key === decision);
  const showSize = !!decision; // show size picker once list is chosen

  return (
    <div className="px-4 py-3 border-b border-slate-50 last:border-0">
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-xs font-bold text-slate-800">{item}</p>
        {dec && (
          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${dec.light}`}>
            {dec.emoji} {dec.label}
          </span>
        )}
      </div>

      {/* List buttons */}
      <div className="flex gap-1.5 mb-2">
        {LISTS.map(l => (
          <button
            key={l.key}
            onClick={() => onDecide(item, l.key)}
            className={`flex-1 py-1.5 rounded-xl text-[10px] font-bold transition-all border
              ${decision === l.key ? `${l.color} text-white border-transparent` : "bg-slate-50 text-slate-500 border-slate-100 active:bg-slate-100"}`}
          >
            {l.emoji} {l.label}
          </button>
        ))}
      </div>

      {/* Size picker — appears after list selected */}
      {showSize && (
        <div className="flex gap-1">
          {SIZES.map(s => (
            <button
              key={s}
              onClick={() => onSize(item, s)}
              title={SIZE_DESC[s]}
              className={`flex-1 py-1 rounded-lg text-[9px] font-bold border transition-all
                ${size === s ? "bg-slate-700 text-white border-transparent" : "bg-white text-slate-400 border-slate-200 active:bg-slate-100"}`}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Room screen ──────────────────────────────────────────────────────────────
function RoomScreen({ room, roomIndex, totalRooms, decisions, sizes, onDecide, onSize, onNext, onBack, onSkip, isLast }) {
  return (
    <div className="flex flex-col gap-3">
      {/* Progress dots */}
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
          <p className="text-[10px] text-slate-400">Room {roomIndex + 1} of {totalRooms} · tap a size after sorting</p>
        </div>
      </div>

      {/* Items */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        {room.items.map(item => (
          <ItemRow
            key={item}
            item={item}
            decision={decisions[item]}
            size={sizes[item]}
            onDecide={onDecide}
            onSize={onSize}
          />
        ))}
      </div>

      {/* Nav */}
      <div className="flex gap-2">
        {roomIndex > 0 && (
          <button onClick={onBack} className="px-4 py-3 rounded-2xl border border-slate-200 bg-white text-slate-600 text-xs font-bold flex items-center">
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
        <button onClick={onSkip} className="px-4 py-3 rounded-2xl border border-slate-200 bg-white text-slate-400 text-xs font-bold flex items-center gap-1">
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

// ─── Summary ──────────────────────────────────────────────────────────────────
function SummaryScreen({ allDecisions, allSizes, hasMover, onRestart, onGoToMoveInfo }) {
  const groups = { move: [], donate: [], junk: [] };
  Object.entries(allDecisions).forEach(([item, dec]) => {
    if (groups[dec]) groups[dec].push(item);
  });

  const moveItems = groups.move;
  const hasMoveItems = moveItems.length > 0;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-400 rounded-2xl px-4 py-4 text-white">
        <p className="font-black text-base">Your Inventory 🎉</p>
        <p className="text-orange-100 text-xs mt-0.5">Complete list sorted by category</p>
      </div>

      {/* No mover warning */}
      {hasMoveItems && !hasMover && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex gap-3 items-start">
          <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-xs font-bold text-amber-800">No mover selected yet!</p>
            <p className="text-[10px] text-amber-600 mt-0.5 mb-2">You have {moveItems.length} items to move but haven't booked a mover. Add one to your plan so it shows up on your calendar.</p>
            <button
              onClick={onGoToMoveInfo}
              className="text-[10px] font-bold text-white bg-amber-500 px-3 py-1.5 rounded-xl active:scale-[0.98] transition-transform"
            >
              Go to Move Info → Add a Mover
            </button>
          </div>
        </div>
      )}

      {hasMoveItems && hasMover && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3 flex gap-3 items-center">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <p className="text-xs font-bold text-emerald-700">Mover booked! Your move list is ready to share.</p>
        </div>
      )}

      {/* Lists */}
      {LISTS.map(list => (
        <div key={list.key} className={`rounded-2xl border overflow-hidden ${list.light}`}>
          <div className="px-4 py-2.5 border-b border-white/50 flex items-center gap-2">
            <span className="text-base">{list.emoji}</span>
            <p className="text-xs font-bold">{list.label} List <span className="font-normal opacity-70">({groups[list.key].length} items)</span></p>
          </div>
          {groups[list.key].length === 0 ? (
            <p className="px-4 py-3 text-[10px] opacity-60">No items</p>
          ) : (
            <div className="px-4 py-3 space-y-1.5">
              {groups[list.key].map(item => {
                const size = allSizes[item];
                return (
                  <div key={item} className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-white/60">{item}</span>
                    {size && (
                      <span className="text-[9px] font-bold text-slate-400 bg-white/60 px-2 py-0.5 rounded-full">{size}</span>
                    )}
                  </div>
                );
              })}
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

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function MyStuffTab({ user, onNavigate }) {
  const [phase, setPhase] = useState("intro");
  const [roomIndex, setRoomIndex] = useState(0);
  const [decisions, setDecisions] = useState({}); // { roomName: { item: list_key } }
  const [sizes, setSizes] = useState({});          // { item: size_label }
  const [hasMover, setHasMover] = useState(false);

  useEffect(() => {
    if (!user) return;
    base44.entities.SavedProvider.filter({ user_id: user.id }).then(providers => {
      const moverBooked = providers.some(p => /mover/i.test(p.role || ""));
      setHasMover(moverBooked);
    }).catch(() => {});
  }, [user]);

  const room = ROOMS[roomIndex];
  const roomDecisions = decisions[room?.name] || {};
  const roomSizes = sizes; // sizes are flat by item name

  const handleDecide = (item, dec) => {
    setDecisions(prev => ({
      ...prev,
      [room.name]: { ...(prev[room.name] || {}), [item]: dec }
    }));
  };

  const handleSize = (item, s) => {
    setSizes(prev => ({ ...prev, [item]: s }));
  };

  const handleNext = () => {
    if (roomIndex === ROOMS.length - 1) setPhase("summary");
    else setRoomIndex(i => i + 1);
  };

  const handleBack = () => setRoomIndex(i => i - 1);
  const handleSkip = () => handleNext();

  const allDecisions = Object.values(decisions).reduce((acc, r) => ({ ...acc, ...r }), {});

  const handleRestart = () => {
    setPhase("intro");
    setRoomIndex(0);
    setDecisions({});
    setSizes({});
  };

  if (phase === "intro") return <IntroScreen onStart={() => setPhase("sorting")} />;

  if (phase === "summary") return (
    <SummaryScreen
      allDecisions={allDecisions}
      allSizes={sizes}
      hasMover={hasMover}
      onRestart={handleRestart}
      onGoToMoveInfo={() => onNavigate && onNavigate("mymove")}
    />
  );

  return (
    <RoomScreen
      room={room}
      roomIndex={roomIndex}
      totalRooms={ROOMS.length}
      decisions={roomDecisions}
      sizes={roomSizes}
      onDecide={handleDecide}
      onSize={handleSize}
      onNext={handleNext}
      onBack={handleBack}
      onSkip={handleSkip}
      isLast={roomIndex === ROOMS.length - 1}
    />
  );
}