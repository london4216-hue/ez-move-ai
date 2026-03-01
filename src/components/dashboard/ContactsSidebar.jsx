import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Phone } from "lucide-react";

const KEY_CONTACTS = [
  { name: "Sarah M.", role: "Agent", color: "#F97316", phone: "(310) 555-0182" },
  { name: "Mike T.", role: "Escrow", color: "#7C3AED", phone: "(310) 555-0247" },
  { name: "Lisa R.", role: "Lender", color: "#059669", phone: "(310) 555-0391" },
];

const COLORS = ["#3B82F6", "#EC4899", "#8B5CF6", "#14B8A6", "#F59E0B", "#EF4444"];

export default function ContactsRow({ user, refreshKey }) {
  const [savedProviders, setSavedProviders] = useState([]);

  useEffect(() => {
    if (!user) return;
    base44.entities.SavedProvider.filter({ user_id: user.id }).then(setSavedProviders).catch(() => {});
  }, [user, refreshKey]);

  const all = [
    ...KEY_CONTACTS,
    ...savedProviders.map((p, i) => ({
      name: p.name,
      role: p.role,
      phone: p.phone,
      color: COLORS[i % COLORS.length],
      saved: true
    }))
  ];

  return (
    <div className="mx-3 mb-4 bg-white rounded-2xl px-3 py-2.5 shadow-sm">
      <p className="text-[9px] font-bold text-[#9CA3AF] uppercase tracking-wider mb-2">Contacts</p>
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-0.5">
        {all.map((c, i) => (
          <div key={i} className="flex-shrink-0 flex items-center gap-2 bg-[#F5F3EF] rounded-xl px-2.5 py-1.5">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
              style={{ backgroundColor: c.color }}
            >
              {c.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#1A1A2E] leading-tight">{c.name}</p>
              <p className="text-[9px] font-bold text-[#F97316] uppercase tracking-wide leading-tight">{c.role}</p>
              {c.phone && (
                <a href={`tel:${c.phone.replace(/\D/g, "")}`} className="flex items-center gap-0.5 text-[9px] text-[#6B7280] hover:text-[#F97316] mt-0.5">
                  <Phone className="w-2.5 h-2.5" />{c.phone}
                </a>
              )}
            </div>
          </div>
        ))}
        <button className="flex-shrink-0 w-8 h-8 rounded-full bg-[#F5F3EF] border-2 border-dashed border-[#D1D5DB] flex items-center justify-center text-[#9CA3AF] text-base self-center">
          +
        </button>
      </div>
    </div>
  );
}