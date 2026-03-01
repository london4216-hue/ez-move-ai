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
        const isAuth = await base44.auth.isAuthenticated();
        if (isAuth) {
          const user = await base44.auth.me();
          if (user?.full_name) {
            const [first, ...rest] = user.full_name.split(" ");
            setFirstName(first || "");
            setLastName(rest.join(" ") || "");
          }
          if (user?.home_address) setHomeAddress(user.home_address);
        }
      } catch (e) {
        // Silent fail for unauthenticated users
      }
    };
    loadUser();
  }, []);

  const handleSubmit = async () => {
    if (!homeAddress) {
      setError("Please fill in all required fields");
      return;
    }
    setError("");
    setSubmitting(true);
    const today = new Date();
    const estimatedClose = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    try {
      await onComplete({
        first_name: firstName,
        last_name: lastName,
        home_address: homeAddress,
        user_type,
        estimated_close_date: format(estimatedClose, "yyyy-MM-dd"),
        registration_date: format(today, "yyyy-MM-dd")
      });
    } catch (e) {
      setSubmitting(false);
      setError("Please try again");
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-br from-[#C85A17] to-[#F97316] mb-6 mx-auto">
          <span className="text-white text-lg font-bold">EZ</span>
        </div>
        <h1 className="text-3xl font-bold text-[#1A1A2E] mb-2">Tell us about yourself</h1>
        <p className="text-sm text-[#6B7280]">We'll use this to personalize your moving timeline</p>
      </div>

      <div className="space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-[#6B7280] mb-2 block">First Name</label>
            <input
              type="text"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              placeholder="John"
              className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-white text-[#1A1A2E] text-sm focus:outline-none focus:border-[#C85A17] focus:ring-2 focus:ring-[#C85A17]/10"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-[#6B7280] mb-2 block">Last Name</label>
            <input
              type="text"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              placeholder="Doe"
              className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-white text-[#1A1A2E] text-sm focus:outline-none focus:border-[#C85A17] focus:ring-2 focus:ring-[#C85A17]/10"
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
          <p className="text-xs font-semibold text-[#6B7280] mb-2 block">I am a</p>
          <div className="flex gap-3">
            {["seller", "buyer"].map(type => (
              <button
                key={type}
                onClick={() => setUserType(type)}
                className={`flex-1 py-3 rounded-xl font-bold text-sm capitalize transition-all
                  ${user_type === type
                    ? "bg-gradient-to-r from-[#C85A17] to-[#F97316] text-white shadow-lg"
                    : "bg-white text-[#6B7280] border border-[#E5E7EB] hover:border-[#C85A17]"}`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Timeline Info */}
        <div className="bg-gradient-to-br from-[#FEF3ED] to-[#FFF7ED] border border-[#FDCCB9] rounded-2xl p-4">
          <div className="flex gap-3">
            <div className="text-2xl">📅</div>
            <div>
              <p className="text-xs font-bold text-[#C85A17] mb-0.5">30-Day Moving Timeline</p>
              <p className="text-xs text-[#92400E]">
                We'll break your move into 4 manageable weeks. You can update dates in your dashboard.
              </p>
            </div>
          </div>
        </div>

        <button
           onClick={handleSubmit}
           disabled={!homeAddress || submitting}
           className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#C85A17] to-[#F97316] text-white font-bold text-base
             disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-all shadow-[0_4px_12px_rgba(200,90,23,0.2)]"
         >
           {submitting ? "Creating your plan..." : "Create Plan"}
         </button>
      </div>
    </div>
  );
}