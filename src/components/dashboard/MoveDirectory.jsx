import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Phone, Mail, Plus, X, Check, ChevronDown, ChevronUp, Trash2, CalendarDays, DollarSign, FileText } from "lucide-react";

export default function MoveDirectory({ user, contacts: externalContacts, onContactsChange }) {
  const [contacts, setContacts] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [newContact, setNewContact] = useState({ name: "", role: "", phone: "", email: "", notes: "", cost_of_service: "", service_date: "" });

  useEffect(() => {
    if (externalContacts) {
      setContacts(dedup(externalContacts));
    } else {
      loadContacts();
    }
  }, [user, externalContacts]);

  const dedup = (list) => {
    const seen = new Set();
    return list.filter(c => {
      const key = `${c.name?.toLowerCase()}-${c.role?.toLowerCase()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  const loadContacts = async () => {
    if (!user) return;
    const data = await base44.entities.Contact.filter({ user_id: user.id });
    const deduped = dedup(data);
    // Delete actual duplicates from DB
    const keepIds = new Set(deduped.map(c => c.id));
    const dupes = data.filter(c => !keepIds.has(c.id));
    await Promise.all(dupes.map(c => base44.entities.Contact.delete(c.id)));
    setContacts(deduped);
    if (onContactsChange) onContactsChange(deduped);
  };

  const handleAddContact = async () => {
    if (!newContact.name || !newContact.role) return;
    await base44.entities.Contact.create({
      user_id: user.id,
      ...newContact,
      cost_of_service: newContact.cost_of_service ? parseFloat(newContact.cost_of_service) : null,
      avatar_initials: newContact.name.slice(0, 2).toUpperCase(),
      color: "orange"
    });
    setNewContact({ name: "", role: "", phone: "", email: "", notes: "", cost_of_service: "", service_date: "" });
    setShowAddModal(false);
    loadContacts();
  };

  const handleDeleteContact = async (contact, e) => {
    e.stopPropagation();
    if (!confirm(`Delete ${contact.name}?`)) return;
    await base44.entities.Contact.delete(contact.id);
    loadContacts();
  };

  const roles = [
    { label: "Real Estate Agent", emoji: "🏠" },
    { label: "Broker", emoji: "💼" },
    { label: "Escrow Officer", emoji: "📋" },
    { label: "Lender", emoji: "🏦" },
    { label: "Mover", emoji: "🚛" },
    { label: "Estate Sale", emoji: "🏷️" },
    { label: "Inspector", emoji: "🔍" },
    { label: "Contractor", emoji: "🔨" },
    { label: "Cleaner", emoji: "🧹" },
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
            <div className="px-4 pb-3 flex justify-end border-t border-slate-100 pt-2">
              <button
                onClick={() => setShowAddModal(true)}
                className="text-xs text-orange-500 font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Contact
              </button>
            </div>
            <div className="divide-y divide-slate-50 max-h-72 overflow-y-auto">
              {contacts.length === 0 ? (
                <div className="px-4 py-4 text-center">
                  <p className="text-xs text-slate-400">No contacts yet</p>
                </div>
              ) : (
                contacts.map((contact) => (
                  <div key={contact.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors">
                    <button
                      onClick={() => { setSelectedContact({ ...contact, cost_of_service: contact.cost_of_service || "" }); setShowEditModal(true); }}
                      className="flex items-center gap-3 flex-1 min-w-0 text-left"
                    >
                      <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-[10px] font-bold text-orange-600">{contact.avatar_initials}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">{contact.name}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-[10px] text-orange-500 font-semibold">{contact.role}</p>
                          {contact.service_date && (
                            <span className="text-[9px] text-blue-500 font-bold flex items-center gap-0.5">
                              <CalendarDays className="w-2.5 h-2.5" />{contact.service_date}
                            </span>
                          )}
                          {contact.cost_of_service > 0 && (
                            <span className="text-[9px] text-emerald-600 font-bold flex items-center gap-0.5">
                              <DollarSign className="w-2.5 h-2.5" />{Number(contact.cost_of_service).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                    <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                      {contact.phone && (
                        <a href={`tel:${contact.phone}`} className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center">
                          <Phone className="w-3 h-3 text-slate-600" />
                        </a>
                      )}
                      <button onClick={(e) => handleDeleteContact(contact, e)} className="w-7 h-7 rounded-full bg-red-50 flex items-center justify-center hover:bg-red-100 transition-colors">
                        <Trash2 className="w-3 h-3 text-red-400" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center">
          <div className="w-full max-w-md bg-white rounded-t-3xl shadow-2xl max-h-[90vh] flex flex-col">
            <div className="sticky top-0 bg-white border-b border-slate-100 px-5 py-4 flex items-center justify-between flex-shrink-0">
              <h3 className="text-lg font-bold text-slate-800">Add Contact</h3>
              <button onClick={() => setShowAddModal(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>
            <div className="p-5 space-y-4 overflow-y-auto">
              <ContactFields contact={newContact} onChange={setNewContact} roles={roles} />
              <div className="flex gap-3 pb-2">
                <button onClick={() => setShowAddModal(false)} className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-slate-700 font-bold">Close</button>
                <button
                  onClick={handleAddContact}
                  disabled={!newContact.name || !newContact.role}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" /> Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedContact && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center">
          <div className="w-full max-w-md bg-white rounded-t-3xl shadow-2xl max-h-[90vh] flex flex-col">
            <div className="sticky top-0 bg-white border-b border-slate-100 px-5 py-4 flex items-center justify-between flex-shrink-0">
              <h3 className="text-lg font-bold text-slate-800">{selectedContact.name}</h3>
              <button onClick={() => { setShowEditModal(false); setSelectedContact(null); }} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>
            <div className="p-5 space-y-4 overflow-y-auto">
              <ContactFields contact={selectedContact} onChange={setSelectedContact} roles={roles} />
              <div className="flex gap-3 pt-2 pb-2">
                <button
                  onClick={async () => {
                    await base44.entities.Contact.update(selectedContact.id, {
                      ...selectedContact,
                      cost_of_service: selectedContact.cost_of_service !== "" ? parseFloat(selectedContact.cost_of_service) : null,
                      avatar_initials: selectedContact.name.slice(0, 2).toUpperCase()
                    });
                    loadContacts();
                    setShowEditModal(false);
                    setSelectedContact(null);
                  }}
                  disabled={!selectedContact.name || !selectedContact.role}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" /> Save
                </button>
                <button
                  onClick={async () => {
                    if (!confirm(`Delete ${selectedContact.name}?`)) return;
                    await base44.entities.Contact.delete(selectedContact.id);
                    loadContacts();
                    setShowEditModal(false);
                    setSelectedContact(null);
                  }}
                  className="px-4 py-3 rounded-xl bg-red-50 text-red-600 font-bold flex items-center gap-1"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ContactFields({ contact, onChange, roles }) {
  return (
    <>
      <div>
        <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Name *</label>
        <input value={contact.name} onChange={(e) => onChange({ ...contact, name: e.target.value })} placeholder="John Doe" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm" />
      </div>
      <div>
        <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Role *</label>
        <div className="grid grid-cols-2 gap-2">
          {roles.map((r, i) => (
            <button key={i} onClick={() => onChange({ ...contact, role: r.label })}
              className={`p-3 rounded-xl border-2 text-left transition-all ${contact.role === r.label ? "border-orange-500 bg-orange-50" : "border-slate-200"}`}>
              <span className="text-base">{r.emoji}</span>
              <p className="text-xs font-semibold text-slate-700 mt-1">{r.label}</p>
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Phone</label>
        <input value={contact.phone || ""} onChange={(e) => onChange({ ...contact, phone: e.target.value })} placeholder="(555) 123-4567" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm" />
      </div>
      <div>
        <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Email</label>
        <input value={contact.email || ""} onChange={(e) => onChange({ ...contact, email: e.target.value })} placeholder="john@example.com" type="email" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-slate-600 mb-1.5 block flex items-center gap-1"><CalendarDays className="w-3 h-3" /> Service Date</label>
          <input type="date" value={contact.service_date || ""} onChange={(e) => onChange({ ...contact, service_date: e.target.value })} className="w-full px-3 py-3 rounded-xl border border-slate-200 text-sm" />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600 mb-1.5 block flex items-center gap-1"><DollarSign className="w-3 h-3" /> Est. Cost ($)</label>
          <input type="number" inputMode="decimal" value={contact.cost_of_service || ""} onChange={(e) => onChange({ ...contact, cost_of_service: e.target.value })} placeholder="0" className="w-full px-3 py-3 rounded-xl border border-slate-200 text-sm" />
        </div>
      </div>
      <div>
        <label className="text-xs font-semibold text-slate-600 mb-1.5 block flex items-center gap-1"><FileText className="w-3 h-3" /> Notes</label>
        <textarea value={contact.notes || ""} onChange={(e) => onChange({ ...contact, notes: e.target.value })} placeholder="Any notes about this service..." rows={3} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm resize-none" />
      </div>
    </>
  );
}