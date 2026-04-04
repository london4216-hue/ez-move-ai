import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Trash2, Plus, GripVertical, ArrowLeft, Loader2, Package } from "lucide-react";
import { Link } from "react-router-dom";

const COLUMNS = [
  { key: "move",   label: "Move",   emoji: "📦", bg: "bg-blue-50",    border: "border-blue-200",    header: "bg-blue-500",    badge: "bg-blue-100 text-blue-700" },
  { key: "donate", label: "Donate", emoji: "🫶", bg: "bg-emerald-50", border: "border-emerald-200", header: "bg-emerald-500", badge: "bg-emerald-100 text-emerald-700" },
  { key: "junk",   label: "Junk",   emoji: "🗑️", bg: "bg-red-50",     border: "border-red-200",     header: "bg-red-500",     badge: "bg-red-100 text-red-700" },
];

const ITEM_SIZES = ["Small", "Medium", "Large", "X-Large"];
const QUICK_ITEMS = [
  "Sofa", "Bed Frame", "Mattress", "Dresser", "Dining Table", "Chairs",
  "TV", "Bookcase", "Desk", "Office Chair", "Refrigerator", "Microwave",
  "Washer", "Dryer", "Coffee Table", "Nightstand", "Wardrobe", "Lamps",
  "Bikes", "Boxes", "Tools", "Artwork", "Mirrors", "Rug",
];

export default function MyStuff() {
  const [user, setUser] = useState(null);
  const [lists, setLists] = useState({ move: [], donate: [], junk: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [addingTo, setAddingTo] = useState(null); // column key
  const [customInput, setCustomInput] = useState("");
  const [selectingSize, setSelectingSize] = useState(null); // { name, colKey }
  const [editingQty, setEditingQty] = useState(null); // item id

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      if (u?.stuff_lists) {
        try { setLists(JSON.parse(u.stuff_lists)); } catch {}
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const save = async (newLists) => {
    setSaving(true);
    await base44.auth.updateMe({ stuff_lists: JSON.stringify(newLists) });
    setSaving(false);
  };

  const addItem = (name, size, colKey) => {
    if (!name.trim() || !size || !colKey) return;
    const existing = lists[colKey]?.find(i => i.name === name.trim() && i.size === size);
    if (existing) {
      const updated = {
        ...lists,
        [colKey]: lists[colKey].map(i => i.id === existing.id ? { ...i, qty: (i.qty || 1) + 1 } : i)
      };
      setLists(updated);
      save(updated);
    } else {
      const newItem = { id: `${name.trim()}-${size}-${Date.now()}`, name: name.trim(), size, qty: 1 };
      const updated = { ...lists, [colKey]: [...lists[colKey], newItem] };
      setLists(updated);
      save(updated);
    }
    setSelectingSize(null);
    setAddingTo(null);
    setCustomInput("");
  };

  const removeItem = (id, colKey) => {
    const updated = { ...lists, [colKey]: lists[colKey].filter(i => i.id !== id) };
    setLists(updated);
    save(updated);
  };

  const updateQty = (id, colKey, qty) => {
    if (qty < 1) { removeItem(id, colKey); return; }
    const updated = { ...lists, [colKey]: lists[colKey].map(i => i.id === id ? { ...i, qty } : i) };
    setLists(updated);
    save(updated);
    setEditingQty(null);
  };

  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const srcKey = source.droppableId;
    const dstKey = destination.droppableId;
    const srcItems = Array.from(lists[srcKey]);
    const [moved] = srcItems.splice(source.index, 1);

    let updated;
    if (srcKey === dstKey) {
      srcItems.splice(destination.index, 0, moved);
      updated = { ...lists, [srcKey]: srcItems };
    } else {
      const dstItems = Array.from(lists[dstKey]);
      dstItems.splice(destination.index, 0, moved);
      updated = { ...lists, [srcKey]: srcItems, [dstKey]: dstItems };
    }
    setLists(updated);
    save(updated);
  };

  const totalItems = Object.values(lists).reduce((s, a) => s + a.length, 0);

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/Dashboard" className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
              <ArrowLeft className="w-4 h-4 text-slate-600" />
            </Link>
            <div>
              <p className="font-black text-slate-800 text-base leading-tight">My Stuff</p>
              <p className="text-slate-400 text-xs">{totalItems} total items</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {saving && <Loader2 className="w-4 h-4 text-orange-400 animate-spin" />}
            <Package className="w-5 h-5 text-orange-400" />
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {COLUMNS.map(col => (
              <div key={col.key} className={`rounded-2xl border-2 ${col.border} overflow-hidden flex flex-col`} style={{ minHeight: 480 }}>
                {/* Column Header */}
                <div className={`${col.header} px-4 py-3 flex items-center justify-between`}>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{col.emoji}</span>
                    <p className="text-white font-black text-base">{col.label}</p>
                  </div>
                  <span className="bg-white/30 text-white text-xs font-black px-2.5 py-1 rounded-full">
                    {lists[col.key].length}
                  </span>
                </div>

                {/* Droppable Items */}
                <Droppable droppableId={col.key}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 p-3 space-y-2 transition-colors ${snapshot.isDraggingOver ? col.bg : "bg-white"}`}
                    >
                      {lists[col.key].map((item, index) => (
                        <Draggable key={item.id} draggableId={item.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`bg-white rounded-xl border border-slate-100 px-3 py-2.5 flex items-center gap-2 shadow-sm transition-shadow ${snapshot.isDragging ? "shadow-lg ring-2 ring-orange-300" : ""}`}
                            >
                              <div {...provided.dragHandleProps} className="text-slate-300 hover:text-slate-400 cursor-grab active:cursor-grabbing">
                                <GripVertical className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-700 truncate">{item.name}</p>
                                <p className="text-[10px] text-slate-400">{item.size}</p>
                              </div>
                              {/* Qty control */}
                              {editingQty === item.id ? (
                                <input
                                  type="number"
                                  min={0}
                                  defaultValue={item.qty || 1}
                                  autoFocus
                                  onBlur={e => updateQty(item.id, col.key, parseInt(e.target.value) || 0)}
                                  onKeyDown={e => e.key === "Enter" && updateQty(item.id, col.key, parseInt(e.target.value) || 0)}
                                  className="w-14 text-center border border-slate-200 rounded-lg text-sm font-bold focus:outline-none focus:border-orange-400 px-1 py-0.5"
                                />
                              ) : (
                                <button
                                  onClick={() => setEditingQty(item.id)}
                                  className={`text-xs font-black px-2 py-1 rounded-lg ${col.badge} min-w-[32px] text-center`}
                                >
                                  ×{item.qty || 1}
                                </button>
                              )}
                              <button onClick={() => removeItem(item.id, col.key)} className="text-slate-200 hover:text-red-400 transition-colors flex-shrink-0">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      {lists[col.key].length === 0 && !snapshot.isDraggingOver && (
                        <div className="flex flex-col items-center justify-center py-10 text-slate-300">
                          <span className="text-4xl mb-2">{col.emoji}</span>
                          <p className="text-xs font-semibold">Drag items here</p>
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>

                {/* Add Item Section */}
                <div className={`${col.bg} border-t ${col.border} p-3 space-y-2`}>
                  {addingTo === col.key ? (
                    <>
                      <div className="flex gap-2">
                        <input
                          autoFocus
                          value={customInput}
                          onChange={e => setCustomInput(e.target.value)}
                          onKeyDown={e => e.key === "Escape" && setAddingTo(null)}
                          placeholder="Item name..."
                          className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-orange-400 bg-white"
                        />
                        <button onClick={() => setAddingTo(null)} className="text-slate-400 hover:text-slate-600 text-sm font-bold px-2">✕</button>
                      </div>
                      {customInput.trim() && (
                        <div className="flex flex-wrap gap-1">
                          {ITEM_SIZES.map(size => (
                            <button key={size} onClick={() => addItem(customInput, size, col.key)}
                              className="text-xs px-3 py-1.5 rounded-lg bg-white border border-slate-200 font-semibold text-slate-600 hover:border-orange-400 hover:bg-orange-50 transition-all">
                              {size}
                            </button>
                          ))}
                        </div>
                      )}
                      <div className="flex flex-wrap gap-1 pt-1">
                        {QUICK_ITEMS.map(item => (
                          <button key={item} onClick={() => setSelectingSize({ name: item, colKey: col.key })}
                            className="text-[10px] px-2 py-1 rounded-full font-semibold bg-white border border-slate-200 text-slate-500 hover:border-orange-400 hover:text-orange-600 transition-all">
                            + {item}
                          </button>
                        ))}
                      </div>
                    </>
                  ) : (
                    <button onClick={() => { setAddingTo(col.key); setCustomInput(""); }}
                      className="w-full py-2 rounded-xl border-2 border-dashed border-slate-300 text-slate-400 text-xs font-bold flex items-center justify-center gap-1 hover:border-orange-400 hover:text-orange-500 transition-all bg-white/60">
                      <Plus className="w-3.5 h-3.5" /> Add Item
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </DragDropContext>
      </div>

      {/* Quick-select size modal */}
      {selectingSize && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end justify-center z-50">
          <div className="bg-white rounded-t-3xl w-full max-w-md pb-6 shadow-2xl">
            <div className="px-5 py-4 border-b border-slate-100">
              <p className="font-bold text-slate-800">Size for: <span className="text-orange-500">{selectingSize.name}</span></p>
              <p className="text-xs text-slate-400 mt-0.5">How big is this item?</p>
            </div>
            <div className="px-5 pt-4 space-y-2">
              {ITEM_SIZES.map(size => (
                <button key={size} onClick={() => addItem(selectingSize.name, size, selectingSize.colKey)}
                  className="w-full py-3 rounded-xl border-2 border-slate-200 bg-white text-slate-700 font-bold text-sm hover:border-orange-400 hover:bg-orange-50 transition-all">
                  {size}
                </button>
              ))}
              <button onClick={() => setSelectingSize(null)}
                className="w-full py-3 rounded-xl bg-slate-100 text-slate-500 font-bold text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}