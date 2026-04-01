import { X, Phone, Calendar, Check } from "lucide-react";
import { useState } from "react";
import { base44 } from "@/api/base44Client";

export default function ProviderContactCard({ provider, item, user, onClose, onScheduled }) {
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
      title: item.title,
      provider_name: provider.name,
      phone: provider.phone || "",
      date,
      time,
      notes,
      status: "scheduled"
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => {
      onClose();
      if (onScheduled) onScheduled();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center">
      <div className="bg-white w-full max-w-md rounded-t-3xl pb-8">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-[#E5E7EB] rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#F3F4F6]">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-[#1A1A2E]">{provider.name}</p>
            <p className="text-[11px] text-[#F97316] font-semibold">{item.title}</p>
          </div>
          <button onClick={onClose} className="p-1 flex-shrink-0">
            <X className="w-5 h-5 text-[#9CA3AF]" />
          </button>
        </div>

        {/* Quick Info Row */}
        <div className="px-4 py-3 border-b border-[#F3F4F6] grid grid-cols-3 gap-2 text-xs">
          {provider.email && (
            <div>
              <p className="text-[9px] text-[#9CA3AF] font-semibold uppercase tracking-wide mb-0.5">Email</p>
              <p className="font-semibold text-[#1A1A2E] truncate">{provider.email}</p>
            </div>
          )}
          {provider.service_date && (
            <div>
              <p className="text-[9px] text-[#9CA3AF] font-semibold uppercase tracking-wide mb-0.5">Service Date</p>
              <p className="font-semibold text-[#1A1A2E]">{new Date(provider.service_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
            </div>
          )}
          {provider.cost_of_service && (
            <div>
              <p className="text-[9px] text-[#9CA3AF] font-semibold uppercase tracking-wide mb-0.5">Est. Cost</p>
              <p className="font-semibold text-[#1A1A2E]">${provider.cost_of_service}</p>
            </div>
          )}
        </div>

        <div className="px-4 pt-4 space-y-4">
          {/* Contact */}
          {provider.phone && (
            <a
              href={`tel:${provider.phone.replace(/\D/g, "")}`}
              className="flex items-center gap-3 bg-[#FFF7ED] border border-[#FED7AA] rounded-2xl px-4 py-3"
            >
              <div className="w-8 h-8 rounded-xl bg-[#F97316] flex items-center justify-center flex-shrink-0">
                <Phone className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-[10px] text-[#9CA3AF] font-semibold uppercase tracking-wide">Call Now</p>
                <p className="text-sm font-bold text-[#1A1A2E]">{provider.phone}</p>
              </div>
            </a>
          )}

          {/* Schedule */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-[#6B7280]" />
              <p className="text-xs font-bold text-[#1A1A2E]">Schedule Appointment</p>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div>
                <label className="text-[10px] text-[#9CA3AF] font-semibold uppercase tracking-wide">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-[#E5E7EB] text-xs focus:outline-none focus:border-[#F97316]"
                />
              </div>
              <div>
                <label className="text-[10px] text-[#9CA3AF] font-semibold uppercase tracking-wide">Time</label>
                <input
                  type="time"
                  value={time}
                  onChange={e => setTime(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-[#E5E7EB] text-xs focus:outline-none focus:border-[#F97316]"
                />
              </div>
            </div>
            <textarea
              placeholder="Notes (optional)…"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 rounded-xl border border-[#E5E7EB] text-xs resize-none focus:outline-none focus:border-[#F97316]"
            />
          </div>

          <button
            onClick={handleSchedule}
            disabled={!date || saving || saved}
            className={`w-full py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all
              ${saved ? "bg-[#059669] text-white" : "bg-[#1A1A2E] text-white disabled:opacity-40"}`}
          >
            {saved ? <><Check className="w-4 h-4" />Appointment Saved!</> : saving ? "Saving…" : "Save Appointment"}
          </button>
        </div>
      </div>
    </div>
  );
}