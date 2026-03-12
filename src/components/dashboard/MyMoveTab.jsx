import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  AlertTriangle, CheckCircle2, CalendarDays,
  Phone, Star, ChevronDown, ChevronRight, DollarSign
} from "lucide-react";
import { parseISO, differenceInDays, isPast, isToday, format, isWithinInterval, startOfWeek, endOfWeek } from "date-fns";
import SavedInsights from "./SavedInsights";
import MoveDirectory from "./MoveDirectory";

export default function MyMoveTab({ user, onNavigate }) {
  const [appointments, setAppointments] = useState([]);
  const [checklist, setChecklist] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alertsExpanded, setAlertsExpanded] = useState(false);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      base44.entities.Appointment.filter({ user_id: user.id }),
      base44.entities.ChecklistItem.filter({ user_id: user.id }),
      base44.entities.SavedProvider.filter({ user_id: user.id }),
    ]).then(([appts, items, provs]) => {
      setAppointments(appts);
      setChecklist(items);
      setProviders(provs);
      setLoading(false);
    });
  }, [user]);

  const today = new Date();
  const weekStart = startOfWeek(today);
  const weekEnd = endOfWeek(today);

  const overdueAppts = appointments.filter(a => {
    try {
      const d = parseISO(a.date);
      return isPast(d) && !isToday(d) && a.status !== "completed" && a.status !== "cancelled";
    } catch { return false; }
  });

  const thisWeekAppts = appointments.filter(a => {
    try {
      const d = parseISO(a.date);
      return isWithinInterval(d, { start: weekStart, end: weekEnd }) && a.status !== "completed" && a.status !== "cancelled";
    } catch { return false; }
  });

  const completedChecklist = checklist.filter(c => c.completed);
  const checklistPct = checklist.length > 0 ? Math.round((completedChecklist.length / checklist.length) * 100) : 0;

  const daysToClose = user?.close_date
    ? differenceInDays(parseISO(user.close_date), today)
    : null;

  const getPhase = () => {
    if (daysToClose === null) return { label: "Getting Started", emoji: "🏁" };
    if (daysToClose > 21) return { label: "Foundation Phase", emoji: "📋" };
    if (daysToClose > 14) return { label: "Clearing & Logistics", emoji: "📦" };
    if (daysToClose > 7) return { label: "Home Prep Phase", emoji: "🔨" };
    if (daysToClose >= 0) return { label: "Final Move & Close", emoji: "🏠" };
    return { label: "Move Complete!", emoji: "🎉" };
  };
  const phase = getPhase();

  const allAlerts = [
    ...overdueAppts.map(a => ({
      label: `Overdue: ${a.title}`,
      sub: a.date,
      icon: AlertTriangle,
      color: "text-red-500",
      bg: "bg-red-50 border-red-100",
    })),
    ...thisWeekAppts.map(a => ({
      label: a.title,
      sub: format(parseISO(a.date), "EEE, MMM d") + (a.time ? ` · ${a.time}` : ""),
      icon: CalendarDays,
      color: "text-amber-600",
      bg: "bg-amber-50 border-amber-100",
    })),
  ];

  // Use 1 sample alert if no real alerts
  const displayAlerts = allAlerts.length > 0 ? allAlerts : [
    {
      label: "Movers appointment not confirmed",
      sub: "Tap to review your calendar",
      icon: AlertTriangle,
      color: "text-amber-600",
      bg: "bg-amber-50 border-amber-100",
      sample: true,
    }
  ];

  const visibleAlerts = alertsExpanded ? displayAlerts : displayAlerts.slice(0, 1);

  if (loading) return (
    <div className="flex justify-center py-16">
      <div className="w-7 h-7 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const movingCost = user?.moving_cost_estimate || 0;

  return (
    <div className="space-y-3">
      {/* Current Move Cost */}
      {movingCost > 0 && (
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl px-4 py-3 flex items-center gap-3 text-white">
          <DollarSign className="w-6 h-6 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-xs font-semibold text-white/80">Current Move Cost</p>
            <p className="text-2xl font-black">${movingCost.toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* Saved Insights from AI Assist */}
      <SavedInsights user={user} />

      {/* Hero strip — minimal */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl px-4 py-2.5 flex items-center gap-3 text-white">
        <span className="text-lg flex-shrink-0">{phase.emoji}</span>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-black truncate">{phase.label}</p>
          {daysToClose !== null && daysToClose >= 0 && (
            <p className="text-white/70 text-[10px]">{daysToClose} days to closing</p>
          )}
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-sm font-black">{checklistPct}%</p>
          <p className="text-[9px] text-white/70 font-bold uppercase">done</p>
        </div>
      </div>

      {/* Alerts */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="px-4 py-2.5 flex items-center justify-between border-b border-slate-50">
          <p className="text-xs font-bold text-slate-700">🔔 Alerts {allAlerts.length > 0 && `(${allAlerts.length})`}</p>
          {displayAlerts.length > 1 && (
            <button onClick={() => setAlertsExpanded(e => !e)} className="flex items-center gap-0.5 text-[10px] text-orange-500 font-bold">
              {alertsExpanded ? "Collapse" : `Show all (${displayAlerts.length})`}
              <ChevronDown className={`w-3 h-3 transition-transform ${alertsExpanded ? "rotate-180" : ""}`} />
            </button>
          )}
        </div>
        <div className="divide-y divide-slate-50">
          {visibleAlerts.map((alert, i) => (
            <div key={i} className={`flex items-center gap-3 px-4 py-2.5 ${alert.sample ? "opacity-50" : ""}`}>
              <alert.icon className={`w-4 h-4 flex-shrink-0 ${alert.color}`} />
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-bold truncate ${alert.color}`}>{alert.label}</p>
                <p className="text-[10px] text-slate-400">{alert.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* This Week */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="px-4 py-2.5 flex items-center justify-between border-b border-slate-50">
          <p className="text-xs font-bold text-slate-700">📅 This Week</p>
          <button onClick={() => onNavigate("calendar")} className="text-[10px] text-orange-500 font-bold flex items-center gap-0.5">
            View all <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        {thisWeekAppts.length === 0 ? (
          <div className="px-4 py-3 flex items-center justify-between">
            <p className="text-xs text-slate-400">No appointments this week</p>
            <button onClick={() => onNavigate("calendar")} className="text-orange-500 font-bold text-xs">+ Add</button>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {thisWeekAppts.slice(0, 2).map((a, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-2.5">
                <div className="w-7 h-7 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                  <CalendarDays className="w-3.5 h-3.5 text-orange-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate">{a.title}</p>
                  <p className="text-[10px] text-slate-400">{format(parseISO(a.date), "EEE, MMM d")}{a.time ? ` · ${a.time}` : ""}</p>
                </div>
                <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full
                  ${a.status === "scheduled" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                  {a.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booked Service Providers */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="px-4 py-2.5 flex items-center justify-between border-b border-slate-50">
          <p className="text-xs font-bold text-slate-700">📋 Booked Providers ({providers.length})</p>
        </div>
        {providers.length === 0 ? (
          <div className="px-4 py-3">
            <p className="text-xs text-slate-400">No providers booked yet</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {providers.slice(0, 2).map((p, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-2.5">
                <span className="text-base flex-shrink-0">
                  {p.role === "Movers" ? "🚛" : p.role === "Cleaners" ? "✨" : p.role === "Painters" ? "🎨" : p.role === "Junk Removal" ? "🗑️" : p.role === "Estate Sale" ? "🏷️" : "📋"}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate">{p.name}</p>
                  <p className="text-[10px] text-orange-500 font-semibold">{p.role}</p>
                </div>
                <div className="flex items-center gap-2">
                  {p.rating && (
                    <div className="flex items-center gap-0.5">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span className="text-xs font-bold text-amber-700">{p.rating}</span>
                    </div>
                  )}
                  {p.phone && (
                    <a href={`tel:${p.phone}`} className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                      <Phone className="w-3 h-3 text-slate-500" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Move Directory */}
      <MoveDirectory user={user} />

      {/* Quick stats row */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white rounded-2xl border border-slate-100 p-3 text-center">
          <p className="text-xl font-black text-slate-800">{appointments.filter(a => a.status === "completed").length}</p>
          <p className="text-[10px] text-slate-400 font-semibold">Completed</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-3 text-center">
          <p className="text-xl font-black text-orange-500">{overdueAppts.length}</p>
          <p className="text-[10px] text-slate-400 font-semibold">Overdue</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-3 text-center">
          <p className="text-xl font-black text-slate-800">{providers.length}</p>
          <p className="text-[10px] text-slate-400 font-semibold">Providers</p>
        </div>
      </div>

      {/* Closing day banner */}
      {daysToClose !== null && daysToClose >= 0 && (
        <div className="bg-slate-800 rounded-2xl p-3.5 flex items-center gap-3">
          <span className="text-xl flex-shrink-0">🏠</span>
          <div className="flex-1">
            <p className="text-white text-xs font-bold">Closing Day</p>
            <p className="text-slate-400 text-[11px]">
              {user.close_date ? format(parseISO(user.close_date), "MMMM d, yyyy") : ""}
            </p>
          </div>
          <div className="bg-orange-500/20 rounded-xl px-2.5 py-1.5">
            <p className="text-orange-400 text-xs font-black">{daysToClose}d</p>
          </div>
        </div>
      )}
    </div>
  );
}