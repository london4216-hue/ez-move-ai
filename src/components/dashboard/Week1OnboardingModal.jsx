import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { CheckCircle2, ChevronRight, ChevronLeft, Loader2, Phone, Save, Sparkles, DollarSign, Truck } from "lucide-react";

// ── Room catalog ─────────────────────────────────────────────────────────────
const ROOMS = [
  { room: "Living Room", emoji: "🛋️", items: ["Sofa", "Loveseat", "Coffee Table", "TV Stand / Entertainment Center", "Bookcase", "Area Rug", "Floor Lamps", "Artwork / Wall Decor"] },
  { room: "Bedroom", emoji: "🛏️", items: ["Bed Frame", "Mattress", "Dresser", "Nightstands", "Wardrobe / Armoire", "Desk & Chair", "Mirror"] },
  { room: "Kitchen", emoji: "🍳", items: ["Refrigerator", "Stove / Oven", "Dishwasher", "Microwave", "Pots & Pans", "Dishes & Glassware", "Small Appliances (toaster, blender…)"] },
  { room: "Dining Room", emoji: "🪑", items: ["Dining Table", "Dining Chairs", "China Cabinet / Hutch", "Bar Cart"] },
  { room: "Garage / Outdoor", emoji: "🔧", items: ["Tools & Tool Box", "Lawn Mower / Equipment", "Patio Furniture", "Bikes & Sports Gear", "Storage Shelves / Cabinets", "Ladders"] },
  { room: "Other", emoji: "📦", items: ["Electronics & Cables", "Books & Media", "Holiday / Seasonal Decor", "Exercise Equipment", "Clothing & Personal Items"] },
];

const CHOICES = [
  { id: "move",   label: "Moving",  color: "bg-orange-500 text-white border-orange-500" },
  { id: "donate", label: "Donate",  color: "bg-purple-500 text-white border-purple-500" },
  { id: "junk",   label: "Junk",    color: "bg-red-500 text-white border-red-500" },
];

const SIZES = ["Small", "Medium", "Large", "XL"];
const SIZE_COLORS = {
  Small:  "bg-sky-50 border-sky-200 text-sky-700",
  Medium: "bg-amber-50 border-amber-200 text-amber-700",
  Large:  "bg-orange-50 border-orange-200 text-orange-700",
  XL:     "bg-red-50 border-red-200 text-red-700",
};

// decisions shape: { "Sofa": { choice: "move"|"donate"|"junk", size: "Medium" | null } }

const STEPS = ["welcome", "moving_question", "mileage_distance", "stays_goes", "ai_insights", "estate_sale", "movers", "closing_details", "done"];
const STORAGE_KEY = (id) => `onboarding_progress_${id}`;

async function findProviders(query, address) {
  const res = await base44.integrations.Core.InvokeLLM({
    prompt: `Find 3 real top-rated local businesses for: "${query}" near ${address || "my area"}. Include name, phone number, and a 1-line description.`,
    add_context_from_internet: true,
    response_json_schema: {
      type: "object",
      properties: {
        providers: {
          type: "array",
          items: { type: "object", properties: { name: { type: "string" }, phone: { type: "string" }, description: { type: "string" } } }
        }
      }
    }
  });
  return res?.providers || [];
}

export default function Week1OnboardingModal({ user, onDone }) {
  const savedKey = STORAGE_KEY(user?.id);
  const saved = (() => { try { return JSON.parse(localStorage.getItem(savedKey) || "{}"); } catch { return {}; } })();

  const [stepIdx, setStepIdx]           = useState(saved.stepIdx ?? 0);
  const [isMoving, setIsMoving]         = useState(saved.isMoving ?? null);
  const [decisions, setDecisions]       = useState(saved.decisions ?? {});  // { item: { choice, size } }
  const [sizePrompt, setSizePrompt]     = useState(null);   // item name waiting for size
  const [needsEstate, setNeedsEstate]   = useState(saved.needsEstate ?? null);
  const [needsMover, setNeedsMover]     = useState(saved.needsMover ?? null);
  const [providers, setProviders]       = useState([]);
  const [loadingAI, setLoadingAI]       = useState(false);
  const [insights, setInsights]         = useState(saved.insights ?? null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [moversSaved, setMoversSaved]   = useState(false);
  const [selectedMover, setSelectedMover] = useState(saved.selectedMover ?? null);
  const [selectedEstate, setSelectedEstate] = useState(saved.selectedEstate ?? null);  // provider name
  const [moveDistanceMiles, setMoveDistanceMiles] = useState(saved.moveDistanceMiles ?? null);
  const [showMileageInput, setShowMileageInput] = useState(false);
  const [mileageInputValue, setMileageInputValue] = useState("");
  const [moverQ, setMoverQ] = useState(saved.moverQ ?? null); // mover questionnaire answers
  const [showMoverQ, setShowMoverQ] = useState(!saved.moverQ);  // show questionnaire if not answered
  const [moverQForm, setMoverQForm] = useState(saved.moverQ ?? {
    floors: "1",
    stairs: "none",
    elevator: "no",
    walk_distance: "under 50 ft",
    parking: "street",
    move_distance: "local (under 50 miles)",
    special_items: "",
  });
  const [closingDetails, setClosingDetails] = useState(saved.closingDetails ?? {
    walkthrough_date: "",
    lawyer_name: "",
    lawyer_phone: "",
    closing_time: "",
    closing_location: "",
  });

  const step = STEPS[stepIdx];

  const persist = (patch = {}) => {
    localStorage.setItem(savedKey, JSON.stringify({ stepIdx, decisions, needsEstate, needsMover, insights, isMoving, moveDistanceMiles, ...patch }));
  };

  const goTo = (idx, patch = {}) => {
    setStepIdx(idx);
    persist({ stepIdx: idx, ...patch });
  };

  // ── Select category → prompt for size ──────────────────────────────────────
  const selectChoice = (item, choice) => {
    // toggle off
    if (decisions[item]?.choice === choice) {
      const updated = { ...decisions };
      delete updated[item];
      setDecisions(updated);
      persist({ decisions: updated });
      setSizePrompt(null);
      return;
    }
    // set choice without size yet, open size prompt
    const updated = { ...decisions, [item]: { choice, size: null } };
    setDecisions(updated);
    persist({ decisions: updated });
    setSizePrompt(item);
  };

  const selectSize = (item, size) => {
    const updated = { ...decisions, [item]: { ...decisions[item], size, qty: decisions[item]?.qty || 1 } };
    setDecisions(updated);
    persist({ decisions: updated });
    setSizePrompt(null);
  };

  const changeQty = (item, delta) => {
    const current = decisions[item]?.qty || 1;
    const next = Math.max(1, current + delta);
    const updated = { ...decisions, [item]: { ...decisions[item], qty: next } };
    setDecisions(updated);
    persist({ decisions: updated });
  };

  // ── AI insights step ────────────────────────────────────────────────────────
  const loadInsights = async () => {
    setLoadingInsights(true);
    const moveItems = Object.entries(decisions).filter(([, v]) => v.choice === "move").map(([name, v]) => `${name} (${v.size || "Medium"}, qty ${v.qty || 1})`);
    const donateItems = Object.entries(decisions).filter(([, v]) => v.choice === "donate").map(([name, v]) => `${name} (${v.size || "Medium"})`);
    const q = moverQ || moverQForm;
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `A person is moving. Give them a professional mover-style quote breakdown.

Items being moved: ${moveItems.join(", ") || "none"}
Donate items: ${donateItems.join(", ") || "none"}

Job details (as a mover would ask):
- Floors: ${q.floors} floor(s)
- Stairs: ${q.stairs}
- Elevator available: ${q.elevator}
- Walking distance from home to truck: ${q.walk_distance}
- Parking situation: ${q.parking}
- Distance from old home to new home: ${q.move_distance || "local (under 50 miles)"}
- Hanging clothes/wardrobes: ${q.hanging_clothes || "some"} (indicates wardrobe box needs)
- Special/heavy items: ${q.special_items || "none"}

Provide a detailed mover-style estimate including:
1. Total estimated weight in lbs (like a mover would calculate it)
2. How many small/medium/large/wardrobe boxes are needed (wardrobe boxes for hanging clothes)
3. Recommended truck size (e.g. 10ft, 16ft, 20ft, 26ft)
4. Estimated move cost range low and high in $, factoring in stairs/distance/special items
5. Estimated hours to complete the move
6. Tax write-off value for donated items (IRS fair market value)
7. A one-sentence pro tip from a mover's perspective

Be specific and realistic, like a professional moving company estimate.`,
      response_json_schema: {
        type: "object",
        properties: {
          move_weight_lbs: { type: "number" },
          boxes_small: { type: "number" },
          boxes_medium: { type: "number" },
          boxes_large: { type: "number" },
          boxes_wardrobe: { type: "number" },
          truck_size: { type: "string" },
          estimated_hours: { type: "number" },
          move_cost_low: { type: "number" },
          move_cost_high: { type: "number" },
          tax_writeoff: { type: "number" },
          tip: { type: "string" }
        }
      }
    });
    setInsights(res);
    setLoadingInsights(false);
    persist({ insights: res, moverQ: q });
  };

  const selectMoverProvider = async (p) => {
    setSelectedMover(p.name);
    persist({ selectedMover: p.name });
    if (user?.id) {
      await base44.entities.Contact.create({
        user_id: user.id,
        name: p.name,
        role: "Mover",
        phone: p.phone || "",
        email: "",
        avatar_initials: p.name?.[0] || "M",
        color: "#f97316",
      }).catch(() => {});
      setMoversSaved(true);
    }
  };

  // ── Estate / Movers ─────────────────────────────────────────────────────────
  const handleEstateAnswer = async (answer) => {
    setNeedsEstate(answer);
    persist({ needsEstate: answer });
    if (answer) {
      setLoadingAI(true);
      setProviders(await findProviders("estate sale companies", user?.home_address));
      setLoadingAI(false);
    } else {
      goTo(stepIdx + 1, { needsEstate: answer });
    }
  };

  const selectEstateProvider = async (p) => {
    setSelectedEstate(p.name);
    persist({ selectedEstate: p.name });
    if (user?.id) {
      await base44.entities.Contact.create({
        user_id: user.id,
        name: p.name,
        role: "Estate Sale",
        phone: p.phone || "",
        email: "",
        avatar_initials: p.name?.[0] || "E",
        color: "#a855f7",
      }).catch(() => {});
    }
  };

  const handleMoverAnswer = async (answer) => {
    setNeedsMover(answer);
    persist({ needsMover: answer });
    if (answer) {
      setLoadingAI(true);
      const found = await findProviders("local moving companies", user?.home_address);
      setProviders(found);
      setLoadingAI(false);
      // Save movers as contacts handled via selectMoverProvider
    } else {
      goTo(stepIdx + 1, { needsMover: answer });
    }
  };

  // ── Finish ──────────────────────────────────────────────────────────────────
  // Create default appointments for closing date and walkthrough
  const createDefaultAppointments = async () => {
    if (!user?.id) return;
    const uid = user.id;
    
    // Default closing date appointment (from estimated_close_date)
    if (user.estimated_close_date) {
      await base44.entities.Appointment.create({
        user_id: uid,
        title: "Closing Day",
        provider_name: "Real Estate Agent",
        phone: user.agent_phone || "555-123-4757",
        date: user.estimated_close_date,
        time: closingDetails.closing_time || "",
        notes: closingDetails.closing_location ? `Location: ${closingDetails.closing_location}` : "Closing scheduled",
        status: "scheduled",
      }).catch(() => {});
    }
    
    // Walkthrough appointment
    if (closingDetails.walkthrough_date) {
      await base44.entities.Appointment.create({
        user_id: uid,
        title: "Final Walkthrough",
        provider_name: "Real Estate Agent",
        phone: user.agent_phone || "555-123-4757",
        date: closingDetails.walkthrough_date,
        time: "",
        notes: "Final walkthrough before closing",
        status: "scheduled",
      }).catch(() => {});
    }
    
    // Lawyer appointment
    if (closingDetails.lawyer_name && closingDetails.lawyer_phone) {
      await base44.entities.Contact.create({
        user_id: uid,
        name: closingDetails.lawyer_name,
        role: "Lawyer",
        phone: closingDetails.lawyer_phone,
        avatar_initials: closingDetails.lawyer_name?.[0] || "L",
        color: "#8b5cf6",
      }).catch(() => {});
    }
  };

  const finish = async () => {
    const stuffLists = { move: [], junk: [], donate: [] };
    Object.entries(decisions).forEach(([name, { choice, size, qty }]) => {
      if (stuffLists[choice]) stuffLists[choice].push({ id: `seed-${name}`, name, size: size || "Medium", qty: qty || 1 });
    });
    await createDefaultAppointments();
    base44.auth.updateMe({ stuff_lists: JSON.stringify(stuffLists), needs_mover: needsMover, needs_estate_sale: needsEstate, move_distance_miles: moveDistanceMiles }).catch(() => {});

    // Reflect onboarding progress in Week 1 checklist
    const uid = user?.id;
    if (uid) {
      // Ensure all w1 tasks appear in the plan
      const existingSelections = (() => { try { return JSON.parse(localStorage.getItem(`user_selections_${uid}`) || "{}"); } catch { return {}; } })();
      const updatedSelections = { ...existingSelections, "w1-1": "yes", "w1-2": "yes", "w1-3": "yes", "w1-4": "yes" };
      localStorage.setItem(`user_selections_${uid}`, JSON.stringify(updatedSelections));

      // Mark tasks complete based on what user actually did
      const existingCompleted = (() => { try { return JSON.parse(localStorage.getItem(`checklist_complete_${uid}`) || "[]"); } catch { return []; } })();
      const completedSet = new Set(existingCompleted);
      const sortedCount = Object.values(decisions).filter(v => v?.choice).length;
      const hasDonate = Object.values(decisions).some(v => v?.choice === "donate");
      if (sortedCount > 0)       completedSet.add("w1-1");  // sorted stays vs. goes
      if (hasDonate)             completedSet.add("w1-2");  // started donation pile
      if (needsEstate !== null)  completedSet.add("w1-3");  // made estate sale decision
      if (selectedMover)         completedSet.add("w1-4");  // selected a mover
      localStorage.setItem(`checklist_complete_${uid}`, JSON.stringify([...completedSet]));
    }

    localStorage.setItem(`onboarding_done_${user?.id}`, "1");
    localStorage.removeItem(savedKey);
    onDone();
  };

  const handleSaveExit = () => {
    persist({ stepIdx });
    base44.auth.logout("/");
  };

  const decisionCount = Object.values(decisions).filter(v => v?.choice).length;

  // Helper: standardized nav buttons (back, continue, skip)
  const NavButtons = ({ onBack, onContinue, onSkip, backDisabled }) => (
    <div className="flex gap-3">
      {onBack && (
        <button onClick={onBack} disabled={backDisabled} className="flex items-center gap-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-500 font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed">
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}
      {onContinue && (
        <button onClick={onContinue} className={`${onBack || onSkip ? "flex-1" : "w-full"} py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-sm shadow-lg shadow-orange-200 flex items-center justify-center gap-2`}>
          Continue <ChevronRight className="w-4 h-4" />
        </button>
      )}
      {onSkip && (
        <button onClick={onSkip} className="px-4 py-3 rounded-xl border border-slate-200 text-slate-500 font-bold text-sm hover:bg-slate-50 transition-colors">
          Skip
        </button>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col">
      {/* Top bar */}
      <div className="bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
            <span className="text-white text-[9px] font-black">EZ</span>
          </div>
          <span className="text-sm font-black text-slate-800">Week 1 Setup</span>
          <span className="text-xs text-slate-400 font-semibold">{stepIdx + 1} / {STEPS.length}</span>
        </div>
        <button onClick={handleSaveExit} className="flex items-center gap-1 text-[11px] text-slate-500 font-bold bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-colors">
          <Save className="w-3 h-3" /> Save & Exit
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-slate-100 flex-shrink-0">
        <div className="h-full bg-gradient-to-r from-orange-500 to-orange-400 transition-all duration-500" style={{ width: `${((stepIdx + 1) / STEPS.length) * 100}%` }} />
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 py-6 max-w-md mx-auto w-full pb-32">

        {/* ── WELCOME ── */}
        {step === "welcome" && (
          <div className="text-center">
            <div className="text-6xl mb-5">👋</div>
            <h2 className="text-2xl font-black text-slate-900 mb-3">Welcome to EZ Move AI!</h2>
            <p className="text-sm text-slate-500 leading-relaxed mb-8">
              Your agent set up this account for you. Let's build your personalized moving plan — it takes about 3 minutes. You can save & come back any time.
            </p>
            <div className="grid grid-cols-3 gap-3 mb-8">
              {["📋 Move Plan", "📦 Sort Items", "🚛 Find Movers"].map((l) => (
                <div key={l} className="bg-orange-50 rounded-2xl p-3 text-center">
                  <p className="text-[11px] font-bold text-orange-700">{l}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── MOVING QUESTION ── */}
        {step === "moving_question" && (
         <div className="text-center">
           <div className="text-6xl mb-5">🏠</div>
           <h2 className="text-2xl font-black text-slate-900 mb-3">Are you moving to a new place?</h2>
           <p className="text-sm text-slate-500 leading-relaxed mb-8">
             This helps us personalize your plan — we'll only ask moving-related questions if you're relocating.
           </p>
         </div>
        )}

        {/* ── MILEAGE DISTANCE ── */}
        {step === "mileage_distance" && (
          <div className="text-center">
            <div className="text-6xl mb-5">📍</div>
            <h2 className="text-2xl font-black text-slate-900 mb-3">Do you know how many miles away your next home will be?</h2>
            <p className="text-sm text-slate-500 leading-relaxed mb-8">
              This helps us calculate accurate moving quotes.
            </p>
            {!showMileageInput ? (
              <NavButtons
                onContinue={() => setShowMileageInput(true)}
                onSkip={() => goTo(3)}
              />
            ) : (
              <div className="space-y-3">
                <div className="bg-orange-50 border border-orange-200 rounded-2xl px-4 py-3">
                  <label className="text-[11px] font-bold text-orange-700 uppercase tracking-wide mb-2 block">How many miles away is your next home?</label>
                  <input
                    type="number"
                    min="0"
                    value={mileageInputValue}
                    onChange={e => setMileageInputValue(e.target.value)}
                    placeholder="e.g., 50"
                    className="w-full px-4 py-3 rounded-xl border border-orange-200 text-center text-lg font-bold focus:outline-none focus:border-orange-400 bg-white"
                  />
                </div>
                <button
                  onClick={() => {
                    const val = mileageInputValue.trim() ? parseInt(mileageInputValue) : null;
                    setMoveDistanceMiles(val);
                    persist({ moveDistanceMiles: val });
                    goTo(3);
                  }}
                  disabled={!mileageInputValue.trim()}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-sm shadow-lg shadow-orange-200 disabled:opacity-40 disabled:cursor-not-allowed">
                  Continue →
                  </button>
                  <button
                  onClick={() => { setShowMileageInput(false); setMileageInputValue(""); }}
                  className="w-full py-3.5 rounded-2xl border-2 border-slate-200 text-slate-700 font-bold text-sm">
                  Cancel
                  </button>
              </div>
            )}
          </div>
        )}

        {/* ── STAYS / GOES ── */}
        {step === "stays_goes" && (
          <div>

            <div className="text-center mb-5">
              <div className="text-4xl mb-2">📦</div>
              <h2 className="text-xl font-black text-slate-900">What Stays vs. Goes?</h2>
              <p className="text-xs text-slate-400 mt-1">Tap a category, then pick the size — this pre-loads your "My Stuff" tab.</p>
              {decisionCount > 0 && <p className="text-xs font-bold text-orange-500 mt-1">{decisionCount} item{decisionCount !== 1 ? "s" : ""} sorted so far</p>}
            </div>

            <div className="space-y-4 mb-8">
              {ROOMS.map(({ room, emoji, items }) => (
                <div key={room}>
                  <p className="text-xs font-black text-slate-600 uppercase tracking-wider mb-2">{emoji} {room}</p>
                  <div className="space-y-1.5">
                    {items.map((item) => {
                      const d = decisions[item];
                      const isPrompting = sizePrompt === item;
                      return (
                        <div key={item}>
                          <div className={`flex items-center gap-2 bg-white rounded-2xl px-3 py-2.5 border transition-all ${d?.choice ? "border-orange-200" : "border-slate-100"}`}>
                            <p className="text-xs font-semibold text-slate-700 flex-1 leading-tight">{item}</p>
                            {d?.size && (
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${SIZE_COLORS[d.size]}`}>{d.size}</span>
                            )}
                            {d?.qty > 1 && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md border bg-slate-100 border-slate-200 text-slate-600">x{d.qty}</span>
                            )}
                            <div className="flex gap-1">
                              {CHOICES.map((c) => (
                                <button key={c.id} onClick={() => selectChoice(item, c.id)}
                                  className={`px-2 py-1 rounded-lg text-[9px] font-bold border transition-all ${d?.choice === c.id ? c.color : "bg-white text-slate-400 border-slate-200"}`}>
                                  {c.label}
                                </button>
                              ))}
                            </div>
                          </div>
                          {/* Inline size + qty picker */}
                          {isPrompting && (
                           <div className="mt-1 mb-1 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 space-y-2">
                             <div className="flex items-center gap-2">
                               <span className="text-[10px] font-bold text-slate-500 whitespace-nowrap">Size?</span>
                               <div className="flex gap-1.5 flex-wrap">
                                 {SIZES.map((s) => {
                                   const tooltips = {
                                     Small: "Small items: lamps, picture frames, kitchen items, books, small decor",
                                     Medium: "Medium items: plates, pots, pillows, small furniture like nightstands",
                                     Large: "Large items: dressers, desks, beds, sofas, bulky items",
                                     XL: "XL items: entertainment centers, armoires, heavy appliances, pianos"
                                   };
                                   return (
                                     <div key={s} className="group relative">
                                       <button onClick={() => selectSize(item, s)}
                                         className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border transition-all hover:scale-105 ${SIZE_COLORS[s]}`}>
                                         {s}
                                       </button>
                                       <div className="absolute bottom-full mb-2 hidden group-hover:block bg-slate-800 text-white text-[9px] px-2 py-1 rounded-lg whitespace-nowrap z-10">
                                         {tooltips[s]}
                                         <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                                       </div>
                                     </div>
                                   );
                                 })}
                               </div>
                             </div>
                           </div>
                          )}
                          {/* Qty picker — shown after size chosen */}
                          {d?.size && !isPrompting && (
                            <div className="mt-1 mb-0.5 flex items-center gap-2 pl-2">
                              <span className="text-[10px] font-semibold text-slate-400">Qty:</span>
                              <button onClick={() => changeQty(item, -1)} className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 text-xs font-bold flex items-center justify-center">−</button>
                              <span className="text-xs font-black text-slate-700 w-4 text-center">{d.qty || 1}</span>
                              <button onClick={() => changeQty(item, 1)} className="w-5 h-5 rounded-full bg-orange-100 text-orange-600 text-xs font-bold flex items-center justify-center">+</button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <p className="text-[10px] text-slate-400 text-center mb-4">You can always edit these in the "My Stuff" tab later</p>
            </div>
            )}

        {/* ── AI INSIGHTS ── */}
        {step === "ai_insights" && (
          <div>
            <div className="text-center mb-6">
              <div className="text-4xl mb-2">✨</div>
              <h2 className="text-xl font-black text-slate-900">Your Move Estimates</h2>
              <p className="text-xs text-slate-400 mt-1">Based on your items, here's what to expect.</p>
            </div>

            {!insights && !loadingInsights && (
              <div>
                {showMoverQ ? (
                  <div className="space-y-3">
                    <p className="text-xs font-bold text-slate-700 text-center mb-1">📋 Answer a few mover questions for an accurate quote:</p>

                    <div>
                      <label className="text-[11px] font-bold text-slate-500 mb-1 block">How many floors is your home?</label>
                      <div className="flex gap-2">
                        {["1","2","3+"].map(v => (
                          <button key={v} onClick={() => setMoverQForm(f => ({...f, floors: v}))}
                            className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${moverQForm.floors === v ? "bg-orange-500 text-white border-orange-500" : "bg-white text-slate-600 border-slate-200"}`}>{v}</button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-500 mb-1 block">Stairs to navigate?</label>
                      <div className="flex gap-2 flex-wrap">
                        {["none","a few steps","1 flight","2+ flights"].map(v => (
                          <button key={v} onClick={() => setMoverQForm(f => ({...f, stairs: v}))}
                            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${moverQForm.stairs === v ? "bg-orange-500 text-white border-orange-500" : "bg-white text-slate-600 border-slate-200"}`}>{v}</button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-500 mb-1 block">Elevator available?</label>
                      <div className="flex gap-2">
                        {["yes","no"].map(v => (
                          <button key={v} onClick={() => setMoverQForm(f => ({...f, elevator: v}))}
                            className={`flex-1 py-2 rounded-xl text-xs font-bold border capitalize transition-all ${moverQForm.elevator === v ? "bg-orange-500 text-white border-orange-500" : "bg-white text-slate-600 border-slate-200"}`}>{v}</button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-500 mb-1 block">Walking distance from door to truck?</label>
                      <div className="flex gap-2 flex-wrap">
                        {["under 50 ft","50–100 ft","100–200 ft","200+ ft"].map(v => (
                          <button key={v} onClick={() => setMoverQForm(f => ({...f, walk_distance: v}))}
                            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${moverQForm.walk_distance === v ? "bg-orange-500 text-white border-orange-500" : "bg-white text-slate-600 border-slate-200"}`}>{v}</button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-500 mb-1 block">Truck parking situation?</label>
                      <div className="flex gap-2 flex-wrap">
                        {["driveway","street","loading dock","tight/limited"].map(v => (
                          <button key={v} onClick={() => setMoverQForm(f => ({...f, parking: v}))}
                            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${moverQForm.parking === v ? "bg-orange-500 text-white border-orange-500" : "bg-white text-slate-600 border-slate-200"}`}>{v}</button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-500 mb-1 block">Distance from old home to new home?</label>
                      <div className="flex gap-2 flex-wrap">
                        {["local (under 50 miles)","50–150 miles","150–500 miles","500+ miles (long distance)"].map(v => (
                          <button key={v} onClick={() => setMoverQForm(f => ({...f, move_distance: v}))}
                            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${moverQForm.move_distance === v ? "bg-orange-500 text-white border-orange-500" : "bg-white text-slate-600 border-slate-200"}`}>{v}</button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-500 mb-1 block">Hanging clothes & wardrobes? <span className="text-slate-400 font-normal">(helps calculate wardrobe boxes)</span></label>
                      <div className="flex gap-2 flex-wrap">
                        {["None/minimal", "Some closets", "Full closets", "Very full"].map(v => (
                          <button key={v} onClick={() => setMoverQForm(f => ({...f, hanging_clothes: v}))}
                            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${moverQForm.hanging_clothes === v ? "bg-orange-500 text-white border-orange-500" : "bg-white text-slate-600 border-slate-200"}`}>{v}</button>
                        ))}
                      </div>
                      <p className="text-[9px] text-slate-400 mt-1">📦 Wardrobe boxes keep your clothes on hangers — saves time & wrinkles during the move</p>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-500 mb-1 block">Any extra-heavy or special items? <span className="text-slate-400 font-normal">(piano, safe, pool table…)</span></label>
                      <input
                        value={moverQForm.special_items}
                        onChange={e => setMoverQForm(f => ({...f, special_items: e.target.value}))}
                        placeholder="e.g. piano, gun safe — or leave blank"
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs"
                      />
                    </div>

                    <button
                      onClick={() => { setMoverQ(moverQForm); setShowMoverQ(false); persist({ moverQ: moverQForm }); }}
                      className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-sm shadow-lg shadow-orange-200 flex items-center justify-center gap-2">
                      <Sparkles className="w-4 h-4" /> Continue to Estimate →
                    </button>
                    <button onClick={() => goTo(3)} className="w-full py-2 text-[11px] font-semibold text-slate-400 hover:text-slate-600 transition-colors">Skip for now →</button>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 mb-4 text-left space-y-1">
                      <p className="text-[11px] font-bold text-slate-600">📋 Your job details:</p>
                      {[`Floors: ${moverQ?.floors}`, `Stairs: ${moverQ?.stairs}`, `Elevator: ${moverQ?.elevator}`, `Walk to truck: ${moverQ?.walk_distance}`, `Parking: ${moverQ?.parking}`, `Move distance: ${moverQ?.move_distance}`, moverQ?.special_items && `Special items: ${moverQ.special_items}`].filter(Boolean).map((line, i) => (
                        <p key={i} className="text-[10px] text-slate-500">{line}</p>
                      ))}
                      <button onClick={() => setShowMoverQ(true)} className="text-[10px] font-bold text-orange-500 mt-1">Edit →</button>
                    </div>
                    <button onClick={loadInsights} className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold text-sm shadow-lg shadow-purple-200 flex items-center justify-center gap-2 mb-3">
                      <Sparkles className="w-4 h-4" /> Generate My Mover Estimate
                    </button>
                    <button onClick={() => goTo(3)} className="w-full py-2 text-[11px] font-semibold text-slate-400 hover:text-slate-600 transition-colors">Skip for now →</button>
                  </div>
                )}
              </div>
            )}

            {loadingInsights && (
              <div className="flex flex-col items-center py-10 gap-3">
                <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                <p className="text-sm text-slate-500">Calculating your estimates…</p>
              </div>
            )}

            {insights && !loadingInsights && (
              <div>
                {/* Weight + Cost row */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Truck className="w-3.5 h-3.5 text-orange-500" />
                      <p className="text-[10px] font-bold text-orange-600 uppercase tracking-wide">Est. Weight</p>
                    </div>
                    <p className="text-2xl font-black text-slate-800">{insights.move_weight_lbs?.toLocaleString() || "—"}</p>
                    <p className="text-[10px] text-slate-400 font-semibold">lbs total</p>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
                    <div className="flex items-center gap-1.5 mb-1">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                      <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide">Move Cost</p>
                    </div>
                    <p className="text-lg font-black text-slate-800">${insights.move_cost_low?.toLocaleString()}–${insights.move_cost_high?.toLocaleString()}</p>
                    <p className="text-[10px] text-slate-400 font-semibold">estimated range</p>
                  </div>
                </div>

                {/* Truck size + Hours */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  {insights.truck_size && (
                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Truck className="w-3.5 h-3.5 text-blue-500" />
                        <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wide">Truck Size</p>
                      </div>
                      <p className="text-2xl font-black text-slate-800">{insights.truck_size}</p>
                      <p className="text-[10px] text-slate-400 font-semibold">recommended</p>
                    </div>
                  )}
                  {insights.estimated_hours > 0 && (
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Sparkles className="w-3.5 h-3.5 text-slate-500" />
                        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wide">Est. Hours</p>
                      </div>
                      <p className="text-2xl font-black text-slate-800">{insights.estimated_hours}</p>
                      <p className="text-[10px] text-slate-400 font-semibold">hours to complete</p>
                    </div>
                  )}
                </div>

                {/* Box breakdown */}
                {(insights.boxes_small > 0 || insights.boxes_medium > 0 || insights.boxes_large > 0 || insights.boxes_wardrobe > 0) && (
                  <div className="bg-amber-50 border border-amber-100 rounded-2xl overflow-hidden mb-3">
                    <div className="px-4 py-2 border-b border-amber-100">
                      <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wide">📦 Boxes You'll Need</p>
                    </div>
                    <div className="grid grid-cols-4 gap-px bg-amber-100">
                      {[
                        { label: "Small", qty: insights.boxes_small, sub: "books, kitchen" },
                        { label: "Medium", qty: insights.boxes_medium, sub: "general items" },
                        { label: "Large", qty: insights.boxes_large, sub: "bulky items" },
                        { label: "Wardrobe", qty: insights.boxes_wardrobe, sub: "hanging clothes" },
                      ].map(b => (
                        <div key={b.label} className="bg-white px-2 py-3 text-center">
                          <p className="text-lg font-black text-amber-600">{b.qty || 0}</p>
                          <p className="text-[9px] font-bold text-slate-600">{b.label}</p>
                          <p className="text-[8px] text-slate-400 leading-tight">{b.sub}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {insights.tax_writeoff > 0 && (
                  <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4 mb-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <DollarSign className="w-3.5 h-3.5 text-purple-500" />
                      <p className="text-[10px] font-bold text-purple-600 uppercase tracking-wide">Estimated Tax Write-Off</p>
                    </div>
                    <p className="text-2xl font-black text-slate-800">${insights.tax_writeoff?.toLocaleString()}</p>
                    <p className="text-[10px] text-slate-400 font-semibold">IRS fair market value for donated items</p>
                  </div>
                )}

                {insights.tip && (
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 mb-5 flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-slate-600 font-semibold leading-relaxed">{insights.tip}</p>
                  </div>
                )}

                </div>
                )}
                </div>
                )}

        {/* ── ESTATE SALE ── */}
        {step === "estate_sale" && (
          <div className="text-center">
            <div className="text-5xl mb-4">🏷️</div>
            <h2 className="text-xl font-black text-slate-900 mb-2">Do you need an Estate Sale?</h2>
            <p className="text-sm text-slate-500 leading-relaxed mb-3">If you have furniture or valuables you want to sell, a professional estate sale company can handle it for you.</p>
            <div className="bg-purple-50 border border-purple-200 rounded-2xl px-4 py-3 mb-6 flex items-start gap-2 text-left">
              <Sparkles className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-purple-700 font-semibold">Say Yes and we'll find top-rated estate sale companies near you right now.</p>
            </div>

            {loadingAI && (
              <div className="flex flex-col items-center py-8 gap-3">
                <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                <p className="text-sm text-slate-500">Finding estate sale companies near you…</p>
              </div>
            )}

            {!loadingAI && needsEstate === null && (
              <div className="space-y-3">
                <button onClick={() => handleEstateAnswer(true)} className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-sm shadow-lg shadow-orange-200">
                  Yes, I need an estate sale
                </button>
                <button onClick={() => handleEstateAnswer(false)} className="w-full py-3.5 rounded-2xl border-2 border-slate-200 text-slate-700 font-bold text-sm">
                  No, I'll handle items myself
                </button>
              </div>
            )}

            {!loadingAI && needsEstate !== null && (
              <div>
                {providers.length > 0 && (
                  <div className="space-y-2 mb-5 text-left">
                    {providers.map((p, i) => (
                      <div key={i} className={`bg-white border rounded-2xl p-4 shadow-sm transition-all ${selectedEstate === p.name ? "border-purple-400 ring-1 ring-purple-300" : "border-slate-100"}`}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="font-bold text-slate-800 text-sm">{p.name}</p>
                            {p.rating && (
                              <div className="flex items-center gap-1 mt-0.5">
                                {[1,2,3,4,5].map(star => (
                                  <span key={star} className={`text-xs ${star <= Math.round(parseFloat(p.rating)) ? 'text-amber-400' : 'text-slate-200'}`}>★</span>
                                ))}
                                <span className="text-[10px] text-slate-400 font-semibold ml-0.5">{p.rating}</span>
                              </div>
                            )}
                            {p.description && <p className="text-xs text-slate-500 mt-0.5">{p.description}</p>}
                            {p.phone && <a href={`tel:${p.phone}`} className="text-xs font-bold text-orange-500 flex items-center gap-1 mt-1"><Phone className="w-3 h-3" />{p.phone}</a>}
                          </div>
                          <button
                            onClick={() => selectEstateProvider(p)}
                            className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all ${
                              selectedEstate === p.name
                                ? "bg-purple-500 text-white border-purple-500"
                                : "bg-white text-purple-600 border-purple-300 hover:bg-purple-50"
                            }`}>
                            {selectedEstate === p.name ? <><CheckCircle2 className="w-3 h-3" /> Selected</> : "Select"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {selectedEstate && (
                  <div className="bg-purple-50 border border-purple-200 rounded-2xl px-4 py-2.5 mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-500 flex-shrink-0" />
                    <p className="text-xs font-bold text-purple-700">{selectedEstate} saved to your dashboard contacts!</p>
                  </div>
                )}
                {needsEstate === false && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3 mb-5">
                    <p className="text-sm font-bold text-emerald-700">Got it — we'll skip estate sale planning.</p>
                  </div>
                )}
                </div>
                )}
                </div>
                )}

        {/* ── MOVERS ── */}
        {step === "movers" && (
          <div className="text-center">
            <div className="text-5xl mb-4">🚛</div>
            <h2 className="text-xl font-black text-slate-900 mb-2">Will you need a mover?</h2>
            <p className="text-sm text-slate-500 leading-relaxed mb-3">Getting quotes early ensures you lock in a good date and price.</p>
            <div className="bg-purple-50 border border-purple-200 rounded-2xl px-4 py-3 mb-6 flex items-start gap-2 text-left">
              <Sparkles className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-purple-700 font-semibold">Say Yes and we'll find top-rated local movers near you — and save them to your contacts.</p>
            </div>

            {loadingAI && (
              <div className="flex flex-col items-center py-8 gap-3">
                <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                <p className="text-sm text-slate-500">Finding movers & saving to contacts…</p>
              </div>
            )}

            {!loadingAI && needsMover === null && (
              <div className="space-y-3">
                <button onClick={() => handleMoverAnswer(true)} className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-sm shadow-lg shadow-orange-200">
                  Yes, I need a mover
                </button>
                <button onClick={() => handleMoverAnswer(false)} className="w-full py-3.5 rounded-2xl border-2 border-slate-200 text-slate-700 font-bold text-sm">
                  No, I'll move myself
                </button>
              </div>
            )}

            {!loadingAI && needsMover !== null && (
              <div>
                {providers.length > 0 && (
                  <div className="space-y-2 mb-3 text-left">
                    <p className="text-xs font-bold text-slate-500 mb-2 text-center">Select one to save to your contacts:</p>
                    {providers.map((p, i) => (
                      <div key={i} className={`bg-white border rounded-2xl p-4 shadow-sm transition-all ${selectedMover === p.name ? "border-orange-400 ring-1 ring-orange-300" : "border-slate-100"}`}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="font-bold text-slate-800 text-sm">{p.name}</p>
                            {p.rating && (
                              <div className="flex items-center gap-1 mt-0.5">
                                {[1,2,3,4,5].map(star => (
                                  <span key={star} className={`text-xs ${star <= Math.round(parseFloat(p.rating)) ? 'text-amber-400' : 'text-slate-200'}`}>★</span>
                                ))}
                                <span className="text-[10px] text-slate-400 font-semibold ml-0.5">{p.rating}</span>
                              </div>
                            )}
                            {p.description && <p className="text-xs text-slate-500 mt-0.5">{p.description}</p>}
                            {p.phone && <a href={`tel:${p.phone}`} className="text-xs font-bold text-orange-500 flex items-center gap-1 mt-1"><Phone className="w-3 h-3" />{p.phone}</a>}
                          </div>
                          <button
                            onClick={() => selectMoverProvider(p)}
                            className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all ${
                              selectedMover === p.name
                                ? "bg-orange-500 text-white border-orange-500"
                                : "bg-white text-orange-600 border-orange-300 hover:bg-orange-50"
                            }`}>
                            {selectedMover === p.name ? <><CheckCircle2 className="w-3 h-3" /> Selected</> : "Select"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {moversSaved && selectedMover && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-2.5 mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <p className="text-xs font-bold text-emerald-700">{selectedMover} saved to your dashboard contacts!</p>
                  </div>
                )}
                {providers.length > 0 && !selectedMover && (
                  <p className="text-[11px] text-amber-600 font-semibold text-center mb-2">Please select a mover to continue</p>
                )}
                {needsMover === false && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3 mb-4">
                    <p className="text-sm font-bold text-emerald-700">Great — we'll focus your plan on packing & logistics.</p>
                  </div>
                )}
                </div>
                )}
                </div>
                )}

        {/* ── CLOSING DETAILS ── */}
        {step === "closing_details" && (
          <div>
            <div className="text-center mb-6">
              <div className="text-5xl mb-4">📅</div>
              <h2 className="text-xl font-black text-slate-900 mb-2">Closing & Walkthrough</h2>
              <p className="text-sm text-slate-500 leading-relaxed">Set dates and add key contacts so you don't miss critical deadlines.</p>
            </div>

            <div className="space-y-4 mb-6">
              {/* Closing Date Display */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3">
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide mb-0.5">📍 Closing Date</p>
                {user?.estimated_close_date ? (
                  <p className="text-sm font-black text-emerald-700">{new Date(user.estimated_close_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                ) : (
                  <p className="text-xs text-emerald-600 italic">No closing date set</p>
                )}
              </div>

              {/* Closing Time & Location */}
              <div className="space-y-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 mb-1 block">Closing Time (optional)</label>
                  <input
                    type="time"
                    value={closingDetails.closing_time}
                    onChange={e => setClosingDetails(d => ({...d, closing_time: e.target.value}))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 mb-1 block">Closing Location (optional)</label>
                  <input
                    type="text"
                    value={closingDetails.closing_location}
                    onChange={e => setClosingDetails(d => ({...d, closing_location: e.target.value}))}
                    placeholder="e.g., Title Company Office, 123 Main St"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              {/* Walkthrough Date */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 mb-1 block">📸 Final Walkthrough Date *</label>
                <input
                  type="date"
                  value={closingDetails.walkthrough_date}
                  onChange={e => setClosingDetails(d => ({...d, walkthrough_date: e.target.value}))}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs"
                  required
                />
                <p className="text-[10px] text-slate-400 mt-1">Usually 24-48 hours before closing</p>
              </div>

              {/* Lawyer Contact */}
              <div className="bg-purple-50 border border-purple-200 rounded-2xl p-3.5 space-y-2">
                <p className="text-[11px] font-bold text-purple-700 uppercase tracking-wide">⚖️ Closing Attorney / Lawyer</p>
                <input
                  type="text"
                  value={closingDetails.lawyer_name}
                  onChange={e => setClosingDetails(d => ({...d, lawyer_name: e.target.value}))}
                  placeholder="Full name"
                  className="w-full px-3 py-2.5 rounded-xl border border-purple-200 text-xs placeholder-slate-300"
                />
                <input
                  type="tel"
                  value={closingDetails.lawyer_phone}
                  onChange={e => setClosingDetails(d => ({...d, lawyer_phone: e.target.value}))}
                  placeholder="Phone number"
                  className="w-full px-3 py-2.5 rounded-xl border border-purple-200 text-xs placeholder-slate-300"
                />
              </div>
            </div>

            </div>
            )}

        {/* ── DONE ── */}
        {step === "done" && (
          <div className="text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">You're all set!</h2>
            <p className="text-sm text-slate-500 leading-relaxed mb-6">Your Week 1 plan is built. Everything is saved and ready.</p>
            <div className="space-y-2 mb-8">
              {[
                "Your Week 1 tasks are ready in My Move",
                "My Stuff tab is pre-loaded with sizes & categories",
                "Move cost & tax write-off estimates are saved",
                "Movers are in your dashboard contacts",
              ].map((tip, i) => (
                <div key={i} className="flex items-center gap-2 bg-emerald-50 rounded-2xl px-4 py-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <p className="text-[11px] font-semibold text-emerald-700 text-left">{tip}</p>
                </div>
              ))}
            </div>
            <button onClick={finish} className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-black text-sm shadow-lg shadow-orange-200 flex items-center justify-center gap-2">
              Go to My Dashboard 🎉
            </button>
          </div>
        )}
      </div>

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-4 py-4 shadow-lg flex items-center justify-center z-40 max-w-md mx-auto">
        <div className="w-full">
          {step === "welcome" && (
            <button onClick={() => goTo(1)} className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-black text-sm shadow-lg shadow-orange-200 flex items-center justify-center gap-2">
              Let's Get Started <ChevronRight className="w-4 h-4" />
            </button>
          )}
          {step === "moving_question" && (
            <div className="space-y-2">
              <button onClick={() => { setIsMoving(true); persist({ isMoving: true }); goTo(2); }} className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-sm shadow-lg shadow-orange-200">
                ✅ Yes, I'm moving to a new place
              </button>
              <button onClick={() => { setIsMoving(false); persist({ isMoving: false }); goTo(7); }} className="w-full py-3.5 rounded-2xl border-2 border-slate-200 text-slate-700 font-bold text-sm">
                ❌ No, I'm staying put
              </button>
              <button onClick={() => goTo(2)} className="w-full py-3.5 rounded-2xl border-2 border-slate-200 text-slate-700 font-bold text-sm">
                ⏭️ Skip
              </button>
            </div>
          )}
          {step === "mileage_distance" && !showMileageInput && (
            <div className="space-y-2">
              <button onClick={() => setShowMileageInput(true)} className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-sm shadow-lg shadow-orange-200">
                ✅ Yes
              </button>
              <button onClick={() => { setMoveDistanceMiles(null); persist({ moveDistanceMiles: null }); goTo(3); }} className="w-full py-3.5 rounded-2xl border-2 border-slate-200 text-slate-700 font-bold text-sm">
                ❌ No
              </button>
              <button onClick={() => { setMoveDistanceMiles(null); persist({ moveDistanceMiles: null }); goTo(3); }} className="w-full py-3.5 rounded-2xl border-2 border-slate-200 text-slate-700 font-bold text-sm">
                ⏭️ Skip
              </button>
            </div>
          )}
          {step === "mileage_distance" && showMileageInput && (
            <div className="space-y-2">
              <button onClick={() => { const val = mileageInputValue.trim() ? parseInt(mileageInputValue) : null; setMoveDistanceMiles(val); persist({ moveDistanceMiles: val }); goTo(3); }} disabled={!mileageInputValue.trim()} className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-sm shadow-lg shadow-orange-200 disabled:opacity-40 disabled:cursor-not-allowed">
                Continue →
              </button>
              <button onClick={() => { setShowMileageInput(false); setMileageInputValue(""); }} className="w-full py-3.5 rounded-2xl border-2 border-slate-200 text-slate-700 font-bold text-sm">
                Cancel
              </button>
            </div>
          )}
          {step === "stays_goes" && (
            <div className="flex gap-3">
              <button onClick={() => goTo(2)} className="flex items-center gap-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-500 font-bold text-sm">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => goTo(4)} className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-sm shadow-lg shadow-orange-200 flex items-center justify-center gap-2">
                Continue <ChevronRight className="w-4 h-4" />
              </button>
              <button onClick={() => goTo(4)} className="px-4 py-3 rounded-xl border border-slate-200 text-slate-500 font-bold text-sm hover:bg-slate-50 transition-colors">
                Skip
              </button>
            </div>
          )}
          {step === "ai_insights" && (
            <div className="flex gap-3">
              <button onClick={() => goTo(3)} className="flex items-center gap-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-500 font-bold text-sm">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => goTo(5)} className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-sm shadow-lg shadow-orange-200 flex items-center justify-center gap-2">
                Continue <ChevronRight className="w-4 h-4" />
              </button>
              <button onClick={() => goTo(5)} className="px-4 py-3 rounded-xl border border-slate-200 text-slate-500 font-bold text-sm hover:bg-slate-50 transition-colors">
                Skip
              </button>
            </div>
          )}
          {step === "estate_sale" && needsEstate !== null && (
            <div className="flex gap-3">
              <button onClick={() => { setNeedsEstate(null); setProviders([]); }} className="flex items-center gap-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-500 font-bold text-sm">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => goTo(5)} className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-sm shadow-lg shadow-orange-200 flex items-center justify-center gap-2">
                Continue <ChevronRight className="w-4 h-4" />
              </button>
              <button onClick={() => goTo(5)} className="px-4 py-3 rounded-xl border border-slate-200 text-slate-500 font-bold text-sm hover:bg-slate-50 transition-colors">
                Skip
              </button>
            </div>
          )}
          {step === "movers" && needsMover !== null && (
            <div className="flex gap-3">
              <button onClick={() => { setNeedsMover(null); setProviders([]); setMoversSaved(false); }} className="flex items-center gap-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-500 font-bold text-sm">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => goTo(6)} disabled={needsMover && providers.length > 0 && !selectedMover} className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-sm shadow-lg shadow-orange-200 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
                Continue <ChevronRight className="w-4 h-4" />
              </button>
              <button onClick={() => goTo(6)} className="px-4 py-3 rounded-xl border border-slate-200 text-slate-500 font-bold text-sm hover:bg-slate-50 transition-colors">
                Skip
              </button>
            </div>
          )}
          {step === "closing_details" && (
            <div className="flex gap-3">
              <button onClick={() => goTo(5)} className="flex items-center gap-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-500 font-bold text-sm">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => { persist({ closingDetails }); goTo(8); }} className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-sm shadow-lg shadow-orange-200 flex items-center justify-center gap-2">
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
          {step === "done" && (
            <button onClick={finish} className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-black text-sm shadow-lg shadow-orange-200 flex items-center justify-center gap-2">
              Go to My Dashboard 🎉
            </button>
          )}
          </div>
          </div>
          </div>
          );
          }