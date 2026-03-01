import { useState } from "react";
import { X, Phone, Calendar, Clock, Check, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

const TIME_SLOTS = ["8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"];

export default function ProviderAppointmentModal({ provider, checklistItem, user, onClose, onSaved }) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSchedule = async () => {
    if (!date) return;
    setSaving(true);
    await base44.entities.Appointment.create({
      user_id: user?.id,
      title: `${checklistItem} — ${provider.name}`,
      provider_name: provider.name,
      phone: provider.phone || "",
      date,
      time: time || "",
      notes,
      status: "scheduled"
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => {
      onSaved?.();
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center">
      <div className="bg-white w-full max-w-md rounded-t-3xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-[#F3F4F6]">
          <div>
            <h2 className="text-base font-bold text-[#1A1A2E]">Schedule Appointment</h2>
            <p className="text-[11px] text-[#6B7280]">{checklistItem}</p>
          </div>
          <button onClick={onClose} className="p-1"><X className="w-5 h-5 text-[#6B7280]" /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {/* Provider Card */}
          <div className="bg-[#FFF7ED] border border-[#FED7AA] rounded-2xl px-4 py-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#F97316] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {provider.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-[#1A1A2E]">{provider.name}</p>
              <p className="text-[10px] text-[#D97706] font-semibold">⭐ {provider.rating}</p>
              {provider.phone && (
                <a href={`tel:${provider.phone}`} className="flex items-center gap-1 text-[11px] text-[#F97316] font-semibold mt-0.5">
                  <Phone className="w-3 h-3" />{provider.phone}
                </a>
              )}
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="text-xs font-bold text-[#1A1A2E] flex items-center gap-1.5 mb-2">
              <Calendar className="w-3.5 h-3.5 text-[#F97316]" /> Preferred Date
            </label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="w-full px-3 py-2.5 rounded-xl border border-[#E5E7EB] text-sm focus:outline-none focus:border-[#F97316] bg-white"
            />
          </div>

          {/* Time slots */}
          <div>
            <label className="text-xs font-bold text-[#1A1A2E] flex items-center gap-1.5 mb-2">
              <Clock className="w-3.5 h-3.5 text-[#F97316]" /> Preferred Time
            </label>
            <div className="grid grid-cols-5 gap-2">
              {TIME_SLOTS.map(t => (
                <button
                  key={t}
                  onClick={() => setTime(t)}
                  className={`py-1.5 rounded-xl text-[10px] font-semibold border transition-all
                    ${time === t ? "bg-[#F97316] text-white border-[#F97316]" : "bg-white text-[#6B7280] border-[#E5E7EB] hover:border-[#F97316]"}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-bold text-[#1A1A2E] mb-2 block">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. 3 bedroom, need weekend availability…"
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl border border-[#E5E7EB] text-xs focus:outline-none focus:border-[#F97316] resize-none"
            />
          </div>
        </div>

        {/* CTA */}
        <div className="px-4 pb-6 pt-3 border-t border-[#F3F4F6]">
          {saved ? (
            <div className="flex items-center justify-center gap-2 py-3 bg-[#F0FDF4] rounded-2xl">
              <Check className="w-4 h-4 text-[#059669]" />
              <span className="text-sm font-bold text-[#059669]">Appointment Scheduled!</span>
            </div>
          ) : (
            <button
              onClick={handleSchedule}
              disabled={!date || saving}
              className="w-full py-3 rounded-2xl bg-[#F97316] text-white text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-40"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
              {saving ? "Scheduling…" : "Confirm Appointment"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}