import { useState } from "react";
import { CalendarDays, Download, ChevronDown } from "lucide-react";
import { format, parseISO } from "date-fns";

function toICSDate(dateStr, timeStr) {
  // Returns YYYYMMDDTHHMMSS or YYYYMMDD
  const d = parseISO(dateStr);
  if (timeStr) {
    const [hours, mins] = timeStr.split(":");
    const dt = new Date(d);
    dt.setHours(parseInt(hours), parseInt(mins), 0);
    return format(dt, "yyyyMMdd'T'HHmmss");
  }
  return format(d, "yyyyMMdd");
}

function buildICS(appointments) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//EZ Move AI//Move Calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ];

  appointments.forEach((a) => {
    const uid = `${a.id}@ezmoveai`;
    const dtStamp = format(new Date(), "yyyyMMdd'T'HHmmss'Z'");
    const dtStart = toICSDate(a.date, a.time);
    const dtEnd = a.time ? dtStart : format(parseISO(a.date), "yyyyMMdd"); // all-day ends same day

    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${uid}`);
    lines.push(`DTSTAMP:${dtStamp}`);
    if (a.time) {
      lines.push(`DTSTART:${dtStart}`);
      lines.push(`DTEND:${dtStart}`); // same time, 0-duration; user can stretch
    } else {
      lines.push(`DTSTART;VALUE=DATE:${dtStart}`);
      lines.push(`DTEND;VALUE=DATE:${dtEnd}`);
    }
    lines.push(`SUMMARY:${(a.title || "").replace(/,/g, "\\,")}`);
    if (a.provider_name) lines.push(`DESCRIPTION:Provider: ${a.provider_name}${a.notes ? "\\n" + a.notes : ""}`);
    else if (a.notes) lines.push(`DESCRIPTION:${a.notes.replace(/\n/g, "\\n")}`);
    lines.push(`STATUS:${a.status === "completed" ? "COMPLETED" : "CONFIRMED"}`);
    lines.push("END:VEVENT");
  });

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

export default function ExportCalendarButton({ appointments }) {
  const [open, setOpen] = useState(false);

  const downloadICS = () => {
    const ics = buildICS(appointments);
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "my-move-calendar.ics";
    a.click();
    URL.revokeObjectURL(url);
    setOpen(false);
  };

  const googleCalendarUrl = (appt) => {
    const base = "https://calendar.google.com/calendar/render?action=TEMPLATE";
    const dates = appt.time
      ? `${toICSDate(appt.date, appt.time)}/${toICSDate(appt.date, appt.time)}`
      : `${format(parseISO(appt.date), "yyyyMMdd")}/${format(parseISO(appt.date), "yyyyMMdd")}`;
    return `${base}&text=${encodeURIComponent(appt.title)}&dates=${dates}&details=${encodeURIComponent(appt.notes || "")}`;
  };

  if (!appointments || appointments.length === 0) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 border border-orange-200 text-orange-600 text-xs font-bold hover:bg-orange-100 transition-colors"
      >
        <CalendarDays className="w-3.5 h-3.5" />
        Sync Calendar
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-9 z-20 bg-white rounded-2xl shadow-xl border border-slate-100 w-56 overflow-hidden">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-4 pt-3 pb-1">Export all appointments</p>

            {/* Download .ics */}
            <button
              onClick={downloadICS}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left"
            >
              <span className="text-lg">📅</span>
              <div>
                <p className="text-xs font-bold text-slate-800">Apple / Outlook</p>
                <p className="text-[10px] text-slate-400">Download .ics file</p>
              </div>
              <Download className="w-3.5 h-3.5 text-slate-400 ml-auto" />
            </button>

            {/* Google Calendar — opens first appointment as example, or bulk */}
            <a
              href={googleCalendarUrl(appointments[0])}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors"
            >
              <span className="text-lg">🗓️</span>
              <div>
                <p className="text-xs font-bold text-slate-800">Google Calendar</p>
                <p className="text-[10px] text-slate-400">Add next appointment</p>
              </div>
            </a>

            <div className="border-t border-slate-100 mx-3 my-1" />
            <p className="text-[9px] text-slate-400 px-4 pb-3 pt-1 leading-relaxed">
              .ics works with Apple Calendar, Outlook, and any calendar app.
            </p>
          </div>
        </>
      )}
    </div>
  );
}