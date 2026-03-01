import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval,
  isSameDay, addMonths, subMonths, isPast, isToday, addDays, getISOWeek, startOfWeek, endOfWeek
} from "date-fns";
import { ChevronLeft, ChevronRight, Plus, X, Pencil, Trash2 } from "lucide-react";

const statusColors = {
  scheduled: "#059669",
  tentative: "#F59E0B",
  completed: "#6B7280",
  cancelled: "#EF4444"
};

// Week data for auto-placement
const WEEK_DATA = {
  1: { title: "Week 1 — Foundation Week", items: ["Confirm what stays vs. goes", "Estate sale decision", "Request mover quotes", "Start donation / sell pile"] },
  2: { title: "Week 2 — Clearing & Logistics", items: ["Finalize mover", "Schedule estate sale", "Order packing supplies", "Begin packing non-essentials", "Utility planning"] },
  3: { title: "Week 3 — Home Prep Week", items: ["Painting (if needed)", "Junk removal", "Deep cleaning", "Patch & repair checklist"] },
  4: { title: "Week 4 — Final Move & Close", items: ["Final packing", "Move-out day guidance", "Utility transfers", "Final clean", "Closing day checklist"] }
};

export default function CalendarSheet({ user }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [autoPlaced, setAutoPlaced] = useState(new Set());
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingAppt, setEditingAppt] = useState(null);
  const [form, setForm] = useState({ title: "", provider_name: "", phone: "", date: "", time: "", notes: "", status: "tentative" });

  const load = async () => {
    if (!user) return;
    const data = await base44.entities.Appointment.filter({ user_id: user.id });
    setAppointments(data);
    
    // Auto-place week tasks if not already placed
    if (user.close_date && data.length === 0) {
      autoPlaceWeekTasks(user);
    }
  };

  const autoPlaceWeekTasks = (userData) => {
    if (!userData.close_date) return;
    const closeDate = parseISO(userData.close_date);
    const tasks = [];
    
    // Calculate week start dates working backwards from close date
    for (let week = 4; week >= 1; week--) {
      const weekStart = addDays(closeDate, -(5 - week) * 7);
      const weekItems = WEEK_DATA[week]?.items || [];
      
      weekItems.forEach((title, idx) => {
        const taskDate = addDays(weekStart, idx);
        tasks.push({
          title,
          date: format(taskDate, "yyyy-MM-dd"),
          user_id: userData.id,
          status: "tentative",
          alert_sent: false
        });
      });
    }
    
    // Create appointments for auto-placed tasks
    if (tasks.length > 0) {
      tasks.forEach(task => base44.entities.Appointment.create(task).catch(() => {}));
      setAutoPlaced(new Set(tasks.map(t => t.title)));
    }
  };

  useEffect(() => { load(); }, [user]);

  const days = eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) });
  const startPad = startOfMonth(currentMonth).getDay();

  const apptForDay = (day) => appointments.filter(a => {
    try { return isSameDay(parseISO(a.date), day); } catch { return false; }
  });

  const isOverdue = (appt) => {
    try {
      const d = parseISO(appt.date);
      return isPast(d) && !isToday(d) && appt.status !== "completed" && appt.status !== "cancelled";
    } catch { return false; }
  };

  const openNew = (day) => {
    setEditingAppt(null);
    setForm({ title: "", provider_name: "", phone: "", date: format(day, "yyyy-MM-dd"), time: "", notes: "", status: "tentative" });
    setShowForm(true);
  };

  const openEdit = (appt) => {
    setEditingAppt(appt);
    setForm({ title: appt.title, provider_name: appt.provider_name || "", phone: appt.phone || "", date: appt.date, time: appt.time || "", notes: appt.notes || "", status: appt.status || "tentative" });
    setShowForm(true);
    setSelected(null);
  };

  const save = async () => {
    if (!form.title || !form.date) return;
    if (editingAppt) {
      await base44.entities.Appointment.update(editingAppt.id, { ...form });
    } else {
      await base44.entities.Appointment.create({ ...form, user_id: user.id });
    }
    setShowForm(false);
    setSelected(null);
    load();
  };

  const remove = async (id) => {
    await base44.entities.Appointment.delete(id);
    setSelected(null);
    load();
  };

  // Upcoming appointments sorted
  const upcomingAndOverdue = [...appointments]
    .sort((a, b) => {
      try { return parseISO(a.date) - parseISO(b.date); } catch { return 0; }
    });

  const overdueAppts = upcomingAndOverdue.filter(isOverdue);
  const futureAppts = upcomingAndOverdue.filter(a => !isOverdue(a));

  return (
    <div className="flex flex-col gap-3 pb-4">
      {/* Mini calendar */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#F3F4F6]">
          <button onClick={() => setCurrentMonth(m => subMonths(m, 1))}><ChevronLeft className="w-4 h-4 text-[#6B7280]" /></button>
          <p className="text-sm font-bold text-[#1A1A2E]">{format(currentMonth, "MMMM yyyy")}</p>
          <button onClick={() => setCurrentMonth(m => addMonths(m, 1))}><ChevronRight className="w-4 h-4 text-[#6B7280]" /></button>
        </div>

        <div className="grid grid-cols-7 px-2 pt-2">
          {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d => (
            <p key={d} className="text-center text-[9px] font-bold text-[#9CA3AF] pb-1">{d}</p>
          ))}
        </div>

        <div className="grid grid-cols-7 px-2 pb-3 gap-0.5">
          {Array(startPad).fill(null).map((_, i) => <div key={`pad-${i}`} />)}
          {days.map(day => {
            const dayAppts = apptForDay(day);
            const today = isToday(day);
            const hasOverdue = dayAppts.some(isOverdue);
            const isSelected = selected && isSameDay(selected, day);
            return (
              <button
                key={day.toISOString()}
                onClick={() => dayAppts.length > 0 ? setSelected(day) : openNew(day)}
                className={`relative flex flex-col items-center py-1.5 rounded-lg transition-all
                  ${today ? "bg-[#FFF7ED]" : isSelected ? "bg-[#F97316]/10" : "hover:bg-[#F5F3EF]"}`}
              >
                <span className={`text-[11px] font-semibold
                  ${today ? "text-[#F97316]" : hasOverdue ? "text-[#EF4444]" : "text-[#1A1A2E]"}`}>
                  {format(day, "d")}
                </span>
                {dayAppts.length > 0 && (
                  <div className="flex gap-0.5 mt-0.5">
                    {dayAppts.slice(0, 2).map((a, i) => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: isOverdue(a) ? "#EF4444" : (statusColors[a.status] || "#F97316") }} />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Day detail */}
        {selected && (
          <div className="border-t border-[#F3F4F6] px-3 py-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-[#1A1A2E]">{format(selected, "EEEE, MMM d")}</p>
              <div className="flex gap-2">
                <button onClick={() => openNew(selected)} className="flex items-center gap-1 text-[10px] text-[#F97316] font-bold">
                  <Plus className="w-3 h-3" /> Add
                </button>
                <button onClick={() => setSelected(null)}><X className="w-4 h-4 text-[#9CA3AF]" /></button>
              </div>
            </div>
            <div className="space-y-2">
              {apptForDay(selected).map(a => (
                <div key={a.id} className={`flex items-start gap-2 rounded-xl p-2.5 ${isOverdue(a) ? "bg-[#FEF2F2] border border-[#FECACA]" : "bg-[#F5F3EF]"}`}>
                  <div className="w-2 h-2 rounded-full mt-1 flex-shrink-0" style={{ backgroundColor: isOverdue(a) ? "#EF4444" : statusColors[a.status] }} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-bold ${isOverdue(a) ? "text-[#EF4444]" : "text-[#1A1A2E]"}`}>{a.title}</p>
                    {isOverdue(a) && <p className="text-[9px] font-bold text-[#EF4444] uppercase tracking-wide">Overdue</p>}
                    {a.provider_name && <p className="text-[10px] text-[#6B7280]">{a.provider_name}</p>}
                    {a.time && <p className="text-[10px] text-[#F97316] font-semibold">{a.time}</p>}
                    {a.notes && <p className="text-[10px] text-[#6B7280] mt-0.5">{a.notes}</p>}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(a)} className="p-1"><Pencil className="w-3 h-3 text-[#9CA3AF]" /></button>
                    <button onClick={() => remove(a.id)} className="p-1"><Trash2 className="w-3 h-3 text-[#EF4444]" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add/Edit form */}
        {showForm && (
          <div className="border-t border-[#F3F4F6] px-3 py-3 bg-[#FAFAFA]">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-[#1A1A2E]">{editingAppt ? "Edit Appointment" : "New Appointment"}</p>
              <button onClick={() => setShowForm(false)}><X className="w-4 h-4 text-[#9CA3AF]" /></button>
            </div>
            <div className="space-y-2">
              <input placeholder="Title *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-[#E5E7EB] text-xs focus:outline-none focus:border-[#F97316]" />
              <input placeholder="Provider / Company" value={form.provider_name} onChange={e => setForm(f => ({ ...f, provider_name: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-[#E5E7EB] text-xs focus:outline-none focus:border-[#F97316]" />
              <div className="flex gap-2">
                <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  className="flex-1 px-3 py-2 rounded-xl border border-[#E5E7EB] text-xs focus:outline-none focus:border-[#F97316]" />
                <input type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                  className="flex-1 px-3 py-2 rounded-xl border border-[#E5E7EB] text-xs focus:outline-none focus:border-[#F97316]" />
              </div>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-[#E5E7EB] text-xs focus:outline-none focus:border-[#F97316]">
                <option value="tentative">Tentative</option>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <textarea placeholder="Notes" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2}
                className="w-full px-3 py-2 rounded-xl border border-[#E5E7EB] text-xs focus:outline-none focus:border-[#F97316] resize-none" />
              <button onClick={save} className="w-full py-2 rounded-xl bg-[#F97316] text-white text-xs font-bold">
                {editingAppt ? "Save Changes" : "Add Appointment"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Overdue section */}
      {overdueAppts.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-2.5 border-b border-[#FEE2E2] bg-[#FEF2F2]">
            <p className="text-xs font-bold text-[#EF4444]">⚠️ Overdue ({overdueAppts.length})</p>
          </div>
          <div className="divide-y divide-[#F3F4F6]">
            {overdueAppts.map(a => (
              <div key={a.id} className="flex items-center gap-3 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-[#EF4444]">{a.title}</p>
                  <p className="text-[10px] text-[#9CA3AF]">{a.date} {a.time && `· ${a.time}`}</p>
                  {a.provider_name && <p className="text-[10px] text-[#6B7280]">{a.provider_name}</p>}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(a)} className="p-1"><Pencil className="w-3 h-3 text-[#9CA3AF]" /></button>
                  <button onClick={() => remove(a.id)} className="p-1"><Trash2 className="w-3 h-3 text-[#EF4444]" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming section */}
      {futureAppts.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-2.5 border-b border-[#F3F4F6]">
            <p className="text-xs font-bold text-[#1A1A2E]">Upcoming</p>
          </div>
          <div className="divide-y divide-[#F3F4F6]">
            {futureAppts.map(a => (
              <div key={a.id} className="flex items-center gap-3 px-4 py-3">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: statusColors[a.status] || "#F97316" }} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-[#1A1A2E]">{a.title}</p>
                  <p className="text-[10px] text-[#9CA3AF]">{a.date} {a.time && `· ${a.time}`}</p>
                  {a.provider_name && <p className="text-[10px] text-[#6B7280]">{a.provider_name}</p>}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(a)} className="p-1"><Pencil className="w-3 h-3 text-[#9CA3AF]" /></button>
                  <button onClick={() => remove(a.id)} className="p-1"><Trash2 className="w-3 h-3 text-[#EF4444]" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {appointments.length === 0 && (
        <div className="bg-white rounded-2xl shadow-sm px-4 py-8 text-center">
          <p className="text-2xl mb-2">📅</p>
          <p className="text-sm font-semibold text-[#1A1A2E]">No appointments yet</p>
          <p className="text-xs text-[#9CA3AF] mt-1">Tap a date on the calendar to add one</p>
        </div>
      )}
    </div>
  );
}