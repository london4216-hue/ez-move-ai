import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Phone, Mail, Star, Plus, Trash2, Loader2, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { format, parseISO } from "date-fns";

const SERVICE_EMOJIS = {
  Movers: "🚛", Cleaners: "✨", Painters: "🎨", "Junk Removal": "🗑️",
  "Estate Sale": "🏷️", Lender: "🏦", Agent: "🏠", Escrow: "📋", default: "📋"
};

const AI_SERVICES = [
  { id: "movers", label: "Local Movers", emoji: "🚛", query: "top rated local moving companies" },
  { id: "junk", label: "Junk Removal", emoji: "🗑️", query: "junk removal same day near" },
  { id: "donate", label: "Donation Centers", emoji: "🫶", query: "furniture donation pickup near" },
  { id: "cleaners", label: "House Cleaners", emoji: "✨", query: "professional house cleaning near" },
];

export default function MyStuffTab({ user }) {
  const [providers, setProviders] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("providers");

  // Add provider form
  const [showAddProvider, setShowAddProvider] = useState(false);
  const [newProvider, setNewProvider] = useState({ name: "", role: "", phone: "" });
  const [saving, setSaving] = useState(false);

  // AI finder
  const [aiService, setAiService] = useState(null);
  const [aiResults, setAiResults] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [showAI, setShowAI] = useState(false);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      base44.entities.SavedProvider.filter({ user_id: user.id }),
      base44.entities.Appointment.filter({ user_id: user.id }),
    ]).then(([provs, appts]) => {
      setProviders(provs);
      setAppointments(appts.sort((a, b) => new Date(a.date) - new Date(b.date)));
      setLoading(false);
    });
  }, [user]);

  const handleAddProvider = async () => {
    if (!newProvider.name.trim()) return;
    setSaving(true);
    const p = await base44.entities.SavedProvider.create({ ...newProvider, user_id: user.id });
    setProviders(prev => [...prev, p]);
    setNewProvider({ name: "", role: "", phone: "" });
    setShowAddProvider(false);
    setSaving(false);
  };

  const handleDeleteProvider = async (id) => {
    await base44.entities.SavedProvider.delete(id);
    setProviders(prev => prev.filter(p => p.id !== id));
  };

  const handleSaveFromAI = async (r) => {
    const p = await base44.entities.SavedProvider.create({
      user_id: user.id, name: r.name, role: aiService?.label || "Service Provider", phone: r.phone || ""
    });
    setProviders(prev => [...prev, p]);
  };

  const findServices = async (svc) => {
    setAiService(svc);
    setAiLoading(true);
    setAiResults([]);
    const loc = user?.home_address || "my area";
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Find 4 real ${svc.query} in: ${loc}. Include name, phone, and a short 1-line description.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          providers: { type: "array", items: { type: "object", properties: { name: { type: "string" }, phone: { type: "string" }, description: { type: "string" } } } }
        }
      }
    });
    setAiResults(res.providers || []);
    setAiLoading(false);
  };

  if (loading) return (
    <div className="flex justify-center py-16">
      <div className="w-7 h-7 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const bookedAppts = appointments.filter(a => a.status === "scheduled");
  const today = new Date();

  return (
    <div className="space-y-3">

      {/* Section toggle */}
      <div className="flex bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100">
        {[
          { id: "providers", label: `Providers (${providers.length})` },
          { id: "appointments", label: `Booked (${bookedAppts.length})` },
        ].map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`flex-1 py-2.5 text-[11px] font-bold transition-all
              ${activeSection === s.id ? "bg-orange-500 text-white" : "text-slate-400"}`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* PROVIDERS SECTION */}
      {activeSection === "providers" && (
        <>
          {/* Saved providers list */}
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="px-4 py-2.5 flex items-center justify-between border-b border-slate-50">
              <p className="text-xs font-bold text-slate-700">📋 My Service Providers</p>
              <button
                onClick={() => setShowAddProvider(v => !v)}
                className="flex items-center gap-1 text-[10px] text-orange-500 font-bold"
              >
                <Plus className="w-3 h-3" /> Add
              </button>
            </div>

            {showAddProvider && (
              <div className="px-3 py-3 border-b border-slate-50 bg-slate-50 space-y-2">
                <input
                  value={newProvider.name}
                  onChange={e => setNewProvider(p => ({ ...p, name: e.target.value }))}
                  placeholder="Provider name *"
                  className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-orange-400 bg-white"
                />
                <div className="flex gap-2">
                  <input
                    value={newProvider.role}
                    onChange={e => setNewProvider(p => ({ ...p, role: e.target.value }))}
                    placeholder="Role (Movers, Cleaners…)"
                    className="flex-1 text-xs border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-orange-400 bg-white"
                  />
                  <input
                    value={newProvider.phone}
                    onChange={e => setNewProvider(p => ({ ...p, phone: e.target.value }))}
                    placeholder="Phone"
                    className="flex-1 text-xs border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-orange-400 bg-white"
                  />
                </div>
                <div className="flex gap-2">
                  <button onClick={handleAddProvider} disabled={saving}
                    className="flex-1 py-2 rounded-xl bg-orange-500 text-white text-xs font-bold flex items-center justify-center gap-1">
                    {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : "Save"}
                  </button>
                  <button onClick={() => setShowAddProvider(false)}
                    className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-500 text-xs font-bold">Cancel</button>
                </div>
              </div>
            )}

            {providers.length === 0 && !showAddProvider ? (
              <p className="px-4 py-4 text-xs text-slate-400">No providers saved yet. Add one above or use AI Finder below.</p>
            ) : (
              <div className="divide-y divide-slate-50">
                {providers.map(p => (
                  <div key={p.id} className="flex items-center gap-3 px-4 py-2.5">
                    <span className="text-lg flex-shrink-0">{SERVICE_EMOJIS[p.role] || SERVICE_EMOJIS.default}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{p.name}</p>
                      <p className="text-[10px] text-orange-500 font-semibold">{p.role || "Provider"}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {p.rating && (
                        <div className="flex items-center gap-0.5">
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          <span className="text-[10px] font-bold text-amber-700">{p.rating}</span>
                        </div>
                      )}
                      {p.phone && (
                        <a href={`tel:${p.phone}`} className="w-7 h-7 rounded-full bg-green-50 flex items-center justify-center">
                          <Phone className="w-3.5 h-3.5 text-green-600" />
                        </a>
                      )}
                      <button onClick={() => handleDeleteProvider(p.id)}
                        className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center">
                        <Trash2 className="w-3 h-3 text-slate-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Finder */}
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <button
              onClick={() => setShowAI(v => !v)}
              className="w-full px-4 py-2.5 flex items-center justify-between border-b border-slate-50"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-orange-500" />
                <p className="text-xs font-bold text-slate-700">AI Service Finder</p>
              </div>
              {showAI ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>

            {showAI && (
              <>
                <div className="flex border-b border-slate-100">
                  {AI_SERVICES.map(s => (
                    <button
                      key={s.id}
                      onClick={() => findServices(s)}
                      className={`flex-1 py-2.5 flex flex-col items-center gap-0.5 text-[9px] font-bold transition-all
                        ${aiService?.id === s.id ? "bg-orange-50 text-orange-600 border-b-2 border-orange-500" : "text-slate-400"}`}
                    >
                      <span className="text-base">{s.emoji}</span>
                      {s.label}
                    </button>
                  ))}
                </div>
                <div className="px-3 py-3 min-h-[50px]">
                  {aiLoading && (
                    <div className="flex items-center justify-center gap-2 py-4">
                      <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
                      <span className="text-xs text-slate-400">Finding local services…</span>
                    </div>
                  )}
                  {!aiLoading && !aiService && (
                    <p className="text-[10px] text-slate-400 text-center py-3">Tap a category to find local providers near you</p>
                  )}
                  {!aiLoading && aiResults.map((r, i) => {
                    const alreadySaved = providers.some(p => p.name === r.name);
                    return (
                      <div key={i} className="flex items-start gap-3 py-2 border-b border-slate-50 last:border-0">
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-bold text-slate-800">{r.name}</p>
                          {r.description && <p className="text-[9px] text-slate-400 mt-0.5">{r.description}</p>}
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {r.phone && (
                            <a href={`tel:${r.phone}`} className="text-[10px] font-bold text-green-600 flex items-center gap-0.5">
                              <Phone className="w-3 h-3" />{r.phone}
                            </a>
                          )}
                          <button
                            onClick={() => handleSaveFromAI(r)}
                            disabled={alreadySaved}
                            className={`text-[9px] font-bold px-2 py-1 rounded-lg transition-all
                              ${alreadySaved ? "bg-slate-100 text-slate-400" : "bg-orange-100 text-orange-600"}`}
                          >
                            {alreadySaved ? "Saved" : "+ Save"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </>
      )}

      {/* BOOKED APPOINTMENTS SECTION */}
      {activeSection === "appointments" && (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="px-4 py-2.5 border-b border-slate-50">
            <p className="text-xs font-bold text-slate-700">📅 All Booked Dates</p>
          </div>
          {appointments.length === 0 ? (
            <p className="px-4 py-4 text-xs text-slate-400">No appointments yet. Add them in the Calendar tab.</p>
          ) : (
            <div className="divide-y divide-slate-50">
              {appointments.map(a => {
                const isPast = new Date(a.date) < today && a.status !== "completed";
                const isCompleted = a.status === "completed";
                return (
                  <div key={a.id} className={`flex items-center gap-3 px-4 py-3 ${isPast ? "opacity-60" : ""}`}>
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-sm
                      ${isCompleted ? "bg-green-100" : isPast ? "bg-red-50" : "bg-orange-50"}`}>
                      {isCompleted ? "✅" : isPast ? "⚠️" : "📅"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{a.title}</p>
                      <p className="text-[10px] text-slate-400">
                        {format(parseISO(a.date), "EEE, MMM d")}{a.time ? ` · ${a.time}` : ""}
                        {a.provider_name ? ` · ${a.provider_name}` : ""}
                      </p>
                    </div>
                    <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full flex-shrink-0
                      ${isCompleted ? "bg-green-100 text-green-700" : isPast ? "bg-red-100 text-red-600" : a.status === "scheduled" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>
                      {isPast && !isCompleted ? "past due" : a.status}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}