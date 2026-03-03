import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";
import { Plus, LogOut, Edit2, X, ArrowLeft, Loader2, Users, Trash2, CreditCard, CheckCircle2 } from "lucide-react";
import { format, differenceInDays, parseISO } from "date-fns";

const STATUS_COLORS = {
  invited: "bg-amber-100 text-amber-700",
  registered: "bg-blue-100 text-blue-700",
  active: "bg-green-100 text-green-700",
  completed: "bg-slate-100 text-slate-600",
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

  // Add client flow: "form" | "payment" | "done"
  const [addStep, setAddStep] = useState(null); // null = closed
  const [form, setForm] = useState({ name: "", email: "", close_date: "" });
  const [pendingClient, setPendingClient] = useState(null); // saved client before payment
  const [paying, setPaying] = useState(false);
  const [doneData, setDoneData] = useState(null); // { name, code }

  // Edit modal
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
    setAddStep(null);
    setForm({ name: "", email: "", close_date: "" });
    setPendingClient(null);
    setDoneData(null);
  };

  const canSaveForm = form.name.trim() && form.email.trim() && form.close_date;

  // Step 1: Save client info → move to payment
  const handleSaveClient = async () => {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const newClient = await base44.entities.Client.create({
      agent_id: agent.id,
      user_email: form.email,
      user_name: form.name,
      close_date: form.close_date,
      invitation_code: code,
      status: "invited",
      invited_date: new Date().toISOString(),
      billing_status: "pending",
    });
    setPendingClient({ ...newClient, invitation_code: code });
    setClients(prev => [{ ...newClient, invitation_code: code }, ...prev]);
    setAddStep("payment");
  };

  // Step 2: Process payment → mark active, send email
  const handlePayment = async () => {
    if (!pendingClient) return;
    setPaying(true);
    // Mark as active + charged
    await base44.entities.Client.update(pendingClient.id, {
      status: "active",
      billing_status: "charged",
      charge_date: new Date().toISOString().split("T")[0],
    });
    // Update agent stats
    if (agent) {
      await base44.entities.Agent.update(agent.id, {
        clients_count: (agent.clients_count || 0) + 1,
        total_charged: (agent.total_charged || 0) + 40,
      });
    }
    // Send invite email
    await base44.functions.invoke("sendWelcomeEmail", {
      user_name: pendingClient.user_name,
      user_email: pendingClient.user_email,
      invite_code: pendingClient.invitation_code,
      app_url: window.location.origin,
    });
    // Update local list
    setClients(prev => prev.map(c =>
      c.id === pendingClient.id ? { ...c, status: "active", billing_status: "charged" } : c
    ));
    setDoneData({ name: pendingClient.user_name, code: pendingClient.invitation_code });
    setAddStep("done");
    setPaying(false);
  };

  const [resendingId, setResendingId] = useState(null);
  const [resentId, setResentId] = useState(null);

  const resendCode = async (client) => {
    setResendingId(client.id);
    await base44.functions.invoke("sendWelcomeEmail", {
      user_name: client.user_name,
      user_email: client.user_email,
      invite_code: client.invitation_code,
      app_url: window.location.origin,
    });
    setResendingId(null);
    setResentId(client.id);
    setTimeout(() => setResentId(null), 3000);
  };

  const deleteClient = async (clientId) => {
    if (!confirm("Delete this client? This cannot be undone.")) return;
    await base44.entities.Client.delete(clientId);
    setClients(prev => prev.filter(c => c.id !== clientId));
  };

  const openEditFull = (client) => {
    setEditForm({ user_name: client.user_name, user_email: client.user_email, home_address: client.home_address, close_date: client.close_date });
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
      {/* Header */}
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
              onClick={() => { setAddStep("form"); }}
              className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs px-3 py-2 rounded-xl transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add Client
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
              <button onClick={() => setAddStep("form")} className="text-orange-500 font-bold text-sm">+ Add your first client</button>
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
                        {client.invitation_code && (
                          <div className="inline-flex items-center gap-1.5 mt-1 bg-slate-50 rounded-lg px-2 py-0.5">
                            <span className="text-[9px] text-slate-400 font-medium">Code:</span>
                            <span className="text-xs font-black text-orange-500 tracking-widest">{client.invitation_code}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-shrink-0 text-right flex flex-col items-end gap-1">
                        {client.close_date ? (
                          <p className={`text-xs font-bold ${daysLeft !== null && daysLeft < 14 ? "text-red-500" : "text-slate-600"}`}>
                            {daysLeft !== null ? (daysLeft < 0 ? "Closed ✓" : `${daysLeft}d left`) : ""}
                          </p>
                        ) : null}
                        {client.close_date && (
                          <p className="text-[10px] text-slate-400">{format(parseISO(client.close_date), "MMM d, yyyy")}</p>
                        )}
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap justify-end">
                          <button onClick={() => openEditFull(client)} className="text-[10px] text-orange-400 font-bold flex items-center gap-0.5 bg-orange-50 px-2 py-0.5 rounded-lg">
                            <Edit2 className="w-2.5 h-2.5" /> Edit
                          </button>
                          <button
                            onClick={() => resendCode(client)}
                            disabled={resendingId === client.id}
                            className={`text-[10px] font-bold flex items-center gap-0.5 px-2 py-0.5 rounded-lg transition-all ${
                              resentId === client.id
                                ? "text-green-600 bg-green-50"
                                : "text-blue-400 bg-blue-50"
                            }`}
                          >
                            {resendingId === client.id ? (
                              <><span className="w-2.5 h-2.5 border border-blue-400 border-t-transparent rounded-full animate-spin inline-block" /> Sending...</>
                            ) : resentId === client.id ? (
                              <>✓ Sent!</>
                            ) : (
                              <>📨 Resend Code</>
                            )}
                          </button>
                          <button onClick={() => deleteClient(client.id)} className="text-[10px] text-red-400 font-bold flex items-center gap-0.5 bg-red-50 px-2 py-0.5 rounded-lg">
                            <Trash2 className="w-2.5 h-2.5" /> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Edit Client Modal */}
      {editingFullId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="px-6 pt-5 pb-4 border-b border-slate-100 flex items-center justify-between">
              <button onClick={() => setEditingFullId(null)} className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center">
                <X className="w-4 h-4 text-slate-500" />
              </button>
              <p className="font-bold text-slate-800 text-sm">Edit Client</p>
              <div className="w-8" />
            </div>
            <div className="px-6 py-5 space-y-3">
              {[
                { label: "Full Name", key: "user_name", type: "text" },
                { label: "Email", key: "user_email", type: "email" },
                { label: "Address", key: "home_address", type: "text" },
                { label: "Close Date", key: "close_date", type: "date" },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-1">{f.label}</label>
                  <input
                    type={f.type}
                    value={editForm[f.key] || ""}
                    onChange={e => setEditForm(p => ({ ...p, [f.key]: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/10"
                  />
                </div>
              ))}
              <button onClick={saveEditFull} className="w-full py-3.5 rounded-2xl bg-orange-500 text-white font-bold text-sm mt-2">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Client Modal */}
      {addStep && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="px-6 pt-5 pb-4 border-b border-slate-100 flex items-center justify-between">
              <button
                onClick={addStep === "done" ? resetAdd : addStep === "payment" ? () => setAddStep("form") : resetAdd}
                className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center"
              >
                {addStep === "payment" ? <ArrowLeft className="w-4 h-4 text-slate-500" /> : <X className="w-4 h-4 text-slate-500" />}
              </button>
              <p className="font-bold text-slate-800 text-sm">
                {addStep === "form" && "New Client"}
                {addStep === "payment" && "Complete Payment"}
                {addStep === "done" && "Client Added! 🎉"}
              </p>
              <div className="w-8" />
            </div>

            <div className="px-6 py-5">
              {/* Step: Form */}
              {addStep === "form" && (
                <div className="space-y-4">
                  <p className="text-xs text-slate-400">Enter the client's details. You'll pay after saving.</p>
                  {[
                    { label: "First & Last Name", key: "name", type: "text", placeholder: "Jane Smith" },
                    { label: "Email Address", key: "email", type: "email", placeholder: "jane@email.com" },
                    { label: "Estimated Close Date", key: "close_date", type: "date" },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-1">{f.label}</label>
                      <input
                        type={f.type}
                        value={form[f.key]}
                        onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                        placeholder={f.placeholder || ""}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/10"
                      />
                    </div>
                  ))}
                  <button
                    onClick={handleSaveClient}
                    disabled={!canSaveForm}
                    className="w-full py-3.5 rounded-2xl bg-orange-500 text-white font-bold text-sm disabled:opacity-40 mt-2"
                  >
                    Save & Continue to Payment
                  </button>
                </div>
              )}

              {/* Step: Payment */}
              {addStep === "payment" && pendingClient && (
                <div className="space-y-4">
                  <div className="bg-slate-50 rounded-2xl p-4 space-y-2">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Client Summary</p>
                    <div className="flex justify-between"><span className="text-xs text-slate-400">Name</span><span className="text-xs font-bold text-slate-700">{pendingClient.user_name}</span></div>
                    <div className="flex justify-between"><span className="text-xs text-slate-400">Email</span><span className="text-xs font-bold text-slate-700">{pendingClient.user_email}</span></div>
                    <div className="flex justify-between"><span className="text-xs text-slate-400">Close Date</span><span className="text-xs font-bold text-slate-700">{pendingClient.close_date}</span></div>
                    <div className="flex justify-between"><span className="text-xs text-slate-400">Invite Code</span><span className="text-xs font-black text-orange-500 tracking-widest">{pendingClient.invitation_code}</span></div>
                  </div>

                  <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-black text-slate-800">EZ Move AI — 1 Client</p>
                      <p className="text-xs text-slate-500">Includes full moving assistant access</p>
                    </div>
                    <p className="text-2xl font-black text-orange-500">$40</p>
                  </div>

                  <button
                    onClick={handlePayment}
                    disabled={paying}
                    className="w-full py-3.5 rounded-2xl bg-orange-500 text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {paying
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                      : <><CreditCard className="w-4 h-4" /> Pay $40 & Send Invite</>}
                  </button>
                  <p className="text-[10px] text-slate-400 text-center">Client will receive an invite email with their code after payment.</p>
                  <button
                    onClick={() => {
                      setClients(prev => prev.map(c =>
                        c.id === pendingClient.id ? { ...c, status: "active", billing_status: "charged" } : c
                      ));
                      setDoneData({ name: pendingClient.user_name, code: pendingClient.invitation_code });
                      setAddStep("done");
                    }}
                    className="w-full py-2.5 rounded-2xl border border-slate-200 text-slate-400 text-xs font-semibold"
                  >
                    Skip Payment (Demo)
                  </button>
                </div>
              )}

              {/* Step: Done */}
              {addStep === "done" && doneData && (
                <div className="text-center py-4">
                  <CheckCircle2 className="w-14 h-14 text-green-500 mx-auto mb-4" />
                  <p className="text-xl font-bold text-slate-800 mb-1">All Set!</p>
                  <p className="text-sm text-slate-500 mb-5">{doneData.name} is now active and has been emailed their invite code.</p>
                  <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 mb-5">
                    <p className="text-xs text-slate-500 mb-1">Their 4-digit invite code</p>
                    <p className="text-4xl font-black text-orange-500 tracking-widest">{doneData.code}</p>
                  </div>
                  <button onClick={resetAdd} className="w-full py-3 rounded-2xl bg-orange-500 text-white font-bold text-sm">Done</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}