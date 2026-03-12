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
    <div className="w-full max-w-sm mx-auto px-6 py-10 flex flex-col min-h-screen justify-center">
      {/* Logo */}
      <div className="flex items-center gap-2.5 mb-14">
        <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center">
          <span className="text-white text-sm font-black tracking-tight">EZ</span>
        </div>
        <span className="text-xl font-bold text-slate-900">EZ Move <span className="text-orange-500">AI</span></span>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        <div className="mb-10">
          <h1 className="text-4xl font-black text-slate-900 leading-tight mb-3">What's your name?</h1>
          <p className="text-slate-500 text-base">We'll personalize your moving plan</p>
        </div>

        <div className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-4">
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              placeholder="First name"
              className="input-field"
              required
            />
            <input
              type="text"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              placeholder="Last name"
              className="input-field"
              required
            />
          </div>

          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">📱</span>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(formatPhone(e.target.value))}
              placeholder="Phone number"
              className="input-field pl-10"
              required
            />
          </div>

          <button onClick={handleSubmit} className="btn-primary">
            Continue →
          </button>
        </div>
      </div>
    </div>
  );
}