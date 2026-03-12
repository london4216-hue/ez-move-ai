import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Phone, Mail, User, Plus, X, Check } from "lucide-react";

export default function MoveDirectory({ user }) {
  const [contacts, setContacts] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newContact, setNewContact] = useState({ name: "", role: "", phone: "", email: "" });

  useEffect(() => {
    loadContacts();
  }, [user]);

  const loadContacts = async () => {
    if (!user) return;
    const data = await base44.entities.Contact.filter({ user_id: user.id });
    setContacts(data);
  };

  const handleAddContact = async () => {
    if (!newContact.name || !newContact.role) return;
    await base44.entities.Contact.create({
      user_id: user.id,
      ...newContact,
      avatar_initials: newContact.name.slice(0, 2).toUpperCase(),
      color: "orange"
    });
    setNewContact({ name: "", role: "", phone: "", email: "" });
    setShowAddModal(false);
    loadContacts();
  };

  const roles = [
    { label: "Real Estate Agent", emoji: "🏠" },
    { label: "Broker", emoji: "💼" },
    { label: "Escrow Officer", emoji: "📋" },
    { label: "Lender", emoji: "🏦" },
    { label: "Mover", emoji: "🚛" },
    { label: "Inspector", emoji: "🔍" },
    { label: "Contractor", emoji: "🔨" },
    { label: "Other", emoji: "👤" }
  ];

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="px-4 py-3 flex items-center justify-between border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-800">📇 Move Directory</h3>
            <p className="text-xs text-slate-500">Key contacts for your move</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center"
          >
            <Plus className="w-4 h-4 text-white" />
          </button>
        </div>

        <div className="divide-y divide-slate-50 max-h-96 overflow-y-auto">
          {contacts.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <User className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-400">No contacts yet</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-3 text-xs text-orange-500 font-bold"
              >
                + Add your first contact
              </button>
            </div>
          ) : (
            contacts.map((contact, i) => (
              <div key={i} className="px-4 py-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-orange-600">{contact.avatar_initials}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate">{contact.name}</p>
                  <p className="text-xs text-orange-500 font-semibold">{contact.role}</p>
                </div>
                <div className="flex gap-2">
                  {contact.phone && (
                    <a
                      href={`tel:${contact.phone}`}
                      className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center"
                    >
                      <Phone className="w-3.5 h-3.5 text-slate-600" />
                    </a>
                  )}
                  {contact.email && (
                    <a
                      href={`mailto:${contact.email}`}
                      className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center"
                    >
                      <Mail className="w-3.5 h-3.5 text-slate-600" />
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">Add Contact</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center"
              >
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Name *</label>
                <input
                  value={newContact.name}
                  onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Role *</label>
                <div className="grid grid-cols-2 gap-2">
                  {roles.map((r, i) => (
                    <button
                      key={i}
                      onClick={() => setNewContact({...newContact, role: r.label})}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${
                        newContact.role === r.label
                          ? "border-orange-500 bg-orange-50"
                          : "border-slate-200"
                      }`}
                    >
                      <span className="text-base">{r.emoji}</span>
                      <p className="text-xs font-semibold text-slate-700 mt-1">{r.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Phone</label>
                <input
                  value={newContact.phone}
                  onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
                  placeholder="(555) 123-4567"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Email</label>
                <input
                  value={newContact.email}
                  onChange={(e) => setNewContact({...newContact, email: e.target.value})}
                  placeholder="john@example.com"
                  type="email"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <button
                onClick={handleAddContact}
                disabled={!newContact.name || !newContact.role}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold
                  disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Check className="w-4 h-4 inline mr-2" />
                Add Contact
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}