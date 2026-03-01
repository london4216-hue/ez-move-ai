import { useState, useEffect } from "react";
import { X, Phone, Plus, Star, Check, Loader2, DollarSign } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function ProviderAppointmentModal({ provider, checklistItem, user, onClose, onSaved }) {
  // Each "call log" stored in notes field as JSON array in Appointment entity
  // We store one Appointment per provider, with notes = JSON.stringify(callLogs)
  // callLogs: [{ called: bool, quote: string, notes: string, date: string, chosen: bool }]

  const [appointment, setAppointment] = useState(null);
  const [callLogs, setCallLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form for new log entry
  const [called, setCalled] = useState(null); // true | false | null
  const [quote, setQuote] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const load = async () => {
      const existing = await base44.entities.Appointment.filter({
        user_id: user?.id,
        provider_name: provider.name,
        title: `${checklistItem} — ${provider.name}`
      });
      if (existing.length > 0) {
        const appt = existing[0];
        setAppointment(appt);
        try { setCallLogs(JSON.parse(appt.notes || "[]")); } catch { setCallLogs([]); }
      }
      setLoading(false);
    };
    if (user?.id) load();
    else setLoading(false);
  }, []);

  const saveLog = async () => {
    if (called === null) return;
    setSaving(true);
    const newLog = {
      called,
      quote: quote.trim(),
      notes: notes.trim(),
      date: new Date().toLocaleDateString(),
      chosen: false
    };
    const updatedLogs = [...callLogs, newLog];
    setCallLogs(updatedLogs);

    if (appointment) {
      await base44.entities.Appointment.update(appointment.id, { notes: JSON.stringify(updatedLogs) });
    } else {
      const created = await base44.entities.Appointment.create({
        user_id: user?.id,
        title: `${checklistItem} — ${provider.name}`,
        provider_name: provider.name,
        phone: provider.phone || "",
        date: new Date().toISOString().split("T")[0],
        notes: JSON.stringify(updatedLogs),
        status: "tentative"
      });
      setAppointment(created);
    }

    setCalled(null);
    setQuote("");
    setNotes("");
    setSaving(false);
    onSaved?.();
  };

  const toggleChosen = async (idx) => {
    const updated = callLogs.map((log, i) => ({ ...log, chosen: i === idx ? !log.chosen : false }));
    setCallLogs(updated);
    if (appointment) {
      await base44.entities.Appointment.update(appointment.id, { notes: JSON.stringify(updated), status: updated[idx].chosen ? "scheduled" : "tentative" });
    }
    onSaved?.();
  };

  const chosenLog = callLogs.find(l => l.chosen);

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center">
      <div className="bg-white w-full max-w-md rounded-t-3xl max-h-[88vh] flex flex-col">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-[#E5E7EB] rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#F3F4F6]">
          <div>
            <p className="text-sm font-bold text-[#1A1A2E]">{provider.name}</p>
            <p className="text-[10px] text-[#F97316] font-semibold">{checklistItem}</p>
          </div>
          <button onClick={onClose}><X className="w-5 h-5 text-[#9CA3AF]" /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
          {/* Call button */}
          {provider.phone && (
            <a href={`tel:${provider.phone}`}
              className="flex items-center gap-3 bg-[#FFF7ED] border border-[#FED7AA] rounded-2xl px-4 py-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#F97316] flex items-center justify-center flex-shrink-0">
                <Phone className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-[10px] text-[#9CA3AF] font-semibold uppercase tracking-wide">Tap to Call</p>
                <p className="text-sm font-bold text-[#1A1A2E]">{provider.phone}</p>
              </div>
            </a>
          )}

          {/* Existing call logs */}
          {loading && <p className="text-xs text-[#9CA3AF]">Loading…</p>}
          {!loading && callLogs.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wide mb-2">Call History</p>
              <div className="space-y-2">
                {callLogs.map((log, idx) => (
                  <div key={idx}
                    className={`rounded-xl border px-3 py-2.5 transition-all
                      ${log.chosen
                        ? "bg-[#F0FDF4] border-[#6EE7B7]"
                        : log.called
                          ? "bg-[#F0F9FF] border-[#BAE6FD]"
                          : "bg-[#FEF2F2] border-[#FECACA]"}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full
                            ${log.called ? "bg-[#059669] text-white" : "bg-[#EF4444] text-white"}`}>
                            {log.called ? "✓ Called" : "✗ Not Reached"}
                          </span>
                          {log.quote && (
                            <span className="text-[10px] font-bold text-[#059669] bg-[#D1FAE5] px-2 py-0.5 rounded-full">
                              💰 {log.quote}
                            </span>
                          )}
                        </div>
                        {log.notes && <p className="text-[10px] text-[#6B7280] mt-1">{log.notes}</p>}
                        <p className="text-[9px] text-[#9CA3AF] mt-0.5">{log.date}</p>
                      </div>
                      <button
                        onClick={() => toggleChosen(idx)}
                        title={log.chosen ? "Remove selection" : "Select this provider"}
                        className={`flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all
                          ${log.chosen ? "bg-[#059669] border-[#059669]" : "border-[#D1D5DB] hover:border-[#059669]"}`}>
                        <Star className={`w-3.5 h-3.5 ${log.chosen ? "text-white fill-white" : "text-[#D1D5DB]"}`} />
                      </button>
                    </div>
                    {log.chosen && (
                      <p className="text-[10px] font-bold text-[#059669] mt-1.5 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Selected as preferred provider
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New log entry form */}
          <div className="bg-[#FAFAFA] rounded-2xl border border-[#F3F4F6] px-3 py-3 space-y-3">
            <p className="text-[10px] font-bold text-[#1A1A2E] uppercase tracking-wide">Log a Call</p>

            {/* Called? Yes/No */}
            <div>
              <p className="text-[10px] text-[#6B7280] font-semibold mb-1.5">Did they answer?</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCalled(true)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all
                    ${called === true ? "bg-[#059669] text-white border-[#059669]" : "bg-white text-[#6B7280] border-[#E5E7EB]"}`}>
                  ✓ Yes — Reached
                </button>
                <button
                  onClick={() => setCalled(false)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all
                    ${called === false ? "bg-[#EF4444] text-white border-[#EF4444]" : "bg-white text-[#6B7280] border-[#E5E7EB]"}`}>
                  ✗ No Answer
                </button>
              </div>
            </div>

            {/* Quote */}
            <div>
              <label className="text-[10px] text-[#6B7280] font-semibold block mb-1">Quote / Price (optional)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9CA3AF]" />
                <input
                  value={quote}
                  onChange={e => setQuote(e.target.value)}
                  placeholder="e.g. $1,200 or $85/hr"
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-[#E5E7EB] text-xs focus:outline-none focus:border-[#F97316]"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="text-[10px] text-[#6B7280] font-semibold block mb-1">Notes (optional)</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="e.g. includes packing, available Sat, crew of 3…"
                rows={2}
                className="w-full px-3 py-2 rounded-xl border border-[#E5E7EB] text-xs resize-none focus:outline-none focus:border-[#F97316]"
              />
            </div>

            <button
              onClick={saveLog}
              disabled={called === null || saving}
              className="w-full py-2.5 rounded-xl bg-[#F97316] text-white text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-40"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              {saving ? "Saving…" : "Log This Call"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}