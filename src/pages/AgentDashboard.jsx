import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";
import { Plus, Users, DollarSign, TrendingUp, ChevronRight, X, LogOut, Edit2, Check } from "lucide-react";
import { format, differenceInDays, parseISO } from "date-fns";

const STATUS_COLORS = {
  invited: "bg-amber-100 text-amber-700",
  registered: "bg-blue-100 text-blue-700",
  active: "bg-green-100 text-green-700",
  completed: "bg-slate-100 text-slate-600",
};

export default function AgentDashboard() {
  const [agent, setAgent] = useState(null);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [editingClientId, setEditingClientId] = useState(null);
  const [editCloseDate, setEditCloseDate] = useState("");
  const [invite, setInvite] = useState({ name: "", email: "", phone: "", close_date: "" });
  const [inviting, setInviting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const user = await base44.auth.me();
        if (user?.role !== "admin") {
          navigate(createPageUrl("AgentLogin"));
          return;
        }
        let agents = await base44.entities.Agent.filter({ created_by: user.email });
        let agentRecord;
        if (agents.length === 0) {
          agentRecord = await base44.entities.Agent.create({ company_name: user.full_name || "My Agency" });
        } else {
          agentRecord = agents[0];
        }
        setAgent(agentRecord);
        const clientList = await base44.entities.Client.filter({ agent_id: agentRecord.id });
        setClients(clientList.sort((a, b) => new Date(b.invited_date) - new Date(a.invited_date)));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleInvite = async () => {
    if (!invite.name || !invite.email || !invite.phone || !invite.close_date) {
      alert("Please fill all fields");
      return;
    }
    setInviting(true);
    const inviteCode = Math.floor(1000 + Math.random() * 9000).toString();
    try {
      const newClient = await base44.entities.Client.create({
        agent_id: agent.id,
        user_email: invite.email,
        user_name: invite.name,
        phone: invite.phone,
        close_date: invite.close_date,
        invitation_code: inviteCode,
        status: "invited",
        invited_date: new Date().toISOString(),
        billing_status: "pending",
      });

      await base44.integrations.Core.SendEmail({
        to: invite.email,
        subject: `🎉 Congrats on your home sale! Your EZ Move AI is ready`,
        body: `Hi ${invite.name},\n\nCongratulations on your home sale! Your agent has set up EZ Move AI to help make your move seamless.\n\nYour estimated close date is: ${invite.close_date}\n\nYour personal invitation code: ${inviteCode}\n\nVisit the app and enter this code to create your personalized moving plan.\n\nYour plan will be built around your closing date — week by week, step by step.\n\nWelcome to EZ Move AI!\n\nBest,\nEZ Move AI Team`,
      });

      setClients(prev => [newClient, ...prev]);
      setInvite({ name: "", email: "", phone: "", close_date: "" });
      setShowInviteModal(false);
    } catch (err) {
      console.error(err);
      alert("Error sending invitation");
    }
    setInviting(false);
  };

  const saveCloseDate = async (clientId) => {
    if (!editCloseDate) return;
    await base44.entities.Client.update(clientId, { close_date: editCloseDate });
    setClients(prev => prev.map(c => c.id === clientId ? { ...c, close_date: editCloseDate } : c));
    setEditingClientId(null);
  };

  const stats = {
    total: clients.length,
    active: clients.filter(c => c.status === "active" || c.status === "registered").length,
    revenue: clients.filter(c => c.billing_status === "charged").length * 40,
    pending: clients.filter(c => c.billing_status === "pending").length * 40,
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <div className="bg-[#0F172A] px-6 pt-12 pb-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                <span className="text-white text-sm font-black">EZ</span>
              </div>
              <div>
                <p className="text-white font-bold text-base leading-tight">EZ Move <span className="text-orange-400">AI</span></p>
                <p className="text-slate-400 text-xs">Agent Portal</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowInviteModal(true)}
                className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-colors"
              >
                <Plus className="w-4 h-4" /> Invite Client
              </button>
              <button
                onClick={() => base44.auth.logout(createPageUrl("AgentLogin"))}
                className="w-9 h-9 rounded-xl bg-slate-700 hover:bg-slate-600 flex items-center justify-center transition-colors"
              >
                <LogOut className="w-4 h-4 text-slate-300" />
              </button>
            </div>
          </div>

          <div>
            <p className="text-2xl font-bold text-white mb-0.5">{agent?.company_name}</p>
            <p className="text-slate-400 text-sm">Manage clients and moving timelines</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Total Clients", value: stats.total, icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
            { label: "Active", value: stats.active, icon: TrendingUp, color: "text-green-500", bg: "bg-green-50" },
            { label: "Revenue", value: `$${stats.revenue}`, icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-50" },
            { label: "Pending", value: `$${stats.pending}`, icon: DollarSign, color: "text-amber-500", bg: "bg-amber-50" },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <p className="text-2xl font-black text-slate-800">{stat.value}</p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Clients */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
            <p className="font-bold text-slate-800">Clients</p>
            <span className="text-xs text-slate-400 font-semibold">{clients.length} total</span>
          </div>

          {clients.length === 0 ? (
            <div className="py-16 text-center">
              <div className="text-5xl mb-3">👥</div>
              <p className="text-slate-600 font-semibold mb-1">No clients yet</p>
              <p className="text-slate-400 text-sm mb-4">Invite a client to get started</p>
              <button onClick={() => setShowInviteModal(true)} className="text-orange-500 font-bold text-sm hover:underline">
                + Invite first client
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {clients.map(client => {
                const daysLeft = client.close_date
                  ? differenceInDays(parseISO(client.close_date), new Date())
                  : null;
                return (
                  <div key={client.id} className="px-6 py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-slate-600">{(client.user_name || "?")[0]}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-800 text-sm truncate">{client.user_name || "—"}</p>
                          <p className="text-xs text-slate-500 truncate">{client.user_email}</p>
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${STATUS_COLORS[client.status] || "bg-slate-100 text-slate-500"}`}>
                              {client.status}
                            </span>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${client.billing_status === "charged" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                              ${client.billing_status === "charged" ? "40 paid" : "40 pending"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Close Date */}
                      <div className="flex-shrink-0 text-right">
                        {editingClientId === client.id ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="date"
                              value={editCloseDate}
                              onChange={e => setEditCloseDate(e.target.value)}
                              className="text-xs border border-orange-300 rounded-lg px-2 py-1 focus:outline-none focus:border-orange-500"
                            />
                            <button onClick={() => saveCloseDate(client.id)} className="w-7 h-7 bg-orange-500 rounded-lg flex items-center justify-center">
                              <Check className="w-3.5 h-3.5 text-white" />
                            </button>
                            <button onClick={() => setEditingClientId(null)} className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center">
                              <X className="w-3.5 h-3.5 text-slate-500" />
                            </button>
                          </div>
                        ) : (
                          <div>
                            {client.close_date ? (
                              <>
                                <p className="text-xs font-bold text-slate-700">{format(parseISO(client.close_date), "MMM d, yyyy")}</p>
                                <p className={`text-[10px] font-semibold ${daysLeft !== null && daysLeft < 14 ? "text-red-500" : "text-slate-400"}`}>
                                  {daysLeft !== null ? (daysLeft < 0 ? "Closed" : `${daysLeft}d left`) : ""}
                                </p>
                              </>
                            ) : (
                              <p className="text-[10px] text-slate-400">No close date</p>
                            )}
                            <button
                              onClick={() => { setEditingClientId(client.id); setEditCloseDate(client.close_date || ""); }}
                              className="flex items-center gap-1 text-[10px] text-orange-500 font-bold mt-1 hover:underline ml-auto"
                            >
                              <Edit2 className="w-3 h-3" /> Edit date
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    {client.invitation_code && client.status === "invited" && (
                      <div className="mt-2 ml-12 bg-slate-50 rounded-xl px-3 py-1.5 inline-flex items-center gap-2">
                        <span className="text-[10px] text-slate-500 font-medium">Invite code:</span>
                        <span className="text-xs font-black text-orange-500 tracking-widest">{client.invitation_code}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xl font-bold text-slate-800">Invite a Client</p>
                <p className="text-xs text-slate-500 mt-0.5">They'll receive a congrats email with their code</p>
              </div>
              <button onClick={() => setShowInviteModal(false)} className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200">
                <X className="w-4 h-4 text-slate-600" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              {[
                { label: "Full Name", key: "name", type: "text", placeholder: "Jane Smith" },
                { label: "Email", key: "email", type: "email", placeholder: "jane@email.com" },
                { label: "Phone", key: "phone", type: "tel", placeholder: "555-123-4567" },
              ].map(field => (
                <div key={field.key}>
                  <label className="text-xs font-bold text-slate-500 mb-1.5 block">{field.label}</label>
                  <input
                    type={field.type}
                    value={invite[field.key]}
                    onChange={e => setInvite(prev => ({ ...prev, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10"
                  />
                </div>
              ))}

              <div>
                <label className="text-xs font-bold text-slate-500 mb-1.5 block">Estimated Close Date</label>
                <input
                  type="date"
                  value={invite.close_date}
                  onChange={e => setInvite(prev => ({ ...prev, close_date: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10"
                />
                <p className="text-[11px] text-slate-400 mt-1">This drives the client's week-by-week project plan</p>
              </div>
            </div>

            <div className="bg-orange-50 rounded-2xl p-3 mb-4">
              <p className="text-xs text-orange-700 font-semibold">💳 A $40 charge will be applied once the client activates their account.</p>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowInviteModal(false)}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50">
                Cancel
              </button>
              <button onClick={handleInvite} disabled={inviting}
                className="flex-1 py-3 rounded-xl bg-orange-500 text-white font-bold text-sm hover:bg-orange-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
                {inviting ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Sending...</> : "Send Invite"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}