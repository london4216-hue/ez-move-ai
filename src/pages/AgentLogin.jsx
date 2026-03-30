import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";
import { Loader2, ArrowRight, User, Building2, Home } from "lucide-react";

export default function AgentLogin() {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.me().then(user => {
      if (user?.role === "super_admin") navigate("/SuperAdmin");
      else if (user?.role === "admin") navigate(createPageUrl("AgentDashboard"));
      else if (user?.registration_date) navigate(createPageUrl("Dashboard"));
      else setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const paths = [
    {
      icon: User,
      title: "I'm an Agent",
      desc: "Manage buyers & sellers — $40 per client",
      action: () => base44.auth.redirectToLogin("/AgentOnboarding"),
      gradient: "from-orange-500 to-orange-600",
      shadow: "shadow-orange-900/40",
      textColor: "text-white",
      descColor: "text-orange-100",
    },
    {
      icon: Building2,
      title: "Broker Firm",
      desc: "White-labeled portal for your brokerage",
      action: () => base44.auth.redirectToLogin("/AgentOnboarding?type=broker"),
      gradient: "from-slate-700 to-slate-800",
      shadow: "shadow-slate-900/40",
      textColor: "text-white",
      descColor: "text-slate-400",
      border: "border border-slate-600",
    },
    {
      icon: Home,
      title: "I'm a Buyer or Seller",
      desc: "Access your moving assistant with an invite code",
      action: () => base44.auth.redirectToLogin("/Register"),
      gradient: null,
      shadow: null,
      textColor: "text-slate-200",
      descColor: "text-slate-500",
      border: "border border-slate-700",
      bg: "bg-slate-900",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-br from-orange-500 to-orange-600 mb-5 shadow-2xl shadow-orange-900/50">
            <span className="text-white text-xl font-black">EZ</span>
          </div>
          <h1 className="text-3xl font-black text-white mb-2">EZ Move AI</h1>
          <p className="text-slate-400 text-sm">Choose how you're accessing the platform</p>
        </div>

        <div className="space-y-3">
          {paths.map(p => (
            <button
              key={p.title}
              onClick={p.action}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all active:scale-[0.98] group
                ${p.gradient ? `bg-gradient-to-r ${p.gradient} shadow-lg ${p.shadow}` : `${p.bg || ""} ${p.border || ""} hover:bg-slate-800`}
              `}
            >
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${p.gradient ? "bg-white/20" : "bg-slate-800"}`}>
                <p.icon className={`w-5 h-5 ${p.gradient ? "text-white" : "text-slate-400"}`} />
              </div>
              <div className="flex-1 text-left">
                <p className={`font-bold text-sm ${p.textColor}`}>{p.title}</p>
                <p className={`text-xs ${p.descColor} mt-0.5`}>{p.desc}</p>
              </div>
              <ArrowRight className={`w-4 h-4 ${p.gradient ? "text-white/70" : "text-slate-600"} group-hover:translate-x-0.5 transition-transform`} />
            </button>
          ))}
        </div>

        <p className="text-center text-xs text-slate-600 mt-8">
          © 2026 EZ Move AI · All rights reserved
        </p>
      </div>
    </div>
  );
}