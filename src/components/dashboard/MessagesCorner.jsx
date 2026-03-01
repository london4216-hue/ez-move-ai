import { useState } from "react";
import { formatDistanceToNow } from "date-fns";

const DEMO_MESSAGES = [
  { sender_name: "Sarah M.", sender_role: "Agent", content: "Congrats on going under contract! Let me know if you need anything.", is_read: false, created_date: new Date(Date.now() - 3600000).toISOString() },
  { sender_name: "EZ Move AI", sender_role: "System", content: "Welcome! Your Week 1 tasks are ready. 🎉", is_read: true, created_date: new Date(Date.now() - 7200000).toISOString() },
  { sender_name: "Mike T.", sender_role: "Escrow", content: "Opening escrow now. You'll receive docs shortly.", is_read: true, created_date: new Date(Date.now() - 86400000).toISOString() },
];

export default function MessagesCorner({ user }) {
  const [open, setOpen] = useState(false);
  const messages = DEMO_MESSAGES;
  const unread = messages.filter(m => !m.is_read).length;

  return (
    <>
      {/* Icon button */}
      <button
        onClick={() => setOpen(true)}
        className="relative w-10 h-10 bg-white rounded-2xl shadow-sm flex items-center justify-center flex-shrink-0"
      >
        <svg className="w-5 h-5 text-[#1A1A2E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#F97316] rounded-full text-white text-[9px] font-bold flex items-center justify-center">
            {unread}
          </span>
        )}
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-md bg-white rounded-t-3xl p-5 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-bold text-[#1A1A2E]">Messages</p>
              <button
                onClick={() => setOpen(false)}
                className="w-7 h-7 rounded-full bg-[#F5F3EF] flex items-center justify-center text-[#6B7280]"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex flex-col gap-3 max-h-72 overflow-y-auto">
              {messages.map((m, i) => (
                <div key={i} className={`flex gap-3 p-3 rounded-xl ${!m.is_read ? "bg-[#FFF7ED]" : "bg-[#F9FAFB]"}`}>
                  <div className="w-8 h-8 rounded-full bg-[#1A1A2E] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {m.sender_name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <p className="text-xs font-bold text-[#1A1A2E]">{m.sender_name}</p>
                      {!m.is_read && <div className="w-1.5 h-1.5 bg-[#F97316] rounded-full" />}
                      <span className="text-[10px] text-[#9CA3AF] ml-auto">{formatDistanceToNow(new Date(m.created_date), { addSuffix: true })}</span>
                    </div>
                    <p className="text-xs text-[#6B7280] leading-tight">{m.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}