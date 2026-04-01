import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Phone, Mail, Plus, X, Check, ChevronDown, ChevronUp, Trash2, CalendarDays, DollarSign, FileText, Info } from "lucide-react";

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
    { label: "Lawyer", emoji: "⚖️" },
    { label: "Broker", emoji: "💼" },
    { label: "Escrow Officer", emoji: "📋" },
    { label: "Lender", emoji: "🏦" },
    { label: "Mover", emoji: "🚛" },
    { label: "Estate Sale", emoji: "🏷️" },
    { label: "Inspector", emoji: "🔍" },
    { label: "Contractor", emoji: "🔨" },
    { label: "Cleaner", emoji: "🧹" },
    { label: "Insurance Agent", emoji: "🛡️" },
    { label: "Title Company", emoji: "📄" },
    { label: "Other", emoji: "👤" }
  ];

  const CRITICAL_CONTACTS = [
    { label: "Lawyer", emoji: "⚖️" },
    { label: "Real Estate Agent", emoji: "🏠" },
    { label: "Title Company", emoji: "📄" },
    { label: "Inspector", emoji: "🔍" },
    { label: "Insurance Agent", emoji: "🛡️" },
  ];

  const missingContacts = CRITICAL_CONTACTS.filter(
    rc => !contacts.some(c => c.role?.toLowerCase() === rc.label.toLowerCase())
  );

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        {/* Missing Contacts Warning */}
        {missingContacts.length > 0 && !expanded && (
          <div className="px-4 py-2 bg-amber-50 border-b border-amber-100">
            <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wide mb-1">⚠️ {missingContacts.length} Missing Critical Contact{missingContacts.length > 1 ? 's' : ''}</p>
            <div className="flex flex-wrap gap-1">
              {missingContacts.slice(0, 3).map(rc => (
                <span key={rc.label} className="text-[9px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-semibold">{rc.emoji} {rc.label}</span>
              ))}
              {missingContacts.length > 3 && <span className="text-[9px] text-amber-600 px-1">+{missingContacts.length - 3} more</span>}
            </div>
          </div>
        )}

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
            {/* Missing Contacts Expanded */}
            {missingContacts.length > 0 && (
              <div className="px-4 py-3 bg-amber-50 border-b border-amber-100">
                <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-2.5">⚠️ Critical Contacts for Buying/Selling</p>
                <div className="space-y-1.5">
                  {missingContacts.map(rc => (
                    <div key={rc.label} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-amber-200">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{rc.emoji}</span>
                        <p className="text-xs font-semibold text-slate-700">{rc.label}</p>
                      </div>
                      <button
                        onClick={() => setShowAddModal(true)}
                        className="text-[10px] font-bold text-amber-600 bg-amber-100 hover:bg-amber-200 px-2.5 py-1 rounded transition-colors"
                      >
                        + Add
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
                      className="flex items-center gap-2 flex-1 min-w-0 text-left"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`text-xs font-bold ${contact.not_needed ? "text-slate-400 line-through" : "text-slate-800"} truncate`}>{contact.name}</p>
                          {contact.not_needed && <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded flex-shrink-0">N/A</span>}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap text-[9px]">
                          <span className={`font-semibold ${contact.not_needed ? "text-slate-300" : "text-slate-600"}`}>{contact.role}</span>
                          {contact.service_date && <span className="text-blue-500 font-bold">📅 {contact.service_date}</span>}
                          {contact.cost_of_service > 0 && <span className="text-emerald-600 font-bold">${Number(contact.cost_of_service).toLocaleString()}</span>}
                        </div>
                      </div>
                    </button>
                    <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => {
                          base44.entities.Contact.update(contact.id, { not_needed: !contact.not_needed });
                          setContacts(contacts.map(c => c.id === contact.id ? { ...c, not_needed: !c.not_needed } : c));
                        }}
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${contact.not_needed ? "bg-slate-100" : "bg-amber-50 hover:bg-amber-100"}`}
                        title={contact.not_needed ? "Mark as needed" : "Mark as N/A"}
                      >
                        <span className="text-[10px] font-bold text-amber-600">—</span>
                      </button>
                      <button
                        onClick={() => { setSelectedContact({ ...contact, cost_of_service: contact.cost_of_service || "" }); setShowEditModal(true); }}
                        className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center hover:bg-blue-100 transition-colors"
                        title="View details"
                      >
                        <Info className="w-3 h-3 text-blue-600" />
                      </button>
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
  const [customRole, setCustomRole] = useState(false);
  return (
    <>
      <div>
        <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Name *</label>
        <input value={contact.name} onChange={(e) => onChange({ ...contact, name: e.target.value })} placeholder="John Doe" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm" />
      </div>
      <div>
        <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Role *</label>
        {!customRole ? (
          <>
            <select
              value={contact.role || ""}
              onChange={(e) => onChange({ ...contact, role: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm appearance-none bg-white cursor-pointer"
            >
              <option value="">Select a role...</option>
              {roles.map((r, i) => (
                <option key={i} value={r.label}>{r.emoji} {r.label}</option>
              ))}
            </select>
            <button
              onClick={() => setCustomRole(true)}
              className="text-[11px] font-bold text-orange-500 mt-2 hover:text-orange-600 transition-colors"
            >
              + Create custom role
            </button>
          </>
        ) : (
          <>
            <input
              type="text"
              value={contact.role || ""}
              onChange={(e) => onChange({ ...contact, role: e.target.value })}
              placeholder="e.g., Title Agent, Home Inspector..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm"
            />
            <button
              onClick={() => { setCustomRole(false); onChange({ ...contact, role: "" }); }}
              className="text-[11px] font-bold text-slate-400 mt-2 hover:text-slate-600 transition-colors"
            >
              ← Back to preset roles
            </button>
          </>
        )}
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