import { useNavigate, useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { getPortalRole } from "@/lib/usePortalRole";
import { LayoutDashboard, Users, BarChart2, Settings, ScrollText, LogOut, Home, ClipboardList } from "lucide-react";

const NAV_CONFIG = {
  super_admin: [
    { label: "Dashboard", path: "/SuperAdmin", icon: LayoutDashboard },
    { label: "Brokers", path: "/SuperAdmin?tab=brokers", icon: Users },
    { label: "Agents", path: "/SuperAdmin?tab=agents", icon: Users },
    { label: "Reporting", path: "/SuperAdmin?tab=reporting", icon: BarChart2 },
    { label: "Settings", path: "/SuperAdmin?tab=settings", icon: Settings },
    { label: "Audit Log", path: "/SuperAdmin?tab=audit", icon: ScrollText },
  ],
  broker: [
    { label: "Dashboard", path: "/BrokerDashboard", icon: LayoutDashboard },
    { label: "Agents", path: "/BrokerDashboard?tab=agents", icon: Users },
    { label: "Clients", path: "/BrokerDashboard?tab=clients", icon: Users },
    { label: "Reporting", path: "/BrokerDashboard?tab=reporting", icon: BarChart2 },
    { label: "Settings", path: "/BrokerDashboard?tab=settings", icon: Settings },
  ],
  agent: [
    { label: "Dashboard", path: "/AgentDashboard", icon: LayoutDashboard },
    { label: "My Clients", path: "/AgentDashboard?tab=clients", icon: Users },
    { label: "Move Plans", path: "/AgentDashboard?tab=moves", icon: ClipboardList },
  ],
};

const PORTAL_LABELS = {
  super_admin: "Super Admin",
  broker: "Broker Portal",
  agent: "Agent Portal",
};

export default function PortalNav({ user, compact = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const role = getPortalRole(user);
  const navItems = NAV_CONFIG[role] || [];
  const portalLabel = PORTAL_LABELS[role] || "Portal";

  if (compact) {
    // Top bar only (used by existing pages that already have their own layout)
    return (
      <div className="bg-white border-b border-slate-100 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-md shadow-orange-200">
            <span className="text-white font-black text-xs">EZ</span>
          </div>
          <div>
            <p className="font-black text-slate-800 text-sm leading-tight">EZ Move <span className="text-orange-500">AI</span></p>
            <p className="text-slate-400 text-[10px] font-semibold">{portalLabel}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {navItems.slice(0, 4).map(({ label, path, icon: Icon }) => {
            const active = location.pathname + location.search === path || (path === location.pathname && !location.search);
            return (
              <button key={label} onClick={() => navigate(path)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${active ? "bg-orange-50 text-orange-600" : "text-slate-500 hover:bg-slate-50"}`}>
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            );
          })}
          <button onClick={() => base44.auth.logout("/")}
            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors ml-1">
            <LogOut className="w-3.5 h-3.5 text-slate-500" />
          </button>
        </div>
      </div>
    );
  }

  return null;
}