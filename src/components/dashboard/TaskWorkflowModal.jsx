import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { X, Phone, Check, Package, DollarSign, ClipboardList } from "lucide-react";

export default function TaskWorkflowModal({ task, user, onClose, onComplete }) {
  const [step, setStep] = useState("provider_search");
  const [providers, setProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [loading, setLoading] = useState(false);
  const [callNotes, setCallNotes] = useState("");
  const [callSuccess, setCallSuccess] = useState(null);
  const [needsPackaging, setNeedsPackaging] = useState(null);
  const [inventoryData, setInventoryData] = useState({
    boxes_small: 0,
    boxes_medium: 0,
    boxes_large: 0,
    tape_rolls: 0,
    bubble_wrap_ft: 0,
    estimated_cost: 0
  });

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const location = user?.home_address || "my area";
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Find the top 3 ${task.ai_search_query || task.title} near ${location}. Return realistic business names, ratings, descriptions, and phone numbers.`,
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
      setProviders(res.providers || []);
    } catch (e) {
      setProviders([]);
    }
    setLoading(false);
  };

  useState(() => {
    if (task.ai_search_query) {
      fetchProviders();
    }
  }, []);

  const handleSelectProvider = async (provider) => {
    setSelectedProvider(provider);
    await base44.entities.SavedProvider.create({
      user_id: user.id,
      name: provider.name,
      role: task.title,
      phone: provider.phone || "",
      rating: provider.rating || "",
      week: task.week || 1,
      checklist_item: task.title
    });
    setStep("call_tracking");
  };

  const handleCallComplete = () => {
    if (callSuccess) {
      setStep("packaging_question");
    } else {
      onClose();
    }
  };

  const handlePackagingAnswer = async (answer) => {
    setNeedsPackaging(answer);
    if (answer) {
      setStep("inventory");
    } else {
      await saveAndComplete();
    }
  };

  const saveAndComplete = async () => {
    await base44.entities.Contact.create({
      user_id: user.id,
      name: selectedProvider?.name || "",
      role: task.title,
      phone: selectedProvider?.phone || "",
      avatar_initials: selectedProvider?.name?.slice(0, 2).toUpperCase() || "NA",
      color: "orange"
    });
    
    if (needsPackaging && inventoryData.estimated_cost > 0) {
      await base44.auth.updateMe({
        moving_cost_estimate: (user.moving_cost_estimate || 0) + inventoryData.estimated_cost
      });
    }
    
    onComplete();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center">
      <div className="w-full max-w-md bg-white rounded-t-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">{task.title}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        <div className="px-5 py-4 max-h-[70vh] overflow-y-auto">
          {/* Provider Search */}
          {step === "provider_search" && (
            <div>
              <p className="text-sm text-slate-600 mb-4">Select a provider to continue</p>
              {loading ? (
                <div className="flex items-center gap-2 py-6">
                  <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm text-slate-500">Finding providers...</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {providers.map((p, i) => (
                    <div key={i} className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p className="text-sm font-bold text-slate-800">{p.name}</p>
                          <p className="text-xs text-slate-500 mt-1">{p.description}</p>
                          {p.phone && (
                            <a href={`tel:${p.phone}`} className="flex items-center gap-1 text-xs text-orange-500 font-semibold mt-2">
                              <Phone className="w-3 h-3" />{p.phone}
                            </a>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className="text-xs text-amber-600 font-semibold">⭐ {p.rating}</span>
                          <div className="flex gap-2">
                            <button
                              onClick={async () => {
                                await base44.entities.SavedProvider.create({
                                  user_id: user.id,
                                  name: p.name,
                                  role: task.title,
                                  phone: p.phone || "",
                                  rating: p.rating || "",
                                  week: task.week || 1,
                                  checklist_item: task.title
                                });
                                await base44.entities.Contact.create({
                                  user_id: user.id,
                                  name: p.name,
                                  role: task.title,
                                  phone: p.phone || "",
                                  avatar_initials: p.name?.slice(0, 2).toUpperCase() || "NA",
                                  color: "orange"
                                });
                                onComplete();
                                onClose();
                              }}
                              className="px-3 py-1.5 rounded-lg bg-green-500 text-white text-xs font-bold"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => handleSelectProvider(p)}
                              className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-bold"
                            >
                              Select
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Call Tracking */}
          {step === "call_tracking" && (
            <div>
              <div className="bg-orange-50 rounded-xl p-4 mb-4">
                <p className="text-sm font-bold text-orange-900">Selected: {selectedProvider?.name}</p>
                <a href={`tel:${selectedProvider?.phone}`} className="flex items-center gap-2 text-orange-600 font-semibold mt-2">
                  <Phone className="w-4 h-4" />Call {selectedProvider?.phone}
                </a>
              </div>
              
              <p className="text-sm font-bold text-slate-800 mb-3">How did the call go?</p>
              
              <div className="space-y-3 mb-4">
                <button
                  onClick={() => setCallSuccess(true)}
                  className={`w-full p-3 rounded-xl border-2 transition-all text-left ${
                    callSuccess === true ? "border-green-500 bg-green-50" : "border-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-semibold text-slate-800">Great! We're moving forward</span>
                  </div>
                </button>
                
                <button
                  onClick={() => setCallSuccess(false)}
                  className={`w-full p-3 rounded-xl border-2 transition-all text-left ${
                    callSuccess === false ? "border-red-500 bg-red-50" : "border-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <X className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-semibold text-slate-800">Didn't work out</span>
                  </div>
                </button>
              </div>

              <textarea
                value={callNotes}
                onChange={(e) => setCallNotes(e.target.value)}
                placeholder="Notes from the call (optional)..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm resize-none"
                rows={3}
              />

              <div className="flex gap-3 mt-4">
                <button
                  onClick={async () => {
                    await base44.entities.Contact.create({
                      user_id: user.id,
                      name: selectedProvider?.name || "",
                      role: task.title,
                      phone: selectedProvider?.phone || "",
                      avatar_initials: selectedProvider?.name?.slice(0, 2).toUpperCase() || "NA",
                      color: "orange"
                    });
                    onClose();
                  }}
                  className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-slate-700 font-bold"
                >
                  Save & Exit
                </button>
                {callSuccess !== null && (
                  <button
                    onClick={handleCallComplete}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold"
                  >
                    Continue →
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Packaging Question */}
          {step === "packaging_question" && (
            <div className="text-center">
              <Package className="w-12 h-12 text-orange-500 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-800 mb-2">Do you need packing supplies?</h3>
              <p className="text-sm text-slate-500 mb-6">We can help estimate what you'll need</p>
              
              <div className="space-y-3">
                <button
                  onClick={() => handlePackagingAnswer(true)}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold"
                >
                  Yes, show me supplies
                </button>
                <button
                  onClick={() => handlePackagingAnswer(false)}
                  className="w-full py-4 rounded-xl border-2 border-slate-200 text-slate-700 font-bold"
                >
                  No, I'm all set
                </button>
              </div>
            </div>
          )}

          {/* Inventory Estimator */}
          {step === "inventory" && (
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-4">Packing Supplies Needed</h3>
              
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <span className="text-sm font-semibold text-slate-700">Small Boxes</span>
                  <input
                    type="number"
                    value={inventoryData.boxes_small}
                    onChange={(e) => setInventoryData({...inventoryData, boxes_small: +e.target.value})}
                    className="w-20 px-3 py-2 rounded-lg border border-slate-200 text-center"
                  />
                </div>
                
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <span className="text-sm font-semibold text-slate-700">Medium Boxes</span>
                  <input
                    type="number"
                    value={inventoryData.boxes_medium}
                    onChange={(e) => setInventoryData({...inventoryData, boxes_medium: +e.target.value})}
                    className="w-20 px-3 py-2 rounded-lg border border-slate-200 text-center"
                  />
                </div>
                
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <span className="text-sm font-semibold text-slate-700">Large Boxes</span>
                  <input
                    type="number"
                    value={inventoryData.boxes_large}
                    onChange={(e) => setInventoryData({...inventoryData, boxes_large: +e.target.value})}
                    className="w-20 px-3 py-2 rounded-lg border border-slate-200 text-center"
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <span className="text-sm font-semibold text-slate-700">Tape Rolls</span>
                  <input
                    type="number"
                    value={inventoryData.tape_rolls}
                    onChange={(e) => setInventoryData({...inventoryData, tape_rolls: +e.target.value})}
                    className="w-20 px-3 py-2 rounded-lg border border-slate-200 text-center"
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <span className="text-sm font-semibold text-slate-700">Bubble Wrap (ft)</span>
                  <input
                    type="number"
                    value={inventoryData.bubble_wrap_ft}
                    onChange={(e) => setInventoryData({...inventoryData, bubble_wrap_ft: +e.target.value})}
                    className="w-20 px-3 py-2 rounded-lg border border-slate-200 text-center"
                  />
                </div>
              </div>

              <div className="bg-orange-50 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-orange-900">Estimated Cost:</span>
                  <input
                    type="number"
                    value={inventoryData.estimated_cost}
                    onChange={(e) => setInventoryData({...inventoryData, estimated_cost: +e.target.value})}
                    placeholder="0"
                    className="w-24 px-3 py-2 rounded-lg border border-orange-200 text-right font-bold text-orange-900"
                  />
                </div>
              </div>

              <button
                onClick={saveAndComplete}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold"
              >
                Complete Task →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}