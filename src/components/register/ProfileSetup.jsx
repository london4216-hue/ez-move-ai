import { useState } from "react";
import { format, parse } from "date-fns";

export default function ProfileSetup({ onComplete }) {
  const [user_type, setUserType] = useState("seller");
  const [close_date, setCloseDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!close_date) return;
    setSubmitting(true);
    const today = new Date();
    await onComplete({
      user_type,
      close_date,
      registration_date: format(today, "yyyy-MM-dd")
    });
  };

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-[#1A1A2E] rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-bold">EZ</span>
          </div>
          <span className="text-xl font-semibold text-[#1A1A2E] tracking-tight">EZ Move <span className="text-[#C85A17]">AI</span></span>
        </div>
        <h1 className="text-2xl font-bold text-[#1A1A2E] mb-1">Almost there</h1>
        <p className="text-sm text-[#6B7280]">Just need your closing date</p>
      </div>

      <div className="space-y-5">
        {/* Buyer / Seller */}
        <div>
          <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-2">I am a</p>
          <div className="flex gap-3">
            {["seller", "buyer"].map(type => (
              <button
                key={type}
                onClick={() => setUserType(type)}
                className={`flex-1 py-3 rounded-xl font-semibold text-sm capitalize transition-all
                  ${user_type === type
                    ? "bg-[#1A1A2E] text-white shadow-lg"
                    : "bg-white text-[#6B7280] border border-[#E5E7EB]"}`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Close Date */}
        <div>
          <label className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider block mb-1.5">
            Closing Date <span className="text-[#C85A17]">*</span>
          </label>
          <input
            type="date"
            value={close_date}
            onChange={e => setCloseDate(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-white text-[#1A1A2E] text-sm focus:outline-none focus:border-[#C85A17] focus:shadow-[0_0_0_3px_rgba(200,90,23,0.15)]"
          />
          <p className="text-[11px] text-[#9CA3AF] mt-2">Today: {format(new Date(), "MMM d, yyyy")}</p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!close_date || submitting}
          className="w-full py-4 rounded-2xl bg-[#C85A17] text-white font-semibold text-base
            disabled:opacity-40 active:scale-[0.98] transition-all mt-4 shadow-[0_8px_24px_rgba(200,90,23,0.3)]"
        >
          {submitting ? "Setting up..." : "Let's Go"}
        </button>
      </div>
    </div>
  );
}