import { differenceInDays, parseISO } from "date-fns";

const PHASES = [
  { week: 1, label: "Foundation", emoji: "🏗️" },
  { week: 2, label: "Logistics", emoji: "📋" },
  { week: 3, label: "Home Prep", emoji: "🏠" },
  { week: 4, label: "Final Push", emoji: "🔑" },
];

export default function WeekProgress({ user }) {
  const currentWeek = user?.current_week || 1;
  const closeDate = user?.estimated_close_date || user?.close_date;

  const daysLeft = closeDate
    ? Math.max(0, differenceInDays(parseISO(closeDate), new Date()))
    : null;

  return (
    <div className="px-4 pb-3">
      {/* Days left banner */}
      {daysLeft !== null && (
        <div className="bg-slate-900 rounded-2xl px-5 py-4 mb-3 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">Days to closing</p>
            <p className="text-3xl font-black text-white leading-none">{daysLeft}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400 mb-1">Current phase</p>
            <div className="flex items-center gap-1.5">
              <span className="text-lg">{PHASES[currentWeek - 1]?.emoji}</span>
              <p className="text-sm font-bold text-orange-400">{PHASES[currentWeek - 1]?.label}</p>
            </div>
          </div>
        </div>
      )}

      {/* Week indicators */}
      <div className="flex gap-2">
        {PHASES.map((phase) => (
          <div
            key={phase.week}
            className={`flex-1 rounded-xl py-2 px-1.5 text-center transition-all
              ${phase.week === currentWeek
                ? "bg-orange-500 text-white"
                : phase.week < currentWeek
                  ? "bg-slate-900 text-white"
                  : "bg-white border border-slate-200 text-slate-400"}`}
          >
            <p className={`text-[10px] font-bold uppercase tracking-wide ${
              phase.week === currentWeek ? "text-orange-100" :
              phase.week < currentWeek ? "text-slate-400" : "text-slate-400"
            }`}>W{phase.week}</p>
            <p className="text-[10px] font-semibold truncate mt-0.5">{phase.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}