import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { getPortalRole } from "@/lib/usePortalRole";
import { Plus, LogOut, Edit2, X, Trash2, Users, Building2, ArrowLeft, Loader2, CheckCircle2, CreditCard, Palette, Copy, Check, Shield } from "lucide-react";

import { differenceInDays, parseISO } from "date-fns";

const STATUS_COLORS = {
  invited: "bg-amber-50 text-amber-600 border-amber-100",
  registered: "bg-blue-50 text-blue-600 border-blue-100",
  active: "bg-emerald-50 text-emerald-600 border-emerald-100",
  completed: "bg-slate-50 text-slate-500 border-slate-100",
};

export default function BrokerDashboard() {
  const [agent, setAgent] = useState(null);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addStep, setAddStep] = useState(null);

  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", role: "buyer" });
  const [pendingClient, setPendingClient] = useState(null);
  const [paying, setPaying] = useState(false);
  const [doneData, setDoneData] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showBranding, setShowBranding] = useState(false);
  const [brandName, setBrandName] = useState("");
  const [copiedId, setCopiedId] = useState(null);

  const copyInviteLink = (client) => {
    const link = `${window.location.origin}/Register?code=${client.invitation_code}`;
    navigator.clipboard.writeText(link);
    setCopiedId(client.id);
    setTimeout(() => setCopiedId(null), 2500);
  };
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      const authed = await base44.auth.isAuthenticated();
      if (!authed) {
        base44.auth.redirectToLogin("/BrokerDashboard");
        return;
      }
      const user = await base44.auth.me().catch(() => null);
      if (!user) { base44.auth.redirectToLogin("/BrokerDashboard"); return; }
      const portalRole = getPortalRole(user);
      if (portalRole !== "broker" && portalRole !== "super_admin") { navigate("/", { replace: true }); setLoading(false); return; }
      let agents = await base44.entities.Agent.filter({ created_by: user.email });
      let agentRecord = agents.length === 0
        ? await base44.entities.Agent.create({ company_name: user.full_name || "My Brokerage" })
        : agents[0];
      setAgent(agentRecord);
      setBrandName(agentRecord.company_name || "");
      const clientList = await base44.entities.Client.filter({ agent_id: agentRecord.id });
      setClients(clientList.sort((a, b) => new Date(b.invited_date || 0) - new Date(a.invited_date || 0)));
      setLoading(false);
    };
    load();
  }, []);

  const geocode = async (address) => {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1&countrycodes=us`);
    const data = await res.json();
    if (!data[0]) return null;
    return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
  };

  const haversineMiles = (a, b) => {
    const R = 3958.8;
    const dLat = (b.lat - a.lat) * Math.PI / 180;
    const dLon = (b.lon - a.lon) * Math.PI / 180;
    const x = Math.sin(dLat/2)**2 + Math.cos(a.lat*Math.PI/180)*Math.cos(b.lat*Math.PI/180)*Math.sin(dLon/2)**2;
    return Math.round(R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1-x)));
  };

  const estimateMiles = async (fromAddr, toAddr) => {
    if (!fromAddr || !toAddr) return null;
    const [from, to] = await Promise.all([geocode(fromAddr), geocode(toAddr)]);
    if (!from || !to) return null;
    return haversineMiles(from, to);
  };

  const resetAdd = (deleteOrphan = false) => {
    if (deleteOrphan && pendingClient) {
      base44.entities.Client.delete(pendingClient.id).catch(() => {});
      setClients(prev => prev.filter(c => c.id !== pendingClient.id));
    }
    setAddStep(null);
    setForm({ firstName: "", lastName: "", email: "", phone: "", role: "buyer" });
    setPendingClient(null);
    setDoneData(null);
  };

  const handleSaveClient = async () => {
    try {
      const code = Math.floor(1000 + Math.random() * 9000).toString();
      const clientName = `${form.firstName} ${form.lastName}`;
      const newClient = await base44.entities.Client.create({
        agent_id: agent.id, user_name: clientName, user_email: form.email, phone: form.phone,
        invitation_code: code, status: "invited",
        invited_date: new Date().toISOString(), billing_status: "pending",
      });
      setPendingClient({ ...newClient, invitation_code: code });
      setClients(prev => [{ ...newClient, invitation_code: code }, ...prev]);
      const appUrl = window.location.origin;
      const inviteLink = `${appUrl}/Register?code=${code}`;
      base44.integrations.Core.SendEmail({
        to: form.email,
        from_name: agent?.company_name || "EZ Move AI",
        subject: `Your EZ Move AI Invitation from ${agent?.company_name || "your agent"}`,
        body: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px"><div style="background:linear-gradient(135deg,#f97316,#ea580c);border-radius:16px;padding:24px;text-align:center;margin-bottom:24px"><h1 style="color:white;margin:0;font-size:28px;font-weight:900">EZ Move AI</h1></div><h2 style="color:#1e293b">Hi ${clientName},</h2><p style="color:#475569;line-height:1.6">${agent?.company_name || "Your real estate agent"} has invited you to EZ Move AI.</p><a href="${inviteLink}" style="display:block;background:#f97316;color:white;text-decoration:none;text-align:center;padding:16px;border-radius:12px;font-weight:700;font-size:16px;margin:24px 0">Get Started →</a></div>`,
      }).catch(() => {});
      setAddStep("payment");
    } catch (e) {
      alert("Failed to save: " + (e?.message || "Please try again."));
    }
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

  const deleteClient = async (id) => {
    if (!confirm("Delete this client?")) return;
    await base44.entities.Client.delete(id);
    setClients(prev => prev.filter(c => c.id !== id));
  };

  const saveBranding = async () => {
    await base44.entities.Agent.update(agent.id, { company_name: brandName });
    setAgent(prev => ({ ...prev, company_name: brandName }));
    setShowBranding(false);
  };


  const canSave = form.firstName.trim() && form.lastName.trim() && form.email.trim();

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-9 h-9 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-sm font-medium">Loading your portal…</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Portal identity bar */}
      <div className="bg-purple-800 px-4 sm:px-6 py-2.5 flex items-center gap-2">
        <div className="w-5 h-5 rounded bg-white/20 flex items-center justify-center">
          <Building2 className="w-3 h-3 text-white" />
        </div>
        <span className="text-white text-[10px] font-black uppercase tracking-widest">Broker Portal</span>
        <span className="text-purple-300 text-[10px]">{agent?.company_name && `· ${agent.company_name}`}</span>
      </div>
      <div className="bg-white border-b border-slate-200 shadow-sm px-4 sm:px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center shadow-md shadow-purple-200">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-black text-slate-800 text-sm leading-tight">{agent?.company_name}</p>
              <p className="text-purple-500 text-[10px] font-semibold">Broker Portal · EZ Move AI</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowBranding(true)} className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors" title="Branding">
              <Palette className="w-4 h-4 text-slate-500" />
            </button>
            <button onClick={() => setAddStep("form")} className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors shadow-md shadow-purple-200">
              <Plus className="w-3.5 h-3.5" /> Add Buyer / Seller
            </button>
            <a href="/SuperAdmin" className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-red-50 border border-slate-200 hover:border-red-200 text-slate-500 hover:text-red-500 text-xs font-bold transition-colors" title="Super Admin Portal">
              <Shield className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Admin</span>
            </a>
            <button onClick={() => base44.auth.logout("/")} className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
              <LogOut className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Buyers/Sellers", value: clients.length, Icon: Users, color: "text-blue-500", bg: "bg-blue-50", border: "border-blue-100" },
            { label: "Active", value: clients.filter(c => c.status === "active").length, Icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
            { label: "Pending", value: clients.filter(c => c.status === "invited").length, Icon: Users, color: "text-amber-500", bg: "bg-amber-50", border: "border-amber-100" },
            { label: "Revenue", value: `$${(agent?.total_charged || 0).toLocaleString()}`, Icon: CreditCard, color: "text-orange-500", bg: "bg-orange-50", border: "border-orange-100" },
          ].map(s => (
            <div key={s.label} className={`bg-white rounded-2xl p-4 border ${s.border} shadow-sm`}>
              <div className={`w-8 h-8 ${s.bg} rounded-xl flex items-center justify-center mb-2`}>
                <s.Icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <p className="text-xl font-black text-slate-800">{s.value}</p>
              <p className="text-slate-500 text-xs font-semibold mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-blue-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-orange-500" />
              <p className="font-bold text-slate-800 text-sm">Buyers & Sellers</p>
            </div>
            <button onClick={() => setAddStep("form")} className="text-orange-500 text-xs font-bold flex items-center gap-1 hover:text-orange-600">
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>

          {clients.length === 0 ? (
            <div className="py-14 text-center">
              <div className="text-4xl mb-3">👥</div>
              <p className="text-slate-500 font-semibold mb-1">No buyers or sellers yet</p>
              <button onClick={() => setAddStep("form")} className="text-orange-500 font-bold text-sm">+ Add your first buyer or seller</button>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {clients.map(client => {
                const daysLeft = client.close_date ? differenceInDays(parseISO(client.close_date), new Date()) : null;
                return (
                  <div key={client.id} className="px-5 py-3.5 flex items-center gap-3 hover:bg-blue-50/30 transition-colors">
                    <div className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-orange-500">{(client.user_name || "?")[0]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-slate-800 text-sm">{client.user_name || "—"}</p>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${STATUS_COLORS[client.status] || "bg-slate-50 text-slate-500 border-slate-100"}`}>{client.status}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">{client.user_email}</p>
                      {client.estimated_miles != null && (
                        <span className="text-[10px] font-bold text-blue-500 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded-md inline-block mt-0.5">
                          📍 {client.estimated_miles.toLocaleString()} mi move
                        </span>
                      )}
                      {client.invitation_code && (
                        <button
                          onClick={() => copyInviteLink(client)}
                          className={`inline-flex items-center gap-1.5 mt-0.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-all ${
                            copiedId === client.id
                              ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                              : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-orange-50 hover:border-orange-200 hover:text-orange-600"
                          }`}
                        >
                          {copiedId === client.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          {copiedId === client.id ? "Copied!" : "Copy Invite Link"}
                        </button>
                      )}
                    </div>
                    <div className="flex-shrink-0 text-right flex flex-col items-end gap-1.5">
                      {daysLeft !== null && (
                        <p className={`text-xs font-bold ${daysLeft < 0 ? "text-emerald-600" : daysLeft < 14 ? "text-red-500" : "text-slate-500"}`}>
                          {daysLeft < 0 ? "Closed ✓" : `${daysLeft}d left`}
                        </p>
                      )}
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => { setEditForm({ user_name: client.user_name, user_email: client.user_email, phone: client.phone, home_address: client.home_address, close_date: client.close_date }); setEditingId(client.id); }}
                          className="flex items-center gap-1 text-orange-500 font-bold bg-orange-50 border border-orange-100 px-2.5 py-1.5 rounded-lg hover:bg-orange-100 transition-colors min-h-[32px] text-xs">
                          <Edit2 className="w-3 h-3" /> Edit
                        </button>
                        <button onClick={() => deleteClient(client.id)} className="flex items-center gap-1 text-red-500 font-bold bg-red-50 border border-red-100 px-2.5 py-1.5 rounded-lg hover:bg-red-100 transition-colors min-h-[32px]">
                          <Trash2 className="w-3 h-3" />
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

      {/* Branding Modal */}
      {showBranding && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl border border-blue-100 overflow-hidden">
            <div className="px-6 pt-5 pb-4 border-b border-slate-100 flex items-center justify-between">
              <p className="font-bold text-slate-800">White-Label Branding</p>
              <button onClick={() => setShowBranding(false)} className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center"><X className="w-4 h-4 text-slate-500" /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-2">Firm Name</label>
                <input type="text" value={brandName} onChange={e => setBrandName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/10" />
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
                <p className="text-xs text-slate-400 mb-2 font-semibold">Preview</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-white" />
                  </div>
                  <p className="font-bold text-slate-800 text-sm">{brandName || "Your Firm Name"}</p>
                </div>
                <p className="text-[10px] text-slate-400 mt-1 ml-10">Powered by EZ Move AI</p>
              </div>
              <button onClick={saveBranding} className="w-full py-3 rounded-xl bg-orange-500 text-white font-bold text-sm hover:bg-orange-600 transition-colors">Save Branding</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md shadow-2xl border border-blue-100 overflow-hidden">
            <div className="px-6 pt-5 pb-4 border-b border-slate-100 flex items-center justify-between">
              <button onClick={() => setEditingId(null)} className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center"><X className="w-4 h-4 text-slate-500" /></button>
              <p className="font-bold text-slate-800 text-sm">Edit Buyer / Seller</p>
              <div className="w-8" />
            </div>
            <div className="px-6 py-5 space-y-3">
              {[{ label: "Full Name", key: "user_name", type: "text" }, { label: "Email", key: "user_email", type: "email" }, { label: "Est. Close / First Day of Home", key: "close_date", type: "date" }].map(f => (
                <div key={f.key}>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-1">{f.label}</label>
                  <input type={f.type} value={editForm[f.key] || ""} onChange={e => setEditForm(p => ({ ...p, [f.key]: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/10" />
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md shadow-2xl border border-blue-100 overflow-hidden">
            <div className="px-6 pt-5 pb-4 border-b border-slate-100 flex items-center justify-between">
              <button onClick={addStep === "payment" ? () => resetAdd(true) : resetAdd} className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center">
                {addStep === "payment" ? <ArrowLeft className="w-4 h-4 text-slate-500" /> : <X className="w-4 h-4 text-slate-500" />}
              </button>
              <p className="font-bold text-slate-800 text-sm">
                {addStep === "form" ? "New Buyer / Seller" : addStep === "payment" ? "Confirm & Pay" : "Buyer/Seller Added! 🎉"}
              </p>
              <div className="w-8" />
            </div>
            <div className="px-6 py-5">
              {addStep === "form" && (
                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                  <div className="grid grid-cols-2 gap-3">
                    {["firstName", "lastName"].map(k => (
                      <div key={k}>
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-1">{k === "firstName" ? "First" : "Last"}</label>
                        <input type="text" value={form[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))} placeholder={k === "firstName" ? "Jane" : "Smith"}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-orange-400" />
                      </div>
                    ))}
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-1">Email <span className="text-orange-500">*</span></label>
                    <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="jane@example.com"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-orange-400" />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-1">Phone <span className="text-slate-300">(for SMS)</span></label>
                    <input type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+1 (555) 000-0000"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-orange-400" />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-1">Role</label>
                    <div className="grid grid-cols-2 gap-2">
                      {["buyer", "seller"].map(r => (
                        <button key={r} type="button" onClick={() => setForm(p => ({ ...p, role: r }))}
                          className={`py-3 rounded-xl border font-bold text-sm transition-all ${form.role === r ? "bg-orange-500 border-orange-500 text-white" : "border-slate-200 text-slate-600 hover:border-orange-300"}`}>
                          {r === "buyer" ? "🏠 Buyer" : "🏷️ Seller"}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button onClick={handleSaveClient} disabled={!canSave} className="w-full py-3.5 rounded-2xl bg-orange-500 text-white font-bold text-sm disabled:opacity-40 hover:bg-orange-600 transition-colors flex items-center justify-center gap-2">
                    Save & Continue →
                  </button>
                </div>
              )}
              {addStep === "payment" && pendingClient && (
                <div className="space-y-4">
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Summary</p>
                    <div className="flex justify-between"><span className="text-xs text-slate-400">Name</span><span className="text-xs font-bold text-slate-700">{pendingClient.user_name}</span></div>
                    <div className="flex justify-between"><span className="text-xs text-slate-400">Invite Code</span><span className="text-xs font-black text-orange-500 tracking-widest">{pendingClient.invitation_code}</span></div>
                    {pendingClient.estimated_miles != null && (
                      <div className="flex justify-between items-center pt-1 border-t border-slate-100">
                        <span className="text-xs text-slate-400">Est. Miles</span>
                        <span className="text-sm font-black text-blue-600">{pendingClient.estimated_miles.toLocaleString()} mi</span>
                      </div>
                    )}
                  </div>
                  <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-black text-slate-800">EZ Move AI — 1 Buyer/Seller</p>
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
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-5 text-left">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-2">📎 Send this link to your buyer/seller</p>
                    <p className="text-xs text-slate-600 break-all font-mono mb-3">{`${window.location.origin}/Register?code=${doneData.code}`}</p>
                    <button
                      onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/Register?code=${doneData.code}`); }}
                      className="w-full bg-orange-500 text-white text-sm font-bold px-4 py-2.5 rounded-xl hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <Copy className="w-4 h-4" /> Copy Invite Link
                    </button>
                    <p className="text-[10px] text-slate-400 mt-2 text-center">Share via text, WhatsApp, or any messaging app</p>
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