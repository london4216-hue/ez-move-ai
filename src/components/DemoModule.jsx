import { useState } from "react";
import {
  ChevronLeft, ChevronRight, CheckCircle2, Package, Sparkles,
  Truck, DollarSign, Building2, UserCheck, Briefcase, Users,
  CalendarDays, Home, ArrowRight, Star, Phone, Mail, MapPin,
  ClipboardList, Zap, Heart, Trash2, GripVertical
} from "lucide-react";

// ─── SCREEN DEFINITIONS ─────────────────────────────────────────────────────

const SCREENS = [
  { id: "sales",        label: "Sales Page",         emoji: "🌐" },
  { id: "role",         label: "Role Selection",      emoji: "👤" },
  { id: "register",     label: "Registration",        emoji: "📝" },
  { id: "dashboard",    label: "Dashboard",           emoji: "🏠" },
  { id: "checklist",    label: "Move Checklist",      emoji: "📋" },
  { id: "mystuff",      label: "My Stuff",            emoji: "📦" },
  { id: "ai",           label: "AI Tools",            emoji: "✨" },
  { id: "cost",         label: "Cost Estimate",       emoji: "💰" },
  { id: "broker",       label: "Broker Portal",       emoji: "🏢" },
  { id: "done",         label: "End of Demo",         emoji: "🎉" },
];

// ─── INDIVIDUAL SCREEN RENDERERS ────────────────────────────────────────────

function ScreenSales() {
  return (
    <div className="space-y-4">
      <div className="text-center py-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-orange-900/40">
          <span className="text-white font-black text-xl">EZ</span>
        </div>
        <h2 className="text-2xl font-black text-white mb-1">EZ Move <span className="text-orange-400">AI</span></h2>
        <p className="text-slate-400 text-sm">The Smart Moving Platform for Real Estate Professionals</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[
          { icon: CalendarDays, label: "Week-by-week move plan", color: "text-orange-400" },
          { icon: Sparkles,     label: "AI local service finder", color: "text-purple-400" },
          { icon: Package,      label: "Inventory & packing tools", color: "text-blue-400" },
          { icon: Users,        label: "Agent & broker portals", color: "text-emerald-400" },
        ].map(f => (
          <div key={f.label} className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-3 rounded-xl">
            <f.icon className={`w-4 h-4 flex-shrink-0 ${f.color}`} />
            <span className="text-slate-300 text-xs font-semibold">{f.label}</span>
          </div>
        ))}
      </div>
      <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4 text-center">
        <p className="text-orange-300 text-sm font-bold">$40 per client · Volume discounts available</p>
        <p className="text-slate-400 text-xs mt-1">Agents & Brokers invite clients with a unique link</p>
      </div>
    </div>
  );
}

function ScreenRole({ selected, setSelected }) {
  const roles = [
    { key: "buyer",  icon: Home,      label: "Home Buyer",      desc: "I'm moving into a new home",          color: "border-blue-500 bg-blue-500/10",    active: "ring-blue-400" },
    { key: "seller", icon: ArrowRight,label: "Home Seller",     desc: "I'm selling and need to move out",    color: "border-emerald-500 bg-emerald-500/10", active: "ring-emerald-400" },
    { key: "agent",  icon: UserCheck, label: "Real Estate Agent", desc: "I manage clients through their move", color: "border-orange-500 bg-orange-500/10", active: "ring-orange-400" },
    { key: "broker", icon: Briefcase, label: "Broker / Firm",   desc: "I oversee multiple agents & clients", color: "border-purple-500 bg-purple-500/10", active: "ring-purple-400" },
  ];
  return (
    <div className="space-y-3">
      <p className="text-slate-300 text-sm text-center mb-4">Who are you? <span className="text-slate-500">(demo — tap any)</span></p>
      {roles.map(r => (
        <button key={r.key} onClick={() => setSelected(r.key)}
          className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${selected === r.key ? `${r.color} ${r.active} ring-2` : "border-white/10 bg-white/5 hover:bg-white/10"}`}>
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
            <r.icon className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <p className="text-white font-bold text-sm">{r.label}</p>
            <p className="text-slate-400 text-xs">{r.desc}</p>
          </div>
          {selected === r.key && <CheckCircle2 className="w-5 h-5 text-white ml-auto flex-shrink-0" />}
        </button>
      ))}
    </div>
  );
}

function ScreenRegister() {
  return (
    <div className="space-y-3">
      <p className="text-slate-400 text-xs text-center mb-2">Demo registration — no data is saved</p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">First Name</label>
          <div className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm text-slate-300">Jane</div>
        </div>
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">Last Name</label>
          <div className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm text-slate-300">Smith</div>
        </div>
      </div>
      <div>
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">Email</label>
        <div className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm text-slate-300 flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-slate-500" /> jane@example.com</div>
      </div>
      <div>
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">Phone</label>
        <div className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm text-slate-300 flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-slate-500" /> (555) 867-5309</div>
      </div>
      <div>
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">New Home Address</label>
        <div className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm text-slate-300 flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-slate-500" /> 123 Maple Street, Chicago, IL 60614</div>
      </div>
      <div>
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">Est. Close Date</label>
        <div className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm text-slate-300">May 15, 2026</div>
      </div>
      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 text-center">
        <p className="text-emerald-300 text-xs font-bold">✓ In production, this saves to your account & starts your move plan</p>
      </div>
    </div>
  );
}

function ScreenDashboard() {
  const weeks = [
    { label: "Week 1", pct: 100, color: "bg-emerald-500" },
    { label: "Week 2", pct: 60,  color: "bg-orange-500" },
    { label: "Week 3", pct: 20,  color: "bg-slate-600"  },
    { label: "Week 4", pct: 0,   color: "bg-slate-700"  },
  ];
  return (
    <div className="space-y-3">
      <div className="bg-gradient-to-r from-orange-500/20 to-orange-600/10 border border-orange-500/20 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-white font-black text-lg">Hi, Jane 👋</p>
            <p className="text-slate-400 text-xs">41 days until closing · May 15</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-black text-orange-400">62%</p>
            <p className="text-slate-400 text-[10px]">Move progress</p>
          </div>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full" style={{ width: "62%" }} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {weeks.map(w => (
          <div key={w.label} className="bg-white/5 border border-white/10 rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-slate-300">{w.label}</p>
              <span className="text-[10px] text-slate-400">{w.pct}%</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className={`h-full ${w.color} rounded-full`} style={{ width: `${w.pct}%` }} />
            </div>
          </div>
        ))}
      </div>
      <div className="space-y-2">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Up Next</p>
        {["Confirm moving company booking", "Order packing boxes (est. 42)", "Schedule utility transfers"].map((t, i) => (
          <div key={i} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5">
            <div className="w-4 h-4 rounded-full border-2 border-orange-400 flex-shrink-0" />
            <p className="text-slate-300 text-xs">{t}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ScreenChecklist() {
  const items = [
    { week: 1, task: "Get 3 moving quotes",          done: true },
    { week: 1, task: "Sort items: Move / Donate / Junk", done: true },
    { week: 1, task: "Schedule estate sale",         done: true },
    { week: 2, task: "Notify utilities",             done: false },
    { week: 2, task: "Order packing supplies",       done: false },
    { week: 2, task: "Update address with USPS",     done: false },
    { week: 3, task: "Begin packing room by room",   done: false },
    { week: 4, task: "Final walkthrough",            done: false },
  ];
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Move Roadmap</p>
        <span className="text-xs font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full">3 / 8 done</span>
      </div>
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5">
          <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${item.done ? "bg-emerald-500" : "bg-white/10 border-2 border-white/20"}`}>
            {item.done && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
          </div>
          <p className={`text-xs flex-1 ${item.done ? "line-through text-slate-500" : "text-slate-300"}`}>{item.task}</p>
          <span className="text-[9px] font-bold text-orange-400 bg-orange-500/10 px-1.5 py-0.5 rounded-full flex-shrink-0">Wk {item.week}</span>
        </div>
      ))}
    </div>
  );
}

function ScreenMyStuff() {
  const cols = [
    { label: "📦 Move",   color: "border-blue-500/40 bg-blue-500/10",    hdr: "bg-blue-600",    items: ["Sofa (L)", "Bed Frame (M)", "Dresser (L)", "TV (M)", "Desk (M)"] },
    { label: "🫶 Donate", color: "border-emerald-500/40 bg-emerald-500/10", hdr: "bg-emerald-600", items: ["Bookcase (M)", "Old Chairs (S)", "Lamps (S)"] },
    { label: "🗑️ Junk",  color: "border-red-500/40 bg-red-500/10",       hdr: "bg-red-600",     items: ["Broken Desk (L)", "Old Rug (M)"] },
  ];
  return (
    <div className="space-y-3">
      <p className="text-slate-400 text-xs text-center">Drag items between columns · Quantities tracked automatically</p>
      <div className="grid grid-cols-3 gap-2">
        {cols.map((col, i) => (
          <div key={i} className={`rounded-xl border-2 ${col.color} overflow-hidden`}>
            <div className={`${col.hdr} px-2 py-2 text-center`}>
              <p className="text-white text-[10px] font-black leading-tight">{col.label}</p>
              <p className="text-white/70 text-[9px]">{col.items.length} items</p>
            </div>
            <div className="p-1.5 space-y-1">
              {col.items.map((item, j) => (
                <div key={j} className="bg-white/10 rounded-lg px-2 py-1.5 flex items-center gap-1">
                  <GripVertical className="w-2.5 h-2.5 text-white/30 flex-shrink-0" />
                  <p className="text-[9px] font-semibold text-slate-300 flex-1 truncate">{item}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 grid grid-cols-3 gap-2 text-center">
        {[["10", "Moving"], ["3", "Donating"], ["2", "Junking"]].map(([val, lbl]) => (
          <div key={lbl}>
            <p className="text-white text-xl font-black">{val}</p>
            <p className="text-slate-400 text-[10px]">{lbl}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ScreenAI() {
  const providers = [
    { name: "Swift Movers Chicago",   role: "Movers",         rating: "4.8", price: "$1,200–$1,800", color: "text-blue-400 bg-blue-500/10" },
    { name: "GoJunk Pro",             role: "Junk Removal",   rating: "4.6", price: "$350–$600",      color: "text-red-400 bg-red-500/10" },
    { name: "City Estate Sales",      role: "Estate Sale",    rating: "4.9", price: "30% commission", color: "text-emerald-400 bg-emerald-500/10" },
    { name: "Two Men and a Van",      role: "Movers",         rating: "4.7", price: "$900–$1,500",    color: "text-blue-400 bg-blue-500/10" },
  ];
  return (
    <div className="space-y-3">
      <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl px-4 py-3 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-purple-400 flex-shrink-0" />
        <p className="text-purple-200 text-xs">AI found top-rated local services near 123 Maple St, Chicago</p>
      </div>
      {providers.map((p, i) => (
        <div key={i} className="bg-white/5 border border-white/10 rounded-xl px-3 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange-500/20 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-orange-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white">{p.name}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] text-yellow-400">⭐ {p.rating}</span>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${p.color}`}>{p.role}</span>
            </div>
          </div>
          <p className="text-xs font-black text-emerald-400 flex-shrink-0">{p.price}</p>
        </div>
      ))}
    </div>
  );
}

function ScreenCost() {
  return (
    <div className="space-y-3">
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-bold text-slate-300">Your Move Summary</p>
          <span className="text-[10px] bg-orange-500/20 text-orange-400 font-bold px-2 py-0.5 rounded-full">15 items</span>
        </div>
        {[
          { label: "Packing Supplies",       icon: Package,     value: "$420",          color: "text-amber-400" },
          { label: "Moving Crew Est.",        icon: Truck,       value: "$1,500–$2,400", color: "text-blue-400" },
          { label: "Junk Removal",           icon: Trash2,      value: "$380",          color: "text-red-400" },
          { label: "Donation Tax Write-off", icon: Heart,       value: "~$280 savings", color: "text-emerald-400" },
        ].map((r, i) => (
          <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
            <div className="flex items-center gap-2">
              <r.icon className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-xs text-slate-400">{r.label}</span>
            </div>
            <span className={`text-sm font-black ${r.color}`}>{r.value}</span>
          </div>
        ))}
      </div>
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl px-4 py-4 flex items-center justify-between">
        <div>
          <p className="text-white font-bold text-sm">Total Estimated Budget</p>
          <p className="text-orange-100 text-xs">Based on your inventory</p>
        </div>
        <p className="text-white text-3xl font-black">$2,800</p>
      </div>
      <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-center">
        <p className="text-slate-400 text-xs">In production, this updates live as you add/remove items</p>
      </div>
    </div>
  );
}

function ScreenBroker() {
  const clients = [
    { name: "Sarah Johnson", status: "active",     days: "12d left",  statusColor: "bg-emerald-500/20 text-emerald-400" },
    { name: "Mike Chen",     status: "registered", days: "28d left",  statusColor: "bg-blue-500/20 text-blue-400" },
    { name: "Lisa Park",     status: "invited",    days: "45d left",  statusColor: "bg-amber-500/20 text-amber-400" },
    { name: "Tom Rivera",    status: "active",     days: "Closed ✓",  statusColor: "bg-emerald-500/20 text-emerald-400" },
  ];
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: "Clients", value: "12", color: "text-blue-400 bg-blue-500/10" },
          { label: "Active",  value: "8",  color: "text-emerald-400 bg-emerald-500/10" },
          { label: "Pending", value: "3",  color: "text-amber-400 bg-amber-500/10" },
          { label: "Revenue", value: "$480", color: "text-orange-400 bg-orange-500/10" },
        ].map((s, i) => (
          <div key={i} className={`${s.color} rounded-xl p-2.5 text-center border border-white/5`}>
            <p className="text-base font-black">{s.value}</p>
            <p className="text-[9px] font-bold">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="space-y-2">
        {clients.map((c, i) => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-black text-orange-400">{c.name[0]}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white">{c.name}</p>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${c.statusColor}`}>{c.status}</span>
            </div>
            <p className="text-[10px] font-bold text-slate-400">{c.days}</p>
          </div>
        ))}
      </div>
      <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-center">
        <p className="text-slate-400 text-xs">Brokers & Agents invite clients with one unique link · $40/client</p>
      </div>
    </div>
  );
}

function ScreenDone() {
  return (
    <div className="flex flex-col items-center justify-center py-6 text-center space-y-5">
      <div className="text-6xl">🎉</div>
      <div>
        <p className="text-white font-black text-2xl mb-2">End of Demo</p>
        <p className="text-slate-400 text-sm max-w-xs mx-auto">You've seen the full EZ Move AI experience — from onboarding to closing day.</p>
      </div>
      <div className="w-full space-y-2">
        {[
          "✅ Week-by-week move checklist",
          "✅ My Stuff inventory board",
          "✅ AI local service finder",
          "✅ Moving cost estimator",
          "✅ Agent & broker portal",
        ].map((item, i) => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5">
            <p className="text-slate-300 text-sm font-semibold">{item}</p>
          </div>
        ))}
      </div>
      <div className="bg-gradient-to-r from-orange-500/20 to-orange-600/10 border border-orange-500/20 rounded-2xl px-5 py-4 w-full">
        <p className="text-orange-300 font-bold text-sm">Ready to get started?</p>
        <p className="text-slate-400 text-xs mt-1">Sign up as an Agent or Broker from the Sales Page</p>
      </div>
    </div>
  );
}

// ─── MAIN DEMO MODULE ────────────────────────────────────────────────────────

export default function DemoModule() {
  const [current, setCurrent] = useState(0);
  const [selectedRole, setSelectedRole] = useState("buyer");

  const prev = () => setCurrent(i => Math.max(0, i - 1));
  const next = () => setCurrent(i => Math.min(SCREENS.length - 1, i + 1));

  const screen = SCREENS[current];

  const renderScreen = () => {
    switch (screen.id) {
      case "sales":     return <ScreenSales />;
      case "role":      return <ScreenRole selected={selectedRole} setSelected={setSelectedRole} />;
      case "register":  return <ScreenRegister />;
      case "dashboard": return <ScreenDashboard />;
      case "checklist": return <ScreenChecklist />;
      case "mystuff":   return <ScreenMyStuff />;
      case "ai":        return <ScreenAI />;
      case "cost":      return <ScreenCost />;
      case "broker":    return <ScreenBroker />;
      case "done":      return <ScreenDone />;
      default:          return null;
    }
  };

  return (
    <div className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden">
      {/* Demo Banner */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex items-center justify-center gap-2">
        <Zap className="w-3.5 h-3.5 text-amber-400" />
        <p className="text-amber-300 text-xs font-bold uppercase tracking-wide">Demo Mode · No real data · No real workflows</p>
      </div>

      {/* Nav Header */}
      <div className="px-4 py-3 border-b border-white/10 flex items-center gap-3">
        <button onClick={prev} disabled={current === 0}
          className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center transition-all flex-shrink-0">
          <ChevronLeft className="w-4 h-4 text-white" />
        </button>

        {/* Step pills (scrollable) */}
        <div className="flex-1 flex gap-1 overflow-x-auto no-scrollbar">
          {SCREENS.map((s, i) => (
            <button key={s.id} onClick={() => setCurrent(i)}
              className={`flex-shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                i === current
                  ? "bg-orange-500 text-white"
                  : i < current
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-white/5 text-slate-500 hover:text-slate-300"
              }`}>
              <span>{s.emoji}</span>
              <span className="hidden sm:inline">{s.label}</span>
              <span className="sm:hidden">{i + 1}</span>
            </button>
          ))}
        </div>

        <button onClick={next} disabled={current === SCREENS.length - 1}
          className="w-8 h-8 rounded-xl bg-orange-500 hover:bg-orange-400 disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center transition-all flex-shrink-0">
          <ChevronRight className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Screen Title */}
      <div className="px-5 pt-4 pb-2 flex items-center gap-3">
        <span className="text-2xl">{screen.emoji}</span>
        <div>
          <p className="text-white font-black text-base">{screen.label}</p>
          <p className="text-slate-500 text-xs">Screen {current + 1} of {SCREENS.length}</p>
        </div>
      </div>

      {/* Screen Content */}
      <div className="px-5 pb-4 min-h-[340px]">
        {renderScreen()}
      </div>

      {/* Bottom Nav */}
      <div className="px-5 py-3 border-t border-white/10 flex items-center justify-between">
        <button onClick={prev} disabled={current === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-20 disabled:cursor-not-allowed text-white text-xs font-bold transition-all border border-white/10">
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <p className="text-slate-600 text-xs">{current + 1} / {SCREENS.length}</p>
        <button onClick={next} disabled={current === SCREENS.length - 1}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 disabled:opacity-20 disabled:cursor-not-allowed text-white text-xs font-bold transition-all">
          Next <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}