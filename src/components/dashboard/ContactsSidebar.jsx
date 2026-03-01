import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Phone, ChevronLeft, ChevronRight, Edit2, Plus, X } from "lucide-react";

const COLORS = ["#F97316", "#7C3AED", "#059669", "#3B82F6", "#EC4899", "#8B5CF6", "#14B8A6", "#F59E0B", "#EF4444"];

export default function ContactsRow({ user, refreshKey }) {
  const [savedProviders, setSavedProviders] = useState([]);
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: "", role: "", phone: "" });

  useEffect(() => {
    if (!user) return;
    base44.entities.SavedProvider.filter({ user_id: user.id }).then(setSavedProviders).catch(() => {});
  }, [user, refreshKey]);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll);
    window.addEventListener("resize", checkScroll);
    return () => { el.removeEventListener("scroll", checkScroll); window.removeEventListener("resize", checkScroll); };
  }, [savedProviders]);

  const scroll = (dir) => {
    scrollRef.current?.scrollBy({ left: dir * 140, behavior: "smooth" });
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ name: "", role: "", phone: "" });
    setShowModal(true);
  };

  const openEditModal = (provider) => {
    setEditingId(provider.id);
    setFormData({ name: provider.name, role: provider.role, phone: provider.phone });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) return;
    if (editingId) {
      await base44.entities.SavedProvider.update(editingId, formData);
    } else {
      await base44.entities.SavedProvider.create({ ...formData, user_id: user.id });
    }
    base44.entities.SavedProvider.filter({ user_id: user.id }).then(setSavedProviders).catch(() => {});
    setShowModal(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Remove this contact?")) {
      await base44.entities.SavedProvider.delete(id);
      setSavedProviders(p => p.filter(x => x.id !== id));
    }
  };

  // Build realtor contact from user profile
  const realtorContact = user?.agent_name ? {
    name: user.agent_name,
    role: user.user_type === "buyer" ? "Buyer's Agent" : "Listing Agent",
    phone: user.agent_phone || "",
    color: COLORS[0],
    primary: true
  } : null;

  const providerContacts = savedProviders.map((p, i) => ({
    name: p.name,
    role: p.role,
    phone: p.phone || "",
    color: COLORS[(i + 1) % COLORS.length],
    saved: true
  }));

  const all = [
    ...(realtorContact ? [realtorContact] : []),
    ...providerContacts
  ];

  if (all.length === 0) return null;

  return (
    <div className="mx-3 mb-4 bg-white rounded-2xl px-3 py-2.5 shadow-sm">
      <p className="text-[9px] font-bold text-[#9CA3AF] uppercase tracking-wider mb-2">My Contacts</p>
      <div className="relative flex items-center">
        {canScrollLeft && (
          <button
            onClick={() => scroll(-1)}
            className="absolute left-0 z-10 w-6 h-6 bg-white shadow rounded-full flex items-center justify-center flex-shrink-0"
          >
            <ChevronLeft className="w-3.5 h-3.5 text-[#6B7280]" />
          </button>
        )}
        <div
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto no-scrollbar pb-0.5 w-full"
          style={{ paddingLeft: canScrollLeft ? 24 : 0, paddingRight: canScrollRight ? 24 : 0 }}
        >
          {all.map((c, i) => (
            <div key={i} className={`flex-shrink-0 flex items-center gap-2 rounded-xl px-2.5 py-1.5 relative group ${c.primary ? "bg-[#FFF7ED] border border-[#FED7AA]" : "bg-[#F5F3EF]"}`}>
              {!c.primary && (
                <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <button
                    onClick={() => openEditModal(savedProviders[i - (realtorContact ? 1 : 0)])}
                    className="w-5 h-5 bg-[#F97316] text-white rounded-full flex items-center justify-center"
                  >
                    <Edit2 className="w-2.5 h-2.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(savedProviders[i - (realtorContact ? 1 : 0)].id)}
                    className="w-5 h-5 bg-[#EF4444] text-white rounded-full flex items-center justify-center"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              )}
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                style={{ backgroundColor: c.color }}
              >
                {c.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#1A1A2E] leading-tight">{c.name}</p>
                <p className={`text-[9px] font-bold uppercase tracking-wide leading-tight ${c.primary ? "text-[#F97316]" : "text-[#6B7280]"}`}>{c.role}</p>
                {c.phone && (
                  <a href={`tel:${c.phone.replace(/\D/g, "")}`} className="flex items-center gap-0.5 text-[9px] text-[#6B7280] hover:text-[#F97316] mt-0.5">
                    <Phone className="w-2.5 h-2.5" />{c.phone}
                  </a>
                )}
              </div>
            </div>
          ))}
          <button
            onClick={openAddModal}
            className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-[#F5F3EF] hover:bg-[#F97316] text-[#6B7280] hover:text-white transition-all"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        {canScrollRight && (
          <button
            onClick={() => scroll(1)}
            className="absolute right-0 z-10 w-6 h-6 bg-white shadow rounded-full flex items-center justify-center flex-shrink-0"
          >
            <ChevronRight className="w-3.5 h-3.5 text-[#6B7280]" />
          </button>
        )}
      </div>
    </div>
  );
}