import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { format, parseISO, differenceInDays } from "date-fns";
import { CalendarDays, X, Phone, MapPin, Clock, FileText, Truck, Sparkles, Wrench } from "lucide-react";

const ROLE_ICON = {
  Mover: "🚛", Movers: "🚛",
  Cleaner: "🧹", Cleaning: "🧹",
  Painter: "🎨", Painters: "🎨",
  Inspector: "🔍", Inspection: "🔍",
  Walkthrough: "🏠",
  "Estate Sale": "🏷️",
  Agent: "🤝", Broker: "🤝",
  default: "📅",
};

function getIcon(title = "", role = "") {
  for (const [key, icon] of Object.entries(ROLE_ICON)) {
    if (key === "default") continue;
    if (title.toLowerCase().includes(key.toLowerCase()) || role.toLowerCase().includes(key.toLowerCase())) return icon;
  }
  return ROLE_ICON.default;
}

function urgencyColor(daysAway) {
  if (daysAway < 0) return "bg-slate-100 border-slate-200 text-slate-400";
  if (daysAway === 0) return "bg-red-50 border-red-300 text-red-700";
  if (daysAway <= 3) return "bg-orange-50 border-orange-300 text-orange-700";
  if (daysAway <= 7) return "bg-amber-50 border-amber-300 text-amber-700";
  return "bg-blue-50 border-blue-200 text-blue-700";
}

function urgencyLabel(daysAway) {
  if (daysAway < 0) return "Past";
  if (daysAway === 0) return "TODAY";
  if (daysAway === 1) return "Tomorrow";
  return `In ${daysAway}d`;
}

export default function UpcomingEvents({ user }) {
  const [events, setEvents] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!user?.id) return;
    const today = new Date().toISOString().split("T")[0];
    Promise.all([
      base44.entities.Appointment.filter({ user_id: user.id }),
      base44.entities.Contact.filter({ user_id: user.id }),
    ]).then(([appts, contacts]) => {
      const apptEvents = appts
        .filter(a => a.date && a.status !== "cancelled")
        .map(a => ({
          id: a.id,
          type: "appointment",
          title: a.title,
          provider: a.provider_name || "",
          date: a.date,
          time: a.time || "",
          phone: a.phone || "",
          notes: a.notes || "",
          status: a.status,
          raw: a,
        }));

      const contactEvents = contacts
        .filter(c => c.service_date)
        .map(c => ({
          id: c.id,
          type: "contact",
          title: c.role || c.name,
          provider: c.name,
          date: c.service_date,
          time: "",
          phone: c.phone || "",
          notes: c.notes || "",
          cost: c.cost_of_service,
          raw: c,
        }));

      const all = [...apptEvents, ...contactEvents]
        .filter(e => e.date >= today)
        .sort((a, b) => a.date.localeCompare(b.date));

      setEvents(all);
    });
  }, [user?.id]);

  if (events.length === 0) return null;

  const today = new Date().toISOString().split("T")[0];

  return (
    <>
      <div className="mb-4">
        <div className="flex items-center gap-1.5 mb-2 px-0.5">
          <CalendarDays className="w-3.5 h-3.5 text-orange-500" />
          <p className="text-xs font-bold text-slate-700">Upcoming Events</p>
          <span className="text-[10px] font-bold text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded-full">{events.length}</span>
        </div>

        <div className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar">
          {events.map(ev => {
            const daysAway = differenceInDays(parseISO(ev.date), new Date());
            const colors = urgencyColor(daysAway);
            const icon = getIcon(ev.title, ev.provider);
            return (
              <button
                key={`${ev.type}-${ev.id}`}
                onClick={() => setSelected(ev)}
                className={`flex-shrink-0 w-36 rounded-2xl border px-3 py-2.5 text-left transition-all active:scale-95 ${colors}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-lg">{icon}</span>
                  <span className={`text-[9px] font-black uppercase tracking-wide px-1.5 py-0.5 rounded-full ${daysAway === 0 ? "bg-red-500 text-white" : daysAway <= 3 ? "bg-orange-500 text-white" : "bg-white/60 text-current"}`}>
                    {urgencyLabel(daysAway)}
                  </span>
                </div>
                <p className="text-[11px] font-bold leading-tight truncate">{ev.title}</p>
                {ev.provider && ev.provider !== ev.title && (
                  <p className="text-[10px] opacity-70 truncate mt-0.5">{ev.provider}</p>
                )}
                <p className="text-[10px] font-semibold mt-1 opacity-80">
                  {format(parseISO(ev.date), "MMM d")}{ev.time ? ` · ${ev.time}` : ""}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center">
          <div className="w-full max-w-md bg-white rounded-t-3xl shadow-2xl pb-8">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{getIcon(selected.title, selected.provider)}</span>
                <div>
                  <h3 className="text-base font-black text-slate-800 leading-tight">{selected.title}</h3>
                  {selected.provider && selected.provider !== selected.title && (
                    <p className="text-xs text-slate-500">{selected.provider}</p>
                  )}
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            <div className="px-5 pt-4 space-y-3">
              <div className="flex items-center gap-3 bg-orange-50 rounded-2xl px-4 py-3">
                <CalendarDays className="w-4 h-4 text-orange-500 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-orange-700">{format(parseISO(selected.date), "EEEE, MMMM d, yyyy")}</p>
                  {selected.time && <p className="text-xs text-orange-500 font-semibold">{selected.time}</p>}
                </div>
              </div>

              {selected.phone && (
                <a href={`tel:${selected.phone}`} className="flex items-center gap-3 bg-slate-50 rounded-2xl px-4 py-3 hover:bg-slate-100 transition-colors">
                  <Phone className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Phone</p>
                    <p className="text-sm font-bold text-slate-700">{selected.phone}</p>
                  </div>
                </a>
              )}

              {selected.cost > 0 && (
                <div className="flex items-center gap-3 bg-emerald-50 rounded-2xl px-4 py-3">
                  <span className="text-emerald-500 font-black text-lg flex-shrink-0">$</span>
                  <div>
                    <p className="text-[10px] font-semibold text-emerald-500 uppercase tracking-wide">Estimated Cost</p>
                    <p className="text-sm font-bold text-emerald-700">${Number(selected.cost).toLocaleString()}</p>
                  </div>
                </div>
              )}

              {selected.status && (
                <div className="flex items-center gap-3 bg-slate-50 rounded-2xl px-4 py-3">
                  <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Status</p>
                    <p className="text-sm font-bold text-slate-700 capitalize">{selected.status}</p>
                  </div>
                </div>
              )}

              {selected.notes && (
                <div className="flex items-start gap-3 bg-slate-50 rounded-2xl px-4 py-3">
                  <FileText className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Notes</p>
                    <p className="text-sm text-slate-600 leading-relaxed">{selected.notes}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}