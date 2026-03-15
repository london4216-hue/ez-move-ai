import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { ChevronRight, ChevronLeft, Check, Users, CalendarDays, Bot, DollarSign, Send, Star } from "lucide-react";

const FEATURES = [
  {
    icon: "👥",
    title: "Client Management",
    desc: "Invite clients with a 4-digit code. Track every client's move status, close date, and progress — all in one place.",
    color: "from-orange-500 to-orange-600",
  },
  {
    icon: "📅",
    title: "Smart Move Timeline",
    desc: "Each client gets a personalized 4-week plan auto-built from their close date. Tasks appear exactly when they need to.",
    color: "from-blue-500 to-blue-600",
  },
  {
    icon: "🤖",
    title: "AI Move Assistant",
    desc: "Your clients get AI-powered tools: find movers, junk removal, estate sales, packing cost estimators, and more.",
    color: "from-purple-500 to-purple-600",
  },
  {
    icon: "📦",
    title: "Inventory & Checklist",
    desc: "Clients walk through every room, sort items into move/donate/junk piles, and get a full logistics estimate instantly.",
    color: "from-emerald-500 to-emerald-600",
  },
  {
    icon: "💳",
    title: "Simple Billing",
    desc: "One flat fee of $40 per client. No subscriptions, no hidden fees. Pay only when you activate a client.",
    color: "from-amber-500 to-amber-600",
  },
  {
    icon: "🎁",
    title: "Refer & Earn",
    desc: "Refer other agents and earn rewards. Share your referral code from your dashboard anytime.",
    color: "from-rose-500 to-rose-600",
  },
];

export default function AgentOnboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState("loading"); // loading | register | tutorial
  const [tutorialIdx, setTutorialIdx] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // On mount: check if already onboarded
  useState(() => {
    base44.auth.me().then(user => {
      if (user?.agent_onboarded) {
        navigate("/AgentDashboard");
      } else {
        setStep("register");
      }
    }).catch(() => setStep("register"));
  });

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    brokerage: "",
    phone: "",
    referredBy: "",
  });

  const canContinue = form.firstName.trim() && form.lastName.trim() && form.brokerage.trim();

  const handleRegister = async () => {
    if (!canContinue) return;
    setSaving(true);
    setError("");
    try {
      const user = await base44.auth.me();
      // Save agent profile
      let agents = await base44.entities.Agent.filter({ created_by: user.email });
      const agentData = {
        company_name: form.brokerage.trim(),
        phone: form.phone.trim(),
      };
      if (agents.length === 0) {
        await base44.entities.Agent.create(agentData);
      } else {
        await base44.entities.Agent.update(agents[0].id, agentData);
      }
      // Save name + referral on user profile
      await base44.auth.updateMe({
        full_name: `${form.firstName.trim()} ${form.lastName.trim()}`,
        referred_by: form.referredBy.trim() || null,
        agent_onboarded: true,
      });
      setStep("tutorial");
    } catch (e) {
      setError("Something went wrong. Please try again.");
    }
    setSaving(false);
  };

  const handleTutorialNext = () => {
    if (tutorialIdx < FEATURES.length - 1) {
      setTutorialIdx(i => i + 1);
    } else {
      navigate("/AgentDashboard");
    }
  };

  const feature = FEATURES[tutorialIdx];

  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center p-5">
      {/* Logo */}
      <div className="flex items-center gap-2.5 mb-8">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-900/50">
          <span className="text-white text-sm font-black">EZ</span>
        </div>
        <span className="text-white font-bold text-lg tracking-tight">
          EZ Move <span className="text-orange-500">AI</span>
        </span>
      </div>

      {/* REGISTRATION STEP */}
      {step === "register" && (
        <div className="w-full max-w-sm bg-[#1E293B] rounded-3xl p-7 shadow-2xl border border-slate-700/50">
          <h1 className="text-2xl font-black text-white mb-1">Join as an Agent</h1>
          <p className="text-slate-400 text-sm mb-6">Set up your profile in seconds.</p>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-1.5">First Name *</label>
                <input
                  type="text"
                  value={form.firstName}
                  onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))}
                  placeholder="Jane"
                  className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-600 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-1.5">Last Name *</label>
                <input
                  type="text"
                  value={form.lastName}
                  onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))}
                  placeholder="Smith"
                  className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-600 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-1.5">Brokerage Firm *</label>
              <input
                type="text"
                value={form.brokerage}
                onChange={e => setForm(p => ({ ...p, brokerage: e.target.value }))}
                placeholder="e.g. Keller Williams, Coldwell Banker"
                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-600 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-1.5">Phone (optional)</label>
              <input
                type="tel"
                value={form.phone}
                onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                placeholder="(555) 000-0000"
                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-600 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-1.5">Referred by (optional)</label>
              <input
                type="text"
                value={form.referredBy}
                onChange={e => setForm(p => ({ ...p, referredBy: e.target.value }))}
                placeholder="Agent name or code"
                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-600 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-orange-500"
              />
            </div>

            {error && (
              <div className="bg-red-900/30 border border-red-700 rounded-xl p-3">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <button
              onClick={handleRegister}
              disabled={!canContinue || saving}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-sm disabled:opacity-40 flex items-center justify-center gap-2 shadow-lg shadow-orange-900/30 mt-2"
            >
              {saving ? (
                <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Saving...</>
              ) : (
                <>Continue <ChevronRight className="w-4 h-4" /></>
              )}
            </button>
          </div>
        </div>
      )}

      {/* TUTORIAL STEP */}
      {step === "tutorial" && (
        <div className="w-full max-w-sm">
          {/* Progress dots */}
          <div className="flex justify-center gap-1.5 mb-6">
            {FEATURES.map((_, i) => (
              <div
                key={i}
                className={`rounded-full transition-all duration-300 ${
                  i === tutorialIdx ? "w-6 h-2 bg-orange-500" : i < tutorialIdx ? "w-2 h-2 bg-orange-500/50" : "w-2 h-2 bg-slate-700"
                }`}
              />
            ))}
          </div>

          <div className="bg-[#1E293B] rounded-3xl p-7 shadow-2xl border border-slate-700/50 text-center">
            <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${feature.color} flex items-center justify-center mx-auto mb-5 shadow-lg`}>
              <span className="text-4xl">{feature.icon}</span>
            </div>

            <h2 className="text-xl font-black text-white mb-3">{feature.title}</h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-8">{feature.desc}</p>

            <div className="flex gap-3">
              {tutorialIdx > 0 && (
                <button
                  onClick={() => setTutorialIdx(i => i - 1)}
                  className="w-12 h-12 rounded-2xl bg-slate-700 flex items-center justify-center flex-shrink-0"
                >
                  <ChevronLeft className="w-5 h-5 text-slate-300" />
                </button>
              )}
              <button
                onClick={handleTutorialNext}
                className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-900/30"
              >
                {tutorialIdx < FEATURES.length - 1 ? (
                  <>Next <ChevronRight className="w-4 h-4" /></>
                ) : (
                  <>Go to Dashboard <ChevronRight className="w-4 h-4" /></>
                )}
              </button>
            </div>

            {tutorialIdx < FEATURES.length - 1 && (
              <button
                onClick={() => navigate("/AgentDashboard")}
                className="mt-4 text-xs text-slate-500 hover:text-slate-400 transition-colors"
              >
                Skip tutorial
              </button>
            )}
          </div>

          <p className="text-center text-slate-600 text-xs mt-4">
            {tutorialIdx + 1} of {FEATURES.length} features
          </p>
        </div>
      )}
    </div>
  );
}