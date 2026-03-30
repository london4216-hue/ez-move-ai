import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowRight, MapPin, Calendar, TrendingUp, Shield, Zap, Building2, User } from "lucide-react";

export default function Home() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    base44.auth.me()
      .then(user => {
        if (user?.role === "super_admin") navigate("/SuperAdmin");
        else if (user?.role === "admin") navigate(createPageUrl("AgentDashboard"));
        else if (user?.registration_date) navigate(createPageUrl("Dashboard"));
        else navigate(createPageUrl("Register"));
      })
      .catch(() => setChecking(false));
  }, []);

  if (checking) return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      {/* Nav */}
      <nav className="px-6 py-5 flex items-center justify-between max-w-5xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-900/50">
            <span className="text-white font-black text-sm">EZ</span>
          </div>
          <span className="font-bold text-lg">EZ Move <span className="text-orange-500">AI</span></span>
        </div>
        <button
          onClick={() => base44.auth.redirectToLogin("/")}
          className="text-slate-400 hover:text-white text-sm font-semibold transition-colors px-4 py-2 rounded-xl border border-slate-700 hover:border-slate-500"
        >
          Sign In
        </button>
      </nav>

      {/* Hero */}
      <div className="max-w-5xl mx-auto px-6 pt-16 pb-24 text-center">
        <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-2 mb-8">
          <Zap className="w-3.5 h-3.5 text-orange-400" />
          <span className="text-orange-400 text-xs font-bold uppercase tracking-wider">AI-Powered Moving Assistant</span>
        </div>

        <h1 className="text-5xl md:text-6xl font-black leading-tight mb-6">
          The smartest way to<br />
          <span className="text-orange-500">guide your clients</span><br />
          through every move
        </h1>

        <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-12 leading-relaxed">
          EZ Move AI gives real estate agents and brokerages a powerful,
          AI-driven platform to manage every step of their clients' moving journey —
          from listing to keys in hand.
        </p>

        {/* Enrollment Cards */}
        <div className="flex flex-col sm:flex-row items-stretch justify-center gap-5 mb-16 max-w-2xl mx-auto">
          <button
            onClick={() => base44.auth.redirectToLogin("/AgentOnboarding")}
            className="flex-1 bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl p-6 text-left shadow-2xl shadow-orange-900/40 hover:shadow-orange-900/60 transition-all group border border-orange-400/20"
          >
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
              <User className="w-6 h-6 text-white" />
            </div>
            <p className="text-xl font-black text-white mb-1">Enroll as Agent</p>
            <p className="text-orange-100 text-sm mb-4">Individual agents managing buyers & sellers</p>
            <div className="flex items-center justify-between">
              <span className="text-white/80 text-xs font-bold">$40 per client</span>
              <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          <button
            onClick={() => base44.auth.redirectToLogin("/AgentOnboarding?type=broker")}
            className="flex-1 bg-slate-800 border border-slate-600 rounded-3xl p-6 text-left hover:bg-slate-700 hover:border-slate-500 transition-all group"
          >
            <div className="w-12 h-12 bg-slate-700 rounded-2xl flex items-center justify-center mb-4">
              <Building2 className="w-6 h-6 text-slate-300" />
            </div>
            <p className="text-xl font-black text-white mb-1">Broker Firm</p>
            <p className="text-slate-400 text-sm mb-4">White-labeled platform for your entire brokerage</p>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-xs font-bold">White-label included</span>
              <ArrowRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-center gap-12">
          {[
            { value: "$40", label: "Per Client" },
            { value: "4-Week", label: "AI Plan" },
            { value: "Geo-AI", label: "Local Finder" },
          ].map(s => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-black text-orange-500">{s.value}</p>
              <p className="text-slate-500 text-xs font-semibold mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="bg-slate-900/50 border-t border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <h2 className="text-3xl font-black text-center mb-3">Everything your clients need</h2>
          <p className="text-slate-400 text-center text-sm mb-12">From close date to keys — AI handles the complexity</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                Icon: MapPin,
                title: "Geo-Fenced AI",
                desc: "AI instantly finds top-rated local movers, cleaners, estate sale companies, and more — curated to the exact neighborhoods of the current and new home.",
                color: "text-orange-400",
                bg: "bg-orange-400/10"
              },
              {
                Icon: Calendar,
                title: "Smart 4-Week Plan",
                desc: "A personalized project plan built around the client's close date. Tasks auto-populate week by week — buyers and sellers never miss a step.",
                color: "text-blue-400",
                bg: "bg-blue-400/10"
              },
              {
                Icon: TrendingUp,
                title: "Deal Journey Tracking",
                desc: "Track every client from listing to closing. Close date countdown, task completion, and contact management in one elegant view.",
                color: "text-emerald-400",
                bg: "bg-emerald-400/10"
              },
            ].map(f => (
              <div key={f.title} className="bg-slate-800/60 rounded-3xl p-6 border border-slate-700/50">
                <div className={`w-12 h-12 ${f.bg} rounded-2xl flex items-center justify-center mb-4`}>
                  <f.Icon className={`w-6 h-6 ${f.color}`} />
                </div>
                <h3 className="font-bold text-white text-lg mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="max-w-5xl mx-auto px-6 py-20 text-center">
        <h2 className="text-4xl font-black mb-4">Ready to get started?</h2>
        <p className="text-slate-400 mb-8">Join agents and brokerages already using EZ Move AI</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => base44.auth.redirectToLogin("/AgentOnboarding")}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold hover:opacity-90 transition-opacity"
          >
            Start as Agent — $40/client
          </button>
          <button
            onClick={() => base44.auth.redirectToLogin("/AgentOnboarding?type=broker")}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl border border-slate-700 text-slate-300 font-bold hover:bg-slate-800 transition-colors"
          >
            Broker Firm — White Label
          </button>
        </div>
      </div>

      <div className="border-t border-slate-800 py-6 text-center">
        <p className="text-slate-600 text-xs">© 2026 EZ Move AI. All rights reserved.</p>
      </div>
    </div>
  );
}