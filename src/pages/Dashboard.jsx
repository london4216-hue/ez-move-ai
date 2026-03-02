import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";
import WeekProgress from "@/components/dashboard/WeekProgress";
import ChecklistPanel from "@/components/dashboard/ChecklistPanel";
import CalendarSheet from "@/components/dashboard/CalendarSheet";
import InventoryTab from "@/components/dashboard/InventoryTab";
import ContactsSidebar from "@/components/dashboard/ContactsSidebar";
import { CheckSquare, Package, CalendarDays, Users, LogOut } from "lucide-react";

const TABS = [
  { id: "checklist", label: "Plan", icon: CheckSquare },
  { id: "calendar", label: "Calendar", icon: CalendarDays },
  { id: "inventory", label: "Inventory", icon: Package },
  { id: "contacts", label: "Contacts", icon: Users },
];

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("checklist");
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.me()
      .then(u => { setUser(u); setLoading(false); })
      .catch(() => navigate(createPageUrl("Register")));
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center">
      <div className="w-10 h-10 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const initials = user?.full_name
    ? user.full_name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
    : "U";

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-slate-100 overflow-hidden">

      {/* Header */}
      <div className="bg-white px-5 pt-12 pb-4 flex items-center justify-between border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-slate-900 rounded-xl flex items-center justify-center">
            <span className="text-white text-xs font-black">EZ</span>
          </div>
          <div>
            <span className="text-base font-black text-slate-900">EZ Move <span className="text-orange-500">AI</span></span>
            {user?.full_name && (
              <p className="text-[11px] text-slate-400 leading-none mt-0.5">Hey, {user.full_name.split(" ")[0]} 👋</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => base44.auth.logout(createPageUrl("Register"))}
            className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600"
          >
            <LogOut className="w-4 h-4" />
          </button>
          <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center">
            <span className="text-white text-xs font-black">{initials}</span>
          </div>
        </div>
      </div>

      {/* Week Progress */}
      <div className="bg-white pt-4 pb-1 border-b border-slate-100">
        <WeekProgress user={user} />
      </div>

      {/* Main content - scrollable */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {activeTab === "checklist" && <ChecklistPanel user={user} />}
        {activeTab === "calendar" && <CalendarSheet user={user} />}
        {activeTab === "inventory" && <InventoryTab user={user} />}
        {activeTab === "contacts" && <ContactsSidebar user={user} />}
      </div>

      {/* Bottom Tab Bar */}
      <div className="bg-white border-t border-slate-100 flex safe-bottom pb-2">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 pt-3 pb-1 flex flex-col items-center gap-1 transition-all`}
          >
            <Icon className={`w-5 h-5 ${activeTab === id ? "text-orange-500" : "text-slate-400"}`} />
            <span className={`text-[10px] font-bold ${activeTab === id ? "text-orange-500" : "text-slate-400"}`}>
              {label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}