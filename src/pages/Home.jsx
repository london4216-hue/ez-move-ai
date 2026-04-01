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



export default function Home() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [openPortal, setOpenPortal] = useState(null);
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

      {/* Customer Section - always visible */}
      <div className="max-w-3xl mx-auto w-full px-5 pb-6">
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
      </div>

      {/* Portal Dropdowns */}
      <div className="max-w-3xl mx-auto w-full px-5 pb-12 space-y-3">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center mb-4">Portal Access</p>

        {/* Agent Portal */}
        <div className="bg-white border border-orange-100 rounded-2xl overflow-hidden shadow-sm">
          <button onClick={() => setOpenPortal(openPortal === 'agent' ? null : 'agent')}
            className="w-full px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-orange-500" />
              </div>
              <div className="text-left">
                <p className="font-bold text-slate-800 text-sm">Agent Portal</p>
                <p className="text-slate-400 text-xs">Individual agent sign-in & sign-up</p>
              </div>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openPortal === 'agent' ? 'rotate-180' : ''}`} />
          </button>
          {openPortal === 'agent' && (
            <div className="px-5 pb-5 border-t border-orange-50">
              <ul className="space-y-2 my-4">
                {["Invite clients with a unique link", "Track close dates & move progress", "White-labeled client experience", "Volume discounts — 10% off every 3 clients"].map(item => (
                  <li key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-orange-400 flex-shrink-0" />
                    <span className="text-sm text-slate-600">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 mb-4">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Pricing Calculator</p>
                <div className="flex items-center gap-3 mb-3">
                  <label className="text-sm text-slate-600 font-semibold whitespace-nowrap">Clients:</label>
                  <input type="range" min={1} max={20} value={clientCount}
                    onChange={e => setClientCount(Number(e.target.value))}
                    className="flex-1 accent-orange-500" />
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
              </div>
              <button onClick={() => base44.auth.redirectToLogin("/AgentOnboarding")}
                className="w-full py-3.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-200">
                Agent Sign In / Sign Up <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Broker Portal */}
        <div className="bg-white border border-purple-100 rounded-2xl overflow-hidden shadow-sm">
          <button onClick={() => setOpenPortal(openPortal === 'broker' ? null : 'broker')}
            className="w-full px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-purple-500" />
              </div>
              <div className="text-left">
                <p className="font-bold text-slate-800 text-sm">Broker Portal</p>
                <p className="text-slate-400 text-xs">Broker firm sign-in & sign-up</p>
              </div>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openPortal === 'broker' ? 'rotate-180' : ''}`} />
          </button>
          {openPortal === 'broker' && (
            <div className="px-5 pb-5 border-t border-purple-50">
              <ul className="space-y-2 my-4">
                {["All agents under one account", "Centralized client management", "$40/client — 10% off every 3 clients", "Volume pricing for high-volume firms"].map(item => (
                  <li key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0" />
                    <span className="text-sm text-slate-600">{item}</span>
                  </li>
                ))}
              </ul>
              <button onClick={() => base44.auth.redirectToLogin("/BrokerDashboard")}
                className="w-full py-3.5 rounded-2xl bg-purple-500 hover:bg-purple-600 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-200">
                Broker Sign In / Sign Up <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* EZ Move Admin */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <button onClick={() => setOpenPortal(openPortal === 'admin' ? null : 'admin')}
            className="w-full px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-slate-600" />
              </div>
              <div className="text-left">
                <p className="font-bold text-slate-800 text-sm">EZ Move Admin</p>
                <p className="text-slate-400 text-xs">Complete control — all clients & revenue</p>
              </div>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openPortal === 'admin' ? 'rotate-180' : ''}`} />
          </button>
          {openPortal === 'admin' && (
            <div className="px-5 pb-5 border-t border-slate-100">
              <ul className="space-y-2 my-4">
                {["View all agents & broker firms", "Monitor client activity & billing", "Manage licenses and accounts", "Platform-wide analytics"].map(item => (
                  <li key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span className="text-sm text-slate-600">{item}</span>
                  </li>
                ))}
              </ul>
              <button onClick={() => base44.auth.redirectToLogin("/SuperAdmin")}
                className="w-full py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all">
                <Shield className="w-4 h-4" /> Admin Sign In
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 text-center bg-slate-900 mt-auto">
        <p className="text-slate-500 text-xs">© 2026 EZ Move AI · All Rights Reserved</p>
      </footer>
    </div>
  );
}