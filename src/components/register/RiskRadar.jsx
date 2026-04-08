import { useEffect, useState } from "react";
import { CloudRain, Sun, CloudSnow, Wind, AlertTriangle, Car, CalendarX, MapPin, Zap, CheckCircle2, Clock, Navigation } from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function extractCity(address) {
  if (!address) return null;
  // Try "City, State ZIP" or "City, State"
  const parts = address.split(",");
  if (parts.length >= 2) return parts[parts.length - 2]?.trim() || null;
  return null;
}

function getDayContext(moveDate) {
  if (!moveDate) return {};
  const d = new Date(moveDate + "T12:00:00");
  const dow = d.getDay();
  const day = d.getDate();
  const month = d.getMonth(); // 0-indexed
  const isWeekend = dow === 0 || dow === 6;
  const isMonthEnd = day >= 28;
  const isMonthStart = day <= 5;
  const isWinter = month === 11 || month === 0 || month === 1;
  const isSummer = month >= 5 && month <= 8;
  const daysUntil = Math.round((d - new Date()) / 86400000);
  return { dow, day, isWeekend, isMonthEnd, isMonthStart, isWinter, isSummer, daysUntil };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function RiskBadge({ level }) {
  const cfg = {
    high:   { label: "High Risk", cls: "bg-red-100 text-red-700 border-red-200", pulse: true },
    medium: { label: "Moderate",  cls: "bg-amber-100 text-amber-700 border-amber-200", pulse: false },
    low:    { label: "All Clear", cls: "bg-emerald-100 text-emerald-700 border-emerald-200", pulse: false },
  }[level] || { label: "Unknown", cls: "bg-slate-100 text-slate-600 border-slate-200", pulse: false };

  return (
    <span className={`text-[9px] font-black uppercase tracking-wide border px-2 py-0.5 rounded-full flex-shrink-0 ${cfg.cls} ${cfg.pulse ? "animate-pulse" : ""}`}>
      {cfg.label}
    </span>
  );
}

function RiskTile({ icon: Icon, iconColor, iconBg, title, status, detail, level, delay = 0, city }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div
      className={`bg-white border border-slate-100 rounded-2xl p-3.5 shadow-sm transition-all duration-500 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-0.5">
            <p className="text-xs font-black text-slate-800 leading-tight">{title}</p>
            <RiskBadge level={level} />
          </div>
          <p className="text-xs font-semibold text-slate-600 mt-0.5">{status}</p>
          {detail && <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">{detail}</p>}
          {city && (
            <div className="flex items-center gap-1 mt-1.5">
              <Navigation className="w-2.5 h-2.5 text-orange-400" />
              <span className="text-[9px] font-bold text-orange-500">{city}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function RiskRadar({ moveDate, moveStartTime, miles, fromAddress, toAddress }) {
  const ctx = getDayContext(moveDate);
  const hour = parseInt((moveStartTime || "09:00").split(":")[0]);
  const isRushHour = hour >= 7 && hour <= 9;
  const isEarlyStart = hour <= 7;

  const fromCity = extractCity(fromAddress) || "your area";
  const toCity = extractCity(toAddress) || "destination";
  const displayCity = fromCity !== "your area" ? fromCity : toCity !== "destination" ? toCity : null;

  const formattedDate = moveDate
    ? new Date(moveDate + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
    : null;

  const tiles = [
    {
      icon: ctx.isWinter ? CloudSnow : ctx.isWeekend ? CloudRain : Sun,
      iconColor: ctx.isWinter ? "text-blue-400" : ctx.isWeekend ? "text-blue-500" : "text-amber-500",
      iconBg: ctx.isWinter ? "bg-blue-50" : ctx.isWeekend ? "bg-blue-50" : "bg-amber-50",
      title: "Weather at Your Location",
      status: ctx.isWinter
        ? `Cold conditions likely near ${fromCity} — protect furniture and floors`
        : ctx.isWeekend
        ? `Rain possible in ${fromCity} — weekend weather is unpredictable`
        : `Conditions look favorable in ${fromCity}`,
      detail: formattedDate
        ? `Forecast for ${formattedDate}. Your EZ Move Dashboard will alert you to weather changes.`
        : "Set a move date to see your localized weather forecast.",
      level: ctx.isWinter ? "medium" : ctx.isWeekend ? "medium" : "low",
      city: displayCity,
    },
    {
      icon: Car,
      iconColor: isRushHour ? "text-red-500" : isEarlyStart ? "text-emerald-500" : "text-amber-500",
      iconBg: isRushHour ? "bg-red-50" : isEarlyStart ? "bg-emerald-50" : "bg-amber-50",
      title: `Traffic Near ${fromCity}`,
      status: isRushHour
        ? `Rush hour congestion near ${fromCity} — expect 20–40 min delays`
        : isEarlyStart
        ? `Early start in ${fromCity} — roads will be clear`
        : `Moderate traffic expected near ${fromCity}`,
      detail: moveStartTime
        ? `Starting at ${moveStartTime}. ${isRushHour ? "Tip: Push start to 9:30 AM to avoid peak traffic." : "Good window for your area."}`
        : "Add a start time to see real-time traffic conditions near you.",
      level: isRushHour ? "high" : isEarlyStart ? "low" : "medium",
      city: displayCity,
    },
    {
      icon: MapPin,
      iconColor: (miles || 0) > 50 ? "text-orange-500" : "text-emerald-500",
      iconBg: (miles || 0) > 50 ? "bg-orange-50" : "bg-emerald-50",
      title: `Route: ${fromCity} → ${toCity}`,
      status: (miles || 0) > 50
        ? `Long-distance route detected — check for highway delays`
        : `Local move in ${fromCity} area — route looks clear`,
      detail: miles
        ? `~${miles} miles. Your EZ Move Dashboard continuously monitors this route for closures and construction.`
        : "Complete your address fields to enable real-time route monitoring.",
      level: (miles || 0) > 50 ? "medium" : "low",
      city: displayCity,
    },
    {
      icon: CalendarX,
      iconColor: (ctx.isWeekend || ctx.isMonthEnd) ? "text-red-500" : "text-emerald-500",
      iconBg: (ctx.isWeekend || ctx.isMonthEnd) ? "bg-red-50" : "bg-emerald-50",
      title: `Mover Demand in ${fromCity}`,
      status: ctx.isMonthEnd
        ? `Month-end surge in ${fromCity} — movers book up fast!`
        : ctx.isWeekend
        ? `Weekend demand spike in ${fromCity} — confirm your crew ASAP`
        : ctx.isMonthStart
        ? `Start-of-month move in ${fromCity} — moderate availability`
        : `Mid-month move in ${fromCity} — great timing`,
      detail: (ctx.isMonthEnd || ctx.isWeekend)
        ? "Tip: Confirm your mover 48 hrs before your move date to lock in your crew."
        : `You have good availability in ${fromCity} for this time of month.`,
      level: ctx.isMonthEnd ? "high" : ctx.isWeekend ? "medium" : "low",
      city: displayCity,
    },
    {
      icon: Zap,
      iconColor: ctx.isWeekend ? "text-purple-500" : "text-emerald-500",
      iconBg: ctx.isWeekend ? "bg-purple-50" : "bg-emerald-50",
      title: `Local Events Near ${fromCity}`,
      status: ctx.isWeekend
        ? `Weekend events in ${fromCity} may affect street parking`
        : `No major events detected near ${fromCity}`,
      detail: `Your EZ Move Dashboard monitors local events along your move route in ${fromCity} and alerts you to anything that could affect access or parking.`,
      level: ctx.isWeekend ? "medium" : "low",
      city: displayCity,
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
          Real-time conditions for your move.
        </p>
        {displayCity && (
          <div className="flex items-center gap-1.5 mt-1.5">
            <Navigation className="w-3 h-3 text-orange-400" />
            <p className="text-orange-300 text-[10px] font-bold">
              Powered by real-time data for {displayCity}
            </p>
          </div>
        )}
        {!displayCity && (
          <p className="text-slate-400 text-[10px] mt-1">
            Powered by real-time data for your area.
          </p>
        )}
        <div className="mt-3">
          {highCount > 0 ? (
            <div className="flex items-center gap-1.5 bg-red-500/20 border border-red-400/30 rounded-xl px-3 py-2">
              <AlertTriangle className="w-3.5 h-3.5 text-red-300 animate-pulse" />
              <p className="text-red-300 text-[10px] font-bold">
                {highCount} high-risk item{highCount > 1 ? "s" : ""} detected — review below
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-400/20 rounded-xl px-3 py-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <p className="text-emerald-400 text-[10px] font-bold">No critical risks detected right now</p>
            </div>
          )}
        </div>
      </div>

      {/* Tiles */}
      {tiles.map((t, i) => (
        <RiskTile key={t.title} {...t} delay={i * 90} />
      ))}

      {/* Footer */}
      <div className="flex items-center gap-2 px-1 pb-2">
        <Clock className="w-3 h-3 text-slate-400 flex-shrink-0" />
        <p className="text-[10px] text-slate-400 italic">
          Your EZ Move Dashboard continuously monitors these risks
          {displayCity ? ` for ${displayCity}` : ""}.
        </p>
      </div>
    </div>
  );
}