import { useState } from "react";
import { Sparkles, Phone, BookmarkPlus, Check, Loader2, ChevronDown, ChevronUp, MapPin, Package, Clock, DollarSign, FileCheck, FileText } from "lucide-react";
import { base44 } from "@/api/base44Client";

// ── Shared provider card ─────────────────────────────────────────────────────
function ProviderCard({ provider, onSave, saved }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-4 py-3 flex items-start gap-3">
      <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0 text-xl">
        {provider.emoji || "🏢"}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-black text-slate-800">{provider.name}</p>
        {provider.description && <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">{provider.description}</p>}
        {provider.rating && <p className="text-[10px] text-orange-500 font-bold mt-0.5">⭐ {provider.rating}</p>}
        <div className="flex items-center gap-2 mt-2">
          {provider.phone && (
            <a href={`tel:${provider.phone}`} className="flex items-center gap-1 text-[10px] font-bold text-orange-500 bg-orange-50 px-2.5 py-1 rounded-xl">
              <Phone className="w-3 h-3" /> {provider.phone}
            </a>
          )}
          <button
            onClick={() => onSave(provider)}
            disabled={saved}
            className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-xl transition-all ${
              saved ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-600 active:scale-95"
            }`}
          >
            {saved ? <><Check className="w-3 h-3" /> Saved</> : <><BookmarkPlus className="w-3 h-3" /> Save</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── 1. Movers ─────────────────────────────────────────────────────────────────
function MoversCard({ user }) {
  const [loading, setLoading] = useState(false);
  const [movers, setMovers] = useState([]);
  const [savedIds, setSavedIds] = useState(new Set());
  const [fetched, setFetched] = useState(false);

  const find = async () => {
    setLoading(true);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Find 3 real top-rated local moving companies near: ${user?.home_address || "my area"}. Include name, phone, rating (e.g. 4.8/5), and a 1-line description.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          providers: { type: "array", items: { type: "object", properties: {
            name: { type: "string" }, phone: { type: "string" },
            rating: { type: "string" }, description: { type: "string" }
          }}}
        }
      }
    });
    setMovers((res.providers || []).map(p => ({ ...p, emoji: "🚛" })));
    setFetched(true);
    setLoading(false);
  };

  const save = async (p) => {
    await base44.entities.SavedProvider.create({ user_id: user?.id, name: p.name, role: "Movers", phone: p.phone, rating: p.rating });
    setSavedIds(s => new Set([...s, p.name]));
  };

  return (
    <ToolShell emoji="🚛" title="Find Local Movers" tagline="Top-rated movers near your home" color="blue" onGenerate={find} loading={loading} fetched={fetched}>
      {movers.map(p => <ProviderCard key={p.name} provider={p} onSave={save} saved={savedIds.has(p.name)} />)}
    </ToolShell>
  );
}

// ── 2. Junk Removal ───────────────────────────────────────────────────────────
function JunkCard({ user }) {
  const [loading, setLoading] = useState(false);
  const [providers, setProviders] = useState([]);
  const [savedIds, setSavedIds] = useState(new Set());
  const [fetched, setFetched] = useState(false);

  const find = async () => {
    setLoading(true);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Find 3 real local junk removal or hauling companies near: ${user?.home_address || "my area"}. Include name, phone, rating, and a 1-line description.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          providers: { type: "array", items: { type: "object", properties: {
            name: { type: "string" }, phone: { type: "string" },
            rating: { type: "string" }, description: { type: "string" }
          }}}
        }
      }
    });
    setProviders((res.providers || []).map(p => ({ ...p, emoji: "🗑️" })));
    setFetched(true);
    setLoading(false);
  };

  const save = async (p) => {
    await base44.entities.SavedProvider.create({ user_id: user?.id, name: p.name, role: "Junk Removal", phone: p.phone, rating: p.rating });
    setSavedIds(s => new Set([...s, p.name]));
  };

  return (
    <ToolShell emoji="🗑️" title="Junk Removal" tagline="Haul it away before move day" color="red" onGenerate={find} loading={loading} fetched={fetched}>
      {providers.map(p => <ProviderCard key={p.name} provider={p} onSave={save} saved={savedIds.has(p.name)} />)}
    </ToolShell>
  );
}

// ── 3. Donation Centers ───────────────────────────────────────────────────────
function DonationCard({ user }) {
  const [loading, setLoading] = useState(false);
  const [providers, setProviders] = useState([]);
  const [savedIds, setSavedIds] = useState(new Set());
  const [fetched, setFetched] = useState(false);

  const find = async () => {
    setLoading(true);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Find 3 real local furniture donation centers or pickup services near: ${user?.home_address || "my area"}. Include name, phone, rating, and a 1-line description.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          providers: { type: "array", items: { type: "object", properties: {
            name: { type: "string" }, phone: { type: "string" },
            rating: { type: "string" }, description: { type: "string" }
          }}}
        }
      }
    });
    setProviders((res.providers || []).map(p => ({ ...p, emoji: "🫶" })));
    setFetched(true);
    setLoading(false);
  };

  const save = async (p) => {
    await base44.entities.SavedProvider.create({ user_id: user?.id, name: p.name, role: "Donation", phone: p.phone, rating: p.rating });
    setSavedIds(s => new Set([...s, p.name]));
  };

  return (
    <ToolShell emoji="🫶" title="Donation Centers" tagline="Find pickup near you" color="emerald" onGenerate={find} loading={loading} fetched={fetched}>
      {providers.map(p => <ProviderCard key={p.name} provider={p} onSave={save} saved={savedIds.has(p.name)} />)}
    </ToolShell>
  );
}

// ── 4. Packing Supplies Calculator (embedded, real interactive) ───────────────
function PackingCalc({ user }) {
  const [rooms, setRooms] = useState({ bedrooms: 2, bathrooms: 1, living: 1, garage: 0 });
  const [open, setOpen] = useState(false);

  const total_rooms = rooms.bedrooms + rooms.bathrooms + rooms.living + (rooms.garage ? 1 : 0);
  const small = Math.ceil(total_rooms * 8 + rooms.bathrooms * 4);
  const medium = Math.ceil(rooms.bedrooms * 6 + rooms.living * 4);
  const large = Math.ceil(rooms.bedrooms * 2 + (rooms.garage ? 8 : 0));
  const tape = Math.ceil((small + medium + large) / 15);
  const paper = Math.ceil((small + medium) * 2);
  const bubble = Math.ceil(rooms.bedrooms * 10 + rooms.living * 5);

  const supplies = [
    { label: "Small Boxes", qty: small, unit: "boxes", emoji: "📦" },
    { label: "Medium Boxes", qty: medium, unit: "boxes", emoji: "📦" },
    { label: "Large Boxes", qty: large, unit: "boxes", emoji: "📦" },
    { label: "Packing Tape", qty: tape, unit: "rolls", emoji: "🎁" },
    { label: "Packing Paper", qty: paper, unit: "sheets", emoji: "📄" },
    { label: "Bubble Wrap", qty: bubble, unit: "ft", emoji: "🫧" },
  ];

  const RoomStepper = ({ label, val, key2 }) => (
    <div className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
      <p className="text-xs font-semibold text-slate-600">{label}</p>
      <div className="flex items-center gap-3">
        <button onClick={() => setRooms(r => ({ ...r, [key2]: Math.max(0, r[key2] - 1) }))}
          className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 font-bold text-sm flex items-center justify-center active:scale-95">−</button>
        <span className="text-sm font-black text-slate-800 w-4 text-center">{val}</span>
        <button onClick={() => setRooms(r => ({ ...r, [key2]: r[key2] + 1 }))}
          className="w-7 h-7 rounded-full bg-orange-500 text-white font-bold text-sm flex items-center justify-center active:scale-95">+</button>
      </div>
    </div>
  );

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(v => !v)} className="w-full px-4 py-3.5 flex items-center gap-3 text-left">
        <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
          <Package className="w-4 h-4 text-amber-600" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-black text-slate-800">📦 Packing Supplies Calculator</p>
          <p className="text-[10px] text-slate-500">Exactly what you need — interactive</p>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3">
          {/* Room stepper */}
          <div className="bg-white rounded-2xl border border-slate-100 px-4 py-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 mt-1">Your Home</p>
            <RoomStepper label="Bedrooms" val={rooms.bedrooms} key2="bedrooms" />
            <RoomStepper label="Bathrooms" val={rooms.bathrooms} key2="bathrooms" />
            <RoomStepper label="Living / Dining Rooms" val={rooms.living} key2="living" />
            <RoomStepper label="Garage / Storage" val={rooms.garage} key2="garage" />
          </div>

          {/* Results */}
          <div className="bg-white rounded-2xl border border-amber-100 overflow-hidden">
            <div className="bg-amber-500 px-4 py-2">
              <p className="text-white text-xs font-bold">Your Supply List</p>
            </div>
            <div className="divide-y divide-slate-50">
              {supplies.map(s => (
                <div key={s.label} className="flex items-center justify-between px-4 py-2.5">
                  <p className="text-xs font-semibold text-slate-700">{s.emoji} {s.label}</p>
                  <span className="text-sm font-black text-amber-600">{s.qty} <span className="text-xs font-normal text-slate-400">{s.unit}</span></span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-[10px] text-slate-400 text-center">Estimates based on average room sizes. Add 15% buffer.</p>
        </div>
      )}
    </div>
  );
}

// ── 5. Moving Budget Calculator (embedded) ────────────────────────────────────
function BudgetCalc() {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState({ movers: 3500, supplies: 300, storage: 0, cleaning: 250, misc: 200, tips: 100 });

  const set = (k, v) => setValues(p => ({ ...p, [k]: Number(v) || 0 }));
  const total = Object.values(values).reduce((s, v) => s + v, 0);

  const items = [
    { key: "movers", label: "Professional Movers", emoji: "🚛", placeholder: "3500" },
    { key: "supplies", label: "Packing Supplies", emoji: "📦", placeholder: "300" },
    { key: "storage", label: "Storage (if needed)", emoji: "🏠", placeholder: "0" },
    { key: "cleaning", label: "Cleaning Services", emoji: "🧹", placeholder: "250" },
    { key: "tips", label: "Tips for Movers", emoji: "💵", placeholder: "100" },
    { key: "misc", label: "Miscellaneous", emoji: "✨", placeholder: "200" },
  ];

  return (
    <div className="bg-red-50 border border-red-200 rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(v => !v)} className="w-full px-4 py-3.5 flex items-center gap-3 text-left">
        <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
          <DollarSign className="w-4 h-4 text-red-600" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-black text-slate-800">💰 Moving Budget Calculator</p>
          <p className="text-[10px] text-slate-500">Build your real budget, line by line</p>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3">
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            {items.map(item => (
              <div key={item.key} className="flex items-center gap-3 px-4 py-2.5 border-b border-slate-50 last:border-0">
                <span className="text-base w-6">{item.emoji}</span>
                <p className="text-xs font-semibold text-slate-700 flex-1">{item.label}</p>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-slate-400">$</span>
                  <input
                    type="number"
                    value={values[item.key]}
                    onChange={e => set(item.key, e.target.value)}
                    placeholder={item.placeholder}
                    className="w-20 text-right text-sm font-bold text-slate-800 border border-slate-200 rounded-xl px-2 py-1 focus:outline-none focus:border-orange-400"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="bg-red-500 rounded-2xl px-4 py-3 flex items-center justify-between">
            <p className="text-white font-bold text-sm">Total Estimated Cost</p>
            <p className="text-white font-black text-xl">${total.toLocaleString()}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── 6. Packing Timeline ────────────────────────────────────────────────────────
function TimelineCard({ user }) {
  const [loading, setLoading] = useState(false);
  const [weeks, setWeeks] = useState([]);
  const [fetched, setFetched] = useState(false);
  const [open, setOpen] = useState(false);

  const generate = async () => {
    setLoading(true);
    const closeDate = user?.estimated_close_date || "4 weeks from now";
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Create a 4-week packing timeline for a home move with closing date: ${closeDate}. For each week, give a short title and exactly 3 specific tasks to complete that week. Return 4 weeks.`,
      response_json_schema: {
        type: "object",
        properties: {
          weeks: { type: "array", items: { type: "object", properties: {
            week: { type: "number" },
            title: { type: "string" },
            tasks: { type: "array", items: { type: "string" } }
          }}}
        }
      }
    });
    setWeeks(res.weeks || []);
    setFetched(true);
    setOpen(true);
    setLoading(false);
  };

  return (
    <div className="bg-orange-50 border border-orange-200 rounded-2xl overflow-hidden">
      <button onClick={() => fetched && setOpen(v => !v)} className="w-full px-4 py-3.5 flex items-center gap-3 text-left">
        <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
          <Clock className="w-4 h-4 text-orange-600" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-black text-slate-800">🗓️ Packing Timeline</p>
          <p className="text-[10px] text-slate-500">Week-by-week plan to your closing date</p>
        </div>
        {fetched ? (open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />) : null}
      </button>

      <div className="px-4 pb-4">
        {!fetched && (
          <button onClick={generate} disabled={loading}
            className="w-full py-3 rounded-xl bg-orange-500 text-white text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-60">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Building your timeline…</> : <><Sparkles className="w-4 h-4" /> Generate My Timeline</>}
          </button>
        )}

        {fetched && open && (
          <div className="space-y-2 mt-1">
            {weeks.map((w, i) => (
              <div key={i} className="bg-white rounded-2xl border border-orange-100 overflow-hidden">
                <div className="bg-orange-500 px-4 py-2 flex items-center gap-2">
                  <span className="text-white text-xs font-black">Week {w.week}</span>
                  <span className="text-orange-100 text-[10px]">— {w.title}</span>
                </div>
                <div className="px-4 py-2.5 space-y-1.5">
                  {(w.tasks || []).map((task, j) => (
                    <div key={j} className="flex items-start gap-2">
                      <div className="w-4 h-4 rounded-full bg-orange-100 flex items-center justify-center mt-0.5 shrink-0">
                        <span className="text-[8px] font-black text-orange-600">{j + 1}</span>
                      </div>
                      <p className="text-[11px] text-slate-700">{task}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── 7. Documents Checklist ─────────────────────────────────────────────────────
function DocumentsCard({ user }) {
  const [loading, setLoading] = useState(false);
  const [docs, setDocs] = useState([]);
  const [checked, setChecked] = useState(new Set());
  const [fetched, setFetched] = useState(false);
  const [open, setOpen] = useState(false);

  const generate = async () => {
    setLoading(true);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: "Generate a checklist of 12 important documents a homeowner should gather before closing on a home sale. Each item should be a short label (max 6 words).",
      response_json_schema: {
        type: "object",
        properties: {
          documents: { type: "array", items: { type: "string" } }
        }
      }
    });
    setDocs(res.documents || []);
    setFetched(true);
    setOpen(true);
    setLoading(false);
  };

  const toggle = (doc) => setChecked(s => { const n = new Set(s); n.has(doc) ? n.delete(doc) : n.add(doc); return n; });
  const progress = docs.length ? Math.round((checked.size / docs.length) * 100) : 0;

  return (
    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl overflow-hidden">
      <button onClick={() => fetched && setOpen(v => !v)} className="w-full px-4 py-3.5 flex items-center gap-3 text-left">
        <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
          <FileCheck className="w-4 h-4 text-emerald-600" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-black text-slate-800">📄 Documents Checklist</p>
          <p className="text-[10px] text-slate-500">
            {fetched ? `${checked.size}/${docs.length} gathered (${progress}%)` : "Don't forget the paperwork"}
          </p>
        </div>
        {fetched ? (open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />) : null}
      </button>

      <div className="px-4 pb-4">
        {!fetched && (
          <button onClick={generate} disabled={loading}
            className="w-full py-3 rounded-xl bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-60">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Loading checklist…</> : <><Sparkles className="w-4 h-4" /> Build My Checklist</>}
          </button>
        )}

        {fetched && open && (
          <div className="space-y-2">
            {docs.length > 0 && (
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-3">
                <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
            )}
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden divide-y divide-slate-50">
              {docs.map((doc, i) => (
                <button key={i} onClick={() => toggle(doc)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left active:bg-slate-50 transition-colors">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    checked.has(doc) ? "bg-emerald-500 border-emerald-500" : "border-slate-300"
                  }`}>
                    {checked.has(doc) && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <p className={`text-xs font-semibold transition-all ${checked.has(doc) ? "line-through text-slate-400" : "text-slate-700"}`}>{doc}</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Shared shell for provider-type tools ──────────────────────────────────────
function ToolShell({ emoji, title, tagline, color, onGenerate, loading, fetched, children }) {
  const [open, setOpen] = useState(false);
  const colorMap = {
    blue: { bg: "bg-blue-50", border: "border-blue-200", icon: "bg-blue-100 text-blue-600", btn: "bg-blue-500" },
    red: { bg: "bg-red-50", border: "border-red-200", icon: "bg-red-100 text-red-600", btn: "bg-red-500" },
    emerald: { bg: "bg-emerald-50", border: "border-emerald-200", icon: "bg-emerald-100 text-emerald-600", btn: "bg-emerald-500" },
  };
  const c = colorMap[color] || colorMap.blue;

  const handleHeaderClick = () => {
    if (fetched) setOpen(v => !v);
  };

  return (
    <div className={`${c.bg} border ${c.border} rounded-2xl overflow-hidden`}>
      <button onClick={handleHeaderClick} className="w-full px-4 py-3.5 flex items-center gap-3 text-left">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${c.icon}`}>
          <span className="text-lg">{emoji}</span>
        </div>
        <div className="flex-1">
          <p className="text-xs font-black text-slate-800">{emoji} {title}</p>
          <p className="text-[10px] text-slate-500">{tagline}</p>
        </div>
        {fetched ? (open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />) : null}
      </button>

      <div className="px-4 pb-4">
        {!fetched && (
          <button onClick={() => { onGenerate(); setOpen(true); }} disabled={loading}
            className={`w-full py-3 rounded-xl ${c.btn} text-white text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-60`}>
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Finding near you…</> : <><Sparkles className="w-4 h-4" /> Find Top 3 Near Me</>}
          </button>
        )}
        {fetched && open && <div className="space-y-2 mt-1">{children}</div>}
      </div>
    </div>
  );
}

// ── 8. Perfect Final Walkthrough ─────────────────────────────────────────────
function WalkthroughCard({ user }) {
  const [loading, setLoading] = useState(false);
  const [sections, setSections] = useState([]);
  const [checked, setChecked] = useState(new Set());
  const [fetched, setFetched] = useState(false);
  const [open, setOpen] = useState(false);

  const generate = async () => {
    setLoading(true);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate a comprehensive "Perfect Final Walkthrough" checklist for a home buyer doing their last walkthrough before closing. Organize into 5 sections: Exterior, Kitchen, Bathrooms, Bedrooms & Living Areas, and Systems & Utilities. Each section should have 4-5 specific inspection items the buyer must verify. Items should be actionable (e.g. "Test all light switches", "Run garbage disposal", "Check for cracks in walls"). This checklist should help them catch any issues before signing.`,
      response_json_schema: {
        type: "object",
        properties: {
          sections: { type: "array", items: { type: "object", properties: {
            title: { type: "string" },
            emoji: { type: "string" },
            items: { type: "array", items: { type: "string" } }
          }}}
        }
      }
    });
    setSections(res.sections || []);
    setFetched(true);
    setOpen(true);
    setLoading(false);
  };

  const toggle = (key) => setChecked(s => { const n = new Set(s); n.has(key) ? n.delete(key) : n.add(key); return n; });
  const totalItems = sections.reduce((sum, s) => sum + s.items.length, 0);
  const progress = totalItems ? Math.round((checked.size / totalItems) * 100) : 0;

  return (
    <div className="bg-violet-50 border border-violet-200 rounded-2xl overflow-hidden">
      <button onClick={() => fetched && setOpen(v => !v)} className="w-full px-4 py-3.5 flex items-center gap-3 text-left">
        <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
          <span className="text-lg">🏠</span>
        </div>
        <div className="flex-1">
          <p className="text-xs font-black text-slate-800">🏠 Perfect Final Walkthrough</p>
          <p className="text-[10px] text-slate-500">
            {fetched ? `${checked.size}/${totalItems} items verified (${progress}%)` : "Nail your last walkthrough before closing"}
          </p>
        </div>
        {fetched && (open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />)}
      </button>

      <div className="px-4 pb-4">
        {!fetched && (
          <>
            <div className="bg-white border border-violet-100 rounded-2xl p-3 mb-3">
              <p className="text-[11px] text-slate-600 leading-relaxed">
                <span className="font-bold text-violet-600">Why this matters:</span> Your final walkthrough is your last chance to verify repairs were completed, appliances work, and nothing was damaged during the seller's move-out — before you sign.
              </p>
            </div>
            <button onClick={generate} disabled={loading}
              className="w-full py-3 rounded-xl bg-violet-500 text-white text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Building checklist…</> : <><Sparkles className="w-4 h-4" /> Build My Walkthrough Checklist</>}
            </button>
          </>
        )}

        {fetched && open && (
          <div className="space-y-3 mt-1">
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-violet-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
            {progress === 100 && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <p className="text-xs font-bold text-emerald-700">All items verified — you're ready to close! 🎉</p>
              </div>
            )}
            {sections.map((section, si) => (
              <div key={si} className="bg-white rounded-2xl border border-violet-100 overflow-hidden">
                <div className="bg-violet-500 px-4 py-2 flex items-center gap-2">
                  <span className="text-white text-sm">{section.emoji}</span>
                  <span className="text-white text-xs font-black">{section.title}</span>
                  <span className="text-violet-200 text-[10px] ml-auto">{section.items.filter(item => checked.has(`${si}-${item}`)).length}/{section.items.length}</span>
                </div>
                <div className="divide-y divide-slate-50">
                  {(section.items || []).map((item, ii) => {
                    const key = `${si}-${item}`;
                    return (
                      <button key={ii} onClick={() => toggle(key)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left active:bg-slate-50 transition-colors">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          checked.has(key) ? "bg-violet-500 border-violet-500" : "border-slate-300"
                        }`}>
                          {checked.has(key) && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <p className={`text-xs font-semibold transition-all ${checked.has(key) ? "line-through text-slate-400" : "text-slate-700"}`}>{item}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── 9. Amazon Supplies List ────────────────────────────────────────────────────
function AmazonSuppliesCard() {
  const [open, setOpen] = useState(false);
  const [rooms, setRooms] = useState({ bedrooms: 2, bathrooms: 1, living: 1, garage: 0 });
  const [copied, setCopied] = useState(false);

  const total_rooms = rooms.bedrooms + rooms.bathrooms + rooms.living + (rooms.garage ? 1 : 0);
  const small = Math.ceil(total_rooms * 8 + rooms.bathrooms * 4);
  const medium = Math.ceil(rooms.bedrooms * 6 + rooms.living * 4);
  const large = Math.ceil(rooms.bedrooms * 2 + (rooms.garage ? 8 : 0));
  const tape = Math.ceil((small + medium + large) / 15);
  const bubble = Math.ceil(rooms.bedrooms * 10 + rooms.living * 5);

  const supplies = [
    { label: "Moving Boxes Variety Pack", qty: small, size: "small", amazon: "moving boxes small" },
    { label: "Medium Moving Boxes", qty: medium, size: "medium", amazon: "medium cardboard boxes" },
    { label: "Large Moving Boxes", qty: large, size: "large", amazon: "large moving boxes" },
    { label: "Packing Tape", qty: tape, size: "rolls", amazon: "heavy duty packing tape rolls" },
    { label: "Bubble Wrap", qty: bubble, size: "feet", amazon: "bubble wrap roll" },
  ];

  const generateAmazonList = () => {
    const params = supplies.map(s => `${s.qty}x ${s.label}`).join(" | ");
    const amazonUrl = `https://www.amazon.com/s?k=${encodeURIComponent(supplies[0].amazon)}`;
    window.open(amazonUrl, "_blank");
  };

  const copyToClipboard = () => {
    const listText = supplies.map(s => `${s.qty}x ${s.label}`).join("\n");
    navigator.clipboard.writeText(listText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(v => !v)} className="w-full px-4 py-3.5 flex items-center gap-3 text-left">
        <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
          <Package className="w-4 h-4 text-blue-600" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-black text-slate-800">🛒 Amazon Supplies List</p>
          <p className="text-[10px] text-slate-500">Build your shopping list from calculations</p>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3">
          {/* Room stepper */}
          <div className="bg-white rounded-2xl border border-slate-100 px-4 py-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 mt-1">Your Home</p>
            {[
              { label: "Bedrooms", key: "bedrooms", val: rooms.bedrooms },
              { label: "Bathrooms", key: "bathrooms", val: rooms.bathrooms },
              { label: "Living / Dining", key: "living", val: rooms.living },
              { label: "Garage / Storage", key: "garage", val: rooms.garage }
            ].map(r => (
              <div key={r.key} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <p className="text-xs font-semibold text-slate-600">{r.label}</p>
                <div className="flex items-center gap-3">
                  <button onClick={() => setRooms(prev => ({ ...prev, [r.key]: Math.max(0, prev[r.key] - 1) }))}
                    className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 font-bold text-sm flex items-center justify-center">−</button>
                  <span className="text-sm font-black text-slate-800 w-4 text-center">{r.val}</span>
                  <button onClick={() => setRooms(prev => ({ ...prev, [r.key]: prev[r.key] + 1 }))}
                    className="w-7 h-7 rounded-full bg-blue-500 text-white font-bold text-sm flex items-center justify-center">+</button>
                </div>
              </div>
            ))}
          </div>

          {/* Supplies List */}
          <div className="bg-white rounded-2xl border border-blue-100 overflow-hidden">
            <div className="bg-blue-500 px-4 py-2">
              <p className="text-white text-xs font-bold">📋 Your Supply Quantities</p>
            </div>
            <div className="divide-y divide-slate-50">
              {supplies.map(s => (
                <div key={s.label} className="flex items-center justify-between px-4 py-2.5">
                  <p className="text-xs font-semibold text-slate-700">{s.label}</p>
                  <span className="text-sm font-black text-blue-600">{s.qty} {s.size}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button onClick={copyToClipboard} className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center gap-2">
              {copied ? "✓ Copied" : "📋 Copy List"}
            </button>
            <button onClick={generateAmazonList} className="flex-1 py-3 rounded-xl bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2">
              🛍️ Shop Amazon
            </button>
          </div>
          <p className="text-[10px] text-slate-400 text-center">Add items individually from Amazon search</p>
        </div>
      )}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function AIMoveAssist({ user }) {
  return (
    <div className="space-y-3">
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl px-4 py-4 border border-slate-200">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-orange-500" />
          <p className="font-black text-slate-800 text-base">AI Move Assist</p>
        </div>
        <p className="text-slate-500 text-xs">Real tools. Tap any to get started.</p>
      </div>

      <MoversCard user={user} />
      <JunkCard user={user} />
      <DonationCard user={user} />
      <PackingCalc user={user} />
      <AmazonSuppliesCard />
      <BudgetCalc />
      <TimelineCard user={user} />
      <DocumentsCard user={user} />
      <WalkthroughCard user={user} />
    </div>
  );
}