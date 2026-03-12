import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { ChevronRight, Mail, Loader2, CheckCircle2, Trash2, Plus, ArrowRight, Package, DollarSign, LayoutList } from "lucide-react";

const LISTS = [
  { key: "move",   label: "Move List",  emoji: "📦", color: "bg-blue-500",    light: "bg-blue-50 border-blue-200",       text: "text-blue-700",    desc: "Things you're taking with you" },
  { key: "junk",   label: "Junk It",    emoji: "🗑️", color: "bg-red-500",     light: "bg-red-50 border-red-200",         text: "text-red-700",     desc: "Trash / haul away" },
  { key: "donate", label: "Donate",     emoji: "🫶", color: "bg-emerald-500", light: "bg-emerald-50 border-emerald-200", text: "text-emerald-700", desc: "Give away or sell" },
];

const QUICK_ITEMS = [
  "Sofa", "Bed Frame", "Mattress", "Dresser", "Dining Table", "Chairs",
  "TV", "TV Stand", "Bookcase", "Desk", "Office Chair", "Refrigerator",
  "Microwave", "Washer", "Dryer", "Couch", "Coffee Table", "Nightstand",
  "Wardrobe", "Rug", "Lamps", "Patio Furniture", "Grill", "Bikes",
  "Storage Bins", "Boxes", "Tools", "Lawn Mower", "Artwork", "Mirrors",
];

const ITEM_SIZES = ["Small", "Medium", "Large", "X-Large"];

// Size multipliers for weight and cost
const SIZE_MULTIPLIERS = {
  "Small": 0.5,
  "Medium": 1.0,
  "Large": 1.8,
  "X-Large": 3.0
};

const SIZE_BOX_NEEDS = {
  "Small": { small: 1, medium: 0, large: 0 },
  "Medium": { small: 0, medium: 1, large: 0 },
  "Large": { small: 0, medium: 1, large: 1 },
  "X-Large": { small: 0, medium: 2, large: 2 }
};

// Base item weights
const ITEM_BASE_WEIGHT = {
  "Sofa": 150, "Couch": 150, "Bed Frame": 80, "Mattress": 100, "Dresser": 120,
  "Dining Table": 100, "Chairs": 20, "TV": 30, "TV Stand": 40, "Bookcase": 80,
  "Desk": 90, "Office Chair": 30, "Refrigerator": 200, "Microwave": 35, "Washer": 150,
  "Dryer": 120, "Coffee Table": 50, "Nightstand": 30, "Wardrobe": 150, "Rug": 25,
  "Lamps": 10, "Patio Furniture": 60, "Grill": 80, "Bikes": 25, "Storage Bins": 15,
  "Boxes": 20, "Tools": 40, "Lawn Mower": 90, "Artwork": 10, "Mirrors": 20,
};

function calcSupplies(moveItems) {
  let small = 0, medium = 0, large = 0;
  
  moveItems.forEach(item => {
    const needs = SIZE_BOX_NEEDS[item.size] || { small: 0, medium: 1, large: 0 };
    small += needs.small;
    medium += needs.medium;
    large += needs.large;
  });

  const tape = Math.max(2, Math.ceil((small + medium + large) / 10));
  const paper = Math.ceil((small + medium) * 2.5);
  const bubble = Math.ceil(moveItems.length * 3);
  
  // Calculate cost
  const boxCost = (small * 2) + (medium * 3) + (large * 5);
  const tapeCost = tape * 6;
  const paperCost = Math.ceil(paper / 25) * 12;
  const bubbleCost = Math.ceil(bubble / 50) * 18;
  const suppliesCost = boxCost + tapeCost + paperCost + bubbleCost;
  
  return { small, medium, large, tape, paper, bubble, cost: suppliesCost };
}

function calcMoverCost(moveItems) {
  const totalWeight = moveItems.reduce((sum, item) => {
    const baseName = item.name.replace(/\s*\(.*?\)\s*/g, '');
    const baseWeight = ITEM_BASE_WEIGHT[baseName] || 40;
    const multiplier = SIZE_MULTIPLIERS[item.size] || 1.0;
    return sum + (baseWeight * multiplier);
  }, 0);
  
  const base = totalWeight < 500 ? 800 : totalWeight < 1500 ? 1500 : totalWeight < 3000 ? 2800 : 4500;
  const top = Math.round(base * 1.6 / 100) * 100;
  return { low: base, high: top };
}

// ── Move Summary screen ────────────────────────────────────────────────────────
function SummaryScreen({ lists, setLists, onBack, user, saveEstimates }) {
  const [movingItem, setMovingItem] = useState(null); // { item, fromKey }
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const moveItem = (item, fromKey, toKey) => {
    setLists(prev => ({
      ...prev,
      [fromKey]: prev[fromKey].filter(i => i.id !== item.id),
      [toKey]: [...prev[toKey], item],
    }));
    setMovingItem(null);
    setTimeout(() => saveEstimates(lists), 100);
  };

  const removeItem = (item, fromKey) => {
    setLists(prev => ({ ...prev, [fromKey]: prev[fromKey].filter(i => i.id !== item.id) }));
    setMovingItem(null);
    setTimeout(() => saveEstimates({ ...lists, [fromKey]: lists[fromKey].filter(i => i.id !== item.id) }), 100);
  };

  const supplies = calcSupplies(lists.move);
  const cost = calcMoverCost(lists.move);

  const handleEmailAll = async () => {
    setSending(true);
    const body = LISTS.map(l =>
      `${l.emoji} ${l.label.toUpperCase()}\n${"─".repeat(30)}\n${lists[l.key].length === 0 ? "(empty)" : lists[l.key].map((it, i) => `${i + 1}. ${it.name} (${it.size})`).join("\n")}`
    ).join("\n\n") + `\n\nESTIMATES\n${"─".repeat(30)}\nPacking Supplies: $${supplies.cost}\nMovers: $${cost.low.toLocaleString()}–$${cost.high.toLocaleString()}`;
    await base44.integrations.Core.SendEmail({ to: user?.email, subject: "My Full Move Inventory — EZ Move AI", body });
    setSending(false);
    setSent(true);
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="bg-[#0F172A] rounded-2xl px-4 py-3 flex items-center justify-between">
        <button onClick={onBack} className="text-slate-400 text-xs font-bold">← Back</button>
        <p className="text-white font-black text-sm">📋 Full Inventory</p>
        <div className="w-10" />
      </div>

      {/* All 3 lists */}
      {LISTS.map(list => (
        <div key={list.key} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className={`px-4 py-2.5 ${list.light} border-b border-opacity-50 flex items-center justify-between`}>
            <p className={`text-xs font-bold ${list.text}`}>{list.emoji} {list.label}</p>
            <span className={`text-xs font-black px-2 py-0.5 rounded-full ${list.light} ${list.text}`}>{lists[list.key].length}</span>
          </div>
          {lists[list.key].length === 0 ? (
            <p className="text-xs text-slate-400 px-4 py-3">No items</p>
          ) : (
            <div className="divide-y divide-slate-50">
              {lists[list.key].map(item => (
                <div key={item.id}>
                  <div className="flex items-center gap-2 px-4 py-2.5">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-700">{item.name}</p>
                      <p className="text-[10px] text-slate-400 font-semibold">{item.size}</p>
                    </div>
                    <button
                      onClick={() => setMovingItem(movingItem?.item?.id === item.id && movingItem?.fromKey === list.key ? null : { item, fromKey: list.key })}
                      className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-1 rounded-lg"
                    >
                      Move →
                    </button>
                    <button onClick={() => removeItem(item, list.key)} className="text-slate-300 hover:text-red-400 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    </div>
                    {/* Move-to picker */}
                    {movingItem?.item?.id === item.id && movingItem?.fromKey === list.key && (
                    <div className="px-4 pb-2.5 flex gap-2 flex-wrap">
                      <p className="text-[10px] text-slate-400 w-full font-semibold">Move to:</p>
                      {LISTS.filter(l => l.key !== list.key).map(target => (
                        <button
                          key={target.key}
                          onClick={() => moveItem(item, list.key, target.key)}
                          className={`text-[10px] font-bold px-3 py-1.5 rounded-xl border ${target.light} ${target.text} flex items-center gap-1`}
                        >
                          {target.emoji} {target.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Packing supplies auto-estimate */}
      {lists.move.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl overflow-hidden">
          <div className="bg-amber-500 px-4 py-2.5 flex items-center gap-2">
            <Package className="w-4 h-4 text-white" />
            <p className="text-white text-xs font-bold">Packing Supplies Estimate</p>
            <span className="ml-auto text-amber-100 text-[10px]">Based on your {lists.move.length} move items</span>
          </div>
          <div className="grid grid-cols-3 gap-px bg-amber-100">
            {[
              { label: "Small Boxes",  qty: supplies.small,  unit: "boxes" },
              { label: "Medium Boxes", qty: supplies.medium, unit: "boxes" },
              { label: "Large Boxes",  qty: supplies.large,  unit: "boxes" },
              { label: "Packing Tape", qty: supplies.tape,   unit: "rolls" },
              { label: "Packing Paper",qty: supplies.paper,  unit: "sheets" },
              { label: "Bubble Wrap",  qty: supplies.bubble, unit: "ft" },
            ].map(s => (
              <div key={s.label} className="bg-white px-3 py-3 text-center">
                <p className="text-lg font-black text-amber-600">{s.qty}</p>
                <p className="text-[9px] text-slate-400 font-semibold leading-tight">{s.unit}</p>
                <p className="text-[9px] text-slate-500 font-bold mt-0.5 leading-tight">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="bg-amber-500 px-4 py-2.5 text-center">
            <p className="text-white text-xs font-semibold">Estimated Supplies Cost</p>
            <p className="text-white text-2xl font-black">${supplies.cost}</p>
          </div>
        </div>
      )}

      {/* Mover cost estimate */}
      {lists.move.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl overflow-hidden">
          <div className="bg-blue-500 px-4 py-2.5 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-white" />
            <p className="text-white text-xs font-bold">Estimated Mover Cost</p>
          </div>
          <div className="px-4 py-4 flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-xs">Based on {lists.move.length} items</p>
              <p className="text-slate-400 text-[10px] mt-0.5">Local move estimate. Add ~40% for long distance.</p>
            </div>
            <div className="text-right">
              <p className="text-blue-700 text-2xl font-black">${cost.low.toLocaleString()}–${cost.high.toLocaleString()}</p>
              <p className="text-blue-400 text-[10px]">estimated range</p>
            </div>
          </div>
        </div>
      )}

      {/* Email all */}
      <div className="pb-2">
        {sent ? (
          <div className="flex items-center justify-center gap-2 py-3 bg-emerald-50 rounded-2xl">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span className="text-sm font-bold text-emerald-600">Full inventory sent!</span>
          </div>
        ) : (
          <button onClick={handleEmailAll} disabled={sending}
            className="w-full py-3.5 rounded-2xl bg-[#0F172A] text-white text-sm font-bold flex items-center justify-center gap-2">
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
            {sending ? "Sending…" : "Email Full Inventory"}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function MyStuffTab({ user }) {
  const [activeList, setActiveList] = useState(null); // null = home, "summary" = summary, or list key
  const [lists, setLists] = useState({ move: [], junk: [], donate: [] });
  const [customInput, setCustomInput] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [selectingSize, setSelectingSize] = useState(null); // item name waiting for size

  const currentList = LISTS.find(l => l.key === activeList);
  const items = activeList && activeList !== "summary" ? lists[activeList] : [];

  const addItem = (name, size) => {
    const trimmed = name.trim();
    if (!trimmed || !activeList || !size) return;
    if (lists[activeList]?.some(i => i.name === trimmed && i.size === size)) return;
    const newItem = { id: `${trimmed}-${size}-${Date.now()}`, name: trimmed, size };
    setLists(prev => ({ ...prev, [activeList]: [...prev[activeList], newItem] }));
    setCustomInput("");
    setSelectingSize(null);
    saveEstimates({ ...lists, [activeList]: [...lists[activeList], newItem] });
  };

  const removeItem = (id) => {
    setLists(prev => ({ ...prev, [activeList]: prev[activeList].filter(i => i.id !== id) }));
    saveEstimates({ ...lists, [activeList]: lists[activeList].filter(i => i.id !== id) });
  };

  const saveEstimates = async (currentLists) => {
    if (currentLists.move.length === 0) return;
    const supplies = calcSupplies(currentLists.move);
    const movers = calcMoverCost(currentLists.move);
    await base44.auth.updateMe({
      packing_supplies_cost: supplies.cost,
      moving_supplies_cost: movers.low,
      stuff_lists: JSON.stringify(currentLists)
    });
  };

  const handleEmail = async () => {
    setSending(true);
    const listLabel = currentList?.label;
    const body = `${listLabel.toUpperCase()}\n${"=".repeat(40)}\n\n${items.map((item, i) => `${i + 1}. ${item.name} (${item.size})`).join("\n")}\n\n${"=".repeat(40)}\nTotal: ${items.length} items\n\nGenerated by EZ Move AI`;
    await base44.integrations.Core.SendEmail({ to: user?.email, subject: `My ${listLabel} — EZ Move AI`, body });
    setSending(false);
    setSent(true);
    setTimeout(() => setSent(false), 4000);
  };

  const totalItems = Object.values(lists).reduce((sum, arr) => sum + arr.length, 0);

  // ── Summary screen ──────────────────────────────────────────────────────────
  if (activeList === "summary") {
    return <SummaryScreen lists={lists} setLists={setLists} onBack={() => setActiveList(null)} user={user} saveEstimates={saveEstimates} />;
  }

  // ── Dashboard ───────────────────────────────────────────────────────────────
  if (!activeList) {
    return (
      <div className="space-y-3">
        <div className="bg-white rounded-2xl px-4 py-4 border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-800 font-black text-base">My Stuff</p>
              <p className="text-slate-500 text-xs mt-0.5">Build your move, junk & donate lists</p>
            </div>
            <div className="text-right">
              <p className="text-slate-400 text-[10px]">Total Items</p>
              <p className="text-orange-500 text-2xl font-black">{totalItems}</p>
            </div>
          </div>
        </div>

        <div className="space-y-2.5">
          {LISTS.map(list => (
            <button
              key={list.key}
              onClick={() => setActiveList(list.key)}
              className="w-full bg-white rounded-2xl border border-slate-100 shadow-sm px-4 py-4 flex items-center gap-4 active:scale-[0.98] transition-transform text-left"
            >
              <div className={`w-12 h-12 rounded-2xl ${list.color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                <span className="text-2xl">{list.emoji}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-slate-800 text-sm">{list.label}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{list.desc}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {lists[list.key].length > 0 && (
                  <span className={`text-xs font-black px-2.5 py-1 rounded-full border ${list.light} ${list.text}`}>
                    {lists[list.key].length}
                  </span>
                )}
                <ChevronRight className="w-4 h-4 text-slate-300" />
              </div>
            </button>
          ))}
        </div>

        {/* View full summary */}
        {totalItems > 0 && (
          <button
            onClick={() => setActiveList("summary")}
            className="w-full py-4 rounded-2xl border-2 border-orange-300 bg-orange-50 text-orange-700 text-sm font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          >
            <LayoutList className="w-4 h-4" />
            View Full Inventory + Estimates
            <ArrowRight className="w-4 h-4 ml-auto" />
          </button>
        )}
      </div>
    );
  }

  // ── Individual list ─────────────────────────────────────────────────────────
  return (
    <div className="space-y-3">
      <div className="bg-[#0F172A] rounded-2xl px-4 py-3 flex items-center justify-between">
        <button onClick={() => setActiveList(null)} className="text-slate-400 text-xs font-bold flex items-center gap-1">
          ← Back
        </button>
        <div className="text-center">
          <p className="text-white font-black text-sm">{currentList.emoji} {currentList.label}</p>
          <p className="text-slate-400 text-[10px]">{items.length} items</p>
        </div>
        <div className="w-10" />
      </div>

      {selectingSize && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center">
          <div className="w-full max-w-md bg-white rounded-t-3xl shadow-2xl pb-6">
            <div className="px-5 py-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">Select Size</h3>
              <p className="text-xs text-slate-500 mt-1">How big is this {selectingSize}?</p>
            </div>
            <div className="px-5 pt-4 space-y-2">
              {ITEM_SIZES.map(size => (
                <button
                  key={size}
                  onClick={() => addItem(selectingSize, size)}
                  className="w-full py-3 rounded-xl border-2 border-slate-200 bg-white text-slate-700 font-bold text-sm hover:border-orange-400 hover:bg-orange-50 transition-all"
                >
                  {size}
                </button>
              ))}
              <button
                onClick={() => setSelectingSize(null)}
                className="w-full py-3 rounded-xl bg-slate-100 text-slate-600 font-bold text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-4 py-2.5 border-b border-slate-50">
          <p className="text-xs font-bold text-slate-700">Quick Add (Select item then size)</p>
        </div>
        <div className="px-3 py-2.5 flex flex-wrap gap-1.5">
          {QUICK_ITEMS.map(item => (
            <button
              key={item}
              onClick={() => setSelectingSize(item)}
              className="text-[10px] px-2.5 py-1 rounded-full font-semibold border bg-slate-50 text-slate-600 border-slate-200 active:bg-slate-200 transition-all"
            >
              + {item}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <input
          value={customInput}
          onChange={e => setCustomInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && setSelectingSize(customInput)}
          placeholder="Type any item..."
          className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/10 bg-white"
        />
        <button
          onClick={() => setSelectingSize(customInput)}
          disabled={!customInput.trim()}
          className="w-12 h-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center disabled:opacity-30 active:scale-95 transition-transform"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {items.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className={`px-4 py-2.5 border-b ${currentList.light} border-opacity-50`}>
            <p className={`text-xs font-bold ${currentList.text}`}>{currentList.emoji} {currentList.label} ({items.length})</p>
          </div>
          <div className="divide-y divide-slate-50 max-h-72 overflow-y-auto">
            {items.map(item => (
              <div key={item.id} className="flex items-center gap-3 px-4 py-2.5">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-700">{item.name}</p>
                  <p className="text-[10px] text-slate-400 font-semibold">{item.size}</p>
                </div>
                <button onClick={() => removeItem(item.id)} className="text-slate-300 hover:text-red-400 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <div className="px-4 py-3 border-t border-slate-50">
            {sent ? (
              <div className="flex items-center justify-center gap-2 py-2.5 bg-emerald-50 rounded-xl">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-bold text-emerald-600">Sent to {user?.email}</span>
              </div>
            ) : (
              <button onClick={handleEmail} disabled={sending}
                className={`w-full py-3 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2 ${currentList.color}`}>
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                {sending ? "Sending…" : "Email This List"}
              </button>
            )}
          </div>
        </div>
      )}

      {items.length === 0 && (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 py-10 text-center">
          <p className="text-3xl mb-2">{currentList.emoji}</p>
          <p className="text-sm font-bold text-slate-500">No items yet</p>
          <p className="text-xs text-slate-400 mt-1">Tap quick add above or type any item</p>
        </div>
      )}

      {/* Shortcut to summary if move list has items */}
      {activeList === "move" && items.length >= 3 && (
        <button
          onClick={() => setActiveList("summary")}
          className="w-full py-3.5 rounded-2xl border-2 border-orange-300 bg-orange-50 text-orange-700 text-sm font-bold flex items-center justify-center gap-2"
        >
          <Package className="w-4 h-4" />
          See Supplies & Cost Estimate
        </button>
      )}
    </div>
  );
}