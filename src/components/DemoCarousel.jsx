import { useState } from "react";
import { ChevronLeft, ChevronRight, CheckCircle2, CalendarDays, Package, Sparkles, MapPin, Clock, DollarSign, Truck } from "lucide-react";

const SCREENS = [
  {
    title: "Your Personalized Move Plan",
    subtitle: "Week-by-week checklist tailored to your closing date",
    emoji: "📋",
    content: (
      <div className="space-y-2">
        {[
          { week: "Week 1", task: "Schedule movers & get quotes", done: true },
          { week: "Week 1", task: "Declutter & sort belongings", done: true },
          { week: "Week 2", task: "Notify utilities of address change", done: false },
          { week: "Week 2", task: "Order packing supplies", done: false },
          { week: "Week 3", task: "Begin packing non-essentials", done: false },
          { week: "Closing", task: "Final walkthrough", done: false },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-3 bg-white rounded-xl px-3 py-2.5 border border-slate-100">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${item.done ? "bg-emerald-500" : "bg-slate-100 border-2 border-slate-200"}`}>
              {item.done && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-xs font-semibold ${item.done ? "line-through text-slate-400" : "text-slate-700"}`}>{item.task}</p>
            </div>
            <span className="text-[10px] font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full flex-shrink-0">{item.week}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    title: "My Stuff — Inventory Board",
    subtitle: "Drag items between Move, Donate & Junk",
    emoji: "📦",
    content: (
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "📦 Move", color: "border-blue-200 bg-blue-50", header: "bg-blue-500", items: ["Sofa (L)", "Bed Frame (M)", "Dresser (L)", "TV (M)"] },
          { label: "🫶 Donate", color: "border-emerald-200 bg-emerald-50", header: "bg-emerald-500", items: ["Bookcase (M)", "Old Chairs (S)"] },
          { label: "🗑️ Junk", color: "border-red-200 bg-red-50", header: "bg-red-500", items: ["Broken Desk (L)", "Old Rug (M)"] },
        ].map((col, i) => (
          <div key={i} className={`rounded-xl border-2 ${col.color} overflow-hidden`}>
            <div className={`${col.header} px-2 py-1.5 text-center`}>
              <p className="text-white text-[10px] font-black">{col.label}</p>
            </div>
            <div className="p-1.5 space-y-1">
              {col.items.map((item, j) => (
                <div key={j} className="bg-white rounded-lg px-2 py-1.5 text-[10px] font-semibold text-slate-600 border border-white shadow-sm">{item}</div>
              ))}
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    title: "AI Local Service Finder",
    subtitle: "Find movers, junk haulers & estate sales near you",
    emoji: "✨",
    content: (
      <div className="space-y-2">
        {[
          { name: "Swift Movers Chicago", rating: "⭐ 4.8", role: "Movers", price: "$1,200–$1,800", tag: "bg-blue-50 text-blue-600" },
          { name: "GoJunk Pro", rating: "⭐ 4.6", role: "Junk Removal", price: "$350–$600", tag: "bg-red-50 text-red-600" },
          { name: "City Estate Sales", rating: "⭐ 4.9", role: "Estate Sale", price: "30% commission", tag: "bg-emerald-50 text-emerald-600" },
        ].map((p, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-100 px-3 py-2.5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-orange-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-700">{p.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-slate-400">{p.rating}</span>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${p.tag}`}>{p.role}</span>
              </div>
            </div>
            <p className="text-xs font-black text-emerald-600 flex-shrink-0">{p.price}</p>
          </div>
        ))}
      </div>
    ),
  },
  {
    title: "Moving Cost Estimate",
    subtitle: "AI-powered quote based on your inventory",
    emoji: "💰",
    content: (
      <div className="space-y-3">
        <div className="bg-white rounded-xl border border-slate-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold text-slate-500">Your Move Summary</p>
            <span className="text-[10px] bg-orange-50 text-orange-600 font-bold px-2 py-0.5 rounded-full">14 items</span>
          </div>
          <div className="space-y-2">
            {[
              { label: "Packing Supplies", icon: Package, value: "$420", color: "text-amber-600" },
              { label: "Moving Crew Est.", icon: Truck, value: "$1,500–$2,400", color: "text-blue-600" },
              { label: "Donation Tax Write-off", icon: DollarSign, value: "~$280", color: "text-emerald-600" },
            ].map((r, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <div className="flex items-center gap-2">
                  <r.icon className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs text-slate-500">{r.label}</span>
                </div>
                <span className={`text-sm font-black ${r.color}`}>{r.value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl px-4 py-3 flex items-center justify-between">
          <p className="text-white font-bold text-sm">Total Estimated Budget</p>
          <p className="text-white text-2xl font-black">$2,640</p>
        </div>
      </div>
    ),
  },
  {
    title: "Broker & Agent Portal",
    subtitle: "Track all your clients from one dashboard",
    emoji: "🏢",
    content: (
      <div className="space-y-2">
        <div className="grid grid-cols-3 gap-2 mb-3">
          {[
            { label: "Clients", value: "12", color: "text-blue-600 bg-blue-50" },
            { label: "Active", value: "8", color: "text-emerald-600 bg-emerald-50" },
            { label: "Revenue", value: "$480", color: "text-orange-600 bg-orange-50" },
          ].map((s, i) => (
            <div key={i} className={`${s.color} rounded-xl p-3 text-center border border-white`}>
              <p className="text-xl font-black">{s.value}</p>
              <p className="text-[10px] font-bold">{s.label}</p>
            </div>
          ))}
        </div>
        {[
          { name: "Sarah Johnson", status: "active", days: "12d left" },
          { name: "Mike Chen", status: "registered", days: "28d left" },
          { name: "Lisa Park", status: "invited", days: "45d left" },
        ].map((c, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-100 px-3 py-2 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center">
              <span className="text-xs font-black text-orange-500">{c.name[0]}</span>
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-slate-700">{c.name}</p>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${c.status === "active" ? "bg-emerald-50 text-emerald-600" : c.status === "registered" ? "bg-blue-50 text-blue-600" : "bg-amber-50 text-amber-600"}`}>{c.status}</span>
            </div>
            <p className="text-[10px] font-bold text-slate-400">{c.days}</p>
          </div>
        ))}
      </div>
    ),
  },
];

export default function DemoCarousel() {
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent(i => (i - 1 + SCREENS.length) % SCREENS.length);
  const next = () => setCurrent(i => (i + 1) % SCREENS.length);

  const screen = SCREENS[current];

  return (
    <div className="bg-slate-800/60 border border-white/10 rounded-3xl overflow-hidden">
      {/* Screen Header */}
      <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{screen.emoji}</span>
          <div>
            <p className="text-white font-black text-sm">{screen.title}</p>
            <p className="text-slate-400 text-xs">{screen.subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {SCREENS.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)}
              className={`w-2 h-2 rounded-full transition-all ${i === current ? "bg-orange-400 w-5" : "bg-white/20 hover:bg-white/40"}`} />
          ))}
        </div>
      </div>

      {/* Screen Content */}
      <div className="px-6 py-5 min-h-[280px]">
        {screen.content}
      </div>

      {/* Navigation */}
      <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between">
        <button onClick={prev}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/10">
          <ChevronLeft className="w-4 h-4" /> Previous
        </button>
        <p className="text-slate-500 text-xs">{current + 1} / {SCREENS.length}</p>
        <button onClick={next}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-white text-xs font-bold transition-all">
          Next <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}