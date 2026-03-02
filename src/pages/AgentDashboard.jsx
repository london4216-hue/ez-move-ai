import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";
import { Plus, Users, DollarSign, TrendingUp, X, Calendar, Mail, Phone, LogOut } from "lucide-react";

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
  const [showModal, setShowModal] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", close_date: "" });
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const user = await base44.auth.me();
        if (user?.role !== "admin") {
          navigate(createPageUrl("AgentLogin"));
          return;
        }
        const agents = await base44.entities.Agent.filter({ created_by: user.email });
        let agentRecord = agents[0];
        if (!agentRecord) {
          agentRecord = await base44.entities.Agent.create({ company_name: user.full_name || "My Agency" });
        }
        setAgent(agentRecord);
        const clientList = await base44.entities.Client.filter({ agent_id: agentRecord.id });
        setClients(clientList);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [navigate]);

  const handleInvite = async () => {
    if (!form.name || !form.email || !form.phone || !form.close_date) {
      alert("Please fill in all fields");
      return;
    }
    setInviting(true);
    const inviteCode = Math.floor(1000 + Math.random() * 9000).toString();
    try {
      const newClient = await base44.entities.Client.create({
        agent_id: agent.id,
        user_email: form.email,
        user_name: form.name,
        phone: form.phone,
        close_date: form.close_date,
        invitation_code: inviteCode,
        status: "invited",
        invited_date: new Date().toISOString()
      });
      await base44.integrations.Core.SendEmail({
        to: form.email,
        subject: `Your EZ Move AI Invitation – Code: ${inviteCode}`,
        body: `Hi ${form.name},\n\nYour real estate agent has invited you to EZ Move AI — your personalized moving assistant.\n\nYour invitation code: ${inviteCode}\n\nVisit the app and enter this code to get started.\n\nEZ Move AI Team`
      });
      setClients(prev => [...prev, newClient]);
      setForm({ name: "", email: "", phone: "", close_date: "" });
      setShowModal(false);
    } catch (err) {
      console.error(err);
      alert("Error sending invitation");
    } finally {
      setInviting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const activeCount = clients.filter(c => ["registered", "active"].includes(c.status)).length;
  const revenue = clients.length * 40;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-slate-900 px-6 pt-10 pb-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500 rounded-2xl flex items-center justify-center">
                <span className="text-white font-black text-sm">EZ</span>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Agent Portal</p>
                <p className="text-white font-bold text-base leading-tight">{agent?.company_name}</p>
              </div>
            </div>
            <button
              onClick={() => base44.auth.logout(createPageUrl("AgentLogin"))}
              className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Users, label: "Clients", value: clients.length, color: "text-blue-400" },
              { icon: TrendingUp, label: "Active", value: activeCount, color: "text-green-400" },
              { icon: DollarSign, label: "Revenue", value: `$${revenue}`, color: "text-orange-400" },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="bg-slate-800 rounded-2xl p-4 border border-slate-700">
                <Icon className={`w-5 h-5 ${color} mb-2`} />
                <p className="text-xl font-black text-white leading-none">{value}</p>
                <p className="text-xs text-slate-400 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Client List */}
      <div className="max-w-4xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black text-slate-900">Your Clients</h2>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-orange-500 text-white font-bold text-sm shadow-lg shadow-orange-500/25 hover:bg-orange-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Invite Client
          </button>
        </div>

        {clients.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-100">
            <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-4 text-3xl">👥</div>
            <p className="text-slate-600 font-semibold mb-1">No clients yet</p>
            <p className="text-slate-400 text-sm mb-5">Invite your first client to get started</p>
            <button onClick={() => setShowModal(true)} className="text-orange-500 font-bold text-sm hover:text-orange-600">
              + Invite a Client
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {clients.map((client) => (
              <div key={client.id} className="bg-white rounded-2xl p-5 border border-slate-100 flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl bg-slate-900 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-black text-sm">
                    {(client.user_name || "?").split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 truncate">{client.user_name}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Mail className="w-3 h-3" />{client.user_email}
                    </span>
                    {client.close_date && (
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />Close: {client.close_date}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[client.status] || STATUS_COLORS.invited}`}>
                    {client.status}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    client.billing_status === "charged" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
                  }`}>
                    ${client.billing_status === "charged" ? "40 ✓" : "40 pending"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-slate-900">Invite a Client</h2>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center">
                <X className="w-4 h-4 text-slate-600" />
              </button>
            </div>

            <div className="space-y-3 mb-6">
              {[
                { key: "name", label: "Full Name", type: "text", placeholder: "Jane Smith" },
                { key: "email", label: "Email", type: "email", placeholder: "jane@email.com" },
                { key: "phone", label: "Phone", type: "tel", placeholder: "555-123-4567" },
                { key: "close_date", label: "Estimated Close Date", type: "date", placeholder: "" },
              ].map(({ key, label, type, placeholder }) => (
                <div key={key}>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1.5">{label}</label>
                  <input
                    type={type}
                    value={form[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="input-field"
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-3.5 rounded-2xl border-2 border-slate-200 text-slate-700 font-bold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleInvite}
                disabled={inviting}
                className="flex-1 py-3.5 rounded-2xl bg-orange-500 text-white font-bold disabled:opacity-40 hover:bg-orange-600 transition-colors"
              >
                {inviting ? "Sending..." : "Send Invite"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}