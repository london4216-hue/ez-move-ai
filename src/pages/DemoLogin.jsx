import { base44 } from "@/api/base44Client";
import { UserCheck, Briefcase, Home, Home as SellerIcon, Shield } from "lucide-react";

const DEMO_PORTALS = [
  {
    label: "Agent",
    email: "london4216+agent@gmail.com",
    portal: "/AgentDashboard",
    icon: UserCheck,
    color: "bg-orange-500 hover:bg-orange-600",
    desc: "Manage clients, send invite links, track billing",
  },
  {
    label: "Broker",
    email: "london4216+broker@gmail.com",
    portal: "/BrokerDashboard",
    icon: Briefcase,
    color: "bg-purple-600 hover:bg-purple-700",
    desc: "Firm-wide client management & reporting",
  },
  {
    label: "Buyer",
    email: "london4216+buyer@gmail.com",
    portal: "/Dashboard",
    icon: Home,
    color: "bg-emerald-600 hover:bg-emerald-700",
    desc: "Personalized move plan, AI tools & checklist",
  },
  {
    label: "Seller",
    email: "london4216+seller@gmail.com",
    portal: "/Dashboard",
    icon: SellerIcon,
    color: "bg-blue-600 hover:bg-blue-700",
    desc: "Move-out planning, inventory & task tracking",
  },
  {
    label: "Super Admin",
    email: "london4216+superadmin@gmail.com",
    portal: "/SuperAdmin",
    icon: Shield,
    color: "bg-red-600 hover:bg-red-700",
    desc: "Platform-wide agent, billing & system control",
  },
];

export default function DemoLogin() {
  return (
    <div className="min-h-screen bg-[#0c0f1a] flex flex-col items-center justify-center px-4 py-12">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-900/50">
          <span className="text-white font-black text-xs">EZ</span>
        </div>
        <p className="font-black text-white text-xl">EZ Move <span className="text-orange-400">AI</span></p>
      </div>
      <p className="text-slate-400 text-sm mb-10">Demo Portal Launcher — click any role to log in</p>

      <div className="w-full max-w-md space-y-3">
        {DEMO_PORTALS.map(({ label, email, portal, icon: Icon, color, desc }) => (
          <button
            key={label}
            onClick={() => base44.auth.redirectToLogin(portal)}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-white text-left transition-all ${color} shadow-lg`}
          >
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-black text-base leading-tight">Login as {label}</p>
              <p className="text-white/60 text-xs mt-0.5">{desc}</p>
              <p className="text-white/40 text-[10px] mt-0.5 font-mono">{email}</p>
            </div>
          </button>
        ))}
      </div>

      <p className="text-slate-600 text-xs mt-10 text-center max-w-sm leading-relaxed">
        Each button redirects to Base44 login. Sign in with the email shown above.<br />
        All emails arrive in the same Gmail inbox via + aliases.
      </p>
    </div>
  );
}