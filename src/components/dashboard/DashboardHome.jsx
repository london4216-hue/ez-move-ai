import { useState, useEffect } from "react";
import { Phone, Star, CheckCircle2, ChevronRight, Plus, Package, FileText, Camera, User, StickyNote, X, Truck, Trash2, Heart } from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getSavedProvider(key) {
  try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
}

function getOnboardingInventoryCount(userId) {
  try {
    const raw = localStorage.getItem(`mq_${userId}`);
    if (!raw) return 0;
    const { inventory } = JSON.parse(raw);
    if (!inventory) return 0;
    return Object.values(inventory).reduce((sum, room) =>
      sum + Object.values(room || {}).reduce((a, b) => a + b, 0), 0);
  } catch { return 0; }
}

// ─── Progress Ring ────────────────────────────────────────────────────────────

function ProgressRing({ pct, size = 96, stroke = 8 }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#F1F5F9" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="url(#grad)" strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s ease" }} />
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#fbbf24" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// ─── Move Team Card ───────────────────────────────────────────────────────────

function MoveTeamCard({ emoji, label, provider, emptyText }) {
  if (!provider) return (
    <div className="flex-1 bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-3 text-center min-w-0">
      <span className="text-2xl block mb-1">{emoji}</span>
      <p className="text-[10px] text-slate-400 font-semibold leading-tight">{emptyText}</p>
    </div>
  );
  return (
    <div className="flex-1 bg-white border border-slate-100 shadow-sm rounded-2xl p-3 min-w-0">
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="text-lg">{emoji}</span>
        <span className="text-[9px] font-bold text-orange-500 uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-xs font-black text-slate-800 leading-tight truncate">{provider.name}</p>
      <div className="flex items-center gap-1 mt-1">
        <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
        <span className="text-[10px] font-bold text-amber-600">{provider.rating}</span>
      </div>
      {provider.phone && (
        <a href={`tel:${provider.phone}`}
          className="mt-2 flex items-center gap-1 text-[10px] font-bold text-orange-500 bg-orange-50 rounded-lg px-2 py-1">
          <Phone className="w-2.5 h-2.5" />{provider.phone}
        </a>
      )}
      <div className="flex items-center gap-1 mt-1.5">
        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />
        <span className="text-[9px] text-emerald-600 font-bold">Saved to Dashboard</span>
      </div>
    </div>
  );
}

// ─── FAB ─────────────────────────────────────────────────────────────────────

function FAB() {
  const [open, setOpen] = useState(false);
  const actions = [
    { icon: Package, label: "Add item", color: "bg-blue-500" },
    { icon: CheckCircle2, label: "Add task", color: "bg-emerald-500" },
    { icon: StickyNote, label: "Add note", color: "bg-amber-500" },
    { icon: Camera, label: "Add photo", color: "bg-purple-500" },
    { icon: User, label: "Add provider", color: "bg-orange-500" },
  ];

  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={() => setOpen(false)} />}
      <div className="fixed bottom-24 right-4 z-50 flex flex-col items-end gap-2">
        {open && actions.map(({ icon: Icon, label, color }, i) => (
          <div key={label} className="flex items-center gap-2 animate-slide-up" style={{ animationDelay: `${i * 40}ms` }}>
            <span className="bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">{label}</span>
            <button onClick={() => setOpen(false)}
              className={`w-11 h-11 rounded-full ${color} text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform`}>
              <Icon className="w-4 h-4" />
            </button>
          </div>
        ))}
        <button
          onClick={() => setOpen(o => !o)}
          className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white flex items-center justify-center shadow-xl shadow-orange-300 active:scale-95 transition-transform"
        >
          {open ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
        </button>
      </div>
    </>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function DashboardHome({ user, onViewChecklist }) {
  const userId = user?.id || "demo-user";
  const savedMover = getSavedProvider("ez_dashboard_mover");
  const savedJunk = getSavedProvider("ez_dashboard_junk");
  const savedDonation = getSavedProvider("ez_dashboard_donation");
  const inventoryCount = getOnboardingInventoryCount(userId);

  // Compute progress
  const steps = [
    { label: "Inventory", done: inventoryCount > 0 },
    { label: "Mover", done: !!savedMover },
    { label: "Junk Removal", done: !!savedJunk },
    { label: "Donation", done: !!savedDonation },
  ];
  const pct = Math.round((steps.filter(s => s.done).length / steps.length) * 100);

  // Today's priorities
  const priorities = [];
  if (!savedMover) priorities.push({ emoji: "🚛", text: "Select a mover for your move" });
  if (inventoryCount === 0) priorities.push({ emoji: "📦", text: "Review your move inventory" });
  if (!savedJunk) priorities.push({ emoji: "🗑️", text: "Find a junk removal service" });
  if (!savedDonation) priorities.push({ emoji: "♻️", text: "Set up donation pickup" });
  const todayPriorities = priorities.slice(0, 3);

  const hasTeam = savedMover || savedJunk || savedDonation;

  return (
    <div className="space-y-4">

      {/* Progress + Summary */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-shrink-0">
            <ProgressRing pct={pct} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-white">{pct}%</span>
              <span className="text-[9px] text-slate-400 font-bold">done</span>
            </div>
          </div>
          <div className="flex-1">
            <p className="text-white font-black text-base leading-tight">Move Progress</p>
            <p className="text-slate-400 text-xs mt-1 mb-3">
              {pct === 100 ? "You're all set! 🎉" : `${steps.filter(s => !s.done).length} step${steps.filter(s => !s.done).length !== 1 ? "s" : ""} remaining`}
            </p>
            <div className="space-y-1">
              {steps.map(s => (
                <div key={s.label} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full flex-shrink-0 ${s.done ? "bg-emerald-400" : "bg-slate-600"}`}>
                    {s.done && <CheckCircle2 className="w-3 h-3 text-emerald-900" />}
                  </div>
                  <span className={`text-[10px] font-semibold ${s.done ? "text-emerald-400" : "text-slate-400"}`}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Today's Priorities */}
      {todayPriorities.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-50">
            <p className="text-sm font-black text-slate-800">⚡ Today's Priorities</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Focus on these next</p>
          </div>
          <div className="divide-y divide-slate-50">
            {todayPriorities.map((p, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <span className="text-lg">{p.emoji}</span>
                <p className="text-xs font-semibold text-slate-700 flex-1">{p.text}</p>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Move Team */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <p className="text-sm font-black text-slate-800">🤝 Your Move Team</p>
          {!hasTeam && <span className="text-[10px] text-slate-400 font-semibold">Not set up yet</span>}
        </div>
        <div className="flex gap-2">
          <MoveTeamCard emoji="🚛" label="Mover" provider={savedMover} emptyText="No mover saved" />
          <MoveTeamCard emoji="🗑️" label="Junk" provider={savedJunk} emptyText="No junk removal" />
          <MoveTeamCard emoji="♻️" label="Donation" provider={savedDonation} emptyText="No donation center" />
        </div>
      </div>

      {/* Inventory summary */}
      {inventoryCount > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-4 py-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
            <Package className="w-5 h-5 text-blue-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-black text-slate-800">Move Inventory</p>
            <p className="text-xs text-slate-500">{inventoryCount} items ready to move</p>
          </div>
          <span className="text-lg font-black text-blue-600">{inventoryCount}</span>
        </div>
      )}

      {/* Upcoming tasks teaser */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-50 flex items-center justify-between">
          <p className="text-sm font-black text-slate-800">📅 Upcoming Tasks</p>
          <button onClick={onViewChecklist} className="text-[10px] font-bold text-orange-500">View Full Timeline →</button>
        </div>
        <div className="divide-y divide-slate-50">
          {[
            { emoji: "📋", text: "Complete move checklist", tag: "Week 1" },
            { emoji: "📞", text: "Contact selected mover", tag: savedMover ? "Ready" : "Set up mover first" },
            { emoji: "🏠", text: "Confirm new address details", tag: "Soon" },
          ].map((t, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3">
              <span className="text-base">{t.emoji}</span>
              <p className="text-xs font-semibold text-slate-700 flex-1">{t.text}</p>
              <span className="text-[9px] font-bold text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full">{t.tag}</span>
            </div>
          ))}
        </div>
      </div>

      <FAB />
    </div>
  );
}