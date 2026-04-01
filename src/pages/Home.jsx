import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
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
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
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
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const pricing = getPricing(clientCount);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col text-white">

      {/* Top Nav */}
      <nav className="px-6 py-4 flex items-center justify-between max-w-6xl mx-auto w-full border-b border-white/10">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-900/40">
            <span className="text-white font-black text-sm">EZ</span>
          </div>
          <div>
            <p className="font-black text-white text-lg leading-tight">EZ Move <span className="text-orange-400">AI</span></p>
            <p className="text-slate-400 text-[10px] font-semibold hidden sm:block">The Smart Moving Platform</p>
          </div>
        </div>

        {/* 3 Login Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => base44.auth.redirectToLogin("/SuperAdmin")}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-bold text-slate-300 hover:text-white transition-all"
          >
            <Shield className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Admin</span>
          </button>
          <button
            onClick={() => base44.auth.redirectToLogin("/AgentDashboard")}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-bold text-slate-300 hover:text-white transition-all"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Agent Login</span>
          </button>
          <button
            onClick={() => base44.auth.redirectToLogin("/BrokerDashboard")}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 border border-purple-500 text-xs font-bold text-white transition-all"
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Broker Login</span>
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center text-center px-5 pt-14 pb-10 max-w-3xl mx-auto w-full">
        <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500/30 rounded-full px-4 py-1.5 mb-6">
          <Zap className="w-3.5 h-3.5 text-orange-400" />
          <span className="text-orange-300 text-xs font-bold uppercase tracking-wider">AI-Powered Moving Assistant</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-black leading-tight mb-5">
          Moving Made <span className="text-orange-400">Simple.</span><br />
          <span className="text-slate-400 text-3xl md:text-4xl font-bold">Powered by AI.</span>
        </h1>
        <p className="text-slate-400 text-base md:text-lg max-w-2xl leading-relaxed mb-8">
          EZ Move AI is the all-in-one moving platform for real estate professionals and their clients.
          Give every buyer and seller a personalized, week-by-week moving plan with AI tools to find
          local services, manage inventory, and stay on track from contract to closing day.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {[
            { icon: CalendarDays, label: "Week-by-week move plan", color: "text-orange-400" },
            { icon: Sparkles, label: "AI local service finder", color: "text-purple-400" },
            { icon: Package, label: "Inventory & packing tools", color: "text-blue-400" },
            { icon: Users, label: "Agent & broker portals", color: "text-emerald-400" },
          ].map(f => (
            <div key={f.label} className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-2 rounded-xl">
              <f.icon className={`w-4 h-4 ${f.color}`} />
              <span className="text-slate-300 text-xs font-semibold">{f.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Two Offer Cards */}
      <section className="max-w-5xl mx-auto w-full px-5 pb-16">
        <p className="text-center text-slate-500 text-xs font-bold uppercase tracking-widest mb-6">Choose Your Plan</p>
        <div className="grid md:grid-cols-2 gap-6">

          {/* For Agents */}
          <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-3xl p-7 flex flex-col shadow-2xl shadow-orange-900/40 border border-orange-500/30">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                <UserCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-black text-white text-xl leading-tight">For Agents</p>
                <p className="text-orange-200 text-sm">Individual real estate agents</p>
              </div>
            </div>

            <p className="text-orange-100 text-sm leading-relaxed mb-5">
              Elevate your client experience with a branded, AI-powered moving assistant. Invite clients with a unique link — they get a personalized moving plan from day one.
            </p>

            <ul className="space-y-2.5 mb-6 flex-1">
              {[
                "Invite clients with one unique link",
                "Track close dates & move progress",
                "White-labeled client experience",
                "AI tools: movers, services & more",
                "Volume discounts — 10% off every 3 clients",
              ].map(item => (
                <li key={item} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-orange-200 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-orange-50">{item}</span>
                </li>
              ))}
            </ul>

            {/* Pricing Calculator */}
            <div className="bg-black/20 rounded-2xl p-4 mb-5">
              <p className="text-xs font-bold text-orange-200 uppercase tracking-wide mb-3">Pricing Calculator</p>
              <div className="flex items-center gap-3 mb-3">
                <label className="text-sm text-orange-100 font-semibold whitespace-nowrap">Clients:</label>
                <input type="range" min={1} max={20} value={clientCount}
                  onChange={e => setClientCount(Number(e.target.value))}
                  className="flex-1 accent-white" />
                <span className="text-white font-black text-lg w-8 text-right">{clientCount}</span>
              </div>
              <div className="flex items-center justify-between bg-white/10 rounded-xl px-4 py-3">
                <div>
                  <p className="text-sm font-bold text-white">${pricing.pricePerClient.toFixed(2)} / client</p>
                  {pricing.discount > 0 && (
                    <p className="text-xs text-orange-200 font-semibold">🎉 {Math.round(pricing.discount * 100)}% discount applied</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-white">${pricing.total.toFixed(2)}</p>
                  <p className="text-[10px] text-orange-200">for {clientCount} {clientCount === 1 ? "client" : "clients"}</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => base44.auth.redirectToLogin("/AgentOnboarding")}
              className="w-full py-4 rounded-2xl bg-white text-orange-600 font-black text-sm flex items-center justify-center gap-2 hover:bg-orange-50 transition-all shadow-lg active:scale-[0.98]"
            >
              Sign Up as Agent <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-center text-orange-200 text-xs mt-3">Already registered? <button onClick={() => base44.auth.redirectToLogin("/AgentDashboard")} className="underline font-bold">Log in here</button></p>
          </div>

          {/* For Brokers */}
          <div className="bg-gradient-to-br from-purple-700 to-purple-900 rounded-3xl p-7 flex flex-col shadow-2xl shadow-purple-900/40 border border-purple-500/30">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-black text-white text-xl leading-tight">For Brokers</p>
                <p className="text-purple-200 text-sm">Broker firms & teams</p>
              </div>
            </div>

            <p className="text-purple-100 text-sm leading-relaxed mb-5">
              Manage your entire firm from one dashboard. Add clients, track payments, and give every agent under your firm the power of EZ Move AI — all under one roof.
            </p>

            <ul className="space-y-2.5 mb-6 flex-1">
              {[
                "One account for your whole firm",
                "Add & manage clients for all agents",
                "Centralized billing & payments",
                "Track all client move progress",
                "Volume pricing — same $40/client discounts",
                "White-labeled for your brokerage brand",
              ].map(item => (
                <li key={item} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-300 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-purple-50">{item}</span>
                </li>
              ))}
            </ul>

            <div className="bg-black/20 rounded-2xl px-4 py-3 mb-5">
              <p className="text-purple-200 text-xs font-semibold">🏢 Ideal for broker firms with multiple agents</p>
              <p className="text-purple-300 text-xs mt-1">Same per-client pricing with 10% off every 3 clients purchased.</p>
            </div>

            <button
              onClick={() => base44.auth.redirectToLogin("/BrokerDashboard")}
              className="w-full py-4 rounded-2xl bg-white text-purple-700 font-black text-sm flex items-center justify-center gap-2 hover:bg-purple-50 transition-all shadow-lg active:scale-[0.98]"
            >
              Sign Up as Broker <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-center text-purple-200 text-xs mt-3">Already registered? <button onClick={() => base44.auth.redirectToLogin("/BrokerDashboard")} className="underline font-bold">Log in here</button></p>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 text-center border-t border-white/10 mt-auto">
        <p className="text-slate-500 text-xs">© 2026 EZ Move AI · All Rights Reserved</p>
      </footer>
    </div>
  );
}