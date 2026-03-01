import { useState } from "react";
import { Phone, Mail } from "lucide-react";

const DEFAULT_CONTACTS = [
  { name: "Sarah M.", role: "Agent", color: "#F97316", phone: "(310) 555-0182", email: "sarah@realty.com" },
  { name: "Mike T.", role: "Escrow", color: "#7C3AED", phone: "(310) 555-0247", email: "mike@escrow.com" },
  { name: "Lisa R.", role: "Lender", color: "#059669", phone: "(310) 555-0391", email: "lisa@lending.com" },
];

export default function ContactsRow({ user }) {
  const [contacts] = useState(DEFAULT_CONTACTS);

  return (
    <div className="mx-3 mb-3 bg-white rounded-2xl px-4 py-3 shadow-sm">
      <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider mb-3">Key Contacts</p>
      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
        {contacts.map((c, i) => (
          <div key={i} className="flex-shrink-0 bg-[#F5F3EF] rounded-2xl p-3 w-44">
            <div className="flex items-center gap-2.5 mb-2.5">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                style={{ backgroundColor: c.color }}
              >
                {c.name.split(" ").map(n => n[0]).join("")}
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-[#1A1A2E] leading-tight">{c.name}</p>
                <p className="text-[10px] font-bold text-[#F97316] uppercase tracking-wide">{c.role}</p>
              </div>
            </div>
            <div className="space-y-1.5">
              <a
                href={`tel:${c.phone.replace(/\D/g, "")}`}
                className="flex items-center gap-1.5 text-[11px] text-[#1A1A2E] font-medium hover:text-[#F97316] transition-colors"
                onClick={e => e.stopPropagation()}
              >
                <Phone className="w-3 h-3 text-[#F97316] flex-shrink-0" />
                <span className="truncate">{c.phone}</span>
              </a>
              <a
                href={`mailto:${c.email}`}
                className="flex items-center gap-1.5 text-[11px] text-[#1A1A2E] font-medium hover:text-[#F97316] transition-colors"
                onClick={e => e.stopPropagation()}
              >
                <Mail className="w-3 h-3 text-[#F97316] flex-shrink-0" />
                <span className="truncate">{c.email}</span>
              </a>
            </div>
          </div>
        ))}
        <div className="flex-shrink-0 w-14 flex items-center justify-center">
          <button className="w-10 h-10 rounded-full bg-[#F5F3EF] border-2 border-dashed border-[#D1D5DB] flex items-center justify-center text-[#9CA3AF] text-xl font-light">
            +
          </button>
        </div>
      </div>
    </div>
  );
}