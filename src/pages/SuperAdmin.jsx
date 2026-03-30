import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { Users, DollarSign, Building2, User, LogOut, Trash2, TrendingUp, CheckCircle } from "lucide-react";

export default function SuperAdmin() {
  const [agents, setAgents] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      const me = await base44.auth.me();
      if (me?.role !== "super_admin") { navigate("/"); return; }
      const [agentList, clientList] = await Promise.all([
        base44.entities.Agent.list(),
        base44.entities.Client.list(),
      ]);
      setAgents(agentList);
      setClients(clientList);
      setLoading(false);
    };
    load();
  }, []);

  const totalRevenue = clients.filter(c => c.billing_status === "charged").length * 40;
  const activeClients = clients.filter(c => c.status === "active" || c.status === "registered").length;

  const removeAgent = async (agent) => {
    if (!confirm(`Remove ${agent.company_name}? This cannot be undone.`)) return;
    await base44.entities.Agent.delete(agent.id);
    setAgents(prev => prev.filter(a => a.id !== agent.id));
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      {/* Header */}
      <div className="border-b border-slate-800 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
              <span className="text-white font-black text-sm">EZ</span>
            </div>
            <div>
              <p className="font-bold text-white text-sm leading-tight">EZ Move AI</p>
              <p className="text-orange-500 text-[10px] font-bold uppercase tracking-widest">Super Admin</p>
            </div>
          </div>
          <button
            onClick={() => base44.auth.logout("/")}
            className="flex items-center gap-2 text-slate-400 hover:text-white text-sm font-semibold transition-colors"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Total Agents / Brokers", value: agents.length, Icon: Users, color: "text-blue-400", bg: "bg-blue-400/10" },
            { label: "Active Clients", value: activeClients, Icon: User, color: "text-emerald-400", bg: "bg-emerald-400/10" },
            { label: "Total Revenue", value: `$${totalRevenue.toLocaleString()}`, Icon: DollarSign, color: "text-orange-400", bg: "bg-orange-400/10" },
          ].map(s => (
            <div key={s.label} className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700/50">
              <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>
                <s.Icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <p className="text-2xl font-black text-white">{s.value}</p>
              <p className="text-slate-400 text-xs font-semibold mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Revenue Breakdown */}
        <div className="bg-slate-800/60 rounded-2xl border border-slate-700/50 p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-orange-400" />
            <h2 className="font-bold text-white">Revenue Summary</h2>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-900/50 rounded-xl p-4 text-center">
              <p className="text-2xl font-black text-orange-400">${clients.filter(c => c.billing_status === "charged").length * 40}</p>
              <p className="text-slate-400 text-xs mt-1">Collected</p>
            </div>
            <div className="bg-slate-900/50 rounded-xl p-4 text-center">
              <p className="text-2xl font-black text-amber-400">{clients.filter(c => c.billing_status === "pending").length}</p>
              <p className="text-slate-400 text-xs mt-1">Pending Charges</p>
            </div>
            <div className="bg-slate-900/50 rounded-xl p-4 text-center">
              <p className="text-2xl font-black text-blue-400">{clients.filter(c => c.billing_status === "charged").length}</p>
              <p className="text-slate-400 text-xs mt-1">Paid Clients</p>
            </div>
          </div>
        </div>

        {/* Agents Table */}
        <div className="bg-slate-800/60 rounded-2xl border border-slate-700/50 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-700/50 flex items-center justify-between">
            <h2 className="font-bold text-white">Agents & Broker Firms</h2>
            <span className="text-slate-500 text-sm">{agents.length} enrolled</span>
          </div>
          {agents.length === 0 ? (
            <div className="py-16 text-center text-slate-500">
              <Building2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-semibold">No agents enrolled yet</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-700/30">
              {agents.map(agent => {
                const agentClients = clients.filter(c => c.agent_id === agent.id);
                const agentRevenue = agentClients.filter(c => c.billing_status === "charged").length * 40;
                return (
                  <div key={agent.id} className="px-6 py-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-700/80 flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-5 h-5 text-slate-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white text-sm">{agent.company_name}</p>
                      <p className="text-slate-400 text-xs truncate">{agent.created_by}</p>
                    </div>
                    <div className="flex items-center gap-5 shrink-0">
                      <div className="text-center hidden sm:block">
                        <p className="text-sm font-black text-white">{agentClients.length}</p>
                        <p className="text-[10px] text-slate-500">clients</p>
                      </div>
                      <div className="text-center hidden sm:block">
                        <p className="text-sm font-black text-emerald-400">${agentRevenue}</p>
                        <p className="text-[10px] text-slate-500">revenue</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 ${
                        agent.subscription_status === "active" || !agent.subscription_status
                          ? "bg-emerald-400/10 text-emerald-400"
                          : "bg-slate-700 text-slate-400"
                      }`}>
                        {agent.subscription_status || "active"}
                      </span>
                      <button
                        onClick={() => removeAgent(agent)}
                        className="w-8 h-8 rounded-xl bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center transition-colors shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* All Clients */}
        <div className="bg-slate-800/60 rounded-2xl border border-slate-700/50 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-700/50 flex items-center justify-between">
            <h2 className="font-bold text-white">All Clients</h2>
            <span className="text-slate-500 text-sm">{clients.length} total</span>
          </div>
          {clients.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <p className="font-semibold">No clients yet</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-700/30 max-h-96 overflow-y-auto">
              {clients.map(client => (
                <div key={client.id} className="px-6 py-3 flex items-center gap-4">
                  <div className="w-8 h-8 rounded-xl bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-orange-400 text-xs font-bold">{(client.user_name || "?")[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white text-sm">{client.user_name || "—"}</p>
                    <p className="text-slate-400 text-xs truncate">{client.user_email}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      client.status === "active" ? "bg-emerald-400/10 text-emerald-400" :
                      client.status === "registered" ? "bg-blue-400/10 text-blue-400" :
                      client.status === "invited" ? "bg-amber-400/10 text-amber-400" :
                      "bg-slate-700 text-slate-400"
                    }`}>{client.status}</span>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      client.billing_status === "charged" ? "bg-emerald-400/10 text-emerald-400" : "bg-slate-700/80 text-slate-500"
                    }`}>{client.billing_status === "charged" ? "$40 ✓" : "pending"}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}