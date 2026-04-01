import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Shield, Building2, Home as HomeIcon, ArrowRight, Zap, CheckCircle2,
  Star, Users, CalendarDays, Package, Sparkles, Briefcase, UserCheck, ChevronRight, ChevronDown
} from "lucide-react";

const FEATURES = [
  { icon: CalendarDays, label: "Week-by-week move plan", color: "text-orange-500", bg: "bg-orange-50" },
  { icon: Sparkles, label: "AI local service finder", color: "text-purple-500", bg: "bg-purple-50" },
  { icon: Package, label: "Inventory & packing tools", color: "text-blue-500", bg: "bg-blue-50" },
  { icon: Users, label: "Agent & broker portal", color: "text-emerald-600", bg: "bg-emerald-50" },
];

// $40/client, 10% discount per every 3 clients
function getPricing(count) {
  const tiers = Math.floor(count / 3);
  const discount = Math.min(tiers * 0.1, 0.5); // cap at 50%
  const pricePerClient = 40 * (1 - discount);
  return { pricePerClient: Math.round(pricePerClient * 100) / 100, discount, total: Math.round(pricePerClient * count * 100) / 100 };
}

const PRICING_EXAMPLES = [
  { count: 1 },
  { count: 3 },
  { count: 6 },
  { count: 9 },
  { count: 12 },
];

const TABS = [
  { id: "clients", label: "Buyers & Sellers" },
  { id: "agents", label: "Individual Agents" },
  { id: "brokers", label: "Broker Firms" },
  { id: "admin", label: "Admin" },
];

export default function Home() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [activeTab, setActiveTab] = useState("clients");
  const [clientCount, setClientCount] = useState(3);

  useEffect(() => {
    base44.auth.me()
      .then(user => {
        if (user?.role === "super_admin") navigate("/SuperAdmin");
        else if (user?.role === "admin") navigate(createPageUrl("AgentDashboard"));
        else if (user?.registration_date) navigate(createPageUrl("Dashboard"));
        else setChecking(false);
      })
      .catch(() => setChecking(false));
  }, []);

  if (checking) return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const pricing = getPricing(clientCount);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30 flex flex-col">

      {/* Nav */}
      <nav className="px-6 py-4 flex items-center justify-between max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-200">
            <span className="text-white font-black text-sm">EZ</span>
          </div>
          <div>
            <p className="font-black text-slate-800 text-lg leading-tight">EZ Move <span className="text-orange-500">AI</span></p>
            <p className="text-slate-400 text-[10px] font-semibold hidden sm:block">Your Complete Moving Platform</p>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center text-center px-5 pt-8 pb-6 max-w-4xl mx-auto w-full">
        <div className="inline-flex items-center gap-2 bg-orange-100 border border-orange-200 rounded-full px-4 py-1.5 mb-5">
          <Zap className="w-3.5 h-3.5 text-orange-500" />
          <span className="text-orange-600 text-xs font-bold uppercase tracking-wider">AI-Powered Moving Assistant</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-slate-800 leading-tight mb-4">
          Moving Made <span className="text-orange-500">Simple.</span><br />
          <span className="text-slate-400 text-3xl md:text-4xl font-bold">Powered by AI.</span>
        </h1>
        <p className="text-slate-500 text-base max-w-xl leading-relaxed mb-6">
          EZ Move AI gives buyers and sellers a personalized, week-by-week moving plan —
          with AI tools to find local services, manage inventory, and stay on track for closing day.
        </p>
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {FEATURES.map(f => (
            <div key={f.label} className={`flex items-center gap-2 ${f.bg} px-3 py-2 rounded-xl`}>
              <f.icon className={`w-4 h-4 ${f.color}`} />
              <span className="text-slate-700 text-xs font-semibold">{f.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Tab Bar */}
      <div className="max-w-3xl mx-auto w-full px-5 mb-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-1 flex gap-1 shadow-sm">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? tab.id === "admin"
                    ? "bg-slate-800 text-white shadow-sm"
                    : "bg-orange-500 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab.id === "admin" && <Shield className="w-3 h-3 inline mr-1" />}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-3xl mx-auto w-full px-5 pb-12">

        {/* Buyers / Sellers */}
        {activeTab === "clients" && (
          <div className="bg-white rounded-3xl border border-blue-100 shadow-xl shadow-blue-50 p-7">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                <HomeIcon className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="font-black text-slate-800 text-lg">Buyer or Seller?</p>
                <p className="text-slate-400 text-sm">Log in to access your personalized moving plan</p>
              </div>
              <span className="ml-auto px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100 whitespace-nowrap">Invite Required</span>
            </div>
            <ul className="space-y-2.5 mb-6">
              {["Personalized week-by-week checklist", "AI local service finder", "Appointment & inventory tools", "Track your move from contract to keys"].map(item => (
                <li key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span className="text-sm text-slate-600">{item}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => base44.auth.redirectToLogin("/Register")}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold text-sm flex items-center justify-center gap-2 hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-[0.98]"
            >
              Log In / Get Started <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Individual Agents */}
        {activeTab === "agents" && (
          <div className="bg-white rounded-3xl border border-orange-100 shadow-xl p-7">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                <UserCheck className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <p className="font-black text-slate-800 text-lg">Individual Agent</p>
                <p className="text-slate-400 text-sm">Buy licenses per client — no monthly commitment</p>
              </div>
            </div>
            <ul className="space-y-2 mb-6">
              {["Invite clients with a unique link", "Track close dates & move progress", "White-labeled client experience", "Volume discounts — 10% off every 3 clients"].map(item => (
                <li key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-orange-400 flex-shrink-0" />
                  <span className="text-sm text-slate-600">{item}</span>
                </li>
              ))}
            </ul>

            {/* Pricing Calculator */}
            <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 mb-5">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Pricing Calculator</p>
              <div className="flex items-center gap-3 mb-3">
                <label className="text-sm text-slate-600 font-semibold whitespace-nowrap">Clients:</label>
                <input
                  type="range" min={1} max={20} value={clientCount}
                  onChange={e => setClientCount(Number(e.target.value))}
                  className="flex-1 accent-orange-500"
                />
                <span className="text-orange-600 font-black text-lg w-8 text-right">{clientCount}</span>
              </div>
              <div className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-orange-100">
                <div>
                  <p className="text-sm font-bold text-slate-700">${pricing.pricePerClient.toFixed(2)} / client</p>
                  {pricing.discount > 0 && (
                    <p className="text-xs text-emerald-600 font-semibold">🎉 {Math.round(pricing.discount * 100)}% volume discount applied</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-orange-500">${pricing.total.toFixed(2)}</p>
                  <p className="text-[10px] text-slate-400">total for {clientCount} {clientCount === 1 ? "client" : "clients"}</p>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {PRICING_EXAMPLES.map(ex => {
                  const p = getPricing(ex.count);
                  return (
                    <button key={ex.count} onClick={() => setClientCount(ex.count)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${clientCount === ex.count ? "bg-orange-500 text-white border-orange-500" : "bg-white border-slate-200 text-slate-500 hover:border-orange-300"}`}>
                      {ex.count} = ${p.total}
                      {p.discount > 0 && <span className="ml-1 text-emerald-500">-{Math.round(p.discount*100)}%</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => base44.auth.redirectToLogin("/AgentOnboarding")}
                className="w-full py-3.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-200"
              >
                Agent Login <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => base44.auth.redirectToLogin("/AgentOnboarding")}
                className="w-full py-2.5 rounded-2xl border border-orange-200 text-orange-500 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-orange-50 transition-all"
              >
                New Agent? Register Here →
              </button>
            </div>
          </div>
        )}

        {/* Broker Firms */}
        {activeTab === "brokers" && (
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl border border-purple-400/20 p-7">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Briefcase className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="font-black text-white text-lg">Broker Firm</p>
                <p className="text-slate-400 text-sm">One account, all your agents & clients</p>
              </div>
            </div>
            <ul className="space-y-2 mb-5">
              {["All agents under one account", "Centralized client management", "$40/client — 10% off every 3 clients", "Dedicated broker dashboard", "Volume pricing for high-volume firms"].map(item => (
                <li key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                  <span className="text-sm text-slate-300">{item}</span>
                </li>
              ))}
            </ul>
            <div className="bg-purple-500/10 border border-purple-400/20 rounded-2xl px-4 py-3 mb-5">
              <p className="text-purple-300 text-xs font-semibold">🏢 Ideal for firms with 5+ agents</p>
              <p className="text-slate-400 text-xs mt-1">Same per-client pricing with volume discounts. 10% off every 3 clients purchased.</p>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => base44.auth.redirectToLogin("/BrokerDashboard")}
                className="w-full py-3.5 rounded-2xl bg-purple-500 hover:bg-purple-600 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-900/30"
              >
                Broker Login <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => base44.auth.redirectToLogin("/BrokerDashboard")}
                className="w-full py-2.5 rounded-2xl border border-purple-400/40 text-purple-300 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-white/5 transition-all"
              >
                New Broker Firm? Register Here →
              </button>
            </div>
          </div>
        )}

        {/* Admin */}
        {activeTab === "admin" && (
          <div className="bg-slate-900 rounded-3xl border border-slate-700 p-7">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 bg-slate-700 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-slate-300" />
              </div>
              <div>
                <p className="font-black text-white text-lg">System Admin</p>
                <p className="text-slate-400 text-sm">Manage all agents, clients, and platform settings</p>
              </div>
            </div>
            <ul className="space-y-2 mb-7">
              {["View all agents & broker firms", "Monitor client activity & billing", "Manage licenses and accounts", "Platform-wide analytics"].map(item => (
                <li key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span className="text-sm text-slate-300">{item}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => base44.auth.redirectToLogin("/SuperAdmin")}
              className="w-full py-3.5 rounded-2xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all border border-slate-600"
            >
              <Shield className="w-4 h-4" /> Admin Login
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="py-6 text-center bg-slate-900 mt-auto">
        <p className="text-slate-500 text-xs">© 2026 EZ Move AI · All Rights Reserved</p>
      </footer>
    </div>
  );
}