import { useState, useEffect } from "react";
import { Sparkles, Trash2, Calendar } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";

export default function SavedInsights({ user }) {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInsights();
  }, [user?.id]);

  const loadInsights = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.SavedInsight.filter({}, "-saved_date", 100);
      setInsights(data || []);
    } catch (e) {
      console.error("Error loading insights:", e);
    }
    setLoading(false);
  };

  const deleteInsight = async (id) => {
    await base44.entities.SavedInsight.delete(id);
    setInsights(insights.filter(i => i.id !== id));
  };

  if (loading) {
    return <div className="text-center py-6 text-slate-500 text-xs">Loading...</div>;
  }

  if (insights.length === 0) {
    return (
      <div className="bg-slate-50 rounded-2xl border border-slate-200 px-4 py-6 text-center">
        <Sparkles className="w-6 h-6 text-slate-300 mx-auto mb-2" />
        <p className="text-xs text-slate-500">No saved insights yet. Generate and save results from AI Move Utilities.</p>
      </div>
    );
  }

  const grouped = insights.reduce((acc, insight) => {
    if (!acc[insight.category]) acc[insight.category] = [];
    acc[insight.category].push(insight);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([category, items]) => (
        <div key={category}>
          <p className="text-xs font-bold text-slate-600 mb-2 flex items-center gap-1">
            {items[0].tool_emoji} {items[0].tool_name}
          </p>
          <div className="space-y-2">
            {items.map((insight) => (
              <div key={insight.id} className="bg-white rounded-xl border border-slate-200 p-3">
                <p className="text-[11px] text-slate-700 leading-relaxed whitespace-pre-wrap mb-2">{insight.content}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[10px] text-slate-400">
                    <Calendar className="w-3 h-3" />
                    {insight.saved_date ? format(new Date(insight.saved_date), "MMM d, yyyy") : ""}
                  </div>
                  <button
                    onClick={() => deleteInsight(insight.id)}
                    className="text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}