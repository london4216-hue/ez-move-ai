import { useState } from "react";
import { Sparkles, ChevronDown, ChevronUp, FileText } from "lucide-react";
import { base44 } from "@/api/base44Client";

const FEATURES = [
  {
    id: "quote",
    emoji: "📋",
    icon: FileText,
    title: "Instant Mover Quote",
    tagline: "Turn your inventory into a pro quote request",
    color: "blue",
    description: "Based on your My Stuff inventory, AI drafts a detailed quote request listing every item with size — ready to send to 3 local movers in one tap.",
  },
];

const COLOR_MAP = {
  blue:   { bg: "bg-blue-50",   border: "border-blue-200",   icon: "bg-blue-100 text-blue-600",   btn: "bg-blue-500" },
};

function QuoteGenerator({ user }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const generate = async () => {
    setLoading(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a moving coordinator. Generate a professional moving quote request email for a homeowner named ${user?.full_name || "the homeowner"} located at ${user?.home_address || "their home"}. Their estimated move date is around ${user?.estimated_close_date || "soon"}. Write a concise, professional 150-word quote request a mover would love to receive. Include placeholders like [TRUCK SIZE NEEDED] and [NUMBER OF LARGE ITEMS] where the homeowner should fill in their inventory details. Make it friendly and professional.`,
      });
      setResult(res);
    } catch(e) {
      setResult("Could not generate. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="mt-3 space-y-2">
      {!result && (
        <button
          onClick={generate}
          disabled={loading}
          className="w-full py-3 rounded-xl bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-60"
        >
          {loading ? (
            <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Generating...</>
          ) : (
            <><Sparkles className="w-4 h-4" /> Generate Quote Request</>
          )}
        </button>
      )}
      {result && (
        <div className="bg-white rounded-xl border border-blue-200 p-3">
          <p className="text-[11px] text-slate-700 leading-relaxed whitespace-pre-wrap">{result}</p>
          <button onClick={() => setResult(null)} className="mt-2 text-[10px] text-blue-500 font-bold">Regenerate</button>
        </div>
      )}
    </div>
  );
}

function FeatureCard({ feature, user }) {
  const [open, setOpen] = useState(false);
  const c = COLOR_MAP[feature.color];
  const Icon = feature.icon;

  return (
    <div className={`rounded-2xl border ${c.bg} ${c.border} overflow-hidden`}>
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full px-4 py-3.5 flex items-center gap-3 text-left"
      >
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${c.icon}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
           <p className="text-xs font-black text-slate-800">{feature.emoji} {feature.title}</p>
           <p className="text-[10px] text-slate-500">{feature.tagline}</p>
         </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
      </button>

      {open && (
        <div className="px-4 pb-4">
          <p className="text-[11px] text-slate-600 leading-relaxed mb-3">{feature.description}</p>
          {feature.id === "quote" && <QuoteGenerator user={user} />}
        </div>
      )}
    </div>
  );
}

export default function AIMoveAssist({ user }) {
  return (
    <div className="space-y-3">
      {/* Hero */}
      <div className="bg-gradient-to-br from-violet-600 to-blue-600 rounded-2xl px-4 py-5 text-white">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-violet-200" />
          <p className="font-black text-base">AI Move Assist</p>
        </div>
        <p className="text-violet-100 text-xs leading-relaxed">
          Smart tools that go beyond your checklist — estimate, plan, and optimize your move with AI. None of this is date-driven; use it whenever it's helpful.
        </p>
      </div>

      {/* Feature cards */}
      {FEATURES.map(f => (
        <FeatureCard key={f.id} feature={f} user={user} />
      ))}
    </div>
  );
}