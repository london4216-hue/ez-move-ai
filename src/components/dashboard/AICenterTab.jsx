import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Phone, Star, MapPin, CalendarDays, Sparkles, DollarSign, X, CheckCircle2, Trash2, Users } from "lucide-react";
import { format, addDays } from "date-fns";

const SERVICES = [
  { id: "movers", label: "Movers", emoji: "🚛", color: "bg-blue-50 border-blue-100", taskTitle: "Moving Day - Movers Scheduled" },
  { id: "cleaners", label: "Cleaners", emoji: "✨", color: "bg-purple-50 border-purple-100", taskTitle: "Deep Cleaning Appointment" },
  { id: "painters", label: "Painters", emoji: "🎨", color: "bg-pink-50 border-pink-100", taskTitle: "Painting Work Scheduled" },
  { id: "junk", label: "Junk Removal", emoji: "🗑️", color: "bg-red-50 border-red-100", taskTitle: "Junk Removal Scheduled" },
  { id: "estate", label: "Estate Sale", emoji: "🏷️", color: "bg-amber-50 border-amber-100", taskTitle: "Estate Sale Scheduled" },
  { id: "donation", label: "Donation", emoji: "🫶", color: "bg-green-50 border-green-100", taskTitle: "Donation Pickup Scheduled" },
];

const SERVICE_QUERIES = {
  movers: (a) => `top rated local moving companies near ${a}. Include 4 real businesses with ratings and pricing.`,
  cleaners: (a) => `top rated move-out cleaning services near ${a}. Include 4 real businesses with ratings and pricing.`,
  painters: (a) => `top rated interior painting contractors near ${a}. Include 4 real businesses with ratings and pricing.`,
  junk: (a) => `top rated junk removal same day service near ${a}. Include 4 real businesses with ratings and pricing.`,
  estate: (a) => `estate sale companies and professionals near ${a}. Include 4 real businesses.`,
  donation: (a) => `furniture and household donation pickup services near ${a}. Include 4 real nonprofits or services.`,
};

export default function AICenterTab({ user, onProviderSaved, onNavigateToTab }) {
  const [activeService, setActiveService] = useState(null);
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(null);
  const [quoteData, setQuoteData] = useState(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [savedProviders, setSavedProviders] = useState([]);
  const [schedulingId, setSchedulingId] = useState(null);
  const [successModal, setSuccessModal] = useState(null); // { providerName, serviceName }
  const [activeTab, setActiveTab] = useState("find"); // "find" | "team" | "estimate"

  const address = user?.home_address || "my area";

  useEffect(() => {
    if (!user) return;
    base44.entities.SavedProvider.filter({ user_id: user.id }).then(setSavedProviders).catch(() => {});
  }, [user]);

  const fetchService = async (service) => {
    setActiveService(service.id);
    setActiveTab("find");
    if (results[service.id]) return;
    setLoading(service.id);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Find ${SERVICE_QUERIES[service.id](address)}. Be specific with real-sounding business names, realistic phone numbers in format (XXX) XXX-XXXX, 1-2 sentence description, price range, and rating out of 5.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          providers: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                description: { type: "string" },
                price_range: { type: "string" },
                rating: { type: "string" },
                phone: { type: "string" }
              }
            }
          }
        }
      }
    });
    setResults(prev => ({ ...prev, [service.id]: res?.providers || [] }));
    setLoading(null);
  };

  const selectProvider = async (provider) => {
    if (!user) return;
    const serviceData = SERVICES.find(s => s.id === activeService);
    setSchedulingId(provider.name);

    // 1. Save to SavedProviders (My Team)
    const existing = savedProviders.find(p => p.name === provider.name);
    let savedProvider = existing;
    if (!existing) {
      savedProvider = await base44.entities.SavedProvider.create({
        user_id: user.id,
        name: provider.name,
        role: serviceData?.label || activeService,
        phone: provider.phone || "",
        rating: provider.rating || "",
      });
      setSavedProviders(prev => [...prev, savedProvider]);
    }

    // 2. Create calendar appointment (1 week from today)
    const apptDate = format(addDays(new Date(), 7), "yyyy-MM-dd");
    await base44.entities.Appointment.create({
      user_id: user.id,
      title: serviceData?.taskTitle || `${serviceData?.label} - ${provider.name}`,
      provider_name: provider.name,
      phone: provider.phone || "",
      date: apptDate,
      status: "tentative",
      notes: `${provider.description || ""} ${provider.price_range ? `| Est: ${provider.price_range}` : ""}`.trim(),
    });

    setSchedulingId(null);
    setSuccessModal({ providerName: provider.name, serviceName: serviceData?.label });
    if (onProviderSaved) onProviderSaved();
  };

  const removeProvider = async (id) => {
    await base44.entities.SavedProvider.delete(id);
    setSavedProviders(prev => prev.filter(p => p.id !== id));
  };

  const getMovingQuote = async () => {
    setQuoteLoading(true);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate realistic moving cost estimates for ${address}. Provide estimates by home size for both local (under 50 miles) and long distance moves. Include 2-3 money-saving tips.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          estimates: {
            type: "array",
            items: {
              type: "object",
              properties: {
                home_size: { type: "string" },
                local_cost: { type: "string" },
                long_distance_cost: { type: "string" }
              }
            }
          },
          tips: { type: "array", items: { type: "string" } }
        }
      }
    });
    setQuoteData(res);
    setQuoteLoading(false);
  };

  const isAlreadySaved = (providerName) => savedProviders.some(p => p.name === providerName);
  const activeServiceData = SERVICES.find(s => s.id === activeService);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl p-5 text-white">
        <div className="flex items-center gap-2 mb-1.5">
          <Sparkles className="w-4 h-4 text-white/80" />
          <p className="text-sm font-bold">AI Move Center</p>
        </div>
        <p className="text-white/80 text-xs leading-relaxed">
          Find services → save to your team → auto-added to your calendar & plan.
        </p>
        {user?.home_address && (
          <div className="flex items-center gap-1.5 mt-3 bg-white/20 rounded-xl px-3 py-2">
            <MapPin className="w-3 h-3 text-white/80 flex-shrink-0" />
            <p className="text-white/90 text-[11px] truncate">{user.home_address}</p>
          </div>
        )}
      </div>

      {/* Sub-tabs */}
      <div className="bg-white rounded-2xl border border-slate-100 p-1.5 flex gap-1">
        {[
          { id: "find", label: "Find Services" },
          { id: "team", label: `Booked (${savedProviders.length})` },
          { id: "estimate", label: "Cost Estimate" },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all
              ${activeTab === tab.id ? "bg-orange-500 text-white shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* FIND SERVICES TAB */}
      {activeTab === "find" && (
        <>
          {/* Service Grid */}
          <div className="grid grid-cols-3 gap-2.5">
            {SERVICES.map(service => (
              <button
                key={service.id}
                onClick={() => fetchService(service)}
                className={`rounded-2xl p-3.5 text-left border transition-all active:scale-95
                  ${activeService === service.id
                    ? "bg-orange-500 border-orange-400 shadow-lg shadow-orange-200"
                    : service.color}`}
              >
                <span className="text-2xl block mb-2">{service.emoji}</span>
                <p className={`text-[11px] font-bold leading-tight ${activeService === service.id ? "text-white" : "text-slate-700"}`}>
                  {service.label}
                </p>
                {savedProviders.some(p => p.role === service.label) && (
                  <div className="mt-1">
                    <span className={`text-[9px] font-bold ${activeService === service.id ? "text-white/80" : "text-green-600"}`}>✓ Saved</span>
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Provider Results */}
          {activeService && (
            <section>
              <div className="flex items-center justify-between mb-2.5">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  {activeServiceData?.emoji} {activeServiceData?.label} Near You
                </p>
                <button onClick={() => setActiveService(null)}>
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              {loading === activeService ? (
                <div className="bg-white rounded-3xl p-10 flex flex-col items-center gap-3 border border-slate-100">
                  <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
                  </div>
                  <p className="text-xs text-slate-500 font-semibold text-center">
                    Finding the best {activeServiceData?.label.toLowerCase()} near you...
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {(results[activeService] || []).map((provider, i) => {
                    const saved = isAlreadySaved(provider.name);
                    return (
                      <div key={i} className={`bg-white rounded-3xl p-4 border transition-all ${saved ? "border-green-200 bg-green-50" : "border-slate-100"}`}>
                        <div className="flex items-start justify-between mb-1.5">
                          <p className="text-sm font-bold text-slate-800 flex-1 pr-2">{provider.name}</p>
                          <div className="flex items-center gap-2">
                            {saved && <span className="text-[10px] font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">✓ Saved</span>}
                            {provider.rating && (
                              <div className="flex items-center gap-1 bg-amber-50 rounded-lg px-2 py-0.5">
                                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                <span className="text-xs font-bold text-amber-700">{provider.rating}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-slate-500 mb-2 leading-relaxed">{provider.description}</p>
                        {provider.price_range && (
                          <p className="text-xs font-bold text-orange-500 mb-3">{provider.price_range}</p>
                        )}
                        <div className="flex gap-2">
                          {provider.phone && (
                            <a
                              href={`tel:${provider.phone}`}
                              className="flex-1 flex items-center justify-center gap-1.5 bg-slate-100 rounded-xl py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
                            >
                              <Phone className="w-3.5 h-3.5" /> Call
                            </a>
                          )}
                          <button
                            onClick={() => !saved && selectProvider(provider)}
                            disabled={saved || schedulingId === provider.name}
                            className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold transition-all active:scale-95
                              ${saved
                                ? "bg-green-100 text-green-700 cursor-default"
                                : "bg-orange-500 text-white hover:bg-orange-600"}`}
                          >
                            {schedulingId === provider.name ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : saved ? (
                              <><CheckCircle2 className="w-3.5 h-3.5" /> Added</>
                            ) : (
                              <><CalendarDays className="w-3.5 h-3.5" /> Select & Schedule</>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}
        </>
      )}

      {/* MY TEAM TAB */}
      {activeTab === "team" && (
        <section>
          {savedProviders.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-100">
              <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-700 mb-1">No providers saved yet</p>
              <p className="text-xs text-slate-400 mb-4">Go to Find Services and tap "Select & Schedule" to add providers to your team</p>
              <button onClick={() => setActiveTab("find")} className="text-orange-500 font-bold text-sm">Browse Services →</button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 font-semibold">
                {savedProviders.length} provider{savedProviders.length !== 1 ? "s" : ""} saved · all added to your calendar
              </p>
              {savedProviders.map((p) => (
                <div key={p.id} className="bg-white rounded-2xl p-4 border border-slate-100 flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-orange-100 flex items-center justify-center text-lg flex-shrink-0">
                    {SERVICES.find(s => s.label === p.role)?.emoji || "📋"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{p.name}</p>
                    <p className="text-xs text-orange-500 font-semibold">{p.role}</p>
                    {p.phone && (
                      <a href={`tel:${p.phone}`} className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-orange-500 mt-0.5">
                        <Phone className="w-3 h-3" />{p.phone}
                      </a>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {p.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span className="text-xs font-bold text-amber-700">{p.rating}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1 bg-green-100 rounded-lg px-2 py-0.5">
                      <CalendarDays className="w-3 h-3 text-green-600" />
                      <span className="text-[10px] font-bold text-green-700">In calendar</span>
                    </div>
                    <button onClick={() => removeProvider(p.id)} className="p-1">
                      <Trash2 className="w-3.5 h-3.5 text-slate-300 hover:text-red-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* COST ESTIMATE TAB */}
      {activeTab === "estimate" && (
        <section>
          {!quoteData && !quoteLoading && (
            <button
              onClick={getMovingQuote}
              className="w-full bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-3xl p-5 flex items-center justify-between shadow-md active:scale-[0.98] transition-all"
            >
              <div>
                <p className="text-sm font-bold">Get AI Moving Quote</p>
                <p className="text-xs text-slate-300 mt-0.5">Instant estimate based on your area</p>
              </div>
              <div className="w-9 h-9 rounded-2xl bg-orange-500 flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-white" />
              </div>
            </button>
          )}
          {quoteLoading && (
            <div className="bg-white rounded-3xl p-8 flex flex-col items-center gap-3 border border-slate-100">
              <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
              <p className="text-xs text-slate-500 font-semibold">Calculating your estimate...</p>
            </div>
          )}
          {quoteData && !quoteLoading && (
            <div className="bg-white rounded-3xl p-4 border border-slate-100">
              <p className="text-sm font-bold text-slate-800 mb-3">Your Moving Estimate</p>
              {quoteData?.estimates?.map((est, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
                  <p className="text-xs font-semibold text-slate-700">{est.home_size}</p>
                  <div className="text-right">
                    <p className="text-xs font-bold text-orange-500">Local: {est.local_cost}</p>
                    <p className="text-[10px] text-slate-400">Long dist: {est.long_distance_cost}</p>
                  </div>
                </div>
              ))}
              {quoteData?.tips?.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-50">
                  <p className="text-xs font-bold text-slate-700 mb-2">💡 Money-Saving Tips</p>
                  {quoteData.tips.map((tip, i) => (
                    <p key={i} className="text-[11px] text-slate-500 mb-1.5 leading-relaxed">• {tip}</p>
                  ))}
                </div>
              )}
              <button onClick={() => setQuoteData(null)} className="w-full mt-3 text-xs text-slate-400 font-semibold py-2 hover:text-slate-600">
                Refresh Quote
              </button>
            </div>
          )}
        </section>
      )}

      {/* Success Modal */}
      {successModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              <p className="text-base font-bold text-slate-800 mb-1">{successModal.providerName} saved!</p>
              <p className="text-sm text-slate-500 mb-1">Added to <strong>My Team</strong> and a tentative appointment was added to your <strong>Calendar</strong>.</p>
              <p className="text-xs text-slate-400 mb-5">Head to your Calendar tab to confirm the date and time.</p>
              <button
                onClick={() => setSuccessModal(null)}
                className="w-full py-3 bg-orange-500 text-white rounded-2xl font-bold text-sm"
              >
                Got it ✓
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}