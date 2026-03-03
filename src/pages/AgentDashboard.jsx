import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";
import { Plus, LogOut, Edit2, Check, X, ChevronRight, ArrowLeft, Loader2, Users, Trash2 } from "lucide-react";
import { format, differenceInDays, parseISO } from "date-fns";

const STATUS_COLORS = {
  invited: "bg-amber-100 text-amber-700",
  registered: "bg-blue-100 text-blue-700",
  active: "bg-green-100 text-green-700",
  completed: "bg-slate-100 text-slate-600",
};

const DEMO_CLIENTS = [
  { user_name: "Sarah Johnson", user_email: "sarah.johnson@demo.com", phone: "555-201-0001", close_date: "2026-04-15", invitation_code: "2201", status: "active", billing_status: "charged" },
  { user_name: "Mike & Dana Torres", user_email: "mike.torres@demo.com", phone: "555-201-0002", close_date: "2026-05-01", invitation_code: "3305", status: "registered", billing_status: "pending" },
  { user_name: "Carol Webb", user_email: "carol.webb@demo.com", phone: "555-201-0003", close_date: "2026-03-28", invitation_code: "4412", status: "invited", billing_status: "pending" },
];

const STEPS = ["Seller Info", "Address", "Close Date", "Send Invite"];

export default function AgentDashboard() {
  const [agent, setAgent] = useState(null);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", close_date: "" });
  const [inviting, setInviting] = useState(false);
  const [inviteSent, setInviteSent] = useState(null); // { name, code }
  const [editingClientId, setEditingClientId] = useState(null);
  const [editCloseDate, setEditCloseDate] = useState("");
  const [editingFullId, setEditingFullId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const user = await base44.auth.me();
        if (user?.role !== "admin") { navigate(createPageUrl("AgentLogin")); return; }
        let agents = await base44.entities.Agent.filter({ created_by: user.email });
        let agentRecord = agents.length === 0
          ? await base44.entities.Agent.create({ company_name: user.full_name || "My Agency" })
          : agents[0];
        setAgent(agentRecord);

        let clientList = await base44.entities.Client.filter({ agent_id: agentRecord.id });

        // Seed demo clients if empty
        if (clientList.length === 0) {
          const seeded = await Promise.all(
            DEMO_CLIENTS.map(c =>
              base44.entities.Client.create({ ...c, agent_id: agentRecord.id, invited_date: new Date().toISOString() })
            )
          );
          clientList = seeded;
        }

        setClients(clientList.sort((a, b) => new Date(b.invited_date) - new Date(a.invited_date)));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const resetAdd = () => {
    setForm({ name: "", email: "", phone: "", address: "", close_date: "" });
    setStep(0);
    setInviteSent(null);
    setShowAdd(false);
  };

  const canNext = () => {
    if (step === 0) return form.name.trim() && form.email.trim() && form.phone.trim();
    if (step === 1) return form.address.trim();
    if (step === 2) return form.close_date;
    return true;
  };

  const handleSendInvite = async () => {
    setInviting(true);
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const newClient = await base44.entities.Client.create({
      agent_id: agent.id,
      user_email: form.email,
      user_name: form.name,
      phone: form.phone,
      home_address: form.address,
      close_date: form.close_date,
      invitation_code: code,
      status: "invited",
      invited_date: new Date().toISOString(),
      billing_status: "pending",
    });
    const appUrl = `${window.location.origin}`;
    await base44.integrations.Core.SendEmail({
      to: form.email,
      subject: `Welcome to EZ Move AI`,
      body: `Welcome ${form.name},\n\nYour invite code: ${code}\n\nRegister here: ${appUrl}\n\n---\nTo unsubscribe, reply with "unsubscribe".`,
    });
    setClients(prev => [newClient, ...prev]);
    setInviteSent({ name: form.name, code });
    setInviting(false);
  };

  const saveCloseDate = async (clientId) => {
    if (!editCloseDate) return;
    await base44.entities.Client.update(clientId, { close_date: editCloseDate });
    setClients(prev => prev.map(c => c.id === clientId ? { ...c, close_date: editCloseDate } : c));
    setEditingClientId(null);
  };

  const deleteClient = async (clientId) => {
    if (!confirm("Delete this client? This cannot be undone.")) return;
    await base44.entities.Client.delete(clientId);
    setClients(prev => prev.filter(c => c.id !== clientId));
  };

  const openEditFull = (client) => {
    setEditForm({ user_name: client.user_name, user_email: client.user_email, phone: client.phone, home_address: client.home_address, close_date: client.close_date });
    setEditingFullId(client.id);
  };

  const saveEditFull = async () => {
    await base44.entities.Client.update(editingFullId, editForm);
    setClients(prev => prev.map(c => c.id === editingFullId ? { ...c, ...editForm } : c));
    setEditingFullId(null);
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Compact header */}
      <div className="bg-white border-b border-slate-100 px-6 pt-12 pb-4 shadow-sm">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
              <span className="text-white text-xs font-black">EZ</span>
            </div>
            <div>
              <p className="text-slate-800 font-bold text-sm leading-tight">EZ Move <span className="text-orange-500">AI</span></p>
              <p className="text-slate-400 text-[10px]">Agent Portal · {agent?.company_name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setShowAdd(true); setStep(0); }}
              className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs px-3 py-2 rounded-xl transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add Seller
            </button>
            <button
              onClick={() => base44.auth.logout(createPageUrl("AgentLogin"))}
              className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
            >
              <LogOut className="w-3.5 h-3.5 text-slate-500" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5">
        {/* Clients list */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-orange-500" />
              <p className="font-bold text-slate-800 text-sm">Current Clients</p>
            </div>
            <span className="text-xs text-slate-400 font-semibold">{clients.length}</span>
          </div>

          {clients.length === 0 ? (
            <div className="py-14 text-center">
              <div className="text-4xl mb-3">👥</div>
              <p className="text-slate-600 font-semibold mb-1">No clients yet</p>
              <button onClick={() => setShowAdd(true)} className="text-orange-500 font-bold text-sm">+ Add your first seller</button>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {clients.map(client => {
                const daysLeft = client.close_date
                  ? differenceInDays(parseISO(client.close_date), new Date())
                  : null;
                return (
                  <div key={client.id} className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-orange-500">{(client.user_name || "?")[0]}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-slate-800 text-sm">{client.user_name || "—"}</p>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${STATUS_COLORS[client.status] || "bg-slate-100 text-slate-500"}`}>
                            {client.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate">{client.user_email}</p>
                        {client.invitation_code && client.status === "invited" && (
                          <div className="inline-flex items-center gap-1.5 mt-1 bg-slate-50 rounded-lg px-2 py-0.5">
                            <span className="text-[9px] text-slate-400 font-medium">Code:</span>
                            <span className="text-xs font-black text-orange-500 tracking-widest">{client.invitation_code}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-shrink-0 text-right">
                        {editingClientId === client.id ? (
                          <div className="flex items-center gap-1">
                            <input type="date" value={editCloseDate}
                              onChange={e => setEditCloseDate(e.target.value)}
                              className="text-xs border border-orange-300 rounded-lg px-2 py-1 focus:outline-none w-28"
                            />
                            <button onClick={() => saveCloseDate(client.id)} className="w-6 h-6 bg-orange-500 rounded-lg flex items-center justify-center">
                              <Check className="w-3 h-3 text-white" />
                            </button>
                            <button onClick={() => setEditingClientId(null)} className="w-6 h-6 bg-slate-100 rounded-lg flex items-center justify-center">
                              <X className="w-3 h-3 text-slate-500" />
                            </button>
                          </div>
                        ) : (
                          <div>
                            {client.close_date ? (
                              <p className={`text-xs font-bold ${daysLeft !== null && daysLeft < 14 ? "text-red-500" : "text-slate-600"}`}>
                                {daysLeft !== null ? (daysLeft < 0 ? "Closed ✓" : `${daysLeft}d left`) : ""}
                              </p>
                            ) : null}
                            {client.close_date && (
                              <p className="text-[10px] text-slate-400">{format(parseISO(client.close_date), "MMM d, yyyy")}</p>
                            )}
                            <button
                              onClick={() => { setEditingClientId(client.id); setEditCloseDate(client.close_date || ""); }}
                              className="text-[10px] text-orange-400 font-bold flex items-center gap-0.5 ml-auto mt-0.5"
                            >
                              <Edit2 className="w-2.5 h-2.5" /> Edit
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Add Seller Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            {/* Modal header */}
            <div className="px-6 pt-5 pb-4 border-b border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={inviteSent ? resetAdd : step === 0 ? resetAdd : () => setStep(s => s - 1)}
                  className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center"
                >
                  {(step === 0 || inviteSent) ? <X className="w-4 h-4 text-slate-500" /> : <ArrowLeft className="w-4 h-4 text-slate-500" />}
                </button>
                <p className="font-bold text-slate-800 text-sm">
                  {inviteSent ? "Invite Sent! 🎉" : `Add Seller — Step ${step + 1} of ${STEPS.length}`}
                </p>
                <div className="w-8" />
              </div>
              {!inviteSent && (
                <div className="flex gap-1.5">
                  {STEPS.map((s, i) => (
                    <div key={i} className={`flex-1 h-1 rounded-full transition-all ${i <= step ? "bg-orange-500" : "bg-slate-100"}`} />
                  ))}
                </div>
              )}
            </div>

            <div className="px-6 py-5">
              {inviteSent ? (
                <div className="text-center py-4">
                  <div className="text-5xl mb-4">📬</div>
                  <p className="text-xl font-bold text-slate-800 mb-1">Invite Sent!</p>
                  <p className="text-sm text-slate-500 mb-5">{inviteSent.name} will receive an email with their invite code.</p>
                  <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 mb-5">
                    <p className="text-xs text-slate-500 mb-1">Their 4-digit invite code</p>
                    <p className="text-4xl font-black text-orange-500 tracking-widest">{inviteSent.code}</p>
                  </div>
                  <button onClick={resetAdd} className="w-full py-3 rounded-2xl bg-orange-500 text-white font-bold text-sm">Done</button>
                </div>
              ) : step === 0 ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-base font-bold text-slate-800 mb-1">Seller's info</p>
                    <p className="text-xs text-slate-400">Who is moving?</p>
                  </div>
                  {[
                    { label: "Full Name", key: "name", type: "text", placeholder: "Jane Smith" },
                    { label: "Email Address", key: "email", type: "email", placeholder: "jane@email.com" },
                    { label: "Phone Number", key: "phone", type: "tel", placeholder: "555-123-4567" },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-1">{f.label}</label>
                      <input
                        type={f.type}
                        value={form[f.key]}
                        onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                        placeholder={f.placeholder}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/10"
                      />
                    </div>
                  ))}
                </div>
              ) : step === 1 ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-base font-bold text-slate-800 mb-1">Property address</p>
                    <p className="text-xs text-slate-400">The home they're selling/moving from</p>
                  </div>
                  <input
                    type="text"
                    value={form.address}
                    onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
                    placeholder="123 Main St, City, State"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/10"
                  />
                </div>
              ) : step === 2 ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-base font-bold text-slate-800 mb-1">Estimated close date</p>
                    <p className="text-xs text-slate-400">This drives their week-by-week moving plan</p>
                  </div>
                  <input
                    type="date"
                    value={form.close_date}
                    onChange={e => setForm(p => ({ ...p, close_date: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/10"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-base font-bold text-slate-800 mb-1">Review & send invite</p>
                    <p className="text-xs text-slate-400">A welcome email with their code will be sent</p>
                  </div>
                  <div className="bg-slate-50 rounded-2xl p-4 space-y-2">
                    {[
                      { label: "Name", value: form.name },
                      { label: "Email", value: form.email },
                      { label: "Phone", value: form.phone },
                      { label: "Address", value: form.address },
                      { label: "Close Date", value: form.close_date },
                    ].map(r => (
                      <div key={r.label} className="flex justify-between gap-3">
                        <span className="text-xs text-slate-400 font-semibold">{r.label}</span>
                        <span className="text-xs text-slate-700 font-bold text-right flex-1 truncate">{r.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!inviteSent && (
                <div className="mt-5">
                  {step < 3 ? (
                    <button
                      onClick={() => setStep(s => s + 1)}
                      disabled={!canNext()}
                      className="w-full py-3.5 rounded-2xl bg-orange-500 text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-40 transition-all"
                    >
                      Continue <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={handleSendInvite}
                      disabled={inviting}
                      className="w-full py-3.5 rounded-2xl bg-orange-500 text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
                    >
                      {inviting ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : "Send Invite 📬"}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}