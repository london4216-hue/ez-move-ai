import { useState } from "react";
import { base44 } from "@/api/base44Client";
import {
  Shield, ArrowRight, Zap, CheckCircle2,
  Users, CalendarDays, Package, Sparkles,
  Briefcase, UserCheck, LogIn
} from "lucide-react";

function getPricing(count) {
  const tiers = Math.floor(count / 3);
  const discount = Math.min(tiers * 0.1, 0.5);
  const pricePerClient = 40 * (1 - discount);
  return { pricePerClient: Math.round(pricePerClient * 100) / 100, discount, total: Math.round(pricePerClient * count * 100) / 100 };
}

export default function Home() {
  const [checking, setChecking] = useState(false);
  const [clientCount, setClientCount] = useState(3);

  const pricing = getPricing(clientCount);

  return (
    <div className="min-h-screen bg-[#0c0f1a] flex flex-col text-white">

      {/* Top Nav */}
      <nav className="px-5 py-4 flex items-center justify-between max-w-5xl mx-auto w-full border-b border-white/[0.07]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-900/50">
            <span className="text-white font-black text-xs">EZ</span>
          </div>
          <div>
            <p className="font-black text-white text-base leading-tight">EZ Move <span className="text-orange-400">AI</span></p>
            <p className="text-slate-500 text-[9px] font-semibold hidden sm:block tracking-wider uppercase">Smart Moving Platform</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => base44.auth.redirectToLogin("/SuperAdmin")}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] text-xs font-bold text-slate-400 hover:text-white transition-all">
            <Shield className="w-3.5 h-3.5" /><span className="hidden sm:inline">Admin</span>
          </button>
          <button onClick={() => base44.auth.redirectToLogin("/AgentDashboard")}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] text-xs font-bold text-slate-400 hover:text-white transition-all">
            <UserCheck className="w-3.5 h-3.5" /><span className="hidden sm:inline">Agent</span>
          </button>
          <button onClick={() => base44.auth.redirectToLogin("/BrokerDashboard")}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 border border-purple-500/50 text-xs font-bold text-white transition-all">
            <Briefcase className="w-3.5 h-3.5" /><span className="hidden sm:inline">Broker</span>
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center text-center px-5 pt-12 pb-10 max-w-2xl mx-auto w-full">
        <div className="inline-flex items-center gap-2 bg-orange-500/[0.15] border border-orange-500/25 rounded-full px-4 py-1.5 mb-6">
          <Zap className="w-3 h-3 text-orange-400" />
          <span className="text-orange-300 text-[11px] font-bold uppercase tracking-widest">AI-Powered Moving Assistant</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black leading-[1.1] mb-4">
          Moving Made <span className="text-orange-400">Simple.</span>
          <br />
          <span className="text-slate-500 text-2xl md:text-3xl font-bold">Powered by AI.</span>
        </h1>
        <p className="text-slate-400 text-sm md:text-base max-w-xl leading-relaxed mb-8">
          The all-in-one moving platform for real estate professionals. Give every buyer and seller a personalized, week-by-week move plan — with AI tools, inventory tracking, and local service discovery.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {[
            { icon: CalendarDays, label: "Week-by-week plan",     color: "text-orange-400" },
            { icon: Sparkles,    label: "AI service finder",       color: "text-purple-400" },
            { icon: Package,     label: "Inventory & packing",     color: "text-blue-400" },
            { icon: Users,       label: "Agent & broker portals",  color: "text-emerald-400" },
          ].map(f => (
            <div key={f.label} className="flex items-center gap-1.5 bg-white/[0.05] border border-white/[0.08] px-3 py-2 rounded-xl">
              <f.icon className={`w-3.5 h-3.5 ${f.color}`} />
              <span className="text-slate-300 text-xs font-semibold">{f.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* SMS Consent Notice */
      <section className="max-w-3xl mx-auto w-full px-5 pb-5">
        <div className="bg-white/[0.04] border border-white/[0.07] rounded-2xl px-5 py-4 text-center">
          <p className="text-slate-500 text-[11px] leading-relaxed">
            By providing your phone number you agree to receive automated text messages from EZ Move AI. Msg &amp; data rates may apply. Reply STOP to opt out.{" "}
            <a href="/PrivacyPolicy" className="text-orange-400/80 underline hover:text-orange-300 font-semibold">Privacy &amp; SMS Policy.</a>
          </p>
        </div>
      </section>

      {/* Returning User Banner */}
      <section className="max-w-3xl mx-auto w-full px-5 pb-6">
        <div className="bg-gradient-to-r from-orange-500/[0.12] to-purple-600/[0.12] border border-white/[0.08] rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-orange-900/40">
            <LogIn className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <p className="text-white font-black text-lg mb-0.5">Already have an account?</p>
            <p className="text-slate-400 text-sm">Welcome back — jump straight to your dashboard.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0 w-full sm:w-auto">
            <button onClick={() => base44.auth.redirectToLogin("/Dashboard")}
              className="px-5 py-3 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-md shadow-orange-900/30">
              Client Login <ArrowRight className="w-4 h-4" />
            </button>
            <button onClick={() => base44.auth.redirectToLogin("/AgentDashboard")}
              className="px-5 py-3 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.12] text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]">
              Agent / Broker
            </button>
          </div>
        </div>
      </section>

      {/* Two Offer Cards */}
      <section className="max-w-3xl mx-auto w-full px-5 pb-16">
        <p className="text-center text-slate-600 text-[10px] font-bold uppercase tracking-widest mb-5">Choose Your Plan</p>
        <div className="grid md:grid-cols-2 gap-5">

          {/* For Agents */}
          <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-2xl p-6 flex flex-col shadow-xl shadow-orange-900/30 border border-orange-500/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <UserCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-black text-white text-lg leading-tight">For Agents</p>
                <p className="text-orange-200 text-xs">Individual real estate agents</p>
              </div>
            </div>
            <p className="text-orange-100/90 text-sm leading-relaxed mb-4">
              Give every client a branded, AI-powered moving assistant. Invite with one link — they get a personalized plan from day one.
            </p>
            <ul className="space-y-2 mb-5 flex-1">
              {[
                "Unique invite link per client",
                "Track close dates & move progress",
                "White-labeled client experience",
                "AI tools: movers, services & more",
                "10% volume discount every 3 clients",
              ].map(item => (
                <li key={item} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-orange-200 flex-shrink-0 mt-0.5" />
                  <span className="text-xs text-orange-50">{item}</span>
                </li>
              ))}
            </ul>
            <div className="bg-black/20 rounded-xl p-4 mb-4">
              <p className="text-xs font-bold text-orange-200 uppercase tracking-wide mb-3">Pricing Calculator</p>
              <div className="flex items-center gap-3 mb-3">
                <label className="text-xs text-orange-100 font-semibold whitespace-nowrap">Clients:</label>
                <input type="range" min={1} max={20} value={clientCount}
                  onChange={e => setClientCount(Number(e.target.value))}
                  className="flex-1 accent-white" />
                <span className="text-white font-black text-base w-6 text-right">{clientCount}</span>
              </div>
              <div className="flex items-center justify-between bg-white/10 rounded-xl px-3 py-2.5">
                <div>
                  <p className="text-sm font-bold text-white">${pricing.pricePerClient.toFixed(2)} / client</p>
                  {pricing.discount > 0 && (
                    <p className="text-[11px] text-orange-200 font-semibold">{Math.round(pricing.discount * 100)}% off applied</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-white">${pricing.total.toFixed(2)}</p>
                  <p className="text-[10px] text-orange-200">for {clientCount} {clientCount === 1 ? "client" : "clients"}</p>
                </div>
              </div>
            </div>
            <button onClick={() => base44.auth.redirectToLogin("/AgentOnboarding")}
              className="w-full py-3.5 rounded-xl bg-white text-orange-600 font-black text-sm flex items-center justify-center gap-2 hover:bg-orange-50 transition-all shadow-md active:scale-[0.98]">
              Sign Up as Agent <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-center text-orange-200 text-[11px] mt-2.5">Already registered? <button onClick={() => base44.auth.redirectToLogin("/AgentDashboard")} className="underline font-bold">Log in</button></p>
          </div>

          {/* For Brokers */}
          <div className="bg-gradient-to-br from-purple-700 to-purple-900 rounded-2xl p-6 flex flex-col shadow-xl shadow-purple-900/30 border border-purple-500/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-black text-white text-lg leading-tight">For Brokers</p>
                <p className="text-purple-200 text-xs">Broker firms & teams</p>
              </div>
            </div>
            <p className="text-purple-100/90 text-sm leading-relaxed mb-4">
              Manage your entire firm from one dashboard. Add clients, track payments, and give every agent the power of EZ Move AI — all under one roof.
            </p>
            <ul className="space-y-2 mb-5 flex-1">
              {[
                "One account for your whole firm",
                "Manage clients for all agents",
                "Centralized billing & payments",
                "Track all client move progress",
                "Same $40/client volume discounts",
                "White-labeled for your brand",
              ].map(item => (
                <li key={item} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-300 flex-shrink-0 mt-0.5" />
                  <span className="text-xs text-purple-50">{item}</span>
                </li>
              ))}
            </ul>
            <div className="bg-black/20 rounded-xl px-4 py-3 mb-4">
              <p className="text-purple-200 text-xs font-semibold">🏢 Ideal for broker firms with multiple agents</p>
              <p className="text-purple-300 text-xs mt-0.5">10% off every 3 clients — same as agent pricing.</p>
            </div>
            <button onClick={() => base44.auth.redirectToLogin("/BrokerDashboard")}
              className="w-full py-3.5 rounded-xl bg-white text-purple-700 font-black text-sm flex items-center justify-center gap-2 hover:bg-purple-50 transition-all shadow-md active:scale-[0.98]">
              Sign Up as Broker <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-center text-purple-200 text-[11px] mt-2.5">Already registered? <button onClick={() => base44.auth.redirectToLogin("/BrokerDashboard")} className="underline font-bold">Log in</button></p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center border-t border-white/[0.07] mt-auto">
        <p className="text-slate-600 text-[11px]">© 2026 EZ Move AI · All Rights Reserved</p>
      </footer>
    </div>
  );
}