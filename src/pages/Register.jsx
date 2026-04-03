import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";
import { Loader2, LogOut } from "lucide-react";
import Week1Setup from "../components/register/Week1Setup";

// Wrapper that gets real user ID for Week1Setup
function Week1SetupWrapper({ userAddress, onNavigateToDashboard }) {
  const [userId, setUserId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const user = await base44.auth.me();
        if (!user?.id) {
          setError("Not authenticated. Please refresh.");
          return;
        }
        setUserId(user.id);
      } catch (e) {
        setError("Failed to load user. " + e.message);
      }
    };
    load();
  }, []);

  if (error) return <div className="text-red-600 text-center">{error}</div>;
  if (!userId) return <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />;

  return (
    <div className="w-full max-w-sm">
      <Week1Setup
        userId={userId}
        userAddress={userAddress}
        hideButtons={true}
        onComplete={async (answerMap) => {
          localStorage.setItem(`user_selections_${userId}`, JSON.stringify(answerMap || {}));
          localStorage.setItem(`week1_answers_${userId}`, JSON.stringify(answerMap || {}));
          localStorage.setItem(`walkthrough_done_w1_${userId}`, "1");
          localStorage.setItem(`onboarding_done_${userId}`, "true");
          onNavigateToDashboard();
        }}
        onSaveExit={async (partialAnswers) => {
          localStorage.setItem(`week1_setup_${userId}`, JSON.stringify({ step: 0, answers: partialAnswers }));
          base44.auth.logout("/");
        }}
      />
    </div>
  );
}

// Week1Setup now handled by Week1Setup component

export default function Register() {
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [moveDate, setMoveDate] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [locationLoading, setLocationLoading] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.me().then(user => {
      if (user?.registration_date) navigate(createPageUrl("Dashboard"));
    }).catch(() => {});
    
    // Extract invite code from URL
    const urlParams = new URLSearchParams(window.location.search);
    const codeFromUrl = urlParams.get('code');
    if (codeFromUrl) {
      setInviteCode(codeFromUrl);
      // Load client close date from URL code
      base44.entities.Client.filter({ invitation_code: codeFromUrl }).then(clients => {
        if (clients.length > 0 && clients[0].close_date) {
          setMoveDate(clients[0].close_date);
        }
      }).catch(() => {});
    } else {
      // Only restore saved progress if NO invite code in URL
      const savedProgress = localStorage.getItem('register_progress');
      if (savedProgress) {
        try {
          const state = JSON.parse(savedProgress);
          setMoveDate(state.moveDate || "");
          setStreetAddress(state.streetAddress || "");
          setCity(state.city || "");
          setZipCode(state.zipCode || "");
        } catch (e) {}
      }
    }
  }, []);

  const fetchAddressSuggestions = async (query) => {
    if (query.length < 3) { setAddressSuggestions([]); return; }
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5&countrycodes=us`);
      const data = await res.json();
      setAddressSuggestions(data);
      setShowSuggestions(true);
    } catch (e) {}
  };





  const handleVerify = async () => {
    if (!streetAddress.trim() || !city.trim() || !zipCode.trim()) {
      setError("Please fill in your address");
      return;
    }
    setLoading(true);
    setError("");
    const code = inviteCode;
    try {
      const currentUser = await base44.auth.me();
      if (!currentUser) {
        setError("Not authenticated. Please reload.");
        setLoading(false);
        return;
      }
      const fullAddress = `${streetAddress}, ${city}, ${zipCode}`;
      const clients = code ? await base44.entities.Client.filter({ invitation_code: code }) : [];
      // Only block if a code was provided but is invalid
      if (code && code !== "1016" && clients.length === 0) {
        setError("Invalid invite link. Contact your agent.");
        setLoading(false);
        return;
      }
      if (clients.length > 0) {
        const client = clients[0];
        await base44.entities.Client.update(client.id, { status: "registered", user_email: currentUser.email });
      }
      await base44.auth.updateMe({
        home_address: fullAddress,
        estimated_close_date: clients.length > 0 ? clients[0].close_date : moveDate,
        registration_date: new Date().toISOString().split("T")[0],
      });
      localStorage.removeItem('register_progress');
      localStorage.removeItem(`week1_setup_${currentUser.id}`);
      setLoading(false);
      setShowOnboarding(true);
    } catch (e) {
      console.error("Register handleVerify error:", e);
      setError("Something went wrong: " + (e?.message || "Please try again."));
      setLoading(false);
    }
  }

  if (showOnboarding) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <Week1SetupWrapper
          userAddress={`${streetAddress}, ${city}, ${zipCode}`}
          onNavigateToDashboard={() => navigate(createPageUrl("Dashboard"))}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-5">
      <div className="absolute top-5 left-5">
        <h1 className="text-2xl font-black text-slate-800">Version 7</h1>
      </div>
      
      <button
        onClick={() => {
               const currentState = { moveDate, streetAddress, city, zipCode, timestamp: Date.now() };
               localStorage.setItem('register_progress', JSON.stringify(currentState));
          base44.auth.logout();
        }}
        className="absolute top-5 right-5 flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all text-sm font-semibold"
      >
        <LogOut className="w-4 h-4" />
        Save & Exit
      </button>
      
      <div className="absolute top-12 left-1/2 -translate-x-1/2">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-200">
            <span className="text-white text-sm font-black">EZ</span>
          </div>
          <span className="text-slate-800 font-bold text-lg tracking-tight">
            EZ Move <span className="text-orange-500">AI</span>
          </span>
        </div>
      </div>

      <div className="w-full max-w-sm bg-white rounded-3xl p-7 shadow-2xl mt-16">
        <div className="text-center mb-6">
          <h1 className="text-lg font-black text-slate-800 mb-1">Welcome to Move <span className="text-orange-500">EZ AI</span></h1>
          <p className="text-sm text-slate-500">Enter your new home address or the address of the home you're selling</p>

        </div>

        <div className="space-y-3 mb-4">
          <div className="relative">
            <label className="text-xs font-semibold text-slate-600 mb-1.5 block">
              Home Address <span className="text-orange-500">*</span>
            </label>
            <input
              type="text"
              placeholder="123 Main St"
              value={streetAddress}
              autoComplete="off"
              onChange={(e) => { setStreetAddress(e.target.value); fetchAddressSuggestions(e.target.value); }}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              onFocus={() => addressSuggestions.length > 0 && setShowSuggestions(true)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/10 bg-white"
            />
            {showSuggestions && addressSuggestions.length > 0 && (
              <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
                {addressSuggestions.map((s, i) => (
                  <button key={i} type="button"
                    onMouseDown={() => {
                      const addr = s.address || {};
                      const street = [addr.house_number, addr.road].filter(Boolean).join(" ");
                      setStreetAddress(street || s.display_name.split(",")[0]);
                      setCity(addr.city || addr.town || addr.village || addr.county || "");
                      setZipCode(addr.postcode || "");
                      setShowSuggestions(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:bg-orange-50 border-b border-slate-50 last:border-0 truncate">
                    {s.display_name}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1.5 block">City <span className="text-orange-500">*</span></label>
              <input
                type="text"
                placeholder="New York"
                value={city}
                autoComplete="address-level2"
                onChange={(e) => { setCity(e.target.value); }}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/10 bg-white disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1.5 block">ZIP Code <span className="text-orange-500">*</span></label>
              <input
                type="text"
                placeholder="10001"
                value={zipCode}
                autoComplete="postal-code"
                inputMode="numeric"
                maxLength={10}
                onChange={(e) => { setZipCode(e.target.value.replace(/[^0-9-]/g,'')); }}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/10 bg-white disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Est. Close / First Day of Home</label>
            <input
              type="date"
              value={moveDate}
              onChange={(e) => { setMoveDate(e.target.value); }}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/10 bg-white disabled:bg-slate-50 disabled:text-slate-500"
            />
          </div>

        </div>

        {error && (
          <div className="mb-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm text-center">{error}</div>
        )}

        <button
          onClick={handleVerify}
          disabled={loading}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-all shadow-lg shadow-orange-200 flex items-center justify-center gap-2"
        >
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</> : "Continue →"}
        </button>


      </div>
    </div>
  );
}