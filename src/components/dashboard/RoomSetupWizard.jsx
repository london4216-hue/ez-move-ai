import { useState } from "react";
import { X, ChevronRight } from "lucide-react";
import InventoryWalkthrough from "./InventoryWalkthrough";

const ROOM_OPTIONS = [
  { id: "living", label: "Living Room", emoji: "🛋️" },
  { id: "kitchen", label: "Kitchen", emoji: "🍳" },
  { id: "master", label: "Master Bedroom", emoji: "🛏️" },
  { id: "bedroom2", label: "Bedroom 2", emoji: "🛏️" },
  { id: "bedroom3", label: "Bedroom 3", emoji: "🚪" },
  { id: "bathroom", label: "Bathroom(s)", emoji: "🚿" },
  { id: "garage", label: "Garage", emoji: "🚗" },
  { id: "office", label: "Office / Den", emoji: "💼" },
  { id: "outdoor", label: "Outdoor / Patio", emoji: "🌿" },
  { id: "storage", label: "Storage / Basement", emoji: "📦" },
];

export default function RoomSetupWizard({ user, onClose }) {
  const [step, setStep] = useState(1); // 1 = how many rooms, 2 = pick rooms, 3 = full walkthrough
  const [roomCount, setRoomCount] = useState(null);
  const [selectedRooms, setSelectedRooms] = useState([]);

  const toggleRoom = (id) => {
    setSelectedRooms(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  if (step === 3) {
    return <InventoryWalkthrough user={user} onClose={onClose} selectedRooms={selectedRooms} />;
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center">
      <div className="bg-white w-full max-w-md rounded-t-3xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-[#F3F4F6]">
          <div>
            <h2 className="text-base font-bold text-[#1A1A2E]">
              {step === 1 ? "Quick Setup" : "Select Your Rooms"}
            </h2>
            <p className="text-[11px] text-[#6B7280]">
              {step === 1 ? "Let's personalize your inventory walkthrough" : "Tap the rooms in your home"}
            </p>
          </div>
          <button onClick={onClose} className="p-1"><X className="w-5 h-5 text-[#6B7280]" /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-5">
          {step === 1 && (
            <div>
              <p className="text-sm font-semibold text-[#1A1A2E] mb-4">How many rooms does your home have?</p>
              <div className="grid grid-cols-4 gap-3">
                {[1, 2, 3, 4, 5, 6, 7, "8+"].map(n => (
                  <button
                    key={n}
                    onClick={() => { setRoomCount(n); setStep(2); }}
                    className={`py-4 rounded-2xl text-xl font-bold border-2 transition-all
                      ${roomCount === n
                        ? "bg-[#F97316] text-white border-[#F97316]"
                        : "bg-white text-[#1A1A2E] border-[#E5E7EB] hover:border-[#F97316]"}`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <p className="text-sm font-semibold text-[#1A1A2E] mb-1">Which rooms do you have?</p>
              <p className="text-[11px] text-[#6B7280] mb-4">Select all that apply — we'll build your inventory list</p>
              <div className="grid grid-cols-2 gap-2">
                {ROOM_OPTIONS.map(room => {
                  const selected = selectedRooms.includes(room.id);
                  return (
                    <button
                      key={room.id}
                      onClick={() => toggleRoom(room.id)}
                      className={`flex items-center gap-2.5 px-3 py-3 rounded-2xl border-2 text-left transition-all
                        ${selected
                          ? "bg-[#FFF7ED] border-[#F97316] text-[#1A1A2E]"
                          : "bg-[#FAFAFA] border-[#E5E7EB] text-[#6B7280]"}`}
                    >
                      <span className="text-xl">{room.emoji}</span>
                      <span className="text-xs font-semibold leading-tight">{room.label}</span>
                      {selected && (
                        <div className="ml-auto w-4 h-4 rounded-full bg-[#F97316] flex items-center justify-center flex-shrink-0">
                          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {step === 2 && (
          <div className="px-4 pb-6 pt-3 border-t border-[#F3F4F6]">
            <button
              onClick={() => setStep(3)}
              disabled={selectedRooms.length === 0}
              className="w-full py-3 rounded-2xl bg-[#F97316] text-white text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-40"
            >
              Start Inventory Walkthrough <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}