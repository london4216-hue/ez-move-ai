/**
 * EZ Move AI — Unified Design System
 * Reusable components for all portals.
 */

import { Loader2 } from "lucide-react";

// ─── Buttons ──────────────────────────────────────────────────────────────────

export function PrimaryBtn({ children, onClick, disabled, loading, className = "", type = "button" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-sm shadow-md shadow-orange-200 active:scale-[0.97] hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
}

export function SecondaryBtn({ children, onClick, disabled, className = "", type = "button" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl border-2 border-orange-400 text-orange-600 font-bold text-sm bg-white active:scale-[0.97] hover:bg-orange-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  );
}

export function GhostBtn({ children, onClick, disabled, className = "", type = "button" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-slate-500 font-semibold text-sm hover:bg-slate-100 active:scale-[0.97] transition-all disabled:opacity-40 ${className}`}
    >
      {children}
    </button>
  );
}

export function DangerBtn({ children, onClick, disabled, loading, className = "", type = "button" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm active:scale-[0.97] transition-all disabled:opacity-40 ${className}`}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
}

// ─── Cards ────────────────────────────────────────────────────────────────────

export function InfoCard({ title, value, subtitle, icon: Icon, color = "orange", className = "" }) {
  const colors = {
    orange: "bg-orange-50 text-orange-600 border-orange-100",
    blue:   "bg-blue-50 text-blue-600 border-blue-100",
    green:  "bg-emerald-50 text-emerald-600 border-emerald-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
    slate:  "bg-slate-50 text-slate-600 border-slate-100",
  };
  return (
    <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm p-4 ${className}`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
          <p className="text-2xl font-black text-slate-800 leading-tight">{value}</p>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
}

export function ActionCard({ title, description, icon: Icon, onClick, badge, className = "" }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left bg-white rounded-2xl border border-slate-100 shadow-sm p-4 hover:border-orange-300 hover:shadow-md active:scale-[0.98] transition-all group ${className}`}
    >
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="w-10 h-10 rounded-2xl bg-orange-50 flex items-center justify-center flex-shrink-0 group-hover:bg-orange-100 transition-colors">
            <Icon className="w-5 h-5 text-orange-500" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-bold text-slate-800 text-sm">{title}</p>
            {badge && <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-600">{badge}</span>}
          </div>
          {description && <p className="text-xs text-slate-400 mt-0.5 truncate">{description}</p>}
        </div>
        <span className="text-slate-300 text-lg">›</span>
      </div>
    </button>
  );
}

export function ProductCard({ name, price, originalPrice, emoji, badge, onAddToCart, className = "" }) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col ${className}`}>
      <div className="bg-slate-50 flex items-center justify-center py-6 text-4xl relative">
        {emoji}
        {badge && (
          <span className="absolute top-2 right-2 text-[9px] font-black bg-orange-500 text-white px-2 py-0.5 rounded-full">{badge}</span>
        )}
      </div>
      <div className="p-3 flex-1 flex flex-col">
        <p className="text-xs font-bold text-slate-800 leading-tight mb-1">{name}</p>
        <div className="flex items-baseline gap-1.5 mt-auto pt-2">
          <span className="text-base font-black text-slate-900">{price}</span>
          {originalPrice && <span className="text-xs text-slate-400 line-through">{originalPrice}</span>}
        </div>
        <button
          onClick={onAddToCart}
          className="mt-2 w-full py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold active:scale-[0.97] transition-all"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}

export function VendorCard({ name, rating, category, distance, onClick, className = "" }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left bg-white rounded-2xl border border-slate-100 shadow-sm p-4 hover:border-orange-300 hover:shadow-md active:scale-[0.98] transition-all ${className}`}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center flex-shrink-0">
          <span className="text-white text-sm font-black">{name[0]}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-slate-800 text-sm truncate">{name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-amber-500 font-bold">★ {rating}</span>
            <span className="text-[10px] text-slate-400">{category}</span>
            {distance && <span className="text-[10px] text-slate-400">· {distance}</span>}
          </div>
        </div>
        <span className="text-slate-300 text-lg">›</span>
      </div>
    </button>
  );
}

// ─── Modals ───────────────────────────────────────────────────────────────────

export function BottomModal({ title, children, onClose, className = "" }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center animate-fade-in">
      <div className={`w-full max-w-md bg-white rounded-t-3xl shadow-2xl max-h-[90vh] flex flex-col animate-slide-up ${className}`}>
        <div className="sticky top-0 bg-white border-b border-slate-100 px-5 py-4 flex items-center justify-between flex-shrink-0 rounded-t-3xl">
          <h3 className="text-base font-bold text-slate-800">{title}</h3>
          {onClose && (
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors text-lg leading-none font-light">
              ×
            </button>
          )}
        </div>
        <div className="overflow-y-auto flex-1 p-5">
          {children}
        </div>
      </div>
    </div>
  );
}

export function CenterModal({ title, children, onClose, className = "" }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className={`w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden animate-scale-in ${className}`}>
        <div className="border-b border-slate-100 px-5 py-4 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-800">{title}</h3>
          {onClose && (
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors text-lg leading-none font-light">
              ×
            </button>
          )}
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

// ─── Inputs ───────────────────────────────────────────────────────────────────

export function TextInput({ label, value, onChange, placeholder, type = "text", required, className = "" }) {
  return (
    <div className={className}>
      {label && <label className="text-xs font-semibold text-slate-500 mb-1.5 block">{label}{required && " *"}</label>}
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/10 transition-all"
      />
    </div>
  );
}

export function SelectInput({ label, value, onChange, options, placeholder, required, className = "" }) {
  return (
    <div className={className}>
      {label && <label className="text-xs font-semibold text-slate-500 mb-1.5 block">{label}{required && " *"}</label>}
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:border-orange-400 transition-all"
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o, i) => (
          <option key={i} value={o.value ?? o}>{o.label ?? o}</option>
        ))}
      </select>
    </div>
  );
}

// ─── Progress ─────────────────────────────────────────────────────────────────

export function LinearProgress({ value, max = 100, label, color = "orange", className = "" }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  const colors = { orange: "from-orange-500 to-amber-400", blue: "from-blue-500 to-blue-400", green: "from-emerald-500 to-green-400", purple: "from-purple-500 to-purple-400" };
  return (
    <div className={className}>
      {label && (
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs font-semibold text-slate-500">{label}</span>
          <span className="text-xs font-bold text-slate-600">{pct}%</span>
        </div>
      )}
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full bg-gradient-to-r ${colors[color]} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function CircularProgress({ value, max = 100, size = 64, strokeWidth = 6, color = "#f97316", label }) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(100, (value / max) * 100);
  const dash = (pct / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={strokeWidth} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circ} strokeDashoffset={circ - dash} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.7s ease" }}
        />
      </svg>
      {label && <span className="text-[10px] font-bold text-slate-500 mt-0.5">{label}</span>}
    </div>
  );
}

// ─── Timeline ─────────────────────────────────────────────────────────────────

export function Timeline({ items, className = "" }) {
  return (
    <div className={`space-y-0 ${className}`}>
      {items.map((item, i) => (
        <div key={i} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold z-10 ${item.done ? "bg-emerald-500 text-white" : item.active ? "bg-orange-500 text-white" : "bg-slate-100 text-slate-400"}`}>
              {item.done ? "✓" : i + 1}
            </div>
            {i < items.length - 1 && (
              <div className={`w-0.5 flex-1 mt-1 mb-1 min-h-[1.5rem] ${item.done ? "bg-emerald-300" : "bg-slate-100"}`} />
            )}
          </div>
          <div className="flex-1 pb-4 pt-0.5">
            <p className={`text-sm font-bold ${item.done ? "text-emerald-700" : item.active ? "text-slate-800" : "text-slate-400"}`}>{item.title}</p>
            {item.subtitle && <p className="text-xs text-slate-400 mt-0.5">{item.subtitle}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────

export function SectionHeader({ title, subtitle, action, className = "" }) {
  return (
    <div className={`flex items-start justify-between gap-2 ${className}`}>
      <div>
        <h2 className="text-base font-black text-slate-800">{title}</h2>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

export function EmptyState({ emoji = "📭", title, subtitle, action, className = "" }) {
  return (
    <div className={`flex flex-col items-center justify-center py-10 text-center ${className}`}>
      <div className="text-4xl mb-3">{emoji}</div>
      <p className="font-bold text-slate-600 text-sm">{title}</p>
      {subtitle && <p className="text-xs text-slate-400 mt-1 max-w-[200px]">{subtitle}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────

export function Badge({ children, color = "orange", className = "" }) {
  const colors = {
    orange: "bg-orange-100 text-orange-600",
    green:  "bg-emerald-100 text-emerald-600",
    red:    "bg-red-100 text-red-600",
    blue:   "bg-blue-100 text-blue-600",
    purple: "bg-purple-100 text-purple-600",
    slate:  "bg-slate-100 text-slate-500",
    amber:  "bg-amber-100 text-amber-700",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${colors[color]} ${className}`}>
      {children}
    </span>
  );
}