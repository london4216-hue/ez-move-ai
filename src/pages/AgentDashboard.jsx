import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";
import { Plus, Mail, DollarSign, Users } from "lucide-react";

export default function AgentDashboard() {
  const [agent, setAgent] = useState(null);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [invitePhone, setInvitePhone] = useState("");
  const [inviteCloseDate, setInviteCloseDate] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const loadAgent = async () => {
      try {
        const user = await base44.auth.me();
        if (user?.role !== "admin") {
          navigate(createPageUrl("AgentLogin"));
          return;
        }

        // Get or create agent record
        const agents = await base44.entities.Agent.filter({ created_by: user.email });
        if (agents.length === 0) {
          const newAgent = await base44.entities.Agent.create({
            company_name: user.full_name || "My Agency"
          });
          setAgent(newAgent);
        } else {
          setAgent(agents[0]);
        }

        // Load clients
        if (agents[0]?.id) {
          const clientList = await base44.entities.Client.filter({ agent_id: agents[0].id });
          setClients(clientList);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadAgent();
  }, [navigate]);

  const handleInvite = async () => {
    if (!inviteEmail || !inviteName || !invitePhone || !inviteCloseDate) {
      alert("Please fill all fields");
      return;
    }

    const inviteCode = Math.floor(1000 + Math.random() * 9000).toString();

    try {
      const newClient = await base44.entities.Client.create({
        agent_id: agent.id,
        user_email: inviteEmail,
        user_name: inviteName,
        phone: invitePhone,
        close_date: inviteCloseDate,
        invitation_code: inviteCode,
        status: "invited",
        invited_date: new Date().toISOString()
      });

      // Send invitation email
      await base44.integrations.Core.SendEmail({
        to: inviteEmail,
        subject: `Your EZ Move AI Invitation - Code: ${inviteCode}`,
        body: `Hi ${inviteName},\n\nYour real estate agent has invited you to use EZ Move AI to manage your home sale/purchase.\n\nYour invitation code is: ${inviteCode}\n\nVisit our app and enter this code to get started.\n\nBest regards,\nEZ Move AI Team`
      });

      setClients([...clients, newClient]);
      setInviteEmail("");
      setInviteName("");
      setInvitePhone("");
      setInviteCloseDate("");
      setShowInviteModal(false);
    } catch (err) {
      console.error(err);
      alert("Error sending invitation");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F3EF] flex items-center justify-center">
        <p className="text-[#6B7280]">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F3EF] p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold text-[#1A1A2E] mb-2">{agent?.company_name}</h1>
            <p className="text-[#6B7280]">Manage your clients and track revenue</p>
          </div>
          <button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#C85A17] to-[#F97316] text-white font-bold shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="w-5 h-5" />
            Invite Client
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#6B7280] text-sm font-semibold">Total Clients</p>
                <p className="text-3xl font-bold text-[#1A1A2E] mt-1">{clients.length}</p>
              </div>
              <Users className="w-10 h-10 text-[#C85A17]/20" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#6B7280] text-sm font-semibold">Revenue</p>
                <p className="text-3xl font-bold text-[#1A1A2E] mt-1">${clients.length * 40}</p>
              </div>
              <DollarSign className="w-10 h-10 text-green-500/20" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#6B7280] text-sm font-semibold">Active</p>
                <p className="text-3xl font-bold text-[#1A1A2E] mt-1">{clients.filter(c => c.status === "active").length}</p>
              </div>
              <Mail className="w-10 h-10 text-blue-500/20" />
            </div>
          </div>
        </div>

        {/* Clients Table */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
          <div className="p-6 border-b border-[#E5E7EB]">
            <h2 className="text-xl font-bold text-[#1A1A2E]">Your Clients</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-[#6B7280]">Name</th>
                  <th className="px-6 py-3 text-left font-semibold text-[#6B7280]">Email</th>
                  <th className="px-6 py-3 text-left font-semibold text-[#6B7280]">Status</th>
                  <th className="px-6 py-3 text-left font-semibold text-[#6B7280]">Billing</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.id} className="border-b border-[#E5E7EB] hover:bg-[#F9FAFB]">
                    <td className="px-6 py-4 font-medium text-[#1A1A2E]">{client.user_name}</td>
                    <td className="px-6 py-4 text-[#6B7280]">{client.user_email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold
                        ${client.status === "active" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                        {client.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold
                        ${client.billing_status === "charged" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
                        ${client.billing_status === "charged" ? "40 ✓" : "40 pending"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {clients.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-[#6B7280] mb-4">No clients yet</p>
              <button
                onClick={() => setShowInviteModal(true)}
                className="text-[#C85A17] font-semibold hover:underline"
              >
                Invite your first client
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-[#1A1A2E] mb-4">Invite a Client</h2>

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-xs font-semibold text-[#6B7280] mb-2 block">Full Name</label>
                <input
                  type="text"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-4 py-2 rounded-lg border border-[#E5E7EB] focus:outline-none focus:border-[#C85A17]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#6B7280] mb-2 block">Email</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="w-full px-4 py-2 rounded-lg border border-[#E5E7EB] focus:outline-none focus:border-[#C85A17]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#6B7280] mb-2 block">Phone</label>
                <input
                  type="tel"
                  value={invitePhone}
                  onChange={(e) => setInvitePhone(e.target.value)}
                  placeholder="555-123-4567"
                  className="w-full px-4 py-2 rounded-lg border border-[#E5E7EB] focus:outline-none focus:border-[#C85A17]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#6B7280] mb-2 block">Estimated Close Date</label>
                <input
                  type="date"
                  value={inviteCloseDate}
                  onChange={(e) => setInviteCloseDate(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-[#E5E7EB] focus:outline-none focus:border-[#C85A17]"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowInviteModal(false)}
                className="flex-1 px-4 py-2 rounded-lg border border-[#E5E7EB] text-[#1A1A2E] font-semibold hover:bg-[#F9FAFB]"
              >
                Cancel
              </button>
              <button
                onClick={handleInvite}
                className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-[#C85A17] to-[#F97316] text-white font-bold"
              >
                Send Invite
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}