import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { differenceInDays, parseISO, addDays, format, isWithinInterval, startOfWeek, endOfWeek } from "date-fns";
import { CalendarDays, Phone, X, Save, ChevronDown, ChevronUp } from "lucide-react";

import ChecklistItemCard from "./ChecklistItemCard";
import WeekWalkthrough from "./WeekWalkthrough";
import MoveDirectory from "./MoveDirectory";

const BASE_WEEKS = {
  1: {
    title: "Week 1 — Foundation",
    subtitle: "Invite day! Get clarity and line up the big moving pieces.",
    items: [
      { id: "w1-1", title: "Confirm what stays vs. goes", description: "Furniture, appliances, personal items", ai_search_query: null, inventory_walkthrough: true },
      { id: "w1-2", title: "Start donation / sell pile", description: "What's worth selling vs. donating", ai_search_query: null },
      { id: "w1-3", title: "Estate sale decision", description: "Find local estate sale professionals", ai_search_query: "top rated estate sale professionals near me" },
      { id: "w1-4", title: "Request mover quotes", description: "Compare 3 top-rated movers side by side", ai_search_query: "top rated local movers near me" },
    ]
  },
  2: {
    title: "Week 2 — Clearing & Logistics",
    subtitle: "Reduce clutter and lock in logistics.",
    items: [
      { id: "w2-1", title: "Finalize mover", description: "Confirm date aligned with closing timeline", ai_search_query: null },
      { id: "w2-2", title: "Schedule estate sale", description: "Suggested date based on close date", ai_search_query: null },
      { id: "w2-3", title: "Order packing supplies", description: "Boxes, labels, tape, wardrobe boxes", ai_search_query: null },
      { id: "w2-4", title: "Begin packing non-essentials", description: "Seasonal items, storage rooms, decor", ai_search_query: null },
      { id: "w2-5", title: "Utility planning", description: "Start list of utilities to transfer/cancel", ai_search_query: null },
    ]
  },
  3: {
    title: "Week 3 — Home Prep",
    subtitle: "Make the house buyer-ready with minimal effort.",
    items: [
      { id: "w3-1", title: "Patch & repair checklist", description: "Nail holes, touch-ups, minor fixes", ai_search_query: null },
      { id: "w3-2", title: "Painting (if needed)", description: "Find top-rated painters, neutral color guidance", ai_search_query: "top rated painters near me" },
      { id: "w3-3", title: "Deep cleaning", description: "Kitchen, baths, windows, appliances", ai_search_query: "professional house cleaning near me" },
      { id: "w3-4", title: "Junk removal", description: "Same-day or next-day local haulers", ai_search_query: "local junk removal same day near me" },
    ]
  },
  4: {
    title: "Week 4 — Final Move & Close",
    subtitle: "Zero chaos. Zero surprises.",
    items: [
      { id: "w4-1", title: "Final packing", description: "Daily mini-checklists so nothing piles up", ai_search_query: null },
      { id: "w4-2", title: "Move-out day guidance", description: "What stays, what leaves, final walkthrough prep", ai_search_query: null },
      { id: "w4-3", title: "Utility transfers", description: "Electric, water, gas, internet", ai_search_query: null },
      { id: "w4-5", title: "Cancel security system", description: "Contact provider to terminate or transfer service", ai_search_query: null },
      { id: "w4-6", title: "Cancel electric service", description: "Schedule final meter reading and disconnect date", ai_search_query: null },
      { id: "w4-7", title: "Cancel gas service", description: "Arrange final billing and service end date", ai_search_query: null },
      { id: "w4-8", title: "Cancel internet/cable", description: "Return equipment and close account", ai_search_query: null },
      { id: "w4-9", title: "Cancel homeowners insurance", description: "Notify insurance company of sale date", ai_search_query: null },
      { id: "w4-10", title: "Forward mail", description: "Set up USPS mail forwarding to new address", ai_search_query: null },
      { id: "w4-11", title: "Cancel lawn/pool service", description: "End recurring maintenance contracts", ai_search_query: null },
      { id: "w4-12", title: "Return garage/gate remotes", description: "Gather all access devices for new owner", ai_search_query: null },
      { id: "w4-13", title: "Leave manuals & warranties", description: "Organize appliance docs for buyer", ai_search_query: null },
      { id: "w4-4", title: "Final clean", description: "Quick refresh before buyer walkthrough", ai_search_query: "professional house cleaning near me" },
      { id: "w4-14", title: "Closing day checklist", description: "Keys, remotes, final walkthrough ✅", ai_search_query: null },
    ]
  }
};

function getWeeksConfig(user) {
  if (!user?.estimated_close_date || !user?.registration_date) return { totalWeeks: 4, weeksData: BASE_WEEKS };

  const totalDays = differenceInDays(parseISO(user.estimated_close_date), parseISO(user.registration_date));
  const totalWeeks = Math.max(1, Math.min(8, Math.ceil(totalDays / 7)));

  if (totalWeeks <= 4) {
    // Compress into fewer weeks
    const weeksData = {};
    const allItems = Object.values(BASE_WEEKS).flatMap(w => w.items);
    const itemsPerWeek = Math.ceil(allItems.length / totalWeeks);
    for (let w = 1; w <= totalWeeks; w++) {
      const slice = allItems.slice((w - 1) * itemsPerWeek, w * itemsPerWeek);
      weeksData[w] = {
        title: w === 1 ? `Week 1 — Foundation` : w === totalWeeks ? `Week ${w} — Close Week` : `Week ${w}`,
        subtitle: w === 1 ? "Invite day! Start here." : `${totalWeeks - w + 1} week(s) to close.`,
        items: slice.map((item, i) => ({ ...item, id: `w${w}-${i}` })),
      };
    }
    return { totalWeeks, weeksData };
  } else {
    // Extend — repeat home prep and packing weeks
    const weeksData = { ...BASE_WEEKS };
    for (let w = 5; w <= totalWeeks; w++) {
      weeksData[w] = {
        title: `Week ${w} — Extended Prep`,
        subtitle: "Extra time to get organized before close.",
        items: [
          { id: `w${w}-1`, title: "Review and organize remaining items", description: "Go through each room" },
          { id: `w${w}-2`, title: "Continue packing non-essentials", description: "Stay ahead of the timeline" },
          { id: `w${w}-3`, title: "Confirm all service appointments", description: "Movers, cleaners, painters" },
        ]
      };
    }
    return { totalWeeks, weeksData };
  }
}

export default function ChecklistPanel({ user, onProviderSaved }) {
  const { totalWeeks, weeksData } = getWeeksConfig(user);
  const currentWeek = (() => {
    if (!user?.estimated_close_date || !user?.registration_date) return 1;
    const totalDays = differenceInDays(parseISO(user.estimated_close_date), parseISO(user.registration_date));
    const elapsed = differenceInDays(new Date(), parseISO(user.registration_date));
    return Math.min(totalWeeks, Math.max(1, Math.ceil((elapsed / totalDays) * totalWeeks)));
  })();

  // Calculate estimated total cost from user profile
  const estimatedCost = (() => {
    let total = 0;
    if (user?.packing_supplies_cost) total += parseFloat(user.packing_supplies_cost);
    if (user?.moving_supplies_cost) total += parseFloat(user.moving_supplies_cost);
    return total;
  })();

  const [activeWeek, setActiveWeek] = useState(currentWeek);
  const [completedIds, setCompletedIds] = useState(new Set());
  const [removedIds, setRemovedIds] = useState(new Set());
  const [customItems, setCustomItems] = useState({});
  const [userSelections, setUserSelections] = useState({});
  const [addingTask, setAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const [walkthroughWeek, setWalkthroughWeek] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [expandedWeeks, setExpandedWeeks] = useState(new Set([currentWeek]));

  useEffect(() => {
    if (!user) return;
    Promise.all([
      base44.entities.Appointment.filter({ user_id: user.id }),
      base44.entities.Contact.filter({ user_id: user.id })
    ]).then(([appts, cnts]) => {
      setAppointments(appts);
      setContacts(cnts);
    });
  }, [user]);

  useEffect(() => {
    const saved = localStorage.getItem(`checklist_complete_${user?.id}`);
    const savedRemoved = localStorage.getItem(`checklist_removed_${user?.id}`);
    const savedCustom = localStorage.getItem(`checklist_custom_${user?.id}`);
    const savedSelections = localStorage.getItem(`user_selections_${user?.id}`);
    const onboardingAnswers = localStorage.getItem(`week1_answers_${user?.id}`);
    
    if (saved) setCompletedIds(new Set(JSON.parse(saved)));
    if (savedRemoved) setRemovedIds(new Set(JSON.parse(savedRemoved)));
    if (savedCustom) setCustomItems(JSON.parse(savedCustom));
    
    // Initialize selections from onboarding answers first
    let initSelections = {};
    if (onboardingAnswers) {
      const answers = JSON.parse(onboardingAnswers);
      Object.entries(answers).forEach(([id, answer]) => {
        initSelections[id] = answer; // "yes", "maybe", or "skip"
      });
    }
    
    // Merge with saved selections (saved ones take precedence)
    if (savedSelections) {
      initSelections = { ...initSelections, ...JSON.parse(savedSelections) };
    }
    
    setUserSelections(initSelections);
  }, [user?.id]);

  // Mark Week 1 as already set up (done during registration)
  useEffect(() => {
    if (!user?.id) return;
    const week1Done = localStorage.getItem(`walkthrough_done_w1_${user.id}`);
    if (!week1Done) {
      localStorage.setItem(`walkthrough_done_w1_${user.id}`, "1");
    }
  }, [user?.id]);

  // Check if walkthrough needed - trigger on Friday before the week starts
  useEffect(() => {
    if (!user?.id || !user?.registration_date) return;
    
    const now = new Date();
    const regDate = parseISO(user.registration_date);
    
    // For each week 2+, check if we should trigger the walkthrough
    for (let weekNum = 2; weekNum <= totalWeeks; weekNum++) {
      const walkthroughDone = localStorage.getItem(`walkthrough_done_w${weekNum}_${user.id}`);
      if (walkthroughDone) continue;
      
      // Calculate the Friday before the week starts
      const weekStartDate = addDays(regDate, (weekNum - 1) * 7);
      const fridayBefore = addDays(weekStartDate, -3); // 3 days before Monday = Friday
      
      // Trigger if today is on or after that Friday and before the week starts
      if (now >= fridayBefore && now < weekStartDate) {
        setWalkthroughWeek(weekNum);
        setShowWalkthrough(true);
        break; // Only show one at a time
      }
    }
  }, [user?.id, user?.registration_date, totalWeeks]);

  // Allow users to manually launch future week setup
  const launchWeekSetup = (weekNum) => {
    setWalkthroughWeek(weekNum);
    setShowWalkthrough(true);
  };

  const handleWalkthroughDone = (answers) => {
    // Store user selections: yes, maybe, skip
    const newSelections = { ...userSelections, ...answers };
    setUserSelections(newSelections);
    localStorage.setItem(`user_selections_${user.id}`, JSON.stringify(newSelections));
    localStorage.setItem(`walkthrough_done_w${walkthroughWeek}_${user.id}`, "1");
    setShowWalkthrough(false);
    setWalkthroughWeek(null);
  };

  const persist = (completed, removed, custom) => {
    if (!user?.id) return;
    localStorage.setItem(`checklist_complete_${user.id}`, JSON.stringify([...completed]));
    localStorage.setItem(`checklist_removed_${user.id}`, JSON.stringify([...removed]));
    localStorage.setItem(`checklist_custom_${user.id}`, JSON.stringify(custom));
  };

  const handleComplete = (id) => {
    setCompletedIds(s => {
      const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id);
      persist(n, removedIds, customItems); return n;
    });
  };

  const handleRemove = (id) => {
    setRemovedIds(s => { const n = new Set(s); n.add(id); persist(completedIds, n, customItems); return n; });
    setCompletedIds(s => { const n = new Set(s); n.delete(id); return n; });
  };

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    const id = `custom-${activeWeek}-${Date.now()}`;
    const updated = { ...customItems, [activeWeek]: [...(customItems[activeWeek] || []), { id, title: newTaskTitle.trim(), description: newTaskDesc.trim(), custom: true }] };
    setCustomItems(updated);
    persist(completedIds, removedIds, updated);
    setNewTaskTitle(""); setNewTaskDesc(""); setAddingTask(false);
  };

  // Check if the first task of the current week is done (Day 1 gate)
  const currentWeekData = weeksData[currentWeek];
  const currentWeekFirstItemId = currentWeekData?.items?.[0]?.id;
  const day1Done = currentWeekFirstItemId ? completedIds.has(currentWeekFirstItemId) : true;

  // Future weeks are never locked — users can jump freely
  const isWeekLocked = (_w) => false;

  const weekData = weeksData[activeWeek];
  // Only show items user selected "yes" for, plus custom items
  const allItems = [
    ...(weekData?.items || []).filter(i => userSelections[i.id] === "yes"),
    ...(customItems[activeWeek] || [])
  ];
  // Include "maybe" items as grayed out
  const maybeItems = (weekData?.items || []).filter(i => userSelections[i.id] === "maybe");
  const completed = allItems.filter(i => completedIds.has(i.id)).length;
  const progress = allItems.length ? Math.round((completed / allItems.length) * 100) : 0;

  // Week date range
  const weekDateRange = (() => {
    if (!user?.registration_date) return null;
    const start = addDays(parseISO(user.registration_date), (activeWeek - 1) * 7);
    const end = addDays(start, 6);
    return `${format(start, "MMM d")} – ${format(end, "MMM d")}`;
  })();

  return (
    <div className="space-y-4">
      {showWalkthrough && walkthroughWeek && (
        <WeekWalkthrough
          weekData={weeksData[walkthroughWeek]}
          weekNum={walkthroughWeek}
          onDone={handleWalkthroughDone}
        />
      )}
      
      {/* Move Directory */}
      <MoveDirectory user={user} contacts={contacts} onContactsChange={setContacts} />

      {/* Appointment Edit Modal */}
      {showAppointmentModal && selectedAppointment && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center">
          <div className="w-full max-w-md bg-white rounded-t-3xl shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-100 px-5 py-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">Edit Appointment</h3>
              <button
                onClick={() => { setShowAppointmentModal(false); setSelectedAppointment(null); }}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center"
              >
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Title *</label>
                <input
                  value={selectedAppointment.title}
                  onChange={(e) => setSelectedAppointment({...selectedAppointment, title: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Provider Name</label>
                <input
                  value={selectedAppointment.provider_name || ""}
                  onChange={(e) => setSelectedAppointment({...selectedAppointment, provider_name: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Phone</label>
                <input
                  value={selectedAppointment.phone || ""}
                  onChange={(e) => setSelectedAppointment({...selectedAppointment, phone: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Date *</label>
                  <input
                    type="date"
                    value={selectedAppointment.date}
                    onChange={(e) => setSelectedAppointment({...selectedAppointment, date: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Time</label>
                  <input
                    type="time"
                    value={selectedAppointment.time || ""}
                    onChange={(e) => setSelectedAppointment({...selectedAppointment, time: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Status</label>
                <div className="grid grid-cols-2 gap-2">
                  {["scheduled", "tentative", "completed", "cancelled"].map(s => (
                    <button
                      key={s}
                      onClick={() => setSelectedAppointment({...selectedAppointment, status: s})}
                      className={`py-2 px-3 rounded-xl text-xs font-bold capitalize transition-all ${
                        selectedAppointment.status === s
                          ? "bg-orange-500 text-white"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Notes</label>
                <textarea
                  value={selectedAppointment.notes || ""}
                  onChange={(e) => setSelectedAppointment({...selectedAppointment, notes: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={async () => {
                    await base44.entities.Appointment.update(selectedAppointment.id, selectedAppointment);
                    const updated = await base44.entities.Appointment.filter({ user_id: user.id });
                    setAppointments(updated);
                    setShowAppointmentModal(false);
                    setSelectedAppointment(null);
                  }}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
                <button
                  onClick={async () => {
                    if (confirm("Delete this appointment?")) {
                      await base44.entities.Appointment.delete(selectedAppointment.id);
                      const updated = await base44.entities.Appointment.filter({ user_id: user.id });
                      setAppointments(updated);
                      setShowAppointmentModal(false);
                      setSelectedAppointment(null);
                    }
                  }}
                  className="px-4 py-3 rounded-xl bg-red-50 text-red-600 font-bold"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Consolidated All Weeks */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-800">📋 All Tasks (Week 1-4)</h3>
        </div>

        {/* All Weeks Consolidated - Collapsable */}
        <div className="px-3 pb-3 space-y-2 max-h-[520px] overflow-y-auto">
          {Array.from({ length: totalWeeks }, (_, i) => i + 1).map(weekNum => {
            const wData = weeksData[weekNum];
            const wItems = [
              ...(wData?.items || []).filter(i => userSelections[i.id] === "yes"),
              ...(customItems[weekNum] || [])
            ];
            const wCompleted = wItems.filter(i => completedIds.has(i.id)).length;
            const wProgress = wItems.length ? Math.round((wCompleted / wItems.length) * 100) : 0;
            const isSetup = weekNum === 1 ? true : localStorage.getItem(`walkthrough_done_w${weekNum}_${user?.id}`);
            const isExpanded = expandedWeeks.has(weekNum);

            return (
              <div key={weekNum} className="rounded-2xl border border-slate-200 overflow-hidden">
                <button
                  onClick={() => launchWeekSetup(weekNum)}
                  className="w-full px-3 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-700">Week {weekNum}</h4>
                    <div className="flex-1 max-w-[120px]">
                      <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full transition-all duration-500"
                          style={{ width: `${wProgress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[10px] font-bold text-orange-500">{wProgress}%</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="p-2 space-y-1.5 border-t border-slate-100">
                    {wItems.map(item => (
                      <ChecklistItemCard
                        key={item.id}
                        item={item}
                        completed={completedIds.has(item.id)}
                        skipped={false}
                        onComplete={() => handleComplete(item.id)}
                        onSkip={() => item.custom
                          ? setCustomItems(prev => { const u = { ...prev, [weekNum]: prev[weekNum].filter(i => i.id !== item.id) }; persist(completedIds, removedIds, u); return u; })
                          : handleRemove(item.id)}
                        userAddress={user?.home_address}
                        onProviderSaved={onProviderSaved}
                        user={user}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}