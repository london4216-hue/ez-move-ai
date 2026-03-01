import { useState } from "react";

export default function NamePhoneEntry({ onComplete }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!firstName || !lastName || !phone) {
      setError("Please fill in all fields");
      return;
    }
    if (!/^\d{10}$/.test(phone.replace(/\D/g, ""))) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }
    setError("");
    onComplete({ firstName, lastName, phone });
  };

  const formatPhone = (val) => {
    const digits = val.replace(/\D/g, "");
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-[#1A1A2E] rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-bold">EZ</span>
          </div>
          <span className="text-xl font-semibold text-[#1A1A2E] tracking-tight">EZ Move <span className="text-[#F97316]">AI</span></span>
        </div>
        <h1 className="text-2xl font-bold text-[#1A1A2E] mb-1">Tell us your name</h1>
        <p className="text-sm text-[#6B7280]">We'll text you updates during your move</p>
      </div>

      <div className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            placeholder="First name"
            className="px-4 py-3 rounded-xl border border-[#E5E7EB] bg-white text-[#1A1A2E] text-sm focus:outline-none focus:border-[#F97316]"
          />
          <input
            type="text"
            value={lastName}
            onChange={e => setLastName(e.target.value)}
            placeholder="Last name"
            className="px-4 py-3 rounded-xl border border-[#E5E7EB] bg-white text-[#1A1A2E] text-sm focus:outline-none focus:border-[#F97316]"
          />
        </div>

        <input
          type="tel"
          value={phone}
          onChange={e => setPhone(formatPhone(e.target.value))}
          placeholder="Phone number"
          className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-white text-[#1A1A2E] text-sm focus:outline-none focus:border-[#F97316]"
        />

        <button
          onClick={handleSubmit}
          className="w-full py-4 rounded-2xl bg-[#1A1A2E] text-white font-semibold text-base active:scale-[0.98] transition-all"
        >
          Continue
        </button>
      </div>
    </div>
  );
}