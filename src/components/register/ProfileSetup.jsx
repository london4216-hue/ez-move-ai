import { useState } from "react";
import { base44 } from "@/api/base44Client";
import AddressAutocomplete from "@/components/register/AddressAutocomplete";

export default function ProfileSetup({ onComplete }) {
  const [form, setForm] = useState({
    user_type: "seller",
    contract_date: "",
    walkthrough_date: "",
    close_date: "",
    current_address: "",
    destination_address: "",
    agent_name: "",
    agent_phone: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    await onComplete(form);
  };

  const isValid = form.contract_date && form.close_date && form.current_address;

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-[#1A1A2E] rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-bold">EZ</span>
          </div>
          <span className="text-xl font-semibold text-[#1A1A2E] tracking-tight">EZ Move <span className="text-[#C85A17]">AI</span></span>
        </div>
        <h1 className="text-2xl font-bold text-[#1A1A2E] mb-1">Set up your profile</h1>
        <p className="text-sm text-[#6B7280]">Tell us about your transaction</p>
      </div>

      <div className="space-y-4">
        {/* Buyer / Seller */}
        <div>
          <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-2">I am a</p>
          <div className="flex gap-3">
            {["seller", "buyer"].map(type => (
              <button
                key={type}
                onClick={() => setForm(f => ({ ...f, user_type: type }))}
                className={`flex-1 py-3 rounded-xl font-semibold text-sm capitalize transition-all
                  ${form.user_type === type
                    ? "bg-[#1A1A2E] text-white shadow-lg"
                    : "bg-white text-[#6B7280] border border-[#E5E7EB]"}`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Dates */}
        {[
          { key: "contract_date", label: "Contract Date", required: true },
          { key: "walkthrough_date", label: "Walk-through Date", required: false },
          { key: "close_date", label: "Anticipated Close Date", required: true },
        ].map(({ key, label, required }) => (
          <div key={key}>
            <label className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider block mb-1.5">
              {label} {required && <span className="text-[#C85A17]">*</span>}
            </label>
            <input
              type="date"
              value={form[key]}
              onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-white text-[#1A1A2E] text-sm focus:outline-none focus:border-[#C85A17] focus:shadow-[0_0_0_3px_rgba(200,90,23,0.15)]"
            />
          </div>
        ))}

        <AddressAutocomplete
          label="Current Home Address"
          value={form.current_address}
          onChange={val => setForm(f => ({ ...f, current_address: val }))}
          placeholder="Start typing your address..."
          required
        />

        <AddressAutocomplete
          label="New Destination Address"
          value={form.destination_address}
          onChange={val => setForm(f => ({ ...f, destination_address: val }))}
          placeholder="For mileage calculation (optional)"
        />

        <button
           onClick={handleSubmit}
           disabled={!isValid || submitting}
           className="w-full py-4 rounded-2xl bg-[#C85A17] text-white font-semibold text-base
             disabled:opacity-40 active:scale-[0.98] transition-all mt-2 shadow-[0_8px_24px_rgba(200,90,23,0.3)]"
         >
          {submitting ? "Setting up..." : "Continue to Week 1 Setup"}
        </button>
      </div>
    </div>
  );
}