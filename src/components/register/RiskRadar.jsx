import { useEffect, useState } from "react";
import { Cloud, CloudRain, Sun, AlertTriangle, Car, CalendarX, MapPin, Zap, CheckCircle2, Clock } from "lucide-react";

function getDayContext(moveDate) {
  if (!moveDate) return {};
  const d = new Date(moveDate + "T12:00:00");
  const dow = d.getDay(); // 0=Sun,6=Sat
  const day = d.getDate();
  const isWeekend = dow === 0 || dow === 6;
  const isMonthEnd = day >= 28;
  const isMonthStart = day <= 5;
  const daysUntil = Math.round((d - new Date()) / 86400000);
  return { dow, day, isWeekend, isMonthEnd, isMonthStart, daysUntil };
}

function RiskBadge({ level }) {
  const config = {
    high:   { label: "High Risk",    cls: "bg-red-100 text-red-700 border-red-200" },
    medium: { label: "Moderate",     cls: "bg-amber-100 text-amber-700 border-amber-200" },
    low:    { label: "All Clear",    cls: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  }[level] || { label: "Unknown", cls: "bg-slate-100 text-slate-600 border-slate-200" };
  return (
    <span className={`text-[9px] font-black uppercase tracking-wide border px-2 py-0.5 rounded-full ${config.cls} ${level === "high" ? "animate-pulse" : ""}`}>
      {config.label}
    </span>
  );
}

function RiskTile({ icon: Icon, iconColor, iconBg, title, status, detail, level, delay = 0 }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), delay); return () => clearTimeout(t); }, [delay]);
  return (
    <div className={`bg-white border border-slate-100 rounded-2xl p-3.5 shadow-sm transition-all duration-500 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}
      style={{ transitionDelay: `${delay}ms` }}>
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <p className="text-xs font-black text-slate-800">{title}</p>
            <RiskBadge level={level} />
          </div>
          <p className="text-xs font-semibold text-slate-600">{status}</p>
          {detail && <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">{detail}</p>}
        </div>
      </div>
    </div>
  );
}

export default function RiskRadar({ moveDate, moveStartTime, miles }) {
  const ctx = getDayContext(moveDate);
  const hour = parseInt((moveStartTime || "09:00").split(":")[0]);
  const isEarlyStart = hour <= 8;
  const isRushHour = hour >= 7 && hour <= 9;

  const tiles = [
    {
      icon: ctx.isWeekend ? CloudRain : Sun,
      iconColor: ctx.isWeekend ? "text-blue-500" : "text-amber-500",
      iconBg: ctx.isWeekend ? "bg-blue-50" : "bg-amber-50",
      title: "Weather Forecast",
      status: ctx.isWeekend ? "Rain possible — weekend weather is unpredictable" : "Conditions look favorable",
      detail: moveDate ? `For ${new Date(moveDate + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}` : "Add a move date to see forecast",
      level: ctx.isWeekend ? "medium" : "low",
    },
    {
      icon: Car,
      iconColor: isRushHour ? "text-red-500" : "text-emerald-500",
      iconBg: isRushHour ? "bg-red-50" : "bg-emerald-50",
      title: "Traffic Conditions",
      status: isRushHour ? "Rush hour start — expect delays" : isEarlyStart ? "Early start: roads will be clear" : "Moderate traffic expected",
      detail: moveStartTime ? `Starting at ${moveStartTime} — ${isRushHour ? "consider starting 30 min later" : "good window"}` : "Set a start time to see traffic forecast",
      level: isRushHour ? "high" : isEarlyStart ? "low" : "medium",
    },
    {
      icon: MapPin,
      iconColor: (miles || 0) > 50 ? "text-orange-500" : "text-emerald-500",
      iconBg: (miles || 0) > 50 ? "bg-orange-50" : "bg-emerald-50",
      title: "Route & Construction",
      status: (miles || 0) > 50 ? "Long-distance move — check for highway delays" : "Local move — route looks clear",
      detail: miles ? `~${miles} miles. Your EZ Move Dashboard will monitor for closures.` : "Distance not yet calculated.",
      level: (miles || 0) > 50 ? "medium" : "low",
    },
    {
      icon: CalendarX,
      iconColor: (ctx.isWeekend || ctx.isMonthEnd) ? "text-red-500" : "text-emerald-500",
      iconBg: (ctx.isWeekend || ctx.isMonthEnd) ? "bg-red-50" : "bg-emerald-50",
      title: "Mover Demand",
      status: ctx.isMonthEnd
        ? "Month-end! High demand — book ASAP"
        : ctx.isWeekend
        ? "Weekend move — crews fill up fast"
        : ctx.isMonthStart
        ? "Start of month — moderate demand"
        : "Mid-month: good availability",
      detail: ctx.isMonthEnd || ctx.isWeekend
        ? "Tip: Confirm your mover 48 hrs before your move date."
        : "You have good timing for availability.",
      level: ctx.isMonthEnd ? "high" : ctx.isWeekend ? "medium" : "low",
    },
    {
      icon: Zap,
      iconColor: "text-purple-500",
      iconBg: "bg-purple-50",
      title: "Local Events & Parking",
      status: ctx.isWeekend ? "Weekend events may affect street parking" : "No major events detected",
      detail: "Your EZ Move Dashboard will alert you to events near your move route.",
      level: ctx.isWeekend ? "medium" : "low",
    },
  ];

  const highCount = tiles.filter(t => t.level === "high").length;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-1">
          <AlertTriangle className="w-4 h-4 text-orange-400" />
          <p className="text-xs font-black text-orange-400 uppercase tracking-wide">Risk Radar</p>
        </div>
        <p className="text-white font-black text-sm leading-snug">
          Your EZ Move Dashboard will keep you updated on anything that could impact your move.
        </p>
        {highCount > 0 ? (
          <p className="text-red-300 text-[10px] font-bold mt-2">⚠️ {highCount} high-risk item{highCount > 1 ? "s" : ""} detected — review below</p>
        ) : (
          <div className="flex items-center gap-1.5 mt-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <p className="text-emerald-400 text-[10px] font-bold">No critical risks detected right now</p>
          </div>
        )}
      </div>

      {/* Tiles */}
      {tiles.map((t, i) => <RiskTile key={t.title} {...t} delay={i * 80} />)}

      {/* Footer */}
      <div className="flex items-center gap-2 px-1">
        <Clock className="w-3 h-3 text-slate-400 flex-shrink-0" />
        <p className="text-[10px] text-slate-400 italic">Your EZ Move Dashboard continuously monitors these risks.</p>
      </div>
    </div>
  );
}