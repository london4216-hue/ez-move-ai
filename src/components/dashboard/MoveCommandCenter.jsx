import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { AlertTriangle, CalendarDays, CheckCircle2, ChevronRight, Phone, Star, Clock } from "lucide-react";
import { parseISO, differenceInDays, isPast, isToday, format, isWithinInterval, startOfDay, endOfDay, addDays } from "date-fns";

export default function MoveCommandCenter({ user, onNavigate }) {
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
      setAppointments(appts.sort((a, b) => new Date(a.date) - new Date(b.date)));
      setChecklist(items);
      setProviders(provs);
      setLoading(false);
    });
  }, [user]);

  const today = new Date();
  const next7 = addDays(today, 7);

  const pastDue = appointments.filter(a => {
    try {
      return isPast(parseISO(a.date)) && !isToday(parseISO(a.date)) && a.status !== "completed" && a.status !== "cancelled";
    } catch { return false; }
  });

  const upcoming = appointments.filter(a => {
    try {
      const d = parseISO(a.date);
      return isWithinInterval(d, { start: startOfDay(today), end: endOfDay(next7) }) && a.status !== "cancelled";
    } catch { return false; }
  });

  const booked = appointments.filter(a => a.status === "scheduled");

  const completedTasks = checklist.filter(c => c.completed).length;
  const pendingTasks = checklist.filter(c => !c.completed && !c.skipped).length;

  const daysToClose = user?.estimated_close_date
    ? differenceInDays(parseISO(user.estimated_close_date), today)
    : null;

  if (loading) return (
    <div className="flex justify-center py-16">
      <div className="w-7 h-7 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-3">

      {/* Status strip */}
      <div className="grid grid-cols-3 gap-2">
        <div onClick={() => onNavigate("plan")} className="bg-white rounded-2xl border border-slate-100 p-3 text-center cursor-pointer active:scale-95 transition-transform">
          <p className="text-xl font-black text-emerald-500">{completedTasks}</p>
          <p className="text-[9px] text-slate-400 font-bold uppercase">Done</p>
        </div>
        <div onClick={() => onNavigate("plan")} className="bg-white rounded-2xl border border-slate-100 p-3 text-center cursor-pointer active:scale-95 transition-transform">
          <p className="text-xl font-black text-orange-500">{pendingTasks}</p>
          <p className="text-[9px] text-slate-400 font-bold uppercase">To Do</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-3 text-center">
          <p className={`text-xl font-black ${pastDue.length > 0 ? "text-red-500" : "text-slate-700"}`}>{pastDue.length}</p>
          <p className="text-[9px] text-slate-400 font-bold uppercase">Past Due</p>
        </div>
      </div>

      {/* PAST DUE */}
      {pastDue.length > 0 && (
        <div className="bg-red-50 border border-red-100 rounded-2xl overflow-hidden">
          <div className="px-4 py-2.5 flex items-center gap-2 border-b border-red-100">
            <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
            <p className="text-xs font-bold text-red-600">Past Due ({pastDue.length})</p>
          </div>
          <div className="divide-y divide-red-50">
            {pastDue.map(a => (
              <div key={a.id} className="flex items-center gap-3 px-4 py-2.5">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-red-700 truncate">{a.title}</p>
                  <p className="text-[10px] text-red-400">{format(parseISO(a.date), "EEE, MMM d")}{a.time ? ` · ${a.time}` : ""}</p>
                </div>
                <button onClick={() => onNavigate("calendar")} className="text-[10px] text-red-500 font-bold">
                  View
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* UPCOMING (next 7 days) */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="px-4 py-2.5 flex items-center justify-between border-b border-slate-50">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-orange-500" />
            <p className="text-xs font-bold text-slate-700">Next 7 Days</p>
          </div>
          <button onClick={() => onNavigate("calendar")} className="text-[10px] text-orange-500 font-bold flex items-center gap-0.5">
            Calendar <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        {upcoming.length === 0 ? (
          <div className="px-4 py-3 flex items-center justify-between">
            <p className="text-xs text-slate-400">Nothing scheduled this week</p>
            <button onClick={() => onNavigate("calendar")} className="text-orange-500 font-bold text-xs">+ Add</button>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {upcoming.map(a => (
              <div key={a.id} className="flex items-center gap-3 px-4 py-2.5">
                <div className="w-7 h-7 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                  <CalendarDays className="w-3.5 h-3.5 text-orange-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate">{a.title}</p>
                  <p className="text-[10px] text-slate-400">{format(parseISO(a.date), "EEE, MMM d")}{a.time ? ` · ${a.time}` : ""}</p>
                </div>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full flex-shrink-0
                  ${a.status === "scheduled" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>
                  {a.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* BOOKED PROVIDERS */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="px-4 py-2.5 flex items-center justify-between border-b border-slate-50">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <p className="text-xs font-bold text-slate-700">Booked Providers ({providers.length})</p>
          </div>
          <button onClick={() => onNavigate("inventory")} className="text-[10px] text-orange-500 font-bold">
            Manage
          </button>
        </div>
        {providers.length === 0 ? (
          <div className="px-4 py-3 flex items-center justify-between">
            <p className="text-xs text-slate-400">No providers saved yet</p>
            <button onClick={() => onNavigate("inventory")} className="text-orange-500 font-bold text-xs">+ Add</button>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {providers.map(p => (
              <div key={p.id} className="flex items-center gap-3 px-4 py-2.5">
                <span className="text-base flex-shrink-0">
                  {p.role === "Movers" ? "🚛" : p.role === "Cleaners" ? "✨" : p.role === "Painters" ? "🎨" : p.role === "Junk Removal" ? "🗑️" : p.role === "Estate Sale" ? "🏷️" : "📋"}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate">{p.name}</p>
                  <p className="text-[10px] text-orange-500 font-semibold">{p.role || "Provider"}</p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
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
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Closing day */}
      {daysToClose !== null && daysToClose >= 0 && (
        <div className="bg-slate-800 rounded-2xl p-3.5 flex items-center gap-3">
          <span className="text-xl flex-shrink-0">🏠</span>
          <div className="flex-1">
            <p className="text-white text-xs font-bold">Closing Day</p>
            <p className="text-slate-400 text-[11px]">{format(parseISO(user.estimated_close_date), "MMMM d, yyyy")}</p>
          </div>
          <div className="bg-orange-500/20 rounded-xl px-2.5 py-1.5">
            <p className="text-orange-400 text-xs font-black">{daysToClose}d</p>
          </div>
        </div>
      )}
    </div>
  );
}