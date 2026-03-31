import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";
import { Plus, LogOut, Edit2, X, ArrowLeft, Loader2, Users, Trash2, CreditCard, CheckCircle2, DollarSign, Clock, Home } from "lucide-react";
import { format, differenceInDays, parseISO } from "date-fns";

const STATUS_COLORS = {
  invited: "bg-amber-50 text-amber-600 border-amber-100",
  registered: "bg-blue-50 text-blue-600 border-blue-100",
  active: "bg-emerald-50 text-emerald-600 border-emerald-100",
  completed: "bg-slate-50 text-slate-500 border-slate-100",
};

const DEMO_CLIENTS = [
  { user_name: "Sarah Johnson", user_email: "sarah.johnson@demo.com", close_date: "2026-04-15", invitation_code: "2201", status: "active", billing_status: "charged" },
  { user_name: "Mike Torres", user_email: "mike.torres@demo.com", close_date: "2026-05-01", invitation_code: "3305", status: "active", billing_status: "charged" },
  { user_name: "Carol Webb", user_email: "carol.webb@demo.com", close_date: "2026-03-28", invitation_code: "4412", status: "invited", billing_status: "pending" },
];

export default function AgentDashboard() {
  const [agent, setAgent] = useState(null);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addStep, setAddStep] = useState(null);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", close_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] });
  const [pendingClient, setPendingClient] = useState(null);
  const [paying, setPaying] = useState(false);
  const [doneData, setDoneData] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [resendingId, setResendingId] = useState(null);
  const [resentId, setResentId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      const user = await base44.auth.me();
      if (user?.role !== "admin") { navigate("/"); return; }
      let agents = await base44.entities.Agent.filter({ created_by: user.email });
      let agentRecord = agents.length === 0
        ? await base44.entities.Agent.create({ company_name: user.full_name || "My Agency" })
        : agents[0];
      setAgent(agentRecord);
      let clientList = await base44.entities.Client.filter({ agent_id: agentRecord.id });
      if (clientList.length === 0) {
        const seeded = await Promise.all(DEMO_CLIENTS.map(c => base44.entities.Client.create({ ...c, agent_id: agentRecord.id, invited_date: new Date().toISOString() })));
        clientList = seeded;
      }
      setClients(clientList.sort((a, b) => new Date(b.invited_date || 0) - new Date(a.invited_date || 0)));
      setLoading(false);
    };
    load();
  }, []);

  const resetAdd = () => {
    setAddStep(null);
    setForm({ firstName: "", lastName: "", email: "", close_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] });
    setPendingClient(null);
    setDoneData(null);
  };

  const handleSaveClient = async () => {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const clientName = `${form.firstName} ${form.lastName}`;
    const newClient = await base44.entities.Client.create({
      agent_id: agent.id, user_email: form.email, user_name: clientName,
      close_date: form.close_date, invitation_code: code, status: "invited",
      invited_date: new Date().toISOString(), billing_status: "pending",
    });
    setPendingClient({ ...newClient, invitation_code: code });
    setClients(prev => [{ ...newClient, invitation_code: code }, ...prev]);
    // Send invite email
    const appUrl = window.location.origin;
    try {
      await base44.integrations.Core.SendEmail({
        to: form.email,
        from_name: agent?.company_name || "EZ Move AI",
        subject: `Your EZ Move AI Invitation from ${agent?.company_name || "your agent"}`,
        body: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <div style="background:linear-gradient(135deg,#f97316,#ea580c);border-radius:16px;padding:24px;text-align:center;margin-bottom:24px">
          <h1 style="color:white;margin:0;font-size:28px;font-weight:900">EZ Move <span style="opacity:0.85">AI</span></h1>
          <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:13px">Your personal moving assistant</p>
        </div>
        <h2 style="color:#1e293b;font-size:20px">Hi ${clientName},</h2>
        <p style="color:#475569;line-height:1.6">${agent?.company_name || "Your real estate agent"} has invited you to use <strong>EZ Move AI</strong> — your step-by-step moving assistant to make your move stress-free.</p>
        <div style="background:#fff7ed;border:2px solid #fed7aa;border-radius:12px;padding:20px;text-align:center;margin:24px 0">
          <p style="color:#9a3412;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px">Your Invite Code</p>
          <p style="color:#f97316;font-size:42px;font-weight:900;letter-spacing:8px;margin:0">${code}</p>
        </div>
        <a href="${appUrl}" style="display:block;background:#f97316;color:white;text-decoration:none;text-align:center;padding:14px;border-radius:12px;font-weight:700;font-size:15px;margin-bottom:16px">Get Started →</a>
        <p style="color:#94a3b8;font-size:12px;text-align:center">Enter your invite code on the registration page to get started.</p>
      </div>`,
      });
      console.log("Invite email sent to", form.email);
    } catch (emailErr) {
      console.error("Failed to send invite email:", emailErr);
      alert(`Client saved but email failed to send: ${emailErr?.message || emailErr}`);
    }
    setAddStep("payment");
  };

  const handlePayment = async () => {
    if (!pendingClient) return;
    setPaying(true);
    await base44.entities.Client.update(pendingClient.id, { status: "active", billing_status: "charged", charge_date: new Date().toISOString().split("T")[0] });
    if (agent) await base44.entities.Agent.update(agent.id, { clients_count: (agent.clients_count || 0) + 1, total_charged: (agent.total_charged || 0) + 40 });
    setClients(prev => prev.map(c => c.id === pendingClient.id ? { ...c, status: "active", billing_status: "charged" } : c));
    setDoneData({ name: pendingClient.user_name, code: pendingClient.invitation_code });
    setAddStep("done");
    setPaying(false);
  };

  const resendCode = async (client) => {
    setResendingId(client.id);
    const appUrl = window.location.origin;
    await base44.integrations.Core.SendEmail({
      to: client.user_email,
      from_name: agent?.company_name || "EZ Move AI",
      subject: `Your EZ Move AI Invite Code`,
      body: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2 style="color:#1e293b">Hi ${client.user_name},</h2>
        <p style="color:#475569">Here is your EZ Move AI invite code:</p>
        <div style="background:#fff7ed;border:2px solid #fed7aa;border-radius:12px;padding:20px;text-align:center;margin:24px 0">
          <p style="color:#9a3412;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px">Invite Code</p>
          <p style="color:#f97316;font-size:42px;font-weight:900;letter-spacing:8px;margin:0">${client.invitation_code}</p>
        </div>
        <a href="${appUrl}" style="display:block;background:#f97316;color:white;text-decoration:none;text-align:center;padding:14px;border-radius:12px;font-weight:700;font-size:15px">Open EZ Move AI →</a>
      </div>`,
    }).catch(() => {});
    setResendingId(null);
    setResentId(client.id);
    setTimeout(() => setResentId(null), 3000);
  };

  const deleteClient = async (id) => {
    if (!confirm("Delete this client?")) return;
    await base44.entities.Client.delete(id);
    setClients(prev => prev.filter(c => c.id !== id));
  };

  const revenue = clients.filter(c => c.billing_status === "charged").length * 40;
  const canSave = form.firstName.trim() && form.lastName.trim() && form.email.trim() && form.close_date;

  if (loading) return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-blue-100 shadow-sm px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-md shadow-orange-200">
              <span className="text-white font-black text-sm">EZ</span>
            </div>
            <div>
              <p className="font-black text-slate-800 text-sm leading-tight">EZ Move <span className="text-orange-500">AI</span></p>
              <p className="text-slate-400 text-[10px] font-semibold">Agent Portal · {agent?.company_name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setAddStep("form")}
              className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors shadow-md shadow-orange-200">
              <Plus className="w-3.5 h-3.5" /> Add Client
            </button>
            <button onClick={() => base44.auth.logout("/")} className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
              <LogOut className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-6 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Active Clients", value: clients.filter(c => c.status === "active").length, Icon: Users, color: "text-blue-500", bg: "bg-blue-50", border: "border-blue-100" },
            { label: "Pending Invites", value: clients.filter(c => c.status === "invited").length, Icon: Clock, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
            { label: "Total Clients", value: clients.length, Icon: Users, color: "text-slate-600", bg: "bg-slate-50", border: "border-slate-100" },
          ].map(s => (
            <div key={s.label} className={`bg-white rounded-2xl p-4 border ${s.border} shadow-sm`}>
              <div className={`w-8 h-8 ${s.bg} rounded-xl flex items-center justify-center mb-2`}>
                <s.Icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <p className="text-xl font-black text-slate-800">{s.value}</p>
              <p className="text-slate-400 text-[11px] font-semibold mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Client List */}
        <div className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-blue-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-orange-500" />
              <p className="font-bold text-slate-800 text-sm">My Clients</p>
            </div>
            <span className="text-slate-400 text-xs font-semibold">{clients.length} total</span>
          </div>

          {clients.length === 0 ? (
            <div className="py-14 text-center">
              <div className="text-4xl mb-3">👥</div>
              <p className="text-slate-500 font-semibold mb-1">No clients yet</p>
              <button onClick={() => setAddStep("form")} className="text-orange-500 font-bold text-sm">+ Add your first client</button>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {clients.map(client => {
                const daysLeft = client.close_date ? differenceInDays(parseISO(client.close_date), new Date()) : null;
                return (
                  <div key={client.id} className="px-5 py-4 flex items-start gap-3 hover:bg-blue-50/30 transition-colors">
                    <div className="w-10 h-10 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-sm font-black text-orange-500">{(client.user_name || "?")[0]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <p className="font-bold text-slate-800 text-sm">{client.user_name || "—"}</p>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${STATUS_COLORS[client.status] || "bg-slate-50 text-slate-500 border-slate-100"}`}>
                          {client.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mb-1.5">{client.user_email}</p>
                      {client.invitation_code && (
                        <div className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-100 rounded-lg px-2 py-1">
                          <span className="text-[9px] text-slate-400 font-semibold uppercase">Code</span>
                          <span className="text-xs font-black text-orange-500 tracking-widest">{client.invitation_code}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-shrink-0 text-right flex flex-col items-end gap-2">
                      {daysLeft !== null && (
                        <div>
                          <p className={`text-xs font-bold ${daysLeft < 0 ? "text-emerald-600" : daysLeft < 14 ? "text-red-500" : "text-slate-600"}`}>
                            {daysLeft < 0 ? "Closed ✓" : `${daysLeft}d left`}
                          </p>
                          {client.close_date && <p className="text-[10px] text-slate-400">{format(parseISO(client.close_date), "MMM d, yyyy")}</p>}
                        </div>
                      )}
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => { setEditForm({ user_name: client.user_name, user_email: client.user_email, home_address: client.home_address, close_date: client.close_date }); setEditingId(client.id); }}
                          className="text-[10px] text-orange-500 font-bold flex items-center gap-0.5 bg-orange-50 border border-orange-100 px-2 py-0.5 rounded-lg hover:bg-orange-100 transition-colors">
                          <Edit2 className="w-2.5 h-2.5" /> Edit
                        </button>
                        <button onClick={() => resendCode(client)} disabled={resendingId === client.id}
                          className={`text-[10px] font-bold flex items-center gap-0.5 px-2 py-0.5 rounded-lg border transition-all ${resentId === client.id ? "text-emerald-600 bg-emerald-50 border-emerald-100" : "text-blue-500 bg-blue-50 border-blue-100 hover:bg-blue-100"}`}>
                          {resendingId === client.id ? "..." : resentId === client.id ? "✓ Sent" : "📨 Code"}
                        </button>
                        <button onClick={() => deleteClient(client.id)} className="text-[10px] text-red-500 font-bold flex items-center gap-0.5 bg-red-50 border border-red-100 px-2 py-0.5 rounded-lg hover:bg-red-100 transition-colors">
                          <Trash2 className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editingId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end md:items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-blue-100">
            <div className="px-6 pt-5 pb-4 border-b border-slate-100 flex items-center justify-between">
              <button onClick={() => setEditingId(null)} className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center"><X className="w-4 h-4 text-slate-500" /></button>
              <p className="font-bold text-slate-800 text-sm">Edit Client</p>
              <div className="w-8" />
            </div>
            <div className="px-6 py-5 space-y-3">
              {[{ label: "Full Name", key: "user_name", type: "text" }, { label: "Email", key: "user_email", type: "email" }, { label: "Address", key: "home_address", type: "text" }, { label: "Close Date", key: "close_date", type: "date" }].map(f => (
                <div key={f.key}>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-1">{f.label}</label>
                  <input type={f.type} value={editForm[f.key] || ""} onChange={e => setEditForm(p => ({ ...p, [f.key]: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/10 bg-white" />
                </div>
              ))}
              <button onClick={async () => { await base44.entities.Client.update(editingId, editForm); setClients(prev => prev.map(c => c.id === editingId ? { ...c, ...editForm } : c)); setEditingId(null); }}
                className="w-full py-3.5 rounded-2xl bg-orange-500 text-white font-bold text-sm mt-2 hover:bg-orange-600 transition-colors">Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Client Modal */}
      {addStep && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end md:items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-blue-100">
            <div className="px-6 pt-5 pb-4 border-b border-slate-100 flex items-center justify-between">
              <button onClick={addStep === "payment" ? () => setAddStep("form") : resetAdd} className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center">
                {addStep === "payment" ? <ArrowLeft className="w-4 h-4 text-slate-500" /> : <X className="w-4 h-4 text-slate-500" />}
              </button>
              <p className="font-bold text-slate-800 text-sm">
                {addStep === "form" ? "New Client" : addStep === "payment" ? "Confirm & Pay" : "Client Added! 🎉"}
              </p>
              <div className="w-8" />
            </div>
            <div className="px-6 py-5">
              {addStep === "form" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {["firstName", "lastName"].map(k => (
                      <div key={k}>
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-1">{k === "firstName" ? "First Name" : "Last Name"}</label>
                        <input type="text" value={form[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))} placeholder={k === "firstName" ? "Jane" : "Smith"}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/10" />
                      </div>
                    ))}
                  </div>
                  {[{ label: "Email Address", key: "email", type: "email", ph: "jane@email.com" }, { label: "Close Date", key: "close_date", type: "date" }].map(f => (
                    <div key={f.key}>
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-1">{f.label}</label>
                      <input type={f.type} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.ph || ""}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/10" />
                    </div>
                  ))}
                  <button onClick={handleSaveClient} disabled={!canSave} className="w-full py-3.5 rounded-2xl bg-orange-500 text-white font-bold text-sm disabled:opacity-40 hover:bg-orange-600 transition-colors mt-2">
                    Save & Continue →
                  </button>
                </div>
              )}
              {addStep === "payment" && pendingClient && (
                <div className="space-y-4">
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Client Summary</p>
                    <div className="flex justify-between"><span className="text-xs text-slate-400">Name</span><span className="text-xs font-bold text-slate-700">{pendingClient.user_name}</span></div>
                    <div className="flex justify-between"><span className="text-xs text-slate-400">Email</span><span className="text-xs font-bold text-slate-700">{pendingClient.user_email}</span></div>
                    <div className="flex justify-between"><span className="text-xs text-slate-400">Close Date</span><span className="text-xs font-bold text-slate-700">{pendingClient.close_date}</span></div>
                    <div className="flex justify-between"><span className="text-xs text-slate-400">Invite Code</span><span className="text-xs font-black text-orange-500 tracking-widest">{pendingClient.invitation_code}</span></div>
                  </div>
                  <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-black text-slate-800">EZ Move AI — 1 Client</p>
                      <p className="text-xs text-slate-500">Full moving assistant access</p>
                    </div>
                    <p className="text-2xl font-black text-orange-500">$40</p>
                  </div>
                  <button onClick={handlePayment} disabled={paying} className="w-full py-3.5 rounded-2xl bg-orange-500 text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-orange-600 transition-colors">
                    {paying ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : <><CreditCard className="w-4 h-4" /> Pay $40 & Activate</>}
                  </button>
                  <button onClick={() => { setClients(prev => prev.map(c => c.id === pendingClient.id ? { ...c, status: "active", billing_status: "charged" } : c)); setDoneData({ name: pendingClient.user_name, code: pendingClient.invitation_code }); setAddStep("done"); }}
                    className="w-full py-2.5 rounded-2xl border border-slate-200 text-slate-400 text-xs font-semibold hover:bg-slate-50 transition-colors">
                    Skip Payment (Demo)
                  </button>
                </div>
              )}
              {addStep === "done" && doneData && (
                <div className="text-center py-4">
                  <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto mb-4" />
                  <p className="text-xl font-bold text-slate-800 mb-1">All Set!</p>
                  <p className="text-sm text-slate-500 mb-5">{doneData.name} is now active.</p>
                  <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 mb-5">
                    <p className="text-xs text-slate-500 mb-1">Share this invite code</p>
                    <p className="text-4xl font-black text-orange-500 tracking-widest">{doneData.code}</p>
                  </div>
                  <button onClick={resetAdd} className="w-full py-3 rounded-2xl bg-orange-500 text-white font-bold text-sm hover:bg-orange-600 transition-colors">Done</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}