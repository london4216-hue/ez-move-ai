import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { ChevronDown, ChevronUp, Plus, Loader2 } from "lucide-react";
import { differenceInDays, parseISO, addDays, format } from "date-fns";
import UpcomingEvents from "./UpcomingEvents";
import MoveDirectory from "./MoveDirectory";
import TaskDetailDrawer from "./TaskDetailDrawer";
import { generateTasksForUser } from "@/lib/generateTasks";
import { PUBLIC_DEMO_MODE } from "@/lib/featureFlags";

function getDemoUserId() {
  return localStorage.getItem("demo_user_id") || "demo-user";
}

const STATUS_DOT = {
  not_started: "bg-slate-300",
  in_progress: "bg-blue-400",
  done: "bg-emerald-500",
  skipped: "bg-amber-400",
  na: "bg-slate-200",
};

export default function ChecklistPanel({ user }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [expandedWeeks, setExpandedWeeks] = useState(new Set([1]));
  const [contacts, setContacts] = useState([]);

  const userId = PUBLIC_DEMO_MODE ? getDemoUserId() : user?.id;

  // How many weeks based on close date
  const totalWeeks = (() => {
    if (!user?.estimated_close_date || !user?.registration_date) return 4;
    const days = differenceInDays(parseISO(user.estimated_close_date), parseISO(user.registration_date));
    return Math.max(1, Math.min(8, Math.ceil(days / 7)));
  })();

  const currentWeek = (() => {
    if (!user?.estimated_close_date || !user?.registration_date) return 1;
    const total = differenceInDays(parseISO(user.estimated_close_date), parseISO(user.registration_date));
    const elapsed = differenceInDays(new Date(), parseISO(user.registration_date));
    return Math.min(totalWeeks, Math.max(1, Math.ceil((elapsed / total) * totalWeeks)));
  })();

  useEffect(() => {
    if (!userId) return;
    loadTasks();
    base44.entities.Contact.filter({ user_id: userId }).then(setContacts).catch(() => {});
  }, [userId]);

  const loadTasks = async () => {
    setLoading(true);
    const existing = await base44.entities.Task.filter({ userId });
    if (existing.length === 0) {
      await seedTasks();
    } else {
      setTasks(existing);
    }
    setLoading(false);
  };

  const seedTasks = async () => {
    setGenerating(true);
    // Load move profile from localStorage (set during onboarding)
    let profile = {};
    try {
      const raw = localStorage.getItem(`pre_onboarding_${userId}`) || localStorage.getItem(`pre_onboarding_demo-user`);
      if (raw) profile = JSON.parse(raw);
    } catch {}

    const taskDefs = generateTasksForUser(userId, profile);
    const created = await base44.entities.Task.bulkCreate(taskDefs);
    setTasks(created || taskDefs.map((t, i) => ({ ...t, id: `local-${i}` })));
    setGenerating(false);
  };

  const handleStatusChange = (updated) => {
    setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
  };

  const toggleWeek = (w) => {
    setExpandedWeeks(prev => {
      const n = new Set(prev);
      n.has(w) ? n.delete(w) : n.add(w);
      return n;
    });
  };

  const weekDateRange = (weekNum) => {
    if (!user?.registration_date) return null;
    const start = addDays(parseISO(user.registration_date), (weekNum - 1) * 7);
    const end = addDays(start, 6);
    return `${format(start, "MMM d")} – ${format(end, "MMM d")}`;
  };

  if (loading || generating) {
    return (
      <div className="flex flex-col items-center py-16 gap-3">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
        <p className="text-sm text-slate-500 font-medium">
          {generating ? "Building your personalized move plan…" : "Loading tasks…"}
        </p>
      </div>
    );
  }

  const weekNums = Array.from({ length: totalWeeks }, (_, i) => i + 1);

  return (
    <div className="space-y-4">
      <UpcomingEvents user={user} />
      <MoveDirectory user={user} contacts={contacts} onContactsChange={setContacts} />

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">📋 My Move Plan</h3>
          <button onClick={seedTasks} className="text-[10px] font-bold text-orange-500 hover:text-orange-600">
            Regenerate
          </button>
        </div>

        <div className="px-3 pb-3 space-y-2 max-h-[560px] overflow-y-auto">
          {weekNums.map(weekNum => {
            const onboardingComplete = localStorage.getItem('onboardingComplete') === 'true';
            let weekTasks = tasks.filter(t => t.weekNumber === weekNum);
            // Hide visibility-guarded tasks if onboarding not complete
            weekTasks = weekTasks.filter(task => {
              if (task.visibilityGuard?.onboardingComplete === true && !onboardingComplete) return false;
              return true;
            });
            const doneTasks = weekTasks.filter(t => t.status === "done" || t.status === "na").length;
            const activeTasks = weekTasks.filter(t => t.status !== "na" && t.status !== "skipped");
            const progress = activeTasks.length ? Math.round((weekTasks.filter(t => t.status === "done").length / activeTasks.length) * 100) : 0;
            const isExpanded = expandedWeeks.has(weekNum);
            const dateRange = weekDateRange(weekNum);
            const isCurrent = weekNum === currentWeek;

            return (
              <div key={weekNum} className={`rounded-2xl border overflow-hidden ${isCurrent ? "border-orange-200" : "border-slate-200"}`}>
                <button
                  onClick={() => toggleWeek(weekNum)}
                  className={`w-full px-3 py-2.5 flex items-center justify-between transition-colors ${isCurrent ? "bg-orange-50" : "bg-slate-50 hover:bg-slate-100"}`}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-700">Week {weekNum}</h4>
                    {dateRange && <span className="text-[9px] text-slate-400 hidden sm:inline">{dateRange}</span>}
                    {isCurrent && <span className="text-[9px] font-black text-orange-500 bg-orange-100 px-1.5 py-0.5 rounded-full">NOW</span>}
                    {weekTasks.length > 0 && (
                      <div className="flex-1 max-w-[100px]">
                        <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }} />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[10px] font-bold text-orange-500">{doneTasks}/{weekTasks.length}</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="p-2 space-y-1.5 border-t border-slate-100">
                    {weekTasks.length === 0 && (
                      <p className="text-xs text-slate-400 text-center py-3">No tasks for this week yet.</p>
                    )}
                    {weekTasks.map(task => (
                      <button
                        key={task.id}
                        onClick={() => setSelectedTask(task)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white border border-slate-100 hover:border-orange-200 hover:bg-orange-50/30 active:scale-[0.98] transition-all text-left"
                      >
                        <div className={`w-3.5 h-3.5 rounded-full flex-shrink-0 ${STATUS_DOT[task.status] || "bg-slate-300"}`} />
                        <span className="text-lg leading-none flex-shrink-0">{task.emoji || "📋"}</span>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-bold truncate ${task.status === "done" ? "line-through text-slate-400" : task.status === "skipped" || task.status === "na" ? "text-slate-400" : "text-slate-800"}`}>
                            {task.title}
                          </p>
                          {task.description && (
                            <p className="text-[10px] text-slate-400 truncate mt-0.5">{task.description}</p>
                          )}
                        </div>
                        {task.status !== "not_started" && (
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                            task.status === "done" ? "bg-emerald-100 text-emerald-600" :
                            task.status === "in_progress" ? "bg-blue-100 text-blue-600" :
                            task.status === "skipped" ? "bg-amber-100 text-amber-600" :
                            "bg-slate-100 text-slate-500"
                          }`}>
                            {task.status === "in_progress" ? "Active" : task.status === "done" ? "Done" : task.status === "skipped" ? "Skipped" : "N/A"}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {selectedTask && (
        <TaskDetailDrawer
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}