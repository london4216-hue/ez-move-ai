import { useState } from "react";
import { Sparkles, ChevronDown, ChevronUp, FileText, Package, Clock, MapPin, DollarSign, FileCheck, Truck } from "lucide-react";
import { base44 } from "@/api/base44Client";

const FEATURES = [
  {
    id: "neighborhood",
    emoji: "🏘️",
    icon: MapPin,
    title: "New Neighborhood Research",
    tagline: "Learn about your new area",
    color: "violet",
    description: "Tell AI your new address and it researches schools, parks, hospitals, grocery stores, transit, utilities, and local services in your new neighborhood.",
  },
  {
    id: "delivery",
    emoji: "🚚",
    icon: Truck,
    title: "Best Delivery Options",
    tagline: "Compare moving & shipping services",
    color: "sky",
    description: "AI compares the best delivery and moving options for your move, including rates, reviews, timing, and coverage areas.",
  },
  {
    id: "quote",
    emoji: "📋",
    icon: FileText,
    title: "Instant Mover Quote",
    tagline: "Professional quote request from your inventory",
    color: "blue",
    description: "Based on your My Stuff inventory, AI drafts a detailed quote request listing every item with size — ready to send to 3 local movers in one tap.",
  },
  {
    id: "supplies",
    emoji: "📦",
    icon: Package,
    title: "Packing Supplies Calculator",
    tagline: "Exactly what you need, nothing wasted",
    color: "amber",
    description: "AI calculates exact quantities of boxes (small/medium/large), tape, bubble wrap, and packing paper based on your room-by-room inventory and item sizes.",
  },
  {
    id: "timeline",
    emoji: "🗓️",
    icon: Clock,
    title: "Packing Timeline",
    tagline: "When to start, what to pack when",
    color: "orange",
    description: "AI creates a week-by-week packing schedule leading up to your closing date, prioritizing items you won't need versus everyday essentials.",
  },
  {
    id: "documents",
    emoji: "📄",
    icon: FileCheck,
    title: "Moving Documents Checklist",
    tagline: "Don't forget the paperwork",
    color: "emerald",
    description: "AI generates a comprehensive checklist of all documents you should gather before closing: mortgage papers, utility records, insurance docs, ID confirmations, and more.",
  },
  {
    id: "budget",
    emoji: "💰",
    icon: DollarSign,
    title: "Moving Cost Estimator",
    tagline: "Budget for the big day",
    color: "red",
    description: "AI estimates your total moving costs based on distance, truck size, supplies, and typical service fees — helps you plan financially and spot overpricing.",
  },
];

const COLOR_MAP = {
  blue:    { bg: "bg-blue-50",    border: "border-blue-200",   icon: "bg-blue-100 text-blue-600",    btn: "bg-blue-500" },
  amber:   { bg: "bg-amber-50",   border: "border-amber-200",  icon: "bg-amber-100 text-amber-600",   btn: "bg-amber-500" },
  orange:  { bg: "bg-orange-50",  border: "border-orange-200", icon: "bg-orange-100 text-orange-600",  btn: "bg-orange-500" },
  emerald: { bg: "bg-emerald-50", border: "border-emerald-200",icon: "bg-emerald-100 text-emerald-600",btn: "bg-emerald-500" },
  violet:  { bg: "bg-violet-50",  border: "border-violet-200", icon: "bg-violet-100 text-violet-600",  btn: "bg-violet-500" },
  red:     { bg: "bg-red-50",     border: "border-red-200",    icon: "bg-red-100 text-red-600",      btn: "bg-red-500" },
};

function AIGenerator({ feature, user }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const prompts = {
    quote: `You are a moving coordinator. Generate a professional moving quote request email for a homeowner named ${user?.full_name || "the homeowner"} located at ${user?.home_address || "their home"}. Their estimated move date is around ${user?.estimated_close_date || "soon"}. Write a concise, professional 150-word quote request a mover would love to receive. Make it friendly and professional.`,
    supplies: `You are a packing expert. Based on a typical home move with multiple rooms, estimate the exact quantities needed: small boxes, medium boxes, large boxes, packing tape rolls, bubble wrap (feet), and packing paper (sheets). Return as a simple checklist. Assume average US home with living room, kitchen, 2-3 bedrooms, bathrooms.`,
    timeline: `You are a moving coordinator. Create a 4-week packing timeline for someone with a closing date of ${user?.estimated_close_date || "in 4 weeks"}. Break down what to pack each week, starting with seasonal items and off-season, then progressing to everyday items the week before. Format as a week-by-week guide.`,
    documents: `You are a real estate attorney. Generate a comprehensive checklist of all important documents a homeowner should gather before closing on a home sale. Include: mortgage documents, property records, utility account numbers, insurance policies, ID verification, deed, title insurance, appraisals, inspection reports, HOA documents (if applicable), and more. Format as a simple checklist.`,
    neighborhood: `Research the neighborhood of ${user?.home_address || "this location"}. Provide helpful information about: schools in the area, parks and recreation, hospitals and medical facilities, grocery stores and shopping, public transportation, utility providers, average utility costs, and local community features. Keep it concise and practical.`,
    budget: `Estimate the total moving costs for a move from current location to ${user?.home_address || "their new home"} with closing date of ${user?.estimated_close_date || "soon"}. Include: professional movers (average ~$3,000-6,000 depending on distance), packing supplies (~$200-400), equipment rental if needed (~$300), utility setup/disconnection (~$100), and miscellaneous (~$200). Provide a realistic range.`,
  };

  const generate = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: prompts[feature.id],
        add_context_from_internet: feature.id === "neighborhood",
      });
      setResult(res || "No response received. Please try again.");
    } catch(e) {
      console.error("AI generation error:", e);
      setResult(`Error: ${e.message || "Failed to generate. Try again."}`);
    }
    setLoading(false);
  };

  const buttonColor = {
    quote: "bg-blue-500", supplies: "bg-amber-500", timeline: "bg-orange-500",
    documents: "bg-emerald-500", neighborhood: "bg-violet-500", budget: "bg-red-500"
  }[feature.id];

  return (
    <div className="mt-3 space-y-2">
      {!result && (
        <button
          onClick={generate}
          disabled={loading}
          className={`w-full py-3 rounded-xl ${buttonColor} text-white text-xs font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-60`}
        >
          {loading ? (
            <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Generating...</>
          ) : (
            <><Sparkles className="w-4 h-4" /> Generate</>
          )}
        </button>
      )}
      {result && (
        <div className="bg-white rounded-xl border border-slate-200 p-3">
          <p className="text-[11px] text-slate-700 leading-relaxed whitespace-pre-wrap">{result}</p>
          <button onClick={() => setResult(null)} className="mt-2 text-[10px] text-slate-500 font-bold">Clear</button>
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
          <AIGenerator feature={feature} user={user} />
        </div>
      )}
    </div>
  );
}

export default function AIMoveAssist({ user }) {
  return (
    <div className="space-y-3">
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl px-4 py-5 text-white">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-blue-100" />
          <p className="font-black text-base">AI Move Utilities</p>
        </div>
        <p className="text-blue-100 text-xs leading-relaxed">
          6 AI tools to plan, budget, pack, and organize every detail of your move. Everything runs on real data from your profile.
        </p>
      </div>

      {/* Feature cards */}
      {FEATURES.map(f => (
        <FeatureCard key={f.id} feature={f} user={user} />
      ))}
    </div>
  );
}