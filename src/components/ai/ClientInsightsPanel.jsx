import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { X, Sparkles, Star, AlertTriangle, BookOpen, Loader2, ChevronDown, ChevronUp } from "lucide-react";

const RISK_COLORS = {
  Low:    { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", dot: "bg-emerald-500" },
  Medium: { bg: "bg-amber-50",   border: "border-amber-200",   text: "text-amber-700",   dot: "bg-amber-500"   },
  High:   { bg: "bg-red-50",     border: "border-red-200",     text: "text-red-700",      dot: "bg-red-500"     },
};

function Section({ icon: Icon, color, title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-slate-100 rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors text-left">
        <div className={`w-7 h-7 rounded-lg ${color} flex items-center justify-center flex-shrink-0`}>
          <Icon className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="font-bold text-slate-800 text-sm flex-1">{title}</span>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      {open && <div className="px-4 py-4">{children}</div>}
    </div>
  );
}

export default function ClientInsightsPanel({ client, agentName, onClose }) {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState(null);
  const [generated, setGenerated] = useState(false);

  const generate = async () => {
    setLoading(true);
    const daysLeft = client.close_date
      ? Math.ceil((new Date(client.close_date) - new Date()) / 86400000)
      : null;

    const prompt = `You are an AI assistant for a real estate moving platform called EZ Move AI.
Generate structured insights for the following client move:

Client Name: ${client.user_name || "Unknown"}
Email: ${client.user_email || "N/A"}
Moving TO: ${client.home_address || "Unknown"}
Moving FROM: ${client.moving_from_address || "Unknown"}
Estimated Miles: ${client.estimated_miles != null ? client.estimated_miles + " miles" : "Unknown"}
Close/Move Date: ${client.close_date || "Unknown"} (${daysLeft != null ? daysLeft + " days away" : "date unknown"})
Agent: ${agentName || "Unknown"}
Status: ${client.status}

Return JSON with exactly this structure:
{
  "move_story": "One warm, confident, supportive paragraph (3-4 sentences) summarizing who they are, where they're going, timeline, and key factors.",
  "risk_level": "Low" | "Medium" | "High",
  "risk_reason": "1-2 sentences explaining the risk rating.",
  "star_tasks": ["task1", "task2", "task3"],
  "coaching": {
    "talking_points": ["point1", "point2"],
    "sensitivity": "One sentence about timeline/budget/stress sensitivities.",
    "next_action": "One specific recommended next action for the agent.",
    "follow_up": "Suggested follow-up timing (e.g. 'Check in within 3 days')."
  }
}`;

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            move_story:  { type: "string" },
            risk_level:  { type: "string" },
            risk_reason: { type: "string" },
            star_tasks:  { type: "array", items: { type: "string" } },
            coaching: {
              type: "object",
              properties: {
                talking_points: { type: "array", items: { type: "string" } },
                sensitivity:    { type: "string" },
                next_action:    { type: "string" },
                follow_up:      { type: "string" },
              }
            }
          }
        }
      });
      setInsights(result);
      setGenerated(true);
    } finally {
      setLoading(false);
    }
  };

  const risk = insights ? (RISK_COLORS[insights.risk_level] || RISK_COLORS.Low) : null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end md:items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-black text-slate-800 text-sm">AI Client Insights</p>
              <p className="text-slate-400 text-[10px]">{client.user_name}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {!generated && !loading && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-purple-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-purple-500" />
              </div>
              <p className="font-bold text-slate-800 mb-1">Generate AI Insights</p>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                Analyze {client.user_name?.split(" ")[0] || "this client"}'s move and generate a story summary, risk assessment, star tasks, and coaching card.
              </p>
              <button onClick={generate}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-br from-purple-600 to-purple-700 text-white font-bold text-sm hover:from-purple-500 hover:to-purple-600 transition-all shadow-lg shadow-purple-200">
                ✨ Generate Insights
              </button>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
              <p className="text-slate-500 text-sm font-semibold">Analyzing move data…</p>
            </div>
          )}

          {generated && insights && (
            <div className="space-y-3">
              {/* Move Story */}
              <Section icon={BookOpen} color="bg-blue-500" title="Move Story">
                <p className="text-slate-600 text-sm leading-relaxed">{insights.move_story}</p>
              </Section>

              {/* Risk Radar */}
              <Section icon={AlertTriangle} color="bg-amber-500" title="Risk Radar">
                <div className={`flex items-start gap-3 p-3 rounded-xl border ${risk.bg} ${risk.border}`}>
                  <div className={`w-2.5 h-2.5 rounded-full ${risk.dot} flex-shrink-0 mt-1`} />
                  <div>
                    <p className={`text-sm font-black ${risk.text} mb-0.5`}>{insights.risk_level} Risk</p>
                    <p className={`text-xs leading-relaxed ${risk.text} opacity-80`}>{insights.risk_reason}</p>
                  </div>
                </div>
              </Section>

              {/* Star Tasks */}
              <Section icon={Star} color="bg-orange-500" title="⭐ Do These First">
                <div className="space-y-2">
                  {(insights.star_tasks || []).map((task, i) => (
                    <div key={i} className="flex items-start gap-2.5 p-2.5 bg-orange-50 border border-orange-100 rounded-xl">
                      <Star className="w-3.5 h-3.5 text-orange-400 flex-shrink-0 mt-0.5" />
                      <p className="text-slate-700 text-sm">{task}</p>
                    </div>
                  ))}
                </div>
              </Section>

              {/* Agent Coaching Card */}
              <Section icon={Sparkles} color="bg-purple-500" title="Agent Coaching Card" defaultOpen={false}>
                {insights.coaching && (
                  <div className="space-y-3">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Key Talking Points</p>
                      <div className="space-y-1.5">
                        {(insights.coaching.talking_points || []).map((pt, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-400 flex-shrink-0 mt-1.5" />
                            <p className="text-slate-600 text-sm">{pt}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
                      <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1">Sensitivity Note</p>
                      <p className="text-slate-600 text-sm">{insights.coaching.sensitivity}</p>
                    </div>
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3">
                      <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Recommended Next Action</p>
                      <p className="text-slate-700 text-sm font-semibold">{insights.coaching.next_action}</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold">
                      🕐 {insights.coaching.follow_up}
                    </div>
                  </div>
                )}
              </Section>

              {/* Regenerate */}
              <button onClick={generate} disabled={loading}
                className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-400 text-xs font-semibold hover:bg-slate-50 transition-colors">
                ↻ Regenerate Insights
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}