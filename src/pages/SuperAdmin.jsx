import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { getPortalRole } from "@/lib/usePortalRole";
import { PUBLIC_DEMO_MODE } from "@/lib/featureFlags";

import {
  Users, DollarSign, Building2, User, LogOut, Trash2, TrendingUp,
  Plus, CheckCircle, Shield, Key, X, ChevronRight, UserCheck, Briefcase,
  LayoutDashboard, Settings, FileText, ClipboardList, Activity, Menu
} from "lucide-react";

const EMPTY_FORM = { company_name: "", contact_name: "", phone: "", license_number: "", agents_count: 2 };

const NAV_ITEMS = [
  { id: "dashboard",  label: "Dashboard",        Icon: LayoutDashboard },
  { id: "brokers",    label: "Brokers",           Icon: Briefcase },
  { id: "agents",     label: "Agents",            Icon: UserCheck },
  { id: "reporting",  label: "Reporting",         Icon: TrendingUp },
  { id: "settings",   label: "System Settings",   Icon: Settings },
  { id: "audit",      label: "Audit Log",         Icon: ClipboardList },
];

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({ active, onSelect, onLogout, collapsed, onToggle }) {
  return (
    <aside className={`flex-shrink-0 bg-slate-900 flex flex-col transition-all duration-200 ${collapsed ? "w-14" : "w-56"}`}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-3 py-5 border-b border-white/10">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center flex-shrink-0">
          <span className="text-white font-black text-xs">EZ</span>
        </div>
        {!collapsed && (
          <div>
            <p className="font-black text-white text-sm leading-tight">EZ Move AI</p>
            <div className="flex items-center gap-1">
              <Shield className="w-2.5 h-2.5 text-orange-400" />
              <p className="text-orange-400 text-[9px] font-bold uppercase tracking-widest">Super Admin</p>
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 space-y-0.5 px-2">
        {NAV_ITEMS.map(({ id, label, Icon }) => (
          <button key={id} onClick={() => onSelect(id)}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all text-left min-h-[44px] ${
              active === id
                ? "bg-orange-500 text-white shadow-md shadow-orange-900/40"
                : "text-slate-400 hover:text-white hover:bg-white/10"
            }`}>
            <Icon className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span>{label}</span>}
          </button>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-2 py-4 border-t border-white/10 space-y-1">
        <button onClick={onToggle}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-slate-500 hover:text-white hover:bg-white/10 text-sm font-semibold transition-all min-h-[44px]">
          <Menu className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>Collapse</span>}
        </button>
        <button onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-400/10 text-sm font-semibold transition-all min-h-[44px]">
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}

// ─── Metric Card ──────────────────────────────────────────────────────────────
function MetricCard({ label, value, Icon, color, bg, border }) {
  return (
    <div className={`bg-white rounded-xl p-5 border ${border} shadow-sm`}>
      <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <p className="text-2xl font-black text-slate-800">{value}</p>
      <p className="text-slate-500 text-xs font-semibold mt-1">{label}</p>
    </div>
  );
}

// ─── Dashboard Screen ─────────────────────────────────────────────────────────
function DashboardScreen({ agents, clients, onNav }) {
  const brokers = agents.filter(a => a.account_type === "broker_firm");
  const agentOnly = agents.filter(a => a.account_type !== "broker_firm");
  const activeClients = clients.filter(c => c.status === "active" || c.status === "registered");
  const activeMovesCount = clients.filter(c => c.status === "active").length;
  const totalRevenue = clients.filter(c => c.billing_status === "charged").length * 40;

  const recentActivity = [
    ...clients.slice(0, 3).map(c => ({ text: `New buyer/seller: ${c.user_name || c.user_email || "Unknown"}`, type: "client", time: c.created_date })),
    ...agents.slice(0, 2).map(a => ({ text: `Account enrolled: ${a.company_name}`, type: "account", time: a.created_date })),
  ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5);

  const systemStatus = [
    { label: "Database",        status: "green" },
    { label: "Email Service",   status: "green" },
    { label: "SMS (Twilio)",    status: "green" },
    { label: "Billing",         status: "yellow" },
  ];

  return (
    <div className="space-y-6">
      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Active Brokers"        value={brokers.length}        Icon={Briefcase}       color="text-purple-600" bg="bg-purple-50"  border="border-purple-100" />
        <MetricCard label="Active Agents"         value={agentOnly.length}      Icon={UserCheck}       color="text-blue-600"   bg="bg-blue-50"    border="border-blue-100" />
        <MetricCard label="Active Buyers/Sellers" value={activeClients.length}  Icon={Users}           color="text-emerald-600" bg="bg-emerald-50" border="border-emerald-100" />
        <MetricCard label="Active Moves"          value={activeMovesCount}      Icon={Activity}        color="text-orange-500"  bg="bg-orange-50"  border="border-orange-100" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="font-bold text-slate-800 text-sm mb-4">Quick Actions</h3>
          <div className="space-y-2">
            {[
              { label: "Add New Broker",    icon: Plus,       action: () => onNav("brokers"),   color: "bg-purple-500 hover:bg-purple-600 text-white" },
              { label: "View All Brokers",  icon: Briefcase,  action: () => onNav("brokers"),   color: "bg-white hover:bg-purple-50 text-purple-700 border border-purple-200" },
              { label: "View All Agents",   icon: UserCheck,  action: () => onNav("agents"),    color: "bg-white hover:bg-blue-50 text-blue-700 border border-blue-200" },
              { label: "Open Reporting",    icon: TrendingUp, action: () => onNav("reporting"), color: "bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200" },
            ].map(({ label, icon: Icon, action, color }) => (
              <button key={label} onClick={action}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${color}`}>
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* System Health */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="font-bold text-slate-800 text-sm mb-4">System Health</h3>
          <div className="space-y-2.5">
            {systemStatus.map(s => (
              <div key={s.label} className="flex items-center justify-between">
                <span className="text-slate-600 text-sm">{s.label}</span>
                <div className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${s.status === "green" ? "bg-emerald-500" : s.status === "yellow" ? "bg-amber-400" : "bg-red-500"}`} />
                  <span className={`text-xs font-bold ${s.status === "green" ? "text-emerald-600" : s.status === "yellow" ? "text-amber-600" : "text-red-600"}`}>
                    {s.status === "green" ? "Operational" : s.status === "yellow" ? "Degraded" : "Down"}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-xs text-slate-400">Platform Revenue</p>
            <p className="text-2xl font-black text-emerald-600 mt-1">${totalRevenue.toLocaleString()}</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="font-bold text-slate-800 text-sm mb-4">Recent Activity</h3>
          {recentActivity.length === 0 ? (
            <p className="text-slate-400 text-sm">No recent activity</p>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${item.type === "client" ? "bg-orange-400" : "bg-blue-400"}`} />
                  <div>
                    <p className="text-slate-700 text-xs font-semibold leading-tight">{item.text}</p>
                    {item.time && (
                      <p className="text-slate-400 text-[10px] mt-0.5">{new Date(item.time).toLocaleDateString()}</p>
                    )}
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

// ─── Brokers / Agents list ────────────────────────────────────────────────────
function AccountsScreen({ agents, clients, filter, onAddModal, onRemove }) {
  const list = filter === "brokers"
    ? agents.filter(a => a.account_type === "broker_firm")
    : agents.filter(a => a.account_type !== "broker_firm");
  const typeLabel = filter === "brokers" ? "Broker Firm" : "Agent";

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="font-bold text-slate-800">{filter === "brokers" ? "Broker Firms" : "Individual Agents"}</h2>
          <p className="text-slate-400 text-xs">{list.length} enrolled</p>
        </div>
        <button onClick={() => onAddModal(filter === "brokers" ? "broker_firm" : "agent")}
          className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs px-3 py-2 rounded-xl transition-colors shadow-md shadow-orange-200">
          <Plus className="w-3.5 h-3.5" /> Add {typeLabel}
        </button>
      </div>
      {list.length === 0 ? (
        <div className="py-16 text-center">
          <Building2 className="w-10 h-10 mx-auto mb-3 text-slate-200" />
          <p className="font-semibold text-slate-400">No {typeLabel.toLowerCase()}s enrolled yet</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-50">
          {list.map(agent => {
            const agentClients = clients.filter(c => c.agent_id === agent.id);
            const agentRevenue = agentClients.filter(c => c.billing_status === "charged").length * 40;
            return (
              <div key={agent.id} className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50/50 transition-colors">
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 ${filter === "brokers" ? "bg-purple-50 border-purple-100" : "bg-blue-50 border-blue-100"}`}>
                  {filter === "brokers" ? <Briefcase className="w-5 h-5 text-purple-400" /> : <UserCheck className="w-5 h-5 text-blue-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800 text-sm">{agent.company_name}</p>
                  <p className="text-slate-400 text-xs truncate">
                    {agent.contact_name || agent.created_by}
                    {filter === "brokers" && agent.agents_count > 1 && <span className="ml-2 text-purple-400 font-semibold">· {agent.agents_count} agents</span>}
                  </p>
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
                  <button onClick={() => onRemove(agent)} className="w-8 h-8 rounded-xl bg-red-50 hover:bg-red-100 border border-red-100 flex items-center justify-center transition-colors">
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Reporting Screen ─────────────────────────────────────────────────────────
function ReportingScreen({ agents, clients }) {
  const totalRevenue = clients.filter(c => c.billing_status === "charged").length * 40;
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-orange-500" />
          <h2 className="font-bold text-slate-800">Revenue Breakdown</h2>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-center">
            <p className="text-2xl font-black text-emerald-600">${totalRevenue.toLocaleString()}</p>
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
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 className="font-bold text-slate-800 mb-4">Platform Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Agents", value: agents.filter(a => a.account_type !== "broker_firm").length },
            { label: "Total Brokers", value: agents.filter(a => a.account_type === "broker_firm").length },
            { label: "Total Clients", value: clients.length },
            { label: "Completed Moves", value: clients.filter(c => c.status === "completed").length },
          ].map(s => (
            <div key={s.label} className="bg-slate-50 rounded-xl p-4 text-center border border-slate-100">
              <p className="text-2xl font-black text-slate-800">{s.value}</p>
              <p className="text-slate-500 text-xs font-semibold mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Version Control Screen ─────────────────────────────────────────────────
function VersionControlScreen() {
  const [version, setVersion] = useState(null);
  const [settingId, setSettingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    base44.entities.AppSettings.filter({ key: "public_version" }).then(res => {
      if (res.length > 0) { setVersion(res[0].value); setSettingId(res[0].id); }
      else { setVersion("1"); }
    });
  }, []);

  const increment = async () => {
    setSaving(true);
    const next = String(parseInt(version || "1") + 1);
    if (settingId) {
      await base44.entities.AppSettings.update(settingId, { key: "public_version", value: next });
    } else {
      const rec = await base44.entities.AppSettings.create({ key: "public_version", value: next });
      setSettingId(rec.id);
    }
    setVersion(next);
    setSaving(false);
  };

  const demoUrl = `${window.location.origin}/?v=${version}`;

  const copyLink = () => {
    navigator.clipboard.writeText(demoUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-5 max-w-lg">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-1">
          <Key className="w-4 h-4 text-orange-500" />
          <h2 className="font-bold text-slate-800">Public Demo Link Control</h2>
        </div>
        <p className="text-slate-400 text-xs mb-6">Increment the version to instantly invalidate all old demo links. Only people with the latest link can access the hub.</p>

        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center mb-5">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Current Public Version</p>
          <p className="text-5xl font-black text-orange-500 my-2">{version ?? "\u2014"}</p>
          <p className="text-xs text-slate-400">All links with ?v={version} are active. All others are expired.</p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 bg-slate-100 rounded-xl px-4 py-3">
            <p className="text-xs font-mono text-slate-600 flex-1 truncate">{demoUrl}</p>
            <button onClick={copyLink}
              className={`flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                copied ? "bg-emerald-500 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-orange-50 hover:text-orange-500"
              }`}>
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>

          <button
            onClick={increment}
            disabled={saving || version === null}
            className="w-full py-3.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm disabled:opacity-40 transition-colors flex items-center justify-center gap-2"
          >
            {saving ? "Updating\u2026" : `\uD83D\uDD12 Invalidate Old Links \u2014 Publish v${parseInt(version || 1) + 1}`}
          </button>
          <p className="text-[10px] text-slate-400 text-center">\u26A0\uFE0F This cannot be undone. Anyone with v{version} links will see the expired page.</p>
        </div>
      </div>
    </div>
  );
}

// ─── Placeholder screens ──────────────────────────────────────────────────────
function PlaceholderScreen({ title, Icon }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-16 text-center">
      <Icon className="w-10 h-10 mx-auto mb-3 text-slate-200" />
      <p className="font-bold text-slate-400">{title}</p>
      <p className="text-slate-300 text-xs mt-1">Coming soon</p>
    </div>
  );
}

// ─── Add Account Modal ────────────────────────────────────────────────────────
function AddAccountModal({ mode, form, setForm, saving, onSave, onClose, onBack }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-blue-100">
        <div className="px-6 pt-5 pb-4 border-b border-slate-100 flex items-center justify-between">
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center">
            <X className="w-4 h-4 text-slate-500" />
          </button>
          <p className="font-bold text-slate-800 text-sm">
            {mode === "choose" ? "Add New Account" : mode === "agent" ? "Add Individual Agent" : "Add Broker Firm"}
          </p>
          <div className="w-8" />
        </div>
        <div className="px-6 py-5">
          {mode === "choose" && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 mb-4">What type of account are you adding?</p>
              <button onClick={() => onBack("agent")}
                className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-blue-100 hover:border-blue-300 hover:bg-blue-50/50 transition-all group text-left">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100">
                  <UserCheck className="w-6 h-6 text-blue-500" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-slate-800 text-sm">Individual Agent</p>
                  <p className="text-xs text-slate-400 mt-0.5">A single real estate agent managing their own clients</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-400" />
              </button>
              <button onClick={() => onBack("broker_firm")}
                className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-purple-100 hover:border-purple-300 hover:bg-purple-50/50 transition-all group text-left">
                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-purple-100">
                  <Briefcase className="w-6 h-6 text-purple-500" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-slate-800 text-sm">Broker Firm</p>
                  <p className="text-xs text-slate-400 mt-0.5">A brokerage with multiple agents under one account</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-purple-400" />
              </button>
            </div>
          )}
          {(mode === "agent" || mode === "broker_firm") && (
            <div className="space-y-3">
              <div className={`flex items-center gap-2 mb-4 p-3 rounded-xl ${mode === "agent" ? "bg-blue-50" : "bg-purple-50"}`}>
                {mode === "agent" ? <UserCheck className="w-4 h-4 text-blue-500" /> : <Briefcase className="w-4 h-4 text-purple-500" />}
                <span className={`text-xs font-bold ${mode === "agent" ? "text-blue-600" : "text-purple-600"}`}>
                  {mode === "agent" ? "Individual Agent Account" : "Broker Firm Account"}
                </span>
              </div>
              {[
                { label: mode === "agent" ? "Agent / Company Name *" : "Firm / Brokerage Name *", key: "company_name", placeholder: mode === "agent" ? "Jane Smith Realty" : "Premier Realty Group" },
                { label: "Contact Name", key: "contact_name", placeholder: "Full name" },
                { label: "Phone", key: "phone", placeholder: "(555) 000-0000" },
                { label: mode === "agent" ? "License Number" : "Broker License Number", key: "license_number", placeholder: mode === "agent" ? "RE-123456" : "BRK-789012" },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-1">{f.label}</label>
                  <input type="text" value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className={`w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 bg-white ${mode === "agent" ? "focus:border-blue-400 focus:ring-blue-400/10" : "focus:border-purple-400 focus:ring-purple-400/10"}`} />
                </div>
              ))}
              {mode === "broker_firm" && (
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-1">Number of Agents in Firm</label>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setForm(p => ({ ...p, agents_count: Math.max(1, (parseInt(p.agents_count) || 1) - 1) }))}
                      className="w-10 h-10 rounded-xl border border-slate-200 text-slate-600 font-bold text-lg flex items-center justify-center hover:bg-slate-50">−</button>
                    <input type="number" min={1} value={form.agents_count}
                      onChange={e => setForm(p => ({ ...p, agents_count: parseInt(e.target.value) || 1 }))}
                      className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-sm text-center font-bold focus:outline-none focus:border-purple-400" />
                    <button onClick={() => setForm(p => ({ ...p, agents_count: (parseInt(p.agents_count) || 1) + 1 }))}
                      className="w-10 h-10 rounded-xl border border-slate-200 text-slate-600 font-bold text-lg flex items-center justify-center hover:bg-slate-50">+</button>
                  </div>
                </div>
              )}
              <div className="flex gap-2 mt-4">
                <button onClick={() => onBack("choose")} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-500 font-bold text-sm hover:bg-slate-50">Back</button>
                <button onClick={onSave} disabled={saving || !form.company_name.trim()}
                  className={`flex-1 py-3 rounded-xl text-white font-bold text-sm disabled:opacity-40 transition-colors ${mode === "agent" ? "bg-blue-500 hover:bg-blue-600" : "bg-purple-500 hover:bg-purple-600"}`}>
                  {saving ? "Adding..." : mode === "agent" ? "Add Agent" : "Add Firm"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function SuperAdmin() {
  const [agents, setAgents] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [addModal, setAddModal] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      const me = await base44.auth.me().catch(() => null);
      if (!PUBLIC_DEMO_MODE && getPortalRole(me) !== "super_admin") { navigate("/"); return; }
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

  const removeAgent = async (agent) => {
    if (!confirm(`Remove ${agent.company_name}?`)) return;
    await base44.entities.Agent.delete(agent.id);
    setAgents(prev => prev.filter(a => a.id !== agent.id));
  };

  const handleAddAccount = async () => {
    if (!form.company_name.trim()) return;
    setSaving(true);
    const type = addModal;
    const newAgent = await base44.entities.Agent.create({
      company_name: form.company_name,
      account_type: type,
      contact_name: form.contact_name,
      phone: form.phone,
      license_number: form.license_number,
      agents_count: type === "broker_firm" ? parseInt(form.agents_count) || 1 : 1,
      subscription_status: "active",
    });
    setAgents(prev => [newAgent, ...prev]);
    setAddModal(null);
    setForm(EMPTY_FORM);
    setSaving(false);
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-9 h-9 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-sm font-medium">Loading admin portal…</p>
      </div>
    </div>
  );

  const pageTitle = NAV_ITEMS.find(n => n.id === activeNav)?.label || "Dashboard";

  return (
    <div className="min-h-screen bg-slate-100 flex overflow-hidden">
      <Sidebar
        active={activeNav}
        onSelect={setActiveNav}
        onLogout={() => base44.auth.logout("/")}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(c => !c)}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-slate-200 shadow-sm px-4 sm:px-6 py-4 flex items-center justify-between flex-shrink-0 gap-4">
          <div>
            <h1 className="font-black text-slate-800 text-lg">{pageTitle}</h1>
            <p className="text-slate-400 text-xs">EZ Move AI · Super Admin Portal</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {/* Portal switcher — navigate to any portal as super admin */}
            <a href="/AgentDashboard"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-100 text-blue-700 text-xs font-bold transition-colors">
              <UserCheck className="w-3.5 h-3.5" /> Agent Portal
            </a>
            <a href="/BrokerDashboard"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 border border-purple-100 text-purple-700 text-xs font-bold transition-colors">
              <Briefcase className="w-3.5 h-3.5" /> Broker Portal
            </a>
            <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-emerald-700 text-xs font-bold">System Online</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          {activeNav === "dashboard" && (
            <DashboardScreen agents={agents} clients={clients} onNav={setActiveNav} />
          )}
          {activeNav === "brokers" && (
            <AccountsScreen agents={agents} clients={clients} filter="brokers" onAddModal={setAddModal} onRemove={removeAgent} />
          )}
          {activeNav === "agents" && (
            <AccountsScreen agents={agents} clients={clients} filter="agents" onAddModal={setAddModal} onRemove={removeAgent} />
          )}
          {activeNav === "reporting" && (
            <ReportingScreen agents={agents} clients={clients} />
          )}
          {activeNav === "settings" && (
            <VersionControlScreen />
          )}
          {activeNav === "audit" && (
            <PlaceholderScreen title="Audit Log" Icon={ClipboardList} />
          )}
        </main>
      </div>

      {/* Modal */}
      {addModal && (
        <AddAccountModal
          mode={addModal}
          form={form}
          setForm={setForm}
          saving={saving}
          onSave={handleAddAccount}
          onClose={() => { setAddModal(null); setForm(EMPTY_FORM); }}
          onBack={setAddModal}
        />
      )}
    </div>
  );
}