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
    <div className="space-y-4">
      
      {/* Closing day banner */}
      {daysToClose !== null && daysToClose >= 0 && (
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-4 flex items-center justify-between">
          <div className="text-white">
            <p className="text-xs font-bold opacity-90">CLOSING IN</p>
            <p className="text-2xl font-black">{daysToClose} days</p>
            <p className="text-xs opacity-75 mt-0.5">{format(parseISO(user.estimated_close_date), "MMM d")}</p>
          </div>
          <span className="text-3xl">🏠</span>
        </div>
      )}

      {/* Status pills */}
      <div className="flex gap-2">
        <button onClick={() => onNavigate("plan")} className="flex-1 bg-emerald-50 rounded-xl p-3 text-center active:scale-95 transition-transform border border-emerald-100">
          <p className="text-lg font-black text-emerald-600">{completedTasks}</p>
          <p className="text-[9px] text-emerald-600/60 font-bold mt-0.5">Done</p>
        </button>
        <button onClick={() => onNavigate("plan")} className="flex-1 bg-orange-50 rounded-xl p-3 text-center active:scale-95 transition-transform border border-orange-100">
          <p className="text-lg font-black text-orange-600">{pendingTasks}</p>
          <p className="text-[9px] text-orange-600/60 font-bold mt-0.5">To Do</p>
        </button>
        {pastDue.length > 0 && (
          <button className="flex-1 bg-red-50 rounded-xl p-3 text-center border border-red-100">
            <p className="text-lg font-black text-red-600">{pastDue.length}</p>
            <p className="text-[9px] text-red-600/60 font-bold mt-0.5">Past Due</p>
          </button>
        )}
      </div>

      {/* Main content - only if something to show */}
      {upcoming.length > 0 || providers.length > 0 ? (
        <>
          {/* Upcoming appointments */}
          {upcoming.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <div className="px-4 py-3 flex items-center gap-2 border-b border-slate-50">
                <Clock className="w-4 h-4 text-orange-500" />
                <p className="text-xs font-bold text-slate-700">This Week</p>
              </div>
              <div className="divide-y divide-slate-50">
                {upcoming.slice(0, 3).map(a => (
                  <div key={a.id} className="px-4 py-3 flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800">{a.title}</p>
                      <p className="text-[10px] text-slate-400">{format(parseISO(a.date), "EEE")}, {a.time || "All day"}</p>
                    </div>
                  </div>
                ))}
              </div>
              {upcoming.length > 3 && (
                <button onClick={() => onNavigate("calendar")} className="w-full p-3 text-orange-500 text-xs font-bold border-t border-slate-50 hover:bg-orange-50 transition-colors">
                  View calendar →
                </button>
              )}
            </div>
          )}

          {/* Providers */}
          {providers.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <div className="px-4 py-3 flex items-center gap-2 border-b border-slate-50">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <p className="text-xs font-bold text-slate-700">Providers ({providers.length})</p>
              </div>
              <div className="divide-y divide-slate-50">
                {providers.slice(0, 2).map(p => (
                  <div key={p.id} className="px-4 py-3 flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800">{p.name}</p>
                      <p className="text-[10px] text-slate-400">{p.role}{p.rating && ` · ${p.rating}★`}</p>
                    </div>
                    {p.phone && (
                      <a href={`tel:${p.phone}`} className="w-7 h-7 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                        <Phone className="w-3.5 h-3.5 text-green-600" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
              {providers.length > 2 && (
                <button onClick={() => onNavigate("inventory")} className="w-full p-3 text-orange-500 text-xs font-bold border-t border-slate-50 hover:bg-orange-50 transition-colors">
                  See all providers →
                </button>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 text-center">
          <p className="text-sm text-slate-500 font-medium">Let's get started!</p>
          <div className="flex gap-2 mt-3">
            <button onClick={() => onNavigate("calendar")} className="flex-1 text-xs font-bold text-orange-500 bg-orange-50 rounded-lg py-2 active:scale-95">
              + Appointments
            </button>
            <button onClick={() => onNavigate("inventory")} className="flex-1 text-xs font-bold text-orange-500 bg-orange-50 rounded-lg py-2 active:scale-95">
              + Providers
            </button>
          </div>
        </div>
      )}
    </div>
  );
}