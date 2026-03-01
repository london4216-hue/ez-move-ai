import { useState, useRef, useEffect } from "react";

export default function AddressAutocomplete({ label, value, onChange, placeholder, required }) {
  const [query, setQuery] = useState(value || "");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleInput = (val) => {
    setQuery(val);
    onChange(val);
    setSuggestions([]);
    setShowDropdown(false);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.length < 4) return;

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(val)}&format=json&addressdetails=1&countrycodes=us&limit=5`;
        const res = await fetch(url, { headers: { "Accept-Language": "en" } });
        const data = await res.json();
        const formatted = data.map(item => item.display_name);
        setSuggestions(formatted);
        setShowDropdown(formatted.length > 0);
      } catch {}
      setLoading(false);
    }, 400);
  };

  const handleSelect = (addr) => {
    setQuery(addr);
    onChange(addr);
    setSuggestions([]);
    setShowDropdown(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      <label className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider block mb-1.5">
        {label} {required && <span className="text-[#4F7EFF]">*</span>}
      </label>
      <div className="relative">
        <input
          type="text"
          placeholder={placeholder || "Start typing an address..."}
          value={query}
          onChange={e => handleInput(e.target.value)}
          onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
          autoComplete="off"
          className="w-full px-4 py-3 pr-10 rounded-xl border border-[#E5E7EB] bg-white text-[#1A1A2E] text-sm focus:outline-none focus:border-[#4F7EFF] focus:shadow-[0_0_0_3px_rgba(79,126,255,0.1)]"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-[#4F7EFF] border-t-transparent rounded-full animate-spin" />
        )}
        {!loading && query && (
          <button
            onClick={() => { setQuery(""); onChange(""); setSuggestions([]); setShowDropdown(false); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280]"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {showDropdown && suggestions.length > 0 && (
        <div className="absolute z-20 w-full mt-1 bg-white rounded-xl shadow-2xl border border-[#E5E7EB] overflow-hidden">
          {suggestions.map((s, i) => (
            <button
              key={i}
              onMouseDown={() => handleSelect(s)}
              className="w-full text-left px-4 py-3 text-sm text-[#1A1A2E] hover:bg-[#F5F3EF] transition-colors border-b border-[#F3F4F6] last:border-0 flex items-start gap-2"
            >
              <svg className="w-4 h-4 text-[#4F7EFF] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="line-clamp-2 leading-tight">{s}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}