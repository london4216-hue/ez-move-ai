import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";
import StatusBar from "@/components/dashboard/StatusBar";
import ContactsRow from "@/components/dashboard/ContactsSidebar";
import ChecklistPanel from "@/components/dashboard/ChecklistPanel";
import MessagesCorner from "@/components/dashboard/MessagesCorner";
import WeekProgress from "@/components/dashboard/WeekProgress";
import CalendarSheet from "@/components/dashboard/CalendarSheet.jsx";
import InventoryTab from "@/components/dashboard/InventoryTab.jsx";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [contactsRefresh, setContactsRefresh] = useState(0);
  const [activeTab, setActiveTab] = useState("checklist");
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.me().then(u => {
      if (!u) { navigate(createPageUrl("Register")); return; }
      if (!u.onboarded) { navigate(createPageUrl("Register")); return; }
      setUser(u);
      setLoading(false);
    }).catch(() => navigate(createPageUrl("Register")));
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-[#F5F3EF] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#F97316] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F5F3EF] flex flex-col max-w-md mx-auto relative">
      <StatusBar user={user} />

      {/* Top branding */}
      <div className="px-5 pt-3 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#1A1A2E] rounded-lg flex items-center justify-center">
            <span className="text-white text-[10px] font-bold">EZ</span>
          </div>
          <span className="text-base font-semibold text-[#1A1A2E] tracking-tight">
            EZ Move <span className="text-[#F97316]">AI</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <MessagesCorner user={user} />
          <div className="w-8 h-8 rounded-full bg-[#1A1A2E] flex items-center justify-center">
            <span className="text-white text-xs font-bold">
              {user?.full_name?.[0] || "U"}
            </span>
          </div>
        </div>
      </div>

      {/* Week progress steps */}
      <WeekProgress user={user} />

      {/* Main content */}
      <div className="flex-1 px-3 pb-2 flex flex-col gap-3 overflow-y-auto">
        {activeTab === "checklist" && <ChecklistPanel user={user} onProviderSaved={() => setContactsRefresh(r => r + 1)} />}
        {activeTab === "calendar" && <CalendarSheet user={user} />}
        {activeTab === "inventory" && <InventoryTab user={user} />}
      </div>

      {/* Key Contacts — compact bottom bar */}
      <ContactsRow user={user} refreshKey={contactsRefresh} />

      {/* Bottom tab bar */}
      <div className="flex border-t border-[#E5E7EB] bg-white">
        <button
          onClick={() => setActiveTab("checklist")}
          className={`flex-1 py-3 flex flex-col items-center gap-0.5 text-[10px] font-semibold transition-colors
            ${activeTab === "checklist" ? "text-[#F97316]" : "text-[#9CA3AF]"}`}
        >
          <span className="text-base">☑️</span>
          Checklist
        </button>
        <button
          onClick={() => setActiveTab("calendar")}
          className={`flex-1 py-3 flex flex-col items-center gap-0.5 text-[10px] font-semibold transition-colors
            ${activeTab === "calendar" ? "text-[#F97316]" : "text-[#9CA3AF]"}`}
        >
          <span className="text-base">📅</span>
          Calendar
        </button>
      </div>
    </div>
  );
}