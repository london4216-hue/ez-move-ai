import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Phone, Plus, Edit2, X, User } from "lucide-react";

const COLORS = ["#F97316", "#7C3AED", "#059669", "#3B82F6", "#EC4899", "#8B5CF6", "#14B8A6", "#F59E0B"];

export default function ContactsSidebar({ user }) {
  const [providers, setProviders] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: "", role: "", phone: "" });

  useEffect(() => {
    if (!user) return;
    base44.entities.SavedProvider.filter({ user_id: user.id }).then(setProviders).catch(() => {});
  }, [user]);

  const openAdd = () => {
    setEditingId(null);
    setForm({ name: "", role: "", phone: "" });
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditingId(p.id);
    setForm({ name: p.name, role: p.role || "", phone: p.phone || "" });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    if (editingId) {
      await base44.entities.SavedProvider.update(editingId, form);
    } else {
      await base44.entities.SavedProvider.create({ ...form, user_id: user.id });
    }
    const updated = await base44.entities.SavedProvider.filter({ user_id: user.id });
    setProviders(updated);
    setShowModal(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this contact?")) return;
    await base44.entities.SavedProvider.delete(id);
    setProviders(p => p.filter(x => x.id !== id));
  };

  const allContacts = [
    ...(user?.agent_name ? [{
      name: user.agent_name,
      role: user.user_type === "buyer" ? "Buyer's Agent" : "Listing Agent",
      phone: user.agent_phone || "",
      color: COLORS[0],
      primary: true
    }] : []),
    ...providers.map((p, i) => ({
      ...p,
      color: COLORS[(i + 1) % COLORS.length],
      saved: true
    }))
  ];

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-black text-slate-900">My Team</h2>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500 text-white text-xs font-bold"
        >
          <Plus className="w-3.5 h-3.5" /> Add
        </button>
      </div>

      {allContacts.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-slate-100">
          <User className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 text-sm font-semibold mb-1">No contacts yet</p>
          <p className="text-slate-400 text-xs mb-4">Add your movers, agent, and service providers</p>
          <button onClick={openAdd} className="text-orange-500 font-bold text-sm">+ Add a Contact</button>
        </div>
      ) : (
        <div className="space-y-2">
          {allContacts.map((c, i) => (
            <div key={i} className={`bg-white rounded-2xl p-4 border flex items-center gap-4 ${c.primary ? "border-orange-200 bg-orange-50" : "border-slate-100"}`}>
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-sm flex-shrink-0"
                style={{ backgroundColor: c.color }}
              >
                {c.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-900 text-sm truncate">{c.name}</p>
                <p className={`text-xs font-semibold ${c.primary ? "text-orange-500" : "text-slate-400"}`}>{c.role}</p>
                {c.phone && (
                  <a href={`tel:${c.phone.replace(/\D/g, "")}`} className="flex items-center gap-1 text-xs text-slate-400 hover:text-orange-500 mt-0.5">
                    <Phone className="w-3 h-3" />{c.phone}
                  </a>
                )}
              </div>
              {c.saved && (
                <div className="flex flex-col gap-1">
                  <button onClick={() => openEdit(c)} className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center">
                    <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                  </button>
                  <button onClick={() => handleDelete(c.id)} className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center">
                    <X className="w-3.5 h-3.5 text-red-400" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end justify-center p-4 z-50">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-black text-slate-900">{editingId ? "Edit Contact" : "Add Contact"}</h3>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center">
                <X className="w-4 h-4 text-slate-600" />
              </button>
            </div>
            <div className="space-y-3 mb-5">
              <input autoFocus value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} placeholder="Name *" className="input-field" />
              <input value={form.role} onChange={e => setForm(f => ({...f, role: e.target.value}))} placeholder="Role (e.g., Movers, Agent)" className="input-field" />
              <input value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} placeholder="Phone" className="input-field" type="tel" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowModal(false)} className="flex-1 py-3.5 rounded-2xl border-2 border-slate-200 text-slate-700 font-bold">Cancel</button>
              <button onClick={handleSave} className="flex-1 py-3.5 rounded-2xl bg-orange-500 text-white font-bold">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}