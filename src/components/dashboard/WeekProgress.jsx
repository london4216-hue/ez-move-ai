import { differenceInDays, parseISO, format } from "date-fns";

const WEEKS = [
  { week: 1, label: "Foundation", color: "#4F7EFF" },
  { week: 2, label: "Logistics", color: "#7C3AED" },
  { week: 3, label: "Home Prep", color: "#059669" },
  { week: 4, label: "Close & Move", color: "#D97706" },
];

export default function WeekProgress({ user }) {
  const currentWeek = user?.current_week || 1;
  const closeDate = user?.close_date;

  const daysLeft = closeDate
    ? Math.max(0, differenceInDays(parseISO(closeDate), new Date()))
    : null;

  const progress = ((currentWeek - 1) / 4) * 100;

  return (
    <div className="mx-3 mb-3 bg-white rounded-2xl p-4 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs text-[#6B7280] font-medium uppercase tracking-wider">Current Phase</p>
          <p className="text-lg font-bold text-[#1A1A2E]">
            Week {currentWeek} — {WEEKS[currentWeek - 1]?.label}
          </p>
        </div>
        {daysLeft !== null && (
          <div className="text-right">
            <p className="text-2xl font-bold text-[#4F7EFF]">{daysLeft}</p>
            <p className="text-xs text-[#6B7280]">days to close</p>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-[#F3F4F6] rounded-full overflow-hidden mb-3">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${progress}%`, background: "linear-gradient(90deg, #4F7EFF, #7C3AED)" }}
        />
      </div>

      {/* Week dots */}
      <div className="flex items-center justify-between">
        {WEEKS.map(w => (
          <div key={w.week} className="flex flex-col items-center gap-1">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
                ${w.week <= currentWeek ? "text-white shadow-md" : "text-[#9CA3AF] bg-[#F3F4F6]"}`}
              style={w.week <= currentWeek ? { backgroundColor: w.color } : {}}
            >
              {w.week <= currentWeek - 1 ? "✓" : w.week}
            </div>
            <p className="text-[10px] text-[#9CA3AF]">{w.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}