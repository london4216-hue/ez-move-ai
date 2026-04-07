import { useState } from "react";
import { CreditCard, CheckCircle2, AlertCircle, Loader2, ChevronRight, RotateCcw } from "lucide-react";
import { base44 } from "@/api/base44Client";

const PLANS = [
  { id: "agent_monthly",  label: "Agent Plan",  price: "$49/mo",  features: ["Up to 10 active clients", "SMS notifications", "AI move tools", "Email support"] },
  { id: "broker_monthly", label: "Broker Plan", price: "$149/mo", features: ["Unlimited clients", "Team SMS", "White-label branding", "Priority support", "Analytics dashboard"] },
  { id: "broker_annual",  label: "Broker Annual", price: "$1,499/yr", features: ["Everything in Broker", "2 months free", "Dedicated account manager", "Custom onboarding"] },
];

const STATUS_STYLES = {
  active:    "bg-emerald-50 text-emerald-600 border-emerald-100",
  past_due:  "bg-red-50 text-red-600 border-red-100",
  cancelled: "bg-slate-50 text-slate-500 border-slate-100",
  trialing:  "bg-blue-50 text-blue-600 border-blue-100",
};

export default function BillingTab({ agent }) {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const subStatus = agent?.subscription_status || "active";
  const currentPlan = agent?.subscription_plan;
  const renewalDate = agent?.subscription_renewal_date;

  const handleSubscribe = async (planId) => {
    if (!agent?.id) return;
    setLoading(true);
    setMessage(null);
    try {
      const res = await base44.functions.invoke("createStripeSubscription", {
        agent_id: agent.id,
        plan: planId,
      });
      if (res.data?.success) {
        setMessage({ type: "success", text: `Subscribed to ${planId.replace("_", " ")}! Status: ${res.data.status}` });
      } else {
        setMessage({ type: "error", text: res.data?.error || "Subscription failed" });
      }
    } catch (e) {
      setMessage({ type: "error", text: e.message });
    }
    setLoading(false);
    setSelectedPlan(null);
  };

  return (
    <div className="space-y-5">
      {/* Current status */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <h3 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-purple-500" /> Current Subscription
        </h3>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-lg font-black text-slate-800">{currentPlan ? currentPlan.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()) : "No active plan"}</p>
            {renewalDate && (
              <p className="text-xs text-slate-400 mt-0.5">Renews {renewalDate}</p>
            )}
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${STATUS_STYLES[subStatus] || STATUS_STYLES.active}`}>
            {subStatus}
          </span>
        </div>
        {subStatus === "past_due" && (
          <div className="mt-3 flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl p-3 text-xs text-red-600 font-semibold">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            Payment failed. Please update your payment method to restore access.
          </div>
        )}
      </div>

      {/* Plans */}
      <div>
        <h3 className="font-bold text-slate-700 text-sm mb-3">Change Plan</h3>
        <div className="space-y-3">
          {PLANS.map(plan => {
            const isCurrent = currentPlan === plan.id;
            return (
              <div
                key={plan.id}
                className={`bg-white rounded-2xl border-2 p-4 transition-all ${isCurrent ? "border-purple-400 bg-purple-50" : "border-slate-100 hover:border-purple-200"}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-slate-800 text-sm">{plan.label}</p>
                      {isCurrent && <span className="text-[10px] font-bold text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">Current</span>}
                    </div>
                    <p className="text-lg font-black text-purple-600 mb-2">{plan.price}</p>
                    <ul className="space-y-0.5">
                      {plan.features.map(f => (
                        <li key={f} className="text-xs text-slate-500 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500 flex-shrink-0" /> {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {!isCurrent && (
                    <button
                      onClick={() => setSelectedPlan(plan.id)}
                      className="flex-shrink-0 flex items-center gap-1 text-xs font-bold text-purple-600 bg-purple-50 border border-purple-200 px-3 py-2 rounded-xl hover:bg-purple-100 transition-colors"
                    >
                      Select <ChevronRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Result message */}
      {message && (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold ${message.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-700 border border-red-100"}`}>
          {message.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {message.text}
        </div>
      )}

      <p className="text-[10px] text-slate-400 text-center">Payments processed securely by Stripe. Contact support to cancel.</p>

      {/* Confirm modal */}
      {selectedPlan && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-6 space-y-4">
            <h3 className="font-bold text-slate-800">Confirm Plan Change</h3>
            <p className="text-sm text-slate-500">
              Switch to <strong>{selectedPlan.replace(/_/g, " ")}</strong>?
              {currentPlan && ` You'll be charged on your next billing cycle.`}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setSelectedPlan(null)} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm">Cancel</button>
              <button
                onClick={() => handleSubscribe(selectedPlan)}
                disabled={loading}
                className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm disabled:opacity-40 flex items-center justify-center gap-2 transition-colors"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}