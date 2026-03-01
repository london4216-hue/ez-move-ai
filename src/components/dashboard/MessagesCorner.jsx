import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { formatDistanceToNow } from "date-fns";

const DEMO_MESSAGES = [
  { sender_name: "Sarah M.", sender_role: "Agent", content: "Congrats on going under contract! Let me know if you need anything.", is_read: false, created_date: new Date(Date.now() - 3600000).toISOString() },
  { sender_name: "EZ Move AI", sender_role: "System", content: "Welcome! Your Week 1 tasks are ready. 🎉", is_read: true, created_date: new Date(Date.now() - 7200000).toISOString() },
  { sender_name: "Mike T.", sender_role: "Escrow", content: "Opening escrow now. You'll receive docs shortly.", is_read: true, created_date: new Date(Date.now() - 86400000).toISOString() },
];

export default function MessagesCorner({ user }) {
  const [messages] = useState(DEMO_MESSAGES);
  const unread = messages.filter(m => !m.is_read).length;

  return (
    <div className="flex-1 bg-white rounded-2xl p-3 shadow-sm flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Messages</p>
        {unread > 0 && (
          <span className="w-4 h-4 bg-[#4F7EFF] rounded-full text-white text-[9px] font-bold flex items-center justify-center">
            {unread}
          </span>
        )}
      </div>
      <div className="flex-1 flex flex-col gap-2 overflow-y-auto">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-2 p-2 rounded-xl transition-all ${!m.is_read ? "bg-[#EEF2FF]" : ""}`}>
            <div className="w-7 h-7 rounded-full bg-[#1A1A2E] flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
              {m.sender_name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <p className="text-[10px] font-bold text-[#1A1A2E] truncate">{m.sender_name}</p>
                {!m.is_read && <div className="w-1.5 h-1.5 bg-[#4F7EFF] rounded-full flex-shrink-0" />}
              </div>
              <p className="text-[10px] text-[#6B7280] leading-tight line-clamp-2">{m.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}