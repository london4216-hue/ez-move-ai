import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Phone, Star, MapPin, CalendarDays, ChevronRight, Sparkles, Package, DollarSign, X } from "lucide-react";

const SERVICES = [
  { id: "movers", label: "Movers", emoji: "🚛", color: "bg-blue-50 border-blue-100" },
  { id: "cleaners", label: "Cleaners", emoji: "✨", color: "bg-purple-50 border-purple-100" },
  { id: "painters", label: "Painters", emoji: "🎨", color: "bg-pink-50 border-pink-100" },
  { id: "junk", label: "Junk Removal", emoji: "🗑️", color: "bg-red-50 border-red-100" },
  { id: "estate", label: "Estate Sale", emoji: "🏷️", color: "bg-amber-50 border-amber-100" },
  { id: "donation", label: "Donation Pickup", emoji: "🫶", color: "bg-green-50 border-green-100" },
];

const SERVICE_QUERIES = {
  movers: (a) => `top rated local moving companies near ${a}. Include 4 real businesses with ratings and pricing.`,
  cleaners: (a) => `top rated move-out cleaning services near ${a}. Include 4 real businesses with ratings and pricing.`,
  painters: (a) => `top rated interior painting contractors near ${a}. Include 4 real businesses with ratings and pricing.`,
  junk: (a) => `top rated junk removal same day service near ${a}. Include 4 real businesses with ratings and pricing.`,
  estate: (a) => `estate sale companies and professionals near ${a}. Include 4 real businesses.`,
  donation: (a) => `furniture and household donation pickup services near ${a}. Include 4 real nonprofits or services.`,
};

export default function AICenterTab({ user }) {
  const [activeService, setActiveService] = useState(null);
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(null);
  const [quoteData, setQuoteData] = useState(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [scheduleModal, setScheduleModal] = useState(null);

  const address = user?.home_address || "my area";

  const fetchService = async (service) => {
    setActiveService(service.id);
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

  const scheduleWithProvider = async (provider) => {
    if (!user) return;
    await base44.entities.Appointment.create({
      user_id: user.id,
      title: `${provider.name} - ${activeService}`,
      provider_name: provider.name,
      phone: provider.phone,
      status: "tentative",
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      notes: "Scheduled via AI Center"
    });
    setScheduleModal(provider.name);
  };

  const activeServiceData = SERVICES.find(s => s.id === activeService);

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <div className="bg-[#0F172A] rounded-3xl p-5 text-white">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-orange-400" />
          <p className="text-sm font-bold text-white">AI Move Center</p>
        </div>
        <p className="text-slate-400 text-xs leading-relaxed">
          AI finds and recommends the best local services for your move — movers, cleaners, estate sales, and more.
        </p>
        {user?.home_address && (
          <div className="flex items-center gap-1.5 mt-3 bg-slate-800 rounded-xl px-3 py-2">
            <MapPin className="w-3 h-3 text-orange-400 flex-shrink-0" />
            <p className="text-slate-300 text-[11px] truncate">{user.home_address}</p>
          </div>
        )}
      </div>

      {/* Service Grid */}
      <section>
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">Find Local Services</p>
        <div className="grid grid-cols-3 gap-2.5">
          {SERVICES.map(service => (
            <button
              key={service.id}
              onClick={() => fetchService(service)}
              className={`rounded-2xl p-3.5 text-left border transition-all active:scale-95
                ${activeService === service.id
                  ? "bg-orange-500 border-orange-400 shadow-lg shadow-orange-200"
                  : `${service.color}`}`}
            >
              <span className="text-2xl block mb-2">{service.emoji}</span>
              <p className={`text-[11px] font-bold leading-tight ${activeService === service.id ? "text-white" : "text-slate-700"}`}>
                {service.label}
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* Provider Results */}
      {activeService && (
        <section>
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {activeServiceData?.label} Near You
            </p>
            <button onClick={() => setActiveService(null)}>
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          {loading === activeService ? (
            <div className="bg-white rounded-3xl p-10 flex flex-col items-center gap-3 shadow-sm border border-slate-100">
              <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
              </div>
              <p className="text-xs text-slate-500 font-semibold text-center">
                AI is finding the best {activeServiceData?.label.toLowerCase()} near you...
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {(results[activeService] || []).map((provider, i) => (
                <div key={i} className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100">
                  <div className="flex items-start justify-between mb-1.5">
                    <p className="text-sm font-bold text-slate-800 flex-1 pr-2">{provider.name}</p>
                    {provider.rating && (
                      <div className="flex items-center gap-1 bg-amber-50 rounded-lg px-2 py-0.5">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span className="text-xs font-bold text-amber-700">{provider.rating}</span>
                      </div>
                    )}
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
                      onClick={() => scheduleWithProvider(provider)}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-orange-500 text-white rounded-xl py-2.5 text-xs font-bold hover:bg-orange-600 transition-colors active:scale-95"
                    >
                      <CalendarDays className="w-3.5 h-3.5" /> Schedule
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Moving Quote */}
      <section>
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">Moving Cost Estimate</p>
        {!quoteData && !quoteLoading && (
          <button
            onClick={getMovingQuote}
            className="w-full bg-gradient-to-r from-[#0F172A] to-slate-800 text-white rounded-3xl p-5 flex items-center justify-between shadow-md active:scale-[0.98] transition-all"
          >
            <div>
              <p className="text-sm font-bold">Get AI Moving Quote</p>
              <p className="text-xs text-slate-400 mt-0.5">Instant estimate based on your area</p>
            </div>
            <div className="w-9 h-9 rounded-2xl bg-orange-500 flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-white" />
            </div>
          </button>
        )}

        {quoteLoading && (
          <div className="bg-white rounded-3xl p-8 flex flex-col items-center gap-3 shadow-sm border border-slate-100">
            <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
            <p className="text-xs text-slate-500 font-semibold">Calculating your estimate...</p>
          </div>
        )}

        {quoteData && !quoteLoading && (
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100">
            <p className="text-sm font-bold text-slate-800 mb-3">Your Moving Estimate</p>
            <div className="space-y-0">
              {quoteData?.estimates?.map((est, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
                  <p className="text-xs font-semibold text-slate-700">{est.home_size}</p>
                  <div className="text-right">
                    <p className="text-xs font-bold text-orange-500">Local: {est.local_cost}</p>
                    <p className="text-[10px] text-slate-400">Long dist: {est.long_distance_cost}</p>
                  </div>
                </div>
              ))}
            </div>
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

      {/* Schedule Confirmation */}
      {scheduleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md">
            <div className="text-center">
              <div className="text-4xl mb-3">📅</div>
              <p className="text-base font-bold text-slate-800 mb-1">Appointment Added!</p>
              <p className="text-sm text-slate-500 mb-4">{scheduleModal} has been added to your calendar as tentative. You can update the date and time in your Calendar tab.</p>
              <button
                onClick={() => setScheduleModal(null)}
                className="w-full py-3 bg-orange-500 text-white rounded-2xl font-bold text-sm"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}