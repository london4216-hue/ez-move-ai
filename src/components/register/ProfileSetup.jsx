import { useState, useEffect } from "react";
import { format } from "date-fns";
import { base44 } from "@/api/base44Client";
import AddressAutocomplete from "./AddressAutocomplete";

export default function ProfileSetup({ onComplete }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [homeAddress, setHomeAddress] = useState("");
  const [user_type, setUserType] = useState("seller");
  const [close_date, setCloseDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await base44.auth.me();
        if (user?.full_name) {
          const [first, ...rest] = user.full_name.split(" ");
          setFirstName(first || "");
          setLastName(rest.join(" ") || "");
        }
        if (user?.home_address) setHomeAddress(user.home_address);
      } catch (e) {
        console.error("Failed to load user:", e);
      }
    };
    loadUser();
  }, []);

  const handleSubmit = async () => {
    if (!close_date || !homeAddress) {
      setError("Please fill in all required fields");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const today = new Date();
      await onComplete({
        first_name: firstName,
        last_name: lastName,
        home_address: homeAddress,
        user_type,
        close_date,
        registration_date: format(today, "yyyy-MM-dd")
      });
    } catch (e) {
      setError("Failed to save profile. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-[#1A1A2E] rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-bold">EZ</span>
          </div>
          <span className="text-xl font-semibold text-[#1A1A2E] tracking-tight">EZ Move <span className="text-[#C85A17]">AI</span></span>
        </div>
        <h1 className="text-2xl font-bold text-[#1A1A2E] mb-1">Your profile</h1>
        <p className="text-sm text-[#6B7280]">Verify your info and add closing details</p>
      </div>

      <div className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider block mb-1.5">First Name</label>
            <input
              type="text"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              placeholder="First name"
              className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-white text-[#1A1A2E] text-sm focus:outline-none focus:border-[#C85A17]"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider block mb-1.5">Last Name</label>
            <input
              type="text"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              placeholder="Last name"
              className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-white text-[#1A1A2E] text-sm focus:outline-none focus:border-[#C85A17]"
            />
          </div>
        </div>

        {/* Home Address */}
        <AddressAutocomplete
          label="Home Address"
          value={homeAddress}
          onChange={setHomeAddress}
          placeholder="Street address, city, state, zip"
          required
        />
        <p className="text-[11px] text-[#9CA3AF] -mt-3">Used to find local services near you</p>

        {/* Buyer / Seller */}
        <div>
          <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-2">I am a</p>
          <div className="flex gap-3">
            {["seller", "buyer"].map(type => (
              <button
                key={type}
                onClick={() => setUserType(type)}
                className={`flex-1 py-3 rounded-xl font-semibold text-sm capitalize transition-all
                  ${user_type === type
                    ? "bg-[#1A1A2E] text-white shadow-lg"
                    : "bg-white text-[#6B7280] border border-[#E5E7EB]"}`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Close Date */}
        <div>
          <label className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider block mb-1.5">
            Closing Date <span className="text-[#C85A17]">*</span>
          </label>
          <input
            type="date"
            value={close_date}
            onChange={e => setCloseDate(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-white text-[#1A1A2E] text-sm focus:outline-none focus:border-[#C85A17]"
          />
          <p className="text-[11px] text-[#9CA3AF] mt-2">Today: {format(new Date(), "MMM d, yyyy")}</p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!close_date || !homeAddress || submitting}
          className="w-full py-4 rounded-2xl bg-[#C85A17] text-white font-semibold text-base
            disabled:opacity-40 active:scale-[0.98] transition-all mt-4 shadow-[0_8px_24px_rgba(200,90,23,0.3)]"
        >
          {submitting ? "Setting up..." : "Let's Go"}
        </button>
      </div>
    </div>
  );
}