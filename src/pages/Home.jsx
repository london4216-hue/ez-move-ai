import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Shield, User, Building2, Home as HomeIcon, ArrowRight, Zap } from "lucide-react";

export default function Home() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

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
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const portals = [
    {
      icon: Shield,
      emoji: "🔐",
      title: "System Admin",
      subtitle: "EZ Move AI platform management",
      desc: "Manage agents, brokers, licenses, and platform revenue.",
      action: () => base44.auth.redirectToLogin("/SuperAdmin"),
      bg: "bg-slate-800",
      iconBg: "bg-slate-700",
      iconColor: "text-slate-200",
      textColor: "text-white",
      descColor: "text-slate-400",
      btnBg: "bg-white/10 hover:bg-white/20 text-white border-white/20",
      tag: "Admin Only",
      tagColor: "bg-white/10 text-white/70",
    },
    {
      icon: Building2,
      emoji: "🏢",
      title: "Agent / Broker Portal",
      subtitle: "Manage your clients",
      desc: "Invite buyers & sellers, track close dates, purchase licenses.",
      action: () => base44.auth.redirectToLogin("/AgentOnboarding"),
      bg: "bg-orange-500",
      iconBg: "bg-white/20",
      iconColor: "text-white",
      textColor: "text-white",
      descColor: "text-orange-100",
      btnBg: "bg-white text-orange-600 hover:bg-orange-50 border-transparent font-bold",
      tag: "$40 / client",
      tagColor: "bg-white/20 text-white",
    },
    {
      icon: HomeIcon,
      emoji: "🏡",
      title: "Buyer / Seller",
      subtitle: "Your moving assistant",
      desc: "Access your personalized moving plan with your invite code.",
      action: () => base44.auth.redirectToLogin("/Register"),
      bg: "bg-white",
      iconBg: "bg-blue-50",
      iconColor: "text-blue-500",
      textColor: "text-slate-800",
      descColor: "text-slate-500",
      btnBg: "bg-blue-500 hover:bg-blue-600 text-white border-transparent",
      tag: "Invite Required",
      tagColor: "bg-blue-50 text-blue-600",
      border: "border border-blue-100",
      shadow: "shadow-md",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex flex-col">
      {/* Header */}
      <div className="px-6 py-6 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-200">
            <span className="text-white font-black text-base">EZ</span>
          </div>
          <div>
            <p className="font-black text-slate-800 text-xl leading-tight">EZ Move <span className="text-orange-500">AI</span></p>
            <p className="text-slate-400 text-[11px] font-semibold">Your Complete Moving Platform</p>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 py-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-orange-100 border border-orange-200 rounded-full px-4 py-1.5 mb-5">
            <Zap className="w-3.5 h-3.5 text-orange-500" />
            <span className="text-orange-600 text-xs font-bold uppercase tracking-wider">AI-Powered Moving Assistant</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-800 mb-3 leading-tight">
            Welcome to EZ Move AI
          </h1>
          <p className="text-slate-500 text-base max-w-md">
            Choose your portal below to get started
          </p>
        </div>

        {/* Portal Cards */}
        <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-3 gap-5">
          {portals.map(p => (
            <button
              key={p.title}
              onClick={p.action}
              className={`group relative rounded-3xl p-6 text-left transition-all active:scale-[0.98] hover:-translate-y-1 hover:shadow-xl ${p.bg} ${p.border || ""} ${p.shadow || "shadow-lg"}`}
            >
              {/* Tag */}
              <span className={`inline-block text-[10px] font-bold px-2.5 py-1 rounded-full mb-4 ${p.tagColor}`}>
                {p.tag}
              </span>

              {/* Icon */}
              <div className={`w-12 h-12 ${p.iconBg} rounded-2xl flex items-center justify-center mb-4`}>
                <p.icon className={`w-6 h-6 ${p.iconColor}`} />
              </div>

              {/* Text */}
              <p className={`text-xl font-black mb-0.5 ${p.textColor}`}>{p.title}</p>
              <p className={`text-xs font-semibold mb-2 ${p.descColor}`}>{p.subtitle}</p>
              <p className={`text-xs leading-relaxed mb-5 ${p.descColor}`}>{p.desc}</p>

              {/* CTA */}
              <div className={`w-full py-2.5 px-4 rounded-xl border text-sm font-bold flex items-center justify-between transition-colors ${p.btnBg}`}>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          ))}
        </div>

        <p className="text-slate-400 text-xs mt-10 text-center">
          © 2026 EZ Move AI · All Rights Reserved
        </p>
      </div>
    </div>
  );
}