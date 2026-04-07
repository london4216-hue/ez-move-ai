import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { X, CheckCircle2, SkipForward, Ban, Clock, Loader2 } from "lucide-react";

const STATUS_CONFIG = {
  not_started: { label: "Not Started", color: "text-slate-400 bg-slate-100" },
  in_progress: { label: "In Progress", color: "text-blue-600 bg-blue-50" },
  done: { label: "Complete ✓", color: "text-emerald-600 bg-emerald-50" },
  skipped: { label: "Skipped", color: "text-amber-600 bg-amber-50" },
  na: { label: "N/A", color: "text-slate-400 bg-slate-100" },
};

export default function TaskDetailDrawer({ task, onClose, onStatusChange }) {
  const [saving, setSaving] = useState(false);

  if (!task) return null;

  const updateStatus = async (status) => {
    setSaving(true);
    await base44.entities.Task.update(task.id, { status });
    onStatusChange({ ...task, status });
    setSaving(false);
    if (status === "done" || status === "skipped" || status === "na") onClose();
  };

  const cfg = STATUS_CONFIG[task.status] || STATUS_CONFIG.not_started;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end justify-center">
      <div className="w-full max-w-md bg-white rounded-t-3xl shadow-2xl max-h-[88vh] flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-5 pb-3 border-b border-slate-100">
          <div className="flex-1 pr-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{task.emoji || "📋"}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.color}`}>{cfg.label}</span>
            </div>
            <h2 className="text-lg font-black text-slate-900 leading-tight">{task.title}</h2>
            {task.estimatedTime && (
              <div className="flex items-center gap-1 mt-1">
                <Clock className="w-3 h-3 text-slate-400" />
                <span className="text-xs text-slate-400 font-medium">{task.estimatedTime}</span>
              </div>
            )}
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {task.description && (
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Overview</p>
              <p className="text-sm text-slate-700 leading-relaxed">{task.description}</p>
            </div>
          )}

          {task.instructions && (
            <div className="bg-slate-50 rounded-2xl p-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2">📌 Instructions</p>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{task.instructions}</p>
            </div>
          )}

          {task.aiTips && (
            <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4">
              <p className="text-[10px] font-bold text-orange-500 uppercase tracking-wide mb-2">✨ AI Tips</p>
              <p className="text-sm text-slate-700 leading-relaxed">{task.aiTips}</p>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="px-5 pb-6 pt-3 border-t border-slate-100 space-y-2">
          {saving ? (
            <div className="flex justify-center py-3">
              <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
            </div>
          ) : (
            <>
              <button onClick={() => updateStatus("done")}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-black text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-200">
                <CheckCircle2 className="w-4 h-4" /> Mark Complete
              </button>
              <div className="flex gap-2">
                <button onClick={() => updateStatus("in_progress")}
                  className="flex-1 py-3 rounded-2xl border-2 border-blue-200 bg-blue-50 text-blue-700 font-bold text-sm flex items-center justify-center gap-1.5">
                  🔄 In Progress
                </button>
                <button onClick={() => updateStatus("skipped")}
                  className="flex-1 py-3 rounded-2xl border-2 border-amber-200 bg-amber-50 text-amber-700 font-bold text-sm flex items-center justify-center gap-1.5">
                  <SkipForward className="w-3.5 h-3.5" /> Skip
                </button>
                <button onClick={() => updateStatus("na")}
                  className="flex-1 py-3 rounded-2xl border-2 border-slate-200 bg-slate-50 text-slate-500 font-bold text-sm flex items-center justify-center gap-1.5">
                  <Ban className="w-3.5 h-3.5" /> N/A
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}