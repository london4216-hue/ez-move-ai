import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Phone, Mail, User, Plus, X, Check, ChevronDown, ChevronUp } from "lucide-react";

export default function MoveDirectory({ user, contacts: externalContacts, onContactsChange }) {
  const [contacts, setContacts] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [newContact, setNewContact] = useState({ name: "", role: "", phone: "", email: "" });

  useEffect(() => {
    if (externalContacts) {
      setContacts(externalContacts);
    } else {
      loadContacts();
    }
  }, [user, externalContacts]);

  const loadContacts = async () => {
    if (!user) return;
    const data = await base44.entities.Contact.filter({ user_id: user.id });
    setContacts(data);
    if (onContactsChange) onContactsChange(data);
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
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full px-4 py-3 flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-800">📇 Move Directory</h3>
            <span className="text-xs text-slate-500">({contacts.length})</span>
          </div>
          <div className="flex items-center gap-2">
            {!expanded && (
              <div
                onClick={(e) => { e.stopPropagation(); setShowAddModal(true); }}
                className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-white" />
              </div>
            )}
            {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </div>
        </button>

        {expanded && (
          <>
            <div className="px-4 pb-3 flex justify-end border-t border-slate-100">
              <button
                onClick={() => setShowAddModal(true)}
                className="text-xs text-orange-500 font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Contact
              </button>
            </div>
            <div className="divide-y divide-slate-50 max-h-64 overflow-y-auto">
              {contacts.length === 0 ? (
                <div className="px-4 py-4 text-center">
                  <p className="text-xs text-slate-400">No contacts yet</p>
                </div>
              ) : (
                contacts.map((contact, i) => (
                  <button
                    key={i}
                    onClick={() => { setSelectedContact(contact); setShowEditModal(true); }}
                    className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-slate-50 transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-[10px] font-bold text-orange-600">{contact.avatar_initials}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{contact.name}</p>
                      <p className="text-[10px] text-orange-500 font-semibold">{contact.role}</p>
                    </div>
                    <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
                      {contact.phone && (
                        <a
                          href={`tel:${contact.phone}`}
                          className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center"
                        >
                          <Phone className="w-3 h-3 text-slate-600" />
                        </a>
                      )}
                      {contact.email && (
                        <a
                          href={`mailto:${contact.email}`}
                          className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center"
                        >
                          <Mail className="w-3 h-3 text-slate-600" />
                        </a>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center">
          <div className="w-full max-w-md bg-white rounded-t-3xl shadow-2xl max-h-[90vh] flex flex-col">
            <div className="sticky top-0 bg-white border-b border-slate-100 px-5 py-4 flex items-center justify-between flex-shrink-0">
              <h3 className="text-lg font-bold text-slate-800">Add Contact</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center"
              >
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto">
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

              <div className="flex gap-3 pb-2">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-slate-700 font-bold"
                >
                  Close
                </button>
                <button
                  onClick={async () => { await handleAddContact(); }}
                  disabled={!newContact.name || !newContact.role}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold
                    disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEditModal && selectedContact && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center">
          <div className="w-full max-w-md bg-white rounded-t-3xl shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-100 px-5 py-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">Edit Contact</h3>
              <button
                onClick={() => { setShowEditModal(false); setSelectedContact(null); }}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center"
              >
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Name *</label>
                <input
                  value={selectedContact.name}
                  onChange={(e) => setSelectedContact({...selectedContact, name: e.target.value})}
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
                      onClick={() => setSelectedContact({...selectedContact, role: r.label})}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${
                        selectedContact.role === r.label
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
                  value={selectedContact.phone || ""}
                  onChange={(e) => setSelectedContact({...selectedContact, phone: e.target.value})}
                  placeholder="(555) 123-4567"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Email</label>
                <input
                  value={selectedContact.email || ""}
                  onChange={(e) => setSelectedContact({...selectedContact, email: e.target.value})}
                  placeholder="john@example.com"
                  type="email"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => { setShowEditModal(false); setSelectedContact(null); }}
                  className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-slate-700 font-bold"
                >
                  Close
                </button>
                <button
                  onClick={async () => {
                    await base44.entities.Contact.update(selectedContact.id, {
                      ...selectedContact,
                      avatar_initials: selectedContact.name.slice(0, 2).toUpperCase()
                    });
                    loadContacts();
                    setShowEditModal(false);
                    setSelectedContact(null);
                  }}
                  disabled={!selectedContact.name || !selectedContact.role}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold
                    disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Save
                </button>
                <button
                  onClick={async () => {
                    if (confirm("Delete this contact?")) {
                      await base44.entities.Contact.delete(selectedContact.id);
                      loadContacts();
                      setShowEditModal(false);
                      setSelectedContact(null);
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
    </>
  );
}