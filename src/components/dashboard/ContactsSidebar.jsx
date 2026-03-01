import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

const COLORS = ["#4F7EFF", "#7C3AED", "#059669", "#D97706", "#DC2626"];

const DEFAULT_CONTACTS = [
  { name: "Sarah M.", role: "Agent", color: "#4F7EFF" },
  { name: "Mike T.", role: "Escrow", color: "#7C3AED" },
  { name: "Lisa R.", role: "Lender", color: "#059669" },
];

export default function ContactsSidebar({ user }) {
  const [contacts, setContacts] = useState(DEFAULT_CONTACTS);

  return (
    <div className="w-28 bg-white rounded-2xl p-3 shadow-sm flex flex-col">
      <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider mb-3">Key Contacts</p>
      <div className="flex-1 flex flex-col gap-2 overflow-y-auto">
        {contacts.map((c, i) => (
          <button key={i} className="flex flex-col items-center gap-1 group">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-sm"
              style={{ backgroundColor: c.color }}
            >
              {c.name.split(" ").map(n => n[0]).join("")}
            </div>
            <div className="text-center">
              <p className="text-[10px] font-semibold text-[#1A1A2E] leading-tight">{c.name.split(" ")[0]}</p>
              <p className="text-[9px] text-[#9CA3AF]">{c.role}</p>
            </div>
          </button>
        ))}
      </div>
      <button className="mt-2 w-full py-1.5 rounded-lg bg-[#F5F3EF] text-[#4F7EFF] text-[10px] font-bold">
        + Add
      </button>
    </div>
  );
}