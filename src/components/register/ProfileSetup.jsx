import { useState, useEffect } from "react";
import { format } from "date-fns";
import { base44 } from "@/api/base44Client";
import AddressAutocomplete from "./AddressAutocomplete";

export default function ProfileSetup({ onComplete }) {
  const [homeAddress, setHomeAddress] = useState("");
  const [user_type, setUserType] = useState("seller");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!homeAddress) {
      setError("Please enter your home address");
      return;
    }
    setError("");
    setSubmitting(true);
    const today = new Date();
    try {
      await onComplete({
        home_address: homeAddress,
        user_type,
        estimated_close_date: format(new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
        registration_date: format(today, "yyyy-MM-dd")
      });
    } catch (e) {
      setSubmitting(false);
      setError("Something went wrong. Try again.");
    }
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
          <div className="w-16 h-16 bg-orange-100 rounded-3xl flex items-center justify-center text-3xl mb-6">🏠</div>
          <h1 className="text-4xl font-black text-slate-900 leading-tight mb-3">Your property</h1>
          <p className="text-slate-500 text-base">We'll find local services near you</p>
        </div>

        <div className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-4">
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          )}

          <AddressAutocomplete
            label="Property Address"
            value={homeAddress}
            onChange={setHomeAddress}
            placeholder="Street address, city, state"
            required
          />

          <div>
            <p className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wide">I am a</p>
            <div className="grid grid-cols-2 gap-3">
              {["seller", "buyer"].map(type => (
                <button
                  key={type}
                  onClick={() => setUserType(type)}
                  className={`py-4 rounded-2xl font-bold text-sm capitalize transition-all
                    ${user_type === type
                      ? "bg-slate-900 text-white shadow-lg"
                      : "bg-white text-slate-500 border border-slate-200 hover:border-slate-400"}`}
                >
                  {type === "seller" ? "🏡 Seller" : "🔑 Buyer"}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 flex gap-3 items-start">
            <span className="text-lg mt-0.5">📅</span>
            <div>
              <p className="text-xs font-bold text-orange-700 mb-0.5">Your plan starts today</p>
              <p className="text-xs text-orange-600/80">Week 1 begins now. Tasks adjust to your closing date.</p>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!homeAddress || submitting}
            className="btn-primary"
          >
            {submitting ? "Building your plan..." : "Create My Plan →"}
          </button>
        </div>
      </div>
    </div>
  );
}