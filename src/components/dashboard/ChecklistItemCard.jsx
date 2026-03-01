import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Phone, UserPlus, Check, ShoppingCart, ClipboardList } from "lucide-react";
import RoomSetupWizard from "./RoomSetupWizard";
import ProviderAppointmentModal from "./ProviderAppointmentModal";

export default function ChecklistItemCard({ item, completed, skipped, onComplete, onSkip, userAddress, onProviderSaved, user }) {
  const [expanded, setExpanded] = useState(false);
  const [aiResults, setAiResults] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [savedIdx, setSavedIdx] = useState(null);
  const [showInventory, setShowInventory] = useState(false);
  const [appointmentProvider, setAppointmentProvider] = useState(null);

  const handleFindLocal = async () => {
    setLoadingAI(true);
    setExpanded(true);
    try {
      const location = userAddress ? ` near ${userAddress}` : " near me";
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Find the top 3 ${item.ai_search_query}${location}. Return realistic business names, ratings, brief descriptions, and phone numbers.`,
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
                  rating: { type: "string" },
                  description: { type: "string" },
                  phone: { type: "string" }
                }
              }
            }
          }
        }
      });
      setAiResults(res.providers || []);
    } catch (e) {
      setAiResults([]);
    }
    setLoadingAI(false);
  };

  const handleSelectProvider = async (provider, idx) => {
    setSavedIdx(idx);
    const user = await base44.auth.me();
    await base44.entities.SavedProvider.create({
      user_id: user.id,
      name: provider.name,
      role: item.title,
      phone: provider.phone || "",
      rating: provider.rating || "",
      week: item.week || 1,
      checklist_item: item.title
    });
    setExpanded(false);
    if (onProviderSaved) onProviderSaved();
  };

  if (skipped) {
    return (
      <div className="flex items-center justify-between p-3 rounded-xl bg-[#F9FAFB] opacity-50">
        <p className="text-xs text-[#9CA3AF] line-through">{item.title}</p>
        <button onClick={onSkip} className="text-[10px] text-[#F97316]">Undo</button>
      </div>
    );
  }

  return (
    <>
    <div className={`rounded-xl border transition-all ${completed ? "border-[#FED7AA] bg-[#FFF7ED]" : "border-[#F3F4F6] bg-[#FAFAFA]"}`}>
      <div className="flex items-center gap-3 p-3">
        <button
          onClick={onComplete}
          className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all
            ${completed ? "bg-[#F97316] border-[#F97316]" : "border-[#D1D5DB] hover:border-[#F97316]"}`}
        >
          {completed && (
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold ${completed ? "text-[#F97316] line-through" : "text-[#1A1A2E]"}`}>
            {item.title}
          </p>
          <p className="text-[11px] text-[#6B7280]">{item.description}</p>
        </div>

        <div className="flex items-center gap-1">
          {item.inventory_walkthrough && !completed && (
            <button
              onClick={() => setShowInventory(true)}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#EEF2FF] text-[#4F46E5] text-[10px] font-bold whitespace-nowrap"
            >
              <ClipboardList className="w-2.5 h-2.5" />Walk-thru
            </button>
          )}
          {item.amazon_search && !completed && (
            <a
              href={`https://www.amazon.com/s?k=${encodeURIComponent(item.amazon_search)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#FFF3CD] text-[#FF9900] text-[10px] font-bold whitespace-nowrap"
            >
              <ShoppingCart className="w-2.5 h-2.5" />Shop
            </a>
          )}
          {item.ai_search_query && !completed && (
            <button
              onClick={() => expanded ? setExpanded(false) : handleFindLocal()}
              className="px-2 py-1 rounded-lg bg-[#FFF7ED] text-[#F97316] text-[10px] font-bold whitespace-nowrap"
            >
              {expanded ? "Close" : "Find Local"}
            </button>
          )}
          {!completed && (
            <button onClick={onSkip} className="p-1 text-[#D1D5DB] hover:text-[#9CA3AF]">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* AI Results */}
      {expanded && (
        <div className="px-3 pb-3 border-t border-[#F3F4F6] pt-2">
          {loadingAI ? (
            <div className="flex items-center gap-2 py-2">
              <div className="w-4 h-4 border-2 border-[#F97316] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-[#6B7280]">Finding top local providers...</p>
            </div>
          ) : aiResults?.length > 0 ? (
            <div className="space-y-2">
              {aiResults.map((r, i) => (
                <div key={i} className={`bg-white rounded-lg p-2.5 border transition-all ${savedIdx === i ? "border-[#059669] bg-[#F0FDF4]" : "border-[#E5E7EB]"}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[#1A1A2E]">{r.name}</p>
                      <p className="text-[10px] text-[#6B7280] mt-0.5">{r.description}</p>
                      {r.phone && (
                        <a href={`tel:${r.phone}`} className="flex items-center gap-1 text-[10px] text-[#F97316] font-semibold mt-1">
                          <Phone className="w-2.5 h-2.5" />{r.phone}
                        </a>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className="text-[10px] text-[#D97706] font-semibold">⭐ {r.rating}</span>
                      <button
                        onClick={() => handleSelectProvider(r, i)}
                        disabled={savedIdx !== null}
                        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold transition-all
                          ${savedIdx === i ? "bg-[#059669] text-white" : "bg-[#F97316] text-white hover:bg-[#EA6C0A]"}`}
                      >
                        {savedIdx === i ? <><Check className="w-2.5 h-2.5" />Saved!</> : <><UserPlus className="w-2.5 h-2.5" />Select</>}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              <button
                onClick={() => { setExpanded(false); onSkip(); }}
                className="w-full py-1.5 rounded-lg border border-[#E5E7EB] text-[10px] text-[#6B7280] font-medium"
              >
                Service not needed
              </button>
            </div>
          ) : (
            <p className="text-xs text-[#9CA3AF]">No results found. Try again later.</p>
          )}
        </div>
      )}
    </div>

    {showInventory && (
      <RoomSetupWizard user={user} onClose={() => setShowInventory(false)} />
    )}
    </>
  );
}