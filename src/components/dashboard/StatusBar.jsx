import { useState, useEffect } from "react";

export default function StatusBar() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const fmt = time.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });

  return (
    <div className="flex items-center justify-between px-6 pt-3 pb-1 select-none">
      <span className="text-[13px] font-semibold text-[#1A1A2E]">{fmt}</span>
      <div className="flex items-center gap-1.5">
        {/* Signal */}
        <div className="flex items-end gap-[2px]">
          {[3, 5, 7, 9].map((h, i) => (
            <div key={i} className={`w-[3px] rounded-sm ${i < 3 ? "bg-[#1A1A2E]" : "bg-[#D1D5DB]"}`} style={{ height: h }} />
          ))}
        </div>
        {/* WiFi */}
        <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
          <path d="M7 8.5a1 1 0 100 2 1 1 0 000-2z" fill="#1A1A2E"/>
          <path d="M4.5 6.5C5.3 5.7 6.1 5.3 7 5.3s1.7.4 2.5 1.2" stroke="#1A1A2E" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
          <path d="M2 4C3.5 2.5 5.2 1.7 7 1.7s3.5.8 5 2.3" stroke="#1A1A2E" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
        </svg>
        {/* Battery */}
        <div className="flex items-center gap-0.5">
          <div className="w-6 h-3.5 rounded-[3px] border border-[#1A1A2E] p-[1.5px] flex items-center">
            <div className="h-full bg-[#1A1A2E] rounded-[1px]" style={{ width: "75%" }} />
          </div>
          <div className="w-[2px] h-1.5 bg-[#1A1A2E] rounded-r-sm" />
        </div>
      </div>
    </div>
  );
}