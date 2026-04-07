import { useState } from "react";
import { X, Send, MessageSquare, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function SmsSendModal({ clients, agentId, onClose }) {
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [selectedClientId, setSelectedClientId] = useState("custom");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null); // {success, error}

  const smsClients = clients.filter(c => c.phone && c.sms_opt_in !== false);

  const handleSelect = (val) => {
    setSelectedClientId(val);
    if (val !== "custom") {
      const c = clients.find(cl => cl.id === val);
      if (c?.phone) setPhone(c.phone);
    } else {
      setPhone("");
    }
  };

  const handleSend = async () => {
    if (!phone.trim() || !message.trim()) return;
    setSending(true);
    setResult(null);

    // Check opt-out keywords
    const optOutKeywords = ["stop", "unsubscribe", "cancel", "quit", "end"];
    if (optOutKeywords.some(kw => message.toLowerCase().includes(kw))) {
      setResult({ success: false, error: "Message contains opt-out keyword. Use a different message." });
      setSending(false);
      return;
    }

    try {
      const res = await base44.functions.invoke("sendSMS", {
        to: phone,
        message,
        client_id: selectedClientId !== "custom" ? selectedClientId : undefined,
        portal_role: "broker",
        portal_user_id: agentId,
      });
      if (res.data?.success) {
        setResult({ success: true });
        setMessage("");
      } else {
        setResult({ success: false, error: res.data?.error || "Failed to send" });
      }
    } catch (e) {
      setResult({ success: false, error: e.message });
    }
    setSending(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden">
        <div className="px-6 pt-5 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-purple-500" />
            <p className="font-bold text-slate-800 text-sm">Send SMS</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Recipient selector */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-1.5">Recipient</label>
            <select
              value={selectedClientId}
              onChange={e => handleSelect(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-purple-400 bg-white"
            >
              <option value="custom">Custom number</option>
              {smsClients.map(c => (
                <option key={c.id} value={c.id}>{c.user_name} — {c.phone}</option>
              ))}
            </select>
            {smsClients.length === 0 && (
              <p className="text-[10px] text-amber-500 mt-1">No clients with SMS opt-in. Add phone numbers when creating clients.</p>
            )}
          </div>

          {/* Phone field */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-1.5">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-purple-400"
            />
          </div>

          {/* Message */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-1.5">
              Message <span className="text-slate-300 normal-case font-normal">({message.length}/160)</span>
            </label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              maxLength={160}
              rows={4}
              placeholder="Hi [Name], your move is coming up! Tap to check your plan..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-purple-400 resize-none"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              💡 Tip: always include "Reply STOP to unsubscribe" for compliance.
            </p>
          </div>

          {/* Opt-in compliance notice */}
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs text-amber-700">
            <strong>SMS Compliance:</strong> Only send to clients who have opted in. Replies of STOP/UNSUBSCRIBE will automatically opt them out.
          </div>

          {/* Result */}
          {result && (
            <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold ${result.success ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-700 border border-red-100"}`}>
              {result.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {result.success ? "SMS sent successfully!" : result.error}
            </div>
          )}

          <button
            onClick={handleSend}
            disabled={sending || !phone.trim() || !message.trim()}
            className="w-full py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm disabled:opacity-40 flex items-center justify-center gap-2 transition-colors"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {sending ? "Sending…" : "Send SMS"}
          </button>
        </div>
      </div>
    </div>
  );
}