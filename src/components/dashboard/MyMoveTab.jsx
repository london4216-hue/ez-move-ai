import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  AlertTriangle, CheckCircle2, CalendarDays, Users, Package,
  TrendingUp, Clock, ChevronRight, Phone, Star, LayoutList
} from "lucide-react";
import { parseISO, differenceInDays, isPast, isToday, format, addDays, isWithinInterval, startOfWeek, endOfWeek } from "date-fns";

export default function MyMoveTab({ user, onNavigate }) {
  const [appointments, setAppointments] = useState([]);
  const [checklist, setChecklist] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // --- Alerts ---
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

  const overdueChecklist = checklist.filter(c => !c.completed && !c.skipped);
  const completedChecklist = checklist.filter(c => c.completed);
  const checklistPct = checklist.length > 0 ? Math.round((completedChecklist.length / checklist.length) * 100) : 0;

  // Days to close
  const daysToClose = user?.close_date
    ? differenceInDays(parseISO(user.close_date), today)
    : null;

  // Move phase label
  const getPhase = () => {
    if (daysToClose === null) return { label: "Getting Started", emoji: "🏁", color: "text-slate-600" };
    if (daysToClose > 21) return { label: "Foundation Phase", emoji: "📋", color: "text-blue-600" };
    if (daysToClose > 14) return { label: "Clearing & Logistics", emoji: "📦", color: "text-purple-600" };
    if (daysToClose > 7) return { label: "Home Prep Phase", emoji: "🔨", color: "text-amber-600" };
    if (daysToClose >= 0) return { label: "Final Move & Close", emoji: "🏠", color: "text-orange-600" };
    return { label: "Move Complete!", emoji: "🎉", color: "text-green-600" };
  };
  const phase = getPhase();

  const allAlerts = [
    ...overdueAppts.map(a => ({
      type: "overdue",
      label: `Overdue: ${a.title}`,
      sub: a.date,
      icon: AlertTriangle,
      color: "text-red-500",
      bg: "bg-red-50 border-red-100",
    })),
    ...thisWeekAppts.map(a => ({
      type: "week",
      label: a.title,
      sub: format(parseISO(a.date), "EEE, MMM d") + (a.time ? ` · ${a.time}` : ""),
      icon: CalendarDays,
      color: "text-amber-600",
      bg: "bg-amber-50 border-amber-100",
    })),
  ];

  if (loading) return (
    <div className="flex justify-center py-16">
      <div className="w-7 h-7 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Hero card — move phase */}
      <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl p-5 text-white">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-white/70 text-[11px] font-bold uppercase tracking-wider mb-1">Current Phase</p>
            <p className="text-xl font-black">{phase.emoji} {phase.label}</p>
            {daysToClose !== null && daysToClose >= 0 && (
              <p className="text-white/80 text-sm mt-1 font-semibold">{daysToClose} days until closing</p>
            )}
            {user?.home_address && (
              <p className="text-white/60 text-[11px] mt-1 truncate max-w-[200px]">{user.home_address}</p>
            )}
          </div>
          <div className="bg-white/20 rounded-2xl px-3 py-2 text-center min-w-[52px]">
            <p className="text-2xl font-black">{checklistPct}%</p>
            <p className="text-[9px] text-white/70 font-bold uppercase">done</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-700"
              style={{ width: `${checklistPct}%` }}
            />
          </div>
          <div className="flex justify-between mt-1.5">
            <p className="text-[10px] text-white/60 font-semibold">{completedChecklist.length} tasks done</p>
            <p className="text-[10px] text-white/60 font-semibold">{checklist.length - completedChecklist.length} remaining</p>
          </div>
        </div>
      </div>

      {/* Alerts section */}
      {allAlerts.length > 0 && (
        <div className="space-y-2">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            🔔 Alerts ({allAlerts.length})
          </p>
          {allAlerts.map((alert, i) => (
            <div key={i} className={`rounded-2xl p-3.5 border flex items-start gap-3 ${alert.bg}`}>
              <alert.icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${alert.color}`} />
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-bold ${alert.color}`}>{alert.label}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{alert.sub}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* This week at a glance */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="px-4 py-3 flex items-center justify-between border-b border-slate-50">
          <p className="text-xs font-bold text-slate-700">📅 This Week</p>
          <button onClick={() => onNavigate("calendar")} className="text-[10px] text-orange-500 font-bold flex items-center gap-0.5">
            View all <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        {thisWeekAppts.length === 0 ? (
          <div className="px-4 py-5 text-center">
            <p className="text-xs text-slate-400">No appointments this week</p>
            <button onClick={() => onNavigate("calendar")} className="text-orange-500 font-bold text-xs mt-1">+ Add one</button>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {thisWeekAppts.slice(0, 4).map((a, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
                  <CalendarDays className="w-4 h-4 text-orange-400" />
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

      {/* My Providers */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="px-4 py-3 flex items-center justify-between border-b border-slate-50">
          <p className="text-xs font-bold text-slate-700">📋 Booked Service Providers ({providers.length})</p>
          <button onClick={() => onNavigate("ai")} className="text-[10px] text-orange-500 font-bold flex items-center gap-0.5">
            Find more <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        {providers.length === 0 ? (
          <div className="px-4 py-5 text-center">
            <p className="text-xs text-slate-400">No providers saved yet</p>
            <button onClick={() => onNavigate("ai")} className="text-orange-500 font-bold text-xs mt-1">Browse AI Center →</button>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {providers.map((p, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 text-base">
                  {p.role === "Movers" ? "🚛" : p.role === "Cleaners" ? "✨" : p.role === "Painters" ? "🎨" : p.role === "Junk Removal" ? "🗑️" : p.role === "Estate Sale" ? "🏷️" : p.role === "Donation" ? "🫶" : "📋"}
                </div>
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
                    <a href={`tel:${p.phone}`} className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center hover:bg-orange-100 transition-colors">
                      <Phone className="w-3.5 h-3.5 text-slate-500" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-white rounded-2xl border border-slate-100 p-3.5 text-center">
          <p className="text-2xl font-black text-slate-800">{appointments.filter(a => a.status === "completed").length}</p>
          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Completed</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-3.5 text-center">
          <p className="text-2xl font-black text-orange-500">{overdueAppts.length}</p>
          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Overdue</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-3.5 text-center">
          <p className="text-2xl font-black text-slate-800">{providers.length}</p>
          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Team Size</p>
        </div>
      </div>

      {/* Upcoming milestone */}
      {daysToClose !== null && daysToClose >= 0 && (
        <div className="bg-slate-800 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center flex-shrink-0 text-lg">🏠</div>
          <div className="flex-1">
            <p className="text-white text-xs font-bold">Closing Day</p>
            <p className="text-slate-400 text-[11px]">
              {user.close_date ? format(parseISO(user.close_date), "MMMM d, yyyy") : ""} · {daysToClose} days away
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