import { differenceInDays, parseISO, format } from "date-fns";

const WEEKS = [
  { week: 1, label: "Foundation", color: "#F97316" },
  { week: 2, label: "Logistics", color: "#EF4444" },
  { week: 3, label: "Home Prep", color: "#F59E0B" },
  { week: 4, label: "Close & Move", color: "#DC2626" },
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
      {daysLeft !== null && (
        <div className="flex items-center justify-center">
          <div className="text-center">
            <p className="text-2xl font-bold text-[#F97316]">{daysLeft}</p>
            <p className="text-xs text-[#6B7280]">days to close</p>
          </div>
        </div>
      )}
    </div>
  );
}