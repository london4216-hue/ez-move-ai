import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { differenceInDays, parseISO, addDays, format, isWithinInterval, startOfWeek, endOfWeek } from "date-fns";
import { CalendarDays, Phone, X, Save } from "lucide-react";

import ChecklistItemCard from "./ChecklistItemCard";
import WeekWalkthrough from "./WeekWalkthrough";
import MoveDirectory from "./MoveDirectory";

const BASE_WEEKS = {
  1: {
    title: "Week 1 — Foundation",
    subtitle: "Invite day! Get clarity and line up the big moving pieces.",
    items: [
      { id: "w1-1", title: "Confirm what stays vs. goes", description: "Furniture, appliances, personal items", ai_search_query: null, inventory_walkthrough: true },
      { id: "w1-2", title: "Estate sale decision", description: "Find local estate sale professionals", ai_search_query: "top rated estate sale professionals near me" },
      { id: "w1-3", title: "Request mover quotes", description: "Compare 3 top-rated movers side by side", ai_search_query: "top rated local movers near me" },
      { id: "w1-4", title: "Start donation / sell pile", description: "What's worth selling vs. donating", ai_search_query: null },
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
      { id: "w3-1", title: "Painting (if needed)", description: "Find top-rated painters, neutral color guidance", ai_search_query: "top rated painters near me" },
      { id: "w3-2", title: "Junk removal", description: "Same-day or next-day local haulers", ai_search_query: "local junk removal same day near me" },
      { id: "w3-3", title: "Deep cleaning", description: "Kitchen, baths, windows, appliances", ai_search_query: "professional house cleaning near me" },
      { id: "w3-4", title: "Patch & repair checklist", description: "Nail holes, touch-ups, minor fixes", ai_search_query: null },
    ]
  },
  4: {
    title: "Week 4 — Final Move & Close",
    subtitle: "Zero chaos. Zero surprises.",
    items: [
      { id: "w4-1", title: "Final packing", description: "Daily mini-checklists so nothing piles up", ai_search_query: null },
      { id: "w4-2", title: "Move-out day guidance", description: "What stays, what leaves, final walkthrough prep", ai_search_query: null },
      { id: "w4-3", title: "Utility transfers", description: "Electric, water, gas, internet", ai_search_query: null },
      { id: "w4-4", title: "Final clean", description: "Quick refresh before buyer walkthrough", ai_search_query: "professional house cleaning near me" },
      { id: "w4-5", title: "Closing day checklist", description: "Keys, garage remotes, peace of mind ✅", ai_search_query: null },
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
    if (saved) setCompletedIds(new Set(JSON.parse(saved)));
    if (savedRemoved) setRemovedIds(new Set(JSON.parse(savedRemoved)));
    if (savedCustom) setCustomItems(JSON.parse(savedCustom));
    if (savedSelections) setUserSelections(JSON.parse(savedSelections));
  }, [user?.id]);

  // Check if walkthrough needed for current week
  useEffect(() => {
    if (!user?.id) return;
    const walkthroughDone = localStorage.getItem(`walkthrough_done_w${currentWeek}_${user.id}`);
    if (!walkthroughDone) {
      setWalkthroughWeek(currentWeek);
      setShowWalkthrough(true);
    }
  }, [user?.id, currentWeek]);

  const [userSelections, setUserSelections] = useState({});

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
      
      {/* Close date banner */}
      {user?.estimated_close_date && (
        <div className="bg-[#0F172A] rounded-2xl px-4 py-2.5 flex items-center justify-between">
          <div className="flex-1">
            <p className="text-white text-[10px] font-bold">Close Date</p>
            <p className="text-orange-400 text-xs font-black">{format(parseISO(user.estimated_close_date), "MMM d, yyyy")}</p>
          </div>
          {estimatedCost > 0 && (
            <div className="text-center px-3">
              <p className="text-slate-400 text-[9px]">Est. Cost</p>
              <p className="text-emerald-400 text-xs font-black">${estimatedCost.toFixed(0)}</p>
            </div>
          )}
          <div className="text-right">
            <p className="text-slate-400 text-[9px]">Total Weeks</p>
            <p className="text-white text-base font-black">{totalWeeks}</p>
          </div>
        </div>
      )}
      
      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl border border-slate-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <CalendarDays className="w-4 h-4 text-orange-500" />
            <span className="text-xs font-bold text-slate-600">Appointments</span>
          </div>
          <p className="text-2xl font-black text-slate-800">{appointments?.length || 0}</p>
          <p className="text-xs text-slate-400 mt-1">Scheduled</p>
        </div>
        
        <div className="bg-white rounded-2xl border border-slate-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Phone className="w-4 h-4 text-orange-500" />
            <span className="text-xs font-bold text-slate-600">Contacts</span>
          </div>
          <p className="text-2xl font-black text-slate-800">{contacts?.length || 0}</p>
          <p className="text-xs text-slate-400 mt-1">Saved</p>
        </div>
      </div>

      {/* This Week's Appointments */}
      {appointments.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800">📅 This Week</h3>
          </div>
          <div className="divide-y divide-slate-50 max-h-48 overflow-y-auto">
            {appointments.filter(a => {
              try {
                const d = parseISO(a.date);
                return isWithinInterval(d, { start: startOfWeek(new Date()), end: endOfWeek(new Date()) });
              } catch { return false; }
            }).slice(0, 3).map((appt, i) => (
              <button
                key={i}
                onClick={() => { setSelectedAppointment(appt); setShowAppointmentModal(true); }}
                className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-slate-50 transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                  <CalendarDays className="w-3.5 h-3.5 text-orange-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate">{appt.title}</p>
                  <p className="text-xs text-slate-500">{format(parseISO(appt.date), "EEE, MMM d")}{appt.time ? ` · ${appt.time}` : ""}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
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

      {/* Week tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex overflow-x-auto no-scrollbar border-b border-slate-100">
          {Array.from({ length: totalWeeks }, (_, i) => i + 1).map(w => (
            <button
              key={w}
              onClick={() => { setActiveWeek(w); setAddingTask(false); }}
              className={`flex-1 min-w-[60px] py-3 px-2 text-xs font-bold transition-all whitespace-nowrap relative
                ${activeWeek === w ? "text-orange-500" : isWeekLocked(w) ? "text-slate-300" : "text-slate-400"}`}
            >
              {w === currentWeek && (
                <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-orange-500" />
              )}
              {`Wk ${w}`}
              {activeWeek === w && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 rounded-full" />}
            </button>
          ))}
        </div>

        {/* Week header */}
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-center justify-between mb-0.5">
            <p className="text-sm font-bold text-slate-800">{weekData?.title}</p>
            <span className="text-xs font-bold text-orange-500">{progress}%</span>
          </div>
          {weekDateRange && <p className="text-[10px] text-slate-400 mb-1">{weekDateRange}</p>}
          <p className="text-xs text-slate-500 mb-2.5">{weekData?.subtitle}</p>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          {progress === 100 && (
            <p className="text-xs text-emerald-600 font-bold mt-2">🎉 Week {activeWeek} complete!</p>
          )}
        </div>



        {/* Items */}
        <div className="px-3 pb-3 space-y-2 max-h-[420px] overflow-y-auto">
          {allItems.map(item => (
            <ChecklistItemCard
              key={item.id}
              item={item}
              completed={completedIds.has(item.id)}
              skipped={false}
              onComplete={() => handleComplete(item.id)}
              onSkip={() => item.custom
                ? setCustomItems(prev => { const u = { ...prev, [activeWeek]: prev[activeWeek].filter(i => i.id !== item.id) }; persist(completedIds, removedIds, u); return u; })
                : handleRemove(item.id)}
              userAddress={user?.home_address}
              onProviderSaved={onProviderSaved}
              user={user}
            />
          ))}
          
          {maybeItems.map(item => (
            <button
              key={item.id}
              onClick={() => {
                const newSelections = { ...userSelections, [item.id]: "yes" };
                setUserSelections(newSelections);
                localStorage.setItem(`user_selections_${user.id}`, JSON.stringify(newSelections));
              }}
              className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50 p-3 text-left opacity-60 hover:opacity-100 transition-opacity"
            >
              <p className="text-xs font-bold text-slate-400">🤔 {item.title}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{item.description}</p>
              <p className="text-[10px] text-amber-600 font-semibold mt-1">Tap to add to your plan</p>
            </button>
          ))}

          {addingTask ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 space-y-2">
              <p className="text-xs font-bold text-slate-700">New Task</p>
              <input
                autoFocus
                value={newTaskTitle}
                onChange={e => setNewTaskTitle(e.target.value)}
                placeholder="Task title *"
                className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-orange-500 bg-white"
              />
              <input
                value={newTaskDesc}
                onChange={e => setNewTaskDesc(e.target.value)}
                placeholder="Description (optional)"
                className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-orange-500 bg-white"
              />
              <div className="flex gap-2">
                <button onClick={handleAddTask} className="flex-1 py-2 rounded-xl bg-orange-500 text-white text-xs font-bold">Add</button>
                <button onClick={() => { setAddingTask(false); setNewTaskTitle(""); setNewTaskDesc(""); }}
                  className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-500 text-xs font-bold">Cancel</button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setAddingTask(true)}
              className="w-full py-3 rounded-2xl border-2 border-dashed border-slate-200 text-xs text-slate-400 font-bold hover:border-orange-400 hover:text-orange-400 transition-all"
            >
              + Add Custom Task
            </button>
          )}
        </div>
      </div>
    </div>
  );
}