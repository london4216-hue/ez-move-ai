import { useState } from "react";

export default function ClientAddressFields({ form, setForm }) {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const US_STATES = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","DC"];

  const fetchSuggestions = async (query) => {
    if (query.length < 3) { setSuggestions([]); return; }
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5&countrycodes=us`);
      const data = await res.json();
      setSuggestions(data);
      setShowSuggestions(true);
    } catch {}
  };

  const selectSuggestion = (s) => {
    const addr = s.address || {};
    const street = [addr.house_number, addr.road].filter(Boolean).join(" ");
    setForm(f => ({
      ...f,
      street: street || s.display_name.split(",")[0],
      city: addr.city || addr.town || addr.village || addr.county || "",
      state: (addr.state_code || addr.state || "").toUpperCase().slice(0, 2),
      zip: addr.postcode || "",
    }));
    setShowSuggestions(false);
  };

  return (
    <div className="space-y-3">
      <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Client's Property Address</p>

      {/* Street with autocomplete */}
      <div className="relative">
        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-1">Street Address *</label>
        <input
          type="text"
          value={form.street || ""}
          autoComplete="off"
          onChange={e => { setForm(f => ({ ...f, street: e.target.value })); fetchSuggestions(e.target.value); }}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          placeholder="123 Main St"
          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/10"
        />
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
            {suggestions.map((s, i) => (
              <button key={i} type="button"
                onMouseDown={() => selectSuggestion(s)}
                className="w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:bg-orange-50 border-b border-slate-50 last:border-0 truncate">
                {s.display_name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Unit */}
      <div>
        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-1">Unit / Apt (optional)</label>
        <input
          type="text"
          value={form.unit || ""}
          onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
          placeholder="Apt 2B"
          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/10"
        />
      </div>

      {/* City + State */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-1">City *</label>
          <input
            type="text"
            value={form.city || ""}
            onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
            placeholder="Chicago"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/10"
          />
        </div>
        <div>
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-1">State *</label>
          <select
            value={form.state || ""}
            onChange={e => setForm(f => ({ ...f, state: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/10 bg-white"
          >
            <option value="">—</option>
            {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Zip */}
      <div>
        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-1">ZIP Code *</label>
        <input
          type="text"
          value={form.zip || ""}
          inputMode="numeric"
          maxLength={10}
          onChange={e => setForm(f => ({ ...f, zip: e.target.value.replace(/[^0-9-]/g, '') }))}
          placeholder="60601"
          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/10"
        />
      </div>
    </div>
  );
}

export function buildFullAddress(form) {
  const parts = [form.street];
  if (form.unit) parts.push(`Unit ${form.unit}`);
  parts.push(`${form.city}, ${form.state} ${form.zip}`);
  return parts.filter(Boolean).join(", ");
}