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

// ─── Provider warning card ─────────────────────────────────────────────────────
function ProviderWarning({ type, count, hasProvider, onGoToMoveInfo }) {
  if (!count) return null;
  if (hasProvider) return (
    <div className={`rounded-2xl px-4 py-3 flex gap-3 items-center border
      ${type === "move" ? "bg-emerald-50 border-emerald-200" : type === "donate" ? "bg-emerald-50 border-emerald-200" : "bg-emerald-50 border-emerald-200"}`}>
      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
      <p className="text-xs font-bold text-emerald-700">
        {type === "move" ? "Mover booked! List ready to share." : type === "donate" ? "Donation pickup scheduled." : "Junk removal booked."}
      </p>
    </div>
  );
  const CONFIG = {
    move: { color: "amber", label: "mover", cta: "Add a Mover", emoji: "🚛" },
    donate: { color: "purple", label: "donation pickup", cta: "Add Donation Pickup", emoji: "🫶" },
    junk: { color: "red", label: "junk removal", cta: "Add Junk Removal", emoji: "🗑️" },
  };
  const c = CONFIG[type];
  const colorMap = {
    amber: { bg: "bg-amber-50", border: "border-amber-200", title: "text-amber-800", body: "text-amber-600", btn: "bg-amber-500", icon: "text-amber-500" },
    purple: { bg: "bg-purple-50", border: "border-purple-200", title: "text-purple-800", body: "text-purple-600", btn: "bg-purple-500", icon: "text-purple-500" },
    red: { bg: "bg-red-50", border: "border-red-200", title: "text-red-800", body: "text-red-600", btn: "bg-red-500", icon: "text-red-500" },
  }[c.color];
  return (
    <div className={`${colorMap.bg} border ${colorMap.border} rounded-2xl px-4 py-3 flex gap-3 items-start`}>
      <AlertTriangle className={`w-4 h-4 ${colorMap.icon} mt-0.5 shrink-0`} />
      <div className="flex-1">
        <p className={`text-xs font-bold ${colorMap.title}`}>{c.emoji} No {c.label} selected yet!</p>
        <p className={`text-[10px] ${colorMap.body} mt-0.5 mb-2`}>You have {count} item{count > 1 ? "s" : ""} tagged — book a {c.label} so it auto-adds to your calendar & alerts.</p>
        <button onClick={onGoToMoveInfo} className={`text-[10px] font-bold text-white ${colorMap.btn} px-3 py-1.5 rounded-xl active:scale-[0.98] transition-transform`}>
          Go to Move Info → {c.cta}
        </button>
      </div>
    </div>
  );
}

// ─── AI Ideas panel ────────────────────────────────────────────────────────────
function AIIdeasPanel() {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-gradient-to-br from-violet-50 to-blue-50 border border-violet-200 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full px-4 py-3 flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-violet-500" />
          <p className="text-xs font-bold text-violet-800">AI Superpowers — Coming Soon</p>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-violet-400" /> : <ChevronDown className="w-4 h-4 text-violet-400" />}
      </button>
      {open && (
        <div className="px-4 pb-4 grid grid-cols-1 gap-2">
          {AI_IDEAS.map((idea, i) => (
            <div key={i} className="bg-white/70 rounded-xl px-3 py-2.5 flex gap-2.5 items-start">
              <span className="text-lg leading-none mt-0.5">{idea.emoji}</span>
              <div>
                <p className="text-[11px] font-bold text-slate-700">{idea.title}</p>
                <p className="text-[10px] text-slate-500">{idea.desc}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Summary ──────────────────────────────────────────────────────────────────
function SummaryScreen({ allDecisions, allSizes, providers, onRestart, onGoToMoveInfo }) {
  const groups = { move: [], donate: [], junk: [] };
  Object.entries(allDecisions).forEach(([item, dec]) => {
    if (groups[dec]) groups[dec].push(item);
  });

  const hasMover = providers.some(p => /mover/i.test(p.role || ""));
  const hasDonation = providers.some(p => /donat/i.test(p.role || ""));
  const hasJunk = providers.some(p => /junk/i.test(p.role || ""));

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-400 rounded-2xl px-4 py-4 text-white">
        <p className="font-black text-base">Your Inventory 🎉</p>
        <p className="text-orange-100 text-xs mt-0.5">Complete list — act on each category below</p>
      </div>

      {/* Provider warnings for each category */}
      <ProviderWarning type="move" count={groups.move.length} hasProvider={hasMover} onGoToMoveInfo={onGoToMoveInfo} />
      <ProviderWarning type="donate" count={groups.donate.length} hasProvider={hasDonation} onGoToMoveInfo={onGoToMoveInfo} />
      <ProviderWarning type="junk" count={groups.junk.length} hasProvider={hasJunk} onGoToMoveInfo={onGoToMoveInfo} />

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

      {/* AI Ideas */}
      <AIIdeasPanel />

      <button onClick={onRestart} className="w-full py-3 rounded-2xl border border-slate-200 bg-white text-slate-500 text-xs font-bold">
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