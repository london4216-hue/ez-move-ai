import { useState, useEffect } from "react";
import { X, ArrowRight } from "lucide-react";

const LISTS = [
  { key: "move",   label: "Move List",  emoji: "📦", color: "bg-blue-500",    light: "bg-blue-50 border-blue-200",       text: "text-blue-700" },
  { key: "junk",   label: "Junk It",    emoji: "🗑️", color: "bg-red-500",     light: "bg-red-50 border-red-200",         text: "text-red-700" },
  { key: "donate", label: "Donate",     emoji: "🫶", color: "bg-emerald-500", light: "bg-emerald-50 border-emerald-200", text: "text-emerald-700" },
];

export default function SavedStuffModal({ user, onClose }) {
  const [lists, setLists] = useState({ move: [], junk: [], donate: [] });
  const [activeList, setActiveList] = useState(null);

  useEffect(() => {
    if (user?.stuff_lists) {
      try {
        const savedLists = JSON.parse(user.stuff_lists);
        setLists(savedLists);
      } catch (e) {
        console.log("Could not parse saved lists");
      }
    }
  }, [user?.stuff_lists]);

  const currentList = LISTS.find(l => l.key === activeList);
  const items = activeList ? lists[activeList] : [];
  const totalItems = Object.values(lists).reduce((sum, arr) => sum + arr.length, 0);

  if (activeList) {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center">
        <div className="w-full max-w-md bg-white rounded-t-3xl shadow-2xl max-h-[85vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-slate-100 px-5 py-4 flex items-center justify-between">
            <button onClick={() => setActiveList(null)} className="text-slate-400 text-xs font-bold">← Back</button>
            <div className="text-center">
              <p className="text-lg font-bold text-slate-800">{currentList.emoji} {currentList.label}</p>
              <p className="text-[10px] text-slate-400">{items.length} items</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
              <X className="w-4 h-4 text-slate-500" />
            </button>
          </div>

          <div className="p-5">
            {items.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-3xl mb-2">{currentList.emoji}</p>
                <p className="text-sm font-bold text-slate-500">No items yet</p>
                <p className="text-xs text-slate-400 mt-1">Add items in the My Stuff tab</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className={`px-4 py-2.5 ${currentList.light} border-b border-opacity-50`}>
                  <p className={`text-xs font-bold ${currentList.text}`}>{currentList.emoji} {currentList.label} ({items.length})</p>
                </div>
                <div className="divide-y divide-slate-50 max-h-96 overflow-y-auto">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 px-4 py-2.5">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-700">{item.name}</p>
                        <p className="text-[10px] text-slate-400 font-semibold">{item.size}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-800">My Stuff Lists</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        <div className="p-5 space-y-3">
          {totalItems === 0 ? (
            <div className="text-center py-6">
              <p className="text-3xl mb-2">📦</p>
              <p className="text-sm font-bold text-slate-500">No items yet</p>
              <p className="text-xs text-slate-400 mt-1">Go to My Stuff tab to add items</p>
            </div>
          ) : (
            LISTS.map(list => (
              <button
                key={list.key}
                onClick={() => setActiveList(list.key)}
                className="w-full bg-white rounded-2xl border border-slate-100 shadow-sm px-4 py-4 flex items-center gap-4 active:scale-[0.98] transition-transform text-left hover:bg-slate-50"
              >
                <div className={`w-10 h-10 rounded-2xl ${list.color} flex items-center justify-center flex-shrink-0`}>
                  <span className="text-xl">{list.emoji}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800 text-sm">{list.label}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{lists[list.key].length} items</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300" />
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}