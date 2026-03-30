import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { Users, DollarSign, Building2, User, LogOut, Trash2, TrendingUp, Plus, CheckCircle, Shield, Key } from "lucide-react";

const TABS = ["Overview", "Agents & Brokers", "All Clients", "Licenses"];

export default function SuperAdmin() {
  const [agents, setAgents] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Overview");
  const [licenseCount, setLicenseCount] = useState(5);
  const [licensePurchased, setLicensePurchased] = useState(false);
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
  const pendingClients = clients.filter(c => c.status === "invited").length;

  const removeAgent = async (agent) => {
    if (!confirm(`Remove ${agent.company_name}?`)) return;
    await base44.entities.Agent.delete(agent.id);
    setAgents(prev => prev.filter(a => a.id !== agent.id));
  };

  if (loading) return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-blue-100 shadow-sm px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-md shadow-orange-200">
              <span className="text-white font-black text-sm">EZ</span>
            </div>
            <div>
              <p className="font-black text-slate-800 text-sm leading-tight">EZ Move <span className="text-orange-500">AI</span></p>
              <div className="flex items-center gap-1.5">
                <Shield className="w-3 h-3 text-blue-500" />
                <p className="text-blue-500 text-[10px] font-bold uppercase tracking-widest">System Admin</p>
              </div>
            </div>
          </div>
          <button onClick={() => base44.auth.logout("/")} className="flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm font-semibold transition-colors bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6 space-y-5">
        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-2xl p-1 border border-blue-100 shadow-sm w-fit">
          {TABS.map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === t ? "bg-blue-500 text-white shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "Overview" && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Agents & Brokers", value: agents.length, Icon: Building2, color: "text-blue-500", bg: "bg-blue-50", border: "border-blue-100" },
                { label: "Active Clients", value: activeClients, Icon: Users, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
                { label: "Pending Invites", value: pendingClients, Icon: User, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
                { label: "Total Revenue", value: `$${totalRevenue.toLocaleString()}`, Icon: DollarSign, color: "text-orange-500", bg: "bg-orange-50", border: "border-orange-100" },
              ].map(s => (
                <div key={s.label} className={`bg-white rounded-2xl p-5 border ${s.border} shadow-sm`}>
                  <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>
                    <s.Icon className={`w-5 h-5 ${s.color}`} />
                  </div>
                  <p className="text-2xl font-black text-slate-800">{s.value}</p>
                  <p className="text-slate-500 text-xs font-semibold mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Revenue Breakdown */}
            <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-4 h-4 text-orange-500" />
                <h2 className="font-bold text-slate-800">Revenue Breakdown</h2>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-center">
                  <p className="text-2xl font-black text-emerald-600">${clients.filter(c => c.billing_status === "charged").length * 40}</p>
                  <p className="text-slate-500 text-xs mt-1 font-semibold">Collected</p>
                </div>
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-center">
                  <p className="text-2xl font-black text-amber-600">{clients.filter(c => c.billing_status === "pending").length}</p>
                  <p className="text-slate-500 text-xs mt-1 font-semibold">Pending Charges</p>
                </div>
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-center">
                  <p className="text-2xl font-black text-blue-600">{clients.filter(c => c.billing_status === "charged").length}</p>
                  <p className="text-slate-500 text-xs mt-1 font-semibold">Paid Clients</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Agents Tab */}
        {activeTab === "Agents & Brokers" && (
          <div className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-blue-50 flex items-center justify-between">
              <h2 className="font-bold text-slate-800">Enrolled Agents & Brokers</h2>
              <span className="text-slate-400 text-sm">{agents.length} enrolled</span>
            </div>
            {agents.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                <Building2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="font-semibold">No agents enrolled yet</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {agents.map(agent => {
                  const agentClients = clients.filter(c => c.agent_id === agent.id);
                  const agentRevenue = agentClients.filter(c => c.billing_status === "charged").length * 40;
                  return (
                    <div key={agent.id} className="px-6 py-4 flex items-center gap-4 hover:bg-blue-50/30 transition-colors">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-5 h-5 text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-800 text-sm">{agent.company_name}</p>
                        <p className="text-slate-400 text-xs truncate">{agent.created_by}</p>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-center hidden sm:block">
                          <p className="text-sm font-black text-slate-700">{agentClients.length}</p>
                          <p className="text-[10px] text-slate-400">clients</p>
                        </div>
                        <div className="text-center hidden sm:block">
                          <p className="text-sm font-black text-emerald-600">${agentRevenue}</p>
                          <p className="text-[10px] text-slate-400">revenue</p>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                          {agent.subscription_status || "active"}
                        </span>
                        <button onClick={() => removeAgent(agent)} className="w-8 h-8 rounded-xl bg-red-50 hover:bg-red-100 border border-red-100 flex items-center justify-center transition-colors">
                          <Trash2 className="w-3.5 h-3.5 text-red-400" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* All Clients Tab */}
        {activeTab === "All Clients" && (
          <div className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-blue-50 flex items-center justify-between">
              <h2 className="font-bold text-slate-800">All Clients</h2>
              <span className="text-slate-400 text-sm">{clients.length} total</span>
            </div>
            {clients.length === 0 ? (
              <div className="py-12 text-center text-slate-400"><p className="font-semibold">No clients yet</p></div>
            ) : (
              <div className="divide-y divide-slate-50 max-h-[500px] overflow-y-auto">
                {clients.map(client => (
                  <div key={client.id} className="px-6 py-3 flex items-center gap-4 hover:bg-blue-50/30 transition-colors">
                    <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-orange-500 text-xs font-bold">{(client.user_name || "?")[0]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 text-sm">{client.user_name || "—"}</p>
                      <p className="text-slate-400 text-xs truncate">{client.user_email}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        client.status === "active" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                        client.status === "registered" ? "bg-blue-50 text-blue-600 border-blue-100" :
                        client.status === "invited" ? "bg-amber-50 text-amber-600 border-amber-100" :
                        "bg-slate-50 text-slate-500 border-slate-100"
                      }`}>{client.status}</span>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        client.billing_status === "charged" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-500 border-slate-100"
                      }`}>{client.billing_status === "charged" ? "$40 ✓" : "pending"}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Licenses Tab */}
        {activeTab === "Licenses" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-5">
                <Key className="w-5 h-5 text-orange-500" />
                <h2 className="font-bold text-slate-800">License Management</h2>
              </div>
              <p className="text-slate-500 text-sm mb-6">Purchase client licenses for agents and brokers. Each license = one active client slot at $40.</p>

              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  { count: 5, price: 200, label: "Starter Pack" },
                  { count: 10, price: 380, label: "Pro Pack", popular: true },
                  { count: 25, price: 875, label: "Enterprise", label2: "Save 12%" },
                ].map(pkg => (
                  <div key={pkg.count} className={`relative rounded-2xl p-4 border text-center ${pkg.popular ? "border-orange-300 bg-orange-50" : "border-blue-100 bg-blue-50/50"}`}>
                    {pkg.popular && <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">Popular</span>}
                    <p className="text-3xl font-black text-slate-800 mt-1">{pkg.count}</p>
                    <p className="text-xs text-slate-400 font-semibold">licenses</p>
                    <p className="text-xl font-black text-orange-500 mt-2">${pkg.price}</p>
                    <p className="text-[10px] text-slate-400 mb-3">{pkg.label}{pkg.label2 ? ` · ${pkg.label2}` : ""}</p>
                    <button
                      onClick={() => setLicensePurchased(true)}
                      className={`w-full py-2 rounded-xl text-xs font-bold transition-colors ${pkg.popular ? "bg-orange-500 text-white hover:bg-orange-600" : "bg-white text-slate-700 border border-blue-200 hover:bg-blue-50"}`}
                    >
                      Purchase
                    </button>
                  </div>
                ))}
              </div>

              {licensePurchased && (
                <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
                  <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                  <div>
                    <p className="font-bold text-emerald-700 text-sm">Licenses Purchased!</p>
                    <p className="text-emerald-600 text-xs">New licenses are now available for assignment to agents.</p>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
              <h3 className="font-bold text-slate-800 mb-4">License Overview</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-center">
                  <p className="text-2xl font-black text-blue-600">{clients.filter(c => c.billing_status === "charged").length}</p>
                  <p className="text-slate-500 text-xs mt-1 font-semibold">Used</p>
                </div>
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-center">
                  <p className="text-2xl font-black text-emerald-600">∞</p>
                  <p className="text-slate-500 text-xs mt-1 font-semibold">Available</p>
                </div>
                <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 text-center">
                  <p className="text-2xl font-black text-orange-500">{agents.length}</p>
                  <p className="text-slate-500 text-xs mt-1 font-semibold">Active Agents</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}