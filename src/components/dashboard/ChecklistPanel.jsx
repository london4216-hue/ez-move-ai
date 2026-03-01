import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import ChecklistItemCard from "./ChecklistItemCard";

const WEEK_DATA = {
  1: {
    title: "Week 1 — Foundation Week",
    subtitle: "Get clarity + line up the big moving pieces early.",
    emoji: "🟦",
    items: [
      { id: "w1-1", title: "Confirm what stays vs. goes", description: "Furniture, appliances, personal items", ai_search_query: null },
      { id: "w1-2", title: "Estate sale decision", description: "Find local estate sale professionals", ai_search_query: "top rated estate sale professionals near me" },
      { id: "w1-3", title: "Request mover quotes", description: "Compare 3 top-rated movers side by side", ai_search_query: "top rated local movers near me" },
      { id: "w1-4", title: "Start donation / sell pile", description: "What's worth selling vs. donating", ai_search_query: null },
    ]
  },
  2: {
    title: "Week 2 — Clearing & Logistics",
    subtitle: "Reduce clutter and lock in logistics.",
    emoji: "🟦",
    items: [
      { id: "w2-1", title: "Finalize mover", description: "Confirm date aligned with closing timeline", ai_search_query: null },
      { id: "w2-2", title: "Schedule estate sale", description: "Suggested date based on close date", ai_search_query: null },
      { id: "w2-3", title: "Order packing supplies", description: "Boxes, labels, tape, wardrobe boxes", ai_search_query: null },
      { id: "w2-4", title: "Begin packing non-essentials", description: "Seasonal items, storage rooms, decor", ai_search_query: null },
      { id: "w2-5", title: "Utility planning", description: "Start list of utilities to transfer/cancel", ai_search_query: null },
    ]
  },
  3: {
    title: "Week 3 — Home Prep Week",
    subtitle: "Make the house buyer-ready with minimal effort.",
    emoji: "🟦",
    items: [
      { id: "w3-1", title: "Painting (if needed)", description: "Find top-rated painters, neutral color guidance", ai_search_query: "top rated painters near me" },
      { id: "w3-2", title: "Junk removal", description: "Same-day or next-day local haulers", ai_search_query: "local junk removal same day near me" },
      { id: "w3-3", title: "Deep cleaning", description: "Kitchen, baths, windows, appliances", ai_search_query: "professional house cleaning near me" },
      { id: "w3-4", title: "Patch & repair checklist", description: "Nail holes, touch-ups, minor fixes", ai_search_query: null },
    ]
  },
  4: {
    title: "Week 4 — Final Move & Close",
    subtitle: "Zero chaos. Zero surprises.",
    emoji: "🟦",
    items: [
      { id: "w4-1", title: "Final packing", description: "Daily mini-checklists so nothing piles up", ai_search_query: null },
      { id: "w4-2", title: "Move-out day guidance", description: "What stays, what leaves, final walkthrough prep", ai_search_query: null },
      { id: "w4-3", title: "Utility transfers", description: "Electric, water, gas, internet", ai_search_query: null },
      { id: "w4-4", title: "Final clean", description: "Quick refresh before buyer walkthrough", ai_search_query: "professional house cleaning near me" },
      { id: "w4-5", title: "Closing day checklist", description: "Keys, garage remotes, peace of mind ✅", ai_search_query: null },
    ]
  }
};

export default function ChecklistPanel({ user }) {
  const currentWeek = user?.current_week || 1;
  const [completedIds, setCompletedIds] = useState(new Set());
  const [skippedIds, setSkippedIds] = useState(new Set());
  const [activeWeek, setActiveWeek] = useState(currentWeek);

  const weekData = WEEK_DATA[activeWeek];
  const items = weekData?.items || [];
  const completed = items.filter(i => completedIds.has(i.id)).length;
  const progress = items.length ? Math.round((completed / items.length) * 100) : 0;

  const handleComplete = (id) => {
    setCompletedIds(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };
  const handleSkip = (id) => {
    setSkippedIds(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col">
      {/* Week tabs */}
      <div className="flex border-b border-[#F3F4F6] overflow-x-auto no-scrollbar">
        {[1, 2, 3, 4].map(w => (
          <button
            key={w}
            onClick={() => setActiveWeek(w)}
            className={`flex-1 min-w-0 py-2.5 px-2 text-xs font-semibold transition-all whitespace-nowrap
              ${activeWeek === w
                ? "text-[#F97316] border-b-2 border-[#F97316]"
                : "text-[#9CA3AF]"}`}
          >
            Wk {w}
          </button>
        ))}
      </div>

      {/* Header */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-sm font-bold text-[#1A1A2E]">{weekData.title}</h2>
          <span className="text-xs font-semibold text-[#4F7EFF]">{progress}%</span>
        </div>
        <p className="text-xs text-[#6B7280] mb-2">{weekData.subtitle}</p>
        <div className="w-full h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, background: "linear-gradient(90deg, #4F7EFF, #7C3AED)" }}
          />
        </div>
        {progress === 100 && (
          <p className="text-xs text-[#059669] font-semibold mt-1.5">🎉 Week {activeWeek} complete! You're ahead of schedule.</p>
        )}
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-2 max-h-80">
        {items.map(item => (
          <ChecklistItemCard
            key={item.id}
            item={item}
            completed={completedIds.has(item.id)}
            skipped={skippedIds.has(item.id)}
            onComplete={() => handleComplete(item.id)}
            onSkip={() => handleSkip(item.id)}
            userAddress={user?.current_address}
          />
        ))}
      </div>
    </div>
  );
}