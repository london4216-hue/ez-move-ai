import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Shield, Building2, Home as HomeIcon, ArrowRight, Zap, CheckCircle2,
  Star, Users, CalendarDays, Package, Sparkles, Briefcase, UserCheck, ChevronRight
} from "lucide-react";

const FEATURES = [
  { icon: CalendarDays, label: "Week-by-week move plan", color: "text-orange-500", bg: "bg-orange-50" },
  { icon: Sparkles, label: "AI local service finder", color: "text-purple-500", bg: "bg-purple-50" },
  { icon: Package, label: "Inventory & packing tools", color: "text-blue-500", bg: "bg-blue-50" },
  { icon: Users, label: "Agent & broker portal", color: "text-emerald-600", bg: "bg-emerald-50" },
];

const AGENT_PLANS = [
  { count: 1, price: 40, label: "Try It Out", desc: "Perfect for your first client", highlight: false },
  { count: 5, price: 180, label: "Starter", desc: "Save $20 — most popular", highlight: true },
  { count: 10, price: 340, label: "Pro", desc: "Save $60 for active agents", highlight: false },
];

export default function Home() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [showAgentPricing, setShowAgentPricing] = useState(false);

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
        <button
          onClick={() => base44.auth.redirectToLogin("/SuperAdmin")}
          className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 text-xs font-semibold transition-colors"
        >
          <Shield className="w-3.5 h-3.5" /> Admin Login
        </button>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center text-center px-5 pt-10 pb-6 max-w-4xl mx-auto w-full">
        <div className="inline-flex items-center gap-2 bg-orange-100 border border-orange-200 rounded-full px-4 py-1.5 mb-6">
          <Zap className="w-3.5 h-3.5 text-orange-500" />
          <span className="text-orange-600 text-xs font-bold uppercase tracking-wider">AI-Powered Moving Assistant</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-black text-slate-800 leading-tight mb-4">
          Moving Made <span className="text-orange-500">Simple.</span><br />
          <span className="text-slate-400 text-3xl md:text-4xl font-bold">Powered by AI.</span>
        </h1>

        <p className="text-slate-500 text-base md:text-lg max-w-xl leading-relaxed mb-8">
          EZ Move AI gives buyers and sellers a personalized, week-by-week moving plan — 
          with AI tools to find local services, manage inventory, and stay on track for closing day.
        </p>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {FEATURES.map(f => (
            <div key={f.label} className={`flex items-center gap-2 ${f.bg} px-3 py-2 rounded-xl`}>
              <f.icon className={`w-4 h-4 ${f.color}`} />
              <span className="text-slate-700 text-xs font-semibold">{f.label}</span>
            </div>
          ))}
        </div>

        {/* Primary CTA — Move EZ Users */}
        <div className="w-full max-w-md bg-white rounded-3xl border border-blue-100 shadow-xl shadow-blue-50 p-6 mb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center flex-shrink-0">
              <HomeIcon className="w-6 h-6 text-blue-500" />
            </div>
            <div className="text-left">
              <p className="font-black text-slate-800 text-base">Buyer or Seller?</p>
              <p className="text-slate-400 text-xs">Log in to access your moving plan</p>
            </div>
            <span className="ml-auto px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100">Invite Required</span>
          </div>
          <ul className="space-y-2 mb-5">
            {["Personalized weekly checklist", "AI local service finder", "Appointment & inventory tools"].map(item => (
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
      </section>

      {/* Agent & Broker Section */}
      <section className="bg-gradient-to-br from-slate-800 to-slate-900 px-5 py-14">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <span className="inline-block bg-orange-500/20 text-orange-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4">For Real Estate Professionals</span>
            <h2 className="text-3xl font-black text-white mb-3">
              Give Your Clients the <span className="text-orange-400">Best Move</span> Experience
            </h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto">
              Agents and broker firms use EZ Move AI to onboard clients with a personalized moving assistant — 
              strengthening relationships and standing out from the competition.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Individual Agent Card */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 bg-orange-500/20 rounded-2xl flex items-center justify-center">
                  <UserCheck className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <p className="font-black text-white text-base">Individual Agent</p>
                  <p className="text-slate-400 text-xs">Buy licenses per client</p>
                </div>
              </div>

              <ul className="space-y-2 mb-6">
                {["Invite clients with a unique code", "Track close dates & move progress", "White-labeled client experience", "No monthly commitment"].map(item => (
                  <li key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
                    <span className="text-sm text-slate-300">{item}</span>
                  </li>
                ))}
              </ul>

              {/* Pricing toggle */}
              <button
                onClick={() => setShowAgentPricing(!showAgentPricing)}
                className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center justify-between mb-3 transition-colors"
              >
                <span>View License Pricing</span>
                <ChevronRight className={`w-4 h-4 transition-transform ${showAgentPricing ? "rotate-90" : ""}`} />
              </button>

              {showAgentPricing && (
                <div className="space-y-2 mb-4">
                  {AGENT_PLANS.map(plan => (
                    <div key={plan.count} className={`flex items-center justify-between px-4 py-3 rounded-xl border ${plan.highlight ? "border-orange-400/50 bg-orange-500/10" : "border-white/10 bg-white/5"}`}>
                      <div>
                        <span className="text-white text-sm font-bold">{plan.count} {plan.count === 1 ? "Client" : "Clients"}</span>
                        <span className="ml-2 text-slate-400 text-xs">{plan.desc}</span>
                      </div>
                      <span className={`font-black text-sm ${plan.highlight ? "text-orange-400" : "text-white"}`}>${plan.price}</span>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => base44.auth.redirectToLogin("/AgentOnboarding")}
                className="w-full py-3.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-orange-900/30"
              >
                Agent Login / Sign Up <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Broker Firm Card */}
            <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 border border-purple-400/20 rounded-3xl p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <p className="font-black text-white text-base">Broker Firm</p>
                  <p className="text-slate-400 text-xs">One account, many agents</p>
                </div>
              </div>

              <ul className="space-y-2 mb-6">
                {["All agents under one account", "Centralized client management", "Volume license discounts", "Dedicated broker dashboard", "Enterprise billing options"].map(item => (
                  <li key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                    <span className="text-sm text-slate-300">{item}</span>
                  </li>
                ))}
              </ul>

              <div className="bg-purple-500/10 border border-purple-400/20 rounded-2xl px-4 py-3 mb-4">
                <p className="text-purple-300 text-xs font-semibold">🏢 Ideal for firms with 5+ agents</p>
                <p className="text-slate-400 text-xs mt-1">Custom pricing available for large brokerages. Contact us to open your firm account.</p>
              </div>

              <button
                onClick={() => base44.auth.redirectToLogin("/AgentOnboarding")}
                className="w-full py-3.5 rounded-2xl bg-purple-500 hover:bg-purple-600 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-purple-900/30"
              >
                Open Broker Account <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 text-center bg-slate-900">
        <p className="text-slate-500 text-xs">© 2026 EZ Move AI · All Rights Reserved</p>
      </footer>
    </div>
  );
}