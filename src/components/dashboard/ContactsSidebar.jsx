import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

const DEFAULT_CONTACTS = [
  { name: "Sarah M.", role: "Agent", color: "#F97316" },
  { name: "Mike T.", role: "Escrow", color: "#7C3AED" },
  { name: "Lisa R.", role: "Lender", color: "#059669" },
];

export default function ContactsRow({ user }) {
  const [contacts] = useState(DEFAULT_CONTACTS);

  return (
    <div className="mx-3 mb-3 bg-white rounded-2xl px-4 py-3 shadow-sm">
      <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider mb-3">Key Contacts</p>
      <div className="flex gap-4 overflow-x-auto no-scrollbar">
        {contacts.map((c, i) => (
          <button key={i} className="flex items-center gap-2.5 flex-shrink-0 bg-[#F5F3EF] rounded-xl px-3 py-2">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
              style={{ backgroundColor: c.color }}
            >
              {c.name.split(" ").map(n => n[0]).join("")}
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-[#1A1A2E] leading-tight">{c.name}</p>
              <p className="text-[11px] font-semibold text-[#F97316] uppercase tracking-wide">{c.role}</p>
            </div>
          </button>
        ))}
        <button className="flex-shrink-0 w-9 h-9 rounded-full bg-[#F5F3EF] border-2 border-dashed border-[#D1D5DB] flex items-center justify-center text-[#9CA3AF] text-lg font-light self-center">
          +
        </button>
      </div>
    </div>
  );
}